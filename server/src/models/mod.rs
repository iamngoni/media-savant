//
//  media-savant-api
//  models/mod.rs
//

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message.into()),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub server_url: String,
    pub username: String,
    pub password: String,
    pub device_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SetupRequest {
    pub server_url: String,
}

#[derive(Debug, Serialize)]
pub struct SessionInfo {
    pub session_id: Uuid,
    pub user_id: String,
    pub username: String,
    pub server_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionData {
    pub session_id: Uuid,
    pub user_id: String,
    pub username: String,
    pub access_token: String,
    pub server_url: String,
    pub device_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JellyfinAuthRequest {
    pub Username: String,
    pub Pw: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JellyfinUser {
    pub Id: String,
    pub Name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JellyfinAuthResponse {
    pub User: JellyfinUser,
    pub AccessToken: String,
}
