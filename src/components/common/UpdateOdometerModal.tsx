import React, { useState, useEffect } from 'react';
import { Gauge, AlertTriangle, CheckCircle2, History, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { useFleet } from '../../context/FleetContext';
import { formatDistance } from '../../utils/formatters';
import { enqueueOfflineAction } from '../../utils/offlineQueue';

interface UpdateOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetVehicleId?: string;
}

export const UpdateOdometerModal: React.FC<UpdateOdometerModalProps> = ({
  isOpen,
  onClose,
  presetVehicleId
}) => {
  const {
    vehicles,
    logOdometer,
    userProfile,
    activeRole,
    odometerLogs
  } = useFleet();

  const [selectedVehId, setSelectedVehId] = useState(presetVehicleId || vehicles[0]?.id || '');
  const [newOdometer, setNewOdometer] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isRollbackAuthorized, setIsRollbackAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetVehicle = vehicles.find(v => v.id === selectedVehId) || vehicles[0];

  useEffect(() => {
    if (presetVehicleId) {
      setSelectedVehId(presetVehicleId);
    } else if (vehicles[0]) {
      setSelectedVehId(vehicles[0].id);
    }
  }, [presetVehicleId, vehicles]);

  useEffect(() => {
    if (targetVehicle && isOpen) {
      setNewOdometer(targetVehicle.currentOdometer);
      setNotes('');
      setIsRollbackAuthorized(false);
      setErrorMessage(null);
    }
  }, [targetVehicle, isOpen]);

  if (!targetVehicle) return null;

  const currentOdo = targetVehicle.currentOdometer;
  const numOdo = Number(newOdometer) || 0;
  const isDecrease = numOdo < currentOdo;
  const diff = numOdo - currentOdo;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newOdometer === '' || isNaN(numOdo)) {
      setErrorMessage('Please enter a valid numeric odometer reading.');
      return;
    }

    if (numOdo < 0) {
      setErrorMessage('Odometer reading cannot be negative.');
      return;
    }

    if (isDecrease) {
      if (activeRole === 'Driver') {
        setErrorMessage('Permission Denied: Drivers cannot log rollback mileage. Please contact a Fleet Manager.');
        return;
      }
      if (!isRollbackAuthorized) {
        setErrorMessage('Mileage rollback detected. You must check "Authorize Meter Correction / Rollback" to proceed.');
        return;
      }
    }

    if (!navigator.onLine) {
      enqueueOfflineAction({
        type: 'ODOMETER',
        payload: {
          vehicleId: selectedVehId,
          newOdometer: numOdo,
          notes
        }
      });
    }

    const success = logOdometer(selectedVehId, numOdo, notes, isRollbackAuthorized);
    if (success) {
      onClose();
    }
  };

  const recentVehicleLogs = odometerLogs.filter(l => l.vehicleId === selectedVehId).slice(0, 3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Vehicle Odometer"
      subtitle="Log current odometer mileage to update live vehicle wear and trigger preventative service thresholds."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        {/* Vehicle Selector */}
        <div>
          <label htmlFor="odometer-vehicle" className="block font-bold text-slate-700 mb-1">
            Vehicle Asset *
          </label>
          <select
            id="odometer-vehicle"
            value={selectedVehId}
            onChange={e => setSelectedVehId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
            required
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name} ({formatDistance(v.currentOdometer, userProfile.distanceUnit)})
              </option>
            ))}
          </select>
        </div>

        {/* Current vs New Odometer Card */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Last Recorded
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-slate-700 text-sm">
              <Gauge className="w-4 h-4 text-slate-400" />
              <span>{formatDistance(currentOdo, userProfile.distanceUnit)}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Net Change
            </span>
            <div className="mt-1 font-bold text-xs">
              {diff > 0 ? (
                <span className="text-emerald-700 font-mono">+{diff.toLocaleString()} km</span>
              ) : diff < 0 ? (
                <span className="text-rose-700 font-mono">{diff.toLocaleString()} km (Rollback)</span>
              ) : (
                <span className="text-slate-400 font-mono">No change</span>
              )}
            </div>
          </div>
        </div>

        {/* New Odometer Input */}
        <div>
          <label htmlFor="new-odometer-input" className="block font-bold text-slate-700 mb-1">
            New Current Odometer ({userProfile.distanceUnit}) *
          </label>
          <div className="relative">
            <input
              id="new-odometer-input"
              type="number"
              min="0"
              step="1"
              value={newOdometer}
              onChange={e => setNewOdometer(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 52400"
              className="w-full pl-3 pr-16 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              {userProfile.distanceUnit}
            </span>
          </div>
        </div>

        {/* Rollback Warning & Override for Owner / Fleet Manager */}
        {isDecrease && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-start gap-2 text-rose-800 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>Odometer Mileage Reduction Detected</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              New reading is lower than the recorded mileage. Odometer rollback can violate commercial maintenance compliance.
            </p>
            {activeRole !== 'Driver' ? (
              <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-rose-900">
                <input
                  type="checkbox"
                  checked={isRollbackAuthorized}
                  onChange={e => setIsRollbackAuthorized(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <span>Authorize Meter Correction / Cluster Replacement ({activeRole} Override)</span>
              </label>
            ) : (
              <p className="text-[11px] font-bold text-rose-800">
                Drivers are not permitted to submit rollbacks. Please contact your Fleet Manager.
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="odometer-notes" className="block font-bold text-slate-700 mb-1">
            Trip / Audit Notes
          </label>
          <input
            id="odometer-notes"
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. End of Chennai-Bangalore express transit, fuel depot reading"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Recent Odometer History for this vehicle */}
        {recentVehicleLogs.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
              <History className="w-3 h-3 text-slate-400" />
              Recent Readings
            </span>
            <div className="space-y-1 text-[11px] text-slate-500">
              {recentVehicleLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-1 border-b border-slate-100/60">
                  <span className="font-mono font-bold text-slate-700">
                    {formatDistance(log.odometer, userProfile.distanceUnit)}
                  </span>
                  <span>{log.date} ({log.recordedBy})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isDecrease && activeRole === 'Driver'}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Update Odometer
          </button>
        </div>
      </form>
    </Modal>
  );
};
