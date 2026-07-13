import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  Reservation,
  mockReservations,
  Table,
  mockTables,
  restaurantSettings,
  createReservation,
  Employee,
  mockEmployees,
} from "./mockData";

// ─── Session keys ───────────────────────────────────────────────────────────
const CUSTOMER_SESSION_KEY = "aurum_mock_session";
const OWNER_SESSION_KEY = "aurum_owner_session";
const EMPLOYEE_SESSION_KEY = "aurum_employee_session";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  phone: string;
  name: string;
}

export interface OwnerUser {
  username: string;
}

export interface EmployeeUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (phone: string, pass: string) => void;
  register: (name: string, phone: string, pass: string) => void;
  logout: () => void;
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
  login: (username: string, pass: string) => void;
  logout: () => void;
}

export interface ReservationState {
  reservations: Reservation[];
  getReservation: (id: string) => Reservation | undefined;
  getReservationByPhone: (phone: string) => Reservation | undefined;
  updateStatus: (id: string, status: Reservation["status"]) => void;
  updatePayment: (id: string, status: Reservation["paymentStatus"]) => void;
  addReservation: (data: Omit<Reservation, "id" | "confirmationNumber" | "createdAt">) => Reservation;
}

export interface EmployeeStoreState {
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "dateAdded">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}

export type Settings = typeof restaurantSettings;

export interface RestaurantState {
  settings: Settings;
  tables: Table[];
  updateSettings: (updates: Partial<Settings>) => void;
  updateTable: (id: string, status: Table["status"]) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
export const StoreContext = createContext<{
  auth: AuthState;
  ownerAuth: OwnerAuthState;
  employeeAuth: EmployeeAuthState;
  reservationStore: ReservationState;
  employeeStore: EmployeeStoreState;
  restaurantStore: RestaurantState;
} | null>(null);

// ─── Session helpers ─────────────────────────────────────────────────────────
function loadSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveSession<T>(key: string, value: T | null) {
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadSession<AuthUser>(CUSTOMER_SESSION_KEY));
  const [owner, setOwner] = useState<OwnerUser | null>(() => loadSession<OwnerUser>(OWNER_SESSION_KEY));
  const [employeeUser, setEmployeeUser] = useState<EmployeeUser | null>(() =>
    loadSession<EmployeeUser>(EMPLOYEE_SESSION_KEY)
  );

  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [settings, setSettings] = useState<Settings>(restaurantSettings);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  // Sync sessions to localStorage
  useEffect(() => { saveSession(CUSTOMER_SESSION_KEY, user); }, [user]);
  useEffect(() => { saveSession(OWNER_SESSION_KEY, owner); }, [owner]);
  useEffect(() => { saveSession(EMPLOYEE_SESSION_KEY, employeeUser); }, [employeeUser]);

  // ── Customer auth ──
  const auth: AuthState = {
    user,
    isAuthenticated: !!user,
    login: (phone, _pass) => {
      const existing = reservations.find((r) => r.customer.phone === phone);
      const name = existing ? existing.customer.name : "Valued Guest";
      setUser({ phone, name });
    },
    register: (name, phone, _pass) => {
      setUser({ phone, name });
    },
    logout: () => setUser(null),
  };

  // ── Owner auth ──
  const ownerAuth: OwnerAuthState = {
    owner,
    isAuthenticated: !!owner,
    // Mock: any credentials work
    login: (username, _pass) => setOwner({ username }),
    logout: () => setOwner(null),
  };

  // ── Employee auth ──
  const employeeAuth: EmployeeAuthState = {
    employee: employeeUser,
    isAuthenticated: !!employeeUser,
    // Mock: match against mock employees by username, or fall back to a generic user
    login: (username, _pass) => {
      const found = employees.find(
        (e) => e.username === username && e.status === "Active"
      );
      if (found) {
        setEmployeeUser({ id: found.id, name: found.name, username: found.username, role: found.role });
      } else {
        // Generic fallback — any credentials work
        setEmployeeUser({ id: "e_mock", name: "Staff Member", username, role: "Waiter" });
      }
    },
    logout: () => setEmployeeUser(null),
  };

  // ── Reservations ──
  const reservationStore: ReservationState = {
    reservations,
    getReservation: (id) => reservations.find((r) => r.id === id),
    getReservationByPhone: (phone) => reservations.find((r) => r.customer.phone === phone),
    updateStatus: (id, status) =>
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
    updatePayment: (id, status) =>
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, paymentStatus: status } : r))),
    addReservation: (data) => {
      const newRes = createReservation(data);
      setReservations((prev) => [newRes, ...prev]);
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
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e))),
    removeEmployee: (id) => setEmployees((prev) => prev.filter((e) => e.id !== id)),
  };

  // ── Restaurant ──
  const restaurantStore: RestaurantState = {
    settings,
    tables,
    updateSettings: (updates) => setSettings((prev) => ({ ...prev, ...updates })),
    updateTable: (id, status) =>
      setTables((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))),
  };

  return (
    <StoreContext.Provider
      value={{ auth, ownerAuth, employeeAuth, reservationStore, employeeStore, restaurantStore }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Missing StoreProvider");
  return ctx;
}

export const useAuthStore = () => useStore().auth;
export const useOwnerAuth = () => useStore().ownerAuth;
export const useEmployeeAuth = () => useStore().employeeAuth;
export const useReservationStore = () => useStore().reservationStore;
export const useEmployeeStore = () => useStore().employeeStore;
export const useRestaurantStore = () => useStore().restaurantStore;
