# Final marking — warehouse-dispatch

Artefact: `85ab075065732b3652acabf8f67d2cee33e14d6f`

Reference standard: `ground-truth.warehouse-dispatch.md`

Rubric: binary semantic match against the reference answer. No partial credit. The Answer section is the standard; Notes are context only.

A source-code audit on 4 September 2026 corrected the Q1 entry-point rubric. `index.html` is the web bootstrap document and loads `src/main.tsx`, so an answer that correctly explains that chain must not be marked wrong solely for naming `index.html` first. The generated Q1 answer was therefore re-marked; no generated answer was changed.

| Question | Verdict | Reason |
| --- | --- | --- |
| Q1 | correct | Correctly identifies `index.html` as the web bootstrap, `src/main.tsx` as the React module entry, and describes the material App startup flow. |
| Q2 | incorrect | Explains scoring and allocation, but misses that `applyStockReservation` rechecks available quantities and updates a cloned zone set. |
| Q3 | correct | Matches the reference answer. |
| Q4 | correct | Matches the reference answer. |
| Q5 | correct | Matches the reference answer. |
| Q6 | correct | Matches the reference answer. |
| Q7 | correct | Matches the reference answer. |
| Q8 | correct | Matches the reference answer. |
| Q9 | correct | Matches the reference answer. |
| Q10 | incorrect | Covers ranking, status, reservations and pricing, but misses that revalidation and release reuse the stored allocations and reservations. |
| Q11 | correct | Matches the reference answer. |
| Q12 | correct | Matches the reference answer. |

**Score: 10/12 (83.3%).**
