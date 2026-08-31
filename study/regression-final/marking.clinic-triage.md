# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: b74296699a923a0fa26091567015f2e7c88ba4d134b483f807e3d09693b15ab6 -->

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
Execution starts at **`index.html`**, which serves as the entry point for the Vite bundler. It loads the main TypeScript entry file, **`src/main.tsx`**.

---

Detailed Execution Flow

#### 1. HTML Entry Point

The browser or bundler starts by reading `index.html`, which contains a container `div` with the ID `root` and a script tag pointing to the main application code:

```html

<div id="root"></div>

<script type="module" src="/src/main.tsx"></script>

```

**Direct Evidence:** `index.html` (lines 1-3)

#### 2. React Application Mounting

Once `src/main.tsx` is loaded, it imports React, ReactDOM, the global styles, and the root `App` component. It then mounts the React application into the DOM container:

```typescript

import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(

<React.StrictMode>

<App />

</React.StrictMode>,

);

```

**Direct Evidence:** `src/main.tsx` (lines 1-11)

#### 3. Root Component and Side Effects

When the `<App />` component is evaluated, it sets up the routing using `react-router-dom` and triggers two immediate side-effect imports that run initialization code:

`import "./scheduling/eventListener";` (which registers a listener on the global event channel).
`import "./audit/logger";` (which registers another listener on the global event channel).
**Direct Evidence:** `src/App.tsx` (lines 1-24)
**Control Flow Trace:**

* `src/App.tsx` imports `src/scheduling/eventListener.ts` and `src/audit/logger.ts`.

* `src/scheduling/eventListener.ts` (lines 1-9) imports `clinicEvents` from `src/events/channel.ts` and registers a listener for `"appointment:booked"`.

* `src/audit/logger.ts` (lines 1-18) imports `clinicEvents` from `src/events/channel.ts` and registers a listener for `"appointment:booked"`.

#### 4. Tooling Entry (Development & Build)

From a development and build perspective, execution is managed by **Vite** (configured in `vite.config.ts`). The scripts in `package.json` define how to start the development server or build the production assets:

`npm run dev` runs `vite` to start the local development server.
`npm run build` runs `tsc -b && vite build` to compile TypeScript and bundle the application.
**Direct Evidence:** `package.json` (lines 5-10) and `vite.config.ts` (lines 1-5)
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
A referral is assigned its priority band (**red/Priority 1**, **amber/Priority 2**, or **green/Priority 3**) through an **automated rule-based scoring system** that calculates a suggested band, which can then be **manually selected or overridden** by a user during the triage acceptance process.

---

1. Automated Priority Band Calculation

The automated priority band is calculated by the `calculateBand` function in `src/triage/banding.ts`. It computes a numerical score based on the referral's type and clinical signals, then maps that score to a band threshold.

#### Step A: Base Points

Every referral type starts with a base score defined in `referralPolicies` (`src/config/priorityRules.ts`):

**Safeguarding**: 8 points
**Urgent**: 5 points
**Follow-up**: 1 point
**Routine**: 0 points

#### Step B: Rule Matching & Points Accumulation

The system evaluates the referral's clinical signals against a list of `priorityRules` (`src/config/priorityRules.ts`). If a rule matches, its points are added to the total score:

**Safeguarding concern** (`safeguardingConcern` is true): **+10 points**
**Rapid deterioration** (`deterioration` is true AND `painScore >= 7`): **+7 points**
**Severe pain** (`painScore >= 7`): **+4 points**
**Post-discharge** (`recentDischarge` is true): **+3 points**
**Mobility risk** (`mobilityRisk` is true): **+2 points**
**Persistent symptoms** (`symptomDays > 21`): **+1 point**

#### Step C: Threshold Mapping

The final accumulated score is matched against `bandThresholds` (`src/config/priorityRules.ts`) to determine the suggested band:

**Score $\ge$ 9**: `"red"` (Priority 1)
**Score $\ge$ 4**: `"amber"` (Priority 2)
**Score $\ge$ 0**: `"green"` (Priority 3)

---

2. Manual Selection and Override Flow

While the system calculates a suggested band, the triage coordinator can manually select a different priority band in the user interface.

1. **UI Display**: The `PriorityPanel` component (`src/components/PriorityPanel.tsx`) displays the suggested band (e.g., *"Suggested band: Priority 1"*) alongside buttons for all three priority options.

2. **User Selection**: The user can click any of the priority buttons, which updates the local `priority` state in `ReferralDetailPage.tsx` (`src/pages/ReferralDetailPage.tsx`) via its local `setPriority` state setter.

3. **Acceptance / Update**:

* When the user clicks **"Accept referral"** or **"Update priority"**, the `onAccept` handler in `ReferralDetailPage.tsx` is triggered.

* This calls the store action `acceptReferral(referral.id, priority)` (`src/store/useClinicStore.ts`), passing the selected priority band as an override.

* The store updates the referral's status to `"accepted"` and sets its `priority` property to the chosen band.

*(Note: While `useClinicStore.ts` defines a `setPriority` action, direct evidence shows it is not called by the user interface in `ReferralDetailPage.tsx`; instead, priority updates are committed via the `acceptReferral` action).*

---

Project Context Citations
**Scoring and Threshold Definitions**: `src/config/priorityRules.ts`
**Calculation Logic**: `src/triage/banding.ts` (specifically the `calculateBand` function)
**Store State & Actions (`acceptReferral`)**: `src/store/useClinicStore.ts`
**Triage Detail Page & Action Dispatching**: `src/pages/ReferralDetailPage.tsx`
**Priority Selection Panel**: `src/components/PriorityPanel.tsx`
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
How a given referral type is processed is decided across several key modules in the codebase, depending on whether the processing involves **routing pathways**, **scheduling policies**, **priority banding**, **eligibility checks**, or **data redaction**.

Here is the exact breakdown of the code responsible for processing different referral types:

---

1. Routing Guidance and Pathway Recommendations

The recommended clinical pathway, instructions, and whether a phone call is required for a referral are determined by **routing handlers** registered per referral type.

**Registry and Dispatcher (`src/triage/routes/registry.ts`):**

The `routeReferral(referral)` function retrieves and executes the registered handler matching `referral.type`:

```typescript

export function routeReferral(referral: Referral): RouteOutcome {

const handler = handlers.get(referral.type);

if (!handler)

throw new Error(`No routing handler registered for ${referral.type}`);

return handler(referral);

}

```

**Dynamic Loader (`src/triage/routes/loadRoutes.ts`):**

Dynamically imports all route files in the directory to register them using Vite's `import.meta.glob`.

**Type-Specific Handlers:**

* **Routine (`src/triage/routes/routine.ts`):** Registers the `"routine"` handler, setting a standard pathway with no phone call required.

* **Urgent (`src/triage/routes/urgent.ts`):** Registers the `"urgent"` handler, requiring a phone call and contact within two hours.

* **Follow-up (`src/triage/routes/followUp.ts`):** Registers the `"followUp"` handler, preferring the previous care team with no phone call required.

* **Safeguarding (`src/triage/routes/safeguarding.ts`):** Registers the `"safeguarding"` handler, recommending "Community nursing", requiring a phone call, and providing restricted contact instructions.

---

2. Scheduling and Slot Finding Policy

The scheduling system decides how to search for available appointment slots based on the referral type's policy.

**Policy Definition (`src/config/priorityRules.ts`):**

The `referralPolicies` map defines the base points, target response hours, and the slot finder strategy (`standard` vs. `continuity`) for each type:

```typescript

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

routine: { basePoints: 0, finder: "standard", targetHours: 336 },

urgent: { basePoints: 5, finder: "standard", targetHours: 24 },

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

safeguarding: { basePoints: 8, finder: "standard", targetHours: 4 },

};

```

**Slot Finder Selection (`src/scheduling/service.ts`):**

The `availableSlots` function uses the policy to select the appropriate finder algorithm (`findSlots` defined in `src/scheduling/slotFinder.ts` or `findContinuitySlots` defined in `src/scheduling/oldSlotFinder.ts`):

```typescript

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

---

3. Clinical Banding and Priority Scoring

The clinical priority band (Red, Amber, Green) is calculated using the referral type's base points.

**Banding Calculator (`src/triage/banding.ts`):**

The `calculateBand(referral)` function retrieves the base points and target hours from the referral type's policy and adds points from matched clinical rules:

```typescript

const score =

referralPolicies[referral.type].basePoints +

matched.reduce((total, rule) => total + rule.points, 0);

```

---

4. Eligibility Validation

Specific validation rules are applied depending on the referral type.

**Eligibility Checker (`src/triage/eligibility.ts`):**

Enforces that safeguarding referrals for patients under 16 years old must be handled by a child safeguarding team:

```typescript

if (referral.type === "safeguarding" && age < 16)

reasons.push("Child safeguarding team must coordinate this referral");

```

---

5. API Request Redaction

Sensitive patient information is processed and redacted differently depending on the referral type before being sent over the network.

**Redaction Pipeline Stage (`src/api/pipeline/redact-stage.ts`):**

If a referral is of type `"safeguarding"`, its clinical notes, phone number, and postcode are automatically restricted:

```typescript

function redactBody(body: unknown): unknown {

const referral = body as Partial<Referral> | undefined;

if (!referral || referral.type !== "safeguarding" || !referral.patient)

return body;

return {

...referral,

notes: "[restricted clinical note]",

patient: {

...referral.patient,

phone: "[safe contact required]",

postcode: "[restricted]",

},

};

}

```

---

Direct Evidence vs. Inference
**Direct Evidence:** The exact code paths, conditional checks on `referral.type`, and mapping objects (`referralPolicies`, `handlers`) are explicitly defined in the cited files.
**Inference:** We infer that these modules represent the complete set of business logic processing differences for referral types, as no other files in the provided context perform conditional logic on `referral.type` (other than UI rendering and filtering in `src/pages/ReferralListPage.tsx`, `src/components/ReferralTable.tsx`, and `src/hooks/useReferralFilters.ts`).
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
Based on the repository files, eligibility is checked directly using the `checkEligibility` function (defined in `src/triage/eligibility.ts`) in three distinct places. There are also several indirect entry points (UI pages, background jobs, and tests) that trigger these checks.

Here is the complete list of every place where eligibility is checked:

1. Direct Invocations of `checkEligibility`
**Referral Acceptance Flow**

* **File:** `src/store/useClinicStore.ts`

* **Context:** Inside the `acceptReferral` action, `checkEligibility(referral)` is called. If the referral is ineligible, an `"eligibility:failed"` event is emitted and an error is thrown, preventing the referral from being accepted.

**Appointment Booking Validation**

* **File:** `src/triage/validation.ts`

* **Context:** Inside the `checkAppointment` function, `checkEligibility(referral)` is called. If the referral is ineligible, an `"eligibility:failed"` event is emitted and an error is thrown, preventing the appointment from being booked.

**Nightly Reverification Job**

* **File:** `src/jobs/nightlyReverification.ts`

* **Context:** Inside `runNightlyReverification`, the system loops through all referrals with a status of `"accepted"` or `"booked"` and calls `checkEligibility(referral)` on each. If any fail, an `"eligibility:failed"` event is emitted.

---

2. Indirect Triggers (UI and Governance Actions)

These components and functions do not call `checkEligibility` directly, but they invoke the actions or jobs listed above:

**Audit Log Page (Manual Reverification Trigger)**

* **File:** `src/pages/AuditLogPage.tsx`

* **Context:** The "Run eligibility check" button calls the `verify` function, which executes `runNightlyReverification(referrals)` to check the eligibility of all accepted and booked referrals.

**Referral Detail Page (Triage Actions)**

* **File:** `src/pages/ReferralDetailPage.tsx`

* **Context:**

* Clicking "Accept referral" triggers `onAccept`, which calls `acceptReferral` (triggering the acceptance eligibility check).

* Clicking "Confirm appointment" triggers `onBook`, which calls `bookAppointment` (triggering the booking eligibility check via `checkAppointment` in `useClinicStore.ts`).

---

3. Test Suites
**Eligibility Tests**

* **File:** `src/tests/eligibility.test.ts`

* **Context:** Tests call `acceptReferral` to assert that out-of-area postcodes and missing registered practices are correctly flagged as ineligible.

**Scheduling Tests**

* **File:** `src/tests/scheduling.test.ts`

* **Context:** Tests call `checkAppointment` to verify booking logic, which runs the eligibility check internally.
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
When an outgoing API request is initiated via `apiRequest`, it passes through a composed pipeline of three middleware stages before reaching a mock network transport layer.

Because the pipeline is composed using `reduceRight` (`src/api/api-client.ts`), the stages execute in the order they are defined in the `stages` array: **`traceStage`** $\rightarrow$ **`authStage`** $\rightarrow$ **`redactStage`** $\rightarrow$ **`transport`**.

Here is exactly what happens to the request at each step:

---

1. Initialization

When a caller invokes `apiRequest` (such as `submitReferral` or `recordBooking` in `src/api/referrals-api.ts`), the function ensures that the `headers` object is initialized (defaulting to `{}` if undefined) before passing it to the composed pipeline (`src/api/api-client.ts`).

2. Trace Stage (`traceStage`)

The request first enters `traceStage`, which:

Generates a unique trace ID string using the current timestamp and a random hex string:

```typescript

const traceId = `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;

```

Appends this trace ID to the request headers as `"X-Trace-Id"`.
Passes the modified request to the next stage by calling `next(request)`.

*Source: `src/api/pipeline/trace-stage.ts`*

3. Auth Stage (`authStage`)

The request then enters `authStage`, which enriches the request headers with hardcoded session credentials:

Adds `Authorization: "Bearer clinic-session"`.
Adds `"X-Staff-Role": "triage"`.
Passes the modified request to the next stage by calling `next(enriched)`.

*Source: `src/api/pipeline/auth-stage.ts`*

4. Redact Stage (`redactStage`)

The request enters `redactStage`, which inspects the request body. If the body represents a safeguarding referral, it redacts sensitive clinical and demographic information:

**Trigger Condition**: The body must be a referral where `type === "safeguarding"` and a `patient` object is present.
**Redactions Applied**:

* `notes` is replaced with `"[restricted clinical note]"`

* `patient.phone` is replaced with `"[safe contact required]"`

* `patient.postcode` is replaced with `"[restricted]"`

If the condition is not met, the body remains untouched.
Passes the modified request to the final transport layer by calling `next(...)`.

*Source: `src/api/pipeline/redact-stage.ts`*

5. Transport Layer (`transport`)

Finally, the request reaches the `transport` function, which acts as the mock network sender. It immediately resolves a promise containing:

A status of `200`.
The request body (or `{ ok: true }` if no body was provided).
The `requestId` extracted from the `"X-Trace-Id"` header (defaulting to `"local"` if missing).

*Source: `src/api/api-client.ts`*

---

Project Context & Evidence
**Direct Evidence of Pipeline Composition & Order**: `src/api/api-client.ts` defines `stages = [traceStage, authStage, redactStage]` and uses `stages.reduceRight` to compose them around `transport`. This mathematically results in a left-to-right execution order (`traceStage` runs first, calling `next` which is `authStage`, and so on).
**Direct Evidence of Header Modifications**: `src/api/pipeline/trace-stage.ts` and `src/api/pipeline/auth-stage.ts` explicitly copy and append properties to `request.headers`.
**Direct Evidence of Body Redaction**: `src/api/pipeline/redact-stage.ts` explicitly checks `referral.type === "safeguarding"` and returns a shallow-copied object with overwritten sensitive fields.
**Inference**: The comment `// TODO: Replace the temporary gateway token when the regional identity programme completes.` in `src/api/api-client.ts` combined with the mock `transport` resolving immediately suggests that this pipeline currently runs entirely client-side/in-memory and does not make real HTTP requests yet.
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
Yes, **`checkAppointment` does change state**. Despite its name suggesting a read-only validation check, it performs in-place mutations on the clinical data and triggers side-effect events that modify external state.

---

Supporting Evidence & Code Flow

#### 1. In-Place Mutation of the Clinician's Slot

In `src/triage/validation.ts`, the function directly mutates the `slot` object belonging to the passed-in `clinician` parameter:

```typescript

// src/triage/validation.ts (Lines 34-35)

slot.bookedReferralId = referral.id;

clinicEvents.emit("appointment:booked", {

```

#### 2. Integration with the Zustand Store

In `src/store/useClinicStore.ts`, the `bookAppointment` action retrieves a `clinician` reference directly from the store's state and passes it to `checkAppointment`. Because JavaScript passes objects by reference, mutating the `slot` inside `checkAppointment` directly modifies the clinician data inside the Zustand store before the store's `set` function is called:

```typescript

// src/store/useClinicStore.ts (Lines 102-114)

bookAppointment: (referralId, clinicianId, slotId) => {

const state = get();

const referral = state.referrals.find((item) => item.id === referralId);

const clinician = state.clinicians.find((item) => item.id === clinicianId);

if (!referral || !clinician)

throw new Error("Referral or clinician not found");

const appointment = checkAppointment(

referral,

clinician, // <-- Passed by reference

slotId,

state.actor,

);

```

#### 3. Event Emission Side-Effects

`checkAppointment` dispatches global events via the `clinicEvents` channel (`src/events/channel.ts`), which changes external state managed by active event listeners:

**On success:** Emits `"appointment:booked"` (`src/triage/validation.ts`, line 36). This is consumed by:

* The audit logger in `src/audit/logger.ts` to append a new entry to the in-memory `eventEntries` array.

* The recently-booked cache in `src/scheduling/eventListener.ts` to add the slot ID to the `recentlyBooked` Set.

**On failure:** Emits `"eligibility:failed"` (`src/triage/validation.ts`, line 14).

#### 4. Test Verification

The test suite in `src/tests/scheduling.test.ts` explicitly asserts this state-changing behavior:

```typescript

// src/tests/scheduling.test.ts (Lines 14-26)

it("books an available slot while checking it", () => {

const referral = structuredClone(seedReferrals[0]);

const clinicians = structuredClone(seedClinicians);

const slot = availableSlots(referral, clinicians)[0];

const clinician = clinicians.find((item) => item.id === slot.clinicianId)!;

const appointment = checkAppointment(

referral,

clinician,

slot.id,

"Tester",

);

expect(appointment.slotId).toBe(slot.id);

expect(slot.bookedReferralId).toBe(referral.id); // <-- Asserts that the slot state was mutated

});

```
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
For a follow-up referral, the slot-finding implementation that runs is **`findContinuitySlots`** (defined in `src/scheduling/oldSlotFinder.ts`).

---

Why `findContinuitySlots` Runs (Control Flow Trace)

1. **Resolution in `availableSlots`**:

When looking up slots for a referral, the application calls `availableSlots(referral, clinicians)` in `src/scheduling/service.ts`. This function resolves the finder function using:

```typescript

const finder = finders[referralPolicies[referral.type].finder];

```

*(Source: `src/scheduling/service.ts`)*

2. **Policy Configuration**:

For a follow-up referral, the `referral.type` is `"followUp"` (defined in `src/types/domain.ts`).

In `src/config/priorityRules.ts`, the `referralPolicies` mapping defines the policy for `"followUp"` as:

```typescript

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

// ...

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

// ...

};

```

*(Source: `src/config/priorityRules.ts`)*

3. **Finder Mapping**:

In `src/scheduling/service.ts`, the `"continuity"` key is mapped directly to `findContinuitySlots`:

```typescript

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

```

*(Source: `src/scheduling/service.ts`)*

---

Why This Implementation is Chosen (Clinical/Functional Reason)

The `findContinuitySlots` implementation is specifically designed to support **continuity of care** for patients on a follow-up pathway:

**Preferred Clinician Sorting**: Unlike the standard `findSlots` implementation (defined in `src/scheduling/slotFinder.ts`), which only filters by service and availability, `findContinuitySlots` sorts the clinicians to prioritize the patient's preferred clinician (`referral.assignedClinicianId`):

```typescript

.sort(

(a, b) =>

Number(b.id === preferredClinicianId) -

Number(a.id === preferredClinicianId),

)

```

*(Source: `src/scheduling/oldSlotFinder.ts`)*

**Alignment with Routing Guidance**: This matches the clinical routing instructions for follow-ups defined in `src/triage/routes/followUp.ts`, which explicitly state to **"Prefer the previous care team"**.
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
When the primary scheduling event—the `"appointment:booked"` event—is emitted, two distinct listeners react to it. Both are registered at application startup because they are imported as side-effect modules in `src/App.tsx` (lines 7-8).

Here is exactly what reacts and how:

1. The Audit Logger (`src/audit/logger.ts`)
**Reaction:** It prepends a new audit entry to an in-memory array (`eventEntries`).
**Details:** The entry captures the appointment details, the patient's name, the clinician's ID, the actor who booked it, and sets the severity to `"info"`.
**Consumer:** These logs are retrieved via `getEventAudit()` and merged with the store's audit logs to be displayed on the **Audit Log** page (`src/pages/AuditLogPage.tsx`, lines 14-26).
**Code Evidence:**

```typescript

// src/audit/logger.ts, lines 4-14

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

2. The Recently Booked Cache (`src/scheduling/eventListener.ts`)
**Reaction:** It adds the booked slot's ID to a local `Set` called `recentlyBooked`.
**Details:** This tracking exposes an exported helper function `wasRecentlyBooked(slotId)` to check if a slot was recently booked during the current session.
**Usage Note (Inference):** Although `wasRecentlyBooked` is defined and exported, direct evidence shows it is **not imported or used** anywhere else in the provided codebase.
**Code Evidence:**

```typescript

// src/scheduling/eventListener.ts, lines 3-6

const recentlyBooked = new Set<string>();

clinicEvents.on("appointment:booked", ({ appointment }) => {

recentlyBooked.add(appointment.slotId);

});

```

---

Control Flow & Context

1. **Triggering Action:** A user clicks "Confirm appointment" in the `SlotPicker` component (`src/components/SlotPicker.tsx`, line 89), which calls the `onBook` callback passed from `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`, lines 68-72).

2. **Store Action:** This triggers the `bookAppointment` action in the Zustand store (`src/store/useClinicStore.ts`, lines 114-121).

3. **Validation & Emission:** The store action calls `checkAppointment` (`src/triage/validation.ts`, lines 34-37), which validates eligibility and slot availability. Once successful, it calls `clinicEvents.emit("appointment:booked", ...)` to trigger the listeners.
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
To add a new referral type to the application, you must define it in the domain types and update the configuration, formatting, routing, and UI files to prevent TypeScript compilation errors and ensure correct runtime behavior.

---

1. Where to Add the New Referral Type

The new type must be added to the `ReferralType` union type in **`src/types/domain.ts`**:

```typescript

export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "yourNewType";

```

---

2. Required Changes

#### A. Referral Policies Configuration

In **`src/config/priorityRules.ts`**, `referralPolicies` is typed as `Record<ReferralType, ReferralPolicy>`. You must define a policy for the new type, specifying its `basePoints`, slot finder strategy (`"standard"` or `"continuity"`), and `targetHours`:

```typescript

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

// ... existing policies

yourNewType: { basePoints: 2, finder: "standard", targetHours: 72 },

};

```

#### B. Humanisation / Formatting

In **`src/utils/format.ts`**, the `humaniseType` function maps the type to a display string. You must add a mapping for the new type to avoid TypeScript compilation errors:

```typescript

export function humaniseType(type: ReferralType): string {

return {

routine: "Routine",

urgent: "Urgent",

followUp: "Follow-up",

safeguarding: "Safeguarding",

yourNewType: "Your New Type Label",

}[type];

}

```

#### C. Routing Guidance Registration

In **`src/triage/routes/registry.ts`**, `routeReferral` retrieves a registered handler for the referral type. If none is registered, it throws an error:

```typescript

const handler = handlers.get(referral.type);

if (!handler)

throw new Error(`No routing handler registered for ${referral.type}`);

```

To prevent this, you must create a new routing file in the **`src/triage/routes/`** directory (following the pattern of existing files like **`src/triage/routes/routine.ts`** or **`src/triage/routes/urgent.ts`**) that registers a handler for the new type:

```typescript

import { registerRoute } from "./registry";

registerRoute("yourNewType", (referral) => ({

summary: "Summary of the new pathway",

recommendedService: referral.service,

requiresPhoneCall: false,

instructions: [

"Instruction 1",

"Instruction 2",

],

}));

```

*Note: This file will be automatically loaded at runtime by **`src/triage/routes/loadRoutes.ts`** via `import.meta.glob`.*

#### D. UI Filters and Metrics

In **`src/pages/ReferralListPage.tsx`**, add a new `<option>` to the "Filter referral type" dropdown:

```tsx

<select

aria-label="Filter referral type"

value={filters.type}

onChange={(event) =>

filters.setType(event.target.value as typeof filters.type)

}

>

<option value="all">All pathways</option>

{/* ... existing options */}

<option value="yourNewType">Your New Type Label</option>

</select>

```

If the new type is considered time-sensitive (similar to `urgent` and `safeguarding`), you should also update the `urgent` metric calculation in **`src/pages/ReferralListPage.tsx`**:

```typescript

const urgent = referrals.filter(

(item) =>

item.priority === "red" ||

item.type === "urgent" ||

item.type === "safeguarding" ||

item.type === "yourNewType",

).length;

```

#### E. CSS Styles

The application dynamically generates class names for type indicators in **`src/components/ReferralTable.tsx`** (`clsx("type-dot", `type-${referral.type}`)`) and **`src/pages/ReferralDetailPage.tsx`** (`clsx("type-badge", `type-${referral.type}`)`). You should add corresponding styles in **`src/styles.css`**:

```css

.type-dot.type-yourNewType {

background: #your-color;

}

.type-badge.type-yourNewType {

color: #your-text-color;

background: #your-bg-color;

}

```

---

3. Optional / Conditional Changes
**Eligibility Rules (`src/triage/eligibility.ts`)**: If the new type has specific age, location, or status restrictions, add them to `checkEligibility`.
**API Redaction (`src/api/pipeline/redact-stage.ts`)**: If the new type contains sensitive data that needs to be redacted before sending to the API (similar to how `safeguarding` restricts notes, phone, and postcode), update `redactBody`.
**Seed Data (`src/data/seed.ts`)**: To test the new type in development, add a scenario using the new type string to the `scenarios` array.
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
If the priority rules (defined as `priorityRules`, `bandThresholds`, or `referralPolicies` in `src/config/priorityRules.ts`) were to change, the following areas of the application would be affected:

1. Clinical Banding Calculations
**File:** `src/triage/banding.ts`
**Direct Evidence:** The `calculateBand(referral)` function imports `priorityRules`, `bandThresholds`, and `referralPolicies` directly.
**Control/Data Flow:**

* It filters `priorityRules` to find matches against the referral's clinical signals (`referral.signals`).

* It sums the matched rules' points with the policy's `basePoints` (from `referralPolicies`) to calculate a total `score`.

* It maps this score to a `PriorityBand` ("red", "amber", or "green") using `bandThresholds`.

* It returns a `BandingDecision` containing the calculated `band`, `score`, `matchedRules` (rule IDs), and `targetHours`.

**Impact:** Any change to rule points, matching logic, thresholds, or base points will directly alter the resulting `band`, `score`, `matchedRules`, and `targetHours` returned by this function.
2. Referral Acceptance and State Management
**File:** `src/store/useClinicStore.ts`
**Direct Evidence:** The `acceptReferral(id, override)` action in the Zustand store calls `calculateBand(referral)` to determine the default priority band if no manual override is provided:

```typescript

const band = override ?? calculateBand(referral).band;

```

**Impact:**

* **State Update:** The referral's `priority` property in the store is updated to this calculated `band`.

* **Audit Severity:** The severity of the generated audit log entry is determined by the band (assigned as `"critical"` if the band is `"red"`, otherwise `"info"`).

* **Event Emission:** The store emits a `"referral:accepted"` event containing the assigned `band` via `clinicEvents.emit`. *(Inference: While `src/events/types.ts` defines this event, there are no active listeners for `"referral:accepted"` in the current codebase; however, any future or external consumers of this event channel would receive the modified band).*

3. Scheduling and Slot Finding
**File:** `src/scheduling/service.ts`
**Direct Evidence:** The `availableSlots(referral, clinicians)` function imports `referralPolicies` to determine which slot finder strategy to use:

```typescript

const finder = finders[referralPolicies[referral.type].finder];

```

**Impact:** If the `finder` key (e.g., `"standard"` or `"continuity"`) associated with a `ReferralType` in `referralPolicies` is changed, the scheduling system will use a different slot-finding algorithm (`findSlots` in `src/scheduling/slotFinder.ts` vs. `findContinuitySlots` in `src/scheduling/oldSlotFinder.ts`).
4. UI Components and Filtering
**Priority Panel (`src/components/PriorityPanel.tsx`):**

* Calls `calculateBand(referral)` to display the suggested band, the calculated score, and the target response hours.

* Renders a list of "Signals considered" by mapping over `decision.matchedRules`. If the rule IDs in `priorityRules` change, the text labels displayed here (derived from rule IDs via `rule.replaceAll("-", " ")`) will change.

**Referral List & Metrics (`src/pages/ReferralListPage.tsx`):**

* The "Time sensitive" metric counts referrals where `item.priority === "red"` (alongside urgent/safeguarding types). If a rule change causes fewer or more referrals to be banded as "red", this metric will change.

**Filtering (`src/hooks/useReferralFilters.ts`):**

* Referrals are filtered by their assigned priority band (`band` filter). Changes in calculated bands will alter which referrals appear under "Priority 1", "Priority 2", or "Priority 3" filters.

**Referral Table (`src/components/ReferralTable.tsx`):**

* Displays the priority pill (`priority-red`, `priority-amber`, `priority-green`) based on the referral's assigned priority.

5. Test Suites
**File:** `src/tests/banding.test.ts`
**Direct Evidence:** This test suite directly asserts the behavior of `calculateBand`.
**Impact:**

* The test `"gives safeguarding work the highest band"` expects a safeguarding referral to resolve to `"red"`.

* The test `"returns a target derived from policy"` expects a routine referral to have a target of `336` hours.

* The test `"records matched rules for explainability"` expects at least one matched rule for a deteriorating referral.

* If rules, thresholds, or policies are modified, these assertions may fail and will require updates to match the new business logic.
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
Yes, safeguarding referrals are treated differently across several parts of the application, including eligibility validation, priority banding, routing pathways, API request redaction, UI metrics, and styling.

Here is where and how they are treated differently:

1. Eligibility Validation

In **`src/triage/eligibility.ts`** (lines 20–21), safeguarding referrals have an additional age-based restriction. If the patient is under 16 years old, the referral is marked ineligible:

```typescript

if (referral.type === "safeguarding" && age < 16)

reasons.push("Child safeguarding team must coordinate this referral");

```

**Usage:** This eligibility check is executed during referral acceptance in `useClinicStore.ts` (line 47), during appointment booking in `validation.ts` (line 10), and during nightly reverification in `nightlyReverification.ts` (line 19).
2. Priority Banding and Policies

In **`src/config/priorityRules.ts`**, safeguarding referrals are configured with the highest base priority points and the shortest target response time:

**Referral Policy:** Under `referralPolicies` (line 31), safeguarding has a `basePoints` of `8` and a `targetHours` of only `4` hours (compared to 24 hours for urgent and 336 hours for routine).
**Priority Rules:** The rule `safeguarding-signal` (lines 38–43) matches when `safeguardingConcern` is true, adding `10` points and suggesting a `"red"` (Priority 1) band.
**Usage:** These rules are evaluated in `src/triage/banding.ts` (lines 16–28) to calculate the priority band of a referral.
3. Routing Pathway and Instructions

In **`src/triage/routes/safeguarding.ts`** (lines 1–12), a dedicated routing handler is registered for safeguarding referrals. It enforces strict clinical and communication guidelines:

It recommends `"Community nursing"` as the service.
It sets `requiresPhoneCall: true`.
It adds specific safety instructions:

* *"Do not leave a voicemail"*

* *"Check safe contact method"*

* *"Notify safeguarding lead"*

**Usage:** This route is dynamically loaded via `src/triage/routes/loadRoutes.ts` and resolved in `src/pages/ReferralDetailPage.tsx` (line 31) to display recommended pathways.
4. API Request Redaction (Data Privacy)

In **`src/api/pipeline/redact-stage.ts`** (lines 3–18), an API middleware stage intercepts outgoing requests and redacts sensitive patient details specifically for safeguarding referrals to protect patient safety:

```typescript

function redactBody(body: unknown): unknown {

const referral = body as Partial<Referral> | undefined;

if (!referral || referral.type !== "safeguarding" || !referral.patient)

return body;

return {

...referral,

notes: "[restricted clinical note]",

patient: {

...referral.patient,

phone: "[safe contact required]",

postcode: "[restricted]",

},

};

}

```

**Usage:** This stage is composed into the API client pipeline in `src/api/api-client.ts` (lines 17–18) and executes on all outgoing requests made via `apiRequest`.
5. UI Metrics

In **`src/pages/ReferralListPage.tsx`** (lines 10–15), safeguarding referrals are automatically grouped into the "Time sensitive" metric alongside urgent and red-priority referrals:

```typescript

const urgent = referrals.filter(

(item) =>

item.priority === "red" ||

item.type === "urgent" ||

item.type === "safeguarding",

).length;

```

6. UI Styling

In **`src/styles.css`**, safeguarding referrals receive distinct red styling in lists and detail badges:

Lines 618–621 style the type indicator dot with a red background:

```css

.type-dot.type-urgent,

.type-dot.type-safeguarding {

background: #c65358;

}

```

Lines 815–819 style the type badge with red text and a light red background:

```css

.type-badge.type-urgent,

.type-badge.type-safeguarding {

color: #9d3b42;

background: #faeaeb;

}

```
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
A slot is actually booked in **`src/triage/validation.ts`** inside the **`checkAppointment`** function, where the slot's `bookedReferralId` property is mutated to store the referral's ID.

---

Detailed Control & Data Flow

#### 1. UI Trigger

In **`src/components/SlotPicker.tsx`**, when a user clicks the "Confirm appointment" button, the `submit` function is executed. This triggers the `onBook` callback prop with the selected clinician and slot IDs:

```typescript

// src/components/SlotPicker.tsx

onBook(slot.clinicianId, slot.id);

```

#### 2. Page Handler

In **`src/pages/ReferralDetailPage.tsx`**, the `onBook` prop passed to `<SlotPicker />` is defined as:

```typescript

// src/pages/ReferralDetailPage.tsx

const onBook = (clinicianId: string, slotId: string) => {

book(referral.id, clinicianId, slotId);

setMessage("Appointment confirmed. The referral record has been updated.");

setShowBooking(false);

};

```

Here, `book` is the `bookAppointment` action retrieved from the global Zustand store (`useClinicStore`).

#### 3. Store Action

In **`src/store/useClinicStore.ts`**, the `bookAppointment` action retrieves the corresponding `referral` and `clinician` records and delegates the validation and booking logic to `checkAppointment`:

```typescript

// src/store/useClinicStore.ts

bookAppointment: (referralId, clinicianId, slotId) => {

const state = get();

const referral = state.referrals.find((item) => item.id === referralId);

const clinician = state.clinicians.find((item) => item.id === clinicianId);

if (!referral || !clinician)

throw new Error("Referral or clinician not found");

const appointment = checkAppointment(

referral,

clinician,

slotId,

state.actor,

);

// ... updates state with the new appointment and sets referral status to "booked"

}

```

#### 4. Actual Booking Mutation

In **`src/triage/validation.ts`**, the `checkAppointment` function performs eligibility and availability checks, creates the `Appointment` object, and directly mutates the clinician's slot to mark it as booked:

```typescript

// src/triage/validation.ts

export function checkAppointment(

referral: Referral,

clinician: Clinician,

slotId: string,

actor: string,

): Appointment {

// ... eligibility and availability checks ...

const slot = clinician.slots.find((candidate) => candidate.id === slotId);

if (!slot) throw new Error("The selected slot does not exist");

if (slot.bookedReferralId)

throw new Error("The selected slot is no longer available");

// ... (creates appointment object) ...

// Actual booking mutation:

slot.bookedReferralId = referral.id;

// Emits event to notify listeners (e.g., the audit logger)

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

return appointment;

}

```

*(Note: While `src/scheduling/service.ts` defines a helper function `reserveSlot` that returns a new slot object with `bookedReferralId` set, this function is not imported or used anywhere in the provided codebase.)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

