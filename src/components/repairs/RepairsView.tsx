import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Car,
  ChevronRight,
  TrendingUp,
  FileText,
  Camera,
  Eye,
  Building2,
  User,
  Gauge
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { RepairSeverity, RepairStatus, RepairTicket } from '../../types';

const REPAIR_STAGES: RepairStatus[] = [
  'Reported',
  'Inspection',
  'Estimate',
  'Approval',
  'Repair In Progress',
  'Completed',
  'Closed'
];

const ISSUE_CATEGORIES = [
  'Clutch & Transmission',
  'Brakes',
  'Engine & Powertrain',
  'Electrical',
  'Suspension',
  'AC Service',
  'Tyres & Wheels',
  'Cooling System',
  'Body & Collision',
  'Other'
];

export const RepairsView: React.FC = () => {
  const {
    vehicles,
    repairs,
    addRepairTicket,
    updateRepairTicket,
    moveRepairStage,
    isReportIssueOpen,
    setIsReportIssueOpen,
    presetVehicleId,
    serviceCenters,
    userProfile,
    setActiveTab,
    totalFleetDowntimeHours
  } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedRepair, setSelectedRepair] = useState<RepairTicket | null>(null);

  // Quick Report Issue Form State (Requirement 23)
  const [vehicleId, setVehicleId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState(ISSUE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<RepairSeverity>('Moderate');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number>(vehicles[0]?.currentOdometer || 0);
  const [reportedBy, setReportedBy] = useState('Assigned Driver');
  const [assignedServiceCenter, setAssignedServiceCenter] = useState(serviceCenters[0]?.name || '');
  const [estimatedCost, setEstimatedCost] = useState<number>(7500);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Update odometer default when vehicleId changes in form
  const handleVehicleChange = (newVehId: string) => {
    setVehicleId(newVehId);
    const v = vehicles.find(veh => veh.id === newVehId);
    if (v) setOdometer(v.currentOdometer);
  };

  const filteredRepairs = repairs.filter(r => {
    const veh = vehicles.find(v => v.id === r.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.issueTitle.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleCreateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !issueTitle.trim()) return;

    const id = `REP-${new Date().getFullYear()}-${String(repairs.length + 1).padStart(3, '0')}`;
    const newRepair: RepairTicket = {
      id,
      vehicleId,
      issueTitle: issueTitle.trim(),
      issueCategory,
      description: description.trim(),
      severity,
      status: 'Reported',
      reportedDate: reportDate,
      reportedBy: reportedBy.trim() || 'Fleet Driver',
      odometer: Number(odometer) || undefined,
      assignedServiceCenter: assignedServiceCenter || undefined,
      estimatedCost: Number(estimatedCost) || undefined,
      approvedCost: Number(estimatedCost) || undefined,
      actualCost: undefined,
      downtimeStart: new Date().toISOString(),
      downtimeHours: 0,
      downtimeFormatted: '0 hours',
      photos: photoUrl.trim() ? [photoUrl.trim()] : undefined,
      notes: notes.trim() || undefined
    };

    addRepairTicket(newRepair);

    // Reset Form
    setIssueTitle('');
    setDescription('');
    setNotes('');
    setPhotoUrl('');
    setIsReportIssueOpen(false);
  };

  const getNextStage = (current: RepairStatus): RepairStatus | null => {
    const idx = REPAIR_STAGES.indexOf(current);
    if (idx >= 0 && idx < REPAIR_STAGES.length - 1) {
      return REPAIR_STAGES[idx + 1];
    }
    return null;
  };

  const getSeverityBadge = (sev: RepairSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Major':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Minor':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Repair In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approval':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Estimate':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Inspection':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Reported':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Repairs & Breakdown Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full 7-stage repair lifecycle workflow from ticket reporting to workshop release and closure.
          </p>
        </div>
        <button
          onClick={() => {
            setVehicleId(presetVehicleId || vehicles[0]?.id || '');
            setIsReportIssueOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Requirement 35: Vehicle Downtime Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Fleet Asset Downtime Tracker</h3>
            <p className="text-xs text-slate-600">
              Total Fleet Downtime This Month: <strong>{totalFleetDowntimeHours} hours</strong> ({Math.round(totalFleetDowntimeHours / 24)} days)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Active In-Shop Repairs:</span>
          <span className="text-rose-600 font-extrabold">
            {repairs.filter(r => r.status !== 'Completed' && r.status !== 'Closed').length}
          </span>
        </div>
      </div>

      {/* 7-Stage Workflow Pipeline Visualizer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          7-Stage Standard Repair Lifecycle Pipeline
        </p>
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {REPAIR_STAGES.map((stage, idx) => {
            const count = repairs.filter(r => r.status === stage).length;
            const isFinished = stage === 'Completed' || stage === 'Closed';

            return (
              <React.Fragment key={stage}>
                <div
                  onClick={() => setStatusFilter(statusFilter === stage ? 'ALL' : stage)}
                  className={`flex-1 p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                    statusFilter === stage
                      ? 'border-amber-500 bg-amber-50/50 shadow-2xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-slate-400 block">
                    STEP {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {stage}
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      count > 0
                        ? isFinished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count} {count === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
                {idx < REPAIR_STAGES.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, vehicle, issue..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Stages</option>
            {REPAIR_STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Moderate">Moderate</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      {/* Repair Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepairs.map(repair => {
          const veh = vehicles.find(v => v.id === repair.vehicleId);
          const nextStage = getNextStage(repair.status);
          const hasVariance = repair.approvedCost !== undefined && repair.actualCost !== undefined;
          const variance = hasVariance ? repair.actualCost! - repair.approvedCost! : 0;

          return (
            <div
              key={repair.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header with ID, Severity, Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {repair.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(repair.severity)}`}>
                        {repair.severity}
                      </span>
                      {repair.issueCategory && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {repair.issueCategory}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{repair.issueTitle}</h3>
                  </div>

                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(repair.status)}`}>
                    {repair.status}
                  </span>
                </div>

                {/* Vehicle & Assignment Info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <button
                      onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                      className="font-bold text-amber-800 hover:text-amber-900"
                    >
                      {veh ? `${veh.registrationNumber} (${veh.name})` : 'Unassigned'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reported On:</span>
                    <span className="font-medium text-slate-700">{formatDate(repair.reportedDate)} by {repair.reportedBy}</span>
                  </div>
                  {repair.assignedServiceCenter && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Workshop:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[200px]">{repair.assignedServiceCenter}</span>
                    </div>
                  )}
                  {repair.downtimeFormatted && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Downtime Duration:</span>
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {repair.downtimeFormatted}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  "{repair.description}"
                </p>

                {/* Requirement 25: Cost Tracking & Variance Comparison */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Estimated</span>
                    <span className="font-bold text-xs text-slate-700">
                      {repair.estimatedCost ? formatCurrency(repair.estimatedCost, userProfile.currency) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Approved</span>
                    <span className="font-bold text-xs text-slate-900">
                      {repair.approvedCost ? formatCurrency(repair.approvedCost, userProfile.currency) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Actual Cost</span>
                    <span className="font-extrabold text-xs text-slate-900">
                      {repair.actualCost ? formatCurrency(repair.actualCost, userProfile.currency) : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Variance Callout / Warning Highlight */}
                {hasVariance && (
                  <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold mb-3 ${
                    repair.isUnusualVariance
                      ? 'bg-rose-50 border border-rose-300 text-rose-800'
                      : variance > 0
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {repair.isUnusualVariance && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      Variance (Actual vs Approved):
                    </span>
                    <span>
                      {variance > 0 ? `+${formatCurrency(variance, userProfile.currency)}` : formatCurrency(variance, userProfile.currency)}
                      {repair.isUnusualVariance && ' (Unusual Spike!)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRepair(repair)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>

                {/* Advance Stage Button (Requirement 22) */}
                {nextStage && (
                  <button
                    type="button"
                    onClick={() => moveRepairStage(repair.id, nextStage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>Advance to {nextStage}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {!nextStage && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lifecycle Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirement 23: Quick Report Issue Modal */}
      <Modal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        title="Report Vehicle Issue or Breakdown"
        subtitle="File an unscheduled maintenance ticket with severity classification and downtime tracking."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRepair} className="space-y-3.5 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle *</label>
            <select
              value={vehicleId}
              onChange={e => handleVehicleChange(e.target.value)}
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
              <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
              <input
                type="text"
                value={issueTitle}
                onChange={e => setIssueTitle(e.target.value)}
                placeholder="e.g. Heavy Clutch Pedal & Gear Resistance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={issueCategory}
                onChange={e => setIssueCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                {ISSUE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity *</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as RepairSeverity)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Minor">Minor (Cosmetic / Low urgency)</option>
                <option value="Moderate">Moderate (Non-critical mechanical)</option>
                <option value="Major">Major (High risk / Potential stall)</option>
                <option value="Critical">Critical (Immediate stop / Highway hazard)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date Reported *</label>
              <input
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Odometer ({userProfile.distanceUnit})</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe symptoms, noise, warning lights, driving conditions when issue was noticed..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Service Center</label>
              <select
                value={assignedServiceCenter}
                onChange={e => setAssignedServiceCenter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                {serviceCenters.map(sc => (
                  <option key={sc.id} value={sc.name}>
                    {sc.name} ({sc.city || 'Depot'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Cost ({userProfile.currency})</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={e => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Photo Attachment / Evidence URL</label>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or simulated upload"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Internal Fleet Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Driver report notes, warranty status, roadside assistance dispatch..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReportIssueOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs cursor-pointer"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Requirement 24 & 25: Comprehensive Repair Details Modal */}
      {selectedRepair && (
        <Modal
          isOpen={!!selectedRepair}
          onClose={() => setSelectedRepair(null)}
          title={`Repair Record: ${selectedRepair.id}`}
          subtitle={`${selectedRepair.issueTitle} • Current Stage: ${selectedRepair.status}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left text-xs">
            {/* Header Stage Stepper */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifecycle Stage</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedRepair.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getSeverityBadge(selectedRepair.severity)}`}>
                  {selectedRepair.severity} Severity
                </span>
                {getNextStage(selectedRepair.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = getNextStage(selectedRepair.status);
                      if (next) {
                        moveRepairStage(selectedRepair.id, next);
                        setSelectedRepair(prev => prev ? { ...prev, status: next } : null);
                      }
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold"
                  >
                    Advance Stage &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle & Reported Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Vehicle</span>
                <span className="font-bold text-slate-800">
                  {vehicles.find(v => v.id === selectedRepair.vehicleId)?.registrationNumber || selectedRepair.vehicleId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Reported Date</span>
                <span className="font-bold text-slate-800">{formatDate(selectedRepair.reportedDate)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Reported By</span>
                <span className="font-bold text-slate-800">{selectedRepair.reportedBy}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Odometer</span>
                <span className="font-bold text-slate-800">{selectedRepair.odometer?.toLocaleString() || '—'} km</span>
              </div>
            </div>

            {/* Cost Comparison & Variance (Requirement 25) */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Cost Tracking & Variance Analysis
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">Estimated Cost</span>
                  <span className="font-black text-sm text-slate-800">
                    {selectedRepair.estimatedCost ? formatCurrency(selectedRepair.estimatedCost, userProfile.currency) : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">Approved Cost</span>
                  <span className="font-black text-sm text-slate-800">
                    {selectedRepair.approvedCost ? formatCurrency(selectedRepair.approvedCost, userProfile.currency) : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">Actual Cost</span>
                  <span className="font-black text-sm text-slate-900">
                    {selectedRepair.actualCost ? formatCurrency(selectedRepair.actualCost, userProfile.currency) : 'Pending'}
                  </span>
                </div>
              </div>

              {selectedRepair.actualCost !== undefined && selectedRepair.approvedCost !== undefined && (
                <div className={`p-3 rounded-xl border flex items-center justify-between font-bold ${
                  selectedRepair.isUnusualVariance
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : (selectedRepair.actualCost - selectedRepair.approvedCost) > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <span>Variance (Actual - Approved):</span>
                  <span>
                    {(selectedRepair.actualCost - selectedRepair.approvedCost) > 0 ? '+' : ''}
                    {formatCurrency(selectedRepair.actualCost - selectedRepair.approvedCost, userProfile.currency)}
                    {selectedRepair.isUnusualVariance && ' (Unusual Cost Difference!)'}
                  </span>
                </div>
              )}
            </div>

            {/* Service Center & Dates (Requirement 24) */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Service Center</span>
                <span className="font-bold text-slate-800">{selectedRepair.assignedServiceCenter || 'Pending assignment'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Assigned Technician</span>
                <span className="font-bold text-slate-800">{selectedRepair.technicianName || 'Workshop Master Tech'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Repair Start Date</span>
                <span className="font-bold text-slate-800">{selectedRepair.startDate ? formatDate(selectedRepair.startDate) : 'Not Started'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Expected Completion</span>
                <span className="font-bold text-slate-800">{selectedRepair.expectedCompletion ? formatDate(selectedRepair.expectedCompletion) : 'TBD'}</span>
              </div>
            </div>

            {/* Downtime Details (Requirement 35) */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider block">
                Vehicle Unavailable Downtime
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Downtime Began:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedRepair.downtimeStart ? formatDate(selectedRepair.downtimeStart) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Total Downtime:</span>
                <span className="font-bold text-rose-700 text-sm">
                  {selectedRepair.downtimeFormatted || `${selectedRepair.downtimeHours || 0} hours`}
                </span>
              </div>
            </div>

            {/* Description & Notes */}
            <div>
              <span className="font-bold text-slate-700 block mb-1">Issue Description</span>
              <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                {selectedRepair.description}
              </p>
            </div>

            {selectedRepair.notes && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Internal Notes</span>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 italic">
                  {selectedRepair.notes}
                </p>
              </div>
            )}

            {/* Photos & Attachments */}
            {selectedRepair.photos && selectedRepair.photos.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Photos</span>
                <div className="flex gap-2 overflow-x-auto">
                  {selectedRepair.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Evidence ${i + 1}`}
                      className="w-24 h-20 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRepair(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
