import React from 'react';

interface HealthScoreBadgeProps {
  score: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const HealthScoreBadge: React.FC<HealthScoreBadgeProps> = ({
  score,
  showText = false,
  size = 'md'
}) => {
  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-500';
  let text = 'Excellent';

  if (score < 50) {
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
    text = 'Critical';
  } else if (score < 70) {
    colorClass = 'text-amber-800 bg-amber-50 border-amber-300';
    barColor = 'bg-amber-500';
    text = 'Needs Attention';
  } else if (score < 90) {
    colorClass = 'text-teal-700 bg-teal-50 border-teal-200';
    barColor = 'bg-teal-500';
    text = 'Good';
  }

  if (size === 'hero') {
    return (
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-100 bg-slate-50">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'}
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute font-bold text-slate-800 text-base">{score}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Fleet Health Index</span>
            <span className={`text-xs px-2 py-0.5 font-medium rounded-full border ${colorClass}`}>
              {score}/100
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-0.5">{text}</p>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${barColor}`}></span>
        {score}/100
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${colorClass}`}>
        <span className={`w-2 h-2 rounded-full ${barColor}`}></span>
        {score} / 100
      </span>
      {showText && <span className="text-xs font-medium text-slate-600">{text}</span>}
    </div>
  );
};
