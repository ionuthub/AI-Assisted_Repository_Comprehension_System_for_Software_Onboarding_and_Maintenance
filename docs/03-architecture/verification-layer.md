# The verification layer

This is the intervention the study measures. It is also the term most easily misread, so this
document separates two things that share the word "verification".

## A. The artefact's verification layer — a feature

`src/components/EvidencePanel.tsx` and `src/components/WorkspaceQAView.tsx`.

Beside every answer it displays:

- each retrieved file **in rank order**;
- its **relevance score**, to two decimals, and as a bar;
- the **line range** supplied, as `Lines a–b of c`, plus how many lines and characters were not
  sent;
- the **excerpt actually sent** to the model;
- **unverified mentions** — paths the answer names that retrieval did not return, each with a
  reason;
- **coverage** — how many files were indexed against how many the repository offered.

Two properties make it meaningful rather than decorative:

**Citations come from retrieval, never from the answer.** The evidence record is built during
retrieval, before the model is called, from the same objects appended to the prompt. A path the
model invents therefore cannot be presented as a source — it can only appear as an unverified
mention. Deriving citations by parsing the answer would produce the opposite behaviour.

**The no-evidence state is marked by more than colour.** Icon, border weight, a hatched background
and the wording itself, because a reader must be able to tell an answer with supporting files from
one without.

### What it does not do

> **The layer exposes evidence and unsupported references, but it does not establish that an answer
> is correct.**

It makes no judgement about the answer. The headings say what was retrieved and sent — deliberately
not whether the answer follows from it. An earlier heading read "Grounded", which was read as a
verdict, and appeared above answers that were outright refusals because retrieval had returned
files while the model found nothing in them. Whether an answer follows from its evidence is a
judgement only the reader can make, and inviting them to make it is the point.

The study result bears this out: 7 of 12 participants detected the seeded inaccurate answer, and
only 5 corrected it. Detection and recovery are distinct behaviours, and exposing evidence supports
the first more than the second.

## B. Accuracy-gate verification — research evaluation

A different activity entirely, and it belongs to the research method rather than to the artefact.

The 24 reference answers were drafted with AI assistance and then checked against the complete
study repositories through multiple adversarial verification passes, with cited file and line
ranges mechanically checked where possible. The researcher did not independently reconstruct every
reference answer line by line.

**The final binary correctness verdicts were made by the researcher** against the declared rubric,
recorded in `study/marking.*.md`, and totalled by `analysis/accuracy_gate.py` from that marking
record.

So the accurate statement is:

> Automated tooling supported reference checking and evidence validation. Final binary gate
> decisions were made by the researcher.

And not:

> AI automatically verified answer correctness.

The reference files retain the historical filename `ground-truth.*.md`. Their provenance is
tool-verified rather than independently human-established, and that is disclosed in
`study/AI-DISCLOSURE.md` and Appendix A. The capture harness enforces it: it requires an explicit
`--accept-tool-verified` flag and records the weaker provenance in the gate file, so the figure
cannot be reported without the qualification being visible.
