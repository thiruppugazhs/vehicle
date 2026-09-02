import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types';

interface ImportVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportVehiclesModal: React.FC<ImportVehiclesModalProps> = ({ isOpen, onClose }) => {
  const { importVehicles } = useFleet();
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

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
