# Retrieval

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
