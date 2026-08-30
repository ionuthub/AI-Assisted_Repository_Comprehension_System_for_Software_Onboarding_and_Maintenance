# Testing and evaluation

Three types of evidence are kept separate:

1. **Software verification:** whether the application works as implemented.
2. **Answer-reliability gate:** whether generated answers match the reference standard.
3. **Participant evaluation:** whether the tool helped participants.

## Software verification

At frozen source commit `e7d7efe`:

| Check | Result |
| --- | --- |
| TypeScript | Clean |
| ESLint | 0 errors, 4 warnings |
| Unit tests | 139 passed across 13 files |
| End-to-end tests | 4 passed |
| Production build | Clean |

The unit tests cover ingestion, retrieval, prompt building, streaming, evidence, file viewing, state management and the evaluation session.

The four Playwright tests cover the main controls, malformed repository URLs, evaluation-page navigation and the not-found route. They do not run a full live Q&A flow because that requires a model call.

CI now runs on Node 20. An earlier Node 18 workflow prevented the test runner from reporting in CI for about five weeks, although local checks continued.

## Answer-reliability gate

The gate used 24 questions, 12 for each study repository.

**Result: 6 of 24 answers passed against the tool-verified reference standard.**

The reference answers were AI-assisted and checked against the complete study repositories. The researcher made the final binary gate decisions. A blind machine-produced second marking was independently checked and confirmed by the researcher and is treated as a consistency check, not independent human ground truth.

Gate captures are stored in `study/accuracy-gate.*.json`, with supporting runs and screenshots under `study/gate-runs/` and `study/gate-screenshots/`.

The 18 failed items produced `study/seeded_candidates.json`, which supplied the seeded inaccurate answers used in the participant study.

## Participant evaluation

The study used a within-subjects design with 12 participants.

| Hypothesis | Result |
| --- | --- |
| H1, task time | Inconclusive |
| H2, task accuracy | Not supported |
| H3, Raw NASA-TLX workload | Supported |
| H4, SUS above 68 | Not established |
| Seeded inaccurate answer | 7 of 12 detected it; 5 corrected it |

Chapter 6 of the dissertation reports the final statistics. `analysis/analyze_sessions.py` contains the participant-analysis workflow.

Participant exports are stored pseudonymised on University-managed storage and are not included in the public repository.
