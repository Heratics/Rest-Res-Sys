/**
 * API Service: Reservations
 *
 * Typed stub for the future REST API integration.
 * Currently the frontend uses local state (reservationOperations.ts + StoreContext.tsx).
 *
 * REPLACEMENT STRATEGY:
 *   1. Replace addReservation() in StoreContext with reservationsApi.create()
 *   2. Replace each op in reservationOperations.ts with the corresponding API call
 *   3. Seed initial state from reservationsApi.list() on app load
 *
 * ─────────────────────────────────────────────────────────────────────
 * ENDPOINTS (to be implemented in backend)
 * ─────────────────────────────────────────────────────────────────────
 *
 *   GET    /api/reservations           → ReservationListResponse
 *   POST   /api/reservations           → ReservationResponse        (Doorman, Owner)
 *   GET    /api/reservations/:id       → ReservationResponse
 *   PATCH  /api/reservations/:id       → ReservationResponse        (Doorman, Owner)
 *   POST   /api/reservations/:id/cancel           → ReservationResponse  (Doorman, Owner)
 *   POST   /api/reservations/:id/assign-table      → ReservationResponse  (Waiter, Owner)
 *   POST   /api/reservations/:id/unassign-table    → ReservationResponse  (Waiter, Owner)
 *   POST   /api/reservations/:id/seat              → ReservationResponse  (Waiter, Owner)
 *   POST   /api/reservations/:id/complete          → ReservationResponse  (Waiter, Owner)
 *   POST   /api/reservations/:id/move-table        → ReservationResponse  (Waiter, Owner)
 */

import type { Reservation } from "@/services/mockData";

export type CreateReservationRequest = {
  customer: { name: string; phone: string };
  guests: number;
  specialRequests?: string;
};

export type UpdateReservationRequest = {
  customer?: { name?: string; phone?: string };
  guests?: number;
  specialRequests?: string;
};

export type CancelReservationRequest = {
  cancelledBy: string;
};

export type AssignTableRequest = {
  tableId: string;
};

export type MoveTableRequest = {
  newTableId: string;
};

export type ReservationResponse = Reservation;
export type ReservationListResponse = Reservation[];

// ─── Stub implementations (not connected) ────────────────────────────────────

export const reservationsApi = {
  list: async (): Promise<ReservationListResponse> => {
    throw new Error("reservationsApi.list: backend not yet connected");
  },

  get: async (_id: string): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.get: backend not yet connected");
  },

  create: async (_req: CreateReservationRequest): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.create: backend not yet connected");
  },

  update: async (_id: string, _req: UpdateReservationRequest): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.update: backend not yet connected");
  },

  cancel: async (_id: string, _req: CancelReservationRequest): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.cancel: backend not yet connected");
  },

  assignTable: async (_id: string, _req: AssignTableRequest): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.assignTable: backend not yet connected");
  },

  unassignTable: async (_id: string): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.unassignTable: backend not yet connected");
  },

  seat: async (_id: string): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.seat: backend not yet connected");
  },

  complete: async (_id: string): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.complete: backend not yet connected");
  },

  moveTable: async (_id: string, _req: MoveTableRequest): Promise<ReservationResponse> => {
    throw new Error("reservationsApi.moveTable: backend not yet connected");
  },
};
