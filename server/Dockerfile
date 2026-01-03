FROM rust:1.85-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

COPY src ./src
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/media-savant-api /usr/local/bin/media-savant-api
EXPOSE 4001
CMD ["/usr/local/bin/media-savant-api"]
