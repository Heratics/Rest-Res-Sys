import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { Reservation } from "@/services/mockData";
import { QrDisplay } from "@/components/QrDisplay";
import { Search, Eye, MessageCircle, QrCode, X, ExternalLink } from "lucide-react";
import { Link } from "wouter";

function buildWaMessage(name: string, phone: string, latest?: Reservation) {
  const base = `Hello ${name}, thank you for dining with us at Aurum! 🍽️`;
  if (!latest) return encodeURIComponent(base + "\n\nWe hope to see you again soon.");
  return encodeURIComponent(
    base +
    `\n\nYour upcoming reservation:\n📅 ${latest.date} at ${latest.time}\n👥 ${latest.guests} guest(s)\n🎫 ${latest.confirmationNumber}\n\nSee you soon!`
  );
}

interface GuestRecord {
  name: string;
  phone: string;
  bookings: Reservation[];
  lastBooking: string;
  latestActive: Reservation | undefined;
}

function ActionBtn({ children, onClick, title, className = "" }: { children: React.ReactNode; onClick: () => void; title: string; className?: string }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors ${className}`}>
      {children}
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-serif text-xl text-white">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </motion.div>
    </>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Checked In": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function GuestsPage() {
  const { reservations } = useReservationStore();
  const [search, setSearch] = useState("");
  const [viewGuest, setViewGuest] = useState<GuestRecord | null>(null);
  const [qrGuest, setQrGuest] = useState<GuestRecord | null>(null);

  const guests: GuestRecord[] = useMemo(() => {
    const map = new Map<string, GuestRecord>();
    for (const res of reservations) {
      const key = res.customer.phone;
      if (!map.has(key)) {
        map.set(key, {
          name: res.customer.name,
          phone: res.customer.phone,
          bookings: [],
          lastBooking: res.date,
          latestActive: undefined,
        });
      }
      const g = map.get(key)!;
      g.bookings.push(res);
      if (res.date > g.lastBooking) g.lastBooking = res.date;
      if (res.status !== "Cancelled") {
        if (!g.latestActive || res.date > g.latestActive.date) g.latestActive = res;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastBooking.localeCompare(a.lastBooking));
  }, [reservations]);

  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    return !q || g.name.toLowerCase().includes(q) || g.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Guests</h1>
        <p className="text-muted-foreground text-sm mt-1">{guests.length} unique guests</p>
      </div>

      <Card className="border-white/5">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                {["Guest", "Phone", "Total Bookings", "Last Visit", "Recent Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">No guests found.</td></tr>
              ) : filtered.map((guest, i) => {
                const latest = guest.bookings.sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <tr key={guest.phone} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
                          {guest.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{guest.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{guest.phone}</td>
                    <td className="px-5 py-4 text-center">{guest.bookings.length}</td>
                    <td className="px-5 py-4 text-muted-foreground">{guest.lastBooking}</td>
                    <td className="px-5 py-4">
                      {latest && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[latest.status]}`}>
                          {latest.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        <ActionBtn title="View bookings" onClick={() => setViewGuest(guest)}>
                          <Eye className="w-4 h-4" />
                        </ActionBtn>
                        <a href={`https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${buildWaMessage(guest.name, guest.phone, guest.latestActive)}`}
                          target="_blank" rel="noopener noreferrer">
                          <ActionBtn title="Send WhatsApp" onClick={() => {}}>
                            <MessageCircle className="w-4 h-4" />
                          </ActionBtn>
                        </a>
                        {guest.latestActive && (
                          <ActionBtn title="Generate QR" onClick={() => setQrGuest(guest)}>
                            <QrCode className="w-4 h-4" />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── View Guest Modal ── */}
      <AnimatePresence>
        {viewGuest && (
          <Modal onClose={() => setViewGuest(null)} title={viewGuest.name}>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">{viewGuest.phone} · {viewGuest.bookings.length} reservation(s)</p>
              <div className="space-y-3">
                {viewGuest.bookings
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((res) => (
                  <div key={res.id} className="bg-black/30 rounded-xl border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-primary">{res.confirmationNumber}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLES[res.status]}`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>{res.date} at {res.time}</span>
                      <span>{res.guests} guest(s)</span>
                      <span>{res.paymentMethod}</span>
                    </div>
                    {res.specialRequests && <p className="text-xs text-muted-foreground/70 mt-2 italic">"{res.specialRequests}"</p>}
                    <div className="mt-3 flex justify-end">
                      <Link href={`/ticket/${res.id}`} target="_blank">
                        <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Open Ticket
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-white/5">
              <Button variant="outline" className="w-full" onClick={() => setViewGuest(null)}>Close</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── QR Modal ── */}
      <AnimatePresence>
        {qrGuest && qrGuest.latestActive && (
          <Modal onClose={() => setQrGuest(null)} title="Guest QR Code">
            <div className="flex flex-col items-center gap-4 py-2">
              <div>
                <p className="text-center font-medium text-white">{qrGuest.name}</p>
                <p className="text-center text-xs text-muted-foreground mt-1">{qrGuest.latestActive.confirmationNumber}</p>
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-lg">
                <QrDisplay value={qrGuest.latestActive.confirmationNumber} size={200} />
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setQrGuest(null)}>Close</Button>
                <Link href={`/ticket/${qrGuest.latestActive.id}`} target="_blank" className="flex-1">
                  <Button className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" /> Open Ticket
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
