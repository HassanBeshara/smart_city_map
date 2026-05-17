import { Link } from 'react-router-dom';
import {
  MapPin,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onAuthClick, onMenuToggle, menuOpen = false }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between gap-3 px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-brand-600 dark:text-brand-400">
          <MapPin className="w-6 h-6" />
          <span className="hidden sm:inline">Smart City Map</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        <Link
          to="/"
          className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Map
        </Link>
        <Link
          to="/dashboard"
          className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-amber-600"
          >
            <Shield size={16} />
            Admin
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <User size={16} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
