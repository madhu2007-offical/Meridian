import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastId = 0;
const listeners = new Set();

export const showToast = (message, type = 'info') => {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ id, remove: true }));
  }, 4000);
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      if (toast.remove) {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      } else {
        setToasts((prev) => [...prev, toast]);
      }
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
