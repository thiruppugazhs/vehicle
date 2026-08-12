import React, { useState, useMemo } from 'react';
import {
  Car,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Wrench,
  AlertTriangle,
  Receipt,
  MoreVertical,
  Trash2,
  User,
  Gauge,
  Calendar,
  Fuel,
  ArrowUpDown
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';
import { HealthScoreBadge } from '../common/HealthScoreBadge';
import { formatDistance, formatDate } from '../../utils/formatters';
import { Vehicle, VehicleStatus, VehicleType, FuelType } from '../../types';
import { AddEditVehicleModal } from './AddEditVehicleModal';
import { ImportVehiclesModal } from './ImportVehiclesModal';

export const VehiclesView: React.FC = () => {
  const {
    vehicles,
    drivers,
    smartReminders,
    setActiveTab,
    deleteVehicle,
    setIsAddServiceOpen,
    setIsReportIssueOpen,
    setIsAddExpenseOpen,
    userProfile,
    exportVehiclesCSV
  } = useFleet();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [fuelFilter, setFuelFilter] = useState<string>('ALL');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'reg' | 'odometer' | 'health' | 'year'>('health');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [activeMenuVehicleId, setActiveMenuVehicleId] = useState<string | null>(null);

  // Extract unique manufacturers
  const manufacturers = useMemo(() => {
    const set = new Set(vehicles.map(v => v.manufacturer));
    return Array.from(set);
  }, [vehicles]);

  // Filter & search logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Search matches reg, VIN, name, or model
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.manufacturer.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q);

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === 'ALL' || v.type === typeFilter;

      // Fuel filter
      const matchesFuel = fuelFilter === 'ALL' || v.fuelType === fuelFilter;

      // Service status filter
      const nextRem = smartReminders.find(r => r.vehicleId === v.id && r.status === 'Pending');
      const matchesServiceStatus =
        serviceStatusFilter === 'ALL' ||
        (serviceStatusFilter === 'Overdue' && (v.status === 'Overdue' || (nextRem && nextRem.remainingDays < 0))) ||
        (serviceStatusFilter === 'Due for Service' && (v.status === 'Due for Service' || (nextRem && nextRem.remainingDays >= 0 && nextRem.remainingDays <= 14))) ||
        (serviceStatusFilter === 'Healthy' && v.healthScore >= 80);

      // Manufacturer filter
      const matchesMake = manufacturerFilter === 'ALL' || v.manufacturer === manufacturerFilter;

      return matchesSearch && matchesStatus && matchesServiceStatus && matchesType && matchesFuel && matchesMake;
    }).sort((a, b) => {
      if (sortBy === 'health') return a.healthScore - b.healthScore; // most critical first
      if (sortBy === 'odometer') return b.currentOdometer - a.currentOdometer;
      if (sortBy === 'year') return b.year - a.year;
      return a.registrationNumber.localeCompare(b.registrationNumber);
    });
  }, [vehicles, searchQuery, statusFilter, serviceStatusFilter, typeFilter, fuelFilter, manufacturerFilter, sortBy, smartReminders]);

  const handleEdit = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsAddModalOpen(true);
    setActiveMenuVehicleId(null);
  };

  const handleView = (vehicleId: string) => {
    setActiveTab('vehicle-details', vehicleId);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Vehicles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your fleet inventory, service lifecycles, and health scores ({filteredVehicles.length} of {vehicles.length} units).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportVehiclesCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
            title="Import Fleet"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Vehicles
          </button>

          <button
            onClick={() => {
              setVehicleToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by registration number, VIN, or vehicle name..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-hidden focus:border-amber-500"
            >
              <option value="health">Health Score (Urgent first)</option>
              <option value="odometer">Odometer (High to Low)</option>
              <option value="year">Year (Newest first)</option>
              <option value="reg">Registration Number</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Due for Service">Due for Service</option>
              <option value="Overdue">Overdue</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Service Status</label>
            <select
              value={serviceStatusFilter}
              onChange={e => setServiceStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-amber-500 font-semibold text-amber-900"
            >
              <option value="ALL">All Service Statuses</option>
              <option value="Overdue">Overdue Maintenance</option>
              <option value="Due for Service">Due for Service</option>
              <option value="Healthy">Healthy (80+ Score)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Vehicle Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Van">Van</option>
              <option value="Heavy Commercial Truck">Heavy Commercial Truck</option>
              <option value="EV / Hybrid">EV / Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Fuel Type</label>
            <select
              value={fuelFilter}
              onChange={e => setFuelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Fuel Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Manufacturer</label>
            <select
              value={manufacturerFilter}
              onChange={e => setManufacturerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">All Manufacturers</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching vehicles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the filters to see all fleet assets.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setFuelFilter('ALL');
              setManufacturerFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Section 12: VEHICLE CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map(v => {
            const driver = drivers.find(d => d.id === v.assignedDriverId);
            const isMenuOpen = activeMenuVehicleId === v.id;

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group"
              >
                {/* Card Top / Image / Status Header */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <StatusBadge status={v.status} size="sm" />
                  </div>

                  <div className="absolute top-3 right-3">
                    <HealthScoreBadge score={v.healthScore} size="sm" />
                  </div>

                  {/* Reg Plate & Vehicle Name on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                      {v.registrationNumber}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 leading-tight truncate">
                      {v.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {v.manufacturer} {v.model} ({v.year})
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                      {v.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Odometer</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatDistance(v.currentOdometer, userProfile.distanceUnit)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel & Gearbox</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {v.fuelType} • {v.transmission}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="text-slate-600 truncate">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Service</span>
                      <span className="font-semibold text-slate-800 truncate block max-w-[120px]">
                        {smartReminders.find(r => r.vehicleId === v.id && r.status === 'Pending')?.category || 'Routine Check'}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Due Date / Km</span>
                      <span className="font-bold text-amber-800">
                        {(() => {
                          const rem = smartReminders.find(r => r.vehicleId === v.id && r.status === 'Pending');
                          return rem ? formatDate(rem.dueDate) : 'On Schedule';
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{driver ? driver.name : 'Unassigned Driver'}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 font-medium">
                      {v.location || 'HQ'}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5 relative">
                  <button
                    onClick={() => handleView(v.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Details
                  </button>

                  <button
                    onClick={() => setIsAddServiceOpen(true, v.id)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors"
                    title="Add Service Record"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsReportIssueOpen(true, v.id)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-rose-700 transition-colors"
                    title="Report Breakdown / Issue"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsAddExpenseOpen(true, v.id)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                    title="Add Fuel / Expense"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>

                  {/* More Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuVehicleId(isMenuOpen ? null : v.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-xs">
                        <button
                          onClick={() => handleEdit(v)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Edit Vehicle
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${v.name} (${v.registrationNumber}) from fleet?`)) {
                              deleteVehicle(v.id);
                            }
                            setActiveMenuVehicleId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Vehicle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Section 12: VEHICLE TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Vehicle / Reg Plate</th>
                  <th className="py-3.5 px-4">Make & Model</th>
                  <th className="py-3.5 px-4">Odometer</th>
                  <th className="py-3.5 px-4">Next Service & Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Health</th>
                  <th className="py-3.5 px-4">Current Driver</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVehicles.map(v => {
                  const driver = drivers.find(d => d.id === v.assignedDriverId);
                  const nextRem = smartReminders.find(r => r.vehicleId === v.id && r.status === 'Pending');

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {v.registrationNumber}
                            </span>
                            <p className="font-bold text-slate-800 text-xs mt-0.5">{v.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{v.manufacturer} {v.model}</div>
                        <div className="text-[10px] text-slate-400">{v.year} • {v.fuelType}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDistance(v.currentOdometer, userProfile.distanceUnit)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold text-slate-900">{nextRem ? nextRem.category : 'Routine Service'}</div>
                        <div className="text-[10px] text-amber-700 font-bold">
                          {nextRem ? formatDate(nextRem.dueDate) : 'On Schedule'}
                          {nextRem?.remainingKm !== undefined ? ` (~${nextRem.remainingKm.toLocaleString()} km)` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={v.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <HealthScoreBadge score={v.healthScore} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {driver ? (
                          <div>
                            <p className="font-bold text-slate-800">{driver.name}</p>
                            <p className="text-[10px] text-slate-400">{driver.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleView(v.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold border border-amber-200 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(v)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${v.registrationNumber}?`)) deleteVehicle(v.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <AddEditVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setVehicleToEdit(null);
        }}
        vehicleToEdit={vehicleToEdit}
      />

      {/* Import Vehicles Modal */}
      <ImportVehiclesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
