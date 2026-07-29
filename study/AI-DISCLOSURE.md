# Disclosure of AI assistance in establishing the accuracy-gate ground truth

Southampton Solent's policy permits generative AI to be used to improve readability, structure
and language, and to help brainstorm, find sources and organise ideas, on condition that the
assistance is disclosed and verified. This file records what was used and how far the
verification went, so the account in the dissertation is a summary of something written down
rather than a reconstruction.

## What the ground truth is

Twenty-four questions, twelve per study repository, each with a correct answer against which
the tool's own answer is scored. The resulting figure is the accuracy gate committed to in the
AE1 proposal, and the questions the tool answers incorrectly become the seeded items for the
over-trust probes.

## How it was produced

An initial draft of all twenty-four answers was generated with AI assistance. It was then
subjected to seven independent verification passes, each conducted with the repository in view
and each reporting per question. Passes were deliberately adversarial: later ones were asked to
challenge the reasoning behind an answer rather than re-read the answer itself.

Every claim made by a verification pass was independently re-checked before being accepted into
the file, by reading the cited source and by grep. Several claims were rejected or narrowed at
that stage.

Every file and line reference in both files is validated mechanically by
`analysis/check_citations.py`, which counts bracket depth from the first cited line to confirm
that a range spans the declaration it names. Both files currently report zero problems. That
script says nothing about whether the prose is true; it only prevents a citation pointing
somewhere other than where it claims.

## What the passes found

The record matters more than the total, because the shape of the defects changed:

- Early passes found errors in the description of the code — a claim that `App` creates the
  router when it is built at module scope, a note asserting that tests call a function they do
  not.
- Middle passes found a systematic gap: answers described what the code *declares* and
  under-reported where the declared behaviour never reaches the running application. Six
  instances were eventually documented, and the running count of them was itself wrong three
  times.
- Later passes found that the answers were right for reasons that were wrong. One conclusion
  had two successive explanations attached to it, both incorrect, before the third held.
- The final pass found that every defect it identified sat in text added or strengthened by the
  previous correction, each an absolute claim introduced in the course of sounding more
  rigorous.

That last observation changed the method: corrections now fix the false statement and add the
missing one, leaving the scope of everything else unaltered. Corrections narrow claims rather
than strengthening them.

## What was not done

**The researcher did not read the source of either study repository line by line.** The ground
truth rests on machine review, cross-checked between independent passes and mechanically
validated for citation accuracy, not on the researcher's own reading. The status vocabulary in
both ground-truth files reflects this: answers are stamped VERIFIED BY TOOL, and none is
stamped CONFIRMED, which is reserved for researcher sign-off.

The gate capture script requires `--accept-tool-verified` to run against tool-verified ground
truth, and records the provenance in the gate file, so the figure cannot be reported without
this being visible.

No verification pass executed anything in the study repositories. There was no test run, no
type-check and no build as part of establishing ground truth. Every finding is static reading,
with one exception noted at the time: the slot-generation logic in the clinic-triage seed data
was transcribed into JavaScript and executed to work out which slots collide, rather than run
as TypeScript.

## The limitation this leaves, stated plainly

The tool being measured is a language model, and the standard it is measured against was
established by language models. Where those systems share a blind spot, the gate will record a
correct answer that is not correct.

Two things bound that risk without eliminating it. The information conditions differ
substantially: the tool answers from three retrieved excerpts of 2,500 characters, while the
verification passes had the entire repository, performed caller counts, and traced reachability
across modules — analyses the tool cannot perform at all. And the passes were independent of
one another and adversarial by instruction, which is why later ones found errors the earlier
ones had introduced.

The residual risk is real and is not quantified. The gate figure should be read as the tool's
agreement with a machine-verified standard rather than with ground truth established by human
reading.

## The step that would close it

The AE1 protocol commits to blind second-marking of a sample by a second marker. That step is
outstanding, and it is now the only element of the verification chain not produced by a machine.
A person with TypeScript experience checking six to eight of the twenty-four answers against the
source would break the chain and give the disclosure above a materially stronger conclusion. It
requires roughly half an hour of somebody else's time and none of the researcher's reading.

## Suggested wording for the methodology chapter

> The ground-truth answer set for the accuracy gate was drafted with generative AI assistance
> and verified through seven independent adversarial review passes against the repository
> source, with every claim re-checked before acceptance and every file and line citation
> validated mechanically. The researcher did not read the repository source line by line; the
> standard therefore rests on machine verification rather than on researcher confirmation, and
> the gate figure should be interpreted as agreement with a machine-verified standard. A sample
> of *n* answers was independently checked by a second marker. This assistance is disclosed in
> accordance with the University's policy on the use of generative AI, and the full record,
> including the defects found at each pass, is at Appendix *x*.
