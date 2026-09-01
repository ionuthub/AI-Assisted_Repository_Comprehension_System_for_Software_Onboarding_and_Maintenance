# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: 2aebffc13d1526acbcf617b5a18b93c38002ec8fbea7364727cc645b71d2154b -->

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
Execution in this application starts in **`index.html`**, which loads **`src/main.tsx`** as an ES module script.

---

Step-by-Step Execution Sequence

1. **HTML Entry Point (`index.html`)**

The browser loads `index.html` containing the `#root` DOM element and executes `<script type="module" src="/src/main.tsx"></script>` (`index.html`).

2. **Module Evaluation & React DOM Mounting (`src/main.tsx`)**

Evaluating `src/main.tsx` imports global styles (`src/styles.css`), targets `document.getElementById("root")`, and creates a React root via `ReactDOM.createRoot().render()`, rendering `<App />` within `<React.StrictMode>` (`src/main.tsx`).

3. **Router Setup & Render (`src/App.tsx`)**

At module scope in `src/App.tsx`, `createBrowserRouter` defines the client-side routes (`/`, `orders/:orderId`, `zones`, `log`) wrapped by `<Layout />`. `<App />` renders `<RouterProvider router={router} />` (`src/App.tsx`).

4. **Effects & Application Background Services (`src/App.tsx`, `src/notifications/listener.ts`, `src/store/useWarehouseStore.ts`)**

Upon component mounting, the `<App />` `useEffect` hook triggers background runtime initialization (`src/App.tsx`):

* **`installNotificationListeners()`**: Subscribes event handlers on `eventBus` for `"shipment.released"` and `"stock.low"` (`src/notifications/listener.ts`).

* **`initialize()`**:

* Sets `initialized: true` in `useWarehouseStore` to guard against duplicate runs (`src/store/useWarehouseStore.ts`).

* Starts a 300ms polling interval (`pullNotifications`) that drains pending notifications from `drainNotifications()` into state (`src/store/useWarehouseStore.ts`, `src/notifications/service.ts`).

* Starts the stock revalidation background job via `startRevalidationJob`, which defaults to running every 60,000 ms (`src/jobs/revalidation.ts`, `src/store/useWarehouseStore.ts`).

* Registers a single-use `beforeunload` window listener to clear both interval timers when navigating away (`src/store/useWarehouseStore.ts`).

---

Grounding & Evidence
**Direct Evidence**:

* Root module import: `index.html`

* Root creation and StrictMode render: `src/main.tsx`

* Router creation and `useEffect` hook setup: `src/App.tsx`

* Event bus listener registration: `src/notifications/listener.ts`

* Store initialization, interval timers, and `beforeunload` cleanup: `src/store/useWarehouseStore.ts`

* Stock revalidation job timer wrapper: `src/jobs/revalidation.ts`

**Inferences**: None.
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
An order is assigned to warehouse zones line-by-line during stock allocation (`allocateOrder` in `src/dispatch/allocator.ts`). The system scores active candidate zones, builds proposed allocations across available stock in descending score order, updates reserved inventory state, calculates pricing, and updates the order status.

---

Detailed Zone Assignment & Allocation Flow

1. **Triggering Allocation**

An operator initiates allocation from the UI (`OrderCard` in `src/components/OrderCard.tsx` or `OrderDetailPage` in `src/pages/OrderDetailPage.tsx`), calling the `allocate(id)` store action (`src/store/useWarehouseStore.ts`).

2. **Order Preparation & Verification**

`allocateOrder(input, zones)` in `src/dispatch/allocator.ts`:

- Retrieves the type-specific handler from the dynamic handler registry (`src/dispatch/handlers/registry.ts`). Handlers for `"standard"`, `"express"`, `"bulk"`, and `"hazardous"` exist in `src/dispatch/handlers/`.

- Prepares a cloned order via `handler.prepare(order)` (e.g., adding type notes or setting priority).

- Collects validation warnings via `handler.inspect(prepared)`.

3. **Candidate Zone Scoring & Sorting**

For each line in `prepared.lines`, `allocateOrder` filters candidate zones (`zone.active === true` and containing `line.sku`) and calculates a numerical score via `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`).

`scoreZone` evaluates applicable rules from `zoneRules` in descending order of rule `score` (`src/config/zoneRules.ts`):

- **Hazard Isolation** (rule score 100): Applies if `order.type === "hazardous"` or `line.hazardous`. Prefers `secure` zones (+80) and penalizes others (-100).

- **Cold Chain** (rule score 90): Applies if `line.temperature !== "ambient"`. Prefers matching zone temperatures (+70) and penalizes non-matching ones (-100).

- **Type Routing** (rule score 50): Applies to all lines. Prefers zone kinds according to order type index in `typeKinds` (+40 for first preference, +30 for second; -50 if unlisted).

- **Capacity Balance** (rule score 10): Applies to all lines. Scores zone availability ratio `Math.round((1 - used / zone.capacity) * 20)`.

If a rule applies but the candidate zone's `kind` is not in `rule.zoneKinds`, 25 points are deducted for that rule. Candidate zones are then sorted by final score in descending order (`src/dispatch/allocator.ts`).

4. **Building Proposed Allocations**

`allocateOrder` iterates through sorted candidate zones for the remaining line quantity (`src/dispatch/allocator.ts`):

- Calculates available stock per zone item as `Math.max(0, item.onHand - item.reserved)`.

- Takes `Math.min(remaining, available)`.

- Creates a proposed `Allocation` object containing `lineId`, `sku`, `zoneId`, `quantity`, `reservedAt`, and `lotCode`.

- If unallocated units remain after checking all candidate zones, a warning is generated (`src/dispatch/allocator.ts`).

5. **Finalizing Reservations & State Persistence**

- `allocateOrder` calls `applyStockReservation(prepared, proposed, zones)` (`src/stock/reservation.ts`). `applyStockReservation` clones the zones, updates `item.reserved` quantities on assigned items, sets lot codes, and returns any stock shortages.

- Price total is assigned via `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`), which dispatches to `calculateLegacyPrice` (`src/pricing/legacyPricing.ts`) for `bulk` orders or calculates current handling/surcharges for standard/express/hazardous types (`src/config/zoneRules.ts`).

- If all line quantities are satisfied and no shortages occurred, order status becomes `"allocated"` and `eventBus.emit("order.allocated", { order })` is emitted (`src/dispatch/allocator.ts`). Otherwise, status is set to `"held"`.

- The store persists changes via `saveOrder(result.order)` (`src/dispatch/orderService.ts`) via `apiClient.patch` (`src/api/api-client.ts`), updates Zustand state (`orders`, `zones`, `logs`), and clears the loading state (`src/store/useWarehouseStore.ts`).

---

Supporting Sources & File Evidence
`src/dispatch/allocator.ts`: Line allocation loop, scoring dispatch, building proposed allocations, calling reservation, status determination, emitting `"order.allocated"`.
`src/config/zoneRules.ts`: `zoneRules` definitions, `rulesFor`, `scoreZone`, and `pricingStrategyFor`.
`src/stock/reservation.ts`: `applyStockReservation` implementation incrementing `reserved` stock and outputting final `allocations` and `shortages`.
`src/dispatch/handlers/registry.ts`: Handler registration and lazy dynamic loading of `./*.ts` handlers.
`src/pricing/pricing.ts`: Price calculation logic based on strategy and order attributes.
`src/store/useWarehouseStore.ts`: Action `allocate(id)` execution, API persistence via `saveOrder`, state mutation of `orders`, `zones`, and `logs`.
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
The code that decides how a given order type (`standard`, `express`, `bulk`, `hazardous`) is processed spans handler implementations, zone routing and pricing configurations, validation logic, and API interceptors.

---

1. Dispatch Handler System (`src/dispatch/handlers/`)

Primary type-specific behavior is governed by handlers registered in a central registry:

**Registry (`src/dispatch/handlers/registry.ts`)**: `getHandler(type)` dynamically imports all handler modules (`./*.ts`) on first call and returns the `DispatchHandler` registered for that order type via `registerHandler()`.
**Standard Handler (`src/dispatch/handlers/standardHandler.ts`)**: In `prepare()`, adds a "Standard pick wave assigned" note. In `inspect()`, checks for empty line lists and line quantities $> 100$. In `shipmentDefaults()`, returns carrier `"Northline Ground"` and package count $\lceil\text{units} / 12\rceil$.
**Express Handler (`src/dispatch/handlers/expressHandler.ts`)**: In `prepare()`, forces `priority` to `"critical"` and appends a lane note. In `inspect()`, checks remaining minutes until `dueAt`. In `shipmentDefaults()`, returns carrier `"Apex Priority"` and package count $\lceil\text{weightKg} / 20\rceil$.
**Bulk Handler (`src/dispatch/handlers/bulkHandler.ts`)**: In `prepare()`, appends a forklift load note based on total line weight. In `inspect()`, enforces a 20-unit minimum order quantity and requires a receiving company name. In `shipmentDefaults()`, returns carrier `"Atlas Freight"` and package count $\lceil\text{weightKg} / 500\rceil$.
**Hazardous Handler (`src/dispatch/handlers/hazardousHandler.ts`)**: In `prepare()`, forces `priority` to `"urgent"` and appends a dangerous goods note. In `inspect()`, checks for regulated lines and international shipping restrictions. In `shipmentDefaults()`, returns carrier `"SecureChem Logistics"` and package count $\lceil\text{units} / 4\rceil$.
Runtime Call Sites:
**`src/dispatch/allocator.ts` (`allocateOrder`)**: Calls `getHandler(input.type)` to run `handler.prepare()` (mutating local clone priority/notes) and `handler.inspect()` (appending inspection warnings) prior to scoring zones and assigning allocations.
**`src/dispatch/releaseService.ts` (`releaseShipment`)**: Calls `getHandler(order.type)` to retrieve `handler.shipmentDefaults(order)` for default carrier and package count assignment.

---

2. Zone Scoring & Pricing Configuration (`src/config/zoneRules.ts`)
**Zone Routing (`typeKinds`)**: Maps each order type to an ordered list of preferred zone storage kinds:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

`scoreZone()` uses this list within the `type-routing` rule to score and rank zone candidates during allocation in `src/dispatch/allocator.ts`.

**Pricing Strategy Selection (`pricingByType`)**: Maps order type to pricing strategy (`bulk` $\rightarrow$ `"legacy"`; `standard`, `express`, `hazardous` $\rightarrow$ `"current"`). `pricingStrategyFor(order)` exposes this lookup.

---

3. Price Calculation (`src/pricing/pricing.ts`)
**`calculateOrderPrice(order)`**: Queries `pricingStrategyFor(order)`.

* If `"legacy"` (`bulk`), calls `calculateLegacyPrice(order)` in `src/pricing/legacyPricing.ts` (subtotal + pallet handling fees $-$ volume discounts).

* If `"current"`, calculates subtotal, weight-based handling fees, priority surcharges, and a dangerous goods surcharge ($65$) if any order line is marked hazardous.

---

4. Shipment Validation (`src/dispatch/validation.ts`)
**`validateShipment(shipment, order)`**: Direct type check on `order.type`:

* If `order.type === "hazardous"`, enforces carrier `"SecureChem Logistics"` (adding an error if mismatched) and assigns dock `"D4"`. For non-hazardous types, assigns dock `D1`–`D3` derived from `order.id`.

---

5. API Request Interception (`src/api/interceptors/hazardous-interceptor.ts`)
**`hazardousInterceptor`**: Checked on outbound network requests via `applyInterceptors()` in `src/api/interceptors/index.ts`. If `request.body.type === "hazardous"`, rewrites `request.path` from `/orders` to `/controlled/orders`, adds header `"x-controlled-load": "true"`, and sets metadata `routing: "dangerous-goods"`.
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
Stock is reserved, re-evaluated, decremented, or initialized across **7 specific locations** in the codebase:

---

1. Core Reservation Mutation Function
**File:** `src/stock/reservation.ts` (`applyStockReservation`)
**Behavior:** The single function that updates stock item `reserved` fields (`item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity`) on a deep clone of the supplied zones list. It calculates availability based on `onHand - reserved + alreadyReserved`, caps reserved amounts to available quantities, sets lot codes, and records shortages.

---

2. Order Allocation Workflow
**File:** `src/dispatch/allocator.ts` (`allocateOrder`)
**Trigger:** User clicks **"Allocate stock"** on `OrderCard` (`src/components/OrderCard.tsx`, rendered in `OrderListPage` at `src/pages/OrderListPage.tsx` or `OrderDetailPage` at `src/pages/OrderDetailPage.tsx`), which calls `useWarehouseStore.getState().allocate(id)` (`src/store/useWarehouseStore.ts`).
**Behavior:** Scores zones, builds proposed allocations against unreserved inventory, and invokes `applyStockReservation(prepared, proposed, zones)` to lock in reservations for the order lines.

---

3. Shipment Release Verification
**File:** `src/dispatch/releaseService.ts` (`releaseShipment`)
**Trigger:** User clicks **"Release shipment"** on `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`), which calls `useWarehouseStore.getState().release(id)` (`src/store/useWarehouseStore.ts`).
**Behavior:** Executes `applyStockReservation(order, order.allocations, zones)` to re-verify stock availability immediately before validating shipment parameters and committing released stock.

---

4. Background Reservation Revalidation Job
**File:** `src/jobs/revalidation.ts` (`revalidateReservations`)
**Trigger:** Timer interval started by `startRevalidationJob`, which is initialized via `initialize()` in `useWarehouseStore` (`src/store/useWarehouseStore.ts`) inside a React `useEffect` in `App` (`src/App.tsx`).
**Behavior:** Resets working zone stock item `reserved` levels to `0`, then sequentially iterates through orders in `"allocated"`, `"picking"`, or `"ready"` status and runs `applyStockReservation({ ...order, allocations: [] }, order.allocations, workingZones)` to re-apply reservations across active orders.

---

5. Committed Stock Deduction (Release Decrement)
**File:** `src/stock/stockService.ts` (`commitReleasedStock`)
**Trigger:** Called at the end of `releaseShipment()` in `src/dispatch/releaseService.ts`.
**Behavior:** Deducts released quantities from reserved stock (`item.reserved = Math.max(0, item.reserved - allocation.quantity)`) as inventory leaves `onHand` count upon physical shipment release.

---

6. Initial Seed Data Definitions
**File:** `src/data/seedData.ts` (`stock()` helper and `seedZones`)
**Trigger:** Module evaluation when `useWarehouseStore` (`src/store/useWarehouseStore.ts`) initializes state with `structuredClone(seedZones)`.
**Behavior:** Defines initial static `reserved` stock quantities for inventory items located in zones `ZA-01`, `ZB-02`, `ZC-03`, `ZS-04`, and `ZC-05`.

---

7. Automated Unit Tests
**File:** `src/tests/reservation.test.ts`
**Trigger:** Test runner execution (`vitest run`).
**Behavior:** Directly invokes `applyStockReservation()` in two test cases to verify reservation incrementing, lot code assignment, shortage calculation, and non-negative availability bounds.
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
Before an outgoing API request is sent to the mock server handler, it is constructed with base properties and headers in `apiClient`, then processed sequentially through three registered request interceptors via `applyInterceptors()`.

---

Step-by-Step Request Lifecycle

#### 1. Initial Request Construction

**File:** `src/api/api-client.ts`

When `apiClient.get()`, `apiClient.post()`, or `apiClient.patch()` is invoked, the internal `request()` function constructs an initial `ApiRequest` object containing:

`path`: the target endpoint path passed to the client method (e.g. `/orders` or `/orders/${order.id}`).
`method`: `"GET"`, `"POST"`, or `"PATCH"`.
`body`: optional payload (`undefined` for GET calls).
`headers`: initialized with `{ accept: "application/json" }`.
`metadata`: initialized to an empty object `{}`.

---

#### 2. Sequential Interceptor Execution

**Files:** `src/api/interceptors/index.ts`, `src/api/interceptors/auth-interceptor.ts`, `src/api/interceptors/audit-interceptor.ts`, `src/api/interceptors/hazardous-interceptor.ts`

`apiClient` passes the initial `ApiRequest` to `applyInterceptors(initial)` (`src/api/api-client.ts`), which runs the request sequentially through the `interceptors` array defined in `src/api/interceptors/index.ts`:

1. **`authInterceptor`** (`src/api/interceptors/auth-interceptor.ts`):

* Copies existing headers and appends `authorization: "Bearer warehouse-console-session"`.

2. **`auditInterceptor`** (`src/api/interceptors/audit-interceptor.ts`):

* Copies existing headers and appends `x-requested-at` set to the current ISO timestamp (`new Date().toISOString()`).

* Copies existing metadata and sets `source: "dispatch-console"` and `correlationId: crypto.randomUUID()`.

3. **`hazardousInterceptor`** (`src/api/interceptors/hazardous-interceptor.ts`):

* Inspects `request.body` (cast as `Partial<Order>`).

* **If `body?.type === "hazardous"`**:

* Modifies `path` by replacing `"/orders"` with `"/controlled/orders"`.

* Copies existing headers and appends `"x-controlled-load": "true"`.

* Copies existing metadata and appends `routing: "dangerous-goods"`.

* **If `body?.type !== "hazardous"`**: returns the request unmodified.

---

#### 3. Dispatch to Mock Server

**File:** `src/api/api-client.ts` & `src/api/mock-server.ts`

The final `intercepted` `ApiRequest` returned by `applyInterceptors()` is passed directly into `handleRequest<TResponse>(intercepted)` in `src/api/mock-server.ts`.
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
`validateShipment` does **not** only check; it mutates state by assigning the `dock` property directly onto the passed `shipment` object argument in-place.

---

Key Evidence & Code Flow

1. **In-Place Mutation of `shipment.dock`**

In `src/dispatch/validation.ts`, `validateShipment` calculates and assigns the dock to the incoming `shipment` object before returning the validation result:

```ts

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

2. **Downstream Application Flow**

In `src/dispatch/releaseService.ts`:

- `releaseShipment` initializes a local `shipment` object without a `dock` property.

- It calls `validateShipment(shipment, order)`.

- The in-place mutation of `shipment.dock` allows subsequent code in `releaseShipment` to read `shipment.dock` to set `releasedOrder.assignedDock` and construct the `log.detail` text.

3. **Validation in Tests**

In `src/tests/validation.test.ts`, tests pass a `candidate` shipment object to `validateShipment` and assert that `candidate.dock` was set by the function call (`expect(candidate.dock).toMatch(/^D[1-3]$/)` and `expect(candidate.dock).toBe("D4")`).

Summary

While `validateShipment` does not directly mutate external global state or the Zustand store, it is not pure—it mutates the `dock` field on the `shipment` object passed to it.
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
The **`calculateLegacyPrice`** implementation (in `src/pricing/legacyPricing.ts`) runs for a bulk order.

Why `calculateLegacyPrice` Runs

1. **Strategy Resolution via Domain Mapping**:

When `calculateOrderPrice(order)` is executed (`src/pricing/pricing.ts`), it calls `pricingStrategyFor(order)` (`src/config/zoneRules.ts`). Inside `src/config/zoneRules.ts`, `pricingStrategyFor` delegates to the `pricingByType` dictionary:

```ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

For a bulk order where `order.type === "bulk"`, `pricingStrategyFor` returns `"legacy"`.

2. **Branching in `calculateOrderPrice`**:

Inside `calculateOrderPrice` (`src/pricing/pricing.ts`):

```ts

export function calculateOrderPrice(order: Order): number {

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

...

}

```

Because `strategy` resolves to `"legacy"`, `calculateOrderPrice` executes the conditional check `if (strategy === "legacy")` and directly calls and returns `calculateLegacyPrice(order)`. The remainder of `calculateOrderPrice` (which computes current subtotal handling, priority fees, and hazardous surcharges) is skipped.

How `calculateLegacyPrice` Calculates the Price

`calculateLegacyPrice` (`src/pricing/legacyPricing.ts`) calculates the total as follows:

**Subtotal**: Sum of `quantity * unitPrice` across all order lines.
**Pallet Handling Charge**: Calculates total weight in kg across lines, divides by 500, rounds up (`Math.ceil`), ensures at least 1 pallet (`Math.max(1, ...)`), and multiplies by `$18.50`.
**Volume Discount**: Applies a subtotal discount of 7.5% if the subtotal is over $5,000, or 4% if over $2,000.
**Total**: Returns `(subtotal + handling - volumeDiscount)` rounded to 2 decimal places.

This configuration-driven behavior is verified in `src/tests/pricing.test.ts`.
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
Two emitted events have active listeners that react at runtime: **`"shipment.released"`** and **`"stock.low"`**. The other two event types defined in the system (**`"order.allocated"`** and **`"notification.created"`**) are emitted during operations but have no registered listeners.

---

Detailed Reaction Traces

#### 1. Reacting to `"shipment.released"`

**Emitted by:** `releaseShipment()` in `src/dispatch/releaseService.ts` when a shipment is successfully processed.
**Listener setup:** `installNotificationListeners()` in `src/notifications/listener.ts` registers a listener when called inside `useEffect` in `src/App.tsx`.
**Reaction:** The listener calls `publishNotification()` in `src/notifications/service.ts` to create a `success` notification containing the order ID, package count, and assigned dock.

#### 2. Reacting to `"stock.low"`

**Emitted by:** `commitReleasedStock()` in `src/stock/stockService.ts` when available stock (`onHand - reserved`) drops to or below `item.reorderPoint` after stock release.
**Registered Listeners & Reactions:**

1. **UI Notification Listener:** Registered by `installNotificationListeners()` in `src/notifications/listener.ts`. It calls `publishNotification()` in `src/notifications/service.ts` to create a `warning` notification with the SKU, zone ID, and remaining available count.

2. **Signal Logger Listener:** Registered at module evaluation scope in `src/stock/stockService.ts`. It prepends a formatted string (`"${sku} in ${zoneId}: ${available} available"`) to the internal `lowStockSignals` array (capped at 20 entries).

---

Unhandled Events
**`"order.allocated"`**: Emitted by `allocateOrder()` in `src/dispatch/allocator.ts` when all order lines are fully reserved. No `.on("order.allocated", ...)` listener is registered in the repository.
**`"notification.created"`**: Emitted by `publishNotification()` in `src/notifications/service.ts` whenever a notification is created. No listener is registered for this event; the store consumes notifications via `setInterval` polling of `drainNotifications()` in `src/store/useWarehouseStore.ts`.

---

Evidence vs. Inference
**Direct Evidence:**

* Event listener registrations (`eventBus.on`) in `src/notifications/listener.ts` and `src/stock/stockService.ts`.

* Event emission calls (`eventBus.emit`) in `src/dispatch/allocator.ts`, `src/dispatch/releaseService.ts`, `src/stock/stockService.ts`, and `src/notifications/service.ts`.

* App initialization triggering listener setup in `src/App.tsx`.

**Inference:** The presence of `"order.allocated"` and `"notification.created"` in the `WarehouseEvents` interface in `src/events/bus.ts` without corresponding `.on()` registrations indicates unused hooks or alternative consumption patterns (such as array polling for notifications).
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
To add a new order type to the repository, changes are required in the domain definitions, zone routing/pricing configuration, dispatch handler registration, and UI filter options. Additional changes to seed data, pricing calculations, shipment validation, API interceptors, and tests may also be required depending on domain rules for the new type.

---

Required Repository Changes

1. **Domain Union Type Definition**

* **File:** `src/types/domain.ts`

* **Change:** Add the new literal string to the `OrderType` union definition (`export type OrderType = "standard" | "express" | "bulk" | "hazardous";`).

2. **Zone Routing & Pricing Maps**

* **File:** `src/config/zoneRules.ts`

* **Change:** Satisfy TypeScript record typing by adding entries for the new type in:

* `typeKinds: Record<OrderType, Zone["kind"][]>` — defines zone preference priority when `scoreZone` calculates allocation scores.

* `pricingByType: Record<OrderType, PricingStrategy>` — maps the type to `"current"` or `"legacy"` strategy.

3. **Dispatch Handler Registration**

* **Files:**

* `src/dispatch/handlers/registry.ts`

* Existing handler examples: `src/dispatch/handlers/standardHandler.ts`, `src/dispatch/handlers/expressHandler.ts`, `src/dispatch/handlers/bulkHandler.ts`, `src/dispatch/handlers/hazardousHandler.ts`

* **Change:** Create a new module inside `src/dispatch/handlers/` that implements the `DispatchHandler` interface (`type`, `prepare`, `inspect`, and `shipmentDefaults`) and calls `registerHandler(...)` at module evaluation scope.

* **Evidence:** `getHandler` in `src/dispatch/handlers/registry.ts` uses `import.meta.glob("./*.ts")` to dynamically import and register all sibling handler files in `src/dispatch/handlers/` except `registry.ts`.

4. **UI Filter Options**

* **File:** `src/pages/OrderListPage.tsx`

* **Change:** Add the new type string to `const types: Array<Order["type"] | "all">` so users can filter by the new type in the order list toolbar select element.

---

Conditional & Domain-Specific Changes

Depending on specific rules for the new order type:

**Seed Data:**

* **File:** `src/data/seedData.ts`

* **Details:** Update `orderSpecs` if initial mock orders of the new type should be available at startup.

**Specialized Pricing Logic:**

* **File:** `src/pricing/pricing.ts`

* **Details:** Update `calculateOrderPrice` if the new order type requires specific fees or surcharges (similar to `hazardousFee` or `priorityFee`).

**Shipment Dock & Carrier Restrictions:**

* **File:** `src/dispatch/validation.ts`

* **Details:** Update `validateShipment` if the new order type requires carrier validation or specific dock assignments (e.g., hazardous orders requiring dock `D4` and `SecureChem Logistics`).

**API Interceptors:**

* **Files:** `src/api/interceptors/hazardous-interceptor.ts`, `src/api/interceptors/index.ts`

* **Details:** Add a new `RequestInterceptor` and add it to `interceptors` in `src/api/interceptors/index.ts` if requests involving the new type require custom request path rewrites or headers.

**Test Suites:**

* **Files:** `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, `src/tests/validation.test.ts`

* **Details:** Add unit tests covering allocation scoring, pricing calculations, and shipment validation rules for the new order type.
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
Changing the zone rules in `src/config/zoneRules.ts` affects order pricing strategy selection (`pricingStrategyFor`), order line candidate ranking (`scoreZone`), and rule collection (`rulesFor`). Because these functions feed directly into dispatch workflows, stock reservation, background revalidation, release verification, and UI consumers, the effects trace through the following paths:

---

1. Order Pricing Strategy & Order Totals (`pricingStrategyFor`, `calculateOrderPrice`)
**Pricing Strategy Dispatch (`src/pricing/pricing.ts`)**: `calculateOrderPrice(order)` calls `pricingStrategyFor(order)`.

* If a type maps to `"legacy"`, `calculateLegacyPrice(order)` (`src/pricing/legacyPricing.ts`) calculates totals using pallet-based handling fees and volume discounts (> $2000 / > $5000).

* If a type maps to `"current"`, `calculateOrderPrice` calculates subtotal + weight handling (`Math.max(7.5, weight * 0.11)`) + priority fee + hazardous surcharge ($65).

**Order Total Mutation (`src/dispatch/allocator.ts`)**: In `allocateOrder()`, `calculateOrderPrice` sets `order.total` on the allocated or held order result.
**UI Consumers**:

* `src/components/OrderCard.tsx`: Displays `order.total` formatted via `money()` or `"Pending"`.

* `src/pages/OrderDetailPage.tsx`: Displays `order.total` formatted via `money()` or `"Calculated on allocation"`.

---

2. Candidate Zone Ranking, Allocation & Stock Reservation (`rulesFor`, `scoreZone`, `allocateOrder`)
**Zone Candidate Scoring (`src/dispatch/allocator.ts`)**: `allocateOrder()` calls `scoreZone(zone, prepared, line)` for every active zone containing matching SKU stock. `scoreZone` filters rules using `rulesFor(order, line)` (which runs `rule.applies`), deducts `25` points if `rule.zoneKinds` excludes `zone.kind`, and adds `rule.prefer(...)`. Candidates are sorted by score descending.
**Selection & Allocation Outcome (`src/dispatch/allocator.ts`)**: Sorting determines which zone's `onHand - reserved` stock is consumed first and which `lotCode` is attached to the generated `Allocation`.
**Shortages, Status & Warnings (`src/dispatch/allocator.ts`)**:

* If candidate scoring changes zone order or rule exclusions prevent complete allocation, remaining unallocated units append warnings (`${line.sku} has ${remaining} unallocated units`).

* `applyStockReservation()` (`src/stock/reservation.ts`) reserves the accepted allocations in memory and returns additional shortage warnings if stock is insufficient.

* If allocations do not fully satisfy line quantities, `order.status` becomes `"held"` instead of `"allocated"`.

**Emitted Events & Audit Logs (`src/dispatch/allocator.ts`, `src/store/useWarehouseStore.ts`)**:

* If fully allocated (`status === "allocated"`), `allocateOrder` emits `order.allocated` via `eventBus` (`src/events/bus.ts`). Note: `order.allocated` currently has no registered listeners in the codebase.

* `useWarehouseStore.allocate()` saves the order via `saveOrder()` (`src/dispatch/orderService.ts`) and prepends a log entry to `logs` with action `"allocated"` or `"held"`.

---

3. Downstream Revalidation, Release, Stock Commit & Low Stock Notifications
**Background Reservation Revalidation (`src/jobs/revalidation.ts`)**:

* `revalidateReservations()` re-evaluates order allocations for orders in `"allocated"`, `"picking"`, or `"ready"` status using `applyStockReservation()`.

* If altered allocation rules lead to unfulfilled reservations during revalidation, `order.status` flips to `"held"`, a note is appended, and a `"revalidated"` log entry is added in `useWarehouseStore.ts`.

**Shipment Release Validation (`src/dispatch/releaseService.ts`, `src/dispatch/validation.ts`)**:

* `releaseShipment()` re-applies stock reservations against current zones via `applyStockReservation()`.

* `validateShipment()` verifies `order.allocations` (requiring positive quantities and active allocations) and enforces dock assignments (hazardous orders map to dock `"D4"`, others map via order ID hash).

* On release, `eventBus.emit("shipment.released", ...)` fires. `installNotificationListeners()` (`src/notifications/listener.ts`) listens to `shipment.released` and creates a toast notification via `publishNotification()`.

**Stock Commit & Low Stock Warnings (`src/stock/stockService.ts`)**:

* `releaseShipment()` calls `commitReleasedStock()`, which decrements `onHand` and `reserved` counts on the committed `Zone` objects.

* If `onHand - reserved <= item.reorderPoint`, `commitReleasedStock` emits `stock.low`. `installNotificationListeners()` (`src/notifications/listener.ts`) listens to `stock.low` and triggers a warning notification toast.

* Low stock state affects reorder alert counts in `src/pages/ZoneOverviewPage.tsx` and warning badges in `src/components/ZoneCard.tsx`.

---

4. Affected Automated Tests
`src/tests/pricing.test.ts`: Directly imports `pricingStrategyFor` and `calculateOrderPrice` to verify bulk order legacy pricing dispatch and standard/hazardous pricing calculations.
`src/tests/allocation.test.ts`: Directly calls `allocateOrder` to verify express items score fast-pick zone `ZB-02` highest, hazardous line items route to secure zone `ZS-04`, and unallocated stock forces orders into `"held"` status.
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
Yes, orders with `type === "hazardous"` or lines with `line.hazardous === true` are treated differently across API interception, order handling, zone allocation scoring, pricing, shipment validation/dock assignment, and UI display.

---

Where and How Hazardous Orders Are Treated Differently

#### 1. API Request Interception

**File:** `src/api/interceptors/hazardous-interceptor.ts`
**Behavior:** When an `ApiRequest` body has `type === "hazardous"`, the interceptor:

* Replaces `/orders` with `/controlled/orders` in `request.path`.

* Adds header `"x-controlled-load": "true"`.

* Sets `request.metadata.routing = "dangerous-goods"`.

**Flow:** `applyInterceptors` (`src/api/interceptors/index.ts`) runs `hazardousInterceptor` on API requests initiated by `apiClient` (`src/api/api-client.ts`), such as `saveOrder` in `src/dispatch/orderService.ts`. The mock server (`src/api/mock-server.ts`) normalizes `/controlled/orders` back to `/orders`.

#### 2. Order Preparation, Inspection, and Shipment Defaults

**Files:** `src/dispatch/handlers/hazardousHandler.ts`, `src/dispatch/handlers/registry.ts`
**Behavior:** Dynamically loaded and retrieved via `getHandler("hazardous")` during `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`):

* **`prepare(order)`**: Appends `"Dangerous goods paperwork required"` to `order.notes` and updates `order.priority` to `"urgent"`.

* **`inspect(order)`**: Appends warning issues if no line has `line.hazardous === true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **`shipmentDefaults(order)`**: Sets the default `carrier` to `"SecureChem Logistics"` and `packageCount` to `Math.max(1, Math.ceil(units / 4))`.

#### 3. Zone Scoring & Stock Allocation

**Files:** `src/config/zoneRules.ts`, `src/dispatch/allocator.ts`
**Behavior:**

* `typeKinds.hazardous` restricts allowed zone kinds to `["secure"]`.

* The `hazard-isolation` rule (highest score rule, score 100) applies when `order.type === "hazardous"` or `line.hazardous === true`. It adds `+80` preference score to `secure` zones (such as `ZS-04` in `src/data/seedData.ts`) and `-100` to non-secure zones.

#### 4. Order Pricing Surcharge

**Files:** `src/pricing/pricing.ts`, `src/config/zoneRules.ts`
**Behavior:**

* `pricingStrategyFor` in `src/config/zoneRules.ts` returns `"current"` for `"hazardous"` orders.

* `calculateOrderPrice` in `src/pricing/pricing.ts` adds a flat `$65` surcharge (`hazardousFee`) if `order.lines.some((line) => line.hazardous)` is true.

#### 5. Shipment Carrier Validation & Dock Assignment

**File:** `src/dispatch/validation.ts`
**Behavior:** During shipment validation in `validateShipment` (called by `releaseShipment` in `src/dispatch/releaseService.ts`):

* Validation fails with error `"Approved dangerous goods carrier required"` if `order.type === "hazardous"` and `shipment.carrier !== "SecureChem Logistics"`.

* `shipment.dock` is hardcoded to `"D4"` when `order.type === "hazardous"`, whereas other orders are assigned to `D1`, `D2`, or `D3`.

#### 6. User Interface

**Files:** `src/pages/OrderListPage.tsx`, `src/pages/OrderDetailPage.tsx`
**Behavior:**

* `src/pages/OrderListPage.tsx` includes `"hazardous"` in its order type filter dropdown.

* `src/pages/OrderDetailPage.tsx` renders a `Controlled` badge (`<em>Controlled</em>`) next to any order line where `line.hazardous === true`.
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
A dock is assigned to a shipment inside the `validateShipment` function in **`src/dispatch/validation.ts`** (lines 35–37).

Assignment Mechanics & Data Flow

1. **Assignment Logic (`src/dispatch/validation.ts`)**

Inside `validateShipment(shipment, order)`, `shipment.dock` is set directly via mutation on the passed `shipment` object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

* **Hazardous orders (`order.type === "hazardous"`)**: Assigned dock `"D4"`.

* **Non-hazardous orders**: Assigned dock `"D1"`, `"D2"`, or `"D3"` deterministically using the modulo index (`numeric % 3`) of the ASCII character code sum of `order.id` against `const docks = ["D1", "D2", "D3", "D4"]`.

2. **Runtime Execution & Persistence (`src/dispatch/releaseService.ts`)**

When an order is released via `releaseShipment(order, zones, actor)`:

* A `Shipment` object is constructed without a `dock` property (`src/dispatch/releaseService.ts`, lines 17–25).

* `releaseShipment` calls `validateShipment(shipment, order)` (`src/dispatch/releaseService.ts`, line 31), which mutates `shipment.dock`.

* The assigned dock is then copied to the released order as `releasedOrder.assignedDock` (`src/dispatch/releaseService.ts`, line 36) and formatted into the dispatch log detail (`src/dispatch/releaseService.ts`, line 48).

* The `shipment.released` event emits the payload containing `shipment` and `order`, which `installNotificationListeners` (`src/notifications/listener.ts`, lines 10–16) reads to display the dock location in UI notifications.

3. **Store & Consumer Reaching (`src/store/useWarehouseStore.ts`)**

* The store action `release(id)` (`src/store/useWarehouseStore.ts`, lines 212–237) calls `releaseShipment`, persists the updated order via `saveOrder`, and updates the store state, making `assignedDock` available to components such as `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 253).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

