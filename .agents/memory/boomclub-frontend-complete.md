---
name: BOOMCLUB Frontend Complete
description: Summary of the final frontend pass before backend handoff — bugs fixed, architecture decisions, and files created.
---

## Status
Frontend prototype complete and production-build-verified. Ready for backend handoff.

## Bugs Fixed
1. `ReservationsPage` New button — was `!isDoorman || isOwner` (always true for Owner, also true for Waiter). Fixed to `isOwner || isDoorman`.
2. `DashboardOverview` Create Reservation quick action linked to `/owner/reservations`. Fixed to `/owner/new-reservation`.
3. `DoormanDashboard` cancel — used raw `updateStatus` with no timestamps. Fixed to `cancelReservation` op (sets cancelledAt/cancelledBy, releases table atomically).
4. `FloorPlan` Cancel Assignment on Waiting table — only cleared the table, left reservation stuck in Checked In. Fixed: new `unassignTable` op in reservationOperations.ts (table → Available, reservation → Pending).
5. `FloorPlan` Waiter OOS — had `{!isWaiter && ...}` guard on OOS button. Removed — Waiter CAN manage OOS per spec.
6. `ReservationDetailsModal` — dead `cancelConfirm` state removed.

## Architecture Decision
`unassignTable(reservationId, tableId, ops)` added to `reservationOperations.ts` alongside the existing ops. It atomically resets a Waiting table to Available and its reservation to Pending.

**Why:** Cancel Assignment on the floor plan was a partial write — table cleared but reservation stayed Checked In with no table, making it invisible in all queues.

## New Files Created
- `src/services/api/auth.ts` — typed stubs for auth endpoints
- `src/services/api/reservations.ts` — typed stubs for reservation CRUD + ops
- `src/services/api/tables.ts` — typed stubs for floor plan / table ops
- `src/services/api/employees.ts` — typed stubs for employee CRUD
- `src/services/api/dashboard.ts` — optional dashboard summary endpoint
- `src/services/api/index.ts` — barrel export
- `src/services/events.ts` — Socket.IO event type definitions + socket manager stub

## Documentation Created (workspace root)
- `BACKEND_API_CONTRACT.md` — complete REST API spec with endpoints, request/response shapes, error codes, business rules, data models
- `FRONTEND_BACKEND_INTEGRATION_MAP.md` — file-by-file replacement guide for wiring backend; 8 phases from auth through Socket.IO

## Build Notes
- `tsc --noEmit` passes with zero errors
- Production build: `PORT=18375 BASE_PATH=/restaurant-reservation pnpm run build` — both env vars required by vite.config.ts
- Production build warns about chunk size (>500kb) — not a bug, no action needed for MVP
