# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: be74dc7635be5dbb588bd56195931f462b34d4139064b06e6ddaff4af30b6b71 -->

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

    python3 analysis/marking_sheet.py collect study/regression-final/accuracy-gate.warehouse-dispatch.json study/regression-final/marking.warehouse-dispatch.md

---

## Q1, orientation

> Where does execution start in this project?

### Ground truth, this is the standard

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. The router is not created by `App`: it is built once at module scope
when `App.tsx` is first imported. `App` itself installs the notification listeners, calls the
store's `initialize`, and renders the `RouterProvider` around the router that already exists.

**Files:** src/main.tsx:1-10, src/App.tsx:11-22, src/App.tsx:24-31

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The distinction matters for a question about where execution starts: the route table is
constructed at import time, before any component renders, whereas the listeners and the store
initialisation run inside an effect after the first render.

This is the client entry point; there is no separate application server because API behaviour
is mocked in-process.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/main.tsx (0.9), src/api/interceptors/index.ts (0.82), src/App.tsx (0.68), src/styles.css (0.65), package.json (0.64), src/jobs/revalidation.ts (0.61), src/store/useWarehouseStore.ts (0.61), src/api/api-client.ts (0.59), src/api/interceptors/audit-interceptor.ts (0.59), src/api/interceptors/auth-interceptor.ts (0.59), src/api/interceptors/hazardous-interceptor.ts (0.59), src/api/interceptors/types.ts (0.59), src/types/domain.ts (0.59), src/components/Layout.tsx (0.49), src/notifications/listener.ts (0.49), src/pages/DispatchLogPage.tsx (0.49), src/pages/OrderDetailPage.tsx (0.49), src/pages/OrderListPage.tsx (0.49), src/pages/ZoneOverviewPage.tsx (0.49), src/components/Toasts.tsx (0.44), src/data/seedData.ts (0.44), src/dispatch/allocator.ts (0.44), src/dispatch/orderService.ts (0.44), src/dispatch/releaseService.ts (0.44), src/notifications/service.ts (0.44), src/stock/reservation.ts (0.44), src/api/mock-server.ts (0.39), src/components/OrderCard.tsx (0.39), src/components/ZoneCard.tsx (0.39), src/config/zoneRules.ts (0.39), src/dispatch/handlers/registry.ts (0.39), src/dispatch/validation.ts (0.39), src/events/bus.ts (0.39), src/pricing/legacyPricing.ts (0.39), src/pricing/pricing.ts (0.39), src/stock/stockService.ts (0.39), src/tests/reservation.test.ts (0.39), src/tests/validation.test.ts (0.39), src/utils/formatters.ts (0.39), src/tests/allocation.test.ts (0.29), src/tests/pricing.test.ts (0.29), index.html (0), README.md (0), src/dispatch/handlers/bulkHandler.ts (0), src/dispatch/handlers/expressHandler.ts (0), src/dispatch/handlers/hazardousHandler.ts (0), src/dispatch/handlers/standardHandler.ts (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Execution starts in **`index.html`**, where the browser parses the HTML document and loads the entry script **`src/main.tsx`** via a native ES module script tag (`<script type="module" src="/src/main.tsx">`).

---

Step-by-Step Startup and Execution Sequence

1. **HTML Document Parsing (`index.html`)**

- The browser parses `index.html` (`index.html`, lines 1–2), creating the DOM container `<div id="root"></div>` and requesting `/src/main.tsx`.

2. **Module Evaluation (`src/main.tsx` & `src/App.tsx`)**

- **`src/main.tsx` evaluation**: Imports React, `ReactDOM` (`react-dom/client`), `./App`, and `./styles.css` (`src/main.tsx`, lines 1–4).

- **`src/App.tsx` evaluation**: Evaluated during import resolution. Top-level code executes `createBrowserRouter(...)` (`src/App.tsx`, lines 12–23) to construct the router instance with routes for `/` (`OrderListPage`), `/orders/:orderId` (`OrderDetailPage`), `/zones` (`ZoneOverviewPage`), and `/log` (`DispatchLogPage`) inside the `<Layout />` component.

3. **React Root Creation and Synchronous Render (`src/main.tsx` & `src/App.tsx`)**

- `src/main.tsx` calls `ReactDOM.createRoot(document.getElementById("root")!).render(...)` (`src/main.tsx`, lines 6–10), mounting `<App />` wrapped in `<React.StrictMode>` into `#root`.

- `<App />` renders `<RouterProvider router={router} />` (`src/App.tsx`, line 30), rendering the root layout `<Layout />` and initial index component `<OrderListPage />`.

4. **Post-Mount Effect Execution & Runtime Initialization (`src/App.tsx`)**

- After the initial mount, `<App />` runs its `useEffect` hook (`src/App.tsx`, lines 25–29):

1. **`installNotificationListeners()`** (`src/notifications/listener.ts`, lines 5–24): Sets `installed = true` and registers event handlers on `eventBus` for `"shipment.released"` and `"stock.low"`.

2. **`initialize()`** (`src/store/useWarehouseStore.ts`, lines 94–128):

- Guards against re-initialization (`if (get().initialized) return`).

- Sets Zustand store state `{ initialized: true }`.

- Starts a 300ms polling interval (`window.setInterval`) calling `drainNotifications()` to pull pending notifications into store state.

- Calls `startRevalidationJob()` (`src/jobs/revalidation.ts`, lines 49–62) to set a recurring 60,000ms background interval (`window.setInterval`) that runs `revalidateReservations` against the store state and logs held allocations.

- Attaches a single-use `beforeunload` listener to `window` to clear `pullNotifications` and stop the revalidation job on teardown.

---

Evidence Summary
**Direct Evidence**:

* `index.html`: Contains `<script type="module" src="/src/main.tsx">` and `<div id="root">`.

* `src/main.tsx`: Executes `ReactDOM.createRoot` and `.render()`.

* `src/App.tsx`: Module-scope call to `createBrowserRouter`, component render of `<RouterProvider>`, and post-mount `useEffect` triggering initialization.

* `src/notifications/listener.ts`: `installNotificationListeners` registers `eventBus` listeners.

* `src/store/useWarehouseStore.ts`: `initialize` sets state, starts notification polling, triggers background revalidation, and attaches cleanup listeners.

* `src/jobs/revalidation.ts`: `startRevalidationJob` starts the 60,000ms revalidation timer.

**Inference**: Vite serves `index.html` as the web application entry point for development (`vite`) and build previews (`vite preview`) based on standard Vite configuration (`package.json`, lines 1–2; `vite.config.ts`, lines 1–18).
```

**Verdict:** incorrect

**Why (one line, for the log):** Says execution starts in `index.html`, while the ground truth defines `src/main.tsx` as the browser entry point.
---

## Q2, config-driven behaviour

> How is an order assigned to a warehouse zone?

### Ground truth, this is the standard

`allocateOrder` processes each order line independently. It scores every zone with `scoreZone`,
removes inactive zones and zones without the SKU, sorts by descending score, and proposes
allocations from available stock until the requested quantity is covered. `scoreZone` applies
configuration rules in priority order: hazardous isolation, cold-chain compatibility,
order-type routing, and capacity balance. `applyStockReservation` then accepts only quantities
still available and updates reserved stock in a cloned zone set.

**Files:** src/dispatch/allocator.ts:17-73, src/config/zoneRules.ts:14-19, src/config/zoneRules.ts:28-85, src/stock/reservation.ts:9-45

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

An order can be split across zones and its different lines can go to different zones. The
result is `held` if the accepted allocations do not cover every line completely
(allocator.ts:59-69).

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/store/useWarehouseStore.ts (0.76), src/App.tsx (0.73), src/config/zoneRules.ts (0.7), src/pages/OrderDetailPage.tsx (0.7), src/pages/OrderListPage.tsx (0.7), src/pages/ZoneOverviewPage.tsx (0.7), src/data/seedData.ts (0.67), src/dispatch/allocator.ts (0.67), src/dispatch/releaseService.ts (0.67), src/jobs/revalidation.ts (0.67), src/pricing/pricing.ts (0.67), src/stock/reservation.ts (0.67), src/tests/pricing.test.ts (0.67), src/components/OrderCard.tsx (0.64), src/components/ZoneCard.tsx (0.64), src/dispatch/orderService.ts (0.64), src/api/interceptors/hazardous-interceptor.ts (0.61), src/api/mock-server.ts (0.61), src/components/Layout.tsx (0.61), src/components/Toasts.tsx (0.61), src/dispatch/handlers/registry.ts (0.61), src/dispatch/validation.ts (0.61), src/events/bus.ts (0.61), src/pages/DispatchLogPage.tsx (0.61), src/pricing/legacyPricing.ts (0.61), src/stock/stockService.ts (0.61), src/tests/allocation.test.ts (0.61), src/utils/formatters.ts (0.61), src/notifications/service.ts (0.55), src/types/domain.ts (0.55), src/main.tsx (0.53), src/notifications/listener.ts (0.53), src/tests/reservation.test.ts (0.48), src/tests/validation.test.ts (0.48), src/api/api-client.ts (0.46), src/api/interceptors/index.ts (0.44), src/api/interceptors/types.ts (0.44), src/dispatch/handlers/bulkHandler.ts (0.44), src/dispatch/handlers/expressHandler.ts (0.44), src/dispatch/handlers/hazardousHandler.ts (0.44), src/dispatch/handlers/standardHandler.ts (0.44), src/styles.css (0.35), src/api/interceptors/audit-interceptor.ts (0.29), src/api/interceptors/auth-interceptor.ts (0.29), README.md (0.09), index.html (0.03), package.json (0.02), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
An order is assigned to warehouse zones on a line-by-line basis during stock allocation (`allocateOrder` in `src/dispatch/allocator.ts`). The assignment is determined by type-based handlers (`src/dispatch/handlers/registry.ts`), candidate filtering for active zones containing matching stock, rule-based scoring (`scoreZone` in `src/config/zoneRules.ts`), and greedy quantity deduction across sorted zones.

Step-by-Step Zone Assignment Flow

#### 1. Order Preparation via Type Handlers

When `allocate(id)` is called in `useWarehouseStore` (`src/store/useWarehouseStore.ts`), `allocateOrder` (`src/dispatch/allocator.ts`) fetches the registered handler for `order.type` (`standard`, `express`, `bulk`, or `hazardous`) from `getHandler` (`src/dispatch/handlers/registry.ts`).

The handler executes `prepare(order)` (e.g., setting `priority: "critical"` for express orders or appending operational notes).
The handler executes `inspect(prepared)` to collect initial warning messages.

#### 2. Candidate Filtering and Zone Scoring

For each `OrderLine` in the order, `allocateOrder` calculates a score for every active zone that holds matching stock (`zone.active && zone.stock.some((item) => item.sku === line.sku)`). Candidates are sorted in descending order by `scoreZone(zone, order, line)` (`src/config/zoneRules.ts`).

Scoring evaluates rules sorted by priority score (`rulesFor` in `src/config/zoneRules.ts`). For each rule, if `zone.kind` is not listed in `rule.zoneKinds`, `scoreZone` subtracts 25 points and skips calling `rule.prefer`. If `zone.kind` matches `rule.zoneKinds`, `rule.prefer` is executed:

**`hazard-isolation`** (Rule score: 100): Applies if `order.type === "hazardous"` or `line.hazardous`. `zoneKinds: ["secure"]`. Secure zones add `+80`. Non-secure zones receive a `-25` penalty via `scoreZone` (the `-100` return branch in `rule.prefer` is bypassed because `zoneKinds` does not match).
**`cold-chain`** (Rule score: 90): Applies if `line.temperature !== "ambient"`. `zoneKinds: ["cold"]`. Cold zones add `+70` if `zone.temperature === line.temperature` or `-100` if temperature mismatches. Non-cold zones fail the `zoneKinds` check and receive a `-25` penalty via `scoreZone`.
**`type-routing`** (Rule score: 50): Applies to all lines. `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`. Evaluates the zone kind index in `typeKinds[order.type]`:

- `standard` $\rightarrow$ `["general", "fast-pick"]`

- `express` $\rightarrow$ `["fast-pick", "general"]`

- `bulk` $\rightarrow$ `["bulk", "general"]`

- `hazardous` $\rightarrow$ `["secure"]`

Returns `40 - position * 10` (`+40` for 1st preference, `+30` for 2nd). If `zone.kind` is in `zoneKinds` but not in `typeKinds[order.type]`, `rule.prefer` returns `-50`. Zones outside `zoneKinds` (e.g., `cold`, `staging`) receive a `-25` penalty via `scoreZone`.

**`capacity-balance`** (Rule score: 10): Applies to all lines. `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`. Returns `Math.round((1 - used / zone.capacity) * 20)` based on total `onHand` units stored in the zone.

#### 3. Greedy Stock Allocation

`allocateOrder` (`src/dispatch/allocator.ts`) iterates through the sorted candidate zones to satisfy `line.quantity`:

Available unreserved stock in the candidate zone is computed as `Math.max(0, item.onHand - item.reserved)`.
Stock up to the remaining required quantity is allocated, creating proposed `Allocation` records containing `lineId`, `sku`, `zoneId`, `quantity`, `reservedAt`, and `lotCode`.
If unallocated units remain after checking all candidate zones, a warning string is added to `warnings`.

#### 4. Reservation Commit & State Persistence

Proposed allocations are processed by `applyStockReservation` (`src/stock/reservation.ts`), which updates `item.reserved` quantities and stock lot codes across `zones`:

If all lines are fully satisfied and no shortages occur, order status becomes `"allocated"`, and `eventBus.emit("order.allocated", { order })` is emitted (`src/events/bus.ts`).
If any line quantity is missing or short, order status becomes `"held"`.
Order total is calculated by `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`).
The store saves the updated order via `saveOrder(result.order)` (`src/dispatch/orderService.ts`) and updates `orders`, `zones`, and `logs` in Zustand state (`src/store/useWarehouseStore.ts`).
Outbound Dock Assignment

Assignment to an outbound loading dock is separate from storage zone allocation and occurs during shipment release (`releaseShipment` in `src/dispatch/releaseService.ts`). During `validateShipment` (`src/dispatch/validation.ts`), `shipment.dock` is computed and applied to `order.assignedDock`:

Hazardous orders are assigned to dock `"D4"`.
Non-hazardous orders are assigned to dock `"D1"`, `"D2"`, or `"D3"` using a modulo hash of `order.id` character codes (`docks[numeric % 3]`).
```

**Verdict:** incorrect

**Why (one line, for the log):** Explains scoring and allocation, but misses that `applyStockReservation` rechecks available quantities and updates a cloned zone set.
---

## Q3, handler registry

> Which code decides how a given order type is processed?

### Ground truth, this is the standard

The dispatch-handler registry makes the decision. On first use, `getHandler` dynamically imports
every handler module; each module registers one handler keyed by its `type`. Allocation and
release look up the handler using `order.type`, then call its preparation/inspection or
shipment-default methods.

**Files:** src/dispatch/handlers/registry.ts:3-32, src/dispatch/handlers/standardHandler.ts:1-22, src/dispatch/handlers/expressHandler.ts:1-31, src/dispatch/handlers/bulkHandler.ts:1-37, src/dispatch/handlers/hazardousHandler.ts:1-27, src/dispatch/allocator.ts:21, src/dispatch/releaseService.ts:17

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The registry selects processing behaviour; zone selection is a separate, configuration-driven
decision. Registering a second handler for the same type throws, so the glob cannot silently
shadow one handler with another.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/OrderCard.tsx (0.66), src/dispatch/orderService.ts (0.66), src/pages/OrderListPage.tsx (0.66), src/api/interceptors/hazardous-interceptor.ts (0.64), src/api/mock-server.ts (0.64), src/config/zoneRules.ts (0.64), src/data/seedData.ts (0.64), src/dispatch/allocator.ts (0.64), src/dispatch/handlers/registry.ts (0.64), src/dispatch/releaseService.ts (0.64), src/dispatch/validation.ts (0.64), src/events/bus.ts (0.64), src/jobs/revalidation.ts (0.64), src/pricing/legacyPricing.ts (0.64), src/pricing/pricing.ts (0.64), src/stock/reservation.ts (0.64), src/store/useWarehouseStore.ts (0.64), src/utils/formatters.ts (0.64), src/pages/OrderDetailPage.tsx (0.61), src/api/api-client.ts (0.59), src/api/interceptors/audit-interceptor.ts (0.59), src/api/interceptors/auth-interceptor.ts (0.59), src/api/interceptors/index.ts (0.59), src/api/interceptors/types.ts (0.59), src/App.tsx (0.59), src/components/ZoneCard.tsx (0.59), src/notifications/service.ts (0.59), src/pages/DispatchLogPage.tsx (0.59), src/stock/stockService.ts (0.59), src/tests/allocation.test.ts (0.59), src/tests/pricing.test.ts (0.59), src/tests/reservation.test.ts (0.59), src/tests/validation.test.ts (0.59), src/types/domain.ts (0.47), src/components/Layout.tsx (0.46), src/components/Toasts.tsx (0.46), src/dispatch/handlers/bulkHandler.ts (0.46), src/dispatch/handlers/expressHandler.ts (0.46), src/dispatch/handlers/hazardousHandler.ts (0.46), src/dispatch/handlers/standardHandler.ts (0.46), src/notifications/listener.ts (0.46), src/pages/ZoneOverviewPage.tsx (0.46), src/main.tsx (0.43), src/styles.css (0.28), index.html (0.01), package.json (0.01), README.md (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Order type (`"standard" | "express" | "bulk" | "hazardous"`) processing logic is split across five areas: the handler registry and handlers in `src/dispatch/handlers/`, zone routing and pricing strategy mapping in `src/config/zoneRules.ts`, shipment dock assignment and carrier validation in `src/dispatch/validation.ts`, API request path/header modification in `src/api/interceptors/hazardous-interceptor.ts`, and UI filtering in `src/store/useWarehouseStore.ts`.

1. Handler Registry & Handlers
**Registry (`src/dispatch/handlers/registry.ts`)**:

`getHandler(type)` dynamically loads handlers from `src/dispatch/handlers/*.ts` using `import.meta.glob` and returns the `DispatchHandler` registered for that order type via `registerHandler()`. Each handler implements:

* `prepare(order)`: Mutates and returns a prepared copy of the order.

* `inspect(order)`: Returns string array of validation warnings.

* `shipmentDefaults(order)`: Returns `Pick<Shipment, "carrier" | "packageCount">`.

**Handler Implementations (`src/dispatch/handlers/`)**:

* `standardHandler.ts`: Appends `"Standard pick wave assigned"` note; checks in `inspect` for empty lines or quantities $> 100$; provides defaults carrier `"Northline Ground"` and `packageCount = Math.max(1, Math.ceil(units / 12))`.

* `expressHandler.ts`: Sets priority to `"critical"` and appends `"Moved to express pick lane"` note; checks in `inspect` whether `dueAt` is overdue or $< 90$ minutes away; provides defaults carrier `"Apex Priority"` and `packageCount = Math.max(1, Math.ceil(weight / 20))`.

* `bulkHandler.ts`: Appends `"Forklift requested for X kg load"` note; checks in `inspect` if total units $< 20$ or `destination.company` is missing; provides defaults carrier `"Atlas Freight"` and `packageCount = Math.max(1, Math.ceil(weight / 500))`.

* `hazardousHandler.ts`: Sets priority to `"urgent"` and appends `"Dangerous goods paperwork required"` note; checks in `inspect` whether no lines are marked hazardous or destination country is not `"US"`; provides defaults carrier `"SecureChem Logistics"` and `packageCount = Math.max(1, Math.ceil(units / 4))`.

**Workflow Execution**:

* `allocateOrder()` (`src/dispatch/allocator.ts`): Invokes `getHandler(input.type)`, executing `handler.prepare()` and `handler.inspect()`.

* `releaseShipment()` (`src/dispatch/releaseService.ts`): Invokes `getHandler(order.type)`, executing `handler.shipmentDefaults()`.

---

2. Zone Routing & Pricing Configuration (`src/config/zoneRules.ts`)
**Zone Scoring & Ranking**:

`typeKinds` maps each `OrderType` to ordered preferred zone kinds for allocation ranking:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

The `type-routing` rule in `zoneRules` evaluates zone kinds in `typeKinds[order.type]`. If found, it applies score `40 - position * 10`; if not found in `typeKinds` but included in `type-routing`'s `zoneKinds`, it applies score `-50`. For zones outside a rule's `zoneKinds`, `scoreZone()` applies a `-25` penalty guard branch instead of invoking the rule's `prefer()` function. `scoreZone()` aggregates these preference scores for candidate zone ranking during line allocation in `src/dispatch/allocator.ts`.

**Hazard Isolation Rule**:

`hazard-isolation` checks `order.type === "hazardous" || line.hazardous`. If true, secure zones (`zone.kind === "secure"`) receive `+80` from `prefer()`. For non-secure zones, `scoreZone()` guard-checks `rule.zoneKinds` (`["secure"]`), bypassing `prefer()` and applying a `-25` penalty score instead.

**Pricing Routing**:

`pricingByType` maps `bulk` to `"legacy"` and `standard`, `express`, and `hazardous` to `"current"`. In `calculateOrderPrice()` (`src/pricing/pricing.ts`), `pricingStrategyFor(order)` routes `bulk` orders to `calculateLegacyPrice()` (`src/pricing/legacyPricing.ts`), while all other types undergo standard unit price subtotal, weight-based handling fee, priority fee calculations, and a `$65` hazardous fee if any line is marked hazardous.

---

3. Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`)
**Validation & Dock Assignment**:

In `validateShipment()`:

* Dock assignment: If `order.type === "hazardous"`, `shipment.dock` is set to `"D4"`. Otherwise, it is assigned to `"D1"`, `"D2"`, or `"D3"` using the sum of character codes in `order.id` modulo 3.

* Carrier validation: If `order.type === "hazardous"` and `shipment.carrier !== "SecureChem Logistics"`, `validateShipment()` adds `"Approved dangerous goods carrier required"` to `errors`, failing release.

---

4. API Network Interception (`src/api/interceptors/hazardous-interceptor.ts`)
**Request Interception**:

`hazardousInterceptor` checks if `request.body?.type === "hazardous"`. When true, it transforms the API request before mock execution in `src/api/mock-server.ts`:

* Path: replaces `/orders` with `/controlled/orders`.

* Headers: attaches `"x-controlled-load": "true"`.

* Metadata: sets `routing: "dangerous-goods"`.

This interceptor is registered in `src/api/interceptors/index.ts` and runs for API calls initiated by `apiClient` (`src/api/api-client.ts`).

---

5. UI Filtering (`src/store/useWarehouseStore.ts` & `src/pages/OrderListPage.tsx`)
**Filter Execution**:

`filteredOrders()` in `src/store/useWarehouseStore.ts` checks `order.type === state.filters.type` when `state.filters.type !== "all"`.

**UI Controls**:

`OrderListPage` (`src/pages/OrderListPage.tsx`) renders a select drop-down populated with `["all", "standard", "express", "bulk", "hazardous"]` and calls `setType()` to update store filter state.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly identifies the handler registry, dynamic loading, type lookup, and the methods used during allocation and release.
---

## Q4, cross-cutting concern

> Everywhere stock is reserved — list every place it happens.

### Ground truth, this is the standard

Actual reservation changes are centralized in `applyStockReservation`. It is called during
initial allocation, again before shipment release to recheck and finalize the order's
allocations, and by the periodic revalidation job after resetting reserved counts and
rebuilding them for active orders. The store installs that revalidation job during
initialization.

**Files:** src/stock/reservation.ts:9-45, src/dispatch/allocator.ts:56-72, src/dispatch/releaseService.ts:31, src/jobs/revalidation.ts:10-49, src/store/useWarehouseStore.ts:88-125

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

`commitReleasedStock` does not create a reservation; it consumes on-hand stock and removes the
corresponding reservation (src/stock/stockService.ts:16-37).

The list is complete by two independent routes. `grep -rn applyStockReservation src` returns ten
lines: four imports, the definition, and five call sites — the three application paths named
above plus two in `reservation.test.ts`, at lines 22 and 31, which build orders by hand.

Grepping instead for a direct write to `item.reserved` returns two, at `reservation.ts:40` and
`stockService.ts:27`. Three places set a reserved value, but the third does not assign to the
property: `revalidation.ts:16` writes `{ ...item, reserved: 0 }` into a fresh object inside a
`.map`, so no search for an assignment can find it. That is the same structural blindness as
the line break described above, one variant along, and it is why the count and the search result
differ.

Neither search reveals an application path missing from the list above. They do not simply
agree: the write-based search surfaces `commitReleasedStock`, which is not a call site and which
this note has already excluded as consuming a reservation rather than creating one.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/pages/OrderListPage.tsx (0.61), src/stock/reservation.ts (0.61), src/stock/stockService.ts (0.61), src/App.tsx (0.59), src/data/seedData.ts (0.59), src/dispatch/allocator.ts (0.59), src/dispatch/releaseService.ts (0.59), src/jobs/revalidation.ts (0.59), src/tests/reservation.test.ts (0.59), src/components/OrderCard.tsx (0.44), src/events/bus.ts (0.44), src/store/useWarehouseStore.ts (0.44), src/types/domain.ts (0.44), src/api/mock-server.ts (0.43), src/components/Layout.tsx (0.43), src/config/zoneRules.ts (0.43), src/dispatch/handlers/registry.ts (0.43), src/dispatch/validation.ts (0.43), src/main.tsx (0.43), src/notifications/listener.ts (0.43), src/pages/DispatchLogPage.tsx (0.43), src/pages/OrderDetailPage.tsx (0.43), src/pages/ZoneOverviewPage.tsx (0.43), src/pricing/pricing.ts (0.43), src/tests/allocation.test.ts (0.43), src/tests/pricing.test.ts (0.43), src/tests/validation.test.ts (0.43), src/api/api-client.ts (0.29), src/api/interceptors/hazardous-interceptor.ts (0.29), src/api/interceptors/index.ts (0.29), src/api/interceptors/types.ts (0.29), src/components/Toasts.tsx (0.29), src/components/ZoneCard.tsx (0.29), src/dispatch/orderService.ts (0.29), src/notifications/service.ts (0.29), src/pricing/legacyPricing.ts (0.29), src/utils/formatters.ts (0.29), src/dispatch/handlers/bulkHandler.ts (0.28), src/dispatch/handlers/expressHandler.ts (0.28), src/dispatch/handlers/hazardousHandler.ts (0.28), src/dispatch/handlers/standardHandler.ts (0.28), src/styles.css (0.28), index.html (0), package.json (0), README.md (0), src/api/interceptors/audit-interceptor.ts (0), src/api/interceptors/auth-interceptor.ts (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Stock is reserved by mutating the `reserved` field on inventory items via `applyStockReservation` in `src/stock/reservation.ts`. In runtime application code, stock reservation occurs across **3 call sites**:

1. **Order Allocation** (`allocateOrder` in `src/dispatch/allocator.ts`): Reserves stock when an order is allocated manually via `allocate` in `src/store/useWarehouseStore.ts`.

2. **Shipment Release** (`releaseShipment` in `src/dispatch/releaseService.ts`): Re-evaluates and updates stock reservations immediately before confirming release via `release` in `src/store/useWarehouseStore.ts`.

3. **Background Reservation Revalidation** (`revalidateReservations` in `src/jobs/revalidation.ts`): Periodically resets working zone reservations and re-applies stock reservations for all active orders (`allocated`, `picking`, and `ready`) on a 60-second timer started during store initialization.

**Test-Only Calls**:

`src/tests/reservation.test.ts`: Calls `applyStockReservation` directly to test reservation increases, lot code assignment, and shortage handling.

---

Execution Flow and Call Paths

#### 1. Core Reservation Mutation Engine

**File**: `src/stock/reservation.ts`
**Function**: `applyStockReservation(order, allocations, zones)`
**Behavior**: Clones the provided zones array and updates stock reservations for requested allocations using:

`item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity;`

It calculates available quantity (`onHand - reserved + alreadyReserved`), caps assigned quantity to available stock, populates lot codes, and records shortages when requested stock is unavailable.

#### 2. Manual Order Allocation

**File**: `src/dispatch/allocator.ts`
**Function**: `allocateOrder`
**Trigger**: Click "Allocate stock" on `OrderListPage` (`src/pages/OrderListPage.tsx`) via `OrderCard` (`src/components/OrderCard.tsx`) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`), invoking `useWarehouseStore.allocate(id)` (`src/store/useWarehouseStore.ts`).
**Flow**:

1. Scores active candidate zones and generates proposed line allocations.

2. Passes proposed allocations to `applyStockReservation(prepared, proposed, zones)`.

3. Updates the order status to `allocated` (if complete) or `held` (if short), emits `order.allocated` if complete, and updates store state.

#### 3. Shipment Release

**File**: `src/dispatch/releaseService.ts`
**Function**: `releaseShipment`
**Trigger**: Click "Release shipment" on `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`), invoking `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`).
**Flow**:

1. Calls `applyStockReservation(order, order.allocations, zones)` to confirm stock reservation validity before release.

2. Throws an error if shortages are detected; otherwise assigns the reserved allocations to the shipment.

3. Validates shipment parameters and invokes `commitReleasedStock` (`src/stock/stockService.ts`), which subsequently decrements `reserved` and `onHand` stock as items ship.

#### 4. Periodic Revalidation Job

**File**: `src/jobs/revalidation.ts`
**Function**: `revalidateReservations`
**Trigger**: Started via `startRevalidationJob` inside `useWarehouseStore.initialize()` in `src/store/useWarehouseStore.ts` (mounted via `useEffect` in `src/App.tsx`). Runs every 60 seconds.
**Flow**:

1. Creates a working copy of zones with all `reserved` stock counts zeroed out (`reserved: 0`).

2. Iterates over active orders (`allocated`, `picking`, `ready`) and executes `applyStockReservation({ ...order, allocations: [] }, order.allocations, workingZones)`.

3. Accumulates updated stock reservations into `workingZones`. If shortages occur, changes order status to `held` and records audit logs.
```

**Verdict:** correct

**Why (one line, for the log):** Lists all three reservation paths: allocation, release, and periodic revalidation started during store initialisation.
---

## Q5, interceptor chain

> What happens to an outgoing API request before it is sent?

### Ground truth, this is the standard

The client builds a request with an `Accept` header and empty metadata, then applies three
interceptors in order. Authentication adds the bearer token; audit adds a request timestamp,
source, and correlation ID; and the hazardous interceptor conditionally rewrites `/orders` to
`/controlled/orders`, adds an `x-controlled-load` header and sets `routing` metadata to
`dangerous-goods`. The transformed request is then passed to the mock transport.

**Files:** src/api/api-client.ts:5-19, src/api/interceptors/index.ts:7-11, src/api/interceptors/index.ts:13-19, src/api/interceptors/auth-interceptor.ts:3-9, src/api/interceptors/audit-interceptor.ts:3-11, src/api/interceptors/hazardous-interceptor.ts:4-13, src/api/mock-server.ts:4, src/api/mock-server.ts:7-9, src/api/mock-server.ts:14, src/api/mock-server.ts:15, src/dispatch/orderService.ts:11-15, src/store/useWarehouseStore.ts:152

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The hazardous transformation only occurs when the request body itself has `type: "hazardous"`.

The path rewrite has no effect on the response. `mock-server.ts:7-9` normalises
`/controlled/orders` straight back to `/orders` before dispatching, so the rewritten path
reaches nothing that treats it differently. The header and the metadata survive; the new path
does not.

The comment at `mock-server.ts:4` says the mock "always responds synchronously to keep tests
deterministic". `handleRequest` awaits a 90-millisecond timeout at line 14. This is the third
comment in the pair that describes something the code does not do, alongside the Internet
Explorer shim and the site-grouping claim in clinic-triage.

Unlike its counterpart in clinic-triage, this chain genuinely executes. `saveOrder` is imported
by the store and called at `useWarehouseStore.ts:152, 185, 222` and `242` with a full order as
the body, so the hazardous branch can fire in the running application. `fetchOrders` and
`fetchOrder` in the same module have no consumers, but no answer claims otherwise.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/api/interceptors/types.ts (0.75), src/api/api-client.ts (0.66), src/api/interceptors/index.ts (0.66), src/api/mock-server.ts (0.66), src/api/interceptors/audit-interceptor.ts (0.61), src/api/interceptors/auth-interceptor.ts (0.61), src/api/interceptors/hazardous-interceptor.ts (0.61), src/dispatch/orderService.ts (0.59), src/types/domain.ts (0.54), src/data/seedData.ts (0.47), src/store/useWarehouseStore.ts (0.43), src/components/OrderCard.tsx (0.36), src/components/ZoneCard.tsx (0.36), src/config/zoneRules.ts (0.36), src/dispatch/allocator.ts (0.36), src/dispatch/handlers/registry.ts (0.36), src/dispatch/releaseService.ts (0.36), src/dispatch/validation.ts (0.36), src/events/bus.ts (0.36), src/jobs/revalidation.ts (0.36), src/notifications/service.ts (0.36), src/pages/DispatchLogPage.tsx (0.36), src/pages/OrderListPage.tsx (0.36), src/pricing/legacyPricing.ts (0.36), src/pricing/pricing.ts (0.36), src/stock/reservation.ts (0.36), src/stock/stockService.ts (0.36), src/tests/reservation.test.ts (0.36), src/tests/validation.test.ts (0.36), src/utils/formatters.ts (0.36), src/tests/allocation.test.ts (0.32), src/tests/pricing.test.ts (0.32), src/App.tsx (0.28), src/components/Layout.tsx (0.28), src/components/Toasts.tsx (0.28), src/pages/OrderDetailPage.tsx (0.28), src/pages/ZoneOverviewPage.tsx (0.28), index.html (0), package.json (0), README.md (0), src/dispatch/handlers/bulkHandler.ts (0), src/dispatch/handlers/expressHandler.ts (0), src/dispatch/handlers/hazardousHandler.ts (0), src/dispatch/handlers/standardHandler.ts (0), src/main.tsx (0), src/notifications/listener.ts (0), src/styles.css (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Before an outgoing API request is sent to `handleRequest()`, it is constructed with default headers and metadata in `src/api/api-client.ts` and processed asynchronously through a chain of three request interceptors executed sequentially in `src/api/interceptors/index.ts`.

---

Request Pipeline Details

#### 1. Initial Request Object Construction

When `apiClient.get`, `apiClient.post`, or `apiClient.patch` is called, `request()` constructs a base `ApiRequest` object [`src/api/api-client.ts`]:

**`path`**: Provided endpoint path string (e.g., `"/orders"` or `"/orders/ORD-10481"`).
**`method`**: `"GET"`, `"POST"`, or `"PATCH"`.
**`body`**: Provided request payload (or `undefined` when omitted, such as on GET calls).
**`headers`**: Initialized to `{ accept: "application/json" }`.
**`metadata`**: Initialized to an empty object `{}`.

#### 2. Sequential Interceptor Chain

The initial request object is passed to `applyInterceptors()`, which iterates asynchronously over the registered `interceptors` array in order [`src/api/interceptors/index.ts`]:

1. **`authInterceptor`** [`src/api/interceptors/auth-interceptor.ts`]:

* Spreads existing headers and adds `authorization: "Bearer warehouse-console-session"`.

2. **`auditInterceptor`** [`src/api/interceptors/audit-interceptor.ts`]:

* Spreads existing headers and adds `"x-requested-at"` set to the current ISO timestamp (`new Date().toISOString()`).

* Spreads existing metadata and adds `source: "dispatch-console"` and a newly generated UUID for `correlationId` (`crypto.randomUUID()`).

3. **`hazardousInterceptor`** [`src/api/interceptors/hazardous-interceptor.ts`]:

* Inspects `request.body`. If `request.body?.type === "hazardous"`:

* Rewrites `path` replacing `"/orders"` with `"/controlled/orders"`.

* Adds `"x-controlled-load": "true"` to `headers`.

* Sets `routing: "dangerous-goods"` in `metadata`.

* If `request.body?.type !== "hazardous"` (or `body` is undefined), returns the request unmodified.

#### 3. Hand-off to Mock Server Handler

After all interceptors run, `applyInterceptors()` returns the final `intercepted` request object, which `request()` immediately forwards to `handleRequest()` [`src/api/api-client.ts`, `src/api/mock-server.ts`].
```

**Verdict:** correct

**Why (one line, for the log):** Correctly gives the three interceptors in order and the changes each makes before the mock transport.
---

## Q6, misleading name

> Does `validateShipment` change any state, or does it only check?

### Ground truth, this is the standard

It does more than check. Alongside collecting errors and warnings, it mutates the supplied
shipment by assigning `shipment.dock`: hazardous orders always receive D4; other orders receive
D1–D3 deterministically from the order ID.

**Files:** src/dispatch/validation.ts:12-40

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

This is an in-place mutation, contrary to both the function name and its documentation comment.

The dock list holds four entries, but the non-hazardous branch indexes it modulo 3, so D4 is
unreachable except through the hazardous branch. "D1-D3" is exact rather than approximate.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/dispatch/releaseService.ts (0.63), src/dispatch/validation.ts (0.63), src/tests/validation.test.ts (0.63), src/dispatch/handlers/registry.ts (0.59), src/events/bus.ts (0.59), src/pages/DispatchLogPage.tsx (0.59), src/pages/OrderDetailPage.tsx (0.59), src/store/useWarehouseStore.ts (0.59), src/data/seedData.ts (0.45), src/stock/reservation.ts (0.45), src/stock/stockService.ts (0.45), src/types/domain.ts (0.45), src/App.tsx (0.42), src/components/Layout.tsx (0.42), src/components/Toasts.tsx (0.42), src/dispatch/allocator.ts (0.42), src/dispatch/handlers/bulkHandler.ts (0.42), src/dispatch/handlers/expressHandler.ts (0.42), src/dispatch/handlers/hazardousHandler.ts (0.42), src/dispatch/handlers/standardHandler.ts (0.42), src/dispatch/orderService.ts (0.42), src/jobs/revalidation.ts (0.42), src/notifications/listener.ts (0.42), src/notifications/service.ts (0.42), src/pages/OrderListPage.tsx (0.42), src/pages/ZoneOverviewPage.tsx (0.42), src/utils/formatters.ts (0.42), src/api/api-client.ts (0.3), src/api/interceptors/hazardous-interceptor.ts (0.3), src/api/interceptors/index.ts (0.3), src/api/interceptors/types.ts (0.3), src/api/mock-server.ts (0.3), src/components/OrderCard.tsx (0.3), src/components/ZoneCard.tsx (0.3), src/config/zoneRules.ts (0.3), src/pricing/legacyPricing.ts (0.3), src/pricing/pricing.ts (0.3), src/tests/allocation.test.ts (0.3), src/tests/pricing.test.ts (0.3), src/tests/reservation.test.ts (0.3), src/main.tsx (0.28), tsconfig.node.json (0.07), tsconfig.app.json (0.04), src/styles.css (0), index.html (0), package.json (0), README.md (0), src/api/interceptors/audit-interceptor.ts (0), src/api/interceptors/auth-interceptor.ts (0), src/vite-env.d.ts (0), tsconfig.json (0), vite.config.ts (0)

```
`validateShipment` does **not** only check; it mutates the passed `shipment` object by calculating and assigning its `dock` property (`shipment.dock`). It does not mutate the `order` argument, nor does it directly mutate any external or store state.

State Changes and Runtime Impact

1. **Direct Argument Mutation**

In `src/dispatch/validation.ts`, `validateShipment` computes a dock assignment and mutates the `shipment` object in place before returning the `ShipmentValidation` object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Note: `docks` is defined in `src/dispatch/validation.ts` as `["D1", "D2", "D3", "D4"]`. Because `numeric % 3` evaluates to indices `0`, `1`, or `2`, non-hazardous orders are assigned docks `D1`, `D2`, or `D3`. Hazardous orders (`order.type === "hazardous"`) are assigned dock `D4`.

2. **Downstream Application Effects in `releaseShipment`**

In `src/dispatch/releaseService.ts`, `releaseShipment` instantiates a `shipment` object without a `dock` property and passes it to `validateShipment(shipment, order)`:

* After validation, `releaseShipment` reads the mutated `shipment.dock` to set `assignedDock` on the newly constructed `releasedOrder` (`assignedDock: shipment.dock`).

* It reads `shipment.dock` again to format the log entry detail (`detail: ... at ${shipment.dock}`).

* When `releaseShipment` returns, `useWarehouseStore.release` (`src/store/useWarehouseStore.ts`) persists the released order and the log entry into store state and updates stock.

3. **Test Effects**

In `src/tests/validation.test.ts`, unit tests invoke `validateShipment(candidate, order)` and assert that `candidate.dock` has been mutated to either match `/^D[1-3]$/` or equal `"D4"`.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly states that `validateShipment` mutates `shipment.dock`, using D4 for hazardous orders and D1-D3 otherwise.
---

## Q7, legacy path

> Which pricing implementation runs for a bulk order, and why that one?

### Ground truth, this is the standard

Bulk orders use `calculateLegacyPrice`. `pricingByType` maps `bulk` to `legacy`;
`calculateOrderPrice` reads that strategy and delegates to the legacy implementation. The legacy
calculation adds per-pallet handling and applies tiered volume discounts.

**Files:** src/config/zoneRules.ts:21-26, src/config/zoneRules.ts:76-78, src/pricing/pricing.ts:1-8, src/pricing/legacyPricing.ts:3-21

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The handler selected for bulk dispatch does not select pricing; the separate configuration map
does.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/pricing/pricing.ts (0.66), src/tests/pricing.test.ts (0.66), src/config/zoneRules.ts (0.64), src/dispatch/allocator.ts (0.64), src/components/OrderCard.tsx (0.61), src/dispatch/orderService.ts (0.61), src/pages/OrderDetailPage.tsx (0.61), src/pages/OrderListPage.tsx (0.61), src/pricing/legacyPricing.ts (0.61), src/api/interceptors/hazardous-interceptor.ts (0.59), src/api/mock-server.ts (0.59), src/App.tsx (0.59), src/data/seedData.ts (0.59), src/dispatch/handlers/registry.ts (0.59), src/dispatch/releaseService.ts (0.59), src/dispatch/validation.ts (0.59), src/events/bus.ts (0.59), src/jobs/revalidation.ts (0.59), src/stock/reservation.ts (0.59), src/store/useWarehouseStore.ts (0.59), src/tests/allocation.test.ts (0.59), src/utils/formatters.ts (0.59), src/dispatch/handlers/bulkHandler.ts (0.57), src/types/domain.ts (0.47), src/api/api-client.ts (0.44), src/api/interceptors/index.ts (0.43), src/api/interceptors/types.ts (0.43), src/components/Layout.tsx (0.43), src/components/Toasts.tsx (0.43), src/components/ZoneCard.tsx (0.43), src/dispatch/handlers/expressHandler.ts (0.43), src/dispatch/handlers/hazardousHandler.ts (0.43), src/dispatch/handlers/standardHandler.ts (0.43), src/main.tsx (0.43), src/notifications/listener.ts (0.43), src/notifications/service.ts (0.43), src/pages/DispatchLogPage.tsx (0.43), src/pages/ZoneOverviewPage.tsx (0.43), src/stock/stockService.ts (0.43), src/tests/reservation.test.ts (0.43), src/tests/validation.test.ts (0.43), src/api/interceptors/audit-interceptor.ts (0.28), src/api/interceptors/auth-interceptor.ts (0.28), src/styles.css (0.28), index.html (0), package.json (0), README.md (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
For a bulk order, the pricing implementation that runs is **`calculateLegacyPrice`** (defined in `src/pricing/legacyPricing.ts`).

This implementation is selected because `calculateOrderPrice` delegates strategy selection to `pricingStrategyFor(order)`, which resolves the strategy key by checking the order's `type` against the `pricingByType` dictionary in `src/config/zoneRules.ts`. Because bulk orders have `order.type === "bulk"`, `pricingStrategyFor` returns `"legacy"`, triggering an early return in `calculateOrderPrice` that executes `calculateLegacyPrice(order)`.

---

Selection Trace and Execution Flow

1. **Invocation Entry Point**

Runtime order pricing is calculated by calling `calculateOrderPrice(order)` in `src/pricing/pricing.ts` (for example, during order allocation in `src/dispatch/allocator.ts`).

2. **Strategy Resolution**

`calculateOrderPrice` passes the order to `pricingStrategyFor(order)` (`src/pricing/pricing.ts`):

```ts

const strategy = pricingStrategyFor(order);

```

3. **Configuration Mapping**

In `src/config/zoneRules.ts`, `pricingStrategyFor` accesses `pricingByType`:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

export function pricingStrategyFor(order: Order): PricingStrategy {

return pricingByType[order.type];

}

```

For an order where `order.type` is `"bulk"`, `pricingStrategyFor` returns `"legacy"`.

4. **Strategy Branch Execution**

In `src/pricing/pricing.ts`, `calculateOrderPrice` evaluates the resolved strategy:

```ts

if (strategy === "legacy") return calculateLegacyPrice(order);

```

Because `strategy` equals `"legacy"`, it immediately invokes `calculateLegacyPrice(order)` and returns its result, bypassing the standard pricing calculations (handling based on weight, priority fees, and hazardous surcharges).

5. **Legacy Pricing Calculation**

In `src/pricing/legacyPricing.ts`, `calculateLegacyPrice` executes the following calculations:

- **Subtotal**: Sums `line.quantity * line.unitPrice` across all order lines.

- **Pallet Handling Fee**: Sums total line weight (`quantity * weightKg`), calculates required pallet units using `Math.max(1, Math.ceil(totalWeight / 500))`, and multiplies by `$18.50` per pallet.

- **Volume Discount**: Evaluates subtotal tiers:

- `7.5%` (`subtotal * 0.075`) if subtotal exceeds `$5,000`

- `4%` (`subtotal * 0.04`) if subtotal exceeds `$2,000`

- `0` if subtotal is `$2,000` or less.

- **Final Calculation**: Returns `Number((subtotal + handling - volumeDiscount).toFixed(2))`.

---

Evidence Basis
**Direct Evidence**:

- `pricingByType` lookup and `pricingStrategyFor` function in `src/config/zoneRules.ts`.

- Conditional branch and call site in `src/pricing/pricing.ts`.

- Legacy pricing formulas in `src/pricing/legacyPricing.ts`.

- Primary dispatch caller in `src/dispatch/allocator.ts` and test assertions in `src/tests/pricing.test.ts`.

**Inference**:

- The runtime dispatch loop (`allocateOrder` in `src/dispatch/allocator.ts`) is the primary production consumer that triggers `calculateOrderPrice` when processing incoming orders.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly explains that bulk maps to the legacy strategy and uses `calculateLegacyPrice` with pallet handling and volume discounts.
---

## Q8, event emitter

> What reacts when a dispatch event is emitted?

### Ground truth, this is the standard

Reactions depend on the event. `shipment.released` is consumed by the notification listener,
which publishes a success notification. `stock.low` is consumed both by that notification
listener and by the stock service's in-memory low-stock signal collector. There is no
registered listener for `order.allocated` or `notification.created` in this repository.

**Files:** src/events/bus.ts:3-34, src/notifications/listener.ts:4-23, src/stock/stockService.ts:6-9, src/dispatch/allocator.ts:71, src/dispatch/releaseService.ts:57, src/stock/stockService.ts:16-37, src/stock/stockService.ts:4, src/stock/stockService.ts:39-41, src/notifications/service.ts:16

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

Listeners are synchronous: `emit` immediately iterates the registered callbacks.

`stock.low` has a single emitter, `commitReleasedStock`, which raises it when available stock
falls to or below the reorder point after a release.

The two listener sets register at different moments. The stock service subscribes at module
import time, as a side effect of loading the file. The notification listeners subscribe only
when `installNotificationListeners` is called from `App`. A question about what reacts to an
event therefore has a different answer before that call than after it.

The two also differ in whether their work is used. The notification listener publishes a
notification a user sees. The stock service's listener appends to `lowStockSignals`, which is
readable only through `getLowStockSignals`, and that function has no callers — the collector
writes to an array nothing reads. This is the same shape as `recentlyBooked` in clinic-triage,
and stating it here keeps the paired event-emitter question symmetric: without it, a reader who
spots the dead collector is credited on one repository and not on the other for identical
reasoning.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/dispatch/allocator.ts (0.63), src/dispatch/releaseService.ts (0.63), src/pages/DispatchLogPage.tsx (0.63), src/App.tsx (0.6), src/data/seedData.ts (0.6), src/events/bus.ts (0.6), src/notifications/listener.ts (0.6), src/notifications/service.ts (0.6), src/stock/stockService.ts (0.6), src/store/useWarehouseStore.ts (0.6), src/tests/allocation.test.ts (0.6), src/tests/validation.test.ts (0.6), src/dispatch/handlers/bulkHandler.ts (0.58), src/dispatch/handlers/expressHandler.ts (0.58), src/dispatch/handlers/hazardousHandler.ts (0.58), src/dispatch/handlers/registry.ts (0.58), src/dispatch/handlers/standardHandler.ts (0.58), src/dispatch/orderService.ts (0.58), src/dispatch/validation.ts (0.58), src/config/zoneRules.ts (0.45), src/pricing/pricing.ts (0.45), src/stock/reservation.ts (0.45), src/types/domain.ts (0.45), src/utils/formatters.ts (0.45), src/api/mock-server.ts (0.43), src/components/Layout.tsx (0.43), src/components/Toasts.tsx (0.43), src/jobs/revalidation.ts (0.43), src/main.tsx (0.43), src/pages/OrderDetailPage.tsx (0.43), src/pages/OrderListPage.tsx (0.43), src/pages/ZoneOverviewPage.tsx (0.43), src/tests/pricing.test.ts (0.43), src/tests/reservation.test.ts (0.43), src/api/api-client.ts (0.41), src/api/interceptors/hazardous-interceptor.ts (0.3), src/api/interceptors/index.ts (0.3), src/api/interceptors/types.ts (0.3), src/components/OrderCard.tsx (0.3), src/components/ZoneCard.tsx (0.3), src/pricing/legacyPricing.ts (0.3), src/styles.css (0.29), README.md (0.03), src/api/interceptors/audit-interceptor.ts (0.02), index.html (0.02), package.json (0.01), src/api/interceptors/auth-interceptor.ts (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
When an event is emitted on the system event bus (`src/events/bus.ts`), active listeners react to two of the four declared event types (`shipment.released` and `stock.low`). The remaining two declared events (`order.allocated` and `notification.created`) are emitted at runtime but have zero subscribers registered across the codebase.

---

1. `shipment.released`
**Emission Site:** Emitted by `releaseShipment` in `src/dispatch/releaseService.ts` with payload `{ order: releasedOrder, shipment }` after stock commitments are calculated.
**Registered Subscriber:** A listener in `src/notifications/listener.ts` registered via `installNotificationListeners()`, which executes during `App` initialization in `src/App.tsx`.
**Reaction Flow:**

1. Receives `{ order, shipment }` and calls `publishNotification()` in `src/notifications/service.ts`.

2. `publishNotification()` builds a success notification (`Order <id> released`), prepends it to a module-scoped `pending` array, and emits `notification.created` (which has no subscribers).

3. The warehouse store (`initialize()` in `src/store/useWarehouseStore.ts`) runs a 300ms interval timer that calls `drainNotifications()`, clearing the `pending` array.

4. The store prepends drained notifications to `state.notifications` (capped at 8 entries).

5. The `Toasts` UI component (`src/components/Toasts.tsx`) reads `state.notifications` and renders a success toast banner.

---

2. `stock.low`
**Emission Site:** Emitted by `commitReleasedStock` in `src/stock/stockService.ts` with payload `{ sku, zoneId, available }` whenever committing released inventory reduces available stock (`item.onHand - item.reserved`) to or below the item's `reorderPoint`.
**Registered Subscribers:**

1. **Stock Log Buffer** in `src/stock/stockService.ts`:

* *Registration:* Evaluated on module evaluation.

* *Reaction:* Formats string `${sku} in ${zoneId}: ${available} available` and unshifts it into module-scoped `lowStockSignals` (capped at 20 entries). The exported reader `getLowStockSignals()` is defined but not reached by the running application and is not counted as live behavior.

2. **Notification Listener** in `src/notifications/listener.ts`:

* *Registration:* Installed via `installNotificationListeners()` called in `src/App.tsx`.

* *Reaction:* Calls `publishNotification()` with a `warning` notification (`Low stock: ${sku}`). This unshifts the notification to `pending` and emits `notification.created`. The 300ms polling loop in `src/store/useWarehouseStore.ts` drains `pending` into store state, and `src/components/Toasts.tsx` renders the warning toast.

---

3. `order.allocated`
**Emission Site:** Emitted by `allocateOrder` in `src/dispatch/allocator.ts` with payload `{ order }` when stock allocation completes with every order line fully allocated (`complete === true`).
**Registered Subscribers:** None. No listeners subscribe to `"order.allocated"`.

---

4. `notification.created`
**Emission Site:** Emitted by `publishNotification` in `src/notifications/service.ts` with payload `{ notification }`.
**Registered Subscribers:** None. No listeners subscribe to `"notification.created"`. Notifications reach the application state and UI because `src/store/useWarehouseStore.ts` polls `drainNotifications()` on a 300ms `setInterval` rather than consuming this event.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly identifies the listeners for `shipment.released` and `stock.low`, and notes the two events with no listeners.
---

## Q9, applied

> Where would a new order type be added, and what else would need changing?

### Ground truth, this is the standard

Add the literal to `OrderType`; add entries to both exhaustive order-type maps for zone
preferences and pricing; and add a handler module that calls `registerHandler` with preparation,
inspection, and shipment defaults. The dynamically loaded registry will discover the new handler
automatically. Seed and UI fixtures and tests should also be extended if the new type must
appear and be verified.

**Files:** src/types/domain.ts:1, src/config/zoneRules.ts:14-26, src/dispatch/handlers/registry.ts:3-32, src/dispatch/handlers/registry.ts:34-36, src/dispatch/handlers/standardHandler.ts:1-22, src/data/seedData.ts:167-324, src/pages/OrderListPage.tsx:15-21

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

TypeScript's `Record<OrderType, ...>` maps force configuration additions at compile time. A new
module is discovered by the registry glob without editing a central import list.

The order list's type filter is a hardcoded array rather than a derivation from `OrderType`, so
a new type would be unfilterable in the interface and the compiler would not object.

Nothing in this repository asserts a handler count, so unlike clinic-triage — where
`registry.test.ts` fails the moment a fifth route module lands — no test breaks here on a new
order type. `registeredHandlerTypes` would have made such a test possible, but it is exported
and never called.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/components/OrderCard.tsx (0.63), src/dispatch/orderService.ts (0.63), src/pages/OrderListPage.tsx (0.63), src/api/interceptors/hazardous-interceptor.ts (0.62), src/api/mock-server.ts (0.62), src/config/zoneRules.ts (0.62), src/data/seedData.ts (0.62), src/dispatch/allocator.ts (0.62), src/dispatch/handlers/registry.ts (0.62), src/dispatch/releaseService.ts (0.62), src/dispatch/validation.ts (0.62), src/events/bus.ts (0.62), src/jobs/revalidation.ts (0.62), src/pricing/legacyPricing.ts (0.62), src/pricing/pricing.ts (0.62), src/stock/reservation.ts (0.62), src/store/useWarehouseStore.ts (0.62), src/utils/formatters.ts (0.62), src/pages/OrderDetailPage.tsx (0.6), src/api/api-client.ts (0.58), src/api/interceptors/audit-interceptor.ts (0.58), src/api/interceptors/auth-interceptor.ts (0.58), src/api/interceptors/index.ts (0.58), src/api/interceptors/types.ts (0.58), src/App.tsx (0.58), src/components/ZoneCard.tsx (0.58), src/notifications/service.ts (0.58), src/pages/DispatchLogPage.tsx (0.58), src/stock/stockService.ts (0.58), src/tests/allocation.test.ts (0.58), src/tests/pricing.test.ts (0.58), src/tests/reservation.test.ts (0.58), src/tests/validation.test.ts (0.58), src/types/domain.ts (0.46), src/components/Layout.tsx (0.44), src/components/Toasts.tsx (0.44), src/dispatch/handlers/bulkHandler.ts (0.44), src/dispatch/handlers/expressHandler.ts (0.44), src/dispatch/handlers/hazardousHandler.ts (0.44), src/dispatch/handlers/standardHandler.ts (0.44), src/notifications/listener.ts (0.44), src/pages/ZoneOverviewPage.tsx (0.44), src/main.tsx (0.42), src/styles.css (0.28), index.html (0.01), package.json (0.01), README.md (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
To add a new order type, changes are required in the core type definitions, domain rules, handler registry, and UI filter configuration.

---

Primary Required Changes

#### 1. Add Type Literal to Domain Types

**`src/types/domain.ts`**

Update the `OrderType` union to include the new type literal:

```typescript

export type OrderType = "standard" | "express" | "bulk" | "hazardous" | "new_type";

```

#### 2. Configure Zone and Pricing Rules

**`src/config/zoneRules.ts`**

Add entries for the new type to the two strict type maps (`Record<OrderType, ...>`):

* `typeKinds`: Map the new `OrderType` to its ordered list of preferred zone kinds (`Zone["kind"][]`), which is consumed by `scoreZone` during allocation.

* `pricingByType`: Assign a `PricingStrategy` (`"current"` or `"legacy"`) to determine pricing resolution in `pricingStrategyFor`.

#### 3. Register a Dispatch Handler

**`src/dispatch/handlers/`** & **`src/dispatch/handlers/registry.ts`**

Add a new handler module inside the `src/dispatch/handlers/` directory that calls `registerHandler` with an object implementing `DispatchHandler` (`prepare`, `inspect`, `shipmentDefaults`).

* *Flow & Execution*: `getHandler(type)` in `src/dispatch/handlers/registry.ts` auto-loads all handler files in `src/dispatch/handlers/` via `import.meta.glob("./*.ts")`. Both `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`) invoke `getHandler` with the order's type string and will throw an error if no handler is registered.

#### 4. Add to UI Filter Dropdown

**`src/pages/OrderListPage.tsx`**

Add the type literal to the `types` array (`const types: Array<Order["type"] | "all"> = [...]`) so the filter dropdown option is selectable on the incoming orders page.

---

Potential / Contextual Changes

Depending on specific operational rules for the new order type:

**Custom Pricing Surcharges (`src/pricing/pricing.ts`)**: Update `calculateOrderPrice` if special handling fees, weight multipliers, or priority logic apply beyond standard/legacy pricing strategies.
**Validation & Dock Assignment (`src/dispatch/validation.ts`)**: Update `validateShipment` if the type requires restricted carrier validation or designated dock routing (similar to the hazardous order check for carrier `"SecureChem Logistics"` and dock `"D4"`).
**API Request Interception (`src/api/interceptors/index.ts`)**: If requests for this order type require specific request headers or modified route paths (similar to `src/api/interceptors/hazardous-interceptor.ts`), write an interceptor and register it in `src/api/interceptors/index.ts`.
**Seed Fixtures (`src/data/seedData.ts`)**: Add sample order specifications to `orderSpecs` if mock dataset generation should include initial records for testing.
**Unit Tests**: Add coverage in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, and `src/tests/validation.test.ts`.

---

Unchanged Components
**`src/components/OrderCard.tsx`**: Renders `order.type` dynamically with the CSS class `.capitalize`.
**`src/pages/OrderDetailPage.tsx`**: Renders `{order.type} handling` dynamically.
**`src/store/useWarehouseStore.ts`**: `filteredOrders` dynamically compares `state.filters.type === "all" || order.type === state.filters.type`.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly covers `OrderType`, both configuration maps, the new handler, automatic discovery, and the UI/seed/test updates.
---

## Q10, applied

> If the zone rules changed, what else would be affected?

### Ground truth, this is the standard

Changes to matching, compatible zone kinds, priorities, or preference scores alter which zones
are ranked and therefore each order's proposed and accepted allocations, shortage warnings,
final `allocated` versus `held` state, and reserved stock totals. Revalidation and release reuse
those stored allocations and reservations. If the order-type pricing map in the same
configuration file changes, the calculated order total also changes.

**Files:** src/config/zoneRules.ts:14-85, src/dispatch/allocator.ts:17-73, src/stock/reservation.ts:9-45, src/jobs/revalidation.ts:10-49, src/dispatch/releaseService.ts:31-56, src/pricing/pricing.ts:5-21

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The `pricing` property present on individual `ZoneRule` objects is not read by any code in the
repository. It is declared on the interface, written on all four rules, and never read:
`pricingStrategyFor` consults `pricingByType`, and grepping for `.pricing` outside the
configuration file returns nothing. Pricing is decided by order type, not by zone.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/config/zoneRules.ts (0.68), src/dispatch/allocator.ts (0.64), src/pricing/pricing.ts (0.64), src/tests/pricing.test.ts (0.64), src/components/ZoneCard.tsx (0.61), src/pages/ZoneOverviewPage.tsx (0.61), src/App.tsx (0.59), src/data/seedData.ts (0.59), src/dispatch/releaseService.ts (0.59), src/jobs/revalidation.ts (0.59), src/stock/reservation.ts (0.59), src/stock/stockService.ts (0.59), src/store/useWarehouseStore.ts (0.59), src/types/domain.ts (0.49), src/dispatch/handlers/registry.ts (0.46), src/events/bus.ts (0.46), src/pricing/legacyPricing.ts (0.46), src/tests/allocation.test.ts (0.46), src/utils/formatters.ts (0.44), src/api/mock-server.ts (0.43), src/components/Layout.tsx (0.43), src/components/Toasts.tsx (0.43), src/dispatch/orderService.ts (0.43), src/dispatch/validation.ts (0.43), src/main.tsx (0.43), src/notifications/listener.ts (0.43), src/notifications/service.ts (0.43), src/pages/DispatchLogPage.tsx (0.43), src/pages/OrderDetailPage.tsx (0.43), src/pages/OrderListPage.tsx (0.43), src/tests/reservation.test.ts (0.43), src/tests/validation.test.ts (0.43), src/api/api-client.ts (0.33), src/api/interceptors/hazardous-interceptor.ts (0.33), src/api/interceptors/index.ts (0.33), src/api/interceptors/types.ts (0.33), src/components/OrderCard.tsx (0.33), src/dispatch/handlers/bulkHandler.ts (0.31), src/dispatch/handlers/expressHandler.ts (0.31), src/dispatch/handlers/hazardousHandler.ts (0.31), src/dispatch/handlers/standardHandler.ts (0.31), src/styles.css (0.28), index.html (0), package.json (0), README.md (0), src/api/interceptors/audit-interceptor.ts (0), src/api/interceptors/auth-interceptor.ts (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Changing `src/config/zoneRules.ts` affects candidate zone ranking during stock allocation in `allocateOrder()` (`src/dispatch/allocator.ts`) and pricing strategy selection during order total calculation in `calculateOrderPrice()` (`src/pricing/pricing.ts`).

---

Direct Callers and Control Flow

1. **Candidate Zone Ranking (`scoreZone`)**

* **Direct Caller**: `allocateOrder()` in `src/dispatch/allocator.ts`.

* **Mechanics**: For each order line, `allocateOrder()` scores zones via `scoreZone(zone, prepared, line)` before filtering candidates for active status and matching SKU availability (`zone.active && zone.stock.some(...)`). Candidates are then sorted by score descending to determine stock deduction order.

* **Rule Mechanics**: `rulesFor()` filters `zoneRules` where `rule.applies(order, line)` is true and orders them by `rule.score` descending. In `scoreZone()`, if `rule.zoneKinds` does not include the zone's kind, `scoreZone` returns `score - 25`, subtracting 25 from the score without executing `rule.prefer()`. Otherwise, it returns `score + rule.prefer(zone, order, line)`.

* **Downstream Effects**: Altering rules (`hazard-isolation`, `cold-chain`, `type-routing`, `capacity-balance`), rule zone kinds (`zoneKinds`), or preference returns changes zone scoring and candidate selection order. If stock allocation falls onto zones with insufficient available quantity (`onHand - reserved`), shortages are appended to `warnings`, unallocated units remain, and `order.status` becomes `"held"` rather than `"allocated"`.

* **Event Emission**: If all lines are fully allocated, `allocateOrder()` emits `order.allocated` via `eventBus` (`src/dispatch/allocator.ts`). Currently, `order.allocated` has no registered event listeners in the application.

2. **Pricing Strategy Resolution (`pricingStrategyFor`)**

* **Direct Callers**: `calculateOrderPrice()` in `src/pricing/pricing.ts` and unit tests in `src/tests/pricing.test.ts`.

* **Mechanics**: `pricingStrategyFor(order)` reads `pricingByType[order.type]` to return either `"current"` or `"legacy"`.

* **Calculation Paths**:

* `"legacy"` invokes `calculateLegacyPrice()` in `src/pricing/legacyPricing.ts`, calculating pricing based on pallet counts (500 kg units) and tier volume discounts.

* `"current"` computes totals in `src/pricing/pricing.ts` using line subtotals, weight-based handling fees (minimum $7.50), priority surcharges ($45 critical / $20 urgent), and dangerous goods surcharges ($65).

* **Persistence**: `allocateOrder()` stores the result in `order.total = calculateOrderPrice(prepared)`.

---

Application Store and UI Consumers
**Store Updates (`src/store/useWarehouseStore.ts`)**:

* `useWarehouseStore.allocate(id)` executes `allocateOrder()`, persists the result via `saveOrder()` (`src/dispatch/orderService.ts`), updates `orders` and `zones` store state, and prepends a log entry to `logs` with action `"allocated"` or `"held"`.

**UI Views**:

* **Order List Page (`src/pages/OrderListPage.tsx` & `src/components/OrderCard.tsx`)**: Displays status tags (`"allocated"` vs `"held"`), total price via `money(order.total)`, progress bars showing allocated unit counts, and context-sensitive action buttons.

* **Order Detail Page (`src/pages/OrderDetailPage.tsx`)**: Shows allocated `zoneId` chips per line item, calculated order total, and action buttons ("Mark ready" requires status `"allocated"` or `"picking"`).

* **Zone Overview Page (`src/pages/ZoneOverviewPage.tsx` & `src/components/ZoneCard.tsx`)**: Displays updated reserved inventory totals, available stock balances, and low stock warnings generated by `applyStockReservation()` (`src/stock/reservation.ts`).

* **Dispatch Log Page (`src/pages/DispatchLogPage.tsx`)**: Shows audit log rows recorded for `"allocated"` or `"held"` actions.

* **Navigation Layout (`src/components/Layout.tsx`)**: Updates the `incoming` count badge in the sidebar when an order transitions out of `"incoming"`.

---

Automated Test Coverage
**`src/tests/allocation.test.ts`**: Tests zone routing directly, verifying express order preference for fast-pick zone `ZB-02`, hazardous item placement in secure zone `ZS-04`, and order hold logic when stock is exhausted.
**`src/tests/pricing.test.ts`**: Validates `pricingStrategyFor()` bulk mapping to `"legacy"` and standard/hazardous pricing calculations.
```

**Verdict:** incorrect

**Why (one line, for the log):** Covers ranking, status, reservations and pricing, but misses that revalidation and release reuse the stored allocations and reservations.
---

## Q11, interceptor chain

> Are hazardous orders treated differently anywhere? Where?

### Ground truth, this is the standard

Yes. Their handler adds dangerous-goods paperwork, raises priority, validates regulated lines
and international review, and supplies SecureChem shipment defaults. Zone scoring isolates a
hazardous order or line to secure zones. The API interceptor rewrites outgoing hazardous-order
requests and adds controlled-load metadata. Shipment validation requires SecureChem and forces
dock D4. Current pricing also adds a hazardous fee when a line is hazardous.

**Files:** src/dispatch/handlers/hazardousHandler.ts:3-27, src/config/zoneRules.ts:14-19, src/config/zoneRules.ts:30-36, src/api/interceptors/hazardous-interceptor.ts:4-13, src/dispatch/validation.ts:29-30, src/pricing/pricing.ts:16-20

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

Some behaviour is keyed by `order.type === "hazardous"`, while zone isolation and the price
surcharge can also be triggered by a hazardous line in another order type.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/api/interceptors/hazardous-interceptor.ts (0.61), src/api/interceptors/index.ts (0.59), src/api/mock-server.ts (0.59), src/data/seedData.ts (0.59), src/dispatch/orderService.ts (0.59), src/pages/OrderListPage.tsx (0.59), src/store/useWarehouseStore.ts (0.59), src/tests/allocation.test.ts (0.59), src/tests/pricing.test.ts (0.59), src/tests/reservation.test.ts (0.59), src/tests/validation.test.ts (0.59), src/dispatch/handlers/hazardousHandler.ts (0.57), src/api/interceptors/types.ts (0.44), src/types/domain.ts (0.44), src/api/api-client.ts (0.43), src/api/interceptors/audit-interceptor.ts (0.43), src/api/interceptors/auth-interceptor.ts (0.43), src/App.tsx (0.43), src/components/Layout.tsx (0.43), src/components/OrderCard.tsx (0.43), src/components/Toasts.tsx (0.43), src/config/zoneRules.ts (0.43), src/dispatch/allocator.ts (0.43), src/dispatch/releaseService.ts (0.43), src/dispatch/validation.ts (0.43), src/jobs/revalidation.ts (0.43), src/notifications/service.ts (0.43), src/pages/DispatchLogPage.tsx (0.43), src/pages/OrderDetailPage.tsx (0.43), src/pages/ZoneOverviewPage.tsx (0.43), src/pricing/legacyPricing.ts (0.43), src/pricing/pricing.ts (0.43), src/stock/reservation.ts (0.43), src/dispatch/handlers/registry.ts (0.41), src/components/ZoneCard.tsx (0.29), src/events/bus.ts (0.29), src/stock/stockService.ts (0.29), src/utils/formatters.ts (0.29), src/main.tsx (0.28), src/notifications/listener.ts (0.28), src/dispatch/handlers/bulkHandler.ts (0.27), src/dispatch/handlers/expressHandler.ts (0.27), src/dispatch/handlers/standardHandler.ts (0.27), README.md (0.04), index.html (0), package.json (0), src/styles.css (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
Yes, orders with `type === "hazardous"` and order lines with `hazardous: true` are treated differently across API interception, specialized dispatch handling, zone scoring, pricing, shipment release validation, dock assignment, UI filtering/rendering, seed data, and unit tests.

1. API Interception & Server Request Handling
**`src/api/interceptors/hazardous-interceptor.ts`**: The `hazardousInterceptor` checks if `request.body?.type === "hazardous"`. For hazardous order requests, it:

* Replaces `/orders` in `request.path` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets `request.metadata.routing = "dangerous-goods"`.

**`src/api/interceptors/index.ts`**: Includes `hazardousInterceptor` in the `interceptors` array executed by `applyInterceptors` during API client PATCH requests triggered by store actions.
**`src/api/mock-server.ts`**: Normalizes `request.path` back from `/controlled/orders` to `/orders` via `normalizedPath` before processing route logic.
2. Specialized Dispatch Handler
**`src/dispatch/handlers/hazardousHandler.ts`**: Registers the dispatch handler for `type: "hazardous"`. Dynamically loaded by `getHandler("hazardous")` in `src/dispatch/handlers/registry.ts` and called during `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`).

* `prepare(order)`: Appends `"Dangerous goods paperwork required"` to `order.notes` and overrides `order.priority` to `"urgent"`.

* `inspect(order)`: Evaluates `order` and returns warnings if no line item has `hazardous === true` (`"Hazardous order has no regulated line"`) or if `destination.country !== "US"` (`"International dangerous goods review required"`).

* `shipmentDefaults(order)`: Returns default `carrier: "SecureChem Logistics"` and `packageCount: Math.max(1, Math.ceil(units / 4))`.

3. Zone Scoring & Inventory Allocation
**`src/config/zoneRules.ts`**:

* Configures `typeKinds.hazardous = ["secure"]`.

* Applies the `hazard-isolation` rule when `order.type === "hazardous" || line.hazardous`. For secure zones (`kind === "secure"`), `prefer()` runs and adds `80` score points. For non-secure zones (`kind !== "secure"`), `zoneKinds` does not match, so `scoreZone` applies a `-25` rule-mismatch penalty and skips `prefer()`.

* Applies the `type-routing` rule: for `type: "hazardous"`, a secure zone matches `typeKinds.hazardous[0]`, adding `40` score points via `prefer()`. Non-secure zones whose kind is in `zoneKinds` (`general`, `fast-pick`, `bulk`) return `-50` from `prefer()`, while zones outside `zoneKinds` (`cold`) apply a `-25` rule-mismatch penalty.

4. Shipment Validation & Dock Assignment
**`src/dispatch/validation.ts`**:

* **Carrier Requirement**: In `validateShipment`, if `order.type === "hazardous"` and `shipment.carrier !== "SecureChem Logistics"`, adds the error `"Approved dangerous goods carrier required"`.

* **Dock Routing**: Sets `shipment.dock = "D4"` for `order.type === "hazardous"`, while non-hazardous orders route to docks `D1`, `D2`, or `D3`.

5. Pricing & Surcharges
**`src/config/zoneRules.ts`**: Sets `pricingByType.hazardous = "current"`.
**`src/pricing/pricing.ts`**: In `calculateOrderPrice`, adds a flat `$65` surcharge (`hazardousFee`) if `order.lines.some((line) => line.hazardous)`.
6. UI & Seed Data
**`src/pages/OrderListPage.tsx`**: Includes `"hazardous"` in the order type filter dropdown, which filters the list via `filteredOrders` in `src/store/useWarehouseStore.ts`.
**`src/pages/OrderDetailPage.tsx`**: Renders a red `Controlled` badge (`<em>Controlled</em>`) next to order lines where `line.hazardous === true`.
**`src/data/seedData.ts`**: Defines catalog items `CL-900` and `BT-330` with `hazardous: true`, seeds `hazardous` orders, and places controlled inventory in zone `ZS-04` (`kind: "secure"`).
7. Test Coverage
**`src/tests/allocation.test.ts`**: Tests that hazardous stock (`CL-900`) is allocated to secure zone `ZS-04`.
**`src/tests/pricing.test.ts`**: Tests that hazardous orders include the dangerous goods surcharge in pricing calculations.
**`src/tests/validation.test.ts`**: Tests that hazardous order release validation fails without `SecureChem Logistics` and routes dock assignment to `D4`.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly covers the hazardous handler, secure-zone routing, API interceptor, SecureChem/D4 validation, and hazardous pricing fee.
---

## Q12, misleading name

> Where is a dock assigned to a shipment?

### Ground truth, this is the standard

`validateShipment` assigns the dock directly on the mutable shipment object. It chooses D4 for
hazardous orders and otherwise D1–D3 from a checksum of the order ID. `releaseShipment` calls
that function and then copies the resulting dock to `releasedOrder.assignedDock`.

**Files:** src/dispatch/validation.ts:9, src/dispatch/validation.ts:35-37, src/dispatch/validation.ts:38, src/dispatch/releaseService.ts:35, src/dispatch/releaseService.ts:41

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The assignment is hidden inside validation rather than a named allocation step.

</details>

### What the tool answered

Evidence panel: Evidence · 52 files retrieved
Retrieved: src/dispatch/handlers/registry.ts (0.63), src/dispatch/releaseService.ts (0.63), src/dispatch/validation.ts (0.63), src/events/bus.ts (0.63), src/store/useWarehouseStore.ts (0.63), src/tests/validation.test.ts (0.63), src/App.tsx (0.45), src/components/Layout.tsx (0.45), src/components/Toasts.tsx (0.45), src/data/seedData.ts (0.45), src/dispatch/allocator.ts (0.45), src/dispatch/handlers/bulkHandler.ts (0.45), src/dispatch/handlers/expressHandler.ts (0.45), src/dispatch/handlers/hazardousHandler.ts (0.45), src/dispatch/handlers/standardHandler.ts (0.45), src/dispatch/orderService.ts (0.45), src/jobs/revalidation.ts (0.45), src/notifications/listener.ts (0.45), src/notifications/service.ts (0.45), src/pages/DispatchLogPage.tsx (0.45), src/pages/OrderDetailPage.tsx (0.45), src/pages/OrderListPage.tsx (0.45), src/pages/ZoneOverviewPage.tsx (0.45), src/stock/reservation.ts (0.45), src/stock/stockService.ts (0.45), src/types/domain.ts (0.45), src/api/api-client.ts (0.3), src/api/interceptors/hazardous-interceptor.ts (0.3), src/api/interceptors/index.ts (0.3), src/api/interceptors/types.ts (0.3), src/api/mock-server.ts (0.3), src/components/OrderCard.tsx (0.3), src/components/ZoneCard.tsx (0.3), src/config/zoneRules.ts (0.3), src/main.tsx (0.3), src/pricing/legacyPricing.ts (0.3), src/pricing/pricing.ts (0.3), src/tests/allocation.test.ts (0.3), src/tests/pricing.test.ts (0.3), src/tests/reservation.test.ts (0.3), src/utils/formatters.ts (0.3), index.html (0), package.json (0), README.md (0), src/api/interceptors/audit-interceptor.ts (0), src/api/interceptors/auth-interceptor.ts (0), src/styles.css (0), src/vite-env.d.ts (0), tsconfig.app.json (0), tsconfig.json (0), tsconfig.node.json (0), vite.config.ts (0)

```
A dock is assigned to a shipment in `src/dispatch/validation.ts` inside the `validateShipment` function, which directly mutates the `dock` property on the provided `Shipment` object (`shipment.dock = ...`).

Supporting Details and Execution Flow

1. **Assignment Logic** (`src/dispatch/validation.ts`):

- Non-hazardous docks are selected from the module array `const docks = ["D1", "D2", "D3", "D4"];`.

- If `order.type === "hazardous"`, `shipment.dock` is assigned `"D4"`.

- Otherwise, the character codes of `order.id` are summed into `numeric`, and `shipment.dock` is assigned `docks[numeric % 3]`, selecting deterministically among `"D1"`, `"D2"`, or `"D3"`.

2. **Live Application Control Flow**:

- **UI Entry Point**: Triggered when a user clicks "Release shipment" in `src/pages/OrderDetailPage.tsx`, invoking `useWarehouseStore.release(id)` in `src/store/useWarehouseStore.ts`.

- **Service Execution**: `useWarehouseStore.release` calls `releaseShipment` in `src/dispatch/releaseService.ts`.

- **Mutation Call Site**: `releaseShipment` creates an initial `shipment` object without a dock and calls `validateShipment(shipment, order)`, which assigns `shipment.dock`.

- **Downstream Consumers**:

- `releaseShipment` copies `shipment.dock` onto `releasedOrder.assignedDock` (`src/dispatch/releaseService.ts`).

- The assigned dock is formatted into `log.detail` (`src/dispatch/releaseService.ts`).

- `releaseShipment` emits the `"shipment.released"` event via `eventBus` (`src/dispatch/releaseService.ts`, `src/events/bus.ts`).

- The event listener in `src/notifications/listener.ts` handles `"shipment.released"` and publishes a notification referencing `shipment.dock`, which is displayed in the UI via `src/components/Toasts.tsx`.

- `useWarehouseStore.release` persists the updated order using `saveOrder` in `src/dispatch/orderService.ts` and updates store state, rendering "Released from {order.assignedDock}" in `src/pages/OrderDetailPage.tsx`.

3. **Direct Unit Tests**:

- `validateShipment` is also called directly in `src/tests/validation.test.ts` to assert dock assignment for both hazardous and standard orders.
```

**Verdict:** correct

**Why (one line, for the log):** Correctly identifies `validateShipment` as the dock assignment point and explains how `releaseShipment` copies it to `assignedDock`.
---

