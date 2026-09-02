import React from 'react';
import {
  Car,
  Gauge,
  AlertTriangle,
  Wrench,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  AlertOctagon,
  PhoneCall
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatDistance, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { HealthScoreBadge } from '../common/HealthScoreBadge';

export const DriverHomeView: React.FC = () => {
  const {
    vehicles,
    assignedDriverVehicle,
    repairs,
    maintenanceRecords,
    documents,
    smartReminders,
    userProfile,
    organization,
    setActiveTab,
    setIsUpdateOdometerOpen,
    setIsReportIssueOpen
  } = useFleet();

  // If assignedDriverVehicle exists or fallback to first vehicle
  const currentVehicle = assignedDriverVehicle || vehicles[0];

  // Vehicle specific repairs
  const vehicleRepairs = repairs.filter(r => r.vehicleId === currentVehicle?.id);
  const activeRepairs = vehicleRepairs.filter(r => r.status !== 'Completed' && r.status !== 'Closed');

  // Vehicle specific maintenance records
  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicleId === currentVehicle?.id);
  const lastMaintenance = vehicleMaintenance[0];

  // Next reminder
  const nextReminder = smartReminders.find(r => r.vehicleId === currentVehicle?.id && r.status === 'Pending');

  // Expiring documents
  const vehicleDocs = documents.filter(d => d.vehicleId === currentVehicle?.id);
  const expiringDocs = vehicleDocs.filter(d => d.status === 'Expiring Soon' || d.status === 'Expired');

  if (!currentVehicle) {
    return (
      <div className="text-center py-12 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-4">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Vehicle Assigned Yet</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Please ask your fleet manager or administrator to assign a vehicle to your account.
        </p>
        <button
          onClick={() => setActiveTab('vehicles')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          View Fleet Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto text-left pb-6">
      {/* Driver Welcome Banner */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-bold text-sm flex items-center justify-center shadow-2xs">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Driver Portal</span>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {userProfile.name || 'Assigned Driver'}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Fleet Garage</span>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px] block">
            {organization.name || 'Fleet Operations'}
          </span>
        </div>
      </div>

      {/* Primary Assigned Vehicle Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Vehicle Image Banner */}
        <div className="relative h-44 bg-slate-900">
          <img
            src={currentVehicle.imageUrl || 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80'}
            alt={currentVehicle.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Top Status Tags */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <StatusBadge status={currentVehicle.status} />
            <HealthScoreBadge score={currentVehicle.healthScore} />
          </div>

          {/* Bottom Vehicle Identity */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="inline-block px-2 py-0.5 rounded-md bg-amber-500/90 text-white font-mono font-bold text-xs mb-1">
              {currentVehicle.registrationNumber}
            </div>
            <h3 className="text-base font-bold leading-snug drop-shadow-sm">
              {currentVehicle.name}
            </h3>
            <p className="text-[11px] text-slate-300">
              {currentVehicle.manufacturer} {currentVehicle.model} ({currentVehicle.year}) • {currentVehicle.fuelType}
            </p>
          </div>
        </div>

        {/* Odometer & Quick Update Strip */}
        <div className="p-3.5 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block">Current Odometer</span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatDistance(currentVehicle.currentOdometer, userProfile.distanceUnit)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsUpdateOdometerOpen(true, currentVehicle.id)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Update
          </button>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 p-3.5 text-xs">
          <div className="pr-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Next Service Due</span>
            </div>
            <p className="font-bold text-slate-900">
              {nextReminder ? nextReminder.title : 'General Service'}
            </p>
            <p className={`text-[11px] font-semibold mt-0.5 ${
              nextReminder && nextReminder.remainingDays < 0
                ? 'text-rose-600'
                : 'text-amber-600'
            }`}>
              {nextReminder
                ? nextReminder.remainingDays < 0
                  ? `${Math.abs(nextReminder.remainingDays)} days overdue`
                  : `In ${nextReminder.remainingDays} days`
                : 'Up to date'}
            </p>
          </div>

          <div className="pl-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Workshop Log</span>
            </div>
            <p className="font-bold text-slate-900">
              {lastMaintenance ? lastMaintenance.serviceType : 'Initial Inspection'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lastMaintenance ? formatDate(lastMaintenance.serviceDate) : 'Compliant'}
            </p>
          </div>
        </div>

        {/* Expiring Documents Warning Alert */}
        {expiringDocs.length > 0 && (
          <div className="px-3.5 py-2.5 bg-rose-50 border-t border-rose-100 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{expiringDocs.length} document(s) expiring soon ({expiringDocs[0].documentType})</span>
            </div>
            <button
              onClick={() => setActiveTab('documents')}
              className="text-[11px] font-bold text-rose-700 underline shrink-0 cursor-pointer"
            >
              Review
            </button>
          </div>
        )}
      </div>

      {/* Large Mobile Quick Actions Grid (Touch-Friendly 44px+ targets) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Action 1: Report Issue */}
          <button
            onClick={() => setIsReportIssueOpen(true, currentVehicle.id)}
            className="flex items-center gap-3 p-3.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 rounded-2xl transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-amber-950 text-xs">Report Issue</span>
              <span className="text-[10px] text-amber-800">File breakdown / defect</span>
            </div>
          </button>

          {/* Action 2: Add Odometer */}
          <button
            onClick={() => setIsUpdateOdometerOpen(true, currentVehicle.id)}
            className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-xs">Add Odometer</span>
              <span className="text-[10px] text-slate-500">Record trip reading</span>
            </div>
          </button>

          {/* Action 3: Maintenance History */}
          <button
            onClick={() => setActiveTab('maintenance')}
            className="flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-xs">Maintenance</span>
              <span className="text-[10px] text-slate-500">View service logs</span>
            </div>
          </button>

          {/* Action 4: Vehicle Documents */}
          <button
            onClick={() => setActiveTab('documents')}
            className="flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-xs">Documents</span>
              <span className="text-[10px] text-slate-500">RC, PUC & Insurance</span>
            </div>
          </button>
        </div>
      </div>

      {/* Live Repair Progress Tracker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Active Issue Resolution ({activeRepairs.length})
            </h4>
          </div>
          <button
            onClick={() => setActiveTab('repairs')}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            All Tickets <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeRepairs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Vehicle in Good Order</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No open repairs or mechanical issues reported.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRepairs.slice(0, 2).map(repair => (
              <div key={repair.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-slate-900">{repair.issueTitle}</h5>
                    <p className="text-[11px] text-slate-500">{repair.issueCategory} • Reported {formatDate(repair.reportedDate)}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0">
                    {repair.status}
                  </span>
                </div>

                {/* Progress bar stages */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>Reported</span>
                    <span>Inspection</span>
                    <span>In Progress</span>
                    <span>Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          repair.status === 'Reported' ? '25%' :
                          repair.status === 'Inspection' ? '50%' :
                          repair.status === 'Repair In Progress' ? '75%' :
                          repair.status === 'Completed' ? '100%' : '35%'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Assistance Button */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold block">Need Roadside Assistance?</span>
          <span className="text-[10px] text-slate-300">Fleet 24/7 Operations Desk</span>
        </div>
        <a
          href="tel:+9118004258899"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Desk</span>
        </a>
      </div>
    </div>
  );
};
