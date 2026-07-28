# Ground truth — warehouse-dispatch (Repo A)

**This is the list of correct answers for the accuracy gate.** Twelve questions. Each one is
either checked or not checked, and the status line says which.

The starting text for every answer was drafted with AI assistance. **A draft answer is not
ground truth.** It becomes ground truth only once the researcher has opened the files and
confirmed it. Until then the status line reads NOT CHECKED and the answer must not be used.

Progress: **0 of 12 checked.**

Do not open the tool until all twelve are checked. Once an answer is seen from the tool it
cannot be unseen, and the gate stops measuring anything.

To validate every line reference in this file:

    python3 analysis/check_citations.py study/ground-truth.warehouse-dispatch.md /path/to/Repo-A

---

## Q1 — orientation

**Status: NOT CHECKED**

> Where does execution start in this project?

**Answer**

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. `App` then creates the router, installs notification listeners, and
initializes the warehouse store.

**Files and lines**

src/main.tsx:1-10
src/App.tsx:11-30

**Notes**

This is the client entry point; there is no separate application server because API behaviour
is mocked in-process.

---

## Q2 — config-driven behaviour

**Status: NOT CHECKED**

> How is an order assigned to a warehouse zone?

**Answer**

`allocateOrder` processes each order line independently. It scores every zone with `scoreZone`,
removes inactive zones and zones without the SKU, sorts by descending score, and proposes
allocations from available stock until the requested quantity is covered. `scoreZone` applies
configuration rules in priority order: hazardous isolation, cold-chain compatibility,
order-type routing, and capacity balance. `applyStockReservation` then accepts only quantities
still available and updates reserved stock in a cloned zone set.

**Files and lines**

src/dispatch/allocator.ts:17-64
src/config/zoneRules.ts:14-19
src/config/zoneRules.ts:28-85
src/stock/reservation.ts:9-44

**Notes**

An order can be split across zones and its different lines can go to different zones. The
result is `held` if the accepted allocations do not cover every line completely
(allocator.ts:59-69).

---

## Q3 — handler registry

**Status: NOT CHECKED**

> Which code decides how a given order type is processed?

**Answer**

The dispatch-handler registry makes the decision. On first use, `getHandler` dynamically imports
every handler module; each module registers one handler keyed by its `type`. Allocation and
release look up the handler using `order.type`, then call its preparation/inspection or
shipment-default methods.

**Files and lines**

src/dispatch/handlers/registry.ts:3-31
src/dispatch/handlers/standardHandler.ts:1-22
src/dispatch/handlers/expressHandler.ts:1-31
src/dispatch/handlers/bulkHandler.ts:1-37
src/dispatch/handlers/hazardousHandler.ts:1-27
src/dispatch/allocator.ts:17-23
src/dispatch/releaseService.ts:12-18

**Notes**

The registry selects processing behaviour; zone selection is a separate, configuration-driven
decision.

---

## Q4 — cross-cutting concern

**Status: NOT CHECKED**

> Everywhere stock is reserved — list every place it happens.

**Answer**

Actual reservation changes are centralized in `applyStockReservation`. It is called during
initial allocation, again before shipment release to recheck and finalize the order's
allocations, and by the periodic revalidation job after resetting reserved counts and
rebuilding them for active orders. The store installs that revalidation job during
initialization.

**Files and lines**

src/stock/reservation.ts:9-44
src/dispatch/allocator.ts:56-72
src/dispatch/releaseService.ts:31-36
src/jobs/revalidation.ts:10-48
src/store/useWarehouseStore.ts:88-116

**Notes**

`commitReleasedStock` does not create a reservation; it consumes on-hand stock and removes the
corresponding reservation (src/stock/stockService.ts:16-36).

---

## Q5 — interceptor / pipeline chain

**Status: NOT CHECKED**

> What happens to an outgoing API request before it is sent?

**Answer**

The client builds a request with an `Accept` header and empty metadata, then applies three
interceptors in order. Authentication adds the bearer token; audit adds a request timestamp,
source, and correlation ID; and the hazardous interceptor conditionally rewrites `/orders` to
`/controlled/orders` while adding controlled-load routing metadata. The transformed request is
then passed to the mock transport.

**Files and lines**

src/api/api-client.ts:5-18
src/api/interceptors/index.ts:7-18
src/api/interceptors/auth-interceptor.ts:3-9
src/api/interceptors/audit-interceptor.ts:3-11
src/api/interceptors/hazardous-interceptor.ts:4-13
src/api/mock-server.ts:7-16

**Notes**

The hazardous transformation only occurs when the request body itself has `type: "hazardous"`.

---

## Q6 — misleading name

**Status: NOT CHECKED**

> Does `validateShipment` change any state, or does it only check?

**Answer**

It does more than check. Alongside collecting errors and warnings, it mutates the supplied
shipment by assigning `shipment.dock`: hazardous orders always receive D4; other orders receive
D1–D3 deterministically from the order ID.

**Files and lines**

src/dispatch/validation.ts:11-39

**Notes**

This is an in-place mutation, contrary to both the function name and its documentation comment.

---

## Q7 — legacy path

**Status: NOT CHECKED**

> Which pricing implementation runs for a bulk order, and why that one?

**Answer**

Bulk orders use `calculateLegacyPrice`. `pricingByType` maps `bulk` to `legacy`;
`calculateOrderPrice` reads that strategy and delegates to the legacy implementation. The legacy
calculation adds per-pallet handling and applies tiered volume discounts.

**Files and lines**

src/config/zoneRules.ts:21-26
src/config/zoneRules.ts:76-78
src/pricing/pricing.ts:1-8
src/pricing/legacyPricing.ts:3-20

**Notes**

The handler selected for bulk dispatch does not select pricing; the separate configuration map
does.

---

## Q8 — event emitter

**Status: NOT CHECKED**

> What reacts when a dispatch event is emitted?

**Answer**

Reactions depend on the event. `shipment.released` is consumed by the notification listener,
which publishes a success notification. `stock.low` is consumed both by that notification
listener and by the stock service's in-memory low-stock signal collector. There is no
registered listener for `order.allocated` or `notification.created` in this repository.

**Files and lines**

src/events/bus.ts:3-34
src/notifications/listener.ts:4-23
src/stock/stockService.ts:4-9
src/dispatch/allocator.ts:65-72
src/dispatch/releaseService.ts:53-58
src/notifications/service.ts:16

**Notes**

Listeners are synchronous: `emit` immediately iterates the registered callbacks.

---

## Q9 — applied

**Status: NOT CHECKED**

> Where would a new order type be added, and what else would need changing?

**Answer**

Add the literal to `OrderType`; add entries to both exhaustive order-type maps for zone
preferences and pricing; and add a handler module that calls `registerHandler` with preparation,
inspection, and shipment defaults. The dynamically loaded registry will discover the new handler
automatically. Seed and UI fixtures and tests should also be extended if the new type must
appear and be verified.

**Files and lines**

src/types/domain.ts:1
src/config/zoneRules.ts:14-26
src/dispatch/handlers/registry.ts:3-31
src/dispatch/handlers/standardHandler.ts:1-22
src/data/seedData.ts:167

**Notes**

TypeScript's `Record<OrderType, ...>` maps force configuration additions at compile time. A new
module is discovered by the registry glob without editing a central import list.

---

## Q10 — applied

**Status: NOT CHECKED**

> If the zone rules changed, what else would be affected?

**Answer**

Changes to matching, compatible zone kinds, priorities, or preference scores alter which zones
are ranked and therefore each order's proposed and accepted allocations, shortage warnings,
final `allocated` versus `held` state, and reserved stock totals. Revalidation and release reuse
those stored allocations and reservations. If the order-type pricing map in the same
configuration file changes, the calculated order total also changes.

**Files and lines**

src/config/zoneRules.ts:14-85
src/dispatch/allocator.ts:26-72
src/stock/reservation.ts:9-44
src/jobs/revalidation.ts:10-48
src/dispatch/releaseService.ts:31-56
src/pricing/pricing.ts:5-20

**Notes**

The `pricing` property present on individual `ZoneRule` objects is not read by current pricing
code; pricing actually comes from `pricingByType` through `pricingStrategyFor`.

---

## Q11 — interceptor / pipeline chain

**Status: NOT CHECKED**

> Are hazardous orders treated differently anywhere? Where?

**Answer**

Yes. Their handler adds dangerous-goods paperwork, raises priority, validates regulated lines
and international review, and supplies SecureChem shipment defaults. Zone scoring isolates a
hazardous order or line to secure zones. The API interceptor rewrites outgoing hazardous-order
requests and adds controlled-load metadata. Shipment validation requires SecureChem and forces
dock D4. Current pricing also adds a hazardous fee when a line is hazardous.

**Files and lines**

src/dispatch/handlers/hazardousHandler.ts:3-27
src/config/zoneRules.ts:14-19
src/config/zoneRules.ts:28-36
src/api/interceptors/hazardous-interceptor.ts:4-13
src/dispatch/validation.ts:29-38
src/pricing/pricing.ts:16-20

**Notes**

Some behaviour is keyed by `order.type === "hazardous"`, while zone isolation and the price
surcharge can also be triggered by a hazardous line in another order type.

---

## Q12 — misleading name

**Status: NOT CHECKED**

> Where is a dock assigned to a shipment?

**Answer**

`validateShipment` assigns the dock directly on the mutable shipment object. It chooses D4 for
hazardous orders and otherwise D1–D3 from a checksum of the order ID. `releaseShipment` calls
that function and then copies the resulting dock to `releasedOrder.assignedDock`.

**Files and lines**

src/dispatch/validation.ts:9-12
src/dispatch/validation.ts:35-39
src/dispatch/releaseService.ts:23-41

**Notes**

The assignment is hidden inside validation rather than a named allocation step.
