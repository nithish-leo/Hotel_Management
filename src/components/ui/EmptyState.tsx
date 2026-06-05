import { motion } from 'motion/react';
import { HardDrive } from 'lucide-react';

export function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3 text-center px-4"
    >
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/50 shadow-inner">
        <HardDrive size={24} className="text-slate-400 stroke-[1.5]" />
      </div>
      <div>
        <p className="text-base font-medium text-slate-700">{message}</p>
        <p className="text-xs text-slate-400 max-w-xs mt-1">There is no records available matching your current filter criteria.</p>
      </div>
    </motion.div>
  );
}
