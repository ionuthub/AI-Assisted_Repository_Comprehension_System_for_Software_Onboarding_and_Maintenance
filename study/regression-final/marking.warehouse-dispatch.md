# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 2489fbd41c806c3d1e6a8df9b696cde8880fa57f72cafb0def9e911cf236f9ae -->

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
Execution starts in **`index.html`**, which serves as the web entry point and loads the ES module **`src/main.tsx`** via `<script type="module" src="/src/main.tsx">`.

---

Execution Sequence

#### 1. Document Loading (`index.html`)

`index.html` provides the `#root` container `<div>` and loads `src/main.tsx` (`index.html`).

#### 2. Module Evaluation Phase

Before React renders, importing dependencies triggers top-level module evaluation:

**`src/main.tsx`** imports `src/App.tsx` and `src/styles.css` (`src/main.tsx`).
**`src/App.tsx`** evaluates top-level statements, instantiating `createBrowserRouter` with client routes (`/`, `orders/:orderId`, `zones`, `log`) (`src/App.tsx`).
**`src/store/useWarehouseStore.ts`** evaluates its store creation block, populating initial state with structured clones of seed data (`seedOrders`, `seedZones`, `seedLogs`) from `src/data/seedData.ts` (`src/store/useWarehouseStore.ts`).
**`src/stock/stockService.ts`** registers a module-level listener on `eventBus` for `"stock.low"` when loaded (`src/stock/stockService.ts`).

#### 3. React Root Creation & Component Render (`src/main.tsx`, `src/App.tsx`)

`ReactDOM.createRoot` targets `document.getElementById("root")` and renders `<App />` inside `<React.StrictMode>` (`src/main.tsx`).
`<App />` renders `<RouterProvider router={router} />`, mounting the layout (`src/components/Layout.tsx`) and initial index route page `OrderListPage` (`src/App.tsx`).

#### 4. Post-Mount Effects & Async Job Initialization (`src/App.tsx`)

After the initial render, `useEffect` inside `App` executes once (`src/App.tsx`):

1. **Event Listener Registration**: Calls `installNotificationListeners()`, registering subscribers on `eventBus` for `"shipment.released"` and `"stock.low"` (`src/notifications/listener.ts`).

2. **Store Initialization**: Calls `initialize()` on `useWarehouseStore` (`src/store/useWarehouseStore.ts`):

- Sets state `initialized: true` (guarded against duplicate runs).

- Starts a 300ms window interval polling `drainNotifications()` from `src/notifications/service.ts` to prepend new alerts to Zustand store state.

- Calls `startRevalidationJob()`, scheduling a 60,000ms recurring interval that runs `revalidateReservations()` over store orders and zones (`src/jobs/revalidation.ts`).

- Registers a `{ once: true }` `"beforeunload"` event listener on `window` to clear the notification polling timer and stop the revalidation job on page teardown.

---

Evidence Summary
**Direct Evidence**:

- `index.html`: Entry HTML structure and module script loading.

- `src/main.tsx`: DOM root creation and ReactStrict Mode render.

- `src/App.tsx`: Router declaration, initial component structure, and `useEffect` hook execution.

- `src/store/useWarehouseStore.ts`: Store state instantiation and `initialize` routine implementation.

- `src/notifications/listener.ts`: `installNotificationListeners` function and `eventBus` attachments.

- `src/jobs/revalidation.ts`: `startRevalidationJob` timer implementation.

- `src/stock/stockService.ts`: Top-level `eventBus.on("stock.low", ...)` subscription.

**Inference**: None.
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
How is an order assigned to a warehouse zone?

An order is assigned to one or more warehouse zones on a line-by-line basis when an operator triggers stock allocation (`allocate(id)` in `src/store/useWarehouseStore.ts`), which invokes `allocateOrder(order, zones)` in `src/dispatch/allocator.ts`. Candidate active zones containing stock for each order line's SKU are evaluated, scored, sorted in descending order, and assigned until required quantities are fulfilled or available stock is exhausted.

Execution & Assignment Flow

1. **Trigger and Store Dispatch** (`src/store/useWarehouseStore.ts`)

- The operator triggers allocation via UI buttons in `src/pages/OrderListPage.tsx` or `src/pages/OrderDetailPage.tsx`, calling `useWarehouseStore.getState().allocate(id)`.

- The store sets `loadingOrderIds`, clears `globalError`, and executes `allocateOrder(order, get().zones)` (`src/dispatch/allocator.ts`).

2. **Handler Pre-processing** (`src/dispatch/allocator.ts`, `src/dispatch/handlers/registry.ts`)

- `allocateOrder` calls `getHandler(input.type)` in `src/dispatch/handlers/registry.ts` to dynamically import and retrieve the handler registered for the order's type (`src/dispatch/handlers/standardHandler.ts`, `src/dispatch/handlers/expressHandler.ts`, `src/dispatch/handlers/bulkHandler.ts`, or `src/dispatch/handlers/hazardousHandler.ts`).

- `handler.prepare(structuredClone(input))` mutates notes and priority attributes where configured (e.g., setting `priority: "critical"` for express orders or `priority: "urgent"` for hazardous orders).

- `handler.inspect(prepared)` runs type-specific validation checks and returns initial warning messages.

3. **Line-by-Line Zone Candidate Evaluation and Scoring** (`src/dispatch/allocator.ts`, `src/config/zoneRules.ts`)

- For each `OrderLine` in `prepared.lines`, candidate zones are filtered to active zones (`zone.active === true`) containing the SKU (`zone.stock.some(item => item.sku === line.sku)`).

- Each candidate zone is scored via `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`). `scoreZone` filters `zoneRules` using `rule.applies(order, line)` and sorts matching rules by score descending before accumulating points:

- **`hazard-isolation`** (score 100, `zoneKinds: ["secure"]`, applies if `order.type === "hazardous"` or `line.hazardous`): If `zone.kind` is `"secure"`, `rule.prefer` returns +80. If `zone.kind` is not `"secure"`, `rule.zoneKinds.includes(zone.kind)` evaluates to false, so `scoreZone` skips `rule.prefer` and subtracts 25 points from the score.

- **`cold-chain`** (score 90, `zoneKinds: ["cold"]`, applies if `line.temperature !== "ambient"`): If `zone.kind` is `"cold"`, `rule.prefer` returns +70 when `zone.temperature === line.temperature` and -100 otherwise. If `zone.kind` is not `"cold"`, `rule.zoneKinds.includes(zone.kind)` evaluates to false, skipping `rule.prefer` and subtracting 25 points.

- **`type-routing`** (score 50, `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`, applies to all orders): Checks `typeKinds[order.type]` (`standard`: `["general", "fast-pick"]`; `express`: `["fast-pick", "general"]`; `bulk`: `["bulk", "general"]`; `hazardous`: `["secure"]`). If `zone.kind` is matched, `rule.prefer` returns `40 - position * 10`; if `zone.kind` is in `rule.zoneKinds` but not in `typeKinds[order.type]`, it returns -50. If `zone.kind` is not in `rule.zoneKinds` (e.g., `"cold"` or `"staging"`), `scoreZone` skips `rule.prefer` and subtracts 25 points.

- **`capacity-balance`** (score 10, `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`, applies to all orders): If `zone.kind` is included, `rule.prefer` calculates used capacity and adds `Math.round((1 - used / zone.capacity) * 20)`. If `zone.kind` is `"staging"`, `scoreZone` skips `rule.prefer` and subtracts 25 points.

4. **Quantity Allocation and Multi-Zone Splitting** (`src/dispatch/allocator.ts`)

- Candidate zones are sorted in descending order of calculated score (`right.score - left.score`).

- For each sorted zone, available unreserved stock is determined via `Math.max(0, item.onHand - item.reserved)`.

- `allocateOrder` allocates `quantity = Math.min(remaining, available)`.

- If `quantity > 0`, a proposed `Allocation` (`lineId`, `sku`, `zoneId`, `quantity`, `reservedAt`, `lotCode`) is added and `remaining` line quantity is reduced. If top-ranked candidate zones do not hold enough stock to meet `line.quantity`, allocation falls through to lower-scoring candidate zones, splitting the line allocation across multiple zones.

- If `remaining > 0` after iterating through all candidate zones, an unallocated warning is added to `warnings`.

5. **Reservation Finalization and Order Pricing** (`src/dispatch/allocator.ts`, `src/stock/reservation.ts`, `src/pricing/pricing.ts`)

- Proposed allocations are finalized through `applyStockReservation(prepared, proposed, zones)` in `src/stock/reservation.ts`.

- `applyStockReservation` clones `zones`, verifies remaining capacity against existing allocations, updates `StockItem.reserved` counts, sets assigned `lotCode` values on accepted allocations, and records any shortages.

- If every order line's allocated quantity equals its requested quantity and no shortages occur, order status is set to `"allocated"` and `eventBus.emit("order.allocated", { order })` fires (`src/events/bus.ts`). Otherwise, order status is set to `"held"`.

- Total order value is calculated via `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`), using legacy pricing (`src/pricing/legacyPricing.ts`) for `bulk` order types and standard item pricing plus handling, priority, and hazardous fees for other types.

6. **Persistence and Store Update** (`src/dispatch/orderService.ts`, `src/api/api-client.ts`, `src/store/useWarehouseStore.ts`)

- The order is saved via `saveOrder(result.order)` (`src/dispatch/orderService.ts`), sending a `PATCH` request to `/orders/${order.id}` via `apiClient` (`src/api/api-client.ts`). Hazardous orders are re-routed to `/controlled/orders/${order.id}` by `hazardousInterceptor` (`src/api/interceptors/hazardous-interceptor.ts`).

- On completion, `useWarehouseStore` updates `orders` with the saved order, replaces `zones` with the new stock state reflecting reserved quantities, prepends a `DispatchLogEntry` ("allocated" or "held") to `logs`, and removes the order ID from `loadingOrderIds`.
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
Order-type processing decisions are primarily decided by the dispatch handlers registered in `src/dispatch/handlers/registry.ts` and defined in `src/dispatch/handlers/*.ts` (`standardHandler.ts`, `expressHandler.ts`, `bulkHandler.ts`, and `hazardousHandler.ts`).

Additional type-based processing decisions are controlled across allocation scoring, pricing strategy lookup, shipment validation, network request interception, and list filtering.

1. Dispatch Handlers (`src/dispatch/handlers/`)

Calling `getHandler(order.type)` dynamically loads and returns the type-specific handler implementation (`src/dispatch/handlers/registry.ts`):

**`standard` Handler** (`src/dispatch/handlers/standardHandler.ts`):

* `prepare()`: Appends `"Standard pick wave assigned"` to `order.notes`.

* `inspect()`: Returns warnings if the order has no lines or if any line quantity exceeds 100.

* `shipmentDefaults()`: Returns carrier `"Northline Ground"` and `packageCount` calculated as `ceil(totalUnits / 12)`.

**`express` Handler** (`src/dispatch/handlers/expressHandler.ts`):

* `prepare()`: Sets `order.priority` to `"critical"` and appends `"Moved to express pick lane"` to `order.notes`.

* `inspect()`: Returns warnings if the remaining time until `dueAt` is less than 90 minutes or overdue.

* `shipmentDefaults()`: Returns carrier `"Apex Priority"` and `packageCount` calculated as `ceil(totalWeight / 20)`.

**`bulk` Handler** (`src/dispatch/handlers/bulkHandler.ts`):

* `prepare()`: Appends `"Forklift requested for [totalWeight] kg load"` to `order.notes`.

* `inspect()`: Returns warnings if total units are fewer than 20 or if `destination.company` is empty.

* `shipmentDefaults()`: Returns carrier `"Atlas Freight"` and `packageCount` calculated as `ceil(totalWeight / 500)`.

**`hazardous` Handler** (`src/dispatch/handlers/hazardousHandler.ts`):

* `prepare()`: Sets `order.priority` to `"urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.

* `inspect()`: Returns warnings if no line has `hazardous: true` or if `destination.country` is not `"US"`.

* `shipmentDefaults()`: Returns carrier `"SecureChem Logistics"` and `packageCount` calculated as `ceil(totalUnits / 4)`.

2. Allocation & Release Workflows
**Stock Allocation** (`src/dispatch/allocator.ts`): Calls `allocateOrder()`, which fetches the type handler, executes `handler.prepare()`, and collects warnings via `handler.inspect()`.
**Shipment Release** (`src/dispatch/releaseService.ts`): Calls `releaseShipment()`, which fetches the type handler and uses `handler.shipmentDefaults()` for missing carrier choices and package counts.
3. Zone Scoring & Pricing Lookup (`src/config/zoneRules.ts`)
**Zone Preference Ranking (`typeKinds`)**: Maps order type to preferred zone kind order (`standard` ranks `general` then `fast-pick`; `express` ranks `fast-pick` then `general`; `bulk` ranks `bulk` then `general`; `hazardous` ranks `secure`). `scoreZone()` uses this mapping to rank zone candidates via the `type-routing` rule (scoring +40 or +30 for matching kinds, -50 for non-matching kinds). The separate `hazard-isolation` rule checks `order.type === "hazardous"` or `line.hazardous` to add +80 preference score to `secure` zones and penalize non-`secure` zones by -100.
**Pricing Strategy Lookup (`pricingByType`)**: Maps order type `bulk` to `"legacy"` pricing strategy and all other types (`standard`, `express`, `hazardous`) to `"current"` pricing strategy.
4. Downstream Processing Rules
**Pricing Execution** (`src/pricing/pricing.ts` & `src/pricing/legacyPricing.ts`): `calculateOrderPrice()` evaluates strategy via `pricingStrategyFor(order)`:

* For `bulk` (`"legacy"`): Executes `calculateLegacyPrice()` using subtotal, pallet handling ($18.50 per 500 kg), and tier volume discounts (4% over $2,000; 7.5% over $5,000).

* For `standard`, `express`, and `hazardous` (`"current"`): Calculates subtotal, weight handling, priority fees ($45 for `"critical"`, $20 for `"urgent"`), and a $65 hazardous fee if any line has `hazardous: true`. (Priority updates applied in `prepare()` by `express` and `hazardous` handlers directly influence these priority fees).

**Shipment Validation & Dock Assignment** (`src/dispatch/validation.ts`): `validateShipment()` assigns dock `"D4"` if `order.type === "hazardous"` (otherwise assigning `"D1"`, `"D2"`, or `"D3"` based on order ID character codes) and adds a validation error if `order.type === "hazardous"` and the carrier is not `"SecureChem Logistics"`.
**API Request Interception** (`src/api/interceptors/hazardous-interceptor.ts`): `hazardousInterceptor` checks if `request.body.type === "hazardous"`, rewriting the endpoint path from `/orders` to `/controlled/orders`, setting header `x-controlled-load: true`, and adding metadata `routing: "dangerous-goods"`.
**UI Filtering** (`src/store/useWarehouseStore.ts` & `src/pages/OrderListPage.tsx`): `filteredOrders()` filters the store's visible orders against `filters.type`.
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
Stock reservation—where stock units are reserved or recalculated against available inventory—is performed by **1 core domain function** (`applyStockReservation` in `src/stock/reservation.ts`), which is called by **3 live production call sites** and **1 test file**.

---

Live Production Call Sites & Workflows

1. **Order Allocation (`allocateOrder` in `src/dispatch/allocator.ts`, line 53)**

* **Store Action:** `useWarehouseStore.allocate(id)` (`src/store/useWarehouseStore.ts`, lines 142–179).

* **UI Entry Points:** "Allocate stock" button in `OrderCard` (`src/components/OrderCard.tsx`, line 94) and `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 62).

* **Behaviour:** Ranks active zones per line item using `scoreZone`, proposes stock allocations, and passes them to `applyStockReservation`. This calculates available stock (`onHand - reserved + alreadyReserved`), fills lot codes, records shortages, and updates `item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity` (`src/stock/reservation.ts`, lines 11–45).

2. **Shipment Release Pre-Validation (`releaseShipment` in `src/dispatch/releaseService.ts`, line 28)**

* **Store Action:** `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`, lines 208–236).

* **UI Entry Point:** "Release shipment" button on `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 78).

* **Behaviour:** Re-evaluates existing order allocations against current zone stock using `applyStockReservation` to verify zero shortages prior to shipment validation and stock commitment.

3. **Background Reservation Revalidation (`revalidateReservations` in `src/jobs/revalidation.ts`, line 17)**

* **Store Trigger:** `startRevalidationJob` (`src/jobs/revalidation.ts`, lines 50–61), invoked inside `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`, lines 104–121).

* **Behaviour:** Runs every 60 seconds across open orders with status `allocated`, `picking`, or `ready`, calling `applyStockReservation` to recalculate reserved stock against cloned working zones.

---

Test-Only Call Sites
**Direct execution (`src/tests/reservation.test.ts`, lines 21 & 32):** Calls `applyStockReservation` directly to assert that reserved quantities increment, lot codes attach, and shortages are reported without causing negative availability.
**Indirect execution (`src/tests/allocation.test.ts`, lines 17, 30, & 39):** Executes `allocateOrder`, which internally calls `applyStockReservation`.

---

Related Operations (Resets, Decrements, and Initial Seed Data)
**Working State Reset (`src/jobs/revalidation.ts`, line 12):** `revalidateReservations` sets `reserved: 0` across cloned zone stock before re-applying reservations; this resets working state rather than reserving stock.
**Stock Commitment / Decrement (`src/stock/stockService.ts`, line 27):** `commitReleasedStock` reduces `item.reserved` and `item.onHand` when outbound shipments are finalized, consuming existing reservations rather than creating new ones.
**Static Seed Data (`src/data/seedData.ts`, lines 359–466):** Initial `reserved` values (such as 25 reserved units for `BX-100` in zone `ZA-01`) are defined inside `seedZones` to populate store state on app startup.
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
Before an outgoing API request is sent to the mock server in `src/api/mock-server.ts`, `src/api/api-client.ts` constructs an initial `ApiRequest` object with default headers and empty metadata, then sequentially transforms it through three request interceptors registered in `src/api/interceptors/index.ts`: `authInterceptor`, `auditInterceptor`, and `hazardousInterceptor`.

---

Sequential Request Transformation Flow

#### 1. Initial Request Object Construction

When `apiClient.get()` or `apiClient.patch()` is invoked (from `src/dispatch/orderService.ts`), the internal `request()` function in `src/api/api-client.ts` creates an `ApiRequest` object:

`path`: string endpoint path (e.g., `"/orders"` or `"/orders/${id}"`).
`method`: HTTP method (`"GET"` or `"PATCH"`).
`body`: request body payload or `undefined`.
`headers`: `{ accept: "application/json" }`.
`metadata`: `{}`.

#### 2. Interceptor Pipeline Execution

`src/api/api-client.ts` passes this request to `applyInterceptors()`, which iterates sequentially over the interceptor array `[authInterceptor, auditInterceptor, hazardousInterceptor]` in `src/api/interceptors/index.ts`:

1. **Authentication Interceptor** (`src/api/interceptors/auth-interceptor.ts`):

Appends `authorization: "Bearer warehouse-console-session"` to `headers`.

2. **Audit Interceptor** (`src/api/interceptors/audit-interceptor.ts`):

Appends `"x-requested-at"` (current ISO timestamp) to `headers`, sets `metadata.source = "dispatch-console"`, and generates a unique `metadata.correlationId` using `crypto.randomUUID()`.

3. **Hazardous Order Interceptor** (`src/api/interceptors/hazardous-interceptor.ts`):

Inspects `request.body`:

* **Hazardous orders** (`body?.type === "hazardous"`): Replaces `"/orders"` with `"/controlled/orders"` in `path`, sets header `"x-controlled-load": "true"`, and sets `metadata.routing = "dangerous-goods"`.

* **Non-hazardous or GET requests** (`body` is missing or `body?.type !== "hazardous"`): Returns the request object without modification.

#### 3. Dispatch to Mock Transport

`src/api/api-client.ts` returns the fully transformed `ApiRequest` and passes it directly to `handleRequest()` in `src/api/mock-server.ts`.

---

Evidence Grounding & Call Flow Distinctions
**Direct Evidence**:

* Request creation structure: `src/api/api-client.ts` (lines 11–17).

* Pipeline registration and loop: `src/api/interceptors/index.ts` (lines 8–18).

* Header and metadata mutations: `src/api/interceptors/auth-interceptor.ts` (lines 4–9), `src/api/interceptors/audit-interceptor.ts` (lines 3–11), and `src/api/interceptors/hazardous-interceptor.ts` (lines 4–13).

* Hand-off to mock transport: `src/api/mock-server.ts` (lines 12–21).

* Active application callers: `src/dispatch/orderService.ts` (lines 5, 11, 18).

**Unused Code**:

* `apiClient.post` is exported in `src/api/api-client.ts` (lines 22–27), but no runtime caller in `src/dispatch/orderService.ts` or other application components invokes it.

**Inference**:

* Outgoing API calls do not issue real HTTP requests over the wire; `handleRequest()` in `src/api/mock-server.ts` serves as an in-memory mock transport layer.
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
`validateShipment` does not only perform validation checks; it also mutates the passed `shipment` object in-place by assigning its `dock` property (`shipment.dock`). It does not directly modify persistent store state or make network API calls itself.

Code Evidence

In `src/dispatch/validation.ts`:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

return { valid: errors.length === 0, errors, warnings };

```

Context and Execution Flow

1. **In-Place Mutation**:

`validateShipment` accepts `shipment: Shipment` and unconditionally assigns `shipment.dock` before returning (`src/dispatch/validation.ts`). If `order.type === "hazardous"`, `shipment.dock` is set to `"D4"`. Otherwise, it assigns `"D1"`, `"D2"`, or `"D3"` based on the character code sum of `order.id` modulo 3. This mutation happens regardless of whether the validation passes or accumulates errors in `errors`.

2. **Production Runtime Flow (`src/dispatch/releaseService.ts` and `src/store/useWarehouseStore.ts`)**:

- In `releaseShipment` (`src/dispatch/releaseService.ts`), the `shipment` object is created without a `dock` property.

- `releaseShipment` calls `validateShipment(shipment, order)`, which assigns `shipment.dock` via object reference mutation.

- If validation fails (`!validation.valid`), `releaseShipment` throws an exception, preventing state persistence.

- If validation succeeds, `shipment.dock` propagates to:

- `releasedOrder.assignedDock`, which `useWarehouseStore.release()` passes to `saveOrder` (`src/dispatch/orderService.ts`) to update application state and back-end records.

- `log.detail` (`${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}`).

- The `"shipment.released"` event emitted on `eventBus` (`src/events/bus.ts`), which `installNotificationListeners` (`src/notifications/listener.ts`) listens to for generating dock loading notifications.

- The Order Detail UI (`src/pages/OrderDetailPage.tsx`), which renders `order.assignedDock`.

3. **Test Context (`src/tests/validation.test.ts`)**:

The unit test suite passes a shipment candidate directly to `validateShipment` and explicitly verifies that `candidate.dock` was populated (`expect(candidate.dock).toBe("D4")` and `expect(candidate.dock).toMatch(/^D[1-3]$/)`).
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
For a bulk order (`order.type === "bulk"`), the **legacy pricing implementation**—`calculateLegacyPrice` defined in `src/pricing/legacyPricing.ts`—runs.

Why Legacy Pricing Runs

1. **Invocation via Allocation**: When stock allocation is triggered from the UI (`src/components/OrderCard.tsx` or `src/pages/OrderDetailPage.tsx`), the Zustand store's `allocate` action in `src/store/useWarehouseStore.ts` invokes `allocateOrder` in `src/dispatch/allocator.ts`. As part of finalizing the allocated order object, `allocateOrder` evaluates `order.total` by calling `calculateOrderPrice(prepared)` in `src/pricing/pricing.ts`.

2. **Strategy Resolution by Order Type**: Inside `calculateOrderPrice` (`src/pricing/pricing.ts`), the strategy is retrieved by calling `pricingStrategyFor(order)` from `src/config/zoneRules.ts`. `pricingStrategyFor` performs a dictionary lookup on `pricingByType`:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

For orders where `type` equals `"bulk"`, `pricingStrategyFor` returns `"legacy"`.

3. **Branch Execution**: Upon receiving `"legacy"`, `calculateOrderPrice` executes the early return check `if (strategy === "legacy") return calculateLegacyPrice(order);` (`src/pricing/pricing.ts`), delegating the calculation directly to `calculateLegacyPrice(order)` in `src/pricing/legacyPricing.ts`. (This configuration and strategy selection are directly tested in `src/tests/pricing.test.ts`).

---

Selected Implementation Behaviour

`calculateLegacyPrice` (`src/pricing/legacyPricing.ts`) calculates the total using a pallet-based handling fee and subtotal volume discount model:

**Subtotal**: Calculates line item total as $\sum (\text{quantity} \times \text{unitPrice})$.
**Pallet Calculation & Handling Charge**: Calculates total line weight as $\sum (\text{quantity} \times \text{weightKg})$. It determines pallet count via `Math.max(1, Math.ceil(weight / 500))` and applies a handling charge of $18.50 per pallet (`pallets * 18.5`).
**Volume Discount**: Calculates a discount off the subtotal:

* 7.5% if subtotal is greater than $5,000 (`subtotal * 0.075`).

* 4% if subtotal is greater than $2,000 (`subtotal * 0.04`).

* $0 otherwise.

**Final Total**: Returns `Number((subtotal + handling - volumeDiscount).toFixed(2))`.
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
When a dispatch event is emitted over `eventBus` (`src/events/bus.ts`), reactions occur for two of the four declared event types, while the remaining two have no registered listeners.

Event Bus Reactions by Event Type

1. **`shipment.released`**

* **Emission Site:** `releaseShipment()` in `src/dispatch/releaseService.ts` emits `eventBus.emit("shipment.released", { order: releasedOrder, shipment })`.

* **Active Listener:** `src/notifications/listener.ts` (registered when `App.tsx` calls `installNotificationListeners()` during component mounting).

* **Reaction & Downstream Flow:** The listener calls `publishNotification()` (`src/notifications/service.ts`) with a `success` notification detailing the order ID, package count, and assigned dock. `publishNotification()` unshifts the object onto a `pending` queue. The store initializer in `src/store/useWarehouseStore.ts` sets a 300ms polling interval that calls `drainNotifications()`, transferring pending items into store state to be rendered by `<Toasts />` (`src/components/Toasts.tsx`).

2. **`stock.low`**

* **Emission Site:** `commitReleasedStock()` in `src/stock/stockService.ts` emits `eventBus.emit("stock.low", { sku: item.sku, zoneId: allocation.zoneId, available })` when remaining availability (`onHand - reserved`) is at or below the item's `reorderPoint`.

* **Active Listeners (2 total):**

1. `src/stock/stockService.ts`: Registered at module evaluation time when the module is imported. It unshifts a formatted log string into the local `lowStockSignals` array (defined but not reached by the running application, as `getLowStockSignals()` has no live caller) and caps the array size at 20 entries.

2. `src/notifications/listener.ts`: Registered via `installNotificationListeners()` in `App.tsx`. It calls `publishNotification()` (`src/notifications/service.ts`) with a `warning` notification detailing the SKU and remaining zone inventory, which is polled into store state and displayed in the UI via `<Toasts />`.

3. **`order.allocated`**

* **Emission Site:** `allocateOrder()` in `src/dispatch/allocator.ts` emits `eventBus.emit("order.allocated", { order })` when all line quantities are allocated (`complete === true`).

* **Active Listeners:** None. No file in the repository registers a subscriber for `order.allocated`.

4. **`notification.created`**

* **Emission Site:** `publishNotification()` in `src/notifications/service.ts` emits `eventBus.emit("notification.created", { notification })` whenever a notification is created.

* **Active Listeners:** None. The toast notification system retrieves notifications by store polling (`drainNotifications()` in `src/store/useWarehouseStore.ts`) rather than listening to this event bus signal.

---

Registered Listener Summary

| Event Name | Registered Subscribers | Runtime Registration Point | Executed Reaction |

| :--- | :--- | :--- | :--- |

| `shipment.released` | `src/notifications/listener.ts` | React mount (`src/App.tsx` calling `installNotificationListeners`) | Queues success notification for dock loading; polled into store and rendered in `<Toasts />` |

| `stock.low` | 1. `src/stock/stockService.ts`<br>2. `src/notifications/listener.ts` | 1. Module evaluation (`src/stock/stockService.ts`) <br>2. React mount (`src/App.tsx`) | 1. Appends signal message to `lowStockSignals` array (max 20 entries; subsystem defined but not reached by the running application)<br>2. Queues low-stock warning notification for toast UI |

| `order.allocated` | *None* | N/A | No listener execution |

| `notification.created` | *None* | N/A | No listener execution |

---

Basis of Claims & Evidence
**Direct Evidence:**

* Event map definitions and emit methods are directly verified in `src/events/bus.ts`, `src/dispatch/releaseService.ts`, `src/dispatch/allocator.ts`, `src/stock/stockService.ts`, and `src/notifications/service.ts`.

* Event subscriptions (`eventBus.on`) exist exclusively in `src/notifications/listener.ts` and `src/stock/stockService.ts`.

* Store polling of `pending` notifications is implemented via `setInterval` in `src/store/useWarehouseStore.ts`.

**Inference:**

* `order.allocated` and `notification.created` are declared in `WarehouseEvents` (`src/events/bus.ts`) and emitted by domain functions, indicating they were authored as extension points for unbuilt handlers or external telemetry integration.
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
To add a new order type to the application, the following required and conditional code changes are needed across the repository:

1. Mandatory Code Changes
**Domain Type Definition (`src/types/domain.ts`)**

* Update the `OrderType` union type to include the new type string:

```typescript

export type OrderType = "standard" | "express" | "bulk" | "hazardous" | "your_new_type";

```

**Dispatch Handler Implementation (`src/dispatch/handlers/`)**

* Create a new TypeScript file inside `src/dispatch/handlers/` alongside existing handler modules (`src/dispatch/handlers/standardHandler.ts`, `src/dispatch/handlers/expressHandler.ts`, `src/dispatch/handlers/bulkHandler.ts`, `src/dispatch/handlers/hazardousHandler.ts`).

* In the new file, implement `DispatchHandler` and register it using `registerHandler` from `src/dispatch/handlers/registry.ts`.

* *Runtime Flow:* `getHandler(type)` in `src/dispatch/handlers/registry.ts` uses `import.meta.glob("./*.ts")` to auto-load all files in `src/dispatch/handlers/`. Both `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`) invoke `getHandler(order.type)` and will throw a runtime exception if a handler for the new type is missing.

**Zone Rules and Pricing Strategy Mappings (`src/config/zoneRules.ts`)**

* TypeScript will flag missing key errors on both `Record<OrderType, ...>` lookup objects until they include the new order type:

* `typeKinds`: Maps the order type to a prioritized array of zone kinds (`Zone["kind"][]`) used by `scoreZone` during allocation.

* `pricingByType`: Maps the order type to its `PricingStrategy` (`"current"` or `"legacy"`).

**Order Filter UI (`src/pages/OrderListPage.tsx`)**

* Add the new type string to the local `types` array so operators can filter by the new order type in the toolbar select dropdown:

```typescript

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

2. Conditional / Feature-Specific Updates

Depending on the specific domain rules for the new order type:

**Shipment Release Validation (`src/dispatch/validation.ts`)**

* Update `validateShipment` if the new order type requires specific dock assignment logic or restricted carrier rules (for example, how `hazardous` orders enforce `SecureChem Logistics` and assign dock `"D4"`).

**Order Pricing Rules (`src/pricing/pricing.ts` or `src/pricing/legacyPricing.ts`)**

* Update `calculateOrderPrice` if orders of the new type incur custom handling charges, extra fees, or custom surcharges.

**API Interceptors (`src/api/interceptors/` and `src/api/interceptors/index.ts`)**

* Add a `RequestInterceptor` if API calls for the new order type require specialized path rewriting or custom request headers (analogous to `src/api/interceptors/hazardous-interceptor.ts`).

**Seed Data (`src/data/seedData.ts`)**

* Update `orderSpecs` (typed as `Array<[OrderType, Priority, Array<[Sku, number]>, number]>`) to include mock orders of the new type.

**Test Suites (`src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, `src/tests/validation.test.ts`)**

* Add unit tests covering allocation scoring, pricing calculations, and shipment validation for the new order type.
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
Modifying `src/config/zoneRules.ts` affects two direct calculation pathways during order allocation and pricing: zone candidate scoring via `scoreZone` and order pricing strategy lookup via `pricingStrategyFor`. Downstream runtime effects are triggered when an operator runs `allocate(id)` in `src/store/useWarehouseStore.ts`, changing allocated zone choices, lot code assignments, stock reservation levels, order completion statuses (`"allocated"` vs `"held"`), total order prices, audit logs, and several UI views.

---

Direct Calculation & Execution Effects

#### 1. Candidate Zone Scoring and Ranking

**Execution Flow:** In `src/dispatch/allocator.ts`, `allocateOrder` scores candidate zones for each order line by calling `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`).
**Scoring Logic:** `scoreZone` calls `rulesFor(order, line)` to filter rules where `rule.applies(order, line)` returns `true`. For every matching rule, it adds `rule.prefer(zone, order, line)` if `rule.zoneKinds` contains `zone.kind`, or applies a `-25` score penalty if `zone.kind` is not included (`src/config/zoneRules.ts`). When `rule.zoneKinds.includes(zone.kind)` evaluates to `false`, control returns early for that rule iteration to add the `-25` penalty, skipping `rule.prefer(zone, order, line)`.
**Candidate Selection vs Ranking:** Scoring penalizes or boosts candidate zones to rank them rather than filtering them out. Active status (`zone.active`) and SKU availability (`zone.stock.some(...)`) in `src/dispatch/allocator.ts` determine candidate eligibility before candidates are sorted by score descending.
**Downstream Allocation Outcomes:**

* **Zone and Lot Selection:** Dictates which zone fulfills line quantities and determines the `lotCode` assigned to each `Allocation` in `src/stock/reservation.ts`.

* **Stock Reservations:** Updates `item.reserved` quantities on target stock items across `zones` in state (`src/stock/reservation.ts`).

* **Completion Status:** If candidate score reordering routes lines to zones with insufficient available stock (`item.onHand - item.reserved`), unallocated unit warnings are produced and `order.status` resolves to `"held"` instead of `"allocated"` (`src/dispatch/allocator.ts`).

* **Event Emissions:** If all lines are fully allocated, `allocateOrder` emits `order.allocated` on `eventBus` (`src/dispatch/allocator.ts`). There are currently 0 registered listeners for `order.allocated` in `src/notifications/listener.ts` or elsewhere in the codebase.

#### 2. Order Pricing Strategy Resolution

**Execution Flow:** `calculateOrderPrice` (`src/pricing/pricing.ts`) calls `pricingStrategyFor(order)` (`src/config/zoneRules.ts`).
**Lookup Logic:** `pricingStrategyFor` looks up strategies via `pricingByType[order.type]`. *(Note: The `pricing` property present on individual `ZoneRule` objects is defined on the interface in `src/config/zoneRules.ts` but is unused by `pricingStrategyFor` and pricing helpers).*
**Price Calculation:** If `pricingStrategyFor` returns `"legacy"`, pricing routes to `calculateLegacyPrice` (`src/pricing/legacyPricing.ts`). Otherwise, `calculateOrderPrice` sums line subtotals, weight-based handling fees (max of $7.50 or $0.11/kg), priority fees ($45 for critical, $20 for urgent), and dangerous goods surcharges ($65).
**Downstream Price Outcomes:** Sets `order.total`, which `allocateOrder` assigns to the order before saving (`src/dispatch/allocator.ts`).

---

Affected Application State, UI Views, and Components

#### Store State (`src/store/useWarehouseStore.ts`)

Running `allocate(id)` invokes `allocateOrder` and persists changes via `saveOrder` (`src/dispatch/orderService.ts`), modifying:

`orders`: Updates the target order's `allocations`, `status` (`"allocated"` or `"held"`), and calculated `total`.
`zones`: Updates reserved stock quantities returned by `applyStockReservation`.
`logs`: Prepends a new dispatch log entry with action `"allocated"` or `"held"`.

#### UI Views and Components

**`OrderCard` (`src/components/OrderCard.tsx`) & `OrderListPage` (`src/pages/OrderListPage.tsx`):** Displays updated order `total`, allocation progress (`allocated` vs `units`), status pills (`status-allocated` vs `status-held`), action button states, and summary counts for incoming, urgent, ready, and held orders.
**`OrderDetailPage` (`src/pages/OrderDetailPage.tsx`):** Displays order status, allocation chips (`zoneId` and quantity), total order price, available workflow action buttons, and zone availability stats.
**`ZoneOverviewPage` (`src/pages/ZoneOverviewPage.tsx`) & `ZoneCard` (`src/components/ZoneCard.tsx`):** Renders updated zone capacity utilization percentages, reserved stock totals, available stock (`onHand - reserved`), and reorder alerts (`available <= reorderPoint`).
**`DispatchLogPage` (`src/pages/DispatchLogPage.tsx`):** Displays audit trail entries generated during allocation calls.
**`Layout` (`src/components/Layout.tsx`):** Updates the sidebar count of incoming orders awaiting allocation.

---

Affected Unit Tests
**`src/tests/allocation.test.ts`:** Tests express order allocation to preferred fast-pick zone `ZB-02`, hazardous item placement in secure zone `ZS-04`, and order hold behavior on stock shortages.
**`src/tests/pricing.test.ts`:** Tests `pricingStrategyFor` resolution (mapping `bulk` to `"legacy"`) and handling fee outputs from `calculateOrderPrice`.
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
Yes, hazardous orders (order `type === "hazardous"`) and individual hazardous lines (`line.hazardous === true`) are handled through specialized logic across API request routing, dispatch wave preparation and inspection, inventory zone scoring, pricing calculations, shipment validation, dock assignment, and UI display.

---

1. API Request Routing
**`src/api/interceptors/hazardous-interceptor.ts`** (applied via `applyInterceptors` in `src/api/interceptors/index.ts` during `apiClient` requests in `src/api/api-client.ts`):

When a request body contains `type: "hazardous"` (such as when `saveOrder` in `src/dispatch/orderService.ts` saves a hazardous order):

* Modifies `request.path` by replacing `/orders` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Adds metadata `routing: "dangerous-goods"`.

* *(Note: `src/api/mock-server.ts` normalizes `/controlled/orders` back to `/orders` when serving mock responses.)*

---

2. Dispatch Wave Handling
**`src/dispatch/handlers/hazardousHandler.ts`** (registered for `type: "hazardous"` and loaded via `getHandler` in `src/dispatch/handlers/registry.ts` during `allocateOrder` in `src/dispatch/allocator.ts` and `releaseShipment` in `src/dispatch/releaseService.ts`):

* **`prepare(order)`**: Appends `"Dangerous goods paperwork required"` to `order.notes` and sets `order.priority = "urgent"`.

* **`inspect(order)`**: Returns a warning issue if no line has `hazardous: true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **`shipmentDefaults(order)`**: Defaults the carrier to `"SecureChem Logistics"` and sets `packageCount` based on 4 units per package (`Math.max(1, Math.ceil(units / 4))`).

---

3. Inventory Zone Allocation & Preference Scoring
**`src/config/zoneRules.ts`**:

* **`typeKinds`**: Maps `hazardous` order type to `["secure"]` zone kinds.

* **`hazard-isolation` rule**: Triggers if `order.type === "hazardous"` or `line.hazardous === true`. Ranks `secure` zones with a `+80` preference score and non-secure zones with a `-100` penalty score (which, combined with rule-mismatch scores in `scoreZone`, ranks secure zones highest for candidate selection in `allocateOrder`).

---

4. Pricing & Surcharges
**`src/pricing/pricing.ts`**:

* **Dangerous Goods Surcharge**: In `calculateOrderPrice`, if any line has `line.hazardous === true`, a flat **$65** fee (`hazardousFee`) is added to the order total.

* **Priority Surcharge**: Because `hazardousHandler.ts` sets `order.priority = "urgent"`, allocating a hazardous order adds a **$20** priority fee (`priorityFee`).

---

5. Shipment Validation & Dock Assignment
**`src/dispatch/validation.ts`**:

* **Carrier Constraint**: If `order.type === "hazardous"`, the carrier must be `"SecureChem Logistics"`; otherwise validation fails with `"Approved dangerous goods carrier required"`.

* **Dock Assignment**: Sets `shipment.dock = "D4"` for `hazardous` orders, bypasses the standard dock rotation (`D1`–`D3`).

---

6. UI Filtering & Line Badges
**`src/pages/OrderListPage.tsx`**:

* Includes `"hazardous"` in the `Order type` filter dropdown options.

**`src/pages/OrderDetailPage.tsx`**:

* Displays a `Controlled` badge (`<em>Controlled</em>`) alongside any order line where `line.hazardous === true`.
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
A dock is assigned to a shipment inside the `validateShipment` function in `src/dispatch/validation.ts` via in-place mutation of the `shipment.dock` property.

---

Execution and Control Flow Details

1. **Dock Calculation and Mutation (`src/dispatch/validation.ts`):**

* Inside `validateShipment(shipment, order)`, the function mutates the passed `shipment` object:

* If `order.type === "hazardous"`, `shipment.dock` is assigned `"D4"`.

* Otherwise, `order.id` is converted into a numeric sum of its ASCII character codes (`numeric`), and `shipment.dock` is set to `docks[numeric % 3]`, selecting `"D1"`, `"D2"`, or `"D3"` from `const docks = ["D1", "D2", "D3", "D4"]`.

2. **Live Application Call Path (`src/dispatch/releaseService.ts`):**

* During execution of `releaseShipment(order, zones, actor)`, an initial `shipment` object is constructed without a `dock` property.

* `releaseShipment` calls `validateShipment(shipment, order)`, which assigns `shipment.dock`.

* After validation succeeds, `shipment.dock` is consumed in three downstream locations:

* Setting `assignedDock: shipment.dock` on the `releasedOrder` object returned by the function and persisted via `saveOrder`.

* Formatting the `log.detail` string recorded in the store audit log.

* Emitting the `shipment.released` event on `eventBus`, which `installNotificationListeners` (`src/notifications/listener.ts`) consumes to display dock loading toasts in the UI.

3. **Test Invocation (`src/tests/validation.test.ts`):**

* `validateShipment` is directly called in unit tests to verify dock assignment logic for standard (`"D1"`–`"D3"`) and dangerous goods (`"D4"`) orders.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

