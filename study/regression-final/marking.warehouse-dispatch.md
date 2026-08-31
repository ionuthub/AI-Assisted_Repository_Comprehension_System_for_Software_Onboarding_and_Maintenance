# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: fa088e4a7e3c87979f865b50b68dca26a435b637ce449c2cf4839cf9a5ef9212 -->

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
Execution in this project starts at **`index.html`**, which loads **`src/main.tsx`** as its entry point. From there, execution flows through React bootstrapping, router setup, and store initialization.

---

Execution Flow and Supporting Details

#### 1. HTML Entry Point

The application is configured as a client-side web application. Execution begins when the browser loads `index.html`, which contains a script tag that loads the main TypeScript entry point as an ES module.

**Direct Evidence:** `index.html` (line 2) contains:

```html

<script type="module" src="/src/main.tsx"></script>

```

**Inference:** Based on `package.json` (lines 1-2) and `vite.config.ts` (lines 1-18), Vite is used as the build tool and dev server, which natively uses `index.html` as the application entry point.

#### 2. React Bootstrapping

Once `src/main.tsx` is loaded, it imports the root React component (`App`) and mounts the React application into the DOM.

**Direct Evidence:** `src/main.tsx` (lines 6–10) targets the DOM element with the ID `root` and renders the application:

```typescript

ReactDOM.createRoot(document.getElementById("root")!).render(

<React.StrictMode>

<App />

</React.StrictMode>,

);

```

#### 3. Application and Router Initialization

The `<App />` component sets up the client-side routing and triggers initial setup side-effects when it mounts.

**Direct Evidence:** `src/App.tsx` (lines 11–31) defines the browser router using `createBrowserRouter` with paths for orders, zones, and logs, and renders it via `<RouterProvider router={router} />`.
**Direct Evidence:** `src/App.tsx` (lines 25–29) runs a `useEffect` hook on mount:

```typescript

useEffect(() => {

installNotificationListeners();

initialize();

}, [initialize]);

```

#### 4. Background Services and Event Listeners

The side-effects triggered during the mounting of `<App />` initialize the application's background processes:

**Direct Evidence:** `installNotificationListeners()` in `src/notifications/listener.ts` (lines 6–23) registers listeners on the global `eventBus` (defined in `src/events/bus.ts`) for `"shipment.released"` and `"stock.low"` events to publish notifications.
**Direct Evidence:** The `initialize()` action in `src/store/useWarehouseStore.ts` (lines 50–80) starts two background processes:

1. A `window.setInterval` running every 300ms that calls `drainNotifications()` (defined in `src/notifications/service.ts` lines 18–20) to pull pending notifications into the Zustand store state.

2. A stock revalidation job via `startRevalidationJob()` (defined in `src/jobs/revalidation.ts` lines 49–61) that runs every 60,000ms (by default) to revalidate stock reservations and update order statuses to `"held"` if shortages are detected.
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
An order is assigned to one or more warehouse zones during the **stock allocation process**. This process evaluates each line item (`OrderLine`) in the order, scores and ranks active warehouse zones containing the line's SKU, and greedily reserves stock from the highest-scoring zones. The resulting assignments are recorded as `Allocation` objects on the order's `allocations` array, and the corresponding stock quantities are marked as `reserved` in the respective zones.

Here is the detailed breakdown of how this assignment works, traced through the repository's control and data flow.

---

1. The Allocation Flow

#### Step A: Triggering Allocation (UI to Store)

**Files:** `src/pages/OrderDetailPage.tsx` (Lines 31, 74–81), `src/pages/OrderListPage.tsx` (Lines 19, 139), and `src/store/useWarehouseStore.ts` (Lines 118–151)
When an operator clicks **"Allocate stock"** in the UI, it triggers the `allocate(id)` action in the Zustand store (`useWarehouseStore`).
The store retrieves the order and the current zones from its state, sets the order ID to a loading state, and calls `allocateOrder(order, zones)` from `src/dispatch/allocator.ts`.

#### Step B: Preparation & Handler Inspection

**Files:** `src/dispatch/allocator.ts` (Lines 19–22) and `src/dispatch/handlers/registry.ts` (Lines 19–32)
`allocateOrder` fetches a type-specific handler (e.g., `bulk`, `express`, `hazardous`, or `standard`) from the registry.
The handler prepares the order (e.g., setting default priorities or adding operator notes) and inspects it for initial warnings.

#### Step C: Zone Filtering and Scoring

**File:** `src/dispatch/allocator.ts` (Lines 24–32)
For each `OrderLine` in the order, the allocator evaluates all warehouse zones.
It filters out zones that are **inactive** (`zone.active === false`) or **do not contain stock** for the requested SKU (`zone.stock.some(...)`).
It scores each remaining zone using `scoreZone(zone, order, line)` from `src/config/zoneRules.ts` and sorts the candidate zones in descending order (highest score first).

#### Step D: Greedy Stock Matching

**File:** `src/dispatch/allocator.ts` (Lines 33–52)
The allocator iterates through the sorted candidate zones to fulfill the line's requested quantity:

1. It calculates the available stock in the zone: `onHand - reserved`.

2. It takes as much stock as possible from the highest-scoring zone.

3. If the line is still not fully satisfied, it moves to the next highest-scoring zone and repeats the process.

4. If there is still a remaining quantity after checking all candidate zones, a warning is added (e.g., `"${line.sku} has ${remaining} unallocated units"`).

5. For each successful match, a proposed `Allocation` object is created containing the `zoneId`, `quantity`, and `lotCode`.

#### Step E: Finalizing Reservations

**Files:** `src/dispatch/allocator.ts` (Lines 55–68) and `src/stock/reservation.ts` (Lines 10–46)
The proposed allocations are passed to `applyStockReservation()`, which updates the `reserved` count on the matching stock items in the zones.
If all lines are fully allocated, the order status is updated to `"allocated"`. If there are shortages, the order status is set to `"held"`.
The updated order and zones are returned to the store, which saves them via `saveOrder` in `src/dispatch/orderService.ts` and updates the store state.

---

2. How Zones are Scored
**File:** `src/config/zoneRules.ts` (Lines 30–86)
**Function:** `scoreZone(zone, order, line)`

Each zone starts with a base score of `0`. The system filters the global `zoneRules` to find rules that apply to the current order and line, sorts them by rule priority (`score` descending), and applies them:

1. **If the zone's `kind` is not supported by the rule** (`!rule.zoneKinds.includes(zone.kind)`), the zone is penalized by subtracting `25` points.

2. **Otherwise**, the rule's `prefer(zone, order, line)` function is evaluated and added to the zone's score.

#### The Scoring Rules (from highest to lowest priority):

1. **Hazard Isolation (Priority Score: 100)**

* *Applies if:* The order type is `"hazardous"` or the line item is marked `hazardous`.

* *Preference:* Adds `+80` if the zone kind is `"secure"`, otherwise subtracts `-100`.

2. **Cold Chain (Priority Score: 90)**

* *Applies if:* The line item's temperature band is not `"ambient"` (i.e., `"chilled"` or `"frozen"`).

* *Preference:* Adds `+70` if the zone's temperature matches the line's temperature, otherwise subtracts `-100`.

3. **Type Routing (Priority Score: 50)**

* *Applies to:* All orders.

* *Preference:* Maps order types to preferred zone kinds using the `typeKinds` record:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

* It scores the zone based on its position in this preference list: returns `40 - position * 10` if found, or `-50` if not found.

4. **Capacity Balance (Priority Score: 10)**

* *Applies to:* All orders.

* *Preference:* Calculates the percentage of unused capacity in the zone and adds up to `+20` points to favor less utilized zones: `Math.round((1 - used / zone.capacity) * 20)`.
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
The code that decides how a given order type is processed is distributed across a **dynamic dispatch handler registry** (with type-specific handler modules), **zone routing and pricing rules**, **shipment validation logic**, and **API request interceptors**.

---

1. Dynamic Dispatch Handlers

The primary mechanism for type-specific processing is the dispatch handler registry and its implementations.

**Registry (`src/dispatch/handlers/registry.ts`)**:

Defines the `DispatchHandler` interface and dynamically loads type-specific handler modules using Vite's `import.meta.glob` when `getHandler(type)` is called.

```typescript

export interface DispatchHandler {

type: Order["type"];

prepare(order: Order): Order;

inspect(order: Order): string[];

shipmentDefaults(order: Order): Pick<Shipment, "carrier" | "packageCount">;

}

```

**Type-Specific Handler Implementations**:

* **`bulk` (`src/dispatch/handlers/bulkHandler.ts`)**: Appends a forklift request note based on total weight; warns if the order is under 20 units or lacks a receiving company; defaults to `"Atlas Freight"` carrier with package count calculated at 1 per 500 kg.

* **`express` (`src/dispatch/handlers/expressHandler.ts`)**: Forces priority to `"critical"`; appends an express pick lane note; warns if the service window has elapsed or has less than 90 minutes remaining; defaults to `"Apex Priority"` carrier with package count calculated at 1 per 20 kg.

* **`hazardous` (`src/dispatch/handlers/hazardousHandler.ts`)**: Forces priority to `"urgent"`; appends a dangerous goods paperwork note; warns if there are no regulated lines or if the destination is international; defaults to `"SecureChem Logistics"` carrier with package count calculated at 1 per 4 units.

* **`standard` (`src/dispatch/handlers/standardHandler.ts`)**: Appends a standard pick wave note; warns if the order has no lines or contains a line with >100 units; defaults to `"Northline Ground"` carrier with package count calculated at 1 per 12 units.

**Execution of Handlers**:

* **Allocation (`src/dispatch/allocator.ts`)**: Calls `prepare(order)` to modify/enrich the order and `inspect(prepared)` to generate initial warnings during the allocation process.

* **Release (`src/dispatch/releaseService.ts`)**: Calls `shipmentDefaults(order)` to retrieve the default carrier and package count when releasing a shipment.

---

2. Zone Routing and Pricing Rules (`src/config/zoneRules.ts`)

Static configurations map order types to specific warehouse zones and pricing strategies:

**Zone Routing (`typeKinds`)**: Maps each `OrderType` to preferred zone kinds in order of priority (e.g., `"hazardous"` maps to `["secure"]`, while `"express"` maps to `["fast-pick", "general"]`). This is evaluated in the `type-routing` rule within `zoneRules`.
**Hazard Isolation Rule**: The `hazard-isolation` rule explicitly checks if `order.type === "hazardous"` to prefer the `"secure"` zone (scoring it `80` vs `-100` for other zones).
**Pricing Strategy (`pricingByType`)**: Maps each `OrderType` to a `PricingStrategy` (`"current"` or `"legacy"`). `"bulk"` orders are mapped to `"legacy"`, while all other types map to `"current"`. This is resolved via `pricingStrategyFor(order)` and evaluated in `calculateOrderPrice` (`src/pricing/pricing.ts`).

---

3. Shipment Validation and Dock Assignment (`src/dispatch/validation.ts`)

The `validateShipment` function applies specific rules based on the order type:

**Carrier Validation**: If `order.type === "hazardous"`, it enforces that the shipment carrier must be `"SecureChem Logistics"`.
**Dock Assignment**: Assigns the shipment dock to `"D4"` if `order.type === "hazardous"`; otherwise, it assigns a dock from `["D1", "D2", "D3"]` using a modulo hash of the order ID.

---

4. API Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)

When communicating with the backend API, the request is intercepted and modified based on the order type:

If the request body contains an order with `type === "hazardous"`, the interceptor rewrites the request path from `/orders` to `/controlled/orders`, adds an `x-controlled-load: true` header, and appends `{ routing: "dangerous-goods" }` to the request metadata.
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
Based on the repository context, stock reservation levels (the `reserved` property on a `StockItem`) are defined, modified, or reset in the following places:

1. Initial Seed Data Definition
**File:** `src/data/seedData.ts`
**Action:** Defines the initial `reserved` stock quantities for the warehouse zones using the `stock` helper function:

```typescript

function stock(sku: Sku, onHand: number, reserved: number, lot: string) {

return {

sku,

description: catalog[sku].description,

onHand,

reserved,

reorderPoint: Math.max(5, Math.floor(onHand * 0.15)),

lotCode: lot,

};

}

```

*(Direct Evidence: `src/data/seedData.ts`, lines 341–350)*

These initial values are loaded into the Zustand store on startup (`src/store/useWarehouseStore.ts`, line 54).

2. Core Reservation Logic
**File:** `src/stock/reservation.ts`
**Action:** The `applyStockReservation` function directly updates the `reserved` property of a stock item in a zone:

```typescript

item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity;

```

*(Direct Evidence: `src/stock/reservation.ts`, line 39)*

3. Order Allocation Flow
**File:** `src/dispatch/allocator.ts`
**Action:** The `allocateOrder` function calls `applyStockReservation` to reserve stock for proposed allocations:

```typescript

const reservation = applyStockReservation(prepared, proposed, zones);

```

*(Direct Evidence: `src/dispatch/allocator.ts`, line 51)*

This is triggered by the `allocate` action in the Zustand store (`src/store/useWarehouseStore.ts`, line 139).

4. Shipment Release Flow
**File:** `src/dispatch/releaseService.ts`
**Action:** The `releaseShipment` function calls `applyStockReservation` to verify and finalize reservations before release:

```typescript

const reservation = applyStockReservation(order, order.allocations, zones);

```

*(Direct Evidence: `src/dispatch/releaseService.ts`, line 29)*

This is triggered by the `release` action in the Zustand store (`src/store/useWarehouseStore.ts`, line 207).

5. Committing Released Stock (Deduction/Clearing)
**File:** `src/stock/stockService.ts`
**Action:** The `commitReleasedStock` function decrements the `reserved` quantity of stock items when a shipment is released:

```typescript

item.reserved = Math.max(0, item.reserved - allocation.quantity);

```

*(Direct Evidence: `src/stock/stockService.ts`, line 24)*

This is called inside `releaseShipment` (`src/dispatch/releaseService.ts`, lines 48–51).

6. Background Revalidation Job
**File:** `src/jobs/revalidation.ts`
**Action:**

1. The `revalidateReservations` function resets all stock reservations to `0` for a clean-slate recalculation:

```typescript

let workingZones = structuredClone(zones).map((zone) => ({

...zone,

stock: zone.stock.map((item) => ({ ...item, reserved: 0 })),

}));

```

*(Direct Evidence: `src/jobs/revalidation.ts`, lines 14–17)*

2. It then sequentially re-applies reservations for active orders using `applyStockReservation`:

```typescript

const reservation = applyStockReservation(

{ ...order, allocations: [] },

order.allocations,

workingZones,

);

```

*(Direct Evidence: `src/jobs/revalidation.ts`, lines 21–25)*

This job is started during store initialization (`src/store/useWarehouseStore.ts`, lines 91–108).

7. Test Suites
**File:** `src/tests/reservation.test.ts`
**Action:** Directly tests the reservation logic by calling `applyStockReservation` and asserting on the updated `reserved` values:

```typescript

const result = applyStockReservation(order, [request], zones);

```

*(Direct Evidence: `src/tests/reservation.test.ts`, lines 23, 33)*
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
Before an outgoing API request is sent to the mock server, it is initialized as a structured request object and then passed sequentially through a pipeline of **three request interceptors** that modify its headers, metadata, and path.

Here is the exact step-by-step lifecycle of a request before it is processed:

---

1. Request Initialization

When a call is made via the `apiClient` (e.g., `get`, `post`, or `patch`), the internal `request` function constructs an initial `ApiRequest` object:

```typescript

const initial: ApiRequest<TBody> = {

path,

method,

body,

headers: { accept: "application/json" },

metadata: {},

};

```

**File Source:** `src/api/api-client.ts`

---

2. The Interceptor Pipeline

The initial request is passed to `applyInterceptors(initial)`, which runs a sequential loop over an array of registered interceptors:

```typescript

const interceptors: RequestInterceptor[] = [

authInterceptor,

auditInterceptor,

hazardousInterceptor,

];

```

**File Source:** `src/api/interceptors/index.ts`

Each interceptor processes the request in the following order:

#### **A. Authentication (`authInterceptor`)**

Adds a hardcoded authorization token to the request headers.

**Modification:** Adds `authorization: "Bearer warehouse-console-session"` to `headers`.
**File Source:** `src/api/interceptors/auth-interceptor.ts`

#### **B. Auditing (`auditInterceptor`)**

Appends tracking and timing information to the request.

**Modifications:**

* Adds `x-requested-at` with the current ISO timestamp (`new Date().toISOString()`) to `headers`.

* Adds `source: "dispatch-console"` to `metadata`.

* Generates and adds a unique `correlationId` using `crypto.randomUUID()` to `metadata`.

**File Source:** `src/api/interceptors/audit-interceptor.ts`

#### **C. Hazardous Goods Routing (`hazardousInterceptor`)**

Inspects the request body to determine if it contains a hazardous order.

**Condition:** Checks if `request.body.type === "hazardous"`. If not, it returns the request unmodified.
**Modifications (if hazardous):**

* Rewrites the request path, replacing `"/orders"` with `"/controlled/orders"`.

* Adds `x-controlled-load: "true"` to `headers`.

* Adds `routing: "dangerous-goods"` to `metadata`.

**File Source:** `src/api/interceptors/hazardous-interceptor.ts`

---

3. Dispatch to Mock Server

Once all interceptors have completed, the fully modified `intercepted` request is passed to `handleRequest(intercepted)` in the mock server.

**File Source:** `src/api/api-client.ts`, `src/api/mock-server.ts`

---

Project Context & Evidence
**Direct Evidence:**

* `src/api/api-client.ts`: Shows the creation of the `initial` request object and the call to `applyInterceptors` before passing it to `handleRequest`.

* `src/api/interceptors/index.ts`: Defines the order of the `interceptors` array (`auth`, `audit`, `hazardous`) and the sequential `for...of` loop that awaits each interceptor.

* `src/api/interceptors/auth-interceptor.ts`, `src/api/interceptors/audit-interceptor.ts`, and `src/api/interceptors/hazardous-interceptor.ts`: Contain the exact property-mapping logic for headers, metadata, and path modifications.

**Inference:**

* We infer that the mock server (`src/api/mock-server.ts`) acts as the final destination representing the "network" because it handles the request asynchronously using a `setTimeout` delay of 90ms and returns a mock response.
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
Yes, `validateShipment` **does change state** by mutating the `shipment` object passed to it as an argument. It is not a pure check. Specifically, it assigns a value to the `dock` property of the `shipment` object.

---

Direct Evidence & Code Trace

#### 1. Mutation in `validateShipment`

In `src/dispatch/validation.ts` (lines 34–39), the function calculates a dock assignment based on the order type and ID, and directly mutates the `shipment` parameter:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

#### 2. Downstream Reliance on the Mutation

This mutation is relied upon during the shipment release process. In `src/dispatch/releaseService.ts` (lines 31–41), `validateShipment` is called with a local `shipment` object. Immediately after, the mutated `shipment.dock` value is used to populate the `assignedDock` property of the newly created `releasedOrder` object:

```typescript

const validation = validateShipment(shipment, order);

if (!validation.valid) throw new Error(validation.errors.join("; "));

shipment.releasedAt = new Date().toISOString();

const releasedOrder: Order = {

...order,

status: "released",

assignedDock: shipment.dock, // <--- Relies on the mutated dock property

// ...

```

#### 3. Test Assertions

The test suite in `src/tests/validation.test.ts` explicitly verifies this side-effect. It passes a `candidate` shipment object to `validateShipment` and asserts that the `dock` property on that same object was modified:

**Standard Dock Assignment** (lines 33–35):

```typescript

const result = validateShipment(candidate, order);

expect(result.valid).toBe(true);

expect(candidate.dock).toMatch(/^D[1-3]$/); // Asserts mutation occurred

```

**Hazardous Dock Assignment** (lines 47–49):

```typescript

const result = validateShipment(candidate, order);

expect(result.valid).toBe(false);

expect(candidate.dock).toBe("D4"); // Asserts mutation occurred

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
For a bulk order, the **legacy pricing** implementation (`calculateLegacyPrice`) runs.

Why This Implementation Runs

The selection of the pricing strategy is determined by the following control flow and data path:

1. **Triggering the Calculation (Consumer)**:

During order allocation in `allocateOrder`, the system calculates the order's total price by calling `calculateOrderPrice(prepared)` to assign the `total` field on the `Order` object.

*Source: `src/dispatch/allocator.ts` (Line 68)*

2. **Strategy Lookup**:

Inside `calculateOrderPrice(order)`, the function first calls `pricingStrategyFor(order)` to determine which strategy to use:

```typescript

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

```

*Source: `src/pricing/pricing.ts` (Lines 5–6)*

3. **Order Type Mapping (Configuration)**:

The `pricingStrategyFor(order)` function retrieves the strategy from the `pricingByType` configuration map using the order's `type` property:

```typescript

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

For a bulk order, `order.type` is `"bulk"`, which maps directly to the `"legacy"` strategy.

*Source: `src/config/zoneRules.ts` (Lines 21–26 and 79–81)*

4. **Execution**:

Because `pricingStrategyFor` returns `"legacy"`, the conditional check in `calculateOrderPrice` evaluates to `true` and immediately invokes and returns the result of `calculateLegacyPrice(order)`.

*Source: `src/pricing/pricing.ts` (Line 6)*

---

Project Evidence
**Direct Evidence**:

* `src/pricing/pricing.ts`: Contains the `calculateOrderPrice` function which routes to `calculateLegacyPrice` if the strategy is `"legacy"`.

* `src/config/zoneRules.ts`: Defines the `pricingByType` mapping where `"bulk"` is explicitly mapped to `"legacy"`, and exports `pricingStrategyFor`.

* `src/pricing/legacyPricing.ts`: Implements the actual legacy pricing logic (`calculateLegacyPrice`) which computes the subtotal, pallet handling fees, and volume discounts.

* `src/dispatch/allocator.ts`: Shows that `calculateOrderPrice` is actively called during the order allocation process.

* `src/tests/pricing.test.ts` (Lines 9–13): A unit test explicitly asserts this behavior:

```typescript

it("selects legacy pricing for bulk through configuration", () => {

const bulk = seedOrders.find((order) => order.type === "bulk")!;

expect(pricingStrategyFor(bulk)).toBe("legacy");

expect(calculateOrderPrice(bulk)).toBe(calculateLegacyPrice(bulk));

});

```

**Inference**:

No inferences are required for this flow, as the mapping and execution paths are statically defined and fully covered by the provided source code and tests.
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
When a dispatch or warehouse event is emitted via the `EventBus` (defined in `src/events/bus.ts`), the reactions are determined by the active listeners registered in the codebase.

Here is exactly what reacts when each event is emitted:

1. `shipment.released`
**Emitted by:** `releaseShipment` in `src/dispatch/releaseService.ts` after a shipment is successfully validated and stock is committed.
**Reacted to by:**

* **Notification Listener:** In `src/notifications/listener.ts`, a listener reacts by calling `publishNotification` to create a success notification indicating that the order has been released and packages are loading at the assigned dock.

---

2. `stock.low`
**Emitted by:** `commitReleasedStock` in `src/stock/stockService.ts` when a stock item's available quantity falls below or equal to its `reorderPoint`.
**Reacted to by:**

* **Notification Listener:** In `src/notifications/listener.ts`, a listener reacts by calling `publishNotification` to create a warning notification detailing the remaining available units in the zone.

* **Stock Service Signal Log:** In `src/stock/stockService.ts`, a listener reacts by prepending a formatted string to the local `lowStockSignals` array (maintaining a maximum of 20 entries).

---

3. `order.allocated`
**Emitted by:** `allocateOrder` in `src/dispatch/allocator.ts` when all lines of an order are successfully allocated.
**Reacted to by:** **Nothing.** There are no active listeners registered for `"order.allocated"` in the codebase.

---

4. `notification.created`
**Emitted by:** `publishNotification` in `src/notifications/service.ts` whenever a new notification is published.
**Reacted to by:** **Nothing directly.** There are no active event listeners registered for `"notification.created"`.

* *Note (Inference):* Instead of reacting to this event directly, the Zustand store in `src/store/useWarehouseStore.ts` polls and drains the pending notifications array on a 300ms interval using `drainNotifications()`.
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
To add a new order type to the system, you must make changes across the domain types, dispatch handlers, routing/pricing configurations, and UI filters.

Here is the exact breakdown of where the new type must be added and what else needs to change:

1. Update the Domain Types

You must add the new type to the `OrderType` union.

**File:** `src/types/domain.ts` (line 1)
**Direct Evidence:**

```typescript

export type OrderType = "standard" | "express" | "bulk" | "hazardous";

```

You would append the new string literal to this union.

---

2. Create and Register a Dispatch Handler

The allocator and release services dynamically load dispatch handlers based on the order's `type` using Vite's `import.meta.glob` inside the registry.

**File:** `src/dispatch/handlers/registry.ts` (lines 18–27)
**Direct Evidence:** The registry dynamically imports all files in its directory (excluding itself) and expects each to register its handler:

```typescript

const modules = import.meta.glob("./*.ts");

```

**Required Change:** You must create a new TypeScript file within the `src/dispatch/handlers/` directory that calls `registerHandler` with an object implementing the `DispatchHandler` interface for the new type. *(Note: The exact filename is not predefined, but it must reside in `src/dispatch/handlers/` to be picked up by the glob import).*

---

3. Update Zone Rules & Pricing Configuration

The allocation scoring and pricing systems map rules directly to order types using TypeScript `Record` types. Adding a new type to `OrderType` requires updating these records to avoid compilation errors.

**File:** `src/config/zoneRules.ts` (lines 14–26)
**Direct Evidence:**

* **Zone Routing Preferences (`typeKinds`):** You must define which warehouse zones are preferred for the new order type:

```typescript

const typeKinds: Record<OrderType, Zone["kind"][]> = { ... }

```

* **Pricing Strategy (`pricingByType`):** You must map the new type to a `PricingStrategy` (`"current"` or `"legacy"`):

```typescript

const pricingByType: Record<OrderType, PricingStrategy> = { ... }

```

---

4. Update UI Filters

To allow operators to filter by the new order type on the main dashboard, you must update the toolbar options.

**File:** `src/pages/OrderListPage.tsx` (lines 17–23)
**Direct Evidence:**

```typescript

const types: Array<Order["type"] | "all"> = [

"all",

"standard",

"express",

"bulk",

"hazardous",

];

```

The new type must be appended to this array.

---

5. Optional / Conditional Changes (Inferred from existing types)

Depending on the requirements of your new order type, you may also need to modify:

**Shipment Validation (`src/dispatch/validation.ts`):** If the new type has specific dock assignments or carrier restrictions (similar to how `"hazardous"` orders are restricted to `"SecureChem Logistics"` and dock `"D4"` on lines 29 and 37), you must add those rules inside `validateShipment`.
**API Interceptors (`src/api/interceptors/`):** If the new order type requires custom HTTP headers or specialized API routing (similar to `hazardousInterceptor` in `src/api/interceptors/hazardous-interceptor.ts`), you should create a new interceptor and register it in `src/api/interceptors/index.ts`.
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
If the zone rules in `src/config/zoneRules.ts` were changed, it would affect **order allocation (which warehouse zones stock is reserved from)**, **order pricing (the calculated total cost of an order)**, the **application state and UI displays**, and the **automated test suites**.

---

1. Order Allocation and Stock Selection

The allocation process ranks warehouse zones to determine where to reserve stock for each order line.

**Zone Scoring & Candidate Ranking (`src/dispatch/allocator.ts`)**:

During `allocateOrder`, the system iterates through each line of an order and maps over the available zones to calculate a score using `scoreZone(zone, prepared, line)` (imported from `src/config/zoneRules.ts`). The candidates are then sorted in descending order of this score:

```typescript

const candidates = zones

.map((zone) => ({ zone, score: scoreZone(zone, prepared, line) }))

.filter(

({ zone }) =>

zone.active && zone.stock.some((item) => item.sku === line.sku),

)

.sort((left, right) => right.score - left.score);

```

**Direct Evidence & Control Flow**:

* `scoreZone` in `src/config/zoneRules.ts` filters rules using `rulesFor(order, line)` (which checks `rule.applies(order, line)`) and aggregates the scores using `rule.prefer(zone, order, line)`.

* If a zone's kind is not included in the rule's `zoneKinds`, the score is penalized by `-25`.

**Impact of Changes (Inference)**: Modifying the rules (such as `hazard-isolation`, `cold-chain`, `type-routing`, or `capacity-balance`), their `score` weights, or their `prefer` functions will alter the sorted order of `candidates`. This directly changes which zones are selected to fulfill the order lines, resulting in different `zoneId` and `lotCode` values in the generated `Allocation` objects.

---

2. Order Pricing

The pricing engine determines whether to apply current or legacy pricing based on the order type's configured strategy.

**Pricing Strategy Resolution (`src/pricing/pricing.ts`)**:

The `calculateOrderPrice` function calls `pricingStrategyFor(order)` (imported from `src/config/zoneRules.ts`) to decide which pricing algorithm to run:

```typescript

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

// ... otherwise calculate current price

```

**Direct Evidence & Control Flow**:

* `pricingStrategyFor` in `src/config/zoneRules.ts` resolves the strategy using the `pricingByType` map, which maps `OrderType` to `PricingStrategy`.

**Impact of Changes (Inference)**: If you change the mappings in `pricingByType` (for example, changing `bulk` from `"legacy"` to `"current"`), the calculated price for those order types will switch algorithms, altering the final `order.total` value.

---

3. Store State and UI Propagation

Because allocation and pricing are executed when an operator triggers an allocation, changes to the rules will propagate to the global state and the user interface.

**Warehouse Store (`src/store/useWarehouseStore.ts`)**:

The `allocate(id)` action invokes `allocateOrder(order, get().zones)`. The resulting `order` (with its new allocations and calculated `total` price) is saved to the store via `saveOrder` and replaces the old order in the state:

```typescript

const result = await allocateOrder(order, get().zones);

const saved = await saveOrder(result.order);

set((state) => ({

orders: replaceOrder(state.orders, saved),

zones: result.zones,

// ...

}));

```

**UI Components**:

* **`src/components/OrderCard.tsx`**: Displays the order's allocation progress bar (`allocated` vs `units`) and the order value (`order.total`).

* **`src/pages/OrderDetailPage.tsx`**: Displays the specific zone allocations per line item (e.g., `ZA-01 · 10`) and the calculated order value. If the scoring rules change, different zones will appear in the "Order lines" table.

* **`src/components/ZoneCard.tsx` & `src/pages/ZoneOverviewPage.tsx`**: Display reserved stock levels (`zone.stock.reduce((sum, item) => sum + item.reserved, 0)`), which are updated when allocations are made.

---

4. Test Suites

Several unit tests explicitly assert behaviors defined by the current zone rules and pricing strategies.

**Allocation Tests (`src/tests/allocation.test.ts`)**:

* `"allocates express goods from preferred zones"` asserts that express goods are allocated from zone `"ZB-02"` (the Fast Pick zone). This relies on the `type-routing` rule preferring `"fast-pick"` over `"general"` for express orders.

* `"keeps hazardous stock in the secure zone"` asserts that hazardous items are allocated to `"ZS-04"`. This relies on the `hazard-isolation` rule.

**Pricing Tests (`src/tests/pricing.test.ts`)**:

* `"selects legacy pricing for bulk through configuration"` directly calls `pricingStrategyFor(bulk)` and asserts it returns `"legacy"`.

* `"adds current handling charges for standard work"` and `"adds a dangerous goods surcharge"` assert pricing calculations that depend on the resolved pricing strategy.
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
Yes, **hazardous orders** (and orders containing hazardous items) are treated differently across several key areas of the application, including API routing, stock allocation, pricing, dispatch handling, and shipment validation.

Here is the detailed breakdown of where and how they are treated differently:

---

1. API Request Interception
**Direct Evidence:** `src/api/interceptors/hazardous-interceptor.ts`
**Behavior:** When an API request is made with a body containing an order of type `"hazardous"`, the `hazardousInterceptor` modifies the request before it is sent:

* Rewrites the request path from `/orders` to `/controlled/orders`.

* Adds an `"x-controlled-load": "true"` header.

* Adds `{ routing: "dangerous-goods" }` to the request metadata.

**Control Flow:**

* `src/api/interceptors/index.ts` registers `hazardousInterceptor` in the `interceptors` array, which is executed sequentially inside `applyInterceptors`.

* `src/api/api-client.ts` calls `applyInterceptors` on every outgoing request.

* `src/api/mock-server.ts` normalizes this path back to `/orders` via `normalizedPath` to keep mock handling uniform.

---

2. Stock Allocation & Zone Routing
**Direct Evidence:** `src/config/zoneRules.ts`
**Behavior:**

* The `typeKinds` mapping routes `"hazardous"` orders preferentially to `"secure"` zones.

* The `hazard-isolation` rule (which has the highest priority score of `100`) applies to any order where `order.type === "hazardous"` or any individual line is marked `line.hazardous`.

* This rule heavily prefers the `"secure"` zone (adds `80` to the zone score) and penalizes other zones (subtracts `100`).

**Control Flow:** `src/dispatch/allocator.ts` calls `scoreZone` (defined in `src/config/zoneRules.ts`) to rank candidate zones when allocating stock for each order line.
**Verification:** `src/tests/allocation.test.ts` verifies this behavior in the test `"keeps hazardous stock in the secure zone"`.

---

3. Pricing & Surcharges
**Direct Evidence:** `src/pricing/pricing.ts`
**Behavior:** In `calculateOrderPrice`, if any line in the order is marked hazardous (`order.lines.some(line => line.hazardous)`), a flat **$65** dangerous goods surcharge (`hazardousFee`) is added to the order total.
**Control Flow:** `src/dispatch/allocator.ts` calls `calculateOrderPrice` during the allocation phase to set the order's `total` value.
**Verification:** `src/tests/pricing.test.ts` verifies this in the test `"adds a dangerous goods surcharge"`.

---

4. Dispatch Lifecycle Handling
**Direct Evidence:** `src/dispatch/handlers/hazardousHandler.ts`
**Behavior:** Registers a custom dispatch handler specifically for `"hazardous"` orders:

* **`prepare`**: Automatically upgrades the order's priority to `"urgent"` and appends the note `"Dangerous goods paperwork required"`.

* **`inspect`**: Performs safety checks. It flags an issue if the hazardous order has no regulated lines (`!line.hazardous`) or if the destination is international (`country !== "US"`), which triggers `"International dangerous goods review required"`.

* **`shipmentDefaults`**: Sets the default carrier to `"SecureChem Logistics"` and calculates package count as `Math.max(1, Math.ceil(units / 4))`.

**Control Flow:** `src/dispatch/handlers/registry.ts` dynamically loads all handlers in the directory via `import.meta.glob` and retrieves them via `getHandler`. These handlers are invoked during allocation (`src/dispatch/allocator.ts`) and release (`src/dispatch/releaseService.ts`).

---

5. Shipment Validation & Dock Assignment
**Direct Evidence:** `src/dispatch/validation.ts`
**Behavior:**

* **Carrier Restriction:** If `order.type === "hazardous"`, the shipment carrier *must* be `"SecureChem Logistics"`. Any other carrier results in a validation error: `"Approved dangerous goods carrier required"`.

* **Dock Assignment:** Hazardous shipments are hardcoded to be routed to dock **`"D4"`**. Non-hazardous shipments are dynamically distributed across docks `"D1"`, `"D2"`, and `"D3"` based on a hash of the order ID.

**Control Flow:** `src/dispatch/releaseService.ts` calls `validateShipment` before finalizing the shipment release.
**Verification:** `src/tests/validation.test.ts` verifies this in the test `"requires dangerous goods routing"`.
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
A dock is assigned to a shipment inside the **`validateShipment`** function in **`src/dispatch/validation.ts`** (line 37).

---

Repository Details & Code Trace

#### 1. Assignment Logic

In `src/dispatch/validation.ts`, the dock is assigned by mutating the `shipment` object passed to `validateShipment`. The assignment logic is as follows:

```typescript

const docks = ["D1", "D2", "D3", "D4"];

// ... inside validateShipment(shipment, order)

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

**Hazardous Orders:** Automatically assigned to dock `"D4"` (direct evidence in `src/dispatch/validation.ts`, line 37).
**Other Orders:** Assigned to `"D1"`, `"D2"`, or `"D3"` based on a modulo calculation of the sum of the character codes of the `order.id` (direct evidence in `src/dispatch/validation.ts`, lines 34–37). Since `numeric % 3` yields `0`, `1`, or `2`, it indexes into the first three elements of the `docks` array.

#### 2. Control Flow

The assignment occurs during the shipment release process:

1. **`releaseShipment`** is called in `src/dispatch/releaseService.ts` (lines 11–60).

2. It constructs a `shipment` object and passes it to `validateShipment(shipment, order)` on line 33.

3. `validateShipment` mutates the `shipment` object to assign the `dock` property (direct evidence in `src/dispatch/validation.ts`, line 37).

4. Back in `releaseShipment`, the assigned dock is copied from the mutated `shipment.dock` to the returned `releasedOrder.assignedDock` property on line 39:

```typescript

const releasedOrder: Order = {

...order,

status: "released",

assignedDock: shipment.dock, // <--- Copied here on line 39

// ...

};

```

Sources
**`src/dispatch/validation.ts`** (lines 10, 34–37) — Direct evidence of the dock assignment logic and the `docks` array definition.
**`src/dispatch/releaseService.ts`** (lines 33–39) — Direct evidence of the execution flow calling the validation and copying the assigned dock to the order.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

