import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Modal } from '../common/Modal';

export const ServiceCentersView: React.FC = () => {
  const { serviceCenters, addServiceCenter } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(true);

  const filteredCenters = serviceCenters.filter(sc => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      sc.name.toLowerCase().includes(q) ||
      sc.city.toLowerCase().includes(q) ||
      sc.specialties.some(s => s.toLowerCase().includes(q))
    );
  });

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addServiceCenter({
      name: name.trim(),
      contactPerson,
      phone: phone.trim(),
      email: email.trim() || 'contact@servicehub.com',
      address,
      city: city || 'Metro',
      rating: 4.8,
      specialties: specialtyInput.split(',').map(s => s.trim()).filter(Boolean),
      isAuthorized
    });

    setName('');
    setPhone('');
    setIsAddCenterOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Service Centers & Garages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Directory of certified dealerships, authorized heavy commercial workshops, and partner garages.
          </p>
        </div>

        <button
          onClick={() => setIsAddCenterOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Workshop
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
            placeholder="Search service center by name, city, or specialty (e.g. Hybrid, Brakes, CRDi)..."
            className="w-full pl-10 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCenters.map(sc => (
          <div
            key={sc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
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

              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{sc.rating}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sc.address}, {sc.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sc.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sc.email}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Specialties</span>
              <div className="flex flex-wrap gap-1.5">
                {sc.specialties.map((sp, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Center Modal */}
      <Modal
        isOpen={isAddCenterOpen}
        onClose={() => setIsAddCenterOpen(false)}
        title="Register Partner Workshop"
        subtitle="Add a trusted service center to your operational fleet directory."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCenter} className="space-y-4 text-left text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Center Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Bosch Car Care, Tata Authorized Commercial"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Sanjay Verma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 44 2811 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Chennai, Bangalore"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="service@hub.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Plot 42, Industrial Area Phase 2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Specialties (comma separated)</label>
            <input
              type="text"
              value={specialtyInput}
              onChange={e => setSpecialtyInput(e.target.value)}
              placeholder="e.g. Engine Overhaul, Air Brakes, Hybrid Batteries, Wheel Alignment"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCenterOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs"
            >
              Save Service Center
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
