import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence } from "framer-motion";
import { useReservationStore } from "@/services/reservationStore";
import { useFloorPlanStore } from "@/services/floorPlanStore";
import { useEmployeeStore } from "@/services/employeeStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReservationDetailsModal } from "@/components/ReservationDetailsModal";
import { Reservation } from "@/services/mockData";
import {
  Clock, Users, CheckCircle2, Armchair, Star, Wrench,
  LayoutGrid, CalendarPlus, ClipboardList, Map, UserCog,
  ChevronRight, Activity,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Pending:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmed:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Checked In": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Seated:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Completed:    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Cancelled:    "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  Pending:      "Incoming",
  Confirmed:    "Incoming",
  "Checked In": "Waiting for Guests",
  Seated:       "Seated",
  Completed:    "Completed",
  Cancelled:    "Cancelled",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function DashboardOverview() {
  const { reservations } = useReservationStore();
  const { floorTables } = useFloorPlanStore();
  const { employees } = useEmployeeStore();
  const [viewRes, setViewRes] = useState<Reservation | null>(null);

  // ── Reservation stats ──
  const rStats = useMemo(() => ({
    incoming:  reservations.filter(r => r.status === "Pending" || r.status === "Confirmed").length,
    waiting:   reservations.filter(r => r.status === "Checked In").length,
    seated:    reservations.filter(r => r.status === "Seated").length,
    completed: reservations.filter(r => r.status === "Completed").length,
    cancelled: reservations.filter(r => r.status === "Cancelled").length,
  }), [reservations]);

  // ── Floor stats ──
  const fStats = useMemo(() => ({
    available: floorTables.filter(t => t.status === "Available").length,
    waiting:   floorTables.filter(t => t.status === "Waiting").length,
    occupied:  floorTables.filter(t => t.status === "Occupied").length,
    special:   floorTables.filter(t => t.status === "Special").length,
    oos:       floorTables.filter(t => t.status === "OutOfService").length,
    total:     floorTables.length,
  }), [floorTables]);

  // ── Recent reservations ──
  const recentReservations = useMemo(() =>
    [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [reservations]
  );

  // ── Active floor tables ──
  const activeFloorTables = useMemo(() =>
    floorTables
      .filter(t => t.status === "Waiting" || t.status === "Occupied" || t.status === "Special")
      .slice(0, 6),
    [floorTables]
  );

  // ── Recent employee activity (just show active employees as proxy) ──
  const activeStaff = useMemo(() =>
    employees.filter(e => e.status === "Active" && e.role !== "Owner"),
    [employees]
  );

  const TABLE_STATUS_CFG: Record<string, { color: string; label: string }> = {
    Waiting:  { color: "text-amber-400",   label: "Waiting" },
    Occupied: { color: "text-blue-400",    label: "Occupied" },
    Special:  { color: "text-purple-400",  label: "Special" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Live operational overview — BOOMCLUB 6th Circle</p>
      </div>

      {/* ── Reservation Stats ── */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Reservations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Incoming",   value: rStats.incoming,  color: "text-amber-400",   bg: "bg-amber-400/10",   icon: Clock },
            { label: "Waiting",    value: rStats.waiting,   color: "text-blue-400",    bg: "bg-blue-400/10",    icon: Users },
            { label: "Seated",     value: rStats.seated,    color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
            { label: "Completed",  value: rStats.completed, color: "text-zinc-400",    bg: "bg-zinc-400/10",    icon: Activity },
            { label: "Cancelled",  value: rStats.cancelled, color: "text-red-400",     bg: "bg-red-400/10",     icon: Activity },
          ].map(s => (
            <Card key={s.label} className="border-white/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-serif">{s.value}</p>
                  <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Floor Stats ── */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Floor Status</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Available",    value: fStats.available, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
            { label: "Waiting",      value: fStats.waiting,   color: "text-amber-400",   bg: "bg-amber-400/10",   icon: Clock },
            { label: "Occupied",     value: fStats.occupied,  color: "text-blue-400",    bg: "bg-blue-400/10",    icon: Users },
            { label: "Special",      value: fStats.special,   color: "text-purple-400",  bg: "bg-purple-400/10",  icon: Star },
            { label: "Out of Service", value: fStats.oos,     color: "text-zinc-500",    bg: "bg-zinc-500/10",    icon: Wrench },
            { label: "Total Tables", value: fStats.total,     color: "text-primary",     bg: "bg-primary/10",     icon: Armchair },
          ].map(s => (
            <Card key={s.label} className="border-white/5">
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-serif">{s.value}</p>
                <p className={`text-xs font-medium leading-tight mt-0.5 ${s.color}`}>{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Reservations */}
        <div className="lg:col-span-2">
          <Card className="border-white/5 overflow-hidden h-full">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white">Recent Reservations</h2>
              <Link href="../reservations">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentReservations.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">No reservations yet.</p>
              ) : recentReservations.map(res => (
                <button key={res.id}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                  onClick={() => setViewRes(res)}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-xs shrink-0">
                    {initials(res.customer.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{res.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{res.guests} guests · {timeAgo(res.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status] ?? STATUS_STYLES.Pending}`}>
                    {STATUS_LABEL[res.status] ?? res.status}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Floor Activity + Quick Actions */}
        <div className="space-y-5">
          {/* Current Floor Activity */}
          <Card className="border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white">Floor Activity</h2>
              <Link href="../floor-plan">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  Floor Plan <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            {activeFloorTables.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">All tables available.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {activeFloorTables.map(t => {
                  const cfg = TABLE_STATUS_CFG[t.status];
                  const res = t.reservationId
                    ? reservations.find(r => r.id === t.reservationId)
                    : null;
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {t.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {t.specialGuest?.name ?? res?.customer.name ?? "Occupied"}
                        </p>
                        <p className="text-xs text-muted-foreground">Floor {t.floor} · {t.capacity} seats</p>
                      </div>
                      <span className={`text-xs font-medium ${cfg?.color ?? "text-muted-foreground"}`}>
                        {cfg?.label ?? t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Staff on Duty */}
          <Card className="border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white">Active Staff</h2>
              <Link href="../employees">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  Manage <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {activeStaff.slice(0, 4).map(emp => (
                <div key={emp.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-xs shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{emp.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{emp.role}</span>
                </div>
              ))}
              {activeStaff.length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm">No active staff.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Create Reservation", path: "/owner/new-reservation", icon: CalendarPlus, color: "border-primary/30 hover:border-primary/60 hover:bg-primary/5" },
            { label: "View Reservations",  path: "/owner/reservations", icon: ClipboardList, color: "border-white/10 hover:border-white/20 hover:bg-white/3" },
            { label: "Open Floor Plan",    path: "/owner/floor-plan",   icon: LayoutGrid,   color: "border-white/10 hover:border-white/20 hover:bg-white/3" },
            { label: "Manage Employees",   path: "/owner/employees",    icon: UserCog,      color: "border-white/10 hover:border-white/20 hover:bg-white/3" },
          ].map(({ label, path, icon: Icon, color }) => (
            <Link key={label} href={path}>
              <div className={`flex flex-col items-center gap-3 p-5 rounded-xl border text-center cursor-pointer transition-all ${color}`}>
                <Icon className="w-6 h-6 text-primary/70" />
                <p className="text-sm font-medium text-white/80">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Reservation Details Modal */}
      <AnimatePresence>
        {viewRes && <ReservationDetailsModal reservation={viewRes} onClose={() => setViewRes(null)} />}
      </AnimatePresence>
    </div>
  );
}
