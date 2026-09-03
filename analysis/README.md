# Analysis and measurement scripts

The files in `analysis/` support technical evaluation of the artefact. They do not form part of the normal application runtime.

The evaluated application build is fixed at `85ab075065732b3652acabf8f67d2cee33e14d6f`. Analysis scripts may be updated provided they do not change `src/` or `api/`.

## Main scripts

| Script | Purpose |
| --- | --- |
| `capture_gate.mjs` | Captures generated answers and evidence |
| `accuracy_gate.py` | Scores marked gate captures |
| `marking_sheet.py` | Builds and collects marking sheets |
| `check_citations.py` | Checks ground-truth source ranges |
| `compare_runs.py` | Compares repeated captures |
| `score_questions.mjs` | Measures retrieval scores for the evaluation questions |
| `verify_study_repos.py` | Checks the two study repositories |
| `repo_stats.py` | Reports repository size and composition |

Final gate outcomes are recorded in `study/marking.*.md` and `study/final-results.json`.
