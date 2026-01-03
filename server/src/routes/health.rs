//
//  media-savant-api
//  routes/health.rs
//

use actix_web::{get, web, HttpResponse, Responder};

use crate::models::ApiResponse;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(health_check);
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(ApiResponse::ok("ok"))
}
