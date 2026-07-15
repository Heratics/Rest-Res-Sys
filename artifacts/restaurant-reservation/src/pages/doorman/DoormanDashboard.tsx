import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { useEmployeeAuth } from "@/services/authStore";
import { Reservation } from "@/services/mockData";
import { isIncoming } from "@/services/reservationOperations";
import {
  CalendarPlus, Search, Users, Clock, Ban, History,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  "Checked In": "Assigned",
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
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Queue Card ───────────────────────────────────────────────────────────────
// Doorman can only CANCEL reservations — table assignment is the waiter's job.

function QueueCard({ res, onCancel, confirmId, setConfirmId }: {
  res: Reservation;
  onCancel: () => void;
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
}) {
  const isConfirming = confirmId === res.id;
  const canCancel = res.status !== "Cancelled" && res.status !== "Checked In"
    && res.status !== "Seated" && res.status !== "Completed";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
        {initials(res.customer.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-white">{res.customer.name}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status] ?? STATUS_STYLES.Pending}`}>
            {STATUS_LABEL[res.status] ?? res.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{res.guests} guests</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(res.createdAt)}</span>
          {res.specialRequests && (
            <span className="truncate max-w-[140px] text-muted-foreground/60">"{res.specialRequests}"</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {canCancel && !isConfirming && (
          <button
            onClick={() => setConfirmId(res.id)}
            className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Cancel reservation"
          >
            <Ban className="w-4 h-4" />
          </button>
        )}
        {isConfirming && (
          <>
            <button
              onClick={onCancel}
              className="px-2 py-1 rounded text-xs bg-destructive text-white font-medium"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="px-2 py-1 rounded text-xs border border-border text-muted-foreground"
            >
              No
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoormanDashboard() {
  const { employee } = useEmployeeAuth();
  const { reservations, updateStatus } = useReservationStore();
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const queue = useMemo(() => {
    const q = search.toLowerCase();
    return reservations
      .filter((r) => isIncoming(r) &&
        (!q || r.customer.name.toLowerCase().includes(q) || r.customer.phone.includes(q)))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [reservations, search]);

  const history = useMemo(() =>
    reservations
      .filter((r) => !isIncoming(r))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    [reservations]
  );

  const stats = useMemo(() => ({
    incoming:  reservations.filter(isIncoming).length,
    assigned:  reservations.filter((r) => r.status === "Checked In").length,
    seated:    reservations.filter((r) => r.status === "Seated").length,
  }), [reservations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">
            Welcome{employee?.name ? `, ${employee.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Doorman · Reservation Queue</p>
        </div>
        <Link href="../new-reservation">
          <Button size="lg" className="gap-2 self-start sm:self-auto">
            <CalendarPlus className="w-5 h-5" />
            Create Reservation
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Incoming", value: stats.incoming, color: "text-amber-400",   bg: "bg-amber-400/10" },
          { label: "Assigned", value: stats.assigned, color: "text-blue-400",    bg: "bg-blue-400/10" },
          { label: "Seated",   value: stats.seated,   color: "text-emerald-400", bg: "bg-emerald-400/10" },
        ].map((s) => (
          <Card key={s.label} className="border-white/5">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <p className="text-3xl font-serif mb-1">{s.value}</p>
              <p className={`text-xs font-medium uppercase tracking-wider ${s.color}`}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reservation Queue */}
      <Card className="border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-serif text-xl text-white">Reservation Queue</h2>
            <span className="text-xs text-muted-foreground">{queue.length} incoming</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          {queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {search ? "No results found." : "Queue is empty."}
            </div>
          ) : (
            queue.map((res) => (
              <QueueCard
                key={res.id}
                res={res}
                onCancel={() => { updateStatus(res.id, "Cancelled"); setConfirmId(null); }}
                confirmId={confirmId}
                setConfirmId={setConfirmId}
              />
            ))
          )}
        </div>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card className="border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-serif text-lg text-white">Recent History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {history.map((res) => (
              <div key={res.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center text-white/30 text-xs font-serif shrink-0">
                  {initials(res.customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{res.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{res.guests} guests · {timeAgo(res.createdAt)}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status] ?? STATUS_STYLES.Pending}`}>
                  {STATUS_LABEL[res.status] ?? res.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
