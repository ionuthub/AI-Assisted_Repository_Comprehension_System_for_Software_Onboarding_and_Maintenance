# Final evaluation protocol

## Evaluated artefact

The technical evaluation uses artefact commit `85ab075065732b3652acabf8f67d2cee33e14d6f` and two purpose-built JavaScript/TypeScript repositories:

- `clinic-triage` at `67d7a5a0c37452946876b0e7626b6c882888d4f0`
- `warehouse-dispatch` at `937be9d5598f81703e95c1a3ce2a2ec234287ee9`

## Stage 1: technical evaluation

### Software verification

The final artefact is checked through TypeScript, ESLint, unit tests, production build and Playwright end-to-end tests.

### Answer-reliability gate

The system is evaluated using 24 predefined repository-comprehension questions, 12 per repository. Each generated answer is compared with the corresponding reference answer in `ground-truth.*.md`. Marking is binary: `correct` or `incorrect`; no partial credit is awarded.

Final technical result:

- `clinic-triage`: 11/12 correct
- `warehouse-dispatch`: 9/12 correct
- overall: 20/24 correct (83.3%)

## Stage 2: comparative participant evaluation

A minimum of 12 current Year 3 Computer Science students are recruited under the approved ethics procedure. Participants use pseudonymous IDs (`P01`, `P02`, etc.). No names, email addresses, demographic variables or programming-experience variables are collected by the runner.

The participant evaluation uses a within-subject design. Every participant completes both a manual repository-inspection condition and a Codemap condition. To avoid exposing the same repository twice to the same participant, the two conditions use different repositories. Repository-condition pairing and condition order are balanced through four sequences:

- **A:** manual `warehouse-dispatch` -> Codemap `clinic-triage`
- **B:** Codemap `clinic-triage` -> manual `warehouse-dispatch`
- **C:** manual `clinic-triage` -> Codemap `warehouse-dispatch`
- **D:** Codemap `warehouse-dispatch` -> manual `clinic-triage`

A blocked randomisation schedule is fixed before data collection. Each block of four contains A, B, C and D once. With 12 participants, each sequence is therefore used three times, each repository appears six times in each condition, and manual/Codemap order is balanced six-to-six.

### Conditions

**Manual condition.** The participant uses only the GitHub web interface for the assigned repository, including normal file navigation and GitHub's built-in code search. Codemap, other AI tools, IDEs and external search engines are not permitted.

**Codemap condition.** The assigned repository is analysed in Codemap before timing begins. During the timed tasks the participant uses only Codemap. Direct GitHub browsing, other AI tools, IDEs and external search engines are not permitted.

The researcher does not coach the participant or suggest which files, searches or Codemap features to use.

### Tasks

Each condition contains four fixed repository-comprehension tasks, in the same category order:

1. project orientation and startup flow;
2. type-specific processing;
3. cross-cutting behaviour;
4. change-impact reasoning.

The repository-specific prompts reuse Q1, Q3, Q4 and Q9 from the verified technical benchmark. For each task, the runner records completion status, written response and completion time. The researcher marks each response after the session against the corresponding `participant-answer-key.*.json` file using binary `correct`/`incorrect` scoring with no partial credit.

### Performance measures

For each participant and each condition, the study retains:

- number of correctly answered tasks out of four;
- task-success rate, where success requires both completion and correctness;
- individual task times and total time across the four tasks.

Because every participant completes both conditions, manual and Codemap performance can be compared within participant rather than between separate groups.

### NASA-TLX

Immediately after each condition, the participant completes the six Raw NASA-TLX dimensions:

- Mental Demand;
- Physical Demand;
- Temporal Demand;
- Performance;
- Effort;
- Frustration.

Each dimension is rated from 0 to 100 in 5-point increments. The unweighted Raw NASA-TLX score is the arithmetic mean of the six ratings. Higher scores indicate greater perceived workload. NASA-TLX is used as the study's operational measure of workload associated with repository-comprehension activity.

### SUS and qualitative feedback

After both conditions, the participant completes the 10-item System Usability Scale (SUS), explicitly referring only to Codemap. SUS is scored using the standard 0-100 transformation and is not interpreted as a percentage.

The participant then answers three short questions:

1. What helped you understand the repository when using Codemap?
2. What was difficult or confusing when using Codemap?
3. Compared with manual browsing, which approach did you prefer and why?

### Analysis

The primary comparison is paired within participant:

- Codemap versus manual task correctness;
- Codemap versus manual task time;
- Codemap versus manual Raw NASA-TLX workload.

Descriptive statistics are reported for both conditions, together with paired differences. SUS and qualitative feedback provide supplementary usability evidence for Codemap. Findings are limited to the Year 3 Computer Science student population and the two study repositories.

The runner exports one pseudonymised JSON record containing the participant ID, randomisation sequence, both condition records, task responses and timings, Raw NASA-TLX responses and scores, Codemap SUS responses and score, and the three qualitative responses. Participant data is stored separately and is not committed to the public repository.

The detailed session procedure and marking rules are fixed in `PARTICIPANT_TESTING_GUIDE.md`. Participant testing proceeds under the confirmed applicable ethics approval.
