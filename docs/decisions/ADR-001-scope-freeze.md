# ADR-001 — Freeze the feature set before evaluation

**Status:** Accepted · **Date:** early July 2026 · **Recorded retrospectively:** August 2026

## Context

The project had a working core by June 2026: ingestion, structural analysis, TF-IDF retrieval, a
repository overview and initial grounded question answering. It also had a fixed deadline, a
participant study that had not yet been designed in detail, and an ethics application not yet
submitted.

The risk register carried the tension explicitly: *"Adding more features takes time from evaluation
and write-up — Medium / high."* Two features were live candidates: a **maintenance workflow** that
would help a developer change code, and a **separate onboarding path** distinct from the general
comprehension flow. Two ingestion routes also existed but were unused by any planned measurement:
uploaded archives and local directories, plus an authentication path for private repositories.

## Decision

Freeze the feature set. Build no further features. Remove, rather than defer, anything the study
could not score or would not exercise:

- the maintenance workflow;
- the separate onboarding path;
- archive and local-directory ingestion;
- private-repository authentication.

Descope the interactive dependency graph to a ranked list, which delivers the comprehension value
FR4 needs without the interaction cost.

## Rationale

**A feature the study cannot score adds risk without adding evidence.** No objective measure was
defined for either the maintenance workflow or the separate onboarding path. Shipping them would
have produced a larger artefact and an identical set of findings, while consuming the time the
evaluation needed.

**Every ingestion route is a route that must be tested, described and reasoned about.** The study
uses public repositories exclusively, so neither archive nor local ingestion was exercised by any
measurement. Each was a second path through the most defect-prone part of the system.

**Removing authentication removed a whole category of obligation.** The private-repository path
required a third-party identity service the project needed for nothing else. Without it the
artefact stores no user accounts and no personal data of any kind, which materially simplifies the
data-protection position.

## Consequences

**Accepted.** The tool is narrower: it cannot read a private repository, or code that is not on
GitHub. The dissertation title and scope exclude long-term maintenance, because the artefact does
not implement it and the study therefore does not claim it.

**Gained.** Effort moved to evaluation: the accuracy gate, the study runner, the seeded probe and
the participant sessions. The evaluated artefact is a smaller, fully exercised system rather than a
larger, partly exercised one.

**Also gained, unintentionally.** A single input path made the frozen build far easier to describe
accurately. The architecture documentation has one ingestion route to verify, not four.

## Revisiting

The dissertation's recommendations set out the conditions for reintroducing what was removed:
archive ingestion through the unified pipeline, and private repositories through a user-supplied
token rather than a hosted identity service. Both would need an objective measure defined before
implementation, which is the test this decision applied and they failed.
