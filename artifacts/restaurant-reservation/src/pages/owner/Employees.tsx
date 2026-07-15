import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployeeStore } from "@/services/employeeStore";
import { Employee, EmployeeRole, EmployeeStatus } from "@/services/mockData";
import {
  Search, Plus, X, Pencil, Eye, UserX, UserCheck, Trash2,
  KeyRound, AlertTriangle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

// Owner role is NOT available for new employees — only Doorman and Waiter
const ADD_ROLES: EmployeeRole[] = ["Doorman", "Waiter"];
const ALL_ROLES: EmployeeRole[] = ["Doorman", "Waiter"]; // edit excludes Owner too
const STATUSES: EmployeeStatus[] = ["Active", "Inactive"];

const ROLE_STYLES: Record<EmployeeRole, string> = {
  Owner:   "bg-primary/10 text-primary border-primary/20",
  Doorman: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Waiter:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

// ─── Badge components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      status === "Active"
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-zinc-700/40 text-zinc-400 border-zinc-600/30"
    }`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: EmployeeRole }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_STYLES[role]}`}>
      {role}
    </span>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  variant = "danger",
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="p-6 space-y-4">
            <div className={`flex items-start gap-3 rounded-xl p-3 ${
              variant === "danger" ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"
            }`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${variant === "danger" ? "text-red-400" : "text-amber-400"}`} />
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{message}</p>
              </div>
            </div>
            {children}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button
              className={`flex-1 ${variant === "danger" ? "bg-destructive hover:bg-destructive/90" : "bg-amber-600 hover:bg-amber-700"}`}
              onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface EmployeeFormProps {
  mode: "add" | "edit";
  employee?: Employee;
  onSave: (data: { name: string; username: string; phone: string; role: EmployeeRole; status: EmployeeStatus; password?: string }) => void;
  onClose: () => void;
}

function EmployeeFormModal({ mode, employee, onSave, onClose }: EmployeeFormProps) {
  const [form, setForm] = useState({
    name:     employee?.name     ?? "",
    username: employee?.username ?? "",
    phone:    employee?.phone    ?? "",
    password: "",
    confirmPassword: "",
    role:     (employee?.role === "Owner" ? "Doorman" : employee?.role) as EmployeeRole ?? "Doorman" as EmployeeRole,
    status:   employee?.status ?? "Active" as EmployeeStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (mode === "add") {
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 6) e.password = "Minimum 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      password: mode === "add" ? form.password : undefined,
    });
  };

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-serif text-xl text-white">
              {mode === "add" ? "Add Employee" : "Edit Employee"}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Amara Diallo" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input value={form.username} onChange={e => set("username", e.target.value)} placeholder="amara.d" />
                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+962 7 9000 0000" />
              </div>
              {mode === "add" && (
                <>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <Input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="••••••••" />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <select value={form.role} onChange={e => set("role", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  {ADD_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {mode === "edit" && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-white/5">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>
              {mode === "add" ? "Add Employee" : "Save Changes"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

function ResetPasswordModal({
  employee,
  onConfirm,
  onClose,
}: {
  employee: Employee;
  onConfirm: (newPassword: string) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");

  const handleSubmit = () => {
    if (!password) { setError("Password is required"); return; }
    if (password.length < 6) { setError("Minimum 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    onConfirm(password);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}>
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-serif text-lg text-white">Reset Password</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a new password for <span className="text-white font-medium">{employee.name}</span>.
            </p>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">New Password</Label>
              <Input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} placeholder="••••••••" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit}>Reset Password</Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ConfirmAction = "delete" | "deactivate" | "activate";

export default function Employees() {
  const {
    employees, addEmployee, updateEmployee, activateEmployee,
    deactivateEmployee, deleteEmployee, resetEmployeePassword,
  } = useEmployeeStore();

  const [search, setSearch]         = useState("");
  const [modalMode, setModalMode]   = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected]     = useState<Employee | null>(null);
  const [confirm, setConfirm]       = useState<{ action: ConfirmAction; emp: Employee } | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setSelected(null); setModalMode("add"); };
  const openEdit = (emp: Employee) => { setSelected(emp); setModalMode("edit"); };
  const openView = (emp: Employee) => { setSelected(emp); setModalMode("view"); };
  const close    = () => { setModalMode(null); setSelected(null); };

  const handleSave = (data: { name: string; username: string; phone: string; role: EmployeeRole; status: EmployeeStatus; password?: string }) => {
    if (modalMode === "add") {
      addEmployee({ name: data.name, username: data.username, phone: data.phone, role: data.role, status: data.status, password: data.password });
    } else if (modalMode === "edit" && selected) {
      updateEmployee(selected.id, { name: data.name, username: data.username, phone: data.phone, role: data.role, status: data.status });
    }
    close();
  };

  const handleConfirmAction = () => {
    if (!confirm) return;
    const { action, emp } = confirm;
    if (action === "delete")     deleteEmployee(emp.id);
    if (action === "deactivate") deactivateEmployee(emp.id);
    if (action === "activate")   activateEmployee(emp.id);
    setConfirm(null);
  };

  const CONFIRM_CFG: Record<ConfirmAction, { title: string; message: string; label: string; variant: "danger" | "warning" }> = {
    delete:     { title: "Delete Employee",     message: "This will permanently remove the employee from the system.", label: "Delete", variant: "danger" },
    deactivate: { title: "Deactivate Account",  message: "This employee will no longer be able to log in.",            label: "Deactivate", variant: "warning" },
    activate:   { title: "Activate Account",    message: "This employee will be able to log in again.",                label: "Activate", variant: "warning" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {employees.filter(e => e.status === "Active").length} active ·{" "}
            {employees.filter(e => e.status === "Inactive").length} inactive
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {/* Search */}
      <Card className="border-white/5">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, username, or role..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                {["Employee", "Username", "Role", "Status", "Since", "Actions"].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No employees found.</td></tr>
              ) : filtered.map(emp => (
                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`hover:bg-white/[0.02] transition-colors ${emp.status === "Inactive" ? "opacity-60" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm shrink-0 ${
                        emp.status === "Active" ? "bg-primary/10 text-primary" : "bg-zinc-700/40 text-zinc-500"
                      }`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{emp.name}</p>
                        {emp.phone && <p className="text-xs text-muted-foreground">{emp.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{emp.username}</td>
                  <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                  <td className="px-6 py-4"><StatusBadge status={emp.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{emp.dateAdded}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(emp)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Don't allow editing Owner role */}
                      {emp.role !== "Owner" && (
                        <>
                          <button onClick={() => openEdit(emp)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setResetTarget(emp)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-amber-400 transition-colors" title="Reset Password">
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {emp.status === "Active" ? (
                            <button onClick={() => setConfirm({ action: "deactivate", emp })}
                              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400 transition-colors" title="Deactivate">
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => setConfirm({ action: "activate", emp })}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors" title="Activate">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setConfirm({ action: "delete", emp })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {(modalMode === "add" || modalMode === "edit") && (
          <EmployeeFormModal
            mode={modalMode}
            employee={selected ?? undefined}
            onSave={handleSave}
            onClose={close}
          />
        )}
      </AnimatePresence>

      {/* View modal */}
      <AnimatePresence>
        {modalMode === "view" && selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={close} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}>
              <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="font-serif text-xl text-white">Employee Details</h2>
                  <button onClick={close} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl ${
                      selected.status === "Active" ? "bg-primary/10 text-primary" : "bg-zinc-700/40 text-zinc-500"
                    }`}>
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">{selected.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{selected.username}</p>
                    </div>
                    <div className="ml-auto"><StatusBadge status={selected.status} /></div>
                  </div>
                  <div className="bg-black/20 rounded-xl border border-white/5 divide-y divide-white/5">
                    {[
                      { label: "Phone",      value: selected.phone || "—" },
                      { label: "Role",       value: <RoleBadge role={selected.role} /> },
                      { label: "Status",     value: <StatusBadge status={selected.status} /> },
                      { label: "Date Added", value: selected.dateAdded },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span>{typeof value === "string" ? <span className="text-white">{value}</span> : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selected.role !== "Owner" && (
                  <div className="flex gap-3 p-6 border-t border-white/5">
                    <Button variant="outline" className="flex-1" onClick={close}>Close</Button>
                    <Button className="flex-1" onClick={() => { close(); openEdit(selected); }}>
                      Edit Employee
                    </Button>
                  </div>
                )}
                {selected.role === "Owner" && (
                  <div className="p-6 border-t border-white/5">
                    <Button variant="outline" className="w-full" onClick={close}>Close</Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation dialogs */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            title={CONFIRM_CFG[confirm.action].title}
            message={`${CONFIRM_CFG[confirm.action].message} (${confirm.emp.name})`}
            confirmLabel={CONFIRM_CFG[confirm.action].label}
            variant={CONFIRM_CFG[confirm.action].variant}
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      {/* Reset Password modal */}
      <AnimatePresence>
        {resetTarget && (
          <ResetPasswordModal
            employee={resetTarget}
            onConfirm={pw => { resetEmployeePassword(resetTarget.id, pw); setResetTarget(null); }}
            onClose={() => setResetTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
