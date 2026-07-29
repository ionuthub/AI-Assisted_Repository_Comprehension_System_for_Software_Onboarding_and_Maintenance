# Ground truth — clinic-triage (Repo B)

**This is the list of correct answers for the accuracy gate.** Twelve questions.

Each question carries a status:

- **CONFIRMED** — the researcher has read the code and signed it off. Usable.
- **CROSS-CHECKED** — drafted with AI assistance, then independently reviewed against the
  repository by a second pass, with every factual claim verified by grep or by reading the
  cited lines. Still needs the researcher's sign-off before use.
- **CROSS-CHECKED and re-verified** — as above, and then challenged a third time because the
  answer makes an absolute claim ("exactly three", "nothing ever"). One claim did not survive
  that pass and was withdrawn; see Q7.
- **NOT CHECKED** — draft only. Not ground truth.

Progress: **2 confirmed, 10 cross-checked and awaiting sign-off**, of which the four carrying
absolute claims have been re-verified.

A note on the retraction in Q7, because it is the useful one. The second pass explained the
inert clinician preference by saying a trailing sort destroyed it. Challenged, that explanation
proved wrong — the seed data gives every clinician's Nth slot an identical timestamp, so ties
are universal and a stable sort would have preserved the preference completely. The conclusion
held; the reason given for it did not. An answer can be right for a reason that is wrong, and
only a question aimed at the reason will find it.

Do not open the tool until all twelve are confirmed. Once an answer is seen from the tool it
cannot be unseen, and the gate stops measuring anything.

To validate every line reference in this file, from the artefact repository:

    python3 analysis/check_citations.py study/ground-truth.clinic-triage.md /path/to/Repo-B

## A note on what these answers now assert

The cross-check found a consistent gap in the original drafts: they described what the code
*declares* and under-reported where the declared intent never reaches the running application.
Five instances, all verified — the API pipeline is never loaded, the continuity finder's
clinician preference is never supplied, the calculated priority band is always overridden by
the interface, a set written by the scheduling listener is never read, and the store's
`setPriority` action has no callers at all.

The fifth was found late, by a third review, and it had been written into two answers as
though it were a live path. That is worth recording rather than quietly fixing: this file's
own summary announced that it had gone looking for exactly this class of thing and declared
the search complete at four. A stated intention to look for a kind of error is not the same as
having found all of them.

Those facts are now in the answers, which raises the standard the tool is being measured
against. A tool that sees three files of 2,500 characters cannot perform reachability analysis
across a repository, so it will fail several of these questions. That is the correct outcome
and it makes the gate more discriminating, but expect the accuracy figure to be lower than it
would have been against the original drafts, and say so when reporting it.

---

## Q1 — orientation

**Status: CONFIRMED — 28 July. Corrected: `App.tsx` range.**

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

**Status: CROSS-CHECKED — sign-off withdrawn 29 July. A third review found a false clause in
an answer that had already been confirmed. Needs re-reading.**

> How is a referral given its priority band?

**Answer**

`calculateBand` sums the referral type's configured base points with the points of every rule
whose `matches` predicate is satisfied, then takes the band of the first threshold the total
meets — red from 9, amber from 4, otherwise green. On acceptance the store uses that calculated
band unless the operator supplies an override.

**Files and lines**

src/config/priorityRules.ts:26-31
src/config/priorityRules.ts:33-70
src/config/priorityRules.ts:72-76
src/triage/banding.ts:15-30
src/store/useClinicStore.ts:61
src/store/useClinicStore.ts:94-107
src/pages/ReferralDetailPage.tsx:26-28
src/pages/ReferralDetailPage.tsx:49

**Notes**

Each entry in `priorityRules` declares a `band`, and `calculateBand` never reads it — line 22
takes `band` from `bandThresholds`, not from the rule. The declared band is not merely unused,
it is misleading in two cases. A routine referral (0 base points) matching only `mobility`
scores 2 and resolves to green, though the rule declares amber; the same holds for
`post-discharge`, which declares amber and is worth 3 points. Only the accumulated score and
`bandThresholds` determine the outcome.

The "unless the operator supplies an override" clause is doing more work than it appears. From
the interface an override is *always* supplied: `ReferralDetailPage` seeds its local `priority`
state to `referral?.priority ?? "green"` and passes it unconditionally to `acceptReferral`. The
override is therefore never `undefined`, so `calculateBand` never determines a stored band
through the UI. Its result reaches the operator only as a suggestion in `PriorityPanel`.

The store exposes a `setPriority` action that would change a stored band after acceptance, and
nothing calls it. `grep -rn setPriority src` returns four lines: the interface declaration, the
implementation, and two in `ReferralDetailPage` that are the component's own `useState` setter,
not the store action — a name collision, and the reason an earlier version of this answer
presented the action as a live path.

---

## Q3 — handler registry

**Status: CROSS-CHECKED — awaiting sign-off. Two ranges corrected.**

> Which code decides how a given referral type is processed?

**Answer**

The route registry decides. `loadRoutes` dynamically imports each route module, those modules
register handlers keyed by referral type, and `routeReferral` retrieves and invokes the handler
for `referral.type`. The detail page loads the modules before routing the current referral.

**Files and lines**

src/triage/routes/loadRoutes.ts:1-11
src/triage/routes/registry.ts:8-18
src/triage/routes/routine.ts:1-11
src/triage/routes/urgent.ts:1-11
src/triage/routes/followUp.ts:1-11
src/triage/routes/safeguarding.ts:1-11
src/pages/ReferralDetailPage.tsx:7-8
src/pages/ReferralDetailPage.tsx:33

**Notes**

This route handler is distinct from priority banding and slot-finder selection. The
`import.meta.glob` at loadRoutes.ts:1-5 excludes `registry.ts` and `loadRoutes.ts` itself, so a
new route module is discovered without editing any central list. `registry.test.ts:7-8`
independently asserts that four handlers register.

---

## Q4 — cross-cutting concern

**Status: CROSS-CHECKED and re-verified — awaiting sign-off. Notes were factually wrong and
have been replaced.**

> Everywhere eligibility is checked — list every place it happens.

**Answer**

The common check is `checkEligibility`. It is called from exactly three places in `src/`: when accepting a
referral, when booking an appointment, and during reverification of accepted or booked
referrals. Each caller emits an `eligibility:failed` event on failure with a phase identifying
acceptance, booking, or nightly processing.

**Files and lines**

src/triage/eligibility.ts:4-25
src/store/useClinicStore.ts:49-79
src/triage/validation.ts:12
src/jobs/nightlyReverification.ts:9-34
src/pages/AuditLogPage.tsx:27-34

**Notes**

The previous note claimed that tests call `checkEligibility` directly. They do not.
`grep -rn checkEligibility src` returns seven lines: three imports, the definition, and the
three call sites named above. `eligibility.test.ts` reaches it only indirectly, through
`useClinicStore.acceptReferral`.

The claim is absolute, so the ways it could be evaded were checked as well. There is no
`import *`, no re-export, and no `require` anywhere in the tree, and the only dynamic import is
the `import.meta.glob` in `loadRoutes.ts`, scoped to `./*.ts` within `src/triage/routes/`.
Nothing can reach the function under another name.

Despite its name, the "nightly" reverification is not scheduled. It runs only when an operator
presses the verify button on the audit log page.

---

## Q5 — interceptor / pipeline chain

**Status: CROSS-CHECKED and re-verified — awaiting sign-off. One range corrected; two facts
added, one of them strengthened on re-verification.**

> What happens to an outgoing API request before it is sent?

**Answer**

Requests pass through `traceStage`, `authStage`, and `redactStage` in that order. The trace
stage adds an `X-Trace-Id`; auth adds a bearer token and `X-Staff-Role: triage`; and redaction
replaces the notes, phone and postcode before the transport receives the request.

**Files and lines**

src/api/api-client.ts:11-28
src/api/pipeline/trace-stage.ts:2-8
src/api/pipeline/auth-stage.ts:2-12
src/api/pipeline/redact-stage.ts:3-16
src/api/pipeline/redact-stage.ts:17-18
src/api/referrals-api.ts:3-9
src/api/referrals-api.ts:10-16

**Notes**

`reduceRight` composes the declared stage list so the request enters trace first, then auth,
then redact.

Redaction is narrower than "conditionally" suggests: `redactBody` returns the body untouched
unless it is a referral whose `type` is `safeguarding` *and* which carries a `patient` object.

Nothing in the application ever exercises this pipeline, and the reason is stronger than an
absence of calls. `submitReferral` and `recordBooking` are the only functions that call
`apiRequest`, and neither has an importer. `api-client.ts` has exactly one importer,
`referrals-api.ts` itself, and no module outside `src/api/` imports anything from `src/api/` at
all. The module graph rooted at `main.tsx` therefore never reaches the directory, so the
`reduceRight` composition does not merely go uncalled — it never executes, because the module
is never loaded. No test imports it either. `transport` is a stub that echoes the request body.

One qualifier, because the distinction matters: this is unreachable, not dead. `tsconfig.app.json`
includes `src`, so these files are still type-checked and a break in them still fails the build.

---

## Q6 — misleading name

**Status: CROSS-CHECKED — awaiting sign-off. Range corrected; no other change.**

> Does `checkAppointment` change any state, or does it only check?

**Answer**

It changes state. After checking eligibility, slot existence, availability, and service
coverage, it creates an appointment and mutates the chosen slot in place by assigning
`slot.bookedReferralId`. It also emits `appointment:booked` before returning the appointment.

**Files and lines**

src/triage/validation.ts:5-42

**Notes**

The function name and comment imply a check, but the slot mutation is the actual booking
operation.

---

## Q7 — legacy path

**Status: CROSS-CHECKED and re-verified — awaiting sign-off. Two ranges corrected; four facts
added, one of which was withdrawn on re-verification and replaced with a firmer one.**

> Which slot-finding implementation runs for a follow-up referral, and why that one?

**Answer**

A follow-up uses the legacy `findContinuitySlots` implementation because
`referralPolicies.followUp.finder` is `continuity`, and the scheduling service maps that key to
`findContinuitySlots`. It filters clinicians to those active and offering the referral's
service, sorts them so any preferred clinician comes first, flattens their unbooked matching
slots, and sorts the result by start time.

**Files and lines**

src/config/priorityRules.ts:18-31
src/scheduling/service.ts:1-20
src/scheduling/oldSlotFinder.ts:3-24
src/scheduling/slotFinder.ts:11-14
src/store/useClinicStore.ts:129

**Notes**

Despite the filename `oldSlotFinder`, this is an intentional live path for follow-up referrals.

The comment at oldSlotFinder.ts:3 says slots are grouped by site before continuity is
considered. There is no site grouping anywhere in the function. This is the same species of
misleading comment as the Internet Explorer shim in Q1.

The clinician preference never operates, but not because of the trailing sort. `startsAt` is
derived from `slotIndex` alone in the seed data — `clinicianIndex` affects only
`durationMinutes` — so every clinician's Nth slot carries an identical timestamp. Slots at
different indices still differ in time; what matters is that the comparison across clinicians
is always a tie, and `Array.prototype.sort` is stable. The preference at lines 14-18 would
therefore survive the sort at line 24 intact.

What makes it inert is that `preferredClinicianId` is `referral.assignedClinicianId`, and that
field is undefined at every call site in the repository. It appears three times in `src/`: the
optional declaration, the read in the scheduling service, and a single write in the store during
booking. Every caller of `availableSlots` — the slot picker and three tests — passes a
seed-derived referral, and no seed referral sets it, so the comparator evaluates 0 for every
pair.

It is unreachable by construction rather than merely unseeded. The only write sets
`status: "booked"` at the same time; the slot picker renders only while `showBooking` is set or
the status is `accepted`; and the Accept button is disabled once the status is `booked`. There
is no path back into the booking flow for a referral that has an assigned clinician.

Unlike `findSlots`, the legacy finder has no `isAfter(now)` filter, so it can return slots in
the past. All seed slots are in the future, so this does not surface, but it is a real
behavioural divergence between the two paths.

---

## Q8 — event emitter

**Status: CROSS-CHECKED and re-verified — awaiting sign-off. One range corrected; two facts
added, one of them strengthened on re-verification.**

> What reacts when a scheduling event is emitted?

**Answer**

When `appointment:booked` is emitted, the scheduling listener records the slot ID in its
`recentlyBooked` set and the audit logger appends a derived entry to its module-local list.
Those are the only two subscriptions in the repository: nothing listens for
`referral:accepted` or `eligibility:failed`.

**Files and lines**

src/events/channel.ts:5-22
src/triage/validation.ts:37-40
src/scheduling/eventListener.ts:1-8
src/audit/logger.ts:1-17
src/pages/AuditLogPage.tsx:15
src/App.tsx:7-8

**Notes**

Event delivery is synchronous. `App` imports both listener modules for their registration side
effects.

The two listeners differ in whether their work is ever used. The audit logger's list is read by
the audit log page through `getEventAudit`, so it reaches the screen. The scheduling listener's
`recentlyBooked` set is only readable through `wasRecentlyBooked`, which has no callers — the
listener writes to a set nothing reads.

---

## Q9 — applied

**Status: CROSS-CHECKED — awaiting sign-off. Mandatory changes reclassified; three files added.**

> Where would a new referral type be added, and what else would need changing?

**Answer**

Four changes are mandatory, three of them enforced by the compiler under `strict`. Add the
literal to `ReferralType`; add a complete entry to `referralPolicies`, which is a
`Record<ReferralType, ReferralPolicy>`; extend the object literal inside `humaniseType`, which
is indexed by `ReferralType` and will not compile without the new key; and add a route module
that registers a handler, since `routeReferral` throws at runtime for an unregistered type. The
route loader discovers the module automatically.

Beyond that: `registry.test.ts` asserts that exactly four handlers register and will fail; the
pathway filter on the referral list is a hardcoded list of `<option>` elements, so a new type
would be unfilterable; and the type badge and dot carry per-type CSS classes, so a new type
falls back to the base rules. Seed data and type-specific eligibility or redaction rules are optional
depending on whether the new type needs them.

**Files and lines**

src/types/domain.ts:1
src/config/priorityRules.ts:26-31
src/utils/format.ts:17-24
src/triage/routes/loadRoutes.ts:1-11
src/triage/routes/registry.ts:8-18
src/triage/routes/routine.ts:1-11
src/tests/registry.test.ts:7-8
src/pages/ReferralListPage.tsx:84-87
src/styles.css:682-691
src/styles.css:936-939

**Notes**

The `TypeFilter` union in `useReferralFilters.ts:9` derives from `ReferralType` and widens
automatically, so the hook itself needs no change — only the hardcoded options it drives.

The styling consequence is subtler than "unstyled". There is no `.type-badge.type-routine`
rule at all: routine already relies on the base `.type-badge`, so a new type would receive the
same green badge and be indistinguishable from routine. The dot behaves differently — routine
has its own green rule, so a new type would fall back to the base grey, a colour no existing
type uses. The badge collides; the dot is merely meaningless.

---

## Q10 — applied

**Status: CROSS-CHECKED and re-verified — awaiting sign-off. Substantially reframed, and a
false closing Note removed on 29 July.**

> If the priority rules changed, what else would be affected?

**Answer**

Less than the code's structure suggests. Rule predicates, points, base points and thresholds all
feed `calculateBand`, and `calculateBand`'s result reaches only one place in the running
application: the suggestion displayed in `PriorityPanel`. It does not determine the band that
gets stored. `ReferralDetailPage` seeds its local `priority` state to `referral?.priority ??
"green"` and passes it to `acceptReferral` unconditionally, so the store's
`override ?? calculateBand(referral).band` always takes the override branch. An operator who
presses Accept without touching the panel stores green even when the suggestion is red.

Changing `targetHours` likewise changes only what the panel displays. Changing a policy's
`finder` is the one edit in that file with real reach, because the scheduling service reads the
same policy table to choose a slot finder. `banding.test.ts` also hardcodes expectations —
safeguarding to red, routine to 336 hours — and will fail.

**Files and lines**

src/config/priorityRules.ts:26-31
src/config/priorityRules.ts:33-70
src/config/priorityRules.ts:72-76
src/triage/banding.ts:15-30
src/store/useClinicStore.ts:49-79
src/pages/ReferralDetailPage.tsx:26-28
src/pages/ReferralDetailPage.tsx:49
src/components/PriorityPanel.tsx:16
src/scheduling/service.ts:10-20
src/tests/banding.test.ts:9
src/tests/banding.test.ts:13

**Notes**

`PriorityPanel.tsx:16` is where `calculateBand` is actually called; a citation starting at 18
shows only the consumption of the result.

The precise claim is that the stored band is always the panel's local state and never the
computed one — not that it is always green. Green is the particular outcome when an operator
accepts an unbanded referral without touching the panel, which is the case worth citing because
`PriorityPanel` labels the calculated band "Suggested" against a control that was never
preselected from it.

`calculateBand` does determine a stored band in exactly one place in the repository:
`eligibility.test.ts:11` calls `acceptReferral` without the override argument. No UI path does.

No seed referral carries a `priority` at all — `grep -c priority src/data/seed.ts` returns
zero — so `referral?.priority ?? "green"` resolves to `"green"` for every referral in the
application, not merely for unbanded ones. Accepting without touching the panel therefore
always stores green.

An earlier version of this Note claimed `setPriority` offered another route to a stored band.
It does not: the store action has no callers. See Q2.

---

## Q11 — interceptor / pipeline chain

**Status: CROSS-CHECKED — awaiting sign-off. Two ranges corrected; one site added.**

> Are safeguarding referrals treated differently anywhere? Where?

**Answer**

Yes, in five places. The priority configuration gives the type a base score of 8 and a four-hour
target, and a separate rule adds 10 points when the safeguarding signal is set. The route
handler requires a restricted review, Community nursing, a phone call, safe-contact precautions
and lead notification. Eligibility rejects safeguarding referrals for patients under 16. The
redaction stage replaces notes, phone and postcode for safeguarding referrals before transport.
And the referral list counts a referral towards the urgent tile if its type is safeguarding,
independently of its priority band.

**Files and lines**

src/config/priorityRules.ts:26-31
src/config/priorityRules.ts:34-39
src/triage/routes/safeguarding.ts:1-11
src/triage/eligibility.ts:4-25
src/api/pipeline/redact-stage.ts:3-16
src/api/pipeline/redact-stage.ts:17-18
src/pages/ReferralListPage.tsx:10-15

**Notes**

A non-safeguarding referral can still match the safeguarding-signal priority rule if its signal
is set; the eligibility and redaction branches check the referral type specifically.

The route handler's text reads "Community nursing" with a lowercase n.

---

## Q12 — misleading name

**Status: CROSS-CHECKED — awaiting sign-off. Three ranges corrected; no other change.**

> Where is a slot actually booked?

**Answer**

The slot itself is booked inside `checkAppointment`, which finds the slot object and mutates
`slot.bookedReferralId`. The store's `bookAppointment` calls that function, then adds the
returned appointment and updates the referral to `booked` with appointment and clinician IDs.
`reserveSlot` returns a booked copy but has no runtime caller, so it is not the actual
application booking path.

**Files and lines**

src/triage/validation.ts:5-42
src/triage/validation.ts:36
src/store/useClinicStore.ts:108-142
src/scheduling/service.ts:21-25

**Notes**

The clinician array is shallow-copied in the store at useClinicStore.ts:122, after
`checkAppointment` has already mutated the nested slot object at validation.ts:36 — so the copy
does not isolate the mutation.
