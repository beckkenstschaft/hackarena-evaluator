import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import {
  FiHome, FiAward, FiUsers, FiCamera, FiMenu, FiX, FiLogOut, FiGrid, FiClock
} from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome, roles: ['admin', 'judge', 'team'] },
  { path: '/leaderboard', label: 'Leaderboard', icon: FiAward, roles: ['admin', 'judge', 'team'] },
  { path: '/teams', label: 'Teams', icon: FiUsers, roles: ['admin', 'judge'] },
  { path: '/scanner', label: 'Scanner', icon: FiCamera, roles: ['admin', 'judge'] },
  { path: '/my-evaluations', label: 'Evaluations', icon: FiClock, roles: ['admin', 'judge'] },
  { path: '/hackathons', label: 'Hackathons', icon: FiGrid, roles: ['admin'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-dark-800">
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <FiAward className="text-white" size={18} />
            </div>
            <span className="font-bold gradient-text">HackArena</span>
          </Link>
          <div className="w-10" />
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-dark-900 border-b border-dark-800"
          >
            <nav className="p-4 space-y-2">
              {filteredNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive(item.path) ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-dark-800'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full">
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 ${sidebarOpen ? 'w-64' : 'w-20'} glass border-r border-dark-800 transition-all duration-300`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-800">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <FiAward className="text-white" size={18} />
              </div>
              <span className="font-bold gradient-text">HackArena</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-dark-800 rounded-lg">
            <FiMenu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive(item.path) ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-dark-800 hover:text-zinc-200'
            }`}>
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 w-full ${!sidebarOpen ? 'justify-center' : ''}`}>
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`lg:pl-64 pt-16 lg:pt-0 min-h-screen`}>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}