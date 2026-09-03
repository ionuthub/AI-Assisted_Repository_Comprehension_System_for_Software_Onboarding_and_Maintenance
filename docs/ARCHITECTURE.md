# Architecture

The artefact is a React single-page application. Repository ingestion, analysis, indexing and presentation run in the browser. Grounded question answering uses a Vercel server function so the Gemini API key remains server-side.

## Data flow

1. **Ingestion:** a public GitHub URL is parsed and eligible repository files are fetched.
2. **Analysis:** JavaScript and TypeScript files are inspected for imports, exports and code structure.
3. **Indexing:** eligible files are indexed with TF-IDF.
4. **Retrieval:** lexical ranking is combined with file-path, symbol and import-graph signals.
5. **Question answering:** selected evidence excerpts and the question are sent to the server function.
6. **Verification:** the generated answer is shown alongside the evidence supplied to the model.

## Ingestion

Main files: `src/lib/github.ts` and `src/lib/ingestionFilters.ts`.

- Public GitHub repositories only.
- Files larger than 5 MB are excluded.
- File fetches use a timeout and bounded concurrency.
- If GitHub returns a truncated recursive tree, affected subtrees are expanded instead of accepting known-partial coverage.

## Retrieval

Main files: `src/lib/semanticSearch.ts` and `src/lib/retrievalPipeline.ts`.

The retrieval pipeline is deterministic and primarily lexical. It combines TF-IDF with file-path and symbol matches, then expands strong candidates through resolved imports and `usedBy` relationships. The full eligible repository remains indexed; only the evidence sent to the language model is bounded.

Current Q&A limits:

| Setting | Value |
| --- | ---: |
| Candidate files | 24 |
| Structural seed files | 6 |
| Maximum evidence files | 8 |
| Excerpt size | 2,200 characters per file |
| Server context ceiling | 22,000 characters |

## Static analysis

Main files: `src/lib/staticAnalysis.ts` and `src/lib/repositoryScanner.ts`.

The analyser uses regular expressions over common JavaScript and TypeScript syntax rather than a full AST parser. Resolved imports are used to build file relationships and support retrieval.

## Question answering

The client request is built in `src/pages/Index.tsx`; the server function is `api/explain-code.ts`.

Only the question and selected evidence excerpts are sent to Gemini. The server checks origin, request size, context size and timeout limits, keeps the API key server-side and applies rate limiting when Upstash Redis is configured.

The generation prompt requires repository-specific claims to be grounded in the supplied evidence and instructs the model to acknowledge insufficient evidence rather than invent repository behaviour.

## Evidence

Main files: `src/components/EvidencePanel.tsx` and `src/components/WorkspaceQAView.tsx`.

The interface shows retrieved files, ranking information, line ranges, excerpts and repository coverage. Evidence is assembled before generation, so a path invented by the model cannot become retrieved evidence. Retrieval scores are ranking signals, not correctness probabilities.

## Architecture figure

See [`figure1_architecture.png`](figure1_architecture.png).
