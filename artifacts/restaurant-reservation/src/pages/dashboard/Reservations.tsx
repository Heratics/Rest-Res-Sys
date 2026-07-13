import { useState } from "react";
import { useReservationStore } from "@/services/reservationStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, MoreVertical, Check, X, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Reservations() {
  const { reservations, updateStatus, updatePayment } = useReservationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = reservations.filter(r => {
    const matchesSearch = 
      r.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.phone.includes(searchTerm);
      
    const matchesFilter = filter === "All" || r.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Reservations</h1>
          <p className="text-muted-foreground">Manage all booking requests and active diners.</p>
        </div>
        <Button className="font-serif">New Reservation</Button>
      </div>

      <Card className="border-white/5 bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name, phone, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/20 border-white/10"
            />
          </div>
          <select 
            className="h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-w-[150px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">ID / Customer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium text-center">Guests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{res.customer.name}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">{res.confirmationNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="text-white">{res.date}</div>
                    <div className="text-xs mt-1">{res.time}</div>
                  </td>
                  <td className="px-6 py-4 text-center">{res.guests}</td>
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
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-white/10">
                        {res.status !== 'Checked In' && res.status !== 'Cancelled' && (
                          <>
                            <DropdownMenuItem onClick={() => updateStatus(res.id, 'Checked In')} className="text-emerald-400 cursor-pointer">
                              <Check className="mr-2 h-4 w-4" /> Check In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(res.id, 'Confirmed')} className="cursor-pointer">
                              <Check className="mr-2 h-4 w-4" /> Confirm Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        {res.paymentStatus === 'Pending' && (
                          <DropdownMenuItem onClick={() => updatePayment(res.id, 'Verified')} className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" /> Verify Payment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem onClick={() => updateStatus(res.id, 'Cancelled')} className="text-destructive cursor-pointer">
                          <X className="mr-2 h-4 w-4" /> Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}