# Testing and evaluation

Three levels, deliberately kept apart. **Software verification** asks whether the artefact does
what it was built to do. **Answer-reliability testing** asks how often its generated answers
match a reference standard. **Participant evaluation** asks whether it helped people. Reporting
any one of them as another would overclaim.

**AI-assistance note.** Tests, analysis scripts and supporting research tooling were developed with
AI assistance. Their outputs are treated as evidence from the relevant instruments, not as
independent human verification merely because a script or test passed. The researcher reviewed the
reported evidence and retains responsibility for the final research judgements. Full disclosure is
in [`../study/AI-DISCLOSURE.md`](../study/AI-DISCLOSURE.md).

---

## A. Software verification

Artefact verification asks whether the artefact does what it was built to do; **research
validation** asks whether its output is accurate enough for the study to mean anything. They are
separate activities with separate evidence.

## 1. Static checks

- **TypeScript** — `npm run typecheck`, which runs `tsc -b` across the project references, not
  `tsc -p` on one project. This is deliberate: a single-project check passed while four type errors
  sat in files outside its references.
- **ESLint** — `npm run lint`.
- **Production build** — `npm run build`. A build failure is a defect even when tests pass.

`tsconfig.app.json` sets `strict: false` and `strictNullChecks: false`. That is a real limitation:
nullability annotations in the evaluation model are documentation rather than enforcement, so the
guarantees around unrecorded responses are held by tests instead of by types. `session.test.ts`
says so at the assertions that carry the weight.

## 2. Unit tests

Vitest with jsdom. Coverage by area at the frozen commit:

| Area | File |
| --- | --- |
| Ingestion filters | `src/lib/ingestionFilters.test.ts` |
| GitHub ingestion and partitioning | `src/lib/github.test.ts` |
| Retrieval | `src/lib/semanticSearch.test.ts` |
| Prompt assembly and the context ceiling | `src/lib/promptBuilder.test.ts` |
| Streaming protocol | `src/lib/generationProtocol.test.ts` |
| Evidence panel | `src/components/EvidencePanel.test.tsx` |
| Unverified mentions | `src/components/WorkspaceQAView.test.tsx` |
| Suggested questions | `src/components/SuggestedQuestions.test.tsx` |
| File viewer, mouse and keyboard | `src/components/CodeViewer.test.tsx` |
| Store and file cache | `src/store/useProjectStore.test.ts` |
| Session model, scoring, export | `src/lib/evaluation/session.test.ts` |
| Session runner | `src/pages/Evaluation.test.tsx` |
| Rate limiting | `src/lib/security.test.ts` |

Several were written *after* the defect they check for, and say so at the assertion. That is the
intended pattern: a regression test whose comment explains the failure it prevents is worth more
than one that restates the implementation.

## 3. End-to-end

Playwright, `e2e/basic-flow.spec.ts`: landing-page controls, malformed-URL rejection without
navigation, navigation to the evaluation page, and the not-found route. Four specs across three
browsers in CI.

It does not drive a full question-and-answer cycle, because that needs a live model call and a
paid quota. That gap is covered instead by the accuracy gate, which drives the **deployed**
application with Playwright and records real answers.

## 4. Research validation

Distinct from the above, and evidenced in `study/` rather than in test output.

- **Accuracy gate** — 24 questions across two repositories, captured from the deployed application,
  marked by the researcher against a declared binary rubric.
- **Retrieval determinism** — repeat captures compared by `analysis/compare_runs.py`, which fails on
  drift.
- **Repository matching** — `analysis/verify_study_repos.py` and `analysis/repo_stats.py`.
- **Seeded inaccurate answer** — drawn only from recorded gate failures, never invented.
- **Participant evaluation** — 12 participants, analysed by `analysis/analyze_sessions.py`.

Every `analysis/` script carries a `--self-test`. Those self-tests check parsing logic against
fixtures, **not** against the real study files, which is a known limit: a change that broke the
ground-truth status regex passed every self-test and was caught only by running the real files.

## Continuous integration

`.github/workflows/ci.yml` runs install, typecheck, lint, unit tests, Playwright install and
Playwright tests on every push, on Node 20.

The workflow previously specified Node 18, which the test runner refuses, so **CI did not run for
about five weeks** while every local gate stayed green. It is worth stating in a strategy document
that a configured instrument and a reporting instrument are not the same thing.

---

## Results at the frozen commit

At the frozen commit `e7d7efe`, the build evaluated in the study.

| Gate | Result |
| --- | --- |
| `tsc -b` | Clean |
| ESLint | 0 errors, 4 warnings (all `react-refresh/only-export-components` in shadcn/ui files) |
| Unit tests | **139 passed, 13 files** |
| End-to-end | 4 passed |
| Production build | Clean |
| `analysis/` self-tests | 7 of 8 pass; `analyze_sessions.py` requires SciPy |

## On the test count

The dissertation states 118 unit tests across 13 files. The file count is correct; the test count
is not reproducible from any commit in this repository:

| Build | Tests | Files |
| --- | --- | --- |
| `fd5f5ab` | 109 | 12 |
| `429f830` | 112 | 12 |
| `c5fb72a` | 115 | 13 |
| `beae1ae` | 135 | 13 |
| **`e7d7efe` (frozen)** | **139** | **13** |
| `main` after post-study documentation work | 143 | 14 |

`npx vitest run` at the frozen commit reports 139. That is the figure used throughout this
documentation.

## Reproducing these

    git checkout e7d7efe
    npm ci
    npm run typecheck
    npm run lint
    npx vitest run
    npm run build
    npx playwright install --with-deps && npx playwright test

The gate figures are reproduced separately:

    npm run gate:score          # 6/24 (25%) from the marked captures
    npm run measure:questions   # retrieval score distribution

---

## B. Answer-reliability testing (the accuracy gate)

This measures the **artefact's own answers against a reference standard**, before any participant.
It is not general accuracy, and it should not be described as such.

- **24 questions**, 12 per study repository, written to have complete answers.
- **Binary marking**, no partial credit: an answer naming the right file but missing two of the four
  places something happens is incorrect. The questions were written to have complete answers, and
  half marks would make the resulting figure impossible to interpret.
- **Captured from the deployed application** with Playwright, recording each answer, the files
  retrieved, their scores, unverified mentions and a full-page screenshot.
- **Retained** in `study/accuracy-gate.*.json`, `study/gate-runs/` and `study/gate-screenshots/`.

**Result: 6 of 24 answers passed against the tool-verified reference standard under the frozen
configuration.**

Three things must travel with that figure:

1. **The reference standard is tool-verified, not independently human-established.** The 24
   reference answers were AI-assisted and then checked against the complete repositories through
   multiple adversarial passes, with cited line ranges mechanically checked. The researcher did not
   reconstruct each answer line by line. The researcher made the **final binary correctness
   verdicts** and retains responsibility for those judgements, recorded in `study/marking.*.md`.
2. **The questions are demanding by design.** Several assert that a declared behaviour never reaches
   the running application — something a tool retrieving three excerpts cannot establish.
3. **The capture harness enforces the qualification.** It requires an explicit
   `--accept-tool-verified` flag and records the weaker provenance in the gate file, so the figure
   cannot be reported without it being visible.

The gate also produces `study/seeded_candidates.json`, the 18 recorded failures, which is the
**only** legitimate source of the seeded inaccurate answer used in the participant study. A
hand-written plausible wrong answer would be fabricated data.

Reproduce with `npm run gate:score`.

---

## C. Participant evaluation

Within-subjects, counterbalanced, **n = 12**. Each participant completed matched comprehension
tasks in a manual and a tool condition, on two different purpose-built repositories.

| Hypothesis | Measure | Outcome |
| --- | --- | --- |
| H1 | Task completion time | **Inconclusive** — median lower with the tool, paired difference not significant |
| H2 | Rubric-scored accuracy | **Not supported** — no reliable improvement |
| H3 | Raw NASA-TLX workload | **Supported** — substantially lower with the tool, large effect |
| H4 | SUS vs the reference value of 68 | **Not established** |
| — | Seeded inaccurate answer | **7 of 12 detected it; 5 corrected it** |

Exact statistics are in Chapter 6 of the dissertation and are reproduced by
`analysis/analyze_sessions.py` from the retained session records. They are deliberately not
duplicated here: a number kept in two places drifts, and the report is authoritative.

AI tools were not used to fabricate participant responses or experimental measurements. AI
assistance in analysis, checking and presentation is disclosed separately from the underlying
recorded data.

The seeded-probe result is the finding that most concerns the artefact's central feature.
Participants were warned in advance that some responses might be inaccurate, and were prompted
directly. Under those conditions just over half detected the planted error and fewer than half
recovered the correct answer. **Detecting an inaccurate answer and recovering the correct evidence
are distinct behaviours**, and showing a reader the evidence supports the first more than the
second.

Session exports are retained pseudonymised on University-managed storage, consistent with the
ethics approval, and are not in this repository. Chapter 6 is therefore not reproducible from this
repository alone.
