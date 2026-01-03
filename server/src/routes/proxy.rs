//
//  media-savant-api
//  routes/proxy.rs
//

use actix_web::{http::StatusCode, web, HttpRequest, HttpResponse, Responder};
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

    let method = match reqwest::Method::from_bytes(req.method().as_str().as_bytes()) {
        Ok(method) => method,
        Err(_) => {
            return HttpResponse::MethodNotAllowed()
                .json(ApiResponse::<()>::err("Unsupported HTTP method"))
        }
    };
    let auth_header = build_token_header(&state, &session);

    let mut request = state
        .http
        .request(method, target)
        .header("X-Emby-Authorization", auth_header);

    if let Some(content_type) = req.headers().get("content-type").and_then(|val| val.to_str().ok())
    {
        request = request.header("content-type", content_type);
    }
    if let Some(range) = req.headers().get("range").and_then(|val| val.to_str().ok()) {
        request = request.header("range", range);
    }
    if let Some(accept) = req.headers().get("accept").and_then(|val| val.to_str().ok()) {
        request = request.header("accept", accept);
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

    let status = StatusCode::from_u16(response.status().as_u16())
        .unwrap_or(StatusCode::BAD_GATEWAY);
    let content_type = response.headers().get("content-type").and_then(|val| val.to_str().ok());
    let content_length = response
        .headers()
        .get("content-length")
        .and_then(|val| val.to_str().ok());
    let content_range = response
        .headers()
        .get("content-range")
        .and_then(|val| val.to_str().ok());
    let accept_ranges = response
        .headers()
        .get("accept-ranges")
        .and_then(|val| val.to_str().ok());
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
    if let Some(content_length) = content_length {
        builder.insert_header(("content-length", content_length));
    }
    if let Some(content_range) = content_range {
        builder.insert_header(("content-range", content_range));
    }
    if let Some(accept_ranges) = accept_ranges {
        builder.insert_header(("accept-ranges", accept_ranges));
    }

    builder.body(bytes)
}
