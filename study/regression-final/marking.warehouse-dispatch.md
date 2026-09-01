# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 4821d1cb79e595cd8de4481657566ef3bd5866a57fe2ba1c0da8abd2c199a476 -->

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
Execution starts in **`index.html`**, which loads the application module via `<script type="module" src="/src/main.tsx"></script>` (`index.html`).

---

Execution Flow

#### 1. HTML Loading & Module Evaluation

**`index.html`**: The browser parses `index.html`, providing the `<div id="root"></div>` container and triggering module loading through `<script type="module" src="/src/main.tsx"></script>` (`index.html`).
**`src/main.tsx`**: Top-level imports execute, loading React, ReactDOM, global styles (`src/styles.css`), and `App` (`src/App.tsx`). `main.tsx` finds `#root` in the DOM and calls `ReactDOM.createRoot(...).render(...)` to mount `<App />` inside `<React.StrictMode>` (`src/main.tsx`).

#### 2. Component Setup & Routing

**`src/App.tsx`**: Module evaluation creates the React Router instance via `createBrowserRouter` defining the root layout (`<Layout />`) and route hierarchy (`/`, `orders/:orderId`, `zones`, `log`). When `<App />` renders, it returns `<RouterProvider router={router} />` (`src/App.tsx`).

#### 3. Post-Mount Effects & Runtime Services

When `<App />` mounts, its `useEffect` hook fires (`src/App.tsx`), initializing background services:

1. **`installNotificationListeners()` (`src/notifications/listener.ts`)**: Sets a flag to prevent duplicate calls and registers event handlers on `eventBus` for `"shipment.released"` and `"stock.low"` (`src/notifications/listener.ts`).

2. **`initialize()` (`src/store/useWarehouseStore.ts`)**:

* Guarded by `get().initialized`, sets `initialized: true`.

* Starts a `300ms` `window.setInterval` that polls and drains queued notifications from `drainNotifications()` into Zustand state (`src/store/useWarehouseStore.ts`, `src/notifications/service.ts`).

* Calls `startRevalidationJob()`, establishing a `60,000ms` `window.setInterval` that periodically executes `revalidateReservations()` against store state (`src/store/useWarehouseStore.ts`, `src/jobs/revalidation.ts`).

* Attaches a `{ once: true }` listener for the browser `beforeunload` event to clear the notification polling and revalidation timers (`src/store/useWarehouseStore.ts`).
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
An order is assigned to warehouse zones through a multi-step allocation process triggered when an operator initiates stock allocation. Candidate storage zones are ranked per order line using zone scoring rules, stock is greedily assigned across sorted zones, and inventory reservations are updated in state.

---

Step-by-Step Assignment Flow

#### 1. Trigger and Dispatch Handler Preparation

Allocation begins when `allocate(id)` in `src/store/useWarehouseStore.ts` is invoked (e.g., via the UI in `src/pages/OrderListPage.tsx` or `src/pages/OrderDetailPage.tsx`). It passes the order and current zones to `allocateOrder()` in `src/dispatch/allocator.ts`:

`allocateOrder()` dynamically retrieves the order type's dispatch handler (`standard`, `express`, `bulk`, or `hazardous`) via `getHandler(input.type)` in `src/dispatch/handlers/registry.ts`.
The handler prepares a cloned order (`handler.prepare()`), which appends type-specific audit notes (e.g., `standardHandler.ts`, `expressHandler.ts`, `bulkHandler.ts`, `hazardousHandler.ts`) and may alter order priority (e.g., `express` is set to `"critical"`, `hazardous` is set to `"urgent"`).
The handler runs static inspection warnings (`handler.inspect()`).

#### 2. Candidate Zone Ranking (`scoreZone`)

For each line item in `prepared.lines`, `allocateOrder()` filters zones to those that are `active` and contain a stock item matching `line.sku`. It computes a total score for each candidate zone via `scoreZone(zone, prepared, line)` from `src/config/zoneRules.ts` and sorts candidates in descending order by score.

`scoreZone()` evaluates rules returned by `rulesFor()` (sorted descending by rule `score`):

**Hazard Isolation** (`score: 100`, `zoneKinds: ["secure"]`): Applies if `order.type === "hazardous"` or `line.hazardous`. Prefers `zone.kind === "secure"` with `+80`, otherwise `-100`.
**Cold Chain** (`score: 90`, `zoneKinds: ["cold"]`): Applies if `line.temperature !== "ambient"`. Prefers matching `zone.temperature === line.temperature` with `+70`, otherwise `-100`.
**Type Routing** (`score: 50`, `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`): Prefers zone kinds mapped by `typeKinds[order.type]`:

* `standard`: `["general", "fast-pick"]` (index 0 gets `+40`, index 1 gets `+30`)

* `express`: `["fast-pick", "general"]` (index 0 gets `+40`, index 1 gets `+30`)

* `bulk`: `["bulk", "general"]` (index 0 gets `+40`, index 1 gets `+30`)

* `hazardous`: `["secure"]` (index 0 gets `+40`)

* Unlisted zone kinds receive `-50`.

**Capacity Balance** (`score: 10`, `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`): Prefers zones with lower stock utilization: `Math.round((1 - used / zone.capacity) * 20)`.
**Zone Kind Mismatch Penalty**: For every rule evaluated by `scoreZone`, if `zone.kind` is not included in `rule.zoneKinds`, `scoreZone` subtracts `25` points from the cumulative total.

#### 3. Greedy Stock Allocation

`allocateOrder()` iterates through the sorted candidate zones for each line:

Calculates available unreserved stock in the zone: `available = Math.max(0, item.onHand - item.reserved)`.
Allocates `quantity = Math.min(remaining, available)` from the zone stock item.
Pushes a proposed `Allocation` record containing `lineId`, `sku`, `zoneId`, `quantity`, `reservedAt` (ISO timestamp), and `lotCode` from the zone stock item.
Subtracts allocated quantity from `remaining`. If `remaining > 0` after checking all candidate zones, a shortage warning is recorded (`"${line.sku} has ${remaining} unallocated units"`).

#### 4. Stock Reservation & Store State Update

Once proposed allocations are assembled:

`applyStockReservation()` in `src/stock/reservation.ts` validates proposed allocations against current zone stock, increments `item.reserved` on matching zone inventory, attaches `lotCode`, and returns updated zones alongside any shortages.
Order total is calculated via `calculateOrderPrice(prepared)` in `src/pricing/pricing.ts` (using legacy pricing for `bulk` orders or current pricing for `standard`, `express`, and `hazardous` orders per `pricingStrategyFor()` in `src/config/zoneRules.ts`).
Status Determination & Events:

* If every line item quantity is fully matched by allocations, order status becomes `"allocated"` and `allocateOrder()` emits `order.allocated` on `eventBus` (`src/events/bus.ts`). Note: Currently, no listeners in the codebase are subscribed to `order.allocated`.

* If unallocated units or reservation shortages remain, order status becomes `"held"`.

Persistence & State Sync:

* The updated order is saved via `saveOrder()` in `src/dispatch/orderService.ts` (calling `apiClient.patch()`).

* `useWarehouseStore.ts` updates Zustand state fields: replaces the order in `state.orders`, updates `state.zones` with reserved quantities, prepends a new entry to `state.logs` (`"allocated"` or `"held"`), and removes the order ID from `state.loadingOrderIds`.
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
The code that decides how a given order type is processed consists of four distinct systems across the repository:

1. Dynamic Dispatch Handlers (`src/dispatch/handlers/`)

The primary system for order-type-specific logic is the handler registry and concrete handlers in `src/dispatch/handlers/`:

**Handler Registry (`src/dispatch/handlers/registry.ts`)**: `getHandler(type)` dynamically imports all sibling module files via `import.meta.glob("./*.ts")` to auto-register handlers, then returns the `DispatchHandler` registered for `order.type`.
**Concrete Handlers**:

* **Standard (`src/dispatch/handlers/standardHandler.ts`)**: Appends `"Standard pick wave assigned"` note in `prepare()`; checks for zero lines or quantities > 100 in `inspect()`; defaults carrier to `"Northline Ground"` and packages to $\lceil\text{units}/12\rceil$ in `shipmentDefaults()`.

* **Express (`src/dispatch/handlers/expressHandler.ts`)**: Sets priority to `"critical"` and appends `"Moved to express pick lane"` note in `prepare()`; checks due-time remaining in `inspect()`; defaults carrier to `"Apex Priority"` and packages to $\lceil\text{weight}/20\rceil$ in `shipmentDefaults()`.

* **Bulk (`src/dispatch/handlers/bulkHandler.ts`)**: Appends forklift requirement note in `prepare()`; checks for total units $< 20$ or missing destination company in `inspect()`; defaults carrier to `"Atlas Freight"` and packages to $\lceil\text{weight}/500\rceil$ in `shipmentDefaults()`.

* **Hazardous (`src/dispatch/handlers/hazardousHandler.ts`)**: Sets priority to `"urgent"` and appends `"Dangerous goods paperwork required"` note in `prepare()`; verifies presence of a hazardous line and checks destination country in `inspect()`; defaults carrier to `"SecureChem Logistics"` and packages to $\lceil\text{units}/4\rceil$ in `shipmentDefaults()`.

#### Execution Points for Handlers:

**Allocation (`src/dispatch/allocator.ts`)**: `allocateOrder` calls `getHandler(input.type)` to run `prepare()` (modifying the order before stock matching) and `inspect()` (collecting initial warnings).
**Release (`src/dispatch/releaseService.ts`)**: `releaseShipment` calls `getHandler(order.type)` to populate fallback carrier and package count defaults via `shipmentDefaults()`.

---

2. Zone Routing & Pricing Configuration (`src/config/zoneRules.ts`)
**Zone Selection (`typeKinds` & `type-routing` rule)**: `typeKinds` defines ordered zone kind preferences per order type:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

`scoreZone()` uses this in `rulesFor()` to calculate candidate zone scores during allocation in `src/dispatch/allocator.ts`. (Note: `hazard-isolation` also directly checks `order.type === "hazardous"` to prefer `secure` zones).

**Pricing Strategy Selection (`pricingByType` & `pricingStrategyFor`)**: Maps `bulk` to the `"legacy"` pricing strategy (`src/pricing/legacyPricing.ts`) and all other types (`standard`, `express`, `hazardous`) to `"current"`. `calculateOrderPrice()` in `src/pricing/pricing.ts` invokes `pricingStrategyFor(order)` to decide which calculation engine to execute.

---

3. Shipment & Dock Validation (`src/dispatch/validation.ts`)

In `validateShipment()`:

**Dock Assignment**: Hazardous orders (`order.type === "hazardous"`) are hardcoded to dock `"D4"`. All other order types are assigned docks `"D1"`, `"D2"`, or `"D3"` based on an order ID character code modulo.
**Carrier Restriction**: If `order.type === "hazardous"`, `shipment.carrier` must strictly equal `"SecureChem Logistics"`, otherwise validation fails with an error.

---

4. API Request Interceptors (`src/api/interceptors/hazardous-interceptor.ts`)
**Request Rerouting**: `hazardousInterceptor` checks if `request.body?.type === "hazardous"`. If true, it rewrites the outgoing HTTP path from `/orders` to `/controlled/orders`, adds the `x-controlled-load: true` header, and sets request metadata routing to `"dangerous-goods"`. `apiClient` applies this interceptor during API requests (`src/api/api-client.ts`).
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
Stock reservation occurs in the core calculation engine (`applyStockReservation`), through three runtime call flows in application services and jobs, in direct unit test invocations, during stock release commit/reset operations, and within initial seed data.

---

1. Core Reservation Engine
**`applyStockReservation`** (`src/stock/reservation.ts`)

* **Mechanism:** Mutates `item.reserved` on zone stock items using:

`item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity`

* **Returns:** Updated `zones` (with reserved stock quantities) and `accepted` allocations.

---

2. Runtime Callers of `applyStockReservation`
**Order Allocation Service (`allocateOrder` in `src/dispatch/allocator.ts`)**

* **UI / Trigger Path:** Operator clicks "Allocate stock" in `OrderListPage.tsx` or `OrderDetailPage.tsx` $\rightarrow$ calls `allocate(id)` in `src/store/useWarehouseStore.ts` $\rightarrow$ invokes `allocateOrder()`.

* **Behavior:** Generates candidate stock allocations for incoming or held orders, calls `applyStockReservation(prepared, proposed, zones)`, and persists updated zones and allocations into state via `useWarehouseStore.ts`.

**Shipment Release Service (`releaseShipment` in `src/dispatch/releaseService.ts`)**

* **UI / Trigger Path:** Operator clicks "Release shipment" in `OrderDetailPage.tsx` $\rightarrow$ calls `release(id)` in `src/store/useWarehouseStore.ts` $\rightarrow$ invokes `releaseShipment()`.

* **Behavior:** Calls `applyStockReservation(order, order.allocations, zones)` to re-verify stock availability and update reservations before validating and committing the shipment.

**Background Revalidation Job (`revalidateReservations` in `src/jobs/revalidation.ts`)**

* **Trigger Path:** Mounted in `App.tsx` via `initialize()` in `src/store/useWarehouseStore.ts`, which runs `startRevalidationJob` every 60 seconds (`window.setInterval`).

* **Behavior:** Zeroes out item `reserved` counts across working zones and re-runs `applyStockReservation` sequentially for all open orders in status `allocated`, `picking`, or `ready`.

---

3. Direct Unit Test Execution
**`src/tests/reservation.test.ts`**

* **Behavior:** Directly invokes `applyStockReservation(order, [request], zones)` to verify that `item.reserved` increments correctly, lot code data is populated, and shortages are reported without creating negative inventory.

---

4. Stock Release Deductions and Revalidation Resets
**Stock Release Commitment (`commitReleasedStock` in `src/stock/stockService.ts`)**

* **Caller:** Called inside `releaseShipment` (`src/dispatch/releaseService.ts`).

* **Behavior:** Decrements `item.reserved` (and `item.onHand`) by the released allocation quantity:

`item.reserved = Math.max(0, item.reserved - allocation.quantity)`

**Revalidation Baseline Reset (`revalidateReservations` in `src/jobs/revalidation.ts`)**

* **Behavior:** Resets all item `reserved` values across working zones to `0` (`stock.map(item => ({ ...item, reserved: 0 }))`) prior to re-applying active order allocations.

---

5. Initial Seed Data
**`seedZones`** (`src/data/seedData.ts`)

* **Behavior:** Establishes initial baseline `reserved` quantities on zone stock items using the local `stock()` helper function (e.g., `stock("BX-100", 800, 25, "BX2407A")` initializes 25 reserved units in zone `ZA-01`).
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
Before an outgoing API request is sent to the mock server (`handleRequest`), an initial `ApiRequest` object is created inside `apiClient` and passed sequentially through three request interceptors (`authInterceptor`, `auditInterceptor`, and `hazardousInterceptor`) in `applyInterceptors` (`src/api/api-client.ts`, `src/api/interceptors/index.ts`). These interceptors authenticate, audit, and conditionally reroute hazardous requests.

---

Step-by-Step Execution Flow

#### 1. Initial Request Construction

When an API method is called (`apiClient.get`, `apiClient.post`, or `apiClient.patch` in `src/api/api-client.ts`, invoked by `src/dispatch/orderService.ts`), the helper function `request()` constructs a base `ApiRequest` object (`src/api/api-client.ts`):

**`path`**: The target route passed to `apiClient` (e.g., `/orders` or `/orders/${order.id}`).
**`method`**: `"GET"`, `"POST"`, or `"PATCH"`.
**`body`**: The request payload (e.g., an `Order` object) or `undefined` for `GET` calls.
**`headers`**: Initialized with `{ accept: "application/json" }`.
**`metadata`**: Initialized as an empty object `{}`.

#### 2. Sequential Interceptor Execution

`apiClient` passes the base `ApiRequest` to `applyInterceptors(initial)` (`src/api/interceptors/index.ts`), which executes the `interceptors` array in exact index order:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

* Copies existing headers and appends `{ authorization: "Bearer warehouse-console-session" }`.

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

* Copies existing headers and appends `"x-requested-at"` set to the current ISO timestamp (`new Date().toISOString()`).

* Copies existing metadata and adds `{ source: "dispatch-console", correlationId: crypto.randomUUID() }`.

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

* Inspects `request.body` as a partial `Order`.

* **If `body?.type === "hazardous"`**:

* Replaces `/orders` in `request.path` with `/controlled/orders`.

* Appends `"x-controlled-load": "true"` to `request.headers`.

* Appends `routing: "dangerous-goods"` to `request.metadata`.

* **Otherwise**: Returns `request` unmodified.

#### 3. Delivery to the Mock Server

`applyInterceptors` returns the final modified `ApiRequest` object to `apiClient`, which passes it directly to `handleRequest<TResponse>(intercepted)` (`src/api/mock-server.ts`). Inside `handleRequest`:

A delay of 90ms is introduced via `setTimeout`.
The path is normalized by replacing `/controlled/orders` back to `/orders` via `normalizedPath`.
The request's correlation ID is extracted from `request.metadata.correlationId` (falling back to a newly generated UUID if absent).
Synchronous matching generates the response for `GET /orders`, `GET /orders/*`, or `PATCH /orders/*`.

---

Verifiable Domain Limitations
**Live Application Reach**: In the active application, `orderService.ts` makes `apiClient.get` calls (which have no `body`) and `apiClient.patch` calls passing full `Order` objects (`src/dispatch/orderService.ts`). Thus, `hazardousInterceptor` modifies requests specifically during `PATCH` calls for orders with `type === "hazardous"`.
**Unreached Interceptor Paths**: `apiClient.post` is defined in `src/api/api-client.ts`, but it is not called anywhere in the codebase.
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
No, `validateShipment` does not only check—it mutates state by mutating the `dock` property directly on the passed-in `shipment` object (`src/dispatch/validation.ts`).

---

Supporting Repository Details

1. **Direct Argument Mutation in `validateShipment`**

In `src/dispatch/validation.ts`, `validateShipment` performs read-only error and warning checks, but right before returning the result, it calculates and mutates the `dock` property directly on the input `shipment` object:

```ts

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

It does not mutate any store state, persistent database state, or properties on the `order` object.

2. **Runtime Data Flow & Impact**

In `releaseShipment` (`src/dispatch/releaseService.ts`):

- The initial `shipment` object is instantiated without a `dock` property.

- `validateShipment(shipment, order)` is called.

- The mutation performed by `validateShipment` attaches `shipment.dock` to the same object reference.

- Later in `releaseShipment`, the mutated `shipment.dock` property is read to populate `releasedOrder.assignedDock` and to construct the dispatch log entry string (`detail: ... at ${shipment.dock}`).

3. **Test Reliance**

In `src/tests/validation.test.ts`, tests directly verify this side effect by asserting on `candidate.dock` after passing `candidate` into `validateShipment`.
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
For a bulk order, the **legacy pricing implementation** (`calculateLegacyPrice` in `src/pricing/legacyPricing.ts`) runs.

---

Why `calculateLegacyPrice` Runs

1. **Order Total Entry Point:** When an order is allocated during dispatch in `src/dispatch/allocator.ts` (line 58), the system calculates the order's total price by calling `calculateOrderPrice(prepared)` defined in `src/pricing/pricing.ts`.

2. **Strategy Determination:** Inside `calculateOrderPrice` (`src/pricing/pricing.ts`, lines 7–8), the function invokes `pricingStrategyFor(order)`.

3. **Type-to-Strategy Mapping:** `pricingStrategyFor` (`src/config/zoneRules.ts`, lines 72–74) looks up `order.type` in the `pricingByType` map (`src/config/zoneRules.ts`, lines 21–26):

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

4. **Conditional Delegation:** When `order.type === "bulk"`, `pricingStrategyFor` returns `"legacy"`. In `calculateOrderPrice` (`src/pricing/pricing.ts`, line 8), the check `if (strategy === "legacy")` evaluates to `true`, causing execution to delegate directly to `calculateLegacyPrice(order)` and return its result (which computes costs using pallet handling fees and subtotal volume discounts in `src/pricing/legacyPricing.ts`).

---

Evidence Summary
**Direct Evidence:**

* `src/pricing/pricing.ts`: `calculateOrderPrice` calls `pricingStrategyFor(order)` and immediately branches to `calculateLegacyPrice(order)` if `strategy === "legacy"`.

* `src/config/zoneRules.ts`: `pricingByType` maps `"bulk"` to `"legacy"`, and `pricingStrategyFor` returns `pricingByType[order.type]`.

* `src/dispatch/allocator.ts`: Calls `calculateOrderPrice(prepared)` when building the allocated order state.

* `src/pricing/legacyPricing.ts`: Contains the legacy pricing implementation using pallet handling rates and subtotal discounts.

* `src/tests/pricing.test.ts`: Verifies that bulk orders resolve to the `"legacy"` pricing strategy and that `calculateOrderPrice` produces the output of `calculateLegacyPrice`.

**Inferred Evidence:** None required; all execution flow and configuration mappings are directly visible in code.
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
When a dispatch event is emitted via the event bus (`src/events/bus.ts`), reactions depend on the specific event type. Two events (`shipment.released` and `stock.low`) trigger registered listeners, while two others (`order.allocated` and `notification.created`) have no active listeners on the bus.

---

Direct Breakdown of Reactions by Event

#### 1. `shipment.released`

**Emitted by:** `releaseShipment()` in `src/dispatch/releaseService.ts` after shipment validation, order status mutation to `"released"`, and log entry creation.
**Listener:** Registered in `installNotificationListeners()` in `src/notifications/listener.ts`.
**Reaction:** Calls `publishNotification()` in `src/notifications/service.ts`, creating a success notification (`Order <id> released`) and unshifting it into an in-memory `pending` queue array.
**Runtime Store & UI Effect:** In `src/store/useWarehouseStore.ts`, the store's `initialize()` function runs an interval every 300ms that calls `drainNotifications()`, removing pending items and updating the Zustand store's `notifications` state (capped at 8 items). The `Toasts` component (`src/components/Toasts.tsx`) renders these active notifications to the UI.

#### 2. `stock.low`

**Emitted by:** `commitReleasedStock()` in `src/stock/stockService.ts` when an item's remaining available inventory (`onHand - reserved`) falls at or below its `reorderPoint` during stock release.
**Listeners (2 active):**

1. **Notification Listener** (`src/notifications/listener.ts`): Invokes `publishNotification()`, pushing a warning notification (`Low stock: <sku>`) specifying the SKU, zone ID, and available quantity into the `pending` queue, which flows to the Zustand store state via 300ms polling and renders in `Toasts.tsx`.

2. **Stock Signal Listener** (`src/stock/stockService.ts`): Evaluates at module import time and prepends a string formatted as `${sku} in ${zoneId}: ${available} available` to the local `lowStockSignals` array (popping the oldest entry if length exceeds 20).

---

Events Emitted Without Active Bus Listeners
**`order.allocated`** (`src/dispatch/allocator.ts`): Emitted by `allocateOrder()` when all lines are fully allocated and the order status transitions to `"allocated"`. No `eventBus.on("order.allocated")` listener is registered anywhere in the application.
**`notification.created`** (`src/notifications/service.ts`): Emitted by `publishNotification()` whenever a notification object is generated. No `eventBus.on("notification.created")` subscriber exists in the codebase (the UI receives notifications through the 300ms polling interval calling `drainNotifications()` in `src/store/useWarehouseStore.ts`).

---

Execution & Listener Wire-up Timing
**Module-scope Registration:** The `stock.low` listener in `src/stock/stockService.ts` is registered as soon as the module is imported.
**Effect-level Registration:** The `shipment.released` and `stock.low` listeners in `src/notifications/listener.ts` are registered when `App.tsx` calls `installNotificationListeners()` inside a React `useEffect` hook. A guard flag (`installed`) ensures listeners are registered only once.
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
To add a new order type to the application, you must update the domain type union, create a dispatch handler module, update zone routing and pricing records, and update the UI filter menu. Depending on domain rules, shipment validation, API request interceptors, seed data, and tests may also need updating.

---

1. Primary Required Changes

#### A. Domain Type Union

**`src/types/domain.ts`** (Line 1):

Add the new string literal to the `OrderType` type definition:

```ts

export type OrderType = "standard" | "express" | "bulk" | "hazardous" | "your_new_type";

```

#### B. Dispatch Handler Module

**`src/dispatch/handlers/`**:

Create a new module file in the `src/dispatch/handlers/` directory (alongside existing handlers such as `standardHandler.ts`, `expressHandler.ts`, `bulkHandler.ts`, and `hazardousHandler.ts`) that implements the `DispatchHandler` interface and calls `registerHandler(...)` upon module evaluation.

* **Auto-discovery:** `getHandler()` in `src/dispatch/handlers/registry.ts` uses `import.meta.glob("./*.ts")` to dynamically import and register all handler files in this directory.

* **Runtime caller requirement:** `getHandler(order.type)` is directly invoked during stock allocation (`allocateOrder` in `src/dispatch/allocator.ts`, line 17) and shipment release (`releaseShipment` in `src/dispatch/releaseService.ts`, line 18). If no handler is registered for the new type, `getHandler()` throws `No dispatch handler registered for ${type}`.

#### C. Exhaustive Configuration Records

**`src/config/zoneRules.ts`** (Lines 14–26):

Add the new type key to both mapped record objects. TypeScript will enforce completeness because both are explicitly typed as `Record<OrderType, ...>`:

1. `typeKinds: Record<OrderType, Zone["kind"][]>`: Specifies the prioritized zone kinds used by `scoreZone()` and rule `"type-routing"`.

2. `pricingByType: Record<OrderType, PricingStrategy>`: Specifies whether the order type uses `"current"` or `"legacy"` pricing calculations via `pricingStrategyFor()`.

---

2. UI Updates
**`src/pages/OrderListPage.tsx`** (Lines 15–21):

Add the new type to the hardcoded `types` array so it renders as a selectable option in the filter dropdown:

```ts

const types: Array<Order["type"] | "all"> = [

"all",

"standard",

"express",

"bulk",

"hazardous",

"your_new_type",

];

```

---

3. Conditional / Domain-Specific Changes
**Shipment Dock and Carrier Validation (`src/dispatch/validation.ts`)**:

`validateShipment()` checks `order.type` to require specific carriers (e.g., `"SecureChem Logistics"` for `"hazardous"`) and assign special docks (e.g., dock `"D4"` vs. general docks `D1–D3`). If the new order type requires custom dock assignment or carrier validation rules, add logic here.

**API Request Interceptors (`src/api/interceptors/hazardous-interceptor.ts` & `src/api/interceptors/index.ts`)**:

If the API client needs to rewrite request paths or append specific headers for the new order type (similar to how `hazardousInterceptor` redirects `/orders` to `/controlled/orders`), create an interceptor and include it in the `interceptors` array in `src/api/interceptors/index.ts`.

**Seed Data (`src/data/seedData.ts`)**:

Add sample entries using the new type to `orderSpecs` (lines 139–250) to make test orders available in the application store (`useWarehouseStore.ts`).

**Unit Tests (`src/tests/`)**:

Update or add unit tests in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, and `src/tests/validation.test.ts` to cover allocation behavior, pricing strategies, and validation rules for the new type.
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
Modifying the zone rules in `src/config/zoneRules.ts` affects two distinct control paths: **zone candidate scoring for stock allocation** (`scoreZone`, `rulesFor`, `zoneRules`) and **order pricing strategy resolution** (`pricingStrategyFor`, `pricingByType`).

Below is the complete trace of every downstream execution flow, runtime state mutation, UI component, event, job, and test suite affected.

---

Direct Importers & Entry Points

Only two production files directly import from `src/config/zoneRules.ts`:

1. `src/dispatch/allocator.ts` imports `scoreZone` (lines 1, 23).

2. `src/pricing/pricing.ts` imports `pricingStrategyFor` (lines 1, 5).

---

Downstream Trace 1: Zone Scoring & Allocation Flow (`scoreZone`)

#### 1. Allocation Candidate Evaluation (`src/dispatch/allocator.ts`)

`allocateOrder()` receives an `Order` and `Zone[]`.
For each `OrderLine`, candidates are evaluated by calling `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`, line 78).
`scoreZone` invokes `rulesFor(order, line)`, filtering rules where `rule.applies()` is true and sorting by `rule.score` descending. It subtracts 25 points if `zone.kind` is not in `rule.zoneKinds`, otherwise adding `rule.prefer(zone, order, line)`.
Candidates are filtered by `zone.active` and matching SKU stock, then sorted descending by score (`src/dispatch/allocator.ts`, lines 22–27). Stock is allocated sequentially from top-ranked candidates.

#### 2. Downstream State & Event Impact (`src/dispatch/allocator.ts`, `src/stock/reservation.ts`)

**Allocations & Lot Codes**: A change in rule scores, zone kinds, or predicates (`hazard-isolation`, `cold-chain`, `type-routing`, `capacity-balance`) alters which candidate zone is picked first, changing the `zoneId` and `lotCode` populated on `Allocation` objects.
**Shortages & Status**: If scoring prefers a zone with insufficient net stock (`onHand - item.reserved + alreadyReserved`), unallocated units remain or `applyStockReservation` (`src/stock/reservation.ts`, line 28) reports shortages.

* If lines remain unallocated or shortages exist (`complete === false`), `order.status` becomes `"held"` and warnings are populated (`src/dispatch/allocator.ts`, line 62).

* If `complete === true`, `order.status` becomes `"allocated"`, and `eventBus.emit("order.allocated", { order })` fires (`src/dispatch/allocator.ts`, line 64). Note: there are currently no registered listeners for `"order.allocated"` on `eventBus` (`src/events/bus.ts`).

#### 3. Execution Entry Points & Store Mutations (`src/store/useWarehouseStore.ts`)

`allocate(id)` is called when an operator clicks "Allocate stock" in `OrderCard` (`src/components/OrderCard.tsx`, line 91) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 71).
`allocate()` calls `allocateOrder()`, saves via `saveOrder()` (`src/dispatch/orderService.ts`), and updates Zustand store fields `orders`, `zones` (reserved stock increments), and appends an entry to `logs`.

#### 4. Revalidation Background Job (`src/jobs/revalidation.ts`)

`revalidateReservations()` runs periodically via `startRevalidationJob()` (`src/store/useWarehouseStore.ts`, line 88).
Revalidation re-applies stored `order.allocations` against current zone stock using `applyStockReservation()`. If previous rule scoring forced stock into low-stock zones that later experience shortages, revalidation flips order status from `"allocated"`, `"picking"`, or `"ready"` to `"held"`, adds operator notes, and logs a `"revalidated"` audit event.

#### 5. Release Service Flow (`src/dispatch/releaseService.ts`)

When `release(id)` is triggered (`OrderDetailPage.tsx`, line 87), `releaseShipment()` validates `order.allocations` (which were selected via `scoreZone`).
If allocations are missing or carrier rules fail in `validateShipment()` (`src/dispatch/validation.ts`), release throws an error, populating `globalError` in store.
On successful release, `commitReleasedStock()` (`src/stock/stockService.ts`, line 15) decrements `onHand` and `reserved` stock. If `onHand - reserved <= reorderPoint`, it emits `stock.low`, which is handled by `installNotificationListeners()` (`src/notifications/listener.ts`, line 15) to display a warning toast (`src/components/Toasts.tsx`).

#### 6. UI Consumers

**`src/components/OrderCard.tsx`**: Renders progress track (`progress-track`) and unit counts based on allocated quantities.
**`src/pages/OrderDetailPage.tsx`**: Renders line item allocation chips (`allocation-chip`), total assigned units, and shipment carrier/dock details.
**`src/pages/ZoneOverviewPage.tsx` & `src/components/ZoneCard.tsx`**: Renders updated reserved stock counters, zone capacity percentage, available units, and reorder point warning banners (`low-warning`).

---

Downstream Trace 2: Order Pricing Flow (`pricingStrategyFor`)

#### 1. Price Calculation (`src/pricing/pricing.ts`)

`calculateOrderPrice(order)` calls `pricingStrategyFor(order)` (`src/config/zoneRules.ts`, line 74) which reads `pricingByType[order.type]`.
**"legacy" Branch**: Routes to `calculateLegacyPrice(order)` (`src/pricing/legacyPricing.ts`), computing price based on pallet counts (weight / 500kg ceiling), $18.50 pallet handling fee, and volume discounts (> $2000 = 4%, > $5000 = 7.5%).
**"current" Branch**: Computes subtotal, weight handling (`Math.max(7.5, weight * 0.11)`), priority fees (critical = $45, urgent = $20), and hazardous surcharge ($65).

#### 2. Downstream Flow & UI Consumers

`allocateOrder()` sets `order.total = calculateOrderPrice(prepared)` (`src/dispatch/allocator.ts`, line 63) and returns `total` in `AllocationBundle`.
`order.total` is persisted in the store (`src/store/useWarehouseStore.ts`, line 125) and displayed in:

* `OrderCard` (`src/components/OrderCard.tsx`, line 59): Order value formatted via `money()`.

* `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 111): Value panel displaying total price and order type handling label.

---

Affected Unit Tests

Modifying `src/config/zoneRules.ts` directly impacts the assertion outcomes of the following test files:

1. **`src/tests/allocation.test.ts`**:

* Line 16: Asserts express non-cold orders allocate to fast-pick zone `"ZB-02"` (relies on `type-routing` rule score).

* Line 28: Asserts hazardous item `"CL-900"` allocates exclusively to secure zone `"ZS-04"` (relies on `hazard-isolation` rule score of 100).

* Line 37: Asserts orders hold when inventory is insufficient.

2. **`src/tests/pricing.test.ts`**:

* Line 8: Imports `pricingStrategyFor` directly and asserts `pricingStrategyFor(bulk)` returns `"legacy"`.

* Line 10: Asserts `calculateOrderPrice(bulk)` equals `calculateLegacyPrice(bulk)`.

* Line 21: Asserts standard orders incur current handling charges.

* Line 33: Asserts hazardous orders include the dangerous goods surcharge.
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
Yes, hazardous orders (where `order.type === "hazardous"`) and order lines marked hazardous (`line.hazardous === true`) are treated differently across API interception, dispatch handler processing, zone selection scoring, shipment validation, dock assignment, pricing calculations, UI filtering, line styling, and unit test assertions.

---

1. API Request Interception & Routing
**File:** `src/api/interceptors/hazardous-interceptor.ts` (lines 5–12)
**Behavior:** When an `ApiRequest` body has `type === "hazardous"`, `hazardousInterceptor` rewrites the request before dispatching it to `handleRequest` in `src/api/mock-server.ts`:

* Changes `request.path` by replacing `/orders` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets `request.metadata.routing = "dangerous-goods"`.

**Flow:** `hazardousInterceptor` is registered in `interceptors` (`src/api/interceptors/index.ts`, lines 7–11) and called on every request via `apiClient` (`src/api/api-client.ts`, lines 15–16), such as during `saveOrder` in `src/dispatch/orderService.ts` (line 10). `handleRequest` in `src/api/mock-server.ts` (lines 7–9) normalizes `/controlled/orders` back to `/orders`.
2. Specialized Dispatch Handler (`hazardous` Order Type)
**File:** `src/dispatch/handlers/hazardousHandler.ts` (lines 3–27)
**Behavior:** Automatically registered in `src/dispatch/handlers/registry.ts` when dynamic imports run in `getHandler("hazardous")`. It implements handler hooks called during `allocateOrder` (`src/dispatch/allocator.ts`, line 17) and `releaseShipment` (`src/dispatch/releaseService.ts`, line 16):

* **`prepare(order)`:** Appends `"Dangerous goods paperwork required"` to `order.notes` and overrides `order.priority` to `"urgent"`.

* **`inspect(order)`:** Returns warning strings if no line has `line.hazardous === true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **`shipmentDefaults(order)`:** Sets default carrier to `"SecureChem Logistics"` and package count to `Math.max(1, Math.ceil(units / 4))`.

3. Inventory Zone Selection & Preference Scoring
**File:** `src/config/zoneRules.ts` (lines 14–19, 29–36)
**Behavior:**

* `typeKinds.hazardous` restricts allowed zone kinds for `hazardous` order types to `["secure"]`.

* The `hazard-isolation` rule (score `100`) applies whenever `order.type === "hazardous" || line.hazardous`. During zone evaluation in `scoreZone` (`src/config/zoneRules.ts`, lines 79–84), non-`secure` zones lose 25 base points for kind mismatch plus 100 points (`-100`), while `secure` zones (such as `ZS-04` in `src/data/seedData.ts`, lines 403–415) gain `+80` preference points.

4. Shipment Validation & Dock Assignment
**File:** `src/dispatch/validation.ts` (lines 28–30, 36)
**Behavior:** Invoked inside `releaseShipment` (`src/dispatch/releaseService.ts`, line 32):

* **Validation rule:** If `order.type === "hazardous"` and `shipment.carrier !== "SecureChem Logistics"`, validation fails with error `"Approved dangerous goods carrier required"`.

* **Dock assignment:** Forces `shipment.dock = "D4"` for `order.type === "hazardous"`, whereas non-hazardous orders are assigned docks `D1`, `D2`, or `D3` based on `order.id` hash modulo 3.

5. Pricing Surcharges
**File:** `src/pricing/pricing.ts` (lines 7–20)
**Behavior:** Called during `allocateOrder` (`src/dispatch/allocator.ts`, line 59) when calculating `order.total`:

* `pricingStrategyFor` (`src/config/zoneRules.ts`, lines 21–26, 75–77) resolves `hazardous` orders to the `"current"` pricing strategy.

* `calculateOrderPrice` checks if any line in the order has `line.hazardous === true`. If true, it adds a `$65` surcharge (`hazardousFee`).

6. User Interface Components & Visual Indicators
**File:** `src/pages/OrderListPage.tsx` (lines 16–22, 118–129)

* Renders `"hazardous"` as an option in the "Order type" filter dropdown.

**File:** `src/pages/OrderDetailPage.tsx` (line 155) & `src/styles.css` (lines 201, 207)

* In the line items table, any line where `line.hazardous` is `true` renders an `<em>Controlled</em>` tag styled in light red (`background: #fae9e7; color: #aa403a;`).

7. Automated Test Assertions
**File:** `src/tests/allocation.test.ts` (lines 18–27)

* Verifies that allocating a `hazardous` order routes stock allocations for SKU `CL-900` specifically to secure zone `ZS-04`.

**File:** `src/tests/pricing.test.ts` (lines 25–34)

* Asserts that `calculateOrderPrice` adds the dangerous goods surcharge for hazardous orders.

**File:** `src/tests/validation.test.ts` (lines 31–46)

* Asserts that validating a `hazardous` shipment fails without `"SecureChem Logistics"` and assigns dock `D4`.
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
A dock is assigned to a shipment in **`src/dispatch/validation.ts`** within the **`validateShipment`** function.

Assignment Logic

In `src/dispatch/validation.ts`:

The function calculates a character code sum from `order.id` (`numeric`).
If `order.type === "hazardous"`, `shipment.dock` is set to `"D4"`.
For all other order types, `shipment.dock` is set to `"D1"`, `"D2"`, or `"D3"` using `docks[numeric % 3]` from `const docks = ["D1", "D2", "D3", "D4"]`.
Execution Flow and Runtime Effects

1. **Entry Point**: The user triggers release from `OrderDetailPage.tsx` (`src/pages/OrderDetailPage.tsx`), calling `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`).

2. **Release Execution**: The store calls `releaseShipment` (`src/dispatch/releaseService.ts`), which constructs the base `shipment` object and passes it to `validateShipment(shipment, order)` (`src/dispatch/validation.ts`).

3. **Mutation**: `validateShipment` mutates `shipment.dock` in place.

4. **State and Event Output**:

* `releaseShipment` copies `shipment.dock` to `releasedOrder.assignedDock` (`src/dispatch/releaseService.ts`).

* The dock assignment is included in the returned dispatch log detail string (`src/dispatch/releaseService.ts`).

* `releaseShipment` emits the `"shipment.released"` event containing the `shipment` (`src/dispatch/releaseService.ts`).

* The event listener installed in `installNotificationListeners` (`src/notifications/listener.ts`) handles `"shipment.released"` and displays the dock in a toast notification message.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

