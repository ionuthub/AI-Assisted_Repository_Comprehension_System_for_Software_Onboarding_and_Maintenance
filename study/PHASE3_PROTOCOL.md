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

**Recorded result: 20 of 24 passed**, with 11 of 12 for clinic-triage and 9 of 12 for warehouse-dispatch.

The reference answers were AI-assisted and tool-verified. The researcher made the final binary marking decisions. The capture tooling requires explicit acceptance of the tool-verified reference standard.

The run-of-record captures are:

- `study/regression-final/accuracy-gate.clinic-triage.json`
- `study/regression-final/accuracy-gate.warehouse-dispatch.json`

The gate records `toolVersion` `85ab075`. This value came from the local checkout and is not independent proof of the deployed commit; the deployed build is recorded separately in the session log for each participant.

An earlier gate against build `429f830` returned 6 of 24. That build was superseded by substantial changes to indexing and retrieval, most notably the removal of the fifty-file cap. It is retained as development history in `study/accuracy-gate.*.json` and is not a result of this study.

## Evaluated build

Participant sessions run against deployed build `85ab075`. Both answer keys carry
`artefactVersion: 85ab075`.

**The build is frozen for the duration of collection.** No change to the artefact, for any
reason, between the first participant and the last. If a defect is found during collection it is
recorded and worked around procedurally, not fixed. The deployed commit is confirmed and written
into the session log before every session, because the export does not record it.

Earlier identifiers appearing in historical study files are retained as development history and
are not re-stamped. Equivalences after the 29 August metadata normalisation are listed in
`study/SHA-MAP-REAUTHOR.md`.

## Participant tasks

Each repository answer key contains four tasks:

| Task | Type | Scoring |
| --- | --- | --- |
| 1 | Locating, misleading function name | 0 or 1 |
| 2 | Locating, cross-cutting concern | 0 or 1 |
| 3 | Applied | 0 to 2 |
| 4 | Retention | 0 to 2 |

Task positions are identical across the two repositories, so condition order cannot interact
with task position.

**No seeded inaccurate answer is used in this study.** The seeded over-trust probe requires a
recorded gate failure that a participant can verify and identify as wrong. At 20 of 24 the
current build produced four failures, of which only one is present in both repositories, and
that one is a fine distinction about whether execution begins in `index.html` or in
`src/main.tsx` rather than a checkable factual error. Seeding it would have measured agreement
with a marking judgement rather than detection of an inaccurate answer. The probe is therefore
not run, and its absence is reported as a consequence of the artefact's improved accuracy.

Accuracy is calculated as points earned divided by points available.

## Session procedure

1. Confirm the study repositories are unchanged with `git ls-remote`, and confirm the deployed build. Collect consent and demographic information.
2. Follow the counterbalancing schedule for manual-first or tool-first order.
3. Enter participant ID, condition and order, then import the correct answer key.
4. Run the tasks. Record time, answer, confidence and score for each task.
5. Run the retention task last. The application does not prompt for this: the observer states aloud that the tool must be closed or hidden, and records in the observer notes that it was done.
6. Complete Raw NASA-TLX. SUS is meaningful only after the tool condition; a SUS score collected after the manual condition measures nothing and is discarded.
7. Export JSON and CSV, store them pseudonymised on University-managed storage, and debrief the participant.
8. Clear the saved session and reload the page, then repeat with the second repository in the other condition.

The same deployed build was used for participant sessions. Local development builds were not used for data collection.

## Analysis

`analysis/analyze_sessions.py` produces:

- H1: task-time comparison;
- H2: points-based accuracy comparison;
- H3: Raw NASA-TLX comparison;
- H4: SUS compared with the reference value of 68;
- matched-pairs effect sizes;
- confidence and accuracy summaries.

The study targets 12 participants. If recruitment falls short the achieved number is reported as it stands, with the exploratory framing justified against Caine (2016) and Wohlin et al. (2012). Participant numbers are not supplemented by simulated or model-generated responses.

## AI and researcher responsibility

AI assistance was used in development, study-document preparation and analysis tooling. This is disclosed in `study/AI-DISCLOSURE.md`.

The researcher remained responsible for the study design, participant conduct, final marking decisions, data handling, interpretation and reporting.
