---
name: Defect
about: Something behaves differently from the requirement
title: ''
labels: ''
---

## What happens

## What should happen

## Requirement affected

<FR / NFR id from docs/REQUIREMENTS.md>

## Could this affect a measurement?

Answer explicitly. A defect that could alter a recorded time, score, confidence rating or seeded
probe outcome is a study-validity issue, not a bug, and is handled differently: see the
retrospective in `docs/AGILE_PROCESS.md`.

## How it was found

Which gate caught it — typecheck, lint, unit, e2e, CI, review, or manual use. Worth recording:
across this project no two defect classes were caught by the same method.
