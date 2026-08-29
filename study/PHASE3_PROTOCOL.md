# Study protocol

This file summarises the procedure used for the participant study and the versions of the artefact that were recorded.

## Ethics

No participant contact was allowed before ethical approval. Approval was received on 13 August 2026. Before approval, work was limited to repository selection, study materials, the accuracy gate and researcher dry runs.

## Study repositories

Two purpose-built JavaScript/TypeScript repositories were used:

- `clinic-triage`
- `warehouse-dispatch`

They were checked as a matched pair using `analysis/repo_stats.py` and `analysis/verify_study_repos.py`.

## Accuracy gate

The gate was run before participant collection using 24 questions, 12 per repository.

**Recorded result: 6 of 24 passed**, with 2 of 12 for clinic-triage and 4 of 12 for warehouse-dispatch.

The reference answers were AI-assisted and tool-verified. The researcher made the final binary marking decisions. The capture tooling requires explicit acceptance of the tool-verified reference standard.

The run-of-record captures are:

- `study/accuracy-gate.clinic-triage.json`
- `study/accuracy-gate.warehouse-dispatch.json`

The gate records `toolVersion` `429f830`. This value came from the local checkout and is not independent proof of the deployed commit.

## Evaluated build

The participant deployment was recorded as historical commit `79dafba`, built from application source at `e7d7efe`.

After the 29 August metadata normalisation, these old hashes are kept as historical identifiers. Their new equivalents are listed in `study/SHA-MAP-REAUTHOR.md`.

No historical study file should be re-stamped simply because Git metadata was rewritten.

## Participant tasks

Each repository answer key contains four tasks:

| Task | Type | Scoring |
| --- | --- | --- |
| 1 | Locating | 0 or 1 |
| 2 | Locating, seeded inaccurate answer | 0 or 1 |
| 3 | Applied | 0 to 2 |
| 4 | Retention | 0 to 2 |

The seeded answer came only from recorded gate failures in `study/seeded_candidates.json`.

Accuracy is calculated as points earned divided by points available.

## Session procedure

1. Collect consent and demographic information.
2. Follow the counterbalancing schedule for manual-first or tool-first order.
3. Enter participant ID, condition and order, then import the correct answer key.
4. Run the tasks. Record time, answer, confidence and score for each task.
5. For the seeded task in the tool condition, record whether the participant detects the inaccurate answer.
6. Run the retention task last with the tool hidden.
7. Complete Raw NASA-TLX and SUS.
8. Export JSON and CSV, store them pseudonymised on University-managed storage, and debrief the participant.
9. Repeat with the second repository and condition.

The same deployed build was used for participant sessions. Local development builds were not used for data collection.

## Analysis

`analysis/analyze_sessions.py` produces:

- H1: task-time comparison;
- H2: points-based accuracy comparison;
- H3: Raw NASA-TLX comparison;
- H4: SUS compared with the reference value of 68;
- matched-pairs effect sizes;
- seeded-error detection;
- confidence and accuracy summaries.

The final study included 12 participants.

## AI and researcher responsibility

AI assistance was used in development, study-document preparation and analysis tooling. This is disclosed in `study/AI-DISCLOSURE.md`.

The researcher remained responsible for the study design, participant conduct, final marking decisions, data handling, interpretation and reporting.
