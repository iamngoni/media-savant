FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80
CMD ["node", ".output/server/index.mjs"]
