import { motion, AnimatePresence } from 'motion/react';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastStore { toasts: Toast[]; addToast: (message: string, type?: ToastType) => void; removeToast: (id: string) => void; }

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => { set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })); }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function CustomToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed top-4 right-4 left-4 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div key={toast.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`pointer-events-auto px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg border border-[#422422]/20 max-w-[200px] w-auto ${toast.type === 'success' ? 'bg-[#8F5D2C] text-white' : toast.type === 'error' ? 'bg-red-800 text-white' : 'bg-[#F2E4CC] text-[#422422]'}`}>
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircle size={12} />}
              {toast.type === 'error' && <AlertCircle size={12} />}
              {toast.type === 'info' && <Info size={12} />}
            </div>
            <p className="font-alfa text-[8px] uppercase tracking-wider leading-tight flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="opacity-50"><X size={10} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
