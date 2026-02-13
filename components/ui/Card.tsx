import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; className?: string }> = ({ title, subtitle, icon, className }) => (
  <div className={`px-6 py-4 border-b border-slate-50 flex items-start justify-between ${className || ''}`}>
    <div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
    {icon && <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-lg">{icon}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
