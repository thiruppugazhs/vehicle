import React, { useState, useEffect } from 'react';
import {
  Car,
  FileText,
  Upload,
  Calendar,
  Hash,
  User,
  MapPin,
  Building,
  Gauge,
  Fuel,
  Info,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { Vehicle, VehicleType, FuelType, TransmissionType, VehicleStatus } from '../../types';
import { validateRegPlate, isValidVIN, isDuplicateRegPlate } from '../../utils/validationHelpers';

interface AddEditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: Vehicle | null;
}

export const AddEditVehicleModal: React.FC<AddEditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleToEdit
}) => {
  const { addVehicle, updateVehicle, addDocument, drivers, vehicles, organization } = useFleet();

  // Basic Information
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('SUV');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [purchasePrice, setPurchasePrice] = useState<number>(1500000);

  // Identification
  const [vin, setVin] = useState('');
  const [engineNumber, setEngineNumber] = useState('');

  // Usage & Specs
  const [odometer, setOdometer] = useState<number>(0);
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [transmission, setTransmission] = useState<TransmissionType>('Manual');
  const [seatingCapacity, setSeatingCapacity] = useState<number>(5);
  const [averageDailyKm, setAverageDailyKm] = useState<number>(80);

  // Fleet & Assignment
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('Active');
  const [imageUrl, setImageUrl] = useState('');

  // Attached Document simulation checklist
  const [hasRC, setHasRC] = useState(true);
  const [hasInsurance, setHasInsurance] = useState(true);
  const [hasPUC, setHasPUC] = useState(true);
  const [hasFitness, setHasFitness] = useState(false);
  const [hasPermit, setHasPermit] = useState(false);

  useEffect(() => {
    if (vehicleToEdit) {
      setRegNumber(vehicleToEdit.registrationNumber);
      setName(vehicleToEdit.name);
      setType(vehicleToEdit.type);
      setManufacturer(vehicleToEdit.manufacturer);
      setModel(vehicleToEdit.model);
      setVariant(vehicleToEdit.variant || '');
      setYear(vehicleToEdit.year);
      setPurchaseDate(vehicleToEdit.purchaseDate);
      setPurchasePrice(vehicleToEdit.purchasePrice);
      setVin(vehicleToEdit.vin);
      setEngineNumber(vehicleToEdit.engineNumber);
      setOdometer(vehicleToEdit.currentOdometer);
      setFuelType(vehicleToEdit.fuelType);
      setTransmission(vehicleToEdit.transmission);
      setSeatingCapacity(vehicleToEdit.seatingCapacity);
      setAverageDailyKm(vehicleToEdit.averageDailyKm || 80);
      setDepartment(vehicleToEdit.department || '');
      setLocation(vehicleToEdit.location || '');
      setAssignedDriverId(vehicleToEdit.assignedDriverId || '');
      setStatus(vehicleToEdit.status);
      setImageUrl(vehicleToEdit.imageUrl || '');
    } else {
      setRegNumber('');
      setName('');
      setType('SUV');
      setManufacturer('');
      setModel('');
      setVariant('');
      setYear(new Date().getFullYear());
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setPurchasePrice(1500000);
      setVin('');
      setEngineNumber('');
      setOdometer(0);
      setFuelType('Diesel');
      setTransmission('Manual');
      setSeatingCapacity(5);
      setAverageDailyKm(80);
      setDepartment('Operations');
      setLocation('Main Hub');
      setAssignedDriverId('');
      setStatus('Active');
      setImageUrl('');
    }
  }, [vehicleToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !name.trim()) return;

    // Requirement 69: Validation rules
    const plateCheck = validateRegPlate(regNumber);
    if (!plateCheck.valid) {
      alert(plateCheck.error);
      return;
    }

    if (isDuplicateRegPlate(regNumber, organization.id, vehicles, vehicleToEdit?.id)) {
      alert(`Registration plate "${regNumber.toUpperCase()}" already exists in organization "${organization.name}".`);
      return;
    }

    if (vin && vin.trim() && !isValidVIN(vin)) {
      alert('Chassis VIN must be a valid 17-character alphanumeric string (excluding letters I, O, Q).');
      return;
    }

    if (Number(odometer) < 0) {
      alert('Odometer cannot be negative.');
      return;
    }

    if (Number(purchasePrice) < 0) {
      alert('Purchase price cannot be negative.');
      return;
    }

    if (vehicleToEdit) {
      updateVehicle(vehicleToEdit.id, {
        registrationNumber: regNumber.toUpperCase().trim(),
        name,
        type,
        manufacturer,
        model,
        variant,
        year: Number(year),
        purchaseDate,
        purchasePrice: Number(purchasePrice),
        vin: vin.toUpperCase().trim(),
        engineNumber: engineNumber.toUpperCase().trim(),
        currentOdometer: Number(odometer),
        fuelType,
        transmission,
        seatingCapacity: Number(seatingCapacity),
        averageDailyKm: Number(averageDailyKm),
        department,
        location,
        assignedDriverId: assignedDriverId || undefined,
        status,
        imageUrl: imageUrl.trim() || undefined
      });
    } else {
      const newVeh = addVehicle({
        registrationNumber: regNumber.toUpperCase().trim(),
        name,
        type,
        manufacturer: manufacturer || 'Standard',
        model: model || 'Model',
        variant,
        year: Number(year),
        purchaseDate,
        purchasePrice: Number(purchasePrice),
        vin: vin ? vin.toUpperCase().trim() : `VIN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        engineNumber: engineNumber ? engineNumber.toUpperCase().trim() : `ENG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        currentOdometer: Number(odometer),
        fuelType,
        transmission,
        seatingCapacity: Number(seatingCapacity),
        averageDailyKm: Number(averageDailyKm),
        department,
        location,
        assignedDriverId: assignedDriverId || undefined,
        status,
        imageUrl: imageUrl.trim() || undefined
      });

      // Register initial documents if checked
      const today = new Date().toISOString().slice(0, 10);
      if (hasRC) {
        addDocument({
          vehicleId: newVeh.id,
          documentName: `${newVeh.name} - Registration Certificate (RC)`,
          documentType: 'Registration Certificate',
          documentNumber: `RC-${newVeh.registrationNumber.replace(/\s+/g, '')}`,
          issueDate: today,
          expiryDate: new Date(Date.now() + 15 * 365 * 86400000).toISOString().slice(0, 10),
          uploadedDate: today,
          status: 'Valid',
          fileName: `RC_${newVeh.registrationNumber.replace(/\s+/g, '')}.pdf`,
          issuingAuthority: 'Regional Transport Office'
        });
      }
      if (hasInsurance) {
        addDocument({
          vehicleId: newVeh.id,
          documentName: `${newVeh.name} - Comprehensive Insurance Policy`,
          documentType: 'Insurance',
          documentNumber: `INS-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
          issueDate: today,
          expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
          uploadedDate: today,
          status: 'Valid',
          fileName: `INSURANCE_${newVeh.registrationNumber.replace(/\s+/g, '')}.pdf`,
          issuingAuthority: 'Comprehensive Fleet Cover Corp'
        });
      }
      if (hasPUC) {
        addDocument({
          vehicleId: newVeh.id,
          documentName: `${newVeh.name} - Pollution Under Control (PUC)`,
          documentType: 'PUC',
          documentNumber: `PUC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          issueDate: today,
          expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
          uploadedDate: today,
          status: 'Valid',
          fileName: `PUC_${newVeh.registrationNumber.replace(/\s+/g, '')}.pdf`,
          issuingAuthority: 'Transport Emission Bureau'
        });
      }
      if (hasFitness) {
        addDocument({
          vehicleId: newVeh.id,
          documentName: `${newVeh.name} - Commercial Fitness Certificate`,
          documentType: 'Fitness Certificate',
          documentNumber: `FC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          issueDate: today,
          expiryDate: new Date(Date.now() + 730 * 86400000).toISOString().slice(0, 10),
          uploadedDate: today,
          status: 'Valid',
          fileName: `FITNESS_${newVeh.registrationNumber.replace(/\s+/g, '')}.pdf`,
          issuingAuthority: 'RTO Commercial Fitness'
        });
      }
      if (hasPermit) {
        addDocument({
          vehicleId: newVeh.id,
          documentName: `${newVeh.name} - All-India Goods Permit`,
          documentType: 'Permit',
          documentNumber: `NP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          issueDate: today,
          expiryDate: new Date(Date.now() + 1825 * 86400000).toISOString().slice(0, 10),
          uploadedDate: today,
          status: 'Valid',
          fileName: `PERMIT_${newVeh.registrationNumber.replace(/\s+/g, '')}.pdf`,
          issuingAuthority: 'Ministry of Road Transport'
        });
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleToEdit ? `Edit Vehicle: ${vehicleToEdit.registrationNumber}` : 'Register New Vehicle'}
      subtitle="Enter vehicle specifications, compliance identification, and driver assignment."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Section 1: Basic Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
            <Car className="w-4 h-4" /> Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                placeholder="e.g. TN 01 AB 1234"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Name / Nickname *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Innova Hycross #01"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Van">Van</option>
                <option value="Heavy Commercial Truck">Heavy Commercial Truck</option>
                <option value="Pickup Truck">Pickup Truck</option>
                <option value="Bus">Bus</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="EV / Hybrid">EV / Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                placeholder="e.g. Toyota, Tata, Ford"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Innova Hycross"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Variant</label>
              <input
                type="text"
                value={variant}
                onChange={e => setVariant(e.target.value)}
                placeholder="e.g. ZX(O) Strong Hybrid"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Price</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identification */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
            <Hash className="w-4 h-4" /> Identification (VIN & Engine)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                VIN / Chassis Number
              </label>
              <input
                type="text"
                value={vin}
                onChange={e => setVin(e.target.value)}
                placeholder="17-character chassis number"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Engine Number
              </label>
              <input
                type="text"
                value={engineNumber}
                onChange={e => setEngineNumber(e.target.value)}
                placeholder="Engine block serial number"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Usage & Specs */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
            <Gauge className="w-4 h-4" /> Usage & Powertrain
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Odometer (km) *
              </label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
              <select
                value={transmission}
                onChange={e => setTransmission(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="Dual-Clutch (DCT)">DCT</option>
                <option value="Automated Manual (AMT)">AMT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                value={seatingCapacity}
                onChange={e => setSeatingCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Fleet & Assignment */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
            <Building className="w-4 h-4" /> Fleet & Driver Assignment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Corporate Fleet, Logistics"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Depot</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Chennai HQ, Bangalore Depot"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Driver</label>
              <select
                value={assignedDriverId}
                onChange={e => setAssignedDriverId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- Unassigned --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Status & Image */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Active">Active</option>
                <option value="Due for Service">Due for Service</option>
                <option value="Overdue">Overdue</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Inactive">Inactive</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Documents Checklist Simulation */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-800 block mb-2">Initial Documents Attached</span>
          <div className="flex flex-wrap gap-4 text-xs text-slate-700">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasRC}
                onChange={e => setHasRC(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              Registration Certificate (RC)
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasInsurance}
                onChange={e => setHasInsurance(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              Insurance Policy
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPUC}
                onChange={e => setHasPUC(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              PUC Certificate
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFitness}
                onChange={e => setHasFitness(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              Fitness Certificate
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPermit}
                onChange={e => setHasPermit(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              Commercial Permit
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              Other Documents (Toll FASTag / Warranty)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-colors"
          >
            {vehicleToEdit ? 'Save Changes' : 'Register Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
