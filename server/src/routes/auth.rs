//
//  media-savant-api
//  routes/auth.rs
//

use actix_web::cookie::{Cookie, SameSite};
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use serde_json::json;
use uuid::Uuid;

use crate::models::{
    ApiResponse, JellyfinAuthRequest, JellyfinAuthResponse, LoginRequest, SessionData, SessionInfo,
};
use crate::state::AppState;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .service(login)
            .service(logout)
            .service(me),
    );
}

#[post("/login")]
async fn login(
    state: web::Data<AppState>,
    payload: web::Json<LoginRequest>,
) -> impl Responder {
    let server_url = payload.server_url.trim_end_matches('/').to_string();
    let device_id = payload
        .device_id
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let auth_header = build_emby_auth_header(
        &state.config.app.client_name,
        &state.config.app.device_name,
        &device_id,
        &state.config.app.client_version,
        None,
    );

    let jf_payload = JellyfinAuthRequest {
        Username: payload.username.clone(),
        Pw: payload.password.clone(),
    };

    let url = format!("{server_url}/Users/AuthenticateByName");
    let response = state
        .http
        .post(url)
        .header("X-Emby-Authorization", auth_header)
        .json(&jf_payload)
        .send()
        .await;

    let response = match response {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Jellyfin auth failed: {err}"
            )))
        }
    };

    if !response.status().is_success() {
        return HttpResponse::Unauthorized().json(ApiResponse::<()>::err(format!(
            "Jellyfin auth rejected: {}",
            response.status()
        )));
    }

    let auth_response = match response.json::<JellyfinAuthResponse>().await {
        Ok(data) => data,
        Err(err) => {
            return HttpResponse::BadGateway().json(ApiResponse::<()>::err(format!(
                "Invalid Jellyfin auth response: {err}"
            )))
        }
    };

    let session_id = Uuid::new_v4();
    let session = SessionData {
        session_id,
        user_id: auth_response.User.Id.clone(),
        username: auth_response.User.Name.clone(),
        access_token: auth_response.AccessToken.clone(),
        server_url: server_url.clone(),
        device_id: device_id.clone(),
    };

    if let Err(err) = save_session(&state, &session).await {
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::err(format!(
            "Failed to save session: {err}"
        )));
    }

    let cookie = Cookie::build(state.config.auth.cookie_name.clone(), session_id.to_string())
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .secure(state.config.auth.cookie_secure)
        .finish();

    let info = SessionInfo {
        session_id,
        user_id: session.user_id,
        username: session.username,
        server_url: session.server_url,
    };

    HttpResponse::Ok()
        .cookie(cookie)
        .json(ApiResponse::ok(info))
}

#[post("/logout")]
async fn logout(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    if let Some(session_id) = session_id_from_request(&state, &req) {
        let _ = delete_session(&state, session_id).await;
    }

    let cookie = Cookie::build(state.config.auth.cookie_name.clone(), "")
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .secure(state.config.auth.cookie_secure)
        .max_age(actix_web::cookie::time::Duration::seconds(0))
        .finish();

    HttpResponse::Ok()
        .cookie(cookie)
        .json(ApiResponse::ok(json!({ "logged_out": true })))
}

#[get("/me")]
async fn me(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let Some(session_id) = session_id_from_request(&state, &req) else {
        return HttpResponse::Unauthorized().json(ApiResponse::<()>::err("Missing session"));
    };

    match load_session(&state, session_id).await {
        Ok(Some(session)) => {
            let info = SessionInfo {
                session_id: session.session_id,
                user_id: session.user_id,
                username: session.username,
                server_url: session.server_url,
            };
            HttpResponse::Ok().json(ApiResponse::ok(info))
        }
        Ok(None) => HttpResponse::Unauthorized().json(ApiResponse::<()>::err("Session not found")),
        Err(err) => HttpResponse::InternalServerError().json(ApiResponse::<()>::err(format!(
            "Failed to load session: {err}"
        ))),
    }
}

pub fn session_id_from_request(state: &AppState, req: &HttpRequest) -> Option<Uuid> {
    req.cookie(&state.config.auth.cookie_name)
        .and_then(|cookie| Uuid::parse_str(cookie.value()).ok())
}

pub async fn load_session(
    state: &AppState,
    session_id: Uuid,
) -> Result<Option<SessionData>, Box<dyn std::error::Error>> {
    let mut conn = state.redis.lock().await;
    let key = format!("session:{session_id}");
    let data: Option<String> = redis::cmd("GET").arg(&key).query_async(&mut *conn).await?;

    if let Some(value) = data {
        let session = serde_json::from_str::<SessionData>(&value)?;
        Ok(Some(session))
    } else {
        Ok(None)
    }
}

async fn save_session(
    state: &AppState,
    session: &SessionData,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = state.redis.lock().await;
    let key = format!("session:{}", session.session_id);
    let value = serde_json::to_string(session)?;

    redis::cmd("SET").arg(&key).arg(value).query_async(&mut *conn).await?;
    Ok(())
}

async fn delete_session(
    state: &AppState,
    session_id: Uuid,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = state.redis.lock().await;
    let key = format!("session:{session_id}");
    redis::cmd("DEL").arg(&key).query_async(&mut *conn).await?;
    Ok(())
}

fn build_emby_auth_header(
    client: &str,
    device: &str,
    device_id: &str,
    version: &str,
    token: Option<&str>,
) -> String {
    if let Some(token) = token {
        format!(
            "MediaBrowser Client=\"{}\", Device=\"{}\", DeviceId=\"{}\", Version=\"{}\", Token=\"{}\"",
            client, device, device_id, version, token
        )
    } else {
        format!(
            "MediaBrowser Client=\"{}\", Device=\"{}\", DeviceId=\"{}\", Version=\"{}\"",
            client, device, device_id, version
        )
    }
}

pub fn build_token_header(state: &AppState, session: &SessionData) -> String {
    build_emby_auth_header(
        &state.config.app.client_name,
        &state.config.app.device_name,
        &session.device_id,
        &state.config.app.client_version,
        Some(&session.access_token),
    )
}
