/**
 * Centralized reservation operations.
 * All state mutations flow through these functions.
 * When the backend is ready, replace the ops callbacks with API calls
 * without changing any UI components.
 */

import type { Reservation, FloorTable, ReservationStatus } from "./mockData";

// ─── Operation interface ──────────────────────────────────────────────────────

export interface ReservationOps {
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  updateFloorTable: (id: string, updates: Partial<FloorTable>) => void;
}

// ─── Operations ───────────────────────────────────────────────────────────────

/** Assign a reservation to an available table. Table becomes Waiting. */
export function assignTable(
  reservationId: string,
  tableId: string,
  ops: ReservationOps
) {
  ops.updateReservationStatus(reservationId, "Checked In");
  ops.updateFloorTable(tableId, {
    status: "Waiting",
    reservationId,
    assignedAt: new Date().toISOString(),
    seatedAt: undefined,
  });
}

/** Mark guests as seated. Table becomes Occupied. */
export function markGuestsSeated(
  reservationId: string,
  tableId: string,
  ops: ReservationOps
) {
  ops.updateReservationStatus(reservationId, "Seated");
  ops.updateFloorTable(tableId, {
    status: "Occupied",
    seatedAt: new Date().toISOString(),
  });
}

/** Release a table and complete the reservation. */
export function completeReservation(
  reservationId: string,
  tableId: string,
  ops: ReservationOps
) {
  ops.updateReservationStatus(reservationId, "Completed");
  ops.updateFloorTable(tableId, {
    status: "Available",
    reservationId: undefined,
    assignedWaiter: undefined,
    assignedAt: undefined,
    seatedAt: undefined,
  });
}

/** Cancel a reservation (does not touch the table). */
export function cancelReservation(
  reservationId: string,
  ops: Pick<ReservationOps, "updateReservationStatus">
) {
  ops.updateReservationStatus(reservationId, "Cancelled");
}

/**
 * Move a reservation from one table to another.
 * The new table inherits the same "waiting/occupied" state.
 */
export function moveReservation(
  reservationId: string,
  oldTableId: string,
  newTableId: string,
  previousReservationStatus: "Checked In" | "Seated",
  ops: ReservationOps
) {
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
      assignedAt: new Date().toISOString(),
      seatedAt: new Date().toISOString(),
    });
  } else {
    ops.updateFloorTable(newTableId, {
      status: "Waiting",
      reservationId,
      assignedAt: new Date().toISOString(),
      seatedAt: undefined,
    });
  }
  // Reservation status stays the same (Checked In or Seated)
}

/** Reserve a table for a special guest. */
export function reserveSpecialGuest(
  tableId: string,
  guestInfo: { name: string; reason: string; reservedBy: string },
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "Special",
    specialGuest: { ...guestInfo, reservedAt: new Date().toISOString() },
    reservationId: undefined,
  });
}

/** Release a special guest reservation from a table. */
export function releaseSpecialGuest(
  tableId: string,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "Available",
    specialGuest: undefined,
    assignedAt: undefined,
    seatedAt: undefined,
  });
}

/** Mark a table as out of service. */
export function markTableOutOfService(
  tableId: string,
  reason: string,
  disabledBy: string,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "OutOfService",
    outOfService: {
      reason,
      disabledBy,
      disabledAt: new Date().toISOString(),
    },
  });
}

/** Return a table to service. */
export function returnTableToService(
  tableId: string,
  ops: ReservationOps
) {
  ops.updateFloorTable(tableId, {
    status: "Available",
    outOfService: undefined,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build an ops object from store hooks (call inside a component). */
export function buildOps(
  updateReservationStatus: (id: string, status: ReservationStatus) => void,
  updateFloorTable: (id: string, updates: Partial<FloorTable>) => void
): ReservationOps {
  return { updateReservationStatus, updateFloorTable };
}

/** True if a reservation has a table already assigned. */
export function isAssigned(r: Reservation): boolean {
  return r.status === "Checked In" || r.status === "Seated";
}

/** True if a reservation is in the incoming queue (no table yet). */
export function isIncoming(r: Reservation): boolean {
  return r.status === "Pending" || r.status === "Confirmed";
}
