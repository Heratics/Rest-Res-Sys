import { useReservationStore } from "@/services/reservationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, Clock, CreditCard, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  const { reservations } = useReservationStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todaysReservations = reservations.filter(r => r.date === today);
  const upcomingReservations = reservations.filter(r => r.date > today);
  const checkedIn = todaysReservations.filter(r => r.status === 'Checked In');
  const pendingPayments = reservations.filter(r => r.paymentStatus === 'Pending' && r.status !== 'Cancelled');
  
  const recentReservations = [...reservations].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const stats = [
    { label: "Today's Guests", value: todaysReservations.reduce((acc, curr) => acc + curr.guests, 0), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Upcoming", value: upcomingReservations.length, icon: CalendarIcon, color: "text-primary", bg: "bg-primary/10" },
    { label: "Checked In", value: checkedIn.length, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Pending Payment", value: pendingPayments.length, icon: CreditCard, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today's restaurant activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-serif">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-serif text-xl">Recent Bookings</h2>
          <button className="text-sm text-primary hover:underline flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Guests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReservations.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium">{res.customer.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{res.date} at {res.time}</td>
                  <td className="px-6 py-4">{res.guests}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      res.status === 'Confirmed' ? 'success' :
                      res.status === 'Checked In' ? 'secondary' :
                      res.status === 'Cancelled' ? 'destructive' : 'warning'
                    } className="font-normal text-xs">
                      {res.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={res.paymentStatus === 'Verified' ? 'success' : 'outline'} className="font-normal text-xs">
                      {res.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}