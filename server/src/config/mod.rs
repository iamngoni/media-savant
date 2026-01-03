//
//  media-savant-api
//  config/mod.rs
//

use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct Config {
    pub app: AppConfig,
    pub redis: RedisConfig,
    pub auth: AuthConfig,
    pub rate_limit: RateLimitConfig,
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub port: u16,
    pub client_name: String,
    pub device_name: String,
    pub client_version: String,
}

#[derive(Debug, Clone)]
pub struct RedisConfig {
    pub url: String,
}

#[derive(Debug, Clone)]
pub struct AuthConfig {
    pub cookie_name: String,
    pub cookie_secure: bool,
}

#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub per_second: u64,
    pub burst: u32,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            app: AppConfig::from_env()?,
            redis: RedisConfig::from_env()?,
            auth: AuthConfig::from_env()?,
            rate_limit: RateLimitConfig::from_env()?,
        })
    }
}

impl AppConfig {
    fn from_env() -> Result<Self> {
        let port = get_env("APP_PORT")?.parse::<u16>().context("APP_PORT must be a valid port")?;
        let client_name = get_env_default("JELLYFIN_CLIENT_NAME", "mdia-savant")?;
        let device_name = get_env_default("JELLYFIN_DEVICE_NAME", "mdia-savant")?;
        let client_version = get_env_default("JELLYFIN_CLIENT_VERSION", "0.1.0")?;

        Ok(Self {
            port,
            client_name,
            device_name,
            client_version,
        })
    }
}

impl RedisConfig {
    fn from_env() -> Result<Self> {
        let url = get_env_default("REDIS_URL", "redis://redis:6379")?;
        Ok(Self { url })
    }
}

impl AuthConfig {
    fn from_env() -> Result<Self> {
        let cookie_name = get_env_default("SESSION_COOKIE_NAME", "ms_session")?;
        let cookie_secure = get_env_default("SESSION_COOKIE_SECURE", "false")?
            .parse::<bool>()
            .context("SESSION_COOKIE_SECURE must be true/false")?;

        Ok(Self {
            cookie_name,
            cookie_secure,
        })
    }
}

impl RateLimitConfig {
    fn from_env() -> Result<Self> {
        let per_second = get_env_default("RATE_LIMIT_PER_SECOND", "100")?
            .parse::<u64>()
            .context("RATE_LIMIT_PER_SECOND must be an integer")?;
        let burst = get_env_default("RATE_LIMIT_BURST", "200")?
            .parse::<u32>()
            .context("RATE_LIMIT_BURST must be an integer")?;

        Ok(Self { per_second, burst })
    }
}

fn get_env(key: &str) -> Result<String> {
    std::env::var(key).with_context(|| format!("{key} must be set"))
}

fn get_env_default(key: &str, default: &str) -> Result<String> {
    Ok(std::env::var(key).unwrap_or_else(|_| default.to_string()))
}
