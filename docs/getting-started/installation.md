---
title: Manual & From-Source Install
description: Run OpenJarvis from source — web app, CLI, or Python SDK — plus requirements, optional extras, and inference backends.
search:
  boost: 3
---

# Manual & From-Source Install

!!! tip "Just want it running?"
    For the one-line installers, see [Installation](install.md). This page covers
    running from source plus requirements, optional extras, and inference backends.

OpenJarvis runs entirely on your hardware. Choose the interface that fits your workflow.

---

## Web App

The web app is the graphical interface for OpenJarvis — a modern, installable PWA.
Everything stays local: the backend runs on your machine and the app talks to it over
`localhost`.

### Served by the backend (simplest)

The app ships inside the Python package, so any `jarvis serve` exposes it:

```bash
uv run jarvis serve --port 8000
```

Then open [http://localhost:8000](http://localhost:8000). Use your browser's
"Install app" control to install it as a PWA.

### From source (for UI development)

To run the app's Vite dev server with hot-reload against a local backend:

```bash
# Terminal 1 — backend
uv run jarvis serve --port 8000

# Terminal 2 — web app (proxies /v1, /api, /health to :8000)
cd app
npm install
npm run dev
```

Then open [http://localhost:5174](http://localhost:5174). The app also builds to a
static bundle (`npm run build`) and ships its own container — see the
[app/ README](https://github.com/open-jarvis/OpenJarvis/tree/main/app).

---

## CLI

The command-line interface is the fastest way to interact with OpenJarvis
programmatically. Every feature is accessible from the terminal.

### Install

```bash
git clone https://github.com/open-jarvis/OpenJarvis.git
cd OpenJarvis
uv sync
uv run maturin develop -m rust/crates/openjarvis-python/Cargo.toml
```

Requires [Rust](https://rustup.rs/). On Python 3.14+, set `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` before the `maturin` command.

### Verify

```bash
jarvis --version
# jarvis, version 0.1.0
```

### First commands

```bash
jarvis ask "What is the capital of France?"

jarvis ask --agent orchestrator --tools calculator "What is 137 * 42?"

jarvis serve --port 8000

jarvis doctor

jarvis model list

jarvis chat
```

!!! info "Inference backend required"
    The CLI requires a running inference backend (e.g., Ollama). See
    [Setting up an inference backend](#setting-up-an-inference-backend) below.

---

## Python SDK

For programmatic access, the `Jarvis` class provides a high-level sync API.

### Install

```bash
git clone https://github.com/open-jarvis/OpenJarvis.git
cd OpenJarvis
uv sync
uv run maturin develop -m rust/crates/openjarvis-python/Cargo.toml
```

Requires [Rust](https://rustup.rs/). On Python 3.14+, set `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` before the `maturin` command.

### Quick example

```python
from openjarvis import Jarvis

j = Jarvis()
print(j.ask("Explain quicksort in two sentences."))
j.close()
```

### With agents and tools

```python
result = j.ask_full(
    "What is the square root of 144?",
    agent="orchestrator",
    tools=["calculator", "think"],
)
print(result["content"])       # "12"
print(result["tool_results"])  # tool invocations
print(result["turns"])         # number of agent turns
```

### Composition layer

For full control, use the `SystemBuilder`:

```python
from openjarvis import SystemBuilder

system = (
    SystemBuilder()
    .engine("ollama")
    .model("qwen3:8b")
    .agent("orchestrator")
    .tools(["calculator", "web_search", "file_read"])
    .enable_telemetry()
    .enable_traces()
    .build()
)

result = system.ask("Summarize the latest AI news.")
system.close()
```

See the [Python SDK guide](../user-guide/python-sdk.md) for the full API reference.

---

## Requirements

| Requirement | Version | Install | Notes |
|-------------|---------|---------|-------|
| Python | 3.10–3.13 | [python.org](https://www.python.org/downloads/) | Required. 3.14+ not yet supported (a core dependency lacks 3.14 wheels). |
| uv | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` or `brew install uv` (macOS) | Python package & project manager |
| Git | any | [git-scm.com](https://git-scm.com/) or `brew install git` (macOS) | Required |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | Required for the Rust extension |
| Inference backend | any | See [below](#setting-up-an-inference-backend) | At least one of Ollama, vLLM, llama.cpp, SGLang, or a cloud API |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) or `brew install node` (macOS) | Required only to build/run the web app (`app/`) from source; 22+ for the WhatsApp Baileys channel bridge |

!!! tip "macOS users"
    See the [macOS Installation Guide](macos.md) for a complete step-by-step walkthrough
    covering Homebrew, uv, Rust, llama.cpp, and common pitfalls.

## Optional Extras

OpenJarvis uses optional extras to keep the base installation lightweight.

### Inference Backends

| Extra | Install Command | Description |
|-------|----------------|-------------|
| `inference-cloud` | `uv sync --extra inference-cloud` | OpenAI and Anthropic APIs |
| `inference-google` | `uv sync --extra inference-google` | Google Gemini API |

!!! note "Ollama, vLLM, and llama.cpp are HTTP-based"
    These engines have no additional Python dependencies — OpenJarvis communicates over HTTP. You still need the engine software running on your machine.

### Memory Backends

| Extra | Install Command | Description |
|-------|----------------|-------------|
| `memory-faiss` | `uv sync --extra memory-faiss` | FAISS vector store |
| `memory-colbert` | `uv sync --extra memory-colbert` | ColBERTv2 late-interaction retrieval |
| `memory-bm25` | `uv sync --extra memory-bm25` | BM25 sparse retrieval |

!!! tip "SQLite memory is always available"
    The default SQLite/FTS5 memory backend requires no additional dependencies.

### Server & Other

| Extra | Install Command | Description |
|-------|----------------|-------------|
| `server` | `uv sync --extra server` | OpenAI-compatible API server (`jarvis serve`) |
| `dev` | `uv sync --extra dev` | Development and testing tools |
| `docs` | `uv sync --extra docs` | Documentation build tools |

Combine extras:

```bash
uv sync --extra server --extra memory-faiss --extra inference-cloud
```

## Setting Up an Inference Backend

OpenJarvis requires at least one inference backend. Choose the one that matches your hardware.

### Ollama (Recommended)

The easiest way to get started. Handles model downloading and serving automatically.

1. Install from [ollama.com](https://ollama.com)
2. Start the server and pull a model:

    ```bash
    ollama serve
    ollama pull qwen3:0.6b
    ```

3. Verify: `jarvis model list`

!!! tip "Best for: Apple Silicon Macs, consumer NVIDIA GPUs, CPU-only systems"

### vLLM

High-throughput serving optimized for datacenter GPUs.

1. Install following the [official guide](https://docs.vllm.ai)
2. Start: `vllm serve Qwen/Qwen2.5-7B-Instruct`
3. Auto-detected at `http://localhost:8000`

!!! tip "Best for: NVIDIA datacenter GPUs (A100, H100), AMD GPUs"

### llama.cpp

Efficient CPU and GPU inference with GGUF quantized models.

1. Build from [github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
2. Start: `llama-server -m /path/to/model.gguf --port 8080`
3. Auto-detected at `http://localhost:8080`

### Cloud APIs

```bash
uv sync --extra inference-cloud --extra inference-google
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Next Steps

- [Quick Start](quickstart.md) — Run your first query
- [Configuration](configuration.md) — Customize engine hosts, model routing, memory, and more
