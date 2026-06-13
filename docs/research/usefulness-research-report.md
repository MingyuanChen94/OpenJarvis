# Making OpenJarvis More Useful: A Research Report

> **Status:** Research synthesis, June 2026. This document gathers external
> evidence on what makes personal-AI assistants genuinely useful (and what makes
> people abandon them), then maps the findings onto OpenJarvis. The companion
> [Usefulness Roadmap](usefulness-roadmap.md) turns this evidence into a
> prioritized work plan.

## Why this report exists

OpenJarvis already has the *primitives* of a great personal assistant — local
inference, 9 agent types, 37 connectors, 30+ channels, RAG memory, a scheduler,
a security module, and energy/cost telemetry. What it lacks is a clear,
evidence-backed answer to a simpler question: **what should a person actually
*do* with it on a Tuesday — at work, in the lab, at home, and while keeping up
with the world?**

This report answers that by studying how people use comparable assistants
(OpenClaw, Khoj, Open Interpreter, Leon, Mycroft/OVOS) and the broader 2025–2026
AI-workflow literature, then asking which of those proven workflows OpenJarvis is
uniquely positioned to deliver *locally and privately*.

## Methodology

- **Fan-out search:** four parallel research streams (comparable-assistant user
  evidence; professional + academic workflows; everyday + social/info-gathering
  workflows; integration standards & privacy drivers), ~150 sources collected.
- **Adversarial verification:** six load-bearing claims were independently
  re-checked against primary sources. Results are folded in below; one widely
  repeated statistic was **refuted** and has been excluded.
- **Evidence ratings:** each claim is tagged **[strong]** (primary source or
  multiple independent sources), **[moderate]** (consistent secondary sources),
  or **[weak]** (single anecdote / vendor marketing). Where verification changed
  a number, the corrected figure is used and flagged.

A note on honesty: a frequently cited "78% vs 41% three-month retention for
multi-workflow users" statistic traces back to a single SEO statistics-aggregator
blog (`getpanto.ai`) with no methodology and no primary OpenClaw source. Our
verification pass rated it **fabricated/dubious**, so we do **not** rely on it.
The recommendations it would have supported are independently justified by the
peer-reviewed and qualitative evidence below.

---

## Part 1 — Lessons from comparable assistants

### 1.1 The killer workflows people actually keep

| Workflow | Seen in | Evidence |
|---|---|---|
| **Proactive morning briefing** pushed to a messaging app (calendar + inbox + news, before you open a laptop) | OpenClaw `HEARTBEAT.md` | **[strong]** — most-cited "first essential" workflow across many independent write-ups |
| **Email / inbox triage** (categorize, flag urgent, draft routine replies) | OpenClaw | **[strong]** — second most-cited daily use case |
| **Personal-knowledge Q&A** over notes/PDFs ("second brain") | Khoj (Obsidian/Emacs) | **[moderate]** — Khoj's defining, well-loved capability; no direct OSS competitor |
| **Scheduled research / digests** (monitor sources → synthesized report) | OpenClaw, Khoj | **[moderate]** — recurring community pattern |
| **Local voice home control** (zero audio leaves the device) | OVOS + Home Assistant | **[moderate]** — privacy is the motivating feature |
| **Desktop/dev automation** (run tests, watch PRs, file edits) | Open Interpreter, OpenClaw | **[moderate]** |

The common thread: the assistant **comes to you, on a schedule, through a channel
you already check** — it is not another app/tab you must remember to open.

### 1.2 Why people abandon them

1. **Security blowups.** OpenClaw's early-2026 crisis is the clearest case.
   - **CVE-2026-25253** — a one-click/no-interaction RCE via a WebSocket origin
     bypass (CVSS 8.8), ~40,000+ internet-exposed instances. **[strong, verified]**
   - **"ClawHavoc"** — malicious skills on the ClawHub marketplace: initial
     reports found **341 of ~2,857 scanned (~12%)** (Koi Security / The Hacker
     News), later expanded counts cited **~1,184** across a 10,700+ skill
     registry, distributing Atomic macOS Stealer and Windows infostealers
     (Trend Micro, Bitdefender). **[strong, verified]**
   - Result: enterprise bans (Meta and others), national-CERT advisories, and
     Anthropic restricting OpenClaw's access to Claude. **[strong]**
2. **Cost shock.** Unbounded agentic loops produce surprise bills — community
   reports range from ~$300–750/month for "proactive assistant" usage to
   $4,200 in a single weekend. **[strong]** "Agents burn ~50× the tokens of
   chat" is the structural cause.
3. **Setup friction.** Docker errors, dependency conflicts, undocumented admin
   steps — Khoj and Leon GitHub issues document this as a first-week
   abandonment driver. **[strong for Khoj]**
4. **Local-model "amnesia."** Ollama's default 2048-token context makes agents
   forget recent turns; raising it tanks throughput (e.g. 40→8 tok/s), so naive
   self-hosted setups feel unreliable. **[moderate]**
5. **Platform fragility.** Mycroft's corporate collapse (2023) and Open
   Interpreter's Python→Rust rewrite both stranded users mid-workflow.
   **[strong for the events]**

### 1.3 What this means for OpenJarvis

OpenJarvis's architecture is, almost line-for-line, the antidote to OpenClaw's
abandonment drivers: **local-first inference** (no per-token bill shock),
a **sandbox + security/injection scanners** (the ClawHavoc/RCE class), **energy
& cost telemetry** (cost visibility), and **swappable engines/memory** (context
amnesia). The strategic opportunity is to *package those defenses as visible
features*, not leave them as latent infrastructure.

---

## Part 2 — Professional life

- **Coding is the richest-evidence category, and trust is falling.** The Stack
  Overflow 2025 survey (49,009 respondents) found **84%** use or plan to use AI
  tools, but trust in AI accuracy fell to **~29%** (down from ~40% in 2024 —
  *corrected via primary source; an earlier draft's "33%/43%" was wrong*), and
  the **#1 frustration is "AI solutions that are almost right but not quite."**
  **[strong, verified]**
- **Independent productivity evidence is sobering.** METR's July 2025 RCT
  (arXiv:2507.09089) found experienced open-source developers were **~19%
  slower** with AI tools despite *predicting* a 24% speedup — and still
  *believed* they were faster afterward. **[strong, verified]** Implication:
  measurement matters, and OpenJarvis's eval/telemetry stack is a differentiator,
  not a side feature.
- **Agentic mode is the sticky mode** for complex tasks (Claude Code / Cursor
  background agents), but autocomplete still dominates by volume. **[moderate]**
- **Meeting transcription has strong local-first pull.** Cloud tools are sticky
  (Otter hit $100M ARR; Granola is loved for "no bots in the meeting") but face
  **privacy lawsuits** (Otter in CA; Fireflies under Illinois BIPA) and
  institutional bans. **Meetily** (Whisper.cpp + Ollama, MIT) shows a viable
  100%-offline pattern. **[strong on demand drivers]**
- **Email triage and project-tracking have no competitive local-first option.**
  Superhuman/Gemini-for-Gmail and Jira Rovo/Linear AI are cloud-only. The
  *stickiest* PM workflow is the **cross-tool weekly status summary** (Jira +
  Slack + GitHub) that eliminates a manual coordination tax. **[moderate]**
- **Document Q&A (RAG)** is the broadest enterprise use case; local options
  (AnythingLLM, PrivateGPT) exist but lag on multi-user governance/audit.
  **[moderate]**

---

## Part 3 — Academic life (the biggest greenfield)

- **The leading local-first research stack is Zotero + Obsidian + a local LLM.**
  Better BibTeX + the Obsidian-Zotero plugin + a vault-AI plugin (Smart Second
  Brain / Notemd) + Ollama gives offline, free, citation-aware notes — but with
  high setup friction (4–5 tools) and **no automated discovery of new papers**.
  **[strong on capability]**
- **Semantic Scholar's API is free open infrastructure** — **214M+ papers**
  (verified; "200M+" understates it), programmatic search + citation graph,
  generous rate limits; **arXiv's API is likewise free.** This is the foundation
  for a local literature agent. **[strong, verified]**
- **NotebookLM is popular but academically limited and cloud-bound:** no paper
  discovery, no BibTeX/RIS export, ~50-source cap, and Google retains uploads —
  unsuitable for **unpublished manuscripts** under most university policies.
  **[strong on limitations]**
- **Two unsolved problems** stand out: (a) **personalized arXiv relevance** —
  "papers that matter to *my* agenda," not a generic daily list; and (b)
  **citation-hallucination verification** against a ground-truth local corpus
  (LLMs fabricate citations; this is a documented, ongoing harm). **[strong on
  the problems; no production local tool exists]**
- **Adoption is high and rising:** student AI use ~92%; use in academic research
  jumped 57%→84% (2024→2025). **[strong]**

Academic is where OpenJarvis can lead rather than catch up: the work is
*required* to be local (institutional/publisher policy), the data infrastructure
is free and open, and no incumbent owns the local-first niche.

---

## Part 4 — Everyday life

- **Automation depth drives retention** across calendar, health, finance, and
  meal planning: tools that *eliminate manual input* (auto-categorize,
  auto-plan, auto-schedule) retain users ~2–3× longer than tools that merely
  assist manual logging. **[moderate, recurring across categories]**
- **Proactive morning briefings are now a mainstream paradigm** (ChatGPT
  Tasks/Pulse), explicitly engineered for habit formation — but constrained by
  caps and lack of conditional logic. A local digest agent has no such caps.
  **[moderate]**
- **Wearable health coaching got materially better in 2025** (Oura Advisor reads
  longitudinal biometrics; Whoop Coach is conversational). The value is in
  *contextualized trends*, which a local agent can compute over the existing
  Apple Health / Oura / Strava connectors. **[strong on the products]**
- **Local voice crossed a usability threshold:** Home Assistant's 2025 "Voice"
  work cut local TTS latency ~9.5× (5.3s → ~0.56s) via streaming Piper; HA
  2025.8 shipped a first-class "AI Task" integration. Whisper remains the STT
  gold standard (hardware-gated); Vosk is the low-power fallback. Community
  guidance: expose <25 entities to the LLM and use tool-calling models for
  reliability. **[strong, official HA benchmarks]**

---

## Part 5 — Social media & information gathering

- **The dominant pattern is a two-stage digest pipeline:** a cheap/small model
  scores each item 1–10 and dedups (URL hash + fuzzy title); a larger model
  synthesizes the top items into a structured brief (lead story, trends, quick
  hits). Widely reproduced in n8n templates and self-hosted readers. **[strong]**
- **X/Twitter is economically blocked** for individuals (enterprise API from
  ~$42k/month; xAI treats X as a training pipeline, not a dev ecosystem).
  **Reddit is borderline-affordable** (~$2/month for modest monitoring). **Route
  via open feeds (RSS/HN/Reddit) and open networks (Bluesky/Mastodon)** instead.
  **[strong, pricing-documented]**
- **Local-first capture tools have real traction:** Karakeep (read-it-later +
  AI tagging, ~24.8k★) and Obsidian (~1.5M users) are the ecosystem winners
  worth interoperating with. **[strong on adoption]**

---

## Part 6 — Integration standard: MCP

- **MCP is the de-facto standard** (97M+ SDK downloads, 14,000+ servers, donated
  to the Linux Foundation's Agentic AI Foundation with joint
  Anthropic/OpenAI/Google/Microsoft/AWS governance). **[strong]**
- **Consensus "professional" servers:** GitHub, Atlassian (Jira/Confluence,
  GA Feb 2026), Notion, Linear, Slack, Stripe. **Academic servers exist but are
  community-built** (Zotero MCP, Semantic Scholar MCP, paper-search MCP covering
  arXiv/PubMed/bioRxiv/CrossRef/OpenAlex). **[strong on existence; weak on
  stability]**
- **Implication:** OpenJarvis already has an MCP client/server
  (`src/openjarvis/mcp/`). For many integrations, **consuming a maintained MCP
  server beats writing a bespoke connector** — lower maintenance, instant
  ecosystem breadth.

---

## Part 7 — Privacy & policy: the local-first tailwind

- **Institutions increasingly *prohibit* cloud AI on sensitive data.** MIT and
  Harvard bar confidential/unpublished data from public AI tools; NSF's 2025
  research-misconduct update covers AI misuse; publishers forbid reviewers from
  using public AI on manuscripts; GDPR treats vendor retention as a transfer
  risk. **[strong, named policies]**
- **Cloud transcription's legal exposure** (Otter/Fireflies lawsuits; a
  university banning Read AI) is actively pushing organizations toward
  self-hosted pipelines. **[strong]**

This is OpenJarvis's structural advantage: for a large and growing set of
professional and academic tasks, **local-first isn't a preference — it's a
compliance requirement.**

---

## Eight cross-cutting principles (what the evidence says to build for)

1. **Be proactive, but only at natural breakpoints.** Two CHI 2025 studies
   (Codellaborator, 10.1145/3706598.3713357; "Need Help?",
   10.1145/3706598.3714002) confirm proactive help raises efficiency *and*
   causes disruption — persistent mid-task suggestions are rated "annoying."
   Schedule digests at boundaries; honor quiet hours; learn ignore-patterns.
   **[strong, verified]**
2. **Meet users in the messaging app they already check.** Channel UX is the
   highest-leverage retention surface.
3. **Eliminate manual input.** Automation depth, not feature count, predicts
   retention.
4. **Make cost and safety *visible*.** Surface budget/energy; scan skills before
   install. Directly answers the two top OpenClaw abandonment drivers.
5. **Lead with the local-first/compliance story** where policy forbids cloud.
6. **Lower first-run friction; aim for "two useful workflows fast."** First-week
   value is the retention battleground (multi-workflow framing supported
   qualitatively; the specific viral statistic was refuted — see Methodology).
7. **Prefer MCP servers to bespoke connectors** where a maintained server exists.
8. **Don't fight blocked platforms.** Route around the X API; build on open
   feeds and open networks.

---

## What the evidence says *not* to build

- **X/Twitter ingestion pipelines** — economically non-viable for individuals.
- **Bespoke connectors that duplicate good MCP servers** — maintenance sink.
- **Cloud-dependent "magic" that breaks the local-first promise** — it erodes
  the one durable differentiator and reintroduces the compliance problem.

---

## Source list

Collected across four research streams (June 2026). Verification-pass primary
sources are marked **[V]**.

**Comparable assistants & security**
- https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html **[V]**
- https://www.trendmicro.com/en_us/research/26/b/openclaw-skills-used-to-distribute-atomic-macos-stealer.html **[V]**
- https://cyberpress.org/clawhavoc-poisons-openclaws-clawhub-with-1184-malicious-skills/ **[V]**
- https://thehackernews.com/2026/02/openclaw-bug-enables-one-click-remote.html
- https://github.com/jgamblin/OpenClawCVEs/
- https://www.techbuzz.ai/articles/meta-bans-viral-ai-tool-openclaw-over-security-risks
- https://www.penligent.ai/hackinglabs/the-openclaw-prompt-injection-problem-persistence-tool-hijack-and-the-security-boundary-that-doesnt-exist/
- https://github.com/khoj-ai/khoj and issues #911 / #1050 / #1100
- https://github.com/openinterpreter/open-interpreter
- https://github.com/leon-ai/leon
- https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team
- https://grokipedia.com/page/Mycroft_(software)
- https://leanopstech.com/blog/agentic-ai-cost-runaway-token-budget-2026/
- https://mem0.ai/blog/state-of-ai-agent-memory-2026

**Professional**
- https://survey.stackoverflow.co/2025/ai **[V]**
- https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/ **[V]**
- https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ **[V]**
- https://arxiv.org/abs/2507.09089 **[V]**
- https://venturebeat.com/ai/stack-overflow-data-reveals-the-hidden-productivity-tax-of-almost-right-ai-code/
- https://github.com/Zackriya-Solutions/meetily
- https://meetily.ai/blog/best-self-hosted-meeting-transcription-tools-2026
- https://www.businesswire.com/news/home/20251222704206/en/Otter.ai-Caps-Transformational-2025-with-100M-ARR-Milestone/
- https://blog.superhuman.com/ai-email-agents/
- https://www.mindstudio.ai/blog/issue-trackers-ai-agent-infrastructure-jira-linear
- https://skywork.ai/blog/anythingllm-review-2025-local-ai-rag-agents-setup/

**Academic**
- https://www.semanticscholar.org/product/api **[V]**
- https://api.semanticscholar.org/api-docs/ **[V]**
- https://paperguide.ai/blog/elicit-vs-scispace/
- https://aarontay.substack.com/p/a-2025-deep-dive-of-consensus-promises
- https://medium.com/@theo-james/zotero-obsidian-integrating-reference-management-into-your-second-brain-107caf7b0179
- https://paperguide.ai/blog/notebooklm-alternatives/
- https://www.nxcode.io/resources/news/obsidian-ai-second-brain-complete-guide-2026
- https://completeaitraining.com/news/overleaf-introduces-ai-assist-to-streamline-research/
- https://arxiv.org/pdf/2602.01686 (AI-assisted scholarly citation fabrication)
- https://www.hepi.ac.uk/reports/student-generative-ai-survey-2025/
- https://www.thesify.ai/blog/ai-policies-academic-publishing-2025

**Everyday & social/info-gathering**
- https://www.home-assistant.io/blog/2025/06/25/voice-chapter-10/
- https://www.home-assistant.io/blog/2025/10/22/voice-chapter-11/
- https://www.home-assistant.io/integrations/ollama/
- https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks
- https://ouraring.com/blog/oura-advisor/
- https://n8n.io/workflows/13527-summarize-ai-news-from-rss-reddit-and-hn-with-claude-to-discord-and-slack/
- https://www.readless.app/solutions/rss-feed-ai-digest
- https://www.blotato.com/blog/twitter-api-pricing
- https://rankvise.com/blog/reddit-api-cost-guide/
- https://github.com/karakeep-app/karakeep
- https://techcrunch.com/2025/01/14/chatgpt-now-lets-you-schedule-reminders-and-recurring-tasks

**Proactivity (verified) & integration standards**
- https://dl.acm.org/doi/10.1145/3706598.3713357 **[V]**
- https://arxiv.org/abs/2502.18658 **[V]**
- https://dl.acm.org/doi/full/10.1145/3706598.3714002 **[V]**
- https://www.getknit.dev/blog/the-future-of-mcp-roadmap-enhancements-and-whats-next
- https://www.pulsemcp.com/servers/swairshah-zotero
- https://mcpservers.org/servers/openags/paper-search-mcp
- https://github.com/francojc/mcp-research

**Refuted / excluded**
- https://www.getpanto.ai/blog/openclaw-ai-platform-statistics — *"78%/41%
  workflow-retention split" rated fabricated content-farm material; excluded.*
