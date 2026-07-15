import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  Reservation,
  ReservationStatus,
  mockReservations,
  Table,
  mockTables,
  restaurantSettings,
  createReservation,
  Employee,
  mockEmployees,
  FloorTable,
  mockFloorTables,
} from "./mockData";

// ─── Workflow Types ───────────────────────────────────────────────────────────
export interface PendingTableAssignment {
  reservation: Reservation;
  isMove: boolean;
  oldTableId?: string;
  prevReservationStatus?: "Checked In" | "Seated";
}

// ─── Session keys ─────────────────────────────────────────────────────────────
const OWNER_SESSION_KEY = "BOOMCLUB_owner_session";
const EMPLOYEE_SESSION_KEY = "BOOMCLUB_employee_session";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OwnerUser { username: string }

export interface EmployeeUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface OwnerAuthState {
  owner: OwnerUser | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => void;
  logout: () => void;
}

export interface EmployeeAuthState {
  employee: EmployeeUser | null;
  isAuthenticated: boolean;
  /** Returns true on success, false if not found or inactive. */
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

export interface ReservationState {
  reservations: Reservation[];
  getReservation: (id: string) => Reservation | undefined;
  updateStatus: (id: string, status: Reservation["status"]) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  addReservation: (data: Omit<Reservation, "id" | "confirmationNumber" | "createdAt">) => Reservation;
}

export interface EmployeeStoreState {
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "dateAdded">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  activateEmployee: (id: string) => void;
  deactivateEmployee: (id: string) => void;
  deleteEmployee: (id: string) => void;
  resetEmployeePassword: (id: string, newPassword: string) => void;
}

export type Settings = typeof restaurantSettings;

export interface RestaurantState {
  settings: Settings;
  tables: Table[];
  updateSettings: (updates: Partial<Settings>) => void;
  updateTable: (id: string, status: Table["status"]) => void;
}

export interface FloorPlanState {
  floorTables: FloorTable[];
  updateFloorTable: (id: string, updates: Partial<FloorTable>) => void;
  addFloorTable: (table: Omit<FloorTable, "id">) => void;
  removeFloorTable: (id: string) => void;
  saveFloorLayout: (tables: FloorTable[]) => void;
}

export interface WorkflowState {
  pendingTableAssignment: PendingTableAssignment | null;
  setPendingTableAssignment: (v: PendingTableAssignment | null) => void;
  lastNewReservation: Reservation | null;
  clearLastNewReservation: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const StoreContext = createContext<{
  ownerAuth: OwnerAuthState;
  employeeAuth: EmployeeAuthState;
  reservationStore: ReservationState;
  employeeStore: EmployeeStoreState;
  restaurantStore: RestaurantState;
  floorPlanStore: FloorPlanState;
  workflowState: WorkflowState;
} | null>(null);

// ─── Session helpers ──────────────────────────────────────────────────────────
function loadSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

function saveSession<T>(key: string, value: T | null) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<OwnerUser | null>(() => loadSession<OwnerUser>(OWNER_SESSION_KEY));
  const [employeeUser, setEmployeeUser] = useState<EmployeeUser | null>(() =>
    loadSession<EmployeeUser>(EMPLOYEE_SESSION_KEY)
  );

  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [settings, setSettings] = useState<Settings>(restaurantSettings);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [floorTables, setFloorTables] = useState<FloorTable[]>(mockFloorTables);
  const [pendingTableAssignment, setPendingTableAssignment] = useState<PendingTableAssignment | null>(null);
  const [lastNewReservation, setLastNewReservation] = useState<Reservation | null>(null);

  useEffect(() => { saveSession(OWNER_SESSION_KEY, owner); }, [owner]);
  useEffect(() => { saveSession(EMPLOYEE_SESSION_KEY, employeeUser); }, [employeeUser]);

  // ── Owner auth ──
  const ownerAuth: OwnerAuthState = {
    owner,
    isAuthenticated: !!owner,
    login: (username, _pass) => setOwner({ username }),
    logout: () => setOwner(null),
  };

  // ── Employee auth ──
  // Login ONLY succeeds for known Active employees.
  // No generic fallback — inactive or unknown users are rejected.
  const employeeAuth: EmployeeAuthState = {
    employee: employeeUser,
    isAuthenticated: !!employeeUser,
    login: (username, _pass) => {
      const found = employees.find((e) => e.username === username);
      if (!found) {
        return { success: false, error: "No employee found with that username." };
      }
      if (found.status === "Inactive") {
        return { success: false, error: "This account is inactive. Contact your manager." };
      }
      setEmployeeUser({ id: found.id, name: found.name, username: found.username, role: found.role });
      return { success: true };
    },
    logout: () => setEmployeeUser(null),
  };

  // ── Reservations ──
  const reservationStore: ReservationState = {
    reservations,
    getReservation: (id) => reservations.find((r) => r.id === id),
    updateStatus: (id, status) =>
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r)),
    updateReservation: (id, updates) =>
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r)),
    addReservation: (data) => {
      const newRes = createReservation(data);
      setReservations((prev) => [newRes, ...prev]);
      setLastNewReservation(newRes);
      return newRes;
    },
  };

  // ── Employee store ──
  const employeeStore: EmployeeStoreState = {
    employees,
    addEmployee: (emp) => {
      const newEmp: Employee = {
        ...emp,
        id: `e${Math.floor(Math.random() * 10000)}`,
        dateAdded: new Date().toISOString().split("T")[0],
      };
      setEmployees((prev) => [newEmp, ...prev]);
    },
    updateEmployee: (id, updates) =>
      setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e)),
    removeEmployee: (id) =>
      setEmployees((prev) => prev.filter((e) => e.id !== id)),
    activateEmployee: (id) =>
      setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status: "Active" } : e)),
    deactivateEmployee: (id) =>
      setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status: "Inactive" } : e)),
    deleteEmployee: (id) =>
      setEmployees((prev) => prev.filter((e) => e.id !== id)),
    resetEmployeePassword: (id, newPassword) =>
      setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, password: newPassword } : e)),
  };

  // ── Restaurant ──
  const restaurantStore: RestaurantState = {
    settings,
    tables,
    updateSettings: (updates) => setSettings((prev) => ({ ...prev, ...updates })),
    updateTable: (id, status) =>
      setTables((prev) => prev.map((t) => t.id === id ? { ...t, status } : t)),
  };

  // ── Floor Plan ──
  const floorPlanStore: FloorPlanState = {
    floorTables,
    updateFloorTable: (id, updates) =>
      setFloorTables((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t)),
    addFloorTable: (table) =>
      setFloorTables((prev) => [...prev, { ...table, id: `ft${table.floor}_${Date.now()}` }]),
    removeFloorTable: (id) =>
      setFloorTables((prev) => prev.filter((t) => t.id !== id)),
    saveFloorLayout: (tables) => setFloorTables(tables),
  };

  // ── Workflow ──
  const workflowState: WorkflowState = {
    pendingTableAssignment,
    setPendingTableAssignment,
    lastNewReservation,
    clearLastNewReservation: () => setLastNewReservation(null),
  };

  return (
    <StoreContext.Provider
      value={{ ownerAuth, employeeAuth, reservationStore, employeeStore, restaurantStore, floorPlanStore, workflowState }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Missing StoreProvider");
  return ctx;
}

export const useOwnerAuth       = () => useStore().ownerAuth;
export const useEmployeeAuth    = () => useStore().employeeAuth;
export const useReservationStore = () => useStore().reservationStore;
export const useEmployeeStore   = () => useStore().employeeStore;
export const useRestaurantStore = () => useStore().restaurantStore;
export const useFloorPlanStore  = () => useStore().floorPlanStore;
export const useWorkflowStore   = () => useStore().workflowState;
