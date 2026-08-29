# Study material

This folder contains records used for the dissertation evaluation. It is not part of the normal application runtime.

## Main records

| File | Purpose |
| --- | --- |
| `PHASE3_PROTOCOL.md` | Study procedure and frozen build |
| `AI-DISCLOSURE.md` | AI-use disclosure |
| `SHA-MAP-REAUTHOR.md` | Commit mapping after metadata normalisation |
| `accuracy-gate.*.json` | Recorded gate captures |
| `ground-truth.*.md` | Tool-verified reference answers |
| `marking.*.md` | Researcher's final gate verdicts |
| `answer-key.*.json` | Participant task sets |
| `seeded_candidates.json` | Gate failures eligible for seeded probes |
| `question-scores.json` | Retrieval-score measurements |
| `gate-runs/` | Repeated gate captures |
| `gate-screenshots/` | Gate screenshots |
| `second-marking.md` | Machine-produced blind second marking |
| `suggested-questions-measurement.md` | Suggested-question measurement |

Older audit and remediation notes are in `archive/`.

## Participant data

Participant exports are stored pseudonymised on University-managed storage and are not published here. `analysis/analyze_sessions.py` reproduces the Chapter 6 results when those retained files are supplied.

## Do not restyle research records

Ground-truth files, marking sheets, gate captures, answer keys and derived seeded-answer data contain exact research records or matching strings. Do not bulk-edit them for style.

## Reproduction

```bash
npm run gate:score
npm run gate:compare
npm run measure:questions
```

See [`../analysis/README.md`](../analysis/README.md) for the analysis workflow.
