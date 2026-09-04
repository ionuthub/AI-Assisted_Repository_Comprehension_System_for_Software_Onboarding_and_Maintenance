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

The answer-reliability evaluation used 24 predefined questions: 12 for `clinic-triage` and 12 for `warehouse-dispatch`. Generated answers were compared with the source-code-audited reference answers in `study/ground-truth.*.md`.

Marking was binary. An answer was `correct` only when it contained the material facts required by the reference answer without a material contradiction. No partial credit was awarded. The researcher made the final marking decisions.

A source-code audit on 4 September 2026 identified one rubric defect affecting Q1 in both repositories. The original reference treated `src/main.tsx` as the only acceptable answer to "Where does execution start?", although each repository's `index.html` is the web bootstrap document and explicitly loads `/src/main.tsx`. The generated Q1 answers correctly described that chain. The reference was therefore corrected and both Q1 answers were re-marked without changing any generated answer.

| Repository | Correct | Total | Accuracy |
| --- | ---: | ---: | ---: |
| `clinic-triage` | 12 | 12 | 100.0% |
| `warehouse-dispatch` | 10 | 12 | 83.3% |
| **Overall** | **22** | **24** | **91.7%** |

The two remaining incorrect answers are recorded in `study/marking.warehouse-dispatch.md`: Q2 omitted the reservation recheck/cloned-zone semantics and Q10 omitted the downstream reuse of stored allocations/reservations by release and revalidation.

## Comparative participant evaluation

The second evaluation stage compares manual GitHub inspection with Codemap in a within-subject design. Its procedure is defined in `study/PHASE3_PROTOCOL.md`. Participant results are reported only from data collected under the approved ethics procedure and the fixed post-audit marking rules.
