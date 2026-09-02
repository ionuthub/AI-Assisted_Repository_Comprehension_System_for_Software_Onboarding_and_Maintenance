# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 63cd5ab7b305d416eb18e37a91975e4eb57a1021d8cd9effeec076297a1e3979 -->

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
Execution starts when the browser loads `index.html`, which requests and executes `src/main.tsx` via a native ES module script tag (`index.html`, lines 1–3).

Detailed Execution Flow

1. **HTML Document Loading (`index.html`)**

The browser fetches and parses `index.html`, which defines the root DOM container `<div id="root"></div>` and includes the module script entry point (`index.html`, lines 1–3):

```html

<script type="module" src="/src/main.tsx"></script>

```

2. **Module Evaluation & Side-Effect Initialization (`src/main.tsx`, `src/App.tsx`)**

Executing `src/main.tsx` triggers the synchronous evaluation of its import dependency tree before running top-level code (`src/main.tsx`, lines 1–5):

* **Styles**: `./styles.css` is imported and applied to the document (`src/styles.css`, lines 1–1677).

* **Event Listeners**: `src/App.tsx` executes top-level module side-effect imports (`src/App.tsx`, lines 7–8):

* `src/scheduling/eventListener.ts` subscribes a listener to the `appointment:booked` event on the global `clinicEvents` channel (`src/scheduling/eventListener.ts`, lines 1–9).

* `src/audit/logger.ts` subscribes a listener to the `appointment:booked` event on `clinicEvents` to prepend audit records to `eventEntries` (`src/audit/logger.ts`, lines 1–18).

* **Store State**: `src/store/useClinicStore.ts` (imported by layout and page components) initializes the global Zustand store at module scope, cloning initial seed datasets (`seedReferrals`, `seedClinicians`, `seedAudit`) from `src/data/seed.ts` (`src/store/useClinicStore.ts`, lines 22–27).

3. **React Mount (`src/main.tsx`)**

After module dependencies evaluate, `src/main.tsx` queries `#root` from the DOM and invokes `ReactDOM.createRoot`, rendering `<App />` wrapped in `<React.StrictMode>` into the DOM (`src/main.tsx`, lines 6–11).

4. **App Rendering & Initial Route (`src/App.tsx`)**

React renders `<App />`, instantiating `<BrowserRouter>` and configuring route matching (`src/App.tsx`, lines 9–23):

* `<Layout />` renders the persistent sidebar shell and reads active user (`actor`) and incoming count state from `useClinicStore` (`src/components/Layout.tsx`, lines 10–67).

* At the root URL (`/`), React Router matches the index route and mounts `<ReferralListPage />` inside the layout `<Outlet />` (`src/App.tsx`, line 14; `src/pages/ReferralListPage.tsx`, lines 5–116).
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
A referral receives its priority band through a clinical scoring calculation that determines a suggested band (`"red"`, `"amber"`, or `"green"`), which a user can select and persist to state on the referral detail page via the `acceptReferral` action [`src/pages/ReferralDetailPage.tsx`](src/pages/ReferralDetailPage.tsx), [`src/store/useClinicStore.ts`](src/store/useClinicStore.ts).

---

1. Calculation Logic (`calculateBand`)

The system calculates a suggested priority band in [`src/triage/banding.ts`](src/triage/banding.ts) using rules and thresholds defined in [`src/config/priorityRules.ts`](src/config/priorityRules.ts):

1. **Base Points**: Points determined by `referralPolicies` based on `referral.type`:

- `safeguarding`: 8 base points (target response: 4 hours)

- `urgent`: 5 base points (target response: 24 hours)

- `followUp`: 1 base point (target response: 168 hours)

- `routine`: 0 base points (target response: 336 hours)

2. **Matched Signal Rules**: Points added for each rule in `priorityRules` where `matches(context)` evaluates to `true`:

- `safeguarding-signal` (+10 points): `safeguardingConcern === true`

- `rapid-deterioration` (+7 points): `deterioration === true` and `painScore >= 7`

- `severe-pain` (+4 points): `painScore >= 7`

- `post-discharge` (+3 points): `recentDischarge === true`

- `mobility` (+2 points): `mobilityRisk === true`

- `persistent-symptoms` (+1 point): `symptomDays > 21`

3. **Threshold Mapping**: The total score (`basePoints + matched rule points`) is checked against ordered thresholds in `bandThresholds`:

- **Score $\ge$ 9**: `"red"` (Priority 1)

- **Score $\ge$ 4**: `"amber"` (Priority 2)

- **Score $\ge$ 0**: `"green"` (Priority 3)

The calculation returns a `BandingDecision` containing `{ band, score, matchedRules, targetHours }`.

---

2. UI Presentation and Selection
**Display**: [`src/components/PriorityPanel.tsx`](src/components/PriorityPanel.tsx) executes `calculateBand(referral)` to render the total score, matched rules, target response time, and a "Suggested" tag next to the calculated band option.
**State Initialization**: In [`src/pages/ReferralDetailPage.tsx`](src/pages/ReferralDetailPage.tsx), local React state initializes as `const [priority, setPriority] = useState<PriorityBand>(referral?.priority ?? "green")`. Note that `referral.priority` defaults to the existing stored priority band (or `"green"` if unassigned), rather than automatically adopting the newly calculated suggested band.
**User Selection**: Clicking an option in `PriorityPanel` calls `onSelect(band)`, updating local state via `setPriority`. Clicking **"Accept referral"** or **"Update priority"** triggers `accept(referral.id, priority)` on the clinic store.

---

3. Store Mutation, Audit, and Event Execution

When `acceptReferral(id, override)` executes in [`src/store/useClinicStore.ts`](src/store/useClinicStore.ts):

1. **Eligibility Guard**: Calls `checkEligibility(referral)` from [`src/triage/eligibility.ts`](src/triage/eligibility.ts). If ineligible, it emits `eligibility:failed` over `clinicEvents` ([`src/events/channel.ts`](src/events/channel.ts)) and throws an error, aborting store updates.

2. **State Mutation**: Updates the referral in `referrals`, setting `status: "accepted"` and `priority: band`. The live UI callers in `ReferralDetailPage.tsx` pass `priority` as an explicit argument. The fallback `override ?? calculateBand(referral).band` inside `acceptReferral` is bypassed in the live app and reached only when `acceptReferral` is called without a second argument (e.g. in tests such as [`src/tests/eligibility.test.ts`](src/tests/eligibility.test.ts)).

3. **Audit Entry**: Appends an entry to the `audit` state array with `action: "Referral accepted"`, `detail: "Priority assigned: ${band}"`, and `severity: band === "red" ? "critical" : "info"`.

4. **Event Emission**: Emits `referral:accepted` over `clinicEvents` with payload `{ referralId: id, band, actor: get().actor }` (there are currently no registered listeners for `referral:accepted`).

*(Note: The `setPriority(id, band)` mutation action on `useClinicStore` is defined but not reached by the running application; the UI persists priority assignments through `acceptReferral`).*
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
The processing logic for a given referral type (`routine`, `urgent`, `followUp`, `safeguarding`) is defined in `src/config/priorityRules.ts` and `src/triage/routes/`, and executed across `src/triage/banding.ts`, `src/scheduling/service.ts`, `src/triage/eligibility.ts`, `src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`, and `src/utils/format.ts` (with an API redaction pipeline defined in `src/api/pipeline/redact-stage.ts` but not reached at runtime).

---

1. Priority Policy and Target Determination

**File:** `src/config/priorityRules.ts`

`referralPolicies` maps each `ReferralType` to operational policy parameters:

**`routine`**: `{ basePoints: 0, finder: "standard", targetHours: 336 }`
**`urgent`**: `{ basePoints: 5, finder: "standard", targetHours: 24 }`
**`followUp`**: `{ basePoints: 1, finder: "continuity", targetHours: 168 }`
**`safeguarding`**: `{ basePoints: 8, finder: "standard", targetHours: 4 }`

**Consumer:** `src/triage/banding.ts` (`calculateBand`)

`calculateBand` reads `referralPolicies[referral.type]` to supply the `basePoints` added to matched rule points when calculating the total clinical score, and attaches `targetHours` to the returned `BandingDecision`. `calculateBand` provides suggested output to UI panels (`src/components/PriorityPanel.tsx`); it does not automatically pre-populate or mutate store state.

---

2. Slot Finder Algorithm Dispatch

**File:** `src/scheduling/service.ts`

`availableSlots(referral, clinicians)` reads `referralPolicies[referral.type].finder` to choose the slot lookup algorithm:

**`"standard"`** (`routine`, `urgent`, `safeguarding`): Dispatches to `findSlots` (`src/scheduling/slotFinder.ts`), which filters active clinicians matching `referral.service`, collects future unbooked slots, and sorts them chronologically.
**`"continuity"`** (`followUp`): Dispatches to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`), which filters active clinicians by `referral.service`, ranks clinicians to prioritize `referral.assignedClinicianId`, collects unbooked slots matching `referral.service`, and sorts them chronologically.

---

3. Dynamic Pathway Guidance Routines
Files:
`src/triage/routes/registry.ts`
`src/triage/routes/loadRoutes.ts`
`src/triage/routes/routine.ts`
`src/triage/routes/urgent.ts`
`src/triage/routes/followUp.ts`
`src/triage/routes/safeguarding.ts`
`src/pages/ReferralDetailPage.tsx`

`routeReferral` in `src/triage/routes/registry.ts` dispatches `referral.type` to dynamic handlers registered during execution via `loadRoutes()` (`src/triage/routes/loadRoutes.ts`). When loaded by `ReferralDetailPage`, the route handler generates pathway guidance displayed on screen:

**`routine`**: Standard summary, sets `recommendedService` to `referral.service`, `requiresPhoneCall: false`.
**`urgent`**: Urgent review summary, `recommendedService: referral.service`, `requiresPhoneCall: true`.
**`followUp`**: Review summary, `recommendedService: referral.service`, `requiresPhoneCall: false`.
**`safeguarding`**: Restricted review summary, sets `recommendedService` to `"Community nursing"`, `requiresPhoneCall: true`.

---

4. Safeguarding-Specific Enforcements

#### A. Age Eligibility Restriction

**File:** `src/triage/eligibility.ts`

`checkEligibility` checks `if (referral.type === "safeguarding" && age < 16)`. If matched, it records `"Child safeguarding team must coordinate this referral"` in `reasons`, rendering `eligible: false`. This blocks referral acceptance in `src/store/useClinicStore.ts`, prevents appointment booking in `src/triage/validation.ts`, and flags failures during automated checks in `src/jobs/nightlyReverification.ts`.

#### B. API Request Payload Redaction (Defined but Not Reached)

Files:
`src/api/pipeline/redact-stage.ts`
`src/api/referrals-api.ts`
`src/api/api-client.ts`

`redactStage` inspects `referral.type === "safeguarding"` in request bodies passed through `apiRequest` (invoked by `submitReferral` and `recordBooking`). However, because no UI component, store action, background job, or entry point calls these API helpers, this redaction subsystem is defined but not reached by the running application.

---

5. UI Workspace Filtering, Metrics, and Formatting
Files:
`src/pages/ReferralListPage.tsx`: Evaluates `item.priority === "red" || item.type === "urgent" || item.type === "safeguarding"` to compute the "Time sensitive" list metric.
`src/hooks/useReferralFilters.ts`: Applies `type === "all" || referral.type === type` in `useMemo` to filter referrals displayed in `ReferralTable`.
`src/utils/format.ts`: `humaniseType` maps `referral.type` to display strings (`"Routine"`, `"Urgent"`, `"Follow-up"`, `"Safeguarding"`).
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
Eligibility is checked via `checkEligibility()` at **3 direct call sites** in the application codebase, which are triggered by **2 UI pages** at runtime and exercised by **2 test files**.

---

1. Function Definition
**`src/triage/eligibility.ts`**

* `checkEligibility(referral)` defines the rules evaluating patient age, postcode prefix (`LS`), registered practice recording, declined referral status, and child safeguarding age limits.

---

2. Direct Call Sites
**Referral Acceptance Action** — `src/store/useClinicStore.ts`

* **Function:** `acceptReferral(id, override)`

* **Flow:** Runs `checkEligibility(referral)`. If non-eligible, it emits `eligibility:failed` (with `phase: "acceptance"`) and throws an error before any store mutation occurs.

**Appointment Validation Helper** — `src/triage/validation.ts`

* **Function:** `checkAppointment(referral, clinician, slotId, actor)`

* **Flow:** Runs `checkEligibility(referral)`. If non-eligible, it emits `eligibility:failed` (with `phase: "booking"`) and throws an error, blocking appointment creation.

**Nightly Reverification Job** — `src/jobs/nightlyReverification.ts`

* **Function:** `runNightlyReverification(referrals)`

* **Flow:** Filters candidates with status `"accepted"` or `"booked"` and executes `checkEligibility(referral)` for each. Non-eligible items trigger an `eligibility:failed` event (with `phase: "nightly"`) and accumulate in the returned failures report.

---

3. UI Entry Points
**Referral Detail Page** — `src/pages/ReferralDetailPage.tsx`

* **Accept / Update Priority Button:** `onAccept` calls `acceptReferral()`, triggering `checkEligibility()` in `src/store/useClinicStore.ts`.

* **Slot Picker Booking Action:** `onBook` calls `bookAppointment()`, which invokes `checkAppointment()` in `src/triage/validation.ts` and runs `checkEligibility()`.

**Audit Log Page** — `src/pages/AuditLogPage.tsx`

* **Run Eligibility Check Button:** `verify` calls `runNightlyReverification()`, executing `checkEligibility()` for all accepted and booked referrals.

---

4. Test Executions
**`src/tests/eligibility.test.ts`**: Indirectly executes `checkEligibility()` through store calls to `acceptReferral()`.
**`src/tests/scheduling.test.ts`**: Direct caller of `checkAppointment()`, executing `checkEligibility()` during appointment validation testing.
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
Before an outgoing API request is sent, it passes sequentially through a composed middleware pipeline of three stages (`traceStage` -> `authStage` -> `redactStage`) defined in `src/api/api-client.ts` before reaching the terminal `transport` handler.

---

Request Pipeline Execution Order

When an API request is made via `apiRequest()` in `src/api/api-client.ts`, missing `headers` default to `{}`. The pipeline is composed via `stages.reduceRight(...)` using `[traceStage, authStage, redactStage]` with `transport` as the terminal call, resulting in the following execution sequence:

1. **Trace Identifier Assignment (`traceStage`)**

- File: `src/api/pipeline/trace-stage.ts`

- Generates a trace string using `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`.

- Adds `"X-Trace-Id"` with this trace ID to `request.headers`.

2. **Authentication Enrichment (`authStage`)**

- File: `src/api/pipeline/auth-stage.ts`

- Adds authentication and role headers to `request.headers`:

- `Authorization: "Bearer clinic-session"`

- `"X-Staff-Role": "triage"`

3. **Data Redaction (`redactStage`)**

- File: `src/api/pipeline/redact-stage.ts`

- Inspects `request.body`. If `body` contains a referral where `type === "safeguarding"` and a `patient` object is present, sensitive clinical and patient contact fields are redacted in a copy of the request body:

- `notes` is set to `"[restricted clinical note]"`

- `patient.phone` is set to `"[safe contact required]"`

- `patient.postcode` is set to `"[restricted]"`

- If the request body is missing, not a safeguarding referral, or missing a `patient` object, the body passes through unmutated.

4. **Terminal Transport (`transport`)**

- File: `src/api/api-client.ts`

- Receives the fully transformed request and returns a Promise resolving to a mock `ApiResponse` with `status: 200`, `data` set to `request.body ?? { ok: true }`, and `requestId` set to `request.headers["X-Trace-Id"] ?? "local"`.

---

Application Reachability & Usage
**Direct Evidence:** The pipeline helper `apiRequest` is imported and called by exported functions `submitReferral` and `recordBooking` in `src/api/referrals-api.ts`.
**Inference / Reachability:** Neither `apiRequest` nor `src/api/referrals-api.ts` is imported or executed by active UI pages (such as `src/pages/ReferralDetailPage.tsx`), store logic (`src/store/useClinicStore.ts`), or existing test suites, as application triage operations currently run in-memory against local Zustand state.
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
`checkAppointment` does not only check—when validation succeeds, it mutates the passed `clinician` object's slot in place and emits an event that updates module-scoped state in two listeners. If validation fails on eligibility, it emits an event before throwing an error.

1. In-Place Object Mutation

When validation succeeds, `checkAppointment` directly assigns the referral ID to the matching slot's `bookedReferralId` property on the supplied `clinician` object:

```ts

slot.bookedReferralId = referral.id;

```

*Citation:* `src/triage/validation.ts`

When called via `useClinicStore.ts` (`bookAppointment`), the `clinician` argument is a reference to a `Clinician` object stored in Zustand state (`src/store/useClinicStore.ts`), so mutating `slot.bookedReferralId` mutates that object in place.

---

2. Event Emissions & Listener Reactions

`checkAppointment` emits side-effect events over the shared `clinicEvents` bus (`src/events/channel.ts`):

1. **`"appointment:booked"`** (emitted on successful validation):

```ts

clinicEvents.emit("appointment:booked", {

appointment,

patientName: referral.patient.name,

});

```

*Citation:* `src/triage/validation.ts`

This event triggers two registered listener reactions:

* **Audit Logging:** `src/audit/logger.ts` unshifts a new audit entry into its module-scoped `eventEntries` array (read by UI in `src/pages/AuditLogPage.tsx` via `getEventAudit()`).

* **Slot Tracking:** `src/scheduling/eventListener.ts` adds `appointment.slotId` to its module-scoped `recentlyBooked` set (the helper `wasRecentlyBooked()` is defined but not reached by any caller in the running application).

2. **`"eligibility:failed"`** (emitted when `checkEligibility` returns `eligible: false` during booking):

```ts

clinicEvents.emit("eligibility:failed", {

referralId: referral.id,

reasons: eligibility.reasons,

phase: "booking",

});

```

*Citation:* `src/triage/validation.ts`

---

3. Complete Event Bus Reconciliations

Across the codebase, the event type inventory in `src/events/types.ts` defines three event types:

**`"appointment:booked"`**: Emitted in `src/triage/validation.ts`. Has 2 active subscribers (`src/audit/logger.ts` and `src/scheduling/eventListener.ts`).
**`"eligibility:failed"`**: Emitted in `src/triage/validation.ts`, `src/store/useClinicStore.ts`, and `src/jobs/nightlyReverification.ts`. Has **0 active subscribers**.
**`"referral:accepted"`**: Emitted in `src/store/useClinicStore.ts`. Has **0 active subscribers**.

`src/App.tsx` imports `./scheduling/eventListener` and `./audit/logger` at top-level module load to register the listeners for `"appointment:booked"`.

---

4. Callers and Runtime Contexts
**Application Runtime Path:** Invoked inside Zustand state action `bookAppointment` (`src/store/useClinicStore.ts`), which is triggered when `SlotPicker` submits `onBook` (`src/components/SlotPicker.tsx`, `src/pages/ReferralDetailPage.tsx`).
**Test Context:** Called directly in `src/tests/scheduling.test.ts` to verify slot assignment and double-booking prevention errors.
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
The **`findContinuitySlots`** function in `src/scheduling/oldSlotFinder.ts` runs for a follow-up referral.

Why this implementation runs

1. **Policy Configuration by Referral Type** (`src/config/priorityRules.ts`)

The `referralPolicies` object configures referral rules by type. For the `"followUp"` key, the policy sets `finder` to `"continuity"`:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

/* ... */

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

/* ... */

};

```

2. **Finder Dispatch in Scheduling Service** (`src/scheduling/service.ts`)

When `availableSlots(referral, clinicians)` is executed:

- It reads `referralPolicies[referral.type].finder`, which returns `"continuity"` for follow-up referrals.

- It looks up `"continuity"` in the `finders` registry object (`Record<string, SlotFinder>`), resolving to `findContinuitySlots`.

- It invokes `findContinuitySlots` passing `referral`, `clinicians`, and `preferredClinicianId: referral.assignedClinicianId`:

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

3. **Runtime Execution Path** (`src/pages/ReferralDetailPage.tsx` and `src/components/SlotPicker.tsx`)

When a coordinator views a referral detail page and the booking interface is displayed (`showBooking || referral.status === "accepted"`), `ReferralDetailPage` renders `<SlotPicker referral={referral} clinicians={clinicians} onBook={onBook} />`. Inside `SlotPicker`, `useMemo` invokes `availableSlots(referral, clinicians)`, triggering the dispatch pipeline and running `findContinuitySlots`.

4. **Implementation Behavior** (`src/scheduling/oldSlotFinder.ts`)

When executed, `findContinuitySlots`:

- Filters `clinicians` to those that are active (`clinician.active`) and support the referral's service (`clinician.services.includes(referral.service)`).

- Ranks matching clinicians so that any clinician matching `preferredClinicianId` (`referral.assignedClinicianId`) is prioritized first.

- Flattens and filters clinician slots to include only unbooked slots (`!slot.bookedReferralId`) that match `referral.service`.

- Orders all remaining candidate slots chronologically ascending (`compareAsc`) by start date (`startsAt`).
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
When an `"appointment:booked"` scheduling event is emitted on the `clinicEvents` channel (`src/events/channel.ts`), two registered listeners react to it: `src/audit/logger.ts` and `src/scheduling/eventListener.ts`. If scheduling fails due to an ineligible referral, an `"eligibility:failed"` event with `phase: "booking"` is emitted from `src/triage/validation.ts`, but no listeners are registered for it.

Both active listeners are registered at application startup when `src/App.tsx` imports `./scheduling/eventListener` and `./audit/logger` during top-level module evaluation.

Active Event Reactions (`"appointment:booked"`)

1. **Audit Logger (`src/audit/logger.ts`)**

* **Trigger:** Subscribes to `"appointment:booked"` on `clinicEvents` (`src/events/channel.ts`).

* **Reaction:** Receives `{ appointment, patientName }` and unshifts an `AuditEntry` object into the module-level `eventEntries` array.

* **Created Record:**

* `id`: `"event-${appointment.id}"`

* `occurredAt`: current ISO timestamp string (`new Date().toISOString()`)

* `actor`: `appointment.bookedBy`

* `action`: `"Appointment booked"`

* `referralId`: `appointment.referralId`

* `detail`: `"Booked ${patientName} with clinician ${appointment.clinicianId}"`

* `severity`: `"info"`

* **Downstream UI Consumer:** The exported `getEventAudit()` function returns a shallow copy of `eventEntries`. In `AuditLogPage` (`src/pages/AuditLogPage.tsx`), these entries are prepended to store audit records (`[...getEventAudit(), ...audit]`) and rendered in the searchable audit list.

2. **Scheduling Event Tracker (`src/scheduling/eventListener.ts`)**

* **Trigger:** Subscribes to `"appointment:booked"` on `clinicEvents` (`src/events/channel.ts`).

* **Reaction:** Receives `{ appointment }` and adds `appointment.slotId` to the module-scoped `recentlyBooked` (`Set<string>`).

* **Downstream Access:** Exposes `wasRecentlyBooked(slotId)` to query the set. However, no component, store, or test in the codebase currently calls `wasRecentlyBooked`, so this query helper is defined but not reached by the running application.

---

Unhandled Event Channel Emissions (`src/events/types.ts`)

Across the repository, `"appointment:booked"` is the only event type with active listeners. The other declared event types have zero registered subscribers:

**`"eligibility:failed"`:** Emitted in three places:

* `src/triage/validation.ts` during appointment booking (`phase: "booking"`)

* `src/store/useClinicStore.ts` during referral acceptance (`phase: "acceptance"`)

* `src/jobs/nightlyReverification.ts` during eligibility checks (`phase: "nightly"`)

**`"referral:accepted"`:** Emitted in `src/store/useClinicStore.ts` when accepting a referral.
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
To add a new referral type, update the domain type union in `src/types/domain.ts`, add its policy configuration in `src/config/priorityRules.ts`, add its display string mapping in `src/utils/format.ts`, create a new route handler module in `src/triage/routes/`, update the filter select options in `src/pages/ReferralListPage.tsx`, and adjust the expected route count assertion in `src/tests/registry.test.ts`.

---

Required Repository Changes

1. **Domain Type Definition**

* **File:** `src/types/domain.ts`

* **Change:** Add the new type string literal to the exported `ReferralType` union:

```ts

export type ReferralType =

| "routine"

| "urgent"

| "followUp"

| "safeguarding"

| "yourNewType";

```

2. **Policy Configuration**

* **File:** `src/config/priorityRules.ts`

* **Change:** Add an entry for the new type to `referralPolicies`. Because `referralPolicies` is typed as `Record<ReferralType, ReferralPolicy>`, TypeScript enforces defining `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

// ...existing policies

yourNewType: { basePoints: 0, finder: "standard", targetHours: 72 },

};

```

3. **Display Formatting**

* **File:** `src/utils/format.ts`

* **Change:** Add a display label mapping in `humaniseType()` to ensure human-readable text is returned:

```ts

export function humaniseType(type: ReferralType): string {

return {

routine: "Routine",

urgent: "Urgent",

followUp: "Follow-up",

safeguarding: "Safeguarding",

yourNewType: "Your New Type",

}[type];

}

```

4. **Pathway Route Handler Registration**

* **File:** `src/triage/routes/<yourNewType>.ts` *(New file)*

* **Detail:** Create a new route file that calls `registerRoute()`. Modules in `src/triage/routes/` (excluding `registry.ts` and `loadRoutes.ts`) are automatically imported at runtime by `loadRoutes()` via `import.meta.glob`.

```ts

import { registerRoute } from "./registry";

registerRoute("yourNewType", (referral) => ({

summary: `Pathway summary for ${referral.reason}`,

recommendedService: referral.service,

requiresPhoneCall: false,

instructions: ["Review details", "Assign clinician"],

}));

```

* **Runtime Impact:** If a referral of the new type is viewed on `src/pages/ReferralDetailPage.tsx` without a registered route handler, `routeReferral()` in `src/triage/routes/registry.ts` throws an unhandled `Error: No routing handler registered for <type>`.

5. **UI Filter Options**

* **File:** `src/pages/ReferralListPage.tsx`

* **Change:** Add an `<option>` element matching the new type value to the hard-coded pathway `<select>` dropdown:

```tsx

<option value="yourNewType">Your New Type</option>

```

6. **Route Registry Unit Tests**

* **File:** `src/tests/registry.test.ts`

* **Change:** Update the count assertion in the test suite to account for the newly registered module:

```ts

it("loads four handlers dynamically", () =>

expect(registeredRouteCount()).toBe(5));

```

---

Optional / Conditional Changes
**CSS Indicators (`src/styles.css`):**

`src/components/ReferralTable.tsx` and `src/pages/ReferralDetailPage.tsx` generate dynamic CSS class names using `type-${referral.type}` (e.g., `type-dot type-<type>` and `type-badge type-<type>`). Add custom rule sets such as `.type-dot.type-yourNewType` and `.type-badge.type-yourNewType` in `src/styles.css` if custom badge colors or dot indicators are needed.

**API Redaction Pipeline (`src/api/pipeline/redact-stage.ts`):**

The API pipeline in `src/api/` is defined but not currently reached by the running application (the store mutates state directly). If outbound API integration is invoked and referrals of the new type contain sensitive clinical information requiring redaction, update the `referral.type !== "safeguarding"` guard in `redactBody()`.
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
Changing the rules, policies, or thresholds in `src/config/priorityRules.ts` directly affects the clinical banding calculation (`src/triage/banding.ts`) and the slot finder algorithm selected during scheduling dispatch (`src/scheduling/service.ts`). Downstream, this alters suggested triage information rendered in `PriorityPanel.tsx`, available appointment slot search behaviour in `SlotPicker.tsx`, fallback logic in store acceptance, stored referral priority (when calculated without explicit user override), and unit test assertions in `src/tests/banding.test.ts`, `src/tests/scheduling.test.ts`, and `src/tests/eligibility.test.ts`.

---

1. Direct Triage and Scheduling Logic
**Triage Banding (`src/triage/banding.ts`)**

`calculateBand(referral)` evaluates `priorityRules`, `referralPolicies`, and `bandThresholds`. Modifying points, matches conditions, base points, or threshold minimums recalculates:

* `score`: Sum of `referralPolicies[referral.type].basePoints` plus `points` for all matched `priorityRules`.

* `band`: Selected by matching `score >= minimum` against `bandThresholds` (defaults to `"green"` if no threshold is met).

* `matchedRules`: IDs of rules whose `matches(context)` predicate returned `true`.

* `targetHours`: Target turnaround derived from `referralPolicies[referral.type].targetHours`.

**Slot Search Dispatch (`src/scheduling/service.ts`)**

`availableSlots(referral, clinicians)` selects its search implementation via `referralPolicies[referral.type].finder`:

* **`"standard"` (`src/scheduling/slotFinder.ts`):** Filters active clinicians covering `referral.service`, flattens their slots matching `referral.service`, retains unbooked slots with `startsAt` after the current time (`isAfter`), and sorts them ascending by start date.

* **`"continuity"` (`src/scheduling/oldSlotFinder.ts`):** Filters active clinicians covering `referral.service`, orders clinicians to prefer `referral.assignedClinicianId` before flattening unbooked slots matching `referral.service`, and sorts the final slot list ascending by start date.

---

2. UI Display and User Workflows
**Priority Panel (`src/components/PriorityPanel.tsx`)**

Calls `calculateBand(referral)` on render to display:

* Total calculated score (`Score <score>`).

* Suggested priority band label (`Suggested band: <bandLabel>`) and the `<em>Suggested</em>` indicator on the corresponding priority option button.

* Target turnaround notice (`Target response within <targetHours> hours`).

* Signals list under "Signals considered" built from `decision.matchedRules`.

* *Note on state pre-population:* The suggested band from `calculateBand` does **not** pre-populate selection state in `ReferralDetailPage.tsx`. The detail page initializes its `priority` state independently using `referral?.priority ?? "green"`.

**Slot Picker (`src/components/SlotPicker.tsx`)**

Rendered on `ReferralDetailPage.tsx` when a referral is accepted or active booking is shown. It calls `availableSlots(referral, clinicians)` and displays up to the top 12 slots returned by the policy-selected slot finder.

---

3. Store State, Event Channel, and Downstream Consumers
**Store Acceptance Fallback (`src/store/useClinicStore.ts`)**

In `acceptReferral(id, override)`:

* **Live UI Reach:** In `ReferralDetailPage.tsx`, the UI button handler calls `accept(referral.id, priority)`, explicitly passing the user's selected `priority` state as `override`. As a result, the live UI bypasses `calculateBand` during store acceptance.

* **Test / Unargumented Calls:** When `override` is omitted (such as in `src/tests/eligibility.test.ts`), `acceptReferral` falls back to `calculateBand(referral).band`.

**Stored Priority Effects**

When a referral's stored `priority` field is saved (via store action or seeded state):

* **Workspace Metrics (`src/pages/ReferralListPage.tsx`):** The "Time sensitive" metric counts referrals where `priority === "red"` alongside `type === "urgent"` and `type === "safeguarding"`.

* **Referral Filtering (`src/hooks/useReferralFilters.ts`):** Filtering by priority band matches `referral.priority` against `"red"`, `"amber"`, `"green"`, or `"unbanded"`.

* **Table Rendering (`src/components/ReferralTable.tsx`):** Formats priority badges using `bandLabel(referral.priority)` and CSS classes (`priority-red`, `priority-amber`, `priority-green`).

* **Audit Log (`src/store/useClinicStore.ts`):** Records audit detail as `"Priority assigned: <band>"`.

**Event Channel Reconciliations (`src/events/channel.ts`, `src/events/types.ts`)**

`acceptReferral` emits `"referral:accepted"` carrying `{ referralId, band, actor }`. Across the application:

* Subscriptions exist for `"appointment:booked"` in `src/audit/logger.ts` (records audit entry) and `src/scheduling/eventListener.ts` (tracks recently booked slots).

* No in-repo subscribers (`0` registered listeners) exist for `"referral:accepted"` or `"eligibility:failed"`.

---

4. Automated Tests Affected
**`src/tests/banding.test.ts`:** Directly invokes `calculateBand(referral)` and asserts rule matching, safeguarding priority band (`"red"`), and routine target hours (`336`).
**`src/tests/scheduling.test.ts`:** Calls `availableSlots(referral, clinicians)` to verify slot service compatibility and booking validation.
**`src/tests/eligibility.test.ts`:** Calls `acceptReferral(id)` without passing an `override` parameter, directly executing the `calculateBand(referral).band` fallback branch in `useClinicStore.ts`.
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
Yes, safeguarding referrals (type `"safeguarding"`) and referrals with safeguarding risk signals (`signals.safeguardingConcern === true`) are treated specifically across six areas in the application: eligibility checks, priority banding, pathway routing, workspace metrics, clinical risk tags, visual UI styling, and API request redaction.

1. Eligibility Check
**File:** `src/triage/eligibility.ts`
**Behavior:** `checkEligibility` checks if `referral.type === "safeguarding"` and the calculated patient age is under 16 (`differenceInYears` relative to `patient.dateOfBirth`). If both conditions are met, eligibility fails (`eligible: false`) with the reason: `"Child safeguarding team must coordinate this referral"`.
**Reach:** Reached when accepting a referral (`acceptReferral` in `src/store/useClinicStore.ts`), booking an appointment (`checkAppointment` in `src/triage/validation.ts`), or running `runNightlyReverification` (`src/jobs/nightlyReverification.ts`).
2. Priority Banding & Target SLA
**File:** `src/config/priorityRules.ts`
**Behavior:**

* **Policy Defaults (`referralPolicies`):** The `"safeguarding"` type has a base score of `8` points (compared to `0` for routine, `1` for follow-up, and `5` for urgent) and a target response SLA of `4` hours (`targetHours`).

* **Rule Escalation (`priorityRules`):** The `safeguarding-signal` rule matches whenever `signals.safeguardingConcern` is `true`, adding `10` points to the banding calculation (`calculateBand` in `src/triage/banding.ts`). Because the threshold for `"red"` priority in `bandThresholds` is `9` points, matching this signal guarantees assignment to the `red` band (Priority 1).

3. Pathway Routing Guidance
**Files:** `src/triage/routes/safeguarding.ts`, `src/triage/routes/registry.ts`, `src/pages/ReferralDetailPage.tsx`
**Behavior:** `src/triage/routes/safeguarding.ts` registers a dedicated pathway route handler for type `"safeguarding"`. When loaded on `ReferralDetailPage.tsx` via `loadRoutes()`, `routeReferral(referral)` returns:

* Summary: `"Restricted safeguarding review for [Patient Name]"`

* Recommended service: `"Community nursing"`

* `requiresPhoneCall`: `true` (renders a warning notice stating telephone contact is required prior to booking)

* Specific instructions: `"Do not leave a voicemail"`, `"Check safe contact method"`, and `"Notify safeguarding lead"`

**Note:** `recommendedService` is displayed as pathway guidance in the route outcome UI and does not automatically overwrite the referral's existing `service` field in state.
4. Workspace Metrics & Risk Signals
**Files:** `src/pages/ReferralListPage.tsx`, `src/pages/ReferralDetailPage.tsx`
**Behavior:**

* In `ReferralListPage.tsx`, the **Time sensitive** summary metric counts referrals where `item.type === "safeguarding"` alongside `item.type === "urgent"` or `item.priority === "red"`.

* In `ReferralDetailPage.tsx`, when `referral.signals.safeguardingConcern` is `true`, a dedicated `"Safeguarding"` risk tag is rendered under Clinical Signals.

5. Visual UI Styling
**Files:** `src/styles.css`, `src/components/ReferralTable.tsx`, `src/pages/ReferralDetailPage.tsx`
**Behavior:** In `src/styles.css`, `.type-dot.type-safeguarding` (rendered in `ReferralTable.tsx`) and `.type-badge.type-safeguarding` (rendered in `ReferralDetailPage.tsx`) share red alert styling (`#c65358` background for dots; `#faeaeb` background with `#9d3b42` text for badges) matching urgent referrals rather than routine or follow-up styles.
6. API Request Redaction Stage
**Files:** `src/api/pipeline/redact-stage.ts`, `src/api/api-client.ts`, `src/api/referrals-api.ts`
**Behavior:** In the API pipeline composition (`src/api/api-client.ts`), `redactStage` checks whether `request.body` contains a referral with `type === "safeguarding"`. If so, it redacts sensitive fields prior to transport resolution:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

**Reach:** Exported via `submitReferral` and `recordBooking` in `src/api/referrals-api.ts`; defined but not reached by the running UI application, as store mutations in the web app execute synchronously via `useClinicStore.ts`.
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
A slot is actually booked in **`src/triage/validation.ts`** within the **`checkAppointment`** function, where the target slot object on the clinician is directly mutated by assigning `slot.bookedReferralId = referral.id` (line 36).

---

Execution & Control Flow

1. **UI Submission (`src/components/SlotPicker.tsx`)**:

Clicking "Confirm appointment" triggers `submit()`, which executes the `onBook(slot.clinicianId, slot.id)` callback prop (`src/components/SlotPicker.tsx`, lines 20–33).

2. **Page Handler (`src/pages/ReferralDetailPage.tsx`)**:

`ReferralDetailPage` handles `onBook` by calling the Zustand store's `bookAppointment` action with `(referral.id, clinicianId, slotId)` (`src/pages/ReferralDetailPage.tsx`, lines 80–84).

3. **Store Dispatch (`src/store/useClinicStore.ts`)**:

`useClinicStore.bookAppointment` retrieves the target referral and clinician from store state, then delegates booking validation and execution to `checkAppointment(referral, clinician, slotId, state.actor)` (`src/store/useClinicStore.ts`, lines 115–128).

4. **Slot Mutation & Event Dispatch (`src/triage/validation.ts`)**:

Inside `checkAppointment` (lines 7–43):

- Eligibility is verified via `checkEligibility(referral)` (throws if ineligible).

- The slot is retrieved from `clinician.slots` and checked for availability (`!slot.bookedReferralId`) and service coverage (`clinician.services.includes(referral.service)`).

- An `Appointment` object (`APT-${Date.now()}`) is generated.

- **Slot Mutation**: The target slot object is directly mutated: `slot.bookedReferralId = referral.id` (line 36).

- The `appointment:booked` event is emitted via `clinicEvents.emit("appointment:booked", { appointment, patientName: referral.patient.name })` (lines 37–40).

5. **Downstream State Updates & Event Subscribers**:

- **Zustand Store (`src/store/useClinicStore.ts`, lines 129–143)**: Appends the new `Appointment` to state, updates the referral's `status` to `"booked"`, sets `appointmentId` and `assignedClinicianId`, and writes an in-store audit log entry.

- **Audit Logger Subscriber (`src/audit/logger.ts`, lines 5–14)**: Listens for `appointment:booked` and prepends an entry to `eventEntries` (consumed by `src/pages/AuditLogPage.tsx`, line 17).

- **Scheduling Subscriber (`src/scheduling/eventListener.ts`, lines 4–6)**: Listens for `appointment:booked` and adds `appointment.slotId` to the `recentlyBooked` `Set`.

---

Bypassed Helpers and Test Call Sites
**Unused Reserve Helper (`src/scheduling/service.ts`, lines 21–25)**: `reserveSlot` returns a copy of a slot with `bookedReferralId` set, but is defined but not reached by the running application.
**Unused API Endpoint (`src/api/referrals-api.ts`, lines 8–14)**: `recordBooking` issues a POST request to `/referrals/${referral.id}/booking`, but is defined but not reached by the running application.
**Unit Test Execution (`src/tests/scheduling.test.ts`, lines 14–37)**: Directly calls `checkAppointment` to verify availability checks, slot mutation, and double-booking prevention.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

