import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useReservationStore } from "@/services/reservationStore";
import { CheckCircle2, ArrowLeft, Users } from "lucide-react";
import { Reservation } from "@/services/mockData";
import { Link } from "wouter";

export default function NewReservation() {
  const { addReservation } = useReservationStore();
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    guests: "2",
    specialRequests: "",
  });

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Customer name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.guests || parseInt(form.guests) < 1) e.guests = "At least 1 guest required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = addReservation({
      customer: { id: `c_${Date.now()}`, name: form.name.trim(), phone: form.phone.trim() },
      guests: parseInt(form.guests),
      specialRequests: form.specialRequests.trim() || undefined,
      status: "Pending",
    });
    setResult(res);
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setResult(null);
    setForm({ name: "", phone: "", guests: "2", specialRequests: "" });
    setErrors({});
  };

  if (submitted && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="border-white/5 overflow-hidden">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14, delay: 0.1 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <div>
              <h1 className="font-serif text-3xl text-white mb-2">Reservation Created</h1>
              <p className="text-muted-foreground text-sm">Successfully added to the queue.</p>
            </div>

            <div className="w-full bg-black/30 rounded-xl border border-white/5 divide-y divide-white/5 text-left">
              {[
                { label: "Customer", value: result.customer.name },
                { label: "Phone", value: result.customer.phone },
                { label: "Guests", value: `${result.guests} ${result.guests === 1 ? "person" : "people"}` },
                { label: "Confirmation", value: result.confirmationNumber },
                ...(result.specialRequests ? [{ label: "Notes", value: result.specialRequests }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex w-full gap-3">
              <Link href="../reservations" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Queue
                </Button>
              </Link>
              <Button className="flex-1" onClick={reset}>
                New Reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white mb-1">New Reservation</h1>
        <p className="text-muted-foreground text-sm">Add a walk-in or called-ahead guest to the queue.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-white/5">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+962 7 9000 0000"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Guest Count <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={30}
                value={form.guests}
                onChange={(e) => set("guests", e.target.value)}
              />
              {errors.guests && <p className="text-xs text-destructive">{errors.guests}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
              <textarea
                id="notes"
                rows={3}
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                placeholder="Allergies, seating preferences, occasion..."
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={submitting}>
              {submitting ? "Adding to Queue..." : "Create Reservation"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
