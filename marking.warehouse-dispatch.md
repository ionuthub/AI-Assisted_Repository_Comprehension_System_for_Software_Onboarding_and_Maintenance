# Marking sheet — warehouse-dispatch

<!-- accuracy-gate-binding: d680c658d56472b3f0286f29be56ddb5ddda05ee47b26632b8a88fea6b505553 -->

12 questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

**What counts as the standard: the Answer, not the Notes.** Each question's Notes are shown
collapsed beneath it, because a marker needs to know what is in the repository, but an answer is
not incorrect merely for omitting something that appears only in a Note. The Notes record traps,
reachability findings and counter-examples; requiring a tool to reproduce all of them would set a
bar nothing could meet, and it was not the standard declared in advance.

This has to be stated because it was previously left implicit, and two markers then marked the
same items against different material — one seeing the Answer alone, one seeing the whole
ground-truth document. Some of what looked like disagreement was two people answering different
questions. Where an omission from a Note seems decisive, mark against the Answer and say so on
the "Why" line; that keeps the stricter reading available without hiding it inside the figure.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect study/accuracy-gate.warehouse-dispatch.json marking.warehouse-dispatch.md

---

## Q1 — orientation

> Where does execution start in this project?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/jobs/revalidation.ts (0.04), src/store/useWarehouseStore.ts (0.02), src/data/seedData.ts (0.02)

```
Based on the provided repository context, the main application entry point (such as an `index.html`, `main.tsx`, or `App.tsx` file) is **not present** in the provided source code.

However, within the context of the provided codebase, execution of the core domain logic and background tasks starts with the initialization of the state store:

1. Store Initialization

The reactive warehouse state and background jobs are kicked off by calling the `initialize()` method on the Zustand store defined in `src/store/useWarehouseStore.ts` (lines 89–100):

```typescript

initialize() {

if (get().initialized) return;

set({ initialized: true });

const pullNotifications = window.setInterval(() => {

const additions = drainNotifications();

if (additions.length) {

set((state) => ({

notifications: [...additions, ...state.notifications].slice(0, 8),

}));

}

}, 300);

stopJob = startRevalidationJob(

() => // ...

```

2. Background Process Execution

When `initialize()` is called, it registers two persistent background loops:

**Notification Polling Loop:** Sets a `window.setInterval` to poll and drain notifications every 300ms (lines 93–99 of `src/store/useWarehouseStore.ts`).
**Reservation Revalidation Job:** Calls `startRevalidationJob` (imported from `src/jobs/revalidation.ts`), which registers a second `window.setInterval` (defaulting to every 60,000ms) to run `revalidateReservations` against the store's current orders and zones (lines 40–51 of `src/jobs/revalidation.ts`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q2 — config-driven behaviour

> How is an order assigned to a warehouse zone?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/config/zoneRules.ts (0.27), src/pages/ZoneOverviewPage.tsx (0.2), src/dispatch/allocator.ts (0.18)

```
An order is assigned to warehouse zones through a line-by-line allocation process managed in `src/dispatch/allocator.ts`. The process evaluates, scores, and selects active candidate zones containing the required stock.

---

1. Candidate Filtering and Sorting

For each line in an order, `allocateOrder` (in `src/dispatch/allocator.ts`) evaluates all available zones. A zone is qualified as a candidate for a line if:

It is active (`zone.active`).
It contains stock for the requested SKU (`zone.stock.some(item => item.sku === line.sku)`).

Candidate zones are then sorted in descending order based on a score computed by `scoreZone` from `src/config/zoneRules.ts`:

```typescript

const candidates = zones

.map((zone) => ({ zone, score: scoreZone(zone, prepared, line) }))

.filter(

({ zone }) =>

zone.active && zone.stock.some((item) => item.sku === line.sku),

)

.sort((left, right) => right.score - left.score);

```

---

2. Scoring Mechanism (`src/config/zoneRules.ts`)

The `scoreZone` function calculates a zone's fitness score for a specific order line.

1. **Rule Filtering**: It fetches applicable rules using `rulesFor(order, line)`, which filters the global `zoneRules` list using `rule.applies(order, line)` and sorts them by rule priority (`score` descending).

2. **Score Reduction**: It iterates over the applicable rules starting with a score of `0`:

* If the zone's kind (`zone.kind`) is not supported by the rule's `zoneKinds`, the score is penalized by **`-25`**.

* Otherwise, the score is adjusted by the return value of `rule.prefer(zone, order, line)`.

#### The Active Rules (Sorted by Priority/Score)

**`hazard-isolation` (Rule Score: 100)**:

* *Applies if*: The order type is `"hazardous"` or the order line is flagged as `hazardous`.

* *Preference*: Returns `80` if the zone kind is `"secure"`, and `-100` otherwise.

**`cold-chain` (Rule Score: 90)**:

* *Applies if*: The line temperature is not `"ambient"`.

* *Preference*: Returns `70` if `zone.temperature === line.temperature`, and `-100` otherwise.

**`type-routing` (Rule Score: 50)**:

* *Applies if*: Always (`() => true`).

* *Preference*: Determines priority based on the order type's preferred zone mapping (`typeKinds`). Returns `40 - position * 10` if the zone kind is found in the sequence, and `-50` if it is not.

**`capacity-balance` (Rule Score: 10)**:

* *Applies if*: Always (`() => true`).

* *Preference*: Prefers zones with lower stock utilization. It calculates the proportion of free capacity and scales it: `Math.round((1 - used / zone.capacity) * 20)`.

---

3. Inventory Allocation and Reservation

Once candidate zones are sorted by score, the allocator iterates through them to fulfill the line's requested quantity:

1. **Available Stock Calculation**: For each candidate zone, the available stock is computed as:

$$\text{Available} = \max(0, \text{onHand} - \text{reserved})$$

2. **Quantity Deduction**: The allocator reserves the minimum of the remaining required quantity and the available stock:

```typescript

const quantity = Math.min(remaining, available);

```

3. **Allocation Generation**: If `quantity > 0`, an allocation entry is created containing the `zoneId`, `quantity`, and the specific `lotCode` of the item.

4. **Finalization**: After processing all lines, `applyStockReservation` is called to update the state of the zones. If all lines are fully allocated, the order status is set to `"allocated"` and an `order.allocated` event is emitted. If any units remain unallocated, the order status is set to `"held"`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q3 — handler registry

> Which code decides how a given order type is processed?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/components/OrderCard.tsx (0.2), src/dispatch/orderService.ts (0.2), src/config/zoneRules.ts (0.18)

```
The logic that decides how a given order type is processed is defined in **`src/config/zoneRules.ts`**.

This file handles routing preferences, pricing strategies, and zone-suitability scoring based on the order's type (`OrderType`).

Key Mechanisms and Structures

#### 1. Zone Routing Preferences (`typeKinds`)

The `typeKinds` mapping dictates which storage zones are preferred for each `OrderType`:

```typescript

const typeKinds: Record<OrderType, Zone["kind"][]> = {

standard: ["general", "fast-pick"],

express: ["fast-pick", "general"],

bulk: ["bulk", "general"],

hazardous: ["secure"],

};

```

*File: `src/config/zoneRules.ts` (lines 13–18)*

#### 2. Pricing Strategies (`pricingByType` & `pricingStrategyFor`)

The pricing strategy ("current" vs. "legacy") applied to an order is determined by its type:

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

*File: `src/config/zoneRules.ts` (lines 20–25 and 79–81)*

#### 3. Zone Rule Matching (`zoneRules`)

Specific rules inspect the `order.type` to determine applicability and score potential allocation zones:

**`hazard-isolation`**: Applies if the order type is `"hazardous"` (or if the line item itself is hazardous), prioritizing `"secure"` zones.

```typescript

applies: (order, line) => order.type === "hazardous" || line.hazardous,

```

*File: `src/config/zoneRules.ts` (lines 34)*

**`type-routing`**: Evaluates the order type against the `typeKinds` mapping to calculate a preference score based on the zone's index in the preferred list.

```typescript

prefer: (zone, order) => {

const position = typeKinds[order.type].indexOf(zone.kind);

return position < 0 ? -50 : 40 - position * 10;

},

```

*File: `src/config/zoneRules.ts` (lines 54–57)*

#### 4. Execution Flow (`scoreZone` and `rulesFor`)

To process an order and allocate stock, the system evaluates zones using:

**`rulesFor(order, line)`**: Filters and sorts rules by their priority `score`.
**`scoreZone(zone, order, line)`**: Computes a numerical score for how compatible a specific zone is for a given order line by aggregating the matching rules' `prefer` output.

*File: `src/config/zoneRules.ts` (lines 73–86)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q4 — cross-cutting concern

> Everywhere stock is reserved — list every place it happens.

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/stock/stockService.ts (0.15), src/tests/reservation.test.ts (0.12), src/components/ZoneCard.tsx (0.1)
Unverified mentions: src/stock/reservation.ts Not retrieved

```
Based on the provided repository context, the reservation of stock is managed in the following places:

1. `applyStockReservation` (Logic defined in `src/stock/reservation.ts`)

The primary entry point for reserving stock is the `applyStockReservation` function.

**Note on Context:** The implementation file `src/stock/reservation.ts` is not provided in the context, but its behavior and usage are defined and verified in `src/tests/reservation.test.ts` (lines 1-40).
**Behavior:**

* It increments the `reserved` property of a stock item in a given zone based on an allocation request (tested in `src/tests/reservation.test.ts`, lines 18–25).

* It handles shortages when a reservation request exceeds available inventory, ensuring negative availability is not created (tested in `src/tests/reservation.test.ts`, lines 28–37).

---

2. `commitReleasedStock` (Deduction of Reserved Stock in `src/stock/stockService.ts`)

While this function does not create a new reservation, it is where the lifecycle of reserved stock is finalized (committed).

**Location:** `src/stock/stockService.ts` (lines 15–37)
**Behavior:** When allocations are committed, the reserved stock is decremented alongside the physical on-hand stock:

```typescript

item.onHand = Math.max(0, item.onHand - allocation.quantity);

item.reserved = Math.max(0, item.reserved - allocation.quantity);

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q5 — interceptor chain

> What happens to an outgoing API request before it is sent?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/interceptors/types.ts (0.64), src/api/interceptors/hazardous-interceptor.ts (0.39), src/api/interceptors/audit-interceptor.ts (0.35)

```
Based on the provided codebase, outgoing API requests (represented by `ApiRequest`) are processed and transformed by request interceptors before they are dispatched.

The pipeline structure is defined by the `RequestInterceptor` type in `src/api/interceptors/types.ts`, which takes an `ApiRequest` and returns either a modified `ApiRequest` or a `Promise<ApiRequest>`.

Two specific interceptors are implemented to handle request modification:

1. Audit Enrichment

The `auditInterceptor` (`src/api/interceptors/audit-interceptor.ts`) unconditionally enriches every processed request with tracking and telemetry data:

**Headers**: Appends an `x-requested-at` header populated with the current ISO timestamp (`new Date().toISOString()`).
**Metadata**: Appends a `source` identifier set to `"dispatch-console"` and a unique `correlationId` generated using `crypto.randomUUID()`.
2. Hazardous Cargo Routing

The `hazardousInterceptor` (`src/api/interceptors/hazardous-interceptor.ts`) conditionally reroutes and tags requests containing hazardous cargo:

**Condition**: It inspects the request body (cast as a `Partial<Order>`). If `body.type` is not `"hazardous"`, the request is returned unmodified.
**Mutations**: If the order type is `"hazardous"`, the interceptor:

* Replaces `/orders` in the request `path` with `/controlled/orders`.

* Injects an `x-controlled-load: "true"` header.

* Injects `routing: "dangerous-goods"` into the request's `metadata`.

Execution Flow and Maintenance Impact
**Order of Execution**: The exact execution order (e.g., whether `auditInterceptor` runs before or after `hazardousInterceptor`) and the orchestration mechanism (such as an interceptor chain or runner) are not defined in the provided source files.
**State Immutability**: Both interceptors practice shallow-copying of the request object, headers, and metadata (using the spread operator `...request`), preventing unintended mutation of the original request reference.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q6 — misleading name

> Does `validateShipment` change any state, or does it only check?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/validation.test.ts (0.19), src/dispatch/releaseService.ts (0.17), src/dispatch/validation.ts (0.15)

```
Yes, `validateShipment` **does change state** by mutating the `shipment` object passed to it as an argument. It does not only perform checks.

The Mutation

In `src/dispatch/validation.ts`, the function calculates and assigns the `dock` property directly onto the input `shipment` object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

*(Source: `src/dispatch/validation.ts`, lines 35–39)*

This mutation occurs regardless of whether the validation succeeds or fails (i.e., even if `valid` is returned as `false`).

Impact and Usage in the Codebase

1. **Test Expectations**:

The test suite explicitly relies on this side effect. In `src/tests/validation.test.ts`, the assertions verify that the `candidate` shipment object has its `dock` property populated after calling `validateShipment`:

* For standard shipments: `expect(candidate.dock).toMatch(/^D[1-3]$/);` (line 33)

* For hazardous shipments: `expect(candidate.dock).toBe("D4");` (line 49)

2. **Downstream Dependency**:

In `src/dispatch/releaseService.ts`, the `releaseShipment` function calls `validateShipment(shipment, order)` (line 36). Immediately after, it relies on the mutated `shipment.dock` value to populate the `assignedDock` of the `releasedOrder`:

```typescript

const releasedOrder: Order = {

...order,

status: "released",

assignedDock: shipment.dock, // Populated by validateShipment side effect

carrier: shipment.carrier,

trackingNumber: `${shipment.carrier.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-9)}`,

};

```

*(Source: `src/dispatch/releaseService.ts`, lines 38–44)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q7 — legacy path

> Which pricing implementation runs for a bulk order, and why that one?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/pricing.test.ts (0.41), src/pricing/pricing.ts (0.29), src/config/zoneRules.ts (0.27)

```
For a bulk order, the **legacy pricing implementation** runs via the `calculateLegacyPrice(order)` function (`src/pricing/pricing.ts`).

Why This Implementation Runs

The execution path is determined by the following control flow:

1. **Strategy Resolution**:

When `calculateOrderPrice(order)` is invoked, it first determines the pricing strategy by calling `pricingStrategyFor(order)` (`src/pricing/pricing.ts`, line 5).

2. **Configuration Lookup**:

In `src/config/zoneRules.ts` (lines 80–82), `pricingStrategyFor` resolves the strategy using the `pricingByType` mapping table:

```typescript

export function pricingStrategyFor(order: Order): PricingStrategy {

return pricingByType[order.type];

}

```

3. **Type-to-Strategy Mapping**:

The `pricingByType` record explicitly maps the `bulk` order type to the `"legacy"` strategy (`src/config/zoneRules.ts`, lines 21–26):

```typescript

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

4. **Short-Circuit Execution**:

Back in `calculateOrderPrice` (`src/pricing/pricing.ts`, line 6), the engine checks if the resolved strategy is `"legacy"`. Because it is, the function short-circuits and delegates calculation directly to the legacy engine:

```typescript

if (strategy === "legacy") return calculateLegacyPrice(order);

```

This behavior is verified by the unit tests in `src/tests/pricing.test.ts` (lines 7–11), which assert that a bulk order's strategy is `"legacy"` and that its final price matches the output of `calculateLegacyPrice(bulk)`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q8 — event emitter

> What reacts when a dispatch event is emitted?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/events/bus.ts (0.23), src/notifications/listener.ts (0.1), src/pages/DispatchLogPage.tsx (0.08)

```
Based on the provided codebase context, the reaction to events emitted via the `EventBus` (`src/events/bus.ts`) is managed by listeners registered in **`src/notifications/listener.ts`**.

When events are emitted via `eventBus.emit()`, the following reactions occur:

1. `"shipment.released"` Event
**Reacting Component/Service:** The listener registered in `installNotificationListeners()` (`src/notifications/listener.ts`).
**Reaction:** It intercepts the event payload containing `{ order, shipment }` and calls `publishNotification()` to dispatch a success-level notification:

```typescript

publishNotification({

level: "success",

title: `Order ${order.id} released`,

message: `${shipment.packageCount} package(s) are loading at dock ${shipment.dock}.`,

});

```

2. `"stock.low"` Event
**Reacting Component/Service:** The listener registered in `installNotificationListeners()` (`src/notifications/listener.ts`).
**Reaction:** It intercepts the event payload containing `{ sku, zoneId, available }` and calls `publishNotification()` to dispatch a warning-level notification:

```typescript

publishNotification({

level: "warning",

title: `Low stock: ${sku}`,

message: `${available} units remain available in ${zoneId}.`,

});

```

---

Other Event Types & Logs
**`"order.allocated"` and `"notification.created"`:** Although defined in the `WarehouseEvents` interface in `src/events/bus.ts`, there are no active listeners registered for these events in the provided files.
**Dispatch Log Page (`src/pages/DispatchLogPage.tsx`):** The `DispatchLogPage` does not directly subscribe to the `EventBus`. Instead, it reactively renders historical audit trail entries (`DispatchLogEntry`) read from the global Zustand store (`useWarehouseStore` state slice `logs`).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q9 — applied

> Where would a new order type be added, and what else would need changing?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/allocation.test.ts (0.38), src/tests/pricing.test.ts (0.27), src/tests/validation.test.ts (0.25)
Unverified mentions: src/types/domain.ts Not retrieved; src/data/seedData.ts Not retrieved; src/config/zoneRules.ts Not retrieved; src/pricing/pricing.ts Not retrieved; src/dispatch/allocator.ts Not retrieved; src/dispatch/validation.ts Not retrieved

```
Based on the imports and logic demonstrated in the test suites, adding a new order type requires changes across the domain definition, seeding, pricing, allocation, and validation layers.

1. Where to Add the New Order Type
**Type Definition**: You must add the new order type string literal (e.g., `'new_type'`) to the `type` union field of the `Order` type inside **`src/types/domain.ts`** (inferred from the `Shipment` import in `src/tests/validation.test.ts`).
**Seed Data**: Add a representative order of the new type to the `seedOrders` array in **`src/data/seedData.ts`** (imported in `src/tests/allocation.test.ts`, `src/tests/pricing.test.ts`, and `src/tests/validation.test.ts`) to allow integration testing.

---

2. What Else Needs Changing

#### A. Pricing Strategy & Calculation

**`src/config/zoneRules.ts`**: Update `pricingStrategyFor(order)` to map the new order type to its appropriate pricing strategy (e.g., returning `'legacy'` or a new strategy identifier) as verified in `src/tests/pricing.test.ts`.
**`src/pricing/pricing.ts`**: If the new order type incurs specific handling charges or surcharges (similar to the hazardous surcharge test in `src/tests/pricing.test.ts`), update `calculateOrderPrice(order)` to apply these calculations.

#### B. Allocation Rules

**`src/dispatch/allocator.ts`**: Update `allocateOrder(order, zones)` to handle any inventory routing or zone preferences specific to the new type (similar to how `"express"` orders prefer zone `ZB-02` and `"hazardous"` orders are restricted to `ZS-04` as shown in `src/tests/allocation.test.ts`).

#### C. Shipment Validation & Routing

**`src/dispatch/validation.ts`**: Update `validateShipment(shipment, order)` to enforce any carrier, safety, or packaging rules specific to the new order type. If this type requires restricted dock assignments (like `"D4"` for hazardous goods in `src/tests/validation.test.ts`), implement that logic here.

#### D. Test Coverage

You must add corresponding unit and integration tests to verify the new type's behavior:

**`src/tests/allocation.test.ts`**: Test that orders of the new type allocate correctly to the expected zones or hold if inventory is unavailable.
**`src/tests/pricing.test.ts`**: Assert that the pricing calculation yields the correct subtotal and surcharges.
**`src/tests/validation.test.ts`**: Ensure shipments containing the new order type validate correctly and route to the proper dock.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q10 — applied

> If the zone rules changed, what else would be affected?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/config/zoneRules.ts (0.21), src/jobs/revalidation.ts (0.17), src/tests/allocation.test.ts (0.16)

```
If the zone rules in `src/config/zoneRules.ts` are modified, the impact propagates across zone scoring, order allocation decisions, pricing strategies, and system test suites.

Here is a detailed breakdown of what would be affected:

1. Zone Scoring and Selection (`src/config/zoneRules.ts`)

The `scoreZone` function (lines 81–86) dynamically calculates a suitability score for a given zone, order, and line:

**Rule Filtering and Ordering**: `scoreZone` calls `rulesFor(order, line)`, which filters rules using `rule.applies` and sorts them by descending `rule.score` (lines 71–75). Changing a rule's `score` changes the evaluation order.
**Score Penalties and Bonuses**: For each applicable rule, if the zone's kind is not in `rule.zoneKinds`, the score is penalized by `-25` (line 83). Otherwise, it adds the result of `rule.prefer(zone, order, line)` (line 84).
**Rule Definitions**: Modifying any of the four default rules (`hazard-isolation`, `cold-chain`, `type-routing`, `capacity-balance`) directly alters these scores:

* Changing `capacity-balance` (lines 53–64) affects how heavily stock utilization (`zone.stock` vs `zone.capacity`) influences routing.

* Changing `type-routing` (lines 42–52) alters the hierarchy defined in `typeKinds` (lines 13–19) which maps `OrderType` to preferred `Zone["kind"][]`.

---

2. Order Allocation Decisions (`src/dispatch/allocator` & `src/tests/allocation.test.ts`)

The allocation system uses `scoreZone` to determine which zone should fulfill an order line. Changing the rules will alter the chosen zones:

**Express Goods Allocation**: The unit test `"allocates express goods from preferred zones"` (in `src/tests/allocation.test.ts`, lines 6–17) asserts that express goods are allocated to zone `"ZB-02"`. This relies on `type-routing` prioritizing `"fast-pick"` and `"general"` zones for express orders (line 15). If these priorities or scores change, this assertion may fail.
**Hazardous Stock Isolation**: The unit test `"keeps hazardous stock in the secure zone"` (in `src/tests/allocation.test.ts`, lines 19–30) asserts that hazardous items (SKU `"CL-900"`) are allocated to zone `"ZS-04"`. This behavior is enforced by the `hazard-isolation` rule (lines 24–31), which targets the `"secure"` zone and penalizes non-secure zones with `-100`. Modifying this rule could cause hazardous stock to be allocated to unsafe zones, violating safety constraints and breaking this test.

---

3. Order Pricing Strategies (`src/config/zoneRules.ts`)
**Strategy Resolutions**: The function `pricingStrategyFor(order)` (lines 77–79) returns a `PricingStrategy` (`"current"` or `"legacy"`) based on `pricingByType` (lines 21–26).
**Downstream Billing**: If you modify `pricingByType` or the `PricingStrategy` type itself (line 3), any downstream invoicing, billing, or financial reporting systems that rely on `pricingStrategyFor` will receive different pricing models (e.g., switching standard orders from `"current"` to `"legacy"`).

---

4. Stock Reservation and Revalidation (`src/jobs/revalidation.ts`)

While `revalidateReservations` (lines 10–51) does not directly invoke `scoreZone`, it is highly sensitive to its outcomes:

**Revalidation Failures**: `revalidateReservations` processes existing allocations and checks them against actual zone stock levels using `applyStockReservation` (lines 19–23). If a change in zone rules causes new orders to be allocated to different zones, the distribution of `reserved` stock across `workingZones` will shift. This can trigger shortages, leading to orders being demoted to `"held"` status with added warning notes (lines 35–43).
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q11 — interceptor chain

> Are hazardous orders treated differently anywhere? Where?

### Ground truth — this is the standard

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

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/interceptors/hazardous-interceptor.ts (0.17), src/dispatch/handlers/hazardousHandler.ts (0.15), src/dispatch/orderService.ts (0.11)

```
Yes, orders of type `"hazardous"` are treated differently in two distinct parts of the codebase: **API Request Routing** and **Dispatch Processing**.

---

1. API Request Routing & Interception

In the API client layer, requests dealing with hazardous orders are intercepted and mutated before dispatch.

**File:** `src/api/interceptors/hazardous-interceptor.ts`
**Behavior:** The `hazardousInterceptor` inspects the request body. If the body has a `type` property equal to `"hazardous"`, it alters the request payload:

* **Path Mutated:** Replaces `/orders` with `/controlled/orders`.

* **Headers Added:** Injects the header `"x-controlled-load": "true"`.

* **Metadata Added:** Appends `{ routing: "dangerous-goods" }` to the request metadata.

```typescript

// src/api/interceptors/hazardous-interceptor.ts (lines 4-13)

export const hazardousInterceptor: RequestInterceptor = (request) => {

const body = request.body as Partial<Order> | undefined;

if (body?.type !== "hazardous") return request;

return {

...request,

path: request.path.replace("/orders", "/controlled/orders"),

headers: { ...request.headers, "x-controlled-load": "true" },

metadata: { ...request.metadata, routing: "dangerous-goods" },

};

};

```

---

2. Dispatch Processing & Validation

A dedicated dispatch handler is registered to handle lifecycle steps specifically for `"hazardous"` orders.

**File:** `src/dispatch/handlers/hazardousHandler.ts`
**Behavior:** It registers a specialized handler with three operational hooks:

* **`prepare(order)`**:

* Appends `"Dangerous goods paperwork required"` to `order.notes`.

* Sets the order's `priority` to `"urgent"`.

* **`inspect(order)`**: Performs safety and compliance validations, flagging issues if:

* The order contains no line items marked as hazardous (`!line.hazardous`).

* The destination country is not `"US"` (raising `"International dangerous goods review required"`).

* **`shipmentDefaults(order)`**:

* Forces the carrier to `"SecureChem Logistics"`.

* Calculates the required package count by dividing total line item quantities by `4` (minimum of 1 package, rounded up).

```typescript

// src/dispatch/handlers/hazardousHandler.ts (lines 3-27)

registerHandler({

type: "hazardous",

prepare(order) {

return {

...order,

notes: [...order.notes, "Dangerous goods paperwork required"],

priority: "urgent",

};

},

inspect(order) {

const issues: string[] = [];

if (!order.lines.some((line) => line.hazardous))

issues.push("Hazardous order has no regulated line");

if (order.destination.country !== "US")

issues.push("International dangerous goods review required");

return issues;

},

shipmentDefaults(order) {

const units = order.lines.reduce((sum, line) => sum + line.quantity, 0);

return {

carrier: "SecureChem Logistics",

packageCount: Math.max(1, Math.ceil(units / 4)),

};

},

});

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q12 — misleading name

> Where is a dock assigned to a shipment?

### Ground truth — this is the standard

`validateShipment` assigns the dock directly on the mutable shipment object. It chooses D4 for
hazardous orders and otherwise D1–D3 from a checksum of the order ID. `releaseShipment` calls
that function and then copies the resulting dock to `releasedOrder.assignedDock`.

**Files:** src/dispatch/validation.ts:9, src/dispatch/validation.ts:35-37, src/dispatch/validation.ts:38, src/dispatch/releaseService.ts:35, src/dispatch/releaseService.ts:41

<details>
<summary>Notes from the ground truth (context, not the standard)</summary>

The assignment is hidden inside validation rather than a named allocation step.

</details>

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/dispatch/releaseService.ts (0.32), src/tests/validation.test.ts (0.28), src/dispatch/validation.ts (0.27)

```
A dock is assigned to a shipment inside the **`validateShipment`** function, located in **`src/dispatch/validation.ts`**.

Detailed Code Analysis

The assignment is executed as a side-effect during validation:

```typescript

// src/dispatch/validation.ts

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Allocation Logic:

1. **Hazardous Orders**: If `order.type === "hazardous"`, the shipment is statically assigned to dock **`D4`**.

2. **Standard Orders**: Otherwise, it calculates a hash of the `order.id` by summing the character codes (ASCII values) of the string and applying a modulo operation (`% 3`) over the first three elements of the `docks` array (`["D1", "D2", "D3", "D4"]`). This resolves to dock **`D1`**, **`D2`**, or **`D3`**.

Control Flow Integration:
**Execution**: This mutation occurs when `validateShipment(shipment, order)` is called on line 30 of **`src/dispatch/releaseService.ts`**.
**Downstream Usage**: Once assigned, the dock is copied to the updated order status in `releaseShipment` (line 35: `assignedDock: shipment.dock`) and used in the release log message (line 47).
**Testing**: This behavior is verified in **`src/tests/validation.test.ts`**, which asserts that standard shipments receive a dock matching `/^D[1-3]$/` and hazardous shipments receive `"D4"`.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

