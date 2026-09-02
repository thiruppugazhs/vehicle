import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Car,
  Briefcase,
  Building,
  Truck,
  Sparkles,
  Layers,
  Fuel,
  Calendar,
  Gauge
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { VehicleType, FuelType, TransmissionType } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    addVehicle,
    setIsOnboardingActive,
    setActiveTab
  } = useFleet();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Persona
  const [selectedRole, setSelectedRole] = useState(userProfile.role || 'Fleet Manager');
  const [orgName, setOrgName] = useState(userProfile.organizationName || '');

  // Step 2 State: Fleet Size
  const [fleetSize, setFleetSize] = useState(userProfile.fleetSizeBracket || '6–20');

  // Step 3 State: First Vehicle
  const [regNumber, setRegNumber] = useState('MH 01 DX 4050');
  const [vehName, setVehName] = useState('Mahindra Scorpio-N');
  const [vehType, setVehType] = useState<VehicleType>('SUV');
  const [make, setMake] = useState('Mahindra');
  const [model, setModel] = useState('Scorpio-N Z8L');
  const [year, setYear] = useState<number>(2024);
  const [odometer, setOdometer] = useState<number>(18200);
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');

  // Step 4 State: Preferences
  const [currency, setCurrency] = useState(userProfile.currency || '₹');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [enableSmartAlerts, setEnableSmartAlerts] = useState(true);

  const steps = [
    { number: 1, title: 'Account Role' },
    { number: 2, title: 'Fleet Scale' },
    { number: 3, title: 'First Vehicle' },
    { number: 4, title: 'Ready' }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      updateUserProfile({
        role: selectedRole as any,
        organizationName: orgName || (selectedRole === 'Individual Vehicle Owner' ? 'My Garage' : 'Fleet Logistics')
      });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      updateUserProfile({
        fleetSizeBracket: fleetSize as any
      });
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Register first vehicle
      if (regNumber.trim() && vehName.trim()) {
        addVehicle({
          registrationNumber: regNumber.toUpperCase(),
          name: vehName,
          type: vehType,
          manufacturer: make,
          model: model,
          year: Number(year),
          purchaseDate: new Date().toISOString().slice(0, 10),
          purchasePrice: 2200000,
          vin: `MBJ${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          engineNumber: `ENG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          currentOdometer: Number(odometer),
          fuelType: fuelType,
          transmission: transmission,
          seatingCapacity: vehType === 'Heavy Commercial Truck' ? 2 : 5,
          status: 'Active',
          department: 'Operations',
          location: 'Main Branch'
        });
      }
      setCurrentStep(4);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // graceful ignore if canvas-confetti fails in test environment
      }
    } else if (currentStep === 4) {
      updateUserProfile({
        currency,
        distanceUnit,
        isOnboarded: true
      });
      setIsOnboardingActive(false);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md mb-3">
            <Layers className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Welcome to SERVIQ
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Let's configure your vehicle command center in less than 2 minutes.
          </p>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep > step.number
                        ? 'bg-emerald-500 text-white'
                        : currentStep === step.number
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      currentStep === step.number ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Card Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-left">
          {/* STEP 1: Persona */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">What best describes you?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We'll tailor your dashboard views and reminder triggers to your operational workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'Individual Vehicle Owner',
                    title: 'Individual Vehicle Owner',
                    desc: 'Manage family cars, luxury sedans, or personal motorcycles.',
                    icon: Car
                  },
                  {
                    id: 'Business Owner',
                    title: 'Business Owner',
                    desc: 'Track company vans, executive vehicles, and sales runabouts.',
                    icon: Briefcase
                  },
                  {
                    id: 'Fleet Manager',
                    title: 'Fleet Manager',
                    desc: 'Oversee multi-vehicle logistics, drivers, and scheduled maintenance.',
                    icon: Building
                  },
                  {
                    id: 'Transport Company',
                    title: 'Transport Company',
                    desc: 'Heavy commercial haulers, inter-city carriers, and freight trucks.',
                    icon: Truck
                  }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = selectedRole === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedRole(item.id as any)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Fleet Name (Optional)
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Apex Express Logistics or My Garage"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Fleet Size */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">How many vehicles do you manage?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Helps us configure the appropriate grid density and cost aggregation metrics.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: '1', label: '1 Vehicle', desc: 'Personal car or single primary commercial vehicle' },
                  { id: '2–5', label: '2–5 Vehicles', desc: 'Small family fleet, taxi operator, or boutique business' },
                  { id: '6–20', label: '6–20 Vehicles', desc: 'Regional delivery fleet, service vans, or corporate fleet' },
                  { id: '21–50', label: '21–50 Vehicles', desc: 'Mid-sized logistics, bus operator, or distribution fleet' },
                  { id: '50+', label: '50+ Vehicles', desc: 'Large enterprise logistics or national transport company' }
                ].map(item => {
                  const isSelected = fleetSize === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFleetSize(item.id as any)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        {item.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Add First Vehicle */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add your first vehicle</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You can add more vehicles and import fleets anytime from the Vehicles tab.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TN 01 AB 1234"
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Nickname / Unit Name *
                  </label>
                  <input
                    type="text"
                    value={vehName}
                    onChange={e => setVehName(e.target.value)}
                    placeholder="e.g. Delivery Van #01"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehType}
                    onChange={e => setVehType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Van">Van / Commercial Utility</option>
                    <option value="Heavy Commercial Truck">Heavy Commercial Truck</option>
                    <option value="Motorcycle">Motorcycle / 2-Wheeler</option>
                    <option value="EV / Hybrid">EV / Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    placeholder="e.g. Toyota, Tata, Mahindra"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model & Variant</label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="e.g. Innova Hycross ZX"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={e => setOdometer(Number(e.target.value))}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric (EV)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="Automated Manual (AMT)">AMT</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preferences & Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-950">You're ready to manage your vehicles!</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your initial vehicle has been registered with real-time health scoring and smart maintenance tracking.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="₹">₹ (Indian Rupee - INR)</option>
                    <option value="$">$ (US Dollar - USD)</option>
                    <option value="€">€ (Euro - EUR)</option>
                    <option value="£">£ (British Pound - GBP)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distance Metric</label>
                  <select
                    value={distanceUnit}
                    onChange={e => setDistanceUnit(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="miles">Miles (mi)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-start gap-3">
                <input
                  type="checkbox"
                  id="smartAlertsCheck"
                  checked={enableSmartAlerts}
                  onChange={e => setEnableSmartAlerts(e.target.checked)}
                  className="mt-1 w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="smartAlertsCheck" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold block text-slate-900">Enable Smart Dual-Trigger Reminders</span>
                  Receive automated alerts whenever an odometer threshold or calendar service date approaches.
                </label>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 && currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold shadow-xs transition-all"
            >
              {currentStep === 4 ? (
                <>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : currentStep === 3 ? (
                <>
                  Save & Complete
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
