/**
 * Real-Time Event Types (Socket.IO)
 *
 * This file defines the complete set of Socket.IO events the backend must
 * broadcast and the frontend will listen for. The frontend currently uses
 * shared React state (lastNewReservation, StoreContext) to simulate real-time
 * updates — these hooks are already in place and will be wired to Socket.IO
 * events when the backend is ready.
 *
 * CURRENT STATE (mock):
 *   When Doorman creates a reservation → StoreContext.addReservation() sets
 *   lastNewReservation → EmployeeLayout.tsx shows toast to Waiter.
 *
 * FUTURE STATE (Socket.IO):
 *   Backend emits reservation:created → SocketManager calls
 *   reservationStore.updateReservation() or triggers a full reload →
 *   existing UI components react automatically.
 *
 * HOW TO INTEGRATE:
 *   1. Install socket.io-client:  pnpm add socket.io-client
 *   2. Create src/services/socketManager.ts (see stub below)
 *   3. Mount it inside StoreProvider in StoreContext.tsx
 *   4. Dispatch incoming events to the appropriate store update functions
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVENT CATALOG
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Reservation, FloorTable, Employee } from "./mockData";

// ── Server → Client events (frontend listens) ─────────────────────────────────

export interface ServerToClientEvents {
  /**
   * Fired when a new reservation is created by any session.
   * Frontend: add to reservations array; Waiter sees toast notification.
   */
  "reservation:created": (reservation: Reservation) => void;

  /**
   * Fired when reservation details are updated (name, phone, guests, notes).
   * Frontend: replace reservation in array by id.
   */
  "reservation:updated": (reservation: Reservation) => void;

  /**
   * Fired when a reservation is cancelled.
   * Frontend: update reservation status; remove from active lists.
   */
  "reservation:cancelled": (reservation: Reservation) => void;

  /**
   * Fired when a reservation is assigned to a table (Checked In).
   * Frontend: update reservation + corresponding FloorTable.
   */
  "reservation:assigned": (payload: { reservation: Reservation; table: FloorTable }) => void;

  /**
   * Fired when a reservation is unassigned (assignment cancelled, back to Pending).
   * Frontend: update reservation + corresponding FloorTable.
   */
  "reservation:unassigned": (payload: { reservation: Reservation; table: FloorTable }) => void;

  /**
   * Fired when guests are marked as seated (Seated).
   * Frontend: update reservation + FloorTable.
   */
  "reservation:seated": (payload: { reservation: Reservation; table: FloorTable }) => void;

  /**
   * Fired when a reservation is completed and table released.
   * Frontend: update reservation + FloorTable.
   */
  "reservation:completed": (payload: { reservation: Reservation; table: FloorTable }) => void;

  /**
   * Fired when a reservation is moved from one table to another.
   * Frontend: update reservation + both FloorTables.
   */
  "reservation:moved": (payload: {
    reservation: Reservation;
    oldTable: FloorTable;
    newTable: FloorTable;
  }) => void;

  /**
   * Fired when any floor table property changes (status, notes, waiter, OOS, special guest).
   * Frontend: replace table in floorTables array by id.
   */
  "table:updated": (table: FloorTable) => void;

  /**
   * Fired when an employee is created, updated, activated, deactivated, or deleted.
   * Frontend: sync employees array.
   */
  "employee:updated": (employee: Employee) => void;

  /**
   * Fired when an employee is deleted.
   * Frontend: remove from employees array.
   */
  "employee:deleted": (employeeId: string) => void;
}

// ── Client → Server events (frontend emits) ───────────────────────────────────
// These are not required for the MVP — all mutations flow through REST API calls.
// Socket.IO is receive-only from the frontend's perspective.

export interface ClientToServerEvents {
  /** Join a room scoped to the restaurant (for multi-tenant support). */
  "join:restaurant": (restaurantId: string) => void;
}

// ─── Socket Manager Stub ──────────────────────────────────────────────────────
// When the backend is ready, create src/services/socketManager.ts based on
// this template. Import and mount it in StoreContext.tsx StoreProvider.

/*
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./events";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function initSocket(
  token: string,
  handlers: Partial<ServerToClientEvents>
) {
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("[Socket] connected");
  });

  (Object.entries(handlers) as [keyof ServerToClientEvents, Function][]).forEach(
    ([event, handler]) => socket!.on(event as any, handler as any)
  );
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
*/
