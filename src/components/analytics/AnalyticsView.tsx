import React from 'react';
import {
  BarChart3,
  TrendingDown,
  Download,
  Calendar,
  AlertTriangle,
  FileCheck,
  Printer,
  Sparkles,
  ArrowUpRight
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
  Legend
} from 'recharts';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDistance } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const {
    vehicles,
    expenses,
    repairs,
    maintenanceRecords,
    userProfile,
    exportDataAsJSON,
    exportVehiclesCSV
  } = useFleet();

  // Aggregate cost per vehicle
  const vehicleCostData = vehicles.map(v => {
    const vehExpenses = expenses.filter(e => e.vehicleId === v.id);
    const totalCost = vehExpenses.reduce((sum, e) => sum + e.amount, 0);
    const downtime = repairs
      .filter(r => r.vehicleId === v.id)
      .reduce((sum, r) => sum + (r.downtimeDays || 0), 0);

    return {
      name: v.registrationNumber,
      fullName: v.name,
      spend: totalCost,
      downtimeDays: downtime,
      odometer: v.currentOdometer,
      healthScore: v.healthScore
    };
  }).sort((a, b) => b.spend - a.spend);

  // Monthly trend mock series
  const monthlyTrendData = [
    { month: 'Apr', maintenance: 10266, fuel: 14500, repairs: 0 },
    { month: 'May', maintenance: 4500, fuel: 22000, repairs: 3850 },
    { month: 'Jun', maintenance: 1829, fuel: 28000, repairs: 0 },
    { month: 'Jul', maintenance: 10620, fuel: 31000, repairs: 4500 },
    { month: 'Aug', maintenance: 14800, fuel: 34250, repairs: 14800 }
  ];

  // Most expensive vehicles
  const mostExpensiveVehicles = [...vehicleCostData].slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Fleet Analytics & Executive Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify expensive or problematic vehicles, analyze downtime, and compare maintenance lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportVehiclesCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={exportDataAsJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Export JSON Backup
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Top 3 Problematic / Expensive Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mostExpensiveVehicles.map((item, idx) => (
          <div
            key={item.name}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rank #{idx + 1} Highest Spend
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                {item.name}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {formatCurrency(item.spend, userProfile.currency)}
            </h3>
            <p className="text-xs text-slate-500 truncate">{item.fullName}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Downtime: <strong>{item.downtimeDays} Days</strong></span>
              <span>Health: <strong>{item.healthScore}/100</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Expense Trends Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Fleet Expense Trends</h3>
            <p className="text-xs text-slate-500">Breakdown of Maintenance, Repairs, and Fuel over time.</p>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            5-Month Trajectory
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickFormatter={(val: number) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), '']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Legend />
              <Bar dataKey="maintenance" name="Routine Maintenance" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fuel" name="Fuel & Energy" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="repairs" name="Unscheduled Repairs" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Cost Comparison Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Total Lifecycle Cost by Vehicle Asset</h3>
          <p className="text-xs text-slate-500">Cross-fleet expenditure benchmarking.</p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vehicleCostData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" stroke="#94A3B8" fontSize={12} tickFormatter={(val: number) => `${val / 1000}k`} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={100} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Total Spent']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="spend" fill="#B45309" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
