# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 1f812e3cb5d2baa6c30b942993bbfc1e19692844e05e8a69f5f32f4b465bb923 -->

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
Execution starts in **`index.html`**, which serves as the entry HTML file and loads the JavaScript entry point `src/main.tsx`.

---

Execution Flow & Supporting Details

#### 1. Document & Module Loading

**`index.html` (line 2)**: The browser parses the HTML document containing `<div id="root"></div>` and loads the Vite module entry point via `<script type="module" src="/src/main.tsx"></script>`.
**`src/main.tsx` (lines 6–10)**: Module evaluation executes `ReactDOM.createRoot(document.getElementById("root")!)` and renders `<App />` wrapped in `<React.StrictMode>`.

#### 2. React Mount & Initialization Timing

**`src/App.tsx` (lines 25–30)**: When `<App />` renders, it creates the React Router instance (`createBrowserRouter`) pointing to `<Layout />` and default route `<OrderListPage />`.
Inside `App()`, a `useEffect` runs once on mount to bootstrap application services:

1. **`installNotificationListeners()`** (`src/notifications/listener.ts`, lines 6–23): Subscribes handlers to `eventBus` for events such as `shipment.released` and `stock.low`.

2. **`initialize()`** (`src/store/useWarehouseStore.ts`, lines 77–109):

* Sets `initialized: true` in state.

* Starts a 300 ms polling timer (`window.setInterval`) to pull items from `drainNotifications()` into store state.

* Invokes `startRevalidationJob(...)` (`src/jobs/revalidation.ts`, lines 49–61), setting up a 60,000 ms (1 minute) background interval to revalidate order stock allocations.

* Registers a single-use `beforeunload` window listener to clear timers on page unload.
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
An order is not assigned to a single warehouse zone as a whole. Instead, **each individual line item (`OrderLine`) in an order is allocated to one or more storage zones** based on a rule-scoring engine and live inventory availability.

---

Allocation & Zone Assignment Flow

When an operator triggers stock allocation (via `allocate(id)` in `src/store/useWarehouseStore.ts`), the store invokes `allocateOrder()` in `src/dispatch/allocator.ts`. The process follows these steps:

#### 1. Handler Preparation & Inspection

`allocateOrder()` retrieves the order type's registered dispatch handler (`src/dispatch/handlers/registry.ts`) via `getHandler(input.type)`.
The handler runs `.prepare(order)` (e.g., adding routing notes or adjusting priority) and `.inspect(order)` (collecting pre-allocation warnings).

#### 2. Zone Candidate Scoring (`src/config/zoneRules.ts`)

For each order line, the system filters all active zones (`zone.active === true`) containing the target SKU, and ranks them by running `scoreZone(zone, order, line)`:

**Rule 1: Hazard Isolation** (Priority score: 100)

Applies to hazardous order types or lines marked `hazardous`. Gives `+80` to `secure` zones (`ZS-04`) and `-100` to non-secure zones.

**Rule 2: Cold Chain Isolation** (Priority score: 90)

Applies to non-ambient items (`chilled` / `frozen`). Gives `+70` if the zone's temperature matches the line's temperature requirement, and `-100` otherwise.

**Rule 3: Order Type Routing** (Priority score: 50)

Routes based on `order.type`:

* `standard`: Prefers `general` (+40), then `fast-pick` (+30).

* `express`: Prefers `fast-pick` (+40), then `general` (+30).

* `bulk`: Prefers `bulk` (+40), then `general` (+30).

* `hazardous`: Prefers `secure` (+40).

**Rule 4: Capacity Balancing** (Priority score: 10)

Adds up to `+20` points to zones with higher remaining unused capacity `(1 - used / capacity)`.

**Kind Mismatch Penalty:** Subtracts 25 points if the zone's `kind` is not supported by an applicable rule.

#### 3. Stock Allocation Selection (`src/dispatch/allocator.ts`)

Candidate zones are sorted in descending order of score.
The allocator iterates through the candidate zones, evaluating available unreserved inventory for that SKU (`onHand - reserved`).
It pulls stock (`Math.min(remaining, available)`) zone-by-zone until the line quantity is fully met or candidate inventory is exhausted.
If inventory runs out before the required quantity is allocated, an unallocated unit warning is recorded.

#### 4. Stock Reservation & Status Update (`src/stock/reservation.ts`)

`applyStockReservation()` commits the proposed allocations by increasing the `reserved` count on each matching `StockItem` within the zone data structure.
If all lines are fully allocated without shortages, the order's status updates to `"allocated"` and an `order.allocated` event is emitted (`src/events/bus.ts`).
If shortages remain, the order status becomes `"held"`.

---

UI Entry Points

Zone allocation is initiated from two places in the UI:

1. **Order Grid View:** `OrderCard` (`src/components/OrderCard.tsx`) triggers `onAllocate(order.id)`.

2. **Order Detail Page:** `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`) presents an "Allocate stock" button when order status is `"incoming"` or `"held"`.
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
The code that decides how a given order type is processed is structured around a dynamic handler registry pattern in **`src/dispatch/handlers/`**, supplemented by type-based configuration in **`src/config/zoneRules.ts`**, **`src/dispatch/validation.ts`**, and **`src/api/interceptors/hazardous-interceptor.ts`**.

---

Key Decision Points by System Phase

#### 1. Dispatch & Shipment Handlers (`src/dispatch/handlers/`)

The primary entry point for order-type handling is **`src/dispatch/handlers/registry.ts`**, which uses `import.meta.glob` to dynamically load and register handlers based on `order.type`. Each handler implements `DispatchHandler` (`prepare`, `inspect`, `shipmentDefaults`):

**`src/dispatch/handlers/standardHandler.ts`**: Adds wave pick notes, checks max line quantities (>100), defaults carrier to `Northline Ground`.
**`src/dispatch/handlers/expressHandler.ts`**: Escalate order priority to `critical`, checks service window cutoffs (<90 mins remain), defaults carrier to `Apex Priority`.
**`src/dispatch/handlers/bulkHandler.ts`**: Adds forklift load requests to notes, enforces minimum quantity (≥20 units), defaults carrier to `Atlas Freight`.
**`src/dispatch/handlers/hazardousHandler.ts`**: Flags dangerous goods paperwork, sets priority to `urgent`, enforces US-only destination checks, defaults carrier to `SecureChem Logistics`.
Execution triggers:
**Allocation (`src/dispatch/allocator.ts`)**: Calls `getHandler(input.type)` to run `handler.prepare(order)` and `handler.inspect(prepared)`.
**Shipment Release (`src/dispatch/releaseService.ts`)**: Calls `getHandler(order.type)` to populate default carrier and package count via `handler.shipmentDefaults(order)`.

---

#### 2. Zone Routing & Pricing Strategy (`src/config/zoneRules.ts`)

Zone preference and pricing calculation strategies are mapped by order type:

**`typeKinds` mapping (`src/config/zoneRules.ts`)**: Defines preferred zone kinds per order type (e.g., `hazardous` $\rightarrow$ `secure`; `express` $\rightarrow$ `fast-pick`, then `general`).
**`pricingByType` mapping (`src/config/zoneRules.ts`)**: Maps order types to a pricing strategy (`bulk` uses `"legacy"`; `standard`, `express`, and `hazardous` use `"current"`).
**`pricingStrategyFor` & `calculateOrderPrice` (`src/pricing/pricing.ts`)**: Consumes `pricingStrategyFor` to direct `bulk` orders to `calculateLegacyPrice` (`src/pricing/legacyPricing.ts`), while applying base charges, priority fees, and hazardous surcharges to other types.

---

#### 3. Validation & Dock Assignment (`src/dispatch/validation.ts`)

`validateShipment` checks type-specific rules when releasing orders:

Hardcodes dock assignment: assigns dock `D4` for `hazardous` orders vs. rotating docks `D1`–`D3` for non-hazardous orders.
Enforces that `hazardous` orders strictly use carrier `"SecureChem Logistics"`.

---

#### 4. API Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)

When orders are submitted via API client:

If `body.type === "hazardous"`, the interceptor re-routes the endpoint path to `/controlled/orders`, adds header `x-controlled-load: true`, and updates metadata to `dangerous-goods`.
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
Stock reservation is calculated, mutated, or initialized in **5 distinct places** across the codebase:

---

1. Initial State Seed Data
**File:** `src/data/seedData.ts`
**Mechanism:** Initial stock items are constructed via the `stock(sku, onHand, reserved, lot)` helper function, setting hardcoded starting `reserved` quantities on items in `seedZones` (e.g., `BX-100` in zone `ZA-01` has `25` reserved units).

---

2. Manual Order Allocation (Runtime User Action)
**File:** `src/dispatch/allocator.ts` (`allocateOrder`)
**Mechanism:** Calls `applyStockReservation` (`src/stock/reservation.ts`), which mutates zone item records by adding allocated quantities to `item.reserved`:

```ts

item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity;

```

**Callers & Entry Points:**

* UI buttons: "Allocate stock" in `OrderListPage.tsx` and `OrderDetailPage.tsx`.

* Store action: `useWarehouseStore.allocate(id)` (`src/store/useWarehouseStore.ts`).

---

3. Shipment Release (Runtime User Action)
**File:** `src/dispatch/releaseService.ts` (`releaseShipment`)
**Mechanism:**

1. Re-applies/verifies existing reservations via `applyStockReservation` (`src/stock/reservation.ts`) before validating the shipment.

2. Decrements reserved stock upon successful release via `commitReleasedStock` (`src/stock/stockService.ts`):

```ts

item.reserved = Math.max(0, item.reserved - allocation.quantity);

```

**Callers & Entry Points:**

* UI button: "Release shipment" in `OrderDetailPage.tsx`.

* Store action: `useWarehouseStore.release(id)` (`src/store/useWarehouseStore.ts`).

---

4. Scheduled Background Reservation Job (Automated Job)
**File:** `src/jobs/revalidation.ts` (`revalidateReservations`)
**Mechanism:**

1. Resets all zone stock items' `reserved` counts to `0`:

```ts

stock: zone.stock.map((item) => ({ ...item, reserved: 0 }))

```

2. Sequential re-reservation: Iterates through all active orders (`allocated`, `picking`, `ready`) and recalculates/re-applies `applyStockReservation` sequentially.

**Callers & Entry Points:**

* Timer: `startRevalidationJob` sets an interval (`60_000ms`), initialized during app boot inside `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`), which is called on mount in `App.tsx`.

---

5. Automated Tests
**File:** `src/tests/reservation.test.ts`
**Mechanism:** Unit tests directly invoke `applyStockReservation` to assert that `item.reserved` increments properly and lot details are assigned.
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
An outgoing API request is constructed with default fields and then transformed sequentially by three request interceptors before being passed to the request handler (`handleRequest`).

Execution Flow and Transformations

1. **Initial Request Construction** (`src/api/api-client.ts`)

When `apiClient.get()`, `post()`, or `patch()` is called, `request()` creates an initial `ApiRequest` object:

- `headers`: `{ accept: "application/json" }`

- `metadata`: `{}`

- `path`, `method`, and optional `body` as provided by the caller.

2. **Sequential Interceptor Pipeline** (`src/api/interceptors/index.ts`)

`applyInterceptors()` passes the request object through `interceptors` in this exact order:

- **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

Adds the authorization header:

`headers["authorization"] = "Bearer warehouse-console-session"`

- **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

Adds tracking headers and metadata:

- `headers["x-requested-at"]`: Current ISO timestamp

- `metadata["source"]`: `"dispatch-console"`

- `metadata["correlationId"]`: Generated UUID via `crypto.randomUUID()`

- **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

Inspects `request.body`. If `body.type === "hazardous"`, it modifies the request:

- `path`: Replaces `"/orders"` with `"/controlled/orders"`

- `headers["x-controlled-load"]`: `"true"`

- `metadata["routing"]`: `"dangerous-goods"`

*(If the body is not hazardous, the request is returned unmodified.)*

3. **Request Dispatch** (`src/api/api-client.ts` & `src/api/mock-server.ts`)

The fully modified `ApiRequest` object is passed into `handleRequest()`, which executes the request against the mock server implementation.
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
Answer:

`validateShipment` is **not** purely read-only; it mutates the `shipment` object passed to it as an argument by setting its `dock` property (`shipment.dock`).

---

Supporting Details & Evidence

#### 1. Mutation inside `validateShipment`

In `src/dispatch/validation.ts`, `validateShipment` calculates a dock assignment based on `order.type` and a checksum of `order.id`, and directly mutates the passed `shipment` reference:

```typescript

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Aside from setting `shipment.dock`, it does not mutate any global, store, or database state directly.

#### 2. Caller Tracing & Runtime Impact

**`releaseShipment` (`src/dispatch/releaseService.ts`):**

When building a release bundle, `releaseShipment` constructs a `Shipment` object without a `dock` property. It passes that object into `validateShipment(shipment, order)`. After validation, `releaseShipment` relies on the mutated `shipment.dock` property to populate `releasedOrder.assignedDock` and format the audit log entry `log.detail`.

**Validation Tests (`src/tests/validation.test.ts`):**

Unit tests verify this side-effect directly by asserting against `candidate.dock` (e.g., `expect(candidate.dock).toBe("D4")`) after calling `validateShipment`.
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
Answer:

For a `bulk` order, **`calculateLegacyPrice`** (in `src/pricing/legacyPricing.ts`) runs.

---

Why that implementation runs

1. **Strategy Selection via Zone Config:**

When `calculateOrderPrice` is called in `src/pricing/pricing.ts`, it first determines the order's strategy by calling `pricingStrategyFor(order)` from `src/config/zoneRules.ts` (`src/pricing/pricing.ts`, lines 6–7).

2. **Order Type Mapping:**

In `src/config/zoneRules.ts`, `pricingByType` maps each `OrderType` to a `PricingStrategy`. `bulk` is explicitly mapped to `"legacy"`:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

(`src/config/zoneRules.ts`, lines 21–26, 75–77)

3. **Branching Logic:**

In `src/pricing/pricing.ts`, `calculateOrderPrice` checks if `strategy === "legacy"`. Because `pricingStrategyFor` returns `"legacy"` for `bulk` orders, it immediately branches to return `calculateLegacyPrice(order)` (`src/pricing/pricing.ts`, line 8).

Execution Context

During application runtime, this price calculation is invoked whenever an order is allocated via `allocateOrder` in `src/dispatch/allocator.ts` (lines 62–67), which updates the order's `total` field using `calculateOrderPrice(prepared)`.
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
When a dispatch/warehouse event is emitted via the central `eventBus` (`src/events/bus.ts`), reactions depend on which of the four defined event types is emitted:

Summary of Event Reactions

1. **`shipment.released`**

* **Reaction:** Triggers the listener in `src/notifications/listener.ts` (installed at app startup in `src/App.tsx`). It calls `publishNotification(...)`, placing a success notification into a pending queue with details about the released order, package count, and assigned dock. The store polls this queue and displays a UI toast alert in `<Toasts />` (`src/components/Toasts.tsx`).

2. **`stock.low`**

* **Reaction 1 (Notification listener):** The listener in `src/notifications/listener.ts` calls `publishNotification(...)`, creating a warning notification ("Low stock: {sku}") in the pending queue for UI toast display.

* **Reaction 2 (Stock tracking):** A module-level listener in `src/stock/stockService.ts` prepends a formatted string to the `lowStockSignals` in-memory log array (capping history at 20 items).

3. **`order.allocated`**

* **Reaction:** Emitted in `src/dispatch/allocator.ts` when order line allocations complete successfully. Currently, **no listener is registered** for this event.

4. **`notification.created`**

* **Reaction:** Emitted by `publishNotification` in `src/notifications/service.ts`. Currently, **no listener is registered** for this event (the store retrieves notifications by polling `drainNotifications()` on a 300ms interval in `src/store/useWarehouseStore.ts`).

---

End-to-End Data & Control Flow Details

#### 1. Shipment Release Flow

**Emission site:** `releaseShipment` in `src/dispatch/releaseService.ts` emits `shipment.released`.
**Listener:** Registered inside `installNotificationListeners()` in `src/notifications/listener.ts`, which runs on mount in `src/App.tsx`.
**Downstream effect:** `publishNotification()` (`src/notifications/service.ts`) adds a notification object to the `pending` array. The Zustand store (`src/store/useWarehouseStore.ts`) polls `drainNotifications()` every 300ms during store initialization and updates `state.notifications`. The UI renders this via `<Toasts />` (`src/components/Toasts.tsx`) inside `<Layout />` (`src/components/Layout.tsx`).

#### 2. Stock Reduction & Reorder Point Flow

**Emission site:** `commitReleasedStock()` in `src/stock/stockService.ts` emits `stock.low` when stock availability falls below an item's `reorderPoint`.
**Listeners:**

* `src/stock/stockService.ts` registers a listener on module load that pushes a log entry into `lowStockSignals` (retrievable via `getLowStockSignals()`).

* `src/notifications/listener.ts` listens to `stock.low` and triggers `publishNotification()` with warning-level toast metadata.
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
To add a new order type, you must update the domain type definition, create a new dispatch handler in `src/dispatch/handlers/`, update zone routing and pricing strategy records, and add the filter option to the UI.

---

Required Code Changes

#### 1. Add Type to Domain Definition

**`src/types/domain.ts`**:

Add the new string literal to the `OrderType` union type:

```ts

export type OrderType = "standard" | "express" | "bulk" | "hazardous" | "your_type";

```

#### 2. Create and Register a Dispatch Handler

**`src/dispatch/handlers/`** *(New file in this directory)*:

Create a module in `src/dispatch/handlers/` (following existing implementations like `src/dispatch/handlers/standardHandler.ts` or `src/dispatch/handlers/expressHandler.ts`) that calls `registerHandler` from `src/dispatch/handlers/registry.ts`.

`src/dispatch/handlers/registry.ts` dynamically imports all sibling files in `src/dispatch/handlers/` via `import.meta.glob("./*.ts")`. Without registering a handler for the new type, calling `getHandler(type)` during `allocateOrder` (`src/dispatch/allocator.ts`) or `releaseShipment` (`src/dispatch/releaseService.ts`) will throw a runtime error (`"No dispatch handler registered for ..."`).

#### 3. Update Zone Rules & Pricing Mapping

**`src/config/zoneRules.ts`**:

Because `typeKinds` and `pricingByType` are defined as `Record<OrderType, ...>`, TypeScript will require adding keys for the new type:

* Add preferred zone order to `typeKinds: Record<OrderType, Zone["kind"][]>`.

* Map the pricing strategy (`"current"` or `"legacy"`) in `pricingByType: Record<OrderType, PricingStrategy>`.

* *(Optional)* Add a specialized rule to the `zoneRules` array if custom scoring or zone preference logic is needed.

#### 4. Update UI Order Type Filter

**`src/pages/OrderListPage.tsx`**:

Add the type string to the local `types` array so operators can filter orders by the new type in the UI dropdown:

```ts

const types: Array<Order["type"] | "all"> = [

"all",

"standard",

"express",

"bulk",

"hazardous",

"your_type",

];

```

---

Conditional & Domain-Specific Changes

Depending on the requirements of the new order type, the following files may also need updates:

**Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`)**:

If the order type requires specific dock assignments (e.g., dock `D4` for `hazardous`) or carrier enforcement, update `validateShipment()`.

**Pricing Rules (`src/pricing/pricing.ts`)**:

If the type requires custom fees or surcharges when using the `"current"` strategy, update `calculateOrderPrice()`.

**API Interceptors (`src/api/interceptors/index.ts`)**:

If API requests for the new order type require path rewriting or specialized headers (similar to `src/api/interceptors/hazardous-interceptor.ts`), add a new request interceptor and register it in `src/api/interceptors/index.ts`.

**Seed Data & Tests (`src/data/seedData.ts`, `src/tests/`)**:

Add sample specs to `orderSpecs` in `src/data/seedData.ts`, and add test coverage in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, or `src/tests/validation.test.ts`.
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
Changing the zone rules in `src/config/zoneRules.ts` directly impacts two core execution pathways: **zone candidate scoring for inventory allocation** (`scoreZone`) and **pricing strategy lookup** (`pricingStrategyFor`).

---

1. Zone Candidate Selection & Stock Allocation
**Direct Call Site**: `allocateOrder` in `src/dispatch/allocator.ts` calls `scoreZone(zone, prepared, line)` for every order line and candidate zone.
**Control Flow Effect**:

1. **Candidate Priority**: Candidate zones are sorted by `score` in descending order. Changing rules (such as `hazard-isolation`, `cold-chain`, `type-routing`, or `capacity-balance`) alters which zones are selected first when splitting stock line-by-line.

2. **Order Status Outcome**: If scoring steers allocation away from zones with available SKU on-hand inventory, order lines remain unallocated. This generates shortage warnings and sets `order.status` to `"held"` instead of `"allocated"` (`src/dispatch/allocator.ts`).

3. **Event Emission**: `eventBus.emit("order.allocated", ...)` is triggered only if the allocation completes without shortages (`src/dispatch/allocator.ts`).

---

2. Order Pricing Calculation
**Direct Call Site**: `calculateOrderPrice` in `src/pricing/pricing.ts` calls `pricingStrategyFor(order)`.
**Control Flow Effect**:

* The `pricingByType` table determines whether an order uses `"legacy"` pricing (`calculateLegacyPrice` in `src/pricing/legacyPricing.ts`) or `"current"` pricing (standard handling, weight, priority, and hazardous surcharges).

* `calculateOrderPrice` is called inside `allocateOrder` (`src/dispatch/allocator.ts`) to calculate `order.total`.

---

3. Application State & Store Mutations
**State Updates**: When `allocate(id)` runs in `src/store/useWarehouseStore.ts`:

* `order.allocations`, `order.status`, and `order.total` are updated in the Zustand store (`orders`).

* `zone.stock[].reserved` quantities are mutated across affected zones (`zones`).

* A new entry (`"allocated"` or `"held"`) is prepended to dispatch `logs`.

**Persistence**: `saveOrder` sends a `PATCH /orders/:id` request via `src/dispatch/orderService.ts` and `src/api/api-client.ts`.

---

4. UI Rendering & Views

Changes flow through to the following UI components:

**`OrderCard` (`src/components/OrderCard.tsx`) & `OrderListPage` (`src/pages/OrderListPage.tsx`)**: Displays status badges (`allocated` vs `held`), stock allocation progress bars (`allocated` vs total units), and order price (`money(order.total)`).
**`OrderDetailPage` (`src/pages/OrderDetailPage.tsx`)**: Displays allocation chips (mapping SKU lines to specific `zoneId`s), line fulfillment status, and order total value.
**`ZoneOverviewPage` (`src/pages/ZoneOverviewPage.tsx`) & `ZoneCard` (`src/components/ZoneCard.tsx`)**: Render updated reserved unit counts, capacity utilization percentages, and reorder point warnings based on stock reservations made in selected zones.
**`DispatchLogPage` (`src/pages/DispatchLogPage.tsx`)**: Displays the logged allocation/hold result and message details.

---

5. Downstream Jobs, Release & Notifications
**Revalidation Job**: `revalidateReservations` in `src/jobs/revalidation.ts` periodically re-applies stock reservations on active orders. If initial zone selections changed, revalidation outcomes may hold previously allocated orders.
**Shipment Release & Stock Commitment**: `releaseShipment` (`src/dispatch/releaseService.ts`) and `commitReleasedStock` (`src/stock/stockService.ts`) finalize stock deductions from whichever zones were allocated.
**Low Stock Signals**: If stock deductions drop stock below reorder points in newly selected zones, `stock.low` events fire, raising warning toasts in `src/components/Toasts.tsx` via `src/notifications/listener.ts`.

---

6. Automated Test Suite
`src/tests/allocation.test.ts`: Verifies zone scoring priorities (e.g., express orders preferring `ZB-02`, hazardous goods isolating to `ZS-04`).
`src/tests/pricing.test.ts`: Verifies strategy mapping (e.g., bulk orders resolving to `legacy` pricing).
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
Yes, hazardous orders (and orders containing hazardous lines) are treated differently in several components across API routing, order preparation and inspection, zone scoring and allocation, shipment defaults, dock assignment, shipment validation, pricing, and UI filtering.

---

Locations and Differential Behaviors

#### 1. API Interception (`src/api/interceptors/hazardous-interceptor.ts`)

When an API request contains a body with `type === "hazardous"`:

**Path mutation:** Rewrites `/orders` to `/controlled/orders`.
**Headers:** Adds header `"x-controlled-load": "true"`.
**Metadata:** Sets `metadata.routing` to `"dangerous-goods"`.

*(Note: `src/api/mock-server.ts` normalizes `/controlled/orders` back to `/orders` for mock handling).*

#### 2. Specialized Dispatch Handler (`src/dispatch/handlers/hazardousHandler.ts`)

When `allocateOrder()` (`src/dispatch/allocator.ts`) or `releaseShipment()` (`src/dispatch/releaseService.ts`) runs for a `"hazardous"` order type, it dispatches to the registered `hazardousHandler`:

**Preparation (`prepare`):** Sets `priority` to `"urgent"` and appends the note `"Dangerous goods paperwork required"`.
**Inspection (`inspect`):** Returns validation warnings if no line in the order has `hazardous: true`, or if `order.destination.country` is not `"US"`.
**Shipment Defaults (`shipmentDefaults`):** Defaults the carrier to `"SecureChem Logistics"` and sets `packageCount` to `Math.max(1, Math.ceil(units / 4))`.

#### 3. Zone Scoring & Stock Allocation (`src/config/zoneRules.ts`)

**Type-to-Zone Mapping:** `typeKinds.hazardous` restricts allowed zone kinds strictly to `["secure"]`.
**Isolation Rule (`hazard-isolation`):** Applies when `order.type === "hazardous"` or any line has `hazardous: true`. Applies a `+80` score preference to `"secure"` zones and a `-100` penalty to all non-secure zones during zone selection in `scoreZone()`.

#### 4. Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`)

When validating shipments prior to release:

**Carrier Enforcement:** Adds an error (`"Approved dangerous goods carrier required"`) if `order.type === "hazardous"` and `shipment.carrier` is not `"SecureChem Logistics"`.
**Dock Assignment:** Hardcodes `shipment.dock = "D4"` for hazardous orders (whereas non-hazardous orders are deterministically assigned docks `D1`, `D2`, or `D3`).

#### 5. Pricing Surcharge (`src/pricing/pricing.ts`)

In `calculateOrderPrice()`, if any line in the order has `hazardous: true`, a flat **$65** dangerous goods surcharge (`hazardousFee`) is added to the total calculation.

#### 6. UI Filtering (`src/pages/OrderListPage.tsx`)

The `Order type` dropdown filter includes `"hazardous"` as an selectable filter option alongside `"standard"`, `"express"`, and `"bulk"`.
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
A dock is assigned to a shipment inside the `validateShipment` function in **`src/dispatch/validation.ts`**.

---

Supporting Details & Flow

1. **Trigger and Invocation**:

* When an operator releases a shipment (e.g. from `OrderDetailPage.tsx` via `useWarehouseStore.release`), **`src/dispatch/releaseService.ts`** invokes `releaseShipment(order, zones, actor)`.

* `releaseShipment` constructs a initial `Shipment` object and calls `validateShipment(shipment, order)`.

2. **Assignment Logic** (`src/dispatch/validation.ts`):

* Inside `validateShipment`, the dock is assigned by mutating `shipment.dock`:

```ts

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

* If `order.type` is `"hazardous"`, it assigns **`"D4"`**.

* For non-hazardous orders, it sums the ASCII character values of `order.id` and selects from the first 3 docks (`"D1"`, `"D2"`, or `"D3"`) using `numeric % 3`.

3. **Downstream Propagation**:

* Back in `releaseShipment` (**`src/dispatch/releaseService.ts`**), `shipment.dock` is:

* Copied to the order's `assignedDock` property (`releasedOrder.assignedDock = shipment.dock`).

* Formatted into the dispatch log detail string (`detail: "... at ${shipment.dock}"`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

