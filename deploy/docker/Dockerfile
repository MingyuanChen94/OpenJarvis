# Stage 1: Build the web UI (app/) into static assets
FROM node:22-slim AS webui

WORKDIR /web
COPY app/package.json app/package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install
COPY app/ .
RUN npm run build

# Stage 2: Build Python package
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app
COPY pyproject.toml README.md ./
COPY src/ src/
COPY scripts/install scripts/install
COPY deploy/windows deploy/windows

# Copy the built web UI into the server static directory
COPY --from=webui /web/dist src/openjarvis/server/static/

RUN pip install --no-cache-dir uv && \
    uv pip install --system ".[server]"

# Stage 3: Runtime
FROM python:3.12-slim-bookworm

COPY --from=builder /usr/local /usr/local
COPY --from=builder /app /app
WORKDIR /app

EXPOSE 8000

ENTRYPOINT ["jarvis"]
CMD ["serve", "--host", "0.0.0.0", "--port", "8000"]
