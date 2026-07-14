import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarPlus, ClipboardList, QrCode,
  Users, LogOut, Menu, X, UtensilsCrossed,
} from "lucide-react";
import { useEmployeeAuth } from "@/services/authStore";

const NAV = [
  { label: "Dashboard",       path: "/employee",                  icon: LayoutDashboard },
  { label: "New Reservation", path: "/employee/new-reservation",  icon: CalendarPlus },
  { label: "Reservations",    path: "/employee/reservations",     icon: ClipboardList },
  { label: "QR Scanner",      path: "/employee/qr-scanner",      icon: QrCode },
  { label: "Guests",          path: "/employee/guests",           icon: Users },
];

export function EmployeeLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { employee, logout } = useEmployeeAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-8 flex flex-col items-center gap-1 border-b border-sidebar-border">
        <Link href="/employee" className="font-serif text-2xl tracking-widest text-primary cursor-pointer">
          AURUM
        </Link>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Staff Portal</span>
        {employee && (
          <div className="mt-2 text-center">
            <p className="text-xs text-white/60">{employee.name}</p>
            <p className="text-xs text-primary/60">{employee.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, path, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
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
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-5 h-16 border-b border-border bg-card/90 backdrop-blur-md z-30">
        <span className="font-serif text-xl tracking-widest text-primary">AURUM</span>
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
