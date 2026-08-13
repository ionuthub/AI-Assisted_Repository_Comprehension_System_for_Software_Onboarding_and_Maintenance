# analysis/, measurement instruments

Scripts that **read** the artefact and produce the figures reported in the write-up. They
are instruments, not the artefact.

## The freeze boundary

The freeze covers what a participant can experience: `src/`, `api/`, `package.json` and the
lockfile, and the deployed build. Measurement tooling in `analysis/` and study material in
`study/` may change after the freeze, `capture_gate.mjs` has to, since it measures a build
that already exists.

Two conditions make that safe rather than merely convenient:

1. **Every script's output embeds the artefact SHA it measured and the script's own commit
   SHA.** A figure whose provenance has to be reconstructed afterwards is not reportable.
2. **No script writes into `src/` or `api/`.** The boundary is then checkable by grep
   rather than by judgement, which matters because the seeded-probe pipeline touches study
   configuration:

   ```
   grep -nE "writeFileSync|mkdirSync|appendFileSync|renameSync|rmSync|unlinkSync" \
     analysis/*.mjs analysis/*.py | grep -E "src/|api/"
   ```

   Any output from that command is a violation. It currently returns nothing.

Study material an instrument produces is written under `study/`, never to the repository root.
That is not a third condition, it is what keeps the two above readable. The marking sheets and
`seeded_candidates.json` were originally written to the working directory, so they landed at the
root, outside the two directories this section names; the boundary then had to be remembered
instead of read. `marking_sheet.py` now writes each sheet beside the gate it was built from and
`accuracy_gate.py` writes to `study/seeded_candidates.json`.

## Files that must not be edited for style

A bulk edit over `study/` is not safe, because some of those files are data or are matched
character by character against data. Excluded from any prose sweep:

| File | Why |
| --- | --- |
| `study/ground-truth.*.md` | `marking_sheet.py build` refuses to run when a gate's `correctAnswer` differs from the ground-truth answer by so much as a character |
| `study/marking.*.md` | bound to their capture by SHA-256 over the questions and both answers, and they carry the recorded verdicts |
| `study/accuracy-gate.*.json` | the captured tool answers and the frozen correct answers; the binding hash is computed over them |
| `study/gate-runs/*.json` | archived captures, the historical record |
| `study/seeded_candidates.json` | derived from the marked gate; the answer keys' `seededAnswerShown` must match it exactly |
| `study/answer-key.*.json` | `seededAnswerShown` is that same exact string |

Prose in `study/*.md` outside those, and everything in `analysis/`, is safe to edit.

Two things broke when this was first done and are worth stating, because both passed the
self-tests:

- `capture_gate.mjs` reads the ground-truth status line with a regex whose alternation contained
  an em dash, matching `**Status: VERIFIED BY TOOL — <date>**`. Rewriting the regex while leaving
  the ground-truth files alone would have made every status unparseable, failing the next capture.
  It now accepts either a dash or a comma, and says so at the call site.
- `marking_sheet.py` used an em dash as the "no files" placeholder in a generated sheet, which is
  typographic rather than prose.

Neither is covered by a self-test. **After any edit to `analysis/`, run a `build` into a scratch
directory and a `collect` against the committed sheets**, not just `--self-test`: the self-tests
check parsing logic against fixtures, not against the real study files.

## score_questions.mjs, retrieval figures

```
node analysis/score_questions.mjs                      # writes study/question-scores.json
node analysis/score_questions.mjs --out <path>
node analysis/score_questions.mjs --artefact-version <sha>
npm run measure:questions
```

Imports the committed ingestion and search modules through Vite's SSR pipeline and runs
them, it does not reimplement scoring, and the `@/` alias resolves from the project's own
`vite.config.ts`. Retrieval is deterministic computation over ingested files with no model
in the loop, so this measures what the deployed build computes, without a deployment and
without spending Gemini quota. It reads the suggested questions from
`src/components/SuggestedQuestions.tsx` and the stems from the two accuracy-gate files, so
it cannot drift from the questions actually shipped.

Each gate stem is scored **against its own repository only**. A stem written for
clinic-triage measures nothing when asked of warehouse-dispatch; scoring every stem against
every repository pulls the median down by averaging in mismatches. The reported
distribution is over the 24 stems, each against the repository it was written for.

Exit status is 1 if any suggested question fails the admissibility criteria, so a freeze-day
run produces a verdict rather than homework. The wordings are frozen by protocol, a
failure is a finding to report, not a prompt to reselect.

**Its outputs are the sole source for:** the suggested-question scores in §5.5.1; the gate
stem score distribution in §6.6; the derivation of the evidence-bar constant
(`SCORE_BAR_FULL_SCALE` in `src/components/EvidencePanel.tsx`); and Appendix D4.

Earlier figures, the 27 and 28 July measurements, were produced by tooling that was never
committed, and two ad-hoc computations of the same distribution disagreed (p90 = 0.59 on
27 July, 0.57 on 30 July). Those figures are superseded and must not be quoted.

## Other instruments

| Script | Reads | Produces |
| --- | --- | --- |
| `capture_gate.mjs` | the **deployed** app, via Playwright | gate captures with answers, evidence, screenshots |
| `accuracy_gate.py` | gate captures | accuracy scores |
| `marking_sheet.py` | gate captures + ground truth | marking sheets |
| `check_citations.py` | gate captures | citation verification |
| `compare_runs.py` | gate captures | run-to-run comparison |
| `analyze_sessions.py` | session exports | study analysis |
| `verify_study_repos.py` | the two study repositories | matched-pair verification |
| `repo_stats.py` | a repository | size and composition counts |

`capture_gate.mjs` drives a real browser because it measures generated answers, which exist
only end to end. `score_questions.mjs` imports modules because it measures a cosine score
computed before the model is called. The instrument follows the quantity, not the habit.
