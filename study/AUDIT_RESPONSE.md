# Response to the independent audit

Every finding below was verified against the source before being accepted. Nothing is accepted
on the auditor's word, and nothing is disputed without a reason.

The audit is upheld in substance. Three findings overturn things previously reported as results.

---

## 1. The "systematic `.tsx` hallucination" was our own defect, withdrawn

Previously reported as the strongest evidence the verification layer works: the model, it was
said, systematically dropped the `x` when naming React components, and the panel caught it.
`PriorityPanel.ts`, `ZoneCard.ts`, `DispatchLogPage.ts`, `OrderListPage.ts`, none of those files
exist, and all were flagged as unverified mentions.

The model never wrote them. `WorkspaceQAView.tsx` extracted paths with

    /(?:[\w-]+\/)+[\w.-]+\.(?:ts|tsx|js|jsx|…)/g

and regex alternation takes the first branch that matches. `ts` is listed before `tsx`, so every
`.tsx` path was truncated to `.ts`, and the truncated path was then, correctly, reported as
not retrieved. Demonstrated directly:

    input  : src/components/PriorityPanel.tsx
    matched: src/components/PriorityPanel.ts

The interface was therefore accusing correct answers of citing files that were never retrieved,
while displaying the real `.tsx` file as evidence in the panel immediately above the accusation.

This is the worst failure this component can have. It exists to tell a reader when an answer
names something unsupported, and it was manufacturing that accusation against sound answers. A
reader who checked would find the file present and learn to discount the warning; a reader who
did not would distrust a good answer. Either way the intervention measures the opposite of what
it intends.

**Fixed**: extensions ordered longest-first with a word boundary, and a regression test that
fails if the ordering is reverted. **The earlier claim is withdrawn in full.** Five of the
sixteen flagged paths were this bug. The remaining eleven, real files the model named without
retrieving, warehouse Q9 being the clearest, stand, and the panel is doing its job on those.

## 2. Two answers in the run of record are truncated, the figure rests on incomplete data

Warehouse Q9 ends mid-sentence: *"…if the new order type requires specialized inventory matching
rules. For"*. Warehouse Q10 ends on an unmatched backtick after `-100`.

Both confirmed. The screenshots are complete; the generation itself stopped. The proxy discards
the model's `finishReason` and usage metadata, so neither the interface nor the capture layer can
tell a finished answer from an abandoned one.

Q9 and Q10 were both marked incorrect, so the figure does not change. But they were marked
incorrect against answers that were never finished, and that is not a measurement of the tool's
accuracy. Both must be recaptured after the proxy propagates `finishReason` and treats an
incomplete generation as an error.

## 3. The reported figure is not in the committed data

Both gate files carry `correct: null` on all twenty-four items and empty `correctAnswer` fields.
`npm run gate:score` skips every question and reports no incorrect answers. The 6/24 figure
exists only in prose.

Two things follow. The verdicts must be collected into the gate files through
`marking_sheet.py collect` before any figure is quoted. And `accuracy_gate.py` must fail rather
than succeed on entirely unmarked input, a scorer that exits zero having scored nothing is the
same silent-success shape as the selector that reported zero unverified mentions.

## 4. A claim in a commit message of ours is false

Commit `682f38c` states that the marking standard was settled "before either figure was
computed". It was not. 8/24 existed from the first marking and 5/24 from the second; the standard
was declared afterwards, and 6/24 followed from it.

What is true is narrower: the standard was chosen by asking which material had actually been
shown to the markers, not by which rule produced a better number, and the reasoning is on the
record. The auditor examined the chronology and reached the same conclusion, an honest
procedural repair, described with a claim about its own timing that does not hold.

The commit stands; this correction is the record. Rewriting history to hide an overstatement
about honesty would be worse than the overstatement.

## 5. Findings accepted without dispute

**Retrieval and evidence.** The long-line excerpt defect survives at `semanticSearch.ts:288` for
a first line over budget, the full line is scored, then sliced, so a match beyond 2,500
characters can select a region the excerpt omits, with `omittedLines` still reading zero.
Unreadable files are labelled excluded but remain in `project.files` and are indexed, so a
filename match can retrieve a file whose contents were never read. The stopword list removes
`default`, `export`, `interface`, `class`, `function` and `static`, which are precisely the terms
a code search needs; and the unit test that appears to cover result limits queries `export`, so
zero results satisfy it, another test that passes by measuring nothing.

**Wording.** "Nothing in this repository supports the answer below" overstates what zero lexical
hits over a partial index can establish. The coverage footer says "50 of 55 indexed files" and
then that five could not be searched, which contradicts itself.

**Gate machinery.** `--truth` is optional and an empty status list passes the interlock. Archive
numbering counts JSON files, so with `run1` and `run3` present the next archive is `run3` and
overwrites it. The screenshot completeness check inspects only the answer's own ancestors and
returned "complete" for a constructed case hiding 360 pixels. `marking_sheet.py collect` does not
verify that a sheet belongs to the gate it is collected into. Three scripts have no self-test,
contrary to a claim in the brief.

**Numbers of ours that were wrong.** Pairwise means are 27–36% wording and 86–96% file overlap,
not the 27–31% and 86–92% reported. `verify_study_repos.py` printed "2600-3200" while accepting
2000–3200, now derived from the constants so the two cannot diverge again.

**Documents.** `AI-DISCLOSURE.md` claims every citation is mechanically validated; 49 references
return NOTE and receive no structural check. It also says human second-marking is outstanding
without stating that the existing second marking was machine-produced. `PHASE3_PROTOCOL.md` still
says ground truth cannot be delegated to AI, which contradicts the disclosed process.
`RUNNING_THE_GATE.md` and both ground-truth headers still require CONFIRMED while the package
scripts deliberately accept VERIFIED BY TOOL.

## 6. One finding partly disputed

The auditor asks that clinic Q11 be qualified, because it describes redaction "before transport"
without noting that the API graph never loads. The auditor names this as its own least-certain
finding, and that judgement is right. Q11 asks where safeguarding referrals are treated
differently; the redaction stage *is* such a place, and its dormancy is recorded in Q5 where the
question is about the pipeline. Cross-referencing it in Q11 would improve the answer. Requiring
it would mean every answer must restate every reachability finding relevant to any file it
mentions, which is not a standard any answer here meets.

**No change, recorded as a considered disagreement.**

## 7. What this changes about the reported result

The figure is not final and should not be quoted yet. Two of its twenty-four inputs are
truncated generations, the verdicts are not in the data, and one component of the intervention
was producing false warnings throughout the run.

The audit's architectural conclusion stands and is the more important one: lexical retrieval of
three excerpts cannot answer cross-file reachability, exhaustive-list or negative questions, and
the accuracy figure is mostly a measurement of that limit rather than of implementation quality.
That is a legitimate finding for the dissertation. It is not a reason to keep a figure computed
on defective inputs.
