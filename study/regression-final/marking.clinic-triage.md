# Marking sheet, clinic-triage

<!-- accuracy-gate-binding: 21ac8da0eb33316061c1f021407536233ee67cc34652a64add4ff5809657b982 -->

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
Execution starts in `index.html`, where the browser parses the document and executes the entry module script `<script type="module" src="/src/main.tsx"></script>` (`index.html`).

Execution Sequence

1. **HTML Loading (`index.html`)**

The browser loads the HTML document and triggers module execution via the script tag referencing `/src/main.tsx` (`index.html`).

2. **Module Evaluation & Side Effects (`src/main.tsx`, `src/App.tsx`)**

Importing `src/App.tsx` into `src/main.tsx` triggers top-level module evaluation for its dependency graph, which includes two side-effect imports (`src/App.tsx`):

* `src/scheduling/eventListener.ts`: Subscribes a listener to `clinicEvents` for the `"appointment:booked"` event (`src/scheduling/eventListener.ts`).

* `src/audit/logger.ts`: Subscribes a listener to `clinicEvents` for the `"appointment:booked"` event to record event-driven audit entries (`src/audit/logger.ts`).

3. **React DOM Root Creation & Rendering (`src/main.tsx`)**

`src/main.tsx` queries the DOM for `#root`, creates a React root via `ReactDOM.createRoot`, and renders the `<App />` component wrapped in `<React.StrictMode>` (`src/main.tsx`).

4. **Routing & Component Mounting (`src/App.tsx`)**

`<App />` renders a `<BrowserRouter>` route layout (`src/App.tsx`). On the default index path (`/`), React renders `<Layout />` (`src/components/Layout.tsx`) alongside `<ReferralListPage />` (`src/pages/ReferralListPage.tsx`).

5. **Store Initialization (`src/store/useClinicStore.ts`)**

As these components render, accessing `useClinicStore` initializes the store state by executing `create()` and cloning seed datasets (`seedReferrals`, `seedClinicians`, `seedAudit`) from `src/data/seed.ts` (`src/store/useClinicStore.ts`).
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
A referral’s priority band (`"red"`, `"amber"`, or `"green"`) is suggested by an automated scoring engine (`calculateBand` in `src/triage/banding.ts`) based on referral pathway policies and clinical signal rules defined in `src/config/priorityRules.ts`. On the detail page (`src/pages/ReferralDetailPage.tsx`), this recommendation is displayed via `PriorityPanel` (`src/components/PriorityPanel.tsx`) and pre-populates React component state. The user can accept the suggestion or pick an override before persisting the decision via the Zustand store action `acceptReferral` (`src/store/useClinicStore.ts`), which validates patient eligibility, sets `referral.priority` and `referral.status = "accepted"`, appends an audit log entry, and emits a `"referral:accepted"` event.

---

1. Automated Scoring Engine (`src/triage/banding.ts` & `src/config/priorityRules.ts`)

The function `calculateBand(referral)` constructs context `{ ...referral.signals, type: referral.type }` and evaluates rule matches:

1. **Base Points by Referral Type** (`referralPolicies` in `src/config/priorityRules.ts`):

- `routine`: `0` base points (target response: 336 hours / 14 days)

- `urgent`: `5` base points (target response: 24 hours)

- `followUp`: `1` base point (target response: 168 hours / 7 days)

- `safeguarding`: `8` base points (target response: 4 hours)

2. **Signal-Based Rule Scoring** (`priorityRules` in `src/config/priorityRules.ts`):

- `safeguarding-signal` (+10 points, band: `"red"`): `safeguardingConcern === true`

- `rapid-deterioration` (+7 points, band: `"red"`): `deterioration === true` AND `painScore >= 7`

- `severe-pain` (+4 points, band: `"amber"`): `painScore >= 7`

- `post-discharge` (+3 points, band: `"amber"`): `recentDischarge === true`

- `mobility` (+2 points, band: `"amber"`): `mobilityRisk === true`

- `persistent-symptoms` (+1 point, band: `"green"`): `symptomDays > 21`

3. **Threshold Resolution** (`bandThresholds` in `src/config/priorityRules.ts`):

Total Score = `basePoints` + sum of points from all matched rules. The score maps to the highest matching threshold:

- **Score $\ge$ 9**: `"red"` (Priority 1)

- **Score $\ge$ 4**: `"amber"` (Priority 2)

- **Score $\ge$ 0**: `"green"` (Priority 3; default fallback)

---

2. UI Presentation & Interactive Selection (`src/components/PriorityPanel.tsx` & `src/pages/ReferralDetailPage.tsx`)
**State Initialization**: In `ReferralDetailPage.tsx`, local React state `priority` is initialized to `referral.priority ?? "green"`.
**Panel Display**: `PriorityPanel` calls `calculateBand(referral)` to show:

- Score total (`decision.score`)

- Target response duration (`decision.targetHours`)

- Formatted suggested band label (`bandLabel(decision.band)`)

- List of matched clinical signals (`decision.matchedRules`)

- A `"Suggested"` badge on the option button matching `decision.band`.

**User Override**: Clicking an option button (`"red"`, `"amber"`, or `"green"`) triggers `onSelect(band)`, which updates the React local state setter `setPriority` in `ReferralDetailPage.tsx`.

*(Note: The store action `setPriority` defined in `src/store/useClinicStore.ts` exists as an unused helper; the UI updates React state locally prior to acceptance).*

---

3. Store Mutation, Validation & Audit (`src/store/useClinicStore.ts`)

When the user clicks `"Accept referral"` or `"Update priority"`, `onAccept()` in `ReferralDetailPage.tsx` executes `acceptReferral(referral.id, priority)`:

1. **Eligibility Check** (`src/triage/eligibility.ts`): Executes `checkEligibility(referral)`. If invalid (e.g. out-of-area postcode, invalid DOB, missing registered practice, or previously declined), it emits `"eligibility:failed"` on `clinicEvents` and throws an error, halting state changes.

2. **Band Resolution**: Uses the provided `override` argument supplied from React local state. *(The fallback `override ?? calculateBand(referral).band` in `acceptReferral` is bypassed by live UI callers because `ReferralDetailPage` always provides the local `priority` state value).*

3. **State Mutation**: Mutates `referrals` in Zustand store state, setting `priority: band` and `status: "accepted"`.

4. **Audit Logging**: Adds an entry via `addAudit`:

- `action`: `"Referral accepted"`

- `detail`: `"Priority assigned: <band>"`

- `severity`: `"critical"` if `band === "red"`, else `"info"`

5. **Event Emission**: Emits `"referral:accepted"` with `{ referralId: id, band, actor }` via `clinicEvents` (`src/events/channel.ts`). Currently, no active listener is registered for `"referral:accepted"`.
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
How a given referral type (`"routine"`, `"urgent"`, `"followUp"`, or `"safeguarding"`) is processed is determined across four main areas of the codebase: priority policy and slot-finder configuration in `src/config/priorityRules.ts` (consumed by `src/triage/banding.ts` and `src/scheduling/service.ts`), pathway guidance strategies registered in `src/triage/routes/` and loaded via `src/triage/routes/loadRoutes.ts` (consumed by `src/pages/ReferralDetailPage.tsx`), age-based eligibility enforcement in `src/triage/eligibility.ts`, and API data redaction in `src/api/pipeline/redact-stage.ts`.

---

1. Priority Policy & Scheduling Strategy Configuration

**File: `src/config/priorityRules.ts`**

The `referralPolicies` record configures base points, target hours, and slot finder keys per referral type:

`routine`: `basePoints: 0`, `targetHours: 336`, `finder: "standard"`
`urgent`: `basePoints: 5`, `targetHours: 24`, `finder: "standard"`
`followUp`: `basePoints: 1`, `targetHours: 168`, `finder: "continuity"`
`safeguarding`: `basePoints: 8`, `targetHours: 4`, `finder: "standard"`

#### Consumers and Behaviour:

**Triage Banding (`src/triage/banding.ts` - `calculateBand`)**: Lookups `referralPolicies[referral.type]` to compute total score (`basePoints` plus matching signal rule points) and sets `targetHours`.
**Scheduling Finder (`src/scheduling/service.ts` - `availableSlots`)**: Lookups `referralPolicies[referral.type].finder` to select the slot search implementation:

* `"standard"` calls `findSlots` (`src/scheduling/slotFinder.ts`): Filters active clinicians matching `referral.service`, flattens unbooked future slots for that service, and orders them by start time ascending.

* `"continuity"` calls `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`): Filters active clinicians matching `referral.service`, prioritises clinicians matching `referral.assignedClinicianId`, flattens unbooked slots for that service, and orders them by start time ascending.

---

2. Clinical Pathway Guidance & Routing Registry

**Files: `src/triage/routes/registry.ts`, `src/triage/routes/loadRoutes.ts`, and `src/triage/routes/*.ts`**

Pathway routing dispatches `referral.type` to dynamically loaded strategy modules:

`src/triage/routes/routine.ts`: Returns `recommendedService: referral.service`, `requiresPhoneCall: false`, summary with lowercased reason, and instructions to confirm demographics, offer first available slot, and send preparation guidance.
`src/triage/routes/urgent.ts`: Returns `recommendedService: referral.service`, `requiresPhoneCall: true`, summary with urgent review reason, and instructions to contact within two hours and check for escalation flags.
`src/triage/routes/followUp.ts`: Returns `recommendedService: referral.service`, `requiresPhoneCall: false`, summary referencing existing pathway, and instructions to review previous letters and prefer prior care teams.
`src/triage/routes/safeguarding.ts`: Returns `recommendedService: "Community nursing"`, `requiresPhoneCall: true`, summary referencing patient name, and instructions to avoid leaving voicemails, check safe contact methods, and notify safeguarding leads.

#### Consumer:

**Detail Page (`src/pages/ReferralDetailPage.tsx`)**: Calls `loadRoutes()` and executes `routeReferral(referral)` in a React `useEffect` hook to display the pathway instructions and warning banners.

---

3. Type-Specific Eligibility Rules

**File: `src/triage/eligibility.ts` (`checkEligibility`)**

Enforces age restrictions specific to safeguarding: if `referral.type === "safeguarding"` and the patient's calculated age is under 16, it marks the referral ineligible with the reason `"Child safeguarding team must coordinate this referral"`.

---

4. API Pipeline Redaction

**File: `src/api/pipeline/redact-stage.ts` (`redactStage`)**

Applies privacy controls before request payloads leave the application via `apiRequest` (`src/api/api-client.ts`). If `referral.type === "safeguarding"` and `patient` is present, `notes` is overwritten with `"[restricted clinical note]"` and patient fields are redacted (`phone` to `"[safe contact required]"` and `postcode` to `"[restricted]"`).

---

5. Workspace Aggregations & Filtering

**Files: `src/pages/ReferralListPage.tsx` and `src/hooks/useReferralFilters.ts`**

`ReferralListPage.tsx` includes `item.type === "urgent"` and `item.type === "safeguarding"` alongside `priority === "red"` when calculating the "Time sensitive" metric count.
`useReferralFilters.ts` filters the working list against the selected pathway filter (`type === "all" || referral.type === type`).
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
Eligibility checks in this application occur at **3 execution locations**, all delegating to the rule evaluation function `checkEligibility` defined in `src/triage/eligibility.ts` (lines 4–26).

1. Referral Acceptance (`acceptReferral`)
**Location:** `src/store/useClinicStore.ts` (line 51)
**Runtime Call Path:** Triggered when a user clicks "Accept referral" in the UI (`src/pages/ReferralDetailPage.tsx`, line 42, calling `onAccept` -> `acceptReferral`).
**Execution & Impact:**

* Runs `checkEligibility(referral)` on the target referral.

* If ineligible (`eligible: false`), emits the `eligibility:failed` event on `clinicEvents` (`src/events/channel.ts`) with phase `"acceptance"` and throws an error detailing the reasons. The referral state remains unchanged (`"incoming"`).

* If eligible, updates referral status to `"accepted"`, assigns the calculated or overridden priority band, logs an audit entry, and emits `referral:accepted`.

**Automated Test Coverage:** Reached in `src/tests/eligibility.test.ts` (lines 11, 19, 28).
2. Appointment Booking Validation (`checkAppointment`)
**Location:** `src/triage/validation.ts` (line 13)
**Runtime Call Path:** Triggered during appointment confirmation in `src/pages/ReferralDetailPage.tsx` (line 59, calling `onBook` -> `bookAppointment` in `src/store/useClinicStore.ts`, line 117 -> `checkAppointment`).
**Execution & Impact:**

* Runs `checkEligibility(referral)` prior to validating clinician slot availability.

* If ineligible (`eligible: false`), emits the `eligibility:failed` event on `clinicEvents` (`src/events/channel.ts`) with phase `"booking"` and throws an error detailing the reasons. No appointment record is created and no slot is mutated.

**Automated Test Coverage:** Directly called in `src/tests/scheduling.test.ts` (lines 21, 33).
3. Verification Job (`runNightlyReverification`)
**Location:** `src/jobs/nightlyReverification.ts` (line 20)
**Runtime Call Path:** Triggered when a user clicks "Run eligibility check" on the audit log view (`src/pages/AuditLogPage.tsx`, line 23, calling `verify` -> `runNightlyReverification`).
**Execution & Impact:**

* Filters the input referral array to candidates with status `"accepted"` or `"booked"`.

* Iterates through candidate referrals and calls `checkEligibility(referral)` on each record.

* If ineligible (`eligible: false`), records the failure in the returned `VerificationReport` object and emits `eligibility:failed` on `clinicEvents` (`src/events/channel.ts`) with phase `"nightly"`.

---

Core Eligibility Rules (`src/triage/eligibility.ts`)

Each call site evaluates the following criteria in `checkEligibility`:

1. **Invalid Date of Birth:** Calculated age via `differenceInYears` is `< 0` or birth date is in the future according to `isFuture`.

2. **Out of Area:** Postcode does not match the commissioned regular expression `/^LS\d{1,2}/`.

3. **Unregistered Practice:** Patient `registeredPractice` field is empty or contains only whitespace.

4. **Already Declined:** Referral `status` is `"declined"`.

5. **Safeguarding Age Threshold:** Referral `type` is `"safeguarding"` and patient age is `< 16`.
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
When an outgoing API request is executed via `apiRequest` (`src/api/api-client.ts`), it passes sequentially through a three-stage composed execution pipeline (`traceStage` $\rightarrow$ `authStage` $\rightarrow$ `redactStage`) before reaching the terminal `transport` handler (`src/api/api-client.ts`).

---

Execution Flow & Pipeline Details

#### 1. Header Initialization & Pipeline Composition (`src/api/api-client.ts`)

When `apiRequest()` is invoked, it normalizes the input request object by assigning `headers: request.headers ?? {}` before passing it to the `composed` handler (`src/api/api-client.ts`). `composed` is constructed using `stages.reduceRight` over `[traceStage, authStage, redactStage]` with `transport` as the initial `ApiNext` continuation (`src/api/api-client.ts`). This structure guarantees that requests flow forward through `traceStage`, then `authStage`, then `redactStage`, and finally into `transport`.

#### 2. Trace ID Generation (`src/api/pipeline/trace-stage.ts`)

The request enters `traceStage`:

Generates a trace string formatted as `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`.
Merges this into the request headers under the key `"X-Trace-Id"`.
Calls `next` with the updated request to invoke `authStage`.

#### 3. Authentication Enrichment (`src/api/pipeline/auth-stage.ts`)

The request enters `authStage`:

Appends two static session headers to the request:

- `Authorization: "Bearer clinic-session"`

- `"X-Staff-Role": "triage"`

Calls `next` with the enriched request to invoke `redactStage`.

#### 4. Body Redaction (`src/api/pipeline/redact-stage.ts`)

The request enters `redactStage`, where `request.body` is processed by `redactBody()`:

**Safeguarding Redaction**: If `request.body` represents a referral where `referral.type === "safeguarding"` and `referral.patient` is defined, `redactBody` returns a copy of the referral where:

- `notes` is overwritten with `"[restricted clinical note]"`.

- `patient.phone` is overwritten with `"[safe contact required]"`.

- `patient.postcode` is overwritten with `"[restricted]"`.

**Passthrough**: For non-safeguarding referrals, missing patient objects, or non-referral payloads, `request.body` is returned unchanged.
Calls `next` with the redacted body to pass the request to `transport`.

#### 5. Transport Terminal Handler (`src/api/api-client.ts`)

The modified request reaches `transport`:

Instead of making a network call over `fetch` or HTTP, `transport` resolves a mock `ApiResponse` promise containing:

- `status: 200`

- `data: request.body ?? { ok: true }`

- `requestId: request.headers["X-Trace-Id"] ?? "local"`

---

Direct Evidence vs. Application Reach
**Direct Evidence**: The pipeline order, stage composition, header mutations, trace ID format, and conditional body redactions are explicitly implemented in `src/api/api-client.ts`, `src/api/pipeline/trace-stage.ts`, `src/api/pipeline/auth-stage.ts`, and `src/api/pipeline/redact-stage.ts`.
**Runtime Reach / Application Usage**: While `submitReferral` and `recordBooking` in `src/api/referrals-api.ts` wrap `apiRequest`, neither `apiRequest` nor `referrals-api.ts` are imported or called by the application's store (`src/store/useClinicStore.ts`) or UI pages (`src/pages/ReferralDetailPage.tsx`), which manage state locally.
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
`checkAppointment` **changes state**; it is not a read-only check function.

State Changes Performed by `checkAppointment`

1. **Direct In-Place Object Mutation (`src/triage/validation.ts`)**

When all validation checks pass, `checkAppointment` directly mutates the matching `Slot` object within the passed `clinician` argument in-place:

```ts

slot.bookedReferralId = referral.id;

```

2. **Event Emission and Module-Level Listener State Mutations (`src/triage/validation.ts`)**

On a successful booking, `checkAppointment` emits the `appointment:booked` event via `clinicEvents`. This triggers two registered event listeners:

* **`src/scheduling/eventListener.ts`**: Adds `appointment.slotId` to the module-scoped `recentlyBooked` `Set`.

* **`src/audit/logger.ts`**: Unshifts a new audit entry object into the module-scoped `eventEntries` array.

*Failure Path*: If referral eligibility check fails, `checkAppointment` emits an `eligibility:failed` event via `clinicEvents` before throwing an error. Currently, no listeners are registered for this event (`src/events/channel.ts`).

---

Application Context and Callers
**Zustand Store (`src/store/useClinicStore.ts`)**: The `bookAppointment` action calls `checkAppointment`, which mutates the clinician's slot in-place and returns an `Appointment`. `bookAppointment` then updates the store state by:

* Appending the new appointment to `appointments`.

* Updating the target referral in `referrals` (`status: "booked"`, `appointmentId`, `assignedClinicianId`).

* Adding an audit entry to store state via `addAudit`.

**Tests (`src/tests/scheduling.test.ts`)**: Unit tests call `checkAppointment` directly to verify that `slot.bookedReferralId` is set and that subsequent booking attempts on the same slot throw an error.
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
For a follow-up referral (`referral.type === "followUp"`), the **`findContinuitySlots`** function from `src/scheduling/oldSlotFinder.ts` runs.

Why `findContinuitySlots` Runs

When slot availability is evaluated (for example, in `SlotPicker` in `src/components/SlotPicker.tsx` via `availableSlots`):

1. **Policy Lookup**: `availableSlots` in `src/scheduling/service.ts` reads `referralPolicies[referral.type].finder` to resolve the strategy key for the referral's type.

2. **Configuration Mapping**: In `src/config/priorityRules.ts`, the policy entry for `followUp` configures `finder` as `"continuity"`:

```typescript

export const referralPolicies: Record<ReferralType, ReferralPolicy> = {

followUp: { basePoints: 1, finder: "continuity", targetHours: 168 },

// ...

};

```

3. **Dispatch Table Lookup**: In `src/scheduling/service.ts`, the internal `finders` registry maps `"continuity"` directly to the imported `findContinuitySlots` handler:

```typescript

const finders: Record<string, SlotFinder> = {

standard: findSlots,

continuity: findContinuitySlots,

};

```

4. **Execution Call**: `availableSlots` invokes `findContinuitySlots` with `{ referral, clinicians, preferredClinicianId: referral.assignedClinicianId }`.

Implementation Behaviour of `findContinuitySlots`

In `src/scheduling/oldSlotFinder.ts`, `findContinuitySlots` determines matching slots through the following steps:

1. **Clinician Filtering**: Filters clinicians to retain only those who are active (`clinician.active`) and qualified for the referral's requested service (`clinician.services.includes(referral.service)`).

2. **Continuity Preference Sorting**: Sorts candidate clinicians so that if a clinician matches `preferredClinicianId` (`referral.assignedClinicianId`), that clinician is ranked ahead of others.

3. **Slot Filtering**: Extracts each clinician's slots, retaining only those that are currently unbooked (`!slot.bookedReferralId`) and match the referral's service (`slot.service === referral.service`).

4. **Chronological Sorting**: Sorts all gathered slots chronologically ascending by start time (`compareAsc(new Date(a.startsAt), new Date(b.startsAt))`).
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
Two active listeners react to the **`"appointment:booked"`** event emitted during appointment validation and booking in `src/triage/validation.ts`. Both listener modules are imported at application startup in `src/App.tsx`. A second event emitted during booking validation, **`"eligibility:failed"`**, has no registered listeners in `src/events/channel.ts`.

1. Audit Logger Listener (`src/audit/logger.ts`)
**Trigger & Reaction**: Listens for `"appointment:booked"` via `clinicEvents.on` and prepends (`unshift`) a new `AuditEntry` object (`action: "Appointment booked"`, `severity: "info"`, incorporating `patientName` and clinician ID) to an in-memory `eventEntries` array.
**Reach & Downstream Flow**: Exposes `getEventAudit()`, which returns `[...eventEntries]`. In `src/pages/AuditLogPage.tsx`, the `AuditLogPage` component calls `getEventAudit()` inside a `useMemo` hook, combining these entries with store audit state (`[...getEventAudit(), ...audit]`) to filter, sort, and display the event in the audit log UI.
2. Slot Tracking Listener (`src/scheduling/eventListener.ts`)
**Trigger & Reaction**: Listens for `"appointment:booked"` via `clinicEvents.on` and adds `appointment.slotId` to a module-scoped `recentlyBooked` `Set<string>`.
**Reach & Downstream Flow**: Exposes `wasRecentlyBooked(slotId: string)`, which checks if `recentlyBooked` contains the slot ID. While the listener is active at runtime via `src/App.tsx`, `wasRecentlyBooked` is not called by any UI component, store, background job, or test.

---

Unhandled Scheduling Event
**`"eligibility:failed"` (`src/triage/validation.ts`)**: If `checkAppointment` encounters an ineligible referral during scheduling, it emits `"eligibility:failed"` with payload `{ referralId, reasons, phase: "booking" }` before throwing an error. Because no listeners are registered on `clinicEvents` for `"eligibility:failed"`, no side effect or state update occurs in response to this emission.
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
To add a new referral type to the repository, you must update the `ReferralType` type union and several required type maps, pathway route modules, UI components, tests, and style definitions.

---

Required Code Changes

#### 1. Domain Type Definition

**`src/types/domain.ts`**

Add the new string literal member to the `ReferralType` union:

```ts

export type ReferralType = "routine" | "urgent" | "followUp" | "safeguarding" | "newType";

```

#### 2. Mandatory Exhaustive Type Mappings

**`src/config/priorityRules.ts`**

`referralPolicies` is typed as `Record<ReferralType, ReferralPolicy>`. Adding a new member to `ReferralType` causes a TypeScript compilation error until a matching key is added containing `basePoints`, `finder` (`"standard"` or `"continuity"`), and `targetHours`.

**`src/utils/format.ts`**

The `humaniseType` function maps `ReferralType` values to display labels. TypeScript requires adding the new referral type key to the record inside `humaniseType`.

#### 3. Pathway Guidance Module & Registry

**`src/triage/routes/`**

Create a new TypeScript route handler file inside the `src/triage/routes/` directory (following existing files such as `src/triage/routes/routine.ts` or `src/triage/routes/urgent.ts`). The module must call `registerRoute` to register a `RouteHandler` for the new type.

* *Reasoning:* `loadRoutes()` in `src/triage/routes/loadRoutes.ts` uses `import.meta.glob` to auto-load modules in `src/triage/routes/`. If no handler is registered, `routeReferral()` in `src/triage/routes/registry.ts` throws a runtime error when `ReferralDetailPage` renders pathways in `src/pages/ReferralDetailPage.tsx`.

#### 4. Automated Tests

**`src/tests/registry.test.ts`**

The test asserts `expect(registeredRouteCount()).toBe(4)`. Adding a new route file to `src/triage/routes/` will increment the count to 5, causing this test assertion to fail unless updated.

#### 5. User Interface & Filters

**`src/pages/ReferralListPage.tsx`**

* Add a corresponding `<option value="newType">` to the pathway filter `<select aria-label="Filter referral type">`.

* If the new type is time-sensitive, update the `urgent` summary metric check (`item.type === "urgent" || item.type === "safeguarding"`).

#### 6. CSS Styles

**`src/styles.css`**

`src/components/ReferralTable.tsx` and `src/pages/ReferralDetailPage.tsx` dynamically assign CSS classes using `type-${referral.type}` on dot markers and badges. Corresponding class rules (`.type-dot.type-newType` and `.type-badge.type-newType`) must be defined in `src/styles.css`.

---

Optional Domain & Pipeline Updates
**Eligibility Checks (`src/triage/eligibility.ts`)**: Add conditional logic if the new referral type requires specific validation (such as age restrictions or practice checks, similar to `safeguarding`).
**API Redaction Pipeline (`src/api/pipeline/redact-stage.ts`)**: Update `redactBody()` if payload sanitization is needed for sensitive referral types before request execution.
**Seed Data (`src/data/seed.ts`)**: Add scenarios using the new referral type to populate the initial workspace state.

---

Evidence Distinction
**Direct Evidence**:

* Union type definition in `src/types/domain.ts`.

* Mandatory record mappings in `src/config/priorityRules.ts` (`referralPolicies`) and `src/utils/format.ts` (`humaniseType`).

* Dynamic module globbing in `src/triage/routes/loadRoutes.ts` and dispatch error in `src/triage/routes/registry.ts`.

* Registered count assertion in `src/tests/registry.test.ts`.

* Hardcoded filter select options in `src/pages/ReferralListPage.tsx`.

**Inferred**:

* Creating a new route handler file in `src/triage/routes/` based on patterns in `src/triage/routes/routine.ts`, `src/triage/routes/urgent.ts`, `src/triage/routes/followUp.ts`, and `src/triage/routes/safeguarding.ts`.

* Visual styling rules in `src/styles.css` inferred from class interpolations in `src/components/ReferralTable.tsx` and `src/pages/ReferralDetailPage.tsx`.
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
Changing the exports in `src/config/priorityRules.ts` (`priorityRules`, `referralPolicies`, or `bandThresholds`) directly alters triage calculation results in `src/triage/banding.ts` (`calculateBand`) and slot finder dispatch in `src/scheduling/service.ts` (`availableSlots`). Downstream effects propagate to UI suggestions in `PriorityPanel`, slot availability in `SlotPicker`, audit logging severity and state saved during non-overridden store acceptances, priority-based workspace filtering/metrics for saved priorities, and automated test suites.

---

1. Direct Triage Banding (`src/triage/banding.ts`)
**`calculateBand(referral)`**: Direct consumer of `priorityRules`, `referralPolicies`, and `bandThresholds`.

* Filters and matches clinical signals defined in `priorityRules`.

* Combines base points from `referralPolicies[referral.type].basePoints` with matched rule points.

* Maps the cumulative score against `bandThresholds` to determine `band` (`red`, `amber`, or `green`).

* Returns `{ band, score, matchedRules, targetHours }` using `referralPolicies[referral.type].targetHours`.

---

2. Live UI Priority Guidance (`src/components/PriorityPanel.tsx` & `src/pages/ReferralDetailPage.tsx`)
**`PriorityPanel`**: Executed on render inside `ReferralDetailPage.tsx`, calling `calculateBand(referral)` to present:

* Calculated clinical score (`Score {decision.score}`).

* Suggested response timeframe (`decision.targetHours`).

* Placement of the *"Suggested"* visual badge on the matching priority option button (`decision.band`).

* List of rule IDs (`decision.matchedRules`) under *"Signals considered"* (or fallback text if empty).

---

3. Slot Finder Dispatch (`src/scheduling/service.ts`)
**`availableSlots(referral, clinicians)`**: Reads `referralPolicies[referral.type].finder` to select the slot search strategy:

* `"standard"`: Dispatches to `findSlots` (`src/scheduling/slotFinder.ts`), returning unbooked, future slots for active clinicians covering the service.

* `"continuity"`: Dispatches to `findContinuitySlots` (`src/scheduling/oldSlotFinder.ts`), prioritizing clinicians matching `referral.assignedClinicianId`.

**Downstream UI Consumer**: Dictates the slot array displayed in `SlotPicker` (`src/components/SlotPicker.tsx`) on `ReferralDetailPage.tsx`.

---

4. Store State, Audit Logs, and Event Execution (`src/store/useClinicStore.ts`)
**`acceptReferral(id, override)`**:

* **Fallback Behavior**: Calls `calculateBand(referral).band` only when `override` is omitted. In the live user interface (`src/pages/ReferralDetailPage.tsx`), `onAccept` explicitly supplies `priority` state as an override, bypassing this calculation.

* **State & Audit Effects**: When `acceptReferral` relies on the calculated fallback (such as in programmatic or test invocations), changing rules alters the saved `referral.priority`, the audit log entry severity (`critical` for `red`, otherwise `info`), and the `band` payload emitted on `clinicEvents` via `referral:accepted`.

---

5. Workspace Filters, Metrics, and Badges
**Saved Priority Consumers**: When stored `referral.priority` values are saved or updated:

* `useReferralFilters` (`src/hooks/useReferralFilters.ts`) filters list items by priority band.

* `ReferralListPage` (`src/pages/ReferralListPage.tsx`) includes referrals with `referral.priority === "red"` in the *"Time sensitive"* count.

* `ReferralTable` (`src/components/ReferralTable.tsx`) formats priority badges using `bandLabel(referral.priority)`.

---

6. Test Suite Impact
**`src/tests/banding.test.ts`**: Verifies exact band classification, policy target hours, and rule matching output from `calculateBand`.
**`src/tests/eligibility.test.ts`**: Calls `acceptReferral` without an override, directly invoking `calculateBand` during state updates.
**`src/tests/scheduling.test.ts`**: Invokes `availableSlots`, validating slot filtering behavior driven by `referralPolicies`.
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
Yes, safeguarding referrals (`type === "safeguarding"`) and safeguarding clinical signals (`signals.safeguardingConcern === true`) are treated differently across priority scoring, eligibility rules, routing pathways, API middleware redaction, UI metrics, and CSS styling:

1. Priority Scoring & Target Response Times
**`src/config/priorityRules.ts`**:

* Safeguarding referral types (`referralPolicies.safeguarding`) receive a base score of `8` points and an SLA target response time of `4` hours (compared to 24 hours for urgent, 168 hours for follow-up, and 336 hours for routine).

* The `safeguarding-signal` priority rule matches when `signals.safeguardingConcern` is `true`, adding `10` points to the triage score and designating a `red` band.

2. Triage & Eligibility Constraints
**`src/triage/eligibility.ts`**:

* In `checkEligibility`, if `referral.type === "safeguarding"` and the patient's age is under 16 years (`age < 16`), eligibility fails with the reason `"Child safeguarding team must coordinate this referral"`.

* This check is invoked during referral acceptance (`acceptReferral` in `src/store/useClinicStore.ts`), booking validation (`checkAppointment` in `src/triage/validation.ts`), and automated reverification (`runNightlyReverification` in `src/jobs/nightlyReverification.ts`).

3. Pathway Guidance & Routing
**`src/triage/routes/safeguarding.ts`**:

* Registers a dedicated routing handler for `"safeguarding"`.

* Sets the summary to `"Restricted safeguarding review for <patient.name>"`, overrides the recommended service to `"Community nursing"`, sets `requiresPhoneCall: true`, and returns specific compliance instructions (`"Do not leave a voicemail"`, `"Check safe contact method"`, and `"Notify safeguarding lead"`).

* Loaded dynamically via `loadRoutes` (`src/triage/routes/loadRoutes.ts`) and rendered in `ReferralDetailPage` (`src/pages/ReferralDetailPage.tsx`).

4. API Request Redaction Middleware
**`src/api/pipeline/redact-stage.ts`**:

* Intercepts outgoing API payloads processed by `apiRequest` (`src/api/api-client.ts`).

* If `request.body` contains a referral where `type === "safeguarding"`, `redactBody` sanitizes sensitive fields prior to transmission:

* `notes` $\rightarrow$ `"[restricted clinical note]"`

* `patient.phone` $\rightarrow$ `"[safe contact required]"`

* `patient.postcode` $\rightarrow$ `"[restricted]"`

* *(Note: `submitReferral` and `recordBooking` in `src/api/referrals-api.ts` execute through this middleware pipeline, though neither function is currently called in the UI views).*

5. Metrics, UI Displays & CSS Styling
**`src/pages/ReferralListPage.tsx`**:

* The **"Time sensitive"** metric counter includes safeguarding referrals alongside red-priority and urgent referrals (`item.type === "safeguarding"`).

**`src/pages/ReferralDetailPage.tsx`**:

* Displays a `<span>Safeguarding</span>` risk chip in the **Clinical signals** section when `referral.signals.safeguardingConcern` is `true`.

**`src/components/ReferralTable.tsx` & `src/styles.css`**:

* Applies distinct visual indicators (`.type-dot.type-safeguarding` and `.type-badge.type-safeguarding`) using red warning colors (`#c65358` / `#9d3b42`).
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
A slot is actually marked as booked in **`src/triage/validation.ts`** inside `checkAppointment`, where the slot object within the clinician's slot list is directly mutated:

```ts

slot.bookedReferralId = referral.id;

```

This mutation is orchestrated by the Zustand store action `bookAppointment` in **`src/store/useClinicStore.ts`**.

---

Execution & Control Flow

1. **User UI Trigger (`src/components/SlotPicker.tsx` & `src/pages/ReferralDetailPage.tsx`)**

- In `SlotPicker`, clicking **Confirm appointment** executes `submit()`, which calls the `onBook` callback with `(slot.clinicianId, slot.id)`.

- In `ReferralDetailPage`, `onBook` calls `book(referral.id, clinicianId, slotId)`, invoking the store action `bookAppointment`.

2. **Validation & Direct Mutation (`src/store/useClinicStore.ts` & `src/triage/validation.ts`)**

- `bookAppointment` in `src/store/useClinicStore.ts` retrieves the referral and clinician from store state and calls `checkAppointment(referral, clinician, slotId, state.actor)`.

- `checkAppointment` in `src/triage/validation.ts`:

- Evaluates eligibility via `checkEligibility(referral)`. If ineligible, it emits an `"eligibility:failed"` event on `clinicEvents` and throws an error.

- Verifies the slot exists, is not already booked (`!slot.bookedReferralId`), and that the clinician covers `referral.service`.

- Mutates the slot in-place: `slot.bookedReferralId = referral.id`.

- Emits `"appointment:booked"` on `clinicEvents`.

3. **Downstream State Updates & Event Receivers**

- **Store Updates (`src/store/useClinicStore.ts`)**: Appends the new `Appointment` to `state.appointments`, updates the referral in `state.referrals` (`status: "booked"`, `appointmentId`, `assignedClinicianId`), and appends an entry to `state.audit`.

- **Event Handlers**:

- `src/scheduling/eventListener.ts`: Adds `appointment.slotId` to its internal `recentlyBooked` Set upon receiving `"appointment:booked"`.

- `src/audit/logger.ts`: Prepends an audit entry to `eventEntries` upon receiving `"appointment:booked"`.

---

Unused Booking Helpers
**`reserveSlot` (`src/scheduling/service.ts`)**: An exported function that returns a shallow copy of a slot with `bookedReferralId` assigned. It is not called by any UI or store workflow.
**`recordBooking` (`src/api/referrals-api.ts`)**: An exported API wrapper function that sends a `POST` request to `/referrals/${referral.id}/booking`, but it is never invoked in the running application.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

