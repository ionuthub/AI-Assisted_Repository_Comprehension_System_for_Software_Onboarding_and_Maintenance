# Requirements

This file summarises the requirements used for the frozen study build. The implementation details were checked against the source.

## Functional requirements

| ID | Requirement | Status | Main implementation |
| --- | --- | --- | --- |
| FR1 | Accept a public GitHub repository URL | Met | `src/lib/github.ts` |
| FR2 | Ingest source files, exclude unsuitable files and report exclusions | Met | `src/lib/ingestionFilters.ts`, `src/lib/github.ts`, `CoveragePanel.tsx` |
| FR3 | Show technologies, languages and files | Met | `repositoryScanner.ts`, `projectAnalyzer.ts`, `RepositoryOverview.tsx` |
| FR4 | Rank files using resolved imports | Met | `staticAnalysis.ts`, `RepositoryOverview.tsx` |
| FR5 | Provide ranked natural-language code search | Met | `semanticSearch.ts`, `WorkspaceSearchView.tsx` |
| FR6 | Answer questions using retrieved repository evidence | Met | `Index.tsx`, `api/explain-code.ts` |
| FR7 | Show evidence with score, line range and excerpt | Met | `EvidencePanel.tsx` |
| FR8 | Flag named file paths that were not retrieved | Met | `WorkspaceQAView.tsx` |
| FR9 | Show repository index coverage | Met | `github.ts`, `CoveragePanel.tsx` |
| FR10 | Explain and inspect a selected file | Met | `staticAnalysis.ts`, `FileInsightsPanel.tsx`, `CodeViewer.tsx` |
| FR11 | Support the controlled evaluation session | Met | `Evaluation.tsx`, `evaluation/session.ts` |
| FR12 | Export study data as JSON and CSV | Met | `evaluation/session.ts` |

Important details:

- FR4 ranks only indexed files. Files outside the 50-file limit do not contribute.
- FR5 is lexical TF-IDF search, not neural semantic search.
- FR7 evidence is created before generation from the retrieved excerpts.
- FR12 records retention as a task, not as a separate export block.

## Non-functional requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| NFR1 | Run in a current desktop browser with ES2020 build target | Met | `tsconfig.app.json`, Vercel deployment |
| NFR2 | Limit ingestion to 50 files, 5 MB each, 10-second timeout and 6 concurrent fetches | Met | `src/lib/github.ts` |
| NFR3 | Return the same retrieval results for the same query and index | Met and measured | `semanticSearch.ts`, `analysis/compare_runs.py` |
| NFR4 | Record indexing and Q&A timing | Measured, no target set | `evaluation/metrics.ts` |
| NFR5 | Keep the model API key server-side | Met | `api/explain-code.ts` |
| NFR6 | Apply origin, request, context and timeout limits | Met with conditional rate limit | `api/explain-code.ts`, `promptBuilder.ts` |
| NFR7 | Protect untrusted content and exported data | Met by the implementation described below | React escaping, path validation, CSV escaping |
| NFR8 | Contain runtime errors and show failures | Met | `ErrorBoundary.tsx`, inline generation errors |
| NFR9 | Provide reasonable accessibility support | Partly met | ARIA and keyboard support; no formal WCAG audit |
| NFR10 | Do not present an answer as proven correct | Met | Evidence panel wording |
| NFR11 | Use typecheck, lint, unit tests and end-to-end tests | Met at the frozen build | CI and test suite |
| NFR12 | Publish source under a permissive licence | Met | MIT licence |

### NFR7 implementation

The dissertation wording refers to HTML and URL sanitising helpers, but those helpers do not exist in the frozen implementation.

The actual protection is:

- React escapes rendered model text because the application does not use `dangerouslySetInnerHTML`.
- Repository-derived URLs are not rendered as `href` or `src` values.
- Repository paths are validated.
- CSV cells are escaped against formula injection.

The requirement is met, but the mechanism should be described accurately.

### NFR11 test count

The dissertation states 118 unit tests across 13 files. The frozen commit `e7d7efe` actually reports **139 tests across 13 files**. No commit in the checked sequence reports 118.

The earlier CI configuration also used Node 18, which prevented the test runner from reporting for about five weeks. The frozen build itself was checked locally, and CI was later corrected to Node 20.

For test coverage by requirement, see [`TRACEABILITY_MATRIX.md`](TRACEABILITY_MATRIX.md).
