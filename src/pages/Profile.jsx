import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <User className="w-5 h-5 text-cyan-400" />
          <span>My Member Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Your registered account details and role permissions.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-cyan-500/20">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user.name}</h2>
            <p className="text-xs text-cyan-400 font-medium">{user.role} Member</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
            </span>
            <div className="text-sm font-semibold text-slate-200">{user.email}</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Account Status</span>
            </span>
            <div className="text-sm font-semibold text-emerald-400">
              {user.isActive ? 'Active Member' : 'Deactivated'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Login Time</span>
            </span>
            <div className="text-sm font-semibold text-slate-300">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First Session'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
