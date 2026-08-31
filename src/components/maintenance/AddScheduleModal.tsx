import React, { useState } from 'react';
import { Calendar, Clock, Gauge, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { MaintenanceCategory, PriorityLevel } from '../../types';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { vehicles, addServiceSchedule } = useFleet();

  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [category, setCategory] = useState<MaintenanceCategory>('Engine Oil');
  const [name, setName] = useState('Engine Oil & Synthetic Filter Service');
  const [intervalMonths, setIntervalMonths] = useState<number>(6);
  const [intervalKm, setIntervalKm] = useState<number>(10000);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [notes, setNotes] = useState('');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  // Calculate next due date
  const nextDueDateObj = new Date();
  nextDueDateObj.setMonth(nextDueDateObj.getMonth() + Number(intervalMonths));
  const nextDueDate = nextDueDateObj.toISOString().slice(0, 10);

  // Calculate next due odometer
  const nextDueOdometer = (selectedVeh ? selectedVeh.currentOdometer : 0) + Number(intervalKm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;

    addServiceSchedule({
      vehicleId,
      serviceCategory: category,
      name: name.trim() || `${category} Routine Schedule`,
      intervalMonths: Number(intervalMonths),
      intervalKm: Number(intervalKm),
      nextDueDate,
      nextDueOdometer,
      priority,
      isActive: true,
      notes
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recurring Service Schedule"
      subtitle="Establish automatic maintenance schedules triggered by months or odometer milestones."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Target Vehicle *</label>
          <select
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            required
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name} (Current: {v.currentOdometer.toLocaleString()} km)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Category</label>
            <select
              value={category}
              onChange={e => {
                const cat = e.target.value as MaintenanceCategory;
                setCategory(cat);
                setName(`${cat} Recurring Maintenance`);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Schedule Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Time Interval (Months)</label>
            <input
              type="number"
              value={intervalMonths}
              onChange={e => setIntervalMonths(Number(e.target.value))}
              placeholder="e.g. 6"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Distance Interval (km)</label>
            <input
              type="number"
              value={intervalKm}
              onChange={e => setIntervalKm(Number(e.target.value))}
              placeholder="e.g. 10000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reminder Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Low">Low (Informative)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="High">High (High Wear)</option>
              <option value="Critical">Critical (Safety Mandatory)</option>
            </select>
          </div>
        </div>

        {/* Calculated Projection Output */}
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900">
          <span className="font-bold block mb-1">Automatic Next Threshold Projection</span>
          <p className="text-[11px] text-amber-800">
            Next service will trigger at <span className="font-bold">{nextDueDate}</span> OR upon reaching <span className="font-bold">{nextDueOdometer.toLocaleString()} km</span>, whichever occurs first.
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Special Operating Instructions / Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Inspect front steering link and check brake fluid hygroscopic moisture level."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

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
            Save Schedule Rule
          </button>
        </div>
      </form>
    </Modal>
  );
};
