# Figure 1 — provenance

Record of how the architecture diagram was derived, so each element can be defended against the
source rather than against the prose it was drawn from.

| | |
| --- | --- |
| Commit inspected | **`79dafba`** |
| Date of inspection | 22 August 2026 |
| Files produced | `docs/figure1_architecture.dot`, `docs/figure1_architecture.png` |
| Render command | `dot -Tpng -Gdpi=400 docs/figure1_architecture.dot -o docs/figure1_architecture.png` |
| Rendered size | 3289 × 5269 px; at 15 cm wide that is 24.0 cm tall and ~557 effective dpi |

## Which commit, and why

`79dafba` is a real source commit, not merely a deployment identifier, so it was used directly.
It is also the deployed build recorded in `study/PHASE3_PROTOCOL.md`. Its application source is
byte-identical to `e7d7efe`:

    git diff --quiet e7d7efe 79dafba -- src/ api/ package.json package-lock.json \
      vite.config.ts index.html tailwind.config.ts postcss.config.js

returns success, because `e7d7efe..79dafba` changes only `study/` prose and `analysis/`. Either
commit therefore yields the same figure; `79dafba` is quoted because it is the SHA a session
records.

No application file was modified. Only `docs/` was added.

## Method

Each claim was checked by reading the implementation. Comments, README text and the protocol
document were not accepted as evidence for any claim; where a comment and the code agreed, the
code line is cited. Line numbers are as at `79dafba`.

## Claim-by-claim result

**Summary: 16 CONFIRMED, 3 PARTLY, 0 WRONG.** The three PARTLY results are claims 1, 15 and 17.

### Ingestion

**1. Source files are fetched through the GitHub API — PARTLY.**
Repository metadata and the file tree come from `api.github.com`
(`src/lib/github.ts:242`, `:247`). **File contents do not.** They are fetched from
`https://raw.githubusercontent.com` (`src/lib/github.ts:301`, called from `:218`). The comment at
`:292-294` gives the reason: raw needs no authentication and is not charged against the API
request budget, which matters when ingestion fetches up to fifty files in a burst. The
development CSP at `vite.config.ts:40` lists both hosts, which corroborates it.
*The figure shows one GitHub node naming both endpoints.*

**2. A public GitHub URL is the only accepted input — CONFIRMED.**
`TAB_MODES` contains only `GITHUB` (`src/constants/appConstants.ts:9-11`). `parseGitHubUrl`
rejects any host other than `github.com` / `www.github.com` (`src/lib/github.ts:73`).
`getGitHubHeaders` sends `Accept` only, with no `Authorization` (`:6-8`), so there is no
private-repository path. There is no ZIP parser, no `webkitdirectory` and no directory picker
anywhere in `src/`. The only `<input type="file">` in the application is the answer-key JSON
import on the evaluation page (`src/pages/Evaluation.tsx:291`), which is study material, not
repository ingestion.

**3. Vendored directories, build output and lock files are excluded, and the exclusions are
reported to the user — CONFIRMED.**
`IGNORED_DIRECTORIES` (`src/lib/ingestionFilters.ts:11-29`) covers `node_modules`,
`bower_components`, `vendor`, `dist`, `build`, `out`, `coverage`, `target`, `.git`, `.next`,
`.nuxt`, `.svelte-kit`, `.cache`, `.turbo`, `.venv`, `__pycache__`, `site-packages`, matched on
whole path segments rather than substrings (`:38-45`). `GENERATED_FILES` covers nine lockfiles
(`:57-67`). `partitionTreeFiles` attaches a reason to every exclusion
(`src/lib/github.ts:151-179`), which reaches `ingestion.excluded` (`:276-283`).
`CoveragePanel` groups them by reason and shows the count
(`src/components/CoveragePanel.tsx:13`, `:39`, `:97`), rendered from `src/pages/Index.tsx:603`. A
toast also summarises coverage at ingestion (`src/hooks/useProjectManagement.ts:55-60`).

Worth knowing for the caption: the claim understates the filter. Files are also excluded for
unsafe path, unsupported extension, exceeding 5 MB, exceeding the 50-file limit, and failing to
load, each with its own recorded reason.

### Analysis

**4. Technology stack detection happens here — CONFIRMED.**
`scanRepository` detects frameworks and technologies
(`src/lib/repositoryScanner.ts:240`, `:275`) and is invoked inside the store's `setProject`
alongside the per-file analysis (`src/store/useProjectStore.ts:4`). See the caveat under claim 18
about *when* within that step it runs.

**5. Each file is parsed for imports, exports, functions, components and classes — CONFIRMED.**
`FileAnalysisResult` declares exactly those five fields
(`src/lib/staticAnalysis.ts:7-14`), populated per file by `analyzeCodeFile`
(`src/store/useProjectStore.ts:63`). Parsing is regular-expression based over JavaScript and
TypeScript syntax; it is not a full parse, and non-JS/TS files yield no imports.

**6. The import graph is resolved and used to rank files by how many other indexed files import
them — CONFIRMED.**
`resolveImportPath` resolves relative and `@/` specifiers, including extensionless imports
(`src/lib/staticAnalysis.ts:22`, `:54`). `computeWorkspaceReferences` builds a `usedBy` list, and
only counts an import when the resolved path is itself an analysed file
(`:268-289`). `RepositoryOverview` sorts by that count to produce the most-depended-on list
(`src/components/RepositoryOverview.tsx:40`, `:52-53`, `:128-130`). The claim's wording
"other **indexed** files" is exactly right and should be kept: a file outside the 50-file cap can
neither appear in the ranking nor contribute to another file's count.

### Indexing

**7. Term-frequency based, not neural — CONFIRMED.**
`SearchIndex` holds `docVectors` (path → term → TF-IDF weight), `idf` and per-document
`magnitudes` (`src/lib/semanticSearch.ts:21-25`). IDF is smoothed,
`log((N + 1) / (df + 1)) + 1` (`:106`); document vectors are TF × IDF (`:124-128`); similarity is
cosine via the stored magnitudes (`:132`, `:187`). No embedding model, vector database or network
call appears anywhere in the retrieval path.

**8. There is a fifty-file cap on the index — CONFIRMED, with a precision worth stating.**
`MAX_FILES_TO_ANALYZE = 50` (`src/lib/github.ts:12`) is applied during **ingestion**, not in the
index builder: `partitionTreeFiles` takes the first fifty analysable blobs and records every
further file as excluded with the reason "Over the 50-file limit" (`:173-176`). The cap therefore
bounds what is fetched, and the index is built over whatever survived. `buildSearchIndex` itself
imposes no limit. The distinction matters if a marker asks whether a large repository is
partially indexed or partially fetched: it is partially fetched.

### Presentation

**9. Overview, search, question answering, file viewer, and the study evaluation suite —
CONFIRMED.**
Two routes: `/` and `/evaluation` (`src/App.tsx:37-38`). Within `/`, the workspace views are
`overview | code | search | qa` (`src/pages/Index.tsx:65`), where `code` is the file viewer. The
coverage panel is a fifth surface and is drawn in the figure, since it is where the exclusions of
claim 3 become visible to the participant.

### Verification layer

**10. Runs client-side — CONFIRMED.**
`EvidencePanel` and `WorkspaceQAView` are React components rendered in the browser. The evidence
list is assembled during retrieval, before the network call
(`src/pages/Index.tsx:241-263`), and the unverified-mentions list is computed in the browser from
the returned answer text (`src/components/WorkspaceQAView.tsx:56`). Nothing in the verification
path involves the server.

**11. Displays, beside every answer: each retrieved file in rank order, its relevance score, the
line range supplied, and the excerpt actually sent — CONFIRMED.**
Rank index (`src/components/EvidencePanel.tsx:132`), score to two decimals and as a bar
(`:139`, `:152`), "Lines *start*–*end* of *total*" (`:157`), and the excerpt itself (`:163`). It
additionally reports omitted lines and characters (`:158-160`).

The stronger property behind the claim, worth a sentence in the write-up: the evidence record is
built from the retrieval result and the excerpt actually appended to `systemContext`
(`src/pages/Index.tsx:252-263`), never by parsing the model's output. A path the model invents
therefore cannot be presented as a source.

**12. Lists separately any path the answer names that retrieval did not return — CONFIRMED.**
`MENTIONED_PATH` extracts path-like strings from the answer
(`src/components/WorkspaceQAView.tsx:38`); those not in the evidence set become
`unverifiedMentions`, each with a reason (`:56-64`), rendered in its own bordered section of the
panel (`src/components/EvidencePanel.tsx`, "Unverified mentions").

### Server boundary

**13. Only the question and the selected excerpts cross — CONFIRMED.**
The request body is `{ messages: [{ role: 'user', content: questionText }], systemContext, stream }`
(`src/pages/Index.tsx:282-286`). `systemContext` is a fixed preamble plus, per retrieved file, one
`--- File: path (lines a-b of c) ---` header and a region of at most `RAG_CONTEXT_CHARS`
characters (`:236-253`). With `RAG_TOP_K = 3` and `RAG_CONTEXT_CHARS = 2500`
(`src/constants/appConstants.ts:34-38`) the evidence is bounded at 7,500 characters. No whole file
and no file list crosses the boundary.

**14. The serverless/edge function proxies the model call — CONFIRMED.**
`export const config = { runtime: 'edge' }` (`api/explain-code.ts:296-298`). The function calls
`https://generativelanguage.googleapis.com/v1beta/models/...` server-side (`:138`) and returns
either JSON or an NDJSON stream to the browser.

**15. It enforces an origin allowlist and rate limiting — PARTLY.**

*Origin allowlist: enforced, unconditionally.* Membership of `ALLOWED_ORIGINS` is the only test
(`api/explain-code.ts:45-46`), and a request whose `Origin` is missing or unlisted is rejected with
403 (`:95-97`). The comment at `:92-94` records that an earlier version skipped the check when the
header was absent, which left the endpoint reachable by non-browser clients.

*Rate limiting: conditional.* The Redis client is constructed only when **both**
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, and is `null` otherwise
(`:62-67`). The limiter — 15 requests per minute per IP — sits inside `if (redis)` (`:101-108`).
**With Redis unconfigured the function applies no rate limit at all**, and there is no warning in
the response or the logs.

Two further points a marker may probe. Whether the deployment sets those variables cannot be
determined from the repository; it must be checked in the hosting dashboard. And the client-side
limiter in `src/lib/security.ts:73`, used before repository analysis
(`src/hooks/useProjectManagement.ts:34`), is a usability guard in the browser, not a server
control, and should not be described as one.

**16. The model API key is read from the server environment and never reaches the client —
CONFIRMED.**
`process.env.GEMINI_API_KEY` is read inside the edge handler (`api/explain-code.ts:130`) and used
only in the server-to-Gemini request URL (`:138`). The name carries no `VITE_` prefix, so Vite will
not inline it into the client bundle, and the browser's only outbound call for generation is to
the same-origin path `/api/explain-code` (`src/pages/Index.tsx:279`).

**17. The model called is `gemini-3.5-flash` — PARTLY.**
That is the **default** (`api/explain-code.ts:23`). The effective model is
`process.env.GEMINI_MODEL` whenever that variable is set (`:25`), with the comment at `:20-22`
noting the indirection exists so a model retirement can be handled by configuration. What the
deployment actually used cannot be established from the source. The captured gate files record
`"model": "gemini-3.5-flash"`, which is the researcher's declaration rather than an observation
made by the code.
*The figure prints `gemini-3.5-flash`; the caption should add "(default; overridable by
`GEMINI_MODEL`)".*

### Flow

**18. Ingestion → Analysis → Indexing → Presentation — CONFIRMED, with one caveat.**
Ingestion completes inside `fetchRepositoryProject` before the project enters the store. Within
`setProject` the order is per-file analysis (`src/store/useProjectStore.ts:63`) →
`computeWorkspaceReferences` (`:66`) → `buildSearchIndex` (`:68`), after which presentation renders
from the store.

Caveat: `scanRepository`, the technology detection of claim 4, is evaluated in the same `set(...)`
call *after* `buildSearchIndex`. The data dependency order is as the figure shows, but the
execution order inside that one synchronous step is analysis → indexing → stack detection. If the
dissertation says the stages execute strictly in sequence, that sentence is slightly stronger than
the code; "the data flows through four stages in this order" is accurate.

**19. Session data is exported as JSON and CSV from the client — CONFIRMED.**
`download` builds a `Blob`, creates an object URL and clicks a synthetic anchor
(`src/lib/evaluation/session.ts:300-308`). Both the JSON payload and `sessionToCsv` output go
through it. No upload endpoint exists; the files never leave the participant's machine except by
the observer moving them.

## Step 2 — present in the code, absent from the claims

Included in the figure:

1. **`raw.githubusercontent.com`** as a second external endpoint (claim 1).
2. **Upstash Redis**, an optional external dependency of the edge function
   (`api/explain-code.ts:62-67`). Drawn dashed because the function runs without it.
3. **The answer-key JSON import** as the input to the evaluation suite
   (`src/pages/Evaluation.tsx:291`).
4. **Client state** as an explicit node. `useProjectStore` holds the files, analyses, index and a
   path-keyed LRU file cache, and everything downstream reads from it rather than from ingestion.
5. **The streaming return path.** The function answers with newline-delimited JSON events carrying
   `finishReason` and `usageMetadata` (`api/explain-code.ts:193-282`), so a truncated answer cannot
   look identical to a complete one.

Not drawn, but worth knowing:

6. **`src/lib/generationProtocol.ts` is a shared contract** imported by the client
   (`WorkspaceQAView.tsx`, `Index.tsx`), the edge function and the Vite dev server. It is a code
   dependency rather than a runtime boundary, so it would clutter the figure.
7. **A development-only second path to Gemini.** `vite.config.ts:50-75` implements
   `/api/explain-code` as dev middleware calling the same Gemini endpoint, sharing
   `promptBuilder.ts` with the deployed function. It is not part of the deployed architecture, and
   the protocol requires every session to run against the deployed build, so it is out of scope for
   the figure — but it exists and a marker reading the repository will see it.
8. **The prompt is assembled in two places.** A preamble is written client-side
   (`src/pages/Index.tsx:236`) and is then nested inside the server's system instruction built by
   `buildSystemPrompt` (`src/lib/promptBuilder.ts`). The figure shows one prompt crossing the
   boundary, which is true of the payload, but the text has two authors.
9. **Three `localStorage` keys**: `rcs_evaluation_session_v1` (session resume,
   `sessionStorage.ts:36`), `rcs_pilot_metrics_v1` (timings, exported with the session,
   `metrics.ts:23`), and `recent_repos` (`Index.tsx:157`). Client-side persistence is a real
   boundary for an ethics reader, since a partially completed session is written to the machine.

## Limits of this verification

- Every result above is a statement about the source at `79dafba`. It is not a statement about the
  running deployment. Claims 15 and 17 both depend on environment variables whose values are not in
  the repository, and cannot be settled from code.
- Nothing here was executed against a live repository. The claims were verified by reading, and by
  the existing unit tests where they cover the same behaviour, not by observing traffic.
- Claim 5's parsing is regex-based. This record confirms that the five categories are extracted; it
  does not certify that extraction is correct for every syntax.
