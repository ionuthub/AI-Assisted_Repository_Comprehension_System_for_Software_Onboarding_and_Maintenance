# Participant usability testing guide

This is the fixed procedure for Stage 2 of the final evaluation.

## Sample and assignment

- Recruit a minimum of 12 participants with programming experience under the approved ethics procedure.
- Use pseudonymous IDs only: `P01`, `P02`, `P03`, and so on.
- Balance the two repositories by alternating assignment:
  - odd participant IDs -> `warehouse-dispatch`
  - even participant IDs -> `clinic-triage`
- With 12 participants this gives 6 participants per repository. If more participants are recruited, continue alternating.

## Before each session

1. Complete the approved participant-information and consent process. Do not replace the approved ethics wording with text from this repository.
2. Use the same browser/device setup where practical and ensure the internet connection is stable.
3. Open the production Codemap study route at `/study`.
4. Enter the participant ID, select the participant's programming-experience band, and select the assigned repository.
5. Select **Prepare session**.
6. Open Codemap in the second tab, analyse the repository shown by the study runner, and wait until the workspace is ready.
7. Do not inspect the repository or answer any study task before selecting **Begin timed tasks**.

## Instructions to give every participant

Use only Codemap during the four timed tasks. You may use any feature available inside Codemap. Do not open the repository directly on GitHub, use search engines, other AI tools, IDEs, or ask another person for help. Write your own answer in the study page. If you cannot answer a task, use **Unable to answer / skip**. The researcher cannot help with the answer or suggest which feature to use.

## Timed tasks

Each participant receives four tasks in the same order:

1. project orientation and startup flow;
2. type-specific processing;
3. cross-cutting behaviour;
4. change-impact reasoning.

The timer starts when **Begin timed tasks** is selected. Each task timer stops when the participant submits the answer or skips the task. Submitted answers cannot be edited.

## After the four tasks

1. The participant completes all 10 System Usability Scale (SUS) items using the 1-5 response scale shown in the runner.
2. The participant answers the three short questions:
   - What helped you understand the repository?
   - What was difficult or confusing?
   - What would you improve?
3. Select **Export participant data**.
4. Store the exported JSON securely using its generated pseudonymous filename. Do not commit participant data to the public repository.

## Marking

Mark responses after the participant session, not while the participant is working.

Use the repository-specific answer key:

- `participant-answer-key.warehouse-dispatch.json`
- `participant-answer-key.clinic-triage.json`

Each task is marked `correct` or `incorrect`; no partial credit is used. A response is correct only when it contains the required material facts without a material contradiction. A skipped task is recorded as `completed = false` and is not correct.

For the cross-cutting task, all three production paths are required. Missing one path is incorrect.

For change-impact tasks, use only the mandatory facts in `requiredFacts`; optional UI/test/seed follow-up details are not required unless explicitly listed there.

## Measures to report

For each participant retain:

- assigned repository;
- programming-experience band;
- task completion (`completed`);
- binary task correctness;
- task duration in seconds;
- SUS score;
- the three short qualitative responses.

For the dissertation, report at minimum:

- number of participants and repository split;
- task completion/success rate;
- task correctness rate;
- task-time summary (median is preferred for a small sample; mean may also be shown);
- SUS summary;
- concise themes from the three open-ended questions.

Task success should be defined consistently as a task that was both completed and marked correct.

## Do not change after Participant 1

Once data collection begins, do not change the task wording, task order, answer keys, scoring rules, repository commits, or participant instructions. If a technical failure makes a session unusable, record the incident separately rather than altering the protocol mid-study.
