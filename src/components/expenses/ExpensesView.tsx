import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Fuel,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3,
  Car,
  CreditCard,
  FileText,
  Gauge
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDistance, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ExpenseCategory, PaymentMethod } from '../../types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Maintenance',
  'Repairs',
  'Tyres',
  'Battery',
  'Fuel',
  'Insurance',
  'PUC',
  'Permit',
  'Spare Parts',
  'Washing',
  'Towing',
  'Other'
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Fleet Card'
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Maintenance: '#2563EB',
  Repairs: '#DC2626',
  Tyres: '#D97706',
  Battery: '#EAB308',
  Fuel: '#F97316',
  Insurance: '#059669',
  PUC: '#7C3AED',
  Permit: '#0D9488',
  'Spare Parts': '#6366F1',
  Washing: '#06B6D4',
  Towing: '#E11D48',
  Other: '#64748B'
};

export const ExpensesView: React.FC = () => {
  const {
    vehicles,
    expenses,
    addExpenseRecord,
    deleteExpenseRecord,
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    presetVehicleId,
    userProfile,
    setActiveTab
  } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form State (Requirement 26)
  const [vehicleId, setVehicleId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [amount, setAmount] = useState<number>(3500);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number>(vehicles[0]?.currentOdometer || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [litersFuel, setLitersFuel] = useState<number>(40);
  const [fuelRatePerLiter, setFuelRatePerLiter] = useState<number>(101);
  const [notes, setNotes] = useState('');

  // Total expenses
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for charts
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.keys(totals).map(cat => ({
      name: cat,
      value: totals[cat]
    }));
  }, [expenses]);

  // Expenses by vehicle
  const expensesByVehicle = useMemo(() => {
    const vehMap: Record<string, number> = {};
    expenses.forEach(e => {
      const v = vehicles.find(veh => veh.id === e.vehicleId);
      const name = v ? v.registrationNumber : 'Unknown';
      vehMap[name] = (vehMap[name] || 0) + e.amount;
    });
    return Object.keys(vehMap)
      .map(k => ({ vehicle: k, total: vehMap[k] }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, vehicles]);

  // Highest-cost vehicle
  const highestCostVehicle = useMemo(() => {
    if (expensesByVehicle.length === 0) return null;
    return expensesByVehicle[0];
  }, [expensesByVehicle]);

  // Average maintenance cost
  const avgMaintenanceCost = useMemo(() => {
    const maint = expenses.filter(e => e.category === 'Maintenance' || e.category === 'Repairs');
    if (maint.length === 0) return 0;
    const sum = maint.reduce((acc, e) => acc + e.amount, 0);
    return Math.round(sum / maint.length);
  }, [expenses]);

  // Cost per kilometer
  const costPerKm = useMemo(() => {
    const totalKm = vehicles.reduce((sum, v) => sum + v.currentOdometer, 0);
    if (totalKm === 0) return 0;
    return (totalSpend / totalKm).toFixed(2);
  }, [totalSpend, vehicles]);

  // Monthly trend chart data
  const monthlyTrendData = useMemo(() => {
    return [
      { month: 'Apr', spend: 32500, fuel: 14000, maintenance: 18500 },
      { month: 'May', spend: 28400, fuel: 15200, maintenance: 13200 },
      { month: 'Jun', spend: 41200, fuel: 18000, maintenance: 23200 },
      { month: 'Jul', spend: 36800, fuel: 16500, maintenance: 20300 },
      { month: 'Aug', spend: 49450, fuel: 21000, maintenance: 28450 }
    ];
  }, []);

  const filteredExpenses = expenses.filter(e => {
    const veh = vehicles.find(v => v.id === e.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !amount) return;

    addExpenseRecord({
      vehicleId,
      category,
      amount: Number(amount),
      date,
      odometer: Number(odometer) || undefined,
      paymentMethod,
      vendor: vendor.trim() || undefined,
      description: description.trim() || undefined,
      invoiceFileName: invoiceFileName.trim() || `${category.toUpperCase()}_INV_${Date.now().toString().slice(-4)}.pdf`,
      litersFuel: category === 'Fuel' ? Number(litersFuel) : undefined,
      fuelRatePerLiter: category === 'Fuel' ? Number(fuelRatePerLiter) : undefined,
      notes: notes.trim() || undefined
    });

    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Expenses & Cost Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log all vehicle costs across 12 standardized categories with vendor, payment method, and invoice tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Vehicle Expense
        </button>
      </div>

      {/* Requirement 27: Executive Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fleet Spend</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalSpend, userProfile.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{expenses.length} transaction entries recorded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Service / Repair Cost</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {formatCurrency(avgMaintenanceCost, userProfile.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Preventative & breakdown average</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest-Cost Vehicle</span>
          <p className="text-xl font-black text-amber-800 mt-1 truncate">
            {highestCostVehicle ? highestCostVehicle.vehicle : 'N/A'}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {highestCostVehicle ? formatCurrency(highestCostVehicle.total, userProfile.currency) : '—'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fleet Cost Per KM</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {userProfile.currency}{costPerKm} / km
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Total lifecycle burn efficiency</span>
        </div>
      </div>

      {/* Requirement 27 Charts: Monthly Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Recharts */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                Monthly Fleet Expenditure Trend
              </h3>
              <p className="text-xs text-slate-500">Historical fuel vs maintenance distribution</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">Last 5 Months</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Cost']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="fuel" name="Fuel & Energy" fill="#F97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance & Repairs" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-amber-600" />
              12-Category Cost Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-2">Proportion of spend by category</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryTotals.map(entry => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Spend']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {categoryTotals.slice(0, 6).map(entry => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.name as ExpenseCategory] || '#64748B' }}
                />
                <span className="text-slate-600 truncate">{entry.name}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(entry.value, userProfile.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vendor, description, vehicle..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All 12 Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description & Vendor</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Odometer</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Invoice</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExpenses.map(item => {
                const veh = vehicles.find(v => v.id === item.vehicleId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                        className="font-bold text-amber-800 hover:text-amber-900 block"
                      >
                        {veh ? veh.registrationNumber : 'Unassigned'}
                      </button>
                      <span className="text-[10px] text-slate-400">{veh?.name}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[item.category] || '#64748B'}15`,
                          color: CATEGORY_COLORS[item.category] || '#64748B'
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{item.description || item.category}</p>
                      <span className="text-[10px] text-slate-500">Vendor: {item.vendor || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {item.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {item.odometer ? `${item.odometer.toLocaleString()} km` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.amount, userProfile.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.invoiceFileName ? (
                        <button
                          onClick={() => alert(`Previewing invoice: ${item.invoiceFileName}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('Delete this expense record?')) deleteExpenseRecord(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requirement 26: Log Expense Modal with all required fields */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Log Vehicle Expense"
        subtitle="Record fuel, repair costs, statutory fees, or parts purchases."
        maxWidth="lg"
      >
        <form onSubmit={handleAddExpense} className="space-y-3.5 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle *</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              required
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category (12 Standard) *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount ({userProfile.currency}) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Odometer ({userProfile.distanceUnit})</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vendor / Fuel Station</label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g. Indian Oil Corporation, Exide Care Center"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice / Receipt File Name</label>
              <input
                type="text"
                value={invoiceFileName}
                onChange={e => setInvoiceFileName(e.target.value)}
                placeholder="e.g. IOC_RECEIPT_88319.pdf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Full tank premium diesel, new 45Ah battery replacement"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {category === 'Fuel' && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fuel Volume (Liters / kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={litersFuel}
                  onChange={e => setLitersFuel(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Price per Liter / kWh ({userProfile.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelRatePerLiter}
                  onChange={e => setFuelRatePerLiter(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Trip reason, driver name, billing notes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
