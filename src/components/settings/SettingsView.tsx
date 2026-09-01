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
  Check,
  Calendar,
  Globe,
  Camera,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Users
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { OperationalRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    organization,
    updateOrganization,
    activeRole,
    switchRole,
    notificationPreferences,
    updateNotificationPreferences,
    resetToDemoData,
    exportDataAsJSON,
    exportVehiclesCSV
  } = useFleet();

  const [activeSection, setActiveSection] = useState<'profile' | 'organization' | 'notifications' | 'preferences'>('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Profile State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone || '+91 98401 23456');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');

  // Organization State
  const [orgName, setOrgName] = useState(organization.name);
  const [orgLogo, setOrgLogo] = useState(organization.logoUrl || '');
  const [orgAddress, setOrgAddress] = useState(organization.address);
  const [orgPhone, setOrgPhone] = useState(organization.contactPhone);
  const [orgEmail, setOrgEmail] = useState(organization.contactEmail);
  const [taxId, setTaxId] = useState(organization.taxId || 'GSTIN33AAACA1122D1Z5');

  // Preferences State
  const [currency, setCurrency] = useState(userProfile.currency || '₹');
  const [distanceUnit, setDistanceUnit] = useState(userProfile.distanceUnit || 'km');
  const [dateFormat, setDateFormat] = useState(userProfile.dateFormat || 'DD/MM/YYYY');
  const [language, setLanguage] = useState(userProfile.language || 'English (India)');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      avatarUrl,
      currency,
      distanceUnit: distanceUnit as 'km' | 'miles',
      dateFormat: dateFormat as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
      language,
      organizationName: orgName
    });

    updateOrganization({
      name: orgName,
      logoUrl: orgLogo,
      address: orgAddress,
      contactPhone: orgPhone,
      contactEmail: orgEmail,
      taxId
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
          Configure organization workspace, user profile, notification alerts, and localization metrics.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings successfully saved and synchronized!
        </div>
      )}

      {/* Navigation Tabs (Requirement 43) */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1 rounded-2xl border shadow-2xs">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'organization', label: 'Organization Workspace', icon: Building },
          { id: 'notifications', label: 'Notification Alerts', icon: Bell },
          { id: 'preferences', label: 'Localization & Metrics', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: User Profile (Requirement 43) */}
        {activeSection === 'profile' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              Personal Profile Details
            </h3>

            <div className="flex items-center gap-4">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="flex-1 text-xs">
                <label className="block font-bold text-slate-700 mb-1">Profile Photo URL</label>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Active Operational Role (Requirement 41)</label>
                <select
                  value={activeRole}
                  onChange={e => switchRole(e.target.value as OperationalRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Owner">Owner (Full System Access)</option>
                  <option value="Fleet Manager">Fleet Manager (Vehicles, Drivers, Maintenance, Repairs)</option>
                  <option value="Driver">Driver (Assigned Vehicle, Odometer, Issues)</option>
                  <option value="Technician">Technician (Assigned Repairs & Notes)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Organization Support (Requirement 42) */}
        {activeSection === 'organization' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                Fleet Business Organization Workspace
              </h3>
              <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-[10px] rounded-lg">
                Plan: {organization.plan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax ID / GST Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Corporate Address</label>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={e => setOrgAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={orgPhone}
                  onChange={e => setOrgPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={e => setOrgEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Workspace Members Simulation */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Workspace Organization Members
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Thiruppugazh</p>
                    <p className="text-slate-400">thiruppugazh@abctransport.in</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded text-[10px]">Owner</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Vikram Malhotra</p>
                    <p className="text-slate-400">vikram.m@abctransport.in</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-extrabold rounded text-[10px]">Fleet Manager</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Rajesh Kumar</p>
                    <p className="text-slate-400">rajesh.k@abctransport.in</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-extrabold rounded text-[10px]">Driver</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Sanjay Deshmukh</p>
                    <p className="text-slate-400">service@toyotaapex.com</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold rounded text-[10px]">Technician</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Notification Alerts (Requirement 43) */}
        {activeSection === 'notifications' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Automated Alert & Reminder Configuration
            </h3>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Email Reminders</p>
                  <p className="text-slate-500 text-[11px]">Send service schedules and compliance expirations to corporate email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.emailNotifications}
                  onChange={e => updateNotificationPreferences({ emailNotifications: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Browser Push Notifications</p>
                  <p className="text-slate-500 text-[11px]">Desktop alerts when vehicles enter critical status or service is due.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.browserPushNotifications}
                  onChange={e => updateNotificationPreferences({ browserPushNotifications: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Service Reminders</p>
                  <p className="text-slate-500 text-[11px]">Dual calendar and odometer service milestone notifications.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.notify7DaysBefore}
                  onChange={e => updateNotificationPreferences({ notify7DaysBefore: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Document Expiry Alerts</p>
                  <p className="text-slate-500 text-[11px]">Early warning system at 30, 15, 7, and 1 day before expiration.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.notify30DaysBefore}
                  onChange={e => updateNotificationPreferences({ notify30DaysBefore: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Immediate Repair & Breakdown Alerts</p>
                  <p className="text-slate-500 text-[11px]">Instant dispatch notifications for Critical severity issues.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.criticalAlertsImmediate}
                  onChange={e => updateNotificationPreferences({ criticalAlertsImmediate: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Preferences & Localization (Requirement 43 & 60) */}
        {activeSection === 'preferences' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              Currency, Distance & Regional Localization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Currency (Default: INR ₹)</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="₹">INR - Indian Rupee (₹)</option>
                  <option value="$">USD - US Dollar ($)</option>
                  <option value="€">EUR - Euro (€)</option>
                  <option value="£">GBP - British Pound (£)</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Distance Unit (Default: Kilometers)</label>
                <select
                  value={distanceUnit}
                  onChange={e => setDistanceUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date Format (Default: DD/MM/YYYY)</label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard Indian/UK)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="English (India)">English (India)</option>
                  <option value="English (US)">English (US)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
          >
            Save Settings Changes
          </button>
        </div>
      </form>

      {/* Backup, Export & Demo Data Management (Requirement 59) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-600" />
          Data Backup & Demo Fleet Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={exportVehiclesCSV}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Fleet CSV
          </button>

          <button
            type="button"
            onClick={exportDataAsJSON}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <FileCheck className="w-4 h-4 text-slate-500" />
            Download Full JSON Backup
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all vehicle maintenance records, repairs, and documents to default demo state?')) {
                resetToDemoData();
              }
            }}
            className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-rose-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            Reset to Sample Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
