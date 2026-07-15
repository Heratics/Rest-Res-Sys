import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { Reservation, ReservationStatus } from "@/services/mockData";
import {
  Search, CheckCircle2, Ban, X, Users, Clock, Map,
  Eye, CalendarPlus,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Tab = "Incoming" | "Waiting" | "Checked In" | "Cancelled" | "All";

const TABS: Tab[] = ["Incoming", "Waiting", "Checked In", "Cancelled", "All"];

const TAB_STATUS: Record<Tab, ReservationStatus | null> = {
  Incoming: "Pending",
  Waiting: "Confirmed",
  "Checked In": "Checked In",
  Cancelled: "Cancelled",
  All: null,
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  Pending:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmed:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Checked In": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled:    "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  Pending: "Incoming",
  Confirmed: "Waiting",
  "Checked In": "Seated",
  Cancelled: "Cancelled",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Reservation Card ─────────────────────────────────────────────────────────

function ReservationCard({
  res,
  onCheckIn,
  onCancel,
  onView,
  confirmCancelId,
  setConfirmCancelId,
}: {
  res: Reservation;
  onCheckIn: () => void;
  onCancel: () => void;
  onView: () => void;
  confirmCancelId: string | null;
  setConfirmCancelId: (id: string | null) => void;
}) {
  const canCheckIn = res.status === "Pending" || res.status === "Confirmed";
  const canCancel = res.status !== "Cancelled" && res.status !== "Checked In";
  const isConfirmingCancel = confirmCancelId === res.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
          {initials(res.customer.name)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-medium text-white truncate">{res.customer.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{res.confirmationNumber}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status]}`}>
              {STATUS_LABEL[res.status]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 mb-2">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{res.guests} {res.guests === 1 ? "guest" : "guests"}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(res.createdAt)}</span>
          </div>

          {res.specialRequests && (
            <p className="text-xs text-muted-foreground/70 bg-black/20 rounded px-2 py-1 border border-white/5 mb-2 truncate">
              {res.specialRequests}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onView}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 border border-border transition-all">
              <Eye className="w-3 h-3" /> View
            </button>
            {canCheckIn && (
              <button onClick={onCheckIn}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all">
                <CheckCircle2 className="w-3 h-3" /> Seat
              </button>
            )}
            {canCancel && !isConfirmingCancel && (
              <button onClick={() => setConfirmCancelId(res.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
                <Ban className="w-3 h-3" /> Cancel
              </button>
            )}
            {isConfirmingCancel && (
              <span className="flex items-center gap-1">
                <button onClick={onCancel}
                  className="px-2.5 py-1 rounded-lg text-xs bg-destructive text-white font-medium">
                  Confirm
                </button>
                <button onClick={() => setConfirmCancelId(null)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-border text-muted-foreground">
                  No
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── View Detail Modal ────────────────────────────────────────────────────────

function DetailModal({ res, onClose }: { res: Reservation; onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-serif text-xl text-white">Reservation Details</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif">
                {initials(res.customer.name)}
              </div>
              <div>
                <p className="font-medium text-white">{res.customer.name}</p>
                <p className="text-sm text-muted-foreground">{res.customer.phone}</p>
              </div>
              <span className={`ml-auto shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status]}`}>
                {STATUS_LABEL[res.status]}
              </span>
            </div>

            <div className="bg-black/30 rounded-xl border border-white/5 divide-y divide-white/5">
              {[
                { label: "Confirmation", value: res.confirmationNumber },
                { label: "Guests", value: `${res.guests}` },
                { label: "Added", value: timeAgo(res.createdAt) },
                ...(res.specialRequests ? [{ label: "Notes", value: res.specialRequests }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start px-4 py-3 text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="text-white text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 pt-0">
            <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const { reservations, updateStatus } = useReservationStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Incoming");
  const [viewRes, setViewRes] = useState<Reservation | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const pending   = reservations.filter((r) => r.status === "Pending").length;
    const confirmed = reservations.filter((r) => r.status === "Confirmed").length;
    const checkedIn = reservations.filter((r) => r.status === "Checked In").length;
    const cancelled = reservations.filter((r) => r.status === "Cancelled").length;
    return { pending, confirmed, checkedIn, cancelled, all: reservations.length };
  }, [reservations]);

  const TAB_COUNTS: Record<Tab, number> = {
    Incoming: counts.pending,
    Waiting: counts.confirmed,
    "Checked In": counts.checkedIn,
    Cancelled: counts.cancelled,
    All: counts.all,
  };

  const filtered = useMemo(() => {
    const statusFilter = TAB_STATUS[activeTab];
    return reservations.filter((r) => {
      const matchesTab = !statusFilter || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.phone.includes(q) ||
        r.confirmationNumber.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [reservations, activeTab, search]);

  const handleCheckIn = (r: Reservation) => updateStatus(r.id, "Checked In");
  const handleCancel = (id: string) => {
    updateStatus(id, "Cancelled");
    setConfirmCancelId(null);
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* ── LEFT: Queue Panel ── */}
      <div className="flex flex-col flex-1 md:max-w-[520px] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="font-serif text-2xl text-white">Reservation Queue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{counts.pending + counts.confirmed} active</p>
          </div>
          <Link href="../new-reservation">
            <Button size="sm" className="gap-1.5 text-xs">
              <CalendarPlus className="w-3.5 h-3.5" /> New
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or confirmation #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-3 shrink-0">
          {TABS.map((tab) => (
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
              <span className="ml-1.5 opacity-60">{TAB_COUNTS[tab]}</span>
            </button>
          ))}
        </div>

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground text-sm">No reservations found.</p>
              </div>
            ) : (
              filtered.map((res) => (
                <ReservationCard
                  key={res.id}
                  res={res}
                  onCheckIn={() => handleCheckIn(res)}
                  onCancel={() => handleCancel(res.id)}
                  onView={() => setViewRes(res)}
                  confirmCancelId={confirmCancelId}
                  setConfirmCancelId={setConfirmCancelId}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: Floor Plan Placeholder ── */}
      <div className="hidden md:flex flex-1 flex-col">
        <Card className="flex-1 border-white/5 border-dashed flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center mb-6">
            <Map className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="font-serif text-xl text-white/30 mb-2">No Floor Plan Yet</h3>
          <p className="text-sm text-muted-foreground/50 max-w-xs">
            No floor plan has been implemented yet. Table assignment will be available once the floor plan is configured.
          </p>
        </Card>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewRes && <DetailModal res={viewRes} onClose={() => setViewRes(null)} />}
      </AnimatePresence>
    </div>
  );
}
