# Participant comparative testing guide

This is the fixed procedure for Stage 2 of the final evaluation.

## Sample

- Recruit a minimum of 12 current Year 3 Computer Science students under the approved ethics procedure.
- Confirm eligibility during recruitment.
- Use pseudonymous IDs only: `P01`, `P02`, `P03`, and so on.
- Do not collect names, email addresses or additional demographic information in the runner.

## Assignment

The runner assigns each participant automatically from a fixed balanced randomisation schedule. Do not manually select a repository or condition order.

The four possible sequences are:

- A: manual `warehouse-dispatch` -> Codemap `clinic-triage`
- B: Codemap `clinic-triage` -> manual `warehouse-dispatch`
- C: manual `clinic-triage` -> Codemap `warehouse-dispatch`
- D: Codemap `warehouse-dispatch` -> manual `clinic-triage`

For 12 participants, each sequence is used three times. Do not change the allocation schedule once data collection starts.

## Before each session

1. Complete the approved participant-information and consent process.
2. Confirm that the participant is a current Year 3 Computer Science student.
3. Use the same browser/device setup where practical and ensure the internet connection is stable.
4. Open `/study`.
5. Enter only the participant ID and select **Prepare session**.
6. Follow the preparation screen for Condition 1.

## Manual condition

The participant uses only the assigned repository on GitHub.

Allowed:

- normal GitHub file/folder navigation;
- GitHub's built-in code search.

Not allowed:

- Codemap;
- other AI tools;
- an IDE;
- external search engines;
- help from another person.

Open the assigned repository before the tasks begin. Do not reveal or discuss the task answers. Select **Begin timed tasks** only when the participant is ready.

## Codemap condition

Before timing begins:

1. Open Codemap in a second tab.
2. Analyse the repository shown by the study runner.
3. Wait until the Codemap workspace is ready.
4. Do not begin answering study tasks during preparation.

During the timed tasks the participant uses only Codemap. Direct GitHub browsing, other AI tools, IDEs, external search engines and help from another person are not permitted.

## Timed tasks

Each condition contains four tasks in the same category order:

1. project orientation and startup flow;
2. type-specific processing;
3. cross-cutting behaviour;
4. change-impact reasoning.

The participant writes each answer directly into the study page. The timer for a task stops when the participant submits it or selects **Unable to answer / skip**. Submitted answers cannot be edited.

The researcher must not coach the participant, suggest a file, suggest a search term, or suggest which Codemap feature to use.

## NASA-TLX after each condition

Immediately after each set of four tasks, the participant completes the six Raw NASA-TLX scales shown in the runner:

- Mental Demand;
- Physical Demand;
- Temporal Demand;
- Performance;
- Effort;
- Frustration.

Each scale uses 0-100 in 5-point increments. The participant should answer based only on the condition they have just completed. The runner calculates the unweighted Raw NASA-TLX mean automatically.

After the first NASA-TLX, follow the preparation screen for Condition 2 and repeat the same procedure.

## After both conditions

1. Complete all 10 SUS items, thinking only about Codemap.
2. Answer the three short questions:
   - What helped you understand the repository when using Codemap?
   - What was difficult or confusing when using Codemap?
   - Compared with manual browsing, which approach did you prefer and why?
3. Select **Export participant data**.
4. Store the exported JSON securely. Do not commit participant data to the public repository.

## Marking

Mark answers after the participant has finished the complete session.

Use the repository-specific answer keys:

- `participant-answer-key.warehouse-dispatch.json`
- `participant-answer-key.clinic-triage.json`

The same answer key is used whether that repository was completed manually or with Codemap.

The participant task numbers are **not** the same as the technical benchmark question numbers. Use this fixed mapping:

| Participant task | Technical benchmark source |
| --- | --- |
| Task 1 — orientation | Q1 |
| Task 2 — type-specific processing | Q3 |
| Task 3 — cross-cutting behaviour | Q4 |
| Task 4 — change-impact reasoning | Q9 |

Do not compare Participant Task 2 with technical Q2. The repository-specific participant answer-key JSON is the marking source of truth.

Each task is marked `correct` or `incorrect`; no partial credit is used. A skipped task is not correct. Equivalent wording is accepted when the material facts are present and there is no material contradiction. Extra correct detail does not make an answer incorrect.

For Task 1, `index.html` is the web bootstrap document and it loads `/src/main.tsx`, which is the JavaScript/React entry module. Either can be named as where execution "starts" if the answer correctly explains their relationship and the material startup flow. Do not require React StrictMode merely to award participant correctness.

For the cross-cutting task, all required production paths must be present. For change-impact tasks, require only the facts listed in `requiredFacts`.

## Answer-key audit after P01

After P01 and before P02, the question-to-answer mapping and all eight participant answer keys were checked directly against the frozen source repositories. The task prompts, repositories, randomisation, timings, NASA-TLX and SUS were unchanged.

The audit found one substantive scoring defect: Task 1/Q1 had treated `src/main.tsx` as the only acceptable entry-point wording, even though each repository's `index.html` explicitly loads it. That rubric was corrected and the same corrected rule is applied retrospectively to P01 and prospectively to every later participant. The audit also confirmed the intended mapping Q1/Q3/Q4/Q9 and the source-code basis of the remaining required facts.

No further task or answer-key changes are permitted after this audit.

## Measures to retain

For every participant retain:

- randomisation sequence;
- manual repository;
- Codemap repository;
- completion and correctness for all eight tasks;
- individual task time and total task time per condition;
- Raw NASA-TLX score for manual;
- Raw NASA-TLX score for Codemap;
- Codemap SUS score;
- the three qualitative responses.

The primary comparison is within participant: Codemap versus manual correctness, time and Raw NASA-TLX workload.

## Freeze rule

From P02 onward, do not change task wording, task order, answer keys, repository commits, randomisation schedule, NASA-TLX scales, SUS wording, scoring rules, eligibility criteria or participant instructions. Record technical failures separately rather than altering the procedure during the study.
