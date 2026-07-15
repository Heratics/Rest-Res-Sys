/**
 * API Service: Tables & Floor Plan
 *
 * Typed stub for the future REST API integration.
 * Currently the frontend uses local state (floorPlanStore + reservationOperations.ts).
 *
 * REPLACEMENT STRATEGY:
 *   1. Seed floorTables from tablesApi.listFloorTables() on app load
 *   2. Replace each updateFloorTable() call in reservationOperations.ts with
 *      the corresponding tablesApi call
 *   3. Replace addFloorTable / removeFloorTable / saveFloorLayout in
 *      FloorPlanState with tablesApi calls
 *
 * ─────────────────────────────────────────────────────────────────────
 * ENDPOINTS (to be implemented in backend)
 * ─────────────────────────────────────────────────────────────────────
 *
 *   GET    /api/tables                 → FloorTable[]           (all roles)
 *   POST   /api/tables                 → FloorTable             (Owner only)
 *   PATCH  /api/tables/:id             → FloorTable             (Owner only — edit layout)
 *   DELETE /api/tables/:id             → { success: true }      (Owner only)
 *   POST   /api/tables/layout          → FloorTable[]           (Owner only — batch save positions)
 *
 *   POST   /api/tables/:id/reserve-special-guest  → FloorTable  (Waiter, Owner)
 *   PATCH  /api/tables/:id/special-guest          → FloorTable  (Waiter, Owner)
 *   POST   /api/tables/:id/seat-special-guest     → FloorTable  (Waiter, Owner)
 *   POST   /api/tables/:id/release-special-guest  → FloorTable  (Waiter, Owner)
 *   POST   /api/tables/:id/out-of-service         → FloorTable  (Waiter, Owner)
 *   POST   /api/tables/:id/return-to-service      → FloorTable  (Waiter, Owner)
 *   PATCH  /api/tables/:id/assign-waiter          → FloorTable  (Waiter, Owner)
 *   PATCH  /api/tables/:id/notes                  → FloorTable  (Waiter, Owner)
 */

import type { FloorTable, SpecialGuest } from "@/services/mockData";

export type CreateTableRequest = {
  number: string;
  floor: 1 | 2;
  shape: "round" | "square" | "banquet";
  capacity: number;
  x: number;
  y: number;
};

export type UpdateTableLayoutRequest = {
  number?: string;
  shape?: "round" | "square" | "banquet";
  capacity?: number;
  x?: number;
  y?: number;
  notes?: string;
};

export type ReserveSpecialGuestRequest = Omit<SpecialGuest, "reservedAt">;

export type OutOfServiceRequest = {
  reason: string;
  disabledBy: string;
};

export type AssignWaiterRequest = {
  waiterName: string;
};

export type SaveLayoutRequest = {
  tables: Array<{ id: string; x: number; y: number; number?: string; shape?: string; capacity?: number }>;
};

// ─── Stub implementations (not connected) ────────────────────────────────────

export const tablesApi = {
  listFloorTables: async (): Promise<FloorTable[]> => {
    throw new Error("tablesApi.listFloorTables: backend not yet connected");
  },

  createTable: async (_req: CreateTableRequest): Promise<FloorTable> => {
    throw new Error("tablesApi.createTable: backend not yet connected");
  },

  updateTable: async (_id: string, _req: UpdateTableLayoutRequest): Promise<FloorTable> => {
    throw new Error("tablesApi.updateTable: backend not yet connected");
  },

  deleteTable: async (_id: string): Promise<{ success: true }> => {
    throw new Error("tablesApi.deleteTable: backend not yet connected");
  },

  saveLayout: async (_req: SaveLayoutRequest): Promise<FloorTable[]> => {
    throw new Error("tablesApi.saveLayout: backend not yet connected");
  },

  reserveSpecialGuest: async (_tableId: string, _req: ReserveSpecialGuestRequest): Promise<FloorTable> => {
    throw new Error("tablesApi.reserveSpecialGuest: backend not yet connected");
  },

  updateSpecialGuest: async (_tableId: string, _req: Partial<ReserveSpecialGuestRequest>): Promise<FloorTable> => {
    throw new Error("tablesApi.updateSpecialGuest: backend not yet connected");
  },

  seatSpecialGuest: async (_tableId: string): Promise<FloorTable> => {
    throw new Error("tablesApi.seatSpecialGuest: backend not yet connected");
  },

  releaseSpecialGuest: async (_tableId: string): Promise<FloorTable> => {
    throw new Error("tablesApi.releaseSpecialGuest: backend not yet connected");
  },

  markOutOfService: async (_tableId: string, _req: OutOfServiceRequest): Promise<FloorTable> => {
    throw new Error("tablesApi.markOutOfService: backend not yet connected");
  },

  returnToService: async (_tableId: string): Promise<FloorTable> => {
    throw new Error("tablesApi.returnToService: backend not yet connected");
  },

  assignWaiter: async (_tableId: string, _req: AssignWaiterRequest): Promise<FloorTable> => {
    throw new Error("tablesApi.assignWaiter: backend not yet connected");
  },

  updateNotes: async (_tableId: string, _notes: string): Promise<FloorTable> => {
    throw new Error("tablesApi.updateNotes: backend not yet connected");
  },
};
