import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tag, Plus, Edit2, Trash2, IndianRupee, Loader2 } from 'lucide-react';
import { RoomType } from '@/types';

export function AdminRoomTypes() {
  const { isAdmin } = useAdminAuth();
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { success, error, info } = useToast();

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/admin/room-types');
      if (response.ok) {
        setTypes(await response.json());
      } else {
        error("Failed to query Category database");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const openAddModal = () => {
    setEditingType(null);
    setName('');
    setPrice('');
    setCapacity('2');
    setModalOpen(true);
  };

  const openEditModal = (t: RoomType) => {
    setEditingType(t);
    setName(t.type_name);
    setPrice(String(t.price_per_day));
    setCapacity(String(t.capacity));
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !capacity) {
      error("Please check and complete all form fields");
      return;
    }

    setSaving(true);
    const payload = {
      type_name: name,
      price_per_day: Number(price),
      capacity: Number(capacity),
    };

    try {
      const url = editingType ? `/api/admin/room-types/${editingType.type_id}` : '/api/admin/room-types';
      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingType ? `Category ${name} details successfully updated` : `Category ${name} created`);
        setModalOpen(false);
        fetchRoomTypes();
      } else {
        error("Update request rejected by server");
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
      const response = await fetch(`/api/admin/room-types/${deletingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        success("Category record successfully deleted");
        fetchRoomTypes();
      } else {
        error("Deletion request rejected by server");
      }
    } catch (err) {
      error("Network failure during deletion process");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Suite pricing & category ledger</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Suite Categories</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-4.5 py-2.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-105 hover:shadow-[#c9a84c]/10"
        >
          <Plus size={15} className="stroke-[2.5]" />
          Record New Category
        </button>
      </div>

      {/* Grid container with card summary elements */}
      {types.length === 0 ? (
        <EmptyState message="Currently there are no recorded Suite types." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {types.map((t, idx) => (
              <motion.div
                key={t.type_id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200/50 p-6 overflow-hidden shadow-sm relative hover:shadow-md hover:border-[#c9a84c]/40 transition-all flex flex-col justify-between group"
              >
                {/* Visual line decor */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                      <Tag size={15} />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">CAPACITY: {t.capacity} GUESTS</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-4 group-hover:text-[#0a1f44] transition-colors">{t.type_name}</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">Recorded with five-star luxury amenities including state-of-the-art bedding layout, modern interior furniture, and climate control configurations.</p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 font-sans tracking-wide uppercase">Scheduled Rate</span>
                    <p className="text-[#c9a84c] text-lg font-bold flex items-center gap-0.5 mt-0.5 font-sans">
                      <IndianRupee size={15} className="stroke-[2.5]" />
                      {(t.price_per_day || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 hover:bg-slate-50 border border-slate-100 hover:text-slate-800 rounded-lg cursor-pointer transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => triggerDelete(t.type_id)}
                      className="p-1.5 hover:bg-rose-50 border border-slate-100 hover:text-rose-600 rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
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
                {editingType ? `Edit Category ${editingType.type_name}` : 'Record New Category'}
              </h3>

              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4">
                
                {/* Category name */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Category Name Title</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Premium Suite"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Price per day */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Stay Rate / Night (INR)</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Guest capacity */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Resident Guest Capacity</span>
                  <select
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons (Double bedding)</option>
                    <option value="6">6 Persons (Imperial Suite cap)</option>
                  </select>
                </div>

                {/* Buttons block */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Dismiss ACTION
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4.5 py-2.5 bg-[#c9a84c] hover:brightness-105 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving types...
                      </>
                    ) : (
                      'Save Category'
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
        message="Are you sure you want to permanently erase this Suite Category configuration from the Hotel Grand database?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />

    </div>
  );
}
