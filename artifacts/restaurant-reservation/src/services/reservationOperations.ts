/**
 * Centralized reservation & table operations.
 * All state mutations flow through these functions.
 * When the backend is ready, replace the ops callbacks with API calls
 * without changing any UI components.
 */

import type { Reservation, FloorTable, ReservationStatus, SpecialGuest } from "./mockData";

// ─── Operation interface ──────────────────────────────────────────────────────

export interface ReservationOps {
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  updateFloorTable: (id: string, updates: Partial<FloorTable>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
}

// ─── Reservation Operations ───────────────────────────────────────────────────

/**
 * Assign a reservation to an available table.
 * Table → Waiting. Reservation → Checked In.
 */
export function assignTable(
  reservationId: string,
  tableId: string,
  ops: ReservationOps,
  tableInfo?: { number: string; floor: number }
) {
  const now = new Date().toISOString();
  ops.updateReservation(reservationId, {
    status: "Checked In",
    assignedAt: now,
    ...(tableInfo
      ? { assignedTableId: tableId, assignedTableNumber: tableInfo.number, assignedFloor: tableInfo.floor }
      : {}),
  });
  ops.updateFloorTable(tableId, {
    status: "Waiting",
    reservationId,
    assignedAt: now,
    seatedAt: undefined,
  });
}

/**
 * Mark guests as seated.
 * Table → Occupied. Reservation → Seated.
 */
export function markGuestsSeated(
  reservationId: string,
  tableId: string,
  ops: ReservationOps
) {
  const now = new Date().toISOString();
  ops.updateReservation(reservationId, { status: "Seated", seatedAt: now });
  ops.updateFloorTable(tableId, { status: "Occupied", seatedAt: now });
}

/**
 * Release a table and complete the reservation.
 * Table → Available. Reservation → Completed.
 */
export function completeReservation(
  reservationId: string,
  tableId: string,
  ops: ReservationOps
) {
  const now = new Date().toISOString();
  ops.updateReservation(reservationId, { status: "Completed", completedAt: now });
  ops.updateFloorTable(tableId, {
    status: "Available",
    reservationId: undefined,
    assignedWaiter: undefined,
    assignedAt: undefined,
    seatedAt: undefined,
  });
}

/**
 * Cancel a reservation.
 * Optionally releases an assigned table back to Available.
 */
export function cancelReservation(
  reservationId: string,
  cancelledBy: string,
  ops: ReservationOps,
  tableId?: string
) {
  const now = new Date().toISOString();
  ops.updateReservation(reservationId, {
    status: "Cancelled",
    cancelledAt: now,
    cancelledBy,
  });
  if (tableId) {
    ops.updateFloorTable(tableId, {
      status: "Available",
      reservationId: undefined,
      assignedWaiter: undefined,
      assignedAt: undefined,
      seatedAt: undefined,
    });
  }
}

/**
 * Update editable reservation fields (name, phone, guests, notes).
 * Only allowed for Incoming or Waiting For Guests status.
 */
export function updateReservation(
  reservationId: string,
  updates: Pick<Reservation, "guests" | "specialRequests"> & { customer?: Partial<Reservation["customer"]> },
  ops: ReservationOps
) {
  ops.updateReservation(reservationId, updates as Partial<Reservation>);
}

/**
 * Move a reservation from one table to another.
 * Old table → Available. New table inherits Waiting or Occupied.
 */
export function moveReservation(
  reservationId: string,
  oldTableId: string,
  newTableId: string,
  previousReservationStatus: "Checked In" | "Seated",
  ops: ReservationOps,
  newTableInfo?: { number: string; floor: number }
) {
  const now = new Date().toISOString();
  // Release old table
  ops.updateFloorTable(oldTableId, {
    status: "Available",
    reservationId: undefined,
    assignedWaiter: undefined,
    assignedAt: undefined,
    seatedAt: undefined,
  });
  // Assign new table with preserved state
  if (previousReservationStatus === "Seated") {
    ops.updateFloorTable(newTableId, {
      status: "Occupied",
      reservationId,
      assignedAt: now,
      seatedAt: now,
    });
  } else {
    ops.updateFloorTable(newTableId, {
      status: "Waiting",
      reservationId,
      assignedAt: now,
      seatedAt: undefined,
    });
  }
  // Update reservation's table info
  if (newTableInfo) {
    ops.updateReservation(reservationId, {
      assignedAt: now,
      assignedTableId: newTableId,
      assignedTableNumber: newTableInfo.number,
      assignedFloor: newTableInfo.floor,
    });
  }
  // Reservation status stays the same (Checked In or Seated)
}

// ─── Special Guest Operations ─────────────────────────────────────────────────

/** Reserve a table for a special guest. Does not create a queue reservation. */
export function reserveSpecialGuest(
  tableId: string,
  guestInfo: Omit<SpecialGuest, "reservedAt">,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "Special",
    specialGuest: { ...guestInfo, reservedAt: new Date().toISOString() },
    reservationId: undefined,
  });
}

/** Edit an existing special guest reservation. */
export function updateSpecialGuest(
  tableId: string,
  guestInfo: SpecialGuest,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, { specialGuest: guestInfo });
}

/**
 * Mark a special guest as seated.
 * Table → Occupied. Special guest info is preserved.
 */
export function seatSpecialGuest(tableId: string, ops: ReservationOps) {
  ops.updateFloorTable(tableId, {
    status: "Occupied",
    seatedAt: new Date().toISOString(),
    // specialGuest preserved
  });
}

/**
 * Release a special guest reservation.
 * Table → Available. Special guest info cleared.
 */
export function releaseSpecialGuest(tableId: string, ops: ReservationOps) {
  ops.updateFloorTable(tableId, {
    status: "Available",
    specialGuest: undefined,
    assignedAt: undefined,
    seatedAt: undefined,
  });
}

// ─── Table Status Operations ──────────────────────────────────────────────────

/** Mark a table as out of service. Only allowed when table is Available. */
export function markTableOutOfService(
  tableId: string,
  reason: string,
  disabledBy: string,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "OutOfService",
    outOfService: { reason, disabledBy, disabledAt: new Date().toISOString() },
  });
}

/** Return an out-of-service table to service. */
export function returnTableToService(tableId: string, ops: ReservationOps) {
  ops.updateFloorTable(tableId, {
    status: "Available",
    outOfService: undefined,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build an ops object from store hooks (call inside a component). */
export function buildOps(
  updateReservationStatus: (id: string, status: ReservationStatus) => void,
  updateFloorTable: (id: string, updates: Partial<FloorTable>) => void,
  updateReservationFn: (id: string, updates: Partial<Reservation>) => void
): ReservationOps {
  return {
    updateReservationStatus,
    updateFloorTable,
    updateReservation: updateReservationFn,
  };
}

/** True if a reservation has a table already assigned (Waiting or Seated). */
export function isAssigned(r: Reservation): boolean {
  return r.status === "Checked In" || r.status === "Seated";
}

/** True if a reservation is in the incoming queue (no table yet). */
export function isIncoming(r: Reservation): boolean {
  return r.status === "Pending" || r.status === "Confirmed";
}

/** True if a reservation can still be edited (not yet seated or completed). */
export function isEditable(r: Reservation): boolean {
  return r.status === "Pending" || r.status === "Confirmed" || r.status === "Checked In";
}

/** True if a reservation is in a terminal state. */
export function isTerminal(r: Reservation): boolean {
  return r.status === "Completed" || r.status === "Cancelled";
}
