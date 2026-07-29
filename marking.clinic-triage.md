# Marking sheet — clinic-triage

12 questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect study/accuracy-gate.clinic-triage.json marking.clinic-triage.md

---

## Q1 — orientation

> Where does execution start in this project?

### Ground truth

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. `App` itself defines the client routes. Importing the module also
installs the scheduling and audit event listeners: lines 7 and 8 are bare side-effect imports,
so neither statement binds a name and the act of importing is the whole effect.

**Files:** src/main.tsx:1-10, src/App.tsx:7-8, src/App.tsx:11-21

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/validation.ts (0.09), src/data/seed.ts (0.04), src/tests/eligibility.test.ts (0.04)

```
Based on the provided repository context, the production application entry point (such as a `main.ts`, `index.ts`, or server startup file) is **not present** in the provided files.

However, within the context of the files provided, execution starts in the following ways:

1. Test Suite Execution

For testing, execution starts in the test runner (Vitest), which loads and runs the test suite in:

**`src/tests/eligibility.test.ts`**

This file initializes execution by:

1. Importing the test runner hooks (`describe`, `it`, `beforeEach`, `expect`) from `vitest` (`src/tests/eligibility.test.ts`, line 1).

2. Seeding the initial state into the Zustand store (`useClinicStore`) using `structuredClone(seedReferrals)` in the `beforeEach` block (`src/tests/eligibility.test.ts`, lines 5–8).

3. Invoking store actions like `acceptReferral` to run eligibility checks and state transitions (`src/tests/eligibility.test.ts`, lines 11, 21, 31).

2. Data Seeding

Static data initialization occurs in:

**`src/data/seed.ts`**

This file defines and maps raw scenario arrays into structured domain objects (`Referral[]` and `Clinician[]`) such as `seedReferrals` (`src/data/seed.ts`, line 427) and `seedClinicians` (`src/data/seed.ts`, line 500). These exported datasets are imported by the store and test files to bootstrap application state.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q2 — config-driven behaviour

> How is a referral given its priority band?

### Ground truth

`calculateBand` sums the referral type's configured base points with the points of every rule
whose `matches` predicate is satisfied, then takes the band of the first threshold the total
meets — red from 9, amber from 4, otherwise green. On acceptance the store uses that calculated
band unless the operator supplies an override.

**Files:** src/config/priorityRules.ts:26-31, src/config/priorityRules.ts:33-70, src/config/priorityRules.ts:72-76, src/triage/banding.ts:15-30, src/store/useClinicStore.ts:61, src/store/useClinicStore.ts:94-107, src/pages/ReferralDetailPage.tsx:26-28, src/pages/ReferralDetailPage.tsx:49, src/pages/ReferralDetailPage.tsx:96-104

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/components/PriorityPanel.tsx (0.59), src/triage/banding.ts (0.49), src/hooks/useReferralFilters.ts (0.39)

```
A referral's priority band is determined using a rule-based scoring system implemented in `src/triage/banding.ts`, which is then surfaced and optionally overridden in the UI via `src/components/PriorityPanel.tsx`.

1. Algorithmic Band Calculation

The core calculation is executed by the `calculateBand(referral: Referral)` function in `src/triage/banding.ts`. The process follows these steps:

1. **Context Assembly**:

The function merges the referral's clinical signals and its type into a single context object:

```typescript

const context = { ...referral.signals, type: referral.type };

```

2. **Rule Matching**:

It evaluates this context against a set of predefined rules imported from `../config/priorityRules`:

```typescript

const matched = priorityRules.filter((rule) => rule.matches(context));

```

3. **Score Accumulation**:

The baseline score is determined by the referral type's policy (`referralPolicies[referral.type].basePoints`). Points from all matched rules are then aggregated and added to this baseline:

```typescript

const score =

referralPolicies[referral.type].basePoints +

matched.reduce((total, rule) => total + rule.points, 0);

```

4. **Threshold Evaluation**:

The final score is compared against thresholds defined in `bandThresholds` (ordered descending). The first threshold where the score meets or exceeds the `minimum` value determines the band. If no threshold matches, it defaults to `"green"`:

```typescript

const band =

bandThresholds.find((threshold) => score >= threshold.minimum)?.band ??

"green";

```

5. **Decision Payload**:

The function returns a `BandingDecision` object containing:

* `band`: The resolved `PriorityBand` (`"red" | "amber" | "green"`).

* `score`: The total calculated points.

* `matchedRules`: An array of IDs of the matched rules.

* `targetHours`: The target response window defined by the referral's policy (`referralPolicies[referral.type].targetHours`).

---

2. UI Presentation and Assignment

In `src/components/PriorityPanel.tsx`, the `calculateBand` function is called to present the system's suggestion to the user:

**Displaying Suggestions**: The panel displays the calculated score, the suggested priority band (formatted via `bandLabel(decision.band)`), and the target response hours (`decision.targetHours`).
**Matched Signals**: The UI lists the human-readable names of the matched rules by mapping over `decision.matchedRules` (replacing hyphens with spaces).
**Manual Assignment**: While the system suggests a band, the actual assignment is interactive. The component renders buttons for each priority band ("Priority 1" / Red, "Priority 2" / Amber, "Priority 3" / Green). Clicking an option triggers the `onSelect(band)` callback prop to persist the chosen priority.

---

3. Filter Querying

Once assigned, the finalized priority is stored on the referral object as `referral.priority`. In `src/hooks/useReferralFilters.ts`, referrals can be filtered by this band:

Filtering matches specific bands (`"red"`, `"amber"`, `"green"`).
Referrals without an assigned priority are treated as `"unbanded"`:

```typescript

const matchesBand =

band === "all" ||

(band === "unbanded"

? !referral.priority

: referral.priority === band);

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q3 — handler registry

> Which code decides how a given referral type is processed?

### Ground truth

The route registry decides. `loadRoutes` dynamically imports each route module, those modules
register handlers keyed by referral type, and `routeReferral` retrieves and invokes the handler
for `referral.type`. The detail page loads the modules before routing the current referral.

**Files:** src/triage/routes/loadRoutes.ts:1-11, src/triage/routes/registry.ts:8-18, src/triage/routes/routine.ts:1-11, src/triage/routes/urgent.ts:1-11, src/triage/routes/followUp.ts:1-11, src/triage/routes/safeguarding.ts:1-11, src/pages/ReferralDetailPage.tsx:7-8, src/pages/ReferralDetailPage.tsx:33

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/hooks/useReferralFilters.ts (0.36), src/triage/routes/registry.ts (0.35), src/api/referrals-api.ts (0.32)

```
The routing and processing decisions for a given referral type are managed by the registry system defined in **`src/triage/routes/registry.ts`**.

Key Components

1. **Registry Map (`handlers`)**:

A private `Map` maps each `ReferralType` to a specific processing function (`RouteHandler`):

```typescript

const handlers = new Map<ReferralType, RouteHandler>();

```

2. **Registration (`registerRoute`)**:

Individual routing strategies (handlers) register themselves for specific referral types using this function:

```typescript

export function registerRoute(type: ReferralType, handler: RouteHandler): void {

handlers.set(type, handler);

}

```

3. **Resolution & Execution (`routeReferral`)**:

The `routeReferral` function is responsible for deciding which handler to execute. It retrieves the registered handler matching the referral's type (`referral.type`) and executes it to produce a `RouteOutcome`:

```typescript

export function routeReferral(referral: Referral): RouteOutcome {

const handler = handlers.get(referral.type);

if (!handler)

throw new Error(`No routing handler registered for ${referral.type}`);

return handler(referral);

}

```

Processing Outcome

The selected handler returns a `RouteOutcome` interface (defined in `src/triage/routes/registry.ts`), which dictates:

`recommendedService`: The target service for the referral.
`requiresPhoneCall`: A boolean indicating if manual outreach is required.
`instructions`: A list of step-by-step instructions for triage.
`summary`: A text summary of the routing result.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q4 — cross-cutting concern

> Everywhere eligibility is checked — list every place it happens.

### Ground truth

The common check is `checkEligibility`. It is called from exactly three places in `src/`: when accepting a
referral, when booking an appointment, and during reverification of accepted or booked
referrals. Each caller emits an `eligibility:failed` event on failure with a phase identifying
acceptance, booking, or nightly processing.

**Files:** src/triage/eligibility.ts:4-25, src/store/useClinicStore.ts:49-79, src/triage/validation.ts:12, src/jobs/nightlyReverification.ts:9-34, src/pages/AuditLogPage.tsx:27-34

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/jobs/nightlyReverification.ts (0.13), src/triage/validation.ts (0.11), src/triage/eligibility.ts (0.11)

```
Based on the provided repository context, eligibility is checked using the `checkEligibility` function, which is defined and invoked in the following locations:

1. Definition
**File:** `src/triage/eligibility.ts` (Lines 4–26)
**Function:** `checkEligibility(referral: Referral)`
**Description:** This is the core validation engine that checks a referral's eligibility based on patient age, postcode format (must match `/^LS\d{1,2}/`), registered practice presence, referral status, and safeguarding criteria.

---

2. Nightly Batch Reverification
**File:** `src/jobs/nightlyReverification.ts` (Line 19)
**Function:** `runNightlyReverification(referrals: Referral[])`
**Description:** Iterates through all referrals with a status of `"accepted"` or `"booked"` and runs `checkEligibility(referral)`. If eligibility fails during this batch run, it logs the failure and emits an `"eligibility:failed"` event with the phase set to `"nightly"`.

---

3. Real-time Appointment Booking Validation
**File:** `src/triage/validation.ts` (Line 13)
**Function:** `checkAppointment(referral: Referral, clinician: Clinician, slotId: string, actor: string)`
**Description:** Before booking a specific appointment slot, this function calls `checkEligibility(referral)`. If the eligibility check fails, it emits an `"eligibility:failed"` event with the phase set to `"booking"` and throws an error containing the concatenated failure reasons.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q5 — pipeline chain

> What happens to an outgoing API request before it is sent?

### Ground truth

Requests pass through `traceStage`, `authStage`, and `redactStage` in that order. The trace
stage adds an `X-Trace-Id`; auth adds a bearer token and `X-Staff-Role: triage`; and redaction
replaces the notes, phone and postcode before the transport receives the request.

**Files:** src/api/api-client.ts:11-28, src/api/pipeline/trace-stage.ts:2-8, src/api/pipeline/auth-stage.ts:2-12, src/api/pipeline/redact-stage.ts:3-16, src/api/pipeline/redact-stage.ts:17-18, src/api/referrals-api.ts:3-9, src/api/referrals-api.ts:10-16

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/pipeline/types.ts (0.67), src/api/api-client.ts (0.56), src/api/referrals-api.ts (0.52)

```
Based on the provided codebase, an outgoing API request goes through a pipeline composed of multiple middleware-like stages before hitting the terminal transport layer.

Here is the exact control flow and execution order of an outgoing request:

1. Request Initialization and Normalization

When an API call is made (for example, via `submitReferral` or `recordBooking` in `src/api/referrals-api.ts`), it calls the `apiRequest` function in `src/api/api-client.ts`.

In `apiRequest`, the request's headers are normalized to guarantee an object exists:

```typescript

{ ...request, headers: request.headers ?? {} }

```

*(Source: `src/api/api-client.ts`)*

2. The Pipeline Execution Order

The normalized request is passed to `composed`, which is constructed by composing an array of `ApiStage` functions using `Array.prototype.reduceRight`:

```typescript

const stages: ApiStage[] = [traceStage, authStage, redactStage];

const composed = stages.reduceRight<ApiNext>(

(next, stage) => (request) => stage(request, next),

transport,

);

```

*(Source: `src/api/api-client.ts`)*

Because `reduceRight` processes the array from right to left, the nested execution chain is constructed such that the request flows through the stages in **left-to-right** order:

1. **`traceStage`**: The request first enters `traceStage` (imported from `./pipeline/trace-stage`).

2. **`authStage`**: If allowed by `traceStage` calling `next(request)`, the request proceeds to `auth` processing (imported from `./pipeline/auth-stage`).

3. **`redactStage`**: If allowed by `authStage` calling `next(request)`, the request proceeds to redaction processing (imported from `./pipeline/redact-stage`).

4. **`transport`**: Finally, the request reaches the terminal handler `transport`.

*(Note: The internal code for `traceStage`, `authStage`, and `redactStage` is not provided in the context, but their execution order is determined by their position in the `stages` array in `src/api/api-client.ts`)*.

3. Terminal Transport Layer

Once the request has passed through all three stages, it is handled by the `transport` function:

```typescript

const transport: ApiNext = (request) =>

Promise.resolve({

status: 200,

data: request.body ?? { ok: true },

requestId: request.headers["X-Trace-Id"] ?? "local",

});

```

*(Source: `src/api/api-client.ts`)*

This function acts as the mock network boundary, resolving the pipeline with an `ApiResponse` containing the request's body (or `{ ok: true }` if empty) and extracting or defaulting a `requestId`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q6 — misleading name

> Does checkAppointment change any state, or does it only check?

### Ground truth

It changes state. After checking eligibility, slot existence, availability, and service
coverage, it creates an appointment and mutates the chosen slot in place by assigning
`slot.bookedReferralId`. It also emits `appointment:booked` before returning the appointment.

**Files:** src/triage/validation.ts:5-42

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/validation.ts (0.21), src/store/useClinicStore.ts (0.13), src/tests/scheduling.test.ts (0.1)

```
Yes, despite its name, **`checkAppointment` does mutate state** and trigger side effects; it is not a pure read-only check.

Specifically, it performs the following state modifications and side effects:

1. In-Place Mutation of the Clinician's Slot

It directly mutates the passed `clinician` object by setting the `bookedReferralId` property of the matched slot:

```typescript

slot.bookedReferralId = referral.id;

```

**File Reference:** `src/triage/validation.ts` (Line 38)
**Impact on Store:** This in-place mutation is relied upon in the Zustand store (`src/store/useClinicStore.ts`, lines 118–124). When `bookAppointment` calls `checkAppointment`, the store triggers a state update by spreading the mutated clinicians array: `clinicians: [...current.clinicians]`.
**Impact on Tests:** The unit tests in `src/tests/scheduling.test.ts` explicitly assert this mutation occurs:

```typescript

const appointment = checkAppointment(referral, clinician, slot.id, "Tester");

expect(slot.bookedReferralId).toBe(referral.id); // Asserting the mutation

```

2. Event Emission (Side Effects)

`checkAppointment` triggers side-effects by emitting events on the `clinicEvents` channel:

**Success Path:** Emits `"appointment:booked"` containing the newly created appointment object and patient name (`src/triage/validation.ts`, lines 39–42).
**Failure Path:** If the patient is ineligible, it emits `"eligibility:failed"` before throwing an error (`src/triage/validation.ts`, lines 14–18).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q7 — legacy path

> Which slot-finding implementation runs for a follow-up referral, and why that one?

### Ground truth

A follow-up uses the legacy `findContinuitySlots` implementation because
`referralPolicies.followUp.finder` is `continuity`, and the scheduling service maps that key to
`findContinuitySlots`. It filters clinicians to those active and offering the referral's
service, sorts them so any preferred clinician comes first, flattens their unbooked matching
slots, and sorts the result by start time.

**Files:** src/config/priorityRules.ts:18-31, src/scheduling/service.ts:1-20, src/scheduling/oldSlotFinder.ts:3-24, src/scheduling/slotFinder.ts:11-14, src/store/useClinicStore.ts:129

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/routes/followUp.ts (0.47), src/scheduling/service.ts (0.35), src/scheduling/types.ts (0.32)

```
Based on the provided repository context, we can trace the resolution logic, though the explicit configuration mapping is located in a file outside the provided context.

1. Resolution Logic

In `src/scheduling/service.ts`, the slot-finding implementation is determined dynamically at runtime based on the referral's type:

```typescript

const finder = finders[referralPolicies[referral.type].finder];

```

The `finders` registry in `src/scheduling/service.ts` maps keys to their respective implementation functions:

`standard` maps to `findSlots` (imported from `src/scheduling/slotFinder`).
`continuity` maps to `findContinuitySlots` (imported from `src/scheduling/oldSlotFinder`).
2. Architectural Intent for "Follow-Up"

In `src/triage/routes/followUp.ts`, the `"followUp"` route is registered with instructions that prioritize care consistency:

```typescript

instructions: [

"Review previous clinical letter",

"Prefer the previous care team",

"Check outstanding investigations",

],

```

Because the triage route explicitly mandates to **`"Prefer the previous care team"`**, the architectural design strongly implies that a follow-up referral maps to the **`continuity`** finder (`findContinuitySlots`), which accepts a `preferredClinicianId` (defined in the `SlotSearch` interface in `src/scheduling/types.ts`).

3. Missing Context

The definitive mapping of `referral.type` to its finder policy is defined in `src/config/priorityRules` (imported at the top of `src/scheduling/service.ts`). Since `src/config/priorityRules` is not included in the provided context, the exact configuration binding cannot be verified with absolute certainty, but the clinical requirements point directly to `continuity` (`findContinuitySlots`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q8 — event emitter

> What reacts when a scheduling event is emitted?

### Ground truth

When `appointment:booked` is emitted, the scheduling listener records the slot ID in its
`recentlyBooked` set and the audit logger appends a derived entry to its module-local list.
Those are the only two subscriptions in the repository: nothing listens for
`referral:accepted` or `eligibility:failed`.

**Files:** src/events/channel.ts:5-22, src/triage/validation.ts:37-40, src/scheduling/eventListener.ts:1-8, src/audit/logger.ts:1-17, src/pages/AuditLogPage.tsx:15, src/App.tsx:7-8

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/scheduling/eventListener.ts (0.19), src/audit/logger.ts (0.18), src/events/channel.ts (0.14)

```
Based on the provided codebase, when a scheduling event (specifically the `"appointment:booked"` event) is emitted via the global `clinicEvents` channel (`src/events/channel.ts`), two distinct modules react to it:

1. In-Memory Booking Cache (`src/scheduling/eventListener.ts`)

The scheduling event listener registers a callback on `"appointment:booked"` to track recently allocated slots.

**Action**: It extracts the `slotId` from the event's `appointment` payload and adds it to a local `recentlyBooked` `Set<string>`.
**Impact**: This enables the module's exported helper, `wasRecentlyBooked(slotId: string)`, to query whether a specific slot was booked during the application's current runtime session.

```typescript

// src/scheduling/eventListener.ts

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

2. Audit Logger (`src/audit/logger.ts`)

The audit system listens to `"appointment:booked"` to generate a historical log of booking actions.

**Action**: It prepends (`unshift`) a structured `AuditEntry` object to an in-memory `eventEntries` array.
**Payload Mapping**:

* `id`: Derived from the appointment ID (`event-${appointment.id}`).

* `occurredAt`: Captured at the time of processing using `new Date().toISOString()`.

* `actor`: Mapped to `appointment.bookedBy`.

* `action`: Fixed string `"Appointment booked"`.

* `referralId`: Mapped to `appointment.referralId`.

* `detail`: Formatted string matching the patient's name and the clinician's ID.

* `severity`: Fixed level `"info"`.

**Impact**: This populates the internal audit trail returned by `getEventAudit()`.

```typescript

// src/audit/logger.ts

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
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q9 — applied

> Where would a new referral type be added, and what else would need changing?

### Ground truth

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

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/registry.test.ts (0.29), src/tests/banding.test.ts (0.26), src/hooks/useReferralFilters.ts (0.19)

```
Based on the provided codebase context, adding a new referral type requires modifications across the domain types, data seeding, routing registry, banding rules, and potentially the UI filters.

1. Define the New Type

The domain models and types are imported from `../types/domain` in `src/hooks/useReferralFilters.ts` (line 5).

**File to change:** `src/types/domain.ts` (inferred from import).
**Action:** Add the new referral type string literal to the `ReferralType` union type definition.

---

2. Update Seed / Test Data

Test suites and routing logic rely on seed data.

**File to change:** `src/data/seed.ts` (imported in `src/tests/registry.test.ts` line 2 and `src/tests/banding.test.ts` line 2).
**Action:** Add a new mock referral object containing the new `type` to `seedReferrals`. This ensures that integration tests and local development environments have coverage for the new type.

---

3. Update Routing and Triage Registry

The routing system dynamically loads handlers and routes referrals based on their properties.

**Files to change:** `src/triage/routes/registry.ts` and any dynamic route files loaded by `loadRoutes` (referenced in `src/tests/registry.test.ts` lines 3–4).
**Action:**

* If the new referral type requires specialized routing (similar to how `"urgent"` referrals require a phone call, as seen in `src/tests/registry.test.ts` lines 10–13), you must implement or update a route handler.

* Ensure that `loadRoutes()` correctly registers the new handler (which should increase the count or modify the routing logic verified in `src/tests/registry.test.ts` line 9).

---

4. Update Priority Banding Rules

Referrals are categorized into priority bands (e.g., `"red"` for safeguarding, or target SLA hours derived from policy for routine work).

**File to change:** `src/triage/banding.ts` (imported in `src/tests/banding.test.ts` line 3).
**Action:** Update `calculateBand()` to handle the new referral type. You will need to define:

* The priority band (e.g., `"red"`, `"amber"`, `"green"`) mapped to this type.

* The target SLA hours (`targetHours`) according to policy.

* Any specific rules to populate `matchedRules` for explainability (tested in `src/tests/banding.test.ts` lines 14–17).

---

5. Filter Hook and UI propagation
**File to check:** `src/hooks/useReferralFilters.ts` (lines 7, 13, 29).
**Behavior:** The `TypeFilter` type is defined as `ReferralType | "all"`. Because it uses the `ReferralType` union, TypeScript will automatically update this type. The filtering logic in `useReferralFilters` (line 29):

```typescript

const matchesType = type === "all" || referral.type === type;

```

will automatically evaluate the new type correctly. However, any UI component rendering the filter selection controls (e.g., a dropdown) must be updated to include the new option if it is not dynamically generated from the `ReferralType` keys.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q10 — applied

> If the priority rules changed, what else would be affected?

### Ground truth

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

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/banding.ts (0.21), src/tests/banding.test.ts (0.17), src/components/PriorityPanel.tsx (0.15)

```
If the priority rules defined in `src/config/priorityRules` are changed, the impact propagates through the triage calculation engine, the user interface, and the test suite.

The specific downstream effects are detailed below:

1. Triage Calculation Engine (`src/triage/banding.ts`)

The `calculateBand` function directly imports `priorityRules` and evaluates them against the referral's signals and type:

**Score Shifts**: Each matched rule contributes its `points` to the overall score:

```typescript

const score = referralPolicies[referral.type].basePoints + matched.reduce((total, rule) => total + rule.points, 0);

```

If you modify a rule's `points` or its `matches` evaluation logic, the resulting `score` will change.

**Banding Fluctuations**: A change in the calculated score determines which `band` is assigned based on `bandThresholds`:

```typescript

const band = bandThresholds.find((threshold) => score >= threshold.minimum)?.band ?? "green";

```

Modifying rules can cause referrals to shift priority bands (e.g., from `amber` to `red`).

**Rule Metadata**: The `matchedRules` array collects the `id` of each matching rule. If you change a rule's `id`, it changes the outputted metadata.
2. User Interface (`src/components/PriorityPanel.tsx`)

The `PriorityPanel` component renders the output of `calculateBand(referral)`. If rules are altered:

**Suggested Band and Score Display**: The UI displays the score (`Score {decision.score}`) and the suggested band label (`bandLabel(decision.band)`). Changes to rules will immediately alter these displayed values.
**Signal Explanation List**: The component renders the matched rules by replacing hyphens in the rule ID with spaces:

```typescript

{decision.matchedRules.map((rule) => (

<li key={rule}>{rule.replaceAll("-", " ")}</li>

))}

```

If rule IDs are renamed or removed, the text displayed in the "Signals considered" list will change. If no rules match anymore, it falls back to rendering `"No escalation signals matched."`

3. Test Failures (`src/tests/banding.test.ts`)

The test suite makes assertions based on the current rule configuration:

**Safeguarding Test**: `it("gives safeguarding work the highest band")` asserts that the band is `"red"`. If priority rules or policies are adjusted such that safeguarding no longer reaches the minimum score threshold for `"red"`, this test will fail.
**Deterioration Signal Test**: `it("records matched rules for explainability")` retrieves a seeded referral with `signals.deterioration` and asserts:

```typescript

expect(calculateBand(referral).matchedRules.length).toBeGreaterThan(0);

```

If you remove or modify the rule that matches the `deterioration` signal, this test will fail because `matchedRules` will be empty.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q11 — pipeline chain

> Are safeguarding referrals treated differently anywhere? Where?

### Ground truth

Yes, in five places. The priority configuration gives the type a base score of 8 and a four-hour
target, and a separate rule adds 10 points when the safeguarding signal is set. The route
handler requires a restricted review, Community nursing, a phone call, safe-contact precautions
and lead notification. Eligibility rejects safeguarding referrals for patients under 16. The
redaction stage replaces notes, phone and postcode for safeguarding referrals before transport.
And the referral list counts a referral towards the urgent tile if its type is safeguarding,
independently of its priority band.

**Files:** src/config/priorityRules.ts:26-31, src/config/priorityRules.ts:34-39, src/triage/routes/safeguarding.ts:1-11, src/triage/eligibility.ts:4-25, src/api/pipeline/redact-stage.ts:3-16, src/api/pipeline/redact-stage.ts:17-18, src/pages/ReferralListPage.tsx:10-15

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/triage/routes/safeguarding.ts (0.27), src/tests/eligibility.test.ts (0.19), src/tests/banding.test.ts (0.13)

```
Yes, safeguarding referrals are treated differently in two main areas of the codebase:

1. Triage Routing & Contact Instructions

In `src/triage/routes/safeguarding.ts` (lines 1-12), a dedicated route is registered for `"safeguarding"` referrals. This route configures unique handling instructions and constraints:

**Strict Communication Rules**: It sets `requiresPhoneCall: true` and enforces a specific set of safety-focused `instructions`:

* `"Do not leave a voicemail"`

* `"Check safe contact method"`

* `"Notify safeguarding lead"`

**Service Recommendation**: It automatically recommends `"Community nursing"`.
**Summary Formatting**: It generates a restricted summary format: ``Restricted safeguarding review for ${referral.patient.name}``.
2. Banding and Prioritization

In the banding logic tested by `src/tests/banding.test.ts` (lines 5-10), safeguarding referrals are prioritized with the highest clinical urgency:

**Highest Urgency Band**: Referrals with `type === "safeguarding"` are assigned the `"red"` band when evaluated by `calculateBand` (defined in `src/triage/banding`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q12 — misleading name

> Where is a slot actually booked?

### Ground truth

The slot itself is booked inside `checkAppointment`, which finds the slot object and mutates
`slot.bookedReferralId`. The store's `bookAppointment` calls that function, then adds the
returned appointment and updates the referral to `booked` with appointment and clinician IDs.
`reserveSlot` returns a booked copy but has no runtime caller, so it is not the actual
application booking path.

**Files:** src/triage/validation.ts:5-42, src/triage/validation.ts:36, src/store/useClinicStore.ts:108-142, src/scheduling/service.ts:21-25

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/scheduling/service.ts (0.5), src/scheduling/eventListener.ts (0.45), src/scheduling/slotFinder.ts (0.44)

```
Based on the provided codebase context, slot booking is handled in two distinct ways:

1. In-Memory Domain State Update

The primary domain logic for reserving a slot is defined in `src/scheduling/service.ts` via the `reserveSlot` function. It performs an immutable update to assign a referral to a slot:

```typescript

// src/scheduling/service.ts, lines 21-25

export function reserveSlot(slot: Slot, referralId: string): Slot {

if (slot.bookedReferralId)

throw new Error("This slot has already been booked");

return { ...slot, bookedReferralId: referralId };

}

```

2. Event-Driven Booking Tracking

An asynchronous booking event is tracked in `src/scheduling/eventListener.ts`. When an `"appointment:booked"` event is published on the `clinicEvents` channel, the listener registers the booking in a local, in-memory `Set` to track recently booked slots:

```typescript

// src/scheduling/eventListener.ts, lines 3-6

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

*(Note: The actual persistence layer or event publisher that triggers `"appointment:booked"` is not present in the provided source context).*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

