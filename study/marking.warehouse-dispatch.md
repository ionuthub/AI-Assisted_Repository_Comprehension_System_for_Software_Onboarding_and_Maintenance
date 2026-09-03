# Final marking — warehouse-dispatch

Artefact: `85ab075065732b3652acabf8f67d2cee33e14d6f`

Reference standard: `ground-truth.warehouse-dispatch.md`

Rubric: binary semantic match against the reference answer. No partial credit. The Answer section is the standard; Notes are context only.

| Question | Verdict | Reason |
| --- | --- | --- |
| Q1 | incorrect | Says execution starts in `index.html`, while the reference defines `src/main.tsx` as the browser entry point. |
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

**Score: 9/12 (75.0%).**
