import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  AlertTriangle,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Trash2,
  Upload
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, getDaysDifference } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { DocumentType } from '../../types';

export const DocumentsView: React.FC = () => {
  const { vehicles, documents, addDocument, deleteDocument, setActiveTab } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [docType, setDocType] = useState<DocumentType>('Insurance Policy');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDocs = documents.filter(doc => {
    const veh = vehicles.find(v => v.id === doc.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doc.documentType.toLowerCase().includes(q) ||
      doc.documentNumber.toLowerCase().includes(q) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringSoonCount = documents.filter(d => d.status === 'Expiring Soon').length;
  const expiredCount = documents.filter(d => d.status === 'Expired').length;

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !docNumber.trim()) return;

    // Calculate status based on expiryDate
    const diff = getDaysDifference(expiryDate);
    let docStatus: 'Valid' | 'Expiring Soon' | 'Expired' = 'Valid';
    if (diff < 0) docStatus = 'Expired';
    else if (diff <= 30) docStatus = 'Expiring Soon';

    addDocument({
      vehicleId,
      documentType: docType,
      documentNumber: docNumber.trim(),
      issueDate,
      expiryDate,
      issuingAuthority,
      status: docStatus,
      fileName: `${docType.slice(0, 4).toUpperCase()}_${docNumber.trim()}.pdf`,
      notes
    });

    setDocNumber('');
    setIsAddDocOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Document Vault & Expiry Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centralized archive for Registration Certificates (RC), Insurance, PUC, Fitness, and Commercial Permits.
          </p>
        </div>

        <button
          onClick={() => setIsAddDocOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black active:bg-slate-800 shadow-xs transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Expiry Warning Banners if any */}
      {(expiringSoonCount > 0 || expiredCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Compliance Renewal Alerts
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                {expiringSoonCount} documents are expiring in the next 30 days. Maintain valid certificates to avoid impoundment and fines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter('Expiring Soon')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100"
          >
            Filter Expiring
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search document type, number, or vehicle..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {['ALL', 'Valid', 'Expiring Soon', 'Expired'].map(st => (
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map(doc => {
          const veh = vehicles.find(v => v.id === doc.vehicleId);
          const daysLeft = getDaysDifference(doc.expiryDate);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{doc.documentType}</span>
                    <span className="font-mono text-xs text-slate-500 font-semibold">{doc.documentNumber}</span>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Vehicle:</span>
                    <button
                      onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                      className="font-mono font-bold text-slate-800 hover:text-amber-800"
                    >
                      {veh ? veh.registrationNumber : 'Unknown'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="font-medium text-slate-700">{formatDate(doc.issueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span className="font-bold text-slate-900">{formatDate(doc.expiryDate)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-400">Countdown:</span>
                    <span
                      className={`font-bold ${
                        daysLeft < 0
                          ? 'text-rose-600'
                          : daysLeft <= 30
                          ? 'text-amber-700'
                          : 'text-emerald-600'
                      }`}
                    >
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                    </span>
                  </div>
                </div>

                {doc.issuingAuthority && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">
                    Authority: {doc.issuingAuthority}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => alert(`Downloading verified copy of ${doc.fileName}...`)}
                  className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  {doc.fileName || 'Download PDF'}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete document record ${doc.documentNumber}?`)) deleteDocument(doc.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Document Modal */}
      <Modal
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Upload Fleet Compliance Document"
        subtitle="Register Registration Certificate (RC), Insurance, Emission PUC, or National Permits."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDocument} className="space-y-4 text-left text-xs">
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
              <label className="block font-bold text-slate-700 mb-1">Document Type *</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Insurance Policy">Insurance Policy</option>
                <option value="Registration Certificate (RC)">Registration Certificate (RC)</option>
                <option value="PUC / Emission Certificate">PUC / Emission Certificate</option>
                <option value="Fitness Certificate">Fitness Certificate</option>
                <option value="Commercial Permit">Commercial Permit</option>
                <option value="Road Tax Receipt">Road Tax Receipt</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Number *</label>
              <input
                type="text"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder="e.g. POL-ICICI-8831902"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issuing Authority / Agency</label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={e => setIssuingAuthority(e.target.value)}
              placeholder="e.g. ICICI Lombard General Insurance, RTO Chennai"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Coverage Terms</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Zero-depreciation bumper to bumper cover with roadside towing."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDocOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-2xs"
            >
              Save Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
