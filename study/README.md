# Study material

**The files in this directory support the dissertation evaluation and are not required for normal
application operation.** Nothing here is imported by `src/` or `api/`; the artefact runs without it.

## Contents

| Path | What it is |
| --- | --- |
| `PHASE3_PROTOCOL.md` | Session procedure, instruments, and the record of which build was deployed |
| `RUNNING_THE_GATE.md` | How to reproduce the accuracy gate |
| `AI-DISCLOSURE.md` | Repository-side AI record; agrees with Appendix A of the dissertation |
| `accuracy-gate.{clinic-triage,warehouse-dispatch}.json` | The run-of-record capture: questions, reference answers, generated answers, retrieved files, scores |
| `ground-truth.{clinic-triage,warehouse-dispatch}.md` | The reference answers, with status stamps |
| `marking.{clinic-triage,warehouse-dispatch}.md` | The researcher's binary verdicts, bound by hash to the capture they score |
| `answer-key.{clinic-triage,warehouse-dispatch}.json` | Participant task sets, including the seeded probe |
| `answer-key.template.json` | Shape reference for a new answer key |
| `seeded_candidates.json` | The 18 recorded gate failures; the only legitimate source of seeded items |
| `question-scores.json` | Retrieval score distribution over the 24 gate stems |
| `gate-runs/` | Repeat captures, the basis of the retrieval-determinism measurement |
| `gate-screenshots/` | One full-page screenshot per gate question |
| `second-marking.md` | Blind second marking (machine-produced; see the limitation) |
| `suggested-questions-measurement.md` | Selection of the opening suggested questions |
| `AUDIT_BRIEF.md`, `AUDIT_RESPONSE.md`, `REMEDIATION_PLAN.md` | Independent audit of the apparatus and its outcome |

## What is not here

**Participant session exports.** They are retained pseudonymised on University-managed storage,
consistent with the ethics approval, and are deliberately not published. Chapter 6 and Appendix I of
the dissertation are therefore not reproducible from this repository alone;
`analysis/analyze_sessions.py` reproduces them from the retained records.

## Files that must not be edited for style

Several files here are **data**, or are matched character by character against data. A bulk edit
over this directory is not safe. The list, and what breaks, is in
[`../analysis/README.md`](../analysis/README.md).

In short: the gate captures, the archived runs, the reference answers and the marking sheets are the
research record. Prose describing them can be corrected; they cannot be edited to match prose.

## Reproducing the gate

    npm run gate:score          # 6/24 from the marked captures
    npm run gate:compare        # retrieval determinism across repeat captures
    npm run measure:questions   # retrieval score distribution

Full procedure in `RUNNING_THE_GATE.md`.
