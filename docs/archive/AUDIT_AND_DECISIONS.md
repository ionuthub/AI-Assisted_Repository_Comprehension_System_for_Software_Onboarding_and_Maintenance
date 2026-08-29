# Archived audit and decisions log

This file summarises early repository audits. It is historical and does not describe the current architecture. Current technical documentation is in `docs/ARCHITECTURE.md`, `docs/REQUIREMENTS.md` and `docs/TESTING.md`.

## Early audit

The first audit found:

- missing Zustand setters that could crash line selection;
- invalid directory-upload typing;
- unused UI components with missing dependencies;
- scaffold names and stale project metadata;
- development residue that did not belong in the repository.

These were fixed before the main study work.

## Study instrumentation

The evaluation page was expanded to record:

- participant and condition;
- task time and answers;
- confidence;
- locating and applied-task scores;
- Raw NASA-TLX;
- SUS;
- seeded inaccurate-answer detection;
- JSON and CSV exports.

Analysis scripts were added for the accuracy gate, repository matching and participant-session analysis.

## Deployment issues

Two deployment problems were found later:

1. The origin allowlist did not match the real Vercel domain, so Q&A requests returned 403.
2. The configured Gemini model had been retired, so generation returned 404.

The allowlist was moved to configuration and the model became configurable through `GEMINI_MODEL`, with `gemini-3.5-flash` as the default.

## Main lesson

The project needed checks at several levels: type checking, unit tests, browser tests, manual use and source review. No single check found every important problem.

AI assistance used during this work is disclosed in [`../../study/AI-DISCLOSURE.md`](../../study/AI-DISCLOSURE.md).
