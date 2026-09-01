import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { DocumentType } from '../../types';
import { formatDate, getDaysDifference } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { 
  FileText, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Trash2, 
  ShieldCheck, 
  FileCheck2,
  Calendar,
  Building,
  Bell,
  Eye
} from 'lucide-react';

const DOCUMENT_TYPES: DocumentType[] = [
  'Registration Certificate',
  'Insurance',
  'PUC',
  'Fitness Certificate',
  'Permit',
  'Tax Receipt',
  'Service Invoice',
  'Repair Invoice',
  'Other'
];

export const DocumentsView: React.FC = () => {
  const { vehicles, documents, addDocument, deleteDocument, setActiveTab } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Form State
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('Insurance');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10));
  const [uploadedDate, setUploadedDate] = useState(new Date().toISOString().slice(0, 10));
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDocs = documents.filter(doc => {
    const veh = vehicles.find(v => v.id === doc.vehicleId);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doc.documentName?.toLowerCase().includes(q) ||
      doc.documentType.toLowerCase().includes(q) ||
      doc.documentNumber.toLowerCase().includes(q) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(q) || veh.name.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const expiringSoonCount = documents.filter(d => d.status === 'Expiring Soon').length;
  const expiredCount = documents.filter(d => d.status === 'Expired').length;
  const validCount = documents.filter(d => d.status === 'Valid').length;

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !docNumber.trim()) return;

    const diff = getDaysDifference(expiryDate);
    let docStatus: 'Valid' | 'Expiring Soon' | 'Expired' = 'Valid';
    if (diff < 0) docStatus = 'Expired';
    else if (diff <= 30) docStatus = 'Expiring Soon';

    const targetVeh = vehicles.find(v => v.id === vehicleId);
    const name = docName.trim() || `${targetVeh ? targetVeh.name : 'Vehicle'} - ${docType}`;

    addDocument({
      vehicleId,
      documentName: name,
      documentType: docType,
      documentNumber: docNumber.trim(),
      issueDate,
      expiryDate,
      uploadedDate: uploadedDate || new Date().toISOString().slice(0, 10),
      issuingAuthority,
      status: docStatus,
      fileName: `${docType.replace(/\s+/g, '_').toUpperCase()}_${docNumber.trim()}.pdf`,
      notes
    });

    setDocNumber('');
    setDocName('');
    setNotes('');
    setIsAddDocOpen(false);
  };

  // Helper to determine exact expiry tier for Requirement 29
  const getExpiryTierLabel = (daysLeft: number) => {
    if (daysLeft < 0) return { label: `Expired ${Math.abs(daysLeft)} days ago`, color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (daysLeft === 0) return { label: 'Expires Today (Tier: On Expiry)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (daysLeft <= 1) return { label: 'Expires Tomorrow (Tier: 1 Day)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (daysLeft <= 7) return { label: `Tier: 7 Days Before Expiry (${daysLeft}d left)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (daysLeft <= 15) return { label: `Tier: 15 Days Before Expiry (${daysLeft}d left)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (daysLeft <= 30) return { label: `Tier: 30 Days Before Expiry (${daysLeft}d left)`, color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: `Valid (${daysLeft} days left)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compliance Document Vault</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized repository for statutory certificates, permits, tax invoices, and automated expiry alerts.
          </p>
        </div>
        <button
          onClick={() => setIsAddDocOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Requirement 29 Expiry Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Automated Expiry Schedule Engine</h3>
            <p className="text-xs text-slate-600">
              FleetPulse automatically notifies managers at <strong>30 days</strong>, <strong>15 days</strong>, <strong>7 days</strong>, <strong>1 day</strong>, and <strong>On Expiry</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">
            {expiringSoonCount} Expiring Soon
          </span>
          {expiredCount > 0 && (
            <span className="px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-xs font-bold">
              {expiredCount} Overdue / Expired
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valid Documents</p>
            <p className="text-xl font-black text-slate-900">{validCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expiring in &le; 30 Days</p>
            <p className="text-xl font-black text-amber-700">{expiringSoonCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expired / Action Required</p>
            <p className="text-xl font-black text-rose-600">{expiredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search document name, vehicle, number..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Document Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All 9 Categories</option>
            {DOCUMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'Valid', 'Expiring Soon', 'Expired'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const veh = vehicles.find(v => v.id === doc.vehicleId);
          const daysLeft = getDaysDifference(doc.expiryDate);
          const tierInfo = getExpiryTierLabel(daysLeft);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        {doc.documentType}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {doc.documentName || `${doc.documentType} Certificate`}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === 'Valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'Expiring Soon'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Expiry Tier Badge (Requirement 29) */}
                <div className={`p-2 rounded-xl border text-[11px] font-bold mb-3 flex items-center justify-between ${tierInfo.color}`}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tierInfo.label}
                  </span>
                </div>

                {/* Vehicle Link & Document Number */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Vehicle:</span>
                    <button
                      onClick={() => veh && setActiveTab('vehicle-details', veh.id)}
                      className="font-bold text-amber-800 hover:text-amber-900 truncate max-w-[140px]"
                    >
                      {veh ? `${veh.registrationNumber}` : 'Unassigned'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Document No:</span>
                    <span className="font-mono font-bold text-slate-800">{doc.documentNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="font-medium text-slate-700">{formatDate(doc.issueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span className="font-bold text-slate-900">{formatDate(doc.expiryDate)}</span>
                  </div>
                  {doc.uploadedDate && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[11px]">Uploaded Date:</span>
                      <span className="font-medium text-slate-600 text-[11px]">{formatDate(doc.uploadedDate)}</span>
                    </div>
                  )}
                </div>

                {doc.issuingAuthority && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    {doc.issuingAuthority}
                  </p>
                )}

                {doc.notes && (
                  <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-2">
                    "{doc.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View PDF
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading verified copy of ${doc.fileName || doc.documentName}...`)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete document record ${doc.documentNumber}?`)) deleteDocument(doc.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Document Modal */}
      <Modal
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Upload Compliance Document"
        subtitle="Store statutory certificates in the vehicle document vault with automated expiry reminders."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDocument} className="space-y-3.5 text-left text-xs">
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Name *</label>
            <input
              type="text"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              placeholder="e.g. Comprehensive Motor Fleet Insurance Policy"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Type *</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document / Certificate No. *</label>
              <input
                type="text"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder="e.g. POL-ICICI-8831902"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Uploaded Date</label>
              <input
                type="date"
                value={uploadedDate}
                onChange={e => setUploadedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issuing Authority / Agency</label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={e => setIssuingAuthority(e.target.value)}
              placeholder="e.g. ICICI Lombard General Insurance, RTO Chennai Central"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">File Attachment (PDF / Image)</label>
            <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 text-slate-500">
              <Download className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p className="text-[11px] font-semibold">Drop PDF/PNG document here or click to browse</p>
              <p className="text-[10px] text-slate-400">Stored with cryptographic hash validation</p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes & Endorsements</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Policy coverage limits, speed governor certificate number, special clauses..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDocOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs cursor-pointer"
            >
              Save to Vault
            </button>
          </div>
        </form>
      </Modal>

      {/* Document PDF Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Verified Document: ${previewDoc.documentName}`}
          subtitle={`${previewDoc.documentType} • Certificate No: ${previewDoc.documentNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Digital Vault Verification</p>
                <p className="font-mono font-bold text-emerald-400 text-sm">SHA256: 9e88a31b...e8810</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                Digitally Verified
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="font-bold text-slate-900 text-sm">{previewDoc.fileName || 'compliance_certificate.pdf'}</p>
                <p className="text-xs text-slate-500">Issued: {formatDate(previewDoc.issueDate)} • Valid Until: {formatDate(previewDoc.expiryDate)}</p>
              </div>
              <p className="text-xs text-slate-600 italic max-w-md mx-auto">
                {previewDoc.notes || 'Official compliance document registered on FleetPulse.'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Downloading verified copy of ${previewDoc.fileName}...`)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-xs text-white"
              >
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
