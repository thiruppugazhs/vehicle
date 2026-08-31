import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Plus,
  Clock,
  Gauge,
  FileCheck,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDistance, formatDate } from '../../utils/formatters';
import { AddServiceModal } from './AddServiceModal';
import { AddScheduleModal } from './AddScheduleModal';

export const MaintenanceView: React.FC = () => {
  const {
    vehicles,
    maintenanceRecords,
    schedules,
    deleteMaintenanceRecord,
    userProfile,
    setActiveTab,
    isAddServiceOpen,
    setIsAddServiceOpen,
    presetVehicleId
  } = useFleet();

  const [activeTabSub, setActiveTabSub] = useState<'records' | 'schedules'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Filtered maintenance records
  const filteredRecords = maintenanceRecords.filter(r => {
    const veh = vehicles.find(v => v.id === r.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.serviceCenterName.toLowerCase().includes(q) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesCategory = selectedCategory === 'ALL' || r.serviceType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log routine service records, parts replaced, and manage recurring mileage/time maintenance schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddScheduleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5" />
            New Recurring Schedule
          </button>

          <button
            onClick={() => setIsAddServiceOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Log Service Record
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabSub('records')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTabSub === 'records'
              ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Service Records ({maintenanceRecords.length})
        </button>

        <button
          onClick={() => setActiveTabSub('schedules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTabSub === 'schedules'
              ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Recurring Maintenance Rules ({schedules.length})
        </button>
      </div>

      {/* Subtab 1: Service Records */}
      {activeTabSub === 'records' && (
        <div className="space-y-4">
          {/* Search and Category Filter */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search service title, center, or registration..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="w-full sm:w-60">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
              >
                <option value="ALL">All Categories (17 Types)</option>
                <option value="Engine Oil">Engine Oil</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Tyre Rotation">Tyre Rotation</option>
                <option value="General Service">General Service</option>
                <option value="Transmission">Transmission</option>
                <option value="Coolant">Coolant</option>
                <option value="AC Service">AC Service</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Service & Parts</th>
                    <th className="py-3.5 px-4">Service Center</th>
                    <th className="py-3.5 px-4">Date & Odometer</th>
                    <th className="py-3.5 px-4">Total Cost</th>
                    <th className="py-3.5 px-4">Invoice</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No service records matched your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(rec => {
                      const veh = vehicles.find(v => v.id === rec.vehicleId);

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                              className="text-left group"
                            >
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-sm group-hover:bg-amber-100">
                                {veh ? veh.registrationNumber : 'Unknown'}
                              </span>
                              <p className="font-bold text-slate-800 text-xs mt-0.5 group-hover:text-amber-800">
                                {veh ? veh.name : ''}
                              </p>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{rec.title}</span>
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-sm inline-block mt-0.5">
                              {rec.serviceType}
                            </span>
                            {rec.partsReplaced.length > 0 && (
                              <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
                                Parts: {rec.partsReplaced.join(', ')}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="font-semibold">{rec.serviceCenterName}</div>
                            <div className="text-[10px] text-slate-400">{rec.technicianName || 'Certified Workshop'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 font-bold">{formatDate(rec.serviceDate)}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {formatDistance(rec.odometer, userProfile.distanceUnit)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {formatCurrency(rec.totalCost, userProfile.currency)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              L: {userProfile.currency}{rec.labourCost} | P: {userProfile.currency}{rec.partsCost}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {rec.invoiceFileName ? (
                              <button
                                onClick={() => setSelectedInvoice(rec.invoiceFileName || null)}
                                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span className="underline">View PDF</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Delete service record for "${rec.title}"?`)) {
                                  deleteMaintenanceRecord(rec.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Record"
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
        </div>
      )}

      {/* Subtab 2: Recurring Schedules */}
      {activeTabSub === 'schedules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Service Intervals</h3>
              <p className="text-xs text-slate-500">
                Rule engine automatically creates advance reminders when approaching calendar months or odometer thresholds.
              </p>
            </div>
            <button
              onClick={() => setIsAddScheduleOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Schedule Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(sch => {
              const veh = vehicles.find(v => v.id === sch.vehicleId);

              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{sch.name}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Vehicle: <span className="font-mono font-bold text-slate-800">{veh ? veh.registrationNumber : 'Unknown'}</span> ({veh?.name})
                      </p>
                    </div>
                    <StatusBadge status={sch.priority} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Interval Rule</span>
                      <span className="font-semibold text-slate-800">
                        Every {sch.intervalMonths || 6} mos OR {sch.intervalKm?.toLocaleString()} km
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Projected Due</span>
                      <span className="font-bold text-slate-900">
                        {formatDate(sch.nextDueDate)} / {sch.nextDueOdometer.toLocaleString()} km
                      </span>
                    </div>
                  </div>

                  {sch.notes && (
                    <p className="text-slate-600 text-[11px] italic">
                      "{sch.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Tracking
                    </span>
                    <button
                      onClick={() => veh && setIsAddServiceOpen(true, veh.id)}
                      className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold hover:bg-amber-100"
                    >
                      Log Service for Rule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900">{selectedInvoice}</h4>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="p-8 text-center bg-slate-50 rounded-xl my-4 border border-dashed border-slate-200">
              <FileCheck className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Verified Tax Invoice Attachment</p>
              <p className="text-xs text-slate-500 mt-1">
                Itemized parts and labor invoice verified with workshop seal and tax compliance details.
              </p>
            </div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        presetVehicleId={presetVehicleId}
      />

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
      />
    </div>
  );
};
