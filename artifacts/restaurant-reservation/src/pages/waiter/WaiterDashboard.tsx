import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { useFloorPlanStore } from "@/services/floorPlanStore";
import { useEmployeeAuth } from "@/services/authStore";
import { useWorkflowStore } from "@/services/workflowStore";
import { Reservation } from "@/services/mockData";
import { isIncoming } from "@/services/reservationOperations";
import {
  Users, Clock, CheckCircle2, Armchair, ArrowRight,
  Phone, Hash, StickyNote, Activity, MapPin,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function waitingTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Incoming Card ────────────────────────────────────────────────────────────

function IncomingCard({
  res,
  onChooseTable,
}: {
  res: Reservation;
  onChooseTable: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-card border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-all"
    >
      {/* Top strip */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-serif text-sm shrink-0 mt-0.5">
          {initials(res.customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-white text-base leading-tight">{res.customer.name}</p>
            <span className="shrink-0 text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-0.5">
              Incoming
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{res.guests} {res.guests === 1 ? "guest" : "guests"}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />{res.customer.phone}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />{res.confirmationNumber}
            </span>
            <span className="flex items-center gap-1 text-amber-400/80">
              <Clock className="w-3 h-3" />Waiting {waitingTime(res.createdAt)}
            </span>
          </div>
          {res.specialRequests && (
            <div className="flex items-start gap-1 mt-1.5 text-xs text-muted-foreground/70 bg-white/3 rounded px-2 py-1">
              <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="italic">{res.specialRequests}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Button
          onClick={onChooseTable}
          className="w-full h-10 gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-black shadow-md shadow-primary/20"
        >
          <MapPin className="w-4 h-4" />
          CHOOSE TABLE
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Active Table Card ────────────────────────────────────────────────────────

function ActiveTableCard({
  tableNumber,
  floor,
  res,
  tableStatus,
}: {
  tableNumber: string;
  floor: number;
  res: Reservation;
  tableStatus: "Waiting" | "Occupied";
}) {
  const isOccupied = tableStatus === "Occupied";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border ${
        isOccupied
          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
      }`}>
        {tableNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{res.customer.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{res.guests}</span>
          <span>Floor {floor}</span>
        </div>
      </div>
      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
        isOccupied
          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
      }`}>
        {isOccupied ? "Seated" : "Waiting"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WaiterDashboard() {
  const { employee } = useEmployeeAuth();
  const { reservations } = useReservationStore();
  const { floorTables } = useFloorPlanStore();
  const { setPendingTableAssignment } = useWorkflowStore();
  const [, navigate] = useLocation();

  // Live timer — re-render every 30s so waiting times stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Derived data ──
  const incomingQueue = useMemo(
    () =>
      reservations
        .filter(isIncoming)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [reservations]
  );

  const activeTables = useMemo(() => {
    return floorTables
      .filter((t) => t.status === "Waiting" || t.status === "Occupied")
      .map((t) => ({
        table: t,
        res: t.reservationId ? reservations.find((r) => r.id === t.reservationId) : undefined,
      }))
      .filter((entry) => entry.res !== undefined) as {
        table: typeof floorTables[0];
        res: Reservation;
      }[];
  }, [floorTables, reservations]);

  const recentActivity = useMemo(
    () =>
      [...reservations]
        .filter((r) => r.status === "Seated" || r.status === "Completed" || r.status === "Cancelled")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [reservations]
  );

  const stats = useMemo(() => ({
    incoming:  reservations.filter(isIncoming).length,
    assigned:  reservations.filter((r) => r.status === "Checked In").length,
    seated:    reservations.filter((r) => r.status === "Seated").length,
    completed: reservations.filter((r) => r.status === "Completed").length,
  }), [reservations]);

  // ── Actions ──
  const handleChooseTable = (res: Reservation) => {
    setPendingTableAssignment({ reservation: res, isMove: false });
    navigate("/employee/floor-plan");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-white">
          Welcome{employee?.name ? `, ${employee.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Waiter · Service Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Incoming",   value: stats.incoming,  color: "text-amber-400",   bg: "bg-amber-400/10",   icon: Clock },
          { label: "Assigned",   value: stats.assigned,  color: "text-blue-400",    bg: "bg-blue-400/10",    icon: Armchair },
          { label: "Seated",     value: stats.seated,    color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
          { label: "Completed",  value: stats.completed, color: "text-zinc-400",    bg: "bg-zinc-400/10",    icon: Activity },
        ].map((s) => (
          <Card key={s.label} className="border-white/5">
            <div className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-serif">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Incoming Reservations — primary focus */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-serif text-xl text-white">Incoming Reservations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {incomingQueue.length === 0 ? "Queue empty" : `${incomingQueue.length} waiting for a table`}
            </p>
          </div>
        </div>

        {incomingQueue.length === 0 ? (
          <Card className="border-white/5 border-dashed">
            <div className="py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">All reservations have been assigned tables.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {incomingQueue.map((res) => (
                <IncomingCard
                  key={res.id}
                  res={res}
                  onChooseTable={() => handleChooseTable(res)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Active Tables */}
      {activeTables.length > 0 && (
        <Card className="border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-serif text-lg text-white">Active Tables</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{activeTables.length} assigned</p>
          </div>
          <div>
            {activeTables.map(({ table, res }) => (
              <ActiveTableCard
                key={table.id}
                tableNumber={table.number}
                floor={table.floor}
                res={res}
                tableStatus={table.status as "Waiting" | "Occupied"}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-serif text-lg text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.map((res) => (
              <div key={res.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-xs shrink-0">
                  {initials(res.customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{res.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{res.guests} guests · {timeAgo(res.createdAt)}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
                  res.status === "Seated"    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  res.status === "Completed" ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
