# Test strategy

Four layers, and a distinction that matters throughout: **software testing** asks whether the
artefact does what it was built to do; **research validation** asks whether its output is accurate
enough for the study to mean anything. They are separate activities with separate evidence.

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
