# Analysis and measurement scripts

The files in `analysis/` measure the artefact and study. They are not part of the participant-facing application.

## Freeze boundary

The evaluated artefact is the deployed build based on `src/`, `api/`, `package.json`, the lockfile and build configuration. Analysis scripts and study documentation may change after the freeze if they do not change the evaluated application.

Two rules apply:

1. Outputs should record the artefact version being measured.
2. Analysis scripts must not write to `src/` or `api/`.

Check the second rule with:

```bash
grep -nE "writeFileSync|mkdirSync|appendFileSync|renameSync|rmSync|unlinkSync" \
  analysis/*.mjs analysis/*.py | grep -E "src/|api/"
```

No output is expected.

## Study files that must not be restyled

These are research records or contain exact strings used by other files:

| File | Reason |
| --- | --- |
| `study/ground-truth.*.md` | Exact reference answers used by the marking tools |
| `study/marking.*.md` | Recorded verdicts bound to gate captures |
| `study/accuracy-gate.*.json` | Captured answers and reference answers |
| `study/gate-runs/*.json` | Historical captures |
| `study/seeded_candidates.json` | Derived seeded-answer data |
| `study/answer-key.*.json` | Participant task data |

After changing analysis code, run the real build and collection checks as well as self-tests.

## Retrieval measurements

```bash
node analysis/score_questions.mjs
node analysis/score_questions.mjs --out <path>
npm run measure:questions
```

`score_questions.mjs` uses the committed ingestion and TF-IDF modules. Each of the 24 gate questions is scored only against its own study repository.

Its outputs support the retrieval results in Chapters 5 and 6, the evidence-bar scale and Appendix D4.

## Main scripts

| Script | Purpose |
| --- | --- |
| `capture_gate.mjs` | Captures answers and evidence from the deployed app |
| `accuracy_gate.py` | Scores marked gate captures |
| `marking_sheet.py` | Builds and collects marking sheets |
| `check_citations.py` | Checks cited source ranges |
| `compare_runs.py` | Compares repeated captures |
| `analyze_sessions.py` | Analyses participant sessions |
| `verify_study_repos.py` | Checks the two study repositories |
| `repo_stats.py` | Reports repository size and composition |

`capture_gate.mjs` uses a real browser because it measures generated answers. `score_questions.mjs` imports the retrieval code because it measures a deterministic score before generation.
