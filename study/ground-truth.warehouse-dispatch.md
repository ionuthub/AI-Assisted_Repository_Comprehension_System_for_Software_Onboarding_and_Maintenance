# Ground truth — warehouse-dispatch (Repo A)

**This is the list of correct answers for the accuracy gate.** Twelve questions.

Each question carries a status:

- **CONFIRMED** — the researcher has read the code and signed it off. Usable.
- **CROSS-CHECKED** — drafted with AI assistance, then independently reviewed against the
  repository by a second pass, with every factual claim verified by grep or by reading the
  cited lines. Still needs the researcher's sign-off before use.
- **NOT CHECKED** — draft only. Not ground truth.

Progress: **0 confirmed, 12 cross-checked and awaiting sign-off.**

Two independent reviews. The first found an outright factual error in Q1 and four places where
the answer was correct but under-cited. The second found one more: Q4 claimed "exactly three
call sites" when there are five, two of them in `reservation.test.ts`. Every claim was
re-verified here before being accepted.

Both defects found across the two repositories were of the same kind — an absolute quantifier
that had not been checked against a plain grep. "Exactly three", "the only path", "can be
changed". Where an answer counts or excludes something, count it again.

Two observations that belong outside any single answer.

This repository installs its listeners and creates its router differently from clinic-triage.
Here the router is built once at module scope and the listeners are installed inside an effect;
there the routes are declared inside the component and the listeners arrive through bare
side-effect imports. Question 1 therefore has a structurally different answer in each
repository. The orientation question is already known to fail retrieval in both, so nothing in
the study turns on it, but it should be recorded rather than discovered later.

The second is more consequential and was not planned. The two repositories differ in how much
declared-but-unreachable behaviour they contain. Here it is narrow: `ZoneRule.pricing` is
written on every rule and read nowhere, and `registeredHandlerTypes` is exported with no
callers. In clinic-triage an entire subsystem is unreachable — nothing outside `src/api/`
imports from it, so the request pipeline is never loaded. This repository has no equivalent:
`src/dispatch/orderService.ts` imports `apiClient`, so the API path here is live.

That asymmetry was not designed. The seven planted patterns are mirrored between the pair and
remain so; reachability is not one of them and emerged from generation. It does not threaten
the timed tasks, which target the seven patterns. It does mean the same gate question is harder
in clinic-triage than here, so the two per-repository accuracy figures are not directly
comparable and should be reported as a pooled figure with the asymmetry stated. Recording it
now, before scoring, is what keeps it a limitation rather than an excuse.

Do not open the tool until all twelve are checked. Once an answer is seen from the tool it
cannot be unseen, and the gate stops measuring anything.

To validate every line reference in this file:

    python3 analysis/check_citations.py study/ground-truth.warehouse-dispatch.md /path/to/Repo-A

---

## Q1 — orientation

**Status: CROSS-CHECKED — awaiting sign-off. One sentence was factually wrong and is corrected.**

> Where does execution start in this project?

**Answer**

Browser execution starts in `src/main.tsx`, which finds the `root` element and renders `App`
inside React strict mode. The router is not created by `App`: it is built once at module scope
when `App.tsx` is first imported. `App` itself installs the notification listeners, calls the
store's `initialize`, and renders the `RouterProvider` around the router that already exists.

**Files and lines**

src/main.tsx:1-10
src/App.tsx:11-22
src/App.tsx:24-31

**Notes**

The distinction matters for a question about where execution starts: the route table is
constructed at import time, before any component renders, whereas the listeners and the store
initialisation run inside an effect after the first render.

This is the client entry point; there is no separate application server because API behaviour
is mocked in-process.

---

## Q2 — config-driven behaviour

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; no change.**

> How is an order assigned to a warehouse zone?

**Answer**

`allocateOrder` processes each order line independently. It scores every zone with `scoreZone`,
removes inactive zones and zones without the SKU, sorts by descending score, and proposes
allocations from available stock until the requested quantity is covered. `scoreZone` applies
configuration rules in priority order: hazardous isolation, cold-chain compatibility,
order-type routing, and capacity balance. `applyStockReservation` then accepts only quantities
still available and updates reserved stock in a cloned zone set.

**Files and lines**

src/dispatch/allocator.ts:17-73
src/config/zoneRules.ts:14-19
src/config/zoneRules.ts:28-85
src/stock/reservation.ts:9-45

**Notes**

An order can be split across zones and its different lines can go to different zones. The
result is `held` if the accepted allocations do not cover every line completely
(allocator.ts:59-69).

---

## Q3 — handler registry

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; one fact added.**

> Which code decides how a given order type is processed?

**Answer**

The dispatch-handler registry makes the decision. On first use, `getHandler` dynamically imports
every handler module; each module registers one handler keyed by its `type`. Allocation and
release look up the handler using `order.type`, then call its preparation/inspection or
shipment-default methods.

**Files and lines**

src/dispatch/handlers/registry.ts:3-32
src/dispatch/handlers/standardHandler.ts:1-22
src/dispatch/handlers/expressHandler.ts:1-31
src/dispatch/handlers/bulkHandler.ts:1-37
src/dispatch/handlers/hazardousHandler.ts:1-27
src/dispatch/allocator.ts:21
src/dispatch/releaseService.ts:17

**Notes**

The registry selects processing behaviour; zone selection is a separate, configuration-driven
decision. Registering a second handler for the same type throws, so the glob cannot silently
shadow one handler with another.

---

## Q4 — cross-cutting concern

**Status: CROSS-CHECKED twice — awaiting sign-off. A second review found the completeness
claim overstated; corrected.**

> Everywhere stock is reserved — list every place it happens.

**Answer**

Actual reservation changes are centralized in `applyStockReservation`. It is called during
initial allocation, again before shipment release to recheck and finalize the order's
allocations, and by the periodic revalidation job after resetting reserved counts and
rebuilding them for active orders. The store installs that revalidation job during
initialization.

**Files and lines**

src/stock/reservation.ts:9-45
src/dispatch/allocator.ts:56-72
src/dispatch/releaseService.ts:31
src/jobs/revalidation.ts:10-49
src/store/useWarehouseStore.ts:88-125

**Notes**

`commitReleasedStock` does not create a reservation; it consumes on-hand stock and removes the
corresponding reservation (src/stock/stockService.ts:16-37).

The list is complete by two independent routes. `applyStockReservation` has three call sites in
application code, named above, plus the store's installation of the revalidation job. It also
has two more in `reservation.test.ts`, at lines 22 and 31, which build orders by hand; an
earlier version of this note said "exactly three call sites" without that qualification, and
`grep -rn applyStockReservation src` returns five. Grepping instead for every direct write to
`item.reserved` returns three: the reservation function itself, the reset inside revalidation,
and the release path in `commitReleasedStock`. Both searches agree on the application paths.

---

## Q5 — interceptor / pipeline chain

**Status: CROSS-CHECKED — awaiting sign-off. Under-stated; two facts added.**

> What happens to an outgoing API request before it is sent?

**Answer**

The client builds a request with an `Accept` header and empty metadata, then applies three
interceptors in order. Authentication adds the bearer token; audit adds a request timestamp,
source, and correlation ID; and the hazardous interceptor conditionally rewrites `/orders` to
`/controlled/orders`, adds an `x-controlled-load` header and sets `routing` metadata to
`dangerous-goods`. The transformed request is then passed to the mock transport.

**Files and lines**

src/api/api-client.ts:5-19
src/api/interceptors/index.ts:7-11
src/api/interceptors/index.ts:13-19
src/api/interceptors/auth-interceptor.ts:3-9
src/api/interceptors/audit-interceptor.ts:3-11
src/api/interceptors/hazardous-interceptor.ts:4-13
src/api/mock-server.ts:4
src/api/mock-server.ts:7-9
src/api/mock-server.ts:14
src/api/mock-server.ts:15

**Notes**

The hazardous transformation only occurs when the request body itself has `type: "hazardous"`.

The path rewrite has no effect on the response. `mock-server.ts:7-9` normalises
`/controlled/orders` straight back to `/orders` before dispatching, so the rewritten path
reaches nothing that treats it differently. The header and the metadata survive; the new path
does not.

The comment at `mock-server.ts:4` says the mock "always responds synchronously to keep tests
deterministic". `handleRequest` awaits a 90-millisecond timeout at line 14. This is the third
comment in the pair that describes something the code does not do, alongside the Internet
Explorer shim and the site-grouping claim in clinic-triage.

---

## Q6 — misleading name

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; one fact added.**

> Does `validateShipment` change any state, or does it only check?

**Answer**

It does more than check. Alongside collecting errors and warnings, it mutates the supplied
shipment by assigning `shipment.dock`: hazardous orders always receive D4; other orders receive
D1–D3 deterministically from the order ID.

**Files and lines**

src/dispatch/validation.ts:12-40

**Notes**

This is an in-place mutation, contrary to both the function name and its documentation comment.

The dock list holds four entries, but the non-hazardous branch indexes it modulo 3, so D4 is
unreachable except through the hazardous branch. "D1-D3" is exact rather than approximate.

---

## Q7 — legacy path

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; no change.**

> Which pricing implementation runs for a bulk order, and why that one?

**Answer**

Bulk orders use `calculateLegacyPrice`. `pricingByType` maps `bulk` to `legacy`;
`calculateOrderPrice` reads that strategy and delegates to the legacy implementation. The legacy
calculation adds per-pallet handling and applies tiered volume discounts.

**Files and lines**

src/config/zoneRules.ts:21-26
src/config/zoneRules.ts:76-78
src/pricing/pricing.ts:1-8
src/pricing/legacyPricing.ts:3-21

**Notes**

The handler selected for bulk dispatch does not select pricing; the separate configuration map
does.

---

## Q8 — event emitter

**Status: CROSS-CHECKED — awaiting sign-off. Under-cited; emitter and registration timing added.**

> What reacts when a dispatch event is emitted?

**Answer**

Reactions depend on the event. `shipment.released` is consumed by the notification listener,
which publishes a success notification. `stock.low` is consumed both by that notification
listener and by the stock service's in-memory low-stock signal collector. There is no
registered listener for `order.allocated` or `notification.created` in this repository.

**Files and lines**

src/events/bus.ts:3-34
src/notifications/listener.ts:4-23
src/stock/stockService.ts:6-9
src/dispatch/allocator.ts:71
src/dispatch/releaseService.ts:57
src/stock/stockService.ts:16-37
src/notifications/service.ts:16

**Notes**

Listeners are synchronous: `emit` immediately iterates the registered callbacks.

`stock.low` has a single emitter, `commitReleasedStock`, which raises it when available stock
falls to or below the reorder point after a release.

The two listener sets register at different moments. The stock service subscribes at module
import time, as a side effect of loading the file. The notification listeners subscribe only
when `installNotificationListeners` is called from `App`. A question about what reacts to an
event therefore has a different answer before that call than after it.

---

## Q9 — applied

**Status: CROSS-CHECKED — awaiting sign-off. Under-cited; the hardcoded type filter added.**

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
src/dispatch/handlers/registry.ts:3-32
src/dispatch/handlers/standardHandler.ts:1-22
src/data/seedData.ts:167-324
src/pages/OrderListPage.tsx:15-21

**Notes**

TypeScript's `Record<OrderType, ...>` maps force configuration additions at compile time. A new
module is discovered by the registry glob without editing a central import list.

The order list's type filter is a hardcoded array rather than a derivation from `OrderType`, so
a new type would be unfilterable in the interface and the compiler would not object.

Nothing in this repository asserts a handler count, so unlike clinic-triage — where
`registry.test.ts` fails the moment a fifth route module lands — no test breaks here on a new
order type. `registeredHandlerTypes` would have made such a test possible, but it is exported
and never called.

---

## Q10 — applied

**Status: CROSS-CHECKED — awaiting sign-off. The decoy is confirmed dead.**

> If the zone rules changed, what else would be affected?

**Answer**

Changes to matching, compatible zone kinds, priorities, or preference scores alter which zones
are ranked and therefore each order's proposed and accepted allocations, shortage warnings,
final `allocated` versus `held` state, and reserved stock totals. Revalidation and release reuse
those stored allocations and reservations. If the order-type pricing map in the same
configuration file changes, the calculated order total also changes.

**Files and lines**

src/config/zoneRules.ts:14-85
src/dispatch/allocator.ts:17-73
src/stock/reservation.ts:9-45
src/jobs/revalidation.ts:10-49
src/dispatch/releaseService.ts:31-56
src/pricing/pricing.ts:5-21

**Notes**

The `pricing` property present on individual `ZoneRule` objects is not read by any code in the
repository. It is declared on the interface, written on all four rules, and never read:
`pricingStrategyFor` consults `pricingByType`, and grepping for `.pricing` outside the
configuration file returns nothing. Pricing is decided by order type, not by zone.

---

## Q11 — interceptor / pipeline chain

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; no change.**

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
src/config/zoneRules.ts:30-36
src/api/interceptors/hazardous-interceptor.ts:4-13
src/dispatch/validation.ts:29-30
src/pricing/pricing.ts:16-20

**Notes**

Some behaviour is keyed by `order.type === "hazardous"`, while zone isolation and the price
surcharge can also be triggered by a hazardous line in another order type.

---

## Q12 — misleading name

**Status: CROSS-CHECKED — awaiting sign-off. Verified exact; one site added.**

> Where is a dock assigned to a shipment?

**Answer**

`validateShipment` assigns the dock directly on the mutable shipment object. It chooses D4 for
hazardous orders and otherwise D1–D3 from a checksum of the order ID. `releaseShipment` calls
that function and then copies the resulting dock to `releasedOrder.assignedDock`.

**Files and lines**

src/dispatch/validation.ts:9
src/dispatch/validation.ts:35-37
src/dispatch/validation.ts:38
src/dispatch/releaseService.ts:35
src/dispatch/releaseService.ts:41

**Notes**

The assignment is hidden inside validation rather than a named allocation step.
