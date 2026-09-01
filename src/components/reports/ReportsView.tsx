import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Download,
  Printer,
  Calendar,
  Filter,
  Car,
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';

type ReportType =
  | 'Vehicle Maintenance Report'
  | 'Fleet Maintenance Report'
  | 'Expense Report'
  | 'Repair Report'
  | 'Downtime Report'
  | 'Service Compliance Report'
  | 'Document Expiry Report'
  | 'Vehicle Cost Analysis Report';

export const ReportsView: React.FC = () => {
  const {
    vehicles,
    maintenanceRecords,
    repairs,
    expenses,
    documents,
    userProfile,
    totalFleetDowntimeHours,
    serviceCompliance
  } = useFleet();

  // Filters State
  const [reportType, setReportType] = useState<ReportType>('Fleet Maintenance Report');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  // Filtered dataset generator based on chosen report type and filters
  const reportData = useMemo(() => {
    switch (reportType) {
      case 'Vehicle Maintenance Report':
      case 'Fleet Maintenance Report': {
        return maintenanceRecords.filter(m => {
          const matchVeh = selectedVehicleId === 'ALL' || m.vehicleId === selectedVehicleId;
          const matchCat = selectedCategory === 'ALL' || m.serviceType === selectedCategory;
          const inRange = (!startDate || m.serviceDate >= startDate) && (!endDate || m.serviceDate <= endDate);
          return matchVeh && matchCat && inRange;
        });
      }
      case 'Expense Report': {
        return expenses.filter(e => {
          const matchVeh = selectedVehicleId === 'ALL' || e.vehicleId === selectedVehicleId;
          const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
          const inRange = (!startDate || e.date >= startDate) && (!endDate || e.date <= endDate);
          return matchVeh && matchCat && inRange;
        });
      }
      case 'Repair Report': {
        return repairs.filter(r => {
          const matchVeh = selectedVehicleId === 'ALL' || r.vehicleId === selectedVehicleId;
          const matchCat = selectedCategory === 'ALL' || r.issueCategory === selectedCategory;
          const inRange = (!startDate || r.reportedDate >= startDate) && (!endDate || r.reportedDate <= endDate);
          return matchVeh && matchCat && inRange;
        });
      }
      case 'Downtime Report': {
        return repairs.filter(r => {
          const matchVeh = selectedVehicleId === 'ALL' || r.vehicleId === selectedVehicleId;
          return matchVeh && (r.downtimeHours || r.downtimeDays);
        });
      }
      case 'Document Expiry Report': {
        return documents.filter(d => {
          const matchVeh = selectedVehicleId === 'ALL' || d.vehicleId === selectedVehicleId;
          const matchCat = selectedCategory === 'ALL' || d.documentType === selectedCategory;
          return matchVeh && matchCat;
        });
      }
      case 'Vehicle Cost Analysis Report': {
        return vehicles.map(v => {
          const vMaint = maintenanceRecords.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.totalCost, 0);
          const vRep = repairs.filter(r => r.vehicleId === v.id).reduce((s, r) => s + (r.actualCost || r.estimatedCost || 0), 0);
          const vExp = expenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
          return {
            id: v.id,
            registrationNumber: v.registrationNumber,
            name: v.name,
            make: v.manufacturer,
            model: v.model,
            odometer: v.currentOdometer,
            maintenanceCost: vMaint,
            repairCost: vRep,
            operationalExpenses: vExp,
            totalSpend: vMaint + vRep + vExp,
            healthScore: v.healthScore
          };
        });
      }
      case 'Service Compliance Report':
      default: {
        return maintenanceRecords;
      }
    }
  }, [reportType, selectedVehicleId, selectedCategory, startDate, endDate, maintenanceRecords, expenses, repairs, documents, vehicles]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'Expense Report') {
      headers = ['Date', 'Vehicle ID', 'Category', 'Amount', 'Vendor', 'Payment Method', 'Invoice No', 'Notes'];
      rows = (reportData as any[]).map(e => [
        e.date,
        e.vehicleId,
        `"${e.category}"`,
        e.amount,
        `"${e.vendor || ''}"`,
        `"${e.paymentMethod || ''}"`,
        `"${e.receiptNumber || ''}"`,
        `"${e.notes || ''}"`
      ]);
    } else if (reportType === 'Repair Report' || reportType === 'Downtime Report') {
      headers = ['Ticket ID', 'Vehicle ID', 'Issue', 'Category', 'Severity', 'Status', 'Estimated', 'Approved', 'Actual', 'Variance', 'Downtime'];
      rows = (reportData as any[]).map(r => [
        r.id,
        r.vehicleId,
        `"${r.issueTitle}"`,
        `"${r.issueCategory || ''}"`,
        r.severity,
        r.status,
        r.estimatedCost || 0,
        r.approvedCost || 0,
        r.actualCost || 0,
        r.costVariance || 0,
        `"${r.downtimeFormatted || `${r.downtimeHours || 0} hrs`}"`
      ]);
    } else if (reportType === 'Document Expiry Report') {
      headers = ['Document Name', 'Type', 'Vehicle ID', 'Doc Number', 'Issue Date', 'Expiry Date', 'Status', 'Authority'];
      rows = (reportData as any[]).map(d => [
        `"${d.documentName || ''}"`,
        `"${d.documentType}"`,
        d.vehicleId,
        `"${d.documentNumber}"`,
        d.issueDate,
        d.expiryDate,
        d.status,
        `"${d.issuingAuthority || ''}"`
      ]);
    } else if (reportType === 'Vehicle Cost Analysis Report') {
      headers = ['Registration', 'Name', 'Odometer (km)', 'Maintenance Cost', 'Repair Cost', 'Expenses', 'Total Spend', 'Health Score'];
      rows = (reportData as any[]).map(v => [
        `"${v.registrationNumber}"`,
        `"${v.name}"`,
        v.odometer,
        v.maintenanceCost,
        v.repairCost,
        v.operationalExpenses,
        v.totalSpend,
        v.healthScore
      ]);
    } else {
      // Maintenance Report
      headers = ['Service Date', 'Vehicle ID', 'Title', 'Category', 'Odometer', 'Labor Cost', 'Parts Cost', 'Total Cost', 'Workshop'];
      rows = (reportData as any[]).map(m => [
        m.serviceDate,
        m.vehicleId,
        `"${m.title}"`,
        `"${m.category}"`,
        m.odometer,
        m.laborCost,
        m.partsCost,
        m.totalCost,
        `"${m.serviceCenterName || ''}"`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FleetPulse-${reportType.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF / Print Handler
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Reports & Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Generate and export official compliance, operational, downtime, and cost analysis reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-amber-600" />
            Export CSV
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            Export PDF / Print
          </button>
        </div>
      </div>

      {/* Requirement 38: Filter Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-600" />
          Report Parameters & Scope Filters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Report Type Selector (8 Types) */}
          <div className="lg:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Select Report Type *</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="Fleet Maintenance Report">Fleet Maintenance Report</option>
              <option value="Vehicle Maintenance Report">Vehicle Maintenance Report</option>
              <option value="Expense Report">Expense Report</option>
              <option value="Repair Report">Repair Report</option>
              <option value="Downtime Report">Downtime Report</option>
              <option value="Service Compliance Report">Service Compliance Report</option>
              <option value="Document Expiry Report">Document Expiry Report</option>
              <option value="Vehicle Cost Analysis Report">Vehicle Cost Analysis Report</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle Filter</label>
            <select
              value={selectedVehicleId}
              onChange={e => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Fleet Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Output Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                OFFICIAL REPORT
              </span>
              <h2 className="text-lg font-black text-slate-900">{reportType}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generated for: <strong>{userProfile.organizationName}</strong> • Date Range: {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Records: <strong>{reportData.length} entries</strong></p>
            <p className="text-[11px]">Printed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dynamic Report Table Content */}
        {reportData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No Report Data Found"
              description="There are no records matching your selected report type, date range, and vehicle filter."
              actionLabel="Reset Filters"
              onAction={() => {
                setStartDate('2024-01-01');
                setEndDate(new Date().toISOString().slice(0, 10));
                setSelectedVehicleId('ALL');
              }}
            />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {reportType === 'Expense Report' && (
                  <>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Vendor & Description</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </>
                )}

                {(reportType === 'Repair Report' || reportType === 'Downtime Report') && (
                  <>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actual Cost</th>
                    <th className="py-3 px-4 text-right">Downtime</th>
                  </>
                )}

                {reportType === 'Document Expiry Report' && (
                  <>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Doc Number</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </>
                )}

                {reportType === 'Vehicle Cost Analysis Report' && (
                  <>
                    <th className="py-3 px-4">Vehicle Reg</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4 text-right">Maintenance</th>
                    <th className="py-3 px-4 text-right">Repairs</th>
                    <th className="py-3 px-4 text-right">Expenses</th>
                    <th className="py-3 px-4 text-right">Total Lifecycle Spend</th>
                  </>
                )}

                {(reportType === 'Fleet Maintenance Report' || reportType === 'Vehicle Maintenance Report' || reportType === 'Service Compliance Report') && (
                  <>
                    <th className="py-3 px-4">Service Date</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Service Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4">Service Center</th>
                    <th className="py-3 px-4 text-right">Total Cost</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {reportData.map((row: any, idx: number) => {
                const veh = vehicles.find(v => v.id === row.vehicleId);

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    {reportType === 'Expense Report' && (
                      <>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(row.date)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{veh?.registrationNumber || row.vehicleId}</td>
                        <td className="py-3 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{row.category}</span></td>
                        <td className="py-3 px-4">{row.description || '—'} <span className="text-slate-400">({row.vendor || 'N/A'})</span></td>
                        <td className="py-3 px-4">{row.paymentMethod || 'Cash'}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(row.amount, userProfile.currency)}</td>
                      </>
                    )}

                    {(reportType === 'Repair Report' || reportType === 'Downtime Report') && (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-amber-800">{row.id}</td>
                        <td className="py-3 px-4 font-bold">{veh?.registrationNumber || row.vehicleId}</td>
                        <td className="py-3 px-4">{row.issueTitle}</td>
                        <td className="py-3 px-4"><span className="font-bold">{row.severity}</span></td>
                        <td className="py-3 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded">{row.status}</span></td>
                        <td className="py-3 px-4 font-bold">{row.actualCost ? formatCurrency(row.actualCost, userProfile.currency) : 'Pending'}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600">{row.downtimeFormatted || `${row.downtimeHours || 0} hrs`}</td>
                      </>
                    )}

                    {reportType === 'Document Expiry Report' && (
                      <>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.documentName || row.documentType}</td>
                        <td className="py-3 px-4">{row.documentType}</td>
                        <td className="py-3 px-4 font-bold">{veh?.registrationNumber || row.vehicleId}</td>
                        <td className="py-3 px-4 font-mono">{row.documentNumber}</td>
                        <td className="py-3 px-4 font-bold">{formatDate(row.expiryDate)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'Valid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {reportType === 'Vehicle Cost Analysis Report' && (
                      <>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.registrationNumber}</td>
                        <td className="py-3 px-4">{row.make} {row.model}</td>
                        <td className="py-3 px-4 font-mono">{row.odometer.toLocaleString()} km</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(row.maintenanceCost, userProfile.currency)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(row.repairCost, userProfile.currency)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(row.operationalExpenses, userProfile.currency)}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(row.totalSpend, userProfile.currency)}</td>
                      </>
                    )}

                    {(reportType === 'Fleet Maintenance Report' || reportType === 'Vehicle Maintenance Report' || reportType === 'Service Compliance Report') && (
                      <>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(row.serviceDate)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{veh?.registrationNumber || row.vehicleId}</td>
                        <td className="py-3 px-4">{row.title}</td>
                        <td className="py-3 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{row.serviceType || row.category}</span></td>
                        <td className="py-3 px-4 font-mono">{row.odometer.toLocaleString()} km</td>
                        <td className="py-3 px-4">{row.serviceCenterName || 'Authorized Workshop'}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(row.totalCost, userProfile.currency)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
