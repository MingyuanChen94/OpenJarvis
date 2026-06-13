# Usefulness Roadmap

> **Status:** Proposed, June 2026. This roadmap turns the evidence in the
> [Usefulness Research Report](usefulness-research-report.md) into concrete,
> prioritized work for making OpenJarvis dramatically more useful in
> professional, academic, everyday, and social/information-gathering life. It
> complements the infra-focused [development roadmap](../development/roadmap.md)
> — that one hardens the engine; this one delivers end-user workflows.

## How to read this

Every item lists **what**, **why** (with a back-reference to the report),
**how it maps to existing OpenJarvis primitives** (real file paths), and three
tags:

- **Effort:** S (config/preset, days) · M (new connector/tool/operator, 1–2 wk) ·
  L (new subsystem, multi-week)
- **Impact:** High / Med / Low (expected effect on daily usefulness & retention)
- **Lane:** **Personal** (a config/preset you can use immediately) ·
  **Upstream** (a clean PR to `open-jarvis/OpenJarvis`)

The ordering is deliberate: **Tier 1 quick wins reuse what already exists**, so
they are the fastest path to "two useful workflows" — the first-week retention
threshold the research highlights.

## Design rules (apply to every item)

These come straight from the report's eight cross-cutting principles:

1. **Proactive only at breakpoints.** Digests fire at morning/evening
   boundaries, honor quiet hours, and respect a per-operator schedule — never
   mid-task spam (CHI 2025, verified).
2. **Deliver through an existing channel** (`src/openjarvis/channels/`,
   e.g. Telegram/Slack/Discord/email), not a new app.
3. **Eliminate manual input** — operators run on a schedule and push results.
4. **Make cost & safety visible** — see Tier 5.
5. **Prefer MCP servers** (`src/openjarvis/mcp/client.py`) over bespoke
   connectors where a maintained server exists.

---

## Tier 1 — Quick wins (reuse existing primitives) · mostly **Personal**, easily **Upstream**

These ship on top of connectors and the scheduler/operators that already exist.

### T1.1 `info-digest` preset + operator
- **What:** A two-stage scored digest — a small local model scores/dedups items
  1–10, a larger model synthesizes a brief — delivered to a messaging channel at
  morning & evening breakpoints.
- **Why:** The dominant, proven info-gathering pattern; routes around the blocked
  X API by using open feeds (Report §5).
- **How:** Compose over existing `connectors/news_rss.py`, `connectors/hackernews.py`,
  and `channels/reddit_channel.py`; schedule via `src/openjarvis/operators/` +
  `src/openjarvis/scheduler/`; deliver via `channels/telegram.py`. Reuse
  `tools/digest_collect.py` and the `morning_digest` agent
  (`agents/morning_digest.py`) as the scaffold. New file:
  `configs/openjarvis/examples/info-digest.toml`.
- **Effort:** S · **Impact:** High · **Lane:** Personal → Upstream

### T1.2 `email-triage` preset
- **What:** Scheduled operator that categorizes inbox, flags time-sensitive
  mail, and drafts routine replies — fully local.
- **Why:** A top-2 killer workflow with **no competitive local-first option**
  (Report §1.1, §2).
- **How:** Existing `connectors/gmail.py` / `connectors/gmail_imap.py` /
  `connectors/outlook.py` for read; an `operative`/`orchestrator` agent for
  classification; draft via the engine; never auto-send (draft-only by default).
  New file: `configs/openjarvis/examples/email-triage.toml`.
- **Effort:** S–M · **Impact:** High · **Lane:** Personal → Upstream

### T1.3 `weekly-status` preset
- **What:** A Monday-morning cross-tool summary (open PRs, Slack threads,
  calendar week) — the stickiest professional PM workflow.
- **Why:** Eliminates the weekly coordination tax (Report §2).
- **How:** `connectors/github_notifications.py` + `connectors/slack_connector.py`
  + `connectors/gcalendar.py`; scheduled operator → Slack/email. New file:
  `configs/openjarvis/examples/weekly-status.toml`.
- **Effort:** S · **Impact:** Med–High · **Lane:** Personal → Upstream

### T1.4 First-run "two workflows fast" onboarding
- **What:** Extend `jarvis quickstart` so a first run sets up *morning digest +
  one messaging channel* in <10 minutes.
- **Why:** First-week value is the retention battleground; setup friction is a
  top abandonment driver (Report §1.2, principle 6).
- **How:** Extend the quickstart flow in `src/openjarvis/cli/` and
  `scripts/quickstart.sh`; lean on existing presets. Docs:
  `docs/getting-started/quickstart.md`.
- **Effort:** S · **Impact:** High · **Lane:** Upstream

---

## Tier 2 — Academic pack (biggest differentiation) · **Upstream**-first

The greenfield where OpenJarvis can lead. All sources here are free/open and
local-first is a compliance *requirement*, not just a preference (Report §3, §7).

### T2.1 arXiv + Semantic Scholar tools & personalized `paper-digest` operator
- **What:** `BaseTool`s for arXiv and Semantic Scholar search/citation lookup,
  plus an operator that ranks each day's new papers **against the user's own
  indexed notes/library** for personalized relevance (not a generic list).
- **Why:** Personalized arXiv relevance is explicitly unsolved; the APIs are free
  (Semantic Scholar 214M+ papers, verified) (Report §3).
- **How:** New `tools/arxiv_search.py`, `tools/semantic_scholar.py` registered via
  `ToolRegistry` (`core/registry.py`); relevance scoring reuses the memory
  retriever (`tools/storage/`, `connectors/retriever.py`); schedule via operators.
- **Effort:** M · **Impact:** High · **Lane:** Upstream

### T2.2 Zotero integration (connector or MCP)
- **What:** Read the user's Zotero library/annotations into memory for
  citation-aware Q&A.
- **Why:** Zotero+Obsidian+local-LLM is *the* local-first research stack
  (Report §3).
- **How:** Prefer **consuming an existing Zotero MCP server** via
  `mcp/client.py` (principle 7); fall back to a `connectors/zotero.py` using the
  local Zotero API / Better BibTeX export. Ingest through `connectors/pipeline.py`.
- **Effort:** M · **Impact:** Med–High · **Lane:** Upstream

### T2.3 `research-assistant` preset (+ future citation verification)
- **What:** A preset wiring the `deep_research` agent to a memory store seeded
  from a local PDF library, producing citation-grounded answers. Stretch goal: a
  skill that **verifies every cited claim against the local corpus** to catch
  hallucinated citations.
- **Why:** NotebookLM can't run on unpublished work; citation-hallucination
  detection has no local tool (Report §3).
- **How:** `agents/deep_research.py` + `tools/pdf_tool.py` + memory ingestion;
  new `configs/openjarvis/examples/research-assistant.toml`. Citation-verify as a
  follow-up skill via the skills system.
- **Effort:** M (preset) / L (verification) · **Impact:** High · **Lane:** Upstream

---

## Tier 3 — Professional pack · **Upstream**

### T3.1 Local meeting-notes pipeline preset
- **What:** Record → local Whisper transcription → summary/action-items operator,
  100% offline.
- **Why:** Cloud transcription faces lawsuits/bans; demand for local is strong
  (Report §2, §7). Meetily proves the Whisper+Ollama pattern.
- **How:** Existing `speech/` module + `faster-whisper` extra for STT; summary via
  an `orchestrator` agent; optional `connectors/granola.py` for existing notes.
  New `configs/openjarvis/examples/meeting-notes.toml`.
- **Effort:** M · **Impact:** Med–High · **Lane:** Upstream

### T3.2 MCP-first integration guide for pro tools
- **What:** Tested configs + a doc for connecting GitHub / Atlassian / Linear /
  Notion **MCP servers** through OpenJarvis's MCP client.
- **Why:** MCP is the de-facto standard; consuming servers beats bespoke
  connectors (Report §6, principle 7).
- **How:** `mcp/client.py` + `mcp/loader.py`; extend
  `docs/user-guide/mcp-external-servers.md` with per-server recipes.
- **Effort:** S–M · **Impact:** Med · **Lane:** Upstream

---

## Tier 4 — Everyday & home · **Personal** → **Upstream**

### T4.1 Health-insights operator
- **What:** Surface *trends/deltas* (sleep, HRV, activity) inside the morning
  digest — the contextualized-trend value, not raw numbers.
- **Why:** Automation depth + contextual health coaching drive retention
  (Report §4).
- **How:** Existing `connectors/apple_health.py`, `connectors/oura.py`,
  `connectors/strava.py`; fold into the T1.1 digest operator.
- **Effort:** S–M · **Impact:** Med · **Lane:** Personal → Upstream

### T4.2 Home Assistant connector + voice preset
- **What:** Control/query Home Assistant locally; optional voice loop.
- **Why:** Local voice crossed a usability threshold in 2025; privacy is the
  motivating feature (Report §4).
- **How:** New `connectors/home_assistant.py` (HA REST/WebSocket API); voice via
  the `speech/` module; expose <25 entities and use a tool-calling model (HA
  community guidance). New `configs/openjarvis/examples/home-voice.toml`.
- **Effort:** M–L · **Impact:** Med · **Lane:** Upstream

---

## Tier 5 — Strategic / cross-cutting (the durable moat) · **Upstream**-first

These convert OpenJarvis's latent advantages into *visible* features that
directly answer OpenClaw's top-two abandonment drivers.

### T5.1 Skill-install security scanning
- **What:** Scan skills with the existing `security/scanner.py` +
  `security/injection_scanner.py` at `jarvis skill install` / `skill sync` time;
  warn/block on malicious patterns.
- **Why:** The ClawHavoc malicious-skill class (verified) is OpenClaw's #1
  abandonment driver; OpenJarvis imports from the same OpenClaw skill source
  (`skills/sources/openclaw.py`), so this is *directly* relevant
  (Report §1.2–1.3, principle 4).
- **How:** Hook the scanners into `skills/manager.py` install path; surface
  results in the CLI. Tests mirror `tests/security/` + `tests/skills/`.
- **Effort:** M · **Impact:** High · **Lane:** Upstream

### T5.2 Per-operator budget caps + cost surfacing
- **What:** Configurable token/cost ceilings per operator, with spend surfaced in
  `jarvis operators status`.
- **Why:** Cost shock is the #2 abandonment driver (Report §1.2). The dev
  roadmap already lists "rate limiting per operator" as **Ready** — this extends
  it to cost.
- **How:** Extend `operators/manager.py` + `telemetry/store.py`
  (cost/energy already tracked); enforce in the agent execution loop.
- **Effort:** M · **Impact:** High · **Lane:** Upstream

### T5.3 Proactivity guidelines + quiet-hours/ignore-pattern support
- **What:** Make "breakpoint-only" proactivity a first-class scheduling concept:
  quiet hours, natural-boundary triggers, and trace-driven learning of which
  nudges the user ignores.
- **Why:** Peer-reviewed evidence (CHI 2025 ×2, verified): persistent mid-task
  proactivity is abandoned; breakpoint-timed help is valued (Report §4,
  principle 1).
- **How:** Extend the scheduler/operator config with quiet-hours; feed dismissals
  back through `traces/` → `learning/` for ignore-pattern tuning (aligns with the
  dev roadmap's "self-improving operators").
- **Effort:** M · **Impact:** Med–High · **Lane:** Upstream

---

## What we will NOT build (and why)

- **X/Twitter ingestion pipelines** — enterprise API ~$42k/mo; not viable for
  individuals (Report §5). Use RSS/HN/Reddit/Bluesky/Mastodon instead.
- **Bespoke connectors that duplicate maintained MCP servers** — maintenance
  sink; prefer the MCP client (principle 7).
- **Cloud-dependent "magic" features** — they break the local-first/compliance
  promise that is OpenJarvis's durable differentiator (Report §7).

---

## Suggested sequencing

1. **Tier 1** (info-digest, email-triage, weekly-status, onboarding) — fastest
   route to demonstrable daily value on existing primitives.
2. **Tier 5.1 + 5.2** (skill scanning, budget caps) — cheap, high-trust,
   clean upstream PRs that differentiate OpenJarvis from OpenClaw.
3. **Tier 2** (academic pack) — the flagship differentiation; greenfield.
4. **Tier 3 / Tier 4** — broaden into professional and home/everyday once the
   core loop is proven.

Each item is intended to be independently shippable; none blocks another.
