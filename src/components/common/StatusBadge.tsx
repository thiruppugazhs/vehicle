import React from 'react';
import { VehicleStatus, PriorityLevel } from '../../types';

interface StatusBadgeProps {
  status: VehicleStatus | PriorityLevel | 'Valid' | 'Expiring Soon' | 'Expired' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  // Map status to clean, non-neon, professional light theme badges
  switch (status) {
    case 'Active':
    case 'Valid':
    case 'Resolved':
    case 'Completed':
    case 'Good':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {status}
        </span>
      );

    case 'Due for Service':
    case 'Expiring Soon':
    case 'Medium':
    case 'Attention Needed':
    case 'Diagnosing':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300/70 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );

    case 'Overdue':
    case 'Critical':
    case 'Expired':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping opacity-75"></span>
          {status}
        </span>
      );

    case 'High':
    case 'Reported':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          {status}
        </span>
      );

    case 'Under Maintenance':
    case 'In Repair':
    case 'Quality Check':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {status}
        </span>
      );

    case 'Low':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {status}
        </span>
      );

    case 'Inactive':
    case 'Sold':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {status}
        </span>
      );
  }
};
