# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 057fe8c9816a26b89baffc3f4d8430badb72067a357d67d3cf407b039c2289af -->

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
Execution starts at **`index.html`**, which serves as the HTML entry point loading `/src/main.tsx` as an ECMAScript module.

---

Execution Flow Details

1. **HTML Entry Point (`index.html`)**

- The browser parses `index.html` (`index.html`, lines 1–3), creating the `<div id="root"></div>` root container and executing `<script type="module" src="/src/main.tsx"></script>`.

2. **Main Module Evaluation (`src/main.tsx`)**

- The module loader evaluates `src/main.tsx` (`src/main.tsx`, lines 1–11), which imports `styles.css` and the root component `App` from `src/App.tsx`.

3. **Module-Scope Side Effects (`src/App.tsx`, `src/scheduling/eventListener.ts`, `src/audit/logger.ts`, `src/store/useClinicStore.ts`)**

- Importing `src/App.tsx` (`src/App.tsx`, lines 1–8) triggers top-level module evaluation for its imports prior to rendering:

- `src/scheduling/eventListener.ts` (`src/scheduling/eventListener.ts`, lines 1–9) registers a listener on `clinicEvents` for `"appointment:booked"`.

- `src/audit/logger.ts` (`src/audit/logger.ts`, lines 1–18) registers a listener on `clinicEvents` for `"appointment:booked"`.

- `src/components/Layout.tsx` imports `useClinicStore` from `src/store/useClinicStore.ts` (`src/components/Layout.tsx`, line 3), which evaluates `useClinicStore.ts` (`src/store/useClinicStore.ts`, lines 24–30) and synchronously initializes store state by cloning data from `src/data/seed.ts`.

4. **React DOM Render (`src/main.tsx` & `src/App.tsx`)**

- `ReactDOM.createRoot(document.getElementById("root")!).render(...)` (`src/main.tsx`, lines 6–10) mounts the React tree.

- `App` initializes `BrowserRouter` with routes inside `Layout` (`src/App.tsx`, lines 9–23; `src/components/Layout.tsx`, lines 1–68).

5. **Asynchronous Initialization Timing (`src/pages/ReferralDetailPage.tsx`)**

- Dynamic route loading does not occur at application startup. When a user navigates to `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`, lines 31–33), a React `useEffect` hook fires post-mount, invoking `loadRoutes()` (`src/triage/routes/loadRoutes.ts`, lines 1–12) to dynamically import pathway routing modules.

---

Evidence Distinction
**Direct Evidence**: Module scripts, import declarations, event subscriptions, store setup, and React render/effect calls present in `index.html`, `src/main.tsx`, `src/App.tsx`, `src/scheduling/eventListener.ts`, `src/audit/logger.ts`, `src/store/useClinicStore.ts`, `src/components/Layout.tsx`, `src/pages/ReferralDetailPage.tsx`, and `src/triage/routes/loadRoutes.ts`.
**Inference**: ECMAScript module dependency resolution and execution order according to standard browser runtime specifications.
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
A referral is assigned its priority band (`"red"`, `"amber"`, or `"green"`) when a user accepts or updates a referral in `src/pages/ReferralDetailPage.tsx`, which passes a chosen or default band from React component state into the store action `acceptReferral(id, priority)` in `src/store/useClinicStore.ts`. In the live UI, the selected band defaults to the referral's existing `priority` or `"green"`, while the UI component `PriorityPanel` (`src/components/PriorityPanel.tsx`) concurrently runs `calculateBand(referral)` (`src/triage/banding.ts`) to display a calculated point score, rule signals, and a suggested band recommendation.

---

1. Automated Priority Calculation (`calculateBand`)

The suggestion engine in `src/triage/banding.ts` evaluates a referral using rules and policies defined in `src/config/priorityRules.ts`.

#### Step A: Base Points by Referral Pathway

`calculateBand` looks up `referralPolicies[referral.type]` in `src/config/priorityRules.ts`:

**`safeguarding`**: 8 base points (target response: 4 hours)
**`urgent`**: 5 base points (target response: 24 hours)
**`followUp`**: 1 base point (target response: 168 hours)
**`routine`**: 0 base points (target response: 336 hours)

#### Step B: Clinical Signal Rule Matching

`calculateBand` constructs a context object `{ ...referral.signals, type: referral.type }` and filters all rules in `priorityRules` (`src/config/priorityRules.ts`) whose `matches(context)` predicate returns `true`:

**`safeguarding-signal`** (+10 points): `safeguardingConcern === true`
**`rapid-deterioration`** (+7 points): `deterioration === true && painScore >= 7`
**`severe-pain`** (+4 points): `painScore >= 7`
**`post-discharge`** (+3 points): `recentDischarge === true`
**`mobility`** (+2 points): `mobilityRisk === true`
**`persistent-symptoms`** (+1 point): `symptomDays > 21`

#### Step C: Score Threshold Mapping

The total score (`basePoints + matched points`) is evaluated against `bandThresholds` (`src/config/priorityRules.ts`) in descending minimum order:

**Score $\ge$ 9**: `"red"` (Priority 1)
**Score $\ge$ 4**: `"amber"` (Priority 2)
**Score $<$ 4**: `"green"` (Priority 3, default fallback)

`calculateBand` returns a decision object containing `{ band, score, matchedRules, targetHours }`.

---

2. UI Presentation & User Selection

1. **Local State Initialization**: In `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`), React state `priority` is initialized to `referral?.priority ?? "green"`.

2. **Displaying Recommendations**: `ReferralDetailPage` passes `priority` and `setPriority` to `PriorityPanel` (`src/components/PriorityPanel.tsx`). `PriorityPanel` calls `calculateBand(referral)` to render the total score, human-readable suggested band label via `bandLabel` (`src/utils/format.ts`), target response hours, matched rule IDs, and highlights the suggested option button.

3. **User Selection**: Clicking any of the three priority buttons ("Priority 1", "Priority 2", "Priority 3") in `PriorityPanel` invokes `setPriority(band)`, updating `ReferralDetailPage`'s local React state.

---

3. Store State Mutation, Persistence, and Side Effects

1. **Action Trigger**: When the user clicks "Accept referral" or "Update priority" in `ReferralDetailPage`, `onAccept` executes `accept(referral.id, priority)`, calling `acceptReferral` in `src/store/useClinicStore.ts`.

2. **Eligibility Guard**: `acceptReferral` evaluates `checkEligibility(referral)` (`src/triage/eligibility.ts`). If the referral is ineligible (`!eligibility.eligible`), it emits `eligibility:failed` on `clinicEvents` (`src/events/channel.ts`) and throws an error without updating state.

3. **State Persistence**: If eligible, `acceptReferral`:

* Resolves the target band as `override ?? calculateBand(referral).band`. *(Note: All live application UI calls pass `priority` as `override`. Direct callers that omit the second argument, such as tests in `src/tests/eligibility.test.ts`, fall back to `calculateBand(referral).band`)*.

* Mutates the Zustand store `referrals` array, setting `status = "accepted"` and `priority = band` for the referral.

* Records an audit log entry via `addAudit` with action `"Referral accepted"`, detail `"Priority assigned: ${band}"`, and severity `"critical"` if `band === "red"` else `"info"`.

* Emits the `referral:accepted` event with `{ referralId, band, actor }` on `clinicEvents` (`src/events/channel.ts`). Currently, no registered event listener subscribes to `referral:accepted`.

---

4. Unused Store Action

`useClinicStore` (`src/store/useClinicStore.ts`) also exports a `setPriority(id, band)` store action that directly sets `referral.priority = band` and writes an audit entry `"Priority changed"`. This store action is not called anywhere in the active application UI (where `setPriority` in `ReferralDetailPage.tsx` refers strictly to React's local state setter).
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
Processing logic for each referral type (`routine`, `urgent`, `followUp`, `safeguarding`) is determined by four key areas in the codebase: central policy configuration, dynamic pathway route handlers, domain eligibility rules, and API transmission middleware.

1. Central Policy Mapping: Scoring, Target Timeframes, and Slot Strategy

`src/config/priorityRules.ts` defines `referralPolicies`, mapping each `ReferralType` to specific policy parameters:

`routine`: `basePoints: 0`, `targetHours: 336`, `finder: "standard"`
`urgent`: `basePoints: 5`, `targetHours: 24`, `finder: "standard"`
`followUp`: `basePoints: 1`, `targetHours: 168`, `finder: "continuity"`
`safeguarding`: `basePoints: 8`, `targetHours: 4`, `finder: "standard"`
Runtime consumers:
**Priority Banding (`src/triage/banding.ts`)**: `calculateBand(referral)` reads `referralPolicies[referral.type]` to add `basePoints` to clinical signal points when scoring, derive target response hours, and determine the priority band (`red`, `amber`, or `green`).
**Slot Finder Strategy (`src/scheduling/service.ts`)**: `availableSlots(referral, clinicians)` uses `referralPolicies[referral.type].finder` to dispatch slot lookup:

* `"standard"` routes to `findSlots` (`src/scheduling/slotFinder.ts`), which filters active clinicians matching `referral.service`, matches unbooked future slots (`isAfter`), and sorts chronologically.

* `"continuity"` routes to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`), which filters active service clinicians, prioritizes `referral.assignedClinicianId` first, filters unbooked matching slots, and sorts chronologically.

2. Pathway Routing Registry and Handlers

`src/triage/routes/registry.ts` maintains a dynamic map (`handlers`) connecting each `ReferralType` to a `RouteHandler` that returns pathway guidance (`RouteOutcome` containing summary, recommended service, phone call requirement, and instructions):

`src/triage/routes/routine.ts`: Recommends `referral.service`, `requiresPhoneCall: false`, provides standard demographic and booking instructions.
`src/triage/routes/urgent.ts`: Recommends `referral.service`, `requiresPhoneCall: true`, instructs contact within two hours and escalation if red flags appear.
`src/triage/routes/followUp.ts`: Recommends `referral.service`, `requiresPhoneCall: false`, instructs review of previous clinical letters and team preference.
`src/triage/routes/safeguarding.ts`: Overrides service to `"Community nursing"`, `requiresPhoneCall: true`, requires discreet contact and lead notification.
Runtime consumers:
Modules are loaded by `loadRoutes()` (`src/triage/routes/loadRoutes.ts`).
`src/pages/ReferralDetailPage.tsx` executes `routeReferral(referral)` to display the recommended pathway cards and warning banners in the UI.
3. Safeguarding-Specific Eligibility Rule

`src/triage/eligibility.ts` executes `checkEligibility(referral)`, which checks if `referral.type === "safeguarding"` and the patient's age is under 16. If true, it marks the referral ineligible with the reason `"Child safeguarding team must coordinate this referral"`.

**Runtime consumers:** Called in `useClinicStore.ts` during `acceptReferral`, in `src/triage/validation.ts` during `checkAppointment` booking, and in `src/jobs/nightlyReverification.ts` during automated checks.
4. API Request Redaction Middleware

`src/api/pipeline/redact-stage.ts` exports `redactStage`, an API pipeline stage that checks `referral.type === "safeguarding"`. When matching, it redacts `notes` to `"[restricted clinical note]"`, `phone` to `"[safe contact required]"`, and `postcode` to `"[restricted]"`.

**Runtime consumers:** Composed in `src/api/api-client.ts` as part of `apiRequest` processing when executing API updates (`submitReferral` or `recordBooking` in `src/api/referrals-api.ts`).
5. UI Workspace Filtering & Metrics
`src/pages/ReferralListPage.tsx`: Includes `referral.type === "urgent"` and `referral.type === "safeguarding"` when computing the "Time sensitive" metric count.
`src/hooks/useReferralFilters.ts`: Filters active referral worklists by selected pathway type using `referral.type === type`.

---

Direct Evidence vs. Inference
**Direct Evidence**: `referralPolicies` in `src/config/priorityRules.ts`, route handlers in `src/triage/routes/*.ts`, eligibility logic in `src/triage/eligibility.ts`, pipeline middleware in `src/api/pipeline/redact-stage.ts`, and workspace metrics in `src/pages/ReferralListPage.tsx` explicitly branch on `referral.type`.
**Inference**: The route handler files self-register when dynamically imported via Vite's `import.meta.glob` in `src/triage/routes/loadRoutes.ts`, which is triggered upon rendering `ReferralDetailPage.tsx` or executing unit tests in `src/tests/registry.test.ts`.
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
Eligibility is directly checked in **3 production call sites** across the codebase, all executing `checkEligibility(referral)` defined in `src/triage/eligibility.ts`:

1. **`src/store/useClinicStore.ts`** inside `acceptReferral`

2. **`src/triage/validation.ts`** inside `checkAppointment`

3. **`src/jobs/nightlyReverification.ts`** inside `runNightlyReverification`

In addition, automated tests indirectly trigger two of these call sites (`src/tests/eligibility.test.ts` via `acceptReferral` and `src/tests/scheduling.test.ts` via `checkAppointment`), while `src/pages/ReferralDetailPage.tsx` renders an un-wired UI button that does not execute an eligibility check.

---

Production Call Sites

#### 1. Referral Acceptance Triage

**File:** `src/store/useClinicStore.ts` (inside `acceptReferral`)
**Trigger Path:** User clicks **"Accept referral"** or **"Update priority"** on `src/pages/ReferralDetailPage.tsx` (`onAccept`), which calls the `acceptReferral` store action.
**Control & Data Flow:** `acceptReferral` retrieves the target referral from state and executes `checkEligibility(referral)`. If `!eligibility.eligible`, it emits `eligibility:failed` on `clinicEvents` (`src/events/channel.ts`) with `{ referralId: id, reasons: eligibility.reasons, phase: "acceptance" }` and throws an `Error`, halting the status change to `"accepted"`.

#### 2. Appointment Booking Validation

**File:** `src/triage/validation.ts` (inside `checkAppointment`)
**Trigger Path:** User selects a slot in `src/components/SlotPicker.tsx` and clicks **"Confirm appointment"**, calling `onBook` in `src/pages/ReferralDetailPage.tsx` $\rightarrow$ `bookAppointment` in `src/store/useClinicStore.ts` $\rightarrow$ `checkAppointment`.
**Control & Data Flow:** `checkAppointment` executes `checkEligibility(referral)` prior to slot assignment checks. If ineligible, it emits `eligibility:failed` on `clinicEvents` with `{ referralId: referral.id, reasons: eligibility.reasons, phase: "booking" }` and throws an `Error`, preventing slot reservation and appointment creation.

#### 3. Nightly Reverification Job

**File:** `src/jobs/nightlyReverification.ts` (inside `runNightlyReverification`)
**Trigger Path:** User clicks **"Run eligibility check"** on `src/pages/AuditLogPage.tsx` (`verify`), which invokes `runNightlyReverification(referrals)`.
**Control & Data Flow:** `runNightlyReverification` filters the provided referrals list for items with status `"accepted"` or `"booked"`, then iterates over each candidate to run `checkEligibility(referral)`. For any ineligible referral, it records the failure in its returned report object and emits `eligibility:failed` on `clinicEvents` with `{ referralId: referral.id, reasons: result.reasons, phase: "nightly" }`.

---

Test-Only Call Paths (Indirect Execution)
**`src/tests/eligibility.test.ts`**: Invokes `useClinicStore.getState().acceptReferral(...)`, which executes the eligibility check inside `acceptReferral`.
**`src/tests/scheduling.test.ts`**: Invokes `checkAppointment(...)`, which executes the eligibility check inside `checkAppointment`.

---

Non-Executing UI Element & Definition Source
**Un-wired UI Button:** `src/pages/ReferralDetailPage.tsx` renders `<button className="button secondary full">Verify demographics</button>`, but direct evidence shows it has no attached `onClick` handler and does not invoke `checkEligibility` or any other check logic.
**Core Rule Definition:** The business rules evaluated during every eligibility check are centrally defined in `checkEligibility` (`src/triage/eligibility.ts`), which validates patient date of birth, postcode prefix (`LS`), registered practice presence, non-declined status, and age constraints for safeguarding referrals (<16 years).
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
Before an outgoing API request reaches the terminal transport, it passes sequentially through a three-stage middleware pipeline in left-to-right order: **`traceStage` → `authStage` → `redactStage`** (`src/api/api-client.ts`). During this pipeline execution, default headers are initialized, a unique trace identifier is added, static authentication and staff role headers are appended, and sensitive patient information in safeguarding referrals is redacted.

---

Pipeline Execution & Transformations

#### 1. Request Initialization

**File:** `src/api/api-client.ts`
`apiRequest()` normalizes the input request payload by defaulting `headers` to `{}` if `request.headers` is undefined.
The stage handlers array `[traceStage, authStage, redactStage]` is composed right-to-left using `Array.prototype.reduceRight`, which chains `next` functions so that invocation proceeds left-to-right from `traceStage` through `redactStage` down to `transport`.

#### 2. Trace Identification (`traceStage`)

**File:** `src/api/pipeline/trace-stage.ts`
Generates a trace identifier string formatted as `trace-<timestamp>-<randomHex>` (using `Date.now()` and `Math.random().toString(16).slice(2)`).
Adds or overwrites the `X-Trace-Id` header on `request.headers` and calls `next()`.

#### 3. Authentication & Staff Headers (`authStage`)

**File:** `src/api/pipeline/auth-stage.ts`
Merges authorization and staff role headers into `request.headers`:

* `Authorization`: `"Bearer clinic-session"`

* `X-Staff-Role`: `"triage"`

Passes the enriched request object to `next()`.

#### 4. Body Redaction (`redactStage`)

**File:** `src/api/pipeline/redact-stage.ts`
Inspects `request.body` (cast as `Partial<Referral>`).
**Predicate:** If `body` is present, `body.type === "safeguarding"`, and `body.patient` exists, it creates a copy of the request body with the following fields modified:

* `notes`: replaced with `"[restricted clinical note]"`

* `patient.phone`: replaced with `"[safe contact required]"`

* `patient.postcode`: replaced with `"[restricted]"`

**Otherwise:** Passes `request.body` through unmodified to `next()`.

#### 5. Terminal Transport

**File:** `src/api/api-client.ts`
Receives the fully transformed request and resolves a promise mock response containing:

* `status`: `200`

* `data`: `request.body ?? { ok: true }`

* `requestId`: `request.headers["X-Trace-Id"] ?? "local"`

---

Direct Evidence vs. Inference
**Direct Evidence:**

* Request header initialization and pipeline composition via `reduceRight` in `src/api/api-client.ts`.

* Format of `X-Trace-Id` in `src/api/pipeline/trace-stage.ts`.

* Hardcoded authentication headers in `src/api/pipeline/auth-stage.ts`.

* Redaction conditions and exact replacement strings in `src/api/pipeline/redact-stage.ts`.

* Wrapper functions `submitReferral` and `recordBooking` calling `apiRequest` in `src/api/referrals-api.ts`.

**Inference:**

* The `transport` function in `src/api/api-client.ts` acts as a local stub for an HTTP client (`fetch`/`axios`) until integration with a backend remote gateway is completed.
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
`checkAppointment` does not only check—it actively mutates state and triggers side effects.
Direct State Mutations and Side Effects in `checkAppointment`

1. **Direct In-Memory Object Mutation (`slot.bookedReferralId`)**

- After validating eligibility, slot existence, slot availability, and service coverage, `checkAppointment` mutates the matching `slot` object inside the passed `clinician` parameter by setting its `bookedReferralId` property (`src/triage/validation.ts`, line 35):

```ts

slot.bookedReferralId = referral.id;

```

- When invoked via the Zustand store action `bookAppointment` (`src/store/useClinicStore.ts`, lines 112-117), this mutates the `clinician` slot object in the store state prior to Zustand updating `appointments`, `clinicians`, `referrals`, and `audit`.

- Direct unit tests also verify this mutation (`src/tests/scheduling.test.ts`, line 24).

2. **Module State Mutations via Event Listeners (`appointment:booked`)**

- On successful booking, `checkAppointment` emits the `"appointment:booked"` event on `clinicEvents` (`src/triage/validation.ts`, lines 36-39).

- This event synchronously executes two registered event listeners that update module-level state:

- **`src/scheduling/eventListener.ts` (lines 3-5)**: Adds `appointment.slotId` to the `recentlyBooked` module-level `Set<string>`.

- **`src/audit/logger.ts` (lines 4-13)**: Unshifts a generated `AuditEntry` object into the module-level `eventEntries` array (which is later merged and rendered in `AuditLogPage.tsx`, line 16).

3. **Event Emission on Failed Eligibility (`eligibility:failed`)**

- If `checkEligibility(referral)` fails, `checkAppointment` emits an `"eligibility:failed"` event payload with `phase: "booking"` (`src/triage/validation.ts`, lines 13-17) before throwing an error. Currently, no active listeners are registered for `"eligibility:failed"`.
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
For a follow-up referral (`referral.type === "followUp"`), the **`findContinuitySlots`** implementation (declared in `src/scheduling/oldSlotFinder.ts`) runs.

Why `findContinuitySlots` Runs

1. **Policy Configuration**:

In `src/config/priorityRules.ts`, the `referralPolicies` object maps each `ReferralType` to a policy. For `"followUp"`, the policy assigns `finder: "continuity"`:

```typescript

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

routine: { basePoints: 0, finder: "standard", targetHours: 336 },

urgent: { basePoints: 5, finder: "standard", targetHours: 24 },

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

safeguarding: { basePoints: 8, finder: "standard", targetHours: 4 },

};

```

2. **Dispatch Mapping in Scheduling Service**:

In `src/scheduling/service.ts`, `availableSlots` reads `referralPolicies[referral.type].finder` to resolve the lookup key `"continuity"` against the local `finders` object, which points to `findContinuitySlots`:

```typescript

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

3. **Application Call Site**:

When rendering `SlotPicker` (`src/components/SlotPicker.tsx`) on the referral detail page (`src/pages/ReferralDetailPage.tsx`), `useMemo` calls `availableSlots(referral, clinicians)`, triggering the lookup for the given referral.

---

What `findContinuitySlots` Does

When `findContinuitySlots` executes in `src/scheduling/oldSlotFinder.ts`, it filters and sorts slots using the following sequence:

1. **Clinician Filtering**: Filters `clinicians` to include only those who are active (`active: true`) and whose `services` array includes the referral's requested service (`referral.service`).

2. **Preferred Clinician Prioritisation**: Sorts matching clinicians so that any clinician matching `preferredClinicianId` (`referral.assignedClinicianId`) appears first.

3. **Slot Extraction**: Flat-maps slots across matching clinicians, retaining only slots that are unbooked (`!slot.bookedReferralId`) and match `referral.service`.

4. **Chronological Sorting**: Sorts the resulting slots in ascending order by start time (`startsAt`) using `date-fns` `compareAsc`.

---

Repository Grounding
**Direct Evidence**:

* `src/config/priorityRules.ts`: Direct evidence that `referralPolicies.followUp.finder` is configured as `"continuity"`.

* `src/scheduling/service.ts`: Direct evidence that `availableSlots` passes `referral.assignedClinicianId` to `finders["continuity"]`, which resolves to `findContinuitySlots`.

* `src/scheduling/oldSlotFinder.ts`: Direct evidence for the implementation details of `findContinuitySlots`.

* `src/components/SlotPicker.tsx`: Direct evidence that the UI calculates available options by calling `availableSlots(referral, clinicians)`.

**Inference**: None. The configuration, dispatch mechanism, and runtime flow are explicitly wired in code.
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
When the scheduling event **`"appointment:booked"`** is emitted, two listeners registered on the central event channel `clinicEvents` (`src/events/channel.ts`) react to it:

1. **`src/scheduling/eventListener.ts`**

* **Reaction:** Receives `{ appointment }` from the event payload and adds `appointment.slotId` to its module-level `recentlyBooked` `Set<string>`.

* **Runtime Reach:** Defines and exports `wasRecentlyBooked(slotId)` to query whether a slot ID is stored in `recentlyBooked`. No UI component or store action currently calls `wasRecentlyBooked`.

2. **`src/audit/logger.ts`**

* **Reaction:** Receives `{ appointment, patientName }` from the event payload and unshifts an `AuditEntry` object into its module-level `eventEntries` array with:

* `id`: `event-${appointment.id}`

* `occurredAt`: current ISO string timestamp

* `actor`: `appointment.bookedBy`

* `action`: `"Appointment booked"`

* `referralId`: `appointment.referralId`

* `detail`: `"Booked ${patientName} with clinician ${appointment.clinicianId}"`

* `severity`: `"info"`

* **Runtime Reach:** `getEventAudit()` returns a copy of `eventEntries`. `AuditLogPage` (`src/pages/AuditLogPage.tsx`) calls `getEventAudit()` during render, concatenates the entries with `useClinicStore` state (`[...getEventAudit(), ...audit]`), filters by search query, and displays the entries in the audit UI list.

---

Execution and Event Context
**Initialization Timing:** Both listener modules are loaded at module evaluation start when imported in `src/App.tsx` (`import "./scheduling/eventListener";` and `import "./audit/logger";`), ensuring subscriptions are registered on `clinicEvents` before any booking action runs.
**Emission Source:** `"appointment:booked"` is emitted in `src/triage/validation.ts` inside `checkAppointment(...)` after verifying patient eligibility and slot availability and setting `slot.bookedReferralId = referral.id`.
**Runtime Callers:** `checkAppointment` is invoked by the `bookAppointment` store action in `src/store/useClinicStore.ts` (triggered when confirming a slot in `src/components/SlotPicker.tsx` on `src/pages/ReferralDetailPage.tsx`) as well as in tests (`src/tests/scheduling.test.ts`).
**Unlistened Events:** The event payload interface (`src/events/types.ts`) also defines `"referral:accepted"` (emitted in `src/store/useClinicStore.ts`) and `"eligibility:failed"` (emitted in `src/triage/validation.ts`, `src/store/useClinicStore.ts`, and `src/jobs/nightlyReverification.ts`). Neither event has registered listeners on `clinicEvents`.
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
To add a new referral type, the primary type definition is added to the `ReferralType` union in **`src/types/domain.ts`**.

---

Required Code Changes

1. **Domain Type Definition** (**`src/types/domain.ts`**)

Update the `ReferralType` union definition:

```ts

export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "yourNewType";

```

2. **Priority Policy Map** (**`src/config/priorityRules.ts`**)

`referralPolicies` is typed as `Record<ReferralType, ReferralPolicy>`, so TypeScript requires an entry for the new type specifying `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`:

```ts

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

// ...

yourNewType: { basePoints: 0, finder: "standard", targetHours: 48 },

};

```

3. **Format Mapping** (**`src/utils/format.ts`**)

Add a display string mapping in `humaniseType`:

```ts

export function humaniseType(type: ReferralType): string {

return {

// ...

yourNewType: "Your New Type",

}[type];

}

```

4. **Triage Route Handler** (**`src/triage/routes/<yourNewType>.ts`**)

Create a new route file under `src/triage/routes/` that invokes `registerRoute`:

```ts

import { registerRoute } from "./registry";

registerRoute("yourNewType", (referral) => ({

summary: `Pathway summary for ${referral.reason}`,

recommendedService: referral.service,

requiresPhoneCall: false,

instructions: ["Instruction 1", "Instruction 2"],

}));

```

*Execution note:* Route files in this folder are auto-loaded by `src/triage/routes/loadRoutes.ts` using `import.meta.glob`. If a referral with the new type is evaluated by `routeReferral` in `src/triage/routes/registry.ts` without a registered route handler, `routeReferral` throws a runtime error.

---

UI & Styling Updates

1. **Filter Dropdown** (**`src/pages/ReferralListPage.tsx`**)

Add an `<option>` element to the pathway filter `<select>` element:

```tsx

<option value="yourNewType">Your New Type</option>

```

2. **Metric Summary Logic** (**`src/pages/ReferralListPage.tsx`**)

If the new referral type is time-sensitive, update the `urgent` metric filter calculation, which currently checks `item.type === "urgent" || item.type === "safeguarding"`.

3. **CSS Class Rules** (**`src/styles.css`**)

Add styling rules for visual indicators rendered by components:

- `.type-dot.type-yourNewType` (rendered by `ReferralTable` in `src/components/ReferralTable.tsx`)

- `.type-badge.type-yourNewType` (rendered by `ReferralDetailPage` in `src/pages/ReferralDetailPage.tsx`)

---

Test Updates & Domain Checks

1. **Registry Unit Test** (**`src/tests/registry.test.ts`**)

The test checking `registeredRouteCount()` explicitly asserts `expect(registeredRouteCount()).toBe(4)`. Adding a 5th route file requires updating this assertion to `5`.

2. **Conditional Eligibility & Redaction Rules** *(If applicable to the domain type)*

- **Eligibility checks** (**`src/triage/eligibility.ts`**): If special age or practice constraints apply to the new type (similar to the safeguarding rule `referral.type === "safeguarding" && age < 16`), add checks to `checkEligibility`.

- **Data Redaction** (**`src/api/pipeline/redact-stage.ts`**): If API payload fields require redaction for the new type, add checks in `redactBody`.
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
Modifying `src/config/priorityRules.ts` directly impacts triage banding logic (`src/triage/banding.ts`) and slot finder dispatch (`src/scheduling/service.ts`). Downstream, it alters UI suggestions on `PriorityPanel` (`src/components/PriorityPanel.tsx`), appointment slot lists in `SlotPicker` (`src/components/SlotPicker.tsx`), audit log entries and store priority assignments in `useClinicStore` (`src/store/useClinicStore.ts`), referral list metrics and filters (`src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`), and assertions in `src/tests/banding.test.ts` and `src/tests/eligibility.test.ts`.

---

Direct Imports of `src/config/priorityRules.ts`

1. **Triage Banding (`src/triage/banding.ts`)**

- Imports `priorityRules`, `bandThresholds`, and `referralPolicies`.

- `calculateBand(referral)` builds a context object `{ ...referral.signals, type: referral.type }`, filters `priorityRules` where `rule.matches(context)` is true, sums `referralPolicies[referral.type].basePoints` with matched rule points, maps score to a band via `bandThresholds` (falling back to `"green"`), and returns `{ band, score, matchedRules, targetHours }`.

2. **Scheduling Service (`src/scheduling/service.ts`)**

- Imports `referralPolicies`.

- `availableSlots(referral, clinicians)` reads `referralPolicies[referral.type].finder` to select between two strategies in `finders`:

- `"standard"` (`findSlots` in `src/scheduling/slotFinder.ts`): Filters active clinicians matching `referral.service`, collects unbooked future slots (`isAfter(startsAt, now)`), and sorts ascending by start time.

- `"continuity"` (`findContinuitySlots` in `src/scheduling/oldSlotFinder.ts`): Filters active clinicians matching `referral.service`, prioritises the assigned/preferred clinician (`referral.assignedClinicianId`), collects unbooked matching slots, and sorts ascending by start time.

---

Downstream UI, Store, Event, and Job Impacts

#### 1. Clinical Priority Suggestions (`src/components/PriorityPanel.tsx`)

**Execution path:** Rendered on `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`).
**UI effect:** Invokes `calculateBand(referral)` during render. Changes to rules, base points, thresholds, or policy targets update:

- Header score text (`Score {decision.score}`).

- Target response time text (`Target response within {decision.targetHours} hours`).

- Suggested band indicator (`<em>Suggested</em>` on the matching priority button).

- List of matched escalation signals (`decision.matchedRules` mapped to list items).

#### 2. Slot Picker Options (`src/components/SlotPicker.tsx`)

**Execution path:** Rendered on `ReferralDetailPage` when accepting or viewing an accepted referral.
**UI effect:** Calls `availableSlots(referral, clinicians)` inside `useMemo`. If `referralPolicies[type].finder` changes between `"standard"` and `"continuity"`, the displayed appointment choices reflect either general future slot availability or clinician-continuity sorting.

#### 3. Zustand Store Acceptance & Audit Logging (`src/store/useClinicStore.ts`)

**Execution path:** `acceptReferral(id, override)` uses `const band = override ?? calculateBand(referral).band`.

- **Live UI caller:** `ReferralDetailPage` explicitly passes its local `priority` state as `override` (`accept(referral.id, priority)`), bypassing the `calculateBand` fallback branch at runtime unless `override` is omitted.

- **Un-overridden caller / Fallback:** When `override` is not passed (such as in `src/tests/eligibility.test.ts`), `calculateBand(referral).band` determines the assigned priority.

- **Store & Audit effect:** Mutates `referral.priority` in state, creates an audit entry with `severity: band === "red" ? "critical" : "info"` displayed on `AuditLogPage` (`src/pages/AuditLogPage.tsx`), and emits `referral:accepted` via `clinicEvents` (`src/events/channel.ts`).

- **Event listener check:** No listener is registered for `referral:accepted` anywhere in the repository.

#### 4. Referral Worklist Filtering & Metrics (`src/pages/ReferralListPage.tsx`, `src/hooks/useReferralFilters.ts`, `src/components/ReferralTable.tsx`)

**Execution path:** Operates on assigned `referral.priority` values stored in Zustand state.

- **Metrics (`ReferralListPage.tsx`):** The "Time sensitive" metric counts referrals matching `priority === "red" || type === "urgent" || type === "safeguarding"`. Changes in band thresholds that alter assigned priority bands directly affect this metric count.

- **Filters (`useReferralFilters.ts`):** Priority band dropdown filtering matches against `referral.priority`.

- **Table (`ReferralTable.tsx`):** Priority badges display labels via `bandLabel(referral.priority)` (`src/utils/format.ts`).

---

Test Suite Assertions
**`src/tests/banding.test.ts`:** Directly calls `calculateBand` and asserts that safeguarding referrals evaluate to band `"red"`, routine referrals yield target hours of `336`, and deterioration signals populate `matchedRules`.
**`src/tests/eligibility.test.ts`:** Invokes `acceptReferral(id)` without an `override` argument, indirectly relying on `calculateBand` during store status mutations.
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
Yes, safeguarding referrals (where `referral.type === "safeguarding"` or `signals.safeguardingConcern === true`) are treated differently across clinical priority scoring, eligibility rules, routing guidance, workspace metrics, visual styling, and defined API pipeline middleware.

---

1. Priority Scoring and Response Target
**`src/config/priorityRules.ts`**:

* **Policy configuration**: `referralPolicies.safeguarding` assigns `basePoints: 8` (the highest base points of any type) and `targetHours: 4` (compared to 24–336 hours for other pathways).

* **Escalation rule**: The `safeguarding-signal` rule checks `context.safeguardingConcern`, adding 10 points and setting the band to `"red"`.

**Runtime usage**: Executed via `calculateBand` in `src/triage/banding.ts`, which is called during store acceptance (`src/store/useClinicStore.ts`) and rendered in `src/components/PriorityPanel.tsx`.

---

2. Eligibility Validation
**`src/triage/eligibility.ts`**:

* `checkEligibility()` checks if `referral.type === "safeguarding"` and the patient's age is under 16 (`age < 16`). If so, eligibility fails with the reason `"Child safeguarding team must coordinate this referral"`.

**Runtime usage**: Evaluated when accepting a referral (`src/store/useClinicStore.ts`), booking an appointment (`src/triage/validation.ts`), or running nightly reverification (`src/jobs/nightlyReverification.ts`).

---

3. Pathway Routing Guidance
**`src/triage/routes/safeguarding.ts`**:

* Registers a dedicated route handler for `"safeguarding"` returning:

* `summary`: `"Restricted safeguarding review for [Patient Name]"`

* `recommendedService`: `"Community nursing"`

* `requiresPhoneCall`: `true`

* `instructions`: `["Do not leave a voicemail", "Check safe contact method", "Notify safeguarding lead"]`

**Runtime usage**: Dynamically loaded by `src/triage/routes/loadRoutes.ts` and called in `src/pages/ReferralDetailPage.tsx`. Because `requiresPhoneCall` is `true`, `ReferralDetailPage` renders a dedicated warning notice: `"Telephone contact is required before booking."`

---

4. Workspace Metrics
**`src/pages/ReferralListPage.tsx`**:

* When calculating the **"Time sensitive"** metric card, `item.type === "safeguarding"` is explicitly included alongside `item.priority === "red"` and `item.type === "urgent"`.

---

5. UI Indicators & Visual Styling
**`src/pages/ReferralDetailPage.tsx`**:

* Renders an explicit `<span>Safeguarding</span>` tag in the clinical signals section when `referral.signals.safeguardingConcern` is `true`.

**`src/components/ReferralTable.tsx` & `src/pages/ReferralDetailPage.tsx`**:

* Renders type indicators with CSS classes `type-safeguarding`, `type-dot type-safeguarding`, and `type-badge type-safeguarding`.

**`src/styles.css`**:

* Pairs safeguarding tags with red highlight styling (`.type-dot.type-safeguarding` uses `#c65358`, and `.type-badge.type-safeguarding` uses `#9d3b42` text on a `#faeaeb` background).

---

6. API Pipeline Redaction (Defined Code Path)
**`src/api/pipeline/redact-stage.ts`**:

* Middleware checks if `referral.type === "safeguarding"`. If matched, it redacts outbound body payload fields:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

**Reach distinction**: `redactStage` is registered in `src/api/api-client.ts` and called by `src/api/referrals-api.ts`. However, these API helpers are not called by any active React components, store actions, or running application entry points.
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
In the running application, a slot is actually booked in **`src/triage/validation.ts`** inside the **`checkAppointment()`** function (line 35), where the selected clinician slot's `bookedReferralId` property is directly mutated:

```ts

slot.bookedReferralId = referral.id;

```

---

Control and Data Flow

1. **User Action (`src/components/SlotPicker.tsx`)**:

The user chooses a slot and clicks "Confirm appointment" (`src/components/SlotPicker.tsx`, line 89). The `submit` handler calls `onBook(slot.clinicianId, slot.id)` (`src/components/SlotPicker.tsx`, line 27).

2. **Page Handler (`src/pages/ReferralDetailPage.tsx`)**:

`ReferralDetailPage` handles `onBook` by calling the Zustand store action `book(referral.id, clinicianId, slotId)` (`src/pages/ReferralDetailPage.tsx`, lines 62–66).

3. **Validation & Slot Mutation (`src/triage/validation.ts` via `src/store/useClinicStore.ts`)**:

The store's `bookAppointment` action calls `checkAppointment(referral, clinician, slotId, state.actor)` (`src/store/useClinicStore.ts`, line 116).

In `checkAppointment` (`src/triage/validation.ts`, lines 8–42):

- Verifies referral eligibility via `checkEligibility(referral)` (lines 14–22).

- Confirms the slot exists, is unbooked (`!slot.bookedReferralId`), and matches the clinician's covered services (lines 23–27).

- Creates the `Appointment` object (lines 28–34).

- **Mutates the slot**: `slot.bookedReferralId = referral.id` (line 35).

- Emits the `"appointment:booked"` event via `clinicEvents` (lines 36–39).

4. **Event Subscribers (`src/scheduling/eventListener.ts` and `src/audit/logger.ts`)**:

Emitting `"appointment:booked"` synchronously triggers two registered event listeners:

- `src/scheduling/eventListener.ts` (lines 4–6) records `appointment.slotId` in its module-level `recentlyBooked` set.

- `src/audit/logger.ts` (lines 4–14) prepends an audit entry to `eventEntries`.

5. **Store State Update & Store Audit (`src/store/useClinicStore.ts`)**:

`bookAppointment` receives the returned `Appointment` object, updates Zustand store state (`appointments` array and sets referral `status` to `"booked"`, `appointmentId`, and `assignedClinicianId` on lines 122–134), and calls `get().addAudit(...)` to append an audit log entry to store state (lines 135–141).

---

Test-Only Call Sites
**`src/tests/scheduling.test.ts`**: Directly calls `checkAppointment()` (lines 20–22 and 29–31) to verify booking availability and double-booking prevention without invoking the Zustand store action.

---

Unused Helpers / Unreachable Booking Code
**`reserveSlot` (`src/scheduling/service.ts`, lines 21–25)**: An exported pure function that returns a cloned slot object with `bookedReferralId` set. It is not imported or called anywhere in the application or tests.
**`recordBooking` (`src/api/referrals-api.ts`, lines 10–16)**: An exported API client helper intended to POST booking details to an endpoint. It is not imported or called anywhere in the codebase.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

