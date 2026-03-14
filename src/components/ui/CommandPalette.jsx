import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Link as LinkIcon, Clock, Settings, LayoutDashboard, User, MessageSquare } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', shortcut: 'D' },
    { name: 'Event Types', icon: LinkIcon, path: '/event-types', shortcut: 'E' },
    { name: 'Availability', icon: Clock, path: '/availability', shortcut: 'A' },
    { name: 'Bookings', icon: Calendar, path: '/bookings', shortcut: 'B' },
    { name: 'Calendar', icon: Calendar, path: '/calendar', shortcut: 'C' },
    { name: 'Email Logs', icon: MessageSquare, path: '/emails', shortcut: 'L' },
    { name: 'Settings', icon: Settings, path: '/settings', shortcut: 'S' },
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = (path) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setCommandPaletteOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl theme-surface rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border theme-border overflow-hidden relative pointer-events-auto"
          >
            <div className="p-5 border-b theme-border flex items-center gap-4 theme-elevated">
              <Search size={22} className="text-sky-500" />
              <input
                autoFocus
                className="w-full bg-transparent border-none outline-none text-lg font-black theme-text placeholder:text-[var(--text-muted)]"
                placeholder="What can we help you find?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="px-3 py-1.5 theme-surface rounded-xl text-[10px] font-black theme-text-muted border theme-border shadow-sm">ESC</div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3 space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command) => (
                  <button
                    key={command.name}
                    onClick={() => handleAction(command.path)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:theme-elevated group transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 theme-elevated theme-text-muted rounded-xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                        <command.icon size={20} />
                      </div>
                      <span className="font-bold theme-text group-hover:translate-x-1 transition-transform">{command.name}</span>
                    </div>
                    <div className="text-[10px] font-black theme-text-muted group-hover:text-sky-500 bg-transparent px-2 py-1 rounded-lg border theme-border border-dashed transition-colors">
                      {command.shortcut}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 theme-elevated rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-black theme-text-muted uppercase tracking-widest">No matching commands found</p>
                </div>
              )}
            </div>

            <div className="p-4 theme-elevated border-t theme-border flex gap-6 text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] justify-center">
              <span className="flex items-center gap-2"><div className="w-4 h-4 rounded border theme-border flex items-center justify-center">↑</div> Navigate</span>
              <span className="flex items-center gap-2"><div className="w-6 h-4 rounded border theme-border flex items-center justify-center">↵</div> Select</span>
              <span className="flex items-center gap-2"><div className="w-6 h-4 rounded border theme-border flex items-center justify-center">Esc</div> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
