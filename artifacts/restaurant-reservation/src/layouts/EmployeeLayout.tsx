import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarPlus, ClipboardList, Map,
  LogOut, Menu, X, UtensilsCrossed, Bell, Users, MapPin,
} from "lucide-react";
import { useEmployeeAuth } from "@/services/authStore";
import { useWorkflowStore } from "@/services/workflowStore";
import { useReservationStore } from "@/services/reservationStore";

type NavItem = { label: string; path: string; icon: React.ElementType };

// Doorman: No Floor Plan access
const DOORMAN_NAV: NavItem[] = [
  { label: "Dashboard",       path: "/employee",                 icon: LayoutDashboard },
  { label: "New Reservation", path: "/employee/new-reservation", icon: CalendarPlus },
  { label: "Reservations",    path: "/employee/reservations",    icon: ClipboardList },
];

// Waiter: No New Reservation, but has Floor Plan
const WAITER_NAV: NavItem[] = [
  { label: "Dashboard",    path: "/employee",              icon: LayoutDashboard },
  { label: "Reservations", path: "/employee/reservations", icon: ClipboardList },
  { label: "Floor Plan",   path: "/employee/floor-plan",   icon: Map },
];

// ─── New Reservation Toast ────────────────────────────────────────────────────

function NewReservationToast({
  reservation,
  onChooseTable,
  onDismiss,
}: {
  reservation: { customer: { name: string }; guests: number; id: string };
  onChooseTable: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", damping: 22, stiffness: 300 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
    >
      <div className="bg-[#1a1a1a] border border-primary/40 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">New Reservation</p>
              <p className="text-base font-medium text-white mt-0.5">{reservation.customer.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" />
                {reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onChooseTable}
              className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary hover:bg-primary/90 text-black text-sm font-semibold transition-colors">
              <MapPin className="w-3.5 h-3.5" /> CHOOSE TABLE
            </button>
            <button onClick={onDismiss}
              className="h-9 rounded-lg border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 text-sm transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function EmployeeLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { employee, logout } = useEmployeeAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { lastNewReservation, clearLastNewReservation, setPendingTableAssignment } = useWorkflowStore();
  const { reservations } = useReservationStore();

  const role = employee?.role ?? "Doorman";
  const isWaiter = role === "Waiter";
  const nav = isWaiter ? WAITER_NAV : DOORMAN_NAV;

  // Toast — only for Waiters
  const [toastReservation, setToastReservation] = useState<typeof lastNewReservation>(null);
  const shownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isWaiter || !lastNewReservation) return;
    if (shownIds.current.has(lastNewReservation.id)) return;
    shownIds.current.add(lastNewReservation.id);
    setToastReservation(lastNewReservation);
    const t = setTimeout(() => {
      setToastReservation(null);
      clearLastNewReservation();
    }, 12000);
    return () => clearTimeout(t);
  }, [lastNewReservation, isWaiter, clearLastNewReservation]);

  const handleToastChooseTable = () => {
    if (!toastReservation) return;
    const res = reservations.find(r => r.id === toastReservation.id);
    if (res) {
      setPendingTableAssignment({ reservation: res, isMove: false });
      navigate("/employee/floor-plan");
    }
    setToastReservation(null);
    clearLastNewReservation();
  };

  const ROLE_LABEL: Record<string, string> = {
    Owner: "Owner · Staff", Doorman: "Doorman", Waiter: "Waiter",
  };

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-6 flex flex-col items-center gap-1 border-b border-sidebar-border">
        <Link href="/employee" className="font-serif text-2xl tracking-widest text-primary cursor-pointer">
          BOOMCLUB
        </Link>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Staff Portal</span>
        {employee && (
          <div className="mt-2 text-center">
            <p className="text-xs text-white/60">{employee.name}</p>
            <p className="text-xs text-primary/60">{ROLE_LABEL[employee.role] ?? employee.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, path, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}>
                <Icon className="w-4 h-4 shrink-0" />{label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-0.5">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer">
            <UtensilsCrossed className="w-4 h-4" /> Public Site
          </div>
        </Link>
        <button
          onClick={() => { logout(); window.location.href = "/employee-login"; }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <div className="fixed inset-0 bg-noise z-0" />

      <AnimatePresence>
        {toastReservation && (
          <NewReservationToast
            reservation={toastReservation}
            onChooseTable={handleToastChooseTable}
            onDismiss={() => { setToastReservation(null); clearLastNewReservation(); }}
          />
        )}
      </AnimatePresence>

      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-5 h-16 border-b border-border bg-card/90 backdrop-blur-md z-30">
        <span className="font-serif text-xl tracking-widest text-primary">BOOMCLUB</span>
        <button className="p-2 text-muted-foreground hover:text-white" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 flex flex-col bg-sidebar border-r border-sidebar-border z-40">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-64 relative z-10 overflow-y-auto">
        <div className="pt-16 md:pt-0 p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
