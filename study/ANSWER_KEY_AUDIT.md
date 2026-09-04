# Answer-key audit — 4 September 2026

## Purpose

After P01 and before P02, the participant task prompts, participant answer keys, technical ground-truth questions and frozen source repositories were checked end-to-end to make sure each question was being marked against the correct source-code facts.

This audit is a correction of the scoring instrument, not a change to the participant experiment. The task wording, repository commits, randomisation, manual/Codemap conditions, timers, NASA-TLX and SUS remain unchanged.

## Frozen repositories checked

- `warehouse-dispatch` — `937be9d5598f81703e95c1a3ce2a2ec234287ee9`
- `clinic-triage` — `67d7a5a0c37452946876b0e7626b6c882888d4f0`

## Participant task mapping

The four participant tasks deliberately reuse four of the twelve technical benchmark questions. They do not map by participant task number.

| Participant task | Technical source question | Result of audit |
| --- | --- | --- |
| Task 1 — orientation/startup | Q1 | One rubric correction required |
| Task 2 — type-specific processing | Q3 | Mapping and required facts confirmed |
| Task 3 — cross-cutting behaviour | Q4 | Mapping and required facts confirmed |
| Task 4 — change-impact reasoning | Q9 | Mapping and required facts confirmed |

In particular, Participant Task 2 must be marked against technical Q3 (handler/route registry), not technical Q2 (zone assignment/priority banding).

## Q1 defect found and corrected

The original Q1 reference in both repositories said that browser execution starts in `src/main.tsx` and treated an answer beginning with `index.html` as incorrect.

The frozen source code shows that this was too narrow:

- each repository has an `index.html` containing a module script that loads `/src/main.tsx`;
- `src/main.tsx` is therefore the JavaScript/React module entry, while `index.html` is the web bootstrap document;
- an answer that explains `index.html` -> `src/main.tsx` -> `App` is semantically correct even if it names `index.html` first.

The corrected rubric therefore accepts either entry-point framing when the relationship and material startup flow are correct. React StrictMode is valid supporting detail but is not mandatory for participant correctness.

## Other participant tasks checked

### warehouse-dispatch Task 2 / Q3

Confirmed against `src/dispatch/handlers/registry.ts`, `src/dispatch/allocator.ts` and `src/dispatch/releaseService.ts`:

- `getHandler(type)` dynamically loads handler modules;
- modules self-register handlers keyed by type;
- allocation and release retrieve the handler using the order type.

Additional correct discussion of zone rules, pricing, validation or interceptors is allowed but does not replace the handler-selection explanation requested by the task.

### warehouse-dispatch Task 3 / Q4

Confirmed that `applyStockReservation` has exactly three production call paths:

1. initial allocation;
2. shipment release;
3. periodic reservation revalidation.

Test-only calls are excluded.

### warehouse-dispatch Task 4 / Q9

Confirmed mandatory changes:

1. add the new `OrderType` literal;
2. update both exhaustive `Record<OrderType, ...>` maps for zone preferences and pricing;
3. add a handler module that registers the new type. The registry glob discovers the module automatically.

UI filter, seed-data and test changes are follow-up/context-dependent and are not required by the participant marking key.

### clinic-triage Task 2 / Q3

Confirmed against `src/triage/routes/loadRoutes.ts`, `src/triage/routes/registry.ts`, the route modules and `ReferralDetailPage.tsx`:

- `loadRoutes` dynamically imports route modules;
- modules register handlers keyed by referral type;
- `routeReferral` retrieves the handler using `referral.type` and invokes it.

### clinic-triage Task 3 / Q4

Confirmed exactly three production `checkEligibility` paths:

1. referral acceptance;
2. appointment booking;
3. nightly reverification of accepted/booked referrals.

### clinic-triage Task 4 / Q9

Confirmed four mandatory changes:

1. add the `ReferralType` literal;
2. add a complete `referralPolicies` entry;
3. extend `humaniseType`;
4. add a route module that registers the handler; the loader discovers it automatically.

Hardcoded filter options, styling, tests, seed data and type-specific eligibility/redaction are follow-up/context-dependent unless the scenario specifically requires them.

## Effect on the technical benchmark

The original generated Q1 answers for both repositories already described the valid `index.html` -> `src/main.tsx` startup chain. They had been marked incorrect only because of the over-narrow reference wording.

After correcting Q1 and re-marking the unchanged generated answers:

- `clinic-triage`: 12/12 correct (100.0%);
- `warehouse-dispatch`: 10/12 correct (83.3%);
- overall: 22/24 correct (91.7%).

The two remaining incorrect technical answers are warehouse Q2 and Q10. Their verdicts were not changed by this audit.

## Effect on participant P01

The corrected Q1 rule is applied retrospectively to P01 and prospectively to every later participant. P01's manual warehouse Task 1 and Codemap clinic Task 1 both satisfy the corrected entry/startup criterion.

No participant answer was edited and no participant was given additional information.

## Freeze after audit

This audit is completed before P02. From P02 onward, the participant prompts, required facts, scoring rules, repository commits and all other study procedures are frozen. Any later anomaly must be recorded as a limitation or data-quality issue rather than changing the key again.
