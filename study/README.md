# Study material

This directory contains retained material supporting the dissertation evaluation. It is not required for normal application operation, and nothing here is imported by `src/` or `api/`.

## AI-assistance and authorship note

Generative-AI assistance used during development, testing, analysis, review and drafting is disclosed in [`AI-DISCLOSURE.md`](AI-DISCLOSURE.md). Git author metadata should not be used to infer that a file or commit was produced without AI assistance. The researcher remains responsible for the final methodological decisions, study conduct, marking judgements, interpretation and submitted work.

Research records are retained for provenance and are not rewritten to hide or retrospectively alter AI involvement. The history-normalisation record is [`SHA-MAP-REAUTHOR.md`](SHA-MAP-REAUTHOR.md), with the original pre-normalisation history preserved under `archive/pre-reauthor`.

## Essential study records

| Path | Purpose |
| --- | --- |
| `PHASE3_PROTOCOL.md` | Session procedure and frozen build/deployment record |
| `AI-DISCLOSURE.md` | Authoritative repository-side AI-assistance record |
| `SHA-MAP-REAUTHOR.md` | Commit-hash mapping for the 29 August 2026 metadata normalisation |
| `accuracy-gate.{clinic-triage,warehouse-dispatch}.json` | Run-of-record accuracy-gate captures |
| `ground-truth.{clinic-triage,warehouse-dispatch}.md` | Reference answers and status records |
| `marking.{clinic-triage,warehouse-dispatch}.md` | Researcher's final binary gate verdicts |
| `answer-key.{clinic-triage,warehouse-dispatch}.json` | Participant task sets and seeded probe |
| `seeded_candidates.json` | Recorded gate failures eligible for the seeded probe |
| `question-scores.json` | Retrieval-score distribution over the gate questions |
| `gate-runs/` | Repeat captures used for determinism checks |
| `gate-screenshots/` | Retained full-page gate screenshots |
| `second-marking.md` | Machine-produced blind second marking; see limitations |
| `suggested-questions-measurement.md` | Measurement used to select opening suggested questions |

Historical audit briefs, remediation notes and the superseded gate-running guide are retained under `archive/`. They are provenance records, not current instructions.

## Participant data

Participant session exports are retained pseudonymised on University-managed storage and are deliberately not published here. Chapter 6 and Appendix I of the dissertation therefore cannot be reproduced from this public repository alone. `analysis/analyze_sessions.py` reproduces them when supplied with the retained records.

AI tools were not used to fabricate participant responses, timings, questionnaire scores or other experimental measurements. AI assistance in analysis and presentation is disclosed separately from the underlying recorded data.

## Files that must not be edited for style

Gate captures, archived runs, reference answers and marking sheets are research records. They must not be bulk-formatted or rewritten to match narrative documentation. See [`../analysis/README.md`](../analysis/README.md) for the operational constraints.

## Reproduction commands

```bash
npm run gate:score
npm run gate:compare
npm run measure:questions
```

Current reproduction and analysis instructions are maintained in [`../analysis/README.md`](../analysis/README.md).
