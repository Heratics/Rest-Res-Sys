import { useReservationStore } from "@/services/reservationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, Ban, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const STATUS_STYLES: Record<string, string> = {
  Pending:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmed:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Checked In": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled:    "bg-red-500/10 text-red-400 border-red-500/20",
};

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

export default function DashboardOverview() {
  const { reservations } = useReservationStore();

  const stats = useMemo(() => ({
    inQueue:   reservations.filter((r) => r.status === "Pending" || r.status === "Confirmed").length,
    seated:    reservations.filter((r) => r.status === "Checked In").length,
    cancelled: reservations.filter((r) => r.status === "Cancelled").length,
    total:     reservations.length,
  }), [reservations]);

  const recent = useMemo(() =>
    [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    [reservations]
  );

  const cards = [
    { label: "In Queue",   value: stats.inQueue,   icon: Clock,         color: "text-amber-400",   bg: "bg-amber-400/10" },
    { label: "Seated",     value: stats.seated,    icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Cancelled",  value: stats.cancelled, icon: Ban,           color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Total",      value: stats.total,     icon: Users,         color: "text-primary",     bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Live reservation activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="border-white/5 bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${c.bg}`}>
                <c.icon className={`w-6 h-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</p>
                <p className="text-3xl font-serif mt-0.5">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-serif text-xl">Recent Activity</h2>
          <a href="../reservations" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="divide-y divide-white/5">
          {recent.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No reservations yet.</p>
          ) : recent.map((res) => (
            <div key={res.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
                {res.customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{res.customer.name}</p>
                <p className="text-xs text-muted-foreground">{res.guests} guests · {timeAgo(res.createdAt)}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status]}`}>
                {STATUS_LABEL[res.status] ?? res.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
