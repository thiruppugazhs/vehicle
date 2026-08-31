import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlightColor?: 'amber' | 'rose' | 'emerald' | 'blue' | 'slate';
  onClick?: () => void;
  isActive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'slate',
  onClick,
  isActive = false
}) => {
  const iconColorStyles = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200',
  }[highlightColor];

  const activeBorder = isActive 
    ? 'border-amber-500 ring-2 ring-amber-400/20 shadow-md' 
    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl p-5 border transition-all duration-200 text-left ${activeBorder} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border transition-colors ${iconColorStyles}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
        {trend && (
          <span
            className={`font-semibold ml-auto flex items-center gap-0.5 ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
