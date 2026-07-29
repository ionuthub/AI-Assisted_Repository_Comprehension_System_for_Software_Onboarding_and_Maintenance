# Second marking of the accuracy gate

The AE1 protocol commits to blind second-marking of a sample. This is that step, performed
against the run of record without sight of the first marker's verdicts, on the eight items the
first marker scored correct. Items scored incorrect were not re-examined: a disagreement there
would raise the figure, and the risk being tested for is a figure that is too high.

Four of the eight were checked. Three are disputed.

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

## Agreed item

**warehouse-dispatch Q7** — correct in both markings. The strategy resolution is traced through
`pricingByType`, `pricingStrategyFor` and the delegation in `calculateOrderPrice`, with the
configuration quoted.

## What the disagreement has in common

All three disputed items are cases where the answer describes what the code *declares* and the
ground truth turns on whether it *runs*. The first marker accepted all three; the ground truth
rejects all three.

That is the same blind spot the tool under measurement has, in the marker measuring it. Both are
language models, and the failure they share is the one that matters here. It is not a
hypothetical correlation risk — it is measured, on this data, in the direction that inflates the
figure.

## Effect on the figure

| Marking | clinic | warehouse | overall |
| --- | --- | --- | --- |
| First marker | 5/12 | 3/12 | 8/24 — 33% |
| After these three | 2/12 | 3/12 | 5/24 — 21% |

Four of the eight correct items were checked. If the remaining four contain disagreements at a
similar rate, the figure falls further.

## Recommendation

Do not record 33% yet. Two options, and the second is much stronger.

Resolve the three disputes by reading the code at the cited lines and deciding. That is fifteen
minutes and it settles them.

Or have a person mark the eight correct items independently. The disagreement documented here is
the reason: two machine markers already disagree on three of four, in a characterisable
direction, so a third machine opinion adds little. A human verdict on eight items breaks the
chain and gives the reported figure a provenance that survives a viva.
