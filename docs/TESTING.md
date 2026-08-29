# Testing and evaluation

Three types of evidence are kept separate:

1. **Software verification:** whether the application works as implemented.
2. **Answer-reliability gate:** whether generated answers match the reference standard.
3. **Participant evaluation:** whether the tool helped participants.

## Software verification

At the frozen source commit `e7d7efe`:

| Check | Result |
| --- | --- |
| TypeScript | Clean |
| ESLint | 0 errors, 4 warnings |
| Unit tests | 139 passed across 13 files |
| End-to-end tests | 4 passed |
| Production build | Clean |

The unit tests cover ingestion, retrieval, prompt building, streaming, evidence, file viewing, state management and the evaluation session.

The four Playwright tests cover the main controls, malformed repository URLs, evaluation-page navigation and the not-found route. They do not run a full live Q&A flow because that requires a model call.

### CI note

CI now runs on Node 20. An earlier workflow used Node 18, so the test runner did not report in CI for about five weeks even though local checks passed.

### Test-count correction

The dissertation states 118 tests across 13 files. The checked sequence was:

| Commit | Tests | Files |
| --- | ---: | ---: |
| `fd5f5ab` | 109 | 12 |
| `429f830` | 112 | 12 |
| `c5fb72a` | 115 | 13 |
| `beae1ae` | 135 | 13 |
| `e7d7efe` | 139 | 13 |

The reproducible frozen-build figure is **139 across 13 files**.

## Answer-reliability gate

The gate used 24 questions, 12 for each study repository.

**Result: 6 of 24 answers passed against the tool-verified reference standard.**

The reference answers were AI-assisted and checked with tools against the complete repositories. They were not independently reconstructed line by line by the researcher. The researcher made the final binary marking decisions.

The gate captures are stored in `study/accuracy-gate.*.json`, with supporting runs and screenshots under `study/gate-runs/` and `study/gate-screenshots/`.

The 18 failed items produced `study/seeded_candidates.json`, which was used as the source for seeded inaccurate answers in the participant study.

## Participant evaluation

The study used a within-subjects design with 12 participants.

| Hypothesis | Result |
| --- | --- |
| H1, task time | Inconclusive |
| H2, task accuracy | Not supported |
| H3, Raw NASA-TLX workload | Supported |
| H4, SUS above 68 | Not established |
| Seeded inaccurate answer | 7 of 12 detected it; 5 corrected it |

Exact statistics are reported in Chapter 6 of the dissertation and reproduced with `analysis/analyze_sessions.py` from the retained session files.

Participant exports are stored pseudonymised on University-managed storage and are not included in this public repository.
