import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Building,
  DollarSign,
  Gauge,
  Bell,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetToDemoData,
    exportDataAsJSON,
    exportVehiclesCSV
  } = useFleet();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [orgName, setOrgName] = useState(userProfile.organizationName || '');
  const [role, setRole] = useState(userProfile.role);
  const [currency, setCurrency] = useState(userProfile.currency || '₹');
  const [distanceUnit, setDistanceUnit] = useState(userProfile.distanceUnit || 'km');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      organizationName: orgName,
      role: role as any,
      currency,
      distanceUnit: distanceUnit as any
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account & Fleet Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure organization preferences, currency metrics, and operational persona.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" /> User Profile & Organization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Organization / Fleet Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="e.g. Apex Logistics Solutions"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Persona / Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Individual Vehicle Owner">Individual Vehicle Owner</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Transport Company">Transport Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Currency & Distance Preferences */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" /> Regional Units & Currency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Odometer Metric</label>
              <select
                value={distanceUnit}
                onChange={e => setDistanceUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Admin System & Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" /> Admin System & Demo Data
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Manage local storage cache, export full database backups, or reload seed vehicle records.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportDataAsJSON}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Complete JSON Backup
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all vehicles, maintenance history, and reminders to sample demo state?')) {
                resetToDemoData();
                alert('Database restored to initial fleet demo.');
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Sample Fleet Data
          </button>
        </div>
      </div>
    </div>
  );
};
