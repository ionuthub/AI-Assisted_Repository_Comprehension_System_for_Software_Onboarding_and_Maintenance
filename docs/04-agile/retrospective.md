# Retrospective

Written after the study. It is more useful to record what the process failed at than to list what
it delivered, so this leans that way.

## What worked

**The feature freeze.** Named as a risk in the register and then actually held. Two features were
removed rather than deferred, and the effort went to evaluation. A dissertation with a richer tool
and a weaker study would have scored worse.

**Writing a checkable criterion into every NFR.** It made Chapter 6 possible to write, and it made
two requirements report honestly as "partly met" and "measured" rather than being quietly claimed.

**Instrumenting the apparatus before the participants.** The gate harness rejecting incomplete
generations, binding marking sheets by hash and refusing to score unmarked items caught problems
that would otherwise have surfaced as unexplainable numbers.

## What did not

**Automated gates found the defects that were cheap to find.** Seven defect classes, no two caught
by the same method. The most serious — a file cache serving one repository's contents under another
repository's filename — was found by a person switching repositories, not by 139 tests, a
typecheck, a linter, a build, code review or CI.

**CI did not run for five weeks.** The workflow targeted a Node version the test runner refused, so
every push reported nothing. Every local gate was green throughout, which is exactly why nobody
looked. The lesson is to ask whether an instrument has ever actually reported, not whether it is
configured.

**Documentation lagged the code by months.** Everything in `docs/` was written after the study.
The architecture description had to be *derived by reading the source* rather than written from
memory, and that pass found three claims in the drafted description that were wrong or only partly
true. Had the documentation been written alongside, those would have been caught earlier — or,
more likely, would have been written wrong and believed.

**Provenance was reconstructed rather than recorded.** Which commit was deployed when, and which
build a figure was measured against, had to be worked out afterwards from timestamps and dashboard
records. The `artefactVersion` / `artefactSourceCommit` distinction now in the answer keys exists
because a single SHA could not answer both "which deployment served this session" and "did the tool
change between these participants".

## What to do differently

1. Verify the instrument reports, not just that it is configured.
2. Write the architecture description from the source, not from intent, and date it.
3. Record the deployed commit at the moment of each capture rather than inferring it later.
4. Treat any defect that could alter a measurement as a study-validity issue, not a bug.
