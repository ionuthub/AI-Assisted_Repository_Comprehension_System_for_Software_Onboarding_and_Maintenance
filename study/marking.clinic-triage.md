# Marking sheet — clinic-triage

<!-- accuracy-gate-binding: 09beb81ba624fcd52d0ca1b2bffc207fcfad728e9e417e7e4cc07bb6ebe13dc6 -->

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

    python3 analysis/marking_sheet.py collect study/accuracy-gate.clinic-triage.json study/marking.clinic-triage.md

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
Based on the provided repository context, there is no main application entry point (such as an `index.ts`, `server.ts`, or `main.ts`) included in the source files.

However, within the provided context, execution starts via the test suite:

1. **Test Execution**: The execution of the test suite begins in **`src/tests/eligibility.test.ts`** using the Vitest framework (`describe`, `it`, `beforeEach`).

2. **State Initialization**: During the `beforeEach` hook in `src/tests/eligibility.test.ts`, execution calls `useClinicStore.setState` to seed the initial state using `seedReferrals` imported from **`src/data/seed.ts`**.

3. **Business Logic Execution**: The tests trigger actions like `acceptReferral` on the store, which internally executes eligibility validation rules (such as postcode checks and practice registration checks).
```

**Verdict:** incorrect

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
Based on the codebase, a referral is assigned its priority band through a programmatic calculation that produces a suggested band, which is then presented to users in the UI for final assignment.

1. Calculation Logic (`src/triage/banding.ts`)

The core evaluation logic is defined in the `calculateBand` function:

```typescript

export function calculateBand(referral: Referral): BandingDecision {

const context = { ...referral.signals, type: referral.type };

const matched = priorityRules.filter((rule) => rule.matches(context));

const score =

referralPolicies[referral.type].basePoints +

matched.reduce((total, rule) => total + rule.points, 0);

const band =

bandThresholds.find((threshold) => score >= threshold.minimum)?.band ??

"green";

return {

band,

score,

matchedRules: matched.map((rule) => rule.id),

targetHours: referralPolicies[referral.type].targetHours,

};

}

```

The algorithm executes the following steps:

1. **Context Synthesis**: Combines the referral's clinical signals (`referral.signals`) and its referral type (`referral.type`) into a single context object.

2. **Rule Evaluation**: Filters the importable `priorityRules` (from `../config/priorityRules`) to determine which rules evaluate to `true` via `rule.matches(context)`.

3. **Scoring**:

- Retrieves the base points for the specific referral type from `referralPolicies[referral.type].basePoints`.

- Accumulates points from all matched rules: `matched.reduce((total, rule) => total + rule.points, 0)`.

4. **Band Resolution**: Searches through `bandThresholds` (from `../config/priorityRules`) to find the first threshold where the total score meets or exceeds the threshold's minimum (`score >= threshold.minimum`). If no threshold matches, it defaults to `"green"`.

5. **Output**: Returns a `BandingDecision` containing the selected band (`PriorityBand`), the final numeric `score`, the list of `matchedRules` IDs, and the `targetHours` determined by the referral type's policy.

---

2. UI Presentation & Manual Selection (`src/components/PriorityPanel.tsx`)

The calculated decision is integrated into the `PriorityPanel` component to assist clinical decision-making:

**Suggestions**: The calculated band is displayed as a recommendation (e.g., *"Suggested band: Priority 2. Target response within 48 hours"*), and the matched rules are rendered under a "Signals considered" list.
**Manual Assignment**: While the system suggests a band based on rules, the user can manually select and assign the final priority band (`red`, `amber`, or `green`) by clicking the corresponding button, which triggers the `onSelect(band)` callback passed down from the parent component.
```

**Verdict:** incorrect

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
The code that decides how a given referral type is processed is located in **`src/triage/routes/registry.ts`**.

Mechanism of Action

1. **Registry Mapping**:

The module maintains an internal registry map linking a `ReferralType` to its corresponding processor (`RouteHandler`):

```typescript

const handlers = new Map<ReferralType, RouteHandler>();

```

2. **Registration**:

Handlers are registered dynamically using the `registerRoute` function:

```typescript

export function registerRoute(type: ReferralType, handler: RouteHandler): void {

handlers.set(type, handler);

}

```

3. **Resolution and Execution**:

When a referral needs to be processed (routed), the `routeReferral` function resolves the appropriate handler based on the referral's `type` and executes it to produce a `RouteOutcome`:

```typescript

export function routeReferral(referral: Referral): RouteOutcome {

const handler = handlers.get(referral.type);

if (!handler)

throw new Error(`No routing handler registered for ${referral.type}`);

return handler(referral);

}

```

Key Types Involved
**`ReferralType`**: The domain-level identifier of the referral's type (imported from `../../types/domain`).
**`RouteHandler`**: A function signature `(referral: Referral) => RouteOutcome` that encapsulates the processing logic for a specific type.
**`RouteOutcome`**: The structured result of processing, containing the `summary`, `recommendedService`, `requiresPhoneCall`, and `instructions` (`src/triage/routes/registry.ts`, lines 3–8).
```

**Verdict:** incorrect

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
Based on the provided codebase, eligibility is evaluated by calling the `checkEligibility` function (defined in `src/triage/eligibility.ts`). There are exactly **two** places in the codebase where this check is executed:

1. Nightly Batch Reverification
**File:** `src/jobs/nightlyReverification.ts` (lines 17–20)
**Function:** `runNightlyReverification(referrals: Referral[])`
**Control Flow & Context:**

This job filters the provided list of referrals to isolate those with a status of `"accepted"` or `"booked"`. It loops through these candidates and calls `checkEligibility(referral)`.

If a referral is found to be ineligible:

* A failure record containing the `referralId` and validation `reasons` is added to the final `VerificationReport`.

* The system emits an `eligibility:failed` event via the `clinicEvents` channel with the phase context set to `"nightly"`.

2. Appointment Booking Validation
**File:** `src/triage/validation.ts` (lines 11–13)
**Function:** `checkAppointment(referral: Referral, clinician: Clinician, slotId: string, actor: string)`
**Control Flow & Context:**

When attempting to book an appointment slot for a patient, the system calls `checkEligibility(referral)` to ensure the patient is still eligible before assigning the slot.

If the eligibility check fails:

* The system immediately emits an `eligibility:failed` event via the `clinicEvents` channel with the phase context set to `"booking"`.

* It halts execution by throwing an `Error` containing the joined eligibility failure reasons, preventing the appointment from being scheduled.
```

**Verdict:** incorrect

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
An outgoing API request undergoes normalization and passes through a structured middleware pipeline (composed of multiple "stages") before executing its terminal transport function.

Here is the precise control flow and execution order of a request:

1. Request Initialization and Header Normalization

When an API call is initiated (for example, via `submitReferral` in `src/api/referrals-api.ts`), it calls the `apiRequest` function in `src/api/api-client.ts`.

At this entry point, the request's headers are normalized to guarantee an object exists:

```typescript

{ ...request, headers: request.headers ?? {} }

```

*(Source: `src/api/api-client.ts`)*

2. The Middleware Pipeline Execution

The normalized request is passed to the `composed` pipeline runner. In `src/api/api-client.ts`, the pipeline is constructed using `Array.prototype.reduceRight`:

```typescript

const stages: ApiStage[] = [traceStage, authStage, redactStage];

const composed = stages.reduceRight<ApiNext>(

(next, stage) => (request) => stage(request, next),

transport,

);

```

*(Source: `src/api/api-client.ts`)*

Because of `reduceRight`, the stages wrap one another starting from the end of the array, meaning they execute sequentially from left to right. The request passes through the following stages in order:

1. **`traceStage`**: The outermost stage. It receives the request first, performs tracing operations, and then calls `next(request)`.

2. **`authStage`**: The middle stage. It receives the request from `traceStage`, handles authentication injection, and calls `next(request)`.

3. **`redactStage`**: The innermost stage. It receives the request from `authStage`, performs any necessary data redacting/sanitization, and calls `next(request)`.

*(Source: `src/api/api-client.ts`, `src/api/pipeline/types.ts`)*

3. Terminal Transport Execution

After passing through `redactStage`, the request is forwarded to the terminal `transport` function (which acts as the final `ApiNext` callback):

```typescript

const transport: ApiNext = (request) =>

Promise.resolve({

status: 200,

data: request.body ?? { ok: true },

requestId: request.headers["X-Trace-Id"] ?? "local",

});

```

*(Source: `src/api/api-client.ts`)*

Currently, this transport function simulates network transmission by immediately resolving a mock `ApiResponse` containing:

A `200` status.
The request body (defaulting to `{ ok: true }` if empty).
A `requestId` mapped from the `X-Trace-Id` header (defaulting to `"local"` if absent).
```

**Verdict:** incorrect

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
Yes, `checkAppointment` **does change state** (via mutation) in addition to performing validation checks, and it triggers external side effects.

Specifically, it modifies its arguments and emits events in the following ways:

1. In-Memory State Mutation

`checkAppointment` directly mutates the `clinician` object passed to it. Specifically, it updates the matched slot's booking status:

```typescript

slot.bookedReferralId = referral.id;

```

**File Source:** `src/triage/validation.ts` (Line 35)

This mutation is verified in the test suite (`src/tests/scheduling.test.ts`), which asserts that the slot's state has changed after the function execution:

```typescript

const appointment = checkAppointment(referral, clinician, slot.id, "Tester");

expect(slot.bookedReferralId).toBe(referral.id);

```

**File Source:** `src/tests/scheduling.test.ts` (Lines 20–24)

In the store implementation (`src/store/useClinicStore.ts`), the mutated `clinicians` array is subsequently written back to the Zustand state:

```typescript

clinicians: [...current.clinicians], // Relies on the in-place mutation of the clinician slot

```

**File Source:** `src/store/useClinicStore.ts` (Line 117)

---

2. Side Effects (Event Emission)

The function emits events to the `clinicEvents` channel depending on the outcome of the validation:

**On failure (eligibility check fails):** Emits `"eligibility:failed"` with the referral ID and failure reasons (lines 14–18).
**On success:** Emits `"appointment:booked"` containing the generated appointment object and patient name (lines 36–39).
**File Source:** `src/triage/validation.ts`
```

**Verdict:** correct

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
Unverified mentions: src/config/priorityRules.ts Not retrieved

```
Based on the provided repository context, the exact slot-finding implementation that runs for a follow-up referral cannot be definitively verified because the configuration file **`src/config/priorityRules.ts`** is not included in the context.

However, we can trace the resolution logic and identify the likely candidate based on the available code:

1. Resolution Mechanism

In `src/scheduling/service.ts`, the slot-finding implementation is determined dynamically at runtime based on the referral's type:

```typescript

// src/scheduling/service.ts (lines 13-14)

const finder = finders[referralPolicies[referral.type].finder];

return finder({ ... });

```

The `finders` registry (defined in `src/scheduling/service.ts`, lines 6-9) maps configuration keys to specific finder functions:

`standard` $\rightarrow$ `findSlots` (imported from `src/scheduling/slotFinder`)
`continuity` $\rightarrow$ `findContinuitySlots` (imported from `src/scheduling/oldSlotFinder`)
2. Clinical Alignment (Inference)

While the mapping of `referral.type` to its policy is defined in the missing `src/config/priorityRules.ts` file, the triage route configuration strongly suggests that the **`continuity`** finder (`findContinuitySlots`) is the intended implementation:

**`src/triage/routes/followUp.ts` (lines 7-9):** The triage registration for `"followUp"` specifies instructions to `"Prefer the previous care team"`.
**`src/scheduling/service.ts` (lines 15-19):** When invoking the finder, the system passes `preferredClinicianId: referral.assignedClinicianId` into the `SlotSearch` payload, which aligns with routing the patient back to their previous clinician (continuity of care).
```

**Verdict:** incorrect

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
Based on the provided codebase, when the `"appointment:booked"` event is emitted through the global `clinicEvents` channel (defined in `src/events/channel.ts`), two distinct modules react to it:

1. Scheduling Tracker (`src/scheduling/eventListener.ts`)
**Reaction**: Adds the booked appointment's `slotId` to an in-memory `Set` called `recentlyBooked`.
**Code Reference**:

```typescript

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

**Impact**: This state is used to track recency, queryable via the exported `wasRecentlyBooked(slotId: string)` function.
2. Audit Logger (`src/audit/logger.ts`)
**Reaction**: Prepends a structured `AuditEntry` object to an in-memory array (`eventEntries`) using `unshift`.
**Code Reference**:

```typescript

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

**Impact**: Maintains a chronological (newest first) audit log of booking actions, which is exposed via the `getEventAudit()` function.
```

**Verdict:** correct

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
Unverified mentions: src/types/domain.ts Not retrieved; src/triage/banding.ts Not retrieved; src/triage/routes/registry.ts Not retrieved; src/data/seed.ts Not retrieved

```
Based on the provided codebase context, here is where a new referral type would be added and the downstream changes required to support it:

1. Define the Type in the Domain Model

The primary definition of the referral type resides in the domain types file, which is imported by the codebase but not fully exposed in the context.

**File to change:** `src/types/domain.ts` (referenced via import in `src/hooks/useReferralFilters.ts` [lines 1-6]).
**Action:** Add the new literal type to the `ReferralType` union type definition.

---

2. Update Triage and Banding Logic

When a new referral type is introduced, you must define how the triage engine assesses its priority and routes it.

**File to change:** `src/triage/banding.ts` (referenced in `src/tests/banding.test.ts` [lines 3-19]).

* **Action:** Update `calculateBand()` to handle the new referral type. You will need to map it to a priority band (e.g., `"red"`, `"amber"`, `"green"`) and set its policy-derived `targetHours` (similar to how `"safeguarding"` and `"routine"` are handled in `src/tests/banding.test.ts` [lines 6-14]).

**File to change:** `src/triage/routes/registry.ts` and dynamic route files loaded by `loadRoutes()` (referenced in `src/tests/registry.test.ts` [lines 3-17]).

* **Action:** Determine if the new type requires a dedicated routing handler or if it falls back to default routine handling. If it requires custom behavior (like `"urgent"` requiring a phone call in `src/tests/registry.test.ts` [lines 10-13]), a new route handler must be registered.

---

3. Update Seed Data and Tests

To ensure the system handles the new type correctly, you must update the mock data and test coverage.

**File to change:** `src/data/seed.ts` (referenced in `src/tests/registry.test.ts` [line 2] and `src/tests/banding.test.ts` [line 2]).

* **Action:** Add new mock referral entries containing the new `type` to `seedReferrals`.

**Files to change:**

* `src/tests/banding.test.ts`

* `src/tests/registry.test.ts`

* **Action:** Add unit tests to verify that the triage engine correctly calculates bands, targets, and routes for the new referral type.

---

4. UI and Filtering (Automatic but requires UI component updates)
**File to review:** `src/hooks/useReferralFilters.ts` [lines 1-65].

* **Status:** The `useReferralFilters` hook automatically supports the new type because `TypeFilter` is dynamically typed as `ReferralType | "all"` [line 8].

* **Action:** While the hook itself does not need modifications, any UI components rendering filter dropdowns or selection menus (which consume `TypeFilter` or map over `ReferralType`) will need to be updated to present the new option to the user.
```

**Verdict:** incorrect

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

```
Based on the provided codebase, changing the priority rules (defined in `src/config/priorityRules` and imported into `src/triage/banding.ts`) would directly affect the triage calculation logic, the user interface, and the test suite.

The specific downstream impacts are detailed below:

1. Triage Banding Logic (`src/triage/banding.ts`)

The `calculateBand` function relies directly on `priorityRules` to evaluate and score referrals:

**Score Calculation:** The total `score` is calculated by adding a policy base score to the sum of the `points` of all matched rules:

```typescript

const matched = priorityRules.filter((rule) => rule.matches(context));

const score = referralPolicies[referral.type].basePoints + matched.reduce((total, rule) => total + rule.points, 0);

```

Modifying rule matching criteria (`rule.matches`) or rule weights (`rule.points`) will directly alter the resulting `score`.

**Band Determination:** The resulting `band` is determined by comparing the `score` against `bandThresholds`. A change in rules that alters the score could shift a referral into a different `PriorityBand` (e.g., from `amber` to `red`).
**Matched Rules List:** The decision returns `matchedRules` as an array of rule IDs (`matched.map((rule) => rule.id)`). Any changes to rule IDs or which rules match will alter this array.
2. User Interface (`src/components/PriorityPanel.tsx`)

The `PriorityPanel` component consumes the output of `calculateBand(referral)` to render the clinical banding card. Changes to the rules will affect:

**Score Display:** The rendered score badge (`Score {decision.score}`) will display new values.
**Suggested Band & Target Hours:** The text indicating the suggested band (`bandLabel(decision.band)`) and the "Suggested" label next to the priority button options (`decision.band === band`) will update based on the new band evaluation.
**Signals Considered List:** The panel renders a list of matched rules at the bottom:

```typescript

{decision.matchedRules.map((rule) => (

<li key={rule}>{rule.replaceAll("-", " ")}</li>

))}

```

If rule IDs are added, removed, or renamed, the list items and their formatted text (where hyphens are replaced with spaces) will change accordingly.

3. Test Suite (`src/tests/banding.test.ts`)

The unit tests validate the banding logic against seed data (`seedReferrals`). If priority rules are altered:

**Safeguarding Test:** The test asserting that safeguarding work receives the highest band (`expect(calculateBand(referral).band).toBe("red")`) may fail if the scoring rules for safeguarding are lowered below the red threshold.
**Explainability Test:** The test asserting that deterioration matches rules (`expect(calculateBand(referral).matchedRules.length).toBeGreaterThan(0)`) will fail if the rule matching deterioration is modified or removed.
```

**Verdict:** incorrect

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

```
Based on the provided codebase context, safeguarding referrals are handled with specific clinical and priority logic in two main areas:

1. Triage Routing and Operational Instructions

In `src/triage/routes/safeguarding.ts`, safeguarding referrals are registered with custom operational constraints to manage risk:

**Phone Call Requirement**: `requiresPhoneCall` is explicitly set to `true`.
**Explicit Handling Instructions**: They include strict instructions to protect patient safety:

* `"Do not leave a voicemail"`

* `"Check safe contact method"`

* `"Notify safeguarding lead"`

**Service Recommendation**: They are routed to `"Community nursing"` with a restricted summary format (`"Restricted safeguarding review for [Patient Name]"`).
2. Priority Banding

In `src/tests/banding.test.ts`, safeguarding referrals are prioritized at the highest level:

**Highest Priority Band**: The triage banding logic (tested via `calculateBand`) assigns safeguarding referrals (`type === "safeguarding"`) to the `"red"` band, which is the highest urgency level.
```

**Verdict:** incorrect

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
Based on the provided codebase context, slot booking is handled in two distinct places depending on whether you are referring to updating the domain model or tracking booking events:

1. In-Memory Domain Model Update

The actual mutation of a slot's booking state occurs in **`src/scheduling/service.ts`** within the `reserveSlot` function:

```typescript

export function reserveSlot(slot: Slot, referralId: string): Slot {

if (slot.bookedReferralId)

throw new Error("This slot has already been booked");

return { ...slot, bookedReferralId: referralId };

}

```

**Mechanism**: This function checks if the slot already has a `bookedReferralId`. If not, it returns a new slot object with the `bookedReferralId` property set to the provided `referralId` (lines 21–25).
2. Event-Driven Booking Tracking

An asynchronous cache of booked slots is maintained in **`src/scheduling/eventListener.ts`**:

```typescript

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

**Mechanism**: When an `"appointment:booked"` event is published via the `clinicEvents` channel, this listener intercepts the event and adds the `appointment.slotId` to an in-memory `recentlyBooked` `Set` (lines 3–5). This state is queried via `wasRecentlyBooked(slotId)` (lines 6–8).
```

**Verdict:** incorrect

**Why (one line, for the log):**

---

