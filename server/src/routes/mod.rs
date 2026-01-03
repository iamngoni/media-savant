//
//  media-savant-api
//  routes/mod.rs
//

use actix_web::web::{scope, ServiceConfig};

mod auth;
mod health;
mod proxy;
mod setup;

pub fn init(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/api")
            .configure(health::init)
            .configure(auth::init)
            .configure(proxy::init)
            .configure(setup::init),
    );
}
