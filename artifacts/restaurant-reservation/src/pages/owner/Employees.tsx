import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployeeStore } from "@/services/employeeStore";
import { Employee, EmployeeRole, EmployeeStatus } from "@/services/mockData";
import { Search, Plus, X, Pencil, Eye, UserX, Trash2 } from "lucide-react";

type ModalMode = "add" | "edit" | "view" | null;

const ROLES: EmployeeRole[] = ["Owner", "Doorman", "Waiter"];
const STATUSES: EmployeeStatus[] = ["Active", "Inactive"];

const emptyForm = {
  name: "",
  username: "",
  phone: "",
  password: "",
  role: "Doorman" as EmployeeRole,
  status: "Active" as EmployeeStatus,
};

const ROLE_STYLES: Record<EmployeeRole, string> = {
  Owner:   "bg-primary/10 text-primary border-primary/20",
  Doorman: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Waiter:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === "Active"
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        : "bg-muted text-muted-foreground border border-border"
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

export default function Employees() {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useEmployeeStore();
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setSelectedEmployee(null); setModalMode("add"); };
  const openEdit = (emp: Employee) => { setSelectedEmployee(emp); setForm({ ...emp, password: "" }); setModalMode("edit"); };
  const openView = (emp: Employee) => { setSelectedEmployee(emp); setModalMode("view"); };
  const closeModal = () => { setModalMode(null); setSelectedEmployee(null); };

  const handleSave = () => {
    if (!form.name || !form.username) return;
    if (modalMode === "add") {
      addEmployee({ name: form.name, username: form.username, phone: form.phone, role: form.role, status: form.status });
    } else if (modalMode === "edit" && selectedEmployee) {
      updateEmployee(selectedEmployee.id, { name: form.name, username: form.username, phone: form.phone, role: form.role, status: form.status });
    }
    closeModal();
  };

  const handleDelete = (id: string) => { removeEmployee(id); setConfirmDelete(null); };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {employees.filter((e) => e.status === "Active").length} active staff members
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <Card className="border-white/5">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, username, or role..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                {["Employee", "Username", "Phone", "Role", "Status", "Date Added", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No employees found.</td></tr>
              ) : filtered.map((emp) => (
                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-sm shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{emp.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.phone || "—"}</td>
                  <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                  <td className="px-6 py-4"><StatusBadge status={emp.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.dateAdded}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(emp)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateEmployee(emp.id, { status: emp.status === "Active" ? "Inactive" : "Active" })}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-amber-400 transition-colors" title={emp.status === "Active" ? "Disable" : "Enable"}>
                        <UserX className="w-4 h-4" />
                      </button>
                      {confirmDelete === emp.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button onClick={() => handleDelete(emp.id)} className="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground">Confirm</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded text-xs border border-border">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modalMode === "add" || modalMode === "edit") && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}>
              <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="font-serif text-xl text-white">{modalMode === "add" ? "Add Employee" : "Edit Employee"}</h2>
                  <button onClick={closeModal} className="text-muted-foreground hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Full Name</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amara Diallo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="amara.d" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+962 7 9000 0000" />
                    </div>
                    {modalMode === "add" && (
                      <div className="space-y-2 col-span-2">
                        <Label>Password</Label>
                        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as EmployeeRole })}
                        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
                        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-white/5">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.username}>
                    {modalMode === "add" ? "Add Employee" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {modalMode === "view" && selectedEmployee && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}>
              <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="font-serif text-xl text-white">Employee Details</h2>
                  <button onClick={closeModal} className="text-muted-foreground hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-2xl">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">{selectedEmployee.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{selectedEmployee.username}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground mb-1">Phone</p><p className="text-white">{selectedEmployee.phone || "—"}</p></div>
                    <div><p className="text-muted-foreground mb-1">Date Added</p><p className="text-white">{selectedEmployee.dateAdded}</p></div>
                    <div><p className="text-muted-foreground mb-1">Role</p><RoleBadge role={selectedEmployee.role} /></div>
                    <div><p className="text-muted-foreground mb-1">Status</p><StatusBadge status={selectedEmployee.status} /></div>
                  </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-white/5">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Close</Button>
                  <Button className="flex-1" onClick={() => { closeModal(); openEdit(selectedEmployee); }}>Edit Employee</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
