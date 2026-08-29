# Architecture

Browser-based single-page application. Ingestion, analysis, indexing and presentation all run in
the client. Grounded question answering is the single server-side exception: the question and the
selected excerpts cross to a Vercel edge function, which holds the model credential.

The rendered diagram is [`../figure1_architecture.png`](../figure1_architecture.png), generated
from [`../figure1_architecture.dot`](../figure1_architecture.dot). Every node and edge in it was
derived by reading the source at the frozen commit; the verification record, including the three
claims that came back only partly true, is [`../figure1_provenance.md`](../figure1_provenance.md).

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

## Component documents

| Document | Covers |
| --- | --- |
| [`ingestion.md`](ingestion.md) | What is fetched, what is excluded and why, and how coverage is reported |
| [`retrieval.md`](retrieval.md) | The TF-IDF index and excerpt selection |
| [`static-analysis.md`](static-analysis.md) | Imports, exports, the import graph and technology detection |
| [`grounded-qa.md`](grounded-qa.md) | Prompt assembly, the edge function and the streaming protocol |
| [`verification-layer.md`](verification-layer.md) | The intervention the study measures, and its limits |
