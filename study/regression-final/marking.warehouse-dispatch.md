# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 614746c858f8578578060665be297ed23aa826981da97a0656da587a2b494acb -->

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
Execution starts in **`index.html`**, which loads **`src/main.tsx`** as an ES module (`index.html`).

---

Detailed Execution & Initialization Lifecycle

1. **HTML Entry Point (`index.html`)**

The browser loads `index.html`, containing the root element `<div id="root"></div>` and the entry script tag `<script type="module" src="/src/main.tsx"></script>` (`index.html`).

2. **Module Evaluation (`src/main.tsx` & `src/App.tsx`)**

When `src/main.tsx` is evaluated:

* It imports dependencies, including `App` from `src/App.tsx` and stylesheet `./styles.css` (`src/main.tsx`).

* Evaluating `src/App.tsx` executes its top-level module code, instantiating the browser router via `createBrowserRouter` with the default root path `/` mapping to `OrderListPage` inside `Layout` (`src/App.tsx`).

* `src/main.tsx` locates `#root` in the DOM and invokes `ReactDOM.createRoot(...).render()` to mount `<App />` wrapped in `<React.StrictMode>` (`src/main.tsx`).

3. **React Render Phase (`src/App.tsx`)**

The `<App />` component executes its render function:

* It selects the `initialize` store action from `useWarehouseStore` (`src/store/useWarehouseStore.ts`).

* It returns `<RouterProvider router={router} />` (`src/App.tsx`), which mounts `<Layout />` (`src/components/Layout.tsx`) and the initial route view `<OrderListPage />` (`src/pages/OrderListPage.tsx`).

4. **Mount Side Effects & Background Initialization (`src/App.tsx`)**

After the initial render, the `useEffect` hook in `<App />` fires (`src/App.tsx`):

* **Event Listener Installation**: Calls `installNotificationListeners()` (`src/notifications/listener.ts`), setting its `installed` guard flag to `true` and subscribing callbacks to `eventBus` for `"shipment.released"` and `"stock.low"`.

* **Store Initialization**: Calls `initialize()` on `useWarehouseStore` (`src/store/useWarehouseStore.ts`), which:

1. Checks `get().initialized` (returning early if already initialized) and updates store state to `{ initialized: true }`.

2. Sets up a 300 ms polling timer (`window.setInterval`) that calls `drainNotifications()` (`src/notifications/service.ts`) to move queued notifications into Zustand store state.

3. Starts the background stock reservation job via `startRevalidationJob` (`src/jobs/revalidation.ts`), establishing a default 60,000 ms (1 minute) timer that executes `revalidateReservations` against the store's current `orders` and `zones` and writes back changes and log entries.

4. Registers a `{ once: true }` listener on `window` for the `"beforeunload"` event to clear the notification polling interval and cancel the revalidation timer (`stopJob`) on page teardown.

---

Evidence vs. Inference
**Direct Evidence**:

* `index.html` references `/src/main.tsx` in a `<script type="module">` tag.

* `src/main.tsx` executes `ReactDOM.createRoot(document.getElementById("root")!).render(...)`.

* `src/App.tsx` constructs `router` at module scope and invokes `installNotificationListeners()` and `initialize()` inside `useEffect`.

* `src/notifications/listener.ts` registers handlers on `eventBus`.

* `src/store/useWarehouseStore.ts` manages `initialized` state, notification draining (300 ms interval), revalidation timer invocation, and the `beforeunload` cleanup listener.

* `src/jobs/revalidation.ts` sets `window.setInterval` with `intervalMs = 60_000` by default.

**Inference**: Vite serves `index.html` as the default entry HTML document during development and build preview as configured in `package.json` scripts (`vite`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
An order is assigned to warehouse zones line-by-line during stock allocation (`allocateOrder` in `src/dispatch/allocator.ts`). The system identifies active candidate zones carrying the required SKU, calculates a net rule-based score for each candidate zone, ranks them descending by score, and greedily reserves available unreserved stock until each line's requested quantity is met.

---

Step-by-Step Assignment Flow

1. **Trigger & Order Preparation**

- Allocation is triggered from UI components (`src/pages/OrderListPage.tsx`, `src/pages/OrderDetailPage.tsx`, `src/components/OrderCard.tsx`) calling the `allocate(id)` store action (`src/store/useWarehouseStore.ts`).

- `allocateOrder` calls `getHandler(input.type)` (`src/dispatch/handlers/registry.ts`), which dynamically imports type-specific handler modules (`standardHandler.ts`, `expressHandler.ts`, `bulkHandler.ts`, or `hazardousHandler.ts` in `src/dispatch/handlers/`).

- The handler runs `prepare(order)` (modifying priority or appending operational notes) and `inspect(order)` (returning initial inspection warnings).

2. **Candidate Zone Filtering & Scoring**

For each line item in `order.lines` (`src/dispatch/allocator.ts`):

- **Filtering**: Candidate zones are filtered to active zones (`zone.active === true`) containing `line.sku` in `zone.stock`.

- **Scoring**: `scoreZone` (`src/config/zoneRules.ts`) evaluates each candidate zone against applicable rules from `zoneRules` (sorted by rule score descending):

- **Rule Deduction / Preference**: In `scoreZone`, if `zone.kind` is not included in `rule.zoneKinds`, `25` points are deducted. Otherwise, `rule.prefer(zone, order, line)` is added to the score.

- **Hazard Isolation** (`score: 100`, `zoneKinds: ["secure"]`): Applies if `order.type === "hazardous"` or `line.hazardous`. Returns `+80` points for `"secure"` zones. Non-secure zones fail the `zoneKinds` check in `scoreZone` and deduct `25` points (the `-100` fallback in `prefer` is unreached).

- **Cold Chain** (`score: 90`, `zoneKinds: ["cold"]`): Applies if `line.temperature !== "ambient"`. Returns `+70` points for matching temperature zones. Non-cold zones fail `zoneKinds` and deduct `25` points.

- **Type Routing** (`score: 50`, `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`): Applies to all orders. Evaluates preference based on order type mapping (`standard`: `general` then `fast-pick`; `express`: `fast-pick` then `general`; `bulk`: `bulk` then `general`; `hazardous`: `secure`). Positions yield `40 - position * 10` (or `-50` if unmapped).

- **Capacity Balance** (`score: 10`, `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`): Applies to all orders. Awards up to `20` points based on unused zone capacity (`Math.round((1 - used / zone.capacity) * 20)`).

3. **Greedy Allocation & Reservation**

- Candidate zones are sorted descending by score (`src/dispatch/allocator.ts`).

- The allocator iterates through sorted zones, calculating available stock (`Math.max(0, item.onHand - item.reserved)`).

- Proposed `Allocation` objects (with `lineId`, `sku`, `zoneId`, `quantity`, `reservedAt`, and `lotCode`) are generated until the required quantity is fulfilled or stock is exhausted.

- `applyStockReservation` (`src/stock/reservation.ts`) creates a cloned copy of `zones`, increments `item.reserved` by the allocated quantity for each matching `StockItem`, attaches `lotCode`, and collects any shortage messages.

4. **Status, Pricing, & Store Updates**

- Order total price is calculated via `calculateOrderPrice` (`src/pricing/pricing.ts`), using `calculateLegacyPrice` (`src/pricing/legacyPricing.ts`) for `bulk` orders or current pricing for standard/express/hazardous orders based on `pricingStrategyFor` (`src/config/zoneRules.ts`).

- If every line item is fully allocated, order status becomes `"allocated"` and `eventBus.emit("order.allocated", { order })` fires (`src/dispatch/allocator.ts`; no listener currently subscribes to `order.allocated` in `src/notifications/listener.ts`).

- If unallocated units remain, shortage warnings are attached and order status becomes `"held"`.

- Store action `allocate` persists the order via `saveOrder` (`src/dispatch/orderService.ts`) and updates store state (`orders`, `zones`, and prepends to `logs`).

---

File Citations
**Allocation loop & greedy fulfillment**: `src/dispatch/allocator.ts`
**Zone rules, scoring function, & pricing strategy mapping**: `src/config/zoneRules.ts`
**Stock reservation & zone state cloning**: `src/stock/reservation.ts`
**Dynamic handler registry & type handlers**: `src/dispatch/handlers/registry.ts`, `src/dispatch/handlers/`
**Pricing calculations**: `src/pricing/pricing.ts`, `src/pricing/legacyPricing.ts`
**Store action integration & persistence**: `src/store/useWarehouseStore.ts`, `src/dispatch/orderService.ts`
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
How an order type is processed is decided across five primary subsystems: dynamic dispatch handlers, zone routing rules, pricing strategy selection, release validation with dock assignment, and API request interception.

---

1. Dynamic Per-Type Dispatch Handlers (`src/dispatch/handlers/`)

Dispatch handlers implement the `DispatchHandler` interface (`src/dispatch/handlers/registry.ts`), providing type-specific preparation, inspection warnings, and default shipment configuration:

**Registry Lookup** (`src/dispatch/handlers/registry.ts`):

`getHandler(type)` dynamically loads handlers registered in `src/dispatch/handlers/*.ts` via `import.meta.glob("./*.ts")`. Handlers self-register using `registerHandler()`.

**Standard Handler** (`src/dispatch/handlers/standardHandler.ts`):

* `prepare()`: Appends `"Standard pick wave assigned"` to `order.notes`.

* `inspect()`: Adds `"Order contains no lines"` if `order.lines` is empty, and `"Large line requires supervisor check"` if any line quantity exceeds 100.

* `shipmentDefaults()`: Assigns carrier `"Northline Ground"` and `packageCount` calculated as `Math.max(1, Math.ceil(units / 12))`.

**Express Handler** (`src/dispatch/handlers/expressHandler.ts`):

* `prepare()`: Overrides `order.priority` to `"critical"` and appends `"Moved to express pick lane"` to `order.notes`.

* `inspect()`: Checks minutes remaining until `order.dueAt`. Returns `"Express service window has elapsed"` if overdue (`< 0`) or `"Less than 90 minutes remain"` if under 90 minutes.

* `shipmentDefaults()`: Assigns carrier `"Apex Priority"` and `packageCount` calculated as `Math.max(1, Math.ceil(weight / 20))`.

**Bulk Handler** (`src/dispatch/handlers/bulkHandler.ts`):

* `prepare()`: Calculates total line weight and appends `"Forklift requested for {weight} kg load"` to `order.notes`.

* `inspect()`: Adds `"Bulk order is below minimum handling quantity"` if total order units are under 20, and `"Receiving company is required"` if `order.destination.company` is missing.

* `shipmentDefaults()`: Assigns carrier `"Atlas Freight"` and `packageCount` calculated as `Math.max(1, Math.ceil(weight / 500))`.

**Hazardous Handler** (`src/dispatch/handlers/hazardousHandler.ts`):

* `prepare()`: Overrides `order.priority` to `"urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.

* `inspect()`: Adds `"Hazardous order has no regulated line"` if no line has `hazardous === true`, and `"International dangerous goods review required"` if `order.destination.country !== "US"`.

* `shipmentDefaults()`: Assigns carrier `"SecureChem Logistics"` and `packageCount` calculated as `Math.max(1, Math.ceil(units / 4))`.

**Execution Entry Points**:

**Stock Allocation** (`src/dispatch/allocator.ts`): `allocateOrder()` calls `getHandler(input.type)` to run `handler.prepare()` followed by `handler.inspect()`.
**Shipment Release** (`src/dispatch/releaseService.ts`): `releaseShipment()` calls `getHandler(order.type)` to retrieve `handler.shipmentDefaults()`.

---

2. Zone Routing & Stock Selection Rules (`src/config/zoneRules.ts`)

Inventory scoring per order type is driven by `typeKinds` and zone rules in `src/config/zoneRules.ts`:

```ts

const typeKinds: Record<OrderType, Zone["kind"][]> = {

standard: ["general", "fast-pick"],

express: ["fast-pick", "general"],

bulk: ["bulk", "general"],

hazardous: ["secure"],

};

```

**Type Routing Rule** (`id: "type-routing"`, score 50): Evaluates candidate storage zones using `typeKinds[order.type]`. If a candidate zone kind matches a position in `typeKinds[order.type]`, `prefer()` returns `40 - position * 10`; if absent, it penalizes the candidate zone by returning `-50`.
**Hazard Isolation Rule** (`id: "hazard-isolation"`, score 100): Applies if `order.type === "hazardous"` or if `line.hazardous` is `true`. Its `prefer()` function returns `80` for `"secure"` zones and `-100` for all non-secure zones.
**Execution**: Called during stock allocation in `allocateOrder()` (`src/dispatch/allocator.ts`) via `scoreZone()`, which orders candidate zones by score before allocating line quantities.

---

3. Order Pricing Strategy (`src/config/zoneRules.ts`, `src/pricing/pricing.ts`, `src/pricing/legacyPricing.ts`)

Order processing prices depend on `order.type`:

**Strategy Selection** (`src/config/zoneRules.ts`):

`pricingStrategyFor(order)` evaluates `pricingByType[order.type]`. `bulk` orders select `"legacy"` pricing, whereas `standard`, `express`, and `hazardous` select `"current"` pricing.

**Pricing Dispatch** (`src/pricing/pricing.ts`):

`calculateOrderPrice(order)` checks `pricingStrategyFor(order)`:

* **Legacy Pricing** (`src/pricing/legacyPricing.ts`): Evaluates subtotal, adds pallet handling charges (`Math.ceil(weight / 500) * 18.5`), and subtracts tiered volume discounts (7.5% for subtotals > $5,000; 4% for subtotals > $2,000).

* **Current Pricing** (`src/pricing/pricing.ts`): Evaluates subtotal, adds weight-based handling (`Math.max(7.5, weight * 0.11)`), priority surcharge ($45 for `critical`, $20 for `urgent`), and a fixed $65 dangerous goods fee if any line has `hazardous === true`.

**Execution**: Price calculations run during stock allocation in `allocateOrder()` (`src/dispatch/allocator.ts`) when constructing the updated `Order` total.

---

4. Release Validation & Dock Routing (`src/dispatch/validation.ts`)

`validateShipment()` in `src/dispatch/validation.ts` enforces carrier requirements and assigns outbound loading docks based on `order.type`:

**Carrier Requirement**: If `order.type === "hazardous"`, `validateShipment()` requires `shipment.carrier === "SecureChem Logistics"`; any other carrier adds `"Approved dangerous goods carrier required"` to validation errors.
**Dock Routing**: If `order.type === "hazardous"`, dock assignment `shipment.dock` is fixed to `"D4"`. For non-hazardous types (`standard`, `express`, `bulk`), dock assignment deterministically rotates across docks `D1`, `D2`, or `D3` based on the character code sum of `order.id`.

---

5. API Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)

Outbound HTTP requests executed through `apiClient` (`src/api/api-client.ts`) pass through `applyInterceptors()` (`src/api/interceptors/index.ts`):

**Interceptor Rule** (`src/api/interceptors/hazardous-interceptor.ts`): `hazardousInterceptor` inspects `request.body`. If `body.type === "hazardous"`, it rewrites the path from `/orders` to `/controlled/orders`, adds header `"x-controlled-load": "true"`, and sets metadata `routing: "dangerous-goods"`.
**Mock Server Normalization** (`src/api/mock-server.ts`): `normalizedPath()` strips `/controlled/orders` back to `/orders` for internal record matching.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
Stock reservation in this repository is defined as calculating and increasing stock item `reserved` quantities against available inventory (`onHand - reserved`). This logic is centralized in one core function, executed across **3 live production call sites**, invoked in **2 unit test cases**, and distinct from operations that consume or initialize reserved stock.

---

Core Stock Reservation Logic
`applyStockReservation` in `src/stock/reservation.ts` (lines 10–39, reserved increment on line 35)

`applyStockReservation` is the sole logic unit that creates and updates stock reservations:

**Immutability:** Operates on a deep clone of zones (`structuredClone(zones)` on line 12) rather than mutating input arguments directly.
**Calculation:** Calculates available stock as `item.onHand - item.reserved + alreadyReserved` (where `alreadyReserved` accounts for existing allocations on the target order for the same SKU and zone).
**Capping & Lot Assignment:** Caps requested quantities to `Math.min(requested.quantity, Math.max(0, available))` and assigns the stock item's `lotCode` to accepted allocations.
**Shortage Reporting:** If stock is missing or requested quantity exceeds availability, appends shortage message strings to `shortages` (`${requested.sku} is short by ${requested.quantity - quantity} in ${requested.zoneId}`).
**State Update:** Updates the reserved field on the cloned item:

```ts

item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity;

```

---

Production Call Sites

1. **Order Allocation (`allocateOrder`)**

* **Location:** `src/dispatch/allocator.ts` (line 47)

* **Entry Point & Call Flow:** Triggered when an operator clicks "Allocate stock" in `OrderCard` (`src/components/OrderCard.tsx`, line 88) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 67). This calls `useWarehouseStore.allocate(id)` (`src/store/useWarehouseStore.ts`, line 147), which executes `allocateOrder(order, get().zones)`.

* **Behavior:** `allocateOrder` determines candidate zones and proposed quantities across order lines, then calls `applyStockReservation` to reserve inventory and set order status to `"allocated"` (or `"held"` if incomplete).

2. **Shipment Release Re-verification (`releaseShipment`)**

* **Location:** `src/dispatch/releaseService.ts` (line 30)

* **Entry Point & Call Flow:** Triggered when an operator clicks "Release shipment" in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 84). This calls `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`, line 199), which executes `releaseShipment(order, get().zones, "Current operator")`.

* **Behavior:** Calls `applyStockReservation` with existing order allocations to ensure stock remains available before validating shipment shipment requirements. Throws an error if shortages are reported.

3. **Background Reservation Revalidation Job (`revalidateReservations`)**

* **Location:** `src/jobs/revalidation.ts` (line 20)

* **Entry Point & Call Flow:** Initialized during application render via `App.tsx` (line 25) -> `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`, line 125) -> `startRevalidationJob` (`src/jobs/revalidation.ts`, line 52). Runs on a 60-second interval timer (`window.setInterval`).

* **Behavior:** Resets working zone stock `reserved` counters to `0` (`src/jobs/revalidation.ts`, line 15) and sequentially re-applies stock reservations for all active orders in status `"allocated"`, `"picking"`, or `"ready"` by calling `applyStockReservation`.

---

Test Call Sites

4. **Unit Tests (`src/tests/reservation.test.ts`)**

* **Location:** `src/tests/reservation.test.ts` (line 22 & line 32)

* **Behavior:** Directly invokes `applyStockReservation` to verify lot code propagation, `reserved` incrementing, and shortage detection when requested quantity exceeds available stock.

---

Excluded Operations (Consumption, Initialization, and Resets)

The following locations modify or write to the `reserved` property but do not create or increase stock reservations:

**Stock Commitment / Decrement (`commitReleasedStock`):** `src/stock/stockService.ts` (line 28). Called inside `releaseShipment` (`src/dispatch/releaseService.ts`, line 53). Reduces `item.reserved` (`item.reserved = Math.max(0, item.reserved - allocation.quantity)`) as physical inventory leaves the facility.
**Working State Reset:** `src/jobs/revalidation.ts` (line 15). Zeroes out `reserved` stock on cloned working zones prior to re-running order allocations.
**Static Seed Data:** `src/data/seedData.ts` (lines 317–384). Hardcodes initial baseline `reserved` values on raw seed data objects.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
Before an outgoing API request is sent to the mock request handler (`handleRequest`), it is instantiated as an initial `ApiRequest` object in `apiClient` (`src/api/api-client.ts`) and processed sequentially through a pipeline of three request interceptors—`authInterceptor`, `auditInterceptor`, and `hazardousInterceptor` (`src/api/interceptors/index.ts`)—which enrich its headers, metadata, and path before passing it to `handleRequest` (`src/api/mock-server.ts`).

---

Step-by-Step Pre-Send Flow

#### 1. Initial Request Object Construction

When `apiClient.get`, `post`, or `patch` is invoked (`src/api/api-client.ts`), the internal `request` function instantiates a base `ApiRequest` object typed per `src/types/domain.ts`:

**`path`**: The target endpoint string (e.g., `"/orders"` or `"/orders/:id"`).
**`method`**: `"GET"`, `"POST"`, or `"PATCH"`.
**`body`**: The request payload parameter (or `undefined` for `get`).
**`headers`**: Initialized to `{ accept: "application/json" }`.
**`metadata`**: Initialized as an empty object `{}`.

*Direct evidence:* `apiClient` exposes `get`, `post`, and `patch`. In live application code (`src/dispatch/orderService.ts`), `fetchOrders` and `fetchOrder` call `get`, while `saveOrder` calls `patch`.

#### 2. Sequential Interceptor Execution

The request object is passed to `applyInterceptors` (`src/api/interceptors/index.ts`), which iterates through the `interceptors` array using an `async` loop, passing each returned object to the next interceptor:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

* Copies existing headers and appends the authorization header:

`headers: { ...request.headers, authorization: "Bearer warehouse-console-session" }`

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

* Appends an ISO timestamp header:

`headers: { ...request.headers, "x-requested-at": new Date().toISOString() }`

* Appends audit metadata:

`metadata: { ...request.metadata, source: "dispatch-console", correlationId: crypto.randomUUID() }`

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

* Inspects `request.body` (cast as `Partial<Order> | undefined`).

* **If `body?.type === "hazardous"`**:

* Rewrites `path` by replacing `"/orders"` with `"/controlled/orders"`.

* Appends header `"x-controlled-load": "true"`.

* Appends metadata `routing: "dangerous-goods"`.

* **If `body?.type !== "hazardous"` or body is undefined**: Returns the request object without structural modification.

#### 3. Dispatch to Mock Request Handler

The finalized `ApiRequest` returned by `applyInterceptors` is passed directly as the argument to `handleRequest<TResponse>(intercepted)` in `src/api/mock-server.ts`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
No, `validateShipment` does not only check; it mutates state by modifying the passed-in `shipment` object to assign its `dock` property (`shipment.dock`).

---

Direct Evidence & Implementation Details

#### 1. In-Place Mutation in `validateShipment`

In `src/dispatch/validation.ts`, `validateShipment` accepts `shipment: Shipment` and `order: Order`. Rather than returning a cloned shipment object with an assigned dock, it mutates the input `shipment` object directly:

```typescript

// src/dispatch/validation.ts (lines 35-38)

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

**Dock Assignment Logic**:

* If `order.type === "hazardous"`, `shipment.dock` is set to `"D4"`.

* Otherwise, the ASCII character codes of `order.id` are summed to calculate `numeric % 3`, selecting `"D1"`, `"D2"`, or `"D3"` from `const docks = ["D1", "D2", "D3", "D4"]`.

**Checking vs. Mutating**: The validation error/warning lists (`errors` and `warnings`) are local arrays that form the returned `ShipmentValidation` result (`{ valid, errors, warnings }`). The assignment to `shipment.dock` is the sole side effect performed on the caller's arguments.

---

#### 2. Flow of Mutated State Across the Application

**Release Pipeline (`src/dispatch/releaseService.ts`)**:

In `releaseShipment`, a draft `shipment` object is created and passed to `validateShipment`:

```typescript

const validation = validateShipment(shipment, order);

```

After validation succeeds, the mutated `shipment.dock` property is:

1. Read to populate `releasedOrder.assignedDock`:

```typescript

assignedDock: shipment.dock,

```

2. Formatted into the release audit log (`log.detail`):

```typescript

detail: `${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}`,

```

3. Emitted in the `shipment.released` event payload:

```typescript

eventBus.emit("shipment.released", { order: releasedOrder, shipment });

```

**Notification System (`src/notifications/listener.ts`)**:

The event listener registered via `installNotificationListeners()` handles `shipment.released` and reads `shipment.dock` to build the notification banner:

```typescript

message: `${shipment.packageCount} package(s) are loading at dock ${shipment.dock}.`,

```

**State Store (`src/store/useWarehouseStore.ts`)**:

The `release` action calls `releaseShipment`, persists the updated `releasedOrder` via `saveOrder` (`src/dispatch/orderService.ts`), and prepends the returned log entry to `state.logs`.

**UI Rendering (`src/pages/OrderDetailPage.tsx`)**:

The detail page reads `order.assignedDock` stored from the release operation to render UI status indicators:

* Header label: `✓ Released from {order.assignedDock}`

* Dispatch metadata section: `<dd>{order.assignedDock ?? "Pending validation"}</dd>`

**Unit Tests (`src/tests/validation.test.ts`)**:

Tests verify the mutation by asserting the `dock` property directly on the input `candidate` shipment reference after calling `validateShipment`:

```typescript

expect(candidate.dock).toMatch(/^D[1-3]$/); // Standard order test

expect(candidate.dock).toBe("D4"); // Hazardous order test

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
For a bulk order, the **`calculateLegacyPrice`** implementation in `src/pricing/legacyPricing.ts` runs.

---

Why `calculateLegacyPrice` is selected

1. **Strategy Selection via Configuration Mapping**

When `calculateOrderPrice(order)` is called in `src/pricing/pricing.ts`, it retrieves the pricing strategy for the order:

```ts

const strategy = pricingStrategyFor(order);

```

In `src/config/zoneRules.ts`, `pricingStrategyFor` looks up the strategy in the `pricingByType` mapping dictionary:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

Orders of type `"bulk"` map directly to the `"legacy"` strategy (`src/config/zoneRules.ts`).

2. **Early Return Dispatch**

In `src/pricing/pricing.ts`, `calculateOrderPrice` checks if the returned strategy is `"legacy"`. If so, it immediately executes and returns `calculateLegacyPrice(order)`:

```ts

if (strategy === "legacy") return calculateLegacyPrice(order);

```

---

Calculation Behavior of `calculateLegacyPrice`

Inside `src/pricing/legacyPricing.ts`, `calculateLegacyPrice` computes the order total using legacy business rules:

**Subtotal:** Sums line items (`line.quantity * line.unitPrice`).
**Pallet Handling:** Calculates total weight (`sum(line.quantity * line.weightKg)`), divides by 500 kg, rounds up (`Math.ceil`), enforces a minimum of 1 pallet, and multiplies by `$18.50` per pallet.
**Volume Discount:** Applies a 7.5% discount on the subtotal if the subtotal exceeds `$5,000`, or a 4% discount if it exceeds `$2,000` (0% otherwise).
**Final Total:** Returns `subtotal + handling - volumeDiscount` formatted to 2 decimal places as a number.

---

Application Tracing and Runtime Entry Point
**Dispatch Execution:** During order allocation (`allocateOrder` in `src/dispatch/allocator.ts`), `calculateOrderPrice(prepared)` is evaluated, setting the calculated total onto `order.total`.
**UI Display:** Store state updates propagate to components such as `OrderCard` (`src/components/OrderCard.tsx`) and `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`), where `order.total` is displayed using the `money` formatter (`src/utils/formatters.ts`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
When an event is emitted via the `eventBus` (`src/events/bus.ts`), reactions occur for two event types (`shipment.released` and `stock.low`), while two other event types (`order.allocated` and `notification.created`) have no registered listeners in the codebase.

---

Summary of Reactions

| Event Type | Emitted In | Registered Listener(s) Location | Reaction / Downstream Effect |

| :--- | :--- | :--- | :--- |

| **`shipment.released`** | `src/dispatch/releaseService.ts` | `src/notifications/listener.ts` | Triggers a success notification created in `src/notifications/service.ts`, which is polled by the Zustand store (`src/store/useWarehouseStore.ts`) and displayed in the UI (`src/components/Toasts.tsx`). |

| **`stock.low`** | `src/stock/stockService.ts` | `src/stock/stockService.ts`<br>`src/notifications/listener.ts` | 1. Appends a signal string to module-scoped state (`lowStockSignals`) in `src/stock/stockService.ts`.<br>2. Triggers a warning notification created in `src/notifications/service.ts`, polled by `src/store/useWarehouseStore.ts`, and displayed in `src/components/Toasts.tsx`. |

| **`order.allocated`** | `src/dispatch/allocator.ts` | *None* | No listener reacts to this event. |

| **`notification.created`** | `src/notifications/service.ts` | *None* | No listener reacts to this event. |

---

Detailed Execution Trace for Registered Events

#### 1. `shipment.released`

**Emission Context:** Emitted by `releaseShipment` (`src/dispatch/releaseService.ts`) after a shipment passes validation, updating the order status to `"released"` and committing released stock.
**Listener Registration:** Registered inside `installNotificationListeners()` in `src/notifications/listener.ts`, which is executed inside a React `useEffect` in `src/App.tsx`.
**Reaction Flow:**

1. The listener executes `publishNotification()` (`src/notifications/service.ts`) with a success payload (`"Order <id> released"`).

2. `publishNotification` unshifts the notification object into an in-memory `pending` array and emits `notification.created`.

3. Every 300ms, a timer set by `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`) calls `drainNotifications()` (`src/notifications/service.ts`), which empties the `pending` array.

4. New notifications are prepended to `state.notifications` (capped at 8 items) in `src/store/useWarehouseStore.ts`.

5. `Toasts` (`src/components/Toasts.tsx`) subscribes to `state.notifications` and renders a green toast to the user.

---

#### 2. `stock.low`

**Emission Context:** Emitted by `commitReleasedStock` (`src/stock/stockService.ts`) when stock commit operations reduce available stock (`onHand - reserved`) at or below an item's `reorderPoint`.
**Listener Registrations:**

1. **Module Listener (`src/stock/stockService.ts`):** Evaluated at module import time. It formats and unshifts a signal string (e.g., `"SKU in ZONE: N available"`) into the internal `lowStockSignals` array (capped at 20 entries).

* *Note on reach:* `lowStockSignals` is readable via `getLowStockSignals()` (`src/stock/stockService.ts`), though `getLowStockSignals` has no callers in the current codebase (direct evidence).

2. **Notification Listener (`src/notifications/listener.ts`):** Installed via `installNotificationListeners()` in `src/App.tsx`.

**Reaction Flow:**

1. The notification listener invokes `publishNotification()` (`src/notifications/service.ts`) with a warning payload (`"Low stock: <sku>"`).

2. `publishNotification` pushes the warning into `pending` and emits `notification.created`.

3. The 300ms polling interval in `useWarehouseStore.ts` drains `pending` via `drainNotifications()` and updates `state.notifications`.

4. `Toasts` (`src/components/Toasts.tsx`) renders a warning toast to the user.

---

Events Emitted Without Active Listeners

1. **`order.allocated`**

* **Emitted by:** `allocateOrder` (`src/dispatch/allocator.ts`) when all line items in an order are fully allocated.

* **Reaction:** None. There are no calls to `eventBus.on("order.allocated", ...)` anywhere in the repository.

2. **`notification.created`**

* **Emitted by:** `publishNotification` (`src/notifications/service.ts`) whenever a notification is published.

* **Reaction:** None. There are no calls to `eventBus.on("notification.created", ...)` anywhere in the repository (state consumption relies on polling `drainNotifications()`, not this event).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
To add a new order type, the primary change starts in **`src/types/domain.ts`**, followed by mandatory handler registration, zone/pricing configuration, and UI filter options.

---

Mandatory Changes

#### 1. Define the Domain Type

**File:** `src/types/domain.ts`
Add the new type string to the `OrderType` union definition:

```ts

export type OrderType = "standard" | "express" | "bulk" | "hazardous";

```

#### 2. Create and Register a Dispatch Handler

**Directory:** `src/dispatch/handlers/`
Create a new file inside `src/dispatch/handlers/` (following existing patterns like `src/dispatch/handlers/standardHandler.ts` or `src/dispatch/handlers/expressHandler.ts`).
`src/dispatch/handlers/registry.ts` uses `import.meta.glob("./*.ts")` to automatically import and register files in this directory when `getHandler(type)` is invoked by allocation (`src/dispatch/allocator.ts`) or release (`src/dispatch/releaseService.ts`).
The file must call `registerHandler` at module scope with an object implementing `DispatchHandler`:

* `prepare(order: Order): Order` — modifies or annotates the order prior to allocation.

* `inspect(order: Order): string[]` — returns operational or validation warnings.

* `shipmentDefaults(order: Order)` — returns default `carrier` and `packageCount`.

#### 3. Update Type-Checked Configuration Maps

**File:** `src/config/zoneRules.ts`
Update the two `Record<OrderType, ...>` objects to satisfy TypeScript:

* `typeKinds`: Map the new `OrderType` to an ordered list of target `Zone["kind"]` values used by `scoreZone` during stock allocation.

* `pricingByType`: Map the new `OrderType` to its `PricingStrategy` (`"current"` or `"legacy"`).

#### 4. Update UI Order Filters

**File:** `src/pages/OrderListPage.tsx`
Add the new order type string to the hardcoded `types` array to include it in the status/type filter toolbar select dropdown:

```ts

const types: Array<Order["type"] | "all"> = [

"all",

"standard",

"express",

"bulk",

"hazardous",

];

```

---

Additional & Conditional Changes
**Shipment & Dock Validation (`src/dispatch/validation.ts`)**: Update `validateShipment` if the new order type requires specific dock assignments (e.g., how `hazardous` enforces dock `"D4"`) or specific carrier validations.
**API Interceptors (`src/api/interceptors/hazardous-interceptor.ts` & `src/api/interceptors/index.ts`)**: If requests for the new type need path modifications or header additions before hit execution, implement a `RequestInterceptor` and add it to `interceptors` in `src/api/interceptors/index.ts`.
**Pricing Calculation (`src/pricing/pricing.ts`)**: Update `calculateOrderPrice` if the order type incurs dedicated fees or requires custom pricing logic beyond standard handling fees and priority surcharges.
**Seed Fixtures (`src/data/seedData.ts`)**: Add sample orders matching the new type to `orderSpecs` for local development and mock server dataset initialization (`src/api/mock-server.ts`).
**Test Suites (`src/tests/`)**: Add unit tests covering allocation (`src/tests/allocation.test.ts`), pricing (`src/tests/pricing.test.ts`), and shipment validation (`src/tests/validation.test.ts`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
Changing the zone rules in `src/config/zoneRules.ts` affects **zone candidate scoring during order allocation**, **pricing strategy selection during price calculations**, and their downstream runtime, persistence, job, UI, and test dependencies.

---

Direct Callers & Execution Flow

1. **Zone Scoring & Allocation (`src/dispatch/allocator.ts`)**

* `allocateOrder` calls `scoreZone(zone, prepared, line)` for every line item across candidate zones. `scoreZone` calls `rulesFor`, evaluating rule predicates (`applies`) and preference scores (`prefer`) based on rule criteria (hazard isolation, cold chain temperature matching, `typeKinds` type routing, and capacity balance).

* **Impact:** Candidates are sorted by score descending before attempting stock reservations via `applyStockReservation` (`src/stock/reservation.ts`). Changes to rules alter candidate rankings, controlling which zone stock items (`item.reserved`) and lot codes (`item.lotCode`) are assigned to `order.allocations`, whether an order fully allocates (`status: "allocated"`) or remains incomplete (`status: "held"` with unallocated quantity messages added to `warnings`), and whether `order.total` is calculated.

2. **Order Pricing Calculation (`src/pricing/pricing.ts`)**

* `calculateOrderPrice` calls `pricingStrategyFor(order)`, which looks up `pricingByType[order.type]`.

* **Impact:** Controls whether `calculateLegacyPrice(order)` (`src/pricing/legacyPricing.ts`) or current pricing logic (subtotal + handling fee + priority surcharge + hazardous fee) executes. The resulting price sets `order.total` during `allocateOrder`.

---

Store Mutations, API, & Downstream Runtime Effects
**Store Action & State Mutations (`src/store/useWarehouseStore.ts`):**

`allocate(id)` invokes `allocateOrder` and passes the result to `saveOrder(result.order)` (`src/dispatch/orderService.ts`), which sends a `PATCH /orders/:id` request via `apiClient` (intercepted by `authInterceptor`, `auditInterceptor`, and `hazardousInterceptor` in `src/api/interceptors/` before reaching `src/api/mock-server.ts`).

Upon completion, Zustand store fields update:

* `state.orders`: Replaced with the saved order (`status`, `allocations`, `total`).

* `state.zones`: Inventory records update with modified `reserved` stock quantities.

* `state.logs`: Prepends a new dispatch log entry with action `"allocated"` or `"held"`.

**Emitted Events (`src/dispatch/allocator.ts`, `src/events/bus.ts`):**

If allocation completes fully, `eventBus.emit("order.allocated", { order })` fires.

* *Note on listeners:* `order.allocated` is defined in `src/events/bus.ts` and emitted in `src/dispatch/allocator.ts`, but currently has **no registered listeners** (`src/notifications/listener.ts` listens only to `shipment.released` and `stock.low`).

**Revalidation Job (`src/jobs/revalidation.ts`):**

The background revalidation job (started in `useWarehouseStore.initialize`) periodically re-evaluates orders in `"allocated"`, `"picking"`, or `"ready"` status against current zone stock levels. Changes in initial zone selection dictate which stock positions are revalidated and whether orders drop to `"held"` status during stock shortages.

**Shipment Release Path (`src/dispatch/releaseService.ts`):**

Orders marked `"ready"` are released via store action `release(id)`. `releaseShipment` re-verifies allocations against zones, transitions status to `"released"`, assigns dock and tracking information, commits stock via `commitReleasedStock` (`src/stock/stockService.ts`—reducing `onHand` and `reserved`), and emits `shipment.released`, which triggers a toast notification via `installNotificationListeners` (`src/notifications/listener.ts`).

---

UI Consumers
**Order List Page & Order Cards (`src/pages/OrderListPage.tsx`, `src/components/OrderCard.tsx`):**

Reads `order.status`, `order.total`, and `order.allocations`. Displays status badges (`allocated` vs `held`), allocation progress bars, total calculated prices, summary metrics (awaiting allocation, on hold), and action button states.

**Order Detail Page (`src/pages/OrderDetailPage.tsx`):**

Renders line allocation chips (showing allocated zone ID and quantity), total value, available zone stock, and action buttons (`Allocate stock`, `Mark ready`, or `Release shipment`).

**Zone Overview Page & Zone Cards (`src/pages/ZoneOverviewPage.tsx`, `src/components/ZoneCard.tsx`):**

Displays updated reserved stock levels, available inventory (`onHand - reserved`), zone capacity utilization percentages, and reorder warnings.

**Dispatch Log Page (`src/pages/DispatchLogPage.tsx`):**

Displays chronological log entries for `"allocated"` or `"held"` actions.

**Sidebar (`src/components/Layout.tsx`):**

Updates the incoming order badge count for orders awaiting allocation.

---

Test Suite Impact
**`src/tests/pricing.test.ts`:** Directly imports `pricingStrategyFor` and asserts that bulk orders map to the `"legacy"` pricing strategy and match `calculateLegacyPrice`.
**`src/tests/allocation.test.ts`:** Calls `allocateOrder` and asserts allocation outcomes that depend directly on `scoreZone` scoring rules (e.g., verifying express orders pick from fast-pick zone `ZB-02`, hazardous orders pick from secure zone `ZS-04`, and unavailable stock transitions status to `"held"`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
Yes, hazardous orders (and orders containing hazardous line items) are treated differently across API request interception, dispatch handler preparation and inspection, stock allocation and zone scoring, order pricing, shipment release validation and dock assignment, UI line-item tagging, and order type filtering.

---

1. API Request Interception & Routing
**`src/api/interceptors/hazardous-interceptor.ts`** and **`src/api/interceptors/index.ts`**

* When an API request body has `type === "hazardous"`, `hazardousInterceptor` modifies the request before dispatching:

* Replaces `request.path` from `/orders` to `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets metadata `routing: "dangerous-goods"`.

* **Runtime context:** `src/api/mock-server.ts` uses `normalizedPath()` to map `/controlled/orders` back to `/orders` when generating mock responses.

---

2. Dispatch Handler Logic (`hazardousHandler`)
**`src/dispatch/handlers/hazardousHandler.ts`** (registered dynamically via **`src/dispatch/handlers/registry.ts`** and invoked by `allocateOrder` in **`src/dispatch/allocator.ts`** and `releaseShipment` in **`src/dispatch/releaseService.ts`**)

* **Preparation (`prepare`)**: Appends `"Dangerous goods paperwork required"` to `order.notes` and escalates `order.priority` to `"urgent"`.

* **Inspection (`inspect`)**: Returns validation warnings if no order line has `hazardous: true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **Shipment Defaults (`shipmentDefaults`)**: Configures default carrier as `"SecureChem Logistics"` and calculates package count as 1 package for every 4 total line units (`Math.max(1, Math.ceil(units / 4))`).

---

3. Inventory & Zone Allocation Rules
**`src/config/zoneRules.ts`**

* `typeKinds`: Maps the `"hazardous"` order type exclusively to `["secure"]` zone kinds.

* `hazard-isolation` rule (highest rule score of 100): Applies if `order.type === "hazardous"` or `line.hazardous === true`. Scores secure zones at `+80` and penalizes non-secure zones with `-100`, forcing hazardous items to allocate from secure inventory (such as `ZS-04 Controlled Materials` in **`src/data/seedData.ts`**). Non-secure zones also incur a `-25` penalty in `scoreZone()` because `"secure"` is the only zone kind allowed by the rule.

---

4. Pricing & Surcharges
**`src/config/zoneRules.ts`** and **`src/pricing/pricing.ts`**

* `pricingStrategyFor()` returns `"current"` for `"hazardous"` order types.

* In `calculateOrderPrice()` (**`src/pricing/pricing.ts`**), if any order line has `line.hazardous === true`, a flat `$65` dangerous goods surcharge (`hazardousFee`) is added.

* Because `hazardousHandler.prepare()` sets `order.priority` to `"urgent"`, pricing also includes a `$20` priority fee.

---

5. Release Validation & Dock Assignment
**`src/dispatch/validation.ts`**

* **Carrier Validation**: If `order.type === "hazardous"`, `validateShipment()` requires `shipment.carrier` to be `"SecureChem Logistics"`, returning error `"Approved dangerous goods carrier required"` if any other carrier is provided.

* **Dock Assignment**: Assigns hazardous shipments specifically to dock `"D4"` (`order.type === "hazardous" ? "D4" : ...`), while non-hazardous orders are assigned to `"D1"`, `"D2"`, or `"D3"`.

---

6. User Interface Display & Filtering
**`src/pages/OrderDetailPage.tsx`**

* Renders a `Controlled` badge (`<em>Controlled</em>`) adjacent to any order line item where `line.hazardous` is `true`.

**`src/pages/OrderListPage.tsx`**

* Includes `"hazardous"` as a selectable option in the Order Type dropdown filter.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

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
A dock is assigned to a shipment inside the **`validateShipment`** function in **`src/dispatch/validation.ts`** (line 38), where the `shipment.dock` property is directly mutated during validation.

---

Key Repository Details

#### 1. Dock Assignment Logic (`src/dispatch/validation.ts`)

```ts

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

**Hazardous orders** (`order.type === "hazardous"`): Assigned dock **`D4`**.
**Non-hazardous orders**: Assigned dock **`D1`**, **`D2`**, or **`D3`** deterministically using the sum of character codes in `order.id` modulo 3 (indexing the `docks` array `["D1", "D2", "D3", "D4"]`).

#### 2. Runtime Execution Flow

1. **User Action**: An operator triggers shipment release from `src/pages/OrderDetailPage.tsx` by clicking **Release shipment**, which invokes the `release(id)` action in `src/store/useWarehouseStore.ts`.

2. **Service Orchestration**: `useWarehouseStore.release` calls `releaseShipment(order, zones, actor)` in `src/dispatch/releaseService.ts`.

3. **Validation & Mutation**: `releaseShipment` creates an unassigned `Shipment` object and passes it to `validateShipment(shipment, order)` (line 30 of `src/dispatch/releaseService.ts`), which sets `shipment.dock` on line 38 of `src/dispatch/validation.ts`.

4. **Order State & Event Emission**:

* `releaseShipment` copies `shipment.dock` onto the released order object as `assignedDock: shipment.dock` (line 35 of `src/dispatch/releaseService.ts`).

* It formats `shipment.dock` into the dispatch audit log detail string (line 44 of `src/dispatch/releaseService.ts`).

* It emits the `"shipment.released"` event on `eventBus` (`src/events/bus.ts`).

5. **Event Listener**: The listener installed in `src/notifications/listener.ts` receives `"shipment.released"` and publishes a notification referencing `shipment.dock`.

6. **UI Rendering**: `src/pages/OrderDetailPage.tsx` renders `order.assignedDock` under the **Dispatch** summary panel (displaying `"Pending validation"` when unassigned) and shows `✓ Released from {order.assignedDock}` when status is `"released"`.

#### 3. Test Coverage

Direct caller tests in `src/tests/validation.test.ts` verify dock selection for non-hazardous orders (`D1`–`D3`) and hazardous orders (`D4`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

