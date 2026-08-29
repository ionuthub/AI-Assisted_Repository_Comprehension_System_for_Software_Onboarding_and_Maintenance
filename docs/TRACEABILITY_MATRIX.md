# Traceability matrix

This table links each requirement to the main implementation, test evidence and dissertation section for the frozen build.

## Functional requirements

| Req | Implementation | Test | Dissertation |
| --- | --- | --- | --- |
| FR1 | `src/lib/github.ts` | `github.test.ts`, e2e malformed-URL test | Chapter 5.1, Appendix F.1 |
| FR2 | `ingestionFilters.ts`, `github.ts` | `ingestionFilters.test.ts`, `github.test.ts` | Chapter 5.2 |
| FR3 | `repositoryScanner.ts`, `projectAnalyzer.ts`, `RepositoryOverview.tsx` | No dedicated unit test | Chapter 5.2, Figure 3 |
| FR4 | `staticAnalysis.ts`, `RepositoryOverview.tsx` | No dedicated unit test | Chapter 5.4 |
| FR5 | `semanticSearch.ts`, `WorkspaceSearchView.tsx` | `semanticSearch.test.ts` | Chapter 5.3, Appendix G |
| FR6 | `Index.tsx`, `api/explain-code.ts` | `promptBuilder.test.ts`, `generationProtocol.test.ts` | Chapter 5.5, Appendix G |
| FR7 | `EvidencePanel.tsx` | `EvidencePanel.test.tsx` | Chapter 5.5.1 |
| FR8 | `WorkspaceQAView.tsx` | `WorkspaceQAView.test.tsx` | Chapter 5.5.1 |
| FR9 | `github.ts`, `CoveragePanel.tsx` | Counts covered by `github.test.ts`; no panel unit test | Chapter 5.2, Appendix F.4 |
| FR10 | `staticAnalysis.ts`, `FileInsightsPanel.tsx`, `CodeViewer.tsx` | `CodeViewer.test.tsx` | Chapter 5.4 |
| FR11 | `Evaluation.tsx`, `evaluation/session.ts` | `Evaluation.test.tsx`, `session.test.ts` | Chapter 5.6, Appendix I |
| FR12 | `sessionToCsv`, `download` | `session.test.ts` | Chapter 5.6, Appendix I |

## Non-functional requirements

| Req | Implementation | Test or evidence | Dissertation |
| --- | --- | --- | --- |
| NFR1 | ES2020 build, Vercel | Production build | Chapter 3.2 |
| NFR2 | Limits in `github.ts` | `github.test.ts` | Chapter 3.2, Appendix F.4 |
| NFR3 | `semanticSearch.ts` | `compare_runs.py`, repeated gate captures | Appendix H |
| NFR4 | `evaluation/metrics.ts` | `pilotMetrics` export | Chapter 5.6 |
| NFR5 | `api/explain-code.ts` | Source inspection | Chapter 5.5 |
| NFR6 | `api/explain-code.ts`, `promptBuilder.ts` | `promptBuilder.test.ts` | Chapter 3.2 |
| NFR7 | Path validation, React escaping, CSV escaping | `github.test.ts`, `session.test.ts` | Chapter 3.2 |
| NFR8 | `ErrorBoundary.tsx` | e2e not-found coverage | Chapter 3.2 |
| NFR9 | ARIA and keyboard support | `CodeViewer.test.tsx` | Chapter 3.2 |
| NFR10 | Evidence-panel wording | `EvidencePanel.test.tsx` | Chapters 3.2 and 5.5.1 |
| NFR11 | CI and test suite | 139 unit tests, 4 e2e tests at frozen build | Chapter 5.7 |
| NFR12 | `LICENSE.md` | Public repository | Appendix F.1 |

## Known coverage gaps

- FR4 has no dedicated unit test for import resolution and `usedBy` counts.
- FR3 and FR9 have no dedicated display-component unit tests.
- The e2e suite does not run a complete live Q&A cycle.

## Result sources

| Result | Script or file |
| --- | --- |
| Accuracy gate | `analysis/accuracy_gate.py` and `study/marking.*.md` |
| Retrieval scores | `analysis/score_questions.mjs` |
| Retrieval determinism | `analysis/compare_runs.py` |
| Repository matching | `analysis/verify_study_repos.py`, `analysis/repo_stats.py` |
| H1 to H4 and seeded-error counts | `analysis/analyze_sessions.py` with retained participant exports |
