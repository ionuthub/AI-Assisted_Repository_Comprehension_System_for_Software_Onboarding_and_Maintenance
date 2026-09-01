# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 2dcba60e52764e50d5e59787c60516e687785c43fea043df7cd5689ff93ca891 -->

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
Execution in this project starts at **`index.html`**, which loads **`src/main.tsx`** as an ES module (`index.html`, line 2).

---

Execution Sequence

1. **HTML Document Entry Point**

The browser loads `index.html` (lines 1–3), which defines the `<div id="root"></div>` container and executes the entry module:

```html

<script type="module" src="/src/main.tsx"></script>

```

2. **Module Evaluation & Side Effects**

When `src/main.tsx` (lines 1–11) is loaded, it imports `App` from `src/App.tsx`. Importing `src/App.tsx` (lines 8–9) executes two top-level side-effect imports during module evaluation:

* **`src/scheduling/eventListener.ts`** (lines 1–9): Registers a listener on the `clinicEvents` singleton for `"appointment:booked"` to track recently booked slots in memory.

* **`src/audit/logger.ts`** (lines 1–18): Registers a listener on `clinicEvents` for `"appointment:booked"` to prepend audit entries to an in-memory audit log array.

3. **React Application Mounting**

`src/main.tsx` (lines 6–10) executes `ReactDOM.createRoot` on `document.getElementById("root")` and renders the component tree inside `React.StrictMode`:

```tsx

ReactDOM.createRoot(document.getElementById("root")!).render(

<React.StrictMode>

<App />

</React.StrictMode>,

);

```

4. **Router & Component Initialization**

* **Routing (`src/App.tsx`, lines 10–22)**: `App` initializes React Router (`BrowserRouter`) and sets up top-level routes wrapped in `Layout` (`src/components/Layout.tsx`):

* Index (`/`) renders `ReferralListPage` (`src/pages/ReferralListPage.tsx`)

* `/referrals/:id` renders `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`)

* `/clinicians` renders `ClinicianOverviewPage` (`src/pages/ClinicianOverviewPage.tsx`)

* `/audit` renders `AuditLogPage` (`src/pages/AuditLogPage.tsx`)

* Catch-all (`*`) redirects to `/` via `<Navigate to="/" replace />`

* **State Store Populating (`src/store/useClinicStore.ts`, lines 26–31)**: When Zustand evaluates `useClinicStore.ts`, it initializes in-memory state (`referrals`, `clinicians`, `audit`, `appointments`, and `actor`) by cloning seed data from `src/data/seed.ts` (lines 249–560).

---

Sources & Evidence
**Direct Evidence**: `index.html` (script entry), `src/main.tsx` (DOM mounting), `src/App.tsx` (module imports and route mapping), `src/scheduling/eventListener.ts` and `src/audit/logger.ts` (event subscriptions), `src/store/useClinicStore.ts` (state initial values).
**Inference**: Vite uses `index.html` as the standard application entry point per `vite.config.ts` and `package.json`.
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
A referral is assigned its priority band (`"red"`, `"amber"`, or `"green"`) through an automated scoring calculation that produces a suggested band, which a coordinator then commits or overrides in the UI when accepting or updating the referral.

---

1. Automated Band Scoring (`src/triage/banding.ts`)

The suggested priority band is computed by `calculateBand(referral)` in `src/triage/banding.ts`:

1. **Base Points (`src/config/priorityRules.ts`)**:

Points begin with the base score assigned to `referral.type` in `referralPolicies`:

- `routine`: 0 base points

- `followUp`: 1 base point

- `urgent`: 5 base points

- `safeguarding`: 8 base points

2. **Matched Clinical Signals (`src/config/priorityRules.ts`)**:

`referral.signals` are evaluated against `priorityRules`. All matching rules contribute points:

- `safeguarding-signal` (`+10`): `safeguardingConcern === true`

- `rapid-deterioration` (`+7`): `deterioration === true` AND `painScore >= 7`

- `severe-pain` (`+4`): `painScore >= 7`

- `post-discharge` (`+3`): `recentDischarge === true`

- `mobility` (`+2`): `mobilityRisk === true`

- `persistent-symptoms` (`+1`): `symptomDays > 21`

3. **Threshold Resolution (`src/config/priorityRules.ts`)**:

The total score (base points + sum of matched rule points) is matched against `bandThresholds` (falling back to `"green"` if no threshold is met):

- Score **≥ 9** → `"red"` (Priority 1)

- Score **≥ 4** → `"amber"` (Priority 2)

- Score **≥ 0** → `"green"` (Priority 3)

---

2. User Selection in the UI (`src/components/PriorityPanel.tsx` & `src/pages/ReferralDetailPage.tsx`)
In `src/components/PriorityPanel.tsx`, `PriorityPanel` calls `calculateBand(referral)` to render the total score, matched signals, and the *Suggested* tag.
In `src/pages/ReferralDetailPage.tsx`, local component state `priority` is initialized to `referral?.priority ?? "green"`. Selecting an option in `PriorityPanel` calls `onSelect`, updating this local React state.

---

3. Store Mutation & Event Emission (`src/store/useClinicStore.ts`)

When the user clicks **Accept referral** or **Update priority** in `src/pages/ReferralDetailPage.tsx`:

1. `onAccept` invokes `acceptReferral(referral.id, priority)` on the Zustand clinic store (`src/store/useClinicStore.ts`).

2. `acceptReferral` checks eligibility via `checkEligibility(referral)` (`src/triage/eligibility.ts`). If ineligible, an error is thrown and `eligibility:failed` is emitted.

3. If eligible, `acceptReferral` updates the targeted referral in store state, setting `status: "accepted"` and `priority: band` (using the supplied `priority` argument, or falling back to `calculateBand(referral).band` if called without an override).

4. `acceptReferral` appends an entry to the `audit` store array (`action: "Referral accepted"`, `severity: "critical"` if `band === "red"` else `"info"`).

5. `acceptReferral` emits the `"referral:accepted"` event containing `{ referralId, band, actor }` via `clinicEvents` (`src/events/channel.ts`).

*(Note: The Zustand store also exports a `setPriority` action in `src/store/useClinicStore.ts`, but live priority assignments in the application flow take place through `acceptReferral` in `ReferralDetailPage.tsx`.)*
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
How a given referral type (`"routine" | "urgent" | "followUp" | "safeguarding"`) is processed is determined by three distinct code mechanisms:

---

1. Pathway Routing (`src/triage/routes/`)

Dynamic route handlers register themselves by `ReferralType` in a central map:

**Registry & Dispatch:** `src/triage/routes/registry.ts` exposes `registerRoute` and `routeReferral(referral)`, which retrieves and executes the handler registered for `referral.type`.
**Loader:** `src/triage/routes/loadRoutes.ts` uses `import.meta.glob` to evaluate all `./*.ts` route modules dynamically.
**Handlers:**

* `src/triage/routes/routine.ts`: Standard pathway for requested service; `requiresPhoneCall: false`.

* `src/triage/routes/urgent.ts`: Urgent clinical review for requested service; `requiresPhoneCall: true`.

* `src/triage/routes/followUp.ts`: Prefers previous care team; `requiresPhoneCall: false`.

* `src/triage/routes/safeguarding.ts`: Routes to Community Nursing with safe contact restrictions; `requiresPhoneCall: true`.

**UI Consumer:** `src/pages/ReferralDetailPage.tsx` loads the modules and sets the outcome via `loadRoutes().then(() => setRoute(routeReferral(referral)))`.

---

2. Priority Policy Configuration & Slot Finder Dispatch (`src/config/priorityRules.ts`)

`referralPolicies` in `src/config/priorityRules.ts` configures processing parameters for each type:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

routine: { basePoints: 0, finder: "standard", targetHours: 336 },

urgent: { basePoints: 5, finder: "standard", targetHours: 24 },

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

safeguarding: { basePoints: 8, finder: "standard", targetHours: 4 },

};

```

This policy drives two processing steps:

**Priority Banding (`src/triage/banding.ts`):** `calculateBand` adds `referralPolicies[referral.type].basePoints` to matching signal points and attaches `targetHours`.
**Slot Finder Dispatch (`src/scheduling/service.ts`):** `availableSlots` reads `referralPolicies[referral.type].finder` to select the slot search implementation:

* `"standard"` dispatches to `findSlots` (`src/scheduling/slotFinder.ts`), returning active, service-matching, non-booked future slots.

* `"continuity"` dispatches to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`), sorting clinicians to prioritize the preferred/assigned clinician.

---

3. Type-Specific Business Rules
**Age Eligibility Guardrail (`src/triage/eligibility.ts`):** `checkEligibility` validates patient age derived from `dateOfBirth`. If `referral.type === "safeguarding"` and `age < 16`, it marks the referral ineligible with `"Child safeguarding team must coordinate this referral"`.
**API Redaction Pipeline (`src/api/pipeline/redact-stage.ts`):** `redactStage` intercepts API requests. If `referral.type === "safeguarding"`, it replaces `notes`, `patient.phone`, and `patient.postcode` with restricted markers before forwarding the request.
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
`checkEligibility(referral)` is defined in `src/triage/eligibility.ts` (lines 4–26). Eligibility is checked in **4 places** across the repository (3 in application/job logic and 1 in test suite execution):

1. Store action: `acceptReferral`
**Location:** `src/store/useClinicStore.ts` (line 52)
**Call Site:** `const eligibility = checkEligibility(referral);`
**Runtime Path:** Triggered when a user clicks the **"Accept referral"** or **"Update priority"** button on `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`, lines 48–56 & 109–115), which invokes `acceptReferral` from the Zustand store.
**Behavior:** Checks eligibility before updating state. If ineligible, emits the `eligibility:failed` event with `phase: "acceptance"` and throws an `Error` containing the failure reasons (`src/store/useClinicStore.ts`, lines 53–59).
2. Appointment validation helper: `checkAppointment`
**Location:** `src/triage/validation.ts` (line 12)
**Call Site:** `const eligibility = checkEligibility(referral);`
**Runtime Path:** Triggered when booking an appointment from the UI (`src/pages/ReferralDetailPage.tsx`, lines 67–71, via `SlotPicker` at `src/components/SlotPicker.tsx`, line 23), which calls `bookAppointment` in `src/store/useClinicStore.ts` (line 117), which executes `checkAppointment`.
**Behavior:** Re-checks eligibility before reserving the clinician slot. If ineligible, emits `eligibility:failed` with `phase: "booking"` and throws an `Error` (`src/triage/validation.ts`, lines 13–19).
3. Verification job: `runNightlyReverification`
**Location:** `src/jobs/nightlyReverification.ts` (line 19)
**Call Site:** `const result = checkEligibility(referral);`
**Runtime Path:** Triggered when clicking the **"Run eligibility check"** button on `AuditLogPage` (`src/pages/AuditLogPage.tsx`, lines 24–30 & 46–51).
**Behavior:** Iterates through all accepted and booked referrals (`src/jobs/nightlyReverification.ts`, lines 12–15). For each ineligible candidate, it records the failure in the report and emits `eligibility:failed` with `phase: "nightly"` (`src/jobs/nightlyReverification.ts`, lines 20–27).
4. Unit Test suite: `acceptance eligibility`
**Location:** `src/tests/eligibility.test.ts` (indirect execution in lines 10, 19, and 28)
**Call Site:** Executed indirectly when running tests via Vitest (`package.json`, line 9) by invoking `useClinicStore.getState().acceptReferral(...)` directly in test blocks.
**Behavior:** Asserts acceptance of eligible referrals, throwing behavior on out-of-area postcodes, and state preservation on ineligible referrals.
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
Before an outgoing API request reaches transport, it is processed through a pipeline composed of three sequential middleware stages: **tracing**, **authentication**, and **redaction**.

---

Pipeline Control & Data Flow

When `apiRequest(...)` is called in `src/api/api-client.ts`, the request flows through the following sequence:

1. **Header Normalization (`src/api/api-client.ts`)**

- `apiRequest` takes the incoming request object and ensures `headers` is initialized as a defined object (defaulting to `{}`).

2. **Stage 1: Trace Stage (`src/api/pipeline/trace-stage.ts`)**

- `traceStage` generates a unique trace ID string formatted as `trace-<timestamp>-<random_hex>`.

- It attaches the trace ID to the request headers under `"X-Trace-Id"`.

3. **Stage 2: Authentication Stage (`src/api/pipeline/auth-stage.ts`)**

- `authStage` enriches the request headers with credentials while preserving existing headers:

- `Authorization`: `"Bearer clinic-session"`

- `X-Staff-Role`: `"triage"`

4. **Stage 3: Redaction Stage (`src/api/pipeline/redact-stage.ts`)**

- `redactStage` inspects `request.body` using `redactBody`.

- If `body` is present, has `type === "safeguarding"`, and includes a `patient` object:

- `notes` is replaced with `"[restricted clinical note]"`.

- `patient.phone` is replaced with `"[safe contact required]"`.

- `patient.postcode` is replaced with `"[restricted]"`.

- If `body` is missing, not safeguarding, or has no `patient` property, the payload is returned unmodified.

5. **Transport Execution (`src/api/api-client.ts`)**

- The final `transport` handler receives the fully transformed request (`headers` containing `X-Trace-Id`, `Authorization`, `X-Staff-Role`, and potentially redacted `body`).

- `transport` returns a resolved promise with status `200`, setting `data` to `request.body` (or `{ ok: true }` if `body` is undefined) and setting `requestId` from `request.headers["X-Trace-Id"]`.

---

Repository Evidence & Method Verification
**Direct Evidence**:

- `stages` array composition (`[traceStage, authStage, redactStage]`) and pipeline composition (`stages.reduceRight`) are defined in `src/api/api-client.ts`.

- Header augmentation logic in `src/api/pipeline/trace-stage.ts` and `src/api/pipeline/auth-stage.ts`.

- Sensitive clinical data redaction rules in `src/api/pipeline/redact-stage.ts`.

- Pipeline types defined in `src/api/pipeline/types.ts`.

- Exported API entry points (`submitReferral` and `recordBooking`) in `src/api/referrals-api.ts`.

**Inference vs Live Code**:

- In `src/api/api-client.ts`, `transport` uses an in-memory `Promise.resolve` returning mock response data rather than making a network HTTP call via standard browser APIs (`fetch`/`XMLHttpRequest`).
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
`checkAppointment` does **not** only check; it mutates state directly and emits an event that updates module-level state.

---

Direct Evidence: State Changes Triggered by `checkAppointment`

#### 1. Direct In-Place Object Mutation

In `src/triage/validation.ts`, after completing its validation checks, `checkAppointment` mutates the clinician's matching slot object in place before returning:

```ts

slot.bookedReferralId = referral.id;

```

*(Direct evidence: `src/triage/validation.ts`)*

Because the `clinician` argument is passed by reference, this directly mutates `bookedReferralId` on the slot object belonging to the passed clinician.

#### 2. Event Emission and Event-Driven Module State Mutations

`checkAppointment` emits the `"appointment:booked"` event over the event channel (`src/triage/validation.ts`):

```ts

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

```

Two module-level state listeners react to this event when evaluated at application launch (`src/App.tsx`):

**`src/scheduling/eventListener.ts`**: Adds `appointment.slotId` to the module-scoped `recentlyBooked` `Set`.
**`src/audit/logger.ts`**: Unshifts a new `AuditEntry` object into the module-scoped `eventEntries` array (which is later read and rendered by `AuditLogPage` in `src/pages/AuditLogPage.tsx`).

---

Call-Site Context
**Zustand Store (`src/store/useClinicStore.ts`)**: In the store action `bookAppointment`, `checkAppointment` is called with clinician and referral objects retrieved directly from `get().clinicians` and `get().referrals`. Executing `checkAppointment` mutates the clinician's slot in place, after which `bookAppointment` commits updates to the store's `appointments`, `clinicians`, `referrals`, and `audit` state fields.
**Tests (`src/tests/scheduling.test.ts`)**: Confirms this behavior in test assertions (`expect(slot.bookedReferralId).toBe(referral.id)`).
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
For a follow-up referral (`type: "followUp"`), the **`findContinuitySlots`** function defined in `src/scheduling/oldSlotFinder.ts` runs.

Why `findContinuitySlots` runs:

1. **Policy Configuration (`src/config/priorityRules.ts`)**

The `referralPolicies` object maps each `ReferralType` to its policy settings. For `"followUp"`, the policy sets `finder: "continuity"`:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

routine: { basePoints: 0, finder: "standard", targetHours: 336 },

urgent: { basePoints: 5, finder: "standard", targetHours: 24 },

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

safeguarding: { basePoints: 8, finder: "standard", targetHours: 4 },

};

```

2. **Strategy Dispatch (`src/scheduling/service.ts`)**

When `availableSlots(referral, clinicians)` is called (e.g., by `SlotPicker` in `src/components/SlotPicker.tsx`), it retrieves the finder key from `referralPolicies[referral.type].finder` and uses it to index into the local `finders` object:

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

Because `referralPolicies["followUp"].finder` resolves to `"continuity"`, `availableSlots` selects and invokes `findContinuitySlots`.
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
When the scheduling event `"appointment:booked"` is emitted on the global `clinicEvents` channel (`src/events/channel.ts`), exactly two registered listeners react:

1. **`src/scheduling/eventListener.ts`**

- **Reaction:** Registers an `.on("appointment:booked", ...)` listener that adds the booked slot's ID (`appointment.slotId`) to an in-memory `recentlyBooked` `Set<string>`. This set is queried by the exported helper `wasRecentlyBooked(slotId)`.

2. **`src/audit/logger.ts`**

- **Reaction:** Registers an `.on("appointment:booked", ...)` listener that unshifts a formatted `AuditEntry` (`action: "Appointment booked"`, severity `"info"`) to the front of the module-level `eventEntries` array. These entries are combined with store audit logs via `getEventAudit()` and displayed in the audit log UI (`src/pages/AuditLogPage.tsx`).

---

Execution Flow & Channel Event Overview
**Listener Registration:** Both listener modules are loaded at application startup via side-effect imports in `src/App.tsx`:

```ts

import "./scheduling/eventListener";

import "./audit/logger";

```

**Emission Trigger:** The `"appointment:booked"` event is emitted inside `checkAppointment` (`src/triage/validation.ts`) after eligibility checks pass and slot booking state is updated:

```ts

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

```

**Unlistened Channel Events:** The `ClinicEvents` registry (`src/events/types.ts`) defines two additional non-scheduling event types:

- `"referral:accepted"` (emitted by `acceptReferral` in `src/store/useClinicStore.ts`)

- `"eligibility:failed"` (emitted in `src/triage/validation.ts`, `src/store/useClinicStore.ts`, and `src/jobs/nightlyReverification.ts`)

Neither `"referral:accepted"` nor `"eligibility:failed"` currently has any active `.on(...)` listeners registered in the codebase.
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
To add a new referral type, the primary definition is updated in the `ReferralType` union in `src/types/domain.ts`.

---

Required Code Changes

1. **Type Definition & Core Domain**

* **`src/types/domain.ts`**: Add the new type string to the `ReferralType` type alias (e.g., `export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "newType"`).

2. **Policy Configuration & Formatting** (Required by TypeScript)

* **`src/config/priorityRules.ts`**: Add an entry for the new type to `referralPolicies: Record<ReferralType, ReferralPolicy>`. You must configure `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`.

* **`src/utils/format.ts`**: Update the map in `humaniseType(type: ReferralType)` to include a display string for the new type.

3. **Dynamic Route Registration** (Required at Runtime)

* **`src/triage/routes/<newType>.ts`**: Create a module file in `src/triage/routes/` that invokes `registerRoute("<newType>", handler)`.

* *Runtime Trace:* `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) calls `loadRoutes()` (`src/triage/routes/loadRoutes.ts`), which uses `import.meta.glob` to auto-load route files in that folder. `ReferralDetailPage` then executes `routeReferral(referral)`. If a handler for `<newType>` is not registered, `routeReferral` in `src/triage/routes/registry.ts` throws an error.

4. **UI Filters & Metrics**

* **`src/pages/ReferralListPage.tsx`**: Add an `<option value="<newType>">` to the **"Filter referral type"** `<select>` dropdown. Additionally, if referrals of this type are time-sensitive/urgent, update the `urgent` metric calculation in `ReferralListPage`.

5. **CSS Styling**

* **`src/styles.css`**: `ReferralTable` (`src/components/ReferralTable.tsx`) and `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) construct dynamic class names using `type-${referral.type}`. Add CSS rules for `.type-dot.type-<newType>` and `.type-badge.type-<newType>`.

6. **Test Suite**

* **`src/tests/registry.test.ts`**: Update the dynamic route count assertion (`expect(registeredRouteCount()).toBe(4)`) to match the new total count.

---

Optional / Contextual Changes
**`src/triage/eligibility.ts`**: Update `checkEligibility` if the new type has specific age or clinical validation rules (e.g., safeguarding checks age < 16).
**`src/api/pipeline/redact-stage.ts`**: Update `redactBody` if the new referral type requires patient PII or note redaction during API request processing.
**`src/data/seed.ts`**: Add mock scenario rows to seed mock referrals for UI rendering and testing.
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
Changing the priority rules in `src/config/priorityRules.ts` (`referralPolicies`, `priorityRules`, or `bandThresholds`) directly affects automated triage scoring, UI guidance, acceptance state mutations, slot finder selection, worklist filtering, and unit tests.

---

1. Triage Scoring and Banding (`src/triage/banding.ts`)
**`calculateBand(referral)`:** Evaluates `referralPolicies[referral.type].basePoints` and sums `points` from matching `priorityRules`. It maps the score against `bandThresholds` to return `band`, `score`, `matchedRules`, and `targetHours`.
**Runtime call site:** Called inside `PriorityPanel` (`src/components/PriorityPanel.tsx`) during rendering and inside `acceptReferral` (`src/store/useClinicStore.ts`) when no explicit `override` is provided.

---

2. Referral Acceptance State, Audit Logs & Event Dispatch (`src/store/useClinicStore.ts`)

When accepting a referral via `acceptReferral(id, override)`:

**UI Trigger:** `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) calls `accept(referral.id, priority)`, passing the `priority` local React state state initialized from `referral.priority ?? "green"`. If `acceptReferral` is called without an `override` argument, it falls back to `calculateBand(referral).band`.
**Store Mutation:** Mutates `referrals` in Zustand store state, setting `priority: band` and `status: "accepted"`.
**Audit Entry:** Appends an entry to store state `audit` via `addAudit`:

* `detail`: `"Priority assigned: <band>"`

* `severity`: `"critical"` if `band === "red"`, otherwise `"info"`

**Event Emission:** Emits `"referral:accepted"` with `{ referralId, band, actor }` over `clinicEvents` (`src/events/channel.ts`). There are currently no registered listeners for `"referral:accepted"` in the codebase.

---

3. Slot Finder Strategy Selection (`src/scheduling/service.ts`)
**`availableSlots(referral, clinicians)`:** Reads `referralPolicies[referral.type].finder` to select between:

* `"standard"` (`findSlots` in `src/scheduling/slotFinder.ts`): filters out past/booked slots and checks service compatibility.

* `"continuity"` (`findContinuitySlots` in `src/scheduling/oldSlotFinder.ts`): prioritizes slots belonging to `referral.assignedClinicianId` (if assigned).

**UI Consumer:** `SlotPicker` (`src/components/SlotPicker.tsx`) calls `availableSlots` on render when rendered in `ReferralDetailPage` (which shows `SlotPicker` when `showBooking` is true or `referral.status === "accepted"`).

---

4. Detail Page UI & Priority Selection (`src/components/PriorityPanel.tsx`)

Rendered on `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`):

**Score Display:** Renders `Score {decision.score}`.
**Suggested Band & Target:** Displays `Suggested band: bandLabel(decision.band)` and response timeframe `decision.targetHours`.
**Option Highlight:** Badges the matching option button with `Suggested` when `decision.band === band`.
**Matched Rules List:** Renders list items from `decision.matchedRules`.

---

5. Worklist Metrics, Table Rendering & Filtering (`src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`, `src/components/ReferralTable.tsx`)

Changing saved `referral.priority` values (via acceptance) affects downstream list views:

**Time Sensitive Metric:** `ReferralListPage` counts `urgent` referrals matching `item.priority === "red" || item.type === "urgent" || item.type === "safeguarding"`.
**Filtering:** `useReferralFilters` filters referrals by `band` (`red`, `amber`, `green`, `unbanded`).
**Table Badge:** `ReferralTable` renders priority pills styled by `priority-${referral.priority}` and formatted via `bandLabel(referral.priority)` (`src/utils/format.ts`).

---

6. Automated Unit Tests (`src/tests/banding.test.ts`)

`src/tests/banding.test.ts` executes `calculateBand` against seed referrals (`src/data/seed.ts`). Changing rules directly affects the assertions that:

Safeguarding referrals evaluate to `"red"`.
Routine referrals return `336` target hours.
Deteriorating signals populate `matchedRules`.
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
Yes, safeguarding referrals (`type === "safeguarding"` or referrals with `signals.safeguardingConcern === true`) are treated differently across eligibility validation, priority banding and target response time calculation, dynamic routing pathway guidance, list metrics counters, UI badge styling, and defined API payload redaction.

---

Where and How Safeguarding Referrals Are Treated Differently

#### 1. Eligibility Validation

**File:** `src/triage/eligibility.ts`
**Behavior:** When evaluating eligibility, if `referral.type === "safeguarding"` and the patient's age is under 16, `checkEligibility` marks the referral as ineligible (`eligible: false`) with the reason `"Child safeguarding team must coordinate this referral"`.
**Runtime Reach:** Reached when accepting a referral (`useClinicStore.ts`), booking an appointment (`validation.ts`), or running nightly verification (`nightlyReverification.ts`).

#### 2. Priority Banding & Target Response Time

**Files:** `src/config/priorityRules.ts`, `src/triage/banding.ts`
**Behavior:**

* **Policy configuration (`referralPolicies`):** The `"safeguarding"` referral type has a base score of `8` points and the shortest target response time (`4` hours), compared to routine (`0` pts / 336 hrs), urgent (`5` pts / 24 hrs), or follow-up (`1` pt / 168 hrs).

* **Rule evaluation (`priorityRules`):** The `safeguarding-signal` rule matches if `signals.safeguardingConcern` is `true`, adding `10` points and setting the rule band to `"red"`.

**Runtime Reach:** Reached via `calculateBand(referral)` on `ReferralDetailPage.tsx` (via `PriorityPanel.tsx`) and when calculating priority during acceptance in `useClinicStore.ts`.

#### 3. Dynamic Pathway Guidance

**Files:** `src/triage/routes/safeguarding.ts`, `src/triage/routes/registry.ts`, `src/pages/ReferralDetailPage.tsx`
**Behavior:** The dynamically loaded handler registered for `"safeguarding"` returns:

* `summary`: `"Restricted safeguarding review for <Patient Name>"`

* `recommendedService`: `"Community nursing"`

* `requiresPhoneCall`: `true` (rendering a warning notice: *"Telephone contact is required before booking."*)

* `instructions`: `["Do not leave a voicemail", "Check safe contact method", "Notify safeguarding lead"]`

#### 4. Referral List Summary Metrics

**File:** `src/pages/ReferralListPage.tsx`
**Behavior:** In `ReferralListPage`, the "Time sensitive" metric card includes safeguarding referrals in its count alongside urgent types and red-priority referrals (`item.type === "safeguarding"`).

#### 5. UI Tag & Badge Styling

**Files:** `src/styles.css`, `src/utils/format.ts`
**Behavior:**

* `humaniseType("safeguarding")` returns `"Safeguarding"`.

* `.type-dot.type-safeguarding` sets a red background (`#c65358`).

* `.type-badge.type-safeguarding` sets dark red text (`#9d3b42`) on a soft red fill (`#faeaeb`).

#### 6. API Payload Redaction (Defined Endpoint Pipeline)

**Files:** `src/api/pipeline/redact-stage.ts`, `src/api/referrals-api.ts`
**Behavior:** `redactStage` inspects outgoing payloads in `apiRequest` and redacts sensitive patient information if `request.body.type === "safeguarding"`:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

**Usage Note:** This pipeline stage is defined and exported for `submitReferral` and `recordBooking` in `src/api/referrals-api.ts`, but these API functions are not called in the active UI views.
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
A slot is actually booked in **`checkAppointment`** (`src/triage/validation.ts`), where the slot object's `bookedReferralId` property is mutated in memory (`slot.bookedReferralId = referral.id`).

This mutation is driven at runtime by **`useClinicStore.bookAppointment`** (`src/store/useClinicStore.ts`), which updates the application state, records an audit log entry, and emits an event when an appointment is confirmed.

---

Execution & Control Flow

1. **User Interaction**:

- In `SlotPicker` (`src/components/SlotPicker.tsx`), clicking **"Confirm appointment"** invokes `submit()`, which calls the passed `onBook(slot.clinicianId, slot.id)` callback.

- `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) handles `onBook` and calls `book(referral.id, clinicianId, slotId)` from the Zustand clinic store.

2. **Validation and Slot Mutation**:

- `bookAppointment` in `useClinicStore` (`src/store/useClinicStore.ts`) retrieves the referral and clinician from store state, then calls `checkAppointment(referral, clinician, slotId, state.actor)` (`src/triage/validation.ts`).

- `checkAppointment` checks referral eligibility via `checkEligibility` (`src/triage/eligibility.ts`), verifies slot availability, mutates the slot in memory (`slot.bookedReferralId = referral.id`), and returns a new `Appointment` object.

- `checkAppointment` emits the `"appointment:booked"` event over `clinicEvents` (`src/events/channel.ts`).

3. **Event Listeners & State Updates**:

- **Store Mutation**: `useClinicStore.bookAppointment` (`src/store/useClinicStore.ts`) appends the new `Appointment` to `appointments`, sets the referral's `status` to `"booked"`, assigns `appointmentId` and `assignedClinicianId`, and adds an audit record via `addAudit`.

- **Event Handlers**:

- `src/scheduling/eventListener.ts` listens for `"appointment:booked"` and adds `appointment.slotId` to its internal `recentlyBooked` set.

- `src/audit/logger.ts` listens for `"appointment:booked"` and unshifts an entry into its in-memory `eventEntries` array.

---

Non-Production & Unused Booking Logic
**Test Suite Call Sites**: `src/tests/scheduling.test.ts` invokes `checkAppointment` directly to verify booking and slot collision prevention independently of the Zustand store.
**`reserveSlot`** (`src/scheduling/service.ts`): Exports an immutable helper returning `{ ...slot, bookedReferralId: referralId }`, but it is not imported or called by any active component, store action, or job.
**`recordBooking`** (`src/api/referrals-api.ts`): An API helper intended to post booking records to a remote gateway, but it is not referenced anywhere in the runtime application.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

