# Testing and evaluation

The final artefact evaluated for the dissertation is commit `85ab075065732b3652acabf8f67d2cee33e14d6f`.

## Software verification

The GitHub Actions CI run for that commit completed successfully.

| Check | Result |
| --- | --- |
| TypeScript | Pass |
| ESLint | Pass |
| Unit tests | Pass |
| Production build | Pass |
| Playwright end-to-end tests | Pass |

These checks verify that the artefact builds and that the automated test suite passes. They do not measure answer correctness.

## Repository-comprehension accuracy

The answer-reliability evaluation used 24 predefined questions: 12 for `clinic-triage` and 12 for `warehouse-dispatch`. Generated answers were compared with the tool-verified reference answers in `study/ground-truth.*.md`.

Marking was binary. An answer was `correct` only when it contained the material facts required by the reference answer without a material contradiction. No partial credit was awarded. The researcher made the final marking decisions.

| Repository | Correct | Total | Accuracy |
| --- | ---: | ---: | ---: |
| `clinic-triage` | 11 | 12 | 91.7% |
| `warehouse-dispatch` | 9 | 12 | 75.0% |
| **Overall** | **20** | **24** | **83.3%** |

The four incorrect answers are recorded in the two marking files. The main remaining weakness was semantic precision and completeness rather than wholly unrelated answers.

## Usability validation

A small descriptive usability study is the second evaluation stage. Its procedure is defined in `study/PHASE3_PROTOCOL.md`. Participant results will be reported only after data collection under an ethics-approved protocol.
