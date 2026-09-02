# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: cfeb6ef9c2e2df1863e255eda4a6dcafc0946bd375211a53aabbb524b8fc917b -->

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
Execution starts in the browser when `index.html` loads `/src/main.tsx` via a native ES module script tag, which triggers module evaluation, event-listener registration, Zustand store seed initialization, DOM mounting, and initial React route rendering.

---

Execution Startup Sequence

1. **HTML Entry Point & Script Loading**

* **Path:** `index.html`

* **Direct Evidence:** The browser parses `index.html`, which contains `<div id="root"></div>` and `<script type="module" src="/src/main.tsx"></script>`. This requests `src/main.tsx` as the application module entry point.

2. **Module Evaluation & Global Event Subscriptions**

* **Paths:** `src/main.tsx`, `src/App.tsx`, `src/scheduling/eventListener.ts`, `src/audit/logger.ts`, `src/store/useClinicStore.ts`, `src/data/seed.ts`, `src/events/channel.ts`

* **Direct Evidence:**

* `src/main.tsx` imports `App` from `src/App.tsx`.

* Evaluation of `src/App.tsx` executes top-level imports `./scheduling/eventListener` and `./audit/logger`.

* `src/scheduling/eventListener.ts` registers a listener on `clinicEvents` (`src/events/channel.ts`) for `"appointment:booked"`.

* `src/audit/logger.ts` registers a listener on `clinicEvents` (`src/events/channel.ts`) for `"appointment:booked"`.

* Evaluation of components and routes imports `src/store/useClinicStore.ts`, which executes Zustand's `create()` function at module scope, cloning `seedReferrals`, `seedClinicians`, and `seedAudit` from `src/data/seed.ts` into initial store state.

3. **React DOM Mounting & Initial Render**

* **Path:** `src/main.tsx`

* **Direct Evidence:** `src/main.tsx` executes `document.getElementById("root")!` and passes the container to `ReactDOM.createRoot()`, invoking `.render()` with `<App />` wrapped in `<React.StrictMode>`.

4. **Router Initialization & Default View Render**

* **Paths:** `src/App.tsx`, `src/components/Layout.tsx`, `src/pages/ReferralListPage.tsx`

* **Direct Evidence:** `<App />` renders `<BrowserRouter>` and `<Routes>`. The router matches the initial `/` path to the index route, mounting the parent `<Layout />` layout frame (`src/components/Layout.tsx`) and rendering `<ReferralListPage />` (`src/pages/ReferralListPage.tsx`) inside `<Outlet />`.
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
A referral is assigned its priority band (`"red"`, `"amber"`, or `"green"`) when a user accepts or updates the referral on the detail page (`src/pages/ReferralDetailPage.tsx`). The detail page renders a clinical recommendation calculated by `calculateBand` (`src/triage/banding.ts`), initializes local React component state to `referral?.priority ?? "green"`, and allows the user to select a band option in `PriorityPanel` (`src/components/PriorityPanel.tsx`). Upon submission, `ReferralDetailPage` calls `accept(referral.id, priority)` on the Zustand store (`src/store/useClinicStore.ts`), which validates eligibility, sets `referral.priority` to the chosen band alongside `referral.status = "accepted"`, records an audit entry, and emits the `referral:accepted` event.

---

1. Priority Band Calculation (`calculateBand`)

The clinical recommendation engine calculates a total score, suggested band, matched signals, and target hours using `calculateBand` (`src/triage/banding.ts`) according to rules in `src/config/priorityRules.ts`:

1. **Base Points & Targets** (`referralPolicies` in `src/config/priorityRules.ts`):

- `routine`: 0 base points (target: 336 hours / 14 days)

- `followUp`: 1 base point (target: 168 hours / 7 days)

- `urgent`: 5 base points (target: 24 hours)

- `safeguarding`: 8 base points (target: 4 hours)

2. **Signal Matching** (`priorityRules` in `src/config/priorityRules.ts`):

Points from all matching rules are added to the pathway base points:

- `safeguarding-signal` (+10 points): `safeguardingConcern === true`

- `rapid-deterioration` (+7 points): `deterioration === true` AND `painScore >= 7`

- `severe-pain` (+4 points): `painScore >= 7`

- `post-discharge` (+3 points): `recentDischarge === true`

- `mobility` (+2 points): `mobilityRisk === true`

- `persistent-symptoms` (+1 point): `symptomDays > 21`

3. **Band Threshold Mapping** (`bandThresholds` in `src/config/priorityRules.ts`):

The combined score maps to the first matching threshold:

- **Score ≥ 9**: `"red"` (Priority 1)

- **Score ≥ 4**: `"amber"` (Priority 2)

- **Score ≥ 0**: `"green"` (Priority 3, fallback)

`calculateBand` returns `{ band, score, matchedRules, targetHours }`.

---

2. UI Selection and Workflow

In `src/pages/ReferralDetailPage.tsx` and `src/components/PriorityPanel.tsx`:

`PriorityPanel` evaluates `calculateBand(referral)` to show score, target response window, formatted band label (`bandLabel`), matched signals, and marks the recommended button option with a *Suggested* tag.
`ReferralDetailPage` initializes state `priority` with `referral?.priority ?? "green"`. Note that local state initialisation reads existing referral priority or `"green"`, not `calculateBand`.
Selecting an option button (`"red"`, `"amber"`, or `"green"`) triggers `onSelect(band)` in `PriorityPanel`, updating `priority` in `ReferralDetailPage`.
Clicking "Accept referral" or "Update priority" calls `onAccept()`, executing `accept(referral.id, priority)` on `useClinicStore`.

---

3. Store Mutation & Side Effects

When `acceptReferral(id, override)` runs in `src/store/useClinicStore.ts`:

1. **Eligibility Validation**: Invokes `checkEligibility(referral)` (`src/triage/eligibility.ts`). If ineligible, emits `eligibility:failed` on `clinicEvents` (`src/events/channel.ts`) and throws an error; execution halts and no state updates occur.

2. **State Update**: Updates `referrals` in state, setting `status: "accepted"` and `priority: override`.

3. **Audit Entry**: Appends an entry to state `audit` via `addAudit()` with action `"Referral accepted"`, detail `"Priority assigned: <band>"`, and severity `"critical"` if `band === "red"` or `"info"` otherwise.

4. **Event Emission**: Emits `referral:accepted` with `{ referralId: id, band, actor: state.actor }` on `clinicEvents`.

---

4. Unused Helpers, Fallbacks, and Event Subscriptions
**Bypassed Fallback Branch**: Inside `acceptReferral`, `const band = override ?? calculateBand(referral).band` evaluates `calculateBand` only if `override` is omitted. Because `ReferralDetailPage` always passes `priority` as the second argument, this internal fallback is bypassed by every live UI call site.
**Unused Store Action**: `useClinicStore` exports `setPriority(id, band)` which updates `referral.priority` and logs an audit record. This subsystem is defined but not reached by the running application and does not count as live behavior.
**Event Channel Subscriptions** (`src/events/types.ts`, `src/events/channel.ts`):

- `referral:accepted`: Emitted by `acceptReferral`; has **0 registered subscribers**.

- `eligibility:failed`: Emitted when eligibility fails during acceptance, booking (`src/triage/validation.ts`), or reverification (`src/jobs/nightlyReverification.ts`); has **0 registered subscribers**.

- `appointment:booked`: Emitted on appointment creation; has **2 registered subscribers**: `src/audit/logger.ts` (records audit entry) and `src/scheduling/eventListener.ts` (tracks recently booked slot IDs).
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
Processing decisions for a referral type (`routine`, `urgent`, `followUp`, or `safeguarding`) are governed by policy configuration (`src/config/priorityRules.ts`), route registration modules (`src/triage/routes/registry.ts`), slot finder selection (`src/scheduling/service.ts`), domain eligibility rules (`src/triage/eligibility.ts`), and API middleware (`src/api/pipeline/redact-stage.ts`, defined but not reached by the running application), with UI presentation across pages, components, hooks, and formatting utilities.

---

1. Base Priority Scoring, Finder Key, and Target Response Times

**Files:** `src/config/priorityRules.ts`, `src/triage/banding.ts`, `src/store/useClinicStore.ts`, `src/components/PriorityPanel.tsx`

`referralPolicies` in `src/config/priorityRules.ts` defines execution parameters per type:

`routine`: `{ basePoints: 0, finder: "standard", targetHours: 336 }`
`urgent`: `{ basePoints: 5, finder: "standard", targetHours: 24 }`
`followUp`: `{ basePoints: 1, finder: "continuity", targetHours: 168 }`
`safeguarding`: `{ basePoints: 8, finder: "standard", targetHours: 4 }`

When `calculateBand(referral)` runs in `src/triage/banding.ts`:

1. `referralPolicies[referral.type].basePoints` supplies the starting score before adding points from matching clinical rules in `priorityRules`.

2. `referralPolicies[referral.type].targetHours` sets the response target window returned in the decision object.

3. The total score determines the calculated band (`red` at score $\ge 9$, `amber` at $\ge 4$, `green` otherwise).

This calculated decision is rendered in `PriorityPanel` (`src/components/PriorityPanel.tsx`). In `useClinicStore.ts`, calling `acceptReferral(id)` without an explicit override uses `calculateBand(referral).band` to populate `referral.priority`.

---

2. Dynamic Route Registration and Pathway Outcomes
Files:
`src/triage/routes/registry.ts`
`src/triage/routes/loadRoutes.ts`
`src/triage/routes/routine.ts`
`src/triage/routes/urgent.ts`
`src/triage/routes/followUp.ts`
`src/triage/routes/safeguarding.ts`
`src/pages/ReferralDetailPage.tsx`

Dynamic route handlers register via `registerRoute(type, handler)` in `src/triage/routes/registry.ts`:

`routine.ts`: Standard pathway returning `requiresPhoneCall: false` and `recommendedService: referral.service`.
`urgent.ts`: Urgent pathway returning `requiresPhoneCall: true` and `recommendedService: referral.service`.
`followUp.ts`: Follow-up pathway returning `requiresPhoneCall: false` and instructions to prefer previous care team.
`safeguarding.ts`: Safeguarding pathway returning `requiresPhoneCall: true` and `recommendedService: "Community nursing"`.

When `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) mounts, it calls `loadRoutes()` (`src/triage/routes/loadRoutes.ts`), which uses `import.meta.glob` to import all pathway modules, populating the `handlers` map in `src/triage/routes/registry.ts`. `routeReferral(referral)` retrieves the handler and returns a `RouteOutcome` object. `ReferralDetailPage` displays the returned `summary`, `instructions`, and a warning notice if `requiresPhoneCall` is true.

---

3. Slot Finder Selection

**Files:** `src/scheduling/service.ts`, `src/scheduling/slotFinder.ts`, `src/scheduling/oldSlotFinder.ts`

`availableSlots(referral, clinicians)` in `src/scheduling/service.ts` reads `referralPolicies[referral.type].finder`:

`"standard"` (`routine`, `urgent`, `safeguarding`): Dispatches to `findSlots` (`src/scheduling/slotFinder.ts`). It filters for active clinicians offering `referral.service`, collects unbooked future slots (`startsAt` in the future), and sorts them chronologically.
`"continuity"` (`followUp`): Dispatches to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`). It ranks clinicians by prioritizing matching `referral.assignedClinicianId` (`preferredClinicianId`) first rather than filtering out unassigned clinicians, flattens all unbooked service slots, and sorts them chronologically.

---

4. Eligibility Rules and API Pipeline Redaction
Files:
`src/triage/eligibility.ts`
`src/store/useClinicStore.ts`
`src/triage/validation.ts`
`src/jobs/nightlyReverification.ts`
`src/api/pipeline/redact-stage.ts`
`src/api/referrals-api.ts`
**Eligibility Checks (`src/triage/eligibility.ts`):** `checkEligibility(referral)` evaluates whether `referral.type === "safeguarding"` for patients under 16 years old (`differenceInYears(new Date(), parseISO(dob)) < 16`). If true, it returns `eligible: false` with reason `"Child safeguarding team must coordinate this referral"`.

* In `useClinicStore.ts` (`acceptReferral`), an ineligible referral throws an error and emits `eligibility:failed` with phase `"acceptance"`.

* In `src/triage/validation.ts` (`checkAppointment`), an ineligible referral throws an error and emits `eligibility:failed` with phase `"booking"`.

* In `src/jobs/nightlyReverification.ts` (`runNightlyReverification`), ineligible accepted/booked referrals trigger `eligibility:failed` with phase `"nightly"`.

**API Redaction Middleware (`src/api/pipeline/redact-stage.ts`):** Defined in code to redact request fields (`notes`, `patient.phone`, `patient.postcode`) when `referral.type === "safeguarding"` during `apiRequest` calls in `src/api/referrals-api.ts`, but this API layer is defined but not reached by the running application.

---

5. UI Workspace Filtering, Metrics, and Formatting
Files:
`src/pages/ReferralListPage.tsx`
`src/hooks/useReferralFilters.ts`
`src/components/ReferralTable.tsx`
`src/utils/format.ts`
**Time-Sensitive Metric (`src/pages/ReferralListPage.tsx`):** Counts referrals matching `item.priority === "red" || item.type === "urgent" || item.type === "safeguarding"`.
**List Filtering (`src/hooks/useReferralFilters.ts`):** Filters referrals using predicate `type === "all" || referral.type === type`.
**Table Display (`src/components/ReferralTable.tsx`, `src/utils/format.ts`):** `humaniseType(type)` in `src/utils/format.ts` maps `routine` $\to$ `"Routine"`, `urgent` $\to$ `"Urgent"`, `followUp` $\to$ `"Follow-up"`, and `safeguarding` $\to$ `"Safeguarding"`. `ReferralTable` applies bullet styling with `clsx("type-dot", `type-${referral.type}`)`.
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
Eligibility is evaluated at **3 exact call sites** in the repository, all through calls to `checkEligibility` defined in `src/triage/eligibility.ts`:

1. **`src/store/useClinicStore.ts` (inside `acceptReferral`)**

* **Trigger & Control Flow:** Triggered from `ReferralDetailPage.tsx` (`onAccept` calling `acceptReferral`).

* **Test Coverage:** Executed indirectly in `src/tests/eligibility.test.ts` via `acceptReferral`.

* **Behavior:** Evaluates `checkEligibility(referral)`. If `eligible` is `false`, it emits `eligibility:failed` via `clinicEvents` (`src/events/channel.ts`) with `phase: "acceptance"` and throws an `Error` constructed from `reasons.join(". ")`, blocking referral status update.

2. **`src/triage/validation.ts` (inside `checkAppointment`)**

* **Trigger & Control Flow:** Triggered via `useClinicStore.bookAppointment`, which is called from `ReferralDetailPage.tsx` (`onBook` passed into `SlotPicker.tsx`).

* **Test Coverage:** Executed indirectly in `src/tests/scheduling.test.ts` via `checkAppointment`.

* **Behavior:** Calls `checkEligibility(referral)` prior to slot or service checks. If `eligible` is `false`, it emits `eligibility:failed` via `clinicEvents` (`src/events/channel.ts`) with `phase: "booking"` and throws an `Error` containing `reasons.join(". ")`, preventing appointment creation.

3. **`src/jobs/nightlyReverification.ts` (inside `runNightlyReverification`)**

* **Trigger & Control Flow:** Triggered from `AuditLogPage.tsx` (`verify` calling `runNightlyReverification`).

* **Behavior:** Filters the provided array of referrals for items with status `"accepted"` or `"booked"`, then executes `checkEligibility(referral)` on each candidate. If `eligible` is `false`, it emits `eligibility:failed` via `clinicEvents` (`src/events/channel.ts`) with `phase: "nightly"` and appends `{ referralId, reasons }` to the returned failure report.

---

Non-Evaluating UI Elements
**`src/pages/ReferralDetailPage.tsx`:** Renders a button with label `"Verify demographics"`, but it lacks an `onClick` handler and does not invoke `checkEligibility` or perform any runtime check.
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
When an outgoing API request is executed via `apiRequest` in [`src/api/api-client.ts`](src/api/api-client.ts), it passes through a composed pipeline of three middleware stages (`traceStage` → `authStage` → `redactStage`) before reaching the terminal `transport` function.

---

Step-by-step Request Control & Data Flow

1. **Header Normalisation** ([`src/api/api-client.ts`](src/api/api-client.ts))

- `apiRequest` receives request parameters and defaults `headers` to `{}` if omitted (`{ ...request, headers: request.headers ?? {} }`).

2. **Stage 1: Trace Injection** ([`src/api/pipeline/trace-stage.ts`](src/api/pipeline/trace-stage.ts))

- `traceStage` generates a unique string formatted as `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`.

- It attaches this string to request headers under `X-Trace-Id`.

3. **Stage 2: Authentication Enrichment** ([`src/api/pipeline/auth-stage.ts`](src/api/pipeline/auth-stage.ts))

- `authStage` injects session headers into the request while preserving existing headers:

- `Authorization`: `"Bearer clinic-session"`

- `X-Staff-Role`: `"triage"`

4. **Stage 3: Data Redaction** ([`src/api/pipeline/redact-stage.ts`](src/api/pipeline/redact-stage.ts))

- `redactStage` inspects `request.body`.

- If `request.body` represents a safeguarding referral (`type === "safeguarding"` and `patient` is present), it returns a modified copy overwriting sensitive clinical and demographic fields:

- `notes`: `"[restricted clinical note]"`

- `patient.phone`: `"[safe contact required]"`

- `patient.postcode`: `"[restricted]"`

- For all other request bodies or referral types, the body passes through unchanged.

5. **Terminal Transport** ([`src/api/api-client.ts`](src/api/api-client.ts))

- The composed pipeline delivers the enriched and redacted request object to `transport`.

- `transport` returns a resolved promise with `status: 200`, echoing the transformed `body` (or defaulting to `{ ok: true }`) as `data`, and extracting `requestId` from the `X-Trace-Id` header.

---

Code Reach Context
**Direct Evidence**: [`src/api/referrals-api.ts`](src/api/referrals-api.ts) calls `apiRequest` via `submitReferral` (`PATCH /referrals/${referral.id}`) and `recordBooking` (`POST /referrals/${referral.id}/booking`).
**Runtime Reach**: Within the provided codebase, neither `apiRequest` nor `referrals-api.ts` is imported or invoked by the active UI page components ([`src/pages/ReferralDetailPage.tsx`](src/pages/ReferralDetailPage.tsx)) or state actions ([`src/store/useClinicStore.ts`](src/store/useClinicStore.ts)), which manipulate local Zustand state directly.
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
`checkAppointment` in `src/triage/validation.ts` does not only check; it actively mutates state directly in memory and triggers synchronous module-level state updates through event emissions.

Direct Mutations Inside `checkAppointment`

When validation succeeds in `src/triage/validation.ts`, `checkAppointment`:

1. **Mutates the slot object directly**: Sets `slot.bookedReferralId = referral.id;`, mutating the in-memory `Slot` property on the passed `clinician` object in place.

2. **Emits event channel notifications**:

- Emits `"appointment:booked"` with `{ appointment, patientName: referral.patient.name }`.

- If eligibility fails, it emits `"eligibility:failed"` with phase `"booking"` before throwing an error. In the current codebase, `"eligibility:failed"` has zero registered listeners (`src/events/types.ts`).

Module State Updates Triggered via Event Listeners

Emitting `"appointment:booked"` triggers two registered event subscribers (`src/events/channel.ts`):

**`src/scheduling/eventListener.ts`**: Synchronously adds `appointment.slotId` to the module-scoped `recentlyBooked` `Set` (exposed via `wasRecentlyBooked()`).
**`src/audit/logger.ts`**: Unshifts an audit record into the module-scoped `eventEntries` array (exposed via `getEventAudit()`, which is read by `src/pages/AuditLogPage.tsx`).
Downstream Impact in Application Callers
**Application Store (`src/store/useClinicStore.ts`)**: The Zustand store action `bookAppointment` calls `checkAppointment`. Using the returned `Appointment` object, `bookAppointment` updates Zustand state:

* Appends the new `appointment` to `state.appointments`.

* Updates the matching referral in `state.referrals` setting `status: "booked"`, `appointmentId`, and `assignedClinicianId`.

* Calls `get().addAudit()` to prepend an entry to `state.audit`.

**Tests (`src/tests/scheduling.test.ts`)**: Direct call sites test that `checkAppointment` mutates `slot.bookedReferralId` in place and prevents subsequent bookings on the same slot by throwing `"The selected slot is no longer available"`.
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
For a follow-up referral (`referral.type === "followUp"`), the **`findContinuitySlots`** implementation exported from `src/scheduling/oldSlotFinder.ts` runs. It is selected because `referralPolicies` in `src/config/priorityRules.ts` maps the `"followUp"` referral type to the finder key `"continuity"`, which `availableSlots` in `src/scheduling/service.ts` uses to look up `findContinuitySlots` in its `finders` registry.

Policy Configuration, Dispatch, and Execution Flow

1. **Policy Mapping (`src/config/priorityRules.ts`)**:

The `referralPolicies` object configures referral behavior by type. For follow-up referrals, it assigns the finder strategy key `"continuity"`:

```typescript

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 }

```

2. **Dispatch Mechanics (`src/scheduling/service.ts`)**:

When slot options are computed (such as in `SlotPicker` in `src/components/SlotPicker.tsx`), `availableSlots` accesses `referralPolicies[referral.type].finder`. It resolves `"continuity"` via its internal map:

```typescript

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

```

It then invokes `findContinuitySlots` with a `SlotSearch` object containing the `referral`, `clinicians`, and `preferredClinicianId` (set to `referral.assignedClinicianId`).

3. **Behavior of `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`)**:

`findContinuitySlots` processes availability through four operations:

- **Clinician filtering**: Retains clinicians who are active (`clinician.active`) and cover the referral's requested service (`clinician.services.includes(referral.service)`).

- **Preferred clinician ranking**: Ranks clinicians so that any clinician whose ID matches `preferredClinicianId` (`referral.assignedClinicianId`) is ordered before others without removing non-matching clinicians.

- **Slot filtering**: Flat-maps slots from those clinicians, keeping those that are unbooked (`!slot.bookedReferralId`) and match `referral.service`.

- **Chronological sorting**: Returns the aggregated slots sorted in ascending date order using `compareAsc`.
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
When the scheduling event `"appointment:booked"` is emitted during `checkAppointment` in `src/triage/validation.ts`, exactly two registered listeners react:

1. **`src/audit/logger.ts`**: Unshifts an `AuditEntry` (`action: "Appointment booked"`) into an in-memory `eventEntries` array. This data is exported via `getEventAudit()` and consumed by `AuditLogPage` (`src/pages/AuditLogPage.tsx`) to display audit log entries in the UI.

2. **`src/scheduling/eventListener.ts`**: Adds `appointment.slotId` to a module-scoped `recentlyBooked` `Set`. This state is exposed via `wasRecentlyBooked(slotId)`, which has no active callers in the running application.

---

Registration & Execution Flow

Both listeners register via `clinicEvents.on("appointment:booked", ...)` on the `clinicEvents` singleton (`src/events/channel.ts`) when `src/App.tsx` evaluates its side-effect imports (`import "./scheduling/eventListener"` and `import "./audit/logger"`).

#### Event Emission Trigger

**`"appointment:booked"`**

* **Emitted by:** `checkAppointment` in `src/triage/validation.ts` when a slot booking succeeds (invoked at runtime by `bookAppointment` in `src/store/useClinicStore.ts`).

* **Payload:** `{ appointment, patientName }`

* **Handlers:**

* **`src/audit/logger.ts`**: Creates an audit record (`id: "event-" + appointment.id`, `severity: "info"`, `detail: "Booked " + patientName + " with clinician " + appointment.clinicianId`) and prepends it to `eventEntries`. `AuditLogPage` (`src/pages/AuditLogPage.tsx`) reads `getEventAudit()`, merges it with Zustand state audit entries, and renders the result.

* **`src/scheduling/eventListener.ts`**: Inserts `appointment.slotId` into the `recentlyBooked` `Set`.

---

Complete Event Reaction Inventory

The event channel type map (`ClinicEvents` in `src/events/types.ts`) defines three events across the application:

**`"appointment:booked"`**

* **Emitted in:** `src/triage/validation.ts`

* **Registered Listeners (2):** `src/audit/logger.ts`, `src/scheduling/eventListener.ts`

**`"eligibility:failed"`**

* **Emitted in:** `src/triage/validation.ts` (`phase: "booking"`), `src/store/useClinicStore.ts` (`phase: "acceptance"`), and `src/jobs/nightlyReverification.ts` (`phase: "nightly"`)

* **Registered Listeners (0):** No active listeners registered anywhere in the repository.

**`"referral:accepted"`**

* **Emitted in:** `src/store/useClinicStore.ts`

* **Registered Listeners (0):** No active listeners registered anywhere in the repository.
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
To add a new referral type, you must update the `ReferralType` union alias in `src/types/domain.ts`.

---

Core Required Code Updates

1. **Domain Type Definition**

* **File:** `src/types/domain.ts`

* Add the new string literal to `ReferralType`:

```ts

export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "yourNewType";

```

2. **Priority Policy Mapping**

* **File:** `src/config/priorityRules.ts`

* Add an entry to `referralPolicies`, which is typed as `Record<ReferralType, ReferralPolicy>`. Missing this entry causes a TypeScript compilation error when calculating scores in `src/triage/banding.ts` or searching slots in `src/scheduling/service.ts`:

```ts

yourNewType: { basePoints: 0, finder: "standard", targetHours: 72 }

```

3. **Type Humanisation Lookup**

* **File:** `src/utils/format.ts`

* Add the display string mapping to the object literal in `humaniseType(type: ReferralType)`. TypeScript will fail to compile if any union member is unmapped.

4. **Pathway Routing Handler**

* **Files:** Create `src/triage/routes/<yourNewType>.ts` and rely on `src/triage/routes/loadRoutes.ts`

* `loadRoutes()` dynamically imports all route files in `src/triage/routes/`.

* Create a new module calling `registerRoute("yourNewType", handler)`. Without registering a handler, `routeReferral(referral)` in `src/triage/routes/registry.ts` throws a runtime error when `ReferralDetailPage.tsx` loads pathway guidance for that referral type.

---

UI & Styling Updates

1. **Type Filter Select Options**

* **File:** `src/pages/ReferralListPage.tsx`

* Add a corresponding `<option value="yourNewType">` to `<select aria-label="Filter referral type">`. `useReferralFilters` in `src/hooks/useReferralFilters.ts` accepts `TypeFilter = ReferralType | "all"`, so filtering logic handles the new value once selectable in the UI.

2. **CSS Classes for Indicator Dots and Badges**

* **Files:** `src/components/ReferralTable.tsx`, `src/pages/ReferralDetailPage.tsx`, and `src/styles.css`

* `ReferralTable.tsx` outputs `<span className={clsx("type-dot", `type-${referral.type}`)} />`.

* `ReferralDetailPage.tsx` outputs `<span className={clsx("type-badge", `type-${referral.type}`)}>`.

* Add styling rules for `.type-dot.type-<yourNewType>` and `.type-badge.type-<yourNewType>` in `src/styles.css`.

---

Test Assertions & Conditional Domain Logic

1. **Route Count Test Assertion**

* **File:** `src/tests/registry.test.ts`

* Update `expect(registeredRouteCount()).toBe(4)` to `5` to account for the newly imported routing module.

2. **Conditional / Feature-Specific Logic**

* **Metric Count (`src/pages/ReferralListPage.tsx`):** If the new type should count towards time-sensitive metric calculations, update the `urgent` count predicate (`item.type === "urgent" || item.type === "safeguarding"`).

* **Eligibility Logic (`src/triage/eligibility.ts`):** Update `checkEligibility(referral)` if the new referral type enforces custom age or status constraints.

* **API Payload Redaction (`src/api/pipeline/redact-stage.ts`):** Update `redactBody()` if payloads for the new type contain sensitive fields requiring sanitisation during API requests; note that the API pipeline subsystem (`src/api/`) is defined but not reached by the running application.

* **Seed Mock Data (`src/data/seed.ts`):** Add seed records using the new type so local development and UI views can display mock data.
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
Changing the priority rules, policies, or band thresholds in `src/config/priorityRules.ts` directly impacts clinical triage calculations (`src/triage/banding.ts`), advisory UI scoring and rule matching on the referral detail view (`src/components/PriorityPanel.tsx`), slot finder dispatch strategy during appointment scheduling (`src/scheduling/service.ts`), fallback band and audit severity determination during store acceptance calls (`src/store/useClinicStore.ts`), and unit tests (`src/tests/banding.test.ts` and `src/tests/scheduling.test.ts`). Downstream referral table pills, priority filtering, and worklist summary metrics are affected only if a referral’s stored `priority` state changes as a result.

1. Triage Banding Engine (`src/triage/banding.ts`)

The function `calculateBand(referral)` directly reads `priorityRules`, `bandThresholds`, and `referralPolicies` from `src/config/priorityRules.ts`:

**Score:** Sums `referralPolicies[referral.type].basePoints` with `points` from every rule in `priorityRules` where `rule.matches(context)` evaluates to `true`.
**Suggested Priority Band:** Compares total `score` against `bandThresholds` to return the first matching `band` (`"red"`, `"amber"`, or `"green"`), defaulting to `"green"`.
**Matched Rules List:** Maps matched rules to their string IDs in `matchedRules`.
**Target Hours:** Returns `referralPolicies[referral.type].targetHours`.
2. UI Priority Guidance (`src/components/PriorityPanel.tsx` & `src/pages/ReferralDetailPage.tsx`)

Rendered on `ReferralDetailPage.tsx`, `PriorityPanel` invokes `calculateBand(referral)` to present advisory guidance:

Displays calculated score (`Score {decision.score}`) and target timeframe (`Target response within {decision.targetHours} hours`).
Highlights the matching priority option with a `Suggested` label when `decision.band === band`.
Lists matching rule IDs under "Signals considered".
**UI State & Accept Flow Isolation:** `ReferralDetailPage.tsx` initializes component state `priority` to `referral.priority ?? "green"`. Clicking "Accept referral" invokes `accept(referral.id, priority)`, passing this UI choice directly as an explicit `override`. The UI does not auto-populate stored referral state from `decision.band` unless the user explicitly selects that suggested option in the UI before accepting.
3. Slot Finder Dispatch Strategy (`src/scheduling/service.ts`)

`availableSlots(referral, clinicians)` reads `referralPolicies[referral.type].finder` to select the slot search algorithm:

**`"standard"` Finder (`src/scheduling/slotFinder.ts`):** Used for `routine`, `urgent`, and `safeguarding`. Filters active clinicians offering `referral.service`, collects unbooked future slots for that service, and sorts them chronologically by `startsAt`.
**`"continuity"` Finder (`src/scheduling/oldSlotFinder.ts`):** Used for `followUp`. Filters active clinicians offering `referral.service`, ranks clinicians placing `referral.assignedClinicianId` first before extracting unbooked slots for that service, and sorts them chronologically by `startsAt`.
Results from `availableSlots` populate `<SlotPicker />` in `src/components/SlotPicker.tsx`.
4. Store Mutations, Audit Logging, and Event Subscriptions (`src/store/useClinicStore.ts`)

When `acceptReferral(id, override)` is called:

**Fallback Priority:** If `override` is omitted (such as in headless calls or unit tests like `src/tests/eligibility.test.ts`), it calls `calculateBand(referral).band` to determine `band`.
**State Mutation:** Updates referral `status` to `"accepted"` and `priority` to `band`.
**Audit Severity:** Logs an audit entry with `severity: "critical"` if `band === "red"`, otherwise `"info"`.
**Event Channel (`src/events/channel.ts` & `src/events/types.ts`):** Emits `"referral:accepted"` with `{ referralId, band, actor }`.
**Event Subscription Reconciliation:** Per `src/events/types.ts`, three event types exist: `"referral:accepted"`, `"appointment:booked"`, and `"eligibility:failed"`. Currently, `"referral:accepted"` and `"eligibility:failed"` have zero registered listeners. Only `"appointment:booked"` has active subscribers (`src/audit/logger.ts` and `src/scheduling/eventListener.ts`). Thus, emitting `"referral:accepted"` produces no secondary runtime side effects.
5. Downstream UI, Worklist Metrics, and Filtering (`src/components/ReferralTable.tsx`, `src/hooks/useReferralFilters.ts`, `src/pages/ReferralListPage.tsx`)

If a referral's persisted `priority` field changes:

**Table Badges (`src/components/ReferralTable.tsx`):** Renders priority pills via `bandLabel(referral.priority)` styled with `priority-red`, `priority-amber`, or `priority-green`.
**Filtering (`src/hooks/useReferralFilters.ts`):** Matches priority filter selections via `band === "unbanded" ? !referral.priority : referral.priority === band`.
**Dashboard Summary (`src/pages/ReferralListPage.tsx`):** Updates the "Time sensitive" metric, which counts referrals where `priority === "red" || type === "urgent" || type === "safeguarding"`.
6. Test Suite Impact (`src/tests/banding.test.ts` & `src/tests/scheduling.test.ts`)
`src/tests/banding.test.ts` directly asserts `calculateBand` output, including safeguarding resolving to `"red"`, routine target hours evaluating to `336`, and non-empty `matchedRules`.
`src/tests/scheduling.test.ts` directly asserts `availableSlots` execution and compatibility against seed data.
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
Yes, safeguarding referrals (`type === "safeguarding"`) are treated differently across eligibility validation, priority calculation and target response SLA, pathway route guidance, workspace metrics, string formatting, and CSS styling in the live application. An additional data-redaction rule exists in the API client pipeline specifically for safeguarding referrals, but its API helper functions have no active call sites in the application UI or state store.

---

1. Active Application Workflows

#### Age-based Eligibility Rejection

**File:** `src/triage/eligibility.ts`
**Behavior:** `checkEligibility()` checks if `referral.type === "safeguarding"`. If the patient's age (calculated via `differenceInYears` using `dateOfBirth`) is under 16, eligibility fails and records `"Child safeguarding team must coordinate this referral"` in `reasons`.
**Runtime Reach:** Reached when accepting a referral (`src/store/useClinicStore.ts`), validating an appointment slot before booking (`src/triage/validation.ts`), or running reverification checks (`src/jobs/nightlyReverification.ts`).

#### Base Priority Score and Response SLA

**Files:** `src/config/priorityRules.ts` and `src/triage/banding.ts`
**Behavior:** `referralPolicies.safeguarding` defines a `basePoints` value of **8** (highest base score among referral types; `urgent` is 5, `followUp` is 1, `routine` is 0) and a `targetHours` response SLA of **4 hours** (compared to 24 hours for `urgent`, 168 for `followUp`, and 336 for `routine`).
**UI and Store Consumers:** `calculateBand()` (`src/triage/banding.ts`) consumes these values to compute the band score and target hours displayed in `PriorityPanel.tsx` and used as the default priority during acceptance in `useClinicStore.ts`. (Note: The boolean signal `signals.safeguardingConcern` is evaluated separately by the `safeguarding-signal` rule in `priorityRules.ts` to add 10 points).

#### Pathway Route Guidance and Telephone Requirement

**Files:** `src/triage/routes/safeguarding.ts`, `src/triage/routes/registry.ts`, and `src/pages/ReferralDetailPage.tsx`
**Behavior:** Registering the route handler for `"safeguarding"` via `registerRoute()` returns:

* `summary`: `"Restricted safeguarding review for ${referral.patient.name}"`

* `recommendedService`: `"Community nursing"`

* `requiresPhoneCall`: `true`

* `instructions`: `["Do not leave a voicemail", "Check safe contact method", "Notify safeguarding lead"]`

**UI Consumer:** `ReferralDetailPage.tsx` loads the route module dynamically via `loadRoutes()` (`src/triage/routes/loadRoutes.ts`) and renders the pathway summary, checklist instructions, and a warning notice stating `"Telephone contact is required before booking."`.

#### Workspace Metrics

**File:** `src/pages/ReferralListPage.tsx`
**Behavior:** The "Time sensitive" metric card counts referrals matching `item.type === "safeguarding"` alongside those where `item.priority === "red"` or `item.type === "urgent"`.

#### Label Formatting and CSS Styling

**Files:** `src/utils/format.ts` and `src/styles.css`
**Behavior:**

* `humaniseType("safeguarding")` maps to `"Safeguarding"`.

* `src/styles.css` targets `.type-dot.type-safeguarding` (background `#c65358`) and `.type-badge.type-safeguarding` (color `#9d3b42`, background `#faeaeb`) to render red alert styling.

---

2. Uncalled API Client Data Redaction
**Files:** `src/api/pipeline/redact-stage.ts`, `src/api/api-client.ts`, and `src/api/referrals-api.ts`
**Behavior:** `redactStage` evaluates `referral.type === "safeguarding"` and redacts outgoing body fields:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

**Runtime Reach:** `redactStage` is composed into `apiRequest` in `src/api/api-client.ts` and used by `submitReferral` and `recordBooking` in `src/api/referrals-api.ts`. Neither helper is invoked by any React component or store action in the running application.
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
A slot is actually booked in **`src/triage/validation.ts`** inside the **`checkAppointment()`** function, where the selected slot object's `bookedReferralId` property is directly mutated (`slot.bookedReferralId = referral.id`).

---

End-to-End Control and Data Flow

1. **UI Entry Point (`src/components/SlotPicker.tsx`)**:

Clicking "Confirm appointment" triggers `submit()`, which resolves the selected slot and calls the `onBook(slot.clinicianId, slot.id)` callback prop.

2. **Page Delegation (`src/pages/ReferralDetailPage.tsx`)**:

`ReferralDetailPage` handles `onBook()` by invoking the Zustand store action `book(referral.id, clinicianId, slotId)`.

3. **Store Execution (`src/store/useClinicStore.ts`)**:

`useClinicStore.bookAppointment()` retrieves the matching `referral` and `clinician` from store state and calls `checkAppointment(referral, clinician, slotId, state.actor)`.

4. **Slot Mutation & Event Emission (`src/triage/validation.ts`)**:

`checkAppointment()` processes the booking:

- Validates patient eligibility via `checkEligibility(referral)` in `src/triage/eligibility.ts`.

- Confirms the slot exists on `clinician.slots`, is unbooked (`!slot.bookedReferralId`), and matches the referral's requested service.

- Directly mutates the slot in memory: `slot.bookedReferralId = referral.id`.

- Constructs an `Appointment` object and emits the `"appointment:booked"` event via `clinicEvents` (`src/events/channel.ts`).

5. **Store State Updates & Audit (`src/store/useClinicStore.ts`)**:

Upon receiving the returned `Appointment` object, `bookAppointment()`:

- Appends the appointment to `state.appointments`.

- Updates the target referral in state to `status: "booked"`, `appointmentId: appointment.id`, and `assignedClinicianId: clinicianId`.

- Appends an audit entry to store state via `addAudit()`.

6. **Event Subscriptions (`src/scheduling/eventListener.ts` and `src/audit/logger.ts`)**:

Modules imported at application initialization (`src/App.tsx`) react to the `"appointment:booked"` event:

- `src/scheduling/eventListener.ts` adds `appointment.slotId` to its module-scoped `recentlyBooked` Set.

- `src/audit/logger.ts` prepends an audit entry to its module-scoped `eventEntries` array.

---

Non-Production Call Sites and Unused Helpers
**Test Call Site (`src/tests/scheduling.test.ts`)**:

`checkAppointment()` is called directly in unit tests to test successful booking and slot collision prevention.

**Unused Immutable Helper (`src/scheduling/service.ts`)**:

`reserveSlot()` is exported as an immutable slot update helper (`return { ...slot, bookedReferralId: referralId }`), but it is defined but not reached by the running application or tests.

**Unused API Endpoint Helper (`src/api/referrals-api.ts`)**:

`recordBooking()` is exported to send booking state to an HTTP API endpoint, but it is defined but not reached by the running application.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

