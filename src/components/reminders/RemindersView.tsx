import React, { useState } from 'react';
import {
  Bell,
  Clock,
  AlertOctagon,
  Calendar,
  Gauge,
  CheckCircle2,
  X,
  Wrench,
  Filter,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatDistance } from '../../utils/formatters';
import { PriorityLevel } from '../../types';

export const RemindersView: React.FC = () => {
  const {
    vehicles,
    smartReminders,
    markReminderCompleted,
    dismissReminder,
    setIsAddServiceOpen,
    userProfile
  } = useFleet();

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReminders = smartReminders.filter(r => {
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.vehicleReg.toLowerCase().includes(q) ||
      r.vehicleName.toLowerCase().includes(q);

    return matchesPriority && matchesSearch;
  });

  const criticalCount = smartReminders.filter(r => r.priority === 'Critical' && r.status === 'Pending').length;
  const highCount = smartReminders.filter(r => r.priority === 'High' && r.status === 'Pending').length;
  const mediumCount = smartReminders.filter(r => r.priority === 'Medium' && r.status === 'Pending').length;
  const lowCount = smartReminders.filter(r => r.priority === 'Low' && r.status === 'Pending').length;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Smart Service Reminders
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Dual-Trigger Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated predictive alerts tracking both calendar due dates and odometer consumption milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Priority Breakdown:</span>
          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">{criticalCount} Critical</span>
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{highCount} High</span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{mediumCount} Medium</span>
        </div>
      </div>

      {/* Priority Legend according to Section 20 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setPriorityFilter('Critical')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'Critical' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300' : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Critical Priority</span>
            <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">{criticalCount}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Service overdue by date or mileage threshold.
          </p>
        </div>

        <div
          onClick={() => setPriorityFilter('High')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'High' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300' : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700">High Priority</span>
            <span className="text-xs font-mono font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">{highCount}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Service due in approximately &lt; 3 days or &lt; 500 km.
          </p>
        </div>

        <div
          onClick={() => setPriorityFilter('Medium')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'Medium' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Medium Priority</span>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">{mediumCount}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Service due in approximately 14 days or ~1,500 km.
          </p>
        </div>

        <div
          onClick={() => setPriorityFilter('Low')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'Low' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Low Priority</span>
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{lowCount}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Service due in 30+ days (Advance reminder).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reminders by vehicle registration, title, or type..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setPriorityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              priorityFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Priorities
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3.5">
        {filteredReminders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-2xs">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Reminders Found</h3>
            <p className="text-xs text-slate-500 mt-1">All service milestones and document expirations are up to date.</p>
          </div>
        ) : (
          filteredReminders.map(rem => {
            const isCompleted = rem.status === 'Completed';

            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : rem.priority === 'Critical'
                    ? 'bg-rose-50/50 border-rose-200'
                    : rem.priority === 'High'
                    ? 'bg-orange-50/40 border-orange-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {rem.vehicleReg}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{rem.vehicleName}</span>
                    <StatusBadge status={rem.priority} size="sm" />
                    {isCompleted && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{rem.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{rem.description}</p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target Date: <strong className="text-slate-800">{formatDate(rem.dueDate)}</strong>
                    </span>

                    {rem.dueOdometer && (
                      <span className="flex items-center gap-1 font-medium">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        Target Odometer: <strong className="text-slate-800">{formatDistance(rem.dueOdometer, userProfile.distanceUnit)}</strong>
                      </span>
                    )}

                    {rem.remainingKm !== undefined && (
                      <span className="font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.2 rounded-md">
                        {rem.remainingKm < 0
                          ? `${Math.abs(rem.remainingKm).toLocaleString()} km overdue`
                          : `Service due in approximately ${rem.remainingKm.toLocaleString()} km`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => setIsAddServiceOpen(true, rem.vehicleId)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Schedule Service
                      </button>

                      <button
                        onClick={() => markReminderCompleted(rem.id)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => dismissReminder(rem.id)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
