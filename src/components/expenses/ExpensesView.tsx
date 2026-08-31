import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Fuel,
  DollarSign,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Trash2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDistance, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ExpenseCategory } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: '#D97706',
  Maintenance: '#2563EB',
  Repair: '#DC2626',
  Insurance: '#059669',
  'PUC / Inspection': '#7C3AED',
  'Toll & Taxes': '#4B5563',
  Other: '#9CA3AF'
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

  // Form State
  const [vehicleId, setVehicleId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [amount, setAmount] = useState<number>(3500);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number>(0);
  const [litersFuel, setLitersFuel] = useState<number>(35);
  const [fuelRatePerLiter, setFuelRatePerLiter] = useState<number>(100);
  const [vendor, setVendor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Total expenses
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for charts
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  const filteredExpenses = expenses.filter(e => {
    const veh = vehicles.find(v => v.id === e.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
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
      litersFuel: category === 'Fuel' ? Number(litersFuel) : undefined,
      fuelRatePerLiter: category === 'Fuel' ? Number(fuelRatePerLiter) : undefined,
      vendor,
      receiptNumber: receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
      notes
    });

    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Expenses & Fuel Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track operational spending, fuel logs, and cost-per-kilometer across your fleet assets.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Log Expense / Fuel
        </button>
      </div>

      {/* Analytics Overview Cards with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Spend KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifecycle Spend</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalSpend, userProfile.currency)}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{expenses.length} transaction entries recorded</p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {pieData.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#9CA3AF' }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.value, userProfile.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Pie Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-amber-600" />
              Expense Distribution by Category
            </h3>
            <span className="text-xs text-slate-400">Real-time spend breakdown</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#CBD5E1'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), userProfile.currency), 'Amount']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vendor, receipt number, or registration..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repair">Repair</option>
            <option value="Insurance">Insurance</option>
            <option value="Toll & Taxes">Toll & Taxes</option>
            <option value="PUC / Inspection">PUC / Inspection</option>
          </select>
        </div>
      </div>

      {/* Expense Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Odometer</th>
                <th className="py-3.5 px-4">Vendor & Details</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => {
                  const veh = vehicles.find(v => v.id === exp.vehicleId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                          className="font-mono font-bold text-slate-900 hover:text-amber-800"
                        >
                          {veh ? veh.registrationNumber : 'Unknown'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(exp.amount, userProfile.currency)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {exp.odometer ? formatDistance(exp.odometer, userProfile.distanceUnit) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">{exp.vendor || exp.receiptNumber || '—'}</div>
                        {exp.litersFuel && (
                          <div className="text-[10px] text-slate-400">
                            {exp.litersFuel} Liters @ {userProfile.currency}{exp.fuelRatePerLiter}/L
                          </div>
                        )}
                        {exp.notes && <div className="text-[10px] text-slate-500 italic">{exp.notes}</div>}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Delete expense entry?')) deleteExpenseRecord(exp.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Log Vehicle Expense / Fuel Refill"
        subtitle="Record operating costs, fuel purchases, tolls, and maintenance fees."
        maxWidth="lg"
      >
        <form onSubmit={handleAddExpense} className="space-y-4 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle *</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Fuel">Fuel (Petrol/Diesel/EV)</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Insurance">Insurance</option>
                <option value="PUC / Inspection">PUC / Inspection</option>
                <option value="Toll & Taxes">Toll & Taxes</option>
                <option value="Cleaning / Detailing">Cleaning / Detailing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount ({userProfile.currency}) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Odometer (km)</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {category === 'Fuel' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 grid grid-cols-2 gap-3">
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
                <label className="block font-bold text-slate-700 mb-1">Price per Liter ({userProfile.currency})</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vendor / Fuel Station</label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g. Indian Oil, Bharat Petroleum"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Receipt / Invoice No.</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                placeholder="e.g. REC-88319"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Full tank refill before interstate highway haul."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
            >
              Record Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
