# Ingestion

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
