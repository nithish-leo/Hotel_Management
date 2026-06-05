import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BedDouble, Plus, Edit2, Trash2, Search, SlidersHorizontal, Loader2, IndianRupee } from 'lucide-react';
import { Room, RoomType } from '@/types';

export function AdminRooms() {
  const { isAdmin } = useAdminAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [typeId, setTypeId] = useState('');
  const [status, setStatus] = useState('Available');
  const [floor, setFloor] = useState('1');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  const { success, error, info } = useToast();

  const fetchRoomsCatalog = async () => {
    try {
      const [roomsRes, typesRes] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/admin/room-types')
      ]);

      if (roomsRes.ok && typesRes.ok) {
        setRooms(await roomsRes.json());
        const tData: RoomType[] = await typesRes.json();
        setRoomTypes(tData);
        if (tData.length > 0) {
          setTypeId(String(tData[0].type_id));
        }
      } else {
        error("Failed to query records");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsCatalog();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    if (roomTypes.length > 0) {
      setTypeId(String(roomTypes[0].type_id));
    }
    setStatus('Available');
    setFloor('1');
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.room_number);
    setTypeId(String(room.type_id));
    setStatus(room.status);
    setFloor(String(room.floor));
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !typeId || !floor) {
      error("Please check and make sure all form fields are completed");
      return;
    }

    setSaving(true);
    const payload = {
      room_number: roomNumber,
      type_id: Number(typeId),
      status,
      floor: Number(floor),
    };

    try {
      const url = editingRoom ? `/api/admin/rooms/${editingRoom.room_id}` : '/api/admin/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success(editingRoom ? `Room ${roomNumber} details updated` : `Room ${roomNumber} added to registry`);
        setModalOpen(false);
        fetchRoomsCatalog();
      } else {
        error("Submit request rejected by server");
      }
    } catch (err) {
      error("Network error executing action");
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (roomId: number) => {
    setDeletingRoomId(roomId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoomId) return;

    try {
      const response = await fetch(`/api/admin/rooms/${deletingRoomId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        success("Room record successfully deleted");
        fetchRoomsCatalog();
      } else {
        error("Deletion request rejected by server");
      }
    } catch (err) {
      error("Network failure during deletion");
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingRoomId(null);
    }
  };

  // Filter lists
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort();

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.includes(searchQuery) || 
                          (room.type_name && room.type_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || String(room.type_id) === selectedType;
    const matchesFloor = selectedFloor === 'All' || String(room.floor) === selectedFloor;

    return matchesSearch && matchesType && matchesFloor;
  });

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
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Rooms Ledger registry</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Suite Registrars</h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-4.5 py-2.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-105 hover:shadow-[#c9a84c]/10"
        >
          <Plus size={15} className="stroke-[2.5]" />
          Record New Suite
        </button>
      </div>

      {/* Filter and constraints bar */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={14} className="text-[#c9a84c]" />
          <p className="text-xs font-bold text-[#0a1f44] uppercase tracking-wide">Registry Constraints</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Search Room No / Type</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search suite number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
              />
            </div>
          </div>

          {/* Type dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Verify Category</span>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                info("Switched category view filter");
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
            >
              <option value="All">All Categories</option>
              {roomTypes.map(t => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          {/* Floor selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Verify Floor level</span>
            <select
              value={selectedFloor}
              onChange={e => {
                setSelectedFloor(e.target.value);
                info("Switched floor location filter");
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
            >
              <option value="All">All Floors</option>
              {floors.map(f => (
                <option key={f} value={f}>{f === 4 ? `Penthouse (Floor ${f})` : `Floor ${f}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table block display */}
      {filteredRooms.length === 0 ? (
        <EmptyState message="No recorded rooms found matching search terms." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Room Number</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Suite category</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Location Level</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">stay rate / day</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-center">Status state</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Librative triggers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredRooms.map((room) => (
                    <tr key={room.room_id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-800">Suite {room.room_number}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-400 font-sans tracking-wide uppercase">{room.type_name || 'DELUXE'}</td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-bold uppercase">
                        Floor {room.floor === 4 ? '4 (VIP Penthouse)' : room.floor}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-[#c9a84c]">
                        ₹{(room.price_per_day || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={room.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => openEditModal(room)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-slate-700 transition-all cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => triggerDelete(room.room_id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg hover:text-rose-600 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
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
                {editingRoom ? `Edit Suite ${editingRoom.room_number}` : 'Record New Suite'}
              </h3>

              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4">
                
                {/* Suite number */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Suite Number Label</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#c9a84c] focus:outline-none bg-slate-50/20"
                  />
                </div>

                {/* Suite Category dropdown */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Select Suite Category</span>
                  <select
                    value={typeId}
                    onChange={e => setTypeId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
                  >
                    {roomTypes.map(t => (
                      <option key={t.type_id} value={t.type_id}>
                        {t.type_name} (₹{t.price_per_day.toLocaleString()} / Day)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Floor */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Resort Level / Floor</span>
                  <select
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 focus:outline-none text-slate-700"
                  >
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4 (VIP Penthouse level)</option>
                  </select>
                </div>

                {/* Suite Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-600 tracking-wide">Suite Status state</span>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-[#c9a84c] rounded-xl bg-slate-50/20 focus:outline-none text-slate-700 font-bold"
                  >
                    <option value="Available">Available for selection</option>
                    <option value="Booked">Occupied / Booked</option>
                  </select>
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
                        Saving records...
                      </>
                    ) : (
                      'Commit Records'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation popup */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Verify Destructive Action"
        message="Are you sure you want to permanently erase this Suite record from the Hotel Grand databases? This action cannot be reverted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingRoomId(null);
        }}
      />

    </div>
  );
}
