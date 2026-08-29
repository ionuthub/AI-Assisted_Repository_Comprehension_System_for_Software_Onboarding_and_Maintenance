# Test results

At the frozen commit `e7d7efe`, the build evaluated in the study.

| Gate | Result |
| --- | --- |
| `tsc -b` | Clean |
| ESLint | 0 errors, 4 warnings (all `react-refresh/only-export-components` in shadcn/ui files) |
| Unit tests | **139 passed, 13 files** |
| End-to-end | 4 passed |
| Production build | Clean |
| `analysis/` self-tests | 7 of 8 pass; `analyze_sessions.py` requires SciPy |

## On the test count

The dissertation states 118 unit tests across 13 files. The file count is correct; the test count
is not reproducible from any commit in this repository:

| Build | Tests | Files |
| --- | --- | --- |
| `fd5f5ab` | 109 | 12 |
| `429f830` | 112 | 12 |
| `c5fb72a` | 115 | 13 |
| `beae1ae` | 135 | 13 |
| **`e7d7efe` (frozen)** | **139** | **13** |
| `main` after post-study documentation work | 143 | 14 |

`npx vitest run` at the frozen commit reports 139. That is the figure used throughout this
documentation.

## Reproducing these

    git checkout e7d7efe
    npm ci
    npm run typecheck
    npm run lint
    npx vitest run
    npm run build
    npx playwright install --with-deps && npx playwright test

The gate figures are reproduced separately:

    npm run gate:score          # 6/24 (25%) from the marked captures
    npm run measure:questions   # retrieval score distribution
