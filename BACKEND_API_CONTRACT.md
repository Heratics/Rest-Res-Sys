# BOOMCLUB — Backend API Contract

**Version:** 1.0 (pre-backend, frontend prototype complete)
**Date:** 2026-07-15
**Frontend:** React + Vite + Wouter (pnpm monorepo, `artifacts/restaurant-reservation`)
**Backend target:** Node.js + Express + MySQL

---

## Table of Contents

1. [Authentication Model](#1-authentication-model)
2. [Authorization Roles](#2-authorization-roles)
3. [Base URL & Headers](#3-base-url--headers)
4. [Error Format](#4-error-format)
5. [Authentication Endpoints](#5-authentication-endpoints)
6. [Reservations Endpoints](#6-reservations-endpoints)
7. [Tables (Floor Plan) Endpoints](#7-tables-floor-plan-endpoints)
8. [Employees Endpoints](#8-employees-endpoints)
9. [Dashboard Endpoint (optional)](#9-dashboard-endpoint-optional)
10. [WebSocket Events](#10-websocket-events)
11. [Data Models](#11-data-models)
12. [Business Rules](#12-business-rules)

---

## 1. Authentication Model

Two separate session types:

| Session Type | Login Route | Token Scope |
|---|---|---|
| **Owner** | `POST /api/auth/owner/login` | Full access |
| **Employee** | `POST /api/auth/employee/login` | Role-scoped (Doorman / Waiter) |

- JWTs are issued on login and must be sent as `Authorization: Bearer <token>` on all protected endpoints.
- Tokens should expire after **8 hours** (a nightclub shift). No refresh token is needed for MVP.
- The frontend stores tokens **in memory only** (not localStorage) once wired to the real backend.

---

## 2. Authorization Roles

| Role | Value | Description |
|---|---|---|
| `"Owner"` | Owner JWT | Full system access — employees, reservations, floor plan |
| `"Doorman"` | Employee JWT | Create + cancel reservations; view floor plan (read-only) |
| `"Waiter"` | Employee JWT | Manage table assignments, special guests, OOS; no new reservations |

> **Note:** The Owner portal uses a separate login and JWT from the Employee portal.
> A single Employee JWT carries the `role` field; the backend enforces access per endpoint.

---

## 3. Base URL & Headers

```
Base URL (development): http://localhost:8080
Base URL (production):  https://<domain>/api
```

All requests require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

---

## 4. Error Format

All errors return a consistent JSON body:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

Standard error codes:

| Code | HTTP Status | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `CONFLICT` | 409 | Business rule violation (e.g. table already occupied) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 5. Authentication Endpoints

### POST /api/auth/owner/login
Login as owner (any credentials accepted in dev, env-config in prod).

**Body:**
```json
{ "username": "string", "password": "string" }
```

**Response 200:**
```json
{ "token": "jwt_string", "user": { "username": "string" } }
```

**Errors:** `401 UNAUTHORIZED`

---

### POST /api/auth/employee/login
Login as a staff member. Validates against `employees` table.

**Body:**
```json
{ "username": "string", "password": "string" }
```

**Response 200:**
```json
{
  "token": "jwt_string",
  "employee": {
    "id": "string",
    "name": "string",
    "username": "string",
    "role": "Doorman | Waiter"
  }
}
```

**Errors:**
- `401 INVALID_CREDENTIALS` — username not found or wrong password
- `401 ACCOUNT_INACTIVE` — employee exists but is deactivated

---

### GET /api/auth/me
Return the currently authenticated session.

**Response 200:**
```json
{
  "type": "owner | employee",
  "user": { /* OwnerUser or Employee */ }
}
```

---

### POST /api/auth/logout
Invalidate the current token (server-side blacklist or short-lived tokens).

**Response 200:** `{ "success": true }`

---

## 6. Reservations Endpoints

All endpoints require authentication. Role restrictions noted per endpoint.

### GET /api/reservations
Return all reservations (newest first).

**Roles:** Owner, Doorman, Waiter
**Response 200:** `Reservation[]`

---

### POST /api/reservations
Create a new reservation (adds to the Pending queue).

**Roles:** Owner, Doorman

**Body:**
```json
{
  "customer": { "name": "string", "phone": "string" },
  "guests": 2,
  "specialRequests": "optional string"
}
```

**Response 201:** `Reservation`

**Side effects:**
- Emits `reservation:created` via WebSocket to all connected sessions.

---

### GET /api/reservations/:id
Get a single reservation.

**Roles:** Owner, Doorman, Waiter
**Response 200:** `Reservation`

---

### PATCH /api/reservations/:id
Update editable fields (name, phone, guests, specialRequests).
Only allowed for `Pending` and `Confirmed` reservations.

**Roles:** Owner, Doorman

**Body (all optional):**
```json
{
  "customer": { "name": "string", "phone": "string" },
  "guests": 2,
  "specialRequests": "string"
}
```

**Response 200:** `Reservation`
**Errors:** `409 CONFLICT` if reservation is in a non-editable status.

---

### POST /api/reservations/:id/cancel
Cancel a reservation. Sets `cancelledAt` and `cancelledBy`. If a table is assigned (status `Checked In`), releases the table back to `Available`.

**Roles:** Owner, Doorman

**Body:**
```json
{ "cancelledBy": "string" }
```

**Response 200:** `Reservation`

**Side effects:**
- Emits `reservation:cancelled`.
- Emits `table:updated` if table was released.

---

### POST /api/reservations/:id/assign-table
Assign a floor table to a reservation. Sets reservation to `Checked In`, table to `Waiting`.

**Roles:** Owner, Waiter

**Body:**
```json
{ "tableId": "string" }
```

**Response 200:** `Reservation`

**Errors:**
- `409 CONFLICT` if table is not `Available`.
- `409 CONFLICT` if reservation is not in `Pending` or `Confirmed`.

**Side effects:**
- Emits `reservation:assigned` with updated reservation + table.

---

### POST /api/reservations/:id/unassign-table
Cancel a table assignment. Returns reservation to `Pending`, table to `Available`.

**Roles:** Owner, Waiter

**Response 200:** `Reservation`

**Errors:** `409 CONFLICT` if reservation is not `Checked In`.

**Side effects:**
- Emits `reservation:unassigned` with updated reservation + table.

---

### POST /api/reservations/:id/seat
Mark guests as seated. Sets reservation to `Seated`, table to `Occupied`.

**Roles:** Owner, Waiter

**Response 200:** `Reservation`

**Errors:** `409 CONFLICT` if reservation is not `Checked In`.

**Side effects:**
- Emits `reservation:seated`.

---

### POST /api/reservations/:id/complete
Mark reservation as complete. Sets reservation to `Completed`, table to `Available`.

**Roles:** Owner, Waiter

**Response 200:** `Reservation`

**Errors:** `409 CONFLICT` if reservation is not `Seated`.

**Side effects:**
- Emits `reservation:completed`.

---

### POST /api/reservations/:id/move-table
Move reservation to a different table. Old table → `Available`, new table → `Occupied`.

**Roles:** Owner, Waiter

**Body:**
```json
{ "newTableId": "string" }
```

**Response 200:** `Reservation`

**Errors:** `409 CONFLICT` if new table is not `Available` or reservation is not `Seated`.

**Side effects:**
- Emits `reservation:moved` with both old and new table states.

---

## 7. Tables (Floor Plan) Endpoints

### GET /api/tables
Return all floor tables for both floors.

**Roles:** Owner, Doorman, Waiter
**Response 200:** `FloorTable[]`

---

### POST /api/tables
Create a new floor table (layout editing).

**Roles:** Owner only

**Body:**
```json
{
  "number": "A1",
  "floor": 1,
  "shape": "round | square | banquet",
  "capacity": 4,
  "x": 150,
  "y": 200
}
```

**Response 201:** `FloorTable`

---

### PATCH /api/tables/:id
Update table layout properties (number, shape, capacity, position, notes).

**Roles:** Owner only (layout properties); Owner + Waiter (notes only)

**Body (all optional):**
```json
{
  "number": "A1",
  "shape": "round | square | banquet",
  "capacity": 4,
  "x": 150,
  "y": 200,
  "notes": "string"
}
```

**Response 200:** `FloorTable`

---

### DELETE /api/tables/:id
Remove a floor table. Must be `Available` with no active reservation.

**Roles:** Owner only

**Response 200:** `{ "success": true }`

**Errors:** `409 CONFLICT` if table is not `Available`.

---

### POST /api/tables/layout
Batch-save table positions after drag-and-drop layout editing.

**Roles:** Owner only

**Body:**
```json
{
  "tables": [
    { "id": "string", "x": 150, "y": 200 }
  ]
}
```

**Response 200:** `FloorTable[]`

---

### POST /api/tables/:id/reserve-special-guest
Reserve a table for a special guest (no reservation record created).

**Roles:** Owner, Waiter

**Body:**
```json
{
  "name": "string",
  "phone": "optional string",
  "notes": "optional string"
}
```

**Response 200:** `FloorTable`

---

### PATCH /api/tables/:id/special-guest
Update special guest details.

**Roles:** Owner, Waiter

**Body:** Same as reserve body (all fields optional).
**Response 200:** `FloorTable`

---

### POST /api/tables/:id/seat-special-guest
Mark special guest as seated. Table → `Occupied`. Special guest info preserved.

**Roles:** Owner, Waiter
**Response 200:** `FloorTable`

---

### POST /api/tables/:id/release-special-guest
Release a special guest reservation. Table → `Available`.

**Roles:** Owner, Waiter
**Response 200:** `FloorTable`

---

### POST /api/tables/:id/out-of-service
Mark table as out of service.

**Roles:** Owner, Waiter

**Body:**
```json
{ "reason": "string", "disabledBy": "string" }
```

**Response 200:** `FloorTable`

---

### POST /api/tables/:id/return-to-service
Return table to `Available` from out-of-service.

**Roles:** Owner, Waiter
**Response 200:** `FloorTable`

---

### PATCH /api/tables/:id/notes
Update notes on a table without changing its status.

**Roles:** Owner, Waiter

**Body:** `{ "notes": "string" }`
**Response 200:** `FloorTable`

---

## 8. Employees Endpoints

### GET /api/employees
Return all employees.

**Roles:** Owner only
**Response 200:** `Employee[]` (passwords never returned)

---

### POST /api/employees
Create a new employee (Doorman or Waiter — Owner role cannot be created via API).

**Roles:** Owner only

**Body:**
```json
{
  "name": "string",
  "username": "string",
  "phone": "string",
  "role": "Doorman | Waiter",
  "status": "Active | Inactive",
  "password": "string"
}
```

**Response 201:** `Employee` (no password field)

**Errors:** `409 CONFLICT` if username is already taken.

---

### PATCH /api/employees/:id
Update employee profile. Owner role employees cannot be modified.

**Roles:** Owner only

**Body (all optional):**
```json
{
  "name": "string",
  "username": "string",
  "phone": "string",
  "role": "Doorman | Waiter",
  "status": "Active | Inactive"
}
```

**Response 200:** `Employee`

---

### DELETE /api/employees/:id
Delete an employee. Cannot delete Owner role.

**Roles:** Owner only
**Response 200:** `{ "success": true }`

---

### POST /api/employees/:id/activate
Set employee status to `Active`.

**Roles:** Owner only
**Response 200:** `Employee`

---

### POST /api/employees/:id/deactivate
Set employee status to `Inactive`.

**Roles:** Owner only
**Response 200:** `Employee`

---

### POST /api/employees/:id/reset-password
Reset employee password (hashed server-side).

**Roles:** Owner only

**Body:** `{ "newPassword": "string" }`
**Response 200:** `{ "success": true }`

---

## 9. Dashboard Endpoint (Optional)

### GET /api/dashboard/summary
Pre-aggregated dashboard statistics. Optional — the frontend computes these
client-side from already-loaded reservation + table data. Only implement if
two round-trips on initial load are a performance concern.

**Roles:** Owner only

**Response 200:**
```json
{
  "reservations": {
    "incoming": 3,
    "waiting": 2,
    "seated": 5,
    "completed": 12,
    "cancelled": 1
  },
  "tables": {
    "available": 8,
    "waiting": 2,
    "occupied": 5,
    "special": 1,
    "outOfService": 0,
    "total": 16
  }
}
```

---

## 10. WebSocket Events

The backend must broadcast real-time events via Socket.IO. All connected
frontend sessions subscribe to events scoped to the restaurant.

### Connection

```
ws://<host>/socket.io
```

Client connects with `auth: { token: "<jwt>" }`. On connection, the server
adds the socket to room `restaurant:<id>`.

### Server → Client Events

| Event | Payload | Trigger |
|---|---|---|
| `reservation:created` | `Reservation` | New reservation added |
| `reservation:updated` | `Reservation` | Reservation details edited |
| `reservation:cancelled` | `Reservation` | Reservation cancelled |
| `reservation:assigned` | `{ reservation, table }` | Table assigned (→ Checked In) |
| `reservation:unassigned` | `{ reservation, table }` | Table assignment cancelled |
| `reservation:seated` | `{ reservation, table }` | Guests seated |
| `reservation:completed` | `{ reservation, table }` | Reservation completed |
| `reservation:moved` | `{ reservation, oldTable, newTable }` | Table moved |
| `table:updated` | `FloorTable` | Any table property changed |
| `employee:updated` | `Employee` | Employee created/updated/activated |
| `employee:deleted` | `employeeId: string` | Employee deleted |

---

## 11. Data Models

### Reservation

```typescript
interface Reservation {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  guests: number;
  specialRequests?: string;
  status: "Pending" | "Confirmed" | "Checked In" | "Seated" | "Completed" | "Cancelled";
  createdAt: string;        // ISO 8601
  assignedAt?: string;
  seatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  assignedTableId?: string;
  assignedTableNumber?: string;
  assignedFloor?: number;
}
```

### FloorTable

```typescript
interface FloorTable {
  id: string;
  number: string;
  floor: 1 | 2;
  shape: "round" | "square" | "banquet";
  capacity: number;
  x: number;                // canvas position
  y: number;
  status: "Available" | "Waiting" | "Occupied" | "OutOfService";
  reservationId?: string;
  assignedWaiter?: string;
  assignedAt?: string;
  seatedAt?: string;
  notes?: string;
  outOfService?: {
    reason: string;
    disabledAt: string;
    disabledBy: string;
  };
  specialGuest?: {
    name: string;
    phone?: string;
    notes?: string;
    reservedAt: string;
  };
}
```

### Employee

```typescript
interface Employee {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "Owner" | "Doorman" | "Waiter";
  status: "Active" | "Inactive";
  // password: never returned by API — stored hashed in DB
}
```

---

## 12. Business Rules

These rules must be enforced by the backend (not only the frontend):

1. **Status transitions** — Reservations follow a strict state machine:
   - `Pending` → `Confirmed` (future use), `Checked In` (assign table), `Cancelled`
   - `Confirmed` → `Checked In` (assign table), `Cancelled`
   - `Checked In` → `Pending` (unassign table), `Seated`, `Cancelled`
   - `Seated` → `Completed`, `Cancelled`
   - `Completed` / `Cancelled` → terminal (no further transitions)

2. **Table assignment** — A table must be `Available` before it can be assigned.

3. **Table release on cancel** — Cancelling a `Checked In` reservation must atomically release the assigned table back to `Available`.

4. **OOS restriction** — An `OutOfService` table cannot be assigned, used for special guests, or seated — only returned to service.

5. **Special guest isolation** — Special guest reservations do not create a `Reservation` record. They are stored entirely on the `FloorTable`. `specialGuest` info must be preserved when the table transitions from `Waiting` (reserved) to `Occupied` (seated).

6. **Owner account protection** — Employees with `role: "Owner"` cannot be modified, deactivated, or deleted via the API.

7. **Unique usernames** — Employee usernames must be unique across the `employees` table.

8. **Editable statuses** — Only `Pending` and `Confirmed` reservations can have their customer details or guest count edited.
