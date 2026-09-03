# Final evaluation protocol

## Evaluated artefact

The technical evaluation uses artefact commit `85ab075065732b3652acabf8f67d2cee33e14d6f` and two purpose-built JavaScript/TypeScript repositories:

- `clinic-triage` at `67d7a5a0c37452946876b0e7626b6c882888d4f0`
- `warehouse-dispatch` at `937be9d5598f81703e95c1a3ce2a2ec234287ee9`

## Stage 1: technical evaluation

### Software verification

The final artefact is checked through TypeScript, ESLint, unit tests, production build and Playwright end-to-end tests.

### Answer-reliability gate

The system is evaluated using 24 predefined repository-comprehension questions, 12 per repository. The questions cover orientation, configuration-driven behaviour, handler or route selection, cross-cutting concerns, request pipelines, legacy paths, events, special cases and change-impact reasoning.

Each generated answer is compared with the corresponding reference answer in `ground-truth.*.md`. Marking is binary: `correct` or `incorrect`. No partial credit is awarded. The researcher makes the final verdict.

Final technical result:

- `clinic-triage`: 11/12 correct
- `warehouse-dispatch`: 9/12 correct
- overall: 20/24 correct (83.3%)

## Stage 2: usability validation

The participant stage is supplementary to the technical benchmark. A minimum of 12 participants with programming experience will be recruited.

The study runner is available at `/study`. It is not linked from the normal product navigation. The runner contains task prompts only; reference answers are not shown to participants or embedded in the participant interface.

Before the timed tasks begin, the researcher loads the assigned repository in Codemap and waits for analysis to complete. The participant then completes four tasks while using the artefact. Task timing starts when the first task is revealed and each task timer stops when its written answer is submitted.

### Participant tasks

The four tasks reuse questions already verified in the 24-question technical benchmark.

For `warehouse-dispatch`:

1. **Project orientation:** Where does execution start in this project? Describe the startup flow.
2. **Type-specific processing:** Which code decides how a given order type is processed? Explain how the correct handler is selected.
3. **Cross-cutting behaviour:** Stock is reserved in more than one place in this codebase. Find every production place where it happens. Test files do not count.
4. **Change-impact reasoning:** A new order type is to be added. Where would you add it, and what else would need to change for the application to work?

For `clinic-triage`:

1. **Project orientation:** Where does execution start in this project? Describe the startup flow.
2. **Type-specific processing:** Which code decides how a given referral type is processed? Explain how the correct route handler is selected.
3. **Cross-cutting behaviour:** Eligibility is checked in more than one place in this codebase. Find every production place where it happens. Test files do not count.
4. **Change-impact reasoning:** A new referral type is to be added. Where would you add it, and what else would need to change for the application to work?

For each task, the runner records whether an answer was submitted and the completion time. The researcher subsequently marks each written answer `correct` or `incorrect` against the verified reference answer used in the technical benchmark. No automated correctness score or participant-facing feedback is produced during the session.

After the four tasks, participants complete the 10-item System Usability Scale (SUS) and three open-ended questions:

1. What helped you understand the repository?
2. What was difficult or confusing?
3. What would you improve?

The runner exports one pseudonymised JSON record containing the participant ID, assigned repository, task responses and timings, SUS responses and score, and the three open-ended responses. Names and email addresses are not collected.

The participant stage is descriptive. It is intended to assess usability and task completion, not to establish a causal claim that the artefact makes developers faster than alternative methods.

Participant testing must only proceed if this revised protocol is covered by the applicable ethics approval or an approved amendment. Participant data will be stored pseudonymised and will not be published in this repository.
