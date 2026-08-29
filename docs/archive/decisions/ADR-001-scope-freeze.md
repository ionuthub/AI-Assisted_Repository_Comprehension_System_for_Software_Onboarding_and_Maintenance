# ADR-001: Freeze the feature set before evaluation

**Status:** Accepted  
**Decision date:** early July 2026  
**Recorded:** August 2026

## Context

The core artefact was working, but the participant study and write-up still needed time. Several extra features were not part of any planned measurement.

## Decision

Freeze the feature set and remove work that the study would not test:

- maintenance workflow;
- separate onboarding mode;
- local folder and archive ingestion;
- private-repository authentication.

The interactive dependency graph was reduced to a ranked list.

## Reason

A feature with no study measure adds implementation and testing risk without adding research evidence. The study used public repositories, so extra ingestion and authentication paths were unnecessary.

## Consequences

The final tool is narrower, but easier to evaluate and describe accurately. It supports public GitHub repositories and initial comprehension only.

Future work may revisit private repositories, archive ingestion and richer dependency analysis if clear evaluation measures are defined first.
