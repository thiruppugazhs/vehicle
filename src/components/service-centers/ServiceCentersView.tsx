import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Search,
  Wrench,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ServiceCenter } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ServiceCentersView: React.FC = () => {
  const { 
    serviceCenters, 
    addServiceCenter, 
    updateServiceCenter,
    deleteServiceCenter,
    maintenanceRecords, 
    repairs, 
    vehicles, 
    userProfile, 
    setActiveTab 
  } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [selectedCenterHistory, setSelectedCenterHistory] = useState<ServiceCenter | null>(null);

  // Form State (Requirement 32)
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [servicesOfferedInput, setServicesOfferedInput] = useState('Engine Oil, Brake Service, General Inspection, Wheel Alignment');
  const [rating, setRating] = useState<number>(4.8);
  const [notes, setNotes] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(true);

  const filteredCenters = serviceCenters.filter(sc => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      sc.name.toLowerCase().includes(q) ||
      (sc.city && sc.city.toLowerCase().includes(q)) ||
      sc.address.toLowerCase().includes(q) ||
      (sc.servicesOffered && sc.servicesOffered.some(s => s.toLowerCase().includes(q)))
    );
  });

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const services = servicesOfferedInput.split(',').map(s => s.trim()).filter(Boolean);

    addServiceCenter({
      name: name.trim(),
      contactPerson: contactPerson.trim() || 'Service Manager',
      phone: phone.trim(),
      email: email.trim() || 'support@workshop.com',
      address: address.trim() || 'Industrial Estate Road',
      city: city.trim() || 'Metro',
      rating: Number(rating) || 4.5,
      servicesOffered: services.length > 0 ? services : ['General Maintenance', 'Inspection'],
      notes: notes.trim() || undefined,
      isAuthorized
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setNotes('');
    setIsAddCenterOpen(false);
  };

  // Associated records for selected workshop
  const getAssociatedRecords = (center: ServiceCenter) => {
    const centerNameLower = center.name.toLowerCase();
    const associatedMaint = maintenanceRecords.filter(m => 
      m.serviceCenterName?.toLowerCase().includes(centerNameLower) ||
      centerNameLower.includes(m.serviceCenterName?.toLowerCase() || '')
    );
    const associatedRepairs = repairs.filter(r => 
      r.assignedServiceCenter?.toLowerCase().includes(centerNameLower) ||
      centerNameLower.includes(r.assignedServiceCenter?.toLowerCase() || '')
    );

    const totalMaintSpend = associatedMaint.reduce((acc, m) => acc + m.totalCost, 0);
    const totalRepairSpend = associatedRepairs.reduce((acc, r) => acc + (r.actualCost || r.estimatedCost || 0), 0);

    return {
      maintenance: associatedMaint,
      repairs: associatedRepairs,
      totalSpend: totalMaintSpend + totalRepairSpend
    };
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Service Centers & Authorized Garages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Directory of certified dealerships and workshops. Associate maintenance and repair tickets with vendor accountability.
          </p>
        </div>

        <button
          onClick={() => setIsAddCenterOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Service Center
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search service center by name, city, services offered (e.g. CRDi, Hybrid, Brakes)..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredCenters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Service Centers Found"
          description="There are no partner workshops matching your search keywords."
          actionLabel="Add Service Center"
          onAction={() => setIsAddCenterOpen(true)}
          secondaryActionLabel={searchQuery ? 'Clear Search' : undefined}
          onSecondaryAction={() => setSearchQuery('')}
        />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCenters.map(sc => {
          const assoc = getAssociatedRecords(sc);

          return (
            <div
              key={sc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{sc.name}</h3>
                      {sc.isAuthorized && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Authorized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Contact: {sc.contactPerson}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{sc.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sc.address}{sc.city ? `, ${sc.city}` : ''}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{sc.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sc.email}</span>
                  </p>
                </div>

                {/* Services Offered (Requirement 32) */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Services Offered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(sc.servicesOffered || sc.specialties || ['General Service']).map((sp, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md text-[11px]">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                {sc.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                    "{sc.notes}"
                  </p>
                )}
              </div>

              {/* Requirement 32: Associated Maintenance & Repair Records */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px]">Associated Fleet History</span>
                  <span className="font-bold text-slate-800">
                    {assoc.maintenance.length} Services • {assoc.repairs.length} Repairs
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCenterHistory(sc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    History ({formatCurrency(assoc.totalSpend, userProfile.currency)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCenter(sc)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="Edit Service Center"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete service center ${sc.name}?`)) deleteServiceCenter(sc.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Delete Service Center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Requirement 32: Add Service Center Modal with all fields */}
      <Modal
        isOpen={isAddCenterOpen}
        onClose={() => setIsAddCenterOpen(false)}
        title="Register Partner Workshop"
        subtitle="Store service center contact, services offered, ratings, and notes."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCenter} className="space-y-3.5 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Center Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Bosch Car Care, Tata Authorized Commercial Hub"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Sanjay Verma (Works Manager)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 44 2811 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="service@workshop.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Chennai, Navi Mumbai"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Plot No. 42, Guindy Industrial Estate, Mount Road"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Services Offered (comma-separated)</label>
            <input
              type="text"
              value={servicesOfferedInput}
              onChange={e => setServicesOfferedInput(e.target.value)}
              placeholder="Engine Oil, Brake Service, CRDi Diagnostics, Suspension Overhaul, AC Service"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rating (1 to 5 stars)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isAuthorized"
                checked={isAuthorized}
                onChange={e => setIsAuthorized(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="isAuthorized" className="font-bold text-slate-800">
                Authorized Dealership Workshop
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Operational Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Priority booking contact, contract rates, emergency towing partner..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCenterOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              Save Service Center
            </button>
          </div>
        </form>
      </Modal>

      {/* Requirement 32: Associated Maintenance and Repair History Modal */}
      {selectedCenterHistory && (
        <Modal
          isOpen={!!selectedCenterHistory}
          onClose={() => setSelectedCenterHistory(null)}
          title={`Workshop History: ${selectedCenterHistory.name}`}
          subtitle={`All maintenance records and repair tickets serviced at this facility.`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left text-xs">
            {(() => {
              const assoc = getAssociatedRecords(selectedCenterHistory);

              return (
                <>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Maintenance Performed</span>
                      <span className="font-extrabold text-base text-slate-900">{assoc.maintenance.length} records</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Repairs Handled</span>
                      <span className="font-extrabold text-base text-slate-900">{assoc.repairs.length} tickets</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Fleet Spend</span>
                      <span className="font-black text-base text-amber-800">
                        {formatCurrency(assoc.totalSpend, userProfile.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Maintenance Records List */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      Maintenance Services Log
                    </h4>
                    {assoc.maintenance.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {assoc.maintenance.map(m => {
                          const veh = vehicles.find(v => v.id === m.vehicleId);
                          return (
                            <div key={m.id} className="p-3 bg-white flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900">{m.title}</span>
                                <span className="text-slate-400 block text-[11px]">
                                  {veh?.registrationNumber} • {formatDate(m.serviceDate)} • {m.odometer.toLocaleString()} km
                                </span>
                              </div>
                              <span className="font-bold text-slate-900">{formatCurrency(m.totalCost, userProfile.currency)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl border">No maintenance services logged here yet.</p>
                    )}
                  </div>

                  {/* Repair Tickets List */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Breakdown & Repair Tickets
                    </h4>
                    {assoc.repairs.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {assoc.repairs.map(r => {
                          const veh = vehicles.find(v => v.id === r.vehicleId);
                          return (
                            <div key={r.id} className="p-3 bg-white flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900">{r.issueTitle}</span>
                                <span className="text-slate-400 block text-[11px]">
                                  {veh?.registrationNumber} • {formatDate(r.reportedDate)} • Status: {r.status}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900">
                                {formatCurrency(r.actualCost || r.estimatedCost || 0, userProfile.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl border">No repair tickets associated with this center.</p>
                    )}
                  </div>
                </>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCenterHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Requirement 32: Edit Service Center Modal */}
      {editingCenter && (
        <Modal
          isOpen={!!editingCenter}
          onClose={() => setEditingCenter(null)}
          title={`Edit Service Center: ${editingCenter.name}`}
          subtitle="Update workshop contact person, phone, address, rating, and notes."
          maxWidth="md"
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              setEditingCenter(null);
            }}
            className="space-y-3 text-left text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Workshop Name</label>
              <input
                type="text"
                value={editingCenter.name}
                onChange={e => {
                  const name = e.target.value;
                  updateServiceCenter(editingCenter.id, { name });
                  setEditingCenter(prev => prev ? { ...prev, name } : null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editingCenter.contactPerson}
                  onChange={e => {
                    const contactPerson = e.target.value;
                    updateServiceCenter(editingCenter.id, { contactPerson });
                    setEditingCenter(prev => prev ? { ...prev, contactPerson } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editingCenter.phone}
                  onChange={e => {
                    const phone = e.target.value;
                    updateServiceCenter(editingCenter.id, { phone });
                    setEditingCenter(prev => prev ? { ...prev, phone } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={editingCenter.address}
                onChange={e => {
                  const address = e.target.value;
                  updateServiceCenter(editingCenter.id, { address });
                  setEditingCenter(prev => prev ? { ...prev, address } : null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rating (1 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={editingCenter.rating}
                  onChange={e => {
                    const rating = Number(e.target.value);
                    updateServiceCenter(editingCenter.id, { rating });
                    setEditingCenter(prev => prev ? { ...prev, rating } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingCenter.email}
                  onChange={e => {
                    const email = e.target.value;
                    updateServiceCenter(editingCenter.id, { email });
                    setEditingCenter(prev => prev ? { ...prev, email } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
              <input
                type="text"
                value={editingCenter.notes || ''}
                onChange={e => {
                  const notes = e.target.value;
                  updateServiceCenter(editingCenter.id, { notes });
                  setEditingCenter(prev => prev ? { ...prev, notes } : null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCenter(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
