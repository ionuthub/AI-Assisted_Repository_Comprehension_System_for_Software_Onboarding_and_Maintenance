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
unverified. See [`03-architecture/verification-layer.md`](03-architecture/verification-layer.md) for
what that does and does not establish.

## Scope

Initial comprehension of small- to medium-sized JavaScript and TypeScript repositories, particularly
React applications. **Long-term software maintenance and implementation of code changes are outside
the evaluated scope.** Two features, a separate onboarding path and a maintenance mode, were removed
rather than deferred, because no objective measure was defined for either; see
[`04-agile/product-backlog.md`](04-agile/product-backlog.md).

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
[`06-research/results-summary.md`](06-research/results-summary.md).

## How to check the claims

| Question | Where to look |
| --- | --- |
| What was required? | [`02-requirements/`](02-requirements/) — FR1–FR12, NFR1–NFR12, and a traceability matrix to code and tests |
| How is it built? | [`03-architecture/`](03-architecture/) and `docs/figure1_architecture.png` |
| How was it developed? | [`04-agile/`](04-agile/) |
| How was it tested? | [`05-testing/`](05-testing/) |
| How was it evaluated? | [`06-research/`](06-research/), `study/PHASE3_PROTOCOL.md` |
| What was measured, and on what build? | `study/accuracy-gate.*.json`, `study/gate-runs/`, `study/PHASE3_PROTOCOL.md` |
| What AI was used? | `study/AI-DISCLOSURE.md`, and Appendix A of the dissertation |

## Provenance of this documentation

Everything under `docs/` was written **after** the study, in August 2026, to make the repository
legible to an assessor. It is a retrospective description, not a contemporaneous development
record, and the agile documents say so explicitly where they reconstruct a phase.

The architecture documents are an exception in one respect: they were derived by reading the source
at the frozen commit rather than from prose, and every claim carries a file and line citation. That
verification pass is recorded in [`figure1_provenance.md`](figure1_provenance.md), including the
three claims that came back only partly true.
