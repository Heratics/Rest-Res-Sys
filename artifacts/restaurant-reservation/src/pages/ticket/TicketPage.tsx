import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useReservationStore } from "@/services/reservationStore";
import { QrDisplay } from "@/components/QrDisplay";
import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reservation } from "@/services/mockData";

export default function TicketPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { reservations } = useReservationStore();

  const reservation = reservations.find(
    (r) => r.id === token || r.confirmationNumber === `#${token}` || r.confirmationNumber === token
  );

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="fixed inset-0 bg-noise z-0" />
        <div className="text-center relative z-10">
          <p className="font-serif text-5xl text-primary mb-4">?</p>
          <h1 className="font-serif text-2xl text-white mb-2">Ticket Not Found</h1>
          <p className="text-muted-foreground text-sm">This ticket link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 bg-noise z-0" />
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Print button */}
        <div className="flex justify-end mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* ── Top: Header ── */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-white/5 bg-black/20">
            <p className="font-serif text-3xl tracking-widest text-primary mb-1">AURUM</p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fine Dining</p>
          </div>

          {/* ── Confirmed Banner ── */}
          <div className="bg-primary/10 border-y border-primary/20 px-8 py-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm tracking-widest uppercase">Reservation Confirmed</span>
          </div>

          {/* ── QR Code ── */}
          <div className="flex flex-col items-center px-8 py-8 gap-4">
            <div className="p-5 bg-white rounded-2xl shadow-xl">
              <QrDisplay value={reservation.confirmationNumber} size={180} />
            </div>
            <p className="font-mono text-xs text-muted-foreground tracking-wider">
              {reservation.confirmationNumber}
            </p>
          </div>

          {/* ── Perforation divider ── */}
          <div className="relative flex items-center px-0 my-0">
            <div className="w-6 h-6 rounded-full bg-background border border-white/5 -ml-3 shrink-0" />
            <div className="flex-1 border-t border-dashed border-white/15 mx-2" />
            <div className="w-6 h-6 rounded-full bg-background border border-white/5 -mr-3 shrink-0" />
          </div>

          {/* ── Details ── */}
          <div className="px-8 py-6 space-y-4">
            <div className="text-center mb-2">
              <p className="font-serif text-xl text-white">{reservation.customer.name}</p>
              <p className="text-sm text-muted-foreground">{reservation.customer.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Date" value={reservation.date} />
              <DetailItem label="Time" value={reservation.time} />
              <DetailItem label="Guests" value={`${reservation.guests} ${reservation.guests === 1 ? "Person" : "People"}`} />
              <DetailItem label="Payment" value={reservation.paymentMethod} />
            </div>

            {reservation.specialRequests && (
              <div className="bg-black/30 rounded-xl border border-white/5 p-3 text-xs text-muted-foreground italic text-center">
                "{reservation.specialRequests}"
              </div>
            )}

            {/* Status */}
            <StatusRow status={reservation.status} />
          </div>

          {/* ── Footer ── */}
          <div className="px-8 pb-8 pt-2 text-center border-t border-white/5">
            <p className="text-primary/80 text-sm font-medium font-serif italic">
              "Please present this at the entrance"
            </p>
            <p className="text-muted-foreground/50 text-xs mt-3">
              14 Rue de Rivoli, 75001 Paris · {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded-xl border border-white/5 p-3 text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function StatusRow({ status }: { status: Reservation["status"] }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Checked In": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <div className="flex justify-center">
      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    </div>
  );
}
