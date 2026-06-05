import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, Compass, CreditCard, RotateCcw, ArrowRight, ShieldCheck, Printer, Download } from 'lucide-react';
import { Booking } from '@/types';
import { generateReceiptPDF } from '@/lib/pdfGenerator';

interface BookingsProps {
  onRouteChange: (route: string) => void;
}

export function CustomerBookings({ onRouteChange }: BookingsProps) {
  const { isCustomer, user } = useCustomerAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  // Billing & Split Payments states
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [coPayers, setCoPayers] = useState<string[]>(["Guest Self", "Resident Co-Payer"]);
  const [settledShares, setSettledShares] = useState<{ [payerIdx: number]: boolean }>({});
  const [isProcessingSplit, setIsProcessingSplit] = useState<boolean>(false);

  const { success, error, info } = useToast();

  const fetchBillingInfo = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/bookings/billing/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBillingInfo(data);
      }
    } catch (err) {
      console.error("Failed to load billing metrics:", err);
    }
  };

  useEffect(() => {
    if (selectedInvoice) {
      fetchBillingInfo(selectedInvoice.booking_id);
      setSplitCount(2);
      setCoPayers(["Guest Self", "Resident Co-Payer"]);
      setSettledShares({});
    } else {
      setBillingInfo(null);
    }
  }, [selectedInvoice]);

  const calculateNights = (inDateStr: string, outDateStr: string) => {
    if (!inDateStr || !outDateStr) return 1;
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/customer/bookings/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        error("Failed to fetch historical bookings");
      }
    } catch (err) {
      error("Database sync failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      const response = await fetch(`/api/customer/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      });
      if (response.ok) {
        success('Reservation successfuly cancelled. Associated suite released.');
        fetchBookings();
      } else {
        error('Cancellation request failed');
      }
    } catch (err) {
      error('Network failure executing cancellation');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'All' || b.booking_status === filter);

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      
      {/* Page upper layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Resident Reservation Log</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Your Direct Bookings Ledger</h1>
        </div>

        {/* Filter controls tab */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => {
            const isTabActive = filter === status;
            return (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  info(`Filter: Showing ${status} stays`);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  isTabActive ? 'bg-white text-[#0a1f44] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Ledger Sheet */}
      {filteredBookings.length === 0 ? (
        <EmptyState message="No reservations found in your historic ledger." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white border-b border-slate-800">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Res ID</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Suite</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Suite category</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Check-In</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Check-Out</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Total Rate</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-center">Status</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Lounge Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((b, idx) => {
                    const isPending = b.booking_status === 'Pending';
                    const isConfirmed = b.booking_status === 'Confirmed';
                    const isCancelled = b.booking_status === 'Cancelled';
                    return (
                      <motion.tr
                        key={b.booking_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-xs font-mono font-bold text-[#0a1f44]">#HB-{b.booking_id}</td>
                        <td className="py-4 px-6 text-sm font-extrabold text-slate-800">Suite {b.room_number || 'N/A'}</td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">{b.type_name || 'DELUXE'}</td>
                        <td className="py-4 px-6 text-xs font-semibold text-slate-600">{b.check_in}</td>
                        <td className="py-4 px-6 text-xs font-semibold text-slate-600">{b.check_out}</td>
                        <td className="py-4 px-6 text-sm font-bold text-[#c9a84c]">₹{(b.total_amount || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 text-center">
                          <StatusBadge status={b.booking_status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Branded Invoice Preview Trigger */}
                            <button
                              onClick={() => setSelectedInvoice(b)}
                              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-[#CCFF00] hover:text-[#CCFF00] text-zinc-300 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                              title="Print Invoice Record"
                            >
                              <Printer size={13} />
                              <span>Invoice</span>
                            </button>

                            {isPending && (
                              <button
                                disabled={cancellingId === b.booking_id}
                                onClick={() => handleCancelBooking(b.booking_id)}
                                className="px-3 py-1.5 bg-slate-900 border border-zinc-800 hover:border-red-500 hover:text-red-400 text-zinc-400 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                              >
                                {cancellingId === b.booking_id ? 'Cancelling...' : 'Cancel Stay'}
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                onClick={() => onRouteChange('/customer/payment')}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:brightness-105 active:scale-97"
                              >
                                Settle Rate
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {isCancelled && (
                              <span className="text-[10px] font-mono tracking-widest text-zinc-500 italic uppercase">Cancelled</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Overlay for Printing Invoice Preview */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
            >
              {/* Top controls */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-[#CCFF00]" />
                  <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase font-bold">Residency Billing Statement</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      generateReceiptPDF(
                        selectedInvoice,
                        {
                          userId: user?.userId,
                          name: user?.name || user?.customer_name,
                          email: user?.email || user?.customer_email,
                        }
                      );
                    }}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-[#CCFF00] text-zinc-350 hover:text-[#CCFF00] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      setTimeout(() => {
                        window.print();
                      }, 100);
                    }}
                    className="px-4 py-2 bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:bg-white flex items-center gap-1.5"
                  >
                    <Printer size={14} />
                    Print Now
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase text-zinc-300 rounded-xl cursor-pointer transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet wrapper */}
              <div
                id="print-invoice-area"
                className="bg-black border border-zinc-900 rounded-2xl p-6 sm:p-8 font-sans text-white leading-normal"
              >
                {/* Invoice Letterhead */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b border-zinc-900">
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase font-display text-white">
                      GRAND<span className="text-[#CCFF00]">.</span>HOTEL
                    </h1>
                    <p className="text-[10px] text-[#CCFF00] font-mono tracking-widest uppercase mt-0.5">
                      EXECUTIVE RESIDENCY CLUB
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-2 font-sans leading-relaxed">
                      350 Luxury Boulevard, Suite 100<br />
                      Metro Heights, MH 400101<br />
                      stay@grandexecutive.com | +1 (555) 019-2830
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <h2 className="text-xl font-black text-white tracking-wide uppercase font-display">
                      INVOICE STATEMENT
                    </h2>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Invoice No: <span className="font-bold text-white">#INV-HB-{selectedInvoice.booking_id}</span>
                    </p>
                    <p className="text-xs font-mono text-zinc-400">
                      Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="mt-2 text-right">
                      <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase font-black bg-zinc-900 border border-zinc-800 text-[#CCFF00] rounded-md">
                        Status: {selectedInvoice.booking_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing details / Customer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs font-sans pb-6 border-b border-zinc-900">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] mb-1.5 font-bold">Billed Resident</p>
                    <p className="text-sm font-extrabold text-white uppercase">{user?.customer_name || 'Valued Guest'}</p>
                    <p className="text-zinc-400 mt-0.5">{user?.customer_email || 'guest@example.com'}</p>
                    <p className="text-zinc-500 font-mono mt-1 text-[10px]">Resident ID Reference: #G-{user?.userId}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">Acquisition & Authority</p>
                    <p className="text-zinc-300">Front Desk Digital Portal</p>
                    <p className="text-zinc-400">Processed Remotely</p>
                    <p className="text-zinc-500 font-mono mt-1 text-[10px]">System Host Node: Port 3000 Ingress</p>
                  </div>
                </div>

                {/* Stay Breakdown Table */}
                <div className="mb-8 overflow-hidden border border-zinc-900 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 text-[#CCFF00] border-b border-zinc-900">
                        <th className="py-2.5 px-4 text-[10px] font-mono uppercase tracking-wider font-extrabold">Suite & Description</th>
                        <th className="py-2.5 px-4 text-[10px] font-mono uppercase tracking-wider font-extrabold text-center">Period of Stay</th>
                        <th className="py-2.5 px-4 text-[10px] font-mono uppercase tracking-wider font-extrabold text-center">Nights</th>
                        <th className="py-2.5 px-4 text-[10px] font-mono uppercase tracking-wider font-extrabold text-right">Settlement Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950 text-xs">
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          Suite {selectedInvoice.room_number || 'N/A'}<br />
                          <span className="text-[10px] text-[#CCFF00] uppercase font-mono font-bold">{selectedInvoice.type_name || 'DELUXE SUITE'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-zinc-300">
                          {selectedInvoice.check_in} – {selectedInvoice.check_out}
                        </td>
                        <td className="py-3.5 px-4 text-center text-white font-mono">
                          {calculateNights(selectedInvoice.check_in, selectedInvoice.check_out)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-white font-mono font-bold">
                          ₹{((selectedInvoice.total_amount || 0) / (calculateNights(selectedInvoice.check_in, selectedInvoice.check_out) || 1)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / night
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                 {/* Pricing / Tax Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-900">
                  {/* Left: GST Invoice Breakdown */}
                  <div className="space-y-3.5 text-xs text-zinc-300">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">GST Invoice Breakdown</p>
                    
                    {billingInfo ? (
                      <div className="space-y-2 bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Net Room Subtotal:</span>
                          <span className="font-mono text-zinc-300">₹{billingInfo.billing.base_nightly_price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">CGST (9.0% Central Levy):</span>
                          <span className="font-mono text-zinc-400">₹{billingInfo.billing.cgst_9pct.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-500">SGST (9.0% State Levy):</span>
                          <span className="font-mono text-zinc-400">₹{billingInfo.billing.sgst_9pct.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">Gourmet & Spa Incidentals:</span>
                          <span className="font-mono text-zinc-400">₹{billingInfo.billing.services_charge.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-zinc-900 text-sm font-extrabold text-white">
                          <span>Verified Grand Total:</span>
                          <span className="font-mono text-[#CCFF00]">₹{billingInfo.billing.grand_total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Total Settled Previously:</span>
                          <span className="font-mono text-emerald-400">₹{billingInfo.billing.total_paid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 text-xs text-zinc-400">
                          <span>Current Balance Due:</span>
                          <span className="font-mono text-amber-400">₹{billingInfo.billing.balance_due.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-zinc-650 font-mono text-[10px]">Assembling corporate tax structures...</div>
                    )}
                  </div>

                  {/* Right: Live Interactive Split Payments */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">Live Split Payments Workshop</p>
                    
                    {billingInfo ? (
                      <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-zinc-400">Number of Copayers:</span>
                          <div className="flex items-center gap-1.5">
                            {[2, 3, 4].map((num) => (
                              <button
                                key={num}
                                onClick={() => {
                                  setSplitCount(num);
                                  const arr = ["Guest Self"];
                                  for(let i=1; i<num; i++) {
                                    arr.push(`Resident Partner ${i}`);
                                  }
                                  setCoPayers(arr);
                                  setSettledShares({});
                                }}
                                className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center justify-center ${
                                  splitCount === num ? 'bg-[#CCFF00] text-black' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Co-payers items with live share amount */}
                        <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto pr-1">
                          {coPayers.map((name, idx) => {
                            const shareAmount = Math.round(billingInfo.billing.grand_total / splitCount);
                            const shareBase = Math.round(shareAmount / 1.18);
                            const shareGst = shareAmount - shareBase;
                            const isPaid = settledShares[idx];

                            return (
                              <div key={idx} className="p-2.5 bg-black/40 border border-zinc-900 rounded-xl flex items-center justify-between text-[11px]">
                                <div className="space-y-0.5">
                                  <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                      const updated = [...coPayers];
                                      updated[idx] = e.target.value;
                                      setCoPayers(updated);
                                    }}
                                    className="font-bold text-zinc-100 bg-transparent focus:outline-none focus:border-[#CCFF00]/50 border-b border-transparent w-[110px]"
                                  />
                                  <div className="text-[9px] text-zinc-500 font-mono">
                                    Base: ₹{shareBase.toLocaleString()} | GST(18%): ₹{shareGst.toLocaleString()}
                                  </div>
                                </div>

                                <div className="text-right flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">₹{shareAmount.toLocaleString()}</span>
                                  {isPaid ? (
                                    <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Settled</span>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        setIsProcessingSplit(true);
                                        try {
                                          const response = await fetch('/api/customer/payments', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              booking_id: selectedInvoice.booking_id,
                                              amount: shareAmount,
                                              payment_method: `Split GooglePay (${name})`
                                            })
                                          });
                                          if (response.ok) {
                                            setSettledShares(prev => ({ ...prev, [idx]: true }));
                                            success(`Settled ₹${shareAmount.toLocaleString()} share for ${name}!`);
                                            fetchBillingInfo(selectedInvoice.booking_id);
                                          } else {
                                            error("Split payment transfer failed");
                                          }
                                        } catch(err) {
                                          error("Failed to connect with payment host gateway");
                                        } finally {
                                          setIsProcessingSplit(false);
                                        }
                                      }}
                                      disabled={isProcessingSplit}
                                      className="px-2 py-1 bg-[#CCFF00] hover:bg-white text-black text-[10px] uppercase font-black tracking-wider rounded-md cursor-pointer transition-all"
                                    >
                                      Pay Share
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-zinc-650 font-mono text-[10px]">Loading ledger pricing maps...</div>
                    )}
                  </div>
                </div>

                {/* Bottom Terms & Thank you notes */}
                <div className="mt-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div className="max-w-md">
                    <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 font-bold">Residency Terms</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                      This registration acts as a formal record of stay at Grand Executive. Extra incidentals or lounge service charges acquired during residency will be billed independently.
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs font-black uppercase tracking-tight text-white font-display">GRAND EXECUTIVE HOTEL</p>
                    <p className="text-[9px] font-mono text-[#CCFF00] uppercase tracking-wider mt-0.5">Automated Signature Authorized</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
