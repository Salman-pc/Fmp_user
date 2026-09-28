import React from 'react';

export const StatusBadge = ({ status, text }) => {
  const badgeStyles = {
    PRESENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ACTIVE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    OUTSIDE_RADIUS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    EXPIRED_WINDOW: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  };

  const style = badgeStyles[status] || 'bg-slate-700/50 text-slate-300 border-slate-600';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {text || status}
    </span>
  );
};
