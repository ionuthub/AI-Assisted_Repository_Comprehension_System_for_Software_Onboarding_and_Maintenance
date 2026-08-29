# Retrospective development phases

This is a short retrospective written after the study. The project used iterative development, but it was not formal Scrum. There were no daily stand-ups, sprint tickets or burndown charts.

## Phase 1: scope and requirements

Main outcomes:

- research question and objectives;
- FR1 to FR12 and NFR1 to NFR12;
- JavaScript/TypeScript scope;
- public GitHub URL as the only repository input;
- initial evaluation plan;
- maintenance features removed from scope.

AE1 Progress and Review was submitted on 10 July 2026.

## Phase 2: core artefact

Built:

- bounded GitHub ingestion;
- repository overview and technology detection;
- import analysis;
- TF-IDF search;
- file viewer.

TF-IDF was chosen instead of learned embeddings to keep retrieval local, fast and reproducible. The 50-file limit kept ingestion bounded for study sessions.

## Phase 3: grounded answers and evidence

Built:

- top-three retrieval;
- Gemini generation through a Vercel edge function;
- evidence panel with files, scores, line ranges and excerpts;
- unverified-path checks;
- coverage reporting;
- request and security controls.

The evidence panel was the main intervention tested in the study.

## Phase 4: evaluation and hardening

Added:

- study session runner;
- JSON and CSV export;
- Raw NASA-TLX and SUS;
- seeded inaccurate answers from gate failures;
- software checks and regression tests;
- 24-question accuracy gate;
- participant study.

Ethical approval was received on 13 August 2026. Data collection finished with 12 participants.

## Lessons

The feature freeze helped keep the project focused on evaluation rather than adding more features.

The main weakness was that different defects were found by different methods. Tests, type checking, CI and review were useful, but none was enough on its own. A file-cache defect, for example, was found during manual use.

The current technical documentation was therefore checked against the source rather than written from memory.

See [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) for the retrospective backlog and [`decisions/ADR-001-scope-freeze.md`](decisions/ADR-001-scope-freeze.md) for the scope decision.
