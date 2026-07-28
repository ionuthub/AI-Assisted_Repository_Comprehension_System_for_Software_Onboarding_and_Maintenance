# Ground truth — clinic-triage (Repo B)

**This is the list of correct answers for the accuracy gate.** Twelve questions. Each one is
either checked or not checked, and the status line says which.

The starting text for every answer was drafted with AI assistance. **A draft answer is not
ground truth.** It becomes ground truth only once the researcher has opened the files and
confirmed it. Until then the status line reads NOT CHECKED and the answer must not be used.

Progress: **2 of 12 checked.**

Do not open the tool until all twelve are checked. Once an answer is seen from the tool it
cannot be unseen, and the gate stops measuring anything.

To validate every line reference in this file:

    python3 analysis/check_citations.py study/ground-truth.clinic-triage.md /path/to/Repo-B

---

## Q1 — orientation

**Status: CHECKED — 28 July. Corrected: `App.tsx` range was wrong.**

> Where does execution start in this project?

**Answer**

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. `App` itself defines the client routes. Importing the module also
installs the scheduling and audit event listeners: lines 7 and 8 are bare side-effect imports,
so the act of importing registers the listeners — nothing reads a value from either module.

**Files and lines**

src/main.tsx:1-10
src/App.tsx:7-8
src/App.tsx:11-21

**Notes**

The comment at src/main.tsx:5 states that an Internet Explorer compatibility shim is required.
No shim is imported and no code acts on it. The comment describes something the code does not
do.

---

## Q2 — config-driven behaviour

**Status: CHECKED — 28 July. Corrected: five line ranges, and the note was strengthened.**

> How is a referral given its priority band?

**Answer**

`calculateBand` sums the referral type's configured base points with the points of every rule
whose `matches` predicate is satisfied, then takes the band of the first threshold the total
meets — red from 9, amber from 4, otherwise green. On acceptance the store uses that calculated
band unless the operator supplies an override, and the band can be changed again afterwards
through `setPriority`.

**Files and lines**

src/config/priorityRules.ts:26-31
src/config/priorityRules.ts:33-70
src/config/priorityRules.ts:72-76
src/triage/banding.ts:15-30
src/store/useClinicStore.ts:61
src/store/useClinicStore.ts:94-107

**Notes**

Each entry in `priorityRules` declares a `band`, and `calculateBand` never reads it — line 22
takes `band` from `bandThresholds`, not from the rule. The declared band is not merely unused,
it is misleading in two cases. A routine referral (0 base points) matching only `mobility`
scores 2 and resolves to green, though the rule declares amber; the same holds for
`post-discharge`, which declares amber and is worth 3 points. Only the accumulated score and
`bandThresholds` determine the outcome.

---

## Q3 — handler registry

**Status: NOT CHECKED**

> Which code decides how a given referral type is processed?

**Answer**

The route registry decides. `loadRoutes` dynamically imports each route module, those modules
register handlers keyed by referral type, and `routeReferral` retrieves and invokes the handler
for `referral.type`. The detail page loads the modules before routing the current referral.

**Files and lines**

src/triage/routes/loadRoutes.ts:1-10
src/triage/routes/registry.ts:8-17
src/triage/routes/routine.ts:1-11
src/triage/routes/urgent.ts:1-11
src/triage/routes/followUp.ts:1-11
src/triage/routes/safeguarding.ts:1-11
src/pages/ReferralDetailPage.tsx:7-8
src/pages/ReferralDetailPage.tsx:33

**Notes**

This route handler is distinct from priority banding and slot-finder selection.

---

## Q4 — cross-cutting concern

**Status: NOT CHECKED**

> Everywhere eligibility is checked — list every place it happens.

**Answer**

The common check is `checkEligibility`. It is called when accepting a referral, when validating
or booking an appointment, and during nightly reverification of accepted or booked referrals.
Each caller emits an `eligibility:failed` event on failure with a phase identifying acceptance,
booking, or nightly processing.

**Files and lines**

src/triage/eligibility.ts:4-25
src/store/useClinicStore.ts:49-60
src/triage/validation.ts:6-20
src/jobs/nightlyReverification.ts:9-33

**Notes**

The direct calls in tests are not runtime application paths.

---

## Q5 — interceptor / pipeline chain

**Status: NOT CHECKED**

> What happens to an outgoing API request before it is sent?

**Answer**

Requests pass through `traceStage`, `authStage`, and `redactStage` in that order. The trace
stage adds an `X-Trace-Id`; auth adds a bearer token and `X-Staff-Role: triage`; and redaction
conditionally replaces safeguarding notes, phone, and postcode before the transport receives
the request.

**Files and lines**

src/api/api-client.ts:11-27
src/api/pipeline/trace-stage.ts:2-8
src/api/pipeline/auth-stage.ts:2-12
src/api/pipeline/redact-stage.ts:3-18

**Notes**

`reduceRight` composes the declared stage list so the request enters trace first, then auth,
then redact.

---

## Q6 — misleading name

**Status: NOT CHECKED**

> Does `checkAppointment` change any state, or does it only check?

**Answer**

It changes state. After checking eligibility, slot existence, availability, and service
coverage, it creates an appointment and mutates the chosen slot in place by assigning
`slot.bookedReferralId`. It also emits `appointment:booked` before returning the appointment.

**Files and lines**

src/triage/validation.ts:5-41

**Notes**

The function name and comment imply a check, but the slot mutation is the actual booking
operation.

---

## Q7 — legacy path

**Status: NOT CHECKED**

> Which slot-finding implementation runs for a follow-up referral, and why that one?

**Answer**

A follow-up uses the legacy `findContinuitySlots` implementation because
`referralPolicies.followUp.finder` is `continuity`, and the scheduling service maps that key to
`findContinuitySlots`. It prefers the already assigned clinician before flattening and sorting
compatible unbooked slots.

**Files and lines**

src/config/priorityRules.ts:18-30
src/scheduling/service.ts:1-19
src/scheduling/oldSlotFinder.ts:3-24

**Notes**

Despite the filename `oldSlotFinder`, this is an intentional live path for follow-up referrals.

---

## Q8 — event emitter

**Status: NOT CHECKED**

> What reacts when a scheduling event is emitted?

**Answer**

When `appointment:booked` is emitted, the scheduling listener records the slot ID in its
`recentlyBooked` set and the audit logger appends a derived audit entry to its module-local
event list. No listener is registered in this repository for `referral:accepted` or
`eligibility:failed`.

**Files and lines**

src/events/channel.ts:5-24
src/triage/validation.ts:36-40
src/scheduling/eventListener.ts:1-8
src/audit/logger.ts:1-17
src/App.tsx:7-8

**Notes**

Event delivery is synchronous. `App` imports both listener modules for their registration side
effects.

---

## Q9 — applied

**Status: NOT CHECKED**

> Where would a new referral type be added, and what else would need changing?

**Answer**

Add the literal to `ReferralType`, add its complete policy entry, and add a route module that
registers a handler for that type. The route loader will discover the module automatically.
Seed data, formatting and UI labels, and tests should be updated if the type must be displayed
and exercised.

**Files and lines**

src/types/domain.ts:1
src/config/priorityRules.ts:18-31
src/triage/routes/loadRoutes.ts:1-10
src/triage/routes/registry.ts:8-17
src/triage/routes/routine.ts:1-11
src/utils/format.ts:17-24

**Notes**

The `Record<ReferralType, ReferralPolicy>` makes the policy addition compile-time mandatory.
Type-specific eligibility, redaction, or UI rules are optional only if the new type does not
require them.

---

## Q10 — applied

**Status: NOT CHECKED**

> If the priority rules changed, what else would be affected?

**Answer**

Rule predicates, points, base points, or thresholds change the suggested band and the default
band saved when a referral is accepted, including its audit detail and severity. Target hours
change the banding decision displayed to the operator. Changing a policy's finder changes which
appointment slots are offered, because scheduling reads the same policy table.

**Files and lines**

src/config/priorityRules.ts:26-76
src/triage/banding.ts:15-29
src/store/useClinicStore.ts:49-78
src/components/PriorityPanel.tsx:18-47
src/scheduling/service.ts:10-19

**Notes**

An operator-supplied override bypasses the calculated band during acceptance, and `setPriority`
can change it later.

---

## Q11 — interceptor / pipeline chain

**Status: NOT CHECKED**

> Are safeguarding referrals treated differently anywhere? Where?

**Answer**

Yes. Their base score is 8 with a four-hour target, while the safeguarding signal adds 10
points. Their route requires a restricted review, Community Nursing, a phone call, safe-contact
precautions, and lead notification. Eligibility rejects safeguarding referrals for patients
under 16. Before API transport, safeguarding notes, phone, and postcode are redacted. This
type-specific handling is separate from the generic red priority UI.

**Files and lines**

src/config/priorityRules.ts:26-38
src/triage/routes/safeguarding.ts:1-11
src/triage/eligibility.ts:4-24
src/api/pipeline/redact-stage.ts:3-18

**Notes**

A non-safeguarding referral can still match the safeguarding-signal priority rule if its signal
is set; the eligibility and redaction branches specifically check the referral type.

---

## Q12 — misleading name

**Status: NOT CHECKED**

> Where is a slot actually booked?

**Answer**

The slot itself is booked inside `checkAppointment`, which finds the slot object and mutates
`slot.bookedReferralId`. The store's `bookAppointment` calls that function, then adds the
returned appointment and updates the referral to `booked` with appointment and clinician IDs.
`reserveSlot` returns a booked copy but has no runtime caller, so it is not the actual
application booking path.

**Files and lines**

src/triage/validation.ts:21-41
src/store/useClinicStore.ts:108-141
src/scheduling/service.ts:21-24

**Notes**

The clinician array is shallow-copied in the store after `checkAppointment` has already mutated
the nested slot object.
