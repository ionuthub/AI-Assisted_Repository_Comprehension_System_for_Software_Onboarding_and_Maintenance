# Evaluation records

This folder contains only the records needed for the final dissertation evaluation.

| File | Purpose |
| --- | --- |
| `PHASE3_PROTOCOL.md` | Final two-stage evaluation protocol |
| `PARTICIPANT_TESTING_GUIDE.md` | Fixed researcher procedure for the comparative participant study |
| `ANSWER_KEY_AUDIT.md` | Source-code audit and Q1 scoring correction made after P01 and before P02 |
| `participant-answer-key.warehouse-dispatch.json` | Four-task participant marking key for warehouse-dispatch |
| `participant-answer-key.clinic-triage.json` | Four-task participant marking key for clinic-triage |
| `participant-marking-template.csv` | One-row-per-participant marking/summary template |
| `ground-truth.warehouse-dispatch.md` | Verified 12-question technical reference answers |
| `ground-truth.clinic-triage.md` | Verified 12-question technical reference answers |
| `marking.warehouse-dispatch.md` | Final technical verdicts for warehouse-dispatch |
| `marking.clinic-triage.md` | Final technical verdicts for clinic-triage |
| `final-results.json` | Combined audited technical result: 22/24 (91.7%) |
| `AI-DISCLOSURE.md` | AI-use disclosure |

The technical benchmark evaluates artefact commit `85ab075065732b3652acabf8f67d2cee33e14d6f`. A source-code audit on 4 September 2026 corrected the over-narrow Q1 entry-point reference without changing the generated answers. The participant runner is a measurement instrument added afterwards and does not change the evaluated technical application build.

Participant session JSON files must be stored separately and must not be committed to this public repository.
