import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { IndianRupee, Key, Calendar, CreditCard, HelpCircle, Check, Loader2, ArrowRight, Download } from 'lucide-react';
import { Booking } from '@/types';
import { generateReceiptPDF } from '@/lib/pdfGenerator';

interface PaymentProps {
  onRouteChange: (route: string) => void;
}

export function CustomerPayment({ onRouteChange }: PaymentProps) {
  const { isCustomer, user } = useCustomerAuth();
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI | Card | Cash
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // UPI Input
  const [upiId, setUpiId] = useState('');
  
  const [paying, setPaying] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);

  const { success, error, info } = useToast();

  const fetchConfirmedBookings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/customer/bookings/${user.userId}`);
      if (response.ok) {
        const bookings: Booking[] = await response.json();
        // Filters only Confirmed bookings
        const filtered = bookings.filter(b => b.booking_status === 'Confirmed');
        setConfirmedBookings(filtered);
        if (filtered.length > 0) {
          setSelectedBookingId(String(filtered[0].booking_id));
        }
      }
    } catch (err) {
      error("Failed to query confirmed reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConfirmedBookings();
    }
  }, [user]);

  const activeBooking = confirmedBookings.find(b => String(b.booking_id) === selectedBookingId);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) {
      error("No confirmed reservation selected");
      return;
    }

    if (paymentMethod === 'UPI' && !upiId) {
      error("Please check and provide your UPI ID reference");
      return;
    }

    if (paymentMethod === 'Card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      error("Please populate card details accurately");
      return;
    }

    setPaying(true);
    try {
      const response = await fetch('/api/customer/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: activeBooking.booking_id,
          amount: activeBooking.total_amount,
          payment_method: paymentMethod,
        }),
      });

      if (response.ok) {
        setPaymentSuccessData({
          bookingId: activeBooking.booking_id,
          roomNumber: activeBooking.room_number,
          total: activeBooking.total_amount,
          method: paymentMethod,
          booking: activeBooking,
        });
        success('Room rate has been successfully processed and recorded.');
      } else {
        error('Transaction rejected by banker');
      }
    } catch (err) {
      error('Network error during transaction processing');
    } finally {
      setPaying(false);
    }
  };

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8 relative">
      
      {/* Title */}
      <div className="mb-8 pb-4 border-b border-slate-200/60">
        <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Direct Settle Panel</span>
        <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight mt-1">Settle Stay Rate & Invoices</h1>
      </div>

      {confirmedBookings.length === 0 ? (
        <EmptyState message="You currently have no confirmed stays waiting to be settled." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Bill Card summary left (lg:col-span-4) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />
              
              <h3 className="text-base font-bold text-[#0a1f44] tracking-tight pb-3 border-b border-slate-100">Bill Breakdown Summary</h3>
              
              {activeBooking ? (
                <div className="mt-5 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-semibold uppercase font-sans">Booking Code</span>
                    <span className="text-xs font-mono font-bold text-slate-800">#HB-{activeBooking.booking_id}</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-semibold uppercase font-sans">Residence Code</span>
                    <span className="text-sm font-extrabold text-slate-800">Suite {activeBooking.room_number || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-semibold uppercase font-sans">Lodging Category</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">{activeBooking.type_name || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase font-sans">Check-In</p>
                      <p className="text-xs font-extrabold text-[#0a1f44] mt-1">{activeBooking.check_in}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase font-sans">Check-Out</p>
                      <p className="text-xs font-extrabold text-[#0a1f44] mt-1">{activeBooking.check_out}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-150 pt-5 mt-5">
                    <span className="text-sm font-bold text-[#0a1f44] tracking-wide">Total Invoice Amount</span>
                    <span className="text-2xl font-extrabold text-[#c9a84c] font-sans flex items-center gap-0.5">
                      <IndianRupee size={18} className="stroke-[2.5]" />
                      {(activeBooking.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4">Please register or select your active Booking invoice.</p>
              )}
            </motion.div>

            {/* Premium service guarantee banner */}
            <div className="p-4 rounded-2xl bg-[#0a1f44]/5 border border-[#0a1f44]/10 text-slate-600 text-xs flex gap-3">
              <span className="text-[#c9a84c] mt-0.5 shrink-0">&#9670;</span>
              <p className="leading-relaxed"><strong className="text-slate-800">Secure Payments:</strong> All direct settle transactions are processed immediately. Room keys will be validated and authorized shortly after invoice confirmation.</p>
            </div>
          </div>

          {/* Form input right (lg:col-span-8) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
          >
            <h3 className="text-base font-bold text-[#0a1f44] tracking-tight pb-3 border-b border-slate-100 mb-6">Choose Invoice & Direct Settle Method</h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Select Confirmed Booking dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide font-sans">Select Confirmed Stay Invoice</label>
                <select
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl bg-slate-50/50 text-slate-700 font-sans"
                >
                  {confirmedBookings.map(b => (
                    <option key={b.booking_id} value={b.booking_id}>
                      #HB-{b.booking_id} (Suite {b.room_number}) - ₹{Number(b.total_amount).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Method choice Radio boxes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide font-sans">Choose Transfer Channel</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'UPI', label: 'UPI Protocol', desc: 'Secure Instant Netting' },
                    { id: 'Card', label: 'Credit/Debit Card', desc: 'Visa, MasterCard' },
                    { id: 'Cash', label: 'Desk Settlement', desc: 'Settle in Cash with Clerk' },
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.id);
                          info(`Switched to: ${method.label}`);
                        }}
                        className={`text-left p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-amber-200/60 bg-amber-50/20 shadow-sm' 
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#c9a84c]' : 'text-slate-800'}`}>
                          {method.label}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 uppercase font-mono tracking-wide">
                          {method.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic input content based on method choice */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'UPI' && (
                  <motion.div
                    key="UPI"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 tracking-wide font-sans">Unified Payments Interface (UPI) ID</label>
                      <input
                        type="text"
                        required
                        placeholder="yourname@okbank"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full font-mono text-xs font-semibold px-4 py-3 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Note: Transaction confirmation request will be initiated to your registered mobile app.</p>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'Card' && (
                  <motion.div
                    key="Card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    <div className="flex flex-col gap-1.5 col-span-4">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Cardholder Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full font-mono text-xs font-semibold px-4 py-3 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl text-slate-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full font-mono text-xs font-semibold px-4 py-3 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl text-slate-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-700 tracking-wide">Security Code (CVV)</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full font-mono text-xs font-semibold px-4 py-3 border border-slate-200 focus:border-[#c9a84c] focus:outline-none rounded-xl text-slate-800"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'Cash' && (
                  <motion.div
                    key="Cash"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-amber-50/20 border border-amber-200/20 block text-center"
                  >
                    <HelpCircle className="text-[#c9a84c] mx-auto mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-800 tracking-normal font-sans">Hotel Desk Settlement Option Selected</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">By choosing cash, your stay booking is marked active. Please stop by the Hotel Grand lobby desk to settle the invoice directly with our receptionist clerk.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Trigger Settle */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={paying}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-200 to-[#c9a84c] text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-[#c9a84c]/10 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {paying ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Netting Invoice...
                    </>
                  ) : (
                    <>
                      Confirm Settle Transaction
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          </motion.div>

        </div>
      )}

      {/* Stunning visual overlay for success checkmark */}
      <AnimatePresence>
        {paymentSuccessData && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center pointer-events-auto overflow-hidden"
            >
              {/* animated background shine */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
              
              {/* success check animate circular */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
                className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 mb-5 shadow-inner"
              >
                <Check size={26} className="stroke-[2.5]" />
              </motion.div>

              <h3 className="text-xl font-bold text-[#0a1f44] tracking-tight font-sans">Payment Approved!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto uppercase tracking-wide font-mono">Invoice successfully settled</p>

              <div className="mt-6 border-y border-dashed border-slate-200 py-4 space-y-2 text-left">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Stay Code Reference:</span>
                  <span className="font-bold text-slate-800">#HB-{paymentSuccessData.bookingId}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Lodging Suite:</span>
                  <span className="font-bold text-slate-800">Suite {paymentSuccessData.roomNumber}</span>
                </div>
                <td className="w-full border-t border-slate-100 border-dotted my-1 col-span-2 block" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-bold text-slate-800">Settle Amount Paid:</span>
                  <span className="text-base font-extrabold text-[#c9a84c] font-sans flex items-center gap-0.5">
                    <IndianRupee size={14} className="stroke-[2.5]" />
                    {paymentSuccessData.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {paymentSuccessData.booking && (
                <button
                  type="button"
                  onClick={() => {
                    generateReceiptPDF(
                      paymentSuccessData.booking,
                      {
                        userId: user?.userId,
                        name: user?.name,
                        email: user?.email,
                      },
                      paymentSuccessData.method
                    );
                  }}
                  className="w-full py-3 bg-[#c9a84c] hover:bg-[#b59239] text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all mt-6 flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download PDF Receipt
                </button>
              )}

              <button
                onClick={() => {
                  setPaymentSuccessData(null);
                  fetchConfirmedBookings();
                  onRouteChange('/customer/bookings');
                }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all mt-3"
              >
                Proceed to Stay Ledger
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
