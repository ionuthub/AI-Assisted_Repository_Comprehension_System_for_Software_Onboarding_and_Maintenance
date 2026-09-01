# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 69ce5241ed8150903fd758eabb4ebfa4f639af243febbfaecf7e82ca1768002a -->

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
Execution starts in **`index.html`**, which serves as the document entry point and loads the primary module via `<script type="module" src="/src/main.tsx"></script>`.

---

Key Stages of Application Startup

1. **HTML Document Loading (`index.html`)**

The browser loads `index.html`, which provides the `<div id="root"></div>` DOM container and specifies `/src/main.tsx` as the JavaScript module entry point [`index.html`].

2. **Module Entry & DOM Mounting (`src/main.tsx`)**

`src/main.tsx` imports React, `App`, and the CSS styling [`src/main.tsx`]. It executes `ReactDOM.createRoot` on `#root` and renders the top-level `<App />` component inside React's strict mode [`src/main.tsx`].

3. **Module Evaluation & Event Registration (`src/App.tsx`)**

When `src/App.tsx` is imported and evaluated, two side-effect modules are executed immediately prior to component rendering [`src/App.tsx`]:

* `src/scheduling/eventListener.ts` — Registers an event listener on `clinicEvents` for `"appointment:booked"` [`src/scheduling/eventListener.ts`].

* `src/audit/logger.ts` — Registers an event listener on `clinicEvents` for `"appointment:booked"` to write audit entries [`src/audit/logger.ts`].

4. **Router & Initial View Rendering (`src/App.tsx`)**

`App` initializes `<BrowserRouter>` with a layout shell route (`Layout`) and mounts the default index route, **`ReferralListPage`** [`src/App.tsx`, `src/pages/ReferralListPage.tsx`].
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
A referral is assigned its priority band (**`"red"`**, **`"amber"`**, or **`"green"`**) through an automated scoring rule system that suggests a band, which is then confirmed or manually overridden when a user accepts or updates the referral.

---

1. Automated Score Calculation

The algorithm in `calculateBand` calculates a numerical score based on the referral's type and clinical signals (`src/triage/banding.ts`):

1. **Base Points by Pathway Type** (`src/config/priorityRules.ts`):

- `safeguarding`: 8 points

- `urgent`: 5 points

- `followUp`: 1 point

- `routine`: 0 points

2. **Signal Rules Added** (`src/config/priorityRules.ts`):

- `safeguarding-signal`: +10 points if `safeguardingConcern` is true

- `rapid-deterioration`: +7 points if `deterioration` is true and `painScore >= 7`

- `severe-pain`: +4 points if `painScore >= 7`

- `post-discharge`: +3 points if `recentDischarge` is true

- `mobility`: +2 points if `mobilityRisk` is true

- `persistent-symptoms`: +1 point if `symptomDays > 21`

3. **Threshold Matching** (`src/config/priorityRules.ts`):

Total points map to the first matching threshold:

- **Score $\ge$ 9**: `red` (Priority 1)

- **Score $\ge$ 4**: `amber` (Priority 2)

- **Score $\ge$ 0**: `green` (Priority 3)

---

2. UI Presentation & Selection
In `PriorityPanel` (`src/components/PriorityPanel.tsx`), `calculateBand(referral)` runs to show the score, matched rule signals, target response window in hours, and the **Suggested band**.
The page component (`ReferralDetailPage.tsx`, `src/pages/ReferralDetailPage.tsx`) stores the selected band in local state (`priority`), defaulting to `referral.priority ?? "green"`.
The user can click any of the options (Priority 1 / Priority 2 / Priority 3) in `PriorityPanel` to select an explicit band.

---

3. Application State Update

When the user clicks **Accept referral** or **Update priority** in `ReferralDetailPage`:

1. `onAccept` calls `accept(referral.id, priority)` in `useClinicStore` (`src/pages/ReferralDetailPage.tsx`).

2. `acceptReferral` in `useClinicStore` (`src/store/useClinicStore.ts`):

- Runs `checkEligibility(referral)` (`src/triage/eligibility.ts`); if ineligible, throws an error and emits an `eligibility:failed` event.

- Sets the referral's `status` to `"accepted"` and `priority` to the chosen band (or defaults to `calculateBand(referral).band` if no override is supplied).

- Writes an audit log entry via `addAudit`.

- Emits a `referral:accepted` event on `clinicEvents` (`src/events/channel.ts`).

*(Note: `useClinicStore` also exports a `setPriority` state action in `src/store/useClinicStore.ts`, but the active UI flow uses `acceptReferral` in `src/pages/ReferralDetailPage.tsx`.)*
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
The processing of a given referral type is primarily decided across two subsystems: **pathway routing** in `src/triage/routes/` and **policy configuration** in `src/config/priorityRules.ts`.

---

1. Pathway Guidance Routing

How a referral's recommended pathway, instructions, and telephone requirement are determined is managed by the routing registry:

**Route Registry (`src/triage/routes/registry.ts`)**: Defines `routeReferral(referral)`, which retrieves the handler mapped to `referral.type` from a module-level `handlers` map.
**Dynamic Route Loader (`src/triage/routes/loadRoutes.ts`)**: Dynamically imports all route handler modules using `import.meta.glob`.
**Type Route Handlers**:

* `src/triage/routes/routine.ts`: Configures standard pathway instructions.

* `src/triage/routes/urgent.ts`: Sets `requiresPhoneCall: true` and urgent contact instructions.

* `src/triage/routes/followUp.ts`: Configures pathway instructions focused on previous care teams and letters.

* `src/triage/routes/safeguarding.ts`: Restricts recommended service to `"Community nursing"` and sets `requiresPhoneCall: true`.

**UI Dispatch (`src/pages/ReferralDetailPage.tsx`)**: Calls `loadRoutes()` in an effect and evaluates `routeReferral(referral)` to render pathway summary and warnings.

---

2. Triage Priority & Slot Strategy Selection

How a referral type affects priority scoring, target resolution times, and appointment slot finding is governed by:

**Policy Mapping (`src/config/priorityRules.ts`)**: Defines `referralPolicies`, which maps every `ReferralType` to its base parameters:

* `routine`: `basePoints: 0`, `finder: "standard"`, `targetHours: 336`

* `urgent`: `basePoints: 5`, `finder: "standard"`, `targetHours: 24`

* `followUp`: `basePoints: 1`, `finder: "continuity"`, `targetHours: 168`

* `safeguarding`: `basePoints: 8`, `finder: "standard"`, `targetHours: 4`

**Clinical Banding (`src/triage/banding.ts`)**: `calculateBand()` reads `referralPolicies[referral.type]` to compute base points and target SLA hours.
**Scheduling Finder Dispatch (`src/scheduling/service.ts`)**: `availableSlots()` evaluates `referralPolicies[referral.type].finder` to dispatch slot searches to either standard slot selection (`src/scheduling/slotFinder.ts`) or continuity-preferred slot selection (`src/scheduling/oldSlotFinder.ts`).

---

3. Special-Case Type Checks
**Eligibility Rules (`src/triage/eligibility.ts`)**: `checkEligibility()` checks `referral.type === "safeguarding"` to reject referrals for patients under age 16.
**API Redaction Pipeline (`src/api/pipeline/redact-stage.ts`)**: `redactStage` masks phone numbers, postcodes, and clinical notes if `referral.type === "safeguarding"`.
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
Eligibility is directly checked in **three location functions** in the codebase via `checkEligibility` (`src/triage/eligibility.ts`).

Here is every place where an eligibility check occurs, including the direct call sites, their runtime triggers, UI/job entry points, and test suites.

---

Direct Call Sites & Execution Flow

1. **Referral Acceptance (`acceptReferral` in Zustand Store)**

* **Location:** `src/store/useClinicStore.ts` (lines 46–54)

* **What happens:** Before accepting a referral and assigning a priority band, `acceptReferral` calls `checkEligibility(referral)`. If ineligible, it emits an `eligibility:failed` event with phase `"acceptance"` and throws an error, preventing the status update.

* **Runtime / Entry Points:**

* **UI:** Triggered on the Referral Detail page (`src/pages/ReferralDetailPage.tsx`, line 51) when a coordinator clicks the **"Accept referral"** button.

* **Tests:** Executed in unit tests (`src/tests/eligibility.test.ts`, lines 10, 20, 31).

2. **Appointment Booking Validation (`checkAppointment`)**

* **Location:** `src/triage/validation.ts` (lines 11–18)

* **What happens:** Before booking a slot, `checkAppointment` calls `checkEligibility(referral)`. If ineligible, it emits an `eligibility:failed` event with phase `"booking"` and throws an error, aborting the booking.

* **Runtime / Entry Points:**

* **Store Action:** Invoked inside `bookAppointment` in `src/store/useClinicStore.ts` (line 119).

* **UI:** Triggered on the Referral Detail page via the `SlotPicker` component (`src/components/SlotPicker.tsx`, line 24 -> `ReferralDetailPage.tsx`, line 62) when a coordinator clicks **"Confirm appointment"**.

* **Tests:** Executed in scheduling unit tests (`src/tests/scheduling.test.ts`, lines 22, 34).

3. **Nightly Reverification Job (`runNightlyReverification`)**

* **Location:** `src/jobs/nightlyReverification.ts` (lines 19–27)

* **What happens:** Iterates through all existing referrals with status `"accepted"` or `"booked"` and calls `checkEligibility(referral)` on each candidate. For any failures, it records the failure and emits an `eligibility:failed` event with phase `"nightly"`.

* **Runtime / Entry Points:**

* **UI:** Triggered manually from the Governance / Audit Log page (`src/pages/AuditLogPage.tsx`, line 28) when a user clicks the **"Run eligibility check"** button.
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
Before an outgoing API request is sent, it passes sequentially through a 3-stage composed middleware pipeline (**tracing** → **authentication** → **data redaction**) before reaching the mock network transport layer.

---

Step-by-Step Pipeline Flow

#### 1. Invocation & Composition Entry

When `apiRequest` is called (`src/api/api-client.ts`), it ensures `headers` defaults to an object (`request.headers ?? {}`) and passes the request to the `composed` pipeline constructed via `stages.reduceRight`. The stage execution order is:

```

apiRequest() ──> traceStage ──> authStage ──> redactStage ──> transport

```

#### 2. Trace Identifier Generation (`traceStage`)

**File:** `src/api/pipeline/trace-stage.ts`
Generates a unique trace ID formatted as ``trace-${Date.now()}-${Math.random().toString(16).slice(2)}``.
Adds the trace ID to request headers under `X-Trace-Id`.

#### 3. Authentication & Role Context Enrichment (`authStage`)

**File:** `src/api/pipeline/auth-stage.ts`
Merges authorization and role headers into the request:

* `Authorization: "Bearer clinic-session"`

* `X-Staff-Role: "triage"`

#### 4. Sensitive Data Redaction (`redactStage`)

**File:** `src/api/pipeline/redact-stage.ts`
Evaluates `request.body`. If the request body contains a referral where `type === "safeguarding"` and `patient` is present, it redacts sensitive patient fields before sending:

* `notes` is replaced with `"[restricted clinical note]"`

* `patient.phone` is replaced with `"[safe contact required]"`

* `patient.postcode` is replaced with `"[restricted]"`

For all other referral types or request bodies, the body is left unchanged.

#### 5. Transport Delivery (`transport`)

**File:** `src/api/api-client.ts`
Receives the fully transformed request and returns a resolved `Promise` containing an `ApiResponse`:

* `status`: `200`

* `data`: `request.body ?? { ok: true }`

* `requestId`: `request.headers["X-Trace-Id"] ?? "local"`

---

Runtime Application Evidence vs Inference
**Direct Evidence:**

* `apiRequest` is exported from `src/api/api-client.ts` and called by `submitReferral` (PATCH `/referrals/:id`) and `recordBooking` (POST `/referrals/:id/booking`) in `src/api/referrals-api.ts`.

* The pipeline executes synchronously through asynchronous middleware functions defined in `src/api/pipeline/`.

**Direct Evidence / Application Reach:**

* The primary application UI stores and updates referral state strictly via local Zustand state (`src/store/useClinicStore.ts`).

* Neither `submitReferral` nor `recordBooking` are called from `useClinicStore.ts` or any React components in `src/pages/` or `src/components/`. The pipeline exists in the codebase but is not triggered by standard user interactions in the present UI flow.
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
**`checkAppointment` does change state.** Despite its name suggesting a pure/read-only validation function, it performs both direct mutation and event-driven state updates.

---

How `checkAppointment` Changes State

#### 1. In-place Mutation of Clinician Slot Data

In [`src/triage/validation.ts`](src/triage/validation.ts), after verifying eligibility and slot availability, `checkAppointment` mutates the clinician's slot object in place:

```ts

slot.bookedReferralId = referral.id;

```

Because the `clinician` passed into `checkAppointment` from the store (`useClinicStore.ts` line 118) or tests is a reference to the existing clinician object, this line directly modifies the `bookedReferralId` property of that clinician's slot.

#### 2. Event Emission and Event-Listener State Mutations

`checkAppointment` emits the `"appointment:booked"` event via the `clinicEvents` channel ([`src/triage/validation.ts`](src/triage/validation.ts)):

```ts

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

```

This triggers two global event listeners registered at runtime import:

1. **`src/scheduling/eventListener.ts`**: Adds the `slotId` to the `recentlyBooked` `Set`:

```ts

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

2. **`src/audit/logger.ts`**: Unshifts a new `AuditEntry` into the module's internal `eventEntries` array:

```ts

clinicEvents.on("appointment:booked", ({ appointment, patientName }) => {

eventEntries.unshift({ ... });

});

```

---

Application Context & Usage Flow
**Zustand Store (`src/store/useClinicStore.ts`)**: `bookAppointment` calls `checkAppointment(referral, clinician, slotId, state.actor)`, which mutates the clinician slot's `bookedReferralId` prior to Zustand updating its store state (`appointments`, `referrals`, and `clinicians`).
**Automated Tests (`src/tests/scheduling.test.ts`)**: The test suite relies on this state mutation, asserting `expect(slot.bookedReferralId).toBe(referral.id)` immediately after invoking `checkAppointment`.
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
The **`findContinuitySlots`** implementation (defined in `src/scheduling/oldSlotFinder.ts`) runs for a follow-up referral.

Why this implementation runs

When slots are looked up for a referral:

1. **Policy Lookup (`src/config/priorityRules.ts`)**:

`referralPolicies` maps each referral type (`ReferralType`) to its configuration. For `"followUp"`, the policy explicitly sets `finder: "continuity"`:

```ts

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 }

```

2. **Finder Selection (`src/scheduling/service.ts`)**:

In `availableSlots()`, the referral's type is used to resolve the finder key from `referralPolicies[referral.type].finder`:

```ts

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

export function availableSlots(referral: Referral, clinicians: Clinician[]): Slot[] {

const finder = finders[referralPolicies[referral.type].finder];

return finder({

referral,

clinicians,

preferredClinicianId: referral.assignedClinicianId,

});

}

```

Because `referralPolicies["followUp"].finder` resolves to `"continuity"`, `finders["continuity"]` dispatches the slot search directly to `findContinuitySlots`.
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
When the scheduling event **`appointment:booked`** is emitted, two event listeners react. Both are registered on the `clinicEvents` singleton bus (`src/events/channel.ts`) during top-level module import in `src/App.tsx`.

---

1. `src/scheduling/eventListener.ts`
**Reaction**: Listens to `"appointment:booked"` and adds `appointment.slotId` to an in-memory `Set<string>` called `recentlyBooked`.
**State / Runtime Effect**: Updates the set checked by the exported `wasRecentlyBooked(slotId)` helper function. *(Note: While `wasRecentlyBooked` is exported, it is not currently invoked by any UI component or store selector elsewhere in the application).*
2. `src/audit/logger.ts`
**Reaction**: Listens to `"appointment:booked"` and creates a new `AuditEntry` object with:

* `id`: `event-${appointment.id}`

* `action`: `"Appointment booked"`

* `actor`: `appointment.bookedBy`

* `referralId`: `appointment.referralId`

* `detail`: `Booked ${patientName} with clinician ${appointment.clinicianId}`

* `severity`: `"info"`

* `occurredAt`: current ISO timestamp

It prepends this entry to an internal `eventEntries` array.

**State / UI Effect**: The `getEventAudit()` export returns a copy of `eventEntries`. `AuditLogPage` (`src/pages/AuditLogPage.tsx`) invokes `getEventAudit()` inside a `useMemo` hook, combining these event-based log entries with store-managed audit records for rendering in the Audit Log view.

---

How the Event is Triggered

1. A user confirms a slot via `SlotPicker` (`src/components/SlotPicker.tsx`), calling `bookAppointment` in `useClinicStore` (`src/store/useClinicStore.ts`).

2. `useClinicStore.bookAppointment` executes `checkAppointment()` in `src/triage/validation.ts`.

3. After validating eligibility and clinician coverage, `checkAppointment()` calls `clinicEvents.emit("appointment:booked", { appointment, patientName: referral.patient.name })`.

Other Events

The `ClinicEvents` interface (`src/events/types.ts`) also defines `"referral:accepted"` and `"eligibility:failed"`, but no event listeners are registered for either of those events in the codebase.
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
To add a new referral type, the primary definition is updated in the `ReferralType` union type in **`src/types/domain.ts`**.

---

Direct Codebase Changes Required

To fully integrate a new referral type across the application runtime and prevent build/runtime errors, updates are required in the following locations:

#### 1. Type Union Definition

**`src/types/domain.ts`**: Add the new string literal to the `ReferralType` union (`"routine" | "urgent" | "followUp" | "safeguarding"`).

#### 2. Policy & Priority Configuration

**`src/config/priorityRules.ts`**: Add an entry for the new type to `referralPolicies`, which is typed as `Record<ReferralType, ReferralPolicy>`.

* TypeScript will raise a type error if the new type key is missing. The policy must define `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`.

* *Runtime Flow:* `calculateBand` in `src/triage/banding.ts` and `availableSlots` in `src/scheduling/service.ts` index `referralPolicies[referral.type]` directly at runtime.

#### 3. Display Helper

**`src/utils/format.ts`**: Add a key for the new type in `humaniseType(type: ReferralType)`. The record inside `humaniseType` maps `ReferralType` to human-readable strings, so TypeScript will mandate an entry for the new union member.

#### 4. Pathway Route Handler

**`src/triage/routes/`**: Create a new route handler file in the `src/triage/routes/` directory (patterned after existing modules `src/triage/routes/routine.ts`, `src/triage/routes/urgent.ts`, `src/triage/routes/followUp.ts`, and `src/triage/routes/safeguarding.ts`) that calls `registerRoute(type, handler)` from `src/triage/routes/registry.ts`.

* *Runtime Flow:* `loadRoutes` in `src/triage/routes/loadRoutes.ts` dynamically imports all `.ts` files in `src/triage/routes/` (excluding `registry.ts` and `loadRoutes.ts`). When `ReferralDetailPage.tsx` loads, it executes `routeReferral(referral)` from `src/triage/routes/registry.ts`. If no handler is registered for `referral.type`, `routeReferral` throws `No routing handler registered for ${referral.type}`.

#### 5. User Interface & Filtering

**`src/pages/ReferralListPage.tsx`**: Add an `<option>` element for the new type to the pathway `<select>` dropdown (`aria-label="Filter referral type"`), so users can filter the worklist by the new type.
**`src/components/ReferralTable.tsx` & `src/pages/ReferralDetailPage.tsx`**: These components dynamically apply CSS classes using `type-${referral.type}` (e.g., `type-dot.type-${referral.type}` and `type-badge.type-${referral.type}`).
**`src/styles.css`**: Add CSS selectors for `.type-dot.type-<newType>` and `.type-badge.type-<newType>` to set badge and dot styling, matching existing definitions like `.type-dot.type-urgent` or `.type-badge.type-routine`.

#### 6. Route Registry Test

**`src/tests/registry.test.ts`**: Update `registeredRouteCount()` assertion in the test `"loads four handlers dynamically"` from `4` to `5` (or the updated count).

---

Domain-Specific & Contextual Considerations

Depending on the business logic of the new referral type, additional changes may be necessary:

**`src/pages/ReferralListPage.tsx`**: Update the `urgent` metric summary count if the new type should count toward "Time sensitive" referrals (`item.type === "urgent" || item.type === "safeguarding"`).
**`src/triage/eligibility.ts`**: Add custom eligibility checks inside `checkEligibility(referral)` if the new referral type has specialized rules (similar to existing age restrictions for `safeguarding`).
**`src/api/pipeline/redact-stage.ts`**: Add redaction rules to `redactBody(body)` if patient data or clinical notes for the new referral type require privacy masking.
**`src/data/seed.ts`**: Update mock seed data scenarios to include examples of the new type for development and testing.
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
Changing the priority rules (in `src/config/priorityRules.ts`) would directly affect clinical triage scoring, priority band assignment, scheduling strategy dispatches, UI displays, audit severity, and unit tests.

---

Direct Calculation Impact (`src/triage/banding.ts`)

Modifying `priorityRules`, `bandThresholds`, or `referralPolicies` alters `calculateBand(referral)` output:

**Score (`score`)**: Sum of `referralPolicies[referral.type].basePoints` and points from matched `priorityRules`.
**Band (`band`)**: Evaluated against `bandThresholds` (e.g., score $\ge 9 \rightarrow$ `"red"`, $\ge 4 \rightarrow$ `"amber"`, else `"green"`).
**Target hours (`targetHours`)**: Pulled from `referralPolicies[referral.type].targetHours`.
**Matched rules (`matchedRules`)**: Array of matched rule IDs based on `rule.matches(context)`.

---

Affected Application Components & Workflows

#### 1. Scheduling Strategy Dispatch (`src/scheduling/service.ts` & `src/components/SlotPicker.tsx`)

`availableSlots()` looks up `referralPolicies[referral.type].finder` (`"standard"` vs `"continuity"`).
Changing `finder` in policy configuration changes which slot search algorithm executes (`findSlots` in `src/scheduling/slotFinder.ts` vs `findContinuitySlots` in `src/scheduling/oldSlotFinder.ts`), which directly changes available slot results shown in `<SlotPicker />`.

#### 2. Clinical Triage UI (`src/components/PriorityPanel.tsx`)

`<PriorityPanel />` invokes `calculateBand(referral)` to render:

Total calculated score ("Score X").
Target response guidance ("Target response within X hours").
The **Suggested** priority option button tag (`decision.band === band`).
List of matched risk signals under "Signals considered" (`decision.matchedRules`).

#### 3. State Management & Audit Logging (`src/store/useClinicStore.ts`)

When accepting a referral without a manual override (`acceptReferral(id)`):

**Default Priority**: Defaults to `calculateBand(referral).band`.
**Audit Entry Severity**: Sets audit entry severity to `"critical"` if `band === "red"`, otherwise `"info"`.
**Event Emission**: Emits `referral:accepted` via `clinicEvents` containing the assigned `band`.

#### 4. Referral Worklist & Navigation (`src/components/ReferralTable.tsx`, `src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`)

Changing assigned bands downstream updates:

**Table Badges**: Priority pill styling and label (`bandLabel(referral.priority)`) in `<ReferralTable />`.
**Metrics**: The "Time sensitive" metric on the referral workspace page (which counts referrals where `priority === "red"`).
**Filters**: Worklist filtering via `useReferralFilters` when filtering by priority band (`"red" | "amber" | "green" | "unbanded"`).

#### 5. Automated Tests (`src/tests/banding.test.ts` & `src/tests/scheduling.test.ts`)

`src/tests/banding.test.ts` asserts safeguarding referrals evaluate to `"red"`, routine referrals target `336` hours, and signal rule IDs are populated.
`src/tests/scheduling.test.ts` relies on `availableSlots` policy routing.

---

Grounding & Evidence Summary
**Direct Evidence**: `src/config/priorityRules.ts`, `src/triage/banding.ts`, `src/scheduling/service.ts`, `src/components/PriorityPanel.tsx`, `src/store/useClinicStore.ts`, `src/tests/banding.test.ts`.
**Inference**: UI rendering updates (such as metric counters and table pills) rely on state mutations committed when `acceptReferral` persists the calculated priority band into the Zustand store.
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
Yes, safeguarding referrals (`type: "safeguarding"` or `signals.safeguardingConcern: true`) are treated differently across **priority calculation**, **eligibility checks**, **pathway routing**, **API data redaction**, and **UI reporting/styling**.

---

1. Priority Banding and SLA Policy
**Base Points & Response Target**: In `src/config/priorityRules.ts`, `referralPolicies.safeguarding` grants a base score of 8 points (vs 0 for routine, 5 for urgent) and sets the tightest response target of 4 hours (vs 24 for urgent, 336 for routine).
**Clinical Signal Rule**: The `safeguarding-signal` rule in `src/config/priorityRules.ts` adds 10 points whenever `signals.safeguardingConcern` is `true`. In `src/triage/banding.ts`, this score surpasses the minimum threshold of 9 required to assign a `"red"` (Priority 1) band.

---

2. Age-Based Eligibility Validation
**Child Safeguarding Restriction**: In `src/triage/eligibility.ts` (`checkEligibility`), if `referral.type === "safeguarding"` and the patient is under 16 years old (`age < 16`), validation fails with `"Child safeguarding team must coordinate this referral"`.
**Runtime Impact**: This blocks acceptance in `acceptReferral` (`src/store/useClinicStore.ts`) and booking in `checkAppointment` (`src/triage/validation.ts`), emitting an `eligibility:failed` event on `clinicEvents` (`src/events/channel.ts`).

---

3. Dedicated Routing Pathway
**Custom Route Handler**: `src/triage/routes/safeguarding.ts` registers a handler specifically for `"safeguarding"` referrals.
**Pathway Directives**: When dynamically loaded by `loadRoutes()` and rendered on `ReferralDetailPage.tsx`:

* Sets `recommendedService` to `"Community nursing"`.

* Sets `requiresPhoneCall: true`, displaying a warning notice on the detail page.

* Supplies specific contact instructions: `"Do not leave a voicemail"`, `"Check safe contact method"`, and `"Notify safeguarding lead"`.

---

4. API Redaction Pipeline
**Sensitive Field Redaction**: In `src/api/pipeline/redact-stage.ts` (`redactStage`), any outgoing HTTP request via `apiRequest` (`src/api/api-client.ts`) containing a `safeguarding` referral redacts patient contact information before sending:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

---

5. Workspace Metrics & Visual Indicators
**Workspace Metrics**: In `src/pages/ReferralListPage.tsx`, safeguarding referrals are filtered into the **"Time sensitive"** dashboard card alongside `urgent` and `red` priority referrals.
**UI Badging**: In `src/styles.css` (lines 587–589 and 706–708), safeguarding type badges and indicators use red styling (`.type-dot.type-safeguarding`, `.type-badge.type-safeguarding`), matching urgent referrals.
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
A slot is actually booked inside **`checkAppointment()` in `src/triage/validation.ts`**, where the selected slot's property is directly mutated: `slot.bookedReferralId = referral.id`.

---

Step-by-Step Runtime Call Flow

1. **User Action (UI):**

In `SlotPicker` (`src/components/SlotPicker.tsx`), clicking the **Confirm appointment** button triggers `submit()`, which calls `onBook(slot.clinicianId, slot.id)`.

2. **Page Handler:**

`ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) receives `onBook` and invokes `bookAppointment(referral.id, clinicianId, slotId)` from the Zustand store.

3. **Store Dispatch:**

`bookAppointment` in `useClinicStore` (`src/store/useClinicStore.ts`) looks up the `referral` and `clinician` objects from state and delegates validation and slot marking to `checkAppointment()`.

4. **Slot Marking & Validation:**

`checkAppointment` in `src/triage/validation.ts`:

- Validates referral eligibility via `checkEligibility(referral)`.

- Ensures the slot exists, is not already booked, and matches the referral service.

- **Mutates the slot in place:** `slot.bookedReferralId = referral.id`.

- Creates and returns an `Appointment` object (`APT-${Date.now()}`).

- Emits the `appointment:booked` event over `clinicEvents` (`src/events/channel.ts`).

5. **State Updates & Side Effects:**

- **Store (`useClinicStore.ts`):** Updates Zustand state by appending the appointment to `appointments`, updating `referral.status` to `"booked"`, setting `referral.appointmentId` and `referral.assignedClinicianId`, and appending an entry to `audit`.

- **Event Listeners:**

- `src/scheduling/eventListener.ts` listens to `appointment:booked` and adds `appointment.slotId` to `recentlyBooked`.

- `src/audit/logger.ts` listens to `appointment:booked` and prepends an entry to `eventEntries`.

---

Unused/Helper Functions (Distinction)
**`reserveSlot` in `src/scheduling/service.ts`:** An exported function that returns a cloned slot with `bookedReferralId`. It is never called by the store, UI, or tests.
**`recordBooking` in `src/api/referrals-api.ts`:** An exported API request helper, but not called anywhere in the active application code.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

