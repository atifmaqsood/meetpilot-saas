import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Calendar, Clock, Link as LinkIcon,
  Settings, LogOut, Menu, X, Bell, Sun, Moon, Search,
  MessageSquare, ChevronRight, ChevronLeft,
  CheckCircle2, Clock3, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import { useUI } from '../../context/UIContext';
import { markAsRead, clearAll } from '../../store/slices/notificationSlice';
import CommandPalette from '../ui/CommandPalette';

const navItems = [
  { name: 'Dashboard',   path: '/',            icon: LayoutDashboard },
  { name: 'Event Types', path: '/event-types', icon: LinkIcon },
  { name: 'Availability',path: '/availability',icon: Clock },
  { name: 'Bookings',    path: '/bookings',    icon: Calendar },
  { name: 'Calendar',    path: '/calendar',    icon: Calendar },
  { name: 'Email Logs',  path: '/emails',      icon: MessageSquare },
  { name: 'Settings',    path: '/settings',    icon: Settings },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const { user }                           = useSelector(s => s.auth);
  const { items: notifications }           = useSelector(s => s.notifications);
  const { theme, toggleTheme, setCommandPaletteOpen } = useUI();

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <div className="h-screen flex overflow-hidden theme-bg">
      <CommandPalette />

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden lg:flex flex-col flex-shrink-0 theme-surface border-r theme-border overflow-hidden"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}
          location={location} theme={theme} toggleTheme={toggleTheme}
          handleLogout={handleLogout} />
      </motion.aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute inset-y-0 left-0 w-72 theme-surface flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b theme-border" style={{ borderColor: 'var(--border-color)' }}>
                <Logo />
                <button onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl theme-elevated theme-text-muted hover:theme-text">
                  <X size={20} />
                </button>
              </div>
              <Sidebar collapsed={false} setCollapsed={() => {}}
                location={location} theme={theme} toggleTheme={toggleTheme}
                handleLogout={handleLogout} isMobile />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8
          theme-surface border-b z-30 sticky top-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Left */}
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl theme-elevated theme-text-secondary">
              <Menu size={20} />
            </button>
            <button onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl theme-elevated
                theme-text-muted text-sm w-full max-w-xs border theme-border
                hover:border-sky-300 transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Search size={15} />
              <span className="font-medium text-xs flex-1 text-left">Search...</span>
              <kbd className="hidden sm:block text-[9px] font-black px-1.5 py-0.5 rounded theme-elevated border theme-border">⌘K</kbd>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl theme-elevated theme-text-secondary hover:text-sky-600 transition-colors">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-[var(--bg-surface)]" />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 theme-surface rounded-2xl shadow-2xl border z-50 overflow-hidden"
                      style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center justify-between px-5 py-4 border-b theme-elevated"
                        style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-xs font-black uppercase tracking-widest theme-text-muted">Notifications</span>
                        <button onClick={() => dispatch(clearAll())} className="text-xs font-black text-rose-500">Clear</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="py-10 text-center text-xs theme-text-muted">No notifications</p>
                        ) : notifications.map(n => (
                          <div key={n.id} onClick={() => dispatch(markAsRead(n.id))}
                            className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                            style={{ background: !n.read ? 'color-mix(in srgb, var(--bg-elevated) 60%, transparent)' : 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'color-mix(in srgb, var(--bg-elevated) 60%, transparent)' : 'transparent'}>
                            <div className={`p-1.5 rounded-lg shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'}`}>
                              {n.type === 'success' ? <CheckCircle2 size={14}/> : n.type === 'error' ? <AlertCircle size={14}/> : <Clock3 size={14}/>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold theme-text truncate">{n.title}</p>
                              <p className="text-xs theme-text-muted line-clamp-1">{n.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <Link to="/settings" className="flex items-center gap-3 pl-3 sm:pl-4 border-l theme-border"
              style={{ borderColor: 'var(--border-color)' }}>
              <span className="hidden sm:block text-sm font-bold theme-text truncate max-w-[100px]">{user?.name}</span>
              <div className="w-9 h-9 rounded-xl theme-elevated flex items-center justify-center font-black overflow-hidden ring-2 ring-sky-500/10">
                {user?.avatar
                  ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  : <span className="text-sky-600">{user?.name?.charAt(0)}</span>}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden theme-bg p-4 sm:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Reusable Logo ── */
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">M</div>
      <span className="font-black text-xl tracking-tighter theme-text">MeetPilot</span>
    </div>
  );
}

/* ── Sidebar Content ── */
function Sidebar({ collapsed, setCollapsed, location, theme, toggleTheme, handleLogout, isMobile = false }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      {!isMobile && (
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg flex-shrink-0">M</div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-black text-xl tracking-tighter theme-text">MeetPilot</motion.span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 px-3 space-y-1 overflow-y-auto ${isMobile ? 'py-6' : ''}`}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm transition-all duration-300 group ${
                active
                  ? 'bg-sky-600 text-white shadow-[0_12px_24px_-6px_rgba(14,165,233,0.5)] font-black translate-x-1'
                  : 'theme-text-secondary hover:theme-elevated hover:theme-text font-bold'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-colors transition-transform duration-300 ${
                  active ? 'text-white scale-110' : 'theme-text-muted group-hover:theme-text'
                }`} 
              />
              {(!collapsed || isMobile) && <span className="tracking-tight">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="px-3 pb-6 space-y-1 border-t theme-border pt-3" style={{ borderColor: 'var(--border-color)' }}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-sm font-semibold transition-all theme-text-secondary"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'light'
            ? <Moon size={20} style={{ color: 'var(--text-muted)' }} />
            : <Sun size={20} style={{ color: 'var(--text-muted)' }} />}
          {(!collapsed || isMobile) && <span style={{ color: 'var(--text-secondary)' }}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Collapse (desktop only) */}
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed ? <ChevronRight size={20} style={{ color: 'var(--text-muted)' }}/> : <ChevronLeft size={20} style={{ color: 'var(--text-muted)' }}/>}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-sm font-semibold text-rose-500 transition-all"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
