# Sprint 2 — Architecture and proof of concept

**Period:** to the feature freeze, early July 2026. Core artefact implemented June 2026.
**Purpose:** prove the pipeline end to end and fix the architecture.

## Deliverables

- GitHub ingestion with bounded fetching and recorded exclusions
- Technology detection
- Structural analysis: imports, exports, functions, components, classes
- Import graph and the most-depended-on ranking
- Repository overview
- TF-IDF index and search
- Initial grounded question answering through the edge function
- Architecture documentation
- Test plan

## Decisions taken here, and their consequences

**TF-IDF instead of learned embeddings.** This replaced the originally proposed approach. It keeps
indexing fast, local and reproducible inside a timed session, and makes the ranking inspectable —
which is what allows the evidence panel to show a score the reader can reason about. The cost is
lexical dependence, and it is a real limitation rather than a presentational one.

**The fifty-file cap.** Needed so ingestion completes inside a timed session. Its consequence runs
through the whole project: on a 150-file repository the tool sees a third, and a locating task whose
target falls outside the indexed subset tests luck rather than comprehension. That is why the study
repositories are purpose-built rather than drawn from the public shortlist, and why FR9 exists at
all.

**Public GitHub URL as the only input.** Earlier versions also accepted an uploaded archive and a
local directory, and an authentication path allowed private repositories. All were removed; see
[`product-backlog.md`](product-backlog.md).

**Feature freeze.** Taken deliberately once the core worked, so effort could move to evaluation.
The risk register names the alternative explicitly: *"Adding more features takes time from
evaluation and write-up."*

## Outcome

Milestones met: core artefact implemented June 2026; feature freeze and final feature set agreed
early July 2026.
