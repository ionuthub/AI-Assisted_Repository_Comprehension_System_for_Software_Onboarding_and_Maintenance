# Research question, aim and objectives

## Question

> How effectively can an AI-assisted repository comprehension system improve developer performance
> and reduce cognitive load when understanding an unfamiliar codebase?

**Developer performance** is operationalised as task completion time and rubric-scored task
accuracy. **Cognitive load** is operationalised as perceived workload on the Raw NASA Task Load
Index.

## Aim

To determine whether an AI-assisted repository-comprehension system can improve performance and
reduce perceived workload when users work with unfamiliar JavaScript and TypeScript repositories.

## Objectives

1. Review sources on software comprehension, onboarding and AI-assisted software engineering.
2. Design and build a web-based system that analyses JavaScript and TypeScript repositories.
3. Implement the core features: repository overview with technology detection, natural-language
   code search using TF-IDF, grounded question answering, and a verification layer that shows the
   evidence each answer rests on.
4. Run a controlled experiment comparing manual exploration with the tool.
5. Measure task completion time, task accuracy, perceived workload and usability.
6. Examine whether participants detect and correct a deliberately inaccurate tool response.
7. Critically evaluate the tool's effectiveness and its limitations.

## Hypotheses

| | |
| --- | --- |
| H1 | Task completion time is lower with the tool |
| H2 | Task accuracy is higher with the tool |
| H3 | Perceived workload is lower with the tool |
| H4 | Tool-condition usability exceeds the conventional SUS reference value of 68 |

Objective 6 is deliberately not framed as a hypothesis. It asks a descriptive question — do people
notice, and if they notice do they recover — and the answer turned out to distinguish those two
behaviours.

## The gap this addresses

Most empirical work on AI assistance in software engineering examines code *generation*. There is
little controlled evidence on repository-level *comprehension*, and generated explanations may be
incomplete or wrong. The problem is therefore twofold: comprehension imposes substantial effort on
newcomers, and it is unclear whether AI assistance reduces that effort without introducing new
verification risks. The study measures both halves.
