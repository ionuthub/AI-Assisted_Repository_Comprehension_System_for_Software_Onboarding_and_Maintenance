# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: bbf507b349f57d7972d50a6e13a103b5611dd247fbc43db8737715cb3261a0e2 -->

12 questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate, the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

**What counts as the standard: the Answer, not the Notes.** Each question's Notes are shown
collapsed beneath it, because a marker needs to know what is in the repository, but an answer is
not incorrect merely for omitting something that appears only in a Note. The Notes record traps,
reachability findings and counter-examples; requiring a tool to reproduce all of them would set a
bar nothing could meet, and it was not the standard declared in advance.

This has to be stated because it was previously left implicit, and two markers then marked the
same items against different material, one seeing the Answer alone, one seeing the whole
ground-truth document. Some of what looked like disagreement was two people answering different
questions. Where an omission from a Note seems decisive, mark against the Answer and say so on
the "Why" line; that keeps the stricter reading available without hiding it inside the figure.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect study/regression-final/accuracy-gate.clinic-triage.json study/regression-final/marking.clinic-triage.md

---

## Q1, orientation

> Where does execution start in this project?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/main.tsx (0.9), src/App.tsx (0.68), src/styles.css (0.65), package.json (0.64), src/data/seed.ts (0.61), src/audit/logger.ts (0.49), src/components/Layout.tsx (0.49), src/pages/AuditLogPage.tsx (0.49), src/pages/ClinicianOverviewPage.tsx (0.49), src/pages/ReferralDetailPage.tsx (0.49), src/pages/ReferralListPage.tsx (0.49), src/scheduling/eventListener.ts (0.49), src/store/useClinicStore.ts (0.44), src/tests/banding.test.ts (0.44), src/tests/eligibility.test.ts (0.44), src/tests/registry.test.ts (0.44), src/tests/scheduling.test.ts (0.44), src/types/domain.ts (0.44), src/components/PriorityPanel.tsx (0.33), src/components/ReferralTable.tsx (0.33), src/components/SlotPicker.tsx (0.33), src/events/channel.ts (0.33), src/hooks/useReferralFilters.ts (0.33), src/jobs/nightlyReverification.ts (0.33), src/triage/routes/loadRoutes.ts (0.33), src/triage/routes/registry.ts (0.33), src/utils/format.ts (0.33), src/api/pipeline/redact-stage.ts (0.29), src/api/referrals-api.ts (0.29), src/config/priorityRules.ts (0.29), src/events/types.ts (0.29), src/scheduling/service.ts (0.29), src/scheduling/types.ts (0.29), src/triage/banding.ts (0.29), src/triage/eligibility.ts (0.29), src/triage/validation.ts (0.29), index.html (0), README.md (0), src/api/api-client.ts (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), src/scheduling/oldSlotFinder.ts (0), src/scheduling/slotFinder.ts (0), src/triage/routes/followUp.ts (0), src/triage/routes/routine.ts (0), src/triage/routes/safeguarding.ts (0), src/triage/routes/urgent.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Execution in this project starts in **`index.html`**, which loads the JavaScript/TypeScript entry point **`src/main.tsx`**.

---

Supporting Execution Trace

1. **HTML Document Entry Point**:

- `index.html` provides the host DOM element `<div id="root"></div>` and executes the module script:

```html

<script type="module" src="/src/main.tsx"></script>

```

*(Direct evidence: `index.html`)*

2. **Application Bootstrap (`src/main.tsx`)**:

- `src/main.tsx` imports React, `ReactDOM`, global stylesheet `./styles.css`, and the root application component `./App`.

- It bootstraps the UI tree into the DOM:

```tsx

ReactDOM.createRoot(document.getElementById("root")!).render(

<React.StrictMode>

<App />

</React.StrictMode>,

);

```

*(Direct evidence: `src/main.tsx`)*

3. **Root Component & Side-Effect Initialization (`src/App.tsx`)**:

- Importing `src/App.tsx` triggers top-level module side effects that register event listeners on the global `clinicEvents` bus:

- `import "./scheduling/eventListener";` (tracks booked slots via `clinicEvents.on("appointment:booked", ...)`; *Direct evidence: `src/scheduling/eventListener.ts`*)

- `import "./audit/logger";` (logs appointment events to the in-memory audit log via `clinicEvents.on("appointment:booked", ...)`; *Direct evidence: `src/audit/logger.ts`*)

- `App` renders the `BrowserRouter` and configures the client-side routes nested within `Layout` (`src/components/Layout.tsx`):

- `/` &rarr; `ReferralListPage`

- `referrals/:id` &rarr; `ReferralDetailPage`

- `clinicians` &rarr; `ClinicianOverviewPage`

- `audit` &rarr; `AuditLogPage`

- `*` &rarr; Redirects to `/`

*(Direct evidence: `src/App.tsx`)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q2, config-driven behaviour

> How is a referral given its priority band?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/PriorityPanel.tsx (0.78), src/config/priorityRules.ts (0.76), src/hooks/useReferralFilters.ts (0.76), src/pages/ReferralDetailPage.tsx (0.76), src/store/useClinicStore.ts (0.73), src/triage/banding.ts (0.73), src/utils/format.ts (0.73), src/components/ReferralTable.tsx (0.7), src/events/types.ts (0.67), src/scheduling/service.ts (0.67), src/pages/ReferralListPage.tsx (0.64), src/api/pipeline/redact-stage.ts (0.61), src/api/referrals-api.ts (0.61), src/App.tsx (0.61), src/components/SlotPicker.tsx (0.61), src/data/seed.ts (0.61), src/jobs/nightlyReverification.ts (0.61), src/scheduling/types.ts (0.61), src/tests/banding.test.ts (0.61), src/tests/registry.test.ts (0.61), src/triage/eligibility.ts (0.61), src/triage/routes/registry.ts (0.61), src/triage/validation.ts (0.61), src/types/domain.ts (0.56), src/triage/routes/loadRoutes.ts (0.55), src/components/Layout.tsx (0.53), src/events/channel.ts (0.53), src/pages/AuditLogPage.tsx (0.53), src/pages/ClinicianOverviewPage.tsx (0.53), src/tests/eligibility.test.ts (0.53), src/scheduling/oldSlotFinder.ts (0.48), src/scheduling/slotFinder.ts (0.48), src/tests/scheduling.test.ts (0.48), src/api/api-client.ts (0.44), src/api/pipeline/types.ts (0.44), src/audit/logger.ts (0.44), src/main.tsx (0.44), src/scheduling/eventListener.ts (0.44), src/triage/routes/followUp.ts (0.44), src/triage/routes/routine.ts (0.44), src/triage/routes/safeguarding.ts (0.44), src/triage/routes/urgent.ts (0.44), src/api/pipeline/auth-stage.ts (0.29), src/api/pipeline/trace-stage.ts (0.29), src/styles.css (0.29), README.md (0.05), index.html (0), package.json (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
A referral receives its priority band (`"red"`, `"amber"`, or `"green"`) through the **acceptance triage flow** in the application store or by the automated scoring rules defined in the triage engine.

---

1. The Automated Band Calculation Logic

The automated priority calculation is implemented in `calculateBand(referral)` (`src/triage/banding.ts`). It computes a total score from two sources and maps it to a band:

1. **Policy Base Points** (`src/config/priorityRules.ts`):

- `safeguarding`: 8 points

- `urgent`: 5 points

- `followUp`: 1 point

- `routine`: 0 points

2. **Matched Clinical Signals** (`src/config/priorityRules.ts`):

Points from matching rules in `priorityRules` are added to the base points:

- `safeguarding-signal` (+10 pts): `context.safeguardingConcern`

- `rapid-deterioration` (+7 pts): `context.deterioration && context.painScore >= 7`

- `severe-pain` (+4 pts): `context.painScore >= 7`

- `post-discharge` (+3 pts): `context.recentDischarge`

- `mobility` (+2 pts): `context.mobilityRisk`

- `persistent-symptoms` (+1 pt): `context.symptomDays > 21`

3. **Threshold Mapping** (`src/config/priorityRules.ts`):

The total score is compared against `bandThresholds` (first matching minimum threshold):

- Score $\ge 9 \rightarrow$ `"red"`

- Score $\ge 4 \rightarrow$ `"amber"`

- Score $\ge 0 \rightarrow$ `"green"` (default fallback: `"green"`)

---

2. Assignment Points in the Application Flow
**Referral Detail Page (`src/pages/ReferralDetailPage.tsx`)**:

- `PriorityPanel` (`src/components/PriorityPanel.tsx`) runs `calculateBand(referral)` to compute and display the suggested band, total score, and matched escalation signals.

- The page manages local selection state `priority`, initialized to `referral?.priority ?? "green"`. The triage coordinator can keep or manually change the priority option via `PriorityPanel`.

- When the coordinator clicks **"Accept referral"** or **"Update priority"**, `onAccept` calls `acceptReferral(referral.id, priority)` from the store.

**Clinic Store (`src/store/useClinicStore.ts`)**:

- `acceptReferral(id, override)`:

1. Validates eligibility via `checkEligibility(referral)` (`src/triage/eligibility.ts`).

2. Resolves the priority band to `override ?? calculateBand(referral).band`.

3. Updates the referral state: `{ ...referral, status: "accepted", priority: band }`.

4. Writes an entry to the audit log (`"Referral accepted"`) with severity `"critical"` if `band === "red"` or `"info"` otherwise.

5. Emits the `referral:accepted` event over `clinicEvents` (`src/events/channel.ts`).

- `setPriority(id, band)`: Exposes a direct priority update action that updates the referral's `priority` and writes a `"Priority changed"` audit entry. *(Note: Direct callers for `setPriority` are not present in current UI components).*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q3, handler registry

> Which code decides how a given referral type is processed?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/ReferralTable.tsx (0.66), src/hooks/useReferralFilters.ts (0.66), src/pages/ReferralDetailPage.tsx (0.66), src/api/pipeline/redact-stage.ts (0.64), src/api/referrals-api.ts (0.64), src/components/PriorityPanel.tsx (0.64), src/components/SlotPicker.tsx (0.64), src/config/priorityRules.ts (0.64), src/data/seed.ts (0.64), src/jobs/nightlyReverification.ts (0.64), src/scheduling/service.ts (0.64), src/scheduling/types.ts (0.64), src/store/useClinicStore.ts (0.64), src/triage/banding.ts (0.64), src/triage/eligibility.ts (0.64), src/triage/routes/registry.ts (0.64), src/triage/validation.ts (0.64), src/utils/format.ts (0.64), src/pages/ReferralListPage.tsx (0.61), src/api/api-client.ts (0.59), src/api/pipeline/auth-stage.ts (0.59), src/api/pipeline/trace-stage.ts (0.59), src/App.tsx (0.59), src/audit/logger.ts (0.59), src/events/channel.ts (0.59), src/events/types.ts (0.59), src/scheduling/oldSlotFinder.ts (0.59), src/scheduling/slotFinder.ts (0.59), src/tests/registry.test.ts (0.59), src/triage/routes/loadRoutes.ts (0.47), src/types/domain.ts (0.47), src/api/pipeline/types.ts (0.46), src/components/Layout.tsx (0.46), src/pages/AuditLogPage.tsx (0.46), src/pages/ClinicianOverviewPage.tsx (0.46), src/tests/banding.test.ts (0.46), src/tests/eligibility.test.ts (0.46), src/tests/scheduling.test.ts (0.46), src/triage/routes/followUp.ts (0.46), src/triage/routes/routine.ts (0.46), src/triage/routes/safeguarding.ts (0.46), src/triage/routes/urgent.ts (0.46), src/main.tsx (0.43), src/scheduling/eventListener.ts (0.43), src/styles.css (0.28), index.html (0.06), package.json (0.03), README.md (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
The code and configuration deciding how a given referral type (`routine`, `urgent`, `followUp`, or `safeguarding`) is processed span four primary functional areas:

---

1. Clinical Routing Guidance & Pathway Handlers

Pathway instructions, recommended services, and phone call requirements are dispatched based on referral type:

**`src/triage/routes/registry.ts`**: Maintains a map of route handlers by `ReferralType` and provides `routeReferral(referral)` to execute the matching pathway handler.
**`src/triage/routes/loadRoutes.ts`**: Dynamically imports all route handler modules using `import.meta.glob`.
**Individual pathway definitions**:

- `src/triage/routes/routine.ts`: Registers standard pathway for `"routine"` referrals.

- `src/triage/routes/urgent.ts`: Registers urgent review with mandatory phone contact (`requiresPhoneCall: true`) for `"urgent"` referrals.

- `src/triage/routes/followUp.ts`: Registers continuity review for `"followUp"` referrals.

- `src/triage/routes/safeguarding.ts`: Registers restricted review recommending `"Community nursing"` with mandatory phone contact for `"safeguarding"` referrals.

---

2. Clinical Banding & SLA Targets

Priority base score weighting and response SLAs are driven by type:

**`src/config/priorityRules.ts` (`referralPolicies`)**: Maps each `ReferralType` to its policy configuration:

- `routine`: `{ basePoints: 0, finder: "standard", targetHours: 336 }`

- `urgent`: `{ basePoints: 5, finder: "standard", targetHours: 24 }`

- `followUp`: `{ basePoints: 1, finder: "continuity", targetHours: 168 }`

- `safeguarding`: `{ basePoints: 8, finder: "standard", targetHours: 4 }`

**`src/triage/banding.ts` (`calculateBand`)**: Adds the type-specific `basePoints` to the points from matching clinical rules, derives the priority band (`red`, `amber`, `green`), and attaches `targetHours`.

---

3. Appointment Slot Search Strategy

The scheduling strategy used when booking is chosen by the referral type:

**`src/config/priorityRules.ts`**: Sets whether the referral type uses the `"continuity"` finder (for `"followUp"`) or the `"standard"` finder (for `"routine"`, `"urgent"`, `"safeguarding"`).
**`src/scheduling/service.ts` (`availableSlots`)**: Reads `referralPolicies[referral.type].finder` to dispatch the search to:

- `findSlots` in `src/scheduling/slotFinder.ts` (standard)

- `findContinuitySlots` in `src/scheduling/oldSlotFinder.ts` (continuity)

---

4. Eligibility and Data Redaction Rules

Specific referral types undergo specialized checks and privacy processing:

**`src/triage/eligibility.ts` (`checkEligibility`)**: Contains type-specific eligibility validation requiring child safeguarding coordination if `referral.type === "safeguarding"` and patient age is under 16.
**`src/api/pipeline/redact-stage.ts` (`redactBody`)**: Redacts patient phone, postcode, and clinical notes in API requests when `referral.type === "safeguarding"`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q4, cross-cutting concern

> Everywhere eligibility is checked — list every place it happens.

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/pages/ReferralListPage.tsx (0.61), src/triage/eligibility.ts (0.61), src/App.tsx (0.59), src/jobs/nightlyReverification.ts (0.59), src/store/useClinicStore.ts (0.59), src/triage/validation.ts (0.59), src/tests/eligibility.test.ts (0.57), src/components/ReferralTable.tsx (0.44), src/hooks/useReferralFilters.ts (0.44), src/types/domain.ts (0.44), src/audit/logger.ts (0.43), src/components/Layout.tsx (0.43), src/data/seed.ts (0.43), src/events/channel.ts (0.43), src/main.tsx (0.43), src/pages/AuditLogPage.tsx (0.43), src/pages/ClinicianOverviewPage.tsx (0.43), src/pages/ReferralDetailPage.tsx (0.43), src/scheduling/eventListener.ts (0.43), src/tests/scheduling.test.ts (0.43), src/triage/banding.ts (0.43), src/api/pipeline/redact-stage.ts (0.29), src/api/referrals-api.ts (0.29), src/components/PriorityPanel.tsx (0.29), src/components/SlotPicker.tsx (0.29), src/config/priorityRules.ts (0.29), src/events/types.ts (0.29), src/scheduling/service.ts (0.29), src/scheduling/types.ts (0.29), src/triage/routes/registry.ts (0.29), src/utils/format.ts (0.29), src/styles.css (0.28), src/tests/banding.test.ts (0.28), src/tests/registry.test.ts (0.28), src/triage/routes/loadRoutes.ts (0.28), index.html (0), package.json (0), README.md (0), src/api/api-client.ts (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), src/scheduling/oldSlotFinder.ts (0), src/scheduling/slotFinder.ts (0), src/triage/routes/followUp.ts (0), src/triage/routes/routine.ts (0), src/triage/routes/safeguarding.ts (0), src/triage/routes/urgent.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Eligibility is checked via `checkEligibility` (defined in `src/triage/eligibility.ts`). Across the entire repository context, `checkEligibility` is invoked in exactly three places in the application code (plus tests):

---

1. Referral Acceptance (`acceptReferral`)
**File:** `src/store/useClinicStore.ts` (lines 45–54)
**Caller / Function:** `useClinicStore` action `acceptReferral(id, override)`
**Runtime Trigger / Control Flow:**

- Invoked in the UI from `ReferralDetailPage.tsx` (`onAccept` callback, lines 47–56) when a user clicks the primary action button ("Accept referral" or "Update priority").

- Direct callers also include unit tests in `src/tests/eligibility.test.ts` (lines 9, 21, 30).

**Behavior:** Evaluates `checkEligibility(referral)`. If `!eligibility.eligible`, it emits an `eligibility:failed` event via `clinicEvents` with `phase: "acceptance"` and throws an `Error` containing the rejection reasons, preventing the referral status from updating to `accepted`.

---

2. Appointment Booking Validation (`checkAppointment`)
**File:** `src/triage/validation.ts` (lines 13–22)
**Caller / Function:** `checkAppointment(referral, clinician, slotId, actor)`
**Runtime Trigger / Control Flow:**

- Called by `useClinicStore.bookAppointment` in `src/store/useClinicStore.ts` (lines 99–134).

- `bookAppointment` is invoked in the UI from `ReferralDetailPage.tsx` (`onBook` callback, lines 66–70) via `SlotPicker.tsx` (lines 20–29) when confirming an appointment slot.

- Also invoked directly in tests in `src/tests/scheduling.test.ts` (lines 19, 32, 34).

**Behavior:** Evaluates `checkEligibility(referral)` before checking clinician slot availability. If `!eligibility.eligible`, it emits an `eligibility:failed` event with `phase: "booking"` and throws an `Error` containing the rejection reasons, halting the booking process.

---

3. Reverification Job (`runNightlyReverification`)
**File:** `src/jobs/nightlyReverification.ts` (lines 12–28)
**Caller / Function:** `runNightlyReverification(referrals)`
**Runtime Trigger / Control Flow:**

- Invoked in the UI from `AuditLogPage.tsx` (`verify` callback, lines 24–30) when a user clicks the "Run eligibility check" button in the header.

**Behavior:** Filters the referral list for candidates with status `"accepted"` or `"booked"`, then evaluates `checkEligibility(referral)` for each. If `!result.eligible`, it records the failure in the report and emits an `eligibility:failed` event with `phase: "nightly"`.

---

*(Note: There are no other call sites of `checkEligibility` or additional eligibility-evaluation functions across the project files provided.)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q5, pipeline chain

> What happens to an outgoing API request before it is sent?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/api/pipeline/types.ts (0.69), src/api/api-client.ts (0.66), src/api/referrals-api.ts (0.66), src/api/pipeline/auth-stage.ts (0.61), src/api/pipeline/redact-stage.ts (0.61), src/api/pipeline/trace-stage.ts (0.61), src/tests/eligibility.test.ts (0.59), src/tests/registry.test.ts (0.59), src/types/domain.ts (0.47), src/data/seed.ts (0.43), src/store/useClinicStore.ts (0.43), src/triage/routes/loadRoutes.ts (0.43), src/triage/routes/registry.ts (0.43), src/audit/logger.ts (0.32), src/components/PriorityPanel.tsx (0.32), src/components/ReferralTable.tsx (0.32), src/components/SlotPicker.tsx (0.32), src/config/priorityRules.ts (0.32), src/events/types.ts (0.32), src/hooks/useReferralFilters.ts (0.32), src/jobs/nightlyReverification.ts (0.32), src/pages/ReferralDetailPage.tsx (0.32), src/scheduling/service.ts (0.32), src/scheduling/types.ts (0.32), src/triage/banding.ts (0.32), src/triage/eligibility.ts (0.32), src/triage/validation.ts (0.32), src/utils/format.ts (0.32), src/components/Layout.tsx (0.28), src/events/channel.ts (0.28), src/pages/AuditLogPage.tsx (0.28), src/pages/ClinicianOverviewPage.tsx (0.28), src/pages/ReferralListPage.tsx (0.28), src/tests/banding.test.ts (0.28), src/tests/scheduling.test.ts (0.28), src/triage/routes/followUp.ts (0.28), src/triage/routes/routine.ts (0.28), src/triage/routes/safeguarding.ts (0.28), src/triage/routes/urgent.ts (0.28), src/scheduling/oldSlotFinder.ts (0.04), src/styles.css (0), index.html (0), package.json (0), README.md (0), src/App.tsx (0), src/main.tsx (0), src/scheduling/eventListener.ts (0), src/scheduling/slotFinder.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
An outgoing API request called via `apiRequest()` passes sequentially through three pipeline stages (`traceStage`, `authStage`, and `redactStage`) before reaching the terminal `transport` layer. During this pipeline, headers are defaulted and enriched with trace and authorization metadata, and sensitive fields on safeguarding referral bodies are redacted.

---

1. Request Pipeline Composition & Flow

In `src/api/api-client.ts` (lines 14–26):

`apiRequest()` initializes the request headers with a fallback: `{ ...request, headers: request.headers ?? {} }`.
The pipeline stages `[traceStage, authStage, redactStage]` are composed using `reduceRight` over `transport`:

```ts

const composed = stages.reduceRight<ApiNext>(

(next, stage) => (request) => stage(request, next),

transport,

);

```

The request travels in order: `traceStage` $\rightarrow$ `authStage` $\rightarrow$ `redactStage` $\rightarrow$ `transport`.

---

2. Stage Transformations

1. **Trace Header Generation (`traceStage`)**

* *File*: `src/api/pipeline/trace-stage.ts` (lines 2–8)

* Generates a trace identifier: `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`.

* Sets or updates `request.headers["X-Trace-Id"]`.

2. **Authentication and Staff Role Headers (`authStage`)**

* *File*: `src/api/pipeline/auth-stage.ts` (lines 2–12)

* Enriches `request.headers` with:

* `Authorization: "Bearer clinic-session"`

* `X-Staff-Role: "triage"`

3. **Data Redaction on Safeguarding Referrals (`redactStage`)**

* *File*: `src/api/pipeline/redact-stage.ts` (lines 3–19)

* Evaluates `request.body`. If the body is a `Referral` object where `type === "safeguarding"` and `patient` is defined, it transforms the body:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

* Requests that do not meet these conditions leave `request.body` untouched.

---

3. Transport Resolution
*File*: `src/api/api-client.ts` (lines 10–13)
The request is received by `transport`, which resolves a mock response containing:

* `status`: `200`

* `data`: `request.body ?? { ok: true }`

* `requestId`: `request.headers["X-Trace-Id"] ?? "local"` (which reads the trace ID injected by `traceStage`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q6, misleading name

> Does `checkAppointment` change any state, or does it only check?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/store/useClinicStore.ts (0.64), src/tests/scheduling.test.ts (0.64), src/triage/validation.ts (0.64), src/components/SlotPicker.tsx (0.59), src/events/types.ts (0.59), src/hooks/useReferralFilters.ts (0.59), src/jobs/nightlyReverification.ts (0.59), src/pages/AuditLogPage.tsx (0.59), src/pages/ClinicianOverviewPage.tsx (0.59), src/pages/ReferralDetailPage.tsx (0.59), src/triage/eligibility.ts (0.59), src/components/Layout.tsx (0.46), src/data/seed.ts (0.46), src/events/channel.ts (0.46), src/pages/ReferralListPage.tsx (0.46), src/scheduling/service.ts (0.46), src/tests/eligibility.test.ts (0.46), src/triage/banding.ts (0.46), src/types/domain.ts (0.46), src/App.tsx (0.43), src/audit/logger.ts (0.43), src/components/PriorityPanel.tsx (0.43), src/triage/routes/loadRoutes.ts (0.43), src/triage/routes/registry.ts (0.43), src/utils/format.ts (0.43), src/api/pipeline/redact-stage.ts (0.31), src/api/referrals-api.ts (0.31), src/components/ReferralTable.tsx (0.31), src/config/priorityRules.ts (0.31), src/scheduling/eventListener.ts (0.31), src/scheduling/oldSlotFinder.ts (0.31), src/scheduling/slotFinder.ts (0.31), src/scheduling/types.ts (0.31), src/tests/banding.test.ts (0.31), src/tests/registry.test.ts (0.31), src/main.tsx (0.28), src/triage/routes/followUp.ts (0.28), src/triage/routes/routine.ts (0.28), src/triage/routes/safeguarding.ts (0.28), src/triage/routes/urgent.ts (0.28), tsconfig.node.json (0.05), tsconfig.app.json (0.03), src/styles.css (0.01), index.html (0), package.json (0), README.md (0), src/api/api-client.ts (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), tsconfig.json (0), vite.config.ts (0)

```
**`checkAppointment` changes state.** It is not a read-only check.

---

Direct Evidence

In `src/triage/validation.ts` (lines 6–43):

1. **Mutates the Clinician Slot Argument in Place:**

When all validation checks pass, `checkAppointment` mutates the clinician's matching slot object directly:

```ts

slot.bookedReferralId = referral.id;

```

*(Direct evidence: `src/triage/validation.ts`, line 35)*

2. **Emits Events That Trigger Module-Level State Changes:**

- **When validation succeeds:** It emits `appointment:booked` on the global `clinicEvents` bus (`src/triage/validation.ts`, lines 36–39). In the running application, this triggers active listeners imported into the runtime:

- `src/scheduling/eventListener.ts` (lines 3–5): Adds `appointment.slotId` to the module-scoped `recentlyBooked` Set.

- `src/audit/logger.ts` (lines 4–14): Prepends an audit record to the module-scoped `eventEntries` array, which is read by `AuditLogPage` via `getEventAudit()`.

- **When eligibility validation fails:** It emits `eligibility:failed` on `clinicEvents` before throwing an error (`src/triage/validation.ts`, lines 13–17).

3. **Application Control Flow Context:**

In the live app (`src/pages/ReferralDetailPage.tsx`, line 71), booking invokes `useClinicStore.getState().bookAppointment` (`src/store/useClinicStore.ts`, lines 105–142). The store calls `checkAppointment`, relying on its slot mutation and returned `appointment` object before updating its own Zustand state (`appointments`, `clinicians`, and `referrals`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q7, legacy path

> Which slot-finding implementation runs for a follow-up referral, and why that one?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/SlotPicker.tsx (0.63), src/pages/ReferralDetailPage.tsx (0.63), src/scheduling/service.ts (0.62), src/scheduling/types.ts (0.62), src/components/ReferralTable.tsx (0.6), src/hooks/useReferralFilters.ts (0.6), src/pages/ReferralListPage.tsx (0.6), src/scheduling/oldSlotFinder.ts (0.6), src/scheduling/slotFinder.ts (0.6), src/api/pipeline/redact-stage.ts (0.58), src/api/referrals-api.ts (0.58), src/App.tsx (0.58), src/components/PriorityPanel.tsx (0.58), src/config/priorityRules.ts (0.58), src/data/seed.ts (0.58), src/jobs/nightlyReverification.ts (0.58), src/store/useClinicStore.ts (0.58), src/tests/registry.test.ts (0.58), src/triage/banding.ts (0.58), src/triage/eligibility.ts (0.58), src/triage/routes/followUp.ts (0.58), src/triage/routes/registry.ts (0.58), src/triage/validation.ts (0.58), src/utils/format.ts (0.58), src/triage/routes/loadRoutes.ts (0.46), src/types/domain.ts (0.46), src/tests/scheduling.test.ts (0.44), src/api/api-client.ts (0.42), src/api/pipeline/types.ts (0.42), src/audit/logger.ts (0.42), src/components/Layout.tsx (0.42), src/events/channel.ts (0.42), src/main.tsx (0.42), src/pages/AuditLogPage.tsx (0.42), src/pages/ClinicianOverviewPage.tsx (0.42), src/scheduling/eventListener.ts (0.42), src/tests/banding.test.ts (0.42), src/tests/eligibility.test.ts (0.42), src/triage/routes/routine.ts (0.42), src/triage/routes/safeguarding.ts (0.42), src/triage/routes/urgent.ts (0.42), src/events/types.ts (0.3), src/api/pipeline/auth-stage.ts (0.28), src/api/pipeline/trace-stage.ts (0.28), src/styles.css (0.28), index.html (0), package.json (0), README.md (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Answer

For a `followUp` referral, the slot-finding implementation that runs is **`findContinuitySlots`** (defined in `src/scheduling/oldSlotFinder.ts`).

---

Supporting Evidence and Control Flow

1. **Referral Policy Configuration**

In `src/config/priorityRules.ts` (lines 28–33), `referralPolicies` maps each `ReferralType` to its policy settings:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

routine: { basePoints: 0, finder: "standard", targetHours: 336 },

urgent: { basePoints: 5, finder: "standard", targetHours: 24 },

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

safeguarding: { basePoints: 8, finder: "standard", targetHours: 4 },

};

```

For `type === "followUp"`, the assigned finder key is `"continuity"`.

2. **Finder Dispatch via `availableSlots`**

In `src/scheduling/service.ts` (lines 7–19), `availableSlots` looks up the slot finder implementation by matching `referralPolicies[referral.type].finder` against the `finders` dictionary:

```ts

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

export function availableSlots(

referral: Referral,

clinicians: Clinician[],

): Slot[] {

const finder = finders[referralPolicies[referral.type].finder];

return finder({

referral,

clinicians,

preferredClinicianId: referral.assignedClinicianId,

});

}

```

When `referral.type` is `"followUp"`, `referralPolicies["followUp"].finder` resolves to `"continuity"`, which selects and invokes `findContinuitySlots` from `src/scheduling/oldSlotFinder.ts`.

3. **Runtime Call Path**

- In `src/pages/ReferralDetailPage.tsx` (lines 218–224), when a referral is accepted or active in the detail view, it renders `<SlotPicker referral={referral} clinicians={clinicians} onBook={onBook} />`.

- In `src/components/SlotPicker.tsx` (lines 12–15), `SlotPicker` calls `availableSlots(referral, clinicians)` to compute the candidate appointment slots.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q8, event emitter

> What reacts when a scheduling event is emitted?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/App.tsx (0.65), src/tests/scheduling.test.ts (0.63), src/audit/logger.ts (0.6), src/components/SlotPicker.tsx (0.6), src/events/channel.ts (0.6), src/pages/AuditLogPage.tsx (0.6), src/scheduling/eventListener.ts (0.6), src/scheduling/oldSlotFinder.ts (0.58), src/scheduling/service.ts (0.58), src/scheduling/slotFinder.ts (0.58), src/scheduling/types.ts (0.58), src/components/Layout.tsx (0.47), src/main.tsx (0.47), src/pages/ClinicianOverviewPage.tsx (0.47), src/pages/ReferralDetailPage.tsx (0.47), src/pages/ReferralListPage.tsx (0.47), src/data/seed.ts (0.45), src/triage/validation.ts (0.45), src/events/types.ts (0.43), src/jobs/nightlyReverification.ts (0.43), src/store/useClinicStore.ts (0.43), src/types/domain.ts (0.43), src/utils/format.ts (0.43), src/config/priorityRules.ts (0.41), src/components/PriorityPanel.tsx (0.31), src/components/ReferralTable.tsx (0.31), src/hooks/useReferralFilters.ts (0.31), src/styles.css (0.31), src/triage/routes/loadRoutes.ts (0.31), src/triage/routes/registry.ts (0.31), src/tests/banding.test.ts (0.3), src/tests/eligibility.test.ts (0.3), src/tests/registry.test.ts (0.3), src/triage/eligibility.ts (0.3), src/api/pipeline/redact-stage.ts (0.29), src/api/referrals-api.ts (0.29), src/triage/banding.ts (0.29), src/api/api-client.ts (0.04), index.html (0), package.json (0), README.md (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), src/triage/routes/followUp.ts (0), src/triage/routes/routine.ts (0), src/triage/routes/safeguarding.ts (0), src/triage/routes/urgent.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
When a scheduling event—specifically the `"appointment:booked"` event defined on the clinic event channel—is emitted, exactly two listeners react:

---

1. In-Memory Event Audit Logger (`src/audit/logger.ts`)
**Direct Evidence:** `src/audit/logger.ts` (lines 4–14) registers a listener on `clinicEvents`:

```ts

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

**Runtime Data Flow & Effects:**

- It creates an `AuditEntry` and unshifts it into module-scoped memory (`eventEntries`).

- `getEventAudit()` (`src/audit/logger.ts`, lines 16–18) returns these entries, which are merged with store audit logs and rendered on the UI in `AuditLogPage` (`src/pages/AuditLogPage.tsx`, lines 13–24).

---

2. Recent Bookings Cache (`src/scheduling/eventListener.ts`)
**Direct Evidence:** `src/scheduling/eventListener.ts` (lines 3–5) registers a listener on `clinicEvents`:

```ts

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

**Runtime Data Flow & Effects:**

- It adds the appointment's `slotId` to the module-scoped `recentlyBooked` Set.

- While `wasRecentlyBooked(slotId)` is exported (`src/scheduling/eventListener.ts`, lines 6–8) to query this set, there are no call sites consuming `wasRecentlyBooked` in the provided codebase.

---

Bootstrapping & Emission Control Flow
**Registration / Application Entry Point:** Both modules are imported at application root (`src/App.tsx`, lines 7–8: `import "./scheduling/eventListener"; import "./audit/logger";`), ensuring their subscriptions are registered on `clinicEvents` when the app loads.
**Emission Source:** The `"appointment:booked"` event is emitted inside `checkAppointment` (`src/triage/validation.ts`, lines 37–40):

```ts

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

```

This is triggered in live application flows when `bookAppointment` is called on the store (`src/store/useClinicStore.ts`, lines 112–117), which is initiated by user action via `SlotPicker` on `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`, lines 62–66).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q9, applied

> Where would a new referral type be added, and what else would need changing?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/ReferralTable.tsx (0.63), src/hooks/useReferralFilters.ts (0.63), src/pages/ReferralDetailPage.tsx (0.63), src/api/pipeline/redact-stage.ts (0.62), src/api/referrals-api.ts (0.62), src/components/PriorityPanel.tsx (0.62), src/components/SlotPicker.tsx (0.62), src/config/priorityRules.ts (0.62), src/data/seed.ts (0.62), src/jobs/nightlyReverification.ts (0.62), src/scheduling/service.ts (0.62), src/scheduling/types.ts (0.62), src/store/useClinicStore.ts (0.62), src/triage/banding.ts (0.62), src/triage/eligibility.ts (0.62), src/triage/routes/registry.ts (0.62), src/triage/validation.ts (0.62), src/utils/format.ts (0.62), src/pages/ReferralListPage.tsx (0.6), src/api/api-client.ts (0.58), src/api/pipeline/auth-stage.ts (0.58), src/api/pipeline/trace-stage.ts (0.58), src/App.tsx (0.58), src/audit/logger.ts (0.58), src/events/channel.ts (0.58), src/events/types.ts (0.58), src/scheduling/oldSlotFinder.ts (0.58), src/scheduling/slotFinder.ts (0.58), src/tests/registry.test.ts (0.58), src/triage/routes/loadRoutes.ts (0.46), src/types/domain.ts (0.46), src/api/pipeline/types.ts (0.44), src/components/Layout.tsx (0.44), src/pages/AuditLogPage.tsx (0.44), src/pages/ClinicianOverviewPage.tsx (0.44), src/tests/banding.test.ts (0.44), src/tests/eligibility.test.ts (0.44), src/tests/scheduling.test.ts (0.44), src/triage/routes/followUp.ts (0.44), src/triage/routes/routine.ts (0.44), src/triage/routes/safeguarding.ts (0.44), src/triage/routes/urgent.ts (0.44), src/main.tsx (0.42), src/scheduling/eventListener.ts (0.42), src/styles.css (0.28), index.html (0.03), package.json (0.02), README.md (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
To add a new referral type, the primary definition is added to the `ReferralType` union in **`src/types/domain.ts`**.

Across the codebase, multiple required type-mapped configurations, dynamic route registrations, UI components, styles, and tests must be updated to support the new type:

---

1. Primary Entry Point (Type Definition)
**`src/types/domain.ts`** (line 1):

* Add the new literal type to the `ReferralType` union (`export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "<newType>"`).

---

2. Required Clinical & Triage Configuration
**`src/config/priorityRules.ts`** (lines 20–25):

* Add an entry for the new type in `referralPolicies` (`Record<ReferralType, ReferralPolicy>`) defining its `basePoints`, `finder` (`"standard"` | `"continuity"`), and `targetHours`.

* *(Optional / As needed)* Add rules to `priorityRules` (lines 27–64) if the type requires specific clinical escalation rules.

**`src/triage/routes/`** (e.g., `src/triage/routes/routine.ts`, `urgent.ts`, `followUp.ts`, `safeguarding.ts`):

* Create a new file (such as `src/triage/routes/<newType>.ts`) that registers a `RouteHandler` using `registerRoute("<newType>", handler)`. Because `src/triage/routes/loadRoutes.ts` (lines 1–12) imports all `src/triage/routes/*.ts` via `import.meta.glob`, the new route handler will be automatically discovered and loaded when `loadRoutes()` runs in `ReferralDetailPage.tsx` and tests.

**`src/triage/eligibility.ts`** (lines 4–25):

* Update `checkEligibility(referral)` if the new referral type has custom eligibility checks (e.g., age limits or restrictions).

---

3. Formatting, UI & Styles
**`src/utils/format.ts`** (lines 15–22):

* Update `humaniseType(type: ReferralType)` to include a display string in its object map for the new type.

**`src/pages/ReferralListPage.tsx`**:

* Add an `<option value="<newType>">` to the pathway `<select aria-label="Filter referral type">` (lines 62–72).

* Review the `urgent` metric calculation (lines 10–15) if the new type should count towards the "Time sensitive" metric card alongside `"urgent"` and `"safeguarding"`.

**`src/styles.css`**:

* Add CSS classes for the referral type indicators:

* `.type-dot.type-<newType>` (rendered in `src/components/ReferralTable.tsx`, line 40).

* `.type-badge.type-<newType>` (rendered in `src/pages/ReferralDetailPage.tsx`, line 118).

---

4. Downstream Pipeline, Mock Data & Tests
**`src/api/pipeline/redact-stage.ts`** (lines 3–15):

* Check and update `redactBody` if the new type requires data redaction/masking before external dispatch (as is done for `referral.type === "safeguarding"`).

**`src/data/seed.ts`** (lines 142–247, 249–279):

* Add scenarios with the new type to generate mock data in `seedReferrals`.

**`src/tests/registry.test.ts`** (lines 7–8):

* Update the registered route count assertion `expect(registeredRouteCount()).toBe(4)` to account for the new route handler.

**`src/tests/banding.test.ts` & `src/tests/eligibility.test.ts`**:

* Add test coverage for the new type's banding decision and eligibility validation.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q10, applied

> If the priority rules changed, what else would be affected?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/config/priorityRules.ts (0.68), src/scheduling/service.ts (0.64), src/triage/banding.ts (0.64), src/components/PriorityPanel.tsx (0.61), src/events/types.ts (0.59), src/hooks/useReferralFilters.ts (0.59), src/pages/ReferralDetailPage.tsx (0.59), src/store/useClinicStore.ts (0.59), src/utils/format.ts (0.59), src/types/domain.ts (0.49), src/components/SlotPicker.tsx (0.46), src/scheduling/oldSlotFinder.ts (0.46), src/scheduling/slotFinder.ts (0.46), src/scheduling/types.ts (0.46), src/tests/banding.test.ts (0.46), src/tests/scheduling.test.ts (0.46), src/App.tsx (0.43), src/components/Layout.tsx (0.43), src/components/ReferralTable.tsx (0.43), src/data/seed.ts (0.43), src/events/channel.ts (0.43), src/pages/AuditLogPage.tsx (0.43), src/pages/ClinicianOverviewPage.tsx (0.43), src/pages/ReferralListPage.tsx (0.43), src/tests/eligibility.test.ts (0.43), src/triage/eligibility.ts (0.43), src/triage/routes/loadRoutes.ts (0.43), src/triage/routes/registry.ts (0.43), src/triage/validation.ts (0.43), src/api/pipeline/redact-stage.ts (0.33), src/api/referrals-api.ts (0.33), src/audit/logger.ts (0.33), src/jobs/nightlyReverification.ts (0.33), src/main.tsx (0.28), src/scheduling/eventListener.ts (0.28), src/tests/registry.test.ts (0.28), src/triage/routes/followUp.ts (0.28), src/triage/routes/routine.ts (0.28), src/triage/routes/safeguarding.ts (0.28), src/triage/routes/urgent.ts (0.28), README.md (0.03), src/styles.css (0.02), index.html (0), package.json (0), src/api/api-client.ts (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Direct Impact Summary

If `priorityRules` (the scoring rules configured in `src/config/priorityRules.ts`) are modified, the components and systems affected are:

1. **Banding Calculation Engine** (`src/triage/banding.ts`): `calculateBand` computes matched rule IDs, accumulated score, and the resulting priority band.

2. **Clinical UI Recommendations** (`src/components/PriorityPanel.tsx` rendered in `src/pages/ReferralDetailPage.tsx`): Displays the calculated score, the suggested priority band badge, target hours, and the list of matched rule names under "Signals considered".

3. **Automated Unit Tests** (`src/tests/banding.test.ts`): Tests asserting `calculateBand` rule matching, scoring, and band assignment.

4. **Direct / Fallback Store Invocations** (`src/store/useClinicStore.ts`): The fallback `override ?? calculateBand(referral).band` inside `acceptReferral` (used when called without an explicit override argument, such as in `src/tests/eligibility.test.ts`).

---

Detailed Tracing and Change Impact

#### 1. Banding Logic (`src/triage/banding.ts`)

**Direct evidence:** `calculateBand(referral: Referral)` imports `priorityRules` directly:

```ts

const matched = priorityRules.filter((rule) => rule.matches(context));

const score =

referralPolicies[referral.type].basePoints +

matched.reduce((total, rule) => total + rule.points, 0);

```

**Effect:** Changes to rule match conditions (`matches`), rule weights (`points`), rule IDs (`id`), or the number of rules will alter:

* `decision.matchedRules` (list of matching rule ID strings).

* `decision.score` (total score combined with policy `basePoints`).

* `decision.band` (the band resolved via `bandThresholds`).

#### 2. Referral Detail Page UI (`src/components/PriorityPanel.tsx` & `src/pages/ReferralDetailPage.tsx`)

**Direct evidence:** `PriorityPanel` calls `calculateBand(referral)` at runtime on line 18 of `src/components/PriorityPanel.tsx`.
**Runtime UI effect:**

* **Score Display:** Renders `<span className="score">Score {decision.score}</span>`.

* **Suggested Band Indicator:** Marks the corresponding option button with `<em>Suggested</em>` when `decision.band === band` and prints `bandLabel(decision.band)`.

* **Signals Considered List:** Maps each element in `decision.matchedRules` to a list item (`rule.replaceAll("-", " ")`) or renders `"No escalation signals matched."` if empty.

**Caller Context:** `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) hosts `PriorityPanel` and maintains the user's selected `priority` state (which defaults to `referral.priority ?? "green"`).

#### 3. Store Actions & Events (`src/store/useClinicStore.ts`)

**Direct evidence:** `acceptReferral(id, override)` in `src/store/useClinicStore.ts` contains:

```ts

const band = override ?? calculateBand(referral).band;

```

**Distinction between live UI vs programmatic callers:**

* *Live UI Flow:* `ReferralDetailPage.tsx` calls `accept(referral.id, priority)` passing the component's state as `override`. In this specific UI path, the explicit argument bypasses the fallback.

* *Programmatic / Direct Store Callers:* Any caller invoking `acceptReferral(id)` without a second argument (for example, `src/tests/eligibility.test.ts` calling `useClinicStore.getState().acceptReferral(...)`) executes `calculateBand(referral).band`. When triggered, a band change also changes:

* `referral.priority` in state.

* Audit entry severity (`severity: band === "red" ? "critical" : "info"`).

* Event payload emitted via `clinicEvents.emit("referral:accepted", { referralId, band, actor })`.

#### 4. Unit Tests (`src/tests/banding.test.ts` & `src/tests/eligibility.test.ts`)

**Direct evidence:**

* `src/tests/banding.test.ts` directly tests `calculateBand` outputs, verifying matched rules (`matchedRules.length > 0` on deteriorating signals) and calculated bands.

* `src/tests/eligibility.test.ts` executes `acceptReferral` without an override.

---

What Is Not Affected
**Pathway Routing Guidance (`src/triage/routes/*`):** Driven exclusively by `referral.type` handler registrations (`registerRoute`), not `priorityRules`.
**Slot Finding and Availability (`src/scheduling/slotFinder.ts`, `src/scheduling/oldSlotFinder.ts`, `src/scheduling/service.ts`):** `availableSlots` uses `referralPolicies[referral.type].finder` and clinician service matching; it does not read `priorityRules`.
**Referral Eligibility Validation (`src/triage/eligibility.ts`):** Validates postcode, date of birth, registered practice, and status independent of the rule scoring table.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q11, pipeline chain

> Are safeguarding referrals treated differently anywhere? Where?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/data/seed.ts (0.59), src/store/useClinicStore.ts (0.59), src/tests/banding.test.ts (0.59), src/tests/eligibility.test.ts (0.59), src/tests/registry.test.ts (0.59), src/tests/scheduling.test.ts (0.59), src/api/referrals-api.ts (0.57), src/triage/routes/safeguarding.ts (0.57), src/components/Layout.tsx (0.43), src/events/channel.ts (0.43), src/pages/AuditLogPage.tsx (0.43), src/pages/ClinicianOverviewPage.tsx (0.43), src/pages/ReferralDetailPage.tsx (0.43), src/pages/ReferralListPage.tsx (0.43), src/scheduling/service.ts (0.43), src/triage/banding.ts (0.43), src/triage/eligibility.ts (0.43), src/triage/routes/loadRoutes.ts (0.43), src/triage/routes/registry.ts (0.43), src/triage/validation.ts (0.43), src/types/domain.ts (0.43), src/api/api-client.ts (0.41), src/api/pipeline/redact-stage.ts (0.28), src/App.tsx (0.28), src/audit/logger.ts (0.28), src/components/PriorityPanel.tsx (0.28), src/components/ReferralTable.tsx (0.28), src/components/SlotPicker.tsx (0.28), src/config/priorityRules.ts (0.28), src/events/types.ts (0.28), src/hooks/useReferralFilters.ts (0.28), src/jobs/nightlyReverification.ts (0.28), src/scheduling/eventListener.ts (0.28), src/scheduling/oldSlotFinder.ts (0.28), src/scheduling/slotFinder.ts (0.28), src/scheduling/types.ts (0.28), src/triage/routes/followUp.ts (0.28), src/triage/routes/routine.ts (0.28), src/triage/routes/urgent.ts (0.28), src/utils/format.ts (0.28), src/api/pipeline/auth-stage.ts (0.27), src/api/pipeline/trace-stage.ts (0.27), src/api/pipeline/types.ts (0.27), README.md (0.03), src/styles.css (0), index.html (0), package.json (0), src/main.tsx (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
**Yes**, safeguarding referrals (and referrals with safeguarding signals) are treated differently across several areas in the codebase:

---

1. Eligibility & Age Restrictions
**File:** `src/triage/eligibility.ts` (lines 16–17)

* Referrals with `referral.type === "safeguarding"` enforce an age restriction:

```ts

if (referral.type === "safeguarding" && age < 16)

reasons.push("Child safeguarding team must coordinate this referral");

```

* *Call sites & impact:* This eligibility rule is evaluated when accepting a referral (`useClinicStore.acceptReferral` in `src/store/useClinicStore.ts`), during booking validation (`checkAppointment` in `src/triage/validation.ts`), and during batch verification (`runNightlyReverification` in `src/jobs/nightlyReverification.ts`).

---

2. Clinical Banding & Response Time Targets
**File:** `src/config/priorityRules.ts` (lines 23–35) & `src/triage/banding.ts` (lines 13–24)

* **Base Policy:** `referralPolicies.safeguarding` is configured with `basePoints: 8` and `targetHours: 4` (the shortest response window in the system).

* **Rule Matching:** `priorityRules` includes a dedicated rule (`id: "safeguarding-signal"`) that awards `10` points and targets band `"red"` when `context.safeguardingConcern` is `true`.

* *Impact:* Because the `"red"` threshold is $\ge 9$ points (`bandThresholds`), safeguarding referrals automatically evaluate to Priority 1 / `"red"` unless overridden.

---

3. Triage Pathway Routing & Detail Page Guidance
**File:** `src/triage/routes/safeguarding.ts` (lines 1–12)

* Registers a specialized route handler for `safeguarding` referrals:

* Summarizes as `"Restricted safeguarding review for <patient name>"`.

* Hardcodes `recommendedService` to `"Community nursing"`.

* Sets `requiresPhoneCall: true`.

* Specifies instructions:

1. `"Do not leave a voicemail"`

2. `"Check safe contact method"`

3. `"Notify safeguarding lead"`

**File:** `src/pages/ReferralDetailPage.tsx` (lines 142–153)

* Renders a dedicated warning banner (`"Telephone contact is required before booking."`) when `route.requiresPhoneCall` is true.

---

4. API Request Redaction (Middleware Stage)
**File:** `src/api/pipeline/redact-stage.ts` (lines 4–17)

* In the API client pipeline (`src/api/api-client.ts`), `redactStage` inspects outgoing payloads and specifically redacts safeguarding referrals:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

*(Note: While defined in the API client pipeline, `submitReferral` and `recordBooking` in `src/api/referrals-api.ts` have no active UI callers in the current build.)*

---

5. UI Metrics and Visual Styling
**File:** `src/pages/ReferralListPage.tsx` (lines 12–17)

* The "Time sensitive" metric card count includes `item.type === "safeguarding"` alongside `item.type === "urgent"` and `item.priority === "red"`.

**File:** `src/pages/ReferralDetailPage.tsx` (lines 115) & `src/components/ReferralTable.tsx` (lines 42)

* Applies `type-safeguarding` class to the referral type indicator dot and summary badges.

**File:** `src/styles.css` (lines 665–667, 763–766)

* Styles `.type-dot.type-safeguarding` and `.type-badge.type-safeguarding` with red/warning color schemes (`#c65358` / `#faeaeb`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q12, misleading name

> Where is a slot actually booked?

### Ground truth, this is the standard

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

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/SlotPicker.tsx (0.66), src/scheduling/oldSlotFinder.ts (0.66), src/scheduling/slotFinder.ts (0.66), src/pages/ReferralDetailPage.tsx (0.63), src/scheduling/eventListener.ts (0.63), src/scheduling/service.ts (0.63), src/scheduling/types.ts (0.63), src/types/domain.ts (0.48), src/utils/format.ts (0.48), src/App.tsx (0.45), src/components/PriorityPanel.tsx (0.45), src/config/priorityRules.ts (0.45), src/events/channel.ts (0.45), src/store/useClinicStore.ts (0.45), src/tests/scheduling.test.ts (0.45), src/triage/routes/loadRoutes.ts (0.45), src/triage/routes/registry.ts (0.45), src/triage/validation.ts (0.4), src/api/pipeline/redact-stage.ts (0.32), src/api/referrals-api.ts (0.32), src/audit/logger.ts (0.32), src/components/Layout.tsx (0.32), src/components/ReferralTable.tsx (0.32), src/data/seed.ts (0.32), src/events/types.ts (0.32), src/hooks/useReferralFilters.ts (0.32), src/jobs/nightlyReverification.ts (0.32), src/pages/AuditLogPage.tsx (0.32), src/pages/ClinicianOverviewPage.tsx (0.32), src/triage/banding.ts (0.32), src/triage/eligibility.ts (0.32), src/main.tsx (0.3), src/pages/ReferralListPage.tsx (0.3), src/tests/eligibility.test.ts (0.3), src/tests/registry.test.ts (0.3), src/triage/routes/followUp.ts (0.3), src/triage/routes/routine.ts (0.3), src/triage/routes/safeguarding.ts (0.3), src/triage/routes/urgent.ts (0.3), src/styles.css (0.02), index.html (0), package.json (0), README.md (0), src/api/api-client.ts (0), src/api/pipeline/auth-stage.ts (0), src/api/pipeline/trace-stage.ts (0), src/api/pipeline/types.ts (0), src/tests/banding.test.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
A slot is actually marked as booked in **`src/triage/validation.ts`** inside the **`checkAppointment`** function by mutating `slot.bookedReferralId`.

---

Supporting Details & Execution Flow

1. **Direct Booking Mutation:**

* In `src/triage/validation.ts` (lines 35–39), `checkAppointment` validates eligibility and slot availability, creates the `Appointment` object, mutates the slot object directly:

```ts

slot.bookedReferralId = referral.id;

```

and emits the `appointment:booked` event via `clinicEvents.emit`.

2. **State & Store Integration:**

* In `src/store/useClinicStore.ts` (lines 109–137), the `bookAppointment` action retrieves the referral and clinician from the Zustand store, calls `checkAppointment(referral, clinician, slotId, state.actor)`, adds the created appointment to `appointments`, sets `referral.status = "booked"`, and records an audit log entry.

3. **UI Entry Point & Control Flow:**

* In `src/components/SlotPicker.tsx` (lines 17–28), selecting a slot and clicking **Confirm appointment** invokes `onBook(slot.clinicianId, slot.id)`.

* In `src/pages/ReferralDetailPage.tsx` (lines 58–62, 190–196), `onBook` calls `useClinicStore.getState().bookAppointment` (aliased as `book`).

4. **Other Callers / Unused Helpers:**

* `checkAppointment` is also called directly in unit tests (`src/tests/scheduling.test.ts`, lines 18–37).

* Note: `src/scheduling/service.ts` defines an exported helper function `reserveSlot` (lines 22–26) that also sets `bookedReferralId`, but direct inspection of the codebase shows `reserveSlot` has no callers in the application runtime.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

