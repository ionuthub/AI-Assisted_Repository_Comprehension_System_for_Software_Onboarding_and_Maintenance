# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 8a2c4e49458e440964063d56b3975641da8b2f99a3d3794c68f724aec21f3b44 -->

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
Execution in this project starts at **`index.html`**, which loads the JavaScript/TypeScript entry point **`src/main.tsx`**.

Detailed Startup and Initialization Path

1. **HTML Document Entry Point** (`index.html`):

- `index.html` serves as the browser entry point, defining the mounting node `<div id="root"></div>` and loading the module script:

```html

<script type="module" src="/src/main.tsx"></script>

```

2. **React Root Creation and Mounting** (`src/main.tsx`):

- `src/main.tsx` imports global styling (`./styles.css`) and the root component (`App` from `./App`).

- It targets `document.getElementById("root")` and renders the React application inside `React.StrictMode`:

```tsx

ReactDOM.createRoot(document.getElementById("root")!).render(

<React.StrictMode>

<App />

</React.StrictMode>,

);

```

3. **Application & Store Bootstrap** (`src/App.tsx`):

- When the `App` component mounts, its `useEffect` hook triggers application startup tasks before rendering the router (`<RouterProvider router={router} />`):

- `installNotificationListeners()` (`src/notifications/listener.ts`): Registers event listeners on the event bus (`shipment.released`, `stock.low`).

- `initialize()` (`src/store/useWarehouseStore.ts`): Sets `initialized: true`, establishes a periodic polling interval for notifications (`drainNotifications()`), starts the periodic background revalidation timer (`startRevalidationJob` from `src/jobs/revalidation.ts`), and registers a `beforeunload` cleanup handler.
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
An order is not assigned to a single warehouse zone at the order level. Instead, **individual order lines are allocated across one or more warehouse zones** based on rule-based zone scoring and on-hand availability (`src/dispatch/allocator.ts`, `src/config/zoneRules.ts`).

---

Zone Assignment and Allocation Flow

#### 1. Invocation Entry Points

Zone assignment occurs during order allocation:

**UI / Store Action**: Triggered via `allocate(id)` in `src/store/useWarehouseStore.ts` (invoked from `OrderListPage.tsx` or `OrderDetailPage.tsx`), which calls `allocateOrder(order, zones)` (`src/dispatch/allocator.ts`).
**Background Revalidation**: `revalidateReservations` in `src/jobs/revalidation.ts` re-applies stock reservations against current zones for orders in `"allocated"`, `"picking"`, or `"ready"` status.

#### 2. Order Preparation and Handler Processing

In `allocateOrder` (`src/dispatch/allocator.ts`):

The allocator dynamically retrieves the order type's handler via `getHandler(input.type)` (`src/dispatch/handlers/registry.ts`).
`handler.prepare(structuredClone(input))` prepares the order (for example, adding notes or adjusting priority).

#### 3. Zone Candidate Selection and Scoring

For each order line (`line` in `prepared.lines`):

Zones are filtered to those that are `active` and contain the required SKU (`zone.active && zone.stock.some((item) => item.sku === line.sku)`).
Each candidate zone is evaluated by `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`).
`scoreZone` filters `zoneRules` by `rule.applies(order, line)` and sorts them descending by `rule.score`. The active rules are:

- **`hazard-isolation`** (score: 100): Applies if `order.type === "hazardous"` or `line.hazardous`. Prefers secure zones (`+80` if `zone.kind === "secure"`, `-100` otherwise).

- **`cold-chain`** (score: 90): Applies if `line.temperature !== "ambient"`. Prefers temperature matches (`+70` if `zone.temperature === line.temperature`, `-100` otherwise).

- **`type-routing`** (score: 50): Applies to all orders. Prefers zone kinds matching `typeKinds[order.type]` (e.g., standard prefers `general` then `fast-pick`; express prefers `fast-pick` then `general`; bulk prefers `bulk` then `general`; hazardous prefers `secure`).

- **`capacity-balance`** (score: 10): Applies to all orders. Adds `0` to `20` points based on the proportion of unused capacity in the zone.

- **Kind Penalty**: Subtracts `25` points for any rule where `rule.zoneKinds` does not include `zone.kind`.

#### 4. Stock Allocation and Splitting Across Zones

In `src/dispatch/allocator.ts`:

Candidate zones are sorted in descending order of their total score.
The allocator iterates through candidate zones, taking available stock (`Math.max(0, item.onHand - item.reserved)`) up to the remaining quantity needed for that line.
An `Allocation` object is created for each matched slice containing `lineId`, `sku`, `zoneId`, `quantity`, `reservedAt`, and `lotCode`.
If an order line cannot be completely fulfilled from available zones, a warning is added, and the resulting order status becomes `"held"` rather than `"allocated"`.

#### 5. Committing Reservations

The proposed allocations are processed by `applyStockReservation` (`src/stock/reservation.ts`), which increases `item.reserved` on the respective zones.
The store (`src/store/useWarehouseStore.ts`) saves the updated order via `saveOrder` (`src/dispatch/orderService.ts`) and updates `orders` and `zones` in the store state.
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
The code that decides how a given order type (`Order["type"]`) is processed is distributed across five areas in the repository:

---

1. Dispatch Handlers (`src/dispatch/handlers/`)

The primary logic controlling preparation, pre-allocation inspection, and release defaults per order type is encapsulated in type-specific handlers loaded via a dynamic registry:

**Registry Dynamic Resolution (`src/dispatch/handlers/registry.ts`)**:

* Loads all handler modules via `import.meta.glob("./*.ts")` and retrieves them via `getHandler(order.type)`.

* **Called by**:

* `allocateOrder` in `src/dispatch/allocator.ts` (lines 19–21): Calls `handler.prepare(input)` to modify/tag the order before allocation and `handler.inspect(prepared)` to collect warnings.

* `releaseShipment` in `src/dispatch/releaseService.ts` (lines 19–20): Calls `handler.shipmentDefaults(order)` to determine the fallback carrier and package count.

**Handler Implementations**:

* **Standard (`src/dispatch/handlers/standardHandler.ts`)**:

* `prepare`: Appends note `"Standard pick wave assigned"`.

* `inspect`: Flags empty orders or lines with quantity $> 100$.

* `shipmentDefaults`: Carrier `"Northline Ground"`, `Math.ceil(units / 12)` packages.

* **Express (`src/dispatch/handlers/expressHandler.ts`)**:

* `prepare`: Sets `priority: "critical"` and appends note `"Moved to express pick lane"`.

* `inspect`: Flags expired due dates or service windows $< 90$ minutes remaining.

* `shipmentDefaults`: Carrier `"Apex Priority"`, `Math.ceil(weight / 20)` packages.

* **Bulk (`src/dispatch/handlers/bulkHandler.ts`)**:

* `prepare`: Appends note requesting a forklift for total load weight.

* `inspect`: Flags orders with $< 20$ units or missing destination company name.

* `shipmentDefaults`: Carrier `"Atlas Freight"`, `Math.ceil(weight / 500)` packages.

* **Hazardous (`src/dispatch/handlers/hazardousHandler.ts`)**:

* `prepare`: Sets `priority: "urgent"` and appends note `"Dangerous goods paperwork required"`.

* `inspect`: Requires at least one regulated hazardous line and flags international destinations.

* `shipmentDefaults`: Carrier `"SecureChem Logistics"`, `Math.ceil(units / 4)` packages.

---

2. Zone Routing Rules (`src/config/zoneRules.ts`)

Decides which warehouse zones are prioritized during stock allocation based on `order.type`:

**`typeKinds` & `type-routing` rule (lines 14–19, 47–56)**: Maps each order type to prioritized zone kinds:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

**`hazard-isolation` rule (lines 30–37)**: Directly checks `order.type === "hazardous" || line.hazardous` to enforce scoring preferences toward `"secure"` zones (+80 score) and penalize non-secure zones (-100 score).
Evaluated by `scoreZone()` in `src/config/zoneRules.ts` and called during line allocation in `src/dispatch/allocator.ts` (line 26).

---

3. Pricing Strategy Selection (`src/config/zoneRules.ts` & `src/pricing/pricing.ts`)
**`pricingByType` / `pricingStrategyFor` (`src/config/zoneRules.ts`, lines 21–26, 68–70)**: Routes order types to pricing strategies:

* `bulk`: `"legacy"` strategy (calculated in `src/pricing/legacyPricing.ts` via pallet-based handling fees and volume discounts).

* `standard`, `express`, `hazardous`: `"current"` strategy.

**`calculateOrderPrice` (`src/pricing/pricing.ts`, lines 7–21)**: Evaluates `pricingStrategyFor(order)` and applies handling fees, hazardous fees, and priority fees during allocation in `src/dispatch/allocator.ts` (line 54).

---

4. Shipment & Dock Validation (`src/dispatch/validation.ts`)

Enforces release constraints and dock assignments based on `order.type` inside `validateShipment()`:

**Carrier requirement (lines 27–28)**: If `order.type === "hazardous"`, enforces that `shipment.carrier === "SecureChem Logistics"`.
**Dock assignment (lines 33–34)**: Assigns hazardous orders to dock `"D4"`, whereas all other types are routed across docks `D1`, `D2`, or `D3`.
Called during order release in `src/dispatch/releaseService.ts` (line 30).

---

5. API Client Interceptors (`src/api/interceptors/hazardous-interceptor.ts`)
Inspects `body?.type === "hazardous"` on outgoing API requests (lines 4–13). When matched, rewrites the endpoint path from `/orders` to `/controlled/orders`, adds header `x-controlled-load: true`, and attaches `metadata.routing = "dangerous-goods"`.
Executed by `applyInterceptors()` in `src/api/interceptors/index.ts` whenever `apiClient` dispatches a request (`src/api/api-client.ts`).
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
Stock reservation calculations and mutations occur through the `applyStockReservation` function, which is executed across live application workflows, background jobs, and unit tests.

---

1. Core Implementation (Where `reserved` stock is mutated)
**`src/stock/reservation.ts` (`applyStockReservation`)**

* **Line 37:** `item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity;` — Mutates the stock item's `reserved` field on cloned zone inventory and constructs the accepted allocation records.

---

2. Live Runtime Call Sites

1. **Order Allocation Flow**

* **`src/dispatch/allocator.ts` (`allocateOrder`, line 46):** Calls `applyStockReservation(prepared, proposed, zones)` to place stock reservations for proposed allocations across zones.

* *Runtime entry points:*

* Called by `useWarehouseStore.allocate(id)` in `src/store/useWarehouseStore.ts` (line 125).

* Triggered via UI buttons:

* "Allocate stock" button on order cards in `src/pages/OrderListPage.tsx` (line 144) rendered via `src/components/OrderCard.tsx` (line 80).

* "Allocate stock" button in `src/pages/OrderDetailPage.tsx` (line 62).

2. **Shipment Release Flow**

* **`src/dispatch/releaseService.ts` (`releaseShipment`, line 26):** Calls `applyStockReservation(order, order.allocations, zones)` to ensure stock allocations remain valid and reserved prior to shipment validation and dispatch commit.

* *Runtime entry points:*

* Called by `useWarehouseStore.release(id)` in `src/store/useWarehouseStore.ts` (line 170).

* Triggered via UI button:

* "Release shipment" button in `src/pages/OrderDetailPage.tsx` (line 78).

3. **Background Reservation Revalidation Job**

* **`src/jobs/revalidation.ts` (`revalidateReservations`, line 21):** Calls `applyStockReservation({ ...order, allocations: [] }, order.allocations, workingZones)` on each non-released active order (`allocated`, `picking`, `ready`) to re-reserve stock against freshly zeroed working zones.

* *Runtime entry points:*

* Called inside `startRevalidationJob` in `src/jobs/revalidation.ts` (line 52).

* Started by `useWarehouseStore.initialize()` in `src/store/useWarehouseStore.ts` (lines 89–105), which runs when `App.tsx` (line 26) mounts.

---

3. Test Call Sites
**`src/tests/reservation.test.ts`**

* **Line 20:** Calls `applyStockReservation(order, [request], zones)` to verify reservation increments and lot code assignment.

* **Line 30:** Calls `applyStockReservation(order, [{ ...request, quantity: 10_000 }], structuredClone(seedZones))` to test shortage behavior without negative availability.

---

4. Related Mutation: Reservation Clearance / Release
**`src/stock/stockService.ts` (`commitReleasedStock`, line 24):** Mutates `item.reserved` in the opposite direction (`item.reserved = Math.max(0, item.reserved - allocation.quantity)`) to decrement/clear reservations when an order is finalized and released.
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
Before an outgoing API request is sent to the handler (`handleRequest`), it is created with default headers and empty metadata, and then passed sequentially through a pipeline of three asynchronous request interceptors.

---

1. Request Object Construction

When any `apiClient` method is invoked (`get`, `post`, or `patch` in `src/api/api-client.ts`), the internal `request` function builds an initial `ApiRequest` object:

**`path`**: Provided target path (e.g., `"/orders"`, `"/orders/${order.id}"`).
**`method`**: `"GET"`, `"POST"`, or `"PATCH"`.
**`body`**: Provided request payload (or `undefined`).
**`headers`**: Initialized with `{ accept: "application/json" }`.
**`metadata`**: Initialized as an empty object `{}`.

*(Direct evidence: `src/api/api-client.ts`)*

---

2. Interceptor Pipeline Execution

The initial request object is passed to `applyInterceptors(initial)` (`src/api/interceptors/index.ts`), which iterates sequentially through `interceptors`:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`)

- Spreads existing headers and injects:

- `authorization: "Bearer warehouse-console-session"`

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`)

- Spreads existing headers and injects:

- `"x-requested-at": new Date().toISOString()`

- Spreads existing metadata and injects:

- `source: "dispatch-console"`

- `correlationId: crypto.randomUUID()`

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`)

- Inspects `request.body` (typed as `Partial<Order> | undefined`).

- **If `body?.type === "hazardous"`**:

- Rewrites `request.path` by replacing `"/orders"` with `"/controlled/orders"`.

- Injects header `"x-controlled-load": "true"`.

- Injects metadata `routing: "dangerous-goods"`.

- **Otherwise**: Returns the request unmodified.

*(Direct evidence: `src/api/interceptors/index.ts`, `src/api/interceptors/auth-interceptor.ts`, `src/api/interceptors/audit-interceptor.ts`, `src/api/interceptors/hazardous-interceptor.ts`)*

---

3. Handoff to Request Handler

Once all interceptors complete, the resulting `intercepted` `ApiRequest` object is forwarded to `handleRequest(intercepted)` (`src/api/mock-server.ts`), which extracts `request.path`, `request.method`, `request.body`, and `request.metadata.correlationId`.

*(Direct evidence: `src/api/api-client.ts`, `src/api/mock-server.ts`)*
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
**`validateShipment` changes state: it directly mutates the passed `shipment` object** by setting its `dock` property. It does not purely check.

---

Evidence & Details

1. **Mutation in `validateShipment` (`src/dispatch/validation.ts`, lines 35–38):**

In addition to computing validation errors and warnings, `validateShipment` computes dock assignment and writes to the input `shipment`:

```ts

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

*(Direct evidence from `src/dispatch/validation.ts`)*

2. **Caller and Runtime Consumption (`src/dispatch/releaseService.ts`, lines 32–48):**

In `releaseShipment`:

- `validateShipment(shipment, order)` is called before assigning dock information.

- The returned/mutated `shipment.dock` is consumed directly to set `releasedOrder.assignedDock = shipment.dock;`.

- It is also consumed to construct the audit log detail: `detail: `${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}``.

*(Direct evidence from `src/dispatch/releaseService.ts`)*
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
**Bulk orders run the `calculateLegacyPrice` implementation** (located in `src/pricing/legacyPricing.ts`).

---

Why that implementation runs

1. **Pricing Calculation Entry Point:**

When an order's total is calculated (such as during allocation in `allocateOrder` at `src/dispatch/allocator.ts`, line 54), it invokes `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`, lines 5–22).

2. **Strategy Lookup:**

`calculateOrderPrice` begins by querying the strategy for the order via `pricingStrategyFor(order)` (`src/pricing/pricing.ts`, line 6).

3. **Type-to-Strategy Mapping in Configuration:**

In `src/config/zoneRules.ts` (lines 19–24, lines 69–71), `pricingStrategyFor` retrieves the strategy from the `pricingByType` dictionary:

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

For any order where `order.type === "bulk"`, `pricingStrategyFor` returns `"legacy"`.

4. **Branch Dispatch:**

In `src/pricing/pricing.ts` (line 7):

```ts

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

```

Because `strategy` is `"legacy"`, `calculateOrderPrice` immediately returns the result of `calculateLegacyPrice(order)` (which calculates pallet-based handling and volume discounts in `src/pricing/legacyPricing.ts`) instead of executing the default current pricing calculation.
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
All event emissions and listeners in the repository route through the singleton `eventBus` defined in `src/events/bus.ts` (`WarehouseEvents` interface).

The complete breakdown of what reacts when each event type is emitted across the codebase is:

---

1. `order.allocated`
**Emitted by**: `allocateOrder` in `src/dispatch/allocator.ts` when an order's lines are completely allocated (`complete === true`).
**Direct listeners**: None.
**Reaction**: No handler or subsystem reacts to this event in the codebase (direct evidence: no call to `eventBus.on("order.allocated", ...)` exists).

---

2. `shipment.released`
**Emitted by**: `releaseShipment` in `src/dispatch/releaseService.ts` after validating the shipment and committing released stock.
**Direct listener**: `src/notifications/listener.ts` inside `installNotificationListeners()` (which is called on startup in `src/App.tsx`).
**Downstream runtime reactions**:

1. Calls `publishNotification()` in `src/notifications/service.ts` with:

* `level: "success"`

* `title: "Order <order.id> released"`

* `message: "<shipment.packageCount> package(s) are loading at dock <shipment.dock>."`

2. `publishNotification()` appends the notification to the module-level `pending` array in `src/notifications/service.ts` and emits `notification.created`.

3. Every 300ms, the poller in `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`) invokes `drainNotifications()`, updates the Zustand store's `notifications` array (keeping up to 8 notifications), and renders them in the UI via the `<Toasts />` component (`src/components/Toasts.tsx`).

---

3. `stock.low`
**Emitted by**: `commitReleasedStock` in `src/stock/stockService.ts` when available stock (`onHand - reserved`) in a zone drops at or below `item.reorderPoint`.
**Direct listeners**: Two separate handlers react to `stock.low`:

1. **Stock Signal Buffer** (`src/stock/stockService.ts`):

* Registered at module load.

* Unshifts a formatted string (`"${sku} in ${zoneId}: ${available} available"`) into the in-memory array `lowStockSignals`, capped at 20 items (accessible via `getLowStockSignals()`).

2. **Notification Listener** (`src/notifications/listener.ts`):

* Registered inside `installNotificationListeners()` (`src/App.tsx`).

* Calls `publishNotification()` in `src/notifications/service.ts` with `level: "warning"`, `title: "Low stock: <sku>"`, and `message: "<available> units remain available in <zoneId>."`.

* Like `shipment.released`, this notification is queued in `pending`, drained by `useWarehouseStore.initialize()` into the Zustand state, and displayed to the user via `<Toasts />` (`src/components/Toasts.tsx`).

---

4. `notification.created`
**Emitted by**: `publishNotification` in `src/notifications/service.ts` whenever any notification is generated.
**Direct listeners**: None.
**Reaction**: No handler listens to `notification.created` directly (direct evidence: no `eventBus.on("notification.created", ...)` exists). The application instead consumes notifications by polling `drainNotifications()` on an interval in `src/store/useWarehouseStore.ts`.
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
To add a new order type to the codebase, the primary definition is added in **`src/types/domain.ts`**, and several configurations, handlers, UI lists, and dispatch logic files must be updated.

---

Direct Required Changes

#### 1. Domain Type Definition

**File:** `src/types/domain.ts`

* Add the new type literal to the `OrderType` type union (`export type OrderType = "standard" | "express" | "bulk" | "hazardous"`).

#### 2. Handler Registration

**File:** `src/dispatch/handlers/`

* Add a new module in `src/dispatch/handlers/` implementing `DispatchHandler` (with `type`, `prepare`, `inspect`, and `shipmentDefaults`) and invoke `registerHandler(...)`.

* *Direct evidence:* `src/dispatch/handlers/registry.ts` dynamically imports all `src/dispatch/handlers/*.ts` files using `import.meta.glob("./*.ts")`. `getHandler(type)` is called by `allocateOrder` in `src/dispatch/allocator.ts` and `releaseShipment` in `src/dispatch/releaseService.ts`. If not registered, `getHandler` throws `"No dispatch handler registered for <type>"`.

#### 3. Zone Routing and Pricing Mappings

**File:** `src/config/zoneRules.ts`

* **`typeKinds` (`Record<OrderType, Zone["kind"][]>`):** Must add an entry mapping the new `OrderType` to its prioritized `Zone["kind"][]`. If missing, the `type-routing` rule in `zoneRules` fails when `scoreZone` accesses `typeKinds[order.type]`.

* **`pricingByType` (`Record<OrderType, PricingStrategy>`):** Must add an entry mapping the new `OrderType` to `"current"` or `"legacy"` to support `pricingStrategyFor(order)`.

#### 4. UI Order List Filtering

**File:** `src/pages/OrderListPage.tsx`

* Add the new type to the `types` array constant (`types: Array<Order["type"] | "all">`) to populate the order type filter dropdown in the list view toolbar.

---

Conditional / Domain-Specific Updates
**Shipment Validation & Dock Assignment (`src/dispatch/validation.ts`):**

* `validateShipment` contains carrier validation rules and dock assignment logic (`shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3]`). Update if the new type requires dedicated docks or carrier constraints.

**Zone Rules (`src/config/zoneRules.ts`):**

* Add specific rules to the `zoneRules` array if the order type requires dedicated scoring or zone filtering beyond standard type routing (similar to `hazard-isolation`).

**Pricing Rules (`src/pricing/pricing.ts` / `src/pricing/legacyPricing.ts`):**

* Adjust `calculateOrderPrice` if the new order type incurs custom surcharges or requires a dedicated pricing calculation.

**API Interceptors (`src/api/interceptors/` and `src/api/interceptors/index.ts`):**

* If orders of the new type require custom HTTP headers, path rewriting, or metadata (similar to `src/api/interceptors/hazardous-interceptor.ts`), add and register an interceptor.

**Seed & Test Data (`src/data/seedData.ts`, `src/tests/`):**

* Update `orderSpecs` in `src/data/seedData.ts` and test suites in `src/tests/` (e.g., `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`) if seed fixtures or tests need to cover the new type.
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
If the configuration and logic in `src/config/zoneRules.ts` change, the components and runtime paths affected break down into two main areas: **zone scoring / order allocation** and **order pricing strategy determination**, along with their downstream consumers and test suites.

---

1. Zone Scoring and Candidate Selection (`scoreZone`, `rulesFor`, `zoneRules`)
**Direct Caller:**

* `allocateOrder` in `src/dispatch/allocator.ts` (lines 24–29): Calls `scoreZone(zone, prepared, line)` to score every active zone containing matching SKUs and sorts them descending by score before reserving units.

**Control & Data Flow Impact:**

* Modifying `zoneRules` (`hazard-isolation`, `cold-chain`, `type-routing`, `capacity-balance`) or `scoreZone` alters the order in which candidate zones are selected to satisfy order line quantities.

* **Order Allocations:** Determines which `zoneId` and `lotCode` are assigned to `order.allocations` (`src/dispatch/allocator.ts`, lines 37–45).

* **Store & Backend Patch:** When `allocate(id)` is triggered in `src/store/useWarehouseStore.ts` (lines 132–165), it calls `allocateOrder`, patches the backend mock via `saveOrder()`, updates `zones` and `orders` in the store, and logs the result.

**UI Consumers Affected:**

* **`src/pages/OrderDetailPage.tsx`** (lines 142–154): Displays the specific zone and lot code assigned to each line (`allocation-chip`).

* **`src/components/OrderCard.tsx`** (lines 64–74): Renders stock allocation progress based on `order.allocations`.

**Automated Tests Affected:**

* **`src/tests/allocation.test.ts`** (lines 7–31): Directly asserts that express ambient goods select zone `ZB-02` and hazardous orders assign controlled stock to `ZS-04`.

---

2. Pricing Strategy Determination (`pricingStrategyFor`, `pricingByType`)
**Direct Callers:**

* `calculateOrderPrice` in `src/pricing/pricing.ts` (lines 5–7): Calls `pricingStrategyFor(order)`. If `"legacy"`, it routes to `calculateLegacyPrice(order)` (`src/pricing/legacyPricing.ts`); otherwise, it applies standard calculations (handling, priority fees, dangerous goods surcharges).

* `src/tests/pricing.test.ts` (lines 7–11): Directly tests `pricingStrategyFor(bulk)` and its output comparison against `calculateLegacyPrice`.

**Control & Data Flow Impact:**

* Changing `pricingByType` or `pricingStrategyFor` alters how an order's `total` is calculated during stock allocation in `allocateOrder` (`src/dispatch/allocator.ts`, line 56: `total: calculateOrderPrice(prepared)`).

**UI Consumers Affected:**

* **`src/pages/OrderDetailPage.tsx`** (lines 104–109): Formats and renders `order.total` using `money(order.total)`.

* **`src/components/OrderCard.tsx`** (lines 58–60): Displays `order.total` on the card under "Order value".

---

3. What is NOT Affected / Unused Fields
**The `pricing` property on `ZoneRule` (`src/config/zoneRules.ts`, lines 8, 28, 36, 44, 55):**

* *Direct Evidence:* While each `ZoneRule` object defines `pricing: PricingStrategy`, no function in the codebase reads `rule.pricing`. Pricing dispatch is determined solely by `pricingStrategyFor(order)` via `pricingByType`. Altering `pricing` on individual rule definitions has no runtime effect.

**Shipment Revalidation (`src/jobs/revalidation.ts`):**

* *Direct Evidence:* `revalidateReservations` runs on an interval to recheck existing allocations (`order.allocations`) against inventory; it does not call `scoreZone` or re-rank candidate zones.

**Shipment Release (`src/dispatch/releaseService.ts`):**

* *Direct Evidence:* `releaseShipment` commits already existing allocations to inventory and does not invoke `scoreZone` or `pricingStrategyFor`.
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
**Yes**, hazardous orders (and order lines containing hazardous goods) are treated differently across dispatch handling, zone allocation, pricing, shipment validation, API request interception, and UI presentation.

Below is the complete enumeration of where and how they receive special treatment in the codebase:

---

1. Dispatch Handler Lifecycle (`src/dispatch/handlers/hazardousHandler.ts`)

When handling an order with `type: "hazardous"` (dynamically loaded and invoked via `getHandler` in `src/dispatch/handlers/registry.ts`):

**Order Preparation (`prepare`, lines 5–11)**: Overrides order priority to `"urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.
**Inspection Warnings (`inspect`, lines 12–19)**: Adds warning issues if the order contains no regulated lines (`!order.lines.some(line => line.hazardous)`) or if the destination country is not `"US"` (`"International dangerous goods review required"`).
**Shipment Defaults (`shipmentDefaults`, lines 20–26)**: Assigns carrier default to `"SecureChem Logistics"` and calculates package count using $\lceil \text{units} / 4 \rceil$.

---

2. Zone Routing and Stock Allocation (`src/config/zoneRules.ts`)
**Zone Type Mapping (lines 14–19)**: `typeKinds.hazardous` restricts allowed zone kinds exclusively to `["secure"]`.
**Hazard Isolation Rule (`hazard-isolation`, lines 29–36)**: Applies whenever `order.type === "hazardous" || line.hazardous`. It evaluates only `"secure"` zone kinds with a score weight of 100, awarding `+80` score preference if `zone.kind === "secure"` and `-100` otherwise, routing hazardous allocations to secure storage (e.g. `ZS-04`).

---

3. Order Pricing (`src/pricing/pricing.ts`)
**Hazardous Handling Fee (lines 19–20)**: Evaluates `order.lines.some((line) => line.hazardous)` and adds a flat surcharge of **$65** (`hazardousFee`) to the order total during pricing calculation.

---

4. Shipment Validation and Dock Assignment (`src/dispatch/validation.ts`)
**Carrier Requirement (lines 28–29)**: Validates that `shipment.carrier === "SecureChem Logistics"` when `order.type === "hazardous"`. Otherwise, flags the error `"Approved dangerous goods carrier required"`.
**Dock Routing (line 36)**: Hardcodes dock assignment specifically to dock **`"D4"`** (`order.type === "hazardous" ? "D4" : docks[numeric % 3]`), whereas standard/other shipments are assigned across docks `D1`–`D3`.

---

5. API Request Interceptors (`src/api/interceptors/hazardous-interceptor.ts`)
**Request Mutation (lines 4–13)**: When saving an order via `apiClient.patch` where `body?.type === "hazardous"`, the interceptor:

* Rewrites the request path by replacing `/orders` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets metadata `routing: "dangerous-goods"`.

*(Note: `src/api/mock-server.ts` line 8 normalizes `/controlled/orders` back to `/orders` for mock handling).*

---

6. User Interface Presentation
**Order Detail Table (`src/pages/OrderDetailPage.tsx`, line 173)**: Renders a `<em>Controlled</em>` badge beside any item where `line.hazardous === true`.
**Secure Zone Card Theme (`src/components/ZoneCard.tsx`, line 12 & `src/styles.css`, line 2)**: Zones mapped to `kind: "secure"` apply the CSS class `.zone-secure` with unique warning/controlled colors (`background: #f9e9e6; color: #a84840`).
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
A dock is assigned to a shipment inside the **`validateShipment`** function in **`src/dispatch/validation.ts`** (lines 35–38).

Supporting Details and Trace
**Assignment Logic (`src/dispatch/validation.ts`, lines 9, 35–38):**

```typescript

const docks = ["D1", "D2", "D3", "D4"];

// ...

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

- Direct evidence: If `order.type` is `"hazardous"`, `shipment.dock` is set to `"D4"`. Otherwise, it hashes `order.id` by summing character ASCII values modulo 3 to select `"D1"`, `"D2"`, or `"D3"`.

**Runtime Invocation Flow:**

1. **UI Entry Point:** An operator triggers release via the "Release shipment" button on `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, lines 77–84), which calls `release(order.id)` in the Zustand store (`src/store/useWarehouseStore.ts`, lines 174–202).

2. **Release Execution:** `release` invokes `releaseShipment(order, zones, actor)` in `src/dispatch/releaseService.ts` (lines 13–60).

3. **Dock Assignment & Propagation:** Inside `releaseShipment` (`src/dispatch/releaseService.ts`, lines 29–42):

- `validateShipment(shipment, order)` is called and mutates `shipment.dock`.

- `shipment.dock` is assigned to `releasedOrder.assignedDock`.

- `shipment.dock` is formatted into the dispatch log entry detail (`${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}`).

- `eventBus.emit("shipment.released", { order: releasedOrder, shipment })` emits the event containing the assigned dock, which triggers toast notifications via `installNotificationListeners` (`src/notifications/listener.ts`, lines 9–15).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

