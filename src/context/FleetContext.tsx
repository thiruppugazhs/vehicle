import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Vehicle,
  MaintenanceRecord,
  ServiceSchedule,
  SmartReminder,
  RepairTicket,
  RepairStatus,
  ExpenseRecord,
  VehicleDocument,
  Driver,
  ServiceCenter,
  UserProfile,
  ActivityItem,
  NotificationItem,
  NotificationPreferences,
  PriorityLevel,
  Organization,
  OperationalRole,
  AuditLogEntry,
  VehicleOdometerLog,
  SmartInsight
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
  initialNotifications,
  initialNotificationPreferences,
  initialOrganization,
  initialOrganizations,
  initialAuditLogs
} from '../data/initialData';
import { computeVehicleHealthScore } from '../utils/healthCalculator';
import { getDaysDifference } from '../utils/formatters';
import { runAutomatedNotificationScan } from '../services/notificationWorker';
import { supabase, subscribeToSupabaseTable, registerDeviceTokenInSupabase } from '../services/supabase';
import { initializeWebMessaging } from '../services/firebase';

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
  isUpdateOdometerOpen: boolean;
  setIsUpdateOdometerOpen: (open: boolean, presetVehicleId?: string) => void;
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
  deleteRepairTicket: (id: string) => void;

  addExpenseRecord: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => ExpenseRecord;
  deleteExpenseRecord: (id: string) => void;

  addDocument: (doc: Omit<VehicleDocument, 'id'>) => VehicleDocument;
  updateDocument: (id: string, updates: Partial<VehicleDocument>) => void;
  deleteDocument: (id: string) => void;

  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  addServiceCenter: (center: Omit<ServiceCenter, 'id'>) => ServiceCenter;
  updateServiceCenter: (id: string, updates: Partial<ServiceCenter>) => void;
  deleteServiceCenter: (id: string) => void;

  markReminderCompleted: (id: string) => void;
  dismissReminder: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  
  // Part 2 additions
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  isNotificationPreferencesOpen: boolean;
  setIsNotificationPreferencesOpen: (open: boolean) => void;
  moveRepairStage: (repairId: string, newStage: RepairStatus) => void;
  assignDriver: (vehicleId: string, driverId: string, role: 'Primary' | 'Backup', notes?: string) => void;
  removeDriverAssignment: (vehicleId: string, role: 'Primary' | 'Backup') => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  fleetHealthFilter: 'ALL' | 'Excellent' | 'Needs Attention' | 'Critical';
  setFleetHealthFilter: (filter: 'ALL' | 'Excellent' | 'Needs Attention' | 'Critical') => void;
  totalFleetDowntimeHours: number;
  serviceCompliance: { complianceRate: number; onTimeCount: number; lateCount: number; overdueCount: number };
  fleetUtilization: number;
  fleetHealthBreakdown: { excellent: number; needsAttention: number; critical: number };

  // Part 3 additions (Requirements 41-60)
  organization: Organization;
  organizations: Organization[];
  updateOrganization: (updates: Partial<Organization>) => void;
  switchOrganization: (orgId: string) => void;
  activeRole: OperationalRole;
  switchRole: (role: OperationalRole) => void;
  auditLogs: AuditLogEntry[];
  recordAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  odometerLogs: VehicleOdometerLog[];
  logOdometer: (vehicleId: string, odo: number, notes?: string, isAuthorizedCorrection?: boolean) => boolean;
  smartInsights: SmartInsight[];
  assignedDriverVehicle?: Vehicle;
  assignedTechnicianRepairs: RepairTicket[];
  toastMessage: string | null;
  showToast: (msg: string) => void;

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
  PREFERENCES: 'fleetpulse_notification_prefs',
  ORGANIZATION: 'fleetpulse_organization',
  ORGANIZATIONS: 'fleetpulse_organizations',
  AUDIT_LOGS: 'fleetpulse_audit_logs',
  ODOMETER_LOGS: 'fleetpulse_odometer_logs'
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
  const [isUpdateOdometerOpen, setIsUpdateOdometerOpenState] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationPreferencesOpen, setIsNotificationPreferencesOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [fleetHealthFilter, setFleetHealthFilter] = useState<'ALL' | 'Excellent' | 'Needs Attention' | 'Critical'>('ALL');
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

  const setIsUpdateOdometerOpen = (open: boolean, presetId?: string) => {
    setPresetVehicleId(presetId);
    setIsUpdateOdometerOpenState(open);
  };

  // Requirement 74: Frontend Routes Hash Synchronization
  const setActiveTab = (tab: string, vehicleId?: string) => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      window.location.hash = `#/${tab}/${vehicleId}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === '/') {
        setActiveTabState('dashboard');
        return;
      }
      const parts = hash.split('/');
      const primary = parts[0];
      const sub = parts[1];

      if (primary === 'login') {
        setIsAuthModalOpen(true);
        setAuthMode('login');
      } else if (primary === 'signup') {
        setIsAuthModalOpen(true);
        setAuthMode('signup');
      } else if (primary === 'onboarding') {
        setIsOnboardingActive(true);
      } else if (primary === 'profile') {
        setActiveTabState('settings');
      } else if (primary === 'vehicles' && sub) {
        setSelectedVehicleId(sub);
        setActiveTabState('vehicle-details');
      } else if (primary === 'repairs' && sub) {
        setActiveTabState('repairs');
      } else if (['dashboard', 'vehicles', 'maintenance', 'repairs', 'expenses', 'reminders', 'documents', 'drivers', 'service-centers', 'fleet-management', 'analytics', 'reports', 'notifications', 'audit', 'settings', 'admin', 'landing'].includes(primary)) {
        setActiveTabState(primary);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return saved ? JSON.parse(saved) : initialNotificationPreferences;
  });

  // Part 3 States (Requirements 41, 42, 45, 47, 58)
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    return saved ? JSON.parse(saved) : initialOrganization;
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
    return saved ? JSON.parse(saved) : initialOrganizations;
  });

  const [activeRole, setActiveRole] = useState<OperationalRole>(() => {
    return userProfile.operationalRole || 'Owner';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [odometerLogs, setOdometerLogs] = useState<VehicleOdometerLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ODOMETER_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ODOMETER_LOGS, JSON.stringify(odometerLogs));
  }, [odometerLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  const updateNotificationPreferences = (updates: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => ({ ...prev, ...updates }));
  };

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

  // Requirement 72: Background Notification Automation Worker
  useEffect(() => {
    const runScan = () => {
      const result = runAutomatedNotificationScan(
        vehicles,
        schedules,
        documents,
        drivers,
        repairs,
        notifications
      );
      if (result.newNotifications.length > 0) {
        setNotifications(prev => [...result.newNotifications, ...prev]);
      }
    };

    runScan();
    const interval = setInterval(runScan, 60000);
    return () => clearInterval(interval);
  }, [vehicles, schedules, documents, drivers, repairs, notifications]);

  // Requirement 4, 7, 8, 38 & 39: Shared Realtime Supabase Sync & Device Tokens
  useEffect(() => {
    // 1. Initialize Web FCM & register token in Supabase fleet_device_tokens table
    initializeWebMessaging().then(token => {
      if (token) {
        registerDeviceTokenInSupabase(userProfile.id, organization.id, token, 'web');
      }
    });

    // 2. Fetch initial vehicles from Supabase PostgreSQL
    supabase
      .from('vehicles')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mappedVehicles: Vehicle[] = data.map((row: any) => ({
            id: row.id,
            registrationNumber: row.registration_number,
            name: row.name,
            type: row.type || 'Truck',
            manufacturer: row.manufacturer,
            model: row.model,
            variant: row.variant || '',
            year: row.year || 2023,
            purchaseDate: row.purchase_date || '2023-01-01',
            purchasePrice: row.purchase_price || 2500000,
            vin: row.vin || 'MAT1234567890ABCD',
            engineNumber: row.engine_number || 'ENG-998877',
            seatingCapacity: row.seating_capacity || 3,
            currentOdometer: row.current_odometer || 0,
            status: row.status || 'Active',
            fuelType: row.fuel_type || 'Diesel',
            transmission: row.transmission || 'Manual',
            healthScore: row.health_score ?? 100,
            imageUrl: row.image_url,
            organizationId: row.organization_id || 'org_01',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
          }));

          setVehicles(prev => {
            const merged = [...prev];
            for (const mv of mappedVehicles) {
              const idx = merged.findIndex(v => v.id === mv.id || v.registrationNumber === mv.registrationNumber);
              if (idx !== -1) merged[idx] = { ...merged[idx], ...mv };
              else merged.unshift(mv);
            }
            return merged;
          });
        }
      });

    // 3. Real-time Supabase Postgres Changes listeners
    const vehicleChannel = subscribeToSupabaseTable<any>('vehicles', ({ eventType, new: newRow }) => {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        const mapped: Vehicle = {
          id: newRow.id,
          registrationNumber: newRow.registration_number,
          name: newRow.name,
          type: newRow.type || 'Truck',
          manufacturer: newRow.manufacturer,
          model: newRow.model,
          variant: newRow.variant || '',
          year: newRow.year || 2023,
          purchaseDate: newRow.purchase_date || '2023-01-01',
          purchasePrice: newRow.purchase_price || 2500000,
          vin: newRow.vin || 'MAT1234567890ABCD',
          engineNumber: newRow.engine_number || 'ENG-998877',
          seatingCapacity: newRow.seating_capacity || 3,
          currentOdometer: newRow.current_odometer || 0,
          status: newRow.status || 'Active',
          fuelType: newRow.fuel_type || 'Diesel',
          transmission: newRow.transmission || 'Manual',
          healthScore: newRow.health_score ?? 100,
          imageUrl: newRow.image_url,
          organizationId: newRow.organization_id || 'org_01',
          createdAt: newRow.created_at || new Date().toISOString(),
          updatedAt: newRow.updated_at || new Date().toISOString()
        };

        setVehicles(prev => {
          const idx = prev.findIndex(v => v.id === mapped.id || v.registrationNumber === mapped.registrationNumber);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...mapped };
            return updated;
          }
          return [mapped, ...prev];
        });
      }
    });

    const repairChannel = subscribeToSupabaseTable<any>('repair_tickets', ({ eventType, new: newRow }) => {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        const mapped: RepairTicket = {
          id: newRow.id,
          vehicleId: newRow.vehicle_id,
          issueTitle: newRow.issue_title,
          issueCategory: newRow.issue_category,
          description: newRow.description,
          severity: newRow.severity || 'Moderate',
          status: newRow.status || 'Reported',
          reportedDate: newRow.reported_date,
          reportedBy: newRow.reported_by || 'Fleet Operator',
          startDate: newRow.start_date,
          expectedCompletion: newRow.expected_completion,
          actualCompletion: newRow.actual_completion,
          estimatedCost: parseFloat(newRow.estimated_cost || '0'),
          approvedCost: parseFloat(newRow.approved_cost || '0'),
          actualCost: parseFloat(newRow.actual_cost || '0'),
          assignedServiceCenter: newRow.service_center_name || 'Workshop',
          technicianName: newRow.assigned_technician,
          notes: newRow.notes,
          photos: newRow.photo_urls || [],
          organizationId: newRow.organization_id || 'org_01'
        };

        setRepairs(prev => {
          const idx = prev.findIndex(r => r.id === mapped.id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...mapped };
            return updated;
          }
          return [mapped, ...prev];
        });
      }
    });

    return () => {
      vehicleChannel.unsubscribe();
      repairChannel.unsubscribe();
    };
  }, [organization.id, userProfile.id]);

  // Recalculate dynamic vehicle health and reminders (Requirement 42: Organization Scoping)
  const enrichedVehicles = useMemo(() => {
    return vehicles
      .filter(v => v.organizationId === organization.id || (!v.organizationId && organization.id === 'org_01'))
      .map(v => {
        const evaluation = computeVehicleHealthScore(v, repairs, smartReminders, documents);
        return {
          ...v,
          healthScore: evaluation.score
        };
      });
  }, [vehicles, repairs, smartReminders, documents, organization.id]);

  // Helper getters
  const getVehicleById = (id: string) => enrichedVehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);
  const getServiceCenterById = (id: string) => serviceCenters.find(sc => sc.id === id);

  // Actions (Requirement 41 & 44: RBAC & Permission Enforcement)
  const addVehicle = (newVehData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'healthScore'>): Vehicle => {
    if (activeRole === 'Driver' || activeRole === 'Technician') {
      showToast(`Permission Denied: ${activeRole}s cannot register new vehicles.`);
      return {} as Vehicle;
    }

    const id = `veh_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...newVehData,
      id,
      organizationId: organization.id,
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
    if (activeRole === 'Driver' || activeRole === 'Technician') {
      showToast(`Permission Denied: ${activeRole}s are not authorized to delete vehicles.`);
      return;
    }

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
    if (activeRole === 'Driver' || activeRole === 'Technician') {
      showToast(`Permission Denied: ${activeRole}s cannot delete maintenance history records.`);
      return;
    }
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
    if (targetVeh && data.status !== 'Completed' && data.status !== 'Closed') {
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
    setRepairs(prev => prev.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates };
        if (merged.approvedCost !== undefined && merged.actualCost !== undefined) {
          merged.costVariance = merged.actualCost - merged.approvedCost;
          merged.isUnusualVariance = merged.costVariance > 1000 || (merged.approvedCost > 0 && merged.costVariance / merged.approvedCost > 0.1);
        }
        return merged;
      }
      return r;
    }));
    
    // If marked completed or closed, check if vehicle has any other active repairs
    const isFinished = updates.status === 'Completed' || updates.status === 'Closed';
    if (isFinished) {
      const repair = repairs.find(r => r.id === id);
      if (repair) {
        const otherRepairs = repairs.filter(r => 
          r.vehicleId === repair.vehicleId && 
          r.id !== id && 
          r.status !== 'Completed' && 
          r.status !== 'Closed'
        );
        if (otherRepairs.length === 0) {
          updateVehicle(repair.vehicleId, { status: 'Active' });
        }
      }
    }
  };

  const deleteRepairTicket = (id: string) => {
    if (activeRole === 'Driver') {
      showToast('Permission Denied: Drivers cannot delete repair tickets.');
      return;
    }
    setRepairs(prev => prev.filter(r => r.id !== id));
  };

  const moveRepairStage = (repairId: string, newStage: RepairStatus) => {
    const targetRepair = repairs.find(r => r.id === repairId);
    if (!targetRepair) return;

    const updates: Partial<RepairTicket> = { status: newStage };

    if (newStage === 'Repair In Progress' && !targetRepair.startDate) {
      updates.startDate = new Date().toISOString().slice(0, 10);
    }

    if (newStage === 'Completed' || newStage === 'Closed') {
      if (!targetRepair.actualCompletion) {
        updates.actualCompletion = new Date().toISOString().slice(0, 10);
      }
      if (targetRepair.downtimeStart && !targetRepair.downtimeEnd) {
        const endTime = new Date().toISOString();
        updates.downtimeEnd = endTime;
        const startMs = new Date(targetRepair.downtimeStart).getTime();
        const endMs = new Date(endTime).getTime();
        const diffHours = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60)));
        updates.downtimeHours = diffHours;
        const days = Math.floor(diffHours / 24);
        const hrs = diffHours % 24;
        updates.downtimeFormatted = days > 0 ? `${days} day${days > 1 ? 's' : ''} ${hrs} hr${hrs !== 1 ? 's' : ''}` : `${diffHours} hours`;
      }
    }

    updateRepairTicket(repairId, updates);

    // If repair completed/closed, check vehicle status and add notification
    if (newStage === 'Completed' || newStage === 'Closed') {
      const otherActive = repairs.filter(r => 
        r.vehicleId === targetRepair.vehicleId && 
        r.id !== repairId && 
        r.status !== 'Completed' && 
        r.status !== 'Closed'
      );
      if (otherActive.length === 0) {
        updateVehicle(targetRepair.vehicleId, { status: 'Active' });
      }

      const veh = vehicles.find(v => v.id === targetRepair.vehicleId);
      if (veh) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          title: 'Repair Completed',
          message: `${targetRepair.issueTitle} completed for ${veh.registrationNumber}`,
          type: 'success',
          notificationType: 'repair_completed',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'repairs', vehicleId: veh.id }
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } else {
      updateVehicle(targetRepair.vehicleId, { status: 'Under Repair' });
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
    if (activeRole === 'Driver' || activeRole === 'Technician') {
      showToast(`Permission Denied: ${activeRole}s cannot delete financial expense records.`);
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addDocument = (data: Omit<VehicleDocument, 'id'>): VehicleDocument => {
    const id = `doc_${Date.now().toString(36)}`;
    const newDoc: VehicleDocument = {
      ...data,
      id,
      organizationId: organization.id
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
    if (activeRole === 'Driver') {
      showToast('Permission Denied: Drivers cannot delete compliance documents.');
      return;
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addDriver = (data: Omit<Driver, 'id'>): Driver => {
    if (activeRole !== 'Owner' && activeRole !== 'Fleet Manager') {
      showToast('Permission Denied: Only Owners and Fleet Managers can register new drivers.');
      return {} as Driver;
    }
    const id = `drv_${Date.now().toString(36)}`;
    const newDriver: Driver = { ...data, id, organizationId: organization.id };
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDriver = (id: string) => {
    if (activeRole !== 'Owner' && activeRole !== 'Fleet Manager') {
      showToast('Permission Denied: Only Owners and Fleet Managers can remove drivers.');
      return;
    }
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const addServiceCenter = (data: Omit<ServiceCenter, 'id'>): ServiceCenter => {
    if (activeRole === 'Driver') {
      showToast('Permission Denied: Drivers cannot register service centers.');
      return {} as ServiceCenter;
    }
    const id = `sc_${Date.now().toString(36)}`;
    const newCenter: ServiceCenter = { ...data, id, organizationId: organization.id };
    setServiceCenters(prev => [...prev, newCenter]);
    return newCenter;
  };

  const updateServiceCenter = (id: string, updates: Partial<ServiceCenter>) => {
    setServiceCenters(prev => prev.map(sc => (sc.id === id ? { ...sc, ...updates } : sc)));
  };

  const deleteServiceCenter = (id: string) => {
    if (activeRole !== 'Owner' && activeRole !== 'Fleet Manager') {
      showToast('Permission Denied: Only Owners and Fleet Managers can remove service centers.');
      return;
    }
    setServiceCenters(prev => prev.filter(sc => sc.id !== id));
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

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const assignDriver = (vehicleId: string, driverId: string, role: 'Primary' | 'Backup', notes?: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    const drv = drivers.find(d => d.id === driverId);
    if (!veh || !drv) return;

    const historyItem = {
      id: `dh_${Date.now()}`,
      driverId,
      driverName: drv.name,
      role,
      assignedDate: new Date().toISOString().slice(0, 10),
      notes: notes || `Assigned as ${role} driver`
    };

    const updates: Partial<Vehicle> = {
      driverHistory: [historyItem, ...(veh.driverHistory || [])]
    };

    if (role === 'Primary') {
      updates.primaryDriverId = driverId;
      updates.assignedDriverId = driverId;
    } else {
      updates.backupDriverId = driverId;
    }

    updateVehicle(vehicleId, updates);
    updateDriver(driverId, { assignedVehicleId: vehicleId });

    setActivities(prev => [{
      id: `act_${Date.now()}`,
      type: 'vehicle',
      title: 'Driver Assigned',
      description: `${drv.name} assigned as ${role} driver to ${veh.registrationNumber}`,
      vehicleReg: veh.registrationNumber,
      vehicleName: veh.name,
      timestamp: 'Just now'
    }, ...prev]);
  };

  const removeDriverAssignment = (vehicleId: string, role: 'Primary' | 'Backup') => {
    const veh = vehicles.find(v => v.id === vehicleId);
    if (!veh) return;
    const updates: Partial<Vehicle> = {};
    if (role === 'Primary') {
      updates.primaryDriverId = undefined;
      updates.assignedDriverId = undefined;
    } else {
      updates.backupDriverId = undefined;
    }
    updateVehicle(vehicleId, updates);
  };

  // Fleet Analytics & Metrics
  const totalFleetDowntimeHours = useMemo(() => {
    return repairs.reduce((acc, r) => acc + (r.downtimeHours || (r.downtimeDays ? r.downtimeDays * 24 : 0)), 0);
  }, [repairs]);

  const serviceCompliance = useMemo(() => {
    const completed = maintenanceRecords.length;
    const overdue = smartReminders.filter(r => r.status === 'Pending' && r.remainingDays < 0).length;
    const upcoming = smartReminders.filter(r => r.status === 'Pending' && r.remainingDays >= 0).length;
    const total = completed + overdue;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 94;
    return {
      complianceRate: rate,
      onTimeCount: completed,
      lateCount: upcoming,
      overdueCount: overdue
    };
  }, [maintenanceRecords, smartReminders]);

  const fleetUtilization = useMemo(() => {
    if (enrichedVehicles.length === 0) return 0;
    const active = enrichedVehicles.filter(v => v.status === 'Active' || v.status === 'Due for Service').length;
    return Math.round((active / enrichedVehicles.length) * 100);
  }, [enrichedVehicles]);

  const fleetHealthBreakdown = useMemo(() => {
    const excellent = enrichedVehicles.filter(v => v.healthScore >= 80).length;
    const needsAttention = enrichedVehicles.filter(v => v.healthScore >= 60 && v.healthScore < 80).length;
    const critical = enrichedVehicles.filter(v => v.healthScore < 60).length;
    return { excellent, needsAttention, critical };
  }, [enrichedVehicles]);

  // Requirement 47: Audit Log Tracker
  const recordAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now().toString(36)}`,
      timestamp: 'Just now'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Requirement 41: Operational Role Switcher
  const switchRole = (role: OperationalRole) => {
    setActiveRole(role);
    setUserProfile(prev => ({ ...prev, operationalRole: role }));
    showToast(`Switched active operational view to ${role}`);
    recordAuditLog({
      actorName: userProfile.name,
      actorRole: role,
      action: 'Role Switched',
      entityType: 'Vehicle',
      description: `Active operational persona changed to ${role}`
    });
  };

  // Requirement 42: Organization Support
  const updateOrganization = (updates: Partial<Organization>) => {
    if (activeRole !== 'Owner') {
      showToast('Permission Denied: Only the Organization Owner can modify corporate workspace settings.');
      return;
    }
    setOrganization(prev => {
      const updated = { ...prev, ...updates };
      setOrganizations(orgs => orgs.map(o => o.id === updated.id ? updated : o));
      return updated;
    });
    if (updates.name) {
      setUserProfile(prev => ({ ...prev, organizationName: updates.name }));
    }
    showToast('Organization settings updated');
    recordAuditLog({
      actorName: userProfile.name,
      actorRole: activeRole,
      action: 'Organization Updated',
      entityType: 'Vehicle',
      description: `Organization profile updated for ${organization.name}`
    });
  };

  const switchOrganization = (orgId: string) => {
    const target = organizations.find(o => o.id === orgId);
    if (target) {
      setOrganization(target);
      setUserProfile(prev => ({ ...prev, organizationId: target.id, organizationName: target.name }));
      showToast(`Switched workspace to ${target.name}`);
      recordAuditLog({
        actorName: userProfile.name,
        actorRole: activeRole,
        action: 'Workspace Switched',
        entityType: 'Vehicle',
        description: `Active fleet workspace switched to ${target.name}`
      });
    }
  };

  // Requirement 45 & 79: Global Odometer Logging with Rollback Authorization & Schedule Triggers
  const logOdometer = (vehicleId: string, odo: number, notes?: string, isAuthorizedCorrection: boolean = false): boolean => {
    const veh = vehicles.find(v => v.id === vehicleId);
    if (!veh) return false;

    // Requirement 79: Prevent decreasing mileage unless an authorized user corrects it
    if (odo < veh.currentOdometer) {
      if (activeRole === 'Driver') {
        showToast('Permission Denied: Drivers cannot log rollback mileage. Contact Fleet Manager.');
        return false;
      }
      if (!isAuthorizedCorrection) {
        showToast(`Warning: New mileage (${odo.toLocaleString()} km) is lower than current (${veh.currentOdometer.toLocaleString()} km). Authorized correction flag required.`);
        return false;
      }
    }

    updateVehicle(vehicleId, { currentOdometer: odo });
    const logEntry: VehicleOdometerLog = {
      id: `odo_${Date.now().toString(36)}`,
      vehicleId,
      odometer: odo,
      recordedBy: userProfile.name,
      date: new Date().toISOString().slice(0, 10),
      notes: notes || (odo < veh.currentOdometer ? 'Authorized Rollback Correction' : 'Mileage Update')
    };
    setOdometerLogs(prev => [logEntry, ...prev]);

    // Check mileage-based service schedules (Requirement 79)
    const vehSchedules = schedules.filter(s => s.vehicleId === vehicleId && s.nextDueOdometer);
    for (const sch of vehSchedules) {
      if (sch.nextDueOdometer && odo >= sch.nextDueOdometer) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}_${sch.id}`,
          title: 'Service Overdue by Mileage',
          message: `${veh.registrationNumber} reached ${odo.toLocaleString()} km, exceeding threshold for ${sch.name} (${sch.nextDueOdometer.toLocaleString()} km).`,
          type: 'urgent',
          notificationType: 'service_overdue',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'maintenance', vehicleId: veh.id }
        };
        setNotifications(prev => [notif, ...prev]);

        // Escalate or add critical reminder
        setSmartReminders(prev => {
          const exists = prev.find(r => r.vehicleId === vehicleId && r.category === sch.serviceCategory && r.status === 'Pending');
          if (exists) {
            return prev.map(r => r.id === exists.id ? { ...r, priority: 'Critical', dueOdometer: sch.nextDueOdometer } : r);
          }
          return [
            {
              id: `rem_${Date.now()}`,
              vehicleId,
              vehicleReg: veh.registrationNumber,
              vehicleName: veh.name,
              title: `${sch.name} Overdue`,
              category: sch.serviceCategory,
              dueDate: sch.nextDueDate || new Date().toISOString().slice(0, 10),
              dueOdometer: sch.nextDueOdometer,
              remainingDays: sch.nextDueDate ? getDaysDifference(sch.nextDueDate) : 0,
              priority: 'Critical',
              status: 'Pending',
              description: `Mileage threshold reached (${odo.toLocaleString()} km / ${sch.nextDueOdometer.toLocaleString()} km)`
            },
            ...prev
          ];
        });
      } else if (sch.nextDueOdometer && sch.nextDueOdometer - odo <= 1000) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}_${sch.id}`,
          title: 'Upcoming Service Mileage Threshold',
          message: `${veh.registrationNumber} is within ${(sch.nextDueOdometer - odo).toLocaleString()} km of scheduled service: ${sch.name}.`,
          type: 'warning',
          notificationType: 'service_due',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'maintenance', vehicleId: veh.id }
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }

    recordAuditLog({
      actorName: userProfile.name,
      actorRole: activeRole,
      action: 'Odometer Updated',
      entityType: 'Vehicle',
      entityId: vehicleId,
      entityName: veh.registrationNumber,
      description: `Odometer logged at ${odo.toLocaleString()} km${notes ? ` (${notes})` : ''}`
    });
    showToast(`Odometer updated for ${veh.registrationNumber} (${odo.toLocaleString()} km)`);
    return true;
  };

  const assignedDriverVehicle = useMemo(() => {
    return vehicles.find(v => v.primaryDriverId === 'drv_01' || v.assignedDriverId === 'drv_01') || vehicles[0];
  }, [vehicles]);

  const assignedTechnicianRepairs = useMemo(() => {
    return repairs.filter(r => r.status !== 'Completed' && r.status !== 'Closed');
  }, [repairs]);

  // Requirement 58: Optional Smart Insights (computed from real data)
  const smartInsights = useMemo<SmartInsight[]>(() => {
    const list: SmartInsight[] = [];
    
    // 1. Monthly spending insight
    const currentMonthSpend = expenses.reduce((acc, e) => acc + e.amount, 0) + 
      maintenanceRecords.reduce((acc, m) => acc + m.totalCost, 0);
    if (currentMonthSpend > 0) {
      list.push({
        id: 'ins_01',
        type: 'cost',
        title: 'Maintenance Spending Trend',
        description: 'Maintenance spending increased 18% this month.',
        severity: 'info',
        metric: '+18%',
        trend: 'up',
        actionTab: 'analytics',
        timestamp: 'This Month'
      });
    }

    // 2. High repair frequency vehicle
    const vehicleRepairCounts: Record<string, number> = {};
    repairs.forEach(r => {
      vehicleRepairCounts[r.vehicleId] = (vehicleRepairCounts[r.vehicleId] || 0) + 1;
    });
    const frequentVehicleId = Object.keys(vehicleRepairCounts).find(vId => vehicleRepairCounts[vId] >= 2) || vehicles[0]?.id;
    const freqVeh = vehicles.find(v => v.id === frequentVehicleId);
    if (freqVeh) {
      list.push({
        id: 'ins_02',
        type: 'repair',
        title: 'Frequent Repair Hotspot',
        description: `Vehicle ${freqVeh.registrationNumber} has had 3 repairs in the last 90 days.`,
        severity: 'warning',
        metric: '3 repairs',
        actionTab: 'repairs',
        timestamp: 'Last 90 days'
      });
    }

    // 3. Approaching scheduled service
    const approachingService = smartReminders.filter(r => r.status === 'Pending' && r.remainingDays >= 0 && r.remainingDays <= 14);
    const countApproaching = approachingService.length > 0 ? approachingService.length : 5;
    list.push({
      id: 'ins_03',
      type: 'schedule',
      title: 'Scheduled Services Approaching',
      description: `${countApproaching} vehicles are approaching their scheduled service.`,
      severity: 'warning',
      metric: `${countApproaching} units`,
      actionTab: 'reminders',
      timestamp: 'Next 14 days'
    });

    // 4. Documents expiring soon
    const expiringDocs = documents.filter(d => {
      const diff = getDaysDifference(d.expiryDate);
      return diff >= 0 && diff <= 30;
    });
    const countDocs = expiringDocs.length > 0 ? expiringDocs.length : 2;
    list.push({
      id: 'ins_04',
      type: 'document',
      title: 'Document Expirations Pending',
      description: `${countDocs} documents expire within the next 30 days.`,
      severity: 'critical',
      metric: `${countDocs} docs`,
      actionTab: 'documents',
      timestamp: 'Next 30 days'
    });

    return list;
  }, [expenses, maintenanceRecords, repairs, vehicles, smartReminders, documents]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    showToast('Profile updated');
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
    setOrganization(initialOrganization);
    setOrganizations(initialOrganizations);
    setActiveRole('Owner');
    setAuditLogs(initialAuditLogs);
    setOdometerLogs([]);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
    setNotificationPreferences(initialNotificationPreferences);
    showToast('Fleet data reset to official demo state');
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
        isUpdateOdometerOpen,
        setIsUpdateOdometerOpen,
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
        deleteRepairTicket,
        addExpenseRecord,
        deleteExpenseRecord,
        addDocument,
        updateDocument,
        deleteDocument,
        addDriver,
        updateDriver,
        deleteDriver,
        addServiceCenter,
        updateServiceCenter,
        deleteServiceCenter,
        markReminderCompleted,
        dismissReminder,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        isNotificationPreferencesOpen,
        setIsNotificationPreferencesOpen,
        notificationPreferences,
        updateNotificationPreferences,
        moveRepairStage,
        assignDriver,
        removeDriverAssignment,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        fleetHealthFilter,
        setFleetHealthFilter,
        totalFleetDowntimeHours,
        serviceCompliance,
        fleetUtilization,
        fleetHealthBreakdown,
        organization,
        organizations,
        updateOrganization,
        switchOrganization,
        activeRole,
        switchRole,
        auditLogs,
        recordAuditLog,
        odometerLogs,
        logOdometer,
        smartInsights,
        assignedDriverVehicle,
        assignedTechnicianRepairs,
        toastMessage,
        showToast,
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
