import React from 'react';

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin`}
      />
      {label && <p className="mt-2 text-xs text-slate-400 font-medium">{label}</p>}
    </div>
  );
};
