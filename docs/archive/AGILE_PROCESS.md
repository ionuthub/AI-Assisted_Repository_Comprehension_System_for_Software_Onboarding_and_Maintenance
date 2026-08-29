# Agile-inspired iterative development

**This is a retrospective record, written in August 2026 after the study.** The project used
agile-inspired iterative development, not formal Scrum: there were no daily stand-ups, no sprint
tickets and no burndown charts, and none are invented here. What is reconstructed is real — the
phase boundaries are the milestones the project actually hit, recorded in Appendix E of the
dissertation, and every backlog item maps to a feature that exists, was descoped, or was removed
for a stated reason.

Backlog: [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md). Scope decision:
[`decisions/ADR-001-scope-freeze.md`](decisions/ADR-001-scope-freeze.md).

## Sprint 1 — Scope and requirements

**Goal.** Define the repository-comprehension problem and freeze a measurable feature set.

**Outputs**

- Research question, aim and objectives
- FR1–FR12 and NFR1–NFR12, each NFR carrying a criterion that can be checked
- JavaScript/TypeScript scope
- Public GitHub URL as the only input
- Initial repository overview
- Exclusion of maintenance mode
- Initial evaluation design: within-subjects, two matched repositories, four measures

**Milestone.** AE1 Progress and Review Report submitted 10 July 2026.

Every NFR was written with a criterion, because a requirement that cannot be checked cannot be
reported against in the results chapter. NFR3 is the clearest case: "retrieval must be
deterministic" is only useful because it is followed by "the same question against the same index
returns the same files, in the same order, with the same scores" — something
`analysis/compare_runs.py` can fail on. The exception proves it: NFR4 asks for performance to be
instrumented but sets no threshold, and is reported as *measured* rather than *met*.

## Sprint 2 — Core artefact

**Goal.** Build the minimum artefact capable of supporting repository-comprehension tasks.

**Outputs**

- GitHub ingestion with bounded fetching and recorded exclusions
- Technology detection
- File inventory and repository overview
- Structural parser: imports, exports, functions, components, classes
- Import relationships and the most-depended-on ranking
- TF-IDF indexing and search
- File viewer

**Milestone.** Core artefact implemented June 2026.

Two decisions taken here shaped everything after. **TF-IDF replaced the originally proposed learned
embeddings**, keeping indexing fast, local and reproducible inside a timed session and making the
ranking inspectable — which is what lets the evidence panel show a score a reader can reason about.
**The fifty-file cap** was needed so ingestion completes inside a session, and its consequence runs
through the whole project: on a 150-file repository the tool sees a third, which is why the study
repositories are purpose-built and why FR9 exists.

## Sprint 3 — AI, evidence and verification

**Goal.** Add repository-grounded question answering while keeping generated claims inspectable.

**Outputs**

- Top-three retrieval with query-relevant excerpts
- Gemini access through a Vercel edge function, credential server-side
- Evidence panel: files in rank order, scores, line ranges, the excerpt actually sent
- Unverified-path detection
- Repository coverage reporting
- Security controls: origin allowlist, request validation, context clamp, rate limiting

**Milestone.** Feature freeze and final feature set agreed, early July 2026.

The evidence panel is the intervention the study measures, so it had to be right before anything
could be measured with it. Three presentation defects were found and corrected before participants:
the interface no longer labels a retrieved-context answer as inherently "Grounded"; the relevance
bar was recalibrated to the observed score range; and repository-path extraction was corrected so
TypeScript paths were no longer truncated and reported as unverified against correct answers.

## Sprint 4 — Evaluation and hardening

**Goal.** Freeze the artefact and validate it before participant evaluation.

**Outputs**

- Study runner: condition, order, timing, answers, confidence, rubric marks
- JSON and CSV session export
- NASA-TLX and SUS
- Seeded inaccurate response, drawn only from recorded gate failures
- Unit, end-to-end, type, lint and production-build checks in CI
- Regression fixes
- 24-question accuracy gate
- Participant study

**Milestones**

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

## Definition of done

Stricter than "it works", because the artefact is a measuring instrument: a defect that survives
into a session does not inconvenience a user, it contaminates a measurement that cannot be retaken.

A feature was done when:

1. the implementation was present in the frozen build;
2. TypeScript type checking passed across the whole project (`tsc -b`, not one project);
3. linting passed;
4. relevant unit tests existed, with end-to-end coverage where the feature spans pages;
5. failure states were handled and surfaced rather than swallowed;
6. the feature could be exercised through the **deployed** artefact, not only locally;
7. its behaviour matched the relevant FR or NFR;
8. research-critical functionality produced auditable output;
9. no known defect remained that could invalidate a participant measurement.

Clauses 2 and 6 were added because something got through. A single-project typecheck passed while
four type errors sat outside its references. And for five weeks CI never ran at all, because the
workflow targeted a Node version the test runner refused — every local gate was green throughout.

## Retrospective

**What worked.** The feature freeze was named as a risk and then actually held; two features were
removed rather than deferred and the effort went to evaluation. Writing a checkable criterion into
every NFR made Chapter 6 possible and made two requirements report honestly as *partly met* and
*measured*. Hardening the gate harness before participants caught problems that would otherwise
have surfaced as unexplainable numbers.

**What did not.** Seven defect classes were found during development and **no two were caught by
the same method**. The most serious — a file cache keyed by path alone, serving one study
repository's contents under the other's filename — was found by a person switching repositories,
not by the tests, the typecheck, the linter, the build, code review or CI. In a study measuring
whether participants detect incorrect output, that defect manufactures the very failure being
observed.

Documentation also lagged the code by months. The architecture description had to be derived by
reading the source rather than written from memory, and that pass found three claims in the drafted
description that were wrong or only partly true.

**What to do differently.** Verify that an instrument reports, not just that it is configured.
Write the architecture description from the source and date it. Record the deployed commit at the
moment of each capture rather than inferring it later. Treat any defect that could alter a
measurement as a study-validity issue rather than a bug.
