# Architecture

Browser-based single-page application. Ingestion, analysis, indexing and presentation all run in
the client. Grounded question answering is the single server-side exception: the question and the
selected excerpts cross to a Vercel edge function, which holds the model credential.

The rendered diagram is [`figure1_architecture.png`](figure1_architecture.png), generated
from [`figure1_architecture.dot`](figure1_architecture.dot). Every node and edge in it was
derived by reading the source at the frozen commit; the verification record, including the three
claims that came back only partly true, is [`figure1_provenance.md`](figure1_provenance.md).

## Pipeline

    Public GitHub URL
            │
            ▼
    1. Ingestion            github.ts
       tree + metadata      api.github.com
       file contents        raw.githubusercontent.com
       50-file cap, exclusions recorded with reasons
            │
            ▼
    2. Analysis             staticAnalysis.ts, repositoryScanner.ts
       imports, exports, functions, components, classes
       import graph, technology detection
            │
            ▼
    3. Indexing             semanticSearch.ts
       TF-IDF, smoothed IDF, cosine similarity
            │
            ▼
    Client state            useProjectStore.ts (Zustand)
            │
            ├──────────────► 4. Presentation
            │                  overview, search, answers, file viewer, coverage
            │
            ▼
    Retrieval               top-3 files, 2,500-character excerpt each
            │
            ├──── question + selected excerpts only ────► Edge function ────► Gemini
            │     no whole files, no repository contents   api/explain-code.ts
            ▼
    Verification layer      EvidencePanel.tsx, WorkspaceQAView.tsx
       retrieved files in rank order, scores, line ranges,
       the excerpt actually sent, unverified mentions, coverage

## The trust boundary

Two things cross from client to server: the question, and the `systemContext` string containing a
fixed preamble plus one block per retrieved file. Each block carries a `--- File: path (lines a-b
of c) ---` header and at most `RAG_CONTEXT_CHARS` characters of that file. With `RAG_TOP_K = 3`
and `RAG_CONTEXT_CHARS = 2500` the evidence is bounded at 7,500 characters, inside the
12,000-character ceiling the function applies. No whole file and no file listing crosses.

The model API key is read from the server environment and used only in the server-to-Gemini
request. It carries no `VITE_` prefix, so the bundler cannot inline it, and the browser's only
outbound call for generation is to the same-origin path `/api/explain-code`.

## Two external endpoints, not one

Repository metadata and the file tree come from `api.github.com`. **File contents come from
`raw.githubusercontent.com`**, which needs no authentication and is not charged against the API
request budget — which matters when ingestion fetches up to fifty files in a burst. Descriptions
that say "files are fetched through the GitHub API" are true of the tree and false of the contents.

A third external dependency, Upstash Redis, is optional: it backs the rate limiter, and the
function runs without it.

## Contents

- [Ingestion](#ingestion) — what is fetched, what is excluded and why, and how coverage is reported
- [Retrieval](#retrieval) — the TF-IDF index and excerpt selection
- [Static analysis and the import graph](#static-analysis-and-the-import-graph)
- [Grounded question answering](#grounded-question-answering) — prompt assembly, the edge function, streaming
- [The verification layer](#the-verification-layer) — the intervention the study measures, and its limits

---

## Ingestion

`src/lib/github.ts`, with the exclusion rules in `src/lib/ingestionFilters.ts`.

## Sequence

1. Parse the URL. Any host other than `github.com` or `www.github.com` is rejected. Owner and
   repository names are validated against `^[a-zA-Z0-9_.-]+$`, with `.` and `..` rejected outright.
2. Fetch repository metadata from `api.github.com/repos/{owner}/{repo}`.
3. Fetch the recursive file tree from `.../git/trees/{default_branch}?recursive=1`.
4. Partition the tree into indexed and excluded, recording a reason for every exclusion.
5. Fetch the contents of the indexed files from `raw.githubusercontent.com`, six at a time.
6. Drop any file whose content could not be read, recording it as excluded rather than counting it
   as covered.

Requests are unauthenticated, which is what makes the tool public-only: there is no code path that
can read a private repository.

## Bounds

| Bound | Value |
| --- | --- |
| Files indexed | 50 |
| File size | 5 MB, checked from `Content-Length` before download and again after |
| Fetch timeout | 10 seconds per file, via `AbortController` |
| Concurrency | 6 |

The 50-file cap is applied **during ingestion**, not in the index builder. A large repository is
therefore partially *fetched*, and the index is built over whatever survived. This matters when
reading coverage figures: `buildSearchIndex` imposes no limit of its own.

## Exclusion reasons

Every excluded file carries one of: `In {directory}`, `Generated dependency manifest`,
`Not a supported source file`, `Larger than 5 MB`, `Over the 50-file limit`, `Unsafe path`, or
`Could not be read`.

Directory rules match **whole path segments**, never substrings. That is deliberate: a substring
rule excludes real source, because `dist` appears inside `src/utils/distance.ts` and `build` inside
`src/lib/builder.ts`, and those files would then be silently missing with no indication to the user.

Seventeen directories are excluded (`node_modules`, `bower_components`, `vendor`, `dist`, `build`,
`out`, `coverage`, `target`, `.git`, `.next`, `.nuxt`, `.svelte-kit`, `.cache`, `.turbo`, `.venv`,
`__pycache__`, `site-packages`) and nine lockfile names.

The filter matters more than it looks: on a repository that commits its dependencies, the file list
is capped and tree-ordered, so without it the entire budget goes to `node_modules`. That was
observed — 50 of 50 indexed files were dependencies, and the model correctly reported that the
entry point was not present.

## Coverage reporting

`fetchRepositoryProject` returns an `ingestion` summary: total repository files, total candidates,
files included, files with content, whether GitHub truncated the tree, and the full exclusion list.
`src/components/CoveragePanel.tsx` groups the exclusions by reason and displays the counts;
`src/hooks/useProjectManagement.ts` raises a toast at ingestion time. This is FR9, and it exists
because the cap means a claim about "the repository" is routinely a claim about fifty files.

---

## Retrieval

`src/lib/semanticSearch.ts`. Lexical, deterministic, entirely client-side.

## The index

A TF-IDF vector-space model with cosine similarity. For each file: tokenise, count term
frequencies, weight by inverse document frequency, store the vector and its magnitude.

- **Tokenisation** splits camelCase, PascalCase and snake_case, so `applyStockReservation`
  contributes `apply`, `stock`, `reservation` as well as the whole identifier.
- **IDF is smoothed**: `log((N + 1) / (df + 1)) + 1`. The unsmoothed `log(N / df)` it replaced
  gives zero weight to a term appearing in every document, which in a small repository silently
  discards the terms most characteristic of the project.
- **Similarity** is cosine, using the stored magnitudes.

There is no embedding model, no vector database and no network call in this path. The consequence
is determinism (NFR3): the same query against the same index returns the same files, in the same
order, with the same scores. `analysis/compare_runs.py` fails a comparison if retrieval drifts
between captures.

The limitation is lexical dependence: a relevant file ranks poorly when the query and the source
use different vocabulary. The dissertation discusses learned representations as future work.

## Parameters

Fixed in `src/constants/appConstants.ts`, in one place, so the configuration used for the accuracy
gate and for every participant session is the same and can be quoted directly:

| Parameter | Value | Meaning |
| --- | --- | --- |
| `RAG_TOP_K` | 3 | files retrieved as evidence for a question |
| `RAG_CONTEXT_CHARS` | 2500 | excerpt taken from each retrieved file |
| `SEARCH_RESULT_LIMIT` | 10 | results shown in the user-facing search |

`RAG_TOP_K × RAG_CONTEXT_CHARS` bounds the evidence at 7,500 characters, inside the
12,000-character ceiling the edge function applies. That relationship is asserted by
`src/lib/promptBuilder.test.ts`, so tuning these past the ceiling fails the build rather than
silently truncating evidence the panel reports as sent.

## Excerpt selection

`selectExcerptRegion` chooses the region of the file with the best query-term coverage, not the
head of the file. The line range reported in the evidence panel is the region actually sent, so a
citation can be checked against the file directly.

## Observed score distribution

Over the 24 accuracy-gate stems, each scored against the repository it was written for: n = 24,
minimum 0.042, median 0.248, 90th percentile 0.551, maximum 0.662. Recorded in
`study/question-scores.json` and reproducible with `npm run measure:questions`.

Cosine similarity between a short natural-language query and a source file is small in absolute
terms even when retrieval has worked. `SCORE_BAR_FULL_SCALE` in `EvidencePanel.tsx` is set to 0.55,
the 90th percentile above, so a correct top-ranked result does not render as a near-empty bar.
Under-trust is as much a calibration failure as over-trust.

---

## Static analysis and the import graph

`src/lib/staticAnalysis.ts` and `src/lib/repositoryScanner.ts`.

Targeted JavaScript and TypeScript parsing rather than a general-purpose AST framework. Sufficient
for the repository overview and the locating tasks, and narrower than comprehensive static analysis
of arbitrary JavaScript behaviour.

## Per file

`analyzeCodeFile` produces a `FileAnalysisResult` with five fields: `imports`, `exports`,
`functions`, `components`, `classes`. Parsing is regular-expression based over ES module syntax,
covering named imports, default imports and bare side-effect imports.

This is a real limit, not a quibble: the analyser recognises the syntax it was written for. A file
using a construct outside that set contributes nothing to the graph, and nothing warns that it did
not.

## The import graph

`resolveImportPath` resolves a specifier to a repository path, handling relative paths, the `@/`
alias and extensionless imports (`./utils` → `utils.ts` / `utils.tsx`).

`computeWorkspaceReferences` then walks every analysed file and appends the importer to the
imported file's `usedBy` list — **only when the resolved path is itself among the analysed files.**
`src/components/RepositoryOverview.tsx` sorts by the length of that list to produce the
most-depended-on ranking.

The qualifier matters and should not be dropped when describing FR4. A file outside the 50-file cap
can neither appear in the ranking nor contribute to another file's count, so the ranking is over
*indexed* files, not over the repository.

This was descoped from an interactive dependency graph to a ranked list; see
[`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md).

## Technology detection

`scanRepository` in `src/lib/repositoryScanner.ts` matches dependency manifests and file patterns
against a table of frameworks and libraries, each with a description and a rationale for its use.
It runs inside the store's `setProject`, alongside the per-file analysis.

One ordering nuance, recorded for accuracy: within that single synchronous step the order is
per-file analysis → `computeWorkspaceReferences` → `buildSearchIndex` → `scanRepository`. The
*data* flows through the four pipeline stages as drawn, but technology detection executes after
indexing. "The data flows through four stages in this order" is accurate; "the stages execute
strictly in sequence" is slightly stronger than the code.

---

## Grounded question answering

`src/pages/Index.tsx` assembles the request; `api/explain-code.ts` proxies it.

## What is assembled, and where

For each question the client retrieves the top three files, takes a query-relevant region of at
most 2,500 characters from each, and appends one labelled block per file to `systemContext`. The
same objects populate the evidence panel, so the panel reports the text that was actually sent.

If retrieval returns nothing, an explicit instruction is appended telling the model to say so in
the first sentence and not to describe specific files, functions or behaviour. Without it, an
ungrounded answer was presented in an interface that implies grounding — which is the exact
condition the study's over-trust probes are designed to create deliberately, not by accident.

The prompt has two authors, which is worth knowing when reading it: a preamble written client-side
in `Index.tsx`, nested inside the system instruction built server-side by
`src/lib/promptBuilder.ts`. `promptBuilder.ts` is shared by the edge function and the Vite dev
proxy and deliberately has no imports, because the function is bundled without the `@/` alias.

## The edge function

`api/explain-code.ts`, `runtime: 'edge'`. In order:

1. **Origin allowlist**, exact match against `ALLOWED_ORIGINS`. A missing `Origin` is rejected with
   403 — browsers always send it on a POST, so a request without one is not from the application. An
   earlier version skipped the check when the header was absent, which left the endpoint and the key
   it holds reachable by any non-browser client.
2. **Rate limit**, 15 requests per minute per address — **only if** both Upstash Redis variables are
   configured. Otherwise no limit is applied and nothing says so.
3. **Request validation**: at most 25 messages, each with a valid role and at most 10,000
   characters.
4. **Context clamp** to 12,000 characters. Non-string input yields an empty context rather than a
   coerced one, so a malformed request produces an ungrounded answer that says so, rather than a
   grounded-looking one.
5. **Generation**: `gemini-3.5-flash` by default, overridable by `GEMINI_MODEL`; temperature 0.7,
   4,096 output tokens; 60-second timeout.

## The streaming protocol

Responses stream back as newline-delimited JSON events defined in `src/lib/generationProtocol.ts`,
shared by client and server. The terminal event carries Gemini's `finishReason` and
`usageMetadata`, so a token-limited or safety-stopped answer cannot look identical to a completed
one. A stream that ends with incomplete JSON, or without a successful finish reason, is surfaced as
an error rather than as an answer.

This is why the accuracy-gate harness can reject incomplete generations rather than scoring a
truncated answer as a wrong one.

---

## The verification layer

This is the intervention the study measures. It is also the term most easily misread, so this
document separates two things that share the word "verification".

## A. The artefact's verification layer — a feature

`src/components/EvidencePanel.tsx` and `src/components/WorkspaceQAView.tsx`.

Beside every answer it displays:

- each retrieved file **in rank order**;
- its **relevance score**, to two decimals, and as a bar;
- the **line range** supplied, as `Lines a–b of c`, plus how many lines and characters were not
  sent;
- the **excerpt actually sent** to the model;
- **unverified mentions** — paths the answer names that retrieval did not return, each with a
  reason;
- **coverage** — how many files were indexed against how many the repository offered.

Two properties make it meaningful rather than decorative:

**Citations come from retrieval, never from the answer.** The evidence record is built during
retrieval, before the model is called, from the same objects appended to the prompt. A path the
model invents therefore cannot be presented as a source — it can only appear as an unverified
mention. Deriving citations by parsing the answer would produce the opposite behaviour.

**The no-evidence state is marked by more than colour.** Icon, border weight, a hatched background
and the wording itself, because a reader must be able to tell an answer with supporting files from
one without.

### What it does not do

> **The layer exposes evidence and unsupported references, but it does not establish that an answer
> is correct.**

It makes no judgement about the answer. The headings say what was retrieved and sent — deliberately
not whether the answer follows from it. An earlier heading read "Grounded", which was read as a
verdict, and appeared above answers that were outright refusals because retrieval had returned
files while the model found nothing in them. Whether an answer follows from its evidence is a
judgement only the reader can make, and inviting them to make it is the point.

The study result bears this out: 7 of 12 participants detected the seeded inaccurate answer, and
only 5 corrected it. Detection and recovery are distinct behaviours, and exposing evidence supports
the first more than the second.

## B. Accuracy-gate verification — research evaluation

A different activity entirely, and it belongs to the research method rather than to the artefact.

The 24 reference answers were drafted with AI assistance and then checked against the complete
study repositories through multiple adversarial verification passes, with cited file and line
ranges mechanically checked where possible. The researcher did not independently reconstruct every
reference answer line by line.

**The final binary correctness verdicts were made by the researcher** against the declared rubric,
recorded in `study/marking.*.md`, and totalled by `analysis/accuracy_gate.py` from that marking
record.

So the accurate statement is:

> Automated tooling supported reference checking and evidence validation. Final binary gate
> decisions were made by the researcher.

And not:

> AI automatically verified answer correctness.

The reference files retain the historical filename `ground-truth.*.md`. Their provenance is
tool-verified rather than independently human-established, and that is disclosed in
`study/AI-DISCLOSURE.md` and Appendix A. The capture harness enforces it: it requires an explicit
`--accept-tool-verified` flag and records the weaker provenance in the gate file, so the figure
cannot be reported without the qualification being visible.
