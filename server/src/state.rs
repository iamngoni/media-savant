//
//  media-savant-api
//  state.rs
//

use crate::config::Config;
use redis::aio::MultiplexedConnection;
use std::sync::Arc;
use tokio::sync::Mutex as TokioMutex;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub redis: Arc<TokioMutex<MultiplexedConnection>>,
    pub http: reqwest::Client,
}

impl AppState {
    pub async fn new(config: Config) -> Result<Self, Box<dyn std::error::Error>> {
        let redis_url = config.redis.url.clone();
        let redis_client = redis::Client::open(redis_url)?;
        let redis_conn = redis_client.get_multiplexed_async_connection().await?;

        let http = reqwest::Client::builder().build()?;

        Ok(Self {
            config: Arc::new(config),
            redis: Arc::new(TokioMutex::new(redis_conn)),
            http,
        })
    }
}
