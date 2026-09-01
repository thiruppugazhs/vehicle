import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Car,
  Wrench,
  AlertTriangle,
  FileText,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { AuditLogEntry } from '../../types';
import { EmptyState } from '../common/EmptyState';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, organization } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      (log.entityName && log.entityName.toLowerCase().includes(q));

    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Vehicle':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'Repair':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'Expense':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Document':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'Driver':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Entity Name', 'Description'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityName || ''}"`,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FleetPulse_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Audit Logs & Activity Timeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable operational activity trail for <strong>{organization.name}</strong>. ({filteredLogs.length} events logged).
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by actor name, action, vehicle, or description..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Entity:
            </span>
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Entities</option>
              <option value="Vehicle">Vehicles</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Repair">Repairs</option>
              <option value="Expense">Expenses</option>
              <option value="Document">Documents</option>
              <option value="Driver">Drivers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredLogs.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-6 pb-6">
          {filteredLogs.map(item => (
            <div key={item.id} className="relative pl-6 md:pl-8">
              {/* Dot Icon */}
              <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-xs">
                {getEntityIcon(item.entityType)}
              </div>

              {/* Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{item.action}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px]">
                      {item.entityType}
                    </span>
                    {item.entityName && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold rounded-md text-[10px]">
                        {item.entityName}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.actorName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-semibold text-slate-600">
                    Role: {item.actorRole}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No Audit Logs Found"
          description="There are no activity logs matching your search filter."
          actionLabel="Clear Search"
          onAction={() => {
            setSearchQuery('');
            setEntityFilter('ALL');
          }}
        />
      )}
    </div>
  );
};
