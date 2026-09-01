import React from 'react';
import {
  Car,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  DollarSign,
  Gauge,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building,
  Users
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency } from '../../utils/formatters';

export const FleetManagementView: React.FC = () => {
  const {
    vehicles,
    maintenanceRecords,
    repairs,
    expenses,
    userProfile,
    setActiveTab,
    setFleetHealthFilter,
    fleetHealthFilter,
    totalFleetDowntimeHours,
    serviceCompliance,
    fleetUtilization,
    fleetHealthBreakdown
  } = useFleet();

  // Fleet Dashboard Calculations (Requirement 33)
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const vehiclesUnderRepair = vehicles.filter(v => v.status === 'Under Repair').length;
  const vehiclesDueForService = vehicles.filter(v => v.status === 'Due for Service').length;
  const overdueVehicles = vehicles.filter(v => v.status === 'Overdue').length;

  // Monthly and Yearly maintenance calculation
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const monthlyMaintenanceCost = maintenanceRecords
    .filter(m => {
      const d = new Date(m.serviceDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((acc, m) => acc + m.totalCost, 0);

  const yearlyMaintenanceCost = maintenanceRecords
    .filter(m => new Date(m.serviceDate).getFullYear() === currentYear)
    .reduce((acc, m) => acc + m.totalCost, 0);

  const totalAllMaintenance = maintenanceRecords.reduce((acc, m) => acc + m.totalCost, 0);
  const avgCostPerVehicle = totalVehicles > 0 ? Math.round(totalAllMaintenance / totalVehicles) : 0;

  // Requirement 34: Clickable Fleet Health Category Handler
  const handleHealthCategoryClick = (category: 'Excellent' | 'Needs Attention' | 'Critical') => {
    setFleetHealthFilter(category);
    setActiveTab('vehicles');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Fleet Operations & Asset Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fleet-level command center for multi-vehicle tracking, asset health distribution, and operating cost oversight.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl">
            {userProfile.organizationName || 'Fleet Organization'}
          </span>
        </div>
      </div>

      {/* Requirement 33: Fleet Metrics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Vehicles</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalVehicles}</p>
          <span className="text-[10px] text-slate-500 font-medium">Registered fleet assets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active Operational</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeVehicles}</p>
          <span className="text-[10px] text-slate-500 font-medium">Ready for dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Under Repair</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{vehiclesUnderRepair}</p>
          <span className="text-[10px] text-slate-500 font-medium">In workshop bay</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Due for Service</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{vehiclesDueForService}</p>
          <span className="text-[10px] text-slate-500 font-medium">Interval reached</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue Vehicles</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{overdueVehicles}</p>
          <span className="text-[10px] text-slate-500 font-medium">Past due mileage/date</span>
        </div>
      </div>

      {/* Financial & Utilization Overview (Requirement 33) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Maintenance</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(monthlyMaintenanceCost, userProfile.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Current billing month spend</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Yearly Maintenance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(yearlyMaintenanceCost, userProfile.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Year-to-date {currentYear}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Cost Per Vehicle</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(avgCostPerVehicle, userProfile.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Per-asset lifecycle cost</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Vehicle Utilization</span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">
            {fleetUtilization}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active on-road asset ratio</span>
        </div>
      </div>

      {/* Requirement 34: Interactive Fleet Health Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">Fleet Health Classification</h3>
            <p className="text-xs text-slate-500">
              Click any classification box to instantly filter vehicles in your fleet inventory.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Calculated via 0–100 Health Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Excellent Category */}
          <div
            onClick={() => handleHealthCategoryClick('Excellent')}
            className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Excellent (80–100 Score)</span>
              </div>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {fleetHealthBreakdown.excellent} <span className="text-xs font-semibold text-emerald-600">vehicles</span>
              </p>
              <span className="text-[11px] text-emerald-700/80 mt-1 block">Optimal condition, zero overdue maintenance</span>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Needs Attention Category */}
          <div
            onClick={() => handleHealthCategoryClick('Needs Attention')}
            className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Needs Attention (60–79 Score)</span>
              </div>
              <p className="text-3xl font-black text-amber-800 mt-2">
                {fleetHealthBreakdown.needsAttention} <span className="text-xs font-semibold text-amber-700">vehicles</span>
              </p>
              <span className="text-[11px] text-amber-800/80 mt-1 block">Service due within 14 days or minor wear</span>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Critical Category */}
          <div
            onClick={() => handleHealthCategoryClick('Critical')}
            className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Critical (&lt; 60 Score)</span>
              </div>
              <p className="text-3xl font-black text-rose-700 mt-2">
                {fleetHealthBreakdown.critical} <span className="text-xs font-semibold text-rose-600">vehicles</span>
              </p>
              <span className="text-[11px] text-rose-800/80 mt-1 block">Overdue services or open major breakdowns</span>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-400 group-hover:text-rose-700 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Requirement 35 & 37: Downtime & Service Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            Vehicle Downtime Tracking
          </h3>
          <p className="text-xs text-slate-500">
            Measures lost asset operating hours due to unscheduled breakdowns and repairs.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Total Fleet Downtime This Month:</span>
              <span className="font-black text-base text-rose-600">{totalFleetDowntimeHours} hours</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Equivalent Inoperative Days:</span>
              <span className="font-bold text-slate-700">{(totalFleetDowntimeHours / 24).toFixed(1)} days</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Service Compliance Rate
          </h3>
          <p className="text-xs text-slate-500">
            Percentage of scheduled preventative maintenance intervals completed on time.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Service Compliance:</span>
              <span className="font-black text-base text-emerald-600">{serviceCompliance.complianceRate}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>On Time: <strong className="text-emerald-700">{serviceCompliance.onTimeCount}</strong></span>
              <span>Pending: <strong className="text-amber-700">{serviceCompliance.lateCount}</strong></span>
              <span>Overdue: <strong className="text-rose-700">{serviceCompliance.overdueCount}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
