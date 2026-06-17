#!/bin/sh
# Runs via the nginx base image's /docker-entrypoint.d/ hook mechanism (before
# nginx starts). Generates the /v1,/api,/health location block based on whether
# a backend was provided through the OJ_BACKEND environment variable.
set -e

mkdir -p /etc/nginx/oj

if [ -n "${OJ_BACKEND:-}" ]; then
    echo "[openjarvis] API proxy -> ${OJ_BACKEND}"
    cat > /etc/nginx/oj/api.conf <<EOF
location ~ ^/(v1|api|health) {
    proxy_pass ${OJ_BACKEND};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Connection "";
    # Streaming (SSE) must not be buffered or it will not flush token-by-token.
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    chunked_transfer_encoding on;
}
EOF
else
    echo "[openjarvis] no OJ_BACKEND set -> demo mode (API routes return 502)"
    cat > /etc/nginx/oj/api.conf <<'EOF'
location ~ ^/(v1|api|health) {
    return 502;
}
EOF
fi
