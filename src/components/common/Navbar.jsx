import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, LogOut, CheckCircle2, History, User, Gamepad2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/user/dashboard', label: 'Check-In', icon: CheckCircle2 },
    { to: '/user/history', label: 'History', icon: History },
    { to: '/user/profile', label: 'Profile', icon: User },
    { to: '/user/games', label: 'Games', icon: Gamepad2 }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/user/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
              GeoCircle
            </span>
            <span className="block text-[10px] text-cyan-400 font-medium uppercase tracking-wider">
              Verified Presence
            </span>
          </div>
        </Link>

        {/* Navigation links for User */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-300 text-xs">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
