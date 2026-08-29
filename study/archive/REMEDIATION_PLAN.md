# What to fix, what to leave, and what to write up

The audit produced three kinds of finding. They need three different responses, and mixing them
up is the main risk to the dissertation now.

- **Defects that make the instrument produce false data.** Fix these. They are bounded and they
  are the reason the current figure cannot be reported.
- **Architectural limits of the approach.** Do not fix these. They are the finding.
- **Documents that no longer describe what was done.** Correct these, because a marker checks
  them.

There are 57 days to AE2. The study is 70% of the marks and has not started.

## The decision that governs everything else

The audit's improvement roadmap, symbol-level indexing, hybrid BM25 and embeddings, call-graph
expansion, rerankers, removing the fifty-file cap, would produce a substantially better tool. It
would also destroy this dissertation.

Retrieval changes invalidate the captured answers, which invalidates the marking, which
invalidates the accuracy gate and the seeded over-trust probes drawn from it. The artefact would
then need re-freezing, the gate re-running and the marking redoing, and none of that is the
study. The study, timed tasks with human participants, ethics approval, JISC forms, recruitment,
analysis, has not begun.

**The tool's accuracy is not a problem to solve. It is the measurement.** A tool that answered
everything correctly would make over-trust unobservable and the study unrunnable; the proposal
draws its seeded probes from the questions the tool gets wrong. Roughly a quarter correct, with
the failures concentrated in cross-file reachability and exhaustive-list questions, is a usable
and honest instrument.

So: fix what makes the instrument lie. Change nothing that makes the tool cleverer.

## P0, required before anything is reported

A re-capture is already mandatory because two answers in the run of record are truncated. That
makes the marginal cost of the other retrieval-affecting fixes almost zero: fix them all, then
re-run **once**.

### Correctness of the instrument

1. **Path extraction**, done. Extensions ordered longest-first; regression test added. The
   unverified-mentions panel was accusing correct answers.

2. **Truncated generation.** `api/explain-code.ts` discards the model's `finishReason` and usage
   metadata. Propagate both; treat anything other than a normal stop as an error rather than an
   answer. Nothing currently distinguishes a finished answer from an abandoned one, in the
   interface or in the capture.

3. **Unreadable files leave the corpus.** `github.ts` marks a failed content fetch as excluded but
   leaves the entry in `project.files`, and the store indexes it. A filename match can retrieve a
   file whose contents were never read. Remove them from the corpus, not just from the label.

4. **The long-line excerpt defect.** `semanticSearch.ts` scores an over-budget first line in full
   and slices it afterwards, so a match beyond the character budget can select a region the
   excerpt then omits, with `omittedLines` still reading zero. Score what is emitted.

5. **Stopwords.** `default`, `export`, `interface`, `class`, `function` and `static` are removed
   from queries. Those are the terms a code search exists to match. Remove them from the stopword
   list, and fix the unit test that queries `export` and passes on zero results, which is a test
   that measures nothing.

### Honesty of the interface

6. **The no-evidence wording.** "Nothing in this repository supports the answer below" claims more
   than zero lexical hits over a partial index can establish. Say what is true: nothing matching
   was found in the files that were searched.

7. **The coverage footer** says "50 of 55 indexed files" and then that five could not be searched.
   Say "searched 50 of 55 repository files".

### Fail-closed gate machinery

8. **`accuracy_gate.py`** exits zero having scored nothing. It must fail on unmarked input, on a
   partial repository set, and on non-boolean verdicts, and must not emit seeded candidates with
   blank correct answers.

9. **`capture_gate.mjs`**, `--truth` optional and an empty status list passing; archive numbering
   that can overwrite `run3`; a swallowed evidence timeout; a screenshot check that inspects only
   the answer's own ancestors and missed a constructed 360-pixel clip.

10. **`marking_sheet.py collect`** must verify the sheet belongs to the gate it is collected into.

11. **Ground truth into the gate files.** `correctAnswer` is empty in both. Collect it through
    `gate_worksheet.py` so the scorer and the seeded candidates have something to work with.

## P1, re-run and re-mark, once

12. Re-capture both repositories with the fixes in place. Keep every archived run.

13. Re-mark all 24. The previous verdicts do not transfer: the answers will differ, and two of
    them were truncated.

14. **Collect the verdicts into the gate files and score them.** The figure must come out of
    `accuracy_gate.py`, not out of prose. Nothing may be quoted before that.

15. **Freeze the artefact and record the commit SHA** in the dissertation's experimental
    parameters, alongside the model, top-k, excerpt size and file cap. After this point no change
    to the tool, for any reason, until data collection ends.

## P2, documents that no longer match

16. `AI-DISCLOSURE.md`, "every citation mechanically validated" is untrue for the 49 references
    that return NOTE and receive no structural check. It also leaves the existing second marking's
    provenance unstated; say plainly that it was machine-produced.

17. `PHASE3_PROTOCOL.md` says ground truth cannot be delegated to AI. The disclosed process did
    exactly that. Reconcile the two, in favour of what happened.

18. `RUNNING_THE_GATE.md` and both ground-truth headers require CONFIRMED while the package
    scripts deliberately accept VERIFIED BY TOOL.

19. `second-marking.md` still carries the superseded 5/24 table and its 21% recommendation
    alongside the current position.

## P3, the study itself, which is the actual remaining work

None of the above is the dissertation. This is:

20. Four locating tasks and one applied task per repository, mirrored, each targeting a different
    one of the seven planted patterns. Pilot each with a timer.
21. Answer keys and the marking rubric, with seeded items drawn only from the gate's incorrect
    answers.
22. Ethics approval. No participant contact before it is granted.
23. JISC consent, demographic and instrument forms.
24. Recruitment, counterbalancing schedule, sessions, analysis.
25. AE2: the §4.3 materials rewrite, the new §5.5.1 on the verification layer, the §5.9 rewrite,
    and the factual corrections.

## What goes in Chapter 9, not into the code

The audit's roadmap belongs in *Recommendations for further work*, and it is unusually strong
material because it is specific and evidenced rather than aspirational:

- symbol-level or AST-level chunking instead of whole-file indexing
- hybrid retrieval, lexical for identifiers, embeddings for concepts, with a reranker
- import and call-graph expansion around initial hits, using the dependency graph the project
  already computes and currently uses only for display
- adaptive evidence size instead of a fixed top three
- explicit handling for exhaustive and negative questions: "everywhere", "only", "what calls",
  "does anything listen"
- evidence-constrained generation, with claims rejected when they cite paths outside the supplied
  evidence, and abstention treated as a successful outcome
- server-side indexing bound to a commit SHA, removing the fifty-file ceiling
- authenticating the generation endpoint rather than relying on an Origin header, which is CORS
  and not authentication

Each of these can be tied to a specific observed failure in the results, which is what separates
a recommendations chapter that scores well from one that lists everything the author would have
done with more time.
