# Requirements

These are the core requirements for the final artefact evaluated at commit `85ab075065732b3652acabf8f67d2cee33e14d6f`.

## Functional requirements

| ID | Requirement | Main implementation |
| --- | --- | --- |
| FR1 | Accept a public GitHub repository URL | `src/lib/github.ts` |
| FR2 | Ingest suitable source files and report exclusions | `src/lib/ingestionFilters.ts`, `src/lib/github.ts`, `CoveragePanel.tsx` |
| FR3 | Show repository technologies, languages and files | `repositoryScanner.ts`, `projectAnalyzer.ts`, `RepositoryOverview.tsx` |
| FR4 | Analyse file relationships using imports | `staticAnalysis.ts`, `RepositoryOverview.tsx` |
| FR5 | Provide ranked natural-language code search | `semanticSearch.ts`, `WorkspaceSearchView.tsx` |
| FR6 | Answer repository questions using retrieved evidence | `Index.tsx`, `api/explain-code.ts` |
| FR7 | Show supporting evidence for generated answers | `EvidencePanel.tsx` |
| FR8 | Flag file paths named in an answer that were not retrieved | `WorkspaceQAView.tsx` |
| FR9 | Report repository coverage | `github.ts`, `CoveragePanel.tsx` |
| FR10 | Inspect and explain selected files | `staticAnalysis.ts`, `FileInsightsPanel.tsx`, `CodeViewer.tsx` |

## Non-functional requirements

| ID | Requirement | Evidence |
| --- | --- | --- |
| NFR1 | Run in a current desktop browser | ES2020 build and Vercel deployment |
| NFR2 | Handle repository ingestion safely, including file-size and tree-recovery limits | `github.ts`, `github.test.ts` |
| NFR3 | Return stable retrieval results for the same query and index | `semanticSearch.ts`, retrieval tests |
| NFR4 | Keep the model API key server-side | `api/explain-code.ts` |
| NFR5 | Apply origin, request, context and timeout limits | `api/explain-code.ts`, `promptBuilder.ts` |
| NFR6 | Safely render untrusted repository and model content | React escaping and path validation |
| NFR7 | Contain runtime failures and show errors | `ErrorBoundary.tsx`, generation error handling |
| NFR8 | Provide keyboard and ARIA support for core interactions | component and end-to-end tests |
| NFR9 | Present evidence without claiming that an answer is automatically proven correct | `EvidencePanel.tsx` |
| NFR10 | Pass typecheck, lint, unit tests, production build and end-to-end tests | GitHub Actions CI |
| NFR11 | Publish source under a permissive licence | MIT licence |

For implementation-to-test mapping, see [`TRACEABILITY_MATRIX.md`](TRACEABILITY_MATRIX.md).
