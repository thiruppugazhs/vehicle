import React, { useState, useMemo } from 'react';
import {
  Search,
  Car,
  Wrench,
  AlertTriangle,
  Receipt,
  FileText,
  Users,
  Building2,
  X,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    vehicles,
    drivers,
    repairs,
    maintenanceRecords,
    expenses,
    documents,
    serviceCenters,
    setActiveTab,
    setSelectedVehicleId
  } = useFleet();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const query = globalSearchQuery.toLowerCase().trim();

  // Search Results Grouped (Requirement 39)
  const results = useMemo(() => {
    if (!query) {
      return {
        vehicles: [],
        drivers: [],
        repairs: [],
        maintenance: [],
        expenses: [],
        documents: [],
        serviceCenters: [],
        total: 0
      };
    }

    const matchedVehicles = vehicles.filter(
      v =>
        v.registrationNumber.toLowerCase().includes(query) ||
        v.name.toLowerCase().includes(query) ||
        v.vin?.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query)
    );

    // Find vehicle IDs matching the query so associated records show up (e.g. TN 01 AB 1234)
    const matchingVehIds = new Set(matchedVehicles.map(v => v.id));

    const matchedDrivers = drivers.filter(
      d =>
        d.name.toLowerCase().includes(query) ||
        d.phone.toLowerCase().includes(query) ||
        d.licenseNumber.toLowerCase().includes(query)
    );

    const matchedRepairs = repairs.filter(
      r =>
        r.id.toLowerCase().includes(query) ||
        r.issueTitle.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        matchingVehIds.has(r.vehicleId)
    );

    const matchedMaintenance = maintenanceRecords.filter(
      m =>
        m.title.toLowerCase().includes(query) ||
        m.serviceCenterName?.toLowerCase().includes(query) ||
        matchingVehIds.has(m.vehicleId)
    );

    const matchedExpenses = expenses.filter(
      e =>
        e.category.toLowerCase().includes(query) ||
        e.vendor?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        matchingVehIds.has(e.vehicleId)
    );

    const matchedDocuments = documents.filter(
      d =>
        d.documentName?.toLowerCase().includes(query) ||
        d.documentType.toLowerCase().includes(query) ||
        d.documentNumber.toLowerCase().includes(query) ||
        matchingVehIds.has(d.vehicleId)
    );

    const matchedServiceCenters = serviceCenters.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.city?.toLowerCase().includes(query) ||
        s.servicesOffered.some(so => so.toLowerCase().includes(query))
    );

    const total =
      matchedVehicles.length +
      matchedDrivers.length +
      matchedRepairs.length +
      matchedMaintenance.length +
      matchedExpenses.length +
      matchedDocuments.length +
      matchedServiceCenters.length;

    return {
      vehicles: matchedVehicles,
      drivers: matchedDrivers,
      repairs: matchedRepairs,
      maintenance: matchedMaintenance,
      expenses: matchedExpenses,
      documents: matchedDocuments,
      serviceCenters: matchedServiceCenters,
      total
    };
  }, [query, vehicles, drivers, repairs, maintenanceRecords, expenses, documents, serviceCenters]);

  if (!isGlobalSearchOpen) return null;

  const navigateTo = (tab: string, vehicleId?: string) => {
    if (vehicleId) {
      setActiveTab('vehicle-details', vehicleId);
    } else {
      setActiveTab(tab);
    }
    setIsGlobalSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder="Universal Search across Vehicles, Drivers, Repairs, Maintenance, Expenses, Documents... (e.g. TN 01 AB 1234)"
            className="flex-1 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            autoFocus
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Category Pills */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'ALL' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All ({results.total})
          </button>
          <button
            onClick={() => setActiveCategory('VEHICLES')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'VEHICLES' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Vehicles ({results.vehicles.length})
          </button>
          <button
            onClick={() => setActiveCategory('REPAIRS')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'REPAIRS' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Repairs ({results.repairs.length})
          </button>
          <button
            onClick={() => setActiveCategory('MAINTENANCE')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'MAINTENANCE' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Maintenance ({results.maintenance.length})
          </button>
          <button
            onClick={() => setActiveCategory('EXPENSES')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'EXPENSES' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Expenses ({results.expenses.length})
          </button>
          <button
            onClick={() => setActiveCategory('DOCUMENTS')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'DOCUMENTS' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Documents ({results.documents.length})
          </button>
          <button
            onClick={() => setActiveCategory('DRIVERS')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              activeCategory === 'DRIVERS' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Drivers ({results.drivers.length})
          </button>
        </div>

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {!query ? (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold">Type a vehicle reg (e.g. TN 01 AB 1234), ticket ID, driver, or expense...</p>
            </div>
          ) : results.total === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-bold text-slate-600">No matching records found for "{query}"</p>
              <p className="text-[11px] mt-1">Try searching by vehicle number, service center name, or expense category.</p>
            </div>
          ) : (
            <>
              {/* Vehicles */}
              {(activeCategory === 'ALL' || activeCategory === 'VEHICLES') && results.vehicles.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-600" /> Vehicles ({results.vehicles.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.vehicles.map(v => (
                      <div
                        key={v.id}
                        onClick={() => navigateTo('vehicle-details', v.id)}
                        className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{v.registrationNumber}</p>
                          <p className="text-slate-500 text-[11px]">{v.name} • {v.currentOdometer.toLocaleString()} km</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repairs */}
              {(activeCategory === 'ALL' || activeCategory === 'REPAIRS') && results.repairs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Repair Tickets ({results.repairs.length})
                  </span>
                  <div className="space-y-2">
                    {results.repairs.map(r => (
                      <div
                        key={r.id}
                        onClick={() => navigateTo('repairs')}
                        className="p-3 bg-slate-50 hover:bg-rose-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-800">{r.id}</span>
                            <span className="font-bold text-slate-900">{r.issueTitle}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Stage: <strong className="text-slate-700">{r.status}</strong> • Severity: {r.severity} • {r.assignedServiceCenter || 'Unassigned Workshop'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance */}
              {(activeCategory === 'ALL' || activeCategory === 'MAINTENANCE') && results.maintenance.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" /> Maintenance Records ({results.maintenance.length})
                  </span>
                  <div className="space-y-2">
                    {results.maintenance.map(m => (
                      <div
                        key={m.id}
                        onClick={() => navigateTo('maintenance')}
                        className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{m.title}</p>
                          <p className="text-slate-500 text-[11px]">
                            {formatDate(m.serviceDate)} • {m.serviceType || m.category} • Cost: ₹{m.totalCost}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses */}
              {(activeCategory === 'ALL' || activeCategory === 'EXPENSES') && results.expenses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Expenses & Fuel ({results.expenses.length})
                  </span>
                  <div className="space-y-2">
                    {results.expenses.map(e => (
                      <div
                        key={e.id}
                        onClick={() => navigateTo('expenses')}
                        className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{e.description || e.category}</p>
                          <p className="text-slate-500 text-[11px]">
                            {e.category} • Vendor: {e.vendor || 'N/A'} • {formatDate(e.date)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900">₹{e.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(activeCategory === 'ALL' || activeCategory === 'DOCUMENTS') && results.documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" /> Compliance Documents ({results.documents.length})
                  </span>
                  <div className="space-y-2">
                    {results.documents.map(d => (
                      <div
                        key={d.id}
                        onClick={() => navigateTo('documents')}
                        className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{d.documentName || d.documentType}</p>
                          <p className="text-slate-500 text-[11px]">
                            {d.documentNumber} • Expiry: {formatDate(d.expiryDate)}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px]">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers & Service Centers */}
              {(activeCategory === 'ALL' || activeCategory === 'DRIVERS') && results.drivers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Commercial Drivers ({results.drivers.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.drivers.map(d => (
                      <div
                        key={d.id}
                        onClick={() => navigateTo('drivers')}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{d.name}</p>
                          <p className="text-slate-500 text-[11px]">License: {d.licenseNumber} • {d.phone}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
