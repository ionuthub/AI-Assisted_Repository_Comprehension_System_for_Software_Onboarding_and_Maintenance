# Static analysis and the import graph

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
[`../04-agile/product-backlog.md`](../04-agile/product-backlog.md).

## Technology detection

`scanRepository` in `src/lib/repositoryScanner.ts` matches dependency manifests and file patterns
against a table of frameworks and libraries, each with a description and a rationale for its use.
It runs inside the store's `setProject`, alongside the per-file analysis.

One ordering nuance, recorded for accuracy: within that single synchronous step the order is
per-file analysis → `computeWorkspaceReferences` → `buildSearchIndex` → `scanRepository`. The
*data* flows through the four pipeline stages as drawn, but technology detection executes after
indexing. "The data flows through four stages in this order" is accurate; "the stages execute
strictly in sequence" is slightly stronger than the code.
