# Results summary

**Chapter 6 of the dissertation is authoritative.** The exact statistics are deliberately not
duplicated here: a number copied into two places drifts, and this repository is the wrong home for
the canonical figure. This file records the shape of the findings and where each is reproduced from.

## Headline

| | Outcome |
| --- | --- |
| **H3 — perceived workload** | **Supported.** Median workload fell substantially with the tool, with a large effect size. The clearest result in the study |
| **H1 — completion time** | **Inconclusive.** Median time was lower with the tool, but the paired difference did not reach significance |
| **H2 — task accuracy** | **Not supported.** Accuracy did not improve reliably |
| **H4 — usability** | **Not established.** Tool-condition SUS did not exceed the conventional reference value of 68 |
| **Seeded inaccurate answer** | **7 of 12 detected it; 5 corrected it** |

## What the seeded probe showed

This is the finding that most directly concerns the artefact's central feature. Participants were
warned in advance that some responses might be inaccurate, and were prompted directly. Under those
conditions, just over half detected the planted error, and fewer than half recovered the correct
answer from the repository.

**Detecting an inaccurate AI response and recovering the correct evidence are distinct
behaviours.** Showing a reader the evidence supports the first more than the second. That is a
result about the intervention, not a caveat about it, and it is the strongest argument in the study
for treating generated answers as claims to check rather than answers to use.

## The tool's own accuracy

The pre-study gate scored **6 of 24 (25%)** on questions written to have complete answers, marked
on a binary rubric with no partial credit. Several questions asserted that a declared behaviour
never reaches the running application — something a tool retrieving three excerpts cannot
establish. The figure is reported rather than designed around; the protocol required it to be
discussed with the supervisor before proceeding, and it was.

## How each figure is reproduced

| Figure | Script | Source |
| --- | --- | --- |
| H1–H4, effect sizes, confidence-accuracy gap, seeded counts | `analysis/analyze_sessions.py` | Retained session exports, on University-managed storage |
| Accuracy gate 6/24 | `analysis/accuracy_gate.py` | `study/accuracy-gate.*.json`, marked in `study/marking.*.md` |
| Retrieval score distribution | `analysis/score_questions.mjs` | The committed retrieval modules against the gate stems |
| Retrieval determinism | `analysis/compare_runs.py` | `study/gate-runs/` |
| Repository matching | `analysis/verify_study_repos.py` | The two study repositories |

Session exports are not in this repository, by design: the ethics approval retains them
pseudonymised on University-managed storage. Chapter 6 is therefore not reproducible from this
repository alone, and Appendix I reproduces the participant-level data in the report itself.

## Reading this honestly

The study found one clear benefit and three results that do not support their hypotheses. The
temptation in a dissertation artefact is to present the tool as working; what the evidence supports
is narrower — it reduced how hard the work felt, without demonstrating that people were faster or
more accurate, and without showing that seeing the evidence reliably led people to correct a wrong
answer.
