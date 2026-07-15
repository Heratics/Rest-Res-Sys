import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerAuth } from "@/services/authStore";
import { useEmployeeAuth } from "@/services/StoreContext";
import { useFloorPlanStore } from "@/services/floorPlanStore";
import { useReservationStore } from "@/services/reservationStore";
import { useEmployeeStore } from "@/services/employeeStore";
import { useWorkflowStore } from "@/services/workflowStore";
import { FloorTable, FloorTableStatus, TableShape, Reservation } from "@/services/mockData";
import {
  assignTable as assignTableOp,
  markGuestsSeated,
  completeReservation,
  moveReservation,
  seatSpecialGuest as seatSpecialGuestOp,
  updateSpecialGuest as updateSpecialGuestOp,
  releaseSpecialGuest,
  returnTableToService,
  markTableOutOfService,
  buildOps,
} from "@/services/reservationOperations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, Clock, CheckCircle2, AlertCircle, Wrench, Star,
  X, ChevronLeft, Plus, Trash2, Save, Pencil, LayoutGrid, MapPin,
  ArrowRight, AlertTriangle, MoveRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<FloorTableStatus, { border: string; bg: string; text: string; label: string }> = {
  Available:    { border: "#10b981", bg: "rgba(16,185,129,0.13)",  text: "#34d399", label: "Available" },
  Waiting:      { border: "#f59e0b", bg: "rgba(245,158,11,0.13)",  text: "#fbbf24", label: "Waiting for Guests" },
  Occupied:     { border: "#3b82f6", bg: "rgba(59,130,246,0.13)",  text: "#60a5fa", label: "Occupied" },
  Special:      { border: "#a855f7", bg: "rgba(168,85,247,0.13)",  text: "#c084fc", label: "Special Guest" },
  OutOfService: { border: "#52525b", bg: "rgba(39,39,42,0.75)",    text: "#71717a", label: "Out of Service" },
};

const TABLE_DIMS: Record<TableShape, [number, number]> = {
  round:   [62, 62],
  square:  [68, 68],
  banquet: [132, 54],
};

const CANVAS = { 1: { w: 1220, h: 760 }, 2: { w: 900, h: 720 } };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function elapsed(iso?: string) {
  if (!iso) return "–";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function fmtTime(iso?: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── TableNode ────────────────────────────────────────────────────────────────

interface TableNodeProps {
  table: FloorTable;
  selected: boolean;
  editMode: boolean;
  selectionMode: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: () => void;
}

function TableNode({ table, selected, editMode, selectionMode, onPointerDown, onClick }: TableNodeProps) {
  const cfg = STATUS_CFG[table.status];
  const [w, h] = TABLE_DIMS[table.shape];
  const isRound = table.shape === "round";
  const isBanquet = table.shape === "banquet";
  const isSelectable = selectionMode && table.status === "Available";
  const isNotSelectable = selectionMode && table.status !== "Available";

  // Selection mode styling
  const selectionBorder = isSelectable
    ? "#c9a84c"
    : isNotSelectable
      ? "#444"
      : cfg.border;
  const selectionBg = isSelectable
    ? "rgba(201,168,76,0.18)"
    : isNotSelectable
      ? "rgba(20,20,20,0.8)"
      : cfg.bg;

  return (
    <motion.div
      className="absolute select-none"
      style={{
        left: table.x - w / 2,
        top: table.y - h / 2,
        width: w,
        height: h,
        borderRadius: isRound ? "50%" : isBanquet ? "6px" : "10px",
        border: `2px solid ${selected ? "#c9a84c" : selectionBorder}`,
        backgroundColor: selectionBg,
        boxShadow: selected
          ? `0 0 0 3px rgba(201,168,76,0.35), 0 0 20px ${cfg.border}55`
          : isSelectable
            ? `0 0 14px rgba(201,168,76,0.35), 0 0 28px rgba(201,168,76,0.15)`
            : `0 2px 12px ${cfg.border}22`,
        cursor: editMode ? "grab" : isNotSelectable ? "not-allowed" : "pointer",
        opacity: isNotSelectable ? 0.3 : 1,
        zIndex: selected ? 30 : 10,
        transition: "border-color 0.15s, box-shadow 0.15s, opacity 0.2s",
      }}
      whileHover={!isNotSelectable ? { scale: 1.06, boxShadow: isSelectable ? `0 0 20px rgba(201,168,76,0.5)` : `0 0 18px ${cfg.border}55` } : {}}
      whileTap={!isNotSelectable ? { scale: 0.97 } : {}}
      onPointerDown={editMode ? onPointerDown : undefined}
      onClick={onClick}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 pointer-events-none">
        <span className="font-bold text-white leading-none" style={{ fontSize: isBanquet ? 13 : 11 }}>
          {table.number}
        </span>
        <span style={{ color: isSelectable ? "#c9a84c" : cfg.text, fontSize: 9 }} className="leading-none opacity-80">
          {table.capacity}p
        </span>
        {isSelectable && (
          <span style={{ fontSize: 7, color: "#c9a84c", opacity: 0.9 }} className="leading-none">
            SELECT
          </span>
        )}
      </div>
      {editMode && (
        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary/80 border border-primary/50 flex items-center justify-center pointer-events-none">
          <Pencil className="w-2 h-2 text-black" />
        </div>
      )}
    </motion.div>
  );
}

// ─── Main FloorPlan Component ─────────────────────────────────────────────────

export default function FloorPlan() {
  const { isAuthenticated: isOwner } = useOwnerAuth();
  const { employee } = useEmployeeAuth();
  const { floorTables, updateFloorTable, addFloorTable, removeFloorTable, saveFloorLayout } = useFloorPlanStore();
  const { reservations, updateStatus: updateReservationStatus, updateReservation } = useReservationStore();
  const { employees } = useEmployeeStore();
  const { pendingTableAssignment, setPendingTableAssignment } = useWorkflowStore();
  const [, navigate] = useLocation();

  const isWaiter = employee?.role === "Waiter";
  const canEdit = isOwner;

  // Centralized ops object
  const ops = buildOps(updateReservationStatus, updateFloorTable, updateReservation);

  // ── Floor & Selection state ──
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<"main" | "assign" | "special" | "oos" | "notes" | "editTable" | "addTable">("main");

  // ── Edit mode state ──
  const [editMode, setEditMode] = useState(false);
  const [draftTables, setDraftTables] = useState<FloorTable[]>([]);

  // ── Selection mode state ──
  const [confirmAssignState, setConfirmAssignState] = useState<{
    table: FloorTable;
    capacityWarning: boolean;
    assignAnyway: boolean;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Confirmation states ──
  const [confirmRemoveSpecial, setConfirmRemoveSpecial] = useState(false);
  const [confirmReturnService, setConfirmReturnService] = useState(false);
  const [confirmSeatSpecial, setConfirmSeatSpecial] = useState(false);

  // ── Form state ──
  const [assignSearch, setAssignSearch] = useState("");
  const [specialForm, setSpecialForm] = useState({ name: "", phone: "", reason: "", reservedBy: "" });
  const [oosReason, setOosReason] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [editNumInput, setEditNumInput] = useState("");
  const [editCapInput, setEditCapInput] = useState("");
  const [editShapeInput, setEditShapeInput] = useState<TableShape>("round");
  const [addForm, setAddForm] = useState({ number: "", shape: "round" as TableShape, capacity: "4" });

  // ── Drag state ──
  const dragRef = useRef<{
    id: string; startX: number; startY: number; origX: number; origY: number; moved: boolean;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const selectionMode = !!pendingTableAssignment && !editMode;

  const activeTables = useMemo(
    () => (editMode ? draftTables : floorTables).filter(t => t.floor === activeFloor),
    [editMode, draftTables, floorTables, activeFloor]
  );

  const selectedTable = useMemo(
    () => activeTables.find(t => t.id === selectedId) ?? null,
    [activeTables, selectedId]
  );

  // ── Stats ──
  const stats = useMemo(() => {
    const all = floorTables.filter(t => t.floor === activeFloor);
    return {
      available: all.filter(t => t.status === "Available").length,
      waiting: all.filter(t => t.status === "Waiting").length,
      occupied: all.filter(t => t.status === "Occupied").length,
      special: all.filter(t => t.status === "Special").length,
      oos: all.filter(t => t.status === "OutOfService").length,
      total: all.length,
    };
  }, [floorTables, activeFloor]);

  // ── Assignable reservations (for the "Assign Reservation" picker in normal mode) ──
  const usedReservationIds = new Set(floorTables.map(t => t.reservationId).filter(Boolean));
  const assignableReservations = reservations.filter(
    r => (r.status === "Pending" || r.status === "Confirmed") && !usedReservationIds.has(r.id)
  );

  // ── Drag handlers ──
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.moved = true;
        const newX = Math.max(35, dragRef.current.origX + dx);
        const newY = Math.max(20, dragRef.current.origY + dy);
        setDraftTables(prev => prev.map(t =>
          t.id === dragRef.current!.id ? { ...t, x: newX, y: newY } : t
        ));
      }
    };
    const handleUp = () => { dragRef.current = null; };
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
  }, []);

  // ── Auto-clear success message ──
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Enter/exit edit mode ──
  const enterEditMode = () => {
    setDraftTables([...floorTables]);
    setEditMode(true);
    setSelectedId(null);
    setModalStep("main");
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraftTables([]);
    setSelectedId(null);
  };

  const saveEdit = () => {
    saveFloorLayout(draftTables);
    setEditMode(false);
    setDraftTables([]);
    setSelectedId(null);
  };

  // ── Cancel selection mode ──
  const cancelSelection = () => {
    setPendingTableAssignment(null);
    setConfirmAssignState(null);
  };

  // ── Table click ──
  const handleTableClick = (table: FloorTable) => {
    if (dragRef.current?.moved) return;

    // ── SELECTION MODE: only available tables are clickable ──
    if (selectionMode) {
      if (table.status !== "Available") return; // dimmed, not clickable
      const reservation = pendingTableAssignment!.reservation;
      setConfirmAssignState({
        table,
        capacityWarning: reservation.guests > table.capacity,
        assignAnyway: false,
      });
      return;
    }

    // ── NORMAL MODE ──
    setSelectedId(table.id);
    setModalStep(editMode ? "editTable" : "main");
    setNotesInput(table.notes ?? "");
    setEditNumInput(table.number);
    setEditCapInput(String(table.capacity));
    setEditShapeInput(table.shape);
    setAssignSearch("");
    // Pre-populate special guest form if the table already has a guest
    if (table.specialGuest) {
      setSpecialForm({
        name: table.specialGuest.name,
        phone: table.specialGuest.phone ?? "",
        reason: table.specialGuest.reason,
        reservedBy: table.specialGuest.reservedBy,
      });
    } else {
      setSpecialForm({ name: "", phone: "", reason: "", reservedBy: "" });
    }
    setOosReason("");
    setConfirmRemoveSpecial(false);
    setConfirmReturnService(false);
    setConfirmSeatSpecial(false);
  };

  // ── Live update helper ──
  const applyUpdate = (id: string, updates: Partial<FloorTable>) => {
    if (editMode) {
      setDraftTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } else {
      updateFloorTable(id, updates);
    }
  };

  // ── Confirm table assignment (selection mode) ──
  const handleConfirmAssign = () => {
    if (!confirmAssignState || !pendingTableAssignment) return;
    const { table } = confirmAssignState;
    const { reservation, isMove, oldTableId, prevReservationStatus } = pendingTableAssignment;

    if (isMove && oldTableId && prevReservationStatus) {
      moveReservation(reservation.id, oldTableId, table.id, prevReservationStatus, ops, { number: table.number, floor: table.floor });
    } else {
      assignTableOp(reservation.id, table.id, ops, { number: table.number, floor: table.floor });
    }

    setConfirmAssignState(null);
    setPendingTableAssignment(null);
    setSelectedId(null);
    setSuccessMsg(`Table ${table.number} assigned to ${reservation.customer.name}`);
  };

  // ── Action handlers ──
  const handleAssignReservation = (reservationId: string) => {
    if (!selectedId || !selectedTable) return;
    assignTableOp(reservationId, selectedId, ops, { number: selectedTable.number, floor: selectedTable.floor });
    setModalStep("main");
    setSelectedId(null);
  };

  const handleMarkSeated = () => {
    if (!selectedId || !selectedTable) return;
    if (selectedTable.reservationId) {
      markGuestsSeated(selectedTable.reservationId, selectedId, ops);
    }
    setSelectedId(null);
  };

  const handleSeatSpecialGuest = () => {
    if (!selectedId) return;
    seatSpecialGuestOp(selectedId, ops);
    setConfirmSeatSpecial(false);
    setSelectedId(null);
  };

  const handleRemoveSpecialConfirmed = () => {
    if (!selectedId) return;
    releaseSpecialGuest(selectedId, ops);
    setConfirmRemoveSpecial(false);
    setSelectedId(null);
  };

  const handleReturnToServiceConfirmed = () => {
    if (!selectedId) return;
    returnTableToService(selectedId, ops);
    setConfirmReturnService(false);
    setSelectedId(null);
  };

  const handleMarkAvailable = () => {
    if (!selectedId || !selectedTable) return;
    if (selectedTable.reservationId && selectedTable.status === "Occupied") {
      completeReservation(selectedTable.reservationId, selectedId, ops);
    } else {
      applyUpdate(selectedId, {
        status: "Available", reservationId: undefined, assignedWaiter: undefined,
        assignedAt: undefined, seatedAt: undefined, specialGuest: undefined, outOfService: undefined,
      });
    }
    setSelectedId(null);
  };

  const handleMoveTable = (table: FloorTable, res: Reservation) => {
    const prevStatus = table.status === "Occupied" ? "Seated" : "Checked In";
    setPendingTableAssignment({
      reservation: res,
      isMove: true,
      oldTableId: table.id,
      prevReservationStatus: prevStatus as "Checked In" | "Seated",
    });
    setSelectedId(null);
    // Stay on floor plan — selection mode activates immediately
  };

  const handleSpecialGuest = () => {
    if (!selectedId || !selectedTable) return;
    const guestInfo = {
      name: specialForm.name,
      phone: specialForm.phone || undefined,
      reason: specialForm.reason,
      reservedBy: specialForm.reservedBy || (employee?.name ?? "Staff"),
      reservedAt: selectedTable.specialGuest?.reservedAt ?? new Date().toISOString(),
    };
    if (selectedTable.specialGuest) {
      // Editing existing special guest
      updateSpecialGuestOp(selectedId, guestInfo, ops);
    } else {
      // New special guest
      applyUpdate(selectedId, { status: "Special", specialGuest: guestInfo });
    }
    setModalStep("main");
  };

  const handleOutOfService = () => {
    if (!selectedId || !oosReason.trim()) return;
    const by = isOwner ? "Owner" : employee?.name ?? "Staff";
    markTableOutOfService(selectedId, oosReason, by, ops);
    setSelectedId(null);
  };

  const handleSaveNotes = () => {
    if (!selectedId) return;
    applyUpdate(selectedId, { notes: notesInput });
    setModalStep("main");
  };

  const handleSaveEditTable = () => {
    if (!selectedId) return;
    setDraftTables(prev => prev.map(t =>
      t.id === selectedId
        ? { ...t, number: editNumInput, capacity: parseInt(editCapInput) || t.capacity, shape: editShapeInput }
        : t
    ));
    setSelectedId(null);
    setModalStep("main");
  };

  const handleDeleteTable = () => {
    if (!selectedId) return;
    setDraftTables(prev => prev.filter(t => t.id !== selectedId));
    setSelectedId(null);
  };

  const handleAddTable = () => {
    const num = addForm.number || String((floorTables.filter(t => t.floor === activeFloor).length + 1));
    const canvas = CANVAS[activeFloor];
    const newTable: Omit<FloorTable, "id"> = {
      number: num,
      floor: activeFloor,
      shape: addForm.shape,
      capacity: parseInt(addForm.capacity) || 4,
      status: "Available",
      x: canvas.w / 2,
      y: canvas.h / 2,
    };
    const id = `ft${activeFloor}_${Date.now()}`;
    setDraftTables(prev => [...prev, { ...newTable, id }]);
    setModalStep("main");
    setAddForm({ number: "", shape: "round", capacity: "4" });
  };

  const getReservationForTable = (t: FloorTable) =>
    t.reservationId ? reservations.find(r => r.id === t.reservationId) : undefined;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] px-4 py-3 rounded-xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-sm font-medium shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table Selection Banner ── */}
      <AnimatePresence>
        {selectionMode && pendingTableAssignment && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="shrink-0 rounded-xl border border-primary/40 bg-primary/8 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary/70 font-medium uppercase tracking-widest">
                  {pendingTableAssignment.isMove ? "Moving Table" : "Choosing Table"}
                </p>
                <p className="text-sm text-white font-medium">
                  {pendingTableAssignment.reservation.customer.name}
                  <span className="text-muted-foreground font-normal">
                    {" "}· {pendingTableAssignment.reservation.guests} guests
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-lg ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Select an available table</span>
              </div>
            </div>
            <button
              onClick={cancelSelection}
              className="px-3 py-1.5 rounded-lg border border-white/15 text-muted-foreground hover:text-white hover:border-white/25 text-sm transition-colors"
            >
              Cancel Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      {!selectionMode && (
        <div className="flex flex-wrap items-start justify-between gap-3 shrink-0">
          <div>
            <h1 className="font-serif text-2xl text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary/70" />
              Floor Plan
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {editMode ? "Edit mode — drag tables, add or remove, then save." : "Click any table to view details and manage status."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !editMode && (
              <Button variant="outline" size="sm" onClick={enterEditMode} className="gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit Layout
              </Button>
            )}
            {editMode && (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" variant="outline" className="gap-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={saveEdit}>
                  <Save className="w-3.5 h-3.5" /> Save Layout
                </Button>
                <Button size="sm" className="gap-2" onClick={() => setModalStep("addTable")}>
                  <Plus className="w-3.5 h-3.5" /> Add Table
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Floor Tabs + Stats ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex bg-white/3 border border-white/8 rounded-lg p-1 gap-1">
          {([1, 2] as const).map(f => (
            <button
              key={f}
              onClick={() => { setActiveFloor(f); setSelectedId(null); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFloor === f
                  ? "bg-primary text-black shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Floor {f}
              <span className="ml-1.5 text-xs opacity-60">
                ({floorTables.filter(t => t.floor === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Stats chips */}
        {!selectionMode && (
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Available", val: stats.available, color: "#10b981" },
              { label: "Waiting",   val: stats.waiting,   color: "#f59e0b" },
              { label: "Occupied",  val: stats.occupied,  color: "#3b82f6" },
              { label: "Special",   val: stats.special,   color: "#a855f7" },
              { label: "OOS",       val: stats.oos,       color: "#52525b" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                style={{ borderColor: s.color + "44", background: s.color + "11" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                <span style={{ color: s.color }}>{s.val} {s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* In selection mode: show available count */}
        {selectionMode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {stats.available} tables available on Floor {activeFloor}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      {!selectionMode && (
        <div className="flex flex-wrap gap-4 shrink-0 px-1">
          {(Object.entries(STATUS_CFG) as [FloorTableStatus, typeof STATUS_CFG[FloorTableStatus]][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm border" style={{ background: v.bg, borderColor: v.border }} />
              {v.label}
            </div>
          ))}
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-white/5 bg-[#0c0c0c]">
        <div
          ref={canvasRef}
          className="relative"
          style={{ width: CANVAS[activeFloor].w, height: CANVAS[activeFloor].h }}
        >
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="1" fill="#444" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Decorative zone: Floor 1 dance floor */}
          {activeFloor === 1 && (
            <div className="absolute pointer-events-none flex items-center justify-center"
              style={{ left: 285, top: 65, width: 650, height: 600, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 20 }}>
              <span className="text-white/8 text-lg font-serif tracking-widest uppercase select-none">
                Dance Floor
              </span>
            </div>
          )}

          {/* Decorative zone: Floor 2 ring center */}
          {activeFloor === 2 && (
            <div className="absolute pointer-events-none flex items-center justify-center"
              style={{ left: 450 - 185, top: 380 - 185, width: 370, height: 370, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "50%" }}>
              <span className="text-white/8 text-base font-serif tracking-widest uppercase select-none">
                VIP Area
              </span>
            </div>
          )}

          {/* Tables */}
          <AnimatePresence>
            {activeTables.map(table => (
              <TableNode
                key={table.id}
                table={table}
                selected={selectedId === table.id}
                editMode={editMode}
                selectionMode={selectionMode}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragRef.current = {
                    id: table.id,
                    startX: e.clientX, startY: e.clientY,
                    origX: table.x, origY: table.y,
                    moved: false,
                  };
                }}
                onClick={() => handleTableClick(table)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Table Modal (normal mode) ── */}
      <AnimatePresence>
        {selectedTable && !selectionMode && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
          >
            <motion.div
              className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{ background: STATUS_CFG[selectedTable.status].bg, borderColor: STATUS_CFG[selectedTable.status].border }}>
                    <span className="text-white font-bold text-sm">{selectedTable.number}</span>
                  </div>
                  <div>
                    <p className="font-serif text-white font-medium">Table {selectedTable.number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Floor {selectedTable.floor} · {selectedTable.capacity} seats ·{" "}
                      <span style={{ color: STATUS_CFG[selectedTable.status].text }}>
                        {STATUS_CFG[selectedTable.status].label}
                      </span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-white transition-colors mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">

                {/* ── EDIT TABLE (Owner edit mode) ── */}
                {modalStep === "editTable" && (
                  <div className="space-y-3">
                    <p className="text-xs text-primary font-medium uppercase tracking-wider">Edit Table</p>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Table Number</Label>
                      <Input value={editNumInput} onChange={e => setEditNumInput(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Capacity</Label>
                      <Input type="number" min={1} max={30} value={editCapInput} onChange={e => setEditCapInput(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Shape</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["round","square","banquet"] as TableShape[]).map(s => (
                          <button key={s} onClick={() => setEditShapeInput(s)}
                            className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                              editShapeInput === s ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1" onClick={handleSaveEditTable}>Save</Button>
                      <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
                        onClick={handleDeleteTable}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── MAIN VIEW ── */}
                {modalStep === "main" && (
                  <>
                    {/* Notes display */}
                    {selectedTable.notes && (
                      <div className="bg-white/3 rounded-lg px-3 py-2 text-xs text-muted-foreground italic">
                        📝 {selectedTable.notes}
                      </div>
                    )}

                    {/* AVAILABLE */}
                    {selectedTable.status === "Available" && (
                      <div className="space-y-2">
                        <Button className="w-full h-9 justify-start gap-2 text-sm" variant="outline"
                          onClick={() => setModalStep("assign")}>
                          <Users className="w-4 h-4" /> Assign Reservation
                        </Button>
                        <Button className="w-full h-9 justify-start gap-2 text-sm" variant="outline"
                          onClick={() => setModalStep("special")}>
                          <Star className="w-4 h-4 text-purple-400" /> Reserve for Special Guest
                        </Button>
                        {!isWaiter && (
                          <Button className="w-full h-9 justify-start gap-2 text-sm" variant="outline"
                            onClick={() => setModalStep("oos")}>
                            <Wrench className="w-4 h-4 text-zinc-400" /> Mark Out of Service
                          </Button>
                        )}
                        <Button className="w-full h-9 justify-start gap-2 text-sm" variant="ghost"
                          onClick={() => setModalStep("notes")}>
                          <Pencil className="w-4 h-4" /> {selectedTable.notes ? "Edit Notes" : "Add Notes"}
                        </Button>
                      </div>
                    )}

                    {/* WAITING FOR GUESTS */}
                    {selectedTable.status === "Waiting" && (() => {
                      const res = getReservationForTable(selectedTable);
                      return (
                        <div className="space-y-3">
                          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 space-y-2">
                            {res ? (
                              <>
                                <Row label="Customer" val={res.customer.name} />
                                <Row label="Phone"    val={res.customer.phone} />
                                <Row label="Guests"   val={String(res.guests)} />
                                {res.specialRequests && (
                                  <Row label="Notes" val={res.specialRequests} />
                                )}
                                <Row label="Assigned" val={fmtTime(selectedTable.assignedAt)} />
                                <Row label="Waiting"  val={elapsed(selectedTable.assignedAt)} />
                              </>
                            ) : (
                              <Row label="Assigned" val={fmtTime(selectedTable.assignedAt)} />
                            )}
                          </div>
                          <Button className="w-full h-10 gap-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold"
                            onClick={handleMarkSeated}>
                            <CheckCircle2 className="w-4 h-4" /> Mark Guests Seated
                          </Button>
                          {res && (
                            <Button className="w-full h-9 gap-2 text-sm" variant="outline"
                              onClick={() => handleMoveTable(selectedTable, res)}>
                              <MoveRight className="w-4 h-4" /> Move to Another Table
                            </Button>
                          )}
                          <Button className="w-full h-9 gap-2 text-sm text-destructive" variant="ghost"
                            onClick={handleMarkAvailable}>
                            <X className="w-4 h-4" /> Cancel Assignment
                          </Button>
                        </div>
                      );
                    })()}

                    {/* OCCUPIED */}
                    {selectedTable.status === "Occupied" && (() => {
                      const res = getReservationForTable(selectedTable);
                      const waiters = employees.filter(e => e.role === "Waiter" && e.status === "Active");
                      return (
                        <div className="space-y-3">
                          <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 space-y-2">
                            {res ? (
                              <>
                                <Row label="Customer" val={res.customer.name} />
                                <Row label="Guests"   val={String(res.guests)} />
                                <Row label="Phone"    val={res.customer.phone} />
                              </>
                            ) : null}
                            <Row label="Seated at" val={fmtTime(selectedTable.seatedAt)} />
                            <Row label="Duration"  val={elapsed(selectedTable.seatedAt)} />
                            {selectedTable.assignedWaiter && (
                              <Row label="Waiter" val={selectedTable.assignedWaiter} />
                            )}
                          </div>
                          {!selectedTable.assignedWaiter && (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Assign Waiter</Label>
                              <div className="flex flex-wrap gap-1.5">
                                {waiters.map(w => (
                                  <button key={w.id} className="px-2.5 py-1 rounded-full border border-white/10 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                                    onClick={() => applyUpdate(selectedTable.id, { assignedWaiter: w.name })}>
                                    {w.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button className="w-full h-10 gap-2 text-sm font-semibold" variant="outline"
                            onClick={handleMarkAvailable}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark Table Available
                          </Button>
                          {res && (
                            <Button className="w-full h-9 gap-2 text-sm" variant="outline"
                              onClick={() => handleMoveTable(selectedTable, res)}>
                              <MoveRight className="w-4 h-4" /> Move to Another Table
                            </Button>
                          )}
                        </div>
                      );
                    })()}

                    {/* SPECIAL */}
                    {selectedTable.status === "Special" && selectedTable.specialGuest && (
                      <div className="space-y-3">
                        <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-3 space-y-2">
                          <Row label="Guest"       val={selectedTable.specialGuest.name} />
                          {selectedTable.specialGuest.phone && (
                            <Row label="Phone"     val={selectedTable.specialGuest.phone} />
                          )}
                          <Row label="Reason"      val={selectedTable.specialGuest.reason} />
                          <Row label="Reserved by" val={selectedTable.specialGuest.reservedBy} />
                          <Row label="At"          val={fmtTime(selectedTable.specialGuest.reservedAt)} />
                        </div>
                        {/* Seat confirmation */}
                        {confirmSeatSpecial ? (
                          <div className="space-y-2">
                            <p className="text-xs text-center text-muted-foreground">Mark guest as seated? Table will become Occupied.</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmSeatSpecial(false)}>Cancel</Button>
                              <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSeatSpecialGuest}>Confirm</Button>
                            </div>
                          </div>
                        ) : (
                          <Button className="w-full h-9 gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                            onClick={() => setConfirmSeatSpecial(true)}>
                            <CheckCircle2 className="w-4 h-4" /> Mark Guest Seated
                          </Button>
                        )}
                        <Button className="w-full h-9 gap-2 text-sm" variant="outline"
                          onClick={() => setModalStep("special")}>
                          <Pencil className="w-4 h-4" /> Edit Details
                        </Button>
                        {/* Remove confirmation */}
                        {confirmRemoveSpecial ? (
                          <div className="space-y-2">
                            <p className="text-xs text-center text-muted-foreground">Remove this special reservation? Table returns to Available.</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmRemoveSpecial(false)}>Cancel</Button>
                              <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleRemoveSpecialConfirmed}>Remove</Button>
                            </div>
                          </div>
                        ) : (
                          <Button className="w-full h-9 gap-2 text-sm text-destructive" variant="ghost"
                            onClick={() => setConfirmRemoveSpecial(true)}>
                            <X className="w-4 h-4" /> Remove Reservation
                          </Button>
                        )}
                      </div>
                    )}

                    {/* OUT OF SERVICE */}
                    {selectedTable.status === "OutOfService" && selectedTable.outOfService && (
                      <div className="space-y-3">
                        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 space-y-2">
                          <Row label="Reason"      val={selectedTable.outOfService.reason} />
                          <Row label="Disabled by" val={selectedTable.outOfService.disabledBy} />
                          <Row label="Since"       val={elapsed(selectedTable.outOfService.disabledAt)} />
                        </div>
                        {confirmReturnService ? (
                          <div className="space-y-2">
                            <p className="text-xs text-center text-muted-foreground">Return table to service? It will be marked Available.</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmReturnService(false)}>Cancel</Button>
                              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleReturnToServiceConfirmed}>Confirm</Button>
                            </div>
                          </div>
                        ) : (
                          <Button className="w-full h-9 gap-2 text-sm" variant="outline"
                            onClick={() => setConfirmReturnService(true)}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Return to Service
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── ASSIGN RESERVATION ── */}
                {modalStep === "assign" && (
                  <div className="space-y-3">
                    <button onClick={() => setModalStep("main")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <p className="text-xs text-muted-foreground">Select a reservation to assign to this table</p>
                    <Input
                      placeholder="Search guest name..."
                      value={assignSearch}
                      onChange={e => setAssignSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {assignableReservations
                        .filter(r => r.customer.name.toLowerCase().includes(assignSearch.toLowerCase()))
                        .map(r => (
                          <button key={r.id}
                            className="w-full text-left px-3 py-2.5 rounded-lg border border-white/8 bg-white/2 hover:border-primary/40 hover:bg-primary/5 transition-all"
                            onClick={() => handleAssignReservation(r.id)}>
                            <p className="text-sm text-white font-medium">{r.customer.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.guests} guests · {r.confirmationNumber}
                            </p>
                          </button>
                        ))}
                      {assignableReservations.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-6">No pending reservations</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── SPECIAL GUEST FORM ── */}
                {modalStep === "special" && (
                  <div className="space-y-3">
                    <button onClick={() => setModalStep("main")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Guest Name *</Label>
                      <Input value={specialForm.name} onChange={e => setSpecialForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Nora Al-Farsi" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Phone (optional)</Label>
                      <Input value={specialForm.phone} onChange={e => setSpecialForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+962 7X XXX XXXX" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reason / Notes *</Label>
                      <Input value={specialForm.reason} onChange={e => setSpecialForm(p => ({ ...p, reason: e.target.value }))}
                        placeholder="e.g. VIP Birthday, Corporate Event" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reserved By</Label>
                      <Input value={specialForm.reservedBy} onChange={e => setSpecialForm(p => ({ ...p, reservedBy: e.target.value }))}
                        placeholder={employee?.name ?? "Staff name"} className="h-8 text-sm" />
                    </div>
                    <Button className="w-full h-9 gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                      disabled={!specialForm.name.trim() || !specialForm.reason.trim()}
                      onClick={handleSpecialGuest}>
                      <Star className="w-4 h-4" /> Confirm Special Guest
                    </Button>
                  </div>
                )}

                {/* ── OUT OF SERVICE FORM ── */}
                {modalStep === "oos" && (
                  <div className="space-y-3">
                    <button onClick={() => setModalStep("main")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reason</Label>
                      {/* Quick-select presets */}
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {["Maintenance", "Broken Furniture", "Cleaning", "Reserved Area"].map(r => (
                          <button key={r} onClick={() => setOosReason(r)}
                            className={`py-1.5 px-2 rounded-lg border text-xs transition-all ${
                              oosReason === r ? "border-zinc-500 bg-zinc-700/50 text-white" : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <Input value={oosReason} onChange={e => setOosReason(e.target.value)}
                        placeholder="Other — type a custom reason..." className="h-8 text-sm" />
                    </div>
                    <Button className="w-full h-9 gap-2 text-sm border-zinc-600 text-zinc-300 hover:bg-zinc-700" variant="outline"
                      disabled={!oosReason.trim()} onClick={handleOutOfService}>
                      <Wrench className="w-4 h-4" /> Mark Out of Service
                    </Button>
                  </div>
                )}

                {/* ── NOTES FORM ── */}
                {modalStep === "notes" && (
                  <div className="space-y-3">
                    <button onClick={() => setModalStep("main")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <textarea
                      rows={4}
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      placeholder="Table notes (e.g. near speaker, step access)..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                    />
                    <Button className="w-full h-9 text-sm" onClick={handleSaveNotes}>Save Notes</Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Table Assignment Modal (selection mode) ── */}
      <AnimatePresence>
        {confirmAssignState && pendingTableAssignment && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setConfirmAssignState(null); }}
          >
            <motion.div
              className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-white/6">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-serif text-lg text-white">
                    {pendingTableAssignment.isMove ? "Move to Table" : "Assign"} Table {confirmAssignState.table.number}?
                  </p>
                  <button onClick={() => setConfirmAssignState(null)}
                    className="text-muted-foreground hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Floor {confirmAssignState.table.floor} · {confirmAssignState.table.capacity} seats
                </p>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Reservation info */}
                <div className="bg-white/3 rounded-xl border border-white/8 divide-y divide-white/5">
                  <div className="px-3 py-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="text-white font-medium">{pendingTableAssignment.reservation.customer.name}</span>
                  </div>
                  <div className="px-3 py-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="text-white">{pendingTableAssignment.reservation.guests}</span>
                  </div>
                  <div className="px-3 py-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Table</span>
                    <span className="text-white">Floor {confirmAssignState.table.floor} · Table {confirmAssignState.table.number}</span>
                  </div>
                  <div className="px-3 py-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-white">{confirmAssignState.table.capacity} seats</span>
                  </div>
                </div>

                {/* Capacity warning */}
                {confirmAssignState.capacityWarning && !confirmAssignState.assignAnyway && (
                  <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">
                      This table seats {confirmAssignState.table.capacity} guests, but this reservation is for{" "}
                      <strong>{pendingTableAssignment.reservation.guests}</strong> guests.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {confirmAssignState.capacityWarning && !confirmAssignState.assignAnyway ? (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full h-9 text-sm" onClick={() => setConfirmAssignState(null)}>
                      Choose Another Table
                    </Button>
                    <Button className="w-full h-9 text-sm bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setConfirmAssignState(prev => prev ? { ...prev, assignAnyway: true } : null)}>
                      Assign Anyway
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full h-10 gap-2 text-sm font-semibold" onClick={handleConfirmAssign}>
                      <CheckCircle2 className="w-4 h-4" />
                      {pendingTableAssignment.isMove ? "Confirm Move" : "Confirm Assignment"}
                    </Button>
                    <Button variant="ghost" className="w-full h-9 text-sm" onClick={() => setConfirmAssignState(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Table Modal (edit mode) ── */}
      <AnimatePresence>
        {modalStep === "addTable" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalStep("main"); }}
          >
            <motion.div
              className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
                <p className="font-serif text-white font-medium">Add Table — Floor {activeFloor}</p>
                <button onClick={() => setModalStep("main")} className="text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Table Number</Label>
                  <Input value={addForm.number} onChange={e => setAddForm(p => ({ ...p, number: e.target.value }))}
                    placeholder="Auto-assigned if blank" className="h-8 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Shape</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["round","square","banquet"] as TableShape[]).map(s => (
                      <button key={s} onClick={() => setAddForm(p => ({ ...p, shape: s }))}
                        className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                          addForm.shape === s ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Capacity</Label>
                  <Input type="number" min={1} max={30} value={addForm.capacity}
                    onChange={e => setAddForm(p => ({ ...p, capacity: e.target.value }))} className="h-8 text-sm" />
                </div>
                <Button className="w-full h-9 gap-2 mt-1" onClick={handleAddTable}>
                  <Plus className="w-4 h-4" /> Add to Canvas
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small helper component ──
function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-white text-right truncate">{val}</span>
    </div>
  );
}
