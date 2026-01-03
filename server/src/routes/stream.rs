//
//  media-savant-api
//  routes/stream.rs
//

use actix_web::{get, http::StatusCode, web, HttpRequest, HttpResponse, Responder};
use futures_util::StreamExt;

use crate::models::ApiResponse;
use crate::routes::auth::{build_token_header, load_session, session_id_from_request};
use crate::state::AppState;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/stream").service(stream_video));
}

#[get("/{id}")]
async fn stream_video(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
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

    let item_id = path.into_inner();
    let server_url = session.server_url.trim_end_matches('/');
    // Use direct stream with mediaSourceId for proper playback
    let url = format!(
        "{server_url}/Videos/{item_id}/stream.mp4?static=true&mediaSourceId={item_id}"
    );

    let mut request = state
        .http
        .get(url)
        .header("X-Emby-Authorization", build_token_header(&state, &session));

    if let Some(range) = req.headers().get("range").and_then(|val| val.to_str().ok()) {
        request = request.header("range", range);
    }

    let response = match request.send().await {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Streaming request failed: {err}"
            )))
        }
    };

    let status = StatusCode::from_u16(response.status().as_u16())
        .unwrap_or(StatusCode::BAD_GATEWAY);
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|val| val.to_str().ok())
        .map(|val| val.to_string());
    let content_length = response
        .headers()
        .get("content-length")
        .and_then(|val| val.to_str().ok())
        .map(|val| val.to_string());
    let content_range = response
        .headers()
        .get("content-range")
        .and_then(|val| val.to_str().ok())
        .map(|val| val.to_string());
    let accept_ranges = response
        .headers()
        .get("accept-ranges")
        .and_then(|val| val.to_str().ok())
        .map(|val| val.to_string());

    let stream = response.bytes_stream().map(|chunk| {
        chunk.map_err(|err| actix_web::error::ErrorBadGateway(err))
    });

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

    builder.streaming(stream)
}
