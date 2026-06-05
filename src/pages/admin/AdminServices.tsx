import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Sparkles, Plus, Edit2, Trash2, IndianRupee, Loader2 } from 'lucide-react';
import { Service } from '@/types';

export function AdminServices() {
  const { isAdmin } = useAdminAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [charge, setCharge] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { success, error, info } = useToast();

  const fetchServicesCatalog = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        setServices(await response.json());
      } else {
        error("Failed to query catalog databases");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesCatalog();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setCharge('');
    setModalOpen(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    setName(svc.service_name);
    setCharge(String(svc.service_charge));
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !charge) {
      error("Please check and complete all form entries");
      return;
    }

    setSaving(true);
    const payload = {
      service_name: name,
      service_charge: Number(charge),
    };

    try {
      const url = editingService ? `/api/admin/services/${editingService.service_id}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingService ? `Service profile updated` : `Service ${name} listed successfully`);
        setModalOpen(false);
        fetchServicesCatalog();
      } else {
        error("System rejected the record input");
      }
    } catch (err) {
      error("Network failure saving service entries");
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
      const response = await fetch(`/api/admin/services/${deletingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        success("Service permanently deleted from the resident catalogs");
        fetchServicesCatalog();
      } else {
        error("Action rejected by database rules");
      }
    } catch (err) {
      error("Network query logging error during deletion");
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
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
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">System dynamic services pricing configuration</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Active Services</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-4.5 py-2.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-105 hover:shadow-[#c9a84c]/10"
        >
          <Plus size={15} className="stroke-[2.5]" />
          Record New Service
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState message="Currently there are no dynamic hotel services recorded in catalogs." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Service ID</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Service Segment Name</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Current Base Charge</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-center">Description context</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Librative triggers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <AnimatePresence>
                  {services.map((svc) => (
                    <tr key={svc.service_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono font-bold text-[#0a1f44]">#HB-SVC-{svc.service_id}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-850 text-sm">{svc.service_name}</td>
                      <td className="py-4 px-6 text-sm font-bold text-[#c9a84c]">
                        ₹{(svc.service_charge || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-550 max-w-xs truncate text-center">Active 5-Star guest comforts on call</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => openEditModal(svc)}
                            className="p-1.5 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 rounded-lg cursor-pointer transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => triggerDelete(svc.service_id)}
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
                {editingService ? `Edit Service: ${editingService.service_name}` : 'Record New Service'}
              </h3>

              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4">
                
                {/* Service name */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Service Title Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Spa Therapy"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Service Charge */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Dynamic Scheduled Charge (INR)</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={charge}
                    onChange={e => setCharge(e.target.value)}
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
                        Saving configurations...
                      </>
                    ) : (
                      'Record Service'
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
        message="Are you sure you want to permanently erase this dynamic Comfort Service from the Hotel Grand resident database?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />

    </div>
  );
}
