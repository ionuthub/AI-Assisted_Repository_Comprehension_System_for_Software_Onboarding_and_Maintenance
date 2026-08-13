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
Outputs: the gate accuracy figure for AE2, and `study/seeded_candidates.json` — the ONLY
legitimate source for `seededAnswerShown` values in the study answer keys. If the gate
shows very low accuracy, stop and discuss with the supervisor before proceeding: that is
the gate doing its job.

**Result (5 August 2026):** Overall accuracy 6/24 (25%) — clinic-triage 2/12 (17%),
warehouse-dispatch 4/12 (33%). `study/seeded_candidates.json` generated, 18 candidates. Per the
rule above, this result was discussed with the supervisor on 5 August 2026; the outcome was to
proceed as planned. The number of seeded items per repository, drawn only from these 18
candidates, is fixed at [n] following that discussion.

The marked capture is `study/accuracy-gate.{clinic-triage,warehouse-dispatch}.json`, taken at
16:00:55Z and 16:02:32Z on 5 August from `https://repo-comprehension-system.vercel.app/`, and
recording `toolVersion` `429f830`. An earlier run of the same 24 stems on 4 August, archived as
`gate-runs/clinic-triage-run9.json` and `gate-runs/warehouse-dispatch-run8.json`, recorded
`fd5f5ab` and produced the same 6/24; the figure is therefore stable across the two captures.

**Limitation on `toolVersion`.** `capture_gate.mjs` defaults `toolVersion` to the *local* git
`HEAD` at the moment the capture runs, not to the commit the deployed site was serving. It is a
record of the researcher's checkout, and it is only a record of the deployed build if the
deployment is confirmed separately. Two facts make that worth stating rather than assuming here:
`429f830` was committed at 15:26Z, 34 minutes before the capture, and the immediately preceding
runs at 15:55Z and 15:57Z still recorded `fd5f5ab` — a change of checkout, not evidence of a
deploy. Confirm the deployed commit in the Vercel dashboard and record it alongside the figure,
or re-run with an explicit `--tool-version`.

**Deployed build: `c5fb72a`.** Confirmed in the Vercel dashboard on 10 August — deployment
`repo-comprehension-system-hr9g9drqr-ionuthubs-projects.vercel.app`, serving the
`repo-comprehension-system.vercel.app` domain, status Ready, built from `main` at `c5fb72a`. This
is the build pilots and participants meet, and the SHA to record against each session.

**Why the 6/24 figure is not re-captured against it.** The gate figure was captured against
`429f830`, and every file the gate exercises is byte-identical between `429f830` and `c5fb72a`:

    git diff --stat 429f830..c5fb72a -- \
      src/lib/github.ts src/lib/semanticSearch.ts src/lib/promptBuilder.ts \
      src/lib/generationProtocol.ts src/lib/ingestionFilters.ts src/lib/staticAnalysis.ts \
      src/lib/repositoryScanner.ts src/components/WorkspaceQAView.tsx \
      src/components/EvidencePanel.tsx src/components/SuggestedQuestions.tsx \
      src/components/CodeViewer.tsx src/pages/Index.tsx src/store/useProjectStore.ts \
      src/constants/appConstants.ts api/

That command returns nothing. The only changes in the range are to the study session runner
(`src/pages/Evaluation.tsx`, `src/lib/evaluation/sessionStorage.ts`) and its tests, none of which
sit on the capture path — the gate drives the question-answering flow, not the evaluation page. So
the recorded figure measures the code now deployed.

Re-capturing an unchanged pipeline could only confirm the figure or move it by model
nondeterminism, and the second is a live risk rather than a theoretical one: two captures of the
same build five minutes apart on 5 August produced **zero of twelve** identical answers. A verdict
that flipped on a re-run would move the headline AE2 figure for a reason unconnected to the
artefact. The figure therefore stands as captured, with its build stated, and a re-capture is
required only if a change lands on one of the paths listed above.

**What this does not establish.** The dashboard confirms `c5fb72a` is deployed now; it says nothing
about which commit was being served at 16:00Z on 5 August, when the marked capture ran. That
deployments are built from `main` on push makes it likely `429f830` — pushed 34 minutes earlier —
was live, but likely is not confirmed, and the `toolVersion` limitation above still applies to that
capture.

## Step 3 — Build the study materials

- Answer keys — **written, committed**: `study/answer-key.clinic-triage.json` and
  `study/answer-key.warehouse-dispatch.json`, named for their repositories to match
  `accuracy-gate.<repo>.json` and `ground-truth.<repo>.md`. Four tasks each, identically
  positioned across the pair so condition order cannot interact with task position:

  | Task | Kind | Notes |
  | --- | --- | --- |
  | 1 | `locating` | a function whose name understates what it does |
  | 2 | `locating` | **the seeded over-trust probe** — `seededInaccurate: true` |
  | 3 | `applied` | add a new type; scored 0–2 |
  | 4 | `retention` | answered from memory, tool closed; scored 0–2, marked independently of task 1 |

  The seeded item is **task 2**, not task 3 as `answer-key.template.json` positions it — the
  template predates these keys and carries a different task set. Each `seededAnswerShown` is an
  exact string match against an entry in `study/seeded_candidates.json` for that repository, which
  is the only legitimate source. Both keys also record `repositoryCommit`, so an answer is tied to
  the exact state of the repository the participant read, and `artefactVersion`, which must name
  the **deployed** build (see the environment rule in Step 4).

  Task 4 is load-bearing: the retention phase was removed from the interface in `c5fb72a`, so the
  answer key is now the only place retention exists. A key without a `kind: "retention"` task drops
  the measure with no error and no warning.
- Marking rubric (proposal: "pre-written answer key and marking rubric"). **The runner records
  this rubric directly** — locating tasks offer Correct/Incorrect, applied and retention tasks
  offer 0, 1 or 2, and the export carries `score` and `maxScore` per task so the two are never
  summed as though they were the same unit. Until then it offered Correct/Incorrect for every
  kind, so a half-credit answer had to be forced to one or the other and half the rubric was
  unrecordable.
  - Locating tasks: 1 point — named file/path matches the key (accept equivalent paths
    listed in expectedFiles).
  - Applied task: 0–2 points — 1 for the correct insertion point, 1 for identifying at
    least two genuinely affected areas; written justification required.
  - Retention question: same rubric as the applied task, marked independently.
  - Blind second-marking of a sample, disagreements resolved by discussion (proposal §2.1).
  - Accuracy is therefore **points earned over points available**, not the proportion of tasks
    marked correct. `analysis/analyze_sessions.py` computes H2 that way; a task-proportion figure
    would weight a locating point equally with a two-point applied task and discard every
    half-credit answer.
- JISC Online Surveys: build the consent form, demographic form, and (optionally) SUS/TLX
  mirrors there. JISC only — SurveyMonkey/Google Forms would be an ethics breach.
- Consent + debrief scripts: consent states that some tool answers may be inaccurate;
  debrief identifies exactly which items were seeded (AE1 Appendix C commitment).

## Step 4 — Session run-sheet (one participant, one sitting)

1. Consent (signed, JISC), demographic form, experience level recorded.
2. Condition per the counterbalancing schedule: half manual-first, half tool-first;
   repository A/B crossed with condition so each participant sees each repo once.
3. Evaluation page → Setup: participant ID (P01…), condition, order, import the answer key.
   Once the session begins, a banner names the running condition on every screen — for the manual
   half it reads **"Condition: Manual — do not use the tool"**. Check it matches the
   counterbalancing schedule before starting, and check it again after any break: nothing else in
   the interface distinguished the two halves, and neither a participant drifting into the tool
   during a manual task nor an observer losing track of which half they were in leaves any trace
   in the export, which records whatever condition was set at setup.
4. Tasks phase: participant works; observer times via the page, records answers,
   captures the 1–5 confidence after each task, scores against the key — Correct/Incorrect for
   locating tasks, 0–2 for applied and retention.
   Seeded tasks (tool condition): show the tool's answer, record whether the participant
   flags it. Think-aloud comments go in observer notes.
   **Nothing is recorded by default.** Confidence and both mark fields start unset and export as
   null if never touched; the export summary lists any task left unmarked or unrated. Fill the
   gaps while the participant is still present, because an unmarked task cannot be recovered
   afterwards and is not the same as a task scored zero.
5. **The retention question is the last task in the answer key, carrying `kind: "retention"`.**
   There is no separate retention phase — it was removed because, once the answer keys carried
   retention as a task, the phase re-asked the applied task's question instead of the retention
   one. **The observer must close or hide the tool before starting that task, and note in the
   observer notes that this was done.** The page no longer prompts for either: it presents a
   retention task identically to any other, and the export no longer carries a field asserting
   that the tool was hidden. Until that is restored in the interface, the no-tool condition rests
   on the observer following this step, so it must be confirmed in the notes for every session or
   the retention measure is unverifiable.
6. NASA-TLX, then SUS, on the page. Both must be completed in full before the page will move on:
   every TLX scale has to be operated even where the participant is content with the midpoint,
   and all ten SUS items answered. Both instruments previously started at their midpoints — TLX at
   50 on all six, SUS substituting 3 for any unanswered item — so an unadministered questionnaire
   exported as a complete response, and ten unanswered SUS items scored exactly 50, which would
   then have been compared against the published benchmark of 68 as though a participant had
   produced it. A partial instrument now scores null rather than an estimate, and
   `analyze_sessions.py` drops those participants from H3/H4 and prints the exclusion.
7. Export JSON (and CSV); file naming session_Pxx_condition.json; store on university
   OneDrive only, pseudonymised. Debrief, including seeded items.
8. Repeat for the second condition/repository (same sitting or scheduled second sitting —
   keep it consistent across participants and record which).

Pilot: one full dry run on yourself now; one pilot participant after ethics approval,
whose data is used to fix task wording/timing and is excluded from analysis (state this
in AE2).

**Environment rule — pilots and participants use the same build.** Every session,
including the researcher's own dry run, is run against the deployed application
(https://repo-comprehension-system.vercel.app/), never against a local `npm run dev`
server. The dev server and the deployed function once built the model prompt from
separate code and had already drifted — different context caps, different request
validation, different whitespace — so a pilot run locally was not exercising the
instrument a participant meets. They now share src/lib/promptBuilder.ts, which removes
the cause; running everything against the deployed build removes the class. Record the
commit SHA of the deployed build alongside each session, as the accuracy gate already
does in its `toolVersion` field.

At the time of writing that build is **`c5fb72a`** (see Step 2). Read the SHA from the Vercel
dashboard at the start of each session rather than from a local `git log`: the two are the same
only when nothing has been pushed since the last deploy, and `toolVersion` reads the local
checkout, which is how the ambiguity in the 5 August capture arose.

## Step 5 — Analysis (already implemented, validated)

`python3 analysis/analyze_sessions.py <sessions_dir>` computes exactly the proposal's
plan: H1 time, H2 accuracy, H3 TLX via paired Wilcoxon signed-rank; H4 SUS vs the
published benchmark of 68 (Bangor et al., 2008) via one-sample Wilcoxon; p < 0.05;
matched-pairs rank-biserial effect sizes (Kerby 2014 formulation); over-trust detection
rate; confidence-accuracy gap. `--self-test` validates the implementation against
hand-checkable cases. n = 12–20 → report as exploratory (Wohlin et al., 2012).

## Traceability matrix (proposal → implementation)

| Proposal commitment (AE1)                                  | Where it is satisfied                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Two task kinds: locating vs applied                        | Task model `kind` field; Evaluation page badges; per-kind marking (binary vs 0-2)      |
| No-tool retention question                                 | Answer-key task with `kind: "retention"`, carried through both exports; no-tool condition administered by the observer per run-sheet step 5, **not enforced or recorded by the interface** |
| Pre-study accuracy gate                                    | `accuracy_gate.py` + gate templates + Step 2                                          |
| Seeded known-inaccurate cases (Buçinca)                    | `seededInaccurate`/`seededAnswerShown`/`errorDetected`; sourced only from gate output |
| Time, accuracy, NASA-TLX, SUS, comments                    | Timers, scoring buttons, TLX + SUS phases (both refuse to advance until complete), observer notes |
| Per-answer confidence / confidence-accuracy gap            | 1–5 slider per task, unset until recorded; gap computed in analysis over rated tasks only |
| Wilcoxon + effect sizes, p < 0.05, exploratory framing     | `analyze_sessions.py` (validated)                                                     |
| Within-subjects, counterbalanced, two matched repos        | Setup condition/order fields; on-screen condition banner; `repo_stats.py` matching evidence |
| 12–20 participants, experience recorded                    | Run-sheet Steps 1 & 4                                                                 |
| JISC only; consent; withdrawal; debrief incl. seeded items | Step 3 & 4; ethics gate above                                                         |
| Pilot before main study                                    | Step 4 pilot note                                                                     |
| Observer-timed, answer key + rubric, blind second-marking  | Run-sheet + rubric template                                                           |

## What remains the researcher's responsibility

AI assistance and automation must be disclosed, and neither can take responsibility for the
research judgement. The researcher must approve the study design and repository choice, make or
adopt the correctness judgements recorded in the gate, safeguard every participant's data, and
own the interpretation and reporting of results. In this artefact the ground-truth drafts,
verification passes, verbatim capture, and existing second marking all used machines; those facts
must remain visible rather than being described as work that could not be delegated.
