# Second marking of the accuracy gate

The AE1 protocol commits to blind second-marking of a sample. This is that step, performed
against the run of record without sight of the first marker's verdicts, on the eight items the
first marker scored correct. Items scored incorrect were not re-examined: a disagreement there
would raise the figure, and the risk being tested for is a figure that is too high.

All eight were checked. Three are disputed, five upheld.

## Disputed items

### clinic-triage Q2 — "How is a referral given its priority band?"

First marker: correct. Second marker: **incorrect**.

The scoring mechanism is described exactly — context construction, rule matching, base points
plus matched points, first threshold met. Two things in the ground truth are absent.

The answer never reaches the store. The ground truth states that on acceptance the store uses
the calculated band unless an override is supplied; the answer says only that the panel's
`onSelect` allows "the parent context to persist the selected priority". It does not name
`acceptReferral`, and it does not establish that the override is supplied unconditionally, which
is the fact that makes the calculation ornamental on every UI path.

It also omits that each rule declares a `band` which `calculateBand` never reads — a planted
trap the ground truth records with worked counter-examples.

### clinic-triage Q7 — "Which slot-finding implementation runs for a follow-up referral, and why?"

First marker: correct. Second marker: **incorrect**, and this is the significant one.

The conclusion is right: the continuity finder runs. How it was reached is not. The answer
states plainly that `src/config/priorityRules` "is not included in the provided context" and
then *deduces* the mapping from the route module's instruction text, "Prefer the previous care
team". It never establishes `followUp.finder === "continuity"`. The right answer was inferred
from adjacent evidence rather than read.

It then asserts something false: that `preferredClinicianId` "allows `findContinuitySlots` to
prioritize slots with the clinician who has already treated the patient, fulfilling the
follow-up pathway's core instruction." The ground truth establishes that this field is undefined
at every call site in the repository, and unreachable by construction — the only write to it
also marks the referral booked, which closes the booking flow. The preference never operates.

A right headline, reached by inference, resting on a mechanism that does not run. Marking it
correct rewards exactly the shape of answer this study exists to detect.

### clinic-triage Q8 — "What reacts when a scheduling event is emitted?"

First marker: correct. Second marker: **incorrect**.

Both listeners are identified accurately, with correct code. But the ground truth's answer is
not only which two react — it is that these are the *only* two subscriptions, and that nothing
listens for `referral:accepted` or `eligibility:failed` despite four emit sites. The answer makes
no such statement.

It also says `recentlyBooked` "can be queried downstream using the exported
`wasRecentlyBooked(slotId)` helper". `wasRecentlyBooked` has no callers. The phrasing is
literally defensible and leaves a reader with the opposite of the truth.

## Upheld items

**clinic-triage Q3** — the decision point is identified exactly: the handler map, `registerRoute`,
and `routeReferral` resolving on `referral.type`. The dynamic module loading that populates the
map is not described, but the question asks what decides, not how the handlers arrive.

**clinic-triage Q6** — the in-place mutation of `slot.bookedReferralId` and both emitted events
are identified. Line references drift by two, which is not a basis for rejection when the
content is exact.

**warehouse-dispatch Q6** — the dock mutation, D4 for hazardous, D1–D3 by checksum for everything
else, and the downstream read. Line references are exact.

**warehouse-dispatch Q7** — the strategy resolution traced through `pricingByType`,
`pricingStrategyFor` and the delegation in `calculateOrderPrice`, with the configuration quoted.

**warehouse-dispatch Q12** — the assignment site, both branches and the propagation to
`assignedDock`. Line references drift by two to four; content exact.

## What the disagreement has in common

All three disputed items are cases where the answer describes what the code *declares* and the
ground truth turns on whether it *runs*. The first marker accepted all three; the ground truth
rejects all three.

All three are also in clinic-triage, and none in warehouse-dispatch. That is not coincidence.
Clinic-triage is the repository whose declared-but-unreachable behaviour is structural — a whole
module graph that never loads — while warehouse-dispatch's is confined to individual dead
exports. The disputes cluster exactly where the reachability questions are, which is what makes
the pattern an explanation rather than a run of bad luck.

The five upheld items are all questions with a single, local, present answer: where a mutation
happens, which branch a lookup takes. On those the tool is accurate and the two markers agree.
The distinction between the two groups is sharper than any accuracy figure.

That is the same blind spot the tool under measurement has, in the marker measuring it. Both are
language models, and the failure they share is the one that matters here. It is not a
hypothetical correlation risk — it is measured, on this data, in the direction that inflates the
figure.

## Effect on the figure

| Marking | clinic | warehouse | overall |
| --- | --- | --- | --- |
| First marker | 5/12 | 3/12 | 8/24 — 33% |
| Second marker | 2/12 | 3/12 | 5/24 — 21% |

Agreement between the two markers on the eight items examined: five of eight. Note that this is
a biased sample by design — only items scored correct were re-examined, because a dispute among
the items scored incorrect could only raise the figure and inflation is the risk being tested
for. A full agreement statistic would require both markers to mark all twenty-four
independently.

## Recommendation

Report 21% as the figure, 33% as the first marking, and this disagreement as part of the
result rather than as a footnote to it. A number with two markings and a documented dispute is
worth more than a number with one marking and none.

The three disputes still need adjudicating by a person. That is now the whole ask: read clinic
Q2, Q7 and Q8 against the cited lines and decide. Fifteen minutes, three questions, and it is
the only step in this chain not produced by a machine.

Q7 is the one to give to a human first if only one can be spared. The answer reaches the right
conclusion, says openly that it is inferring rather than reading, and then asserts a mechanism
that does not run. Whether that counts as a correct answer is a judgement about what the study
is measuring, and it should not be settled by the kind of system being measured.
