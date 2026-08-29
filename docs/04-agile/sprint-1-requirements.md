# Sprint 1 — Requirements and research framing

**Period:** project start to AE1 submission, 10 July 2026.
**Purpose:** establish the research problem, requirements, evaluation objectives and a bounded
artefact scope.

## Deliverables

- Literature and background review on program comprehension, onboarding and AI-assisted software
  engineering
- Problem statement and research question
- FR1–FR12 and NFR1–NFR12, each NFR carrying a measurable criterion
- Technology selection
- Risk register and milestone schedule (Appendix E)
- Evaluation concept: within-subjects, two matched repositories, four measures

## Example backlog item

    US-01
    As a developer unfamiliar with a repository,
    I want to load a public GitHub repository,
    so that I can inspect it without local setup.

    Acceptance criteria:
    - a valid public GitHub URL is accepted;
    - an unsupported or invalid repository produces an explicit error;
    - no account is required.

    Maps to: FR1, NFR1

## The decision that shaped everything after it

Every NFR was written with a criterion that could be checked, because a requirement that cannot be
checked cannot be reported against in the results chapter. NFR3 is the clearest case: "retrieval
must be deterministic" is only useful because it is followed by "the same question against the same
index returns the same files, in the same order, with the same scores", which is a thing
`analysis/compare_runs.py` can fail on.

The exception proves the rule. NFR4 asks for response performance to be instrumented but sets no
acceptance threshold, and is reported as "measured" rather than "met" — the honest status for a
requirement with no bar to clear.

## Outcome

Milestone met: AE1 Progress and Review Report submitted 10 July 2026.
