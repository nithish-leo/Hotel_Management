import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BedDouble, CheckCircle, Calendar, Users, Briefcase, IndianRupee, BellRing, ArrowUpRight } from 'lucide-react';
import { Booking, Stats } from '@/types';

export function AdminDashboard() {
  const { isAdmin } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const { error } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/bookings')
        ]);

        if (statsRes.ok && bookingsRes.ok) {
          const statsData = await statsRes.json();
          const bookingsData = await bookingsRes.json();
          setStats(statsData);
          setRecentBookings(bookingsData.slice(0, 5)); // show top 5 recent
        } else {
          error("Failed to fetch administrative metrics");
        }
      } catch (err) {
        error("Database connection failed");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isAdmin === null || loading || !stats) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      
      {/* Upper header */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">System Statistics Ledger</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight mt-1">Executive Administration console</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm">
          <BellRing size={13} className="text-[#c9a84c]" />
          System Operational
        </div>
      </div>

      {/* Grid container with 6 stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Rooms Listed', value: stats.total_rooms, color: 'text-white', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: BedDouble },
          { label: 'Rooms Available', value: stats.available_rooms, color: 'text-[#CCFF00]', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: CheckCircle },
          { label: 'Bookings Reserved', value: stats.total_bookings, color: 'text-[#CCFF00]', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: Calendar },
          { label: 'Total Customers Registered', value: stats.total_customers, color: 'text-white', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: Users },
          { label: 'Employees Recruited', value: stats.total_employees, color: 'text-white', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: Briefcase },
          { label: 'Registered Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, color: 'text-[#CCFF00]', border: 'border-zinc-800 hover:border-[#CCFF00]/30', bg: 'bg-zinc-900/80', icon: IndianRupee },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`p-6 rounded-2xl border ${item.border} ${item.bg} flex items-center justify-between shadow-sm relative overflow-hidden transition-all duration-350 hover:shadow-[#CCFF00]/5`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-sans">{item.label}</p>
              <p className={`text-3xl font-black ${item.color} mt-2.5 font-mono`}>{item.value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center shadow-inner">
              <item.icon size={22} className="text-[#CCFF00]" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings block table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0a1f44] tracking-tight">Recent Reservations</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-mono mt-0.5">Top 5 records filed</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-1 uppercase">
            Admin Audited
            <ArrowUpRight size={13} className="text-[#c9a84c]" />
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState message="Currently there are no recent bookings recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a1f44] text-white">
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Resident Guest</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Room Block</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Scheduled Check-in</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono">Scheduled Check-out</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-center">Stay Status</th>
                  <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider font-mono text-right">stay cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {recentBookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 text-sm">{b.customer_name}</div>
                        <div className="text-[10px] font-semibold text-slate-400">Res ID: #HB-{b.booking_id}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0a1f44] text-sm">Suite {b.room_number}</td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-semibold">{b.check_in}</td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-semibold">{b.check_out}</td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={b.booking_status} />
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-[#c9a84c] text-sm">₹{(b.total_amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}
