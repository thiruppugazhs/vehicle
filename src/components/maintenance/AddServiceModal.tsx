import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Gauge, Building2, User, FileText, Plus, X, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { MaintenanceCategory } from '../../types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetVehicleId?: string;
}

const CATEGORIES: MaintenanceCategory[] = [
  'Engine Oil',
  'Oil Filter',
  'Air Filter',
  'Fuel Filter',
  'Brake Service',
  'Brake Pad Replacement',
  'Tyre Rotation',
  'Tyre Replacement',
  'Battery',
  'AC Service',
  'Coolant',
  'Transmission',
  'Suspension',
  'Wheel Alignment',
  'General Service',
  'Inspection',
  'Other'
];

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  presetVehicleId
}) => {
  const { vehicles, serviceCenters, addMaintenanceRecord, userProfile } = useFleet();

  const [vehicleId, setVehicleId] = useState(presetVehicleId || '');
  const [serviceType, setServiceType] = useState<MaintenanceCategory>('Engine Oil');
  const [title, setTitle] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number>(0);
  const [serviceCenterId, setServiceCenterId] = useState('');
  const [serviceCenterName, setServiceCenterName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [partsInput, setPartsInput] = useState('');
  const [partsList, setPartsList] = useState<string[]>([]);
  const [labourCost, setLabourCost] = useState<number>(1500);
  const [partsCost, setPartsCost] = useState<number>(3200);
  const [tax, setTax] = useState<number>(846);
  const [nextServiceMonths, setNextServiceMonths] = useState<number>(6);
  const [nextServiceKmDelta, setNextServiceKmDelta] = useState<number>(10000);
  const [notes, setNotes] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');

  // Update odometer and default center when vehicle changes
  useEffect(() => {
    const selectedVeh = vehicles.find(v => v.id === vehicleId);
    if (selectedVeh) {
      setOdometer(selectedVeh.currentOdometer);
    }
  }, [vehicleId, vehicles]);

  useEffect(() => {
    if (presetVehicleId) {
      setVehicleId(presetVehicleId);
    } else if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [presetVehicleId, vehicles]);

  useEffect(() => {
    if (serviceCenters.length > 0 && !serviceCenterName) {
      setServiceCenterId(serviceCenters[0].id);
      setServiceCenterName(serviceCenters[0].name);
    }
  }, [serviceCenters]);

  const handleAddPart = () => {
    if (partsInput.trim()) {
      setPartsList([...partsList, partsInput.trim()]);
      setPartsInput('');
    }
  };

  const handleRemovePart = (index: number) => {
    setPartsList(partsList.filter((_, i) => i !== index));
  };

  const totalCost = Number(labourCost || 0) + Number(partsCost || 0) + Number(tax || 0);

  // Auto calculate next service date & odometer
  const calculatedNextDate = new Date();
  calculatedNextDate.setMonth(calculatedNextDate.getMonth() + Number(nextServiceMonths));
  const nextDateStr = calculatedNextDate.toISOString().slice(0, 10);
  const calculatedNextOdometer = Number(odometer || 0) + Number(nextServiceKmDelta || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;

    addMaintenanceRecord({
      vehicleId,
      serviceType,
      title: title.trim() || `${serviceType} Scheduled Service`,
      serviceDate,
      odometer: Number(odometer),
      serviceCenterId,
      serviceCenterName: serviceCenterName || 'Authorized Workshop',
      technicianName,
      partsReplaced: partsList,
      labourCost: Number(labourCost),
      partsCost: Number(partsCost),
      tax: Number(tax),
      totalCost,
      nextServiceDate: nextDateStr,
      nextServiceOdometer: calculatedNextOdometer,
      notes,
      invoiceFileName: invoiceFileName || `INVOICE-${serviceType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}.pdf`
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Vehicle Service Record"
      subtitle="Record completed maintenance, labor, replaced components, and workshop invoices."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Vehicle *</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 font-medium"
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
            <label className="block font-bold text-slate-700 mb-1">Service Category *</label>
            <select
              value={serviceType}
              onChange={e => {
                const cat = e.target.value as MaintenanceCategory;
                setServiceType(cat);
                setTitle(`${cat} Periodic Service`);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 font-medium"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Title / Work Done</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 50,000 km Major Service"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Date *</label>
            <input
              type="date"
              value={serviceDate}
              onChange={e => setServiceDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Odometer at Service (km) *</label>
            <input
              type="number"
              value={odometer}
              onChange={e => setOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Center / Garage</label>
            <select
              value={serviceCenterName}
              onChange={e => setServiceCenterName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
            >
              {serviceCenters.map(sc => (
                <option key={sc.id} value={sc.name}>{sc.name}</option>
              ))}
              <option value="Other Service Center">Other / Independent Garage</option>
            </select>
          </div>
        </div>

        {/* Parts Replaced Tracker */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-bold text-slate-800">Parts & Consumables Replaced</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={partsInput}
              onChange={e => setPartsInput(e.target.value)}
              placeholder="e.g. Synthetic Oil 5W-30 (4L), Ceramic Brake Pads"
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPart();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddPart}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs"
            >
              Add Part
            </button>
          </div>

          {partsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {partsList.map((p, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 font-medium">
                  {p}
                  <button type="button" onClick={() => handleRemovePart(idx)} className="text-slate-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Labour Cost ({userProfile.currency})</label>
            <input
              type="number"
              value={labourCost}
              onChange={e => setLabourCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Parts Cost ({userProfile.currency})</label>
            <input
              type="number"
              value={partsCost}
              onChange={e => setPartsCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tax / GST ({userProfile.currency})</label>
            <input
              type="number"
              value={tax}
              onChange={e => setTax(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Calculated Total</label>
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl font-extrabold text-amber-900 text-sm">
              {userProfile.currency}{totalCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Section 18 Automatic Schedule Calculation */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 block">Automatic Next Service Interval Calculation</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Next Service in Months</label>
              <select
                value={nextServiceMonths}
                onChange={e => setNextServiceMonths(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="3">Every 3 Months</option>
                <option value="6">Every 6 Months (Standard)</option>
                <option value="12">Every 12 Months (Annual)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Projected Due Date: {nextDateStr}</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Next Service Mileage Interval</label>
              <select
                value={nextServiceKmDelta}
                onChange={e => setNextServiceKmDelta(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="5000">+5,000 km</option>
                <option value="10000">+10,000 km (Standard)</option>
                <option value="15000">+15,000 km</option>
                <option value="20000">+20,000 km</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Projected Due Odometer: {calculatedNextOdometer.toLocaleString()} km</span>
            </div>
          </div>
        </div>

        {/* Notes & Invoice Attachment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Technician / Inspector Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Brake pads inspected at 6mm remaining thickness."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Invoice Attachment Simulation</label>
            <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                {invoiceFileName || 'Attach workshop invoice PDF'}
              </span>
              <button
                type="button"
                onClick={() => setInvoiceFileName(`TAX-INV-${Date.now().toString().slice(-6)}.pdf`)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
              >
                Simulate Attach
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs"
          >
            Save Service Record
          </button>
        </div>
      </form>
    </Modal>
  );
};
