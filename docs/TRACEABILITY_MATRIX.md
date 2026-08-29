# Traceability matrix

Requirement → implementation → test → dissertation evidence, for the frozen build.

Test files are named as they exist at the frozen commit `e7d7efe`. Where a requirement has no
dedicated unit test, the row says so rather than pointing at a loosely related one: a traceability
matrix that claims coverage it does not have is worse than one that admits the gap.

## Functional requirements

| Req | Implementation | Test | Dissertation evidence |
| --- | --- | --- | --- |
| FR1 | `src/lib/github.ts` — `parseGitHubUrl`, unauthenticated headers | `src/lib/github.test.ts`; `e2e/basic-flow.spec.ts` (malformed URL rejected without navigating away) | §5.1; Appendix F.1 |
| FR2 | `src/lib/ingestionFilters.ts`; `partitionTreeFiles` in `src/lib/github.ts` | `src/lib/ingestionFilters.test.ts`; `src/lib/github.test.ts` (`partitionTreeFiles`, vendored directories) | §5.2 |
| FR3 | `src/lib/repositoryScanner.ts`, `src/lib/projectAnalyzer.ts`, `src/components/RepositoryOverview.tsx` | No dedicated unit test; exercised through `e2e/basic-flow.spec.ts` | §5.2; Figure 3 |
| FR4 | `resolveImportPath`, `computeWorkspaceReferences` in `src/lib/staticAnalysis.ts`; ranked in `RepositoryOverview.tsx` | No dedicated unit test — **coverage gap**, see below | §5.4 |
| FR5 | `src/lib/semanticSearch.ts`; `src/components/WorkspaceSearchView.tsx` | `src/lib/semanticSearch.test.ts` | §5.3; Appendix G score distribution |
| FR6 | Retrieval and prompt assembly in `src/pages/Index.tsx`; `api/explain-code.ts` | `src/lib/promptBuilder.test.ts` (couples retrieval parameters to the 12,000-char ceiling); `src/lib/generationProtocol.test.ts` | §5.5; Appendix G |
| FR7 | `src/components/EvidencePanel.tsx` | `src/components/EvidencePanel.test.tsx` | §5.5.1; gate screenshots in `study/gate-screenshots/` |
| FR8 | `MENTIONED_PATH` and unverified-mentions list in `src/components/WorkspaceQAView.tsx` | `src/components/WorkspaceQAView.test.tsx` | §5.5.1; `study/gate-screenshots/warehouse-dispatch-q09.png` |
| FR9 | `ingestion` summary in `src/lib/github.ts`; `src/components/CoveragePanel.tsx`; toast in `src/hooks/useProjectManagement.ts` | No dedicated unit test for the panel; the underlying counts are covered by `src/lib/github.test.ts` | §5.2; Appendix F.4 |
| FR10 | `src/lib/staticAnalysis.ts`; `src/components/FileInsightsPanel.tsx`; `src/components/CodeViewer.tsx` | `src/components/CodeViewer.test.tsx` (mouse and keyboard selection) | §5.4 |
| FR11 | `src/pages/Evaluation.tsx`, `src/lib/evaluation/session.ts`, `src/lib/evaluation/sessionStorage.ts` | `src/pages/Evaluation.test.tsx`; `src/lib/evaluation/session.test.ts` | §5.6; Appendix I |
| FR12 | `download`, `sessionToCsv` in `src/lib/evaluation/session.ts` | `src/lib/evaluation/session.test.ts` (CSV shape, formula escaping, empty cells for unrecorded values) | §5.6; Appendix I |

## Non-functional requirements

| Req | Implementation | Test / evidence | Dissertation |
| --- | --- | --- | --- |
| NFR1 | `tsconfig.app.json` `target: ES2020`; Vercel deployment | Production build in CI | §3.2 |
| NFR2 | Four constants in `src/lib/github.ts` | `src/lib/github.test.ts` | §3.2; Appendix F.4 |
| NFR3 | `src/lib/semanticSearch.ts` (pure computation) | `analysis/compare_runs.py` — fails on retrieval drift; repeat captures in `study/gate-runs/` | Appendix H |
| NFR4 | `src/lib/evaluation/metrics.ts` | `pilotMetrics` in the JSON export | §5.6 |
| NFR5 | `api/explain-code.ts` | Source inspection; no `VITE_` prefix, so the key cannot enter the bundle | §5.5 |
| NFR6 | `api/explain-code.ts`; `src/lib/promptBuilder.ts` | `src/lib/promptBuilder.test.ts` asserts the retrieval budget stays inside the context ceiling | §3.2 |
| NFR7 | `validateFilePath` in `src/lib/github.ts`; `csvEscape` in `src/lib/evaluation/session.ts` | `src/lib/security.test.ts`; `src/lib/github.test.ts`; `src/lib/evaluation/session.test.ts` | §3.2 — **mechanism needs correcting**, see the NFR document |
| NFR8 | `src/components/ErrorBoundary.tsx`, mounted in `src/App.tsx` and `src/pages/Index.tsx` | `e2e/basic-flow.spec.ts` (unknown routes render the not-found page) | §3.2 |
| NFR9 | ARIA on the score bar (`EvidencePanel.tsx`) and the roving-tabindex viewer (`CodeViewer.tsx`) | `src/components/CodeViewer.test.tsx` keyboard cases | §3.2 — partly met |
| NFR10 | Heading wording in `EvidencePanel.tsx` | `src/components/EvidencePanel.test.tsx` | §3.2, §5.5.1 |
| NFR11 | `.github/workflows/ci.yml` | 139 unit tests across 13 files, 4 e2e specs, at `e7d7efe` | §5.7 |
| NFR12 | `LICENSE.md` | Public repository | Appendix F.1 |

## Coverage gaps, stated rather than papered over

**FR4 has no dedicated unit test.** `resolveImportPath` and `computeWorkspaceReferences` are
exercised indirectly through `useProjectStore.test.ts` when a project is set, but nothing asserts
that an alias resolves correctly or that `usedBy` counts only indexed importers. This was a
deliberate scoping decision during development rather than an oversight — writing those tests was
proposed and declined in favour of evaluation work — and it is recorded here because FR4's ranking
appears in the overview a participant saw.

**FR3 and FR9 have no dedicated unit tests.** Both are display surfaces over data that is itself
tested. The e2e suite exercises them only as far as page rendering.

**The e2e suite is four specs.** It covers landing page controls, malformed-URL rejection,
navigation to the evaluation page, and the not-found route. It does not drive a full
question-and-answer cycle, because that requires a live model call.

## How the numbers reported in Chapter 6 are produced

| Reported quantity | Produced by | From |
| --- | --- | --- |
| Accuracy-gate figure | `analysis/accuracy_gate.py` | `study/accuracy-gate.*.json`, marked via `study/marking.*.md` |
| Retrieval score distribution | `analysis/score_questions.mjs` | The committed retrieval modules, scored against the gate stems |
| Retrieval determinism | `analysis/compare_runs.py` | `study/gate-runs/` |
| Repository matching | `analysis/verify_study_repos.py`, `analysis/repo_stats.py` | The two study repositories |
| H1–H4, effect sizes, seeded-error counts | `analysis/analyze_sessions.py` | Retained session exports, held on University-managed storage and not in this repository |
