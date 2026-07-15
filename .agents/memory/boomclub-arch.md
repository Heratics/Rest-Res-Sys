---
name: BOOMCLUB Architecture
description: Key decisions, conventions, and constraints for the BOOMCLUB restaurant-reservation artifact.
---

## Stack & Location
- Artifact: `artifacts/restaurant-reservation` (React + Vite + Tailwind + shadcn/ui + wouter + Framer Motion)
- No backend — all state in React context (`StoreContext.tsx`). When backend arrives, replace `ReservationOps` callbacks with API calls.
- Session keys: `BOOMCLUB_owner_session`, `BOOMCLUB_employee_session`

## Role Model
Three employee roles: `"Owner" | "Doorman" | "Waiter"`.
- Owner → `/owner/*` (OwnerLayout, full access)
- Doorman → `/employee/*` (EmployeeLayout) but **NO floor plan** — route `WaiterOnlyRoute` blocks Doorman
- Waiter → `/employee/*` (EmployeeLayout) but **NO new reservation** — route `DoormanOnlyRoute` blocks Waiter
- Employee login strictly requires known Active employee in mockData (no generic fallback)

## Operation Conventions
- All state mutations go through `reservationOperations.ts` — never mutate state directly in components.
- `buildOps(updateReservationStatus, updateFloorTable, updateReservation)` — now takes 3 args; always pass all 3.
- `assignTableOp(resId, tableId, ops, { number, floor })` — always pass `tableInfo` so reservation stores denormalized table info for history.
- `moveReservation(...)` — also pass `newTableInfo` as 6th arg.

## Key Decisions
- Reservation stores denormalized `assignedTableId/Number/Floor` so completed reservations retain table info after table is cleared.
- `cancelReservation` in operations.ts accepts optional `tableId` arg — if provided, releases the table.
- `seatSpecialGuest` → sets table to Occupied but **preserves** `specialGuest` info (do NOT clear it).
- Employee role "Owner" is excluded from Add/Edit employee forms — only Doorman and Waiter are selectable.
- `ReservationDetailsModal` is the single shared details component — used everywhere (dashboard, reservations page, waiter, doorman).

**Why:** All business logic stays in one place (ops file) to allow backend replacement without touching components.

## Reservation Status → Display Label
- Pending / Confirmed → "Incoming"
- Checked In → "Waiting for Guests"
- Seated → "Seated"
- Completed / Cancelled → as-is

## Floor Table Status → Color
- Available: emerald (#10b981)
- Waiting: amber (#f59e0b)
- Occupied: blue (#3b82f6)
- Special: purple (#a855f7)
- OutOfService: zinc (#52525b)
