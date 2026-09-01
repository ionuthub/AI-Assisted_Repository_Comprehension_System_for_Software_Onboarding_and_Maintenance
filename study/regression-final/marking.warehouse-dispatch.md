# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 246d8550af4001745a05b5075b91675c1256b6ae8391198de805c0a03511bdbc -->

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
Execution starts in **`index.html`**, which provides the `#root` DOM container and loads the entry module **`src/main.tsx`** via `<script type="module" src="/src/main.tsx"></script>`.

---

Step-by-Step Execution Flow

1. **HTML Document Loader (`index.html`)**

* **Evidence:** `index.html` defines `<div id="root"></div>` and loads `/src/main.tsx`.

2. **Top-Level Module Evaluation (`src/main.tsx`, `src/App.tsx`, `src/store/useWarehouseStore.ts`, `src/stock/stockService.ts`)**

* **Evidence:** Loading `src/main.tsx` synchronously evaluates imported modules before rendering:

* **Router Setup (`src/App.tsx`):** `createBrowserRouter` runs at module scope, registering route definitions for `<Layout />` (`src/components/Layout.tsx`) and child pages (`OrderListPage`, `OrderDetailPage`, `ZoneOverviewPage`, `DispatchLogPage`).

* **Store Instantiation (`src/store/useWarehouseStore.ts`):** `create<WarehouseState>()` runs at module scope, populating initial Zustand state with `seedOrders`, `seedZones`, and `seedLogs` from `src/data/seedData.ts`, setting `initialized: false`, and resetting filters and loading flags.

* **Module-Scope Event Registration (`src/stock/stockService.ts`):** Module evaluation registers a top-level `eventBus.on("stock.low", ...)` listener for low-stock signal collection.

3. **React Mount & DOM Render (`src/main.tsx`, `src/App.tsx`)**

* **Evidence:** `src/main.tsx` calls `ReactDOM.createRoot(document.getElementById("root")!).render()`, mounting `<App />` inside `React.StrictMode`. `<App />` renders `<RouterProvider router={router} />`, which resolves the root path `/` to render `<Layout />` containing `<OrderListPage />`.

4. **React Effect & Runtime Initialization (`src/App.tsx`, `src/notifications/listener.ts`, `src/store/useWarehouseStore.ts`, `src/jobs/revalidation.ts`)**

* **Evidence:** After initial render, `App`'s `useEffect` hook runs:

* **Notification Listener Installation:** `installNotificationListeners()` (`src/notifications/listener.ts`) flags `installed = true` and registers `eventBus` handlers for `"shipment.released"` and `"stock.low"`.

* **Store Initialization:** `initialize()` (`src/store/useWarehouseStore.ts`) sets `initialized: true` to prevent re-execution, then starts two background timers:

1. A `300ms` `window.setInterval` polling interval calling `drainNotifications()` (`src/notifications/service.ts`) to shift queued notifications into store state.

2. A `60,000ms` `window.setInterval` timer via `startRevalidationJob()` (`src/jobs/revalidation.ts`) to periodically revalidate stock reservations against active orders and update store logs for auto-held orders.

* **Cleanup Registration:** `initialize()` attaches a single-use `{ once: true }` `'beforeunload'` event listener on `window` to clear the 300ms notification interval and stop the revalidation job on tab closure.
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
An order is assigned to one or more warehouse zones line-by-line when allocation is triggered. Candidate zones holding matching stock are scored using a rule-based engine, sorted by rank, and assigned stock greedily from highest to lowest score (`src/dispatch/allocator.ts`, `src/config/zoneRules.ts`).

---

Step-by-Step Allocation Flow

#### 1. Invocation and Preparation

**Trigger:** The UI triggers the store action `allocate(id)` in `src/store/useWarehouseStore.ts` (called from `src/pages/OrderListPage.tsx` or `src/pages/OrderDetailPage.tsx`), which retrieves the order and current zones, sets `loadingOrderIds`, and calls `allocateOrder(order, zones)` in `src/dispatch/allocator.ts`.
**Handler Hook:** `allocateOrder()` fetches the order type's dispatch handler via `getHandler(input.type)` from `src/dispatch/handlers/registry.ts`. It invokes `handler.prepare()`, which returns a cloned order with type-specific updates (e.g., adjusting priority or appending notes in `src/dispatch/handlers/expressHandler.ts`, `hazardousHandler.ts`, `bulkHandler.ts`, or `standardHandler.ts`), and `handler.inspect()`, which gathers initial warnings.

#### 2. Candidate Zone Ranking (`src/config/zoneRules.ts`)

For each `OrderLine` in the order, every zone is scored via `scoreZone(zone, prepared, line)`. If `zone.kind` is not in a rule's `zoneKinds` list, `scoreZone` deducts `25` points and skips that rule's `prefer` function. Active zones containing stock for `line.sku` are then filtered and sorted in descending order of score (`src/dispatch/allocator.ts`):

**Rule 1: Hazard Isolation** (`score: 100`, `zoneKinds: ["secure"]`)

* **Applies:** If `order.type === "hazardous"` or `line.hazardous`.

* **Effect:** Returns `+80` points if `zone.kind === "secure"`. Non-secure zones are not in `zoneKinds`, so `scoreZone` deducts `25` points instead of evaluating `prefer` (`src/config/zoneRules.ts`).

**Rule 2: Cold Chain** (`score: 90`, `zoneKinds: ["cold"]`)

* **Applies:** If `line.temperature !== "ambient"`.

* **Effect:** Evaluates `zoneKinds: ["cold"]` zones, returning `+70` points if `zone.temperature === line.temperature` or `-100` if temperatures differ. Non-cold zones deduct `25` points via `scoreZone` (`src/config/zoneRules.ts`).

**Rule 3: Type Routing** (`score: 50`, `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`)

* **Applies:** To all order lines.

* **Effect:** Looks up `zone.kind` position in `typeKinds[order.type]`. Returns `40 - position * 10` for matching kinds (`+40` for index 0, `+30` for index 1) and `-50` for non-matching listed kinds. Omitted kinds (`"cold"`, `"staging"`) deduct `25` points (`src/config/zoneRules.ts`).

**Rule 4: Capacity Balance** (`score: 10`, `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`)

* **Applies:** To all order lines.

* **Effect:** Calculates total used stock in the zone and adds `Math.round((1 - used / zone.capacity) * 20)` points (`src/config/zoneRules.ts`).

#### 3. Greedy Stock Selection (`src/dispatch/allocator.ts`)

For each line item, `allocateOrder` iterates through candidate zones in descending score order.
Available stock per candidate zone item is calculated as `Math.max(0, item.onHand - item.reserved)`.
Quantities are assigned greedily up to `line.quantity`.
If `remaining > 0` after checking all candidate zones, an unallocated warning is pushed to `warnings`.

#### 4. Finalizing Reservations and Store State

**Reservation Updates:** `applyStockReservation()` in `src/stock/reservation.ts` clones the zones structure, caps allocations against current unreserved stock (accounting for existing line allocations), increments `item.reserved` on matching zone stock items, attaches `lotCode`, and appends shortage messages if stock falls short.
**Pricing & Status:** Total order price is calculated via `calculateOrderPrice()` in `src/pricing/pricing.ts`. If every line is 100% fulfilled, `order.status` is set to `"allocated"` and `eventBus.emit("order.allocated", { order })` is called (`src/events/bus.ts`). If any line has unallocated units, `order.status` becomes `"held"` (`src/dispatch/allocator.ts`).
**Store Mutation & Persistence:** `allocate()` in `src/store/useWarehouseStore.ts` persists the updated order via `saveOrder()` (`src/dispatch/orderService.ts`), updates store `orders` and `zones` (reflecting updated `reserved` stock), prepends a new `DispatchLogEntry` ("allocated" or "held") to `logs`, and clears the order's entry from `loadingOrderIds`.
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
An order’s `type` (`standard`, `express`, `bulk`, or `hazardous`) is processed according to logic distributed across five areas:

1. **Type-specific dispatch handlers** (`src/dispatch/handlers/standardHandler.ts`, `src/dispatch/handlers/expressHandler.ts`, `src/dispatch/handlers/bulkHandler.ts`, `src/dispatch/handlers/hazardousHandler.ts`), dynamically loaded and retrieved via `getHandler(type)` in `src/dispatch/handlers/registry.ts`.

2. **Zone routing and scoring rules** in `src/config/zoneRules.ts` (`typeKinds`, `type-routing` rule, and `hazard-isolation` rule).

3. **Pricing strategy mapping and price calculation** in `src/config/zoneRules.ts` (`pricingByType`), `src/pricing/pricing.ts` (`calculateOrderPrice`), and `src/pricing/legacyPricing.ts`.

4. **Shipment validation and dock assignment** in `src/dispatch/validation.ts` (`validateShipment`).

5. **API request interception** in `src/api/interceptors/hazardous-interceptor.ts` (`hazardousInterceptor`).

---

Direct Evidence & Component Breakdown

#### 1. Dispatch Handlers (`src/dispatch/handlers/`)

The handler registry (`src/dispatch/handlers/registry.ts`) uses Vite’s `import.meta.glob("./*.ts")` to dynamically import all sibling handler modules and look up the registered handler by `order.type` via `getHandler(type)`. Each handler implements three methods: `prepare()`, `inspect()`, and `shipmentDefaults()`.

**Standard Handler** (`src/dispatch/handlers/standardHandler.ts`):

* `prepare`: Appends note `"Standard pick wave assigned"`.

* `inspect`: Flags errors if `lines.length === 0` ("Order contains no lines") or if any line has `quantity > 100` ("Large line requires supervisor check").

* `shipmentDefaults`: Defaults carrier to `"Northline Ground"` and calculates `packageCount` as $\max(1, \lceil \text{units} / 12 \rceil)$.

**Express Handler** (`src/dispatch/handlers/expressHandler.ts`):

* `prepare`: Promotes order priority to `"critical"` (`order.priority = "critical"`) and appends note `"Moved to express pick lane"`.

* `inspect`: Calculates time remaining until `dueAt` using `differenceInMinutes`. Returns `["Express service window has elapsed"]` if negative, `["Less than 90 minutes remain"]` if under 90 minutes, or `[]`.

* `shipmentDefaults`: Defaults carrier to `"Apex Priority"` and calculates `packageCount` as $\max(1, \lceil \text{weight} / 20 \rceil)$.

**Bulk Handler** (`src/dispatch/handlers/bulkHandler.ts`):

* `prepare`: Sums line weights and appends note `"Forklift requested for {totalWeight} kg load"`.

* `inspect`: Flags warnings if total units $< 20$ ("Bulk order is below minimum handling quantity") or if `destination.company` is missing ("Receiving company is required").

* `shipmentDefaults`: Defaults carrier to `"Atlas Freight"` and calculates `packageCount` as $\max(1, \lceil \text{weight} / 500 \rceil)$.

**Hazardous Handler** (`src/dispatch/handlers/hazardousHandler.ts`):

* `prepare`: Promotes order priority to `"urgent"` (`order.priority = "urgent"`) and appends note `"Dangerous goods paperwork required"`.

* `inspect`: Flags errors if no order lines have `line.hazardous === true` ("Hazardous order has no regulated line") or if `destination.country !== "US"` ("International dangerous goods review required").

* `shipmentDefaults`: Defaults carrier to `"SecureChem Logistics"` and calculates `packageCount` as $\max(1, \lceil \text{units} / 4 \rceil)$.

#### 2. Zone Routing & Candidate Zone Scoring (`src/config/zoneRules.ts`)

`typeKinds`: Maps each `OrderType` to a prioritized list of zone kinds:

* `standard` $\rightarrow$ `["general", "fast-pick"]`

* `express` $\rightarrow$ `["fast-pick", "general"]`

* `bulk` $\rightarrow$ `["bulk", "general"]`

* `hazardous` $\rightarrow$ `["secure"]`

`type-routing` rule (score: 50): Evaluates `typeKinds[order.type].indexOf(zone.kind)`. Returns `-50` if the zone kind is not in the type's preference list, or $40 - (\text{position} \times 10)$ if present.
`hazard-isolation` rule (score: 100): Applies if `order.type === "hazardous" || line.hazardous`. Grants $+80$ score to `secure` zones and $-100$ to non-secure zones.
Candidate ranking is executed in `allocateOrder()` (`src/dispatch/allocator.ts`) via `scoreZone(zone, prepared, line)`.

#### 3. Pricing Strategy & Fee Calculation (`src/config/zoneRules.ts`, `src/pricing/pricing.ts`, `src/pricing/legacyPricing.ts`)

`pricingByType` (`src/config/zoneRules.ts`): Maps `bulk` to `"legacy"` pricing, and `standard`, `express`, and `hazardous` to `"current"` pricing.
`calculateOrderPrice(order)` (`src/pricing/pricing.ts`): Checks `pricingStrategyFor(order)`:

* For `"legacy"` (`bulk`), calls `calculateLegacyPrice(order)` (`src/pricing/legacyPricing.ts`), computing item subtotal + pallet handling fee ($\max(1, \lceil \text{weight} / 500 \rceil) \times 18.5$) minus volume discounts (7.5% if subtotal $> \$5000$, 4% if subtotal $> \$2000$).

* For `"current"`, calculates item subtotal + weight handling fee ($\max(7.5, \text{weight} \times 0.11)$) + priority surcharge (\$45 for `critical`, \$20 for `urgent`) + hazardous line fee (\$65 if any line is hazardous).

#### 4. Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`)

`validateShipment(shipment, order)` checks `order.type` when validating release criteria:

**Dock Assignment**: Assigns `shipment.dock = "D4"` if `order.type === "hazardous"`; otherwise assigns docks `D1`–`D3` based on a hash of `order.id`.
**Carrier Restriction**: Enforces that if `order.type === "hazardous"`, `shipment.carrier` must be `"SecureChem Logistics"`, generating the error `"Approved dangerous goods carrier required"` if mismatched.

#### 5. Network Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)

`hazardousInterceptor(request)` intercepts outgoing API requests via `applyInterceptors()` (`src/api/interceptors/index.ts`). If `request.body.type === "hazardous"`:

Rewrites API endpoint path from `/orders...` to `/controlled/orders...`.
Attaches header `"x-controlled-load": "true"`.
Sets metadata `routing: "dangerous-goods"`.

#### 6. UI Filtering (`src/pages/OrderListPage.tsx` & `src/store/useWarehouseStore.ts`)

`OrderListPage.tsx` defines the order type select dropdown options `["all", "standard", "express", "bulk", "hazardous"]`.
`filteredOrders()` in `src/store/useWarehouseStore.ts` filters displayed orders by checking `state.filters.type === "all" || order.type === state.filters.type`.

---

Trace of Control Flow Across Operations
**Stock Allocation** (`allocateOrder` in `src/dispatch/allocator.ts`):

1. Retrieves type handler via `await getHandler(input.type)`.

2. Runs `handler.prepare(input)` (modifies priority/notes) and `handler.inspect(prepared)` (collects initial warnings).

3. Evaluates zone candidates per line using `scoreZone()`, which factors in `typeKinds[order.type]`.

4. Calculates order total via `calculateOrderPrice(prepared)` using `pricingStrategyFor(order)`.

**Shipment Release** (`releaseShipment` in `src/dispatch/releaseService.ts`):

1. Retrieves type handler via `await getHandler(order.type)`.

2. Pulls default carrier and packaging count via `handler.shipmentDefaults(order)`.

3. Executes `validateShipment(shipment, order)` from `src/dispatch/validation.ts` to assign dock (`D4` vs `D1`–`D3`) and enforce carrier restrictions for hazardous types.

**Order Save API Call** (`saveOrder` in `src/dispatch/orderService.ts`):

1. Sends `PATCH /orders/:id` via `apiClient.patch`.

2. `applyInterceptors()` runs `hazardousInterceptor`, rerouting hazardous orders to `/controlled/orders`.
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
Stock reservation—defined as calculating and applying reserved stock quantities (`item.reserved`) on zone inventory—is implemented by `applyStockReservation` in `src/stock/reservation.ts` (lines 10–46). In the running production application, stock reservation occurs across **3 distinct execution paths** spanning 2 UI store actions and 1 background job.

---

1. Production Execution Paths
**Order Allocation Flow (`allocateOrder`)**

* **Location:** `src/dispatch/allocator.ts` (line 53 calls `applyStockReservation`).

* **Store Action:** `allocate(id)` in `src/store/useWarehouseStore.ts` (lines 139–174).

* **UI Entry Points:** Triggered by the **"Allocate stock"** button on order cards in `OrderListPage` (`src/pages/OrderListPage.tsx`, line 144) and on the details page in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 74).

**Shipment Release Validation (`releaseShipment`)**

* **Location:** `src/dispatch/releaseService.ts` (line 29 calls `applyStockReservation` to recalculate allocations before release validation).

* **Store Action:** `release(id)` in `src/store/useWarehouseStore.ts` (lines 201–229).

* **UI Entry Point:** Triggered by the **"Release shipment"** button in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 88).

**Background Reservation Revalidation (`revalidateReservations`)**

* **Location:** `src/jobs/revalidation.ts` (line 19 calls `applyStockReservation` for active orders after resetting zone reservations).

* **Job Runner:** `startRevalidationJob` in `src/jobs/revalidation.ts` (lines 50–61), started inside store `initialize()` (`src/store/useWarehouseStore.ts`, lines 118–130), which runs on mount in `App.tsx` (lines 25–28).

---

2. Test-Only Execution Sites
**Direct Unit Tests:** `src/tests/reservation.test.ts` (lines 23 and 32) directly calls `applyStockReservation` to test stock incrementing and shortage handling.
**Indirect Integration Tests:** `src/tests/allocation.test.ts` (lines 17, 28, and 37) calls `allocateOrder`, which invokes `applyStockReservation`.

---

3. Excluded Non-Reserving Operations
**Initial Seed Baseline (Initialization):** `seedZones` in `src/data/seedData.ts` (lines 292–365) sets static starting values for `reserved` inventory.
**Revalidation Stock Reset (Reset):** `revalidateReservations` in `src/jobs/revalidation.ts` (lines 13–15) sets `reserved: 0` across zones to establish a clean baseline immediately before re-applying reservations.
**Stock Release Decrement (Consumption):** `commitReleasedStock` in `src/stock/stockService.ts` (lines 17–38) decrements both `onHand` and `reserved` stock (`item.reserved = Math.max(0, item.reserved - allocation.quantity)`) when a shipment is physically committed and dispatched.
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
Before an outgoing API request is sent to `handleRequest` in `src/api/mock-server.ts`, `apiClient` constructs an initial `ApiRequest` object and asynchronously pipes it through three sequential request interceptors in `applyInterceptors` (`src/api/api-client.ts`, `src/api/interceptors/index.ts`).

---

Step-by-Step Flow

#### 1. Request Object Construction

When an HTTP request method (`get`, `post`, or `patch`) on `apiClient` is invoked (`src/api/api-client.ts`), the internal `request` function builds an initial `ApiRequest` object:

**`path`**: Provided route string (e.g., `/orders` or `/orders/{id}`).
**`method`**: `"GET"`, `"POST"`, or `"PATCH"`.
**`body`**: Payload passed to `post` or `patch`, or `undefined` for `get`.
**`headers`**: Initialized with `{ accept: "application/json" }`.
**`metadata`**: Initialized as an empty object `{}`.

#### 2. Interceptor Pipeline Execution

The request is passed to `applyInterceptors` (`src/api/interceptors/index.ts`), which sequentially applies the array of interceptors:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

* Copies existing headers and appends `authorization: "Bearer warehouse-console-session"`.

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

* Appends an `x-requested-at` header set to `new Date().toISOString()`.

* Preserves existing metadata while adding `source: "dispatch-console"` and a unique `correlationId` generated via `crypto.randomUUID()`.

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

* Inspects `request.body` (typed as `Partial<Order>`).

* If `body?.type === "hazardous"`:

* Replaces `/orders` in `path` with `/controlled/orders`.

* Adds the header `"x-controlled-load": "true"`.

* Adds `routing: "dangerous-goods"` to `metadata`.

* If `body` is omitted or `body?.type !== "hazardous"`, returns the request object unmodified.

#### 3. Delivery to Mock Handler

`applyInterceptors` returns the fully transformed request object, which `request` in `src/api/api-client.ts` passes to `handleRequest<TResponse>(intercepted)` in `src/api/mock-server.ts`.

---

Grounding & Direct Evidence
**Initial Request Assembly & Dispatch**: `src/api/api-client.ts`
**Interceptor Chain & Registration**: `src/api/interceptors/index.ts`
**Interceptor Definitions & Transformations**: `src/api/interceptors/auth-interceptor.ts`, `src/api/interceptors/audit-interceptor.ts`, and `src/api/interceptors/hazardous-interceptor.ts`
**Mock Server Entry Point**: `src/api/mock-server.ts`
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
`validateShipment` is not a strictly read-only check function. In addition to performing validation checks, it directly mutates the passed `shipment` parameter by assigning its `dock` property (`src/dispatch/validation.ts`). It does not mutate global application state or Zustand store state directly inside the function.

Direct Mutation Behaviour (`src/dispatch/validation.ts`)

At the end of execution—unconditionally, regardless of whether validation errors or warnings are found—`validateShipment` calculates and assigns `shipment.dock`:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

If `order.type` is `"hazardous"`, `shipment.dock` is set to `"D4"`.
Otherwise, it calculates a modulo index over the array `["D1", "D2", "D3", "D4"]` using `numeric % 3`, assigning `"D1"`, `"D2"`, or `"D3"`.
Downstream Impact and Runtime Reach

1. **Release Service (`src/dispatch/releaseService.ts`)**

In `releaseShipment`, `validateShipment` is called on the local `shipment` object. The assigned `shipment.dock` property is subsequently read to build the updated `Order` (`assignedDock: shipment.dock`) and the dispatch audit log detail (`${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}`).

2. **Zustand Store (`src/store/useWarehouseStore.ts`)**

When the `release` action runs in the warehouse store, it calls `releaseShipment`. The returned `releasedOrder` (containing `assignedDock`) and `log` entry are saved via `saveOrder` and committed to the Zustand store's `orders` and `logs` arrays.

3. **Unit Tests (`src/tests/validation.test.ts`)**

Tests verify this mutation directly by passing a `candidate` shipment object into `validateShipment` and asserting on `candidate.dock` (e.g., `expect(candidate.dock).toMatch(/^D[1-3]$/)` and `expect(candidate.dock).toBe("D4")`).
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
For a bulk order, **`calculateLegacyPrice`** (in `src/pricing/legacyPricing.ts`) runs.

---

Selection & Dispatch Flow

1. **Configuration Lookup (`src/config/zoneRules.ts`)**:

`pricingStrategyFor(order)` checks the `pricingByType` map using the order's `type` field. For orders where `type === "bulk"`, `pricingByType` evaluates to `"legacy"`:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

2. **Pricing Dispatch (`src/pricing/pricing.ts`)**:

When `calculateOrderPrice(order)` is called (such as during stock allocation in `src/dispatch/allocator.ts`), it evaluates `pricingStrategyFor(order)`. When the strategy is `"legacy"`, it immediately invokes and returns `calculateLegacyPrice(order)`:

```ts

export function calculateOrderPrice(order: Order): number {

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

// ...

}

```

---

Selected Implementation Calculation Behaviour (`src/pricing/legacyPricing.ts`)

Instead of using the standard pricing formula (which includes fixed handling, priority surcharges, and hazardous fees), `calculateLegacyPrice` performs the following calculation:

**Subtotal**: Sums `line.quantity * line.unitPrice` across all order lines.
**Pallet Handling**: Calculates pallet count by taking total order weight (`line.quantity * line.weightKg`), dividing by 500, rounding up, and enforcing a minimum of 1 pallet (`Math.max(1, Math.ceil(totalWeight / 500))`). Handling is charged at **$18.50 per pallet**.
**Volume Discount**: Applies a tiered discount to the subtotal:

- **7.5%** if subtotal > $5,000

- **4.0%** if subtotal > $2,000 (and ≤ $5,000)

- **0%** otherwise

**Total**: Returns `Number((subtotal + handling - volumeDiscount).toFixed(2))`.
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
When a dispatch or warehouse event is emitted on the event bus (`eventBus` in `src/events/bus.ts`), reactions are determined by registered event listeners. Two emitted event types trigger active listeners, and two emitted event types have no listeners:

1. **`shipment.released`**:

* **Notification Listener** (`src/notifications/listener.ts`): Reacts by calling `publishNotification()` (`src/notifications/service.ts`) to create a `success`-level notification recording that the order was released with package count and dock details.

2. **`stock.low`**:

* **Notification Listener** (`src/notifications/listener.ts`): Reacts by calling `publishNotification()` (`src/notifications/service.ts`) to create a `warning`-level notification with the remaining SKU quantity and zone ID.

* **Stock Service Listener** (`src/stock/stockService.ts`): Reacts by prepending the low-stock detail string (`"${sku} in ${zoneId}: ${available} available"`) to the module-level `lowStockSignals` array, dropping entries beyond 20.

3. **`order.allocated`** and **`notification.created`**:

* **No Listeners**: Neither event has any registered subscriber on `eventBus`.

---

Control Flow and Detailed Repository Details

#### 1. Registration Timing and Listener Lifecycle

**Module Evaluation**: The `stock.low` listener in `src/stock/stockService.ts` registers immediately when `stockService.ts` is evaluated during module load.
**React Effect Phase**: The notification listeners in `src/notifications/listener.ts` (`shipment.released` and `stock.low`) register when `installNotificationListeners()` is invoked inside the `useEffect` hook of `App` (`src/App.tsx`). A module-level `installed` guard prevents duplicate registration.

#### 2. Complete Event Flow Traces

##### Event: `shipment.released`

**Emitter**: `releaseShipment()` in `src/dispatch/releaseService.ts` after successful stock release validation and stock commitment.
**Payload**: `{ order: Order, shipment: Shipment }`
**Listener**: `src/notifications/listener.ts`
**Runtime Effect**:

1. Executes `publishNotification()` in `src/notifications/service.ts`.

2. Creates a notification object (`level: "success"`, `title: "Order <id> released"`).

3. Unshifts the object into the `pending` array in `src/notifications/service.ts` and emits `notification.created` (which has no listeners).

4. The 300ms polling timer initiated by `initialize()` in `src/store/useWarehouseStore.ts` calls `drainNotifications()`, moving the item into the store's `notifications` state (capped at 8 items).

5. The UI renders the toast notification via `<Toasts />` (`src/components/Toasts.tsx`).

##### Event: `stock.low`

**Emitter**: `commitReleasedStock()` in `src/stock/stockService.ts` when a released stock deduction leaves available units (`onHand - reserved`) at or below the item's `reorderPoint`.
**Payload**: `{ sku: string, zoneId: string, available: number }`
**Listeners**:

1. `src/notifications/listener.ts`: Calls `publishNotification()` to add a `warning`-level notification (`"Low stock: <sku>"`). Downstream timer polling drains this into store state for UI toast display.

2. `src/stock/stockService.ts`: Unshifts `"<sku> in <zoneId>: <available> available"` into `lowStockSignals`. If array length exceeds 20, `pop()` removes the oldest entry. The values are exposed via `getLowStockSignals()`.

##### Event: `order.allocated`

**Emitter**: `allocateOrder()` in `src/dispatch/allocator.ts` when an order's required line quantities are completely fulfilled (`complete === true`).
**Payload**: `{ order: Order }`
**Listeners**: None (`0` registered listeners in `eventBus`).

##### Event: `notification.created`

**Emitter**: `publishNotification()` in `src/notifications/service.ts`.
**Payload**: `{ notification: Notification }`
**Listeners**: None (`0` registered listeners in `eventBus`).

---

Evidence Summary

| File Path | Direct Evidence | Inference |

| :--- | :--- | :--- |

| `src/events/bus.ts` | Defines `WarehouseEvents` interface and `EventBus` map/listener execution logic. | N/A |

| `src/notifications/listener.ts` | Registers `eventBus.on("shipment.released", ...)` and `eventBus.on("stock.low", ...)`. | N/A |

| `src/stock/stockService.ts` | Registers `eventBus.on("stock.low", ...)` at top-level scope; emits `stock.low` in `commitReleasedStock()`. | N/A |

| `src/dispatch/releaseService.ts` | Emits `shipment.released` upon completing shipment release. | N/A |

| `src/dispatch/allocator.ts` | Emits `order.allocated` when order lines are completely allocated. | N/A |

| `src/notifications/service.ts` | Emits `notification.created` when adding notifications to `pending`. | N/A |

| `src/App.tsx` | Calls `installNotificationListeners()` inside `useEffect`. | Listener attachment timing is tied to component mount. |

| `src/store/useWarehouseStore.ts` | Periodically drains `pending` notifications via `setInterval(..., 300)`. | Store notification sync relies on interval polling rather than `notification.created` event bus subscriptions. |
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
To add a new order type, you must update the domain type union, add a new dispatch handler module, update zone scoring and pricing maps, and add the option to the UI order filters. Depending on requirements, conditional updates to shipment validation, API interceptors, pricing, and seed data may also be needed.

---

Required Code Changes

1. **Domain Type Definition (`src/types/domain.ts`)**

Add the new order type string to the `OrderType` union export:

```ts

export type OrderType = "standard" | "express" | "bulk" | "hazardous" | "your-new-type";

```

2. **Dispatch Handler Registration (`src/dispatch/handlers/`)**

Create a new handler file in `src/dispatch/handlers/` matching the pattern of existing handlers like `src/dispatch/handlers/standardHandler.ts` or `src/dispatch/handlers/expressHandler.ts`. Call `registerHandler` from `src/dispatch/handlers/registry.ts`:

```ts

import { registerHandler } from "./registry";

registerHandler({

type: "your-new-type",

prepare(order) { return order; },

inspect(order) { return []; },

shipmentDefaults(order) {

return { carrier: "Carrier Name", packageCount: 1 };

},

});

```

*Runtime context:* `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`) both invoke `getHandler(order.type)`. `src/dispatch/handlers/registry.ts` automatically discovers and loads all `.ts` files in `src/dispatch/handlers/` via `import.meta.glob("./*.ts")`. If no handler is registered for an `OrderType`, `getHandler` throws a runtime error.

3. **Zone Routing & Pricing Configuration (`src/config/zoneRules.ts`)**

`typeKinds` and `pricingByType` are declared as `Record<OrderType, ...>`. Adding a type to `OrderType` creates TypeScript compilation errors until both record maps are updated:

- **`typeKinds`**: Map the new order type to its ordered array of preferred zone kinds (`"general"`, `"fast-pick"`, `"bulk"`, `"secure"`, `"cold"`). `scoreZone` uses this to rank inventory zones during allocation.

- **`pricingByType`**: Map the new order type to either `"current"` or `"legacy"` pricing strategies.

4. **UI Filter Options (`src/pages/OrderListPage.tsx`)**

Add the new order type to the hardcoded `types` array so operators can select it in the status/type toolbar dropdown:

```ts

const types: Array<Order["type"] | "all"> = [

"all",

"standard",

"express",

"bulk",

"hazardous",

"your-new-type",

];

```

---

Conditional & Rule-Specific Changes
**Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`)**

If the new order type requires specific dock assignments or restricted carriers (similar to how `hazardous` enforces carrier `"SecureChem Logistics"` and dock `"D4"`), update `validateShipment()`.

**API Request Interceptors (`src/api/interceptors/index.ts`)**

If requests for the new order type require modified paths or headers (similar to `src/api/interceptors/hazardous-interceptor.ts`), create a new interceptor and append it to the `interceptors` list in `src/api/interceptors/index.ts`.

**Pricing Engine (`src/pricing/pricing.ts` & `src/config/zoneRules.ts`)**

If neither existing strategy (`"current"` or `"legacy"`) applies, add a new variant to `PricingStrategy` in `src/config/zoneRules.ts` and handle it in `calculateOrderPrice()` in `src/pricing/pricing.ts`.

**Seed Data & Unit Tests (`src/data/seedData.ts` & `src/tests/`)**

Add mock order definitions to `orderSpecs` in `src/data/seedData.ts` and add unit tests in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, or `src/tests/validation.test.ts`.
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
Changing `src/config/zoneRules.ts` directly impacts candidate zone scoring during stock allocation and pricing strategy resolution during order pricing.

---

1. Direct Imports and Code Consumers
**`scoreZone`** (imported in `src/dispatch/allocator.ts`):

Called inside `allocateOrder` to compute candidate zone scores for each line of an incoming or held order (`zones.map(zone => ({ zone, score: scoreZone(zone, prepared, line) }))`).

**`pricingStrategyFor`** (imported in `src/pricing/pricing.ts` and `src/tests/pricing.test.ts`):

Called in `calculateOrderPrice` (`src/pricing/pricing.ts`) to determine whether an order uses `"legacy"` or `"current"` pricing rules. It is also called directly in unit tests (`src/tests/pricing.test.ts`).

**Internal Rule Engine (`src/config/zoneRules.ts`)**:

`rulesFor` filters the `zoneRules` array (`hazard-isolation`, `cold-chain`, `type-routing`, `capacity-balance`) via `rule.applies(order, line)` and orders them by `score` descending. `scoreZone` then evaluates `rule.prefer(zone, order, line)` for each rule, applying a `-25` penalty whenever `zone.kind` is missing from `rule.zoneKinds`.

---

2. Downstream System and Runtime Impact

#### Order Stock Allocation & Inventory Selection

**Candidate Zone Ranking (`src/dispatch/allocator.ts`)**: `allocateOrder` filters candidates to active zones containing the line's SKU, then sorts them descending by `scoreZone` result. A change to rule weights, predicates (`applies`), or zone preferences (`prefer`) alters candidate priority (such as standard vs. express vs. hazardous routing).
**Lot Assignment and Quantity Splits (`src/dispatch/allocator.ts` & `src/stock/reservation.ts`)**: Stock is drawn sequentially from candidate zones in score order. Reordering candidate zones changes which physical `zoneId` and `lotCode` supply each allocation line.
**Shortage Warnings & Hold Status (`src/dispatch/allocator.ts`)**: If a rule change penalizes zones that hold available stock, lines may fail to fully allocate. `allocateOrder` appends shortage warnings (`${line.sku} has ${remaining} unallocated units`), sets `order.status = "held"` instead of `"allocated"`, and skips emitting the `"order.allocated"` event.

#### Order Pricing & Valuation

**Pricing Dispatch (`src/pricing/pricing.ts`)**: `pricingStrategyFor` maps `order.type` via `pricingByType`.

* If `"legacy"`: `calculateOrderPrice` delegates to `calculateLegacyPrice` (`src/pricing/legacyPricing.ts`), applying pallet handling ($18.50 per 500 kg) and volume discounts (4% over $2,000; 7.5% over $5,000).

* If `"current"`: Calculates standard subtotal + weight handling (`Math.max(7.5, weight * 0.11)`) + priority fee ($45 critical / $20 urgent) + hazardous fee ($65).

**Order Totals (`src/dispatch/allocator.ts`)**: `allocateOrder` assigns `order.total = calculateOrderPrice(prepared)`.

#### Event Bus & State Store

**Store Mutation (`src/store/useWarehouseStore.ts`)**: `allocate` calls `allocateOrder`, then updates Zustand state (`orders`, reserved inventory in `zones`), and prepends a new audit record to `logs` with action `"allocated"` or `"held"`.
**Events (`src/events/bus.ts` & `src/dispatch/allocator.ts`)**: When an order fully allocates, `allocateOrder` emits `"order.allocated"`. (Note: no registered listener currently consumes `"order.allocated"`).

#### UI Components & Operational Pages

**Order List & Detail Views (`src/components/OrderCard.tsx`, `src/pages/OrderDetailPage.tsx`, `src/components/Layout.tsx`)**: Displays updated `order.total`, status badges (`allocated` vs `held`), allocation progress bars, line-item `zoneId` chips, and sidebar counters for ready orders.
**Zone Inventory Monitoring (`src/components/ZoneCard.tsx`, `src/pages/ZoneOverviewPage.tsx`)**: Re-ordered allocations alter reserved stock levels (`reserved`), available positions (`onHand - reserved`), capacity utilization percentages, and reorder point alerts.
**Dispatch Log (`src/pages/DispatchLogPage.tsx`)**: Displays audit entries logged as `"allocated"` or `"held"`.

#### Downstream Shipment Release

**Shipment Commits (`src/dispatch/releaseService.ts` & `src/stock/stockService.ts`)**: When an order in `"ready"` status is released, `releaseShipment` consumes the stored `order.allocations` generated during allocation. It passes them to `commitReleasedStock`, which permanently deducts `onHand` and `reserved` stock from the specified zones and emits `"stock.low"` when available stock drops to or below `reorderPoint` (which is consumed by `src/notifications/listener.ts`).

---

3. Test Suite Impact
**`src/tests/allocation.test.ts`**:

* Asserts express orders prefer fast-pick zone `ZB-02`.

* Asserts hazardous SKU `CL-900` routes exclusively to controlled zone `ZS-04`.

* Asserts orders transition to `"held"` when inventory is insufficient.

**`src/tests/pricing.test.ts`**:

* Asserts `pricingStrategyFor` returns `"legacy"` for `bulk` orders.

* Asserts handling fee and dangerous goods surcharge calculations for standard and hazardous orders.
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
Yes. Hazardous orders (orders with `type === "hazardous"`) and hazardous order lines (`line.hazardous === true`) are treated differently across six areas of the application: API request interceptors, dispatch handler processing, zone routing and allocation scoring, pricing calculations, shipment validation with dock assignment, and UI display and filtering.

---

1. API Interception & Request Routing
**Files:** `src/api/interceptors/hazardous-interceptor.ts`, `src/api/interceptors/index.ts`, `src/api/mock-server.ts`
**Behavior:** When `saveOrder` executes via `apiClient.patch` (`src/dispatch/orderService.ts`), `applyInterceptors` executes `hazardousInterceptor`. When `request.body.type === "hazardous"`, the interceptor transforms the request:

* Replaces `/orders` in `request.path` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets request metadata `routing: "dangerous-goods"`.

* *Mock server response:* `handleRequest` in `src/api/mock-server.ts` uses `normalizedPath` to strip `/controlled/orders` back to `/orders` before matching records.

---

2. Hazardous Dispatch Handler Operations
**Files:** `src/dispatch/handlers/hazardousHandler.ts`, `src/dispatch/handlers/registry.ts`, `src/dispatch/allocator.ts`, `src/dispatch/releaseService.ts`
**Behavior:** When `allocateOrder` or `releaseShipment` runs for an order with `type === "hazardous"`, `getHandler("hazardous")` dynamically loads and returns the registered hazardous handler:

* **Preparation (`prepare`):** Forces `order.priority` to `"urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.

* **Inspection (`inspect`):** Returns inspection warnings if no line item has `line.hazardous === true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **Shipment Defaults (`shipmentDefaults`):** Sets the default carrier to `"SecureChem Logistics"` and calculates `packageCount` as `Math.max(1, Math.ceil(units / 4))` (1 package per 4 units).

---

3. Inventory Zone Routing & Allocation Scoring
**Files:** `src/config/zoneRules.ts`, `src/dispatch/allocator.ts`
**Behavior:** During stock allocation in `allocateOrder`:

* `typeKinds.hazardous` restricts eligible zone kinds to `["secure"]`.

* The `hazard-isolation` rule (score 100) applies when `order.type === "hazardous"` or `line.hazardous === true`. It awards secure zones (`kind: "secure"`, such as `ZS-04`) a `+80` preference score and penalizes non-secure zones with `-100`.

* The `type-routing` rule (score 50) evaluates `typeKinds["hazardous"]`. Secure zones receive a `+40` score, while all non-secure zones receive a `-50` penalty.

* Non-secure zones also incur a `-25` penalty because they are not included in `rule.zoneKinds` (`["secure"]`).

---

4. Pricing Calculation & Surcharges
**Files:** `src/config/zoneRules.ts`, `src/pricing/pricing.ts`
**Behavior:** `calculateOrderPrice` evaluates pricing for non-legacy orders using strategy `"current"` (from `pricingByType.hazardous`):

* Checks line items via `order.lines.some((line) => line.hazardous)`.

* Adds a flat `$65.00` `hazardousFee` to the order total whenever any line is marked hazardous.

---

5. Shipment Validation & Dock Assignment
**Files:** `src/dispatch/validation.ts`, `src/dispatch/releaseService.ts`
**Behavior:** During release validation in `releaseShipment`:

* `validateShipment` requires `shipment.carrier` to be `"SecureChem Logistics"` for orders where `order.type === "hazardous"`. Any other carrier appends the validation error `"Approved dangerous goods carrier required"`.

* Hardcodes `shipment.dock` to `"D4"` for hazardous orders, whereas non-hazardous orders are assigned docks `D1`–`D3` based on a hash of the order ID.

---

6. UI Display & Filtering
**Files:** `src/pages/OrderDetailPage.tsx`, `src/pages/OrderListPage.tsx`
**Behavior:**

* **Line Badge:** In `OrderDetailPage.tsx`, line items where `line.hazardous === true` render a red `Controlled` badge (`<em>Controlled</em>`) next to the SKU description.

* **Filter Option:** In `OrderListPage.tsx`, the order type dropdown includes `"hazardous"` as an selectable filter option to isolate hazardous orders in the view grid.
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
A dock is assigned to a shipment inside the `validateShipment` function in `src/dispatch/validation.ts` (lines 34–36), where `shipment.dock` is directly mutated during shipment validation.

Repository Details and Propagation Flow

1. **Assignment Implementation (`src/dispatch/validation.ts`)**

- Direct evidence: `validateShipment` calculates a character code sum (`numeric`) from `order.id`.

- If `order.type === "hazardous"`, `shipment.dock` is assigned `"D4"`.

- For non-hazardous orders, `shipment.dock` is assigned by indexing `docks[numeric % 3]`, which selects between `"D1"`, `"D2"`, or `"D3"` from `const docks = ["D1", "D2", "D3", "D4"]` (line 10).

2. **Runtime Production Call Site (`src/dispatch/releaseService.ts`)**

- Direct evidence: `releaseShipment` calls `validateShipment(shipment, order)` at line 30.

- Upon successful validation, `releaseShipment` copies `shipment.dock` to `releasedOrder.assignedDock` (line 36) and includes `shipment.dock` in the dispatch log detail string (line 43).

- `releaseShipment` then emits the `"shipment.released"` event containing both `order` and `shipment` via `eventBus.emit` (line 55).

3. **Downstream Event & UI Consumers**

- Direct evidence: The event listener in `src/notifications/listener.ts` (lines 10–16) reads `shipment.dock` from `"shipment.released"` payloads to publish a loading notification.

- Direct evidence: `src/pages/OrderDetailPage.tsx` (lines 104, 233) displays `order.assignedDock` in the dispatch overview panel and header status once released.

4. **Test Call Sites (`src/tests/validation.test.ts`)**

- Direct evidence: `validateShipment` is also invoked directly in unit tests (lines 29, 44) to assert that standard ready shipments receive docks matching `/^D[1-3]$/` and hazardous shipments are routed to `"D4"`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

