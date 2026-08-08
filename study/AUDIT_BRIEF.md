# Independent audit brief — QHO656 dissertation artefact and study apparatus

Paste this whole document into a coding agent with access to all three repositories.

## What you are auditing

A final-year dissertation project. The student has built a tool that reads a GitHub repository,
retrieves relevant files, and answers natural-language questions about the code while showing
which files the answer was built from. The dissertation measures whether showing that evidence
improves how well developers calibrate their trust in the tool's answers.

Three repositories:

- `ionuthub/AI-Assisted_Repository_Comprehension_System_for_Software_Onboarding_and_Maintenance` —
  the artefact, plus all study apparatus under `analysis/` and `study/`
- `ionuthub/clinic-triage` at `67d7a5a` — study stimulus, purpose-built
- `ionuthub/warehouse-dispatch` at `937be9d` — study stimulus, purpose-built

**Do not modify `clinic-triage` or `warehouse-dispatch`.** They are frozen experimental
material. Read them freely; change nothing.

**Do not modify `study/ground-truth.*.md` or set any `correct` field.** Report defects in them;
do not fix them.

You may read, run and reason about everything else.

## Why this audit exists

Much of the work below was produced by an AI assistant working with the student. That assistant
has made repeated errors, and its own error profile is the best guide to where more will be.
Every defect listed here was found by someone else, not by the assistant that wrote it:

1. **Absolute quantifiers nobody re-counted.** "Exactly three call sites" when a grep returns
   five. "The only path" for a function with no callers. "Returns five" when it returns ten. At
   least six instances across the ground-truth documents.
2. **Silent zeros.** A selector that could never match reported "zero unverified mentions" on
   all 24 questions, and that was written up as a clean result. A verdict parser read past an
   unmarked question and silently adopted the next one's mark. Both looked like success.
3. **Corrections that strengthened claims.** Several defects were introduced *while fixing
   something else*, each an absolute added in the course of sounding more rigorous.
4. **Undeclared standards.** Two markers marked the same items against different material — one
   saw a question's Answer, the other saw Answer plus Notes — and the difference lived in a
   sheet-building script neither had read.
5. **Screenshots that stopped mid-answer.** Twice, with a plausible-looking image each time.

Assume more of the same kind exists. The failure signature is: *a result that looks clean and
was never independently checked.*

## What to report

For each section below, report per item: what you checked, what you found, and whether it holds.

**Say plainly when you find nothing.** A section with no findings is a useful result. Do not
manufacture findings to justify the pass — several earlier reviews correctly reported "nothing
new" and that was the most informative thing they said. Distinguish clearly between a defect
that changes a conclusion, a defect that does not, and a stylistic preference (report the last
category only if you must, and label it).

---

## Section 1 — The artefact's retrieval and evidence layer

Files: `src/lib/semanticSearch.ts`, `src/lib/github.ts`, `src/lib/ingestionFilters.ts`,
`src/components/EvidencePanel.tsx`, `src/components/SuggestedQuestions.tsx`, `api/explain-code.ts`

1. **Retrieval.** TF-IDF with smoothed IDF, cosine similarity, top-3, 2,500-character excerpts
   selected by query-term coverage. Read `selectExcerptRegion`. A previous defect here scored a
   large window and then trimmed it, discarding the match that selected it. Verify the region
   returned is the region scored. Check the tokeniser handles camelCase and snake_case as
   claimed, and that the stopword list does not remove terms the tool exists to search for.

2. **Ingestion.** A 50-file cap, vendored directories excluded, lockfiles excluded. Verify
   directory matching is segment-anchored, not substring — `dist` must not exclude
   `src/utils/distance.ts`. Verify every excluded file is attributed to a rule and surfaced to
   the user. Confirm the coverage figure shown on screen uses a denominator the interface
   explains.

3. **The score bar.** `EvidencePanel.tsx` draws a bar full at `SCORE_BAR_FULL_SCALE = 0.6`,
   justified as the 90th percentile of top-ranked scores across 24 gate questions. **Reproduce
   that measurement.** Index both study repositories through the real code, run the 24 questions
   from `study/accuracy-gate.*.json`, and check the percentile. If 0.6 is not defensible from the
   data, say so — the constant changes what every participant sees.

4. **The evidence headings.** Verify no heading asserts anything about the *answer* that the
   panel cannot establish. A previous version said "Grounded" above outright refusals.

5. **Suggested questions.** `study/suggested-questions-measurement.md` claims the three chosen
   questions retrieve at least 0.20 in both repositories, agree within a factor of 1.6, and rank
   the same file first in both. **Reproduce all three claims.** The previous set was replaced
   because one question returned five files in one repository and nothing at all in the other.

6. **The proxy.** `api/explain-code.ts` — check the origin allowlist cannot be bypassed by
   omitting the `Origin` header, and that no secret is reachable from the client bundle.

## Section 2 — The study repositories as a matched pair

Files: `analysis/verify_study_repos.py`, `analysis/repo_stats.py`, both stimulus repositories

The pair is claimed to be matched on: 45 source files each, 2,900 vs 2,439 lines, ratio 1.19,
seven runtime dependencies each, four test files each, roughly 96% predicted index coverage each,
and all seven planted architectural patterns present in both.

1. **Re-derive every one of those numbers independently**, not by running the script — by your
   own count. The script and the claim were written by the same author.

2. **Check the script's logic mirrors the artefact's actual ingestion.** It reimplements the
   exclusion rules. If the two have drifted, the predicted coverage figure is fiction.

3. **The seven patterns** are: handler registry, config-driven behaviour, cross-cutting concern,
   interceptor/pipeline chain, misleading name, legacy path, event emitter. Verify each is
   genuinely present in *both* repositories and comparable in difficulty. `verify_study_repos.py`
   detects them by regex, which can match a comment. Confirm by reading.

4. **Difficulty asymmetry.** `study/ground-truth.warehouse-dispatch.md` records an unplanned
   asymmetry: clinic-triage contains an entire module graph that never loads, while
   warehouse-dispatch has only individually dead exports. Verify that claim, and assess whether
   it makes one repository harder in a way that threatens the study's comparison. The current
   position is that the timed tasks are unaffected because they target the seven patterns.
   Challenge that.

5. **Contamination.** Confirm neither stimulus repository contains anything that reveals the
   answers — no ground truth, no task list, no README describing the planted patterns.

## Section 3 — The ground truth

Files: `study/ground-truth.clinic-triage.md`, `study/ground-truth.warehouse-dispatch.md`

24 answers, each stamped `VERIFIED BY TOOL`. None is `CONFIRMED`, because the student did not
read the source. These have already survived roughly nine review passes.

1. **Sample at least six answers across both repositories** and check them against the source:
   do the cited lines say what the answer says, is every quantifier true, and does every claim
   that something *happens* resolve to a real caller.

2. **Attack the quantifiers specifically.** Every defect found so far has been one. Where an
   answer counts or excludes something, count it yourself — and note that a plain grep is not
   enough, because a member access split across lines is invisible to it and a local variable can
   share a name with a store action.

3. **Check the summary paragraphs at the top of both files.** They previously carried counts that
   were wrong four times. The counts were removed rather than corrected again. Verify that what
   replaced them is accurate.

4. **`analysis/check_citations.py`** reports zero problems on both files. Verify that is true and
   that the script cannot report zero for a bad reason. It has already had four defects: it
   rejected legitimate multi-declaration ranges, ran past one-line declarations, read `if (` as a
   declaration, and mishandled concise arrow bodies.

## Section 4 — The gate machinery

Files: `analysis/capture_gate.mjs`, `analysis/compare_runs.py`, `analysis/marking_sheet.py`,
`analysis/accuracy_gate.py`, `analysis/gate_worksheet.py`

This is where the assistant's defects have clustered. Audit each script for the specific failure
of *reporting success when it has measured nothing*.

1. **`capture_gate.mjs`.** Check every selector against the deployed DOM. Check the interlock
   cannot be satisfied by a ground-truth file that is not actually settled. Check the archive
   logic cannot overwrite a previous run. Check the screenshot completeness assertion actually
   fires when content is hidden — construct a case and prove it.

2. **`compare_runs.py`.** It reports wording similarity and overlap in files named, and exits
   non-zero only on retrieval drift. Verify `paths_named` extracts what it claims. Verify the
   claim that retrieval was identical across three runs — that is a strong claim about
   determinism and it underwrites a sentence in the dissertation.

3. **`marking_sheet.py`.** Recently changed to show Notes. Verify `read_verdicts` cannot
   attribute one question's verdict to another, and that `collect` refuses an incomplete sheet.

4. **`accuracy_gate.py`.** Verify it cannot score an unmarked item, and that
   `study/seeded_candidates.json` contains only genuinely incorrect items.

5. **Run the self-tests.** Every script has one. Check they test the behaviour that matters
   rather than restating the implementation — at least two were written after the defect they
   describe, so check they would still fail if the fix were reverted.

## Section 5 — The figure and the marking

Files: `study/second-marking.md`, both `study/accuracy-gate.*.json`, `study/gate-runs/`

The reported figure is 6 of 24 (25%) against the declared standard, with 5 of 24 (21%) as a
stricter reading. Two markings exist; three items were disputed and one dispute was withdrawn
after it emerged the two markers had seen different material.

1. **Check the arithmetic and the item-level verdicts** in both gate JSON files against
   `second-marking.md`. They were reconciled by hand.

2. **Assess whether the declared standard is defensible**: the Answer is normative, the Notes are
   context. It was declared *after* marking had begun, which is a real methodological weakness.
   Say whether you think the choice was made honestly or to produce a better number — the
   reasoning is recorded in `second-marking.md` and in the commit history, so you can check
   whether the rule was fixed before or after the figures were computed.

3. **Independently mark three items of your choosing** and compare with both existing markings.

4. **Assess the non-determinism claim.** Pairwise wording similarity between runs averages
   27–36%, while overlap in files named averages 86–96%. The argument is that substance is stable even though
   prose is not, and this is what makes marking a single run defensible. Test that argument.

## Section 6 — The claims made in writing

Files: `study/AI-DISCLOSURE.md`, `study/RUNNING_THE_GATE.md`, `study/PHASE3_PROTOCOL.md`,
`study/suggested-questions-measurement.md`, both ground-truth headers, `AUDIT_REPORT.md` if present

1. **Is anything overstated?** In particular, `AI-DISCLOSURE.md` states what was and was not
   done. Check every factual claim in it against the repository and the commit history. It is
   the document a marker is most likely to scrutinise, and an inaccuracy in a disclosure document
   is worse than the thing being disclosed.

2. **Is anything understated or missing?** Is there a limitation a reader would reasonably expect
   to see that is not there?

3. **Commit messages.** They are unusually detailed and will be read. Check they describe what
   the commit actually did.

## Finally

Rank what you find by whether it changes a conclusion, and say which of your own findings you are
least confident about. If a section is clean, say it is clean.
