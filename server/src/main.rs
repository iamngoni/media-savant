//
//  media-savant-api
//  main.rs
//

use actix_cors::Cors;
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::middleware::Logger;
use actix_web::{web, App, HttpServer};
use dotenvy::dotenv;
use log::info;

mod config;
mod models;
mod routes;
mod state;

use crate::config::Config;
use crate::state::AppState;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    info!("Booting media-savant-api...");

    let config = match Config::from_env() {
        Ok(cfg) => cfg,
        Err(err) => {
            eprintln!("Failed to load configuration: {err}");
            std::process::exit(1);
        }
    };

    let app_state = match AppState::new(config.clone()).await {
        Ok(state) => web::Data::new(state),
        Err(err) => {
            eprintln!("Failed to initialize app state: {err}");
            std::process::exit(1);
        }
    };

    let addr = format!("0.0.0.0:{}", config.app.port);
    info!("Listening on {addr}");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials();

        let governor = GovernorConfigBuilder::default()
            .per_second(config.rate_limit.per_second)
            .burst_size(config.rate_limit.burst)
            .finish()
            .unwrap();

        App::new()
            .app_data(app_state.clone())
            .wrap(cors)
            .wrap(Governor::new(&governor))
            .wrap(Logger::default())
            .configure(routes::init)
    })
    .bind(addr.as_str())?
    .workers(2)
    .run()
    .await
}
