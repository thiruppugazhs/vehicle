import React, { useState, useEffect } from 'react';
import { AlertTriangle, Camera, CheckCircle2, X, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { RepairSeverity } from '../../types';
import { enqueueOfflineAction } from '../../utils/offlineQueue';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetVehicleId?: string;
}

const ISSUE_CATEGORIES = [
  'Engine & Powertrain',
  'Brakes & ABS',
  'Clutch & Transmission',
  'Electrical & Battery',
  'Tyres & Wheels',
  'Suspension & Steering',
  'AC & Climate Control',
  'Cooling System & Radiator',
  'Body & Collision',
  'Other'
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  presetVehicleId
}) => {
  const { vehicles, addRepairTicket, showToast, userProfile } = useFleet();

  const [vehicleId, setVehicleId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState(ISSUE_CATEGORIES[0]);
  const [severity, setSeverity] = useState<RepairSeverity>('Moderate');
  const [description, setDescription] = useState('');
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().slice(0, 10));
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (presetVehicleId) {
      setVehicleId(presetVehicleId);
    } else if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [presetVehicleId, vehicles, vehicleId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !issueTitle.trim()) {
      showToast('Please select a vehicle and enter issue title.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!navigator.onLine) {
        // Enqueue offline action
        enqueueOfflineAction({
          type: 'REPORT_ISSUE',
          payload: {
            vehicleId,
            issueTitle,
            issueCategory,
            description,
            severity,
            reportedDate,
            photoUrl: photoUrl || undefined
          }
        });
        showToast('Saved offline. Ticket will synchronize once internet is restored.');
      } else {
        await addRepairTicket({
          vehicleId,
          issueTitle,
          issueCategory,
          description: description.trim() || issueTitle,
          severity,
          status: 'Reported',
          reportedDate,
          reportedBy: userProfile.name || 'Assigned Driver',
          photos: photoUrl ? [photoUrl] : []
        });
        showToast('Vehicle issue reported successfully and dispatched to Fleet Admin.');
      }

      // Reset form
      setIssueTitle('');
      setDescription('');
      setPhotoUrl('');
      onClose();
    } catch (err) {
      console.error('Failed to report issue:', err);
      showToast('Error filing issue ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePhoto = () => {
    // Mobile camera simulation / default image
    const samplePhotos = [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
    ];
    setPhotoUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Vehicle Issue or Breakdown"
      subtitle="File an unscheduled maintenance ticket with severity and photo evidence."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        {/* Vehicle Selection */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Vehicle *</label>
          <select
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 font-semibold text-xs"
            required
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              placeholder="e.g. Brake grinding sound when slowing down"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Category *</label>
            <select
              value={issueCategory}
              onChange={e => setIssueCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 text-xs"
            >
              {ISSUE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Severity *</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as RepairSeverity)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 text-xs"
            >
              <option value="Minor">Minor (Cosmetic / Low urgency)</option>
              <option value="Moderate">Moderate (Operational but driveable)</option>
              <option value="Major">Major (High risk / Potential stall)</option>
              <option value="Critical">Critical (Immediate safety hazard / Stop)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date Reported *</label>
            <input
              type="date"
              value={reportedDate}
              onChange={e => setReportedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 text-xs"
              required
            />
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Problem Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened, unusual noises, dash warning lights, or operating conditions..."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900 text-xs resize-none"
          />
        </div>

        {/* Photo Evidence / Camera Upload */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Photo Evidence (Optional)</label>
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
              <img src={photoUrl} alt="Issue preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSimulatePhoto}
              className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-amber-700 bg-slate-50/60 hover:bg-amber-50/50 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-xs">Take Photo or Attach Image</span>
            </button>
          )}
        </div>

        {/* Submit & Cancel */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isSubmitting ? 'Filing Issue...' : 'Submit Issue'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
