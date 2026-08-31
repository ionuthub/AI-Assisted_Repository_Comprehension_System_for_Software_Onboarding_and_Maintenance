# Requirements

This file summarises the requirements used for the frozen study build. Historical requirement outcomes are kept unchanged because they describe the artefact that produced the participant and accuracy-gate evidence.

The current post-study artefact has since removed the fixed 50-file cap entirely. There is no replacement 100-file or other repository file-count ceiling: every eligible file discovered from the Git tree is selected for ingestion. If GitHub truncates the initial recursive tree response, the current implementation expands the affected subtrees instead of accepting known-partial coverage. Answer retrieval has also widened from three files to a 24-file candidate pool with up to eight evidence files plus symbol and import-graph expansion. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the current implementation.

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

Important details for the frozen study build:

- FR4 ranked only indexed files. Files outside the 50-file limit did not contribute.
- FR5 used lexical TF-IDF search, not neural semantic search.
- FR7 evidence was created from the retrieved excerpts before generation.
- FR12 recorded retention as a task, not as a separate export block.

## Non-functional requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| NFR1 | Run in a current desktop browser with ES2020 build target | Met | `tsconfig.app.json`, Vercel deployment |
| NFR2 | Limit ingestion to 50 files, 5 MB each, 10-second timeout and 6 concurrent fetches | Met in frozen build | Frozen `src/lib/github.ts` |
| NFR3 | Return the same retrieval results for the same query and index | Met and measured | `semanticSearch.ts`, `analysis/compare_runs.py` |
| NFR4 | Record indexing and Q&A timing | Measured, no target set | `evaluation/metrics.ts` |
| NFR5 | Keep the model API key server-side | Met | `api/explain-code.ts` |
| NFR6 | Apply origin, request, context and timeout limits | Met with conditional rate limit | `api/explain-code.ts`, `promptBuilder.ts` |
| NFR7 | Protect untrusted content and exported data | Met | React escaping, path validation, CSV escaping |
| NFR8 | Contain runtime errors and show failures | Met | `ErrorBoundary.tsx`, inline generation errors |
| NFR9 | Provide reasonable accessibility support | Partly met | ARIA and keyboard support; no formal WCAG audit |
| NFR10 | Do not present an answer as proven correct | Met | Evidence panel wording |
| NFR11 | Use typecheck, lint, unit tests and end-to-end tests | Partly met historically; met at the frozen build | 139 unit tests across 13 files, 4 end-to-end tests |
| NFR12 | Publish source under a permissive licence | Met | MIT licence |

### NFR7 implementation

- React escapes rendered model and repository text; the application does not use `dangerouslySetInnerHTML`.
- Repository-derived values are not rendered directly as `href` or `src` values.
- Repository paths are validated.
- CSV cells are escaped against formula injection.

### NFR11 evidence

At frozen source commit `e7d7efe`, 139 unit tests across 13 files and four end-to-end tests passed. An earlier Node 18 workflow prevented CI from reporting for about five weeks; local checks continued and CI was later corrected to Node 20.

For coverage by requirement, see [`TRACEABILITY_MATRIX.md`](TRACEABILITY_MATRIX.md).
