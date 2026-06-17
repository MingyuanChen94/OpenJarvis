# OpenJarvis app — multi-stage build producing a small nginx image that serves
# the static PWA. The resulting OCI image runs under Apple `container`, Docker,
# Podman, or any OCI runtime. Build for Apple Silicon with --arch arm64.

# ---- build stage ----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site. Optionally bake an absolute backend URL; leave empty
# to use same-origin requests (recommended — the nginx layer proxies them).
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- runtime stage --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Static assets.
COPY --from=build /app/dist /usr/share/nginx/html

# Server config + the entrypoint hook that wires up the API proxy.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/30-openjarvis.sh
RUN chmod +x /docker-entrypoint.d/30-openjarvis.sh \
    # Safe default so nginx starts even if the hook is skipped (demo mode).
    && mkdir -p /etc/nginx/oj \
    && printf 'location ~ ^/(v1|api|health) { return 502; }\n' > /etc/nginx/oj/api.conf

EXPOSE 80
# Inherits the nginx base image's ENTRYPOINT (runs /docker-entrypoint.d/*) and
# CMD (`nginx -g 'daemon off;'`).
