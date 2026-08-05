# Marking sheet — warehouse-dispatch

<!-- accuracy-gate-binding: ed4aeda54b4f407294d6d3898cfdb2450f5954fd4d64e23c6aeb92408d9b4992 -->

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
Based on the provided repository context, the absolute root entry point of the application (such as an `index.html`, `main.tsx`, or `index.ts` file) is **not included in the provided context**.

However, within the scope of the provided files, the execution of the application's state and background jobs is orchestrated and started by the **`initialize()`** method of the `useWarehouseStore` state creator in **`src/store/useWarehouseStore.ts`**.

Execution Flow in Provided Context

1. **Store Initialization**:

When the application mounts and calls `initialize()` on the Zustand store (`src/store/useWarehouseStore.ts`), it prevents duplicate execution by checking the `initialized` flag:

```typescript

initialize() {

if (get().initialized) return;

set({ initialized: true });

```

2. **Notification Polling Loop**:

It registers a `window.setInterval` callback running every 300ms to poll and drain incoming notifications into the store's state:

```typescript

const pullNotifications = window.setInterval(() => {

const additions = drainNotifications();

if (additions.length) {

set((state) => ({

notifications: [...additions, ...state.notifications].slice(0, 8),

}));

}

}, 300);

```

3. **Revalidation Job Execution**:

Directly after, it invokes and assigns `stopJob` to the revalidation daemon by calling `startRevalidationJob` (imported from `src/jobs/revalidation.ts`):

```typescript

stopJob = startRevalidationJob(

() => // ...

```

Inside `src/jobs/revalidation.ts`, `startRevalidationJob` sets up a recurring `window.setInterval` (defaulting to 60,000ms) that executes `revalidateReservations` to reconcile stock allocations and orders:

```typescript

export function startRevalidationJob(

read: () => { orders: Order[]; zones: Zone[] },

write: (result: RevalidationResult) => void,

intervalMs = 60_000,

): () => void {

const timer = window.setInterval(

() => write(revalidateReservations(read().orders, read().zones)),

intervalMs,

);

return () => window.clearInterval(timer);

}

```
```

**Verdict:** incorrect

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
In the codebase, an order is assigned to a warehouse zone through a multi-step allocation process managed in `src/dispatch/allocator.ts` and governed by scoring rules defined in `src/config/zoneRules.ts`.

---

1. High-Level Allocation Flow

The assignment happens inside the `allocateOrder` function in `src/dispatch/allocator.ts` (lines 14–74):

1. **Order Preparation**: The order is cloned and prepared by a handler specific to the order's type (`src/dispatch/allocator.ts`, lines 23–24).

2. **Candidate Zone Filtering & Scoring**: For each line item (`line`) in the order, the system filters and ranks candidate zones:

* **Filter**: The zone must be active (`zone.active`) and must contain stock matching the line's SKU (`zone.stock.some(item => item.sku === line.sku)`).

* **Score**: Each candidate zone is evaluated using `scoreZone(zone, prepared, line)`.

* **Sort**: Candidate zones are sorted in descending order of their score (`src/dispatch/allocator.ts`, lines 28–34).

3. **Greedy Allocation**: The allocator iterates over the sorted candidate zones to fulfill the requested line quantity (`src/dispatch/allocator.ts`, lines 35–52):

* It calculates the available stock in the zone: `Math.max(0, item.onHand - item.reserved)`.

* It allocates up to the remaining quantity from the zone, creating a proposed allocation.

* This continues until the line's quantity is satisfied or candidate zones are exhausted.

4. **Reservation Finalization**: The draft allocations are committed using `applyStockReservation` (`src/dispatch/allocator.ts`, line 56).

---

2. Zone Scoring Mechanics

The priority of zone selection is determined by `scoreZone` in `src/config/zoneRules.ts` (lines 80–85).

For a given order and line item, the system identifies applicable rules via `rulesFor(order, line)` (which filters active rules and sorts them descending by their intrinsic rule `score`). For each applicable rule:

If the zone's kind is not supported by the rule (`!rule.zoneKinds.includes(zone.kind)`), the zone receives a **-25 penalty** for that rule.
Otherwise, the rule's `prefer` function is executed to calculate a preference score, which is added to the total.

---

3. Active Scoring Rules

Four active rules in `src/config/zoneRules.ts` (lines 30–71) drive the `prefer` scoring:

| Rule ID | Rule Score | Application Condition | Allowed Zone Kinds | Preference Behavior (`prefer`) |

| :--- | :--- | :--- | :--- | :--- |

| **`hazard-isolation`** | 100 | Order is hazardous OR line is hazardous. | `["secure"]` | Returns `80` if zone is "secure", otherwise `-100`. |

| **`cold-chain`** | 90 | Line temperature is not `"ambient"`. | `["cold"]` | Returns `70` if zone temperature matches the line temperature, otherwise `-100`. |

| **`type-routing`** | 50 | Applies to all lines. | `["general", "fast-pick", "bulk", "secure"]` | Maps order type to preferred zone kinds (e.g., `express` prefers `["fast-pick", "general"]`). Returns `-50` if zone kind is not in the preference array, or `40 - position * 10` based on its index. |

| **`capacity-balance`** | 10 | Applies to all lines. | `["general", "fast-pick", "bulk", "secure", "cold"]` | Calculates the percentage of free capacity in the zone and awards up to `20` points: `Math.round((1 - used / zone.capacity) * 20)`. |
```

**Verdict:** correct

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
Based on the provided codebase, the routing, zone prioritization, and pricing strategy for different order types are defined and decided in **`src/config/zoneRules.ts`**.

Specifically, the processing logic is split into three main mechanisms:

1. Zone Routing Preferences (`typeKinds`)

The mapping of order types to preferred storage zone kinds is defined by the `typeKinds` registry:

```typescript

// src/config/zoneRules.ts (lines 13-18)

const typeKinds: Record<OrderType, Zone["kind"][]> = {

standard: ["general", "fast-pick"],

express: ["fast-pick", "general"],

bulk: ["bulk", "general"],

hazardous: ["secure"],

};

```

This is evaluated dynamically by the **`type-routing`** rule within the `zoneRules` array. The rule assigns scores based on the index position of a zone kind in the order type's preference list:

```typescript

// src/config/zoneRules.ts (lines 51-59)

{

id: "type-routing",

score: 50,

zoneKinds: ["general", "fast-pick", "bulk", "secure"],

pricing: "current",

applies: () => true,

prefer: (zone, order) => {

const position = typeKinds[order.type].indexOf(zone.kind);

return position < 0 ? -50 : 40 - position * 10;

},

}

```

2. Hazardous Order Isolation

Special processing rules target hazardous orders. The **`hazard-isolation`** rule filters and prioritizes zones specifically when an order is flagged as hazardous:

```typescript

// src/config/zoneRules.ts (lines 27-35)

{

id: "hazard-isolation",

score: 100,

zoneKinds: ["secure"],

pricing: "current",

applies: (order, line) => order.type === "hazardous" || line.hazardous,

prefer: (zone) => (zone.kind === "secure" ? 80 : -100),

}

```

3. Pricing Strategy Selection (`pricingByType`)

The pricing engine uses `pricingByType` to resolve which pricing strategy (`current` vs. `legacy`) applies to a given order type:

```typescript

// src/config/zoneRules.ts (lines 20-25)

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy",

hazardous: "current",

};

```

This is resolved using the helper function:

```typescript

// src/config/zoneRules.ts (lines 78-80)

export function pricingStrategyFor(order: Order): PricingStrategy {

return pricingByType[order.type];

}

```
```

**Verdict:** incorrect

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

```
Based on the provided repository context, stock reservation is executed and tested in the following locations:

1. Stock Reservation Implementation
**File:** `src/stock/reservation` (implied by import, though the implementation file itself is not in the provided context).
**Function:** `applyStockReservation(order, allocations, zones)`

* This function performs the actual stock reservation logic. As verified by unit tests, it increments the `reserved` stock count for a given SKU within a zone and populates lot codes.

2. Unit Tests
**File:** `src/tests/reservation.test.ts` (Lines 18–37)

* Stock reservation is executed inside the test suite to verify behavior:

* **Line 19:** Calls `applyStockReservation(order, [request], zones)` to assert that it correctly increments reserved stock (e.g., `expect(after).toBe(before + 10)`).

* **Line 29:** Calls `applyStockReservation` with a high quantity to test shortage reporting and ensure reservation does not result in negative availability.

---

Related Files (Read/Release Only)

The following files interact with reserved stock but **do not** reserve new stock:

**`src/stock/stockService.ts`**:

* `availableStock` (Line 10) reads `item.reserved` to calculate availability.

* `commitReleasedStock` (Lines 16–36) decrements the `reserved` count (Line 26) when stock is committed and released; it does not reserve stock.

**`src/components/ZoneCard.tsx`**:

* Reads and aggregates `item.reserved` (Lines 6, 42) to display reservation metrics in the UI.
```

**Verdict:** incorrect

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
Based on the provided codebase, an outgoing API request (`ApiRequest`) can be processed and mutated by one or more `RequestInterceptor` functions before it is sent. These interceptors take an `ApiRequest` and return a modified `ApiRequest` (or a Promise resolving to one) (`src/api/interceptors/types.ts`).

There are two specific request interceptors defined in the system that modify outgoing requests:

1. Audit Interceptor

The `auditInterceptor` applies tracing and timing metadata to all passing requests (`src/api/interceptors/audit-interceptor.ts`):

**Headers**: Adds an `x-requested-at` header set to the current ISO timestamp (`new Date().toISOString()`).
**Metadata**: Appends or overwrites the following fields:

* `source`: `"dispatch-console"`

* `correlationId`: A newly generated UUID (`crypto.randomUUID()`).

2. Hazardous Interceptor

The `hazardousInterceptor` conditionally intercepts and reroutes requests containing hazardous materials (`src/api/interceptors/hazardous-interceptor.ts`):

**Condition**: It checks if the request body contains an `Order` where `type === "hazardous"`. If this condition is not met, the request passes through unmodified.
**Path Modification**: Replaces occurrences of `/orders` in the request path with `/controlled/orders`.
**Headers**: Adds the header `"x-controlled-load": "true"`.
**Metadata**: Adds or overwrites `routing` with `"dangerous-goods"`.
```

**Verdict:** incorrect

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
Yes, `validateShipment` **does change state** by mutating the `shipment` object passed to it as an argument. It is not a pure check function.

Mutated State

Specifically, the function assigns or overwrites the `dock` property on the input `shipment` object:

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

*(Source: `src/dispatch/validation.ts`, lines 35-38)*

Mutation Logic
**Hazardous Orders**: If `order.type` is `"hazardous"`, the `shipment.dock` is set to `"D4"`.
**Standard Orders**: For non-hazardous orders, it computes a numeric hash from the `order.id` characters and assigns a dock from the first three options (`"D1"`, `"D2"`, or `"D3"`) using a modulo operation (`numeric % 3`).
Downstream Impact

1. **Verification in Tests**:

The test suite explicitly relies on and asserts this side effect, checking that the `candidate.dock` property is populated after `validateShipment` is invoked (`src/tests/validation.test.ts`, lines 31 and 46).

2. **Order Release Lifecycle**:

In `releaseShipment`, the mutated `shipment.dock` value is subsequently read and assigned to the returned `Order`'s `assignedDock` property (`src/dispatch/releaseService.ts`, lines 39-43).
```

**Verdict:** correct

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
For a bulk order, the **legacy pricing** implementation (`calculateLegacyPrice`) is executed.

Control Flow and Execution Reason

1. **Strategy Resolution**:

When `calculateOrderPrice(order)` is invoked in `src/pricing/pricing.ts`, it first determines the pricing strategy by calling `pricingStrategyFor(order)` (defined in `src/config/zoneRules.ts`).

```typescript

// src/pricing/pricing.ts

export function calculateOrderPrice(order: Order): number {

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

// ...

}

```

2. **Configuration Mapping**:

In `src/config/zoneRules.ts`, the `pricingStrategyFor` function resolves the strategy by indexing into the `pricingByType` record using the order's `type`:

```typescript

// src/config/zoneRules.ts

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy", // <--- Maps "bulk" type to "legacy" strategy

hazardous: "current",

};

export function pricingStrategyFor(order: Order): PricingStrategy {

return pricingByType[order.type];

}

```

3. **Branch Execution**:

Because `pricingByType["bulk"]` evaluates to `"legacy"`, `calculateOrderPrice` evaluates the conditional check `if (strategy === "legacy")` as `true` and immediately returns the result of `calculateLegacyPrice(order)`, bypassing the "current" pricing calculation logic (handling fees, priority fees, weight, and hazardous surcharges).

This behavior is verified in the test suite within `src/tests/pricing.test.ts`:

```typescript

it("selects legacy pricing for bulk through configuration", () => {

const bulk = seedOrders.find((order) => order.type === "bulk")!;

expect(pricingStrategyFor(bulk)).toBe("legacy");

expect(calculateOrderPrice(bulk)).toBe(calculateLegacyPrice(bulk));

});

```
```

**Verdict:** correct

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
Based on the provided source code, the system reacts to events emitted via the event bus through registered listeners in the notifications domain:

1. Notification Listeners (`src/notifications/listener.ts`)

The `installNotificationListeners` function registers event handlers on the global `eventBus` instance. When specific events are emitted, it triggers the following reactions:

**`shipment.released` Event:**

* **Reaction:** Invokes `publishNotification` to dispatch a success notification.

* **Payload Consumed:** `order` and `shipment`.

* **Output:** Creates a notification titled `"Order <orderId> released"` detailing how many packages are loading at which dock (`shipment.dock`).

**`stock.low` Event:**

* **Reaction:** Invokes `publishNotification` to dispatch a warning notification.

* **Payload Consumed:** `sku`, `zoneId`, and `available`.

* **Output:** Creates a notification titled `"Low stock: <sku>"` indicating the remaining available units in the specified zone.

---

2. Event Bus Infrastructure (`src/events/bus.ts`)

The reactions are mediated by the `EventBus` class.

When `eventBus.emit(event, payload)` is invoked, it retrieves the set of listeners registered for that key from its internal `listeners` Map and calls each callback synchronously with the payload (lines 23–27).

---

3. Dispatch Log UI (`src/pages/DispatchLogPage.tsx`)

While the `DispatchLogPage` displays log entries (e.g., actions like `"received"`, `"allocated"`, `"revalidated"`, `"held"`, `"released"`, `"note"`), it does not directly subscribe to the `eventBus` in the provided code. Instead, it reactively renders updates from the application state store (`useWarehouseStore`) by selecting `state.logs` (line 8).
```

**Verdict:** incorrect

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
Unverified mentions: src/types/domain.ts Not retrieved; src/data/seedData.ts Not retrieved; src/config/zoneRules.ts Not retrieved; src/pricing/pricing.ts Not retrieved; src/pricing/legacyPricing.ts Not retrieved; src/dispatch/allocator.ts Not retrieved; src/dispatch/validation.ts Not retrieved

```
Based on the provided test files and their imports, adding a new order type (such as `"express"`, `"hazardous"`, `"bulk"`, or `"standard"`) requires changes across type definitions, configuration, core business logic, and test suites.

Here is where the changes must be made:

1. Type Definitions & Seed Data
**Domain Types (`src/types/domain.ts`):**

Though the file is not fully exposed in the context, `src/tests/validation.test.ts` imports types from `../types/domain`. You would need to update the `Order` type or an `OrderType` union type (which currently includes `"express"`, `"hazardous"`, `"bulk"`, and `"standard"`) to include your new string literal type.

**Seed Data (`src/data/seedData.ts`):**

This file is imported by all test suites (`src/tests/allocation.test.ts` line 3, `src/tests/pricing.test.ts` line 5, `src/tests/validation.test.ts` line 3). You must add a new mock order of your new type to `seedOrders` to facilitate testing.

2. Pricing Configuration and Calculation
**Rule Selection (`src/config/zoneRules.ts`):**

As seen in `src/tests/pricing.test.ts` (lines 8–11), `pricingStrategyFor(order)` determines the pricing strategy (e.g., returning `"legacy"` for `"bulk"` orders). You must update this function to map your new order type to its corresponding pricing strategy.

**Pricing Engines (`src/pricing/pricing.ts` or `src/pricing/legacyPricing.ts`):**

If your new order type requires specific handling charges or surcharges (similar to how `"hazardous"` orders incur a dangerous goods surcharge, tested in `src/tests/pricing.test.ts` lines 25–34), you must update the calculation logic in `calculateOrderPrice`.

3. Allocation Logic
**Allocation Rules (`src/dispatch/allocator.ts`):**

`allocateOrder(order, zones)` (tested in `src/tests/allocation.test.ts` line 14) resolves how inventory is reserved. If the new order type has specific zone preferences (like `"express"` preferring `"ZB-02"` on lines 15–16, or `"hazardous"` requiring secure zone `"ZS-04"` on lines 25–29), you must implement these routing rules within the allocator.

4. Shipment Validation & Routing
**Validation Rules (`src/dispatch/validation.ts`):**

`validateShipment(shipment, order)` (tested in `src/tests/validation.test.ts` line 34) enforces safety and routing constraints. If your new order type requires specific carriers or dock assignments (similar to how `"hazardous"` orders require a "dangerous goods carrier" and dock `"D4"`, tested on lines 48–51), you must update the validation logic here.

5. Test Coverage

You should add corresponding unit tests to verify the behavior of the new order type:

**`src/tests/allocation.test.ts`**: Verify correct zone allocation and fallback behavior (e.g., holding the order if inventory is missing).
**`src/tests/pricing.test.ts`**: Verify that the correct pricing strategy and surcharges are applied.
**`src/tests/validation.test.ts`**: Verify that shipments of this order type are validated correctly and assigned to the correct docks.
```

**Verdict:** incorrect

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
Based on the provided codebase context, changing the zone rules in `src/config/zoneRules.ts` would directly and indirectly affect several subsystems, particularly **order allocation routing**, **pricing strategy selection**, and **test suites**.

Here is a detailed breakdown of what would be affected:

1. Order Allocation and Zone Selection (`src/dispatch/allocator`)

The allocation engine (tested in `src/tests/allocation.test.ts`) depends on the scoring logic exported by `src/config/zoneRules.ts`. Specifically, `scoreZone` (lines 83–86) determines how zones are evaluated for a given order line:

**Hazardous Materials Routing:** The `hazard-isolation` rule (lines 34–41) scores secure zones at `+80` and others at `-100` for hazardous orders or lines. Changing this rule would alter where hazardous items (like `CL-900`) are routed.
**Cold Chain Compliance:** The `cold-chain` rule (lines 42–49) ensures that items requiring non-ambient temperatures are matched to zones with corresponding temperatures. Modifying this would risk routing temperature-sensitive stock to incompatible zones.
**Order Type Optimization:** The `type-routing` rule (lines 50–59) maps order types (`express`, `standard`, `bulk`, `hazardous`) to preferred zone kinds via the `typeKinds` dictionary. Adjusting this would change the priority order of zones (e.g., routing `express` orders away from `fast-pick` zones).
**Capacity Balancing:** The `capacity-balance` rule (lines 60–70) dynamically calculates a score based on a zone's remaining capacity (`1 - used / zone.capacity`). Changing this formula would affect how evenly inventory is distributed across warehouse zones.
2. Test Suite Failures (`src/tests/allocation.test.ts`)

The integration tests in `src/tests/allocation.test.ts` are highly sensitive to the exact scoring values defined in `zoneRules.ts`:

**`"allocates express goods from preferred zones"`** (lines 5–19): Asserts that an express order line is allocated to zone `"ZB-02"`. This relies on the `type-routing` scoring preferences.
**`"keeps hazardous stock in the secure zone"`** (lines 21–32): Asserts that hazardous stock (`CL-900`) is allocated to the secure zone `"ZS-04"`. This directly depends on the `hazard-isolation` rule.
Any changes to the rules' `score` properties, `prefer` functions, or the `typeKinds` mapping will likely cause these assertions to fail.
3. Downstream Pricing Strategies

The function `pricingStrategyFor` (lines 79–81) maps order types to either `"current"` or `"legacy"` pricing strategies based on the `pricingByType` dictionary (lines 23–28).

Changing this mapping or the `PricingStrategy` type (line 3) will affect any invoicing or billing systems that process orders downstream based on their allocated pricing strategy.
4. Stock Revalidation and Reservations (`src/jobs/revalidation.ts`)

The background revalidation job in `src/jobs/revalidation.ts` runs periodically (via `startRevalidationJob`) to re-evaluate existing allocations against actual warehouse stock using `applyStockReservation` (lines 18–22).

If a change in zone rules alters how new allocations are scored and placed, the active reservations held in `workingZones` will shift. This could cause the revalidation job to flag more (or fewer) shortages, resulting in more orders being transitioned to a `"held"` status with shortage notes (lines 33–42).
```

**Verdict:** incorrect

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
Yes, hazardous orders are treated differently in two primary areas of the codebase: API request interception and dispatch handling.

1. API Request Routing and Metadata

In **`src/api/interceptors/hazardous-interceptor.ts`**, a request interceptor (`hazardousInterceptor`) intercepts outgoing API payloads. If the request body contains an order with `type === "hazardous"`, it alters the request as follows:

**Path Translation**: Reroutes the request from `/orders` to `/controlled/orders` (lines 8).
**Headers**: Appends an `"x-controlled-load": "true"` header (line 9).
**Metadata**: Sets the routing metadata to `"dangerous-goods"` (line 10).

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

2. Dispatch Order Handling Lifecycle

In **`src/dispatch/handlers/hazardousHandler.ts`**, a specific handler is registered for the `"hazardous"` order type. This handler modifies order preparation, safety inspection, and shipment defaults:

**Preparation (`prepare`)**:

* Appends `"Dangerous goods paperwork required"` to the order's notes.

* Escalates the order's priority to `"urgent"` (lines 5–11).

**Inspection (`inspect`)**:

* Asserts that at least one line item in the order has the `hazardous` flag set. If none do, it generates the issue `"Hazardous order has no regulated line"` (lines 14–15).

* Evaluates the destination country. If it is not `"US"`, it flags the order with `"International dangerous goods review required"` (lines 16–17).

**Shipment Defaults (`shipmentDefaults`)**:

* Restricts the carrier to `"SecureChem Logistics"` (line 23).

* Restructures packaging volume calculations to require at least one package, with a maximum capacity of 4 units per package (`Math.ceil(units / 4)`) (lines 21–25).
```

**Verdict:** incorrect

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
A dock is assigned to a shipment inside the **`validateShipment`** function located in **`src/dispatch/validation.ts`** (specifically lines 35–39).

How it is Assigned:

When `validateShipment(shipment, order)` is called, it mutates the passed `shipment` object by setting its `dock` property based on the order type and a hash of the order ID:

```typescript

// src/dispatch/validation.ts (Lines 35-39)

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Control Flow & Side Effects:

1. **Triggering Context**: This assignment occurs during the release process in **`src/dispatch/releaseService.ts`** when `validateShipment(shipment, order)` is executed (line 33).

2. **Post-Assignment Usage**: Immediately after validation, the newly assigned dock is referenced in the release log construction (lines 38–45 of `src/dispatch/releaseService.ts`):

```typescript

detail: `${shipment.packageCount} package(s) released via ${shipment.carrier} at ${shipment.dock}`,

```

3. **Routing Logic**:

* If the order type is `"hazardous"`, it is hardcoded to dock **`"D4"`**.

* Otherwise, it is deterministically routed to one of the first three docks (`"D1"`, `"D2"`, or `"D3"`) by taking the modulo of the sum of the character codes of the `order.id` (`docks[numeric % 3]`).
```

**Verdict:** correct

**Why (one line, for the log):**

---

