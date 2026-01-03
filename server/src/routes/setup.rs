//
//  media-savant-api
//  routes/setup.rs
//

use actix_web::{post, web, HttpResponse, Responder};
use serde_json::Value;
use uuid::Uuid;

use crate::models::{ApiResponse, SetupRequest};
use crate::state::AppState;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/setup").service(validate_server));
}

fn build_client_header(state: &AppState) -> String {
    format!(
        "MediaBrowser Client=\"{}\", Device=\"{}\", DeviceId=\"{}\", Version=\"{}\"",
        state.config.app.client_name,
        state.config.app.device_name,
        Uuid::new_v4(),
        state.config.app.client_version
    )
}

#[post("/validate")]
async fn validate_server(
    state: web::Data<AppState>,
    payload: web::Json<SetupRequest>,
) -> impl Responder {
    let server_url = payload.server_url.trim_end_matches('/');
    let url = format!("{server_url}/System/Info/Public");

    let response = state
        .http
        .get(url)
        .header("X-Emby-Authorization", build_client_header(&state))
        .send()
        .await;
    let response = match response {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Failed to reach Jellyfin server: {err}"
            )))
        }
    };

    if !response.status().is_success() {
        return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
            "Jellyfin server rejected request: {}",
            response.status()
        )));
    }

    let info = match response.json::<Value>().await {
        Ok(data) => data,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Invalid Jellyfin system info response: {err}"
            )))
        }
    };

    HttpResponse::Ok().json(ApiResponse::ok(info))
}
