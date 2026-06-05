import { motion } from 'motion/react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#c9a84c]"
      />
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-xs font-mono tracking-wider text-slate-500 uppercase"
      >
        Loading Excellence...
      </motion.p>
    </div>
  );
}
