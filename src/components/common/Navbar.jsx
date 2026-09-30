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
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/user/dashboard" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                GeoCircle
              </span>
              <span className="block text-[9px] sm:text-[10px] text-cyan-400 font-medium uppercase tracking-wider">
                Verified Presence
              </span>
            </div>
          </Link>

          {/* Navigation links for Desktop */}
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 bg-slate-900/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-800">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-300 text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 sm:p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800 px-2 py-1.5 backdrop-blur-xl">
          <nav className="flex items-center justify-around">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition ${
                      isActive
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};
