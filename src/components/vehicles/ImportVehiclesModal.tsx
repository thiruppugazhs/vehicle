import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types';

interface ImportVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PRESET_FLEET: Vehicle[] = [
  {
    id: `veh_imp_${Date.now()}_1`,
    registrationNumber: 'MH 12 QW 5501',
    name: 'Mahindra Bolero Maxi Carrier #10',
    type: 'Van',
    manufacturer: 'Mahindra',
    model: 'Bolero Maxi Truck',
    variant: 'Plus Flatbed 2.5L',
    year: 2023,
    purchaseDate: '2023-08-10',
    purchasePrice: 890000,
    vin: 'MA1TC2MJ8M6E99100',
    engineNumber: 'M2DICR-992100',
    currentOdometer: 41200,
    fuelType: 'Diesel',
    transmission: 'Manual',
    seatingCapacity: 2,
    averageDailyKm: 90,
    department: 'Intra-City Delivery',
    location: 'Pune Hub',
    status: 'Active',
    healthScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: `veh_imp_${Date.now()}_2`,
    registrationNumber: 'DL 01 XY 8822',
    name: 'Tata Ace EV Mini Hauler #02',
    type: 'EV / Hybrid',
    manufacturer: 'Tata Motors',
    model: 'Ace EV',
    variant: '21.3kWh Lithium Iron Phosphate',
    year: 2024,
    purchaseDate: '2024-03-15',
    purchasePrice: 999000,
    vin: 'MAT623912P9A88211',
    engineNumber: 'ACE-EV-BAT-88',
    currentOdometer: 14500,
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 2,
    averageDailyKm: 65,
    department: 'Last Mile Green Courier',
    location: 'Delhi Central Depot',
    status: 'Active',
    healthScore: 99,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: `veh_imp_${Date.now()}_3`,
    registrationNumber: 'KA 04 MM 3311',
    name: 'Ashok Leyland Bada Dost i4 #01',
    type: 'Pickup Truck',
    manufacturer: 'Ashok Leyland',
    model: 'Bada Dost',
    variant: 'i4 1.5L Turbo Charged Intercooled',
    year: 2023,
    purchaseDate: '2023-11-20',
    purchasePrice: 940000,
    vin: 'MB1BA250M6P88290',
    engineNumber: 'AL-15T-7721',
    currentOdometer: 52400,
    fuelType: 'Diesel',
    transmission: 'Manual',
    seatingCapacity: 3,
    averageDailyKm: 120,
    department: 'Regional Supply',
    location: 'Bangalore Hub',
    status: 'Due for Service',
    healthScore: 74,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const ImportVehiclesModal: React.FC<ImportVehiclesModalProps> = ({ isOpen, onClose }) => {
  const { importVehicles } = useFleet();
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleImportPreset = () => {
    importVehicles(SAMPLE_PRESET_FLEET);
    setSuccessCount(SAMPLE_PRESET_FLEET.length);
    setTimeout(() => {
      setSuccessCount(null);
      onClose();
    }, 1200);
  };

  const handleParseAndImport = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!csvText.trim()) {
      setError('Please paste CSV or JSON fleet records.');
      return;
    }

    try {
      // Check if JSON
      if (csvText.trim().startsWith('[') || csvText.trim().startsWith('{')) {
        const parsed = JSON.parse(csvText);
        const arrayToImport: Vehicle[] = Array.isArray(parsed) ? parsed : [parsed];
        importVehicles(arrayToImport);
        setSuccessCount(arrayToImport.length);
        setTimeout(() => {
          setSuccessCount(null);
          onClose();
        }, 1200);
        return;
      }

      // Parse CSV
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must contain a header row and at least one vehicle data row.');
        return;
      }

      const importedList: Vehicle[] = [];
      // Assume columns: Registration, Name, Type, Manufacturer, Model, Year, Odometer, Fuel
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4 && cols[0]) {
          importedList.push({
            id: `veh_csv_${Date.now()}_${i}`,
            registrationNumber: cols[0].toUpperCase(),
            name: cols[1] || `Vehicle ${cols[0]}`,
            type: (cols[2] as any) || 'SUV',
            manufacturer: cols[3] || 'Standard',
            model: cols[4] || 'Model',
            year: Number(cols[5]) || 2023,
            purchaseDate: new Date().toISOString().slice(0, 10),
            purchasePrice: 1200000,
            vin: `VIN-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
            engineNumber: `ENG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            currentOdometer: Number(cols[6]) || 15000,
            fuelType: (cols[7] as any) || 'Diesel',
            transmission: 'Manual',
            seatingCapacity: 5,
            status: 'Active',
            healthScore: 90,
            imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      if (importedList.length === 0) {
        setError('No valid vehicle records found in CSV text.');
        return;
      }

      importVehicles(importedList);
      setSuccessCount(importedList.length);
      setTimeout(() => {
        setSuccessCount(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(`Failed to parse import data: ${err.message}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Fleet Vehicles"
      subtitle="Batch upload vehicle inventory from CSV file, JSON, or import sample fleet records."
      maxWidth="xl"
    >
      <div className="space-y-4 text-left text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully imported {successCount} vehicles into fleet!</span>
          </div>
        )}

        {/* 1-Click Preset Demo Batch */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-amber-950 block text-sm">Quick Demo Fleet Import</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Instantly import a 3-unit fleet batch (Delivery Van, Mini EV Hauler & Pickup) with preloaded odometers and specs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleImportPreset}
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-2xs transition-colors"
          >
            Import 3 Demo Units
          </button>
        </div>

        {/* Manual CSV or JSON Paste */}
        <form onSubmit={handleParseAndImport} className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Paste CSV or JSON Format</label>
              <span className="text-[10px] text-slate-400">
                Cols: Reg, Name, Type, Make, Model, Year, Odometer, Fuel
              </span>
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={`Registration,Vehicle Name,Type,Manufacturer,Model,Year,Odometer,Fuel\nKA 01 AB 9988,Delivery Van #12,Van,Mahindra,Bolero,2023,34000,Diesel\nDL 03 CC 4411,Sedan Executive,Sedan,Honda,City,2024,12000,Petrol`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-2xs"
            >
              Parse & Import
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
