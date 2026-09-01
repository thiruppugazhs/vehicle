import React, { useState } from 'react';
import {
  Car,
  ArrowLeft,
  Wrench,
  AlertTriangle,
  Receipt,
  FileText,
  Bell,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Gauge,
  MapPin,
  Building,
  ShieldCheck,
  Edit2,
  Download,
  Fuel,
  Info,
  DollarSign,
  AlertOctagon,
  FileCheck,
  Trash2
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { HealthScoreBadge } from '../common/HealthScoreBadge';
import { formatCurrency, formatDistance, formatDate } from '../../utils/formatters';
import { AddEditVehicleModal } from '../vehicles/AddEditVehicleModal';
import { AddServiceModal } from '../maintenance/AddServiceModal';
import { MaintenanceRecord } from '../../types';

export const VehicleDetailsView: React.FC = () => {
  const {
    selectedVehicleId,
    getVehicleById,
    getDriverById,
    maintenanceRecords,
    deleteMaintenanceRecord,
    repairs,
    expenses,
    documents,
    smartReminders,
    setActiveTab,
    setIsAddServiceOpen,
    setIsReportIssueOpen,
    setIsAddExpenseOpen,
    setIsUpdateOdometerOpen,
    userProfile
  } = useFleet();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'maintenance' | 'repairs' | 'expenses' | 'documents' | 'reminders' | 'drivers' | 'timeline'
  >('overview');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<MaintenanceRecord | null>(null);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);

  const vehicle = getVehicleById(selectedVehicleId || '');

  if (!vehicle) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Vehicle Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a vehicle from your fleet directory.</p>
        <button
          onClick={() => setActiveTab('vehicles')}
          className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
        >
          Return to Vehicles
        </button>
      </div>
    );
  }

  // Related collections for this vehicle
  const vehicleServices = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);
  const vehicleRepairs = repairs.filter(r => r.vehicleId === vehicle.id);
  const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter(d => d.vehicleId === vehicle.id);
  const vehicleReminders = smartReminders.filter(r => r.vehicleId === vehicle.id);
  const driver = getDriverById(vehicle.assignedDriverId || '');

  // Cost summaries
  const totalMaintenanceCost = vehicleServices.reduce((sum, s) => sum + s.totalCost, 0);
  const totalRepairCost = vehicleRepairs.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
  const totalExpenseSpend = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Cost per KM calculation
  const costPerKm = vehicle.currentOdometer > 0
    ? (totalExpenseSpend / vehicle.currentOdometer).toFixed(2)
    : '0.00';

  // Last service & next service calculations
  const lastService = vehicleServices.length > 0 ? vehicleServices[0] : null;
  const nextReminder = vehicleReminders.find(r => r.status === 'Pending');

  // Age calculation
  const currentYear = new Date().getFullYear();
  const vehicleAge = Math.max(0, currentYear - vehicle.year);

  // Chronological timeline aggregation
  const timelineEvents = [
    ...vehicleServices.map(s => ({
      id: s.id,
      date: s.serviceDate,
      type: 'service',
      title: `${s.serviceType} Completed`,
      desc: `${s.title} by ${s.serviceCenterName}. Cost: ${userProfile.currency}${s.totalCost.toLocaleString()}`,
      badge: 'Service'
    })),
    ...vehicleRepairs.map(r => ({
      id: r.id,
      date: r.reportedDate,
      type: 'repair',
      title: `Issue Reported: ${r.issueTitle}`,
      desc: `${r.description} (Status: ${r.status})`,
      badge: 'Repair'
    })),
    ...vehicleExpenses.map(e => ({
      id: e.id,
      date: e.date,
      type: 'expense',
      title: `${e.category} Recorded`,
      desc: `${userProfile.currency}${e.amount.toLocaleString()} - ${e.notes || e.vendor || ''}`,
      badge: 'Expense'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 text-left">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('vehicles')}
          className="flex items-center gap-1 text-slate-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Vehicles Directory
        </button>
        <span>/</span>
        <span className="text-slate-900 font-mono">{vehicle.registrationNumber}</span>
      </div>

      {/* Section 14: Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <img
              src={vehicle.imageUrl}
              alt={vehicle.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                  {vehicle.registrationNumber}
                </span>
                <StatusBadge status={vehicle.status} size="md" />
                <HealthScoreBadge score={vehicle.healthScore} size="md" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                {vehicle.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {vehicle.manufacturer} {vehicle.model} {vehicle.variant ? `• ${vehicle.variant}` : ''} ({vehicle.year}) • {vehicle.fuelType} • {vehicle.transmission}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={() => setIsAddServiceOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Add Service
            </button>

            <button
              onClick={() => setIsReportIssueOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Issue
            </button>

            <button
              onClick={() => setIsAddExpenseOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              Add Expense
            </button>

            <button
              onClick={() => setIsUpdateOdometerOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              Log Odometer
            </button>
          </div>
        </div>

        {/* 8 Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'maintenance', label: `Maintenance (${vehicleServices.length})`, icon: Wrench },
            { id: 'repairs', label: `Repairs (${vehicleRepairs.length})`, icon: AlertTriangle },
            { id: 'expenses', label: `Expenses (${vehicleExpenses.length})`, icon: Receipt },
            { id: 'documents', label: `Documents (${vehicleDocs.length})`, icon: FileText },
            { id: 'reminders', label: `Reminders (${vehicleReminders.length})`, icon: Bell },
            { id: 'drivers', label: 'Driver Info', icon: User },
            { id: 'timeline', label: 'Timeline', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Section 15 Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Odometer</span>
                <p className="text-lg font-extrabold text-slate-900 mt-1">
                  {formatDistance(vehicle.currentOdometer, userProfile.distanceUnit)}
                </p>
                <span className="text-[10px] text-slate-500">~{vehicle.averageDailyKm || 80} km/day</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateOdometerOpen(true, vehicle.id)}
                className="mt-2 text-[11px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                Log Mileage &rarr;
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Service</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1 truncate">
                {vehicleServices[0] ? formatDate(vehicleServices[0].serviceDate) : 'None'}
              </p>
              <span className="text-[10px] text-slate-500 truncate block">
                {vehicleServices[0] ? vehicleServices[0].serviceType : 'No service yet'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Next Service Due</span>
              <p className="text-lg font-extrabold text-amber-800 mt-1 truncate">
                {vehicleReminders[0] ? formatDate(vehicleReminders[0].dueDate) : 'On Schedule'}
              </p>
              <span className="text-[10px] text-slate-500 truncate block">
                {vehicleReminders[0] ? `${vehicleReminders[0].category}` : 'Up to date'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Maintenance</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {formatCurrency(totalMaintenanceCost, userProfile.currency)}
              </p>
              <span className="text-[10px] text-slate-500">{vehicleServices.length} logged records</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Repair Expenses</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {formatCurrency(totalRepairCost, userProfile.currency)}
              </p>
              <span className="text-[10px] text-slate-500">{vehicleRepairs.length} tickets</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Cost Per KM</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">
                {userProfile.currency}{costPerKm}
              </p>
              <span className="text-[10px] text-slate-500">Lifecycle cost</span>
            </div>
          </div>

          {/* Health Score & Diagnostic Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <HealthScoreBadge score={vehicle.healthScore} size="hero" />
            </div>

            <div className="flex-1 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Diagnostic Health Status</span>
              {vehicle.healthScore >= 80 ? (
                <p className="text-emerald-700">
                  All scheduled intervals and mechanical diagnostics are within normal operational thresholds. No active critical repairs.
                </p>
              ) : vehicle.healthScore >= 60 ? (
                <p className="text-amber-800 font-medium">
                  Routine maintenance or periodic fluid inspection is approaching. Review pending reminders to keep vehicle in optimal condition.
                </p>
              ) : (
                <p className="text-rose-700 font-medium">
                  Urgent maintenance or critical repair tickets are pending. Immediate workshop scheduling recommended to prevent roadside failure.
                </p>
              )}
            </div>
          </div>

          {/* Specifications & Identification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-600" /> Vehicle Specifications
              </h4>
              <div className="grid grid-cols-2 gap-y-2.5">
                <div>
                  <span className="text-slate-400 block text-[11px]">Vehicle Type</span>
                  <span className="font-bold text-slate-800">{vehicle.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Manufacturing Year</span>
                  <span className="font-bold text-slate-800">{vehicle.year} ({vehicleAge} years old)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Fuel Type</span>
                  <span className="font-bold text-slate-800">{vehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Transmission</span>
                  <span className="font-bold text-slate-800">{vehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Seating Capacity</span>
                  <span className="font-bold text-slate-800">{vehicle.seatingCapacity} Persons</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Purchase Price</span>
                  <span className="font-bold text-slate-800">{formatCurrency(vehicle.purchasePrice, userProfile.currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Compliance & Fleet Assignment
              </h4>
              <div className="grid grid-cols-2 gap-y-2.5">
                <div>
                  <span className="text-slate-400 block text-[11px]">VIN / Chassis</span>
                  <span className="font-mono font-bold text-slate-800">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Engine Number</span>
                  <span className="font-mono font-bold text-slate-800">{vehicle.engineNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-bold text-slate-800">{vehicle.department || 'Operations'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Base Location</span>
                  <span className="font-bold text-slate-800">{vehicle.location || 'Main Depot'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                  <span className="font-bold text-slate-800">{driver ? driver.name : 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Driver Contact</span>
                  <span className="font-bold text-slate-800">{driver ? driver.phone : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MAINTENANCE */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Maintenance Records</h3>
              <p className="text-xs text-slate-500">Itemized service history, parts replaced, and invoices.</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              <Wrench className="w-3.5 h-3.5" />
              Log New Service
            </button>
          </div>

          {vehicleServices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No maintenance records logged yet. Click "Log New Service" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {vehicleServices.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                        <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                          {rec.serviceType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(rec.serviceDate)} • {formatDistance(rec.odometer, userProfile.distanceUnit)} • {rec.serviceCenterName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(rec.totalCost, userProfile.currency)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Labour: {userProfile.currency}{rec.labourCost} + Parts: {userProfile.currency}{rec.partsCost}
                      </p>
                    </div>
                  </div>

                  {rec.partsReplaced && rec.partsReplaced.length > 0 && (
                    <div className="text-xs">
                      <span className="text-slate-400 font-semibold text-[11px] block mb-1">Parts Replaced:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.partsReplaced.map((part, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium text-[11px]">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
                      "{rec.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Technician: {rec.technicianName || 'Certified Technician'}</span>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => {
                            setRecordToEdit(rec);
                            setIsEditServiceOpen(true);
                          }}
                          className="p-1 hover:text-slate-800 text-slate-400 rounded-sm hover:bg-slate-100"
                          title="Edit Service Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete service record for "${rec.title}"?`)) {
                              deleteMaintenanceRecord(rec.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 text-slate-400 rounded-sm hover:bg-rose-50"
                          title="Delete Service Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {rec.invoiceFileName && (
                      <button
                        onClick={() => setSelectedInvoice(rec.invoiceFileName || null)}
                        className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        {rec.invoiceFileName}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: REPAIRS */}
      {activeSubTab === 'repairs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Repair Tickets & Breakdowns</h3>
              <p className="text-xs text-slate-500">Track unscheduled repairs from reporting to resolution.</p>
            </div>
            <button
              onClick={() => setIsReportIssueOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Issue
            </button>
          </div>

          {vehicleRepairs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No breakdown or repair tickets recorded for this vehicle.
            </div>
          ) : (
            <div className="space-y-4">
              {vehicleRepairs.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{rep.issueTitle}</span>
                        <StatusBadge status={rep.status} size="sm" />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          rep.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {rep.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reported by {rep.reportedBy} on {formatDate(rep.reportedDate)}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(rep.actualCost || rep.estimatedCost || 0, userProfile.currency)}
                      </span>
                      {rep.downtimeDays && (
                        <p className="text-[11px] text-amber-700 font-semibold">
                          {rep.downtimeDays} Days Downtime
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700">{rep.description}</p>

                  {rep.resolutionNotes && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <span className="font-bold block">Resolution Progress:</span>
                      {rep.resolutionNotes}
                    </div>
                  )}

                  {rep.partsUsed && (
                    <div className="text-xs">
                      <span className="text-slate-400 font-semibold text-[10px] block mb-1">Parts Utilized:</span>
                      <div className="flex flex-wrap gap-1">
                        {rep.partsUsed.map((p, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: EXPENSES */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expenses & Fuel History</h3>
              <p className="text-xs text-slate-500">Monitor fuel refills, maintenance bills, and operational expenses.</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true, vehicle.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              Add Expense
            </button>
          </div>

          {vehicleExpenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No expense records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4">Details / Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vehicleExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{formatDate(e.date)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(e.amount, userProfile.currency)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {e.odometer ? formatDistance(e.odometer, userProfile.distanceUnit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{e.vendor || e.notes || '—'}</div>
                        {e.litersFuel && (
                          <div className="text-[10px] text-slate-400">
                            {e.litersFuel} Liters @ {userProfile.currency}{e.fuelRatePerLiter}/L
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: DOCUMENTS */}
      {activeSubTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vehicle Documents & Permits</h3>
              <p className="text-xs text-slate-500">RC, Insurance, Pollution Certificates, and Fitness records.</p>
            </div>
            <button
              onClick={() => alert('Upload Document: Select PDF or image to attach.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>

          {vehicleDocs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No documents uploaded for this vehicle.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicleDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{doc.documentType}</span>
                      <p className="font-mono text-slate-500 text-[11px] mt-0.5">{doc.documentNumber}</p>
                    </div>
                    <StatusBadge status={doc.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Issue Date</span>
                      <span>{formatDate(doc.issueDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Expiry Date</span>
                      <span className="font-bold text-slate-900">{formatDate(doc.expiryDate)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate">{doc.issuingAuthority || 'Regional Transport Authority'}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 font-semibold">{doc.fileName || 'document.pdf'}</span>
                    <button
                      onClick={() => alert(`Downloading ${doc.documentType}...`)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: SMART REMINDERS */}
      {activeSubTab === 'reminders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Service & Expiry Reminders</h3>
              <p className="text-xs text-slate-500">Predictive dual-trigger notifications for {vehicle.registrationNumber}.</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true, vehicle.id)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs"
            >
              Schedule Service
            </button>
          </div>

          {vehicleReminders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No pending reminders for this vehicle.
            </div>
          ) : (
            <div className="space-y-3">
              {vehicleReminders.map(rem => (
                <div
                  key={rem.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rem.title}</span>
                      <StatusBadge status={rem.priority} size="sm" />
                    </div>
                    <p className="text-slate-600 mt-1">{rem.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>Due Date: {formatDate(rem.dueDate)}</span>
                      {rem.dueOdometer && <span>• Due Odometer: {formatDistance(rem.dueOdometer, userProfile.distanceUnit)}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddServiceOpen(true, vehicle.id)}
                    className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
                  >
                    Action
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: DRIVERS */}
      {activeSubTab === 'drivers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Driver Profile & License</h3>
            <p className="text-xs text-slate-500">Designated personnel assigned to operate {vehicle.name}.</p>
          </div>

          {driver ? (
            <div className="flex flex-col sm:flex-row items-start gap-5 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <img
                src={driver.avatarUrl}
                alt={driver.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{driver.name}</span>
                    <StatusBadge status={driver.status} size="sm" />
                  </div>
                  <p className="text-slate-500">{driver.experienceYears} Years Commercial Driving Experience</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-2 border-t border-slate-200 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="font-bold">{driver.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-bold">{driver.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Driving License Number</span>
                    <span className="font-mono font-bold">{driver.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">License Expiry</span>
                    <span className="font-bold">{formatDate(driver.licenseExpiry)}</span>
                  </div>
                </div>

                {driver.emergencyContact && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    Emergency Contact: <span className="font-semibold">{driver.emergencyContact}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No driver is currently assigned to this vehicle.
            </div>
          )}
        </div>
      )}

      {/* Tab 8: TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Vehicle Operational Timeline</h3>
            <p className="text-xs text-slate-500">Chronological history of all maintenance, repairs, and financial events.</p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
            {timelineEvents.map(evt => (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.2 rounded-md font-semibold text-[10px]">
                      {evt.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto">{formatDate(evt.date)}</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{evt.desc}</p>
                </div>
              </div>
            ))}
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
              <p className="font-bold text-slate-800 text-sm">Verified Digital Tax Invoice</p>
              <p className="text-xs text-slate-500 mt-1">
                Authorized workshop invoice cryptographically stamped and archived in the FleetPulse vault.
              </p>
            </div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs"
            >
              Done Viewing
            </button>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <AddEditVehicleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vehicleToEdit={vehicle}
      />

      {/* Edit Service Modal */}
      <AddServiceModal
        isOpen={isEditServiceOpen}
        onClose={() => {
          setIsEditServiceOpen(false);
          setRecordToEdit(null);
        }}
        presetVehicleId={vehicle.id}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};
