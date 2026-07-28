# Selecting the opening suggested questions by measurement

The overview offers three fixed questions, identical for every repository and every
participant. They are the first thing most participants will click, so if they behave
differently between the two study repositories they introduce a difference between conditions
that has nothing to do with the intervention.

The original three were written for readability. They were then measured against the real
retrieval code, indexing both study repositories exactly as the application does — same
directory exclusions, same generated-file exclusions, same fifty-file cap.

## What the original wording did

Top-ranked cosine similarity, and whether the file a developer would consider correct was
retrieved at all:

| Question | warehouse-dispatch | clinic-triage |
| --- | --- | --- |
| Where does execution start in this project? | 0.043 — `src/main.tsx` not retrieved | 0.086 — `src/main.tsx` not retrieved |
| How is the code organised, and what depends on what? | 0.094 | **no results at all** |
| Where would I add a new feature? | 0.059 → `utils/formatters.ts` | 0.120 → `data/seed.ts` |

For scale, the twenty-four accuracy-gate stems produce a median top-ranked score of 0.27, a
90th percentile of 0.59 and a maximum of 0.67. All six figures above are failures against that
distribution.

Two distinct problems are visible. The first is that a question phrased in vocabulary *about*
code shares no terms with the code itself: `src/main.tsx` contains `createRoot`, `StrictMode`,
`document` and `getElementById`, and none of those appear in "where does execution start", so
the correct file scores zero and never enters the candidate set. This is the defining
limitation of lexical retrieval rather than a defect in the implementation, and it is reported
as a finding.

The second is more serious for the design. The second question returns five files in one
repository and nothing whatsoever in the other, because every one of its terms is absent from
the clinic-triage index. A query with no indexed terms produces a zero-magnitude vector and
retrieval returns an empty set, so the question reaches the model with no repository context.
The two conditions would therefore have behaved differently on a prompt every participant is
offered, decided by nothing more principled than which words happened to appear in comments.
In a matched-pair design that is a defect in the instrument, not a limitation to note.

## Selection criteria

Forty candidate questions were measured. A candidate was admissible only if it satisfied all
four of:

1. **Retrieves.** At least three results in both repositories.
2. **Retrieves well.** Lower of the two top-ranked scores at least 0.20, against a gate median
   of 0.27.
3. **Retrieves symmetrically.** Ratio between the two top-ranked scores no worse than 1.6, and
   the same file ranked first in both repositories. Equal scores pointing at different parts
   of the two repositories is not a match.
4. **Names no task target.** No term belonging to any of the seven planted architectural
   patterns, to any timed task, or to either accuracy-gate item set. A suggested question that
   named one would prompt the assisted condition towards a scored target before the task
   began, and only in that condition.

## Result

| Question | warehouse-dispatch | clinic-triage | Top file in both |
| --- | --- | --- | --- |
| What is the top-level structure of the React app? | 0.393 | 0.394 | `src/main.tsx` |
| How does a page get the data it displays? | 0.345 | 0.274 | `src/App.tsx` |
| How is the app styled? | 0.308 | 0.295 | `src/main.tsx` |

All three sit at or above the gate median, agree between repositories to within a factor of
1.26, and rank the same file first in both.

## Why they point at scaffolding

Every admissible candidate retrieved framework files — the entry point, the application root,
the stylesheet — rather than anything in the problem domain. That is a consequence of criterion
4 rather than a weakness in the search. In a domain-specific repository the only files a
domain-neutral question can reach are the scaffolding ones; anything reaching further would
have to use domain vocabulary, and in these two repositories the domain vocabulary is exactly
what the timed tasks are about.

This is the right outcome for what the strip is for. Its purpose is to give a participant a
frictionless first interaction that demonstrates the interface and the evidence panel. Warm-up
prompts that retrieve reliably, behave identically across conditions and touch nothing that is
scored serve that purpose. Prompts that carry the participant into a task target would not.

## Constraint on further change

The wording is quoted in the protocol and shown to every participant. It must not change once
data collection has begun. Any future edit must be re-measured against both repositories using
the criteria above, and the accuracy gate must be re-run against the frozen build.

## Reproducing this

The measurement indexes both repositories through `buildSearchIndex` and `searchRepository`
from `src/lib/semanticSearch.ts`, applying `isExcludedFromIngestion` and the fifty-file cap so
the indexed set matches what the application sees. The invariants that survive as regression
tests are in `src/components/SuggestedQuestions.test.tsx`, which fails if any suggested
question acquires a task-target or domain term.
