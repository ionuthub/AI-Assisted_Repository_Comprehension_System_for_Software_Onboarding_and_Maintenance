# Sprint 3 — MVP, verification and evaluation

**Period:** July to 19 August 2026.
**Purpose:** complete the intervention being measured, harden the measurement apparatus, and run
the study.

## Deliverables

- Evidence panel (FR7)
- Unverified-reference detection (FR8)
- Repository coverage reporting (FR9)
- Evaluation runner (FR11)
- JSON and CSV session export (FR12)
- Seeded inaccurate response, drawn only from recorded gate failures
- Regression testing and CI
- Accuracy gate: 24 questions across two repositories
- Participant evaluation, 12 participants
- Analysis

## Hardening the instrument before participants

The accuracy-gate harness was strengthened before any participant use. It now records the model
finish reason and rejects incomplete generations, asserts complete screenshot capture, refuses to
score unmarked questions, and binds each marking sheet by hash to the capture it was built from.
The final 24-question gate was recorded before participant sessions, and no participant data were
collected during this testing.

Three presentation defects were found and corrected before the study:

1. the interface no longer labels a retrieved-context answer as inherently "Grounded";
2. the relevance bar was recalibrated to the observed score range, so a correct top-ranked result
   no longer renders as a near-empty bar;
3. repository-path extraction was corrected, so TypeScript paths were no longer truncated and
   reported as unverified mentions against correct answers.

The third is the one worth dwelling on: the panel was accusing correct answers of citing files that
had in fact been retrieved. A reader who checked would find the file present and learn to discount
the warning; a reader who did not would distrust a sound answer. Either way the intervention was
misfiring.

## Milestones

| Milestone | Date | Status |
| --- | --- | --- |
| Ethics application submitted | 5 August 2026 | Completed |
| Study materials prepared | Early August 2026 | Completed |
| **Ethical approval received** | **13 August 2026** | Completed |
| Researcher dry runs and task refinement | Before collection | Completed |
| Data collection | to 19 August 2026 | Completed, 12 participants |
| Data analysis | August 2026 | Completed, scripted and reproducible |

No participant was approached before approval on 13 August. The only activities permitted before
that date were the accuracy gate, which involves no humans, repository selection, materials
preparation and researcher dry runs.

## A note on build stability during collection

Collection ran between 13 and 19 August. Changes to the **study runner** were made on 13 August,
before collection; the question-answering pipeline the tool condition exercises — ingestion,
retrieval, excerpt selection and the prompt — was unchanged throughout. The deployed build and the
build the accuracy gate was captured against are both recorded in `study/PHASE3_PROTOCOL.md`, which
also records why the gate figure was not re-captured after each change.
