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

### Current post-study regression status

The current artefact is reported separately from the frozen evaluated build. On 31 August 2026 the final consistency-cleanup branch passed CI with:

| Check | Result |
| --- | --- |
| TypeScript | Clean |
| ESLint | 0 errors, 4 warnings |
| Unit tests | 144 passed across 14 files |
| Playwright | 21 passed |

These current-main checks verify later interface, accessibility and cleanup changes. They do not replace the 139-unit/4-end-to-end figures above, which remain the evidence for the frozen evaluated artefact.

`npm ci` also reported dependency advisories during this run. Those advisories require separate production/development dependency triage and are not treated as a failed functional test.

## Answer-reliability gate

The gate used 24 questions, 12 for each study repository.

**Result: 6 of 24 answers passed against the tool-verified reference standard.**

The reference answers were AI-assisted and checked against the complete study repositories. The researcher made the final binary gate decisions. A historical blind second marking was machine-produced and later reviewed by the researcher as a consistency check. It was not a separate human second marking and is not the source of the final 6/24 result.

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
