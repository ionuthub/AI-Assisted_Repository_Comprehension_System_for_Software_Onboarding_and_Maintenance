# Requirements

FR1–FR12 and NFR1–NFR12 exactly as specified in Chapter 3 of the dissertation. The IDs and
requirement text are the report's; the implementation and evidence columns are what was found
by reading the source at the frozen commit.

Requirement → code → test traceability is in [`TRACEABILITY_MATRIX.md`](TRACEABILITY_MATRIX.md).

---


FR1–FR12 as specified in Chapter 3 of the dissertation. Status is against the frozen build
evaluated in the study.

Each row cites the implementation. The citations were checked by reading the code, not by reading
comments or this repository's own prose; the same verification pass produced
[`figure1_provenance.md`](figure1_provenance.md).

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

---


NFR1–NFR12 as specified in Chapter 3 of the dissertation, each with the criterion it is judged
against. Status is against the frozen build evaluated in the study.

The requirement text is the dissertation's. The **evidence** column is what was found by reading
the source, and it is where this document earns its place: two entries below record a gap between
the stated mechanism and the implemented one.

| ID | Requirement and criterion | Status | Evidence |
| --- | --- | --- | --- |
| NFR1 | Run in a current desktop browser with no installation by the participant. Build target ES2020, deployed publicly. | Met | `tsconfig.app.json` sets `target: ES2020`; deployed at the Vercel URL recorded in `study/PHASE3_PROTOCOL.md` |
| NFR2 | Bound ingestion so a session cannot stall: at most 50 files indexed, 5 MB per file, a 10-second timeout on each file fetch and at most six concurrent fetches. | Met | `src/lib/github.ts` — `MAX_FILES_TO_ANALYZE = 50`, `MAX_FILE_SIZE = 5 MB`, `REQUEST_TIMEOUT = 10000`, `CONTENT_FETCH_CONCURRENCY = 6`. All four verified at the frozen commit |
| NFR3 | Retrieval must be deterministic: the same question against the same index returns the same files, in the same order, with the same scores. | Met and measured | `src/lib/semanticSearch.ts` is pure computation with no model call; `analysis/compare_runs.py` compares repeat captures and fails on retrieval drift. Appendix H of the dissertation reports the measurement |
| NFR4 | Instrument response performance: record index-build time and question round-trip latency, exported with the session data. | Measured; no acceptance threshold defined in advance | `src/lib/evaluation/metrics.ts` (`recordMetric`, `readMetrics`); emitted in the JSON export as `pilotMetrics` |
| NFR5 | Never expose the model API key to the client. The key is read from the server environment and the request to the model is made server-side. | Met | `api/explain-code.ts` reads `process.env.GEMINI_API_KEY` and uses it only in the server-side fetch. No `VITE_` prefix, so Vite cannot inline it; the browser calls only the same-origin path `/api/explain-code` |
| NFR6 | Restrict the answering endpoint: exact-match origin allowlist, 15 requests per minute per address, at most 25 messages per request, 10,000 characters per message, a 12,000-character context ceiling and a 60-second upstream timeout. | Met; **rate limiting is inactive if the store is not configured** | `api/explain-code.ts` — allowlist enforced unconditionally and a missing `Origin` is rejected 403; the 15/min limiter is inside `if (redis)` and `redis` is null unless both Upstash variables are set. Context ceiling is `MAX_SYSTEM_CONTEXT_CHARS = 12000` in `src/lib/promptBuilder.ts` |
| NFR7 | Sanitise everything rendered from an untrusted source. | Met, **by a different mechanism than originally specified** — see below | Path-traversal validation in `src/lib/github.ts` (`validateFilePath`); formula-injection escaping in `src/lib/evaluation/session.ts` (`csvEscape`, leading `=+-@` and tab/CR). HTML and URL sanitisation are **not** implemented as helpers; see the note |
| NFR8 | Contain runtime failure. An error boundary wraps the route tree and the workspace, and a failed answer request surfaces an inline message rather than losing the session. | Met | `src/components/ErrorBoundary.tsx`, mounted in `src/App.tsx` and around the workspace in `src/pages/Index.tsx`; generation failures render inline with `role="alert"` |
| NFR9 | Meet reasonable accessibility expectations: every control labelled, semantic structure, ARIA state on progress and navigation, and the relevance score exposed to assistive technology as a number rather than only as a bar width. | **Partly met; no formal audit was run** | `src/components/EvidencePanel.tsx` gives the score bar `role="img"` with `aria-label="Keyword match score 0.42"`; `src/components/CodeViewer.tsx` implements a roving-tabindex listbox with `aria-selected`. No WCAG audit was performed, so this is not evidenced to a standard |
| NFR10 | The interface must not assert that an answer is correct. Headings report what was retrieved; the judgement is handed back to the reader in words. | Met | `EvidencePanel.tsx` headings read "Evidence · N files retrieved" and "No evidence · 0 files retrieved". An earlier heading read "Grounded" and was changed because it was read as a verdict |
| NFR11 | Be maintainable and checkable: TypeScript throughout, with type checking, linting, unit tests and end-to-end tests run in continuous integration on every push. | Met | `.github/workflows/ci.yml` runs typecheck, lint, unit tests and Playwright on every push. **139 unit tests across 13 files at the frozen commit** — see the note below |
| NFR12 | Be open and inspectable: public source under a permissive licence so a marker or a later researcher can reproduce the work. MIT. | Met | `LICENSE.md`; public repository |

## NFR7 — the mechanism is not the one the requirement describes

The dissertation states this requirement as *"HTML sanitisation on rendered content, blocked
javascript, data and vbscript URL schemes, path-traversal validation on repository paths, and
formula-injection escaping on CSV export."* Two of those four do not exist as controls.

`sanitizeHtml`, `sanitizeInput`, `sanitizeMarkdown`, `sanitizeUrl` and `escapeRegex` were removed
from `src/lib/security.ts` as dead code, and there is no DOMPurify dependency. The file records why:
they had no callers in the application, only their own tests.

**The protection is nonetheless real, by construction rather than by sanitiser:**

- No component uses `dangerouslySetInnerHTML` anywhere in `src/` or `api/`, so React escapes all
  model output automatically. Injected markup renders as text.
- No URL taken from repository content is rendered as an `href` or `src`, so there is no
  `javascript:` / `data:` / `vbscript:` vector to block.
- Path-traversal validation and CSV formula escaping are implemented as stated.

This is worth recording precisely because an assessor grepping for `sanitizeHtml` finds nothing and
would reasonably conclude the control is absent. The status is Met; the description in the report
needs the mechanism corrected.

## NFR11 — the test count

The dissertation states 118 unit tests across 13 files at the frozen commit. The file count is
right. The test count is not reproducible: running the suite at each candidate build gives 109
(`fd5f5ab`), 112 (`429f830`), 115 (`c5fb72a`), 135 (`beae1ae`) and **139 at the frozen commit
`e7d7efe`**. No commit in this repository produces 118.

`139 across 13 files` is the figure an assessor gets from `npx vitest run` at the frozen commit, and
it is the figure used in this document.
