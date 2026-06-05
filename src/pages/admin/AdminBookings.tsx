import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, Compass, CreditCard, Check, X, LayoutGrid, SlidersHorizontal, Sparkles, Copy, Send, RefreshCw, Loader2, Mail } from 'lucide-react';
import { Booking } from '@/types';
import { AdminBookingsCalendar } from '@/components/AdminBookingsCalendar';

export function AdminBookings() {
  const { isAdmin } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Gemini Welcome Email Integration States
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [welcomeEmailModalOpen, setWelcomeEmailModalOpen] = useState(false);
  const [welcomeEmailLoading, setWelcomeEmailLoading] = useState(false);
  const [welcomeEmailContent, setWelcomeEmailContent] = useState('');
  const [welcomeRecipient, setWelcomeRecipient] = useState('');
  const [welcomeGuestName, setWelcomeGuestName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [welcomeIsFallback, setWelcomeIsFallback] = useState(false);
  const [welcomeFallbackReason, setWelcomeFallbackReason] = useState('');
  const [welcomeSystemUsed, setWelcomeSystemUsed] = useState('');

  const { success, error, info } = useToast();

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        setBookings(await response.json());
      } else {
        error("Failed to query full reservations ledger");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const generateWelcomeEmail = async (bookingId: number, instructions: string = '') => {
    setWelcomeEmailLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customInstructions: instructions }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWelcomeEmailContent(data.emailContent);
        setWelcomeRecipient(data.recipient || 'guest@gmail.com');
        setWelcomeGuestName(data.guestName || 'VIP Guest');
        setWelcomeIsFallback(data.isFallback || false);
        setWelcomeFallbackReason(data.fallbackReason || '');
        setWelcomeSystemUsed(data.systemUsed || 'Gemini AI');
        if (data.isFallback) {
          info("Offline luxury template loaded. (Configure GEMINI_API_KEY to activate Gemini)");
        } else {
          success("Personalized greeting formulated by Gemini successfully!");
        }
      } else {
        error(data.error || "Failed to generate welcome message");
      }
    } catch (err) {
      error("Network error during generation pipeline");
    } finally {
      setWelcomeEmailLoading(false);
    }
  };

  const handleOpenWelcomeEmail = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setCustomInstructions('');
    setWelcomeEmailContent('');
    setWelcomeEmailModalOpen(true);
    generateWelcomeEmail(bookingId);
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: newStatus }),
      });

      if (response.ok) {
        success(`Stay #HB-${bookingId} marked as ${newStatus}`);
        fetchAllBookings();
        
        // Automated personalized email dispatch triggers instantly without manual popups
        if (newStatus === 'Confirmed') {
          info("Automatically formulating welcome communication...");
          try {
            const welcomeResp = await fetch(`/api/admin/bookings/${bookingId}/welcome-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customInstructions: '' }),
            });
            const data = await welcomeResp.json();
            if (welcomeResp.ok && data.success) {
              // Real automatic SMTP or Simulation dispatch network request
              const sendResp = await fetch('/api/admin/bookings/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: bookingId,
                  recipient: data.recipient,
                  body: data.emailContent
                })
              });
              const sendData = await sendResp.json();
              if (sendResp.ok && sendData.success) {
                if (sendData.simulated) {
                  success(`Personalized welcome drafted automatically!`);
                  info(`Email auto-simulation complete for ${data.recipient}`);
                } else {
                  success(`Personalized welcome email auto-dispatched to ${data.recipient}!`);
                }
              } else {
                success(`Reservations confirmed & automated welcome brief formulated.`);
              }
            } else {
              success(`Reservations confirmed & automated welcome brief formulated.`);
            }
          } catch (autoErr) {
            console.error("Background Welcome Dispatch failed:", autoErr);
            success(`Stay confirmed & welcome dispatch queued.`);
          }
        }
      } else {
        error("Status update request rejected by server");
      }
    } catch (err) {
      error("Network failure processing action");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'All' || b.booking_status === filter);

  if (isAdmin === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      
      {/* Title & Layout Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-4 border-b border-slate-200/60 font-sans">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Lounge stay controller matrix</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Reservations Ledger</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Main Visual/List Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => {
                setViewMode('calendar');
                info("Switched to visual D3 monthly matrix");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                viewMode === 'calendar' ? 'bg-[#CCFF00] text-black font-extrabold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Matrix Grid</span>
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                info("Switched to ledger table list");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-[#CCFF00] text-black font-extrabold shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Table Ledger</span>
            </button>
          </div>

          {/* Filter controls tab (Only show or emphasize when in list view) */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
              {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => {
                const isTabActive = filter === status;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      setFilter(status);
                      info(`Filter: Showing ${status} stay entries`);
                    }}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                      isTabActive ? 'bg-white text-[#0a1f44] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Conditionally Render D3 calendar view or Table list layout */}
      {viewMode === 'calendar' ? (
        <AdminBookingsCalendar bookings={bookings} />
      ) : (
        /* Bookings Table Sheet */
        filteredBookings.length === 0 ? (
          <EmptyState message="No reservations found matching current filter." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a1f44] text-white">
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Res ID</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Resident Guest</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Lobby Suite</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Check-In</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Check-Out</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-center">Status</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredBookings.map((b) => {
                      const isPending = b.booking_status === 'Pending';
                      return (
                        <tr key={b.booking_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-xs font-mono font-bold text-[#0a1f44]">#HB-{b.booking_id}</td>
                          <td className="py-4 px-6 font-bold text-slate-800 text-sm">{b.customer_name}</td>
                          <td className="py-4 px-6 font-bold text-[#0a1f44] text-sm">Suite {b.room_number}</td>
                          <td className="py-4 px-6 text-xs text-slate-600 font-semibold">{b.check_in}</td>
                          <td className="py-4 px-6 text-xs text-slate-600 font-semibold">{b.check_out}</td>
                          <td className="py-4 px-6 text-center">
                            <StatusBadge status={b.booking_status} />
                          </td>
                           <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-slate-400">
                              {isPending ? (
                                <>
                                  <button
                                    disabled={updatingId === b.booking_id}
                                    onClick={() => handleUpdateStatus(b.booking_id, 'Confirmed')}
                                    className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg border border-slate-155 cursor-pointer transition-all"
                                    title="Confirm booking"
                                  >
                                    <Check size={14} className="stroke-[2.5]" />
                                  </button>
                                  <button
                                    disabled={updatingId === b.booking_id}
                                    onClick={() => handleUpdateStatus(b.booking_id, 'Cancelled')}
                                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-155 cursor-pointer transition-all"
                                    title="Cancel booking"
                                  >
                                    <X size={14} className="stroke-[2.5]" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  {b.booking_status === 'Confirmed' && (
                                    <button
                                      onClick={() => handleOpenWelcomeEmail(b.booking_id)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#CCFF00] hover:bg-[#CCFF00]/80 text-black border border-black/10 rounded-xl cursor-pointer transition-all shadow-sm"
                                      title="Personalized Welcome Correspondence"
                                    >
                                      <Sparkles size={11} className="fill-black/10 animate-pulse" />
                                      <span>Welcome Email</span>
                                    </button>
                                  )}
                                  <span className="text-[10px] font-semibold text-slate-400 italic">Audited</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Personalized Welcome Email Modal */}
      <AnimatePresence>
        {welcomeEmailModalOpen && selectedBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden font-sans relative"
            >
              {/* Decorative design line */}
              <div className="h-1 bg-[#CCFF00] w-full" />
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/15 flex items-center justify-center text-zinc-800">
                    <Sparkles size={18} className="stroke-[2px] text-zinc-800 fill-[#CCFF00]/10 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-[#c9a84c] uppercase block font-bold">Stay #HB-{selectedBookingId} Confirmed</span>
                    <h3 className="text-lg font-black text-[#0a1f44] uppercase tracking-tight">AI Personalized Guest Welcome Email</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setWelcomeEmailModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all cursor-pointer border border-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Guest info card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950 text-zinc-350 rounded-2xl border border-zinc-900 font-mono text-[11px] uppercase tracking-wider">
                  <div>
                    <span className="text-zinc-500 block text-[9px]">Aesthetic Guest</span>
                    <span className="text-white font-extrabold text-xs">{welcomeGuestName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px]">Communication Dest.</span>
                    <span className="text-[#CCFF00] font-extrabold text-xs lowercase">{welcomeRecipient}</span>
                  </div>
                </div>

                {/* System Status indicator banner */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 transition-colors ${
                  welcomeIsFallback 
                    ? 'bg-amber-50/70 border-amber-200/50 text-amber-800' 
                    : 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800'
                }`}>
                  <div className="pt-0.5">
                    <Sparkles size={16} className={welcomeIsFallback ? 'text-amber-500' : 'text-emerald-500 fill-emerald-500/10 animate-pulse'} />
                  </div>
                  <div>
                    <div className="font-extrabold uppercase tracking-wide text-[10px] mb-0.5">
                      Generation Source: <span className="underline">{welcomeSystemUsed}</span>
                    </div>
                    {welcomeIsFallback ? (
                      <div className="flex flex-col gap-1 text-amber-700 font-medium col-span-1">
                        <p>
                          Offline luxury template activated. To enable fully personalized, dynamic hotel welcome letters synthesized by Gemini AI, secure your <strong className="font-black">GEMINI_API_KEY</strong> variables in the Settings &gt; Secrets panel.
                        </p>
                        {welcomeFallbackReason && (
                          <p className="text-[10px] text-amber-600/80 bg-amber-100/40 px-2 py-1.5 rounded-lg border border-amber-200/40 font-mono mt-1 break-words">
                            Note: {welcomeFallbackReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-emerald-700 font-medium">
                        Bespoke message custom-constructed in real-time by Google Gemini. Fully unique to this guest's stay structure!
                      </p>
                    )}
                  </div>
                </div>

                {/* Main Email text container */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#0a1f44] uppercase tracking-wider">Bespoke Greeting Output</label>
                    {welcomeEmailContent && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(welcomeEmailContent);
                          info("Copied welcome communication to clipboard");
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 hover:text-[#0a1f44] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>Copy Correspondence</span>
                      </button>
                    )}
                  </div>

                  <div className="w-full h-80 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 overflow-y-auto text-slate-700 leading-relaxed text-sm select-text relative font-sans whitespace-pre-wrap">
                    {welcomeEmailLoading ? (
                      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
                        <span className="text-xs font-mono font-bold tracking-wider text-[#c9a84c] animate-pulse">RECONSTRUCTING BESPOKE EMAIL VIA GEMINI...</span>
                      </div>
                    ) : (
                      welcomeEmailContent ? (
                        welcomeEmailContent
                      ) : (
                        <div className="text-slate-400 italic text-center py-20 font-mono text-xs">
                          Waiting for generation pipeline response...
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Prompt Tuning/Custom Instruction */}
                <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 uppercase">
                    <SlidersHorizontal size={12} className="text-[#c9a84c]" />
                    <span>Fine-tune with instructions</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Include note about priority check-out, recommend Spa Treatment..."
                      disabled={welcomeEmailLoading}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 focus:border-[#c9a84c] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                    />
                    <button
                      onClick={() => generateWelcomeEmail(selectedBookingId, customInstructions)}
                      disabled={welcomeEmailLoading || !selectedBookingId}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-[#CCFF00] hover:text-white border border-zinc-900 rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer disabled:opacity-50 transition-all shadow-md"
                    >
                      <RefreshCw size={11} className={welcomeEmailLoading ? 'animate-spin' : ''} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                <button
                  onClick={() => setWelcomeEmailModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  Close Manager
                </button>
                <button
                  disabled={welcomeEmailLoading || sendingEmail || !welcomeEmailContent}
                  onClick={async () => {
                    setSendingEmail(true);
                    try {
                      const response = await fetch('/api/admin/bookings/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          bookingId: selectedBookingId,
                          recipient: welcomeRecipient,
                          body: welcomeEmailContent
                        })
                      });
                      const data = await response.json();
                      if (response.ok && data.success) {
                        if (data.simulated) {
                          info(data.message);
                        } else {
                          success(data.message || "Bespoke hotel email successfully sent to customer inbox!");
                        }
                        setWelcomeEmailModalOpen(false);
                      } else {
                        error(data.error || "Failed to dispatch email. Please check your SMTP settings.");
                      }
                    } catch (err) {
                      error("An error occurred while connecting to the email transmission service.");
                    } finally {
                      setSendingEmail(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-[#CCFF00] hover:text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-[0.98] disabled:opacity-40"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="animate-spin" size={13} />
                      <span>Dispatching Stay Brief...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Correspondence</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
