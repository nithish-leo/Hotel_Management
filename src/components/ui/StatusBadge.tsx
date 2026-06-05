import { motion } from 'motion/react';

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Available:  'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    Booked:     'bg-rose-50 text-rose-700 border-rose-200/50',
    Confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    Pending:    'bg-amber-50 text-amber-700 border-amber-200/50',
    Cancelled:  'bg-rose-50 text-rose-700 border-rose-200/50',
    UPI:        'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    Card:       'bg-violet-50 text-violet-700 border-violet-200/50',
    Cash:       'bg-slate-100 text-slate-700 border-slate-200/50',
    Active:     'bg-teal-50 text-teal-700 border-teal-200/50',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        colors[status] ?? 'bg-slate-50 text-slate-700 border-slate-200/50'
      }`}
    >
      {status}
    </motion.span>
  );
}
