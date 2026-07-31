# Marking sheet — clinic-triage

<!-- accuracy-gate-binding: db2164d73eac47f60ac9d5e6c9f9aae7a3686c1b8e1ff2074931b507f65ff212 -->

12 questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

**What counts as the standard: the Answer, not the Notes.** Each question's Notes are shown
collapsed beneath it, because a marker needs to know what is in the repository, but an answer is
not incorrect merely for omitting something that appears only in a Note. The Notes record traps,
reachability findings and counter-examples; requiring a tool to reproduce all of them would set a
bar nothing could meet, and it was not the standard declared in advance.

This has to be stated because it was previously left implicit, and two markers then marked the
same items against different material — one seeing the Answer alone, one seeing the whole
ground-truth document. Some of what looked like disagreement was two people answering different
questions. Where an omission from a Note seems decisive, mark against the Answer and say so on
the "Why" line; that keeps the stricter reading available without hiding it inside the figure.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect study/accuracy-gate.clinic-triage.json marking.clinic-triage.md

---

## Q1 — orientation

> Where does execution start in this project?

### Ground truth — this is the standard

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. `App` itself defines the client routes. Importing the module also
installs the scheduling and audit event listeners: lines 7 and 8 are bare side-effect imports,
so neither statement binds a name and the act of importing is the whole effect.

**Files:** src/main.tsx:1-10, src/App.tsx:7-8, src/App.tsx:11-21

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The comment at src/main.tsx:5 states that an Internet Explorer compatibility shim is required.
No shim is imported and no code acts on it. The comment describes something the code does not
do.

An earlier version of this answer said nothing reads a value from either module. That is true
of `scheduling/eventListener`, whose only export has no callers, and false of `audit/logger`:
`AuditLogPage` imports `getEventAudit` and calls it, which is what Q8 relies on when it says
the audit list reaches the screen. The claim about lines 7 and 8 is about those two statements,
not about the modules elsewhere in the application.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/validation.ts (0.09), src/data/seed.ts (0.04), src/tests/eligibility.test.ts (0.04)

```
Based on the provided repository context, the main application entry point (such as a server startup script, CLI entry, or frontend mount file) is not present.

However, within the provided files, execution can be initiated via the test suite:

1. **Test Execution:** The test runner (Vitest) executes tests starting in files like `src/tests/eligibility.test.ts`. This file initializes state using `useClinicStore.setState` with seed data from `src/data/seed.ts` and runs assertions on the triage and eligibility logic.

If there is a main entry file (e.g., `index.ts`, `main.ts`, or `server.ts`), it is outside the provided context.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q2 — config-driven behaviour

> How is a referral given its priority band?

### Ground truth — this is the standard

`calculateBand` sums the referral type's configured base points with the points of every rule
whose `matches` predicate is satisfied, then takes the band of the first threshold the total
meets — red from 9, amber from 4, otherwise green. On acceptance the store uses that calculated
band unless the operator supplies an override.

**Files:** src/config/priorityRules.ts:26-31, src/config/priorityRules.ts:33-70, src/config/priorityRules.ts:72-76, src/triage/banding.ts:15-30, src/store/useClinicStore.ts:61, src/store/useClinicStore.ts:94-107, src/pages/ReferralDetailPage.tsx:26-28, src/pages/ReferralDetailPage.tsx:49, src/pages/ReferralDetailPage.tsx:96-104

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

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

A band *can* be changed after acceptance, but not through the action named for it. The Accept
button is relabelled "Update priority" whenever the status is not `incoming`, stays enabled
until the referral is booked, and calls `acceptReferral` again with the panel's current
selection — which stores the new band, re-runs `checkEligibility`, re-emits `referral:accepted`
and writes an audit entry reading "Referral accepted" for what the interface called an update.

The store also exposes a `setPriority` action for the same purpose, and nothing calls it. `grep -rn setPriority src` returns four lines: the interface declaration, the
implementation, and two in `ReferralDetailPage` that are the component's own `useState` setter,
not the store action — a name collision, and the reason an earlier version of this answer
presented the action as a live path. Striking the clause outright then went too far in the
other direction, implying nothing re-bands after acceptance when the Accept button does.

The absence was confirmed by enumeration rather than by the grep alone. `useClinicStore` appears
on twenty-seven lines across seven files — `eligibility.test.ts` (9), `ReferralDetailPage` (6),
`AuditLogPage` (3), `ClinicianOverviewPage` (3), `Layout` (3), `ReferralListPage` (2), and the
store's own definition (1) — and seventeen member references reached through `state.` or
`getState().`, one of them split across `eligibility.test.ts:12-14` and so invisible to a
line-oriented grep. None reaches `state.setPriority`. The audit entry the
action writes, "Priority changed", can therefore never appear in the application.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/components/PriorityPanel.tsx (0.57), src/triage/banding.ts (0.49), src/hooks/useReferralFilters.ts (0.39)

```
A referral is assigned its priority band through a rule-based scoring engine defined in `src/triage/banding.ts` and rendered in `src/components/PriorityPanel.tsx`.

The process is executed by the `calculateBand(referral: Referral)` function in `src/triage/banding.ts`, which performs the following steps:

1. Context Preparation

The function creates an evaluation context combining the referral's clinical signals and its referral type:

```typescript

const context = { ...referral.signals, type: referral.type };

```

2. Rule Matching

It filters the configured priority rules (`priorityRules` imported from `../config/priorityRules`) to identify which ones match the referral's context:

```typescript

const matched = priorityRules.filter((rule) => rule.matches(context));

```

3. Score Calculation

The total score is calculated by starting with a base score defined for the specific referral type and adding the points associated with each matched rule:

```typescript

const score =

referralPolicies[referral.type].basePoints +

matched.reduce((total, rule) => total + rule.points, 0);

```

4. Band Determination

The calculated score is compared against thresholds defined in `bandThresholds` (imported from `../config/priorityRules`). It assigns the first band whose minimum score requirement is met, defaulting to `"green"` if no thresholds match:

```typescript

const band =

bandThresholds.find((threshold) => score >= threshold.minimum)?.band ??

"green";

```

5. Return Payload

The function returns a `BandingDecision` object containing:

`band`: The calculated `PriorityBand` (`"red"`, `"amber"`, or `"green"`).
`score`: The final numerical score.
`matchedRules`: An array of the matching rule IDs (`rule.id`).
`targetHours`: The target response time in hours, retrieved from the policy matching the referral type (`referralPolicies[referral.type].targetHours`).

---

UI Integration and Manual Override

In the user interface (`src/components/PriorityPanel.tsx`), this calculated decision is presented as a "Suggested band" (e.g., Priority 1, 2, or 3) alongside the matched signals.

While the system calculates this suggestion automatically, the UI allows an operator to manually select and override the final priority band by triggering the `onSelect(band)` callback (passed down to `PriorityPanel` as a prop).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q3 — handler registry

> Which code decides how a given referral type is processed?

### Ground truth — this is the standard

The route registry decides. `loadRoutes` dynamically imports each route module, those modules
register handlers keyed by referral type, and `routeReferral` retrieves and invokes the handler
for `referral.type`. The detail page loads the modules before routing the current referral.

**Files:** src/triage/routes/loadRoutes.ts:1-11, src/triage/routes/registry.ts:8-18, src/triage/routes/routine.ts:1-11, src/triage/routes/urgent.ts:1-11, src/triage/routes/followUp.ts:1-11, src/triage/routes/safeguarding.ts:1-11, src/pages/ReferralDetailPage.tsx:7-8, src/pages/ReferralDetailPage.tsx:33

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

This route handler is distinct from priority banding and slot-finder selection. The
`import.meta.glob` at loadRoutes.ts:1-5 excludes `registry.ts` and `loadRoutes.ts` itself, so a
new route module is discovered without editing any central list. `registry.test.ts:7-8`
independently asserts that four handlers register.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/hooks/useReferralFilters.ts (0.36), src/triage/routes/registry.ts (0.35), src/api/referrals-api.ts (0.32)

```
The decision-making and processing of a given referral type is managed by the routing registry in **`src/triage/routes/registry.ts`**.

Mechanism and Flow

1. **Handler Registry**:

A private map associates each `ReferralType` with a specific `RouteHandler` function:

```typescript

const handlers = new Map<ReferralType, RouteHandler>();

```

2. **Registration**:

Individual route handlers are registered for specific referral types using the `registerRoute` function:

```typescript

export function registerRoute(type: ReferralType, handler: RouteHandler): void {

handlers.set(type, handler);

}

```

3. **Execution/Resolution**:

When a referral needs to be processed, `routeReferral` is called. It dynamically resolves the correct handler based on the referral's type (`referral.type`) and executes it to produce a `RouteOutcome`:

```typescript

export function routeReferral(referral: Referral): RouteOutcome {

const handler = handlers.get(referral.type);

if (!handler)

throw new Error(`No routing handler registered for ${referral.type}`);

return handler(referral);

}

```

Key Interfaces (`src/triage/routes/registry.ts`)
**`RouteOutcome`**: Defines the structure of the processing decision, including:

* `summary: string`

* `recommendedService: string`

* `requiresPhoneCall: boolean`

* `instructions: string[]`

**`RouteHandler`**: A function signature `(referral: Referral) => RouteOutcome` that implements the specific business logic for a given referral type.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q4 — cross-cutting concern

> Everywhere eligibility is checked — list every place it happens.

### Ground truth — this is the standard

The common check is `checkEligibility`. It is called from exactly three places in `src/`: when accepting a
referral, when booking an appointment, and during reverification of accepted or booked
referrals. Each caller emits an `eligibility:failed` event on failure with a phase identifying
acceptance, booking, or nightly processing.

**Files:** src/triage/eligibility.ts:4-25, src/store/useClinicStore.ts:49-79, src/triage/validation.ts:12, src/jobs/nightlyReverification.ts:9-34, src/pages/AuditLogPage.tsx:27-34

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

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

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/jobs/nightlyReverification.ts (0.13), src/triage/validation.ts (0.11), src/triage/eligibility.ts (0.11)

```
Based on the provided codebase, eligibility checks are centralized around the `checkEligibility` function defined in `src/triage/eligibility.ts` (lines 4–26).

This function is invoked in the following two places:

1. Nightly Reverification Job
**File:** `src/jobs/nightlyReverification.ts` (lines 19–20)
**Context:** Inside the `runNightlyReverification` function. It filters a list of referrals for those with a status of `"accepted"` or `"booked"`, then iterates through them to re-verify eligibility:

```typescript

const result = checkEligibility(referral);

```

**Consequence of Failure:** If the check fails (`!result.eligible`), the referral is added to the failures list and a `"eligibility:failed"` event is emitted with the phase set to `"nightly"`.
2. Appointment Booking Validation
**File:** `src/triage/validation.ts` (lines 11–12)
**Context:** Inside the `checkAppointment` function, which validates whether a requested appointment slot can be booked for a given referral:

```typescript

const eligibility = checkEligibility(referral);

```

**Consequence of Failure:** If the check fails (`!eligibility.eligible`), an `"eligibility:failed"` event is emitted with the phase set to `"booking"`, and an error is thrown containing the joined eligibility reasons, halting the booking process.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q5 — pipeline chain

> What happens to an outgoing API request before it is sent?

### Ground truth — this is the standard

Requests pass through `traceStage`, `authStage`, and `redactStage` in that order. The trace
stage adds an `X-Trace-Id`; auth adds a bearer token and `X-Staff-Role: triage`; and redaction
replaces the notes, phone and postcode before the transport receives the request.

**Files:** src/api/api-client.ts:11-28, src/api/pipeline/trace-stage.ts:2-8, src/api/pipeline/auth-stage.ts:2-12, src/api/pipeline/redact-stage.ts:3-16, src/api/pipeline/redact-stage.ts:17-18, src/api/referrals-api.ts:3-9, src/api/referrals-api.ts:10-16

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

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

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/pipeline/types.ts (0.66), src/api/api-client.ts (0.56), src/api/referrals-api.ts (0.51)

```
Based on the provided codebase, when an outgoing API request is initiated (for example, via `submitReferral` or `recordBooking` in `src/api/referrals-api.ts`), it undergoes the following transformation and pipeline execution before completion:

1. Header Initialization

In `src/api/api-client.ts`, the `apiRequest` function ensures that the `headers` property is defined. If no headers are provided by the caller, it defaults them to an empty object:

```typescript

// src/api/api-client.ts, lines 20-24

export function apiRequest<T>(

request: Omit<ApiRequest, "headers"> & { headers?: Record<string, string> },

): Promise<ApiResponse<T>> {

return composed({ ...request, headers: request.headers ?? {} }).then(

(response) => response as ApiResponse<T>,

);

}

```

2. Pipeline Processing (Middleware Chain)

The request is passed to `composed`, which is a pipeline constructed using `Array.prototype.reduceRight` over an array of middleware stages (`ApiStage`).

The stages are defined in `src/api/api-client.ts` (lines 15–19):

```typescript

const stages: ApiStage[] = [traceStage, authStage, redactStage];

const composed = stages.reduceRight<ApiNext>(

(next, stage) => (request) => stage(request, next),

transport,

);

```

Because `reduceRight` processes the array from right to left with `transport` as the initial accumulator, the execution order of the stages when a request is dispatched is:

1. **`traceStage`** (imported from `./pipeline/trace-stage`): Receives the request first, performs its tracing operations, and calls `next(request)`.

2. **`authStage`** (imported from `./pipeline/auth-stage`): Receives the request next, handles authentication/authorization headers or tokens, and calls `next(request)`.

3. **`redactStage`** (imported from `./pipeline/redact-stage`): Receives the request third, likely scrubs or sanitizes sensitive data, and calls `next(request)`.

*(Note: The exact internal implementations of `traceStage`, `authStage`, and `redactStage` are not present in the provided source context.)*

3. Terminal Transport Execution

The final `next` callback in the pipeline is the terminal `transport` function. In the current implementation, this acts as a mock/stub transport layer that resolves the request locally:

```typescript

// src/api/api-client.ts, lines 9-14

const transport: ApiNext = (request) =>

Promise.resolve({

status: 200,

data: request.body ?? { ok: true },

requestId: request.headers["X-Trace-Id"] ?? "local",

});

```

This terminal stage captures the final state of the `ApiRequest` (including any modifications to `body` or `headers` made by the stages) and returns a mock `ApiResponse`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q6 — misleading name

> Does `checkAppointment` change any state, or does it only check?

### Ground truth — this is the standard

It changes state. After checking eligibility, slot existence, availability, and service
coverage, it creates an appointment and mutates the chosen slot in place by assigning
`slot.bookedReferralId`. It also emits `appointment:booked` before returning the appointment.

**Files:** src/triage/validation.ts:5-42

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The function name and comment imply a check, but the slot mutation is the actual booking
operation.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/validation.ts (0.21), src/store/useClinicStore.ts (0.13), src/tests/scheduling.test.ts (0.1)

```
Yes, despite its name, `checkAppointment` **does change state** and is not a pure check. It performs in-place mutation of its arguments and emits side-effect events.

Specifically, it changes state in the following ways:

1. In-Place Argument Mutation

Within `src/triage/validation.ts`, once the function validates that a slot is available and compatible, it mutates the `clinician` object passed as an argument by setting the `bookedReferralId` property on the selected slot:

```typescript

// src/triage/validation.ts (line 34)

slot.bookedReferralId = referral.id;

```

This mutation is relied upon by the Zustand store in `src/store/useClinicStore.ts` to persist the booking:

```typescript

// src/store/useClinicStore.ts (lines 116-128)

const appointment = checkAppointment(

referral,

clinician, // This object is mutated in-place by checkAppointment

slotId,

state.actor,

);

set((current) => ({

appointments: [...current.appointments, appointment],

clinicians: [...current.clinicians], // Propagates the mutated clinician reference

// ...

}));

```

This behavior is also explicitly verified in the test suite:

```typescript

// src/tests/scheduling.test.ts (lines 24-25)

const appointment = checkAppointment(referral, clinician, slot.id, "Tester");

expect(slot.bookedReferralId).toBe(referral.id); // Asserts that the slot state was mutated

```

2. Side-Effect Event Emission

`checkAppointment` triggers external state changes by emitting events over the `clinicEvents` event emitter:

**On failure (ineligibility):** It emits `eligibility:failed` (`src/triage/validation.ts`, lines 14-18).
**On success:** It emits `appointment:booked` (`src/triage/validation.ts`, lines 35-38).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q7 — legacy path

> Which slot-finding implementation runs for a follow-up referral, and why that one?

### Ground truth — this is the standard

A follow-up uses the legacy `findContinuitySlots` implementation because
`referralPolicies.followUp.finder` is `continuity`, and the scheduling service maps that key to
`findContinuitySlots`. It filters clinicians to those active and offering the referral's
service, sorts them so any preferred clinician comes first, flattens their unbooked matching
slots, and sorts the result by start time.

**Files:** src/config/priorityRules.ts:18-31, src/scheduling/service.ts:1-20, src/scheduling/oldSlotFinder.ts:3-24, src/scheduling/slotFinder.ts:11-14, src/store/useClinicStore.ts:129

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

Despite the filename `oldSlotFinder`, this is an intentional live path for follow-up referrals.

The comment at oldSlotFinder.ts:3 says slots are grouped by site before continuity is
considered. There is no site grouping anywhere in the function. This is the same species of
misleading comment as the Internet Explorer shim in Q1.

The clinician preference never operates, but not because of the trailing sort. `startsAt` is
derived from `slotIndex` alone in the seed data — `clinicianIndex` affects only
`durationMinutes` — so two clinicians' slots at the same index carry an identical timestamp. A
slot's service is `person[3][slotIndex % person[3].length]`, though, so clinicians offering
different numbers of services match a given service at different indices and coincide only
sometimes: for a Cardiology referral, `c1` contributes indices 0, 2, 4 and 6 while `c4`
contributes 2 and 5, so one pair out of six ties. Ties arise only where two clinicians both
offer a matching slot at the same index; `sort` is stable, so the preference survives those and
never gets a chance to matter elsewhere, where the earlier time simply wins.

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

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/routes/followUp.ts (0.47), src/scheduling/service.ts (0.35), src/scheduling/types.ts (0.32)

```
Based on the provided codebase context, the exact slot-finding implementation that runs for a follow-up referral cannot be definitively confirmed because the configuration file **`src/config/priorityRules` is not included in the provided context**.

However, we can trace the control flow and deduce the expected behavior:

1. Control Flow for Finder Selection

In `src/scheduling/service.ts`, the function `availableSlots` determines which finder to use by looking up the referral's type in the `referralPolicies` configuration:

```typescript

// src/scheduling/service.ts, lines 12-16

export function availableSlots(

referral: Referral,

clinicians: Clinician[],

): Slot[] {

const finder = finders[referralPolicies[referral.type].finder];

...

}

```

This resolved key maps to one of two implementations registered in the `finders` registry (lines 5–8):

**`standard`**: Runs `findSlots` (imported from `src/scheduling/slotFinder`).
**`continuity`**: Runs `findContinuitySlots` (imported from `src/scheduling/oldSlotFinder`).
2. Clinical Intent (The "Why")

In `src/triage/routes/followUp.ts`, the `"followUp"` route configures the clinical pathway with the following instructions:

```typescript

// src/triage/routes/followUp.ts, lines 7-11

instructions: [

"Review previous clinical letter",

"Prefer the previous care team",

"Check outstanding investigations",

],

```

Because the instructions explicitly dictate **"Prefer the previous care team"**, the system is designed to prioritize continuity of care. Consequently, the follow-up referral type is logically intended to map to the **`continuity`** finder (`findContinuitySlots`), which utilizes the `preferredClinicianId` (passed via `referral.assignedClinicianId` in `src/scheduling/service.ts`, line 19) to match the patient with their previous clinician.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q8 — event emitter

> What reacts when a scheduling event is emitted?

### Ground truth — this is the standard

When `appointment:booked` is emitted, the scheduling listener records the slot ID in its
`recentlyBooked` set and the audit logger appends a derived entry to its module-local list.
Those are the only two subscriptions in the repository: nothing listens for
`referral:accepted` or `eligibility:failed`.

**Files:** src/events/channel.ts:5-22, src/triage/validation.ts:37-40, src/scheduling/eventListener.ts:1-8, src/audit/logger.ts:1-17, src/pages/AuditLogPage.tsx:15, src/App.tsx:7-8

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

Event delivery is synchronous. `App` imports both listener modules for their registration side
effects.

The two listeners differ in whether their work is ever used. The audit logger's list is read by
the audit log page through `getEventAudit`, so it reaches the screen. The scheduling listener's
`recentlyBooked` set is only readable through `wasRecentlyBooked`, which has no callers — the
listener writes to a set nothing reads.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/scheduling/eventListener.ts (0.18), src/audit/logger.ts (0.18), src/events/channel.ts (0.14)

```
Based on the provided codebase, when a scheduling event—specifically the `"appointment:booked"` event—is emitted via the global `clinicEvents` channel (`src/events/channel.ts`), two distinct modules react to it:

1. In-Memory Slot Cache (`src/scheduling/eventListener.ts`)

This module tracks recently booked slots to prevent double-booking or to verify booking state.

**Reaction**: It registers a listener that extracts the `slotId` from the emitted appointment payload and adds it to an in-memory `recentlyBooked` `Set`.
**Code Reference**:

```typescript

// src/scheduling/eventListener.ts (lines 3-5)

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

**Downstream Impact**: This populates the state queried by the exported helper `wasRecentlyBooked(slotId)` (lines 6-8).
2. Audit Logger (`src/audit/logger.ts`)

This module creates a chronological audit trail of booking actions.

**Reaction**: It registers a listener that constructs an `AuditEntry` object containing metadata about the action (actor, action description, severity, and formatted detail string containing the patient and clinician names). It prepends this entry (`unshift`) to an in-memory `eventEntries` array.
**Code Reference**:

```typescript

// src/audit/logger.ts (lines 4-15)

clinicEvents.on("appointment:booked", ({ appointment, patientName }) => {

eventEntries.unshift({

id: `event-${appointment.id}`,

occurredAt: new Date().toISOString(),

actor: appointment.bookedBy,

action: "Appointment booked",

referralId: appointment.referralId,

detail: `Booked ${patientName} with clinician ${appointment.clinicianId}`,

severity: "info",

});

});

```

**Downstream Impact**: This populates the audit log retrieved via the exported `getEventAudit()` function (lines 16-18).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q9 — applied

> Where would a new referral type be added, and what else would need changing?

### Ground truth — this is the standard

Four changes are mandatory. Two are omissions the compiler reports under `strict`; the third is
the edit that causes it to report them, and the fourth fails only at run time. Add the
literal to `ReferralType`; add a complete entry to `referralPolicies`, which is a
`Record<ReferralType, ReferralPolicy>`; extend the object literal inside `humaniseType`, which
is indexed by `ReferralType` and will not compile without the new key; and add a route module
that registers a handler, since `routeReferral` throws at runtime for an unregistered type — the
handler map is a `Map` and enforces nothing at compile time. The route loader discovers the
module automatically. The `humaniseType` error is gated on `noImplicitAny`, so the `strict`
qualifier is load-bearing rather than decorative.

Beyond that: `registry.test.ts` asserts that exactly four handlers register and will fail; the
pathway filter on the referral list is a hardcoded list of `<option>` elements, so a new type
would be unfilterable; and the type badge and dot carry per-type CSS classes, so a new type
falls back to the base rules. Seed data and type-specific eligibility or redaction rules are optional
depending on whether the new type needs them.

**Files:** src/types/domain.ts:1, src/config/priorityRules.ts:26-31, src/utils/format.ts:17-24, src/triage/routes/loadRoutes.ts:1-11, src/triage/routes/registry.ts:8-18, src/triage/routes/routine.ts:1-11, src/tests/registry.test.ts:7-8, src/pages/ReferralListPage.tsx:84-87, src/styles.css:682-691, src/styles.css:692-702, src/styles.css:936-939, src/styles.css:940-951

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The `TypeFilter` union in `useReferralFilters.ts:9` derives from `ReferralType` and widens
automatically, so the hook itself needs no change — only the hardcoded options it drives.

The styling consequence is subtler than "unstyled". There is no `.type-badge.type-routine`
rule at all: routine already relies on the base `.type-badge`, so a new type would receive the
same green badge and be indistinguishable from routine. The dot behaves differently — routine
has its own green rule, so a new type would fall back to the base grey, a colour no existing
type uses. The badge collides; the dot is merely meaningless.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/registry.test.ts (0.29), src/tests/banding.test.ts (0.26), src/hooks/useReferralFilters.ts (0.18)

```
Based on the provided repository context, here is where a new referral type would be added and the cascading changes required across the system:

1. Define the Type in Domain Types

The primary definition of referral types resides in `src/types/domain` (as imported in `src/hooks/useReferralFilters.ts` on line 5).

**Action:** Add the new string literal representing your referral type to the `ReferralType` union type definition.

---

2. Update Banding and SLA Logic

Referral types are used to determine priority banding and target resolution times (SLAs).

**Action:** Update the banding rules in `src/triage/banding` (referenced in `src/tests/banding.test.ts`) to define how this new referral type is triaged (e.g., target hours, priority band color like `"red"` or `"routine"`).
**Action:** Add a corresponding unit test in `src/tests/banding.test.ts` to assert that the new referral type resolves to the correct band and target hours.

---

3. Implement Routing Rules

The application dynamically loads routing handlers (`src/tests/registry.test.ts`, line 6).

**Action:** If the new referral type requires unique routing behavior (similar to how `"urgent"` referrals require a phone call, see `src/tests/registry.test.ts` line 11), you will need to add or modify a route handler. Since `loadRoutes` dynamically loads handlers (tested in `src/tests/registry.test.ts`), you may need to add a new route file under the routes directory (e.g., `src/triage/routes/`).
**Action:** Add a test case in `src/tests/registry.test.ts` verifying the routing behavior of the new type.

---

4. Seed Data

Tests and local development rely on seed data.

**Action:** Add a referral containing your new type to `seedReferrals` inside `src/data/seed` (referenced in `src/tests/registry.test.ts` and `src/tests/banding.test.ts`).

---

5. UI and Filtering

The filtering hook `src/hooks/useReferralFilters.ts` automatically incorporates the new type into its `TypeFilter` definition:

```typescript

export type TypeFilter = ReferralType | "all";

```

**Action:** While the hook's TypeScript definition and filter logic (`matchesType` on line 32) will automatically support the new type, you must update any UI component rendering the filter dropdown/options to ensure the new type is selectable by users.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q10 — applied

> If the priority rules changed, what else would be affected?

### Ground truth — this is the standard

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

**Files:** src/config/priorityRules.ts:26-31, src/config/priorityRules.ts:33-70, src/config/priorityRules.ts:72-76, src/triage/banding.ts:15-30, src/store/useClinicStore.ts:49-79, src/pages/ReferralDetailPage.tsx:26-28, src/pages/ReferralDetailPage.tsx:49, src/components/PriorityPanel.tsx:16, src/scheduling/service.ts:10-20, src/tests/banding.test.ts:9, src/tests/banding.test.ts:13

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

`PriorityPanel.tsx:16` is where `calculateBand` is actually called; a citation starting at 18
shows only the consumption of the result.

The precise claim is that the stored band is always the panel's local state and never the
computed one — not that it is always green. Green is the particular outcome when an operator
accepts an unbanded referral without touching the panel, which is the case worth citing because
`PriorityPanel` labels the calculated band "Suggested" against a control that was never
preselected from it.

`calculateBand` does determine a stored band in exactly one place in the repository:
`eligibility.test.ts:11` calls `acceptReferral` without the override argument. No UI path does.

No seed referral carries a `priority`, so on a first visit `referral?.priority ?? "green"`
resolves to green and an operator who presses Accept without touching the panel stores green
even when the suggestion is red. That is as far as the claim goes. The `useState` initialiser
runs once per mount, so after a band has been stored, navigating away and back re-seeds the
local state from it.

(The supporting grep is case-sensitive: `grep -ci priority src/data/seed.ts` returns 1, matching
an audit fixture reading "Priority set to green". The conclusion stands on the referral
fixtures, not on the command.)

An earlier version of this Note claimed `setPriority` offered another route to a stored band.
It does not: the store action has no callers, and the route that does exist is the Accept
button. See Q2.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/banding.ts (0.21), src/tests/banding.test.ts (0.17), src/components/PriorityPanel.tsx (0.15)
Unverified mentions: src/config/priorityRules.ts Not retrieved

```
Based on the provided codebase, changing the priority rules (defined in `src/config/priorityRules.ts` and imported/used across the system) would directly affect the following areas:

1. Banding Calculation Logic (`src/triage/banding.ts`)

The `calculateBand` function evaluates the priority rules against a referral's signals and type:

**Score Calculation**: The total `score` is computed by summing the base points of the referral type with the points of all matched rules (`matched.reduce((total, rule) => total + rule.points, 0)`). Any changes to rule points or matching criteria will directly alter this score.
**Band Resolution**: The resulting `band` (e.g., `"red"`, `"amber"`, `"green"`) is determined by mapping the calculated score against `bandThresholds`. If rules are added, removed, or their point values are modified, referrals may resolve to different priority bands.
**Matched Rules Tracking**: The `matchedRules` array (which maps matched rules to their string IDs) will change based on which rules match the updated criteria.
2. User Interface (`src/components/PriorityPanel.tsx`)

The UI relies directly on the output of `calculateBand(referral)` to render the triage state:

**Suggested Band Indicator**: The suggested band label (`bandLabel(decision.band)`) and the `<em>Suggested</em>` badge on the priority option buttons will shift according to the newly calculated band.
**Score Display**: The element `<span className="score">Score {decision.score}</span>` will display the updated point total.
**Rule Explanation List**: The `.rule-list` section maps over `decision.matchedRules` to display active escalation signals (e.g., rendering rule IDs with hyphens replaced by spaces via `rule.replaceAll("-", " ")`). If rule IDs or match conditions change, this list will update or display different text.
3. Test Suite (`src/tests/banding.test.ts`)

The test suite contains assertions that depend on the behavior of current priority rules:

**Safeguarding Banding Test**: `it("gives safeguarding work the highest band", ...)` expects a safeguarding referral to resolve to `"red"`.
**Explainability Test**: `it("records matched rules for explainability", ...)` asserts that a referral with the `deterioration` signal matches at least one rule (`expect(calculateBand(referral).matchedRules.length).toBeGreaterThan(0)`). If the rule matching `deterioration` is modified or removed, this test will fail.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q11 — pipeline chain

> Are safeguarding referrals treated differently anywhere? Where?

### Ground truth — this is the standard

Yes, in five places. The priority configuration gives the type a base score of 8 and a four-hour
target, and a separate rule adds 10 points when the safeguarding signal is set. The route
handler requires a restricted review, Community nursing, a phone call, safe-contact precautions
and lead notification. Eligibility rejects safeguarding referrals for patients under 16. The
redaction stage replaces notes, phone and postcode for safeguarding referrals before transport.
And the referral list counts a referral towards the urgent tile if its type is safeguarding,
independently of its priority band.

**Files:** src/config/priorityRules.ts:26-31, src/config/priorityRules.ts:34-39, src/triage/routes/safeguarding.ts:1-11, src/triage/eligibility.ts:4-25, src/api/pipeline/redact-stage.ts:3-16, src/api/pipeline/redact-stage.ts:17-18, src/pages/ReferralListPage.tsx:10-15

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

A non-safeguarding referral can still match the safeguarding-signal priority rule if its signal
is set; the eligibility and redaction branches check the referral type specifically.

"Five places" counts behavioural branches. A reader counting presentational differences reaches
six, because `styles.css` groups safeguarding with urgent for both badge and dot colour — that
is shared styling rather than safeguarding-specific handling, which is why it is not in the
list.

The route handler's text reads "Community nursing" with a lowercase n.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/routes/safeguarding.ts (0.27), src/tests/eligibility.test.ts (0.19), src/tests/banding.test.ts (0.13)
Unverified mentions: src/triage/banding.ts Not retrieved

```
Based on the provided codebase context, safeguarding referrals (where the referral type is `"safeguarding"`) are treated differently in two main areas:

1. Triage Routing and Instructions

In `src/triage/routes/safeguarding.ts` (lines 1–12), a specialized route is registered for safeguarding referrals. When processed, it applies distinct configuration parameters and safety protocols:

**Summary**: Generated as a restricted review: `` `Restricted safeguarding review for ${referral.patient.name}` ``.
**Recommended Service**: Hardcoded to `"Community nursing"`.
**Communication Constraints**: `requiresPhoneCall` is set to `true`.
**Safety Instructions**: Includes a specific set of instructions to mitigate risk:

* `"Do not leave a voicemail"`

* `"Check safe contact method"`

* `"Notify safeguarding lead"`

2. Banding and Prioritization

In `src/triage/banding.ts` (tested in `src/tests/banding.test.ts`, lines 5–11), safeguarding referrals are prioritized with the highest urgency band:

**Priority Banding**: The `calculateBand` function assigns safeguarding referrals to the `"red"` band (the highest urgency level). This is verified by the test `"gives safeguarding work the highest band"`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q12 — misleading name

> Where is a slot actually booked?

### Ground truth — this is the standard

The slot itself is booked inside `checkAppointment`, which finds the slot object and mutates
`slot.bookedReferralId`. The store's `bookAppointment` calls that function, then adds the
returned appointment and updates the referral to `booked` with appointment and clinician IDs.
`reserveSlot` returns a booked copy but has no runtime caller, so it is not the actual
application booking path.

**Files:** src/triage/validation.ts:5-42, src/triage/validation.ts:36, src/store/useClinicStore.ts:108-142, src/scheduling/service.ts:21-25

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The clinician array is shallow-copied in the store at useClinicStore.ts:122, after
`checkAppointment` has already mutated the nested slot object at validation.ts:36 — so the copy
does not isolate the mutation.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/scheduling/service.ts (0.5), src/scheduling/eventListener.ts (0.45), src/scheduling/slotFinder.ts (0.44)

```
Based on the provided codebase context, the booking of a slot is handled in two places, representing an in-memory state transition and an event-driven tracking mechanism. There is no database or persistent storage implementation shown in the provided files.

1. In-Memory State Update

In `src/scheduling/service.ts`, the `reserveSlot` function is responsible for marking a slot as booked by associating it with a `referralId`:

```typescript

export function reserveSlot(slot: Slot, referralId: string): Slot {

if (slot.bookedReferralId)

throw new Error("This slot has already been booked");

return { ...slot, bookedReferralId: referralId };

}

```

This function performs a validation check to ensure the slot is not already booked, then returns a new shallow-copied `Slot` object with the `bookedReferralId` property set.

2. Event-Driven Tracking

In `src/scheduling/eventListener.ts`, the application tracks recently booked slots asynchronously by listening to the `clinicEvents` channel:

```typescript

const recentlyBooked = new Set<string>();

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

When an `"appointment:booked"` event is fired, the event listener adds the `appointment.slotId` to an in-memory `Set` named `recentlyBooked`. The status of this can be queried using the `wasRecentlyBooked(slotId)` helper exported from the same file.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

