# Artefact Audit and Decisions Log — Phase 1

This document records the full audit of the repository, every change made, why it was made,
and how to reproduce or verify each one yourself. It exists so the author understands the
artefact deeply enough to defend every part of it in the viva. AI assistance with this audit
is disclosed in the dissertation's AI Declaration.

---

## 1. What the artefact is (architecture in one page)

A client-heavy React 18 + TypeScript + Vite single-page application with one serverless
API function, organised as:

- **Ingestion** — `src/lib/github.ts` (GitHub repo fetch), `src/lib/zipParser.ts` (zip upload),
  `src/lib/repositoryScanner.ts` (walks files, detects languages via `src/lib/languages.ts`).
- **Analysis** — `src/lib/projectAnalyzer.ts` (technology detection from package.json and
  file signals), `src/lib/staticAnalysis.ts` + `src/lib/graphUtils.ts` (import/export parsing
  into a dependency graph rendered by `src/components/DependencyGraph.tsx`),
  `src/lib/complexityDetector.ts` (tested heuristics).
- **Semantic search** — `src/lib/semanticSearch.ts`: TF-IDF vectors per file with
  camelCase/snake_case-aware tokenisation, stopword filtering (both English and language
  keywords), cosine similarity ranking. Entirely client-side; no embeddings service.
  In the report, describe this accurately as *lexical TF-IDF semantic search*, not neural
  embeddings. CodeBERT/GraphCodeBERT in your literature review are context, not components.
- **Grounded QA (RAG)** — `src/pages/Index.tsx` builds the prompt: it runs the search over
  the question, takes the top-ranked files, injects up to 2,500 characters of each with its
  path under an instruction to "answer using this evidence and cite file paths", and sends
  it to `api/explain-code.ts`, a serverless function calling Gemini 2.0 Flash with the
  repository context as the system instruction. This is a textbook retrieval-augmented
  pipeline: retrieval = TF-IDF ranking, augmentation = file excerpts in the prompt,
  generation = Gemini. Grounding quality therefore depends on retrieval quality — a point
  for your Design chapter and a threat-to-validity for the study.
- **State** — `src/store/useProjectStore.ts` (Zustand), selected via
  `src/hooks/useStoreSelectors.ts`.
- **Evaluation suite** — `src/pages/Evaluation.tsx` (683 lines): task list with per-task
  timers, SUS questionnaire, results capture. See §4 for what it still lacks for your study.
- **Auth/persistence** — Supabase (GitHub OAuth, saved projects) in `src/integrations/…`
  and `src/hooks/useGitHubAuth.ts`.

**How to verify:** `npm install`, `npm run dev`, load a public repo, then open each view.
Read the five `src/lib` files above in the order listed; they are the artefact's spine and
together are under 2,000 lines.

## 2. Faults found and fixed (with the reasoning)

**F1 — Broken click-to-select in the code viewer (real crash).**
`Index.tsx` called `setSelectedLine(...)` and `setSelectedLines(...)` inside
`handleLineClick`, but the component only destructured the *values* from the Zustand store,
never the setters. TypeScript reported TS2552 at lines 101–102; at runtime, clicking a line
threw a ReferenceError. **Fix:** add `setSelectedLine` and `setSelectedLines` to the store
destructure. **Lesson:** the setters existed in the store all along
(`useProjectStore.ts:145,147`) — the bug was at the consumption site. To find this class of
bug yourself: run `npx tsc -p tsconfig.app.json --noEmit` and treat every error as real.

**F2 — Invalid DOM typing for directory upload.**
`webkitdirectory="true" directory="true"` are non-standard attributes React's typings
reject (TS2322). **Fix:** spread them as a typed record:
`{...({ webkitdirectory: "true", directory: "true" } as Record<string, string>)}`.
The behaviour is identical; the type system is now satisfied honestly rather than with
`// @ts-ignore`.

**F3 — Three shadcn components importing packages that are not dependencies.**
`carousel.tsx`, `chart.tsx`, `input-otp.tsx` imported `embla-carousel-react`, `recharts`,
`input-otp` — none present in `package.json`, so typecheck failed. A search proved no
application code imports these components. **Decision: delete the three files** rather than
add three dependencies nothing uses. Smaller surface, faster install, honest dependency
list. **How to verify a component is unused:** `grep -rl "ui/chart" src --include="*.tsx"`
and confirm the only hit is the component itself.

**F4 — Repository identity and hygiene.**
- `package.json` name was the scaffold default `vite_react_shadcn_ts`; now
  `repository-comprehension-system`, version 1.0.0, with an accurate description.
- `LICENSE.md` copyright read "AI Code Tutor"; now the author's name. MIT retained —
  compatible with the dissertation's open-source claims.
- `README.md`: title now matches the report exactly; the dead `https://rig.ai/` link
  (not this project's deployment) replaced with honest run instructions; a
  **Provenance and AI Disclosure** section added stating the Antigravity origin and the
  author's adaptation role, mirroring the corrected AI Declaration.
- Deleted `.gemini/` (AI agent workspace files), `.npm-cache/`, `test-repo.zip` (57 KB of
  junk in the root). None are part of the application; all are development residue.

**On the git history:** the history, including the commit
"Clean up corporate boilerplate and simplify codebase to look like student project",
**stays untouched**. Do not rewrite or squash it. With the README disclosure and the
corrected declaration, that history changes from a liability into corroboration that you
are being transparent. Commit this phase as:
`chore: repository hygiene, bug fixes, and provenance disclosure (see AUDIT_AND_DECISIONS.md)`

## 3. Verification results after fixes

- `npx tsc -p tsconfig.app.json --noEmit` → clean, zero errors.
- `npx vitest run` → 3 files, **31/31 tests pass** (store logic, complexity detector).
- `npx vite build` → production build succeeds (~22 s; largest chunk 547 KB pre-gzip —
  acceptable; code-splitting is a documented possible improvement, not a defect).

## 4. Gap analysis: what the study needs that the Evaluation page lacks (Phase 2)

The current page has: a fixed task list, per-task timers, SUS (10 questions), and basic
capture. Your AE1 methodology commits to more. Each gap below is a Phase-2 work item:

1. **Participant + condition tracking** — a participant ID field and an A/B condition
   selector (manual vs tool), with counterbalancing order recorded.
2. **Two task types** — locating vs applied, labelled in the task model, plus the
   **no-tool retention question** presented after the applied task with the tool hidden.
3. **Per-answer confidence rating** (1–5) after every task — required for the
   confidence-accuracy gap analysis.
4. **Seeded-error support** — a task flag `seededInaccurate: true` with the expected wrong
   answer recorded, so detection/acceptance can be scored (Buçinca-style probe).
5. **NASA-TLX** — six subscales, currently absent entirely (only SUS exists).
6. **Ground-truth loading and scoring** — import the answer key (JSON), score
   accuracy against it, rather than free-text only.
7. **Export** — one-click CSV/JSON of the full session (participant, condition, per-task
   times, answers, confidence, SUS, TLX) for analysis in Phase 3.
8. **Pilot metrics** your supervisor requested — instrument and log QA response time and
   indexing duration so AE2 can report real numbers.

## 5. How to redo any of this yourself (the general method)

1. Reproduce first: run `tsc --noEmit`, `vitest run`, `vite build`; save the output.
2. For each error, find where the symbol is *defined* (store, lib) and where it is
   *consumed*; most bugs live at the consumption site.
3. Before deleting anything, prove it unused with `grep -rl`.
4. After every change, re-run all three checks. Never batch more than one risky change
   between verifications.
5. Write the reason down at the moment you make the change — this file is the pattern,
   and it becomes your Design & Implementation chapter's raw material.

---

# Phase 2 — Study Instrumentation (added)

## What was built and why

**`src/lib/evaluation/session.ts`** — the study's data model, encoding the AE1 methodology
directly in types: `TaskKind = locating | applied | retention`, per-task `confidence`,
`seededInaccurate` + `errorDetected` for the over-trust probes, `Condition` and
counterbalancing order, NASA-TLX (six subscales, raw unweighted mean) and SUS with the
standard Brooke scoring (odd items r−1, even items 5−r, sum × 2.5). Also the ground-truth
JSON import format, CSV serialisation, and a download helper. Keeping scoring in a plain
library file (no React) makes it unit-testable and quotable in the Methodology chapter.

**`src/lib/evaluation/metrics.ts`** — pilot metrics store (localStorage, bounded to 500
entries, failure-silent). Records the two numbers the supervisor asked for.

**Instrumentation points** — `useProjectStore.ts` now times both `buildSearchIndex` calls
(initial index and re-index) and records `indexing` metrics with file counts;
`Index.tsx` times the grounded-QA round trip and records `qa_response`. Both use
`performance.now()` around the exact operation, nothing else, so the numbers are honest.

**`src/pages/Evaluation.tsx`** — rewritten as a six-phase session runner:
`setup → tasks → retention → tlx → sus → export`.
- Setup captures participant ID, condition (manual/tool), counterbalancing order, and
  imports the ground-truth answer key JSON (template in `study/answer-key.template.json`).
- Tasks are labelled by kind; one runs at a time with a per-second timer; on completion the
  observer records the answer, a 1–5 confidence, and scores correct/incorrect against the
  key. Seeded tasks (tool condition only) display the tool's recorded wrong answer and
  capture whether the participant flagged it — the Buçinca-style detection measure.
- Retention is a separate phase explicitly instructing that the tool be hidden; captures a
  from-memory answer and confidence.
- TLX: six 0–100 sliders with the standard prompts. SUS: the canonical ten items, 1–5.
- Export produces JSON (full session + retention + scores + pilot metrics) and CSV
  (one row per task, summary row with SUS and TLX).
The previous page is preserved as `src/pages/Evaluation.legacy.txt` for the record.

## Design decisions worth defending in the viva

1. **Observer-driven scoring, not auto-marking.** Accuracy is a judgement against a rubric;
   the page records the judgement rather than pretending keyword matching is marking.
2. **Seeded answers come from the accuracy gate, not invention.** The template's
   `seededAnswerShown` says REPLACE deliberately: the wrong answers must be the tool's
   real recorded errors, or the probe measures nothing.
3. **Raw TLX (unweighted) rather than the paired-comparison weighting** — standard,
   defensible simplification (commonly reported as "Raw TLX"); cite Hart & Staveland and
   note the simplification in the Methodology chapter.
4. **Everything exports; nothing uploads.** Data stays on the study machine, consistent
   with the ethics statement (pseudonymised, university-managed storage).

## Verification

`tsc --noEmit` clean · 31/31 unit tests pass · production build succeeds.

## Remaining for Phase 3 (before the pilot)

- Run the accuracy gate: build `study/answer-key.repoA.json` / `repoB.json` with real
  tasks, record the tool's answers, mark them, and fill `seededAnswerShown` with genuine
  errors.
- A dry run of the full six phases on yourself, exporting both formats and opening the
  CSV in the analysis environment.
- Optional: unit tests for `susScore`/`tlxScore` (the formulas are trivial to test and it
  strengthens the Design & Implementation chapter).

---

# Phase 3 — Study Protocol and Analysis Pipeline (added)

Built: `analysis/analyze_sessions.py` (H1-H4 exactly per the proposal: paired Wilcoxon for
time/accuracy/TLX, one-sample Wilcoxon vs SUS benchmark 68, p < 0.05, matched-pairs
rank-biserial effect sizes, over-trust detection rate, confidence-accuracy gap; validated
via --self-test against hand-checkable cases), `analysis/accuracy_gate.py` (scores the
pre-participant gate and extracts genuine seeded-error candidates),
`analysis/repo_stats.py` (evidence-based repository matching), gate template, and
`study/PHASE3_PROTOCOL.md` (ethics gate, run-sheet, rubric template, and a traceability
matrix mapping every proposal commitment to its implementation).

Boundary respected: the scripts are instruments. Ground truth, tool answers, markings,
repository choice, participant data and interpretation are the researcher's own work.

---

# Phase 4 — Deployment identity and model retirement (added)

## F5 — Deployed origin never matched the API allowlist (the production 403)

`api/explain-code.ts` rejected any request whose `Origin` was not in a hardcoded
allowlist, which contained `https://aicodetutor.vercel.app`. The actual Vercel domain was
`ai-code-tutor-delta.vercel.app` (Vercel appends a suffix when the preferred subdomain is
taken), so the string never matched and **every grounded-QA request returned HTTP 403
"Origin not allowed" before reaching the model**. Note the browser sends `Origin` on
cross-*and* same-origin POST requests, so being served from the same domain did not exempt it.

**Fix:** the duplicated allowlist was collapsed into one helper, the stale name replaced,
and deployment-specific values moved into the `ALLOWED_ORIGINS` environment variable so the
code no longer hardcodes a guess at its own domain. Preview deployments of this project are
also accepted, so a viva demo from a preview URL is not blocked.

**Naming:** the artefact was still carrying its pre-dissertation identity ("AI Code Tutor")
in `index.html`, the e2e suite, the README clone URL and the API allowlist, while
`package.json` already used the dissertation name. All now read
`repo-comprehension-system`, matching the Vercel project.

## F6 — Retired generation model (the 404)

With the origin fixed, requests reached Google and returned **HTTP 404**, passed through
verbatim by the handler's `if (!response.ok)` branch. The cause: the code requested
`gemini-2.0-flash-exp`, an experimental preview alias that Google has retired. Its stable
counterpart `gemini-2.0-flash` was itself shut down on 1 June 2026
(https://ai.google.dev/gemini-api/docs/deprecations). A retired model ID returns 404, not a
descriptive error, which is why the failure was opaque.

**Fix:** the model is now pinned in one place and overridable via a `GEMINI_MODEL`
environment variable, defaulting to `gemini-3.5-flash` — a GA model with no announced
shutdown date, chosen over `gemini-2.5-flash` (earliest shutdown 16 October 2026) so the
artefact outlives submission and remains runnable by a marker after the viva. Making the
model configuration rather than code means a future retirement is a dashboard change, not a
redeploy of edited source.

## Research implications the researcher must act on (not delegable)

1. **The write-up must be corrected.** AE1 and the earlier README describe the generator as
   "Gemini 2.0 Flash". That model no longer exists. AE2's Methodology must state the model
   actually used, with the date, and the Design & Implementation chapter should discuss this
   as an implementation challenge — AE2 explicitly asks for challenges and their solutions.
2. **The accuracy gate must be run on the final model.** Gate results, seeded-error
   candidates and all study data are model-dependent. A gate run under one model does not
   license claims about another, so the gate must be (re)run once the model is settled, and
   the model must not change between the gate and the last participant.
3. **Record model provenance as a validity threat.** Externally-hosted model versions can be
   retired or silently updated mid-study; this is a genuine reproducibility limitation of
   any artefact built on a third-party API and is worth stating explicitly rather than
   discovering in the viva.

## Verification

`tsc --noEmit` clean (app and API) · 31/31 unit tests pass · production build succeeds.
