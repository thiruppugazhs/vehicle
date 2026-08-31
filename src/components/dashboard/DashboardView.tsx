import React from 'react';
import {
  Car,
  Clock,
  AlertOctagon,
  Wrench,
  Receipt,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Gauge,
  Plus,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { HealthScoreBadge } from '../common/HealthScoreBadge';
import { formatCurrency, formatDistance, formatDate } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    vehicles,
    smartReminders,
    repairs,
    expenses,
    activities,
    userProfile,
    setActiveTab,
    setIsAddServiceOpen,
    setIsReportIssueOpen,
    setIsAddVehicleOpen,
    setIsAddExpenseOpen
  } = useFleet();

  // Metrics computation
  const totalVehicles = vehicles.length;
  const dueForService = vehicles.filter(v => v.status === 'Due for Service').length;
  const overdueServices = vehicles.filter(v => v.status === 'Overdue').length;
  const underRepair = vehicles.filter(v => v.status === 'Under Repair' || v.status === 'Under Maintenance').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Active').length;

  // Monthly Maintenance Cost calculation (current calendar month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyMaintenanceCost = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Health distribution
  const goodHealthCount = vehicles.filter(v => v.healthScore >= 80).length;
  const attentionCount = vehicles.filter(v => v.healthScore >= 60 && v.healthScore < 80).length;
  const criticalHealthCount = vehicles.filter(v => v.healthScore < 60).length;

  // Average Fleet Health
  const avgHealth = Math.round(
    vehicles.reduce((acc, v) => acc + v.healthScore, 0) / (totalVehicles || 1)
  );

  // Filter urgent overdue reminders
  const overdueReminders = smartReminders.filter(
    r => r.status === 'Pending' && (r.remainingDays < 0 || (r.remainingKm !== undefined && r.remainingKm < 0) || r.priority === 'Critical')
  );

  // Upcoming maintenance reminders
  const upcomingReminders = smartReminders
    .filter(r => r.status === 'Pending' && r.priority !== 'Critical' && r.remainingDays >= 0)
    .slice(0, 5);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Fleet Command Center
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking {totalVehicles} active vehicles across {userProfile.organizationName || 'your garage'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Car className="w-3.5 h-3.5 text-slate-600" />
            Add Vehicle
          </button>
          <button
            onClick={() => setIsAddServiceOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-2xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Schedule Service
          </button>
        </div>
      </div>

      {/* Overdue Urgent Alert Banner if any overdue exists */}
      {overdueServices > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Urgent Attention Required</span>
                <span className="text-[11px] font-bold bg-rose-200/80 text-rose-900 px-2 py-0.2 rounded-full">
                  {overdueServices} Overdue
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Brake inspection overdue by 13 days for Tata Prima Hauler (MH 02 CK 9876)
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Prolonged delay risks highway brake booster failure and regulatory compliance penalties.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddServiceOpen(true, 'veh_02')}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Schedule Service Now
          </button>
        </div>
      )}

      {/* 6 Clickable Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Vehicles"
          value={totalVehicles}
          subtitle="Registered assets"
          icon={Car}
          highlightColor="slate"
          onClick={() => setActiveTab('vehicles')}
        />

        <StatCard
          title="Due for Service"
          value={dueForService}
          subtitle="Next 14 days"
          icon={Clock}
          highlightColor="amber"
          onClick={() => setActiveTab('maintenance')}
        />

        <StatCard
          title="Overdue Services"
          value={overdueServices}
          subtitle="Urgent action"
          icon={AlertOctagon}
          highlightColor="rose"
          onClick={() => setActiveTab('maintenance')}
        />

        <StatCard
          title="Under Repair"
          value={underRepair}
          subtitle="In workshops"
          icon={Wrench}
          highlightColor="blue"
          onClick={() => setActiveTab('repairs')}
        />

        <StatCard
          title="Monthly Cost"
          value={formatCurrency(monthlyMaintenanceCost, userProfile.currency)}
          subtitle="Aug expenses"
          icon={Receipt}
          highlightColor="emerald"
          onClick={() => setActiveTab('expenses')}
        />

        <StatCard
          title="Available Units"
          value={availableVehicles}
          subtitle="Ready for road"
          icon={CheckCircle}
          highlightColor="emerald"
          onClick={() => setActiveTab('vehicles')}
        />
      </div>

      {/* Main Grid: Upcoming Maintenance & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming & Overdue Maintenance Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Maintenance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Maintenance</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled preventive services calculated by date and odometer intervals.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                View all schedules
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Due Odometer</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {upcomingReminders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No upcoming maintenance schedules recorded.
                      </td>
                    </tr>
                  ) : (
                    upcomingReminders.map(rem => (
                      <tr key={rem.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{rem.vehicleReg}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {rem.vehicleName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {rem.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{formatDate(rem.dueDate)}</div>
                          <div className="text-[10px] text-slate-400">
                            {rem.remainingDays > 0 ? `In ${rem.remainingDays} days` : 'Today'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {rem.dueOdometer ? formatDistance(rem.dueOdometer, userProfile.distanceUnit) : '—'}
                          {rem.remainingKm !== undefined && (
                            <div className="text-[10px] text-amber-700 font-semibold">
                              ~{rem.remainingKm.toLocaleString()} km left
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={rem.priority} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setIsAddServiceOpen(true, rem.vehicleId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            Schedule
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overdue Maintenance Specific Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Urgent Overdue Services</h3>
              </div>
              <span className="text-xs text-rose-600 font-semibold">
                Requires Immediate Booking
              </span>
            </div>

            {overdueReminders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No overdue services. All fleet assets are up-to-date!
              </div>
            ) : (
              <div className="space-y-3">
                {overdueReminders.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md">
                          {item.vehicleReg}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-rose-700 mt-1 font-medium">{item.description}</p>
                    </div>

                    <button
                      onClick={() => setIsAddServiceOpen(true, item.vehicleId)}
                      className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      Schedule Service
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Vehicle Health & Recent Activity */}
        <div className="space-y-6">
          {/* Vehicle Health Distribution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Vehicle Health</h3>
                <p className="text-xs text-slate-500 mt-0.5">Composite 0–100 health assessment</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                Avg: {avgHealth}/100
              </span>
            </div>

            {/* Health Breakdown Rings / Bars */}
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Good (80–100)
                  </span>
                  <span className="text-slate-800">{goodHealthCount} Vehicles</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(goodHealthCount / (totalVehicles || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Attention Needed (60–79)
                  </span>
                  <span className="text-slate-800">{attentionCount} Vehicles</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(attentionCount / (totalVehicles || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Critical (&lt;60)
                  </span>
                  <span className="text-slate-800">{criticalHealthCount} Vehicles</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(criticalHealthCount / (totalVehicles || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vehicles')}
              className="mt-5 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center block"
            >
              Filter & Inspect All Vehicles
            </button>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <span className="text-xs text-slate-400 font-medium">Audit Stream</span>
            </div>

            <div className="space-y-4">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {act.type === 'service' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                    ) : act.type === 'repair' ? (
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : act.type === 'expense' ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 leading-tight truncate">{act.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{act.timestamp}</span>
                      <span>•</span>
                      <span className="font-mono font-semibold text-slate-600">{act.vehicleReg}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
