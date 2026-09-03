# Traceability matrix

This table links the core artefact requirements to their main implementation and test evidence.

## Functional requirements

| Req | Implementation | Test evidence |
| --- | --- | --- |
| FR1 | `src/lib/github.ts` | `github.test.ts`, malformed-URL e2e test |
| FR2 | `ingestionFilters.ts`, `github.ts` | `ingestionFilters.test.ts`, `github.test.ts` |
| FR3 | `repositoryScanner.ts`, `projectAnalyzer.ts`, `RepositoryOverview.tsx` | Automated build and integration coverage |
| FR4 | `staticAnalysis.ts`, `RepositoryOverview.tsx` | Automated build and integration coverage |
| FR5 | `semanticSearch.ts`, `WorkspaceSearchView.tsx` | `semanticSearch.test.ts` |
| FR6 | `Index.tsx`, `api/explain-code.ts` | `promptBuilder.test.ts`, `generationProtocol.test.ts` |
| FR7 | `EvidencePanel.tsx` | `EvidencePanel.test.tsx` |
| FR8 | `WorkspaceQAView.tsx` | `WorkspaceQAView.test.tsx` |
| FR9 | `github.ts`, `CoveragePanel.tsx` | `github.test.ts` |
| FR10 | `staticAnalysis.ts`, `FileInsightsPanel.tsx`, `CodeViewer.tsx` | `CodeViewer.test.tsx` |

## Non-functional requirements

| Req | Implementation | Test or evidence |
| --- | --- | --- |
| NFR1 | ES2020 build, Vercel | Production build |
| NFR2 | Limits and recovery in `github.ts` | `github.test.ts` |
| NFR3 | `semanticSearch.ts` | `score_questions.mjs`, repeatability tooling |
| NFR5 | `api/explain-code.ts` | Source inspection and automated tests |
| NFR6 | `api/explain-code.ts`, `promptBuilder.ts` | `promptBuilder.test.ts` |
| NFR7 | Path validation and React escaping | `github.test.ts` |
| NFR8 | `ErrorBoundary.tsx` | not-found e2e coverage |
| NFR9 | ARIA and keyboard support | component and e2e tests |
| NFR10 | Evidence wording | `EvidencePanel.test.tsx` |
| NFR11 | CI and automated test suite | successful CI at final artefact commit |
| NFR12 | `LICENSE.md` | public repository |

## Final evaluation evidence

| Result | File or script |
| --- | --- |
| 24-question accuracy gate | `study/ground-truth.*.md`, `study/marking.*.md`, `study/final-results.json` |
| Retrieval measurement | `analysis/score_questions.mjs` |
| Citation checking | `analysis/check_citations.py` |
| Repository matching | `analysis/verify_study_repos.py`, `analysis/repo_stats.py` |
