# Phase 3 Protocol — Running the Study Without Deviating From the Proposal

Every item below traces to a specific commitment in the AE1 Progress and Review Report.
Nothing here introduces anything the proposal did not promise; nothing promised is missing.

## Hard gate: ethics

No participant may be approached, recruited, or run until Solent ethical approval is
granted through the Ethics Review App and signed off by the supervisor (AE1 §2.4,
Appendix C). Until then the only permitted activities are: the accuracy gate (no humans),
repository selection, materials preparation, and dry runs on yourself. The Epigeum
"Working with human participants" module must be completed before data collection.

## Step 1 — Select the two matched repositories

Proposal commitment: two matched, public, permissively licensed, small-to-medium
JavaScript/TypeScript repositories (React/Next.js).

Method: shortlist candidates, run `python3 analysis/repo_stats.py repoA repoB`, and keep a
pair with the same framework, LOC ratio under ~1.5x, comparable dependency counts and
language mixes. Record the table in the logbook — it becomes the repository-matching
evidence in AE2's Methodology and answers the "repository difficulty" validity threat.
Neither repository may be one the participants (or you) know well; note this in recruitment.

## Step 2 — Run the accuracy gate (before any participants)

Proposal commitment: "Before the study, the tool's own answer accuracy is measured across
several repositories against a ground-truth set. This figure acts as a gate ... and
identifies specific questions where the tool is known to be inaccurate."

Method: copy `study/accuracy-gate.template.json` per repository and settle 10–15 questions and
answers before asking the tool. Researcher-confirmed ground truth is preferred. The present
artefact instead uses disclosed machine-assisted answers stamped VERIFIED BY TOOL; the capture
requires the explicit `--accept-tool-verified` flag and records that weaker provenance. Capture
the tool's verbatim answers, mark true/false, and have a human second marker spot-check a
pre-declared sample. Score both repositories together with `npm run gate:score`.
Outputs: the gate accuracy figure for AE2, and `seeded_candidates.json` — the ONLY
legitimate source for `seededAnswerShown` values in the study answer keys. If the gate
shows very low accuracy, stop and discuss with the supervisor before proceeding: that is
the gate doing its job.

## Step 3 — Build the study materials

- Answer keys: `study/answer-key.repoA.json`, `repoB.json` from the template — locating
  tasks + one applied task each, with seeded items taken from Step 2 only.
- Marking rubric (proposal: "pre-written answer key and marking rubric"). Template:
  - Locating tasks: 1 point — named file/path matches the key (accept equivalent paths
    listed in expectedFiles).
  - Applied task: 0–2 points — 1 for the correct insertion point, 1 for identifying at
    least two genuinely affected areas; written justification required.
  - Retention question: same rubric as the applied task, marked independently.
  - Blind second-marking of a sample, disagreements resolved by discussion (proposal §2.1).
- JISC Online Surveys: build the consent form, demographic form, and (optionally) SUS/TLX
  mirrors there. JISC only — SurveyMonkey/Google Forms would be an ethics breach.
- Consent + debrief scripts: consent states that some tool answers may be inaccurate;
  debrief identifies exactly which items were seeded (AE1 Appendix C commitment).

## Step 4 — Session run-sheet (one participant, one sitting)

1. Consent (signed, JISC), demographic form, experience level recorded.
2. Condition per the counterbalancing schedule: half manual-first, half tool-first;
   repository A/B crossed with condition so each participant sees each repo once.
3. Evaluation page → Setup: participant ID (P01…), condition, order, import the answer key.
4. Tasks phase: participant works; observer times via the page, records answers,
   captures the 1–5 confidence after each task, scores against the key.
   Seeded tasks (tool condition): show the tool's answer, record whether the participant
   flags it. Think-aloud comments go in observer notes.
5. Retention phase: tool closed/hidden; from-memory answer + confidence.
6. NASA-TLX, then SUS, on the page.
7. Export JSON (and CSV); file naming session_Pxx_condition.json; store on university
   OneDrive only, pseudonymised. Debrief, including seeded items.
8. Repeat for the second condition/repository (same sitting or scheduled second sitting —
   keep it consistent across participants and record which).

Pilot: one full dry run on yourself now; one pilot participant after ethics approval,
whose data is used to fix task wording/timing and is excluded from analysis (state this
in AE2).

## Step 5 — Analysis (already implemented, validated)

`python3 analysis/analyze_sessions.py <sessions_dir>` computes exactly the proposal's
plan: H1 time, H2 accuracy, H3 TLX via paired Wilcoxon signed-rank; H4 SUS vs the
published benchmark of 68 (Bangor et al., 2008) via one-sample Wilcoxon; p < 0.05;
matched-pairs rank-biserial effect sizes (Kerby 2014 formulation); over-trust detection
rate; confidence-accuracy gap. `--self-test` validates the implementation against
hand-checkable cases. n = 12–20 → report as exploratory (Wohlin et al., 2012).

## Traceability matrix (proposal → implementation)

| Proposal commitment (AE1) | Where it is satisfied |
|---|---|
| Two task kinds: locating vs applied | Task model `kind` field; Evaluation page badges |
| No-tool retention question | Dedicated retention phase, tool-hidden instruction |
| Pre-study accuracy gate | `accuracy_gate.py` + gate templates + Step 2 |
| Seeded known-inaccurate cases (Buçinca) | `seededInaccurate`/`seededAnswerShown`/`errorDetected`; sourced only from gate output |
| Time, accuracy, NASA-TLX, SUS, comments | Timers, scoring buttons, TLX + SUS phases, observer notes |
| Per-answer confidence / confidence-accuracy gap | 1–5 slider per task; gap computed in analysis |
| Wilcoxon + effect sizes, p < 0.05, exploratory framing | `analyze_sessions.py` (validated) |
| Within-subjects, counterbalanced, two matched repos | Setup condition/order fields; `repo_stats.py` matching evidence |
| 12–20 participants, experience recorded | Run-sheet Steps 1 & 4 |
| JISC only; consent; withdrawal; debrief incl. seeded items | Step 3 & 4; ethics gate above |
| Pilot before main study | Step 4 pilot note |
| Observer-timed, answer key + rubric, blind second-marking | Run-sheet + rubric template |

## What remains the researcher's responsibility

AI assistance and automation must be disclosed, and neither can take responsibility for the
research judgement. The researcher must approve the study design and repository choice, make or
adopt the correctness judgements recorded in the gate, safeguard every participant's data, and
own the interpretation and reporting of results. In this artefact the ground-truth drafts,
verification passes, verbatim capture, and existing second marking all used machines; those facts
must remain visible rather than being described as work that could not be delegated.
