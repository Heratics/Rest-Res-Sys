import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservationStore } from "@/services/reservationStore";
import { Reservation, ReservationStatus } from "@/services/mockData";
import { QrDisplay } from "@/components/QrDisplay";
import {
  Search, Eye, Pencil, X, MessageCircle, QrCode,
  Ban, CheckCircle2, CalendarPlus, ExternalLink,
} from "lucide-react";

type Filter = "All" | ReservationStatus;
const FILTERS: Filter[] = ["All", "Pending", "Confirmed", "Checked In", "Cancelled"];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Checked In": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function buildWaMessage(res: Reservation) {
  return encodeURIComponent(
    `Dear ${res.customer.name}, your reservation at Aurum is confirmed! ✨\n\n` +
    `📅 ${res.date} at ${res.time}\n👥 ${res.guests} guest(s)\n🎫 ${res.confirmationNumber}\n\n` +
    `Please present your QR code at the entrance. We look forward to hosting you.`
  );
}

const TIMES = ["17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00"];

export default function ReservationsPage() {
  const { reservations, updateStatus, updatePayment } = useReservationStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [viewRes, setViewRes] = useState<Reservation | null>(null);
  const [editRes, setEditRes] = useState<Reservation | null>(null);
  const [qrRes, setQrRes] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState<Partial<Reservation>>({});
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const filtered = reservations.filter((r) => {
    const matchesFilter = filter === "All" || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || r.customer.name.toLowerCase().includes(q) ||
      r.customer.phone.includes(q) || r.confirmationNumber.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const openEdit = (r: Reservation) => {
    setEditRes(r);
    setEditForm({ status: r.status, date: r.date, time: r.time, guests: r.guests, specialRequests: r.specialRequests, paymentStatus: r.paymentStatus });
  };

  const saveEdit = () => {
    if (!editRes) return;
    if (editForm.status) updateStatus(editRes.id, editForm.status as ReservationStatus);
    if (editForm.paymentStatus) updatePayment(editRes.id, editForm.paymentStatus as any);
    setEditRes(null);
  };

  const handleCancel = (id: string) => {
    updateStatus(id, "Cancelled");
    setConfirmCancel(null);
  };

  const handleCheckIn = (r: Reservation) => {
    if (r.status === "Confirmed" || r.status === "Pending") updateStatus(r.id, "Checked In");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">Reservations</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} of {reservations.length} entries</p>
        </div>
        <Link href="../new-reservation">
          <Button className="gap-2 self-start sm:self-auto">
            <CalendarPlus className="w-4 h-4" /> New Reservation
          </Button>
        </Link>
      </div>

      {/* Filters + Search */}
      <Card className="border-white/5">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or confirmation #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-white hover:border-white/20"
                }`}
              >
                {f}
                {f !== "All" && (
                  <span className="ml-1.5 opacity-60">
                    {reservations.filter((r) => r.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                {["Confirmation", "Guest", "Date & Time", "Guests", "Status", "Payment", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No reservations found.</td></tr>
              ) : filtered.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-primary">{res.confirmationNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{res.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{res.customer.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{res.date} · {res.time}</td>
                  <td className="px-5 py-4">{res.guests}</td>
                  <td className="px-5 py-4"><StatusBadge status={res.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{res.paymentMethod}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${PAYMENT_STYLES[res.paymentStatus]}`}>
                        {res.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-0.5">
                      <ActionBtn title="View" onClick={() => setViewRes(res)}>
                        <Eye className="w-4 h-4" />
                      </ActionBtn>
                      <ActionBtn title="Edit" onClick={() => openEdit(res)}>
                        <Pencil className="w-4 h-4" />
                      </ActionBtn>
                      {res.status !== "Checked In" && res.status !== "Cancelled" && (
                        <ActionBtn title="Check In" onClick={() => handleCheckIn(res)} className="hover:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </ActionBtn>
                      )}
                      {confirmCancel === res.id ? (
                        <span className="flex items-center gap-1 ml-1">
                          <button onClick={() => handleCancel(res.id)} className="px-2 py-1 rounded text-xs bg-destructive text-white">Yes</button>
                          <button onClick={() => setConfirmCancel(null)} className="px-2 py-1 rounded text-xs border border-border">No</button>
                        </span>
                      ) : res.status !== "Cancelled" ? (
                        <ActionBtn title="Cancel" onClick={() => setConfirmCancel(res.id)} className="hover:text-destructive">
                          <Ban className="w-4 h-4" />
                        </ActionBtn>
                      ) : null}
                      <a
                        href={`https://wa.me/${res.customer.phone.replace(/\D/g, "")}?text=${buildWaMessage(res)}`}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <ActionBtn title="Send WhatsApp" onClick={() => {}}>
                          <MessageCircle className="w-4 h-4" />
                        </ActionBtn>
                      </a>
                      <ActionBtn title="View QR / Ticket" onClick={() => setQrRes(res)}>
                        <QrCode className="w-4 h-4" />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── View Modal ── */}
      <AnimatePresence>
        {viewRes && (
          <Modal onClose={() => setViewRes(null)} title="Reservation Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif">
                  {viewRes.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{viewRes.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{viewRes.customer.phone}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={viewRes.status} />
                </div>
              </div>
              <DetailGrid items={[
                { label: "Confirmation", value: viewRes.confirmationNumber },
                { label: "Date", value: viewRes.date },
                { label: "Time", value: viewRes.time },
                { label: "Guests", value: `${viewRes.guests}` },
                { label: "Payment Method", value: viewRes.paymentMethod },
                { label: "Payment Status", value: viewRes.paymentStatus },
                ...(viewRes.specialRequests ? [{ label: "Notes", value: viewRes.specialRequests }] : []),
              ]} />
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setViewRes(null)}>Close</Button>
              <Link href={`/ticket/${viewRes.id}`} target="_blank">
                <Button className="gap-2" onClick={() => setViewRes(null)}>
                  <ExternalLink className="w-4 h-4" /> Open Ticket
                </Button>
              </Link>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editRes && (
          <Modal onClose={() => setEditRes(null)} title="Edit Reservation">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <select value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input type="number" min={1} max={20} value={editForm.guests} onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ReservationStatus })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    {(["Pending","Confirmed","Checked In","Cancelled"] as ReservationStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Payment Status</Label>
                  <select value={editForm.paymentStatus} onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    {["Pending","Paid","Verified"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Special Requests</Label>
                  <textarea rows={2} value={editForm.specialRequests || ""} onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditRes(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit}>Save Changes</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── QR Modal ── */}
      <AnimatePresence>
        {qrRes && (
          <Modal onClose={() => setQrRes(null)} title="Guest QR Code">
            <div className="flex flex-col items-center gap-4 py-2">
              <p className="text-sm text-muted-foreground">{qrRes.customer.name} · {qrRes.confirmationNumber}</p>
              <div className="p-5 bg-white rounded-2xl shadow-lg">
                <QrDisplay value={qrRes.confirmationNumber} size={200} />
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setQrRes(null)}>Close</Button>
                <Link href={`/ticket/${qrRes.id}`} target="_blank" className="flex-1">
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

// ─── Shared sub-components ────────────────────────────────────────────────────

function ActionBtn({ children, onClick, title, className = "" }: { children: React.ReactNode; onClick: () => void; title: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
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

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="bg-black/30 rounded-xl border border-white/5 divide-y divide-white/5">
      {items.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-start px-4 py-3 text-sm gap-4">
          <span className="text-muted-foreground shrink-0">{label}</span>
          <span className="text-white text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}
