/**
 * API Service: Employees
 *
 * Typed stub for the future REST API integration.
 * Currently the frontend uses local state (EmployeeStoreState in StoreContext.tsx).
 *
 * REPLACEMENT STRATEGY:
 *   1. Seed employees from employeesApi.list() on app load
 *   2. Replace each mutation in EmployeeStoreState with the corresponding API call
 *   3. Employee login authentication is handled by authApi (not this module)
 *
 * ─────────────────────────────────────────────────────────────────────
 * ENDPOINTS (to be implemented in backend)
 * ─────────────────────────────────────────────────────────────────────
 *
 *   GET    /api/employees                      → Employee[]      (Owner only)
 *   POST   /api/employees                      → Employee        (Owner only)
 *   PATCH  /api/employees/:id                  → Employee        (Owner only)
 *   DELETE /api/employees/:id                  → { success: true } (Owner only)
 *   POST   /api/employees/:id/activate         → Employee        (Owner only)
 *   POST   /api/employees/:id/deactivate       → Employee        (Owner only)
 *   POST   /api/employees/:id/reset-password   → { success: true } (Owner only)
 */

import type { Employee, EmployeeRole, EmployeeStatus } from "@/services/mockData";

export type CreateEmployeeRequest = {
  name: string;
  username: string;
  phone: string;
  role: Exclude<EmployeeRole, "Owner">; // Only Doorman and Waiter can be created
  status: EmployeeStatus;
  password: string; // hashed server-side
};

export type UpdateEmployeeRequest = {
  name?: string;
  username?: string;
  phone?: string;
  role?: Exclude<EmployeeRole, "Owner">;
  status?: EmployeeStatus;
};

export type ResetPasswordRequest = {
  newPassword: string; // hashed server-side
};

// ─── Stub implementations (not connected) ────────────────────────────────────

export const employeesApi = {
  list: async (): Promise<Employee[]> => {
    throw new Error("employeesApi.list: backend not yet connected");
  },

  create: async (_req: CreateEmployeeRequest): Promise<Employee> => {
    throw new Error("employeesApi.create: backend not yet connected");
  },

  update: async (_id: string, _req: UpdateEmployeeRequest): Promise<Employee> => {
    throw new Error("employeesApi.update: backend not yet connected");
  },

  remove: async (_id: string): Promise<{ success: true }> => {
    throw new Error("employeesApi.remove: backend not yet connected");
  },

  activate: async (_id: string): Promise<Employee> => {
    throw new Error("employeesApi.activate: backend not yet connected");
  },

  deactivate: async (_id: string): Promise<Employee> => {
    throw new Error("employeesApi.deactivate: backend not yet connected");
  },

  resetPassword: async (_id: string, _req: ResetPasswordRequest): Promise<{ success: true }> => {
    throw new Error("employeesApi.resetPassword: backend not yet connected");
  },
};
