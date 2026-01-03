//
//  media-savant-api
//  routes/proxy.rs
//

use actix_web::{web, HttpRequest, HttpResponse, Responder};
use bytes::Bytes;
use futures_util::TryFutureExt;

use crate::models::ApiResponse;
use crate::routes::auth::{build_token_header, load_session, session_id_from_request};
use crate::state::AppState;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/jellyfin")
            .route("/{tail:.*}", web::to(proxy_request))
            .route("", web::to(proxy_request)),
    );
}

async fn proxy_request(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: Bytes,
) -> impl Responder {
    let Some(session_id) = session_id_from_request(&state, &req) else {
        return HttpResponse::Unauthorized().json(ApiResponse::<()>::err("Missing session"));
    };

    let session = match load_session(&state, session_id).await {
        Ok(Some(session)) => session,
        Ok(None) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::err("Session not found"))
        }
        Err(err) => {
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::err(format!(
                "Failed to load session: {err}"
            )))
        }
    };

    let tail = req.match_info().query("tail");
    let query = req.query_string();
    let mut target = format!("{}/{}", session.server_url.trim_end_matches('/'), tail);
    if !query.is_empty() {
        target.push('?');
        target.push_str(query);
    }

    let method = req.method().clone();
    let auth_header = build_token_header(&state, &session);

    let mut request = state.http.request(method, target).header(
        "X-Emby-Authorization",
        auth_header,
    );

    if let Some(content_type) = req.headers().get("content-type") {
        request = request.header("content-type", content_type.clone());
    }

    let response = request.body(body).send().map_err(|err| err.to_string()).await;
    let response = match response {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Proxy request failed: {err}"
            )))
        }
    };

    let status = response.status();
    let content_type = response
        .headers()
        .get("content-type")
        .cloned();
    let bytes = match response.bytes().await {
        Ok(data) => data,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Failed to read Jellyfin response: {err}"
            )))
        }
    };

    let mut builder = HttpResponse::build(status);
    if let Some(content_type) = content_type {
        builder.insert_header(("content-type", content_type));
    }

    builder.body(bytes)
}
