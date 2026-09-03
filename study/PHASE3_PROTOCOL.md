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

Each generated answer is compared with the corresponding reference answer in `ground-truth.*.md`. Marking is binary: `correct` or `incorrect`. No partial credit is awarded. Notes in the ground-truth files provide context but are not part of the required answer standard. The researcher makes the final verdict.

Final technical result:

- `clinic-triage`: 11/12 correct
- `warehouse-dispatch`: 9/12 correct
- overall: 20/24 correct (83.3%)

## Stage 2: usability validation

The participant stage is supplementary to the technical benchmark. A minimum of 12 participants with programming experience will be recruited.

Each participant will use the artefact on an unfamiliar study repository and complete four representative comprehension tasks covering:

1. project orientation and execution flow;
2. type-specific processing;
3. a cross-cutting behaviour;
4. change-impact reasoning.

For each task, completion, answer correctness and completion time will be recorded. Participants will then complete the System Usability Scale (SUS) and three short open-ended questions about what helped, what was difficult and what they would improve.

The participant stage is descriptive. It is intended to assess usability and task completion, not to establish a causal claim that the artefact makes developers faster than alternative methods.

Participant testing must only proceed if this revised protocol is covered by the applicable ethics approval or an approved amendment. Participant data will be stored pseudonymised and will not be published in this repository.
