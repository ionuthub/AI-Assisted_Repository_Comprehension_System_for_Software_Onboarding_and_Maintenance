# Archived project overview

This file is kept as a short retrospective. The current entry point is the repository [`README.md`](../../README.md).

## Research question

> How effectively can an AI-assisted repository comprehension system improve developer performance and reduce cognitive load when understanding an unfamiliar codebase?

Performance was measured with task time and rubric-scored accuracy. Workload was measured with Raw NASA-TLX.

## Artefact

The browser tool accepts a public GitHub URL, analyses JavaScript and TypeScript files, builds a TF-IDF index and supports overview, search, file inspection and grounded question answering.

The evidence panel shows retrieved files and excerpts beside each generated answer. It also flags file paths mentioned by an answer that were not retrieved. This helps checking but does not prove correctness.

## Scope

The study covers initial comprehension of small to medium JavaScript and TypeScript repositories. Long-term maintenance and implementation of code changes are outside scope.

## Main findings

The study used 12 participants.

- Workload was lower with the tool.
- The task-time result was inconclusive.
- Accuracy did not improve reliably.
- SUS above 68 was not established.
- 7 of 12 participants detected the seeded inaccurate answer and 5 corrected it.

Exact statistics are in Chapter 6 of the dissertation.

## Current documentation

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../REQUIREMENTS.md`](../REQUIREMENTS.md)
- [`../TESTING.md`](../TESTING.md)
- [`../LIMITATIONS.md`](../LIMITATIONS.md)
- [`../../study/AI-DISCLOSURE.md`](../../study/AI-DISCLOSURE.md)
