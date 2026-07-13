import React, { createContext, useContext, useState, ReactNode } from "react";
import { Reservation, mockReservations, Table, mockTables, restaurantSettings, updateReservation, createReservation } from "./mockData";

export interface AuthState {
  user: { phone: string; name: string } | null;
  isAuthenticated: boolean;
  login: (phone: string, pass: string) => void;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ phone: string; name: string } | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [settings, setSettings] = useState<Settings>(restaurantSettings);
  const [tables, setTables] = useState<Table[]>(mockTables);

  const auth: AuthState = {
    user,
    isAuthenticated: !!user,
    login: (phone: string, pass: string) => setUser({ phone, name: "Valued Guest" }),
    logout: () => setUser(null),
  };

  const reservationStore: ReservationState = {
    reservations,
    getReservation: (id: string) => reservations.find((r) => r.id === id),
    getReservationByPhone: (phone: string) => reservations.find((r) => r.customer.phone === phone),
    updateStatus: (id: string, status: Reservation["status"]) => {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    },
    updatePayment: (id: string, status: Reservation["paymentStatus"]) => {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: status } : r));
    },
    addReservation: (data) => {
      const newRes = createReservation(data);
      setReservations(prev => [newRes, ...prev]);
      return newRes;
    }
  };

  const restaurantStore: RestaurantState = {
    settings,
    tables,
    updateSettings: (updates: Partial<Settings>) => setSettings(prev => ({ ...prev, ...updates })),
    updateTable: (id: string, status: Table["status"]) => setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t))
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
