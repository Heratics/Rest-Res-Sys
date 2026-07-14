import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { restaurantSettings } from "@/services/mockData";
import { CheckCircle2, Download, MessageCircle, RotateCcw, ChevronDown } from "lucide-react";
import { Reservation } from "@/services/mockData";
import { QrDisplay } from "@/components/QrDisplay";

const TIMES = ["17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00"];

function buildWaMessage(res: Reservation) {
  return encodeURIComponent(
    `Dear ${res.customer.name}, your reservation at Aurum is confirmed! ✨\n\n` +
    `📅 Date: ${res.date}\n` +
    `🕐 Time: ${res.time}\n` +
    `👥 Guests: ${res.guests}\n` +
    `🎫 Confirmation: ${res.confirmationNumber}\n\n` +
    `Please present your QR code at the entrance.\n\nWe look forward to hosting you.`
  );
}

export default function NewReservation() {
  const { addReservation } = useReservationStore();
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: "2",
    specialRequests: "",
    paymentMethod: "CliQ" as "CliQ" | "Pay Upon Arrival",
  });

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Guest name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (!form.guests || parseInt(form.guests) < 1) e.guests = "At least 1 guest";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const res = addReservation({
      customer: { id: `c_${Date.now()}`, name: form.name.trim(), phone: form.phone.trim() },
      date: form.date,
      time: form.time,
      guests: parseInt(form.guests),
      specialRequests: form.specialRequests.trim() || undefined,
      status: "Confirmed",
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentMethod === "CliQ" ? "Pending" : "Pending",
    });
    setResult(res);
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setResult(null);
    setForm({ name: "", phone: "", date: "", time: "19:00", guests: "2", specialRequests: "", paymentMethod: "CliQ" });
    setErrors({});
  };

  if (submitted && result) {
    const phone = result.customer.phone.replace(/\D/g, "");
    const waLink = `https://wa.me/${phone}?text=${buildWaMessage(result)}`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto space-y-6"
      >
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.1 }}
            className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </motion.div>
          <h1 className="font-serif text-3xl text-white mb-1">Reservation Created</h1>
          <p className="text-muted-foreground text-sm">{result.confirmationNumber}</p>
        </div>

        {/* QR Card */}
        <Card className="border-white/5 overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest QR Code</p>
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <QrDisplay value={result.confirmationNumber} size={200} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{result.confirmationNumber}</p>
            </div>

            {/* Details */}
            <div className="w-full bg-black/30 rounded-xl border border-white/5 divide-y divide-white/5">
              {[
                { label: "Guest", value: result.customer.name },
                { label: "Phone", value: result.customer.phone },
                { label: "Date", value: result.date },
                { label: "Time", value: result.time },
                { label: "Guests", value: `${result.guests} ${result.guests === 1 ? "person" : "people"}` },
                { label: "Payment", value: result.paymentMethod },
                ...(result.specialRequests ? [{ label: "Notes", value: result.specialRequests }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  // Mock download — in production, generate a canvas image
                  const el = document.createElement("a");
                  el.href = "#";
                  el.download = `${result.confirmationNumber}.png`;
                  el.click();
                }}
              >
                <Download className="w-4 h-4" />
                Download QR
              </Button>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full gap-2" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
          New Reservation
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white mb-1">New Reservation</h1>
        <p className="text-muted-foreground text-sm">Create a reservation and generate a guest QR ticket.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Guest Info */}
          <Card className="border-white/5">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-serif text-lg text-white border-b border-white/5 pb-3">Guest Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Guest name" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+962 6 555 0100" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card className="border-white/5">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-serif text-lg text-white border-b border-white/5 pb-3">Reservation Details</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                  {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time <span className="text-destructive">*</span></Label>
                  <select
                    id="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests">Guests <span className="text-destructive">*</span></Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={20}
                    value={form.guests}
                    onChange={(e) => set("guests", e.target.value)}
                  />
                  {errors.guests && <p className="text-xs text-destructive">{errors.guests}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests</Label>
                <textarea
                  id="requests"
                  rows={3}
                  value={form.specialRequests}
                  onChange={(e) => set("specialRequests", e.target.value)}
                  placeholder="Allergies, seating preferences, occasion notes..."
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-white/5">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-serif text-lg text-white border-b border-white/5 pb-3">Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {(["CliQ", "Pay Upon Arrival"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => set("paymentMethod", method)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.paymentMethod === method
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <p className="font-medium text-sm">{method}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {method === "CliQ"
                        ? `Send to ${restaurantSettings.cliqType === "alias" ? restaurantSettings.cliqValue : restaurantSettings.cliqValue}`
                        : "Pay at the restaurant"}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating Reservation..." : "Create Reservation & Generate QR"}
          </Button>
        </div>
      </form>
    </div>
  );
}
