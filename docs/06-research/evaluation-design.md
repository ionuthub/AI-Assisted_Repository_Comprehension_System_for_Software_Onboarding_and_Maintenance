# Evaluation design

Full protocol: [`../../study/PHASE3_PROTOCOL.md`](../../study/PHASE3_PROTOCOL.md). Chapter 4 of the
dissertation is authoritative; this summarises the design so the repository is legible on its own.

## Design

Within-subjects, counterbalanced. Twelve participants, each completing matched comprehension tasks
in a **manual** condition and a **tool** condition, on two different purpose-built repositories.

Within-subjects was chosen because it removes between-participant variation in prior experience,
which at n = 12 would otherwise dominate. The cost is order effects, handled by counterbalancing
condition and repository, recorded per session.

## Materials

Two purpose-built repositories, `clinic-triage` and `warehouse-dispatch`, matched on source file
count, lines, dependency count, test file count and predicted index coverage, and each containing
the same seven planted architectural patterns. Matching is evidenced by
`analysis/verify_study_repos.py` and `analysis/repo_stats.py`.

They are purpose-built rather than drawn from the public shortlist because of the fifty-file cap: a
locating task whose target falls outside the indexed subset tests luck rather than comprehension.

## Task structure

Four tasks per repository, scored out of 6:

| Task | Kind | Points |
| --- | --- | --- |
| 1 | locating — a function whose name understates what it does | 1 |
| 2 | locating — every site of a cross-cutting concern (**the seeded probe**) | 1 |
| 3 | applied — add a new type, and what else must change | 0–2 |
| 4 | retention — answered from memory with the tool closed | 0–2 |

Task positions are identical across the pair, so condition order cannot interact with task
position. The answer keys are `study/answer-key.clinic-triage.json` and
`study/answer-key.warehouse-dispatch.json`.

## Measures

- **Task completion time** — summed `elapsedSeconds` across the four tasks, derived from recorded
  timestamps rather than a tick count, so a backgrounded tab cannot under-report it.
- **Task accuracy** — points earned over points available, marked by the researcher against the
  declared rubric.
- **Perceived workload** — Raw NASA-TLX, six subscales.
- **Usability** — SUS, ten items, standard scoring, compared against 68.
- **Per-answer confidence** — 1–5, for the confidence-accuracy gap.
- **Seeded-probe outcome** — whether the participant flagged the known-inaccurate answer.

Nothing is recorded by default. Confidence and both mark fields start unset and export as null if
never touched, and both questionnaires refuse to advance while any item is unanswered. An earlier
version defaulted the sliders to their midpoints, which meant an unadministered questionnaire
exported as a complete response.

## The pre-study accuracy gate

Before any participant, the tool's own answer accuracy was measured on 24 questions across the two
repositories, captured from the deployed application: **6 of 24 (25%)**.

The gate does two things. It reports the accuracy of the instrument under study, and it is the
**only legitimate source** of seeded items: `study/seeded_candidates.json` holds the 18 recorded
failures, and the seeded probe is drawn from those. A hand-written plausible wrong answer would be
fabricated data.

## Ethics

Approved 13 August 2026. No participant was approached before that date. Written informed consent
through JISC Online Surveys; participants were told in advance that some responses might be
inaccurate, so the seeded probe measured verification under **disclosed risk rather than covert
deception**; full debrief afterwards, identifying which items were seeded. Only pseudonymised
records were retained, on University-managed storage. No screen recording, no accounts, no personal
data held by the artefact.
