import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  Car,
  Calendar,
  Search,
  UserCheck
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const DriversView: React.FC = () => {
  const { drivers, vehicles, addDriver, updateDriver, setActiveTab } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2029-06-30');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q)
    );
  });

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addDriver({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@fleetpulse.io`,
      licenseNumber: licenseNumber.toUpperCase().trim() || `DL${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      licenseExpiry,
      status: 'Active',
      assignedVehicleId: assignedVehicleId || undefined,
      experienceYears: Number(experienceYears),
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      emergencyContact
    });

    setName('');
    setPhone('');
    setIsAddDriverOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Drivers Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain driver rosters, commercial license validity, emergency contacts, and vehicle assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddDriverOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, phone number, or license ID..."
            className="w-full pl-10 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map(d => {
          const assignedVeh = vehicles.find(v => v.id === d.assignedVehicleId);

          return (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={d.avatarUrl}
                  alt={d.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{d.name}</h3>
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{d.experienceYears} Years Experience</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  {assignedVeh ? (
                    <button
                      onClick={() => setActiveTab('vehicle-details', assignedVeh.id)}
                      className="font-mono font-bold text-slate-800 hover:text-amber-800"
                    >
                      {assignedVeh.registrationNumber}
                    </button>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">License Number:</span>
                  <span className="font-mono font-bold text-slate-800">{d.licenseNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">License Expiry:</span>
                  <span className="font-bold text-slate-900">{formatDate(d.licenseExpiry)}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{d.email}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="Add New Fleet Driver"
        subtitle="Register driver profile, contact details, and license validity."
        maxWidth="lg"
      >
        <form onSubmit={handleAddDriver} className="space-y-4 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
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
                placeholder="driver@apexlogistics.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Commercial License No.</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="e.g. TN0120230008812"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">License Expiry Date</label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={e => setLicenseExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Primary Vehicle</label>
              <select
                value={assignedVehicleId}
                onChange={e => setAssignedVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">-- Unassigned --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              placeholder="e.g. +91 98400 99887 (Brother)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs"
            >
              Save Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
