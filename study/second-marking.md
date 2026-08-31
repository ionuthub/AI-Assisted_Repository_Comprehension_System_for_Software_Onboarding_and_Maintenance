# Second marking of the accuracy gate

> **Current status.** This file is a historical machine-produced blind second marking of an earlier capture. It is not the source of the final 6/24 gate result and it is not independent human validation. The final reportable result comes from the re-captured gate, the researcher's final verdicts in `marking.clinic-triage.md` and `marking.warehouse-dispatch.md`, and the fail-closed scorer. The researcher later reviewed this machine-produced record as a consistency check; no separate human second marker was used. Statements below about work that "must" be completed describe the status when this record was written.

> **Historical record, not a reportable result.** This second marking was machine-produced, not
> human. The 6/24 and 5/24 figures below describe the earlier capture; two answers in that run
> were incomplete generations, and the committed gate files do not carry the verdicts. The gate
> must be re-captured and all 24 answers re-marked before any accuracy figure is reported. The
> detail below is retained because it records the disagreement and the resulting rubric repair.

The AE1 protocol commits to blind second-marking of a sample. This is that step, performed
against the run of record without sight of the first marker's verdicts, on the eight items the
first marker scored correct. Items scored incorrect were not re-examined: a disagreement there
would raise the figure, and the risk being tested for is a figure that is too high.

All eight were checked. Three were disputed and five upheld, but a procedural defect found
afterwards means two of the three disputes were not what they appeared to be. That is dealt with
first, because it changes how the rest of this document should be read.

## The two markings were not against the same material

`analysis/marking_sheet.py` built each block from a question's **Answer** only. It omitted the
**Notes**. The first marker therefore worked from the Answer; this second marking worked from the
whole ground-truth document, Answer and Notes together.

Some of what follows is consequently not disagreement about a judgement. It is two markers
answering different questions, and the difference was invisible to both until someone read the
sheet builder.

The standard is now stated explicitly and the Notes are shown, collapsed, beneath each Answer:
**the Answer is the standard; the Notes are context.** Requiring a tool to reproduce every Note
would set a bar nothing could meet, and it was not declared in advance. Under that rule:

| | Answer only | Answer and Notes |
| --- | --- | --- |
| Q2 | incorrect, never reaches the store | incorrect |
| Q7 | **correct** | incorrect |
| Q8 | incorrect | incorrect |
| Figure | **6/24, 25%** | 5/24, 21% |

Q7 is the one that moves. Its Answer says the finder "sorts them so any preferred clinician comes
first", which is what the tool said. That the preference never operates appears only in the
Notes. Under the declared standard the tool's answer stands.

Q8 does not move: its Answer states outright that these are the only two subscriptions and that
nothing listens for `referral:accepted` or `eligibility:failed`. The tool omitted that from a
displayed requirement.

Q2 does not move either, though its grounds narrow. The Answer requires that the store uses the
calculated band unless an override is supplied; the tool never reaches the store or names
`acceptReferral`. The `band`-field trap it also omits is a Note and does not count.

At that point **6/24 was selected under the Answer-only rule**, with 5/24 as the stricter reading.
Neither is now a reportable figure. The
choice between them was made by asking which material had been shown, not by which produced a
better number, and it is recorded here because that ordering is the only thing that makes the
choice credible.

## Disputed items

### clinic-triage Q2, "How is a referral given its priority band?"

First marker: correct. Second marker: **incorrect**.

The scoring mechanism is described exactly, context construction, rule matching, base points
plus matched points, first threshold met. Two things in the ground truth are absent.

The answer never reaches the store. The ground truth states that on acceptance the store uses
the calculated band unless an override is supplied; the answer says only that the panel's
`onSelect` allows "the parent context to persist the selected priority". It does not name
`acceptReferral`, and it does not establish that the override is supplied unconditionally, which
is the fact that makes the calculation ornamental on every UI path.

It also omits that each rule declares a `band` which `calculateBand` never reads, a planted
trap the ground truth records with worked counter-examples.

### clinic-triage Q7, "Which slot-finding implementation runs for a follow-up referral, and why?"

First marker: correct. Second marker: **incorrect**, and this is the significant one.

The conclusion is right: the continuity finder runs. How it was reached is not. The answer
states plainly that `src/config/priorityRules` "is not included in the provided context" and
then *deduces* the mapping from the route module's instruction text, "Prefer the previous care
team". It never establishes `followUp.finder === "continuity"`. The right answer was inferred
from adjacent evidence rather than read.

It then asserts something false: that `preferredClinicianId` "allows `findContinuitySlots` to
prioritize slots with the clinician who has already treated the patient, fulfilling the
follow-up pathway's core instruction." The ground truth establishes that this field is undefined
at every call site in the repository, and unreachable by construction, the only write to it
also marks the referral booked, which closes the booking flow. The preference never operates.

A right headline, reached by inference, resting on a mechanism that does not run. Marking it
correct rewards exactly the shape of answer this study exists to detect.

### clinic-triage Q8, "What reacts when a scheduling event is emitted?"

First marker: correct. Second marker: **incorrect**.

Both listeners are identified accurately, with correct code. But the ground truth's answer is
not only which two react, it is that these are the *only* two subscriptions, and that nothing
listens for `referral:accepted` or `eligibility:failed` despite four emit sites. The answer makes
no such statement.

It also says `recentlyBooked` "can be queried downstream using the exported
`wasRecentlyBooked(slotId)` helper". `wasRecentlyBooked` has no callers. The phrasing is
literally defensible and leaves a reader with the opposite of the truth.

## Upheld items

**clinic-triage Q3**, the decision point is identified exactly: the handler map, `registerRoute`,
and `routeReferral` resolving on `referral.type`. The dynamic module loading that populates the
map is not described, but the question asks what decides, not how the handlers arrive.

**clinic-triage Q6**, the in-place mutation of `slot.bookedReferralId` and both emitted events
are identified. Line references drift by two, which is not a basis for rejection when the
content is exact.

**warehouse-dispatch Q6**, the dock mutation, D4 for hazardous, D1-D3 by checksum for everything
else, and the downstream read. Line references are exact.

**warehouse-dispatch Q7**, the strategy resolution traced through `pricingByType`,
`pricingStrategyFor` and the delegation in `calculateOrderPrice`, with the configuration quoted.

**warehouse-dispatch Q12**, the assignment site, both branches and the propagation to
`assignedDock`. Line references drift by two to four; content exact.

## What the disagreement has in common

All three disputed items are cases where the answer describes what the code *declares* and the
ground truth turns on whether it *runs*. The first marker accepted all three; the ground truth
rejects all three.

All three are also in clinic-triage, and none in warehouse-dispatch. That is not coincidence.
Clinic-triage is the repository whose declared-but-unreachable behaviour is structural, a whole
module graph that never loads, while warehouse-dispatch's is confined to individual dead
exports. The disputes cluster exactly where the reachability questions are, which is what makes
the pattern an explanation rather than a run of bad luck.

The five upheld items are all questions with a single, local, present answer: where a mutation
happens, which branch a lookup takes. On those the tool is accurate and the two markers agree.
The distinction between the two groups is sharper than any accuracy figure.

That is the same blind spot the tool under measurement has, in the marker measuring it. Both are
language models, and the failure they share is the one that matters here. It is not a
hypothetical correlation risk, it is measured, on this data, in the direction that inflates the
figure.

## Effect on the figure

| Marking | clinic | warehouse | overall |
| --- | --- | --- | --- |
| First marker | 5/12 | 3/12 | 8/24, 33% |
| Second marker | 2/12 | 3/12 | 5/24, 21% |

Agreement between the two markers on the eight items examined: five of eight. Note that this is
a biased sample by design, only items scored correct were re-examined, because a dispute among
the items scored incorrect could only raise the figure and inflation is the risk being tested
for. A full agreement statistic would require both markers to mark all twenty-four
independently.

## Superseded recommendation

Do not report 21%, 25%, or 33% as the gate result. Re-capture after the instrument fixes, collect
the frozen answers and new verdicts into the JSON, and use only the figure emitted by the
fail-closed scorer. Retain this disagreement as methodological history rather than presenting it
as a result from the new run.

The three disputes still need adjudicating by a person. That is now the whole ask: read clinic
Q2, Q7 and Q8 against the cited lines and decide. Fifteen minutes, three questions, and it is
the only step in this chain not produced by a machine.

Q7 is the one to give to a human first if only one can be spared. The answer reaches the right
conclusion, says openly that it is inferring rather than reading, and then asserts a mechanism
that does not run. Whether that counts as a correct answer is a judgement about what the study
is measuring, and it should not be settled by the kind of system being measured.
