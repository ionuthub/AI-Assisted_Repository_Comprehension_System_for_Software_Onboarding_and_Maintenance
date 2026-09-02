# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 5b93921dfcd939b8060d37574b6f8adf4ad45a870b188b6dc27b90681fe18cb6 -->

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
Execution starts at **`index.html`**, where the browser loads the root DOM container and fetches the module entry point, which executes **`src/main.tsx`** to mount the React component tree and initialize background services.

---

Execution Flow & Entry Sequence

#### 1. Document & Script Loading

**`index.html`** (lines 1–2): The browser loads the HTML container `<div id="root"></div>` and executes the module script `<script type="module" src="/src/main.tsx"></script>`.

#### 2. JavaScript Module Evaluation & React Mounting

**`src/main.tsx`** (lines 6–10): The module entry point calls `ReactDOM.createRoot()` targeting `#root` and renders the top-level `<App />` component wrapped in `<React.StrictMode>`.

#### 3. Router Creation & Component Render

**`src/App.tsx`** (lines 11–22, 24–31):

1. Module evaluation executes `createBrowserRouter`, defining the route layout (`/`, `orders/:orderId`, `zones`, `log`) centered around `<Layout />`.

2. Rendering `<App />` returns `<RouterProvider router={router} />`.

#### 4. Post-Mount Effects & Background Initialization

**`src/App.tsx`** (lines 25–29): A `useEffect` hook fires after mount to set up global listeners and background jobs:

* **`installNotificationListeners()`** (`src/notifications/listener.ts`, lines 6–23): Registers event listeners on `eventBus` (`src/events/bus.ts`, lines 11–18) for `"shipment.released"` and `"stock.low"`.

* **`initialize()`** (`src/store/useWarehouseStore.ts`, lines 80–118):

1. Sets the Zustand store's `initialized` flag to `true`.

2. Starts a 300 ms interval polling loop (`drainNotifications`) to pull notifications into state.

3. Calls `startRevalidationJob` (`src/jobs/revalidation.ts`, lines 51–62) to spawn a 60,000 ms (60 s) recurring background job that runs `revalidateReservations` on current state.

4. Attaches a `beforeunload` window event listener to clear intervals upon page exit.

---

Direct Evidence Citations
**HTML Host Entry**: `index.html` (lines 1–2)
**React Root Render**: `src/main.tsx` (lines 6–10)
**Router & Root Effect**: `src/App.tsx` (lines 11–22, 24–31)
**Event Listener Setup**: `src/notifications/listener.ts` (lines 6–23)
**Store State & Background Job Initialization**: `src/store/useWarehouseStore.ts` (lines 80–118) and `src/jobs/revalidation.ts` (lines 51–62)
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
An order is assigned to one or more warehouse zones on a line-by-line basis when stock allocation is triggered from the UI or store action, executing `allocateOrder(order, zones)` in `src/dispatch/allocator.ts`. The allocator scores candidate zones using business rules, sorts candidates by score, fulfills requested quantities from available stock across candidate zones, and commits reservations to the zone stock model.

---

Execution Pipeline & Control Flow

#### 1. Entry Point & Trigger

**UI Triggers**: Users click the **Allocate stock** button in `OrderListPage` (`src/pages/OrderListPage.tsx`, rendered via `OrderCard` in `src/components/OrderCard.tsx`) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`).
**Store Action**: UI handlers call `allocate(id)` on `useWarehouseStore` (`src/store/useWarehouseStore.ts`), which sets loading state for the order ID and retrieves the order and zones from state.

#### 2. Handler Preparation & Inspection

Inside `allocateOrder(input, zones)` (`src/dispatch/allocator.ts`):

`getHandler(input.type)` dynamically loads and retrieves the registered handler for the order's type from `src/dispatch/handlers/registry.ts`.
`handler.prepare(structuredClone(input))` returns a prepared `Order` copy with handler-specific updates (e.g., `expressHandler.ts` sets `priority = "critical"`; `hazardousHandler.ts` sets `priority = "urgent"`; `bulkHandler.ts`, `expressHandler.ts`, `hazardousHandler.ts`, and `standardHandler.ts` append operational notes).
`handler.inspect(prepared)` runs type-specific validation rules and returns initial warning strings.

#### 3. Zone Candidate Scoring & Filtering

For each line (`OrderLine`) in `prepared.lines`:

Candidate zones are filtered from `zones` where `zone.active === true` and `zone.stock` contains an item matching `line.sku`.
Candidate zones are scored by `scoreZone(zone, prepared, line)` in `src/config/zoneRules.ts`.
`rulesFor(order, line)` filters `zoneRules` by `rule.applies(order, line)` and sorts applicable rules in descending order by `score` (`hazard-isolation`: 100 $\rightarrow$ `cold-chain`: 90 $\rightarrow$ `type-routing`: 50 $\rightarrow$ `capacity-balance`: 10).
In `scoreZone`, if `rule.zoneKinds` does not include `zone.kind`, `25` is subtracted from the score. Otherwise, `rule.prefer(zone, order, line)` is added:

1. **Hazard Isolation** (`score: 100`, `zoneKinds: ["secure"]`): Applies if `order.type === "hazardous"` or `line.hazardous`. Returns `80` for `secure` zones, `-100` otherwise.

2. **Cold Chain** (`score: 90`, `zoneKinds: ["cold"]`): Applies if `line.temperature !== "ambient"`. Returns `70` if `zone.temperature === line.temperature`, `-100` otherwise.

3. **Type Routing** (`score: 50`, `zoneKinds: ["general", "fast-pick", "bulk", "secure"]`): Applies to all orders. Checks position of `zone.kind` in `typeKinds[order.type]` (`standard`: `["general", "fast-pick"]`; `express`: `["fast-pick", "general"]`; `bulk`: `["bulk", "general"]`; `hazardous`: `["secure"]`). Returns `-50` if missing, or `40 - position * 10` if present.

4. **Capacity Balance** (`score: 10`, `zoneKinds: ["general", "fast-pick", "bulk", "secure", "cold"]`): Applies to all orders. Calculates zone utilization from on-hand stock and returns `Math.round((1 - used / zone.capacity) * 20)`.

#### 4. Line Fulfillment & Quantity Assignment

Candidates are sorted in descending order of total score (`right.score - left.score`).
The allocator iterates over candidates, evaluating available stock (`Math.max(0, item.onHand - item.reserved)`).
It assigns `quantity = Math.min(remaining, available)`. If `quantity > 0`, it creates a proposed `Allocation` object (`{ lineId, sku, zoneId, quantity, reservedAt, lotCode }`) and subtracts `quantity` from `remaining`.
If `remaining > 0` after checking all candidate zones, a warning string is added to `warnings`.

#### 5. Reservation Finalization, Store Update, & Persistence

`applyStockReservation(prepared, proposed, zones)` in `src/stock/reservation.ts` clones `zones`, updates `item.reserved` quantities on the stock items, attaches the stock item's `lotCode` to accepted allocations, and returns shortage warnings if availability was insufficient.
Shortages are appended to `warnings`. If all requested line quantities were fulfilled, the order status is set to `"allocated"`; otherwise, it is set to `"held"`.
Order total is computed via `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`).
If fully satisfied, `eventBus.emit("order.allocated", { order })` is executed (`src/events/bus.ts`). Note: No active listener is currently registered for `"order.allocated"` in `installNotificationListeners` (`src/notifications/listener.ts`).
`useWarehouseStore.allocate` saves the updated order via `saveOrder(result.order)` (`src/dispatch/orderService.ts`, which sends a `PATCH` request through `apiClient` in `src/api/api-client.ts`), replaces `orders` and `zones` in Zustand state, and prepends a log entry (`"allocated"` or `"held"`) to `logs`.

---

Supporting Evidence Citation
**`src/pages/OrderListPage.tsx` & `src/pages/OrderDetailPage.tsx`**: UI entry points for triggering order allocation.
**`src/store/useWarehouseStore.ts`**: Implements store action `allocate(id)`, manages `orders`, `zones`, `logs`, and calls `saveOrder`.
**`src/dispatch/allocator.ts`**: Defines `allocateOrder`, executing handler preparation, scoring, candidate sorting, quantity assignment, and stock reservation.
**`src/dispatch/handlers/registry.ts`**: Dynamic registry mapping order types to handlers (`bulkHandler.ts`, `expressHandler.ts`, `hazardousHandler.ts`, `standardHandler.ts`).
**`src/config/zoneRules.ts`**: Defines `zoneRules`, `typeKinds`, `rulesFor`, and `scoreZone` logic.
**`src/stock/reservation.ts`**: Implements `applyStockReservation` to mutate `reserved` counts on cloned zones and assign lot codes.
**`src/pricing/pricing.ts`**: Calculates total order price based on pricing strategy.
**`src/events/bus.ts`**: Defines `eventBus` emitting `"order.allocated"`.
**`src/jobs/revalidation.ts`**: Periodically re-evaluates active reservations via `revalidateReservations` using `applyStockReservation`.
**`src/tests/allocation.test.ts`**: Automated test suite verifying zone allocation strategy behavior.
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
An order's type (`standard`, `express`, `bulk`, or `hazardous`) is processed according to logic distributed across four distinct areas of the codebase:

1. **Type-Specific Handlers and Registry** (`src/dispatch/handlers/registry.ts` and `src/dispatch/handlers/*.ts`): Dynamically resolves type-specific preparation, inspection warnings, and shipment defaults.

2. **Zone Routing and Pricing Configuration** (`src/config/zoneRules.ts`): Maps order types to preferred warehouse storage zones and determines pricing strategies.

3. **Shipment Dock and Carrier Validation** (`src/dispatch/validation.ts`): Enforces specific dock assignments and carrier restrictions for dangerous goods.

4. **API Network Interception** (`src/api/interceptors/hazardous-interceptor.ts`): Re-routes dangerous goods network requests to controlled endpoints.

---

1. Handler Registry and Type Handlers (`src/dispatch/handlers/`)

The handler registry (`src/dispatch/handlers/registry.ts`) dynamically loads all module files in `src/dispatch/handlers/*.ts` via `import.meta.glob`. The function `getHandler(order.type)` returns a registered `DispatchHandler` interface implementing `prepare()`, `inspect()`, and `shipmentDefaults()`:

**Standard Handler** (`src/dispatch/handlers/standardHandler.ts`):

* `prepare()`: Appends `"Standard pick wave assigned"` to `order.notes`.

* `inspect()`: Flags warnings if `order.lines` is empty (`"Order contains no lines"`) or if any line quantity exceeds 100 (`"Large line requires supervisor check"`).

* `shipmentDefaults()`: Defaults carrier to `"Northline Ground"` and calculates `packageCount = Math.max(1, Math.ceil(units / 12))`.

**Express Handler** (`src/dispatch/handlers/expressHandler.ts`):

* `prepare()`: Mutates `order.priority` to `"critical"` and appends `"Moved to express pick lane"` to `order.notes`.

* `inspect()`: Evaluates time remaining until `order.dueAt` using `differenceInMinutes`. Flags `"Express service window has elapsed"` if negative, or `"Less than 90 minutes remain"` if under 90 minutes.

* `shipmentDefaults()`: Defaults carrier to `"Apex Priority"` and calculates `packageCount = Math.max(1, Math.ceil(weight / 20))`.

**Bulk Handler** (`src/dispatch/handlers/bulkHandler.ts`):

* `prepare()`: Calculates total line weight in kg and appends `"Forklift requested for {weight} kg load"` to `order.notes`.

* `inspect()`: Flags warnings if total unit count is under 20 (`"Bulk order is below minimum handling quantity"`) or if `order.destination.company` is missing (`"Receiving company is required"`).

* `shipmentDefaults()`: Defaults carrier to `"Atlas Freight"` and calculates `packageCount = Math.max(1, Math.ceil(weight / 500))`.

**Hazardous Handler** (`src/dispatch/handlers/hazardousHandler.ts`):

* `prepare()`: Mutates `order.priority` to `"urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.

* `inspect()`: Flags warnings if no line item has `hazardous === true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* `shipmentDefaults()`: Defaults carrier to `"SecureChem Logistics"` and calculates `packageCount = Math.max(1, Math.ceil(units / 4))`.

---

2. Zone Routing and Pricing Configuration (`src/config/zoneRules.ts`)

`src/config/zoneRules.ts` governs inventory location scoring and order pricing based on `order.type`:

**Zone Preference (`typeKinds`)**:

* Maps `standard` $\rightarrow$ `["general", "fast-pick"]`

* Maps `express` $\rightarrow$ `["fast-pick", "general"]`

* Maps `bulk` $\rightarrow$ `["bulk", "general"]`

* Maps `hazardous` $\rightarrow$ `["secure"]`

* Evaluated inside `scoreZone()` via the `type-routing` rule. If a candidate zone matches position $P$ in `typeKinds[order.type]`, it receives $+ (40 - P \times 10)$ points; if unlisted, it receives a penalty of $-50$ points.

* In addition, the `hazard-isolation` rule specifically checks if `order.type === "hazardous" || line.hazardous`, scoring secure zones $+80$ and penalizing non-secure zones by $-100$.

**Pricing Strategy (`pricingByType`)**:

* Maps `bulk` $\rightarrow$ `"legacy"` strategy, which delegates to `calculateLegacyPrice()` (`src/pricing/legacyPricing.ts`), applying pallet handling fees and volume discounts.

* Maps `standard`, `express`, and `hazardous` $\rightarrow$ `"current"` strategy, calculated in `calculateOrderPrice()` (`src/pricing/pricing.ts`), which adds weight handling fees, priority surcharges ($45 for critical, $20 for urgent), and a flat $65 dangerous goods fee if regulated lines exist.

---

3. Shipment Validation (`src/dispatch/validation.ts`)

During the release flow (`releaseShipment()` in `src/dispatch/releaseService.ts`), `validateShipment()` applies rules based on `order.type`:

**Dock Assignment**: Assigns dock `"D4"` if `order.type === "hazardous"`. For non-hazardous types, assigns dock `"D1"`, `"D2"`, or `"D3"` based on a numeric hash of `order.id`.
**Carrier Enforcement**: Requires `shipment.carrier === "SecureChem Logistics"` when `order.type === "hazardous"`, rejecting release with `"Approved dangerous goods carrier required"` if any other carrier is supplied.

---

4. API Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)

When saving or updating orders through `apiClient` (`src/api/api-client.ts`), request bodies with `type === "hazardous"` pass through `hazardousInterceptor`:

Rewrites the request path from `/orders` to `/controlled/orders`.
Injects header `"x-controlled-load": "true"`.
Sets request metadata `routing: "dangerous-goods"`.

*(Note: The client mock server in `src/api/mock-server.ts` normalizes `/controlled/orders` back to `/orders` for local execution).*

---

Execution Points and UI Routing
**Allocation Execution** (`src/dispatch/allocator.ts`): Invokes `getHandler(input.type)` to execute `prepare()` and `inspect()`, applies `scoreZone()` for stock reservation, and calls `calculateOrderPrice()` to compute `order.total`.
**Shipment Release Execution** (`src/dispatch/releaseService.ts`): Invokes `getHandler(order.type)` to populate fallback shipment carrier and package counts, then calls `validateShipment()`.
**State & UI Filtering** (`src/store/useWarehouseStore.ts` and `src/pages/OrderListPage.tsx`): `filteredOrders()` filters the displayed order queue by `filters.type` selected from the UI dropdown in `OrderListPage`.
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
Stock reservation is performed by **1 core function** (`applyStockReservation`) executed across **3 live application entry points** and **1 unit test suite**.

---

1. Core Reservation Implementation
**`applyStockReservation` (`src/stock/reservation.ts`)**

* **Direct Evidence:** Clones the provided zones array and evaluates availability per requested allocation line. If inventory is available and `quantity > 0`, it updates reserved balances via `item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity` and attaches `lotCode` metadata to accepted allocations.

---

2. Live Application Call Sites

1. **Order Allocation Flow**

* **Location:** `allocateOrder` (`src/dispatch/allocator.ts`)

* **Direct Evidence:** Calls `applyStockReservation(prepared, proposed, zones)` to lock requested quantities in target warehouse zones.

* **Runtime Flow:** Invoked asynchronously via `useWarehouseStore.allocate(id)` (`src/store/useWarehouseStore.ts`), triggered when operators click "Allocate stock" in `OrderCard` (`src/components/OrderCard.tsx`) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`).

2. **Shipment Release Flow**

* **Location:** `releaseShipment` (`src/dispatch/releaseService.ts`)

* **Direct Evidence:** Calls `applyStockReservation(order, order.allocations, zones)` prior to validating the shipment to ensure allocated inventory remains available.

* **Runtime Flow:** Invoked asynchronously via `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`), triggered when operators click "Release shipment" in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`).

3. **Periodic Reservation Revalidation Job**

* **Location:** `revalidateReservations` (`src/jobs/revalidation.ts`)

* **Direct Evidence:** Resets working zone reservations to `0` and re-applies active order allocations sequentially using `applyStockReservation({ ...order, allocations: [] }, order.allocations, workingZones)`.

* **Runtime Flow:** Scheduled by `startRevalidationJob` (`src/jobs/revalidation.ts`) and started during application store initialization in `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`), running every 60 seconds.

---

3. Excluded Operations (Reductions, Resets, and Initial Fixtures)
**Stock Commit Sinking (`commitReleasedStock` in `src/stock/stockService.ts`):** Reduces `item.reserved` via `Math.max(0, item.reserved - allocation.quantity)` upon outbound shipment release. This consumes/clears existing reservations rather than reserving new stock.
**Revalidation State Cleansing (`revalidateReservations` in `src/jobs/revalidation.ts`):** Clears working zone reserved amounts to `0` before re-running reservations.
**Initial Seed Fixtures (`seedZones` in `src/data/seedData.ts`):** Sets baseline static `reserved` integers during initial mock state setup.

---

4. Test-Only Call Sites
**Unit Verification (`src/tests/reservation.test.ts`):** Calls `applyStockReservation` directly to verify reservation logic, lot assignment, and shortage reporting.
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
Before an outgoing API request is sent to the mock server, `apiClient` constructs an initial `ApiRequest` object and passes it through a sequential chain of asynchronous request interceptors managed in `src/api/interceptors/index.ts`. Each interceptor receives the request, transforms headers, metadata, or path, and returns a new request object before the finalized request is handed off to `handleRequest` in `src/api/mock-server.ts`.

---

1. Request Object Construction

When `apiClient.get`, `post`, or `patch` is invoked (`src/api/api-client.ts`), a base `ApiRequest` object is created with the following default properties:

`path`: target URL string passed by the caller
`method`: `"GET"`, `"POST"`, or `"PATCH"`
`body`: optional request body payload
`headers`: default object containing `{ accept: "application/json" }`
`metadata`: empty initial object `{}`

---

2. Interceptor Pipeline Execution

The request is passed to `applyInterceptors(initial)` in `src/api/interceptors/index.ts`, which processes three interceptors in fixed order:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

* Appends `authorization: "Bearer warehouse-console-session"` to `headers`.

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

* Appends `"x-requested-at"` with the current ISO timestamp (`new Date().toISOString()`) to `headers`.

* Sets `source: "dispatch-console"` and generates a unique `correlationId` using `crypto.randomUUID()` in `metadata`.

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

* Evaluates `request.body?.type === "hazardous"` (casting `body` as a partial order).

* **If false or missing**: Returns the request unaltered.

* **If true**:

* Replaces `/orders` in `path` with `/controlled/orders`.

* Appends `"x-controlled-load": "true"` to `headers`.

* Sets `routing: "dangerous-goods"` in `metadata`.

---

3. Hand-off to the Mock Request Handler

Once all interceptors finish (`src/api/api-client.ts`), the transformed request is passed to `handleRequest` (`src/api/mock-server.ts`):

`handleRequest` pauses for a artificial delay of 90ms (`setTimeout`).
It normalizes `request.path` via `normalizedPath()`, converting `/controlled/orders` paths back to `/orders`.
It reads `request.metadata.correlationId` (falling back to a newly generated `crypto.randomUUID()` if missing) as the response `requestId`.
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
`validateShipment` does not only check: it mutates the `shipment` object passed as its first argument by populating its `dock` property (`src/dispatch/validation.ts`). It does not mutate the `order` argument or directly update global/store state within `validation.ts`.

State Mutation and Data Flow

#### 1. Mutation in `validateShipment`

In `src/dispatch/validation.ts`, `validateShipment` performs validation checks and side-effects dock assignment onto the `shipment` object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Where `docks` is defined as `["D1", "D2", "D3", "D4"]`. Hazardous orders receive `"D4"`, whereas non-hazardous orders are assigned `"D1"`, `"D2"`, or `"D3"` based on the modulo calculation.

#### 2. Call Sites and Downstream Effects

**`releaseShipment` (`src/dispatch/releaseService.ts`)**:

Creates an initial `Shipment` object without a `dock` field and calls `validateShipment(shipment, order)`. The assigned `shipment.dock` value is then:

- Copied onto `releasedOrder.assignedDock`.

- Embedded into `log.detail` (`... at ${shipment.dock}`).

- Emitted via `eventBus.emit("shipment.released", { order: releasedOrder, shipment })`.

**Warehouse Store (`src/store/useWarehouseStore.ts`)**:

The `release` store action calls `releaseShipment` and persists the updated order containing `assignedDock` into `orders` state and `result.log` into `logs` state.

**Notification Listener (`src/notifications/listener.ts`)**:

Listens for `"shipment.released"` and reads `shipment.dock` to format notification text (`... loading at dock ${shipment.dock}.`).

**Unit Tests (`src/tests/validation.test.ts`)**:

Calls `validateShipment(candidate, order)` directly and asserts that `candidate.dock` is set to `"D4"` for hazardous orders or matches `/^D[1-3]$/` for standard orders.
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
For a bulk order (`order.type === "bulk"`), the **legacy pricing implementation** (`calculateLegacyPrice` in `src/pricing/legacyPricing.ts`) runs because `pricingStrategyFor(order)` maps the `"bulk"` order type to the `"legacy"` pricing strategy.

When an order price is calculated by `calculateOrderPrice(order)` in `src/pricing/pricing.ts` (such as during stock allocation in `src/dispatch/allocator.ts`), the strategy routing forces an early return to `calculateLegacyPrice(order)`.

---

Selection Flow & Strategy Mapping

1. **Strategy Selection:**

`calculateOrderPrice(order)` in `src/pricing/pricing.ts` passes the order to `pricingStrategyFor(order)` in `src/config/zoneRules.ts`.

2. **Order-Type Lookup:**

In `src/config/zoneRules.ts`, `pricingStrategyFor` retrieves the strategy from the static `pricingByType` map:

```typescript

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

For `order.type === "bulk"`, `pricingByType[order.type]` evaluates to `"legacy"`.

3. **Branch Execution:**

In `src/pricing/pricing.ts`, the strategy guard executes the `legacy` branch and bypasses current pricing logic:

```typescript

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

```

---

Legacy Pricing Calculation Implementation

In `src/pricing/legacyPricing.ts`, `calculateLegacyPrice(order)` determines the order total through the following steps:

**Subtotal:** Sums `line.quantity * line.unitPrice` across all order lines.
**Pallets:** Calculates pallet count from total line weight: `Math.max(1, Math.ceil(totalWeight / 500))`.
**Handling Fee:** Multiplies the pallet count by `$18.50`.
**Volume Discount:** Evaluates the subtotal against threshold discounts:

- Subtotal > `$5000`: `7.5%` discount (`subtotal * 0.075`).

- Subtotal > `$2000`: `4.0%` discount (`subtotal * 0.04`).

- Otherwise: `0` discount.

**Total:** Returns `Number((subtotal + handling - volumeDiscount).toFixed(2))`.

---

Grounding & Sources
`src/pricing/pricing.ts`: Entry point `calculateOrderPrice` that routes strategy `"legacy"` directly to `calculateLegacyPrice(order)`.
`src/config/zoneRules.ts`: `pricingByType` dictionary mapping `"bulk"` to `"legacy"`, returned by `pricingStrategyFor`.
`src/pricing/legacyPricing.ts`: Contains the calculation rules for `calculateLegacyPrice`.
`src/dispatch/allocator.ts`: Live caller invoking `calculateOrderPrice(prepared)` during `allocateOrder` to assign `order.total`.
`src/tests/pricing.test.ts`: Test coverage confirming that `pricingStrategyFor` evaluates bulk orders as `"legacy"` and matches `calculateLegacyPrice`.
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
When an event is emitted via the singleton event bus (`src/events/bus.ts`), only **`shipment.released`** and **`stock.low`** trigger registered listeners. The remaining two event types declared in `WarehouseEvents` (`src/events/bus.ts`), **`order.allocated`** and **`notification.created`**, are emitted at runtime but have no registered listeners.

---

Registered Event Reactions

#### 1. `shipment.released`

**Emission site:** Emitted by `releaseShipment()` in `src/dispatch/releaseService.ts` after validation and stock commit.
**Listener location:** Registered in `installNotificationListeners()` (`src/notifications/listener.ts`), which is invoked during app setup in `App.tsx` (`src/App.tsx`).
**Reaction flow:**

1. The listener calls `publishNotification()` (`src/notifications/service.ts`) with success details containing the order ID, package count, and assigned dock.

2. `publishNotification()` prepends the notification to the module-level `pending` array in `src/notifications/service.ts` and emits `notification.created` (which has no listener).

3. A 300ms polling interval set up during store initialization (`initialize()` in `src/store/useWarehouseStore.ts`) executes `drainNotifications()` (`src/notifications/service.ts`) to clear `pending` and prepend additions to the store's `notifications` array (capped at 8 entries).

4. The `<Toasts />` UI component (`src/components/Toasts.tsx`) reads `notifications` from `useWarehouseStore` and displays success toast banners.

#### 2. `stock.low`

**Emission site:** Emitted by `commitReleasedStock()` in `src/stock/stockService.ts` when remaining available stock (`onHand - reserved`) falls at or below an item's `reorderPoint`.
**Listener locations & reactions (2 listeners):**

1. **Notification Listener (`src/notifications/listener.ts`):** Registered via `installNotificationListeners()` in `src/App.tsx`. Calls `publishNotification()` (`src/notifications/service.ts`) with a warning containing the SKU, zone ID, and remaining available count. This feeds into the same `pending` queue $\rightarrow$ store polling interval (`src/store/useWarehouseStore.ts`) $\rightarrow$ `<Toasts />` banner pipeline (`src/components/Toasts.tsx`).

2. **Low Stock Signal Listener (`src/stock/stockService.ts`):** Registered during module evaluation when `src/stock/stockService.ts` is imported. It prepends formatted stock warning text to the module-level `lowStockSignals` array, capping the list at 20 entries.

---

Unhandled Event Emissions
**`order.allocated`**: Emitted in `allocateOrder()` (`src/dispatch/allocator.ts`) when stock allocation for an order is complete. No listener is registered via `eventBus.on("order.allocated", ...)` in the codebase.
**`notification.created`**: Emitted in `publishNotification()` (`src/notifications/service.ts`) whenever a notification object is created. No listener is registered for this event; state updates rely on store polling via `drainNotifications()`.
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
To add a new order type to the application, you must update the domain type in `src/types/domain.ts`, update two exhaustive type mappings in `src/config/zoneRules.ts`, create and register a new dispatch handler module under `src/dispatch/handlers/`, and update the UI filter array in `src/pages/OrderListPage.tsx`.

---

Direct Evidence & Required Changes

#### 1. Domain Type Union

**File:** `src/types/domain.ts`
**Change:** Add the new order type string to `export type OrderType = "standard" | "express" | "bulk" | "hazardous";`.

#### 2. Zone Routing & Pricing Mappings

**File:** `src/config/zoneRules.ts`
**Change:** Add the new type key to both `Record<OrderType, ...>` objects. TypeScript compilation (`tsc -b`) will fail if key coverage is incomplete:

* `typeKinds`: Defines the ordered preference array of `Zone["kind"]` values used by `scoreZone()` during allocation scoring.

* `pricingByType`: Maps the type to a `PricingStrategy` (`"current"` or `"legacy"`), consumed by `pricingStrategyFor()`.

#### 3. Dispatch Handler Module

**File:** Create a new handler file under `src/dispatch/handlers/` (referencing existing handler files like `src/dispatch/handlers/standardHandler.ts` or `src/dispatch/handlers/bulkHandler.ts`).
**Change:** Implement `DispatchHandler` (`prepare`, `inspect`, `shipmentDefaults`) and call `registerHandler()` at top level.
**Control Flow Impact:** `getHandler()` in `src/dispatch/handlers/registry.ts` uses `import.meta.glob("./*.ts")` to discover handlers in `src/dispatch/handlers/`. Both `allocateOrder()` in `src/dispatch/allocator.ts` and `releaseShipment()` in `src/dispatch/releaseService.ts` await `getHandler(order.type)`. If no handler is registered for `order.type`, `getHandler()` throws a runtime error (`No dispatch handler registered for ${type}`).

#### 4. UI Order Type Filter Options

**File:** `src/pages/OrderListPage.tsx`
**Change:** Add the new order type string to the local `types` array (`const types: Array<Order["type"] | "all">`) so operators can filter orders by the new type in the UI dropdown.

---

Conditional & Domain-Specific Changes

Depending on the behavior required for the new order type, additional updates may be needed:

**Custom Dock Assignment & Carrier Rules:** In `src/dispatch/validation.ts`, update `validateShipment()` if the new type requires dedicated dock routing or restricted carrier checks (e.g., how `hazardous` orders force dock `"D4"` and require `"SecureChem Logistics"`).
**Pricing Fees & Surcharges:** In `src/pricing/pricing.ts`, update `calculateOrderPrice()` if the new type requires specific fee surcharges or handling logic.
**API Request Interception:** In `src/api/interceptors/hazardous-interceptor.ts` and `src/api/interceptors/index.ts`, add or update request interceptors if API calls for the type require custom endpoint paths or metadata headers.
**Seed Data & Tests:** Update `orderSpecs` in `src/data/seedData.ts` to include sample orders of the new type, and add corresponding test cases in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, or `src/tests/validation.test.ts`.
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
Changing `src/config/zoneRules.ts` directly impacts two exported entry points: candidate zone scoring via `scoreZone` (which relies on `rulesFor` and `zoneRules`) and pricing strategy selection via `pricingStrategyFor`. During order allocation, `scoreZone` ranks eligible zones for order line inventory splitting, while `pricingStrategyFor` selects between current handling fees and legacy pallet/volume pricing. Altering these calculations cascades into allocation outcomes, assigned lot codes, order completion status (`allocated` vs `held`), order totals, stored zone reservation levels, background revalidation job results, downstream stock commitments on release, low-stock notifications, UI component renderings, and unit tests.

---

Detailed Execution Flow & Change Impact

#### 1. Candidate Zone Ranking & Order Allocation

**Direct Caller**: `allocateOrder()` in `src/dispatch/allocator.ts`.
**Execution Flow**:

1. `allocateOrder` receives an `Order` and `Zone[]`, runs handler `prepare` and `inspect` steps, and evaluates candidate zones for each order line by calling `scoreZone(zone, prepared, line)`.

2. `scoreZone` invokes `rulesFor(order, line)`, which filters `zoneRules` using `rule.applies(order, line)` and sorts matching rules by `score` descending.

3. `scoreZone` iterates through matching rules: if `zone.kind` is not included in `rule.zoneKinds`, it subtracts 25 from the accumulator without calling `rule.prefer`; otherwise, it adds the result of `rule.prefer(zone, order, line)`.

4. Candidate zones marked `active` that hold matching SKU stock are sorted by score descending. Stock is allocated sequentially from highest-ranked candidate zones using available inventory (`Math.max(0, item.onHand - item.reserved)`).

**Downstream Effects**:

* **Selected Zones & Lot Codes**: Changing rule applicability (`applies`), allowed zone kinds (`zoneKinds`), or preference score formulas (`prefer`) alters zone selection and the assigned `lotCode` on `Allocation` records (`src/dispatch/allocator.ts`).

* **Order Status (`allocated` vs `held`)**: If scoring changes prioritize zones without sufficient available stock over eligible stock-bearing zones, remaining unallocated units will trigger shortage warnings, setting order status to `"held"` instead of `"allocated"` and skipping the `"order.allocated"` event (`src/dispatch/allocator.ts`).

* **Event Emission**: `allocateOrder` emits `"order.allocated"` upon full allocation. While defined in `src/events/bus.ts`, no listener is registered for `"order.allocated"` in live application code.

#### 2. Order Pricing Calculation

**Direct Callers**: `calculateOrderPrice()` in `src/pricing/pricing.ts` and test assertions in `src/tests/pricing.test.ts`.
**Execution Flow**:

1. At the conclusion of `allocateOrder`, `calculateOrderPrice(prepared)` computes `order.total`.

2. `calculateOrderPrice` queries `pricingStrategyFor(order)`.

3. If `pricingStrategyFor` returns `"legacy"`, pricing delegates to `calculateLegacyPrice()` in `src/pricing/legacyPricing.ts` (calculating pallet charges at $18.50 per 500 kg block and volume discounts over $2,000/$5,000 subtotals).

4. If `pricingStrategyFor` returns `"current"`, pricing calculates line subtotal, handling charges (`Math.max(7.5, weight * 0.11)`), priority fees ($45 for critical, $20 for urgent), and dangerous goods surcharges ($65 if any line is hazardous).

**Downstream Effects**:

* Toggling the `pricingByType` map in `src/config/zoneRules.ts` shifts order pricing strategy between `current` and `legacy`.

* Updated monetary totals propagate to store state and render in `OrderCard` (`src/components/OrderCard.tsx`) and `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`).

#### 3. Stock Reservations, Revalidation Job, and Shipment Release

**Reservation Mutators**:

* Proposed allocations are passed to `applyStockReservation()` in `src/stock/reservation.ts`, which updates `item.reserved` on matching stock items within the returned `Zone[]`.

* Store action `allocate` in `src/store/useWarehouseStore.ts` persists the modified `orders` and `zones` into state and prepends an `"allocated"` or `"held"` log entry to `logs`.

**Background Revalidation Job**:

* `startRevalidationJob` in `src/jobs/revalidation.ts` (started during store initialization in `src/store/useWarehouseStore.ts`) executes `revalidateReservations()` on a 60-second timer.

* It re-applies stock reservations against current zones for orders in `"allocated"`, `"picking"`, or `"ready"` status. If changed zone rankings or stock constraints cause unfulfilled allocations, order status reverts to `"held"` and a `"revalidated"` event is appended to `DispatchLogPage` (`src/pages/DispatchLogPage.tsx`).

**Physical Stock Deductions & Low Stock Events**:

* Upon releasing a ready order, `releaseShipment()` in `src/dispatch/releaseService.ts` passes current zones to `commitReleasedStock()` in `src/stock/stockService.ts`.

* `commitReleasedStock` deducts allocated quantities from both `item.onHand` and `item.reserved`.

* If remaining available inventory (`onHand - reserved`) falls to or below `item.reorderPoint`, `commitReleasedStock` emits `"stock.low"`.

* Registered listeners for `"stock.low"` update two targets:

1. `src/stock/stockService.ts`: Appends signal strings to in-memory `lowStockSignals`.

2. `src/notifications/listener.ts`: Triggers `publishNotification()`, adding a toast to `Toasts` (`src/components/Toasts.tsx`).

#### 4. UI Rendering

**`ZoneCard` & `ZoneOverviewPage`** (`src/components/ZoneCard.tsx`, `src/pages/ZoneOverviewPage.tsx`): Displays zone capacity utilization, available units (`onHand - reserved`), reserved units, individual SKU rows, and low-stock warning banners driven by store `zones`.
**`OrderDetailPage`** (`src/pages/OrderDetailPage.tsx`): Displays line allocations, lot codes, computed order total value, and available inventory per active non-staging zone.
**`OrderListPage` & `Layout`** (`src/pages/OrderListPage.tsx`, `src/components/Layout.tsx`): Renders order cards, status filter option counts, and active shift badge counts (`incoming` and `ready`).

#### 5. Automated Tests

**`src/tests/allocation.test.ts`**: Asserts zone scoring decisions produced by `scoreZone` (e.g., verifying standard ambient express lines route to fast-pick zone `ZB-02` and dangerous goods route to secure zone `ZS-04`).
**`src/tests/pricing.test.ts`**: Asserts lookup results for `pricingStrategyFor(bulk)` returning `"legacy"` and validates `calculateOrderPrice` strategy outputs against `calculateLegacyPrice`.
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
**Yes**, orders with `type: "hazardous"` or order lines with `line.hazardous: true` are treated differently in six subsystems: network API request intercepting, zone scoring during stock allocation, dedicated dispatch handling, shipment validation and dock assignment, pricing surcharge calculation, and UI filtering and order line badge rendering.

---

1. Network Request Intercepting
**Files:** `src/api/interceptors/hazardous-interceptor.ts`, `src/api/interceptors/index.ts`, `src/api/api-client.ts`, `src/api/mock-server.ts`
**Behavior:** When an API request body contains an object with `type: "hazardous"` (e.g., during `saveOrder` in `src/dispatch/orderService.ts`):

* Re-routes path: replaces `/orders` with `/controlled/orders`.

* Adds header: `"x-controlled-load": "true"`.

* Sets request metadata: `routing: "dangerous-goods"`.

**Server handling:** In `src/api/mock-server.ts`, `normalizedPath` strips `/controlled/orders` back to `/orders` so mock lookup and updates resolve.

---

2. Zone Scoring & Allocation Placement
**Files:** `src/config/zoneRules.ts`, `src/dispatch/allocator.ts`
**Behavior:**

* Defines allowed zone kinds for hazardous orders as `["secure"]` (`typeKinds.hazardous`).

* The `hazard-isolation` rule triggers when `order.type === "hazardous"` or `line.hazardous` is `true`.

* `prefer` awards `+80` points to `secure` zones (e.g. `ZS-04`) and `-100` points to non-secure zones. Additionally, `scoreZone` deducts 25 points if `secure` is missing from another rule's allowed `zoneKinds`, driving allocation of hazardous items to secure zones.

---

3. Dedicated Dispatch Handler
**Files:** `src/dispatch/handlers/hazardousHandler.ts`, `src/dispatch/handlers/registry.ts`, `src/dispatch/allocator.ts`, `src/dispatch/releaseService.ts`
**Behavior:**

* **`prepare(order)`:** Sets `order.priority` to `"urgent"` (which adds a $20 priority fee during pricing calculation) and appends `"Dangerous goods paperwork required"` to `order.notes`.

* **`inspect(order)`:** Returns warning strings if no order line has `hazardous: true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **`shipmentDefaults(order)`:** Sets default carrier to `"SecureChem Logistics"` and package count to `Math.max(1, Math.ceil(units / 4))`.

---

4. Shipment Validation & Dock Assignment
**Files:** `src/dispatch/validation.ts`, `src/dispatch/releaseService.ts`
**Behavior:**

* **Dock Assignment:** Sets `shipment.dock = "D4"` for `order.type === "hazardous"`, while non-hazardous orders are assigned to `D1`, `D2`, or `D3`.

* **Carrier Validation:** Requires `shipment.carrier === "SecureChem Logistics"` when `order.type === "hazardous"`; fails validation with `"Approved dangerous goods carrier required"` if any other carrier is specified.

---

5. Pricing Strategy & Dangerous Goods Surcharge
**Files:** `src/pricing/pricing.ts`, `src/config/zoneRules.ts`
**Behavior:**

* `pricingStrategyFor(order)` maps hazardous orders to the `"current"` strategy (`pricingByType.hazardous = "current"`).

* `calculateOrderPrice(order)` adds a **$65** surcharge (`hazardousFee`) whenever `order.lines` contains at least one line with `line.hazardous === true`.

---

6. UI Filtering & Line-Item Labeling
**File:** `src/pages/OrderListPage.tsx`

* Offers `"hazardous"` as a dropdown option in the Order Type filter.

**File:** `src/pages/OrderDetailPage.tsx`

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
A dock is assigned to a shipment in **`src/dispatch/validation.ts`** inside the **`validateShipment`** function by mutating the `dock` property on the passed `shipment` object.

Dock Assignment Implementation

In `src/dispatch/validation.ts`, dock selection uses the order's type and ID:

```typescript

const docks = ["D1", "D2", "D3", "D4"];

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

**Hazardous orders:** Assigned directly to dock `"D4"`.
**Non-hazardous orders:** Assigned to `"D1"`, `"D2"`, or `"D3"` based on the ASCII sum of the `order.id` characters modulo `3`.

---

Control Flow and Runtime Impact

1. **Trigger:** An operator initiates release from the order detail UI (`src/pages/OrderDetailPage.tsx`), calling `useWarehouseStore.getState().release(id)` (`src/store/useWarehouseStore.ts`).

2. **Execution:** `release` invokes `releaseShipment(order, zones, actor)` in `src/dispatch/releaseService.ts`.

3. **Assignment Site:** `releaseShipment` initializes the `shipment` object and passes it to `validateShipment(shipment, order)` (`src/dispatch/releaseService.ts`), where `shipment.dock` is assigned.

4. **Downstream Context & UI Propagation:**

* `releaseShipment` copies `shipment.dock` to `assignedDock` on the updated `Order` object (`src/dispatch/releaseService.ts`).

* The assigned dock is formatted into the dispatch log detail string (`src/dispatch/releaseService.ts`).

* The `"shipment.released"` event is emitted (`src/dispatch/releaseService.ts`), triggering a toast notification listener in `src/notifications/listener.ts` that includes `shipment.dock`.

* The updated order is saved via `saveOrder` (`src/dispatch/orderService.ts`) and stored in application state, displaying as the assigned dock in `src/pages/OrderDetailPage.tsx`.

Test Coverage

Unit tests invoke `validateShipment` directly in `src/tests/validation.test.ts` to assert dock assignment for standard and hazardous shipments.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

