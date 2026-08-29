# Project overview

Entry point for reading this repository. It states what the project is, what it found, and where
each claim can be checked.

## The problem

Developers routinely work with code they did not write. Before they can reason safely about it they
must build a mental model of its architecture, components and dependencies, and that is hardest
when documentation is absent or stale. A large field study found professional developers spend
around 58% of their time on program comprehension (Xia et al. 2018), and newcomers face a specific
difficulty in working out where to begin (Steinmacher et al. 2015).

Most empirical work on AI assistance has looked at code *generation* rather than repository-level
*comprehension*. So it remains unclear whether AI assistance reduces the effort of understanding an
unfamiliar repository, and whether it introduces new verification risks when the generated
explanation is wrong.

## Research question

> How effectively can an AI-assisted repository comprehension system improve developer performance
> and reduce cognitive load when understanding an unfamiliar codebase?

Developer performance is operationalised as task completion time and rubric-scored task accuracy.
Cognitive load is operationalised as perceived workload on the Raw NASA-TLX.

## The artefact

A browser-based research artefact for understanding unfamiliar JavaScript and TypeScript
repositories. It accepts a public GitHub URL and, in the browser, ingests files, detects
technologies, extracts structure, builds a TF-IDF index, and supports overview, search, file
inspection and grounded question answering. Only the question and the selected excerpts leave the
browser, through a Vercel edge function that holds the model credential.

The intervention the study measures is the **verification layer**: every answer is shown beside the
evidence it was built from, and paths the answer names that retrieval did not return are listed as
unverified. See [`ARCHITECTURE.md`](ARCHITECTURE.md#the-verification-layer) for
what that does and does not establish.

## Scope

Initial comprehension of small- to medium-sized JavaScript and TypeScript repositories, particularly
React applications. **Long-term software maintenance and implementation of code changes are outside
the evaluated scope.** Two features, a separate onboarding path and a maintenance mode, were removed
rather than deferred, because no objective measure was defined for either; see
[`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md).

## What the study found

Twelve participants, within-subjects, matched comprehension tasks in manual and tool conditions on
two purpose-built repositories.

- **Perceived workload fell** — the clearest result, supporting H3.
- **Completion time** was lower with the tool but the paired difference was **inconclusive**.
- **Task accuracy** did not improve reliably.
- **Usability** did not establish SUS above the conventional reference value of 68.
- On the seeded inaccurate answer, **7 of 12 detected it and 5 corrected it** — detection and
  recovery are distinct behaviours.

Exact statistics live in Chapter 6 of the dissertation and are reproduced from the retained records
by `analysis/analyze_sessions.py`. They are deliberately **not** duplicated here: a number copied
into two places drifts, and the report is the authoritative one. See
[`TESTING.md`](TESTING.md) section C.

## How to check the claims

| Question | Where to look |
| --- | --- |
| What was required? | [`REQUIREMENTS.md`](REQUIREMENTS.md) and [`TRACEABILITY_MATRIX.md`](TRACEABILITY_MATRIX.md) |
| How is it built? | [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`figure1_architecture.png`](figure1_architecture.png) |
| How was it developed? | [`AGILE_PROCESS.md`](AGILE_PROCESS.md) and [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) |
| How was it tested? | [`TESTING.md`](TESTING.md) and [`LIMITATIONS.md`](LIMITATIONS.md) |
| How was it evaluated? | [`TESTING.md`](TESTING.md) section C, and `study/PHASE3_PROTOCOL.md` |
| What was measured, and on what build? | `study/accuracy-gate.*.json`, `study/gate-runs/`, `study/PHASE3_PROTOCOL.md` |
| What AI was used? | [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md) |

## Provenance of this documentation

Everything under `docs/` was written **after** the study, in August 2026, to make the repository
legible to an assessor. It is a retrospective description, not a contemporaneous development
record, and the agile documents say so explicitly where they reconstruct a phase.

The architecture documents are an exception in one respect: they were derived by reading the source
at the frozen commit rather than from prose, and every claim carries a file and line citation. That
verification pass is recorded in [`figure1_provenance.md`](figure1_provenance.md), including the
three claims that came back only partly true.
