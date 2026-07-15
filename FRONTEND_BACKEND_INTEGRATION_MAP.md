# BOOMCLUB — Frontend ↔ Backend Integration Map

**Version:** 1.0 (frontend prototype complete, backend pending)
**Date:** 2026-07-15

This document maps every location in the frontend codebase that must be updated
when wiring the backend. Follow sections in order — Auth first, then seeding data,
then individual operations, then real-time events.

---

## Phase 1: Authentication

### 1.1 Remove mock auth, wire JWT

| File | Current (mock) | Replace with |
|---|---|---|
| `src/services/StoreContext.tsx` | `OwnerAuthState.login()` ignores credentials, saves to localStorage | `authApi.ownerLogin()` → store JWT in memory |
| `src/services/StoreContext.tsx` | `EmployeeAuthState.login()` matches against `mockEmployees` | `authApi.employeeLogin()` → store JWT in memory |
| `src/services/StoreContext.tsx` | `logout()` clears localStorage | `authApi.logout()` → clear in-memory token |

**localStorage keys to remove:**
- `BOOMCLUB_owner_session`
- `BOOMCLUB_employee_session`

### 1.2 JWT middleware

Create `src/services/api/client.ts` with a fetch wrapper that:
- Attaches `Authorization: Bearer <token>` to every request
- Handles `401` by redirecting to the appropriate login page
- Returns parsed JSON or throws a typed `ApiError`

Example:
```typescript
export async function apiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getToken(); // from in-memory store
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new ApiError(err.error, err.message, res.status);
  }
  return res.json();
}
```

---

## Phase 2: Seed Initial Data

On app startup (`StoreContext.tsx` `StoreProvider`), replace the mock
initial state with API-loaded data:

| Current mock source | Replace with |
|---|---|
| `mockReservations` imported from `mockData.ts` | `await reservationsApi.list()` |
| `mockFloorTables` imported from `mockData.ts` | `await tablesApi.listFloorTables()` |
| `mockEmployees` imported from `mockData.ts` | `await employeesApi.list()` |

**Pattern (inside `StoreProvider`):**
```typescript
useEffect(() => {
  Promise.all([
    reservationsApi.list(),
    tablesApi.listFloorTables(),
    employeesApi.list(),
  ]).then(([reservations, tables, employees]) => {
    setReservations(reservations);
    setFloorTables(tables);
    setEmployees(employees);
    setLoading(false);
  });
}, []);
```

Add a `loading: boolean` state to `StoreContext` and render a
`<LoadingScreen />` until all three calls resolve.

---

## Phase 3: Reservation Operations

Each function in `src/services/reservationOperations.ts` maps to a backend endpoint.
After the API call succeeds, the local state update can remain as-is (optimistic
update) or be replaced by refreshing from the Socket.IO event.

| Function | Backend endpoint | Local state impact |
|---|---|---|
| `assignTable()` | `POST /api/reservations/:id/assign-table` | reservation + floorTable |
| `unassignTable()` | `POST /api/reservations/:id/unassign-table` | reservation + floorTable |
| `markGuestsSeated()` | `POST /api/reservations/:id/seat` | reservation + floorTable |
| `completeReservation()` | `POST /api/reservations/:id/complete` | reservation + floorTable |
| `cancelReservation()` | `POST /api/reservations/:id/cancel` | reservation + optional floorTable |
| `updateReservation()` | `PATCH /api/reservations/:id` | reservation |
| `moveReservation()` | `POST /api/reservations/:id/move-table` | reservation + 2 floorTables |

### Call site map

| Component / File | Operation called | Wiring note |
|---|---|---|
| `FloorPlan.tsx` | `assignTable` via ops + workflow | Use `reservationsApi.assignTable()` |
| `FloorPlan.tsx` | `unassignTableOp` via `handleMarkAvailable` | Use `reservationsApi.unassignTable()` |
| `FloorPlan.tsx` | `markGuestsSeated` | Use `reservationsApi.seat()` |
| `FloorPlan.tsx` | `completeReservation` | Use `reservationsApi.complete()` |
| `FloorPlan.tsx` | `cancelReservation` (from modal) | Use `reservationsApi.cancel()` |
| `FloorPlan.tsx` | `moveReservation` | Use `reservationsApi.moveTable()` |
| `ReservationDetailsModal.tsx` | `cancelReservation` | Use `reservationsApi.cancel()` |
| `ReservationDetailsModal.tsx` | `updateReservation` (edit mode) | Use `reservationsApi.update()` |
| `WaiterDashboard.tsx` | `assignTable` (CHOOSE TABLE flow) | Use `reservationsApi.assignTable()` |
| `DoormanDashboard.tsx` | `cancelReservation` via ops | Use `reservationsApi.cancel()` |
| `NewReservation.tsx` | `addReservation()` from StoreContext | Use `reservationsApi.create()` |

---

## Phase 4: Table Operations

| Function in `reservationOperations.ts` / `FloorPlan.tsx` | Backend endpoint |
|---|---|
| `seatSpecialGuest()` | `POST /api/tables/:id/seat-special-guest` |
| `updateSpecialGuest()` | `PATCH /api/tables/:id/special-guest` |
| `releaseSpecialGuest()` | `POST /api/tables/:id/release-special-guest` |
| `markTableOutOfService()` | `POST /api/tables/:id/out-of-service` |
| `returnTableToService()` | `POST /api/tables/:id/return-to-service` |
| `applyUpdate()` for notes | `PATCH /api/tables/:id/notes` |
| `applyUpdate()` for waiter | `PATCH /api/tables/:id` (notes/waiter field) |

### Layout editing call sites (Owner only)

| Action in `FloorPlan.tsx` | Backend endpoint |
|---|---|
| Add table (addTable modal step) | `POST /api/tables` |
| Edit table properties (editTable step) | `PATCH /api/tables/:id` |
| Delete table | `DELETE /api/tables/:id` |
| Save layout (drag + drop positions) | `POST /api/tables/layout` |

### Special guest call site map

| Component | Action | Backend endpoint |
|---|---|---|
| `FloorPlan.tsx` modal step: `special` | Reserve special guest | `POST /api/tables/:id/reserve-special-guest` |
| `FloorPlan.tsx` → seatSpecial confirm | Seat special guest | `POST /api/tables/:id/seat-special-guest` |
| `FloorPlan.tsx` → removeSpecial confirm | Release special guest | `POST /api/tables/:id/release-special-guest` |
| `FloorPlan.tsx` modal step: `special` (edit) | Update guest info | `PATCH /api/tables/:id/special-guest` |

---

## Phase 5: Employee Operations

All calls originate in `src/pages/owner/Employees.tsx`.

| Current store call | Backend endpoint |
|---|---|
| `addEmployee()` | `POST /api/employees` |
| `editEmployee()` | `PATCH /api/employees/:id` |
| `deleteEmployee()` | `DELETE /api/employees/:id` |
| `activateEmployee()` | `POST /api/employees/:id/activate` |
| `deactivateEmployee()` | `POST /api/employees/:id/deactivate` |
| `resetEmployeePassword()` | `POST /api/employees/:id/reset-password` |

---

## Phase 6: Real-Time Socket.IO

Implement `src/services/socketManager.ts` using the stub in `src/services/events.ts`.
Mount it inside `StoreProvider` in `StoreContext.tsx`.

### Handler wiring

```typescript
initSocket(token, {
  "reservation:created": (res) => {
    reservationStore.addOrUpdate(res);
    // triggers lastNewReservation → EmployeeLayout toast
    workflowStore.setLastNewReservation(res);
  },
  "reservation:updated": (res) => reservationStore.addOrUpdate(res),
  "reservation:cancelled": (res) => reservationStore.addOrUpdate(res),
  "reservation:assigned": ({ reservation, table }) => {
    reservationStore.addOrUpdate(reservation);
    floorPlanStore.updateTable(table);
  },
  "reservation:unassigned": ({ reservation, table }) => {
    reservationStore.addOrUpdate(reservation);
    floorPlanStore.updateTable(table);
  },
  "reservation:seated": ({ reservation, table }) => {
    reservationStore.addOrUpdate(reservation);
    floorPlanStore.updateTable(table);
  },
  "reservation:completed": ({ reservation, table }) => {
    reservationStore.addOrUpdate(reservation);
    floorPlanStore.updateTable(table);
  },
  "reservation:moved": ({ reservation, oldTable, newTable }) => {
    reservationStore.addOrUpdate(reservation);
    floorPlanStore.updateTable(oldTable);
    floorPlanStore.updateTable(newTable);
  },
  "table:updated": (table) => floorPlanStore.updateTable(table),
  "employee:updated": (emp) => employeeStore.addOrUpdate(emp),
  "employee:deleted": (id) => employeeStore.remove(id),
});
```

### Existing hook (no change needed)

`EmployeeLayout.tsx` already subscribes to `lastNewReservation` via `useWorkflowStore()`.
When `reservation:created` fires, set `lastNewReservation` to trigger the Waiter toast —
**no changes to `EmployeeLayout.tsx` are required.**

---

## Phase 7: Environment Variables

Add to `.env` (never commit values):

```env
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=ws://localhost:8080
```

Add to `.env.example` for documentation:

```env
VITE_API_URL=             # Backend API base URL
VITE_SOCKET_URL=          # WebSocket server URL (same host as API)
```

---

## Phase 8: Files to Remove After Backend Wiring

| File | Remove when |
|---|---|
| `src/services/mockData.ts` | All stores are seeded from API (Phase 2 complete) |
| `src/services/api/*.ts` (stub bodies) | Replace stub `throw new Error()` with real fetch calls |
| `.env.local` / localStorage key references | Auth is fully JWT-based |

> **Do not remove `mockData.ts` types/interfaces** — the `Reservation`, `FloorTable`, `Employee`, and `SpecialGuest` types from that file are used throughout the codebase and should be moved to a shared `src/types/` module rather than deleted.

---

## Checklist

- [ ] Phase 1: Auth wired, localStorage removed, JWT in memory
- [ ] Phase 1: `apiClient.ts` fetch wrapper created
- [ ] Phase 2: App seeds from API on load, `loading` state added
- [ ] Phase 3: All reservation operations use API
- [ ] Phase 4: All table operations use API
- [ ] Phase 5: All employee CRUD uses API
- [ ] Phase 6: Socket.IO connected, `socketManager.ts` implemented
- [ ] Phase 6: All Socket.IO events update local store correctly
- [ ] Phase 7: `.env` / `.env.example` committed (no actual values)
- [ ] Phase 8: `mockData.ts` mock arrays removed; types moved to `src/types/`
- [ ] Final: `tsc --noEmit` passes, production build passes
