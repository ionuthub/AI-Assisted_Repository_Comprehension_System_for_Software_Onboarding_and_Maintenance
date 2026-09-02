# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 4eea7d8ea08d782a4bb59e625f9457b039775df6ad6446abe332423a7d24645e -->

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
Execution starts in **`index.html`**, which serves as the HTML entry point and loads **`src/main.tsx`** via an ES module script tag. `src/main.tsx` executes top-level module imports (including side-effect event listeners imported by `src/App.tsx`), creates the React root, and mounts the router onto the `#root` DOM element (`index.html`, `src/main.tsx`, `src/App.tsx`).

---

Step-by-Step Execution Sequence

1. **HTML Loading (`index.html`)**

* The browser loads `index.html`, which provides the `<div id="root"></div>` target container and requests the entry point via `<script type="module" src="/src/main.tsx"></script>`.

2. **Module Evaluation & Global Side Effects (`src/main.tsx`, `src/App.tsx`)**

* Before rendering, the ES module loader evaluates `src/main.tsx` and its import tree.

* `src/main.tsx` imports `src/styles.css` and `src/App.tsx`.

* Importing `src/App.tsx` executes two top-level side-effect imports before component render (`src/App.tsx`):

* **`src/scheduling/eventListener.ts`**: Evaluates at module load time, initializing an in-memory `recentlyBooked` Set and registering a subscriber on `clinicEvents` for `"appointment:booked"`.

* **`src/audit/logger.ts`**: Evaluates at module load time, initializing an in-memory `eventEntries` array and registering a subscriber on `clinicEvents` for `"appointment:booked"`.

3. **React Application Mount (`src/main.tsx`, `src/App.tsx`)**

* `src/main.tsx` queries the DOM for `document.getElementById("root")!`.

* It calls `ReactDOM.createRoot(...).render(...)` to render `<App />` within `<React.StrictMode>`.

* `App` initializes `<BrowserRouter>` and configures routes matching `<Layout />` and its index route `<ReferralListPage />` (`src/App.tsx`).
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
A referral is given its priority band (`"red"`, `"amber"`, or `"green"`) in application state when a user submits an update from `src/pages/ReferralDetailPage.tsx`, which calls the Zustand store action `acceptReferral` in `src/store/useClinicStore.ts` with a chosen band argument.

---

Key Mechanisms & Data Flow

#### 1. Automated Suggestion (`calculateBand`)

The clinical engine in `src/triage/banding.ts` calculates a suggested priority band for display purposes using rules and policies configured in `src/config/priorityRules.ts`:

1. **Pathway Base Points** (`referralPolicies`):

- `safeguarding`: 8 base points (target response: 4 hours)

- `urgent`: 5 base points (target response: 24 hours)

- `followUp`: 1 base point (target response: 168 hours)

- `routine`: 0 base points (target response: 336 hours)

2. **Clinical Signal Rules** (`priorityRules`):

- `safeguarding-signal` (`safeguardingConcern = true`): +10 points

- `rapid-deterioration` (`deterioration = true` AND `painScore >= 7`): +7 points

- `severe-pain` (`painScore >= 7`): +4 points

- `post-discharge` (`recentDischarge = true`): +3 points

- `mobility` (`mobilityRisk = true`): +2 points

- `persistent-symptoms` (`symptomDays > 21`): +1 point

3. **Threshold Mapping** (`bandThresholds`):

- Score $\ge 9 \rightarrow$ `"red"` (Priority 1)

- Score $\ge 4 \rightarrow$ `"amber"` (Priority 2)

- Score $\ge 0 \rightarrow$ `"green"` (Priority 3)

`calculateBand` returns a `BandingDecision` containing `band`, `score`, `matchedRules`, and `targetHours`.

---

#### 2. User Selection and Local Component State

In `src/pages/ReferralDetailPage.tsx` and `src/components/PriorityPanel.tsx`:

Component state `priority` in `ReferralDetailPage.tsx` initializes to `referral?.priority ?? "green"`. It is **not** pre-populated by `calculateBand`.
`PriorityPanel` calls `calculateBand(referral)` strictly to render UI guidance: displaying total score, matched signals, target hours, and marking the calculated option with a *"Suggested"* badge.
Clicking an option button (`"red"`, `"amber"`, or `"green"`) in `PriorityPanel` calls `onSelect(band)`, updating the local React state `priority` in `ReferralDetailPage.tsx`.

---

#### 3. State Persistence and Store Execution (`acceptReferral`)

When the user clicks **"Accept referral"** or **"Update priority"** in `src/pages/ReferralDetailPage.tsx`, `onAccept` calls `accept(referral.id, priority)` from `src/store/useClinicStore.ts`:

1. **Eligibility Validation**: Executes `checkEligibility(referral)` (`src/triage/eligibility.ts`). If the referral is ineligible (e.g., out of area, invalid date of birth, or missing practice), it emits `"eligibility:failed"` on `clinicEvents` (`src/events/channel.ts`) and throws an error, aborting the mutation.

2. **Band Selection**: Evaluates `const band = override ?? calculateBand(referral).band;`. Because the UI always supplies the local `priority` state as `override`, the `calculateBand` fallback branch is bypassed during live user submissions (though it is used when `acceptReferral` is invoked without an override argument in automated tests such as `src/tests/eligibility.test.ts`).

3. **Store State Mutation**: Updates `referrals` in `useClinicStore.ts`, setting `status: "accepted"` and `priority: band`.

4. **Audit Logging**: Invokes `addAudit`, appending an entry to `state.audit` with `action: "Referral accepted"`, `detail: "Priority assigned: <band>"`, and `severity: band === "red" ? "critical" : "info"`.

5. **Event Emissions & Subscriptions**:

- Emits `"referral:accepted"` with payload `{ referralId, band, actor }`. Across the codebase, `"referral:accepted"` currently has zero registered event listeners.

- (For context, among all declared event types in `src/events/types.ts`, only `"appointment:booked"` has registered listeners—in `src/audit/logger.ts` and `src/scheduling/eventListener.ts`—whereas `"referral:accepted"` and `"eligibility:failed"` have none).

*(Note: `useClinicStore.ts` also exports a `setPriority(id, band)` store action, but it is not invoked anywhere in the running application UI).*
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
Processing for a given referral type (`routine`, `urgent`, `followUp`, or `safeguarding`) is determined by pathway routing guidance (`src/triage/routes/`), type policies governing baseline scoring and scheduling finder strategy (`src/config/priorityRules.ts`), age-based eligibility constraints for safeguarding (`src/triage/eligibility.ts`), and outgoing API payload redaction (`src/api/pipeline/redact-stage.ts`).

---

1. Pathway Routing Guidance (`src/triage/routes/`)

Pathway logic and clinical instructions are registered per referral type and consumed in the UI:

**Registry & Loader (`src/triage/routes/registry.ts`, `src/triage/routes/loadRoutes.ts`)**: `routeReferral(referral)` retrieves and executes the `RouteHandler` mapped to `referral.type` in a module-scoped `Map`. `loadRoutes()` dynamically imports all route handlers.
**UI Consumer (`src/pages/ReferralDetailPage.tsx`)**: In a `useEffect` hook, `ReferralDetailPage` calls `loadRoutes()` and sets component state via `routeReferral(referral)`. This generates presentational guidance (`summary`, `instructions`, `requiresPhoneCall`, and `recommendedService`). The recommended service is presentational pathway advice displayed on the page; it does not overwrite `referral.service` or alter slot lookups.
**Route Modules**:

* `src/triage/routes/routine.ts`: Standard pathway summary, `requiresPhoneCall: false`, routine onboarding instructions.

* `src/triage/routes/urgent.ts`: Urgent review summary, `requiresPhoneCall: true`, 2-hour contact instructions.

* `src/triage/routes/followUp.ts`: Follow-up summary, `requiresPhoneCall: false`, care team continuity instructions.

* `src/triage/routes/safeguarding.ts`: Restricted review summary, sets `recommendedService` to `"Community nursing"`, `requiresPhoneCall: true`, safe contact instructions.

---

2. Type Policies, Priority Banding, and Slot Dispatch

Operational scoring and scheduling strategies are configured by `referralPolicies` in `src/config/priorityRules.ts`:

**Policy Map (`src/config/priorityRules.ts`)**: Maps each type to operational parameters:

* `routine`: `{ basePoints: 0, finder: "standard", targetHours: 336 }`

* `urgent`: `{ basePoints: 5, finder: "standard", targetHours: 24 }`

* `followUp`: `{ basePoints: 1, finder: "continuity", targetHours: 168 }`

* `safeguarding`: `{ basePoints: 8, finder: "standard", targetHours: 4 }`

**Clinical Banding (`src/triage/banding.ts`)**: `calculateBand(referral)` adds `referralPolicies[referral.type].basePoints` to matched rule points, returns `targetHours` from the type policy, and computes the band using `bandThresholds` (Red $\ge 9$, Amber $\ge 4$, Green $\ge 0$).

* *Consumers*: `PriorityPanel` (`src/components/PriorityPanel.tsx`) calls `calculateBand` to display suggested priority, score, and target hours. In `useClinicStore.ts`, `acceptReferral` uses `calculateBand(referral).band` as a fallback when no override argument is provided; when invoked from `ReferralDetailPage.tsx`, `acceptReferral` receives the user's explicit `priority` state as an override argument.

**Slot Finder Strategy (`src/scheduling/service.ts`)**: `availableSlots(referral, clinicians)` inspects `referralPolicies[referral.type].finder` to dispatch slot search:

* `"standard"` (used by `routine`, `urgent`, `safeguarding`) dispatches to `findSlots` (`src/scheduling/slotFinder.ts`), filtering active clinicians matching `referral.service` for open future slots ordered chronologically.

* `"continuity"` (used by `followUp`) dispatches to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`), which ranks clinicians matching `referral.assignedClinicianId` (`preferredClinicianId`) first before returning open service-matching slots ordered chronologically.

---

3. Type-Specific Eligibility Rules (`src/triage/eligibility.ts`)
**`checkEligibility`**: Evaluates patient age from `referral.patient.dateOfBirth`. If `referral.type === "safeguarding"` and patient age is under 16, it flags the referral as ineligible with reason `"Child safeguarding team must coordinate this referral"`.
**Execution Points**: Called when accepting a referral in `useClinicStore.ts` (`acceptReferral`), validating appointment bookings in `src/triage/validation.ts` (`checkAppointment`), and executing background verification in `src/jobs/nightlyReverification.ts` (`runNightlyReverification`).

---

4. API Request Payload Redaction (`src/api/pipeline/redact-stage.ts`)
**`redactStage`**: Middleware that inspects outgoing API request bodies. When `referral.type === "safeguarding"`, it redacts `notes` to `"[restricted clinical note]"` and patient contact details (`phone: "[safe contact required]"`, `postcode: "[restricted]"`).
**Pipeline Integration**: Executed in `apiRequest` (`src/api/api-client.ts`), wrapping API functions in `src/api/referrals-api.ts` (`submitReferral` and `recordBooking`).
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
Eligibility checks are defined by `checkEligibility` in `src/triage/eligibility.ts` (lines 4–26) and executed across 3 live entry points:

1. Referral Acceptance Flow
**Execution Location:** `src/store/useClinicStore.ts` (line 54, inside `acceptReferral`).
**Trigger Path:** User clicks "Accept referral" in `src/pages/ReferralDetailPage.tsx` (line 120) $\rightarrow$ invokes `onAccept` (line 45) $\rightarrow$ calls `acceptReferral(referral.id, priority)` (line 46).
**Behavior:** Runs `checkEligibility(referral)`. If `eligible` is `false`, it emits the `eligibility:failed` event on `clinicEvents` with `phase: "acceptance"` (`src/store/useClinicStore.ts`, lines 56–60) and throws an `Error`, preventing status updates to `"accepted"`.
**Test Reach:** Tested in `src/tests/eligibility.test.ts` (lines 11, 18, 28) via direct calls to store action `acceptReferral`.
2. Appointment Booking Flow
**Execution Location:** `src/triage/validation.ts` (line 13, inside `checkAppointment`).
**Trigger Path:** User clicks "Confirm appointment" in `src/components/SlotPicker.tsx` (line 86) $\rightarrow$ invokes `submit` (line 21) $\rightarrow$ calls `onBook` in `src/pages/ReferralDetailPage.tsx` (line 61) $\rightarrow$ calls `bookAppointment` in `src/store/useClinicStore.ts` (line 117) $\rightarrow$ calls `checkAppointment` (`src/store/useClinicStore.ts`, line 121; `src/triage/validation.ts`, line 13).
**Behavior:** Runs `checkEligibility(referral)`. If `eligible` is `false`, it emits the `eligibility:failed` event on `clinicEvents` with `phase: "booking"` (`src/triage/validation.ts`, lines 15–19) and throws an `Error`, halting slot assignment and appointment creation.
**Test Reach:** Tested in `src/tests/scheduling.test.ts` (lines 20, 32) via direct calls to `checkAppointment`.
3. Nightly Batch Reverification Flow
**Execution Location:** `src/jobs/nightlyReverification.ts` (line 20, inside `runNightlyReverification`).
**Trigger Path:** User clicks "Run eligibility check" in `src/pages/AuditLogPage.tsx` (line 46) $\rightarrow$ invokes `verify` (line 23) $\rightarrow$ calls `runNightlyReverification(referrals)` (line 25).
**Behavior:** Filters the input referral array for records where `status` is `"accepted"` or `"booked"` (`src/jobs/nightlyReverification.ts`, lines 11–14). For each candidate, it executes `checkEligibility(referral)`. If ineligible, it emits the `eligibility:failed` event on `clinicEvents` with `phase: "nightly"` (lines 23–27) and appends failure details to the returned `VerificationReport` object (lines 22, 30–34).
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
Before an outgoing API request is sent in `apiRequest()` (`src/api/api-client.ts`), it is transformed through a composed middleware pipeline of three stages in left-to-right order—`traceStage` → `authStage` → `redactStage`—before being handed to the `transport` function (`src/api/api-client.ts`).

---

Step-by-Step Flow of an Outgoing Request

1. **Header Normalization (`src/api/api-client.ts`)**

When `apiRequest()` is called, it defaults any missing headers object to an empty object (`request.headers ?? {}`) before passing the request object into the composed pipeline.

2. **Stage 1: Trace Instrumentation (`src/api/pipeline/trace-stage.ts`)**

- Generates a trace ID using the template ``trace-${Date.now()}-${Math.random().toString(16).slice(2)}``.

- Sets the `"X-Trace-Id"` header in `request.headers` to this string and calls `next()`.

3. **Stage 2: Authentication & Role Injection (`src/api/pipeline/auth-stage.ts`)**

- Enriches `request.headers` with static session and role credentials:

- `Authorization: "Bearer clinic-session"`

- `"X-Staff-Role": "triage"`

- Passes the enriched request to `next()`.

4. **Stage 3: Patient Data Redaction (`src/api/pipeline/redact-stage.ts`)**

- Evaluates `request.body`.

- If `request.body` contains a referral object where `type === "safeguarding"` and a `patient` object is present, it returns a modified copy of `request.body` with sensitive fields overwritten:

- `notes` → `"[restricted clinical note]"`

- `patient.phone` → `"[safe contact required]"`

- `patient.postcode` → `"[restricted]"`

- For all other referral types or missing patient/body structures, `request.body` is forwarded unmodified.

5. **Transport Dispatch (`src/api/api-client.ts`)**

- The fully transformed request reaches `transport`.

- `transport` resolves a local simulated `ApiResponse` with `status: 200`, `data` set to `request.body ?? { ok: true }`, and `requestId` assigned from `request.headers["X-Trace-Id"]`.

---

Reach and Call Sites
**Defined Callers:** `apiRequest` is wrapped by `submitReferral` (sending `PATCH /referrals/${referral.id}`) and `recordBooking` (sending `POST /referrals/${referral.id}/booking`) in `src/api/referrals-api.ts`.
**Runtime Execution:** Neither `apiRequest`, `submitReferral`, nor `recordBooking` is invoked by any live UI views (`src/pages/`), state stores (`src/store/useClinicStore.ts`), background jobs (`src/jobs/`), or test suites. Triage state mutations in the web app currently execute in-memory via Zustand (`src/store/useClinicStore.ts`).

---

Evidence vs. Inference
**Direct Evidence:**

- Pipeline reduction order `[traceStage, authStage, redactStage]` composed via `stages.reduceRight` in `src/api/api-client.ts` (lines 17–21).

- Header normalization in `src/api/api-client.ts` (lines 23–29).

- Header additions in `src/api/pipeline/trace-stage.ts` (lines 2–8) and `src/api/pipeline/auth-stage.ts` (lines 2–12).

- Body redaction guard and field replacements in `src/api/pipeline/redact-stage.ts` (lines 3–18).

- Local mock transport behavior returning `status: 200` in `src/api/api-client.ts` (lines 10–15).

- Helper functions calling `apiRequest` in `src/api/referrals-api.ts` (lines 3–16).

**Inference:**

- `transport` serves as a temporary local mock pending completion of backend gateway integration (noted by the TODO in `src/api/api-client.ts`, line 31).
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
`checkAppointment` does not only check; it mutates argument state on success and emits events that update module-level state.

1. In-Place Argument Mutation
**File:** `src/triage/validation.ts`
**Behavior:** Upon passing all validation checks, `checkAppointment` executes `slot.bookedReferralId = referral.id`. Because `slot` is referenced inside `clinician.slots`, this mutates the `clinician` object passed as an argument in place.
2. Module State Updates via Event Emission
**File:** `src/triage/validation.ts`
**Behavior:** On successful booking, `checkAppointment` emits the `"appointment:booked"` event via `clinicEvents`.
**Consumers:** Top-level side-effect imports in `src/App.tsx` register two event listeners that modify module-scoped state upon receiving this event:

* `src/audit/logger.ts`: Unshifts a new log record into the module-scoped `eventEntries` array (retrievable via `getEventAudit()`).

* `src/scheduling/eventListener.ts`: Adds `appointment.slotId` to the module-scoped `recentlyBooked` `Set` (checked via `wasRecentlyBooked()`).

3. Failure Event Emission
**File:** `src/triage/validation.ts`
**Behavior:** If `checkEligibility(referral)` fails, `checkAppointment` emits an `"eligibility:failed"` event with `{ referralId, reasons, phase: "booking" }` before throwing an error.
**Subscription Reconciliation:** `src/events/types.ts` defines three event types (`"referral:accepted"`, `"appointment:booked"`, and `"eligibility:failed"`). Only `"appointment:booked"` has active listeners in the codebase; `"eligibility:failed"` and `"referral:accepted"` currently have no registered subscribers.
4. Call Sites
**Store Action:** `useClinicStore.ts` calls `checkAppointment` inside `bookAppointment`. The store relies on the mutation of the input `clinician` slot before updating Zustand store state (`appointments`, `clinicians`, `referrals`).
**Test Suite:** `src/tests/scheduling.test.ts` invokes `checkAppointment` directly and asserts that `slot.bookedReferralId` is set.
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
The slot-finding implementation that runs for a follow-up referral is **`findContinuitySlots`** (`src/scheduling/oldSlotFinder.ts`). It is selected because when `availableSlots` (`src/scheduling/service.ts`) looks up the policy for a referral of type `"followUp"`, `referralPolicies` (`src/config/priorityRules.ts`) returns `finder: "continuity"`, which resolves to `findContinuitySlots` in the internal `finders` registry of `src/scheduling/service.ts`.

Selection and Dispatch Flow

1. **Call Site Entry Point**

`SlotPicker` calls `availableSlots(referral, clinicians)` (`src/components/SlotPicker.tsx`) to retrieve up to 12 matching appointment options.

2. **Policy Lookup**

In `availableSlots` (`src/scheduling/service.ts`), `referralPolicies[referral.type].finder` is indexed by the referral's type (`"followUp"`).

In `src/config/priorityRules.ts`, `referralPolicies.followUp` sets `finder` to `"continuity"`:

```ts

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 }

```

3. **Finder Registry Resolution**

In `src/scheduling/service.ts`, the `finders` lookup map resolves `"continuity"` to `findContinuitySlots`:

```ts

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

```

4. **Execution and Arguments**

`availableSlots` invokes `findContinuitySlots` with the search context (`src/scheduling/service.ts`):

```ts

return finder({

referral,

clinicians,

preferredClinicianId: referral.assignedClinicianId,

});

```

---

Implementation Details of `findContinuitySlots`

When executed (`src/scheduling/oldSlotFinder.ts`), `findContinuitySlots` processes the clinicians and slots in four steps:

1. **Active Clinician & Service Filter:**

Filters `clinicians` to include only active clinicians (`clinician.active`) who cover the referral's requested service (`clinician.services.includes(referral.service)`).

2. **Continuity Sorting:**

Sorts the qualified clinicians to prioritize the clinician whose `id` matches `preferredClinicianId` (`referral.assignedClinicianId`):

```ts

.sort(

(a, b) =>

Number(b.id === preferredClinicianId) -

Number(a.id === preferredClinicianId),

)

```

3. **Slot Collection:**

Flattens and filters slots for each clinician, retaining slots that are unbooked (`!slot.bookedReferralId`) and match the required service (`slot.service === referral.service`).

4. **Chronological Ordering:**

Sorts the final list of slots in ascending order of start time using `compareAsc(new Date(a.startsAt), new Date(b.startsAt))`.

Direct File References
`src/components/SlotPicker.tsx`: Calls `availableSlots`.
`src/config/priorityRules.ts`: Maps `followUp` to `finder: "continuity"`.
`src/scheduling/service.ts`: Resolves `"continuity"` to `findContinuitySlots` and dispatches `availableSlots`.
`src/scheduling/oldSlotFinder.ts`: Contains the implementation of `findContinuitySlots`.
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
When a scheduling event—specifically `"appointment:booked"`—is emitted on the shared `clinicEvents` bus (`src/events/channel.ts`), exactly two registered listeners react:

1. **Scheduling Tracker (`src/scheduling/eventListener.ts`)**

- **Reaction:** Listens for `"appointment:booked"` and adds `appointment.slotId` to an in-memory `recentlyBooked` `Set<string>`.

- **Runtime Reach:** Exports `wasRecentlyBooked(slotId)` to query the set. However, `wasRecentlyBooked` is not imported or invoked by any UI component, store action, or test file in the codebase.

2. **Audit Logger (`src/audit/logger.ts`)**

- **Reaction:** Listens for `"appointment:booked"` and prepends an `AuditEntry` (severity `"info"`, action `"Appointment booked"`, containing patient name and clinician ID) to the module-scoped `eventEntries` array.

- **Runtime Reach:** Exposes `getEventAudit()`, which is called by `AuditLogPage` (`src/pages/AuditLogPage.tsx`) to prepend event entries to the store's audit array and display them in the audit log view.

---

Module Timing, Emission Control Flow & Complete Event Inventory
**Listener Registration Timing:** Both listeners are registered when `src/App.tsx` evaluates its top-level side-effect imports (`import "./scheduling/eventListener";` and `import "./audit/logger";`) during application startup.
**Emission Control Flow:** `"appointment:booked"` is emitted inside `checkAppointment` (`src/triage/validation.ts`) after verifying eligibility, clinician service mapping, and slot availability. In the running application, this is called via `useClinicStore.getState().bookAppointment` (`src/store/useClinicStore.ts`), triggered when a user clicks "Confirm appointment" in `SlotPicker` (`src/components/SlotPicker.tsx` / `src/pages/ReferralDetailPage.tsx`). It is also reached directly in `src/tests/scheduling.test.ts`.
**Complete `ClinicEvents` Map (`src/events/types.ts`):**

- `"appointment:booked"`: Emitted in `src/triage/validation.ts`. **2 registered listeners** (`src/scheduling/eventListener.ts`, `src/audit/logger.ts`).

- `"referral:accepted"`: Emitted in `src/store/useClinicStore.ts` (`acceptReferral`). **0 registered listeners** (unsubscribed event).

- `"eligibility:failed"`: Emitted in `src/triage/validation.ts` (`checkAppointment`), `src/store/useClinicStore.ts` (`acceptReferral`), and `src/jobs/nightlyReverification.ts` (`runNightlyReverification`). **0 registered listeners** (unsubscribed event).
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
To add a new referral type, you must update the type definition in `src/types/domain.ts`, configure its policy in `src/config/priorityRules.ts`, add its display name mapping in `src/utils/format.ts`, add a route handler module in the `src/triage/routes/` directory, update the filter dropdown in `src/pages/ReferralListPage.tsx`, add styling rules in `src/styles.css`, and update the route handler count assertion in `src/tests/registry.test.ts`.

---

Core Type & Domain Configuration (Required)

1. **`src/types/domain.ts`**

Add the new literal member to the `ReferralType` union:

```ts

export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "yourType";

```

2. **`src/config/priorityRules.ts`**

Add a policy record to `referralPolicies`. Because `referralPolicies` is typed as `Record<ReferralType, ReferralPolicy>`, TypeScript will throw a compilation error if the key is missing. Set `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`.

3. **`src/utils/format.ts`**

Add a display string mapping to `humaniseType`. Omitting the key triggers a TypeScript error because `humaniseType` maps over all keys of `ReferralType`.

---

Pathway Routing (Required for Detail Page Execution)

4. **`src/triage/routes/`**

Create a new file in the `src/triage/routes/` directory (following the pattern of existing route handlers like `src/triage/routes/routine.ts` or `src/triage/routes/urgent.ts`) that calls `registerRoute` from `src/triage/routes/registry.ts`.

* **Control Flow**: `src/triage/routes/loadRoutes.ts` dynamically imports all `./*.ts` modules in `src/triage/routes/` via `import.meta.glob`. When `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`) mounts, `loadRoutes()` runs and `routeReferral(referral)` looks up the handler by `referral.type` in `src/triage/routes/registry.ts`, throwing an error if no handler is registered.

---

UI Filters & Styling (Required for UI Completeness)

5. **`src/pages/ReferralListPage.tsx`**

Add a corresponding `<option value="...">` to the `<select aria-label="Filter referral type">` dropdown so users can filter by the new pathway.

6. **`src/styles.css`**

Add CSS rules for `.type-dot.type-<yourType>` and `.type-badge.type-<yourType>` so indicator dots in `ReferralTable.tsx` and pathway badges in `ReferralDetailPage.tsx` render with appropriate styling.

---

Test Suite Updates (Required for Build/CI)

7. **`src/tests/registry.test.ts`**

Update the exact route handler count assertion `expect(registeredRouteCount()).toBe(4)` to `5`.

---

Conditional Domain & Pipeline Modifications (Dependent on Requirements)
**`src/pages/ReferralListPage.tsx`**: If referrals of this type count toward time-sensitive worklist metrics, update the predicate for calculating the `urgent` metric score.
**`src/triage/eligibility.ts`**: If the new type carries specific clinical or demographic eligibility restrictions (such as age limits like `safeguarding`), add predicate checks to `checkEligibility`.
**`src/api/pipeline/redact-stage.ts`**: If the new type contains restricted information that must be sanitized prior to API requests, update `redactBody`.
**`src/data/seed.ts`**: Add seed records matching the new type to populate local development datasets.
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
Changing the priority rules configuration in `src/config/priorityRules.ts` (`referralPolicies`, `priorityRules`, or `bandThresholds`) directly affects clinical triage banding calculation in `src/triage/banding.ts` and slot finder algorithm dispatch in `src/scheduling/service.ts`. Indirectly, these changes alter the triage UI guidance in `src/components/PriorityPanel.tsx`, slot option availability in `src/components/SlotPicker.tsx`, non-UI store fallback behavior in `src/store/useClinicStore.ts`, and test results in `src/tests/banding.test.ts` and `src/tests/scheduling.test.ts`.

1. Direct Rule Consumers and Calculation Flow
**Triage Banding (`src/triage/banding.ts`):**

`calculateBand(referral)` aggregates referral clinical signals and referral type into a rule context. It evaluates each rule in `priorityRules`, adds matched rule `points` to `referralPolicies[referral.type].basePoints`, determines the priority `band` by matching the total score against `bandThresholds` (defaulting to `"green"`), and attaches `targetHours` from `referralPolicies[referral.type].targetHours`.

* **Impact:** Modifying rule predicates, point values, base points, target hours, or band thresholds alters the computed `score`, `band`, `matchedRules`, and `targetHours` fields in the returned `BandingDecision`.

**Slot Finder Dispatch (`src/scheduling/service.ts`):**

`availableSlots(referral, clinicians)` reads `referralPolicies[referral.type].finder` to select the slot lookup algorithm:

* `"standard"`: Calls `findSlots` in `src/scheduling/slotFinder.ts`, which filters active clinicians offering `referral.service`, filters unbooked future slots (`!bookedReferralId` and `startsAt > now`), and orders them chronologically.

* `"continuity"`: Calls `findContinuitySlots` in `src/scheduling/oldSlotFinder.ts`, which filters active clinicians offering `referral.service`, sorts clinicians to prioritize `referral.assignedClinicianId`, collects unbooked service slots, and orders them chronologically.

* **Impact:** Changing a policy's `finder` mapping toggles whether standard open slots or clinician-continuity sorting is used when looking up appointments for that referral type.

2. UI Guidance Rendering (`src/components/PriorityPanel.tsx` & `src/components/SlotPicker.tsx`)
**Priority Panel Display (`src/components/PriorityPanel.tsx`):**

Calls `calculateBand(referral)` directly on render to display:

* Total calculated `score` and policy response time in hours (`targetHours`).

* A *"Suggested"* badge next to the priority button that matches `decision.band`.

* The list of matched escalation signal names generated from `decision.matchedRules`.

**Slot Selection List (`src/components/SlotPicker.tsx`):**

Calls `availableSlots(referral, clinicians)` inside a `useMemo` block, directly reflecting any change in slot finder strategy or policy configuration.

3. Store State Updates and Live UI vs. Test Reach (`src/store/useClinicStore.ts`)
**Live UI Acceptance Path (`src/pages/ReferralDetailPage.tsx`):**

Component state `priority` initializes to `referral?.priority ?? "green"`. When a user clicks "Accept referral", `onAccept` executes `accept(referral.id, priority)`, passing the current `priority` state as an explicit `override` argument. Because `override` is supplied, the internal fallback call to `calculateBand(referral)` inside `useClinicStore.ts` is bypassed during interactive UI acceptance.

**Store Fallback Execution (`src/store/useClinicStore.ts`):**

If `acceptReferral(id)` is called without an `override` argument, `useClinicStore.ts` falls back to `calculateBand(referral).band` to assign `referral.priority`.

* Mutates `referral.status` to `"accepted"` and `referral.priority` to the resolved band.

* Writes an audit entry via `addAudit`: assigns severity `"critical"` if the band is `"red"`, otherwise `"info"`.

* Emits the `"referral:accepted"` event on `clinicEvents` (`src/events/channel.ts`) with `{ referralId, band, actor }`.

**Downstream Priority Consumers (`src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`, `src/components/ReferralTable.tsx`):**

Whenever a referral's stored `priority` field is updated (via manual selection or fallback acceptance), downstream components consume `referral.priority`:

* `ReferralListPage.tsx` counts time-sensitive referrals where `item.priority === "red"`.

* `useReferralFilters.ts` filters worklist items matching `referral.priority === band`.

* `ReferralTable.tsx` renders priority badges using `bandLabel(referral.priority)` and applies CSS classes (`priority-red`, `priority-amber`, `priority-green`).

4. Test Suite Dependencies
**Banding Unit Tests (`src/tests/banding.test.ts`):**

Directly invokes `calculateBand` to verify safeguarding priority bands (`"red"`), target response hours (`336`), and matched rule logging.

**Scheduling Unit Tests (`src/tests/scheduling.test.ts`):**

Directly invokes `availableSlots` to verify service-compatible slot filtering.

**Eligibility Unit Tests (`src/tests/eligibility.test.ts`):**

Executes `acceptReferral(id)` without an `override` parameter, exercising the un-overridden `calculateBand` store fallback path.
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
Yes. Safeguarding referrals (identified by `type === "safeguarding"` or `signals.safeguardingConcern === true`) are treated differently across priority banding and response targets, eligibility restrictions, route guidance, API payload redaction, list summary metrics, and UI signal display/styling.

---

Direct Evidence by Location

#### 1. Priority Banding & Target Response Times

**`src/config/priorityRules.ts`**: `referralPolicies.safeguarding` assigns a base score of `8` points and sets `targetHours` to `4` (the shortest response target in the system). Additionally, the `safeguarding-signal` rule adds `10` points whenever `signals.safeguardingConcern` is `true`.
**`src/triage/banding.ts`**: `calculateBand` adds base points and matched rule points. A score of 9 or higher triggers a `red` (Priority 1) band assignment.

#### 2. Acceptance, Booking & Reverification Eligibility

**`src/triage/eligibility.ts`**: In `checkEligibility`, if `referral.type === "safeguarding"` and the patient's age is under 16 years (`age < 16`), eligibility fails with the message `"Child safeguarding team must coordinate this referral"`.
**`src/store/useClinicStore.ts`**: `acceptReferral` throws an error when `checkEligibility` fails, preventing acceptance.
**`src/triage/validation.ts`**: `checkAppointment` throws an error when `checkEligibility` fails, preventing booking.
**`src/jobs/nightlyReverification.ts`**: `runNightlyReverification` records failures and emits `eligibility:failed` events when checking safeguarding referrals under 16.

#### 3. Triage Pathway Routing Guidance

**`src/triage/routes/safeguarding.ts`**: Registers a dedicated pathway route for `safeguarding` using `registerRoute` (`src/triage/routes/registry.ts`). It returns:

* `summary`: `"Restricted safeguarding review for [Patient Name]"`

* `recommendedService`: `"Community nursing"`

* `requiresPhoneCall`: `true`

* `instructions`: `["Do not leave a voicemail", "Check safe contact method", "Notify safeguarding lead"]`

**`src/pages/ReferralDetailPage.tsx`**: Loads routing rules dynamically via `loadRoutes` (`src/triage/routes/loadRoutes.ts`), calling `routeReferral` to render the guidance summary, instruction checklist, and a telephone warning notice. The recommended service is displayed as guidance and does not alter the underlying store state.

#### 4. API Request Redaction Pipeline

**`src/api/pipeline/redact-stage.ts`**: `redactStage` intercepts outbound API requests. If `referral.type === "safeguarding"`, sensitive fields are redacted before reaching the mock transport:

* `notes` is replaced with `"[restricted clinical note]"`

* `patient.phone` is replaced with `"[safe contact required]"`

* `patient.postcode` is replaced with `"[restricted]"`

**`src/api/api-client.ts` & `src/api/referrals-api.ts`**: `redactStage` runs in the `apiRequest` pipeline used by `submitReferral` and `recordBooking`.

#### 5. Workspace Metrics

**`src/pages/ReferralListPage.tsx`**: The "Time sensitive" summary metric explicitly includes referrals where `item.type === "safeguarding"`, alongside `item.type === "urgent"` and `item.priority === "red"`.

#### 6. Detailed View Signal Display & CSS Styling

**`src/pages/ReferralDetailPage.tsx`**: Renders a dedicated `<span>Safeguarding</span>` signal tag when `signals.safeguardingConcern` is `true`.
**`src/styles.css`**: `.type-dot.type-safeguarding` and `.type-badge.type-safeguarding` map to red styling (`#c65358` / `#9d3b42` and `#faeaeb`).
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
A slot is actually booked in the running application when its `bookedReferralId` property is assigned in **`checkAppointment` (`src/triage/validation.ts`)**, which is invoked by the Zustand store action **`bookAppointment` (`src/store/useClinicStore.ts`)**.

---

Execution & Control Flow

1. **UI Call Site (`src/components/SlotPicker.tsx` & `src/pages/ReferralDetailPage.tsx`):**

* In `SlotPicker` (`src/components/SlotPicker.tsx`), clicking "Confirm appointment" calls `submit()`, which executes the `onBook` prop callback with `(slot.clinicianId, slot.id)`.

* In `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`), `onBook` calls `useClinicStore.getState().bookAppointment` via `book(referral.id, clinicianId, slotId)`.

2. **Validation & In-Memory Mutation (`src/triage/validation.ts`):**

* `bookAppointment` in `useClinicStore` (`src/store/useClinicStore.ts`) looks up the `Referral` and `Clinician` in store state and passes them to `checkAppointment(referral, clinician, slotId, state.actor)` in `src/triage/validation.ts`.

* `checkAppointment` validates that:

* The referral passes `checkEligibility(referral)` (`src/triage/eligibility.ts`).

* The requested slot exists on the clinician and `slot.bookedReferralId` is undefined.

* The clinician's `services` array includes `referral.service`.

* **Mutation:** `checkAppointment` mutates the slot object directly in memory by setting `slot.bookedReferralId = referral.id` (`src/triage/validation.ts`).

* It constructs and returns an `Appointment` object (`APT-...`).

* It emits the `appointment:booked` event via `clinicEvents.emit` (`src/events/channel.ts`).

3. **Store State Updates (`src/store/useClinicStore.ts`):**

* Receives the returned `Appointment` object from `checkAppointment`.

* Appends the appointment to `state.appointments`.

* Updates `state.referrals` for the referral ID to set `status: "booked"`, `appointmentId: appointment.id`, and `assignedClinicianId: clinicianId`.

* Calls `addAudit` to prepend a "Appointment booked" record to `state.audit`.

4. **Event Channel & Registered Handlers (`src/events/channel.ts`):**

* The `appointment:booked` event is handled by two registered listeners:

* `src/scheduling/eventListener.ts`: Adds `appointment.slotId` to the module-scoped `recentlyBooked` `Set`.

* `src/audit/logger.ts`: Appends an audit object to the module-scoped `eventEntries` array via `getEventAudit()`.

* *(Note: `referral:accepted` and `eligibility:failed` events are also emitted elsewhere in the codebase but have no registered listeners in the channel).*

---

Test Callers & Unused Helpers
**Test Callers:** `checkAppointment` is called directly in test cases within `src/tests/scheduling.test.ts`.
**Unused Helpers (Direct Evidence):**

* `reserveSlot` (`src/scheduling/service.ts`): Exported pure function that returns a cloned slot with `bookedReferralId`; it has zero callers in the repository.

* `recordBooking` (`src/api/referrals-api.ts`): Exported asynchronous API method for sending booking POST requests; it has zero callers in the repository.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

