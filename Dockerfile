FROM node:23-alpine AS builder

WORKDIR /app

# Install Git
RUN apk add --no-cache git
# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY ./scripts .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run generate:proto
RUN pnpm build

FROM caddy:alpine

COPY --from=builder /app/dist /srv

RUN echo ':80' > /etc/caddy/Caddyfile && \
    echo 'root * /srv' >> /etc/caddy/Caddyfile && \
    echo 'try_files {path} /index.html' >> /etc/caddy/Caddyfile && \
    echo 'file_server' >> /etc/caddy/Caddyfile

EXPOSE 80