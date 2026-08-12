import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Vehicle,
  MaintenanceRecord,
  ServiceSchedule,
  SmartReminder,
  RepairTicket,
  ExpenseRecord,
  VehicleDocument,
  Driver,
  ServiceCenter,
  UserProfile,
  ActivityItem,
  NotificationItem,
  PriorityLevel
} from '../types';
import {
  initialVehicles,
  initialMaintenanceRecords,
  initialServiceSchedules,
  initialSmartReminders,
  initialRepairs,
  initialExpenses,
  initialDocuments,
  initialDrivers,
  initialServiceCenters,
  initialProfile,
  initialActivities,
  initialNotifications
} from '../data/initialData';
import { computeVehicleHealthScore } from '../utils/healthCalculator';
import { getDaysDifference } from '../utils/formatters';

interface FleetContextType {
  // Navigation & UI state
  activeTab: string;
  setActiveTab: (tab: string, vehicleId?: string) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  
  // Modals & Flows
  isAddVehicleOpen: boolean;
  setIsAddVehicleOpen: (open: boolean) => void;
  isAddServiceOpen: boolean;
  setIsAddServiceOpen: (open: boolean, presetVehicleId?: string) => void;
  isReportIssueOpen: boolean;
  setIsReportIssueOpen: (open: boolean, presetVehicleId?: string) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean, presetVehicleId?: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean, mode?: 'login' | 'signup' | 'forgot' | 'reset') => void;
  authMode: 'login' | 'signup' | 'forgot' | 'reset';
  setAuthMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  isOnboardingActive: boolean;
  setIsOnboardingActive: (active: boolean) => void;
  presetVehicleId: string | undefined;

  // Domain Data
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  schedules: ServiceSchedule[];
  smartReminders: SmartReminder[];
  repairs: RepairTicket[];
  expenses: ExpenseRecord[];
  documents: VehicleDocument[];
  drivers: Driver[];
  serviceCenters: ServiceCenter[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  userProfile: UserProfile;

  // Helper getters
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
  getServiceCenterById: (id: string) => ServiceCenter | undefined;

  // Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'healthScore'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  importVehicles: (imported: Vehicle[]) => void;

  addServiceSchedule: (schedule: Omit<ServiceSchedule, 'id'>) => ServiceSchedule;
  updateServiceSchedule: (id: string, updates: Partial<ServiceSchedule>) => void;

  addRepairTicket: (repair: Omit<RepairTicket, 'id'>) => RepairTicket;
  updateRepairTicket: (id: string, updates: Partial<RepairTicket>) => void;

  addExpenseRecord: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => ExpenseRecord;
  deleteExpenseRecord: (id: string) => void;

  addDocument: (doc: Omit<VehicleDocument, 'id'>) => VehicleDocument;
  updateDocument: (id: string, updates: Partial<VehicleDocument>) => void;
  deleteDocument: (id: string) => void;

  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;

  addServiceCenter: (center: Omit<ServiceCenter, 'id'>) => ServiceCenter;

  markReminderCompleted: (id: string) => void;
  dismissReminder: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resetToDemoData: () => void;
  exportDataAsJSON: () => void;
  exportVehiclesCSV: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VEHICLES: 'fleetpulse_vehicles',
  MAINTENANCE: 'fleetpulse_maintenance',
  SCHEDULES: 'fleetpulse_schedules',
  REMINDERS: 'fleetpulse_reminders',
  REPAIRS: 'fleetpulse_repairs',
  EXPENSES: 'fleetpulse_expenses',
  DOCUMENTS: 'fleetpulse_documents',
  DRIVERS: 'fleetpulse_drivers',
  SERVICE_CENTERS: 'fleetpulse_service_centers',
  PROFILE: 'fleetpulse_profile',
  ACTIVITIES: 'fleetpulse_activities',
  NOTIFICATIONS: 'fleetpulse_notifications',
};

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTabState] = useState<string>('landing');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpenState] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpenState] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpenState] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [presetVehicleId, setPresetVehicleId] = useState<string | undefined>(undefined);

  const setIsAddServiceOpen = (open: boolean, presetId?: string) => {
    setPresetVehicleId(presetId);
    setIsAddServiceOpenState(open);
  };

  const setIsReportIssueOpen = (open: boolean, presetId?: string) => {
    setPresetVehicleId(presetId);
    setIsReportIssueOpenState(open);
  };

  const setIsAddExpenseOpen = (open: boolean, presetId?: string) => {
    setPresetVehicleId(presetId);
    setIsAddExpenseOpenState(open);
  };

  const setActiveTab = (tab: string, vehicleId?: string) => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Local storage load or defaults
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return saved ? JSON.parse(saved) : initialMaintenanceRecords;
  });

  const [schedules, setSchedules] = useState<ServiceSchedule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : initialServiceSchedules;
  });

  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : initialSmartReminders;
  });

  const [repairs, setRepairs] = useState<RepairTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    return saved ? JSON.parse(saved) : initialRepairs;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [documents, setDocuments] = useState<VehicleDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICE_CENTERS);
    return saved ? JSON.parse(saved) : initialServiceCenters;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(smartReminders));
  }, [smartReminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_CENTERS, JSON.stringify(serviceCenters));
  }, [serviceCenters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Recalculate dynamic vehicle health and reminders
  const enrichedVehicles = useMemo(() => {
    return vehicles.map(v => {
      const evaluation = computeVehicleHealthScore(v, repairs, smartReminders, documents);
      return {
        ...v,
        healthScore: evaluation.score
      };
    });
  }, [vehicles, repairs, smartReminders, documents]);

  // Helper getters
  const getVehicleById = (id: string) => enrichedVehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);
  const getServiceCenterById = (id: string) => serviceCenters.find(sc => sc.id === id);

  // Actions
  const addVehicle = (newVehData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'healthScore'>): Vehicle => {
    const id = `veh_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...newVehData,
      id,
      healthScore: 100,
      createdAt: now,
      updatedAt: now,
      imageUrl: newVehData.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
    };

    setVehicles(prev => [newVehicle, ...prev]);

    // Add activity
    const act: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'vehicle',
      title: 'New Vehicle Registered',
      description: `${newVehicle.name} (${newVehicle.registrationNumber}) added to fleet.`,
      vehicleReg: newVehicle.registrationNumber,
      vehicleName: newVehicle.name,
      timestamp: 'Just now',
      status: newVehicle.status
    };
    setActivities(prev => [act, ...prev]);

    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v)));
  };

  const deleteVehicle = (id: string) => {
    const veh = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (selectedVehicleId === id) setSelectedVehicleId(null);

    if (veh) {
      const act: ActivityItem = {
        id: `act_${Date.now()}`,
        type: 'vehicle',
        title: 'Vehicle Removed',
        description: `${veh.name} (${veh.registrationNumber}) was removed from the active system.`,
        vehicleReg: veh.registrationNumber,
        vehicleName: veh.name,
        timestamp: 'Just now'
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const addMaintenanceRecord = (data: Omit<MaintenanceRecord, 'id' | 'createdAt'>): MaintenanceRecord => {
    const id = `mrec_${Date.now().toString(36)}`;
    const newRecord: MaintenanceRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);

    // Also update vehicle odometer and status if necessary
    const targetVeh = vehicles.find(v => v.id === data.vehicleId);
    if (targetVeh) {
      const updatedOdo = Math.max(targetVeh.currentOdometer, data.odometer);
      updateVehicle(targetVeh.id, {
        currentOdometer: updatedOdo,
        status: 'Active' // clears "Due for service" / "Under Maintenance"
      });

      // Add expense record automatically
      addExpenseRecord({
        vehicleId: data.vehicleId,
        category: 'Maintenance',
        amount: data.totalCost,
        date: data.serviceDate,
        odometer: data.odometer,
        vendor: data.serviceCenterName,
        receiptNumber: data.invoiceFileName || `INV-${id.toUpperCase()}`,
        notes: `Service record: ${data.title}`
      });

      // Add activity
      const act: ActivityItem = {
        id: `act_${Date.now()}`,
        type: 'service',
        title: 'Maintenance Service Completed',
        description: `${data.serviceType} for ${targetVeh.name} (${targetVeh.registrationNumber}). Cost: ${userProfile.currency}${data.totalCost}`,
        vehicleReg: targetVeh.registrationNumber,
        vehicleName: targetVeh.name,
        timestamp: 'Just now',
        cost: data.totalCost,
        status: 'Completed'
      };
      setActivities(prev => [act, ...prev]);
    }

    // Auto-update any matching recurring schedule for this vehicle & category
    setSchedules(prev => prev.map(s => {
      if (s.vehicleId === data.vehicleId && s.serviceCategory === data.serviceType) {
        const nextDate = new Date(data.serviceDate);
        nextDate.setMonth(nextDate.getMonth() + (s.intervalMonths || 6));
        const nextKm = data.odometer + (s.intervalKm || 10000);
        return {
          ...s,
          lastPerformedDate: data.serviceDate,
          lastPerformedOdometer: data.odometer,
          nextDueDate: nextDate.toISOString().slice(0, 10),
          nextDueOdometer: nextKm,
          priority: 'Low'
        };
      }
      return s;
    }));

    // Auto-complete any active pending reminder for this service
    setSmartReminders(prev => prev.map(rem => {
      if (rem.vehicleId === data.vehicleId && rem.category === data.serviceType && rem.status === 'Pending') {
        return { ...rem, status: 'Completed' };
      }
      return rem;
    }));

    return newRecord;
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
  };

  const importVehicles = (imported: Vehicle[]) => {
    setVehicles(prev => [...imported, ...prev]);
    const act: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'vehicle',
      title: 'Fleet Batch Imported',
      description: `Successfully imported ${imported.length} vehicles into the management platform.`,
      vehicleReg: imported[0]?.registrationNumber || 'BATCH',
      vehicleName: 'Bulk Import',
      timestamp: 'Just now'
    };
    setActivities(prev => [act, ...prev]);
  };

  const addServiceSchedule = (data: Omit<ServiceSchedule, 'id'>): ServiceSchedule => {
    const id = `sch_${Date.now().toString(36)}`;
    const newSchedule: ServiceSchedule = {
      ...data,
      id
    };
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  };

  const updateServiceSchedule = (id: string, updates: Partial<ServiceSchedule>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addRepairTicket = (data: Omit<RepairTicket, 'id'>): RepairTicket => {
    const id = `rep_${Date.now().toString(36)}`;
    const newRepair: RepairTicket = {
      ...data,
      id
    };
    setRepairs(prev => [newRepair, ...prev]);

    // Update vehicle status to Under Repair
    const targetVeh = vehicles.find(v => v.id === data.vehicleId);
    if (targetVeh && data.status !== 'Resolved') {
      updateVehicle(targetVeh.id, { status: 'Under Repair' });
    }

    // Add activity
    if (targetVeh) {
      const act: ActivityItem = {
        id: `act_${Date.now()}`,
        type: 'repair',
        title: 'Repair Issue Reported',
        description: `${data.issueTitle} - Severity: ${data.severity}`,
        vehicleReg: targetVeh.registrationNumber,
        vehicleName: targetVeh.name,
        timestamp: 'Just now',
        status: data.status,
        cost: data.estimatedCost
      };
      setActivities(prev => [act, ...prev]);
    }

    return newRepair;
  };

  const updateRepairTicket = (id: string, updates: Partial<RepairTicket>) => {
    setRepairs(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    
    // If marked resolved, check if vehicle has any other active repairs
    if (updates.status === 'Resolved') {
      const repair = repairs.find(r => r.id === id);
      if (repair) {
        const otherRepairs = repairs.filter(r => r.vehicleId === repair.vehicleId && r.id !== id && r.status !== 'Resolved');
        if (otherRepairs.length === 0) {
          updateVehicle(repair.vehicleId, { status: 'Active' });
        }
      }
    }
  };

  const addExpenseRecord = (data: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord => {
    const id = `exp_${Date.now().toString(36)}`;
    const newExpense: ExpenseRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    const targetVeh = vehicles.find(v => v.id === data.vehicleId);
    if (targetVeh && data.category !== 'Maintenance') {
      const act: ActivityItem = {
        id: `act_${Date.now()}`,
        type: 'expense',
        title: `${data.category} Expense Logged`,
        description: `${userProfile.currency}${data.amount} logged for ${targetVeh.name}`,
        vehicleReg: targetVeh.registrationNumber,
        vehicleName: targetVeh.name,
        timestamp: 'Just now',
        cost: data.amount
      };
      setActivities(prev => [act, ...prev]);
    }

    return newExpense;
  };

  const deleteExpenseRecord = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addDocument = (data: Omit<VehicleDocument, 'id'>): VehicleDocument => {
    const id = `doc_${Date.now().toString(36)}`;
    const newDoc: VehicleDocument = {
      ...data,
      id
    };
    setDocuments(prev => [newDoc, ...prev]);

    const targetVeh = vehicles.find(v => v.id === data.vehicleId);
    if (targetVeh) {
      const act: ActivityItem = {
        id: `act_${Date.now()}`,
        type: 'document',
        title: 'Document Uploaded',
        description: `${data.documentType} registered. Expiry: ${data.expiryDate}`,
        vehicleReg: targetVeh.registrationNumber,
        vehicleName: targetVeh.name,
        timestamp: 'Just now'
      };
      setActivities(prev => [act, ...prev]);
    }

    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<VehicleDocument>) => {
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addDriver = (data: Omit<Driver, 'id'>): Driver => {
    const id = `drv_${Date.now().toString(36)}`;
    const newDriver: Driver = { ...data, id };
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const addServiceCenter = (data: Omit<ServiceCenter, 'id'>): ServiceCenter => {
    const id = `sc_${Date.now().toString(36)}`;
    const newCenter: ServiceCenter = { ...data, id };
    setServiceCenters(prev => [...prev, newCenter]);
    return newCenter;
  };

  const markReminderCompleted = (id: string) => {
    setSmartReminders(prev => prev.map(r => (r.id === id ? { ...r, status: 'Completed' } : r)));
  };

  const dismissReminder = (id: string) => {
    setSmartReminders(prev => prev.filter(r => r.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setVehicles(initialVehicles);
    setMaintenanceRecords(initialMaintenanceRecords);
    setSchedules(initialServiceSchedules);
    setSmartReminders(initialSmartReminders);
    setRepairs(initialRepairs);
    setExpenses(initialExpenses);
    setDocuments(initialDocuments);
    setDrivers(initialDrivers);
    setServiceCenters(initialServiceCenters);
    setUserProfile(initialProfile);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
  };

  const exportDataAsJSON = () => {
    const exportObject = {
      userProfile,
      vehicles: enrichedVehicles,
      maintenanceRecords,
      schedules,
      smartReminders,
      repairs,
      expenses,
      documents,
      drivers,
      serviceCenters,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FleetPulse-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportVehiclesCSV = () => {
    const headers = ['Registration Number', 'Name', 'Type', 'Make', 'Model', 'Year', 'Odometer (km)', 'Fuel Type', 'Status', 'Health Score', 'Location', 'Assigned Driver'];
    const rows = enrichedVehicles.map(v => {
      const driver = getDriverById(v.assignedDriverId || '');
      return [
        `"${v.registrationNumber}"`,
        `"${v.name}"`,
        `"${v.type}"`,
        `"${v.manufacturer}"`,
        `"${v.model}"`,
        v.year,
        v.currentOdometer,
        `"${v.fuelType}"`,
        `"${v.status}"`,
        v.healthScore,
        `"${v.location || 'N/A'}"`,
        `"${driver ? driver.name : 'Unassigned'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FleetPulse-Vehicles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FleetContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedVehicleId,
        setSelectedVehicleId,
        globalSearchQuery,
        setGlobalSearchQuery,
        isAddVehicleOpen,
        setIsAddVehicleOpen,
        isAddServiceOpen,
        setIsAddServiceOpen,
        isReportIssueOpen,
        setIsReportIssueOpen,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        isOnboardingActive,
        setIsOnboardingActive,
        presetVehicleId,
        vehicles: enrichedVehicles,
        maintenanceRecords,
        schedules,
        smartReminders,
        repairs,
        expenses,
        documents,
        drivers,
        serviceCenters,
        activities,
        notifications,
        userProfile,
        getVehicleById,
        getDriverById,
        getServiceCenterById,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        importVehicles,
        addServiceSchedule,
        updateServiceSchedule,
        addRepairTicket,
        updateRepairTicket,
        addExpenseRecord,
        deleteExpenseRecord,
        addDocument,
        updateDocument,
        deleteDocument,
        addDriver,
        updateDriver,
        addServiceCenter,
        markReminderCompleted,
        dismissReminder,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        resetToDemoData,
        exportDataAsJSON,
        exportVehiclesCSV
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
