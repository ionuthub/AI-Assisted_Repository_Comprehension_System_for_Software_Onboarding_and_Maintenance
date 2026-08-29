# Functional requirements

FR1–FR12 as specified in Chapter 3 of the dissertation. Status is against the frozen build
evaluated in the study.

Each row cites the implementation. The citations were checked by reading the code, not by reading
comments or this repository's own prose; the same verification pass produced
[`docs/figure1_provenance.md`](../figure1_provenance.md).

| ID | Functional requirement | Status | Implementation |
| --- | --- | --- | --- |
| FR1 | Accept a repository from a public GitHub URL | Met | `src/lib/github.ts` — `parseGitHubUrl` rejects any host other than `github.com`; requests are unauthenticated, so only public repositories are reachable |
| FR2 | Ingest source files while excluding vendored, build and generated files, and report the exclusions | Met | `src/lib/ingestionFilters.ts` (17 directory rules matched on whole path segments, 9 lockfile names); `partitionTreeFiles` in `src/lib/github.ts` records a reason per exclusion; `src/components/CoveragePanel.tsx` groups and displays them |
| FR3 | Produce a repository overview including technologies, languages and files | Met | `src/lib/repositoryScanner.ts` (technology detection), `src/lib/projectAnalyzer.ts`, `src/components/RepositoryOverview.tsx` |
| FR4 | Rank files using resolved import relationships | Met | `resolveImportPath` and `computeWorkspaceReferences` in `src/lib/staticAnalysis.ts`; ranked for display in `src/components/RepositoryOverview.tsx` |
| FR5 | Provide ranked natural-language code search | Met | `src/lib/semanticSearch.ts` — TF-IDF with smoothed IDF and cosine similarity; `src/components/WorkspaceSearchView.tsx` |
| FR6 | Answer repository questions using retrieved repository evidence | Met | Retrieval and prompt assembly in `src/pages/Index.tsx`; generation proxied by `api/explain-code.ts` |
| FR7 | Display retrieved evidence with scores, line ranges and excerpts | Met | `src/components/EvidencePanel.tsx` — rank index, score to two decimals, `Lines a–b of c`, and the excerpt actually sent |
| FR8 | Identify file paths mentioned by the answer but absent from the retrieved evidence | Met | `MENTIONED_PATH` and the unverified-mentions list in `src/components/WorkspaceQAView.tsx` |
| FR9 | Display repository index coverage | Met | `ingestion` summary from `src/lib/github.ts`; `src/components/CoveragePanel.tsx`; ingestion toast in `src/hooks/useProjectManagement.ts` |
| FR10 | Provide selected-file explanation and static analysis | Met | `src/lib/staticAnalysis.ts`; `src/components/FileInsightsPanel.tsx`; `src/components/CodeViewer.tsx` |
| FR11 | Support the controlled evaluation session | Met | `src/pages/Evaluation.tsx`, `src/lib/evaluation/session.ts`, `src/lib/evaluation/sessionStorage.ts` |
| FR12 | Export study data as JSON and CSV | Met | `download` and `sessionToCsv` in `src/lib/evaluation/session.ts`; both exports are produced entirely client-side |

## Notes on specific requirements

**FR2 is broader than the requirement states.** Files are also excluded for an unsafe path, an
unsupported extension, exceeding 5 MB, exceeding the 50-file limit, and failing to load. Each
carries its own recorded reason, so the coverage panel distinguishes "not indexed because vendored"
from "not indexed because we ran out of budget".

**FR4 counts only indexed files.** An import is counted only when the resolved path is itself among
the analysed files. A file outside the 50-file cap can neither appear in the ranking nor contribute
to another file's count. The requirement's wording — *other indexed files* — is therefore exact and
should not be loosened.

**FR5 is lexical, not semantic.** The implementation is a term-frequency index. Earlier
documentation called this "semantic repository search", which overstated it; the terminology has
been corrected in the README to match the dissertation.

**FR7 is stronger than it appears.** The evidence record is assembled from the retrieval result and
the excerpt appended to the prompt, before the model is called. It is never derived by parsing the
answer, so a path the model invents cannot be presented as a source. That property is what makes
FR8 meaningful.

**FR12 exports contain no `retention` block.** The retention question is a task within the answer
key, carrying `kind: "retention"`, so it appears in `session.tasks` like any other task. A separate
top-level block previously existed and duplicated one task's fields.
