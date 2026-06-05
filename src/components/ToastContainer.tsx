import { motion, AnimatePresence } from 'motion/react';
import { useToast, ToastItem } from '@/hooks/useToast';
import { CheckCircle2, AlertCircle, Info, HelpCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useToast();

  const icons = {
    success: <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-600 shrink-0" size={18} />,
    info: <Info className="text-indigo-600 shrink-0" size={18} />,
    warning: <HelpCircle className="text-amber-600 shrink-0" size={18} />,
  };

  const borders = {
    success: 'border-emerald-100 bg-emerald-50/40 text-emerald-900',
    error: 'border-rose-100 bg-rose-50/40 text-rose-900',
    info: 'border-indigo-100 bg-indigo-50/40 text-indigo-900',
    warning: 'border-amber-100 bg-amber-50/40 text-amber-900',
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: ToastItem) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-md shadow-lg shadow-slate-900/5 ${borders[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs font-semibold tracking-wide font-sans">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
