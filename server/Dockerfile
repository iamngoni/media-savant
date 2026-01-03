FROM rust:1.78-slim AS builder
WORKDIR /app

COPY Cargo.toml ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/media-savant-api /usr/local/bin/media-savant-api
EXPOSE 4001
CMD ["/usr/local/bin/media-savant-api"]
