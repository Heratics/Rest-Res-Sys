/**
 * Reusable Reservation Details Modal.
 * Displays full reservation info + role/status-aware actions.
 * Used on: ReservationsPage, DashboardOverview, WaiterDashboard, DoormanDashboard.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnerAuth, useEmployeeAuth } from "@/services/StoreContext";
import { useReservationStore } from "@/services/reservationStore";
import { useFloorPlanStore } from "@/services/floorPlanStore";
import { useWorkflowStore } from "@/services/workflowStore";
import {
  cancelReservation,
  updateReservation as updateReservationOp,
  buildOps,
  isEditable,
  isTerminal,
} from "@/services/reservationOperations";
import { Reservation } from "@/services/mockData";
import {
  X, Clock, Users, Phone, Hash, StickyNote, Calendar,
  MapPin, CheckCircle2, Ban, Pencil, AlertTriangle, ArrowRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function elapsed(iso?: string) {
  if (!iso) return null;
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "< 1 min";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h ${m % 60}m` : `${h}h`;
}

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
  "Checked In": "Waiting for Guests",
  Seated:       "Seated",
  Completed:    "Completed",
  Cancelled:    "Cancelled",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

function EditForm({
  res,
  assignedTableCapacity,
  onSave,
  onCancel,
}: {
  res: Reservation;
  assignedTableCapacity?: number;
  onSave: (updates: { name: string; phone: string; guests: number; notes: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: res.customer.name,
    phone: res.customer.phone,
    guests: String(res.guests),
    notes: res.specialRequests ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const capacityWarning =
    assignedTableCapacity !== undefined &&
    parseInt(form.guests) > assignedTableCapacity;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.guests || parseInt(form.guests) < 1) e.guests = "At least 1 guest";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-3 px-5 pb-5">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider pt-1">Edit Reservation</p>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Customer Name</Label>
        <Input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
          className="h-9 text-sm" />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Phone Number</Label>
        <Input value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: "" })); }}
          className="h-9 text-sm" placeholder="+962 7 9000 0000" />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Guest Count</Label>
        <Input type="number" min={1} max={30} value={form.guests}
          onChange={e => { setForm(p => ({ ...p, guests: e.target.value })); setErrors(p => ({ ...p, guests: "" })); }}
          className="h-9 text-sm" />
        {errors.guests && <p className="text-xs text-destructive">{errors.guests}</p>}
        {capacityWarning && (
          <div className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            This exceeds the assigned table's capacity of {assignedTableCapacity}. The waiter can move the guest manually.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Special Requests / Notes</Label>
        <textarea rows={2} value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          placeholder="Dietary requirements, special occasions..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="flex-1" onClick={() => {
          if (!validate()) return;
          onSave({ name: form.name, phone: form.phone, guests: parseInt(form.guests), notes: form.notes });
        }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export interface ReservationDetailsModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export function ReservationDetailsModal({ reservation: initialRes, onClose }: ReservationDetailsModalProps) {
  const { isAuthenticated: isOwner } = useOwnerAuth();
  const { employee } = useEmployeeAuth();
  const { reservations, updateReservation, updateStatus } = useReservationStore();
  const { floorTables, updateFloorTable } = useFloorPlanStore();
  const { setPendingTableAssignment } = useWorkflowStore();
  const [, navigate] = useLocation();

  // Always read from live store so edits are reflected immediately
  const res = useMemo(
    () => reservations.find(r => r.id === initialRes.id) ?? initialRes,
    [reservations, initialRes]
  );

  const role = isOwner ? "Owner" : (employee?.role ?? "Doorman");
  const isWaiter = role === "Waiter";
  const isDoorman = role === "Doorman";

  const ops = buildOps(updateStatus, updateFloorTable, updateReservation);

  // Find assigned table
  const assignedTable = useMemo(
    () => floorTables.find(t => t.reservationId === res.id),
    [floorTables, res.id]
  );

  const [mode, setMode] = useState<"view" | "edit" | "confirmCancel">("view");
  const [cancelConfirm, setCancelConfirm] = useState("");

  const canEdit = (isOwner || isDoorman) && isEditable(res);
  const canCancel = (isOwner || isDoorman) &&
    !isTerminal(res) && res.status !== "Seated";
  const canChooseTable = (isOwner || isWaiter) &&
    (res.status === "Pending" || res.status === "Confirmed");
  const canViewFloor = !isDoorman;

  const actorName = isOwner ? "Owner" : (employee?.name ?? "Staff");

  const handleSaveEdit = (updates: { name: string; phone: string; guests: number; notes: string }) => {
    updateReservation(res.id, {
      customer: { ...res.customer, name: updates.name, phone: updates.phone },
      guests: updates.guests,
      specialRequests: updates.notes || undefined,
    });
    setMode("view");
  };

  const handleCancel = () => {
    cancelReservation(res.id, actorName, ops, assignedTable?.id);
    onClose();
  };

  const handleChooseTable = () => {
    setPendingTableAssignment({ reservation: res, isMove: false });
    const base = isOwner ? "/owner" : "/employee";
    navigate(`${base}/floor-plan`);
    onClose();
  };

  // ── Render ──
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-white/6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif shrink-0">
                {res.customer.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white">{res.customer.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{res.confirmationNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[res.status] ?? STATUS_STYLES.Pending}`}>
                {STATUS_LABEL[res.status] ?? res.status}
              </span>
              <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Edit form */}
          {mode === "edit" && (
            <EditForm
              res={res}
              assignedTableCapacity={assignedTable?.capacity}
              onSave={handleSaveEdit}
              onCancel={() => setMode("view")}
            />
          )}

          {/* Cancel confirmation */}
          {mode === "confirmCancel" && (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium mb-1">Cancel this reservation?</p>
                  <p className="text-muted-foreground text-xs">
                    {assignedTable
                      ? `Table ${assignedTable.number} will be released and returned to Available.`
                      : "This reservation will be marked as cancelled."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setMode("view")}>
                  Keep Reservation
                </Button>
                <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleCancel}>
                  Yes, Cancel
                </Button>
              </div>
            </div>
          )}

          {/* View mode */}
          {mode === "view" && (
            <>
              {/* Details */}
              <div className="divide-y divide-white/5 py-1">
                <InfoRow label="Confirmation" value={<span className="font-mono text-xs">{res.confirmationNumber}</span>} />
                <InfoRow label="Phone" value={
                  <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-muted-foreground" />{res.customer.phone}</span>
                } />
                <InfoRow label="Guests" value={
                  <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-muted-foreground" />{res.guests} guests</span>
                } />
                {res.specialRequests && (
                  <InfoRow label="Notes" value={
                    <span className="flex items-start gap-1.5 text-muted-foreground/80 italic text-xs"><StickyNote className="w-3 h-3 mt-0.5 shrink-0" />{res.specialRequests}</span>
                  } />
                )}
                <InfoRow label="Created" value={
                  <span className="flex items-center gap-1.5 text-muted-foreground/80 text-xs"><Calendar className="w-3 h-3" />{fmtDate(res.createdAt)} {fmtTime(res.createdAt)}</span>
                } />
                {res.assignedAt && (
                  <InfoRow label="Assigned" value={
                    <span className="flex items-center gap-1.5 text-muted-foreground/80 text-xs"><Clock className="w-3 h-3" />{fmtTime(res.assignedAt)}</span>
                  } />
                )}
                {res.seatedAt && (
                  <InfoRow label="Seated" value={
                    <span className="flex items-center gap-1.5 text-muted-foreground/80 text-xs"><CheckCircle2 className="w-3 h-3" />{fmtTime(res.seatedAt)} · {elapsed(res.seatedAt)} ago</span>
                  } />
                )}
                {res.completedAt && (
                  <InfoRow label="Completed" value={
                    <span className="text-xs text-muted-foreground/80">{fmtTime(res.completedAt)}</span>
                  } />
                )}
                {res.cancelledAt && (
                  <InfoRow label="Cancelled" value={
                    <span className="text-xs text-muted-foreground/80">{fmtTime(res.cancelledAt)}{res.cancelledBy ? ` by ${res.cancelledBy}` : ""}</span>
                  } />
                )}
                {(assignedTable || res.assignedTableNumber) && (
                  <InfoRow label="Table" value={
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      Floor {assignedTable?.floor ?? res.assignedFloor} · Table {assignedTable?.number ?? res.assignedTableNumber}
                    </span>
                  } />
                )}
                {(res.status === "Pending" || res.status === "Confirmed") && !assignedTable && (
                  <InfoRow label="Waiting" value={
                    <span className="text-amber-400/80 text-xs">{elapsed(res.createdAt)}</span>
                  } />
                )}
                {res.status === "Checked In" && assignedTable && (
                  <InfoRow label="Waiting" value={
                    <span className="text-amber-400/80 text-xs">{elapsed(res.assignedAt)}</span>
                  } />
                )}
              </div>

              {/* Actions */}
              <div className="p-5 pt-2 space-y-2 border-t border-white/5">
                {canChooseTable && (
                  <Button className="w-full h-9 gap-2 text-sm font-semibold" onClick={handleChooseTable}>
                    <MapPin className="w-3.5 h-3.5" /> Choose Table
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                )}
                {canEdit && (
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setMode("edit")}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Reservation
                  </Button>
                )}
                {canCancel && (
                  <Button variant="ghost" size="sm"
                    className="w-full gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setMode("confirmCancel")}>
                    <Ban className="w-3.5 h-3.5" /> Cancel Reservation
                  </Button>
                )}
                {!canChooseTable && !canEdit && !canCancel && (
                  <p className="text-center text-xs text-muted-foreground py-2">No actions available for this reservation.</p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
