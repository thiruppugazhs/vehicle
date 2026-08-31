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
  Car
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { PriorityLevel, RepairStatus } from '../../types';

export const RepairsView: React.FC = () => {
  const {
    vehicles,
    repairs,
    addRepairTicket,
    updateRepairTicket,
    isReportIssueOpen,
    setIsReportIssueOpen,
    presetVehicleId,
    serviceCenters,
    userProfile,
    setActiveTab
  } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const [vehicleId, setVehicleId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<PriorityLevel>('High');
  const [reportedBy, setReportedBy] = useState('Driver on Duty');
  const [assignedServiceCenter, setAssignedServiceCenter] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(5000);

  const filteredRepairs = repairs.filter(r => {
    const veh = vehicles.find(v => v.id === r.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.issueTitle.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !issueTitle.trim()) return;

    addRepairTicket({
      vehicleId,
      issueTitle,
      description,
      severity,
      status: 'Reported',
      reportedDate: new Date().toISOString().slice(0, 10),
      reportedBy: reportedBy || 'Fleet Operator',
      assignedServiceCenter: assignedServiceCenter || 'Tata Commercial Motors Heavy Fleet Care',
      estimatedCost: Number(estimatedCost),
      downtimeDays: 1
    });

    setIssueTitle('');
    setDescription('');
    setIsReportIssueOpen(false);
  };

  const handleAdvanceStatus = (repairId: string, currentStatus: RepairStatus) => {
    const nextStatusMap: Record<RepairStatus, RepairStatus> = {
      Reported: 'In Repair',
      Diagnosing: 'In Repair',
      'In Repair': 'Quality Check',
      'Quality Check': 'Resolved',
      Resolved: 'Resolved'
    };
    updateRepairTicket(repairId, { status: nextStatusMap[currentStatus] });
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
            Track unscheduled issues from reporting through workshop repair, testing, and road-ready sign-off.
          </p>
        </div>

        <button
          onClick={() => setIsReportIssueOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-xs transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Breakdown / Issue
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search repairs by issue title, description, or vehicle registration..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {['ALL', 'Reported', 'In Repair', 'Quality Check', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Repairs List */}
      <div className="space-y-4">
        {filteredRepairs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Open Breakdowns</h3>
            <p className="text-xs text-slate-500 mt-1">All vehicles are mechanically sound with no active unresolved tickets.</p>
          </div>
        ) : (
          filteredRepairs.map(rep => {
            const veh = vehicles.find(v => v.id === rep.vehicleId);

            return (
              <div
                key={rep.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                        className="font-mono text-xs font-bold text-slate-900 bg-slate-100 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {veh ? veh.registrationNumber : 'Unknown'}
                      </button>
                      <span className="text-xs font-bold text-slate-700">{veh?.name}</span>
                      <StatusBadge status={rep.status} size="sm" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        rep.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {rep.severity} Severity
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{rep.issueTitle}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">{rep.description}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(rep.actualCost || rep.estimatedCost || 0, userProfile.currency)}
                    </span>
                    {rep.downtimeDays && (
                      <span className="text-[11px] font-semibold text-rose-600">
                        {rep.downtimeDays} Days Downtime
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress / Assigned Center */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>Reported: {formatDate(rep.reportedDate)} by {rep.reportedBy}</span>
                    <span>•</span>
                    <span>Assigned: <strong>{rep.assignedServiceCenter || 'In-House'}</strong></span>
                  </div>

                  {rep.status !== 'Resolved' && (
                    <button
                      onClick={() => handleAdvanceStatus(rep.id, rep.status)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                    >
                      Advance to {rep.status === 'Reported' ? 'In Repair' : rep.status === 'In Repair' ? 'Quality Check' : 'Resolved'} →
                    </button>
                  )}
                </div>

                {rep.resolutionNotes && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/40 p-2 rounded-lg border border-amber-200/50">
                    Note: {rep.resolutionNotes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Report Issue Modal */}
      <Modal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        title="Report Vehicle Breakdown / Issue"
        subtitle="Create an urgent repair ticket and alert workshop coordinators."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRepair} className="space-y-4 text-left text-xs">
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              placeholder="e.g. Brake booster pressure leak, Clutch slipping"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Critical">Critical (Immediate stop)</option>
                <option value="High">High (Major impairment)</option>
                <option value="Medium">Medium (Minor squeak/wear)</option>
                <option value="Low">Low (Cosmetic/accessory)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Cost ({userProfile.currency})</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={e => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Workshop / Service Center</label>
            <select
              value={assignedServiceCenter}
              onChange={e => setAssignedServiceCenter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {serviceCenters.map(sc => (
                <option key={sc.id} value={sc.name}>{sc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Description & Symptoms</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide exact symptoms, noises, warning lamps illuminated, or roadside condition..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReportIssueOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
