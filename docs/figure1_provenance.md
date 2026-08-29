# Figure 1 provenance

The architecture figure was checked against the application source used by the participant deployment.

| Item | Value |
| --- | --- |
| Historical deployment commit | `79dafba` |
| Application source commit | `e7d7efe` |
| Inspection date | 22 August 2026 |
| Figure source | `docs/figure1_architecture.dot` |
| Rendered figure | `docs/figure1_architecture.png` |

After the 29 August history normalisation, the old hashes remain valid through `archive/pre-reauthor` and the mapping in `study/SHA-MAP-REAUTHOR.md`.

## Method

Each architecture claim was checked against source code at the frozen build. Comments and existing documentation were not used as proof.

**Result: 16 confirmed, 3 partly confirmed, 0 wrong.**

## Claim summary

| # | Claim | Result | Main evidence |
| --- | --- | --- | --- |
| 1 | GitHub provides repository data | Partly | Metadata and tree use `api.github.com`; file contents use `raw.githubusercontent.com` |
| 2 | Input is a public GitHub URL | Confirmed | `parseGitHubUrl`, unauthenticated requests |
| 3 | Unsuitable files are excluded and reported | Confirmed | `ingestionFilters.ts`, `partitionTreeFiles`, `CoveragePanel.tsx` |
| 4 | Technology detection is present | Confirmed | `repositoryScanner.ts` |
| 5 | JS/TS files are checked for imports, exports, functions, components and classes | Confirmed | `staticAnalysis.ts` |
| 6 | Resolved imports are used to rank indexed files | Confirmed | `computeWorkspaceReferences`, `RepositoryOverview.tsx` |
| 7 | Retrieval is TF-IDF, not neural | Confirmed | `semanticSearch.ts` |
| 8 | The 50-file limit is applied during ingestion | Confirmed | `github.ts` |
| 9 | Overview, code, search, Q&A, coverage and evaluation views exist | Confirmed | `App.tsx`, `Index.tsx`, `Evaluation.tsx` |
| 10 | The evidence layer runs in the client | Confirmed | `EvidencePanel.tsx`, `WorkspaceQAView.tsx` |
| 11 | Evidence shows rank, score, line range and excerpt | Confirmed | `EvidencePanel.tsx` |
| 12 | Unretrieved named paths are listed separately | Confirmed | `WorkspaceQAView.tsx` |
| 13 | Only the question and selected excerpts are sent for generation | Confirmed | `Index.tsx` |
| 14 | A Vercel edge function proxies Gemini | Confirmed | `api/explain-code.ts` |
| 15 | Origin checks and rate limiting are applied | Partly | Origin check is always active; rate limiting needs Upstash Redis |
| 16 | The Gemini API key stays server-side | Confirmed | `api/explain-code.ts` |
| 17 | The model is `gemini-3.5-flash` | Partly | It is the default and can be changed with `GEMINI_MODEL` |
| 18 | Data flows from ingestion to analysis, indexing and presentation | Confirmed | `github.ts`, `useProjectStore.ts` |
| 19 | Session data exports from the client as JSON and CSV | Confirmed | `evaluation/session.ts` |

## Limits of this check

This was a source-code review, not a live network trace. Environment variables such as the deployed Gemini model and Upstash configuration cannot be proven from the repository alone.

The structural analyser is regex-based, so this check confirms the implemented behaviour rather than complete JavaScript or TypeScript parsing.
