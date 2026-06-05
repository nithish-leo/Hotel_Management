import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Compass, IndianRupee, Heart, Calendar, CheckSquare, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Room, RoomType } from '@/types';

interface RoomsProps {
  onRouteChange: (route: string) => void;
}

export function CustomerRooms({ onRouteChange }: RoomsProps) {
  const { isCustomer, user } = useCustomerAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(() => {
    const preselected = localStorage.getItem('pre_selected_booking_room_type');
    if (preselected) {
      localStorage.removeItem('pre_selected_booking_room_type');
      return preselected;
    }
    return 'All';
  });
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('15000');

  // Booking Modal State
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeImages, setActiveImages] = useState<Record<number, number>>({});

  const { success, error, info } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.all([
          fetch('/api/customer/rooms'),
          fetch('/api/admin/room-types')
        ]);

        if (roomsRes.ok && typesRes.ok) {
          const roomsData: Room[] = await roomsRes.json();
          const typesData: RoomType[] = await typesRes.json();
          setRooms(roomsData);
          setRoomTypes(typesData);
        } else {
          error("Failed to query catalog");
        }
      } catch (err) {
        error("Database connection failure");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoom) return;

    const days = calculateDays();
    if (days <= 0) {
      error("Departure date must occur after check-in date!");
      return;
    }

    if (!user) {
      error("Profile context missing");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.userId,
          room_id: bookingRoom.room_id,
          check_in: checkIn,
          check_out: checkOut,
          total_amount: days * (bookingRoom.price_per_day || 0),
        }),
      });

      if (response.ok) {
        success(`Suite ${bookingRoom.room_number || 'Reserved'} booked successfully! Mark pending approval.`);
        setBookingRoom(null);
        setCheckIn('');
        setCheckOut('');
        // Reload rooms catalog
        const res = await fetch('/api/customer/rooms');
        if (res.ok) {
          const updatedRooms = await res.json();
          setRooms(updatedRooms);
        }
      } else {
        error("Reservation request failed. Please check date parameters.");
      }
    } catch (err) {
      error("Network timeout during book transaction");
    } finally {
      setBookingLoading(false);
    }
  };

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort();

  // Filter Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (room.type_name && room.type_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || String(room.type_id) === selectedType;
    const matchesFloor = selectedFloor === 'All' || String(room.floor) === selectedFloor;
    const price = room.price_per_day || 0;
    const matchesPrice = price >= Number(minPrice) && price <= Number(maxPrice);
    
    return matchesSearch && matchesType && matchesFloor && matchesPrice;
  });

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8 relative">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Search Luxury Accommodations</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Browse Resort Suite Catalog</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('All');
              setSelectedFloor('All');
              setMinPrice('0');
              setMaxPrice('15000');
              info("Filters reset complete");
            }}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all shadow-sm"
          >
            Clear Constraints
          </button>
        </div>
      </div>

      {/* Constraints Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={14} className="text-[#c9a84c]" />
          <p className="text-xs font-bold text-[#0a1f44] tracking-wide uppercase font-sans">Accommodation Filters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Keyword Search */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[11px] font-bold text-slate-500 font-sans tracking-wide">Category or Suite Number</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search Standard, Suite 101, etc..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Type dropdown */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-sans tracking-wide">Select Suite Category</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Categories</option>
              {roomTypes.map(t => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          {/* Floor selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-sans tracking-wide">Select Floor Location</span>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Floors</option>
              {floors.map(f => (
                <option key={f} value={f}>{f === 4 ? `Penthouse (Floor ${f})` : `Floor ${f}`}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 font-sans tracking-wide">Max Rate (Per Day)</span>
              <span className="text-[10px] font-bold text-[#c9a84c]">₹{Number(maxPrice).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full accent-[#c9a84c] py-2"
            />
          </div>
        </div>
      </div>

      {/* Catalog display Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState message="No available accommodations found matching those filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, idx) => {
              const isBooked = room.status === 'Booked';
              const activeImgIdx = activeImages[room.room_id] ?? 0;
              return (
                <motion.div
                  key={room.room_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white rounded-3xl border border-slate-200/50 overflow-hidden hover:shadow-lg shadow-sm hover:border-slate-300 transition-all flex flex-col group relative"
                >
                  {/* Photo Thumbnail */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={`https://picsum.photos/seed/room-grand-${room.room_id}-${activeImgIdx}/600/400`}
                      alt={`Suite ${room.room_number}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 saturate-[0.9]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                    
                    {/* Badge absolute overlays */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-mono tracking-widest font-bold uppercase py-1 px-2.5 rounded-lg border border-white/10 text-white bg-slate-900/60 backdrop-blur-md">
                        Floor {room.floor === 4 ? 'Penthouse' : room.floor}
                      </span>
                    </div>

                    {/* Small Gallery Preview */}
                    <div className="absolute bottom-4 left-4 flex gap-1.5 z-10 no-print">
                      {[0, 1, 2].map((imgIdx) => {
                        const thumbUrl = `https://picsum.photos/seed/room-grand-${room.room_id}-${imgIdx}/120/80`;
                        const isActive = activeImgIdx === imgIdx;
                        return (
                          <div
                            key={imgIdx}
                            onMouseEnter={() => {
                              setActiveImages(prev => ({ ...prev, [room.room_id]: imgIdx }));
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImages(prev => ({ ...prev, [room.room_id]: imgIdx }));
                            }}
                            className={`w-9 h-6 rounded border cursor-pointer overflow-hidden transition-all duration-200 ${
                              isActive 
                                ? 'border-[#CCFF00] scale-105 shadow shadow-[#CCFF00]/20' 
                                : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-500'
                            }`}
                          >
                            <img
                              src={thumbUrl}
                              alt={`Thumbnail ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute bottom-4 right-4 z-10">
                      <StatusBadge status={room.status} />
                    </div>
                  </div>

                  {/* Room Details block */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">{room.type_name}</span>
                        <span className="text-xs font-semibold text-slate-400">Cap: {room.capacity} Guest{room.capacity && room.capacity > 1 ? 's' : ''}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#0a1f44] tracking-tight mt-1.5 font-sans">
                        Suite {room.room_number}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">Equipped with central AC, secure smart-entry card locks, state-of-the-art media system, and pristine private balcony views.</p>
                    </div>

                    {/* Pricing panel */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 font-sans tracking-wide uppercase">Rate / Night</span>
                        <p className="text-[#c9a84c] text-lg font-bold font-sans flex items-center gap-0.5">
                          <IndianRupee size={15} className="stroke-[2.5]" />
                          {(room.price_per_day || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('pre_selected_tour_type', String(room.type_id));
                            onRouteChange('/customer/tour');
                          }}
                          className="px-3 py-2.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-55 hover:border-slate-300 text-slate-700 rounded-xl active:scale-97 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Launch interactive 360° Virtual Tour for this suite type"
                        >
                          <Compass size={13} className="text-[#c9a84c] animate-spin-slow" />
                          <span>360° Tour</span>
                        </button>

                        <button
                          onClick={() => {
                            if (isBooked) return;
                            setBookingRoom(room);
                          }}
                          disabled={isBooked}
                          className={`px-4 py-2.5 text-xs font-bold rounded-xl active:scale-97 shadow-md focus:outline-none transition-all cursor-pointer ${
                            isBooked 
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed' 
                              : 'bg-[#0a1f44] text-white hover:bg-slate-800'
                          }`}
                        >
                          {isBooked ? 'Occupied' : 'Reserve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Booking Form Dialog Modal Overlay */}
      <AnimatePresence>
        {bookingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* backdrop dial blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingRoom(null)}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            />

            {/* main card details popup */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header decor */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />
              
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[9px] font-mono text-[#c9a84c] font-bold tracking-widest uppercase">EXECUTIVE ROOM RESERVATIONS</span>
                <h3 className="text-xl font-bold text-[#0a1f44] tracking-tight mt-1">Book Suite {bookingRoom.room_number}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{bookingRoom.type_name}</p>
              </div>

              {/* Form panel body */}
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
                
                {/* Check In Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-sans tracking-wide">Resident Check-In Date</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={15} />
                    </span>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckIn(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-250 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/20"
                    />
                  </div>
                </div>

                {/* Check Out Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-sans tracking-wide">Resident Check-Out Date</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={15} />
                    </span>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-250 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/20"
                    />
                  </div>
                </div>

                {/* Rates breakdown information box */}
                <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200/30">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-semibold mb-1.5">
                    <span>Base rate per day:</span>
                    <span className="font-bold text-slate-800">₹{(bookingRoom.price_per_day || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-semibold border-b border-dotted border-amber-200/50 pb-2 mb-2">
                    <span>Calculated Stay:</span>
                    <span className="font-bold text-slate-800">{calculateDays()} Dynamic Day{calculateDays() !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-[#0a1f44] tracking-wide">Estimated Total Amount:</span>
                    <span className="text-lg font-extrabold text-[#c9a84c] font-sans flex items-center gap-0.5">
                      <IndianRupee size={15} className="stroke-[2.5]" />
                      {(calculateDays() * (bookingRoom.price_per_day || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Cancel Confirm row buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookingRoom(null)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                  >
                    Dismiss Request
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-4.5 py-2.5 bg-[#c9a84c] hover:brightness-110 active:scale-97 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-[#c9a84c]/10"
                  >
                    Confirm Suite Reservation
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
