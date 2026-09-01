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
  UserCheck,
  Clock,
  History,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Driver } from '../../types';

export const DriversView: React.FC = () => {
  const { drivers, vehicles, addDriver, updateDriver, assignDriver, setActiveTab } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [assignmentModalDriver, setAssignmentModalDriver] = useState<Driver | null>(null);
  const [historyModalVehicle, setHistoryModalVehicle] = useState<any | null>(null);

  // Form State (Requirement 30)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2029-06-30');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [driverStatus, setDriverStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Assignment Modal State (Requirement 31)
  const [selectedVehicleToAssign, setSelectedVehicleToAssign] = useState(vehicles[0]?.id || '');
  const [assignmentRole, setAssignmentRole] = useState<'Primary' | 'Backup'>('Primary');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      joiningDate: joiningDate || new Date().toISOString().slice(0, 10),
      status: driverStatus,
      assignedVehicleId: assignedVehicleId || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    });

    setName('');
    setPhone('');
    setEmail('');
    setLicenseNumber('');
    setEmergencyContact('');
    setIsAddDriverOpen(false);
  };

  const handleExecuteAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentModalDriver || !selectedVehicleToAssign) return;

    assignDriver(selectedVehicleToAssign, assignmentModalDriver.id, assignmentRole, assignmentNotes);
    setAssignmentModalDriver(null);
    setAssignmentNotes('');
  };

  const getStatusPill = (st: 'Active' | 'On Leave' | 'Inactive') => {
    switch (st) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Drivers Management & Duty Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage licensed commercial operators, Primary and Backup vehicle allocations, and duty assignment history.
          </p>
        </div>

        <button
          onClick={() => setIsAddDriverOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, phone, license number, or email..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
          {['ALL', 'Active', 'On Leave', 'Inactive'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map(driver => {
          const assignedVeh = vehicles.find(v => v.id === driver.assignedVehicleId || v.primaryDriverId === driver.id);
          const backupVeh = vehicles.find(v => v.backupDriverId === driver.id);

          return (
            <div
              key={driver.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={driver.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{driver.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Joined {driver.joiningDate ? formatDate(driver.joiningDate) : '2024'}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(driver.status)}`}>
                    {driver.status}
                  </span>
                </div>

                {/* Contact & License info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone:
                    </span>
                    <span className="font-bold text-slate-800">{driver.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email:
                    </span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{driver.email}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Commercial License:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{driver.licenseNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">License Expiry:</span>
                    <span className="font-bold text-slate-700">{formatDate(driver.licenseExpiry)}</span>
                  </div>

                  {driver.emergencyContact && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Emergency:</span>
                      <span className="font-medium text-rose-700">{driver.emergencyContact}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Vehicle Section (Requirement 31) */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-amber-800">Primary Assignment</span>
                    {assignedVeh ? (
                      <button
                        onClick={() => setActiveTab('vehicle-details', assignedVeh.id)}
                        className="font-bold text-amber-900 hover:underline"
                      >
                        {assignedVeh.registrationNumber}
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </div>

                  {backupVeh && (
                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/40 text-[11px]">
                      <span className="text-slate-600">Backup Asset:</span>
                      <span className="font-bold text-slate-800">{backupVeh.registrationNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicleToAssign(vehicles[0]?.id || '');
                    setAssignmentModalDriver(driver);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Assign Vehicle
                </button>

                {assignedVeh && assignedVeh.driverHistory && assignedVeh.driverHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistoryModalVehicle(assignedVeh)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Assignment History
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirement 30: Add Driver Modal with all fields */}
      <Modal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="Add Commercial Driver to Roster"
        subtitle="Register driver credentials, commercial transport endorsements, and emergency contacts."
        maxWidth="lg"
      >
        <form onSubmit={handleAddDriver} className="space-y-3.5 text-left text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status *</label>
              <select
                value={driverStatus}
                onChange={e => setDriverStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 font-semibold"
              >
                <option value="Active">Active (On Duty)</option>
                <option value="On Leave">On Leave (Temporary)</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="driver@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">License Number *</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="TN0120180004921"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">License Expiry Date *</label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={e => setLicenseExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Joining Date *</label>
              <input
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Vehicle Assignment</label>
              <select
                value={assignedVehicleId}
                onChange={e => setAssignedVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="">No Vehicle (Reserve Pool)</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                placeholder="+91 98401 99999 (Spouse / Next of Kin)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs cursor-pointer"
            >
              Save Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* Requirement 31: Driver Assignment Modal (Primary vs Backup) */}
      {assignmentModalDriver && (
        <Modal
          isOpen={!!assignmentModalDriver}
          onClose={() => setAssignmentModalDriver(null)}
          title={`Assign Vehicle to ${assignmentModalDriver.name}`}
          subtitle="Configure Primary or Backup driver assignment with audit history logging."
          maxWidth="md"
        >
          <form onSubmit={handleExecuteAssignment} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Fleet Vehicle *</label>
              <select
                value={selectedVehicleToAssign}
                onChange={e => setSelectedVehicleToAssign(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 font-semibold"
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
              <label className="block font-bold text-slate-700 mb-1">Driver Role Assignment *</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  assignmentRole === 'Primary' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="Primary"
                    checked={assignmentRole === 'Primary'}
                    onChange={() => setAssignmentRole('Primary')}
                    className="accent-amber-500"
                  />
                  <span>Primary Driver</span>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  assignmentRole === 'Backup' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="Backup"
                    checked={assignmentRole === 'Backup'}
                    onChange={() => setAssignmentRole('Backup')}
                    className="accent-amber-500"
                  />
                  <span>Backup Driver</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assignment Notes & Duty Shift</label>
              <input
                type="text"
                value={assignmentNotes}
                onChange={e => setAssignmentNotes(e.target.value)}
                placeholder="e.g. Interstate night shift, corporate executive assignment..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignmentModalDriver(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Requirement 31: Driver Assignment History Modal */}
      {historyModalVehicle && (
        <Modal
          isOpen={!!historyModalVehicle}
          onClose={() => setHistoryModalVehicle(null)}
          title={`Driver Assignment History: ${historyModalVehicle.registrationNumber}`}
          subtitle={`Audit trail of all drivers assigned to ${historyModalVehicle.name}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-left text-xs">
            {historyModalVehicle.driverHistory && historyModalVehicle.driverHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {historyModalVehicle.driverHistory.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        item.role === 'Primary' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.role} Driver
                      </span>
                      <p className="font-bold text-slate-900 mt-1">{item.driverName}</p>
                      {item.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">"{item.notes}"</p>}
                    </div>
                    <div className="text-right text-slate-500 font-medium">
                      <p>Assigned: {formatDate(item.assignedDate)}</p>
                      {item.unassignedDate && <p className="text-[11px] text-slate-400">Until: {formatDate(item.unassignedDate)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic py-4 text-center">No previous driver history recorded for this asset.</p>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setHistoryModalVehicle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
