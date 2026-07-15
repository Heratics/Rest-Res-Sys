import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { useFloorPlanStore } from "@/services/floorPlanStore";
import { useOwnerAuth, useEmployeeAuth } from "@/services/StoreContext";
import { ReservationDetailsModal } from "@/components/ReservationDetailsModal";
import { Reservation } from "@/services/mockData";
import { isIncoming } from "@/services/reservationOperations";
import { Search, CalendarPlus, Clock, Users, MapPin } from "lucide-react";
import { Link } from "wouter";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Tab = "Incoming" | "Waiting For Guests" | "Seated" | "Completed" | "Cancelled" | "All";
const TABS: Tab[] = ["Incoming", "Waiting For Guests", "Seated", "Completed", "Cancelled", "All"];

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function elapsed(iso?: string) {
  if (!iso) return null;
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "< 1 min";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h ${m % 60}m` : `${h}h`;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function matchesTab(r: Reservation, tab: Tab): boolean {
  if (tab === "All") return true;
  if (tab === "Incoming")          return isIncoming(r);
  if (tab === "Waiting For Guests") return r.status === "Checked In";
  if (tab === "Seated")            return r.status === "Seated";
  if (tab === "Completed")         return r.status === "Completed";
  if (tab === "Cancelled")         return r.status === "Cancelled";
  return false;
}

// ─── Reservation Card ─────────────────────────────────────────────────────────

function ReservationCard({
  res,
  assignedTableNumber,
  assignedFloor,
  onClick,
}: {
  res: Reservation;
  assignedTableNumber?: string;
  assignedFloor?: number;
  onClick: () => void;
}) {
  const waitingFrom = isIncoming(res)
    ? res.createdAt
    : res.status === "Checked In"
      ? res.assignedAt
      : undefined;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-white/5 rounded-xl p-4 hover:border-white/12 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-xs shrink-0 mt-0.5">
          {initials(res.customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-white text-sm truncate">{res.customer.name}</p>
            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status] ?? STATUS_STYLES.Pending}`}>
              {STATUS_LABEL[res.status] ?? res.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{res.guests} guests
            </span>
            {waitingFrom && (
              <span className="flex items-center gap-1 text-amber-400/70">
                <Clock className="w-3 h-3" />{elapsed(waitingFrom)} wait
              </span>
            )}
            {(assignedTableNumber || res.assignedTableNumber) && (
              <span className="flex items-center gap-1 text-blue-400/70">
                <MapPin className="w-3 h-3" />
                Floor {assignedFloor ?? res.assignedFloor} · Table {assignedTableNumber ?? res.assignedTableNumber}
              </span>
            )}
          </div>
          {res.specialRequests && (
            <p className="text-xs text-muted-foreground/60 italic mt-1 truncate">"{res.specialRequests}"</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const { reservations } = useReservationStore();
  const { floorTables } = useFloorPlanStore();
  const { isAuthenticated: isOwner } = useOwnerAuth();
  const { employee } = useEmployeeAuth();

  const isDoorman = !isOwner && employee?.role === "Doorman";

  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Incoming");
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [filterTable, setFilterTable] = useState<string>("");
  const [viewRes, setViewRes]   = useState<Reservation | null>(null);

  // Build a map of reservationId → floor table for quick lookup
  const tableByReservation = useMemo(() => {
    const m = new Map<string, typeof floorTables[0]>();
    floorTables.forEach(t => { if (t.reservationId) m.set(t.reservationId, t); });
    return m;
  }, [floorTables]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      "Incoming":          reservations.filter(isIncoming).length,
      "Waiting For Guests": reservations.filter(r => r.status === "Checked In").length,
      "Seated":            reservations.filter(r => r.status === "Seated").length,
      "Completed":         reservations.filter(r => r.status === "Completed").length,
      "Cancelled":         reservations.filter(r => r.status === "Cancelled").length,
      "All":               reservations.length,
    };
    return c;
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reservations.filter(r => {
      if (!matchesTab(r, activeTab)) return false;
      if (q && !r.customer.name.toLowerCase().includes(q) &&
          !r.customer.phone.includes(q) &&
          !r.confirmationNumber.toLowerCase().includes(q)) return false;
      // Floor filter
      if (filterFloor !== "all") {
        const ft = tableByReservation.get(r.id);
        const floor = ft?.floor ?? r.assignedFloor;
        if (String(floor) !== filterFloor) return false;
      }
      // Table filter
      if (filterTable.trim()) {
        const ft = tableByReservation.get(r.id);
        const tn = ft?.number ?? r.assignedTableNumber ?? "";
        if (!tn.toLowerCase().includes(filterTable.toLowerCase())) return false;
      }
      return true;
    });
  }, [reservations, activeTab, search, filterFloor, filterTable, tableByReservation]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-white">Reservation Queue</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {counts.Incoming} incoming · {counts["Waiting For Guests"]} waiting · {counts.Seated} seated
          </p>
        </div>
        {/* Only Doorman and Owner can create reservations */}
        {(isOwner || isDoorman) && (
          <Link href={isOwner ? "../new-reservation" : "/employee/new-reservation"}>
            <Button size="sm" className="gap-1.5 text-xs shrink-0">
              <CalendarPlus className="w-3.5 h-3.5" /> New
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Filters */}
      <Card className="border-white/5 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or confirmation #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterFloor}
            onChange={e => setFilterFloor(e.target.value)}
            className="h-8 text-xs rounded-md border border-border bg-background px-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
          <Input
            placeholder="Filter by table #..."
            value={filterTable}
            onChange={e => setFilterTable(e.target.value)}
            className="h-8 text-xs w-36"
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-white hover:border-white/20"
            }`}
          >
            {tab}
            <span className="ml-1.5 opacity-60">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {search || filterTable || filterFloor !== "all"
                ? "No reservations match your filters."
                : `No ${activeTab.toLowerCase()} reservations.`}
            </div>
          ) : (
            filtered.map(res => {
              const ft = tableByReservation.get(res.id);
              return (
                <ReservationCard
                  key={res.id}
                  res={res}
                  assignedTableNumber={ft?.number}
                  assignedFloor={ft?.floor}
                  onClick={() => setViewRes(res)}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {viewRes && (
          <ReservationDetailsModal
            reservation={viewRes}
            onClose={() => setViewRes(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
