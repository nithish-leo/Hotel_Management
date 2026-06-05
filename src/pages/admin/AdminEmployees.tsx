import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Users, Plus, Edit2, Trash2, Phone, Briefcase, IndianRupee, Loader2 } from 'lucide-react';
import { Employee } from '@/types';

export function AdminEmployees() {
  const { isAdmin } = useAdminAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Manager');
  const [salary, setSalary] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { success, error, info } = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees');
      if (response.ok) {
        setEmployees(await response.json());
      } else {
        error("Failed to query staff rosters");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setRole('Manager');
    setSalary('');
    setPhone('');
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.emp_name);
    setRole(emp.role);
    setSalary(String(emp.salary));
    setPhone(emp.phone);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !salary || !phone) {
      error("Please check and complete all form entries");
      return;
    }

    setSaving(true);
    const payload = {
      emp_name: name,
      role,
      salary: Number(salary),
      phone,
    };

    try {
      const url = editingEmployee ? `/api/admin/employees/${editingEmployee.employee_id}` : '/api/admin/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingEmployee ? `Staff profile: ${name} updated` : `${name} recruited successfully`);
        setModalOpen(false);
        fetchEmployees();
      } else {
        error("Action rejected by server database files");
      }
    } catch (err) {
      error("Network timeout executing action");
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (id: number) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/admin/employees/${deletingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        success("Employee profile permanently erased from catalogs");
        fetchEmployees();
      } else {
        error("Erasing request rejected by server");
      }
    } catch (err) {
      error("Network failure during deletion flow");
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const getRoleColors = (r: string) => {
    const norm = r.toLowerCase();
    if (norm === 'manager') return 'bg-indigo-50 border-indigo-200/50 text-indigo-700';
    if (norm === 'receptionist') return 'bg-emerald-50 border-emerald-200/50 text-emerald-700';
    if (norm === 'chef') return 'bg-orange-50 border-orange-200/50 text-orange-700';
    if (norm === 'housekeeping') return 'bg-violet-50 border-violet-200/50 text-violet-700';
    if (norm === 'security') return 'bg-rose-50 border-rose-200/50 text-rose-700';
    return 'bg-slate-50 border-slate-200/50 text-slate-700';
  };

  if (isAdmin === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60 font-sans">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">System Human resources card roster</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Staff Roster</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-4.5 py-2.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-105 hover:shadow-[#c9a84c]/10"
        >
          <Plus size={15} className="stroke-[2.5]" />
          Enroll Staff Profile
        </button>
      </div>

      {employees.length === 0 ? (
        <EmptyState message="Currently there are no dynamic staff enrolled." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">ID Code</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Staff Name</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Role Segment</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Direct Contact Phone</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Direct Salary</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Verification trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <AnimatePresence>
                  {employees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono font-bold text-[#0a1f44]">#HB-EMP-{emp.employee_id}</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-850">{emp.emp_name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColors(emp.role)}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-650 font-semibold">{emp.phone}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">
                        ₹{(emp.salary || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 rounded-lg cursor-pointer transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => triggerDelete(emp.employee_id)}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />

              <h3 className="text-lg font-bold text-[#0a1f44] tracking-tight pb-3 border-b border-slate-100">
                {editingEmployee ? `Edit Profile: ${editingEmployee.emp_name}` : 'Enroll Staff Profile'}
              </h3>

              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4 font-sans">
                
                {/* Full name */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Staff Full Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Walker"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Role segment */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Select Staff Duty/Role</span>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Chef">Chef</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                {/* Salary */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Monthly Salary (INR)</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Phone contact */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Contact Phone</span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Buttons block */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4.5 py-2.5 bg-[#c9a84c] hover:brightness-105 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving rosters...
                      </>
                    ) : (
                      'Commit Duty Roster'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Verify Destructive Action"
        message="Are you sure you want to permanently erase this Staff member from your active lists?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />

    </div>
  );
}
