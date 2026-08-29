# Architecture

The artefact is a React single-page application. Repository ingestion, analysis, indexing and presentation run in the browser. Grounded question answering uses a Vercel edge function because the Gemini API key must stay server-side.

The architecture figure is [`figure1_architecture.png`](figure1_architecture.png). Its source checks are summarised in [`figure1_provenance.md`](figure1_provenance.md).

## Data flow

1. **Ingestion:** a public GitHub URL is parsed. Repository metadata and the tree come from `api.github.com`; file contents come from `raw.githubusercontent.com`.
2. **Analysis:** JavaScript and TypeScript files are checked for imports, exports, functions, components and classes.
3. **Indexing:** files are indexed with TF-IDF using smoothed IDF and cosine similarity.
4. **Presentation:** the browser shows the overview, file viewer, search, answers and coverage.
5. **Question answering:** the top three files are retrieved and a query-relevant excerpt is taken from each. The question and excerpts are sent to the edge function, which calls Gemini.
6. **Evidence:** the answer is shown beside the retrieved files and excerpts.

## Ingestion

Main files: `src/lib/github.ts` and `src/lib/ingestionFilters.ts`.

Limits:

| Limit | Value |
| --- | --- |
| Files indexed | 50 |
| File size | 5 MB |
| Fetch timeout | 10 seconds |
| Concurrent fetches | 6 |

Excluded files are recorded with a reason. This includes vendored folders, build output, lockfiles, unsupported files, unsafe paths, files over the limits and files that could not be read.

The 50-file limit is applied during ingestion. This means a large repository is only partly fetched and analysed. The coverage panel makes this visible.

Only public repositories are supported. There is no authentication path for private repositories.

## Retrieval

Main file: `src/lib/semanticSearch.ts`.

Retrieval is lexical and deterministic. It does not use embeddings or a vector database.

Key settings:

| Setting | Value |
| --- | --- |
| `RAG_TOP_K` | 3 files |
| `RAG_CONTEXT_CHARS` | 2,500 characters per file |
| `SEARCH_RESULT_LIMIT` | 10 results |

The maximum evidence sent for an answer is 7,500 characters. The server context limit is 12,000 characters.

This approach works well when the question and source use similar words. It can miss relevant files when they use different vocabulary.

## Static analysis

Main files: `src/lib/staticAnalysis.ts` and `src/lib/repositoryScanner.ts`.

The parser uses regular expressions over common JavaScript and TypeScript module syntax. It is not a full AST parser.

Import paths are resolved where possible and used to build `usedBy` relationships. The overview ranks files by the number of indexed files that import them. Files outside the 50-file limit cannot affect this ranking.

## Question answering

The client builds the request in `src/pages/Index.tsx`. The server function is `api/explain-code.ts`.

Only the question and selected excerpts are sent to the server. Whole repositories are not sent.

The edge function:

- checks the request origin;
- applies request and context limits;
- applies rate limiting when Upstash Redis is configured;
- reads the Gemini API key from the server environment;
- calls `gemini-3.5-flash` by default, unless `GEMINI_MODEL` overrides it;
- streams the response back to the browser.

## Evidence panel

Main files: `src/components/EvidencePanel.tsx` and `src/components/WorkspaceQAView.tsx`.

For each answer, the panel shows:

- retrieved files in rank order;
- relevance scores;
- line ranges;
- the excerpts sent to the model;
- named file paths that were not retrieved;
- repository coverage.

The evidence is created from retrieval before the model response is received. A path invented by the model therefore cannot appear as retrieved evidence.

The panel helps the user check an answer. It does not prove that the answer is correct.

## Security boundary

The Gemini key never enters the client bundle. The browser calls only `/api/explain-code` for generation.

Rate limiting is conditional. If the Upstash Redis variables are missing, the server continues without the 15-requests-per-minute limit.

For detailed requirements and known limits, see [`REQUIREMENTS.md`](REQUIREMENTS.md) and [`LIMITATIONS.md`](LIMITATIONS.md).
