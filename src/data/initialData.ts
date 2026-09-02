import { 
  Vehicle, 
  MaintenanceRecord, 
  ServiceSchedule, 
  RepairTicket, 
  ExpenseRecord, 
  VehicleDocument, 
  Driver, 
  ServiceCenter, 
  UserProfile,
  ActivityItem,
  NotificationItem,
  SmartReminder,
  NotificationPreferences,
  Organization,
  AuditLogEntry
} from '../types';

export const initialProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'Fleet Manager',
  operationalRole: 'Owner',
  fleetSizeBracket: '1',
  currency: '₹',
  distanceUnit: 'km',
  dateFormat: 'DD/MM/YYYY',
  language: 'English (India)',
  organizationName: '',
  organizationId: '',
  phone: '',
  avatarUrl: '',
  isOnboarded: false
};

export const initialDrivers: Driver[] = [];
export const initialServiceCenters: ServiceCenter[] = [];
export const initialVehicles: Vehicle[] = [];
export const initialMaintenanceRecords: MaintenanceRecord[] = [];
export const initialServiceSchedules: ServiceSchedule[] = [];
export const initialSmartReminders: SmartReminder[] = [];
export const initialRepairs: RepairTicket[] = [];
export const initialExpenses: ExpenseRecord[] = [];
export const initialDocuments: VehicleDocument[] = [];
export const initialActivities: ActivityItem[] = [];
export const initialNotifications: NotificationItem[] = [];

export const initialNotificationPreferences: NotificationPreferences = {
  inAppNotifications: true,
  emailNotifications: true,
  emailAddress: '',
  browserPushNotifications: false,
  pushPermission: 'default',
  notify30DaysBefore: true,
  notify15DaysBefore: true,
  notify7DaysBefore: true,
  notify1DayBefore: true,
  notifyOnExpiry: true,
  criticalAlertsImmediate: true
};

export const initialOrganization: Organization = {
  id: '',
  name: '',
  logoUrl: '',
  address: '',
  city: '',
  contactPhone: '',
  contactEmail: '',
  taxId: '',
  plan: 'Starter',
  createdAt: new Date().toISOString()
};

export const initialOrganizations: Organization[] = [];
export const initialAuditLogs: AuditLogEntry[] = [];
