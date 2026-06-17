# Developer / maintainer scripts

These are **manual developer and maintainer utilities**. They are not part of the
installer, the CLI (`[project.scripts]`), or CI — nothing in the build depends on
them. They live here (rather than in `scripts/`, which holds user-facing and
install-time scripts) to keep that distinction clear.

| Script | Purpose |
|---|---|
| `oauth_all.py` | Run OAuth flows for connectors (Google, Strava, Spotify, …) and save tokens under `~/.openjarvis/connectors/`. One-time local setup helper. |
| `index_docs.py` | Chunk and index the docs corpus into the local DenseMemory backend (via Ollama embeddings) for retrieval testing. |
| `smoke_framework_comparison.sh` | Smoke-test the framework-comparison harness. Requires external framework checkouts (`HERMES_AGENT_PATH`, `OPENCLAW_PATH`, `JARVIS_MOCK_LLM_URL`). |
| `bump-desktop-version.sh` | Release helper: bump the desktop app version across `frontend/package.json`, `frontend/src-tauri/tauri.conf.json`, and `frontend/src-tauri/Cargo.toml`. (Routine dev builds are versioned automatically by `.github/workflows/autotag.yml`.) |

Run them from the repository root, e.g. `python scripts/dev/oauth_all.py`.
