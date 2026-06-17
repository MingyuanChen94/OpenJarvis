# Run the OpenJarvis App with Apple `container` (macOS, Apple Silicon)

[`container`](https://github.com/apple/container) is Apple's open-source tool for
building and running **Linux containers natively on macOS** (Apple Silicon), using
lightweight per-container VMs. This guide builds the OpenJarvis app into an OCI image
and launches it with `container`.

The same image also runs under **Docker** or **Podman** (see [the bottom](#also-works-with-docker--podman)).

By default the container serves the app in **demo mode** (no backend needed). Connecting
a real `jarvis serve` backend is covered in [§6](#6-connect-a-real-backend).

---

## Requirements

- **Apple Silicon Mac** (M1 or newer).
- **macOS 26** recommended. macOS 15 works but has reduced container networking
  (port publishing to `localhost` may be limited — see [Networking](#networking-notes)).
- Apple's `container` CLI (installed below).

---

## 1. Install Apple `container`

**Option A — Homebrew (simplest):**

```bash
brew install --cask container
```

**Option B — signed installer:** download the latest `container-<version>-installer-signed.pkg`
from the [releases page](https://github.com/apple/container/releases) and open it.

Verify:

```bash
container --version
```

## 2. Start the container service

```bash
container system start
```

On first run it may offer to download a recommended Linux kernel — accept it. This
starts the background service that hosts containers.

## 3. Get the app and build the image

From the OpenJarvis repository, change into the `app/` directory (it contains the
`Dockerfile`):

```bash
cd OpenJarvis/app
container build --tag openjarvis-app .
```

This runs the multi-stage build (Node builds the static site → nginx serves it) and
produces an `arm64` image. First build downloads base images and npm packages; later
builds are cached. Confirm it exists:

```bash
container images list
```

## 4. Run it (demo mode)

```bash
container run --detach --name openjarvis-app --publish 8080:80 openjarvis-app
```

Open **http://localhost:8080**.

You'll see the app in **demo mode** (a banner says so) — every screen works and the
chat streams simulated replies, with no backend required.

> If `localhost:8080` doesn't load on **macOS 15**, port publishing may be limited.
> Use the container's own IP instead — see [Networking](#networking-notes).

## 5. Manage the container

```bash
container ls                      # running containers (and their IPs)
container logs openjarvis-app     # view logs
container exec -ti openjarvis-app sh   # shell inside
container stop openjarvis-app     # stop
container rm openjarvis-app       # remove (after stop)
```

To shut the whole service down later: `container system stop`.

## 6. Connect a real backend

The app is a browser client; to use real models, point the container at a running
`jarvis serve`. The nginx layer in the image reverse-proxies `/v1`, `/api`, and
`/health` to whatever you pass in **`OJ_BACKEND`** (same-origin, so no CORS issues).

1. **Start the backend on your Mac**, bound to all interfaces so the container can
   reach it (this requires an API key — see the backend's security docs):

   ```bash
   jarvis serve --host 0.0.0.0 --port 8000
   ```

2. **Find your Mac's IP** (the container reaches the host over the network):

   ```bash
   ipconfig getifaddr en0      # e.g. 192.168.1.50
   ```

3. **Run the container with `OJ_BACKEND`:**

   ```bash
   container run --detach --name openjarvis-app \
     --publish 8080:80 \
     --env OJ_BACKEND=http://192.168.1.50:8000 \
     openjarvis-app
   ```

4. Open http://localhost:8080. The demo banner disappears and the connection badge
   turns green. If the backend was started with an API key, set it in
   **Settings → Connection → API key** (the app sends it as `Authorization: Bearer …`).

> If `OJ_BACKEND` is unreachable, the proxy returns `502` and the app simply falls
> back to demo mode — it won't break.

To change the backend later, `container rm -f openjarvis-app` and re-run with a new
`--env OJ_BACKEND=…`.

## 7. Update to a new version

```bash
cd OpenJarvis/app
git pull
container rm -f openjarvis-app
container build --tag openjarvis-app .
container run --detach --name openjarvis-app --publish 8080:80 openjarvis-app
```

---

## Networking notes

- Apple `container` assigns **each container its own IP address**. `container ls`
  shows it. On **macOS 26**, `--publish 8080:80` maps the port to `localhost`.
- On **macOS 15**, if `localhost` publishing doesn't work, reach the app directly at
  the container IP on port 80:

  ```bash
  container ls          # note the IP, e.g. 192.168.64.3
  open http://192.168.64.3
  ```

- For [§6](#6-connect-a-real-backend), the container reaches your Mac over the LAN, so
  use the Mac's actual IP (`ipconfig getifaddr en0`) in `OJ_BACKEND`, and start the
  backend with `--host 0.0.0.0`.

## Build options

- **Bake an absolute API URL** at build time (instead of proxying) — usually not
  needed:

  ```bash
  container build --tag openjarvis-app --build-arg VITE_API_URL=http://192.168.1.50:8000 .
  ```

  Note: a baked, cross-origin URL requires the backend's CORS allow-list to include the
  app's origin. The default same-origin proxy (`OJ_BACKEND`) avoids this.

- The image listens on container port **80**; map it to any host port via `--publish`.

---

## Also works with Docker / Podman

The `Dockerfile` is standard OCI — the same commands apply with `docker` or `podman`:

```bash
cd OpenJarvis/app

# Docker
docker build -t openjarvis-app .
docker run -d --name openjarvis-app -p 8080:80 openjarvis-app
# live mode (Docker can resolve the host directly):
docker run -d --name openjarvis-app -p 8080:80 \
  -e OJ_BACKEND=http://host.docker.internal:8000 openjarvis-app

# Podman
podman build -t openjarvis-app .
podman run -d --name openjarvis-app -p 8080:80 openjarvis-app
```

Then open http://localhost:8080.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `container: command not found` | Install it (§1) and reopen your shell. |
| Build fails fetching base images / npm | Check internet access; rerun `container build` (layers cache). |
| `localhost:8080` won't load (macOS 15) | Port publishing is limited on macOS 15 — use the container IP from `container ls` (port 80), or upgrade to macOS 26. |
| App stuck in demo mode with a backend running | Backend not reachable from the container. Ensure `jarvis serve --host 0.0.0.0`, use the Mac's LAN IP in `OJ_BACKEND`, and check no firewall blocks port 8000. |
| `401 Unauthorized` after connecting | Backend requires a key — set it in Settings → Connection → API key. |
| Port already in use | Publish a different host port, e.g. `--publish 9090:80`, then open `http://localhost:9090`. |

See also [`INSTALL.md`](./INSTALL.md) for running the app directly with Node (no container).
