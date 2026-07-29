# Marking sheet — warehouse-dispatch

12 questions. For each one, decide whether the tool's answer says the same thing as the ground
truth, and write `correct` or `incorrect` on the verdict line.

The rubric is binary, as the proposal commits to. There is no partial credit: an answer that
names the right file but misses two of the four places something happens is **incorrect**. That
is deliberate — the questions were written to have complete answers, and a scheme that awarded
half marks would make the resulting figure impossible to interpret.

Mark against the ground truth, not against your impression of whether the answer sounds good. A
fluent answer that omits the decisive fact is the case this whole study exists to measure.

When every verdict is filled in:

    python3 analysis/marking_sheet.py collect study/accuracy-gate.warehouse-dispatch.json marking.warehouse-dispatch.md

---

## Q1 — orientation

> Where does execution start in this project?

### Ground truth

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. The router is not created by `App`: it is built once at module scope
when `App.tsx` is first imported. `App` itself installs the notification listeners, calls the
store's `initialize`, and renders the `RouterProvider` around the router that already exists.

**Files:** src/main.tsx:1-10, src/App.tsx:11-22, src/App.tsx:24-31

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/jobs/revalidation.ts (0.04), src/store/useWarehouseStore.ts (0.02), src/data/seedData.ts (0.02)

```
Based on the provided repository context, the complete entry point of the entire application (such as an `index.tsx` or `main.ts` file) is not included. However, the execution of the application's core state management and background processes begins with the **`initialize`** action of the Zustand store defined in `src/store/useWarehouseStore.ts`.

Here is the precise control flow of how execution starts and initializes within the provided codebase:

1. Store Creation and Seeding

When the store is first loaded, it eagerly initializes its state using seed data imported from `src/data/seedData.ts` (`src/store/useWarehouseStore.ts`, lines 53-55):

```typescript

orders: structuredClone(seedOrders),

zones: structuredClone(seedZones),

logs: structuredClone(seedLogs),

```

2. Execution of the `initialize()` Action

The main runtime execution starts when a consuming component calls `initialize()` on the store (`src/store/useWarehouseStore.ts`, lines 78-99):

1. **Idempotency Guard**: It checks if the store is already initialized to prevent duplicate intervals from running:

```typescript

if (get().initialized) return;

set({ initialized: true });

```

2. **Notification Polling**: It registers a global interval running every 300ms to poll and drain notifications into the store's state:

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

3. **Revalidation Job Execution**: It starts the background reservation revalidation process by calling `startRevalidationJob` (imported from `src/jobs/revalidation.ts`):

```typescript

stopJob = startRevalidationJob(

() => ({ orders: get().orders, zones: get().zones }),

(result) => set({ orders: result.orders, zones: result.zones }), // and handling updates

);

```

3. Background Job Control Loop

Once `startRevalidationJob` is invoked, it schedules a recurring timer (defaulting to 60,000ms) to run `revalidateReservations` on the active orders and zones (`src/jobs/revalidation.ts`, lines 47-62):

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

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q2 — config-driven behaviour

> How is an order assigned to a warehouse zone?

### Ground truth

`allocateOrder` processes each order line independently. It scores every zone with `scoreZone`,
removes inactive zones and zones without the SKU, sorts by descending score, and proposes
allocations from available stock until the requested quantity is covered. `scoreZone` applies
configuration rules in priority order: hazardous isolation, cold-chain compatibility,
order-type routing, and capacity balance. `applyStockReservation` then accepts only quantities
still available and updates reserved stock in a cloned zone set.

**Files:** src/dispatch/allocator.ts:17-73, src/config/zoneRules.ts:14-19, src/config/zoneRules.ts:28-85, src/stock/reservation.ts:9-45

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/config/zoneRules.ts (0.27), src/pages/ZoneOverviewPage.tsx (0.2), src/pages/OrderDetailPage.tsx (0.18)

```
Based on the codebase, order lines are evaluated and ranked for warehouse zone assignment using a rule-based scoring system defined in `src/config/zoneRules.ts`.

The assignment is determined by scoring each candidate `Zone` against a specific `Order` and `OrderLine` using the `scoreZone` function.

1. The Scoring Control Flow

In `src/config/zoneRules.ts`, the assignment utility computes a compatibility score for a zone:

```typescript

export function scoreZone(zone: Zone, order: Order, line: OrderLine): number {

return rulesFor(order, line).reduce((score, rule) => {

if (!rule.zoneKinds.includes(zone.kind)) return score - 25;

return score + rule.prefer(zone, order, line);

}, 0);

}

```

1. **Rule Resolution (`rulesFor`)**: For a given `Order` and `OrderLine`, the system filters the global `zoneRules` array using each rule's `applies(order, line)` predicate. The matching rules are then sorted in descending order of their priority (`score`).

2. **Zone Suitability Check**: For each applicable rule, if the candidate `zone.kind` is not within the rule's supported `zoneKinds`, a penalty of `-25` is applied.

3. **Preference Scoring (`prefer`)**: If the zone kind matches, the rule's `prefer` function is executed to calculate a positive or negative adjustment to the score.

---

2. The Evaluation Rules

Four distinct rules are configured in the `zoneRules` array (`src/config/zoneRules.ts`):

#### A. Hazard Isolation (`hazard-isolation`)

**Priority (Score)**: 100
**Applicability**: Applies if `order.type === "hazardous"` or `line.hazardous` is true.
**Target Zone Kinds**: `["secure"]`
**Preference**: Returns `80` if the zone is `"secure"`, otherwise returns `-100`.

#### B. Cold Chain (`cold-chain`)

**Priority (Score)**: 90
**Applicability**: Applies if the item's temperature requirement is not `"ambient"` (`line.temperature !== "ambient"`).
**Target Zone Kinds**: `["cold"]`
**Preference**: Returns `70` if the zone's temperature matches the line's temperature requirement;
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q3 — handler registry

> Which code decides how a given order type is processed?

### Ground truth

The dispatch-handler registry makes the decision. On first use, `getHandler` dynamically imports
every handler module; each module registers one handler keyed by its `type`. Allocation and
release look up the handler using `order.type`, then call its preparation/inspection or
shipment-default methods.

**Files:** src/dispatch/handlers/registry.ts:3-32, src/dispatch/handlers/standardHandler.ts:1-22, src/dispatch/handlers/expressHandler.ts:1-31, src/dispatch/handlers/bulkHandler.ts:1-37, src/dispatch/handlers/hazardousHandler.ts:1-27, src/dispatch/allocator.ts:21, src/dispatch/releaseService.ts:17

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/components/OrderCard.tsx (0.21), src/dispatch/orderService.ts (0.2), src/config/zoneRules.ts (0.18)

```
Based on the provided codebase, the routing, pricing, and processing logic for a given order type is defined and executed in **`src/config/zoneRules.ts`**.

Specifically, the following structures and functions in that file govern how order types are processed:

1. Zone Routing Preferences (`typeKinds`)

The `typeKinds` dictionary maps each `OrderType` to an ordered preference list of target warehouse zone kinds (`Zone["kind"]`):

```typescript

const typeKinds: Record<OrderType, Zone["kind"][]> = {

standard: ["general", "fast-pick"],

express: ["fast-pick", "general"],

bulk: ["bulk", "general"],

hazardous: ["secure"],

};

```

This is evaluated within the `"type-routing"` rule inside the `zoneRules` array. The preference score decreases based on the index position of the zone kind in this list:

```typescript

prefer: (zone, order) => {

const position = typeKinds[order.type].indexOf(zone.kind);

return position < 0 ? -50 : 40 - position * 10;

}

```

2. Pricing Strategy (`pricingByType` and `pricingStrategyFor`)

The pricing strategy ("current" vs. "legacy") applied to an order is determined by its type using the `pricingByType` map and the `pricingStrategyFor` helper:

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

3. Rule Evaluation & Zone Scoring (`scoreZone`)

When evaluating where to process an order and its lines, `scoreZone` aggregates the applicable rules.

The **`hazard-isolation`** rule explicitly checks for the `"hazardous"` order type:

```typescript

applies: (order, line) => order.type === "hazardous" || line.hazardous,

```

**`scoreZone(zone, order, line)`** calculates the matching zone's final routing score by reducing all applicable rules for that order and line:

```typescript

export function scoreZone(zone: Zone, order: Order, line: OrderLine): number {

return rulesFor(order, line).reduce((score, rule) => {

if (!rule.zoneKinds.includes(zone.kind)) return score - 25;

return score + rule.prefer(zone, order, line);

}, 0);

}

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q4 — cross-cutting concern

> Everywhere stock is reserved — list every place it happens.

### Ground truth

Actual reservation changes are centralized in `applyStockReservation`. It is called during
initial allocation, again before shipment release to recheck and finalize the order's
allocations, and by the periodic revalidation job after resetting reserved counts and
rebuilding them for active orders. The store installs that revalidation job during
initialization.

**Files:** src/stock/reservation.ts:9-45, src/dispatch/allocator.ts:56-72, src/dispatch/releaseService.ts:31, src/jobs/revalidation.ts:10-49, src/store/useWarehouseStore.ts:88-125

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/stock/stockService.ts (0.15), src/tests/reservation.test.ts (0.12), src/components/ZoneCard.tsx (0.1)

```
Based on the provided repository context, stock reservation is executed, tested, and managed in the following locations:

1. Reservation Logic Execution (Application)
**`applyStockReservation`** (imported from `src/stock/reservation.ts`):

While the implementation file itself is not in the provided context, this is the core function responsible for reserving stock. It increments the `reserved` value on a stock item and populates lot data.

* Referenced and tested in **`src/tests/reservation.test.ts`** (Lines 2, 19, 29).

* In the test `"increments reserved stock and fills lot data"` (Lines 14–26), calling `applyStockReservation(order, [request], zones)` is verified to increment the `reserved` property of the target SKU:

```typescript

const result = applyStockReservation(order, [request], zones);

const after = result.zones[0].stock.find(

(item) => item.sku === "BX-100",

)!.reserved;

expect(after).toBe(before + 10);

```

---

2. Reservation Reduction (Commit/Release)
**`commitReleasedStock`** in **`src/stock/stockService.ts`** (Lines 17–34):

When allocations are finalized and released stock is committed, the reserved quantity is decremented (cleared) alongside the physical on-hand quantity:

```typescript

item.onHand = Math.max(0, item.onHand - allocation.quantity);

item.reserved = Math.max(0, item.reserved - allocation.quantity);

```

---

3. Read Operations and Availability Calculations

The reserved stock value is read in the following places to compute net available inventory:

**`availableStock`** in **`src/stock/stockService.ts`** (Lines 11–14):

Subtracts `reserved` from `onHand` to determine available units:

```typescript

return item ? Math.max(0, item.onHand - item.reserved) : 0;

```

**`ZoneCard` Component** in **`src/components/ZoneCard.tsx`**:

* Sums all reserved items in a zone for UI display (Line 6):

```typescript

const reserved = zone.stock.reduce((sum, item) => sum + item.reserved, 0);

```

* Filters low stock zones based on reservation levels (Lines 7–9):

```typescript

const low = zone.stock.filter(

(item) => item.onHand - item.reserved <= item.reorderPoint,

);

```

* Renders the net availability and total reserved amounts (Lines 40–45, 65):

```typescript

<strong>{quantity(onHand - reserved)}</strong>

// ...

<strong>{quantity(reserved)}</strong>

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q5 — interceptor chain

> What happens to an outgoing API request before it is sent?

### Ground truth

The client builds a request with an `Accept` header and empty metadata, then applies three
interceptors in order. Authentication adds the bearer token; audit adds a request timestamp,
source, and correlation ID; and the hazardous interceptor conditionally rewrites `/orders` to
`/controlled/orders`, adds an `x-controlled-load` header and sets `routing` metadata to
`dangerous-goods`. The transformed request is then passed to the mock transport.

**Files:** src/api/api-client.ts:5-19, src/api/interceptors/index.ts:7-11, src/api/interceptors/index.ts:13-19, src/api/interceptors/auth-interceptor.ts:3-9, src/api/interceptors/audit-interceptor.ts:3-11, src/api/interceptors/hazardous-interceptor.ts:4-13, src/api/mock-server.ts:4, src/api/mock-server.ts:7-9, src/api/mock-server.ts:14, src/api/mock-server.ts:15, src/dispatch/orderService.ts:11-15, src/store/useWarehouseStore.ts:152

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/interceptors/types.ts (0.64), src/api/interceptors/hazardous-interceptor.ts (0.39), src/api/interceptors/audit-interceptor.ts (0.35)

```
Based on the provided codebase context, outgoing API requests are processed and mutated by one or more **Request Interceptors** before they are sent.

These interceptors conform to the `RequestInterceptor` type defined in `src/api/interceptors/types.ts`, which takes an `ApiRequest` and returns either a modified `ApiRequest` or a `Promise<ApiRequest>`:

```typescript

export type RequestInterceptor = (

request: ApiRequest,

) => ApiRequest | Promise<ApiRequest>;

```

The repository defines two concrete interceptors that modify outgoing requests:

1. Audit Enrichment (`src/api/interceptors/audit-interceptor.ts`)

Every request passed through the `auditInterceptor` is enriched with auditing metadata:

**Headers**: Adds an `x-requested-at` header set to the current ISO timestamp (`new Date().toISOString()`).
**Metadata**:

* Sets `source` to `"dispatch-console"`.

* Generates a unique `correlationId` using `crypto.randomUUID()`.

2. Hazardous Materials Routing (`src/api/interceptors/hazardous-interceptor.ts`)

The `hazardousInterceptor` conditionally inspects and reroutes requests based on payload type:

**Condition**: It checks if the request body cast to a partial `Order` has a `type` property equal to `"hazardous"`.
**Mutations** (only applied if the condition is met):

* **Path**: Replaces `/orders` in the request path with `/controlled/orders`.

* **Headers**: Appends an `"x-controlled-load": "true"` header.

* **Metadata**: Sets `routing` to `"dangerous-goods"`.

*(Note: The provided context does not contain the orchestration code or execution chain that registers or sequences these interceptors. It only defines the interceptor functions themselves.)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q6 — misleading name

> Does validateShipment change any state, or does it only check?

### Ground truth

It does more than check. Alongside collecting errors and warnings, it mutates the supplied
shipment by assigning `shipment.dock`: hazardous orders always receive D4; other orders receive
D1–D3 deterministically from the order ID.

**Files:** src/dispatch/validation.ts:12-40

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/validation.test.ts (0.19), src/dispatch/releaseService.ts (0.17), src/dispatch/validation.ts (0.15)

```
Yes, `validateShipment` **does change state**. It is not a pure, read-only validation function; it mutates the `shipment` object passed to it as an argument.

Mutation Details

Inside `src/dispatch/validation.ts`, the function mutates the `shipment` parameter by dynamically assigning its `dock` property based on the order type and ID:

```typescript

// src/dispatch/validation.ts (lines 38-39)

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Downstream Impacts

1. **Test Expectations**:

The test suite in `src/tests/validation.test.ts` directly asserts on this side effect. It verifies that the `dock` property is assigned to the `candidate` shipment object after calling `validateShipment`:

```typescript

// src/tests/validation.test.ts (lines 32-34)

const candidate = shipment(order.id);

const result = validateShipment(candidate, order);

expect(result.valid).toBe(true);

expect(candidate.dock).toMatch(/^D[1-3]$/);

```

2. **Release Service Flow**:

In `src/dispatch/releaseService.ts`, the `releaseShipment` function relies on `validateShipment` to populate this `dock` property. Immediately after validation, it reads `shipment.dock` to assign the dock to the final `releasedOrder` and the log entry:

```typescript

// src/dispatch/releaseService.ts (lines 38-46)

const validation = validateShipment(shipment, order);

if (!validation.valid) throw new Error(validation.errors.join("; "));

shipment.releasedAt = new Date().toISOString();

const releasedOrder: Order = {

...order,

status: "released",

assignedDock: shipment.dock, // <--- Relies on mutation from validateShipment

carrier: shipment.carrier,

trackingNumber: `${shipment.carrier.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-9)}`,

};

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q7 — legacy path

> Which pricing implementation runs for a bulk order, and why that one?

### Ground truth

Bulk orders use `calculateLegacyPrice`. `pricingByType` maps `bulk` to `legacy`;
`calculateOrderPrice` reads that strategy and delegates to the legacy implementation. The legacy
calculation adds per-pallet handling and applies tiered volume discounts.

**Files:** src/config/zoneRules.ts:21-26, src/config/zoneRules.ts:76-78, src/pricing/pricing.ts:1-8, src/pricing/legacyPricing.ts:3-21

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/pricing.test.ts (0.41), src/pricing/pricing.ts (0.29), src/config/zoneRules.ts (0.27)

```
For a bulk order, the **legacy pricing** implementation (`calculateLegacyPrice`) runs.

Why this implementation runs:

1. **Strategy Determination**:

When calculating the price for an order via `calculateOrderPrice(order)` in `src/pricing/pricing.ts`, the function first determines the pricing strategy by calling `pricingStrategyFor(order)` (line 6).

2. **Configuration Lookup**:

In `src/config/zoneRules.ts`, the `pricingStrategyFor` function maps the order's `type` to a strategy using the `pricingByType` configuration mapping (lines 20–25, 78–80):

```typescript

const pricingByType: Record<OrderType, PricingStrategy> = {

standard: "current",

express: "current",

bulk: "legacy", // <--- Maps "bulk" type to "legacy" strategy

hazardous: "current",

};

```

Since the order's type is `"bulk"`, `pricingStrategyFor(order)` returns `"legacy"`.

3. **Execution Branch**:

Back in `calculateOrderPrice` (`src/pricing/pricing.ts`, lines 7–8), the engine evaluates the returned strategy. If the strategy is `"legacy"`, it short-circuits and returns the result of `calculateLegacyPrice(order)`:

```typescript

const strategy = pricingStrategyFor(order);

if (strategy === "legacy") return calculateLegacyPrice(order);

```

This behavior is explicitly verified by the test suite in `src/tests/pricing.test.ts` (lines 7–11):

```typescript

it("selects legacy pricing for bulk through configuration", () => {

const bulk = seedOrders.find((order) => order.type === "bulk")!;

expect(pricingStrategyFor(bulk)).toBe("legacy");

expect(calculateOrderPrice(bulk)).toBe(calculateLegacyPrice(bulk));

});

```
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q8 — event emitter

> What reacts when a dispatch event is emitted?

### Ground truth

Reactions depend on the event. `shipment.released` is consumed by the notification listener,
which publishes a success notification. `stock.low` is consumed both by that notification
listener and by the stock service's in-memory low-stock signal collector. There is no
registered listener for `order.allocated` or `notification.created` in this repository.

**Files:** src/events/bus.ts:3-34, src/notifications/listener.ts:4-23, src/stock/stockService.ts:6-9, src/dispatch/allocator.ts:71, src/dispatch/releaseService.ts:57, src/stock/stockService.ts:16-37, src/stock/stockService.ts:4, src/stock/stockService.ts:39-41, src/notifications/service.ts:16

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/events/bus.ts (0.23), src/notifications/listener.ts (0.1), src/pages/DispatchLogPage.tsx (0.08)

```
Based on the provided repository context, reactions to events emitted on the `eventBus` (defined in `src/events/bus.ts`) are registered in `src/notifications/listener.ts` via the `installNotificationListeners()` function.

Specifically, when these events are emitted:

1. **`"shipment.released"`**:

The listener reacts by invoking `publishNotification` to generate a success notification containing the order ID, package count, and destination dock (`src/notifications/listener.ts`, lines 9–15):

```typescript

eventBus.on("shipment.released", ({ order, shipment }) => {

publishNotification({

level: "success",

title: `Order ${order.id} released`,

message: `${shipment.packageCount} package(s) are loading at dock ${shipment.dock}.`,

});

});

```

2. **`"stock.low"`**:

The listener reacts by invoking `publishNotification` to generate a warning notification containing the SKU, remaining quantity, and zone ID (`src/notifications/listener.ts`, lines 16–22):

```typescript

eventBus.on("stock.low", ({ sku, zoneId, available }) => {

publishNotification({

level: "warning",

title: `Low stock: ${sku}`,

message: `${available} units remain available in ${zoneId}.`,

});

});

```

*(Note: While `src/pages/DispatchLogPage.tsx` displays historical dispatch log entries filtered by action type, it reads its data directly from the Zustand store hook `useWarehouseStore((state) => state.logs)` and does not directly subscribe to the `EventBus` events in the provided code context.)*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q9 — applied

> Where would a new order type be added, and what else would need changing?

### Ground truth

Add the literal to `OrderType`; add entries to both exhaustive order-type maps for zone
preferences and pricing; and add a handler module that calls `registerHandler` with preparation,
inspection, and shipment defaults. The dynamically loaded registry will discover the new handler
automatically. Seed and UI fixtures and tests should also be extended if the new type must
appear and be verified.

**Files:** src/types/domain.ts:1, src/config/zoneRules.ts:14-26, src/dispatch/handlers/registry.ts:3-32, src/dispatch/handlers/registry.ts:34-36, src/dispatch/handlers/standardHandler.ts:1-22, src/data/seedData.ts:167-324, src/pages/OrderListPage.tsx:15-21

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/tests/allocation.test.ts (0.38), src/tests/pricing.test.ts (0.27), src/tests/validation.test.ts (0.25)

```
Based on the provided test files and their imports, adding a new order type involves updating several key areas of the codebase:

1. Domain Types

The order type union must be updated to include the new literal string.

**File to modify:** `src/types/domain.ts` (inferred from the import of `Shipment` and order structures in `src/tests/validation.test.ts`).
**What to change:** Locate the `Order` type interface (or equivalent `OrderType` union) and add the new type (e.g., `'new-type'`) alongside existing types like `'standard'`, `'express'`, `'hazardous'`, and `'bulk'`.
2. Configuration & Pricing Strategy

You must define how the new order type is priced.

**File to modify:** `src/config/zoneRules.ts`

* *Reasoning:* `src/tests/pricing.test.ts` imports `pricingStrategyFor` from this file to determine whether to use `"legacy"` or other pricing strategies (e.g., `pricingStrategyFor(bulk) === "legacy"`).

**File to modify:** `src/pricing/pricing.ts` (and potentially new strategy files)

* *Reasoning:* `src/tests/pricing.test.ts` imports `calculateOrderPrice`. If the new order type requires custom handling charges or surcharges (similar to the dangerous goods surcharge for `'hazardous'` orders), you must implement that calculation here.

3. Allocation Logic

If the new order type has specific inventory allocation rules or preferred warehouse zones:

**File to modify:** `src/dispatch/allocator.ts`

* *Reasoning:* `src/tests/allocation.test.ts` calls `allocateOrder(order, zones)`. For example, `'express'` orders are allocated from preferred zones like `'ZB-02'`, and `'hazardous'` orders are restricted to secure zones like `'ZS-04'`. The allocation algorithm inside `allocateOrder` must be updated to handle any routing constraints of the new order type.

4. Shipment Validation & Routing

If the new order type has specific shipping, carrier, or dock requirements:

**File to modify:** `src/dispatch/validation.ts`

* *Reasoning:* `src/tests/validation.test.ts` imports `validateShipment` to verify carriers and assign docks. For example, `'hazardous'` orders require a "dangerous goods carrier" and are routed specifically to dock `"D4"`. You must update `validateShipment` if your new order type has similar validation constraints or dock assignment rules.

5. Seed Data & Test Coverage

To ensure the new type is testable and available for development:

**File to modify:** `src/data/seedData.ts`

* *Reasoning:* Imported by all test suites (`allocation.test.ts`, `pricing.test.ts`, `validation.test.ts`) to provide mock orders. You should add a seeded order of your new type here.

**Files to modify (Tests):**

* `src/tests/pricing.test.ts`: Add a test verifying the pricing strategy and calculation for the new type.

*
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q10 — applied

> If the zone rules changed, what else would be affected?

### Ground truth

Changes to matching, compatible zone kinds, priorities, or preference scores alter which zones
are ranked and therefore each order's proposed and accepted allocations, shortage warnings,
final `allocated` versus `held` state, and reserved stock totals. Revalidation and release reuse
those stored allocations and reservations. If the order-type pricing map in the same
configuration file changes, the calculated order total also changes.

**Files:** src/config/zoneRules.ts:14-85, src/dispatch/allocator.ts:17-73, src/stock/reservation.ts:9-45, src/jobs/revalidation.ts:10-49, src/dispatch/releaseService.ts:31-56, src/pricing/pricing.ts:5-21

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/config/zoneRules.ts (0.21), src/jobs/revalidation.ts (0.17), src/tests/allocation.test.ts (0.16)

```
Based on the provided codebase, changing the zone rules in `src/config/zoneRules.ts` would affect the following areas:

1. Zone Scoring and Filtering (`src/config/zoneRules.ts`)

Any modification to the `zoneRules` array directly alters the behavior of the core scoring and filtering functions:

**`rulesFor(order, line)`**: Determines which rules apply to a given order line and sorts them by `score` descending. Changing a rule's `score` or `applies` function changes the evaluation order and active rule set.
**`scoreZone(zone, order, line)`**: Computes the final numeric score for a zone. It penalizes mismatching zones by `-25` (if the zone's `kind` is not in `rule.zoneKinds`) and applies the `rule.prefer` modifier. Changing `zoneKinds` or the `prefer` logic will directly alter the scoring output.
**`pricingStrategyFor(order)`**: Relies on `pricingByType`. If order types or pricing mappings are modified, the returned `PricingStrategy` ("current" | "legacy") changes.

---

2. Allocation Decisions and Test Suites (`src/tests/allocation.test.ts`)

The test suite validates the integration of zone rules with the allocator (`allocateOrder` from `src/dispatch/allocator`, which is not fully provided but is tested here). Changing
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

## Q11 — interceptor chain

> Are hazardous orders treated differently anywhere? Where?

### Ground truth

Yes. Their handler adds dangerous-goods paperwork, raises priority, validates regulated lines
and international review, and supplies SecureChem shipment defaults. Zone scoring isolates a
hazardous order or line to secure zones. The API interceptor rewrites outgoing hazardous-order
requests and adds controlled-load metadata. Shipment validation requires SecureChem and forces
dock D4. Current pricing also adds a hazardous fee when a line is hazardous.

**Files:** src/dispatch/handlers/hazardousHandler.ts:3-27, src/config/zoneRules.ts:14-19, src/config/zoneRules.ts:30-36, src/api/interceptors/hazardous-interceptor.ts:4-13, src/dispatch/validation.ts:29-30, src/pricing/pricing.ts:16-20

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/api/interceptors/hazardous-interceptor.ts (0.17), src/dispatch/handlers/hazardousHandler.ts (0.15), src/dispatch/orderService.ts (0.11)

```
Yes, hazardous orders (identified by having an order `type` of `"hazardous"`) are treated differently in two main areas of the codebase:

1. API Request Interception & Routing

In **`src/api/interceptors/hazardous-interceptor.ts`**, the `hazardousInterceptor` intercepts outgoing API requests containing a hazardous order body and modifies them as follows:

**Path Rerouting**: Changes the destination path by replacing `/orders` with `/controlled/orders`.
**Headers**: Appends an `"x-controlled-load": "true"` header.
**Metadata**: Injects `{ routing: "dangerous-goods" }` into the request metadata.

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

2. Dispatch Handler Registry and Lifecycle

In **`src/dispatch/handlers/hazardousHandler.ts`**, a dedicated handler is registered for the `"hazardous"` order type. This handler overrides standard processing across three lifecycle stages:

**Preparation (`prepare`)**:

* Appends `"Dangerous goods paperwork required"` to the order's `notes` array.

* Sets the order `priority` to `"urgent"`.

**Inspection (`inspect`)**:

* Validates that at least one line item in the order is marked as hazardous (`line.hazardous`); if not, it returns the issue `"Hazardous order has no regulated line"`.

* Checks if the shipping destination is domestic; if `order.destination.country` is not `"US"`, it flags `"International dangerous goods review required"`.

**Shipment Defaults (`shipmentDefaults`)**:

* Hardcodes the carrier to `"SecureChem Logistics"`.

* Calculates the `packageCount` dynamically based on the total quantity of items across all lines (allocating 1 package per 4 units, with a minimum of 1 package).

```typescript

// src/dispatch/handlers/hazardousHandler.ts (lines 3-28)

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

### Ground truth

`validateShipment` assigns the dock directly on the mutable shipment object. It chooses D4 for
hazardous orders and otherwise D1–D3 from a checksum of the order ID. `releaseShipment` calls
that function and then copies the resulting dock to `releasedOrder.assignedDock`.

**Files:** src/dispatch/validation.ts:9, src/dispatch/validation.ts:35-37, src/dispatch/validation.ts:38, src/dispatch/releaseService.ts:35, src/dispatch/releaseService.ts:41

### What the tool answered

Evidence panel: Evidence · 3 files retrieved
Retrieved: src/dispatch/releaseService.ts (0.32), src/tests/validation.test.ts (0.28), src/dispatch/validation.ts (0.27)

```
A dock is assigned to a shipment inside the **`validateShipment`** function, which is located in **`src/dispatch/validation.ts`** (specifically lines 37–40):

```typescript

const numeric = order.id

.split("")

.reduce((sum, character) => sum + character.charCodeAt(0), 0);

shipment.dock = order.type === "hazardous" ? "D4" : docks[numeric % 3];

```

Control Flow and Mechanism

1. **Invocation**: During the release process in `releaseShipment` (`src/dispatch/releaseService.ts`, line 31), the `validateShipment(shipment, order)` function is called.

2. **Mutation**: The `validateShipment` function directly mutates the passed `shipment` object by setting its `dock` property.

3. **Logic**:

- If the order type is `"hazardous"`, it is assigned to dock `"D4"`.

- Otherwise, it is assigned to one of the standard docks (`"D1"`, `"D2"`, or `"D3"`) using a modulo operation on the sum of the ASCII character codes of the `order.id` string.
```

**Verdict:** <!-- correct | incorrect -->

**Why (one line, for the log):**

---

