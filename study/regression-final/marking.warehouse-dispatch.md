# Marking sheet, warehouse-dispatch

<!-- accuracy-gate-binding: b92d22826b450bb2dc9d03707e383827f2a2dc8b6191a6a80c9ac9978e2a8359 -->

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
Execution starts in **`index.html`**, which serves as the entry document and loads **`src/main.tsx`** as an ES module via `<script type="module" src="/src/main.tsx"></script>`.

---

Step-by-Step Execution Sequence

1. **HTML Document Parsing**

* **File:** `index.html`

* The browser parses the static document containing the `#root` mount container (`<div id="root"></div>`) and executes the module script entry point pointing to `/src/main.tsx`.

2. **Module Evaluation & React DOM Mounting**

* **File:** `src/main.tsx`

* Importing `./App` evaluates `src/App.tsx` at module scope, executing `createBrowserRouter(...)` to define the root route (`<Layout />` at `/`) and its child page routes (`<OrderListPage />`, `<OrderDetailPage />`, `<ZoneOverviewPage />`, and `<DispatchLogPage />`).

* `src/main.tsx` imports React, `ReactDOM` from `react-dom/client`, and global CSS (`./styles.css`), then mounts the application by invoking `ReactDOM.createRoot(document.getElementById("root")!).render(...)` with `<App />` wrapped in `<React.StrictMode>`.

3. **Component Rendering**

* **File:** `src/App.tsx`

* The `App` component retrieves the `initialize` action from `useWarehouseStore` (`src/store/useWarehouseStore.ts`) and renders `<RouterProvider router={router} />`.

4. **Post-Mount Initialization Effects & Timers**

* **File:** `src/App.tsx`

* After the initial render, `App` runs a `useEffect` hook that executes two startup routines:

1. **`installNotificationListeners()`** (`src/notifications/listener.ts`): Checks an `installed` boolean guard, sets it to `true`, and attaches handlers on `eventBus` (`src/events/bus.ts`) for `"shipment.released"` and `"stock.low"` events.

2. **`initialize()`** (`src/store/useWarehouseStore.ts`):

* Checks `if (get().initialized) return;` and updates store state to `{ initialized: true }`.

* Starts a 300 ms recurring interval (`window.setInterval`) polling `drainNotifications()` (`src/notifications/service.ts`) to prepend up to 8 notifications into store state.

* Calls `startRevalidationJob(...)` (`src/jobs/revalidation.ts`), launching a 60,000 ms background timer (`window.setInterval`) that runs `revalidateReservations(...)` against current orders and zones, updating Zustand state (`orders`, `zones`, and `logs`) whenever stock shortages shift order statuses to `"held"`.

* Attaches a `{ once: true }` `"beforeunload"` event listener on `window` to clear the 300 ms notification timer and stop the background revalidation job (`stopJob?.()`).

---

Evidence vs. Inference
**Direct Evidence:** Document structures in `index.html`; module-scope router creation in `src/App.tsx`; root mounting calls in `src/main.tsx`; hook execution in `src/App.tsx`; subscriber setup in `src/notifications/listener.ts`; store state mutations and timer intervals in `src/store/useWarehouseStore.ts` and `src/jobs/revalidation.ts`.
**Inference:** None; every step maps directly to explicit call sites and module definitions in the source files.
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
An order is assigned to warehouse zones on a line-by-line basis through rule-based zone scoring, active inventory filtering, greedy stock depletion, and final reservation commit triggered when an operator allocates stock from the UI or warehouse store.

Control and Data Flow

#### 1. Dispatch Handler Preparation & Initial Inspection

**UI & Store Entry**: An operator initiates allocation by clicking "Allocate stock" in `OrderListPage` (`src/pages/OrderListPage.tsx`) or `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`), calling `allocate(id)` in `useWarehouseStore` (`src/store/useWarehouseStore.ts`).
**Store Action**: `useWarehouseStore` adds the order ID to `loadingOrderIds`, resets `globalError`, and calls `allocateOrder(order, get().zones)` (`src/dispatch/allocator.ts`).
**Handler Resolution**: `allocateOrder` retrieves the type-specific handler via `getHandler(input.type)` (`src/dispatch/handlers/registry.ts`). Dynamic module loading imports handlers from `standardHandler.ts`, `expressHandler.ts`, `bulkHandler.ts`, and `hazardousHandler.ts`.
**Preparation & Inspection**: `allocateOrder` invokes `handler.prepare(structuredClone(input))`, which appends operational notes and updates priority (e.g., `express` is set to `critical`, `hazardous` is set to `urgent`). Initial issue messages are returned by `handler.inspect(prepared)`.

#### 2. Zone Scoring and Candidate Filtering

For each order line in `prepared.lines`, candidate storage zones are evaluated (`src/dispatch/allocator.ts`):

1. **Rule Scoring**: Every zone in the store is scored using `scoreZone(zone, prepared, line)` (`src/config/zoneRules.ts`). `scoreZone` retrieves applicable rules via `rulesFor(order, line)` (sorted descending by `rule.score`). For each applicable rule:

* If `rule.zoneKinds.includes(zone.kind)` is `false`, 25 points are deducted and `rule.prefer` is skipped.

* If `zone.kind` is included, `rule.prefer(zone, order, line)` is evaluated and added to the score:

* **`hazard-isolation` (score 100)**: Applies if `order.type === "hazardous"` or `line.hazardous`. Restricts allowed kinds to `["secure"]`. Secure zones receive +80 points; non-secure zone kinds are excluded by `zoneKinds`, deducting 25 points.

* **`cold-chain` (score 90)**: Applies if `line.temperature !== "ambient"`. Restricts allowed kinds to `["cold"]`. Cold zones receive +70 points if `zone.temperature` matches `line.temperature`, or -100 points if temperatures mismatch; non-cold zone kinds deduct 25 points.

* **`type-routing` (score 50)**: Applies to all lines across `["general", "fast-pick", "bulk", "secure"]` zone kinds (excluding `cold` and `staging`, which deduct 25 points). Looks up `zone.kind` in `typeKinds[order.type]`: returns `40 - position * 10` if found (e.g., position 0 adds 40, position 1 adds 30), or -50 if the zone kind is allowed by the rule but not configured for that order type.

* **`capacity-balance` (score 10)**: Applies to all lines across `["general", "fast-pick", "bulk", "secure", "cold"]` zone kinds. Adds `Math.round((1 - used / zone.capacity) * 20)` based on total on-hand stock in the zone.

2. **Candidate Filtering & Sorting**: Zones are filtered to those where `zone.active === true` and `zone.stock` contains an item where `item.sku === line.sku`. The filtered candidates are sorted in descending order of their total calculated score.

#### 3. Greedy Unreserved Stock Allocation

`allocateOrder` iterates through candidate zones in score order to fulfill `line.quantity` (`src/dispatch/allocator.ts`):

Available stock for the SKU in the candidate zone is computed as `Math.max(0, item.onHand - item.reserved)`.
Allocation quantity is drawn as `quantity = Math.min(remaining, available)`.
If `quantity > 0`, a proposed `Allocation` record (`lineId`, `sku`, `zoneId`, `quantity`, `reservedAt` timestamp, and `lotCode`) is pushed to `proposed`, and `remaining` is decremented.
If `remaining > 0` after evaluating all candidates, an unallocated unit warning is recorded.

#### 4. Finalizing Reservations, Pricing, and Store Persistence

**Stock Reservation Update**: `applyStockReservation(prepared, proposed, zones)` (`src/stock/reservation.ts`) verifies available quantity, updates `item.reserved` on matching zone stock items for accepted quantities, assigns `lotCode`, and returns updated zones and shortages.
**Order Status & Pricing**:

* Status is set to `"allocated"` if every line is fully satisfied (`requested === accepted` across all lines), or `"held"` if shortages exist (`src/dispatch/allocator.ts`).

* Order price (`total`) is calculated via `calculateOrderPrice(prepared)` (`src/pricing/pricing.ts`), which uses `pricingStrategyFor(order)` (`src/config/zoneRules.ts`) to choose legacy pallet pricing (`src/pricing/legacyPricing.ts`) for `bulk` orders or standard pricing with weight, priority, and hazardous surcharges.

**Event Emission**: If `status === "allocated"`, `eventBus.emit("order.allocated", { order })` is dispatched (`src/events/bus.ts`).
**Persistence & State Update**: `saveOrder` sends a `PATCH /orders/:id` request via `apiClient` (`src/dispatch/orderService.ts`, `src/api/api-client.ts`). On success, `useWarehouseStore` (`src/store/useWarehouseStore.ts`) updates `orders` and `zones` in store state, prepends a new `DispatchLogEntry` (`"allocated"` or `"held"`), and removes the order ID from `loadingOrderIds`.
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
The logic that decides how a given order type (`standard`, `express`, `bulk`, or `hazardous`) is processed is defined across six main modules handling preparation and dispatch, zone routing, pricing, validation, network request interception, and UI filtering:

1. Order Processing Handlers and Dynamic Registry
**Registry (`src/dispatch/handlers/registry.ts`)**: `getHandler(type)` dynamically imports modules in `src/dispatch/handlers/*.ts` on its initial run, looking up the registered `DispatchHandler` corresponding to `order.type`.
**Handler Implementations (`src/dispatch/handlers/*.ts`)**: Each handler implements `prepare`, `inspect`, and `shipmentDefaults`:

* **`standardHandler.ts`**: Appends `"Standard pick wave assigned"` to `order.notes`, inspects for empty lines or line quantities $>100$, and sets defaults to carrier `"Northline Ground"` with package count $\lceil\text{units} / 12\rceil$.

* **`expressHandler.ts`**: Sets `order.priority` to `"critical"`, appends `"Moved to express pick lane"` to `order.notes`, inspects minutes remaining until `dueAt` (flagging if elapsed or $<90$ minutes), and sets defaults to carrier `"Apex Priority"` with package count $\lceil\text{weightKg} / 20\rceil$.

* **`bulkHandler.ts`**: Appends a forklift request note based on total load weight, inspects for total units $<20$ or missing destination company, and sets defaults to carrier `"Atlas Freight"` with package count $\lceil\text{weightKg} / 500\rceil$.

* **`hazardousHandler.ts`**: Sets `order.priority` to `"urgent"`, appends `"Dangerous goods paperwork required"` to `order.notes`, inspects for missing hazardous lines or non-US destination, and sets defaults to carrier `"SecureChem Logistics"` with package count $\lceil\text{units} / 4\rceil$.

**Consumers**: `allocateOrder` in `src/dispatch/allocator.ts` runs `prepare()` and `inspect()`. `releaseShipment` in `src/dispatch/releaseService.ts` runs `shipmentDefaults()`.

---

2. Zone Routing and Inventory Allocation Scoring
**Zone Preference Priorities (`src/config/zoneRules.ts`)**: The `typeKinds` dictionary maps each order type to an ordered list of preferred zone kinds:

* `standard`: `["general", "fast-pick"]`

* `express`: `["fast-pick", "general"]`

* `bulk`: `["bulk", "general"]`

* `hazardous`: `["secure"]`

**Allocation Scoring Rules (`src/config/zoneRules.ts`)**:

* **`hazard-isolation`**: When `order.type === "hazardous"` or `line.hazardous` is `true`, scores $+80$ if `zone.kind === "secure"` or $-100$ otherwise.

* **`type-routing`**: Searches `typeKinds[order.type]` for `zone.kind`. If found at position index `pos`, adds `40 - pos * 10`; if not found, deducts $50$ points.

**Consumer**: Evaluated by `scoreZone()` when sorting candidates during inventory allocation in `src/dispatch/allocator.ts`.

---

3. Pricing Strategy Selection
**Strategy Mapping (`src/config/zoneRules.ts`)**: `pricingByType` maps `bulk` to `"legacy"` pricing and `standard`, `express`, and `hazardous` to `"current"` pricing. `pricingStrategyFor(order)` evaluates this mapping.
**Price Calculation (`src/pricing/pricing.ts`)**: `calculateOrderPrice(order)` checks `pricingStrategyFor(order)`:

* If `"legacy"`, calls `calculateLegacyPrice(order)` in `src/pricing/legacyPricing.ts` (subtotal + $\$18.50$ per estimated $500\text{ kg}$ pallet - volume discount).

* If `"current"`, calculates subtotal + handling fee ($\max(\$7.50, \text{weight} \times 0.11)$) + priority fee ($\$45$ for critical, $\$20$ for urgent) + $\$65$ hazardous surcharge if any line has `hazardous: true`.

**Consumer**: Run inside `allocateOrder` in `src/dispatch/allocator.ts` to set `order.total`.

---

4. Shipment Validation and Dock Assignment
**Validation & Dock Routing (`src/dispatch/validation.ts`)**: In `validateShipment(shipment, order)`:

* If `order.type === "hazardous"`, enforces carrier `"SecureChem Logistics"` (yielding error `"Approved dangerous goods carrier required"` if mismatched) and sets `shipment.dock` to `"D4"`.

* For other order types, sets `shipment.dock` to `"D1"`, `"D2"`, or `"D3"` based on the character-code sum of `order.id` modulo 3.

**Consumer**: Evaluated in `releaseShipment` in `src/dispatch/releaseService.ts`.

---

5. Outbound API Routing Interception
**Request Interceptor (`src/api/interceptors/hazardous-interceptor.ts`)**: `hazardousInterceptor` checks if `body?.type === "hazardous"`. If true, it rewrites `request.path` from `/orders` to `/controlled/orders`, adds header `x-controlled-load: true`, and sets `metadata.routing = "dangerous-goods"`.
**Consumer**: Applied to all client requests in `src/api/api-client.ts` via `applyInterceptors` in `src/api/interceptors/index.ts`.

---

6. UI Filtering
**Store Filtering (`src/store/useWarehouseStore.ts`)**: `filteredOrders` applies `state.filters.type === "all" || order.type === state.filters.type` to filter orders displayed on the `OrderListPage` (`src/pages/OrderListPage.tsx`).
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
Stock reservation—where requested order allocations are evaluated against on-hand stock and `item.reserved` quantities are calculated or increased—is executed through 1 central domain function across 3 production call sites, reached by 3 runtime entry points (plus 1 test suite).

---

Central Reservation Function
**`applyStockReservation()` (`src/stock/reservation.ts`, lines 10–39)**

Calculates available inventory (`onHand - reserved + alreadyReserved`), increases reserved inventory (`item.reserved = Math.max(0, item.reserved - alreadyReserved) + quantity`, line 35), assigns item lot codes (`lotCode: item.lotCode`), and returns an outcome object containing cloned updated zones, accepted allocations, and shortage strings.

---

Production Call Sites

1. **Order Allocation Processing (`src/dispatch/allocator.ts`, line 52)**

* **Call:** `applyStockReservation(prepared, proposed, zones)`

* **Flow:** Inside `allocateOrder()`, order lines are routed to candidate zones. Proposed allocations are evaluated by `applyStockReservation()`. If all lines are fully reserved, the order status becomes `"allocated"`; if any unallocated quantity or shortage exists, the status becomes `"held"`.

2. **Shipment Release Re-evaluation (`src/dispatch/releaseService.ts`, line 30)**

* **Call:** `applyStockReservation(order, order.allocations, zones)`

* **Flow:** Inside `releaseShipment()`, order allocations are verified against current zone stock prior to shipment validation. If shortages occur, `releaseShipment()` throws an error and aborts release.

3. **Background Reservation Revalidation (`src/jobs/revalidation.ts`, line 20)**

* **Call:** `applyStockReservation({ ...order, allocations: [] }, order.allocations, workingZones)`

* **Flow:** Inside `revalidateReservations()`, active non-released orders (`allocated`, `picking`, `ready`) have their reservations re-applied against a working copy of zones reset to `reserved: 0`. Orders encountering shortages are updated with status `"held"` and a note appended.

---

Runtime Entry Points Reaching Reservation Logic
**UI Stock Allocation Action:** Triggered when an operator clicks "Allocate stock" on an order card in `OrderListPage` (`src/pages/OrderListPage.tsx`, line 141) or order detail header in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 69). This invokes `useWarehouseStore.allocate()` (`src/store/useWarehouseStore.ts`, line 140), executing `allocateOrder()`.
**UI Shipment Release Action:** Triggered when an operator clicks "Release shipment" in `OrderDetailPage` (`src/pages/OrderDetailPage.tsx`, line 85). This invokes `useWarehouseStore.release()` (`src/store/useWarehouseStore.ts`, line 198), executing `releaseShipment()`.
**Periodic Revalidation Timer:** Started during store initialization in `useWarehouseStore.initialize()` (`src/store/useWarehouseStore.ts`, line 105) when `App` mounts (`src/App.tsx`, line 28). `startRevalidationJob()` (`src/jobs/revalidation.ts`, lines 47–59) executes `revalidateReservations()` on a 60-second interval.

---

Test-Only Invocation Sites
**`src/tests/reservation.test.ts` (lines 22, 32):** Direct unit test invocations verifying stock reservation increments, lot code population, and shortage handling.

---

Excluded Non-Reservation Stock Operations

The following operations mutate `item.reserved` but do not reserve stock:

**Seed State (`src/data/seedData.ts`, lines 303–384):** Hardcoded initial stock state in `seedZones`.
**Working Zone Zeroing (`src/jobs/revalidation.ts`, line 14):** Clears working reservation counters (`reserved: 0`) prior to re-applying reservations during background revalidation.
**Committed Stock Deduction (`src/stock/stockService.ts`, line 28):** `commitReleasedStock()` decrements `item.reserved` and `item.onHand` upon shipment release, consuming and releasing reserved inventory rather than reserving it.
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
Before an outgoing request is passed to the request handler (`handleRequest`), `apiClient` constructs an initial request object and processes it sequentially through a pipeline of three request interceptors in `applyInterceptors` (`src/api/api-client.ts`, `src/api/interceptors/index.ts`).

1. Request Construction

When an API call (`get`, `post`, or `patch`) is invoked on `apiClient`, `request()` creates an initial `ApiRequest` object (`src/api/api-client.ts`):

`path`: target string passed by the caller.
`method`: `"GET"`, `"POST"`, or `"PATCH"`.
`body`: payload provided by the caller (or `undefined` for `get`).
`headers`: `{ accept: "application/json" }`.
`metadata`: `{}`.
2. Interceptor Pipeline Processing

`applyInterceptors` executes an array of three interceptor functions in sequential `for...of` order, passing the mutated request from one stage to the next (`src/api/interceptors/index.ts`):

1. **Authentication Interceptor** (`src/api/interceptors/auth-interceptor.ts`)

* Preserves existing headers and adds `authorization: "Bearer warehouse-console-session"`.

2. **Audit Interceptor** (`src/api/interceptors/audit-interceptor.ts`)

* Preserves existing headers and adds `x-requested-at` populated with `new Date().toISOString()`.

* Preserves existing metadata and adds `source: "dispatch-console"` and `correlationId` generated via `crypto.randomUUID()`.

3. **Hazardous Material Interceptor** (`src/api/interceptors/hazardous-interceptor.ts`)

* Inspects `request.body` (typed as `Partial<Order>`).

* If `body?.type === "hazardous"`:

* Replaces `"/orders"` in `path` with `"/controlled/orders"`.

* Adds `x-controlled-load: "true"` to `headers`.

* Adds `routing: "dangerous-goods"` to `metadata`.

* If `body?.type` is missing or not `"hazardous"`, it returns the request unmodified.

3. Request Dispatch

After `applyInterceptors` finishes transforming the object, `apiClient` passes the final `ApiRequest` object into `handleRequest` in `src/api/mock-server.ts` (`src/api/api-client.ts`).
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
`validateShipment` does not only perform checks; it mutates state in-place by setting the `dock` property on the `shipment` argument passed into it (`shipment.dock`).

Details and Flow

1. **In-Place Mutation (`src/dispatch/validation.ts`)**

Near the end of `validateShipment(shipment, order)`, after compiling `errors` and `warnings`, it calculates a dock assignment based on the order ID and type and assigns `shipment.dock` directly on the input object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

2. **Application Runtime Reach (`src/dispatch/releaseService.ts`, `src/store/useWarehouseStore.ts`, `src/pages/OrderDetailPage.tsx`)**

- In `releaseShipment` (`src/dispatch/releaseService.ts`), a `shipment` object is created without a `dock` field.

- Calling `validateShipment(shipment, order)` assigns `shipment.dock`.

- The assigned `shipment.dock` is copied to `releasedOrder.assignedDock` and embedded into `log.detail`.

- In `useWarehouseStore.release` (`src/store/useWarehouseStore.ts`), `releasedOrder` is persisted and committed into store state (`orders`), which renders `order.assignedDock` in the UI (`src/pages/OrderDetailPage.tsx`).

3. **Validation Unit Test Usage (`src/tests/validation.test.ts`)**

Tests invoke `validateShipment(candidate, order)` and verify dock routing directly by inspecting the mutated `candidate.dock` property.
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
For a bulk order (`order.type === "bulk"`), the pricing implementation that runs is **`calculateLegacyPrice`** defined in `src/pricing/legacyPricing.ts`.

Why This Implementation Runs

1. **Order Type to Strategy Mapping**:

When `calculateOrderPrice` is called (`src/pricing/pricing.ts`), it retrieves the pricing strategy via `pricingStrategyFor(order)` (`src/config/zoneRules.ts`). In `src/config/zoneRules.ts`, the `pricingByType` dictionary maps `"bulk"` directly to the `"legacy"` strategy:

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

2. **Branch Dispatch**:

`calculateOrderPrice` in `src/pricing/pricing.ts` evaluates the strategy and executes an early return to `calculateLegacyPrice(order)` when `strategy === "legacy"`:

```ts

export function calculateOrderPrice(order: Order): number {

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

...

}

```

3. **Application Call Flow**:

During application runtime, `calculateOrderPrice` is invoked in `allocateOrder` (`src/dispatch/allocator.ts`) to set `order.total`. This flow is triggered when `useWarehouseStore.allocate(id)` is called (`src/store/useWarehouseStore.ts`), which is bound to the "Allocate stock" action in `src/components/OrderCard.tsx` and `src/pages/OrderDetailPage.tsx`.

4. **Pricing Logic Executed**:

Instead of the standard formula (which applies handling derived from weight * 0.11 with a $7.50 floor, plus priority fees and hazardous surcharges), `calculateLegacyPrice` in `src/pricing/legacyPricing.ts`:

- Calculates line subtotal as $\sum (\text{quantity} \times \text{unitPrice})$.

- Calculates pallet count as `Math.max(1, Math.ceil(totalWeight / 500))` where `totalWeight` is $\sum (\text{quantity} \times \text{weightKg})$.

- Calculates handling charges as $\$18.50 \times \text{pallets}$.

- Applies a volume discount on the subtotal ($7.5\%$ if subtotal $> \$5000$; $4\%$ if subtotal $> \$2000$; otherwise $0$).

- Returns `Number((subtotal + handling - volumeDiscount).toFixed(2))`.
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
When an event is emitted on the `eventBus`, reactions occur for two registered event types: **`shipment.released`** and **`stock.low`**. The other two declared event types, **`order.allocated`** and **`notification.created`**, are emitted during execution but have no registered subscribers on the event bus.

---

Registered Event Subscriptions and Their Reactions

#### 1. `shipment.released`

**Emission Site:** `src/dispatch/releaseService.ts` inside `releaseShipment()` after stock release committed to zones.
**Registered Subscriber:** `src/notifications/listener.ts` (installed by `installNotificationListeners()` called in `src/App.tsx`).
**Reaction:**

1. Accepts `{ order, shipment }` payload.

2. Calls `publishNotification()` in `src/notifications/service.ts` with success level, title including `order.id`, and message detailing `shipment.packageCount` and `shipment.dock`.

3. `publishNotification()` prepends a formatted `Notification` object into an in-memory `pending` array.

#### 2. `stock.low`

**Emission Site:** `src/stock/stockService.ts` inside `commitReleasedStock()` when a stock line's available quantity (`onHand - reserved`) falls to or below its `reorderPoint`.
**Registered Subscribers:**

1. **Notification Listener** (`src/notifications/listener.ts`): Calls `publishNotification()` in `src/notifications/service.ts` with a warning level toast message containing `sku`, `zoneId`, and `available` quantity.

2. **Stock Signal Service** (`src/stock/stockService.ts`): Subscribed at module load time. Prepends a signal string `"${sku} in ${zoneId}: ${available} available"` into the module-scoped `lowStockSignals` array (capped at 20 entries), accessible via `getLowStockSignals()`.

---

Downstream Reaction Flow to Notifications

Although `notification.created` has no subscriber listening on `eventBus`, notifications generated in reaction to `shipment.released` and `stock.low` reach the UI through store polling:

1. **Polling:** In `src/store/useWarehouseStore.ts`, store initialization sets a `300ms` window interval executing `drainNotifications()` from `src/notifications/service.ts`.

2. **State Store Mutation:** `drainNotifications()` empties the `pending` array. The Zustand store prepends returned items to `state.notifications`, keeping the top 8 entries.

3. **UI Render:** `src/components/Toasts.tsx` reads `state.notifications` and renders interactive toast overlays on screen.

---

Declared Events Emitted Without Subscribers
**`order.allocated`**: Emitted in `src/dispatch/allocator.ts` inside `allocateOrder()` when all lines are completely allocated. No listener is registered in the codebase for `order.allocated`.
**`notification.created`**: Emitted in `src/notifications/service.ts` inside `publishNotification()`. No listener is registered in the codebase for `notification.created`.

---

Sources and Evidence
**Event definitions & EventBus instance:** `src/events/bus.ts`
**Event emission points:** `src/dispatch/releaseService.ts`, `src/stock/stockService.ts`, `src/dispatch/allocator.ts`, `src/notifications/service.ts`
**Event subscriptions (`eventBus.on`):** `src/notifications/listener.ts`, `src/stock/stockService.ts`
**Listener setup and state consumption:** `src/App.tsx`, `src/store/useWarehouseStore.ts`, `src/components/Toasts.tsx`
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
To add a new order type to the system, you must update the type definition in `src/types/domain.ts`, add exhaustive configuration mapping in `src/config/zoneRules.ts`, create and register a new handler module under `src/dispatch/handlers/`, and update the UI filter array in `src/pages/OrderListPage.tsx`.

---

Required Changes

1. **Domain Type Union**

* **File:** `src/types/domain.ts`

* **Direct Evidence:** `export type OrderType = "standard" | "express" | "bulk" | "hazardous";`

* **Change:** Add the new order type literal string to the `OrderType` union.

2. **Exhaustive Zone Preferences and Pricing Rules**

* **File:** `src/config/zoneRules.ts`

* **Direct Evidence:**

* `const typeKinds: Record<OrderType, Zone["kind"][]>`

* `const pricingByType: Record<OrderType, PricingStrategy>`

* **Change:** Because `typeKinds` and `pricingByType` use TypeScript's `Record<OrderType, ...>`, adding a new type requires adding keys for it in both objects. `typeKinds` defines zone preference priorities for zone scoring, and `pricingByType` assigns the pricing strategy (`"current"` or `"legacy"`).

3. **Dispatch Handler Implementation and Registration**

* **Files:** `src/dispatch/handlers/registry.ts`, `src/dispatch/allocator.ts`, `src/dispatch/releaseService.ts`, and existing handler files (`src/dispatch/handlers/standardHandler.ts`, `src/dispatch/handlers/expressHandler.ts`, `src/dispatch/handlers/bulkHandler.ts`, `src/dispatch/handlers/hazardousHandler.ts`).

* **Direct Evidence:**

* `registry.ts` auto-loads handlers via `import.meta.glob("./*.ts")`.

* `allocateOrder` (`src/dispatch/allocator.ts`) and `releaseShipment` (`src/dispatch/releaseService.ts`) both execute `await getHandler(order.type)`. If no handler is registered for `type`, `getHandler` throws `"No dispatch handler registered for ${type}"`.

* **Change:** Create a new handler `.ts` file inside `src/dispatch/handlers/` that calls `registerHandler` with a `DispatchHandler` object defining `type`, `prepare`, `inspect`, and `shipmentDefaults`.

4. **UI Filter Options**

* **File:** `src/pages/OrderListPage.tsx`

* **Direct Evidence:** `const types: Array<Order["type"] | "all"> = ["all", "standard", "express", "bulk", "hazardous"];`

* **Change:** Add the new type literal string to `types` so operators can filter orders by the new type in the UI.

---

Conditional & Context-Specific Changes
**Shipment Validation & Dock Assignment:** In `src/dispatch/validation.ts`, `validateShipment` checks `order.type === "hazardous"` to restrict carriers and assign dock `"D4"`. If the new type requires specific dock rules or carrier restrictions, add logic to `validateShipment`.
**New Pricing Strategy:** If neither `"current"` nor `"legacy"` pricing applies to the new order type, add a new strategy to `PricingStrategy` in `src/config/zoneRules.ts` and add its calculation branch in `src/pricing/pricing.ts`.
**API Interceptors:** `src/api/interceptors/hazardous-interceptor.ts` intercepts hazardous order requests to rewrite paths and headers. If the new order type requires custom network request mapping, add a new interceptor module and include it in `interceptors` in `src/api/interceptors/index.ts`.
**Mock / Seed Data:** In `src/data/seedData.ts`, add entries using the new type to `orderSpecs` if mock instance data is needed for development or tests.
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
Changing `src/config/zoneRules.ts` affects zone candidate scoring during order allocation via `scoreZone` and strategy selection for order pricing via `pricingStrategyFor`.

Direct External Code Entry Points

`src/config/zoneRules.ts` exports two functions consumed outside the configuration layer:

1. `scoreZone`: Consumed by `allocateOrder` (`src/dispatch/allocator.ts`) to score and rank candidate zones for each order line.

2. `pricingStrategyFor`: Consumed by `calculateOrderPrice` (`src/pricing/pricing.ts`) to determine whether an order uses `current` or `legacy` pricing, and directly imported in tests (`src/tests/pricing.test.ts`).

The internal tables (`typeKinds`, `pricingByType`, `zoneRules`) and helper `rulesFor` are file-private or internal to `src/config/zoneRules.ts` and drive these two exported functions.

---

1. Zone Candidate Scoring and Stock Allocation Impact
**Scoring Logic (`src/config/zoneRules.ts`):** `scoreZone` evaluates applicable rules returned by `rulesFor(order, line)`. For each rule, if `zone.kind` is not included in `rule.zoneKinds`, `scoreZone` subtracts `25` without executing `rule.prefer`. Otherwise, it adds the numeric preference returned by `rule.prefer(zone, order, line)`.
**Allocation Execution (`src/dispatch/allocator.ts`):** `allocateOrder` maps active zones holding stock for an order line's SKU, computes `scoreZone`, sorts candidates descending by score, and sequentially draft-allocates available stock (`onHand - reserved`).
**Shortages and Order Status (`src/dispatch/allocator.ts`):**

* Rule changes that penalize or re-rank stocked zones alter which candidate zones fulfill an order line.

* If unallocated quantity remains for any line, allocation warning messages are appended.

* If all order lines are fully satisfied, `order.status` becomes `"allocated"` and `allocateOrder` emits the `order.allocated` event on `eventBus` (`src/events/bus.ts`). Note that `order.allocated` currently has no registered subscribers in `src/notifications/listener.ts`.

* If any line remains partially unallocated, `order.status` becomes `"held"`.

**Reservation Mutators (`src/stock/reservation.ts`):** `applyStockReservation` consumes the proposed allocations to update `reserved` counts on zone stock items (`item.reserved`) and set `allocation.lotCode`.
**State Persistence (`src/store/useWarehouseStore.ts`):** The `allocate(id)` store action persists updated order state via `saveOrder` (`src/dispatch/orderService.ts`), updates store `orders` and `zones` state, and prepends an audit log entry (`"allocated"` or `"held"`) to store `logs`.

---

2. Downstream Job Execution and Release Commit
**Revalidation Job (`src/jobs/revalidation.ts`):** `revalidateReservations` periodically re-evaluates active reservations for orders in `"allocated"`, `"picking"`, or `"ready"` status. If rule changes altered historical allocation patterns that can no longer be backed by available zone stock, orders transition to `"held"`, log entries (`"revalidated"`) are generated, and store state updates.
**Shipment Release & Stock Depletion (`src/dispatch/releaseService.ts`, `src/stock/stockService.ts`):**

* When releasing a ready order via `releaseShipment`, the allocated `zoneId` entries determine which zone inventory is decremented by `commitReleasedStock`.

* `commitReleasedStock` decreases `onHand` and `reserved` inventory counts in store zones.

* If resulting stock falls at or below `reorderPoint`, `commitReleasedStock` emits `stock.low`. `installNotificationListeners` (`src/notifications/listener.ts`) listens to `stock.low` and enqueues warning toasts displayed in the UI via `Toasts.tsx` (`src/components/Toasts.tsx`).

---

3. Order Pricing Calculation Impact
**Pricing Strategy Dispatch (`src/pricing/pricing.ts`):** `calculateOrderPrice` calls `pricingStrategyFor(order)`, which looks up `pricingByType[order.type]` in `src/config/zoneRules.ts`.
**Legacy Strategy (`src/pricing/legacyPricing.ts`):** Returns costs derived from pallet counts ($18.50 per 500kg pallet, minimum 1) and volume discounts (4% over $2,000; 7.5% over $5,000).
**Current Strategy (`src/pricing/pricing.ts`):** Computes subtotal + weight handling (max($7.50, weight × $0.11)) + priority fee ($45 critical / $20 urgent) + hazardous surcharge ($65 if hazardous lines exist).
**Store Impact (`src/dispatch/allocator.ts`):** `allocateOrder` executes `calculateOrderPrice` during allocation and sets `order.total`, which is saved into store state.

---

4. UI Rendering Consumers
**`src/components/OrderCard.tsx`:** Renders `order.total`, order status pills (`"allocated"` / `"held"`), unit allocation progress bars, and allocation action buttons.
**`src/pages/OrderDetailPage.tsx`:** Renders line item allocation chips (`zoneId` and allocated quantity), total calculated order value, status tags, and mini zone availability metrics.
**`src/pages/ZoneOverviewPage.tsx` & `src/components/ZoneCard.tsx`:** Render zone utilization percentages, total reserved inventory, available stock (`onHand - reserved`), and low-stock reorder warnings.
**`src/pages/DispatchLogPage.tsx`:** Renders event log rows for `"allocated"`, `"held"`, and `"revalidated"` actions.
**`src/components/Layout.tsx`:** Sidebar counters update based on orders matching `"incoming"` and `"ready"` statuses.

---

Affected Test Suites
`src/tests/allocation.test.ts`: Directly tests `allocateOrder` candidate zone selection for express orders (verifying fast-pick zone `ZB-02`) and hazardous items (verifying secure zone `ZS-04`).
`src/tests/pricing.test.ts`: Directly tests `pricingStrategyFor` returning `"legacy"` for bulk orders, price equivalence with `calculateLegacyPrice`, and handling/dangerous goods surcharges under current pricing.
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
Yes, hazardous orders (`order.type === "hazardous"`) and orders containing hazardous items (`line.hazardous === true`) are treated differently across six distinct areas: API request interception, zone scoring during stock allocation, dispatch handling, shipment release validation and dock assignment, order pricing, and UI filtering and display.

---

Exhaustive Breakdown of Hazardous Order Handling

#### 1. API Request Interception and Path Rerouting

**Files:** `src/api/interceptors/hazardous-interceptor.ts`, `src/api/interceptors/index.ts`, `src/api/api-client.ts`, `src/api/mock-server.ts`
**Logic:** When an API request body contains `type: "hazardous"`, `hazardousInterceptor` modifies the `ApiRequest`:

* Replaces `/orders` in `request.path` with `/controlled/orders`.

* Adds header `"x-controlled-load": "true"`.

* Sets `request.metadata.routing = "dangerous-goods"`.

**Runtime Execution:** `apiClient.patch` applies interceptors via `applyInterceptors` when saving orders (`saveOrder` in `src/dispatch/orderService.ts`). `handleRequest` in `src/api/mock-server.ts` strips `/controlled/orders` back to `/orders` via `normalizedPath()` to process the request.

#### 2. Zone Selection and Scoring Rules

**Files:** `src/config/zoneRules.ts`, `src/dispatch/allocator.ts`
**Logic:**

* **Zone Type Mapping:** `typeKinds.hazardous` maps hazardous orders to `["secure"]`.

* **Hazard Isolation Rule:** `hazard-isolation` applies when `order.type === "hazardous"` or `line.hazardous === true`. It awards `+80` preference score to `secure` zones and `-100` to all other zone kinds.

* **Mismatch Penalty:** `scoreZone()` applies an additional `-25` penalty to non-secure zones because `secure` is the only zone kind listed in `hazard-isolation.zoneKinds`.

**Runtime Execution:** `allocateOrder` in `src/dispatch/allocator.ts` uses `scoreZone` to rank candidate zones. The penalties prioritize secure zones (such as `ZS-04 Controlled Materials` in `src/data/seedData.ts`) for hazardous items.

#### 3. Dispatch Type Handler (`hazardousHandler`)

**Files:** `src/dispatch/handlers/hazardousHandler.ts`, `src/dispatch/handlers/registry.ts`, `src/dispatch/allocator.ts`, `src/dispatch/releaseService.ts`
**Logic:** Dynamically loaded via `getHandler("hazardous")` whenever processing an order with `order.type === "hazardous"`:

* **`prepare(order)`:** Sets `order.priority = "urgent"` and appends `"Dangerous goods paperwork required"` to `order.notes`.

* **`inspect(order)`:** Returns a warning if no line item has `line.hazardous === true` (`"Hazardous order has no regulated line"`) or if `order.destination.country !== "US"` (`"International dangerous goods review required"`).

* **`shipmentDefaults(order)`:** Returns `carrier: "SecureChem Logistics"` and calculates `packageCount: Math.max(1, Math.ceil(units / 4))`.

#### 4. Shipment Release Validation and Dock Assignment

**Files:** `src/dispatch/validation.ts`, `src/dispatch/releaseService.ts`
**Logic:** During `releaseShipment()` execution:

* **Carrier Validation:** Appends the error `"Approved dangerous goods carrier required"` if `order.type === "hazardous"` and `shipment.carrier !== "SecureChem Logistics"`.

* **Dock Routing:** Hardcodes `shipment.dock = "D4"` when `order.type === "hazardous"`. Non-hazardous orders are routed across docks `D1`, `D2`, or `D3` based on a modulo calculation of the order ID character codes.

#### 5. Order Pricing Surcharge

**Files:** `src/pricing/pricing.ts`, `src/config/zoneRules.ts`
**Logic:** In `calculateOrderPrice()`, orders using the `"current"` pricing strategy (which includes `hazardous` order types per `pricingByType`) add a flat `$65` surcharge (`hazardousFee`) if any line item has `line.hazardous === true`.

#### 6. UI Filtering and Visual Display

**Order List Page (`src/pages/OrderListPage.tsx`):** Provides `"hazardous"` as a dropdown option in the order type filter control.
**Order Detail Page (`src/pages/OrderDetailPage.tsx`):** Conditionally renders an `<em>Controlled</em>` badge in the line items table alongside any order line where `line.hazardous === true`.
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
A dock is assigned to a shipment in **`src/dispatch/validation.ts`** inside the **`validateShipment`** function, which directly mutates the `shipment.dock` property.

Code Location & Logic

In `src/dispatch/validation.ts` (lines 35–37):

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

**Hazardous orders (`order.type === "hazardous"`)**: Assigned directly to dock **`"D4"`**.
**Non-hazardous orders**: Assigned to **`"D1"`**, **`"D2"`**, or **`"D3"`** from the array `docks = ["D1", "D2", "D3", "D4"]` (`src/dispatch/validation.ts`, line 11) using the sum of character codes in `order.id` modulo 3.

---

Control Flow & Runtime Impact

1. **Trigger**: An operator triggers shipment release in the UI via `src/pages/OrderDetailPage.tsx` (line 71), calling the Zustand store action `release(id)` in `src/store/useWarehouseStore.ts` (line 221).

2. **Service Execution**: The store action calls `releaseShipment(order, zones, "Current operator")` in `src/dispatch/releaseService.ts` (line 228).

3. **Dock Assignment**: `releaseShipment` creates an in-memory `shipment` object and passes it to `validateShipment(shipment, order)` (`src/dispatch/releaseService.ts`, line 28), which calculates and sets `shipment.dock`.

4. **Downstream Usage**:

* **Order State**: `releaseShipment` assigns `shipment.dock` to `releasedOrder.assignedDock` (`src/dispatch/releaseService.ts`, line 34).

* **Audit Log**: `releaseShipment` includes `shipment.dock` in the dispatch log detail string (`src/dispatch/releaseService.ts`, line 43).

* **Events & Toasts**: `releaseShipment` emits the `"shipment.released"` event (`src/dispatch/releaseService.ts`, line 49). The event listener in `src/notifications/listener.ts` (lines 9–14) reads `shipment.dock` to construct a user notification toast.

* **UI Rendering**: `src/pages/OrderDetailPage.tsx` displays `order.assignedDock` in the release status label (line 77) and the dispatch detail panel (line 254).

5. **Unit Test Execution**: `validateShipment` is also invoked directly in unit tests within `src/tests/validation.test.ts` (lines 28, 43).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

