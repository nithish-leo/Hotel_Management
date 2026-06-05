import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IndianRupee, Key, Calendar, CreditCard, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { Payment } from '@/types';

export function AdminPayments() {
  const { isAdmin } = useAdminAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('All');

  const { success, error, info } = useToast();

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        setPayments(await response.json());
      } else {
        error("Failed to query payment ledger");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const filteredPayments = payments.filter(p => methodFilter === 'All' || p.payment_method === methodFilter);

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
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">System invoice logs</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight">Payments Ledger</h1>
        </div>
      </div>

      {/* Large visually impressive Revenue highlight card panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm relative overflow-hidden flex items-center justify-between col-span-1"
        >
          {/* visual line decor */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />
          
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Gross Settlement Proceeds</span>
            <p className="text-3xl font-extrabold text-[#c9a84c] tracking-tight mt-3 font-sans flex items-center gap-0.5">
              <IndianRupee size={22} className="stroke-[2.5]" />
              {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
            <CheckCircle2 size={24} className="stroke-[1.5]" />
          </div>
        </motion.div>

        {/* Filters panel middle */}
        <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={13} className="text-[#c9a84c]" />
            <span className="text-[10px] font-bold text-[#0a1f44] uppercase tracking-wide">Method channel Filter</span>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'UPI', 'Card', 'Cash'].map((method) => {
              const isTabActive = methodFilter === method;
              return (
                <button
                  key={method}
                  onClick={() => {
                    setMethodFilter(method);
                    info(`Filter list: ${method} settlements`);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    isTabActive ? 'bg-[#0a1f44] text-white shadow-md font-extrabold' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100/55 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {method === 'All' ? 'Verify All Channels' : method}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table block Ledger */}
      {filteredPayments.length === 0 ? (
        <EmptyState message="No recorded settlements found." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Invoice ID</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Res stay ID</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Resident Guest</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Lobby Suite</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Settlement Date</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Channel method</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">Settled cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredPayments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono font-bold text-[#0a1f44]">#HB-PINV-{p.payment_id}</td>
                      <td className="py-4 px-6 text-xs font-mono font-bold text-slate-500">#HB-{p.booking_id}</td>
                      <td className="py-4 px-6 font-bold text-slate-800 text-sm">{p.customer_name}</td>
                      <td className="py-4 px-6 font-bold text-[#0a1f44] text-sm">Suite {p.room_number || 'N/A'}</td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-semibold">{p.payment_date}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={p.payment_method} />
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-[#c9a84c] text-sm">₹{(p.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
