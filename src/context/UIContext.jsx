import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [toasts, setToasts] = useState([]);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Use useLayoutEffect to prevent flickering and ensure class is applied before paint
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <UIContext.Provider value={{ theme, toggleTheme, showToast, isCommandPaletteOpen, setCommandPaletteOpen }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] border backdrop-blur-xl
                ${toast.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-500/20 shadow-emerald-500/10' : 
                  toast.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-950/90 border-rose-500/20 shadow-rose-500/10' : 'bg-blue-50/90 dark:bg-blue-950/90 border-blue-500/20 shadow-blue-500/10'}`}
            >
              <div className={`p-2.5 rounded-xl 
                ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 
                  toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}>
                {toast.type === 'success' ? <CheckCircle size={18} /> : 
                 toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
              </div>
              <p className="flex-1 text-sm font-black text-slate-800 dark:text-slate-100">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-colors font-black text-xs"
              >
                CLOSE
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
export const useToast = () => useContext(UIContext).showToast;
