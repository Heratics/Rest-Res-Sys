import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Reservation, mockReservations, Table, mockTables, restaurantSettings, createReservation } from "./mockData";

const SESSION_KEY = "aurum_mock_session";

export interface AuthUser {
  phone: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (phone: string, pass: string) => void;
  register: (name: string, phone: string, pass: string) => void;
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

export type Settings = typeof restaurantSettings;

export interface RestaurantState {
  settings: Settings;
  tables: Table[];
  updateSettings: (updates: Partial<Settings>) => void;
  updateTable: (id: string, status: Table["status"]) => void;
}

export const StoreContext = createContext<{
  auth: AuthState;
  reservationStore: ReservationState;
  restaurantStore: RestaurantState;
} | null>(null);

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.phone === "string" && typeof parsed.name === "string") {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // silently ignore
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSession);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [settings, setSettings] = useState<Settings>(restaurantSettings);
  const [tables, setTables] = useState<Table[]>(mockTables);

  // Sync session to localStorage whenever user changes
  useEffect(() => {
    saveSession(user);
  }, [user]);

  const auth: AuthState = {
    user,
    isAuthenticated: !!user,
    login: (phone: string, _pass: string) => {
      // Mock login — look up existing reservation to get real name, fallback to "Valued Guest"
      const existingRes = reservations.find((r) => r.customer.phone === phone);
      const name = existingRes ? existingRes.customer.name : "Valued Guest";
      setUser({ phone, name });
    },
    register: (name: string, phone: string, _pass: string) => {
      // Mock register — immediately log in with provided details
      setUser({ phone, name });
    },
    logout: () => setUser(null),
  };

  const reservationStore: ReservationState = {
    reservations,
    getReservation: (id: string) => reservations.find((r) => r.id === id),
    getReservationByPhone: (phone: string) => reservations.find((r) => r.customer.phone === phone),
    updateStatus: (id: string, status: Reservation["status"]) => {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    },
    updatePayment: (id: string, status: Reservation["paymentStatus"]) => {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, paymentStatus: status } : r)));
    },
    addReservation: (data) => {
      const newRes = createReservation(data);
      setReservations((prev) => [newRes, ...prev]);
      return newRes;
    },
  };

  const restaurantStore: RestaurantState = {
    settings,
    tables,
    updateSettings: (updates: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...updates })),
    updateTable: (id: string, status: Table["status"]) =>
      setTables((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))),
  };

  return (
    <StoreContext.Provider value={{ auth, reservationStore, restaurantStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useAuthStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Missing StoreProvider");
  return ctx.auth;
}

export function useReservationStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Missing StoreProvider");
  return ctx.reservationStore;
}

export function useRestaurantStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Missing StoreProvider");
  return ctx.restaurantStore;
}
