import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  AlertTriangle,
  FileCheck,
  Printer,
  Sparkles,
  Clock,
  CheckCircle2,
  DollarSign,
  Wrench,
  Gauge,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency } from '../../utils/formatters';

const PIE_COLORS = ['#2563EB', '#DC2626', '#F97316', '#059669', '#7C3AED', '#D97706', '#64748B'];

export const AnalyticsView: React.FC = () => {
  const {
    vehicles,
    expenses,
    repairs,
    maintenanceRecords,
    smartReminders,
    userProfile,
    totalFleetDowntimeHours,
    serviceCompliance
  } = useFleet();

  // 1. Maintenance Cost
  const totalMaintenanceCost = useMemo(() => {
    return maintenanceRecords.reduce((sum, m) => sum + m.totalCost, 0);
  }, [maintenanceRecords]);

  // 2. Repair Cost
  const totalRepairCost = useMemo(() => {
    return repairs.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
  }, [repairs]);

  // 3. Total Vehicle Cost (all expenses + maintenance + repairs)
  const totalExpenseCost = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
  const totalFleetCost = totalMaintenanceCost + totalRepairCost + totalExpenseCost;

  // 4. Cost per KM
  const costPerKm = useMemo(() => {
    const totalKm = vehicles.reduce((sum, v) => sum + v.currentOdometer, 0);
    return totalKm > 0 ? (totalFleetCost / totalKm).toFixed(2) : '0.00';
  }, [totalFleetCost, vehicles]);

  // 7. Overdue Maintenance
  const overdueMaintenanceCount = useMemo(() => {
    return smartReminders.filter(r => r.status === 'Pending' && r.remainingDays < 0).length;
  }, [smartReminders]);

  // 8. Average Repair Cost
  const avgRepairCost = useMemo(() => {
    return repairs.length > 0 ? Math.round(totalRepairCost / repairs.length) : 0;
  }, [totalRepairCost, repairs]);

  // 9. Average Downtime (hours per repair)
  const avgDowntime = useMemo(() => {
    return repairs.length > 0 ? (totalFleetDowntimeHours / repairs.length).toFixed(1) : '0';
  }, [totalFleetDowntimeHours, repairs]);

  // Chart 1: Monthly Maintenance Cost
  const monthlyMaintenanceData = [
    { month: 'Apr', maintenance: 14200, repairs: 4200 },
    { month: 'May', maintenance: 12400, repairs: 5800 },
    { month: 'Jun', maintenance: 18900, repairs: 3100 },
    { month: 'Jul', maintenance: 15600, repairs: 7400 },
    { month: 'Aug', maintenance: 22800, repairs: 14800 }
  ];

  // Chart 2: Cost by Vehicle
  const costByVehicleData = useMemo(() => {
    return vehicles.map(v => {
      const vehMaint = maintenanceRecords.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.totalCost, 0);
      const vehRep = repairs.filter(r => r.vehicleId === v.id).reduce((s, r) => s + (r.actualCost || r.estimatedCost || 0), 0);
      const vehExp = expenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
      return {
        vehicle: v.registrationNumber,
        maintenance: vehMaint,
        repairs: vehRep,
        otherExpenses: vehExp,
        total: vehMaint + vehRep + vehExp
      };
    }).sort((a, b) => b.total - a.total);
  }, [vehicles, maintenanceRecords, repairs, expenses]);

  // Chart 3: Cost by Category
  const costByCategoryData = useMemo(() => {
    const categories: Record<string, number> = {
      Maintenance: totalMaintenanceCost,
      Repairs: totalRepairCost
    };
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.keys(categories).map(k => ({
      name: k,
      value: categories[k]
    })).filter(c => c.value > 0);
  }, [totalMaintenanceCost, totalRepairCost, expenses]);

  // Chart 4: Repair Trends (Tickets per month by severity)
  const repairTrendsData = [
    { month: 'Apr', minor: 2, moderate: 1, major: 0, critical: 0 },
    { month: 'May', minor: 3, moderate: 2, major: 1, critical: 0 },
    { month: 'Jun', minor: 1, moderate: 2, major: 0, critical: 1 },
    { month: 'Jul', minor: 4, moderate: 1, major: 1, critical: 0 },
    { month: 'Aug', minor: 2, moderate: 3, major: 2, critical: 1 }
  ];

  // Chart 5: Service Compliance Breakdown
  const serviceComplianceData = [
    { name: 'Completed On Time', value: serviceCompliance.onTimeCount, fill: '#10B981' },
    { name: 'Due / Upcoming', value: serviceCompliance.lateCount, fill: '#F59E0B' },
    { name: 'Overdue Services', value: serviceCompliance.overdueCount, fill: '#EF4444' }
  ];

  // Chart 6: Downtime Trends
  const downtimeTrendsData = [
    { month: 'Apr', hours: 18 },
    { month: 'May', hours: 26 },
    { month: 'Jun', hours: 12 },
    { month: 'Jul', hours: 34 },
    { month: 'Aug', hours: 42 }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Fleet Intelligence & Cost Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Holistic operational performance, preventative service compliance, and lifecycle expenditure.
          </p>
        </div>
      </div>

      {/* Requirement 36: Dedicated 9 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Maintenance Cost</span>
          <p className="text-xl font-black text-blue-600 mt-1">
            {formatCurrency(totalMaintenanceCost, userProfile.currency)}
          </p>
          <span className="text-[10px] text-slate-500">Scheduled servicing</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Repair Cost</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalRepairCost, userProfile.currency)}
          </p>
          <span className="text-[10px] text-slate-500">Unscheduled repairs</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Vehicle Cost</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalFleetCost, userProfile.currency)}
          </p>
          <span className="text-[10px] text-slate-500">All lifecycle spend</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cost per KM</span>
          <p className="text-xl font-black text-amber-700 mt-1">
            {userProfile.currency}{costPerKm} / km
          </p>
          <span className="text-[10px] text-slate-500">Fleet burn efficiency</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Downtime</span>
          <p className="text-xl font-black text-rose-700 mt-1">
            {totalFleetDowntimeHours} hours
          </p>
          <span className="text-[10px] text-slate-500">Asset out of service</span>
        </div>

        {/* Metric 6 (Requirement 37) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Service Compliance</span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {serviceCompliance.complianceRate}%
          </p>
          <span className="text-[10px] text-slate-500">On-time scheduled</span>
        </div>

        {/* Metric 7 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overdue Maintenance</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {overdueMaintenanceCount}
          </p>
          <span className="text-[10px] text-slate-500">Urgent overdue alerts</span>
        </div>

        {/* Metric 8 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Repair Cost</span>
          <p className="text-xl font-black text-slate-800 mt-1">
            {formatCurrency(avgRepairCost, userProfile.currency)}
          </p>
          <span className="text-[10px] text-slate-500">Per breakdown ticket</span>
        </div>

        {/* Metric 9 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Downtime</span>
          <p className="text-xl font-black text-purple-600 mt-1">
            {avgDowntime} hrs
          </p>
          <span className="text-[10px] text-slate-500">Mean time to repair</span>
        </div>
      </div>

      {/* Requirement 37: Service Compliance Hero Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Service Compliance: {serviceCompliance.complianceRate}%
            </h3>
            <p className="text-xs text-slate-600">
              Calculated as: <em>Completed services on time ({serviceCompliance.onTimeCount})</em> / <em>Total scheduled services ({serviceCompliance.onTimeCount + serviceCompliance.overdueCount})</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
            On Time: {serviceCompliance.onTimeCount}
          </span>
          <span className="px-3 py-1 bg-white border border-amber-200 text-amber-800 rounded-lg text-xs font-bold">
            Late / Due: {serviceCompliance.lateCount}
          </span>
          <span className="px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-xs font-bold">
            Overdue: {serviceCompliance.overdueCount}
          </span>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Maintenance & Repair Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Monthly Maintenance & Repair Cost
              </h3>
              <p className="text-xs text-slate-500">Scheduled maintenance vs unscheduled repairs</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Last 5 Months</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMaintenanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Amount']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="maintenance" name="Scheduled Maintenance" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repairs" name="Repairs" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cost by Vehicle */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Total Cost by Vehicle Asset
              </h3>
              <p className="text-xs text-slate-500">Highest operational expenditure ranking</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Top Assets</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByVehicleData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="vehicle" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={85} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Spend']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="total" name="Total Spend" fill="#F59E0B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Cost by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-600" />
                Cost Distribution by Category
              </h3>
              <p className="text-xs text-slate-500">Overall fleet expense composition</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Amount']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Repair Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-600" />
                Repair Trends by Severity
              </h3>
              <p className="text-xs text-slate-500">Monthly breakdown frequency by impact tier</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="minor" name="Minor" stackId="a" fill="#94A3B8" />
                <Bar dataKey="moderate" name="Moderate" stackId="a" fill="#F59E0B" />
                <Bar dataKey="major" name="Major" stackId="a" fill="#EA580C" />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 3: Service Compliance & Downtime Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Service Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Service Compliance Status Distribution
              </h3>
              <p className="text-xs text-slate-500">Scheduled maintenance interval compliance</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceComplianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {serviceComplianceData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Downtime Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                Monthly Downtime Trends (Hours)
              </h3>
              <p className="text-xs text-slate-500">Fleet-wide hours lost to workshop delays</p>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">Target: &lt; 20 hrs</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downtimeTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Hours`, 'Downtime']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Area type="monotone" dataKey="hours" name="Downtime Hours" stroke="#DC2626" fill="#FEE2E2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
