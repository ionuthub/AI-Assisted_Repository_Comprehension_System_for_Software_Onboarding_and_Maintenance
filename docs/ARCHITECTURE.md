# Architecture

The artefact is a React single-page application. Repository ingestion, analysis, indexing and presentation run in the browser. Grounded question answering uses a Vercel edge function so the Gemini API key remains server-side.

The architecture figure is [`figure1_architecture.png`](figure1_architecture.png). That figure documents the frozen study architecture. The current post-study retrieval changes are described below and should not be projected backwards onto the participant study.

## Data flow

1. **Ingestion:** a public GitHub URL is parsed. Repository metadata and the Git tree come from `api.github.com`; eligible file contents come from `raw.githubusercontent.com`. If GitHub truncates the first recursive tree response, the analyser recursively expands the affected subtrees instead of accepting a partial repository.
2. **Analysis:** JavaScript and TypeScript files are checked for imports, exports, functions, components and classes.
3. **Indexing:** every readable eligible file discovered from the complete Git tree is indexed with TF-IDF using smoothed IDF and cosine similarity.
4. **Presentation:** the browser shows the overview, file viewer, search, answers and source coverage.
5. **Evidence retrieval:** a wider lexical candidate pool is combined with file-path and symbol matches, then expanded through resolved imports and `usedBy` relationships.
6. **Question answering:** up to eight evidence files are selected, a query-relevant excerpt is taken from each and the evidence is sent to the edge function with the question.
7. **Verification:** the answer is shown beside the exact files, line ranges and excerpts supplied to the model.

## Ingestion

Main files: `src/lib/github.ts` and `src/lib/ingestionFilters.ts`.

Current limits:

| Limit | Value |
| --- | --- |
| Fixed file-count cap | **None** |
| File size | 5 MB per file |
| Fetch timeout | 10 seconds per file |
| Concurrent content fetches | 8 |

There is no 50-file, 100-file or other arbitrary repository file-count ceiling in the current artefact. All eligible source and configuration files discovered from the Git tree are selected for ingestion.

GitHub's recursive Trees API can return a truncated response for a very large tree. The analyser does not use that partial response as the corpus. It fetches the immediate tree and recursively expands affected child tree SHAs until each returned subtree is complete. If GitHub cannot provide a complete non-recursive tree, ingestion fails explicitly rather than silently analysing a known-partial repository.

Installed dependencies, generated dependency manifests, build output, unsupported formats, unsafe paths and files larger than 5 MB are excluded with a recorded reason. These are content-scope filters, not a repository file-count cap.

Only public repositories are supported. There is no authentication path for private repositories.

## Retrieval

Main files: `src/lib/semanticSearch.ts` and `src/lib/retrievalPipeline.ts`.

The first retrieval stage remains lexical and deterministic. It does not yet use embeddings or a vector database. The final artefact improves on the frozen three-file pipeline by combining several signals:

- TF-IDF whole-file ranking over a 24-file candidate pool;
- query overlap with file paths;
- query overlap with parsed exports, functions, components, classes and import names;
- expansion from strong candidates to resolved imports and files that import them;
- a fallback to highly connected files for broad questions with sparse lexical matches.

Current settings:

| Setting | Value |
| --- | --- |
| Candidate files | 24 |
| Structural seed files | 6 |
| Maximum evidence files | 8 |
| Excerpt size | 2,200 characters per file |
| Search results shown | 10 |
| Server context ceiling | 22,000 characters |

The candidate/evidence values above bound what is sent to the language model for one question; they do **not** limit repository ingestion or indexing. The full eligible repository corpus remains searchable and available to retrieval.

This keeps exact identifier matching and reproducibility while improving questions whose answer is distributed across callers, callees and configuration. It still does not solve vocabulary mismatch as fully as a learned semantic retriever could, so embedding-based retrieval remains a planned comparison rather than a current claim.

## Static analysis

Main files: `src/lib/staticAnalysis.ts` and `src/lib/repositoryScanner.ts`.

The parser uses regular expressions over common JavaScript and TypeScript module syntax. It is not a full AST parser.

Import paths are resolved where possible and used to build `usedBy` relationships. The final retrieval pipeline now uses those relationships to supplement direct lexical matches.

## Question answering

The client builds the request in `src/pages/Index.tsx`. The server function is `api/explain-code.ts`.

Only the question and selected excerpts are sent to the server. Whole repositories are not sent to Gemini.

The edge function:

- checks the request origin;
- applies request and context limits;
- applies rate limiting when Upstash Redis is configured;
- reads the Gemini API key from the server environment;
- calls `gemini-3.6-flash` by default unless `GEMINI_MODEL` overrides it;
- streams the response back to the browser.

The prompt requires repository-specific claims to be grounded in the supplied context, file paths to be cited and direct evidence to be distinguished from inference. If evidence is insufficient, the model is instructed to say so rather than invent repository behaviour.

## Evidence panel

Main files: `src/components/EvidencePanel.tsx` and `src/components/WorkspaceQAView.tsx`.

For each answer, the panel shows:

- retrieved files in rank order;
- the retrieval reason and hybrid ranking score;
- line ranges;
- the excerpts sent to the model;
- named file paths that were not retrieved;
- repository source coverage.

The evidence is created before the model response is received. A path invented by the model therefore cannot appear as retrieved evidence.

The ranking score combines retrieval signals. It is not an accuracy or correctness probability. The panel supports checking; it does not prove that an answer is correct.

## Security boundary

The Gemini key never enters the client bundle. The browser calls only `/api/explain-code` for generation.

Rate limiting is conditional. If the Upstash Redis variables are missing, the server continues without the 15-requests-per-minute limit.

For the frozen study requirements and known limitations, see [`REQUIREMENTS.md`](REQUIREMENTS.md). Current limitations are summarised in [`LIMITATIONS.md`](LIMITATIONS.md).
