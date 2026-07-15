import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { useRestaurantStore } from "@/services/restaurantStore";
import { useEmployeeAuth } from "@/services/authStore";
import { Reservation } from "@/services/mockData";
import { Users, CheckCircle2, Armchair, Clock, Activity } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  Pending: "Incoming",
  Confirmed: "Waiting",
  "Checked In": "Seated",
  Cancelled: "Cancelled",
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

function IncomingCard({ res }: { res: Reservation }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
        {initials(res.customer.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{res.customer.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{res.guests}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(res.createdAt)}</span>
        </div>
        {res.specialRequests && (
          <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">"{res.specialRequests}"</p>
        )}
      </div>
      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
        {STATUS_LABEL[res.status]}
      </span>
    </div>
  );
}

export default function WaiterDashboard() {
  const { employee } = useEmployeeAuth();
  const { reservations } = useReservationStore();
  const { tables } = useRestaurantStore();

  const stats = useMemo(() => ({
    incoming: reservations.filter((r) => r.status === "Pending").length,
    waiting:  reservations.filter((r) => r.status === "Confirmed").length,
    seated:   reservations.filter((r) => r.status === "Checked In").length,
    occupied: tables.filter((t) => t.status === "Occupied").length,
    reserved: tables.filter((t) => t.status === "Reserved").length,
  }), [reservations, tables]);

  const incomingQueue = useMemo(() =>
    reservations
      .filter((r) => r.status === "Pending" || r.status === "Confirmed")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 8),
    [reservations]
  );

  const occupiedTables = useMemo(() =>
    tables.filter((t) => t.status === "Occupied" || t.status === "Reserved"),
    [tables]
  );

  const recentActivity = useMemo(() =>
    [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [reservations]
  );

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
          { label: "Incoming",       value: stats.incoming,          color: "text-amber-400",   bg: "bg-amber-400/10",   icon: Clock },
          { label: "Waiting",        value: stats.waiting,           color: "text-blue-400",    bg: "bg-blue-400/10",    icon: Users },
          { label: "Seated",         value: stats.seated,            color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
          { label: "Occupied Tables",value: stats.occupied + stats.reserved, color: "text-primary", bg: "bg-primary/10", icon: Armchair },
        ].map((s) => (
          <Card key={s.label} className="border-white/5">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-serif">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Incoming Reservations */}
        <Card className="border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-serif text-lg text-white">Incoming Reservations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{incomingQueue.length} in queue</p>
          </div>
          <div>
            {incomingQueue.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">No incoming reservations.</p>
            ) : incomingQueue.map((res) => <IncomingCard key={res.id} res={res} />)}
          </div>
        </Card>

        {/* Occupied / Reserved Tables */}
        <Card className="border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-serif text-lg text-white">Assigned Tables</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{occupiedTables.length} active</p>
          </div>
          <div>
            {occupiedTables.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">All tables available.</p>
            ) : occupiedTables.map((table) => (
              <div key={table.id} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card border border-white/10 flex items-center justify-center">
                    <Armchair className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Table {table.number}</p>
                    <p className="text-xs text-muted-foreground">Capacity: {table.capacity}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  table.status === "Occupied"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {table.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
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
                res.status === "Checked In" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                res.status === "Cancelled"  ? "bg-red-500/10 text-red-400 border-red-500/20" :
                res.status === "Confirmed"  ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {STATUS_LABEL[res.status] ?? res.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
