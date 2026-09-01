// Vehicle & Fleet Maintenance Management Platform Types - Part 1 & Part 2

export type VehicleStatus = 
  | 'Active' 
  | 'Due for Service' 
  | 'Overdue' 
  | 'Under Maintenance' 
  | 'Under Repair' 
  | 'Inactive' 
  | 'Sold';

export type VehicleType = 
  | 'Sedan' 
  | 'SUV' 
  | 'Hatchback' 
  | 'Pickup Truck' 
  | 'Heavy Commercial Truck' 
  | 'Van' 
  | 'Bus' 
  | 'Motorcycle' 
  | 'EV / Hybrid';

export type FuelType = 
  | 'Petrol' 
  | 'Diesel' 
  | 'Electric' 
  | 'Hybrid' 
  | 'CNG' 
  | 'LPG';

export type TransmissionType = 
  | 'Manual' 
  | 'Automatic' 
  | 'Automated Manual (AMT)' 
  | 'CVT' 
  | 'Dual-Clutch (DCT)';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type MaintenanceCategory =
  | 'Engine Oil'
  | 'Oil Filter'
  | 'Air Filter'
  | 'Fuel Filter'
  | 'Brake Service'
  | 'Brake Pad Replacement'
  | 'Tyre Rotation'
  | 'Tyre Replacement'
  | 'Battery'
  | 'AC Service'
  | 'Coolant'
  | 'Transmission'
  | 'Suspension'
  | 'Wheel Alignment'
  | 'General Service'
  | 'Inspection'
  | 'Other';

export interface DriverAssignmentHistory {
  id: string;
  driverId: string;
  driverName: string;
  role: 'Primary' | 'Backup';
  assignedDate: string;
  unassignedDate?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g. "TN 01 AB 1234"
  name: string; // e.g. "Tata Prima Hauler #04"
  type: VehicleType;
  manufacturer: string; // e.g. "Tata Motors", "Toyota", "Ford"
  model: string; // e.g. "Prima 5530.S", "Innova Hycross"
  variant?: string;
  year: number;
  purchaseDate: string;
  purchasePrice: number;
  
  // Identification
  vin: string; // Chassis number
  engineNumber: string;

  // Usage
  currentOdometer: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  seatingCapacity: number;
  averageDailyKm?: number; // Used for smart reminder projection

  // Fleet & Assignment
  department?: string; // e.g. "Logistics", "Executive", "Field Ops"
  location?: string; // e.g. "Chennai Hub", "Bangalore Depot"
  assignedDriverId?: string; // Legacy / Primary
  primaryDriverId?: string;
  backupDriverId?: string;
  driverHistory?: DriverAssignmentHistory[];
  
  // Calculated / Dynamic Status
  status: VehicleStatus;
  healthScore: number; // 0 - 100
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: MaintenanceCategory;
  category?: MaintenanceCategory;
  title: string;
  serviceDate: string;
  odometer: number;
  serviceCenterId?: string;
  serviceCenterName: string;
  technicianName?: string;
  partsReplaced: string[];
  labourCost: number;
  laborCost?: number;
  partsCost: number;
  tax: number;
  totalCost: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  notes?: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  createdAt: string;
}

export interface ServiceSchedule {
  id: string;
  vehicleId: string;
  serviceCategory: MaintenanceCategory;
  name: string; // e.g. "Engine Oil & Filter Service"
  intervalMonths?: number; // e.g. every 6 months
  intervalKm?: number; // e.g. every 10,000 km
  lastPerformedDate?: string;
  lastPerformedOdometer?: number;
  nextDueDate: string;
  nextDueOdometer: number;
  priority: PriorityLevel;
  isActive: boolean;
  notes?: string;
}

export interface SmartReminder {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  title: string;
  category: MaintenanceCategory | 'Document Expiry' | 'Inspection' | 'Custom';
  dueDate: string;
  dueOdometer?: number;
  remainingDays: number;
  remainingKm?: number;
  priority: PriorityLevel;
  status: 'Pending' | 'Completed' | 'Dismissed';
  scheduleId?: string;
  documentId?: string;
  description: string;
}

// Requirement 22: 7-stage repair lifecycle
export type RepairStatus = 
  | 'Reported' 
  | 'Inspection' 
  | 'Estimate' 
  | 'Approval' 
  | 'Repair In Progress' 
  | 'Completed' 
  | 'Closed';

// Requirement 23: Severity Minor, Moderate, Major, Critical
export type RepairSeverity = 'Minor' | 'Moderate' | 'Major' | 'Critical';

// Requirement 23 & 24 & 25 & 35: Full repair record with cost tracking & downtime
export interface RepairTicket {
  id: string; // Repair ID e.g. "REP-2026-081"
  vehicleId: string;
  issueTitle: string;
  issueCategory?: string; // Engine, Brakes, Transmission, Electrical, Suspension, AC/HVAC, Tyres, Body, Other
  description: string;
  severity: RepairSeverity;
  status: RepairStatus;
  reportedDate: string;
  reportedBy: string;
  odometer?: number;
  assignedServiceCenter?: string;
  technicianName?: string;
  
  // Cost Tracking (Requirement 25)
  estimatedCost?: number;
  approvedCost?: number;
  actualCost?: number;
  costVariance?: number; // actual - approved
  isUnusualVariance?: boolean; // true if actual exceeds approved by > 10% or > 1000

  // Schedule & Dates (Requirement 24)
  startDate?: string;
  expectedCompletion?: string;
  actualCompletion?: string;
  
  // Downtime Tracking (Requirement 35)
  downtimeStart?: string; // ISO datetime or date
  downtimeEnd?: string; // ISO datetime or date
  downtimeHours?: number; // Calculated hours
  downtimeFormatted?: string; // e.g. "3 days 7 hours"
  downtimeDays?: number;

  partsUsed?: string[];
  photos?: string[]; // Requirement 23 photos
  notes?: string;
  attachments?: string[]; // Requirement 24
  resolutionNotes?: string;
}

// Requirement 26: 12 Exact Categories
export type ExpenseCategory = 
  | 'Maintenance' 
  | 'Repairs' 
  | 'Tyres' 
  | 'Battery' 
  | 'Fuel' 
  | 'Insurance' 
  | 'PUC' 
  | 'Permit' 
  | 'Spare Parts' 
  | 'Washing' 
  | 'Towing' 
  | 'Other';

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'UPI' 
  | 'Net Banking' 
  | 'Fleet Card';

export interface ExpenseRecord {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  description?: string;
  invoiceFileName?: string;
  invoiceUrl?: string;
  odometer?: number;
  litersFuel?: number; // for fuel logs
  fuelRatePerLiter?: number;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

// Requirement 28: 9 Exact Document Types
export type DocumentType = 
  | 'Registration Certificate' 
  | 'Insurance' 
  | 'PUC' 
  | 'Fitness Certificate' 
  | 'Permit' 
  | 'Tax Receipt' 
  | 'Service Invoice' 
  | 'Repair Invoice' 
  | 'Other';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentName: string; // Requirement 28
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  uploadedDate: string; // Requirement 28
  issuingAuthority?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileUrl?: string;
  fileName?: string;
  notes?: string;
}

// Requirement 30: Driver fields
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  assignedVehicleId?: string;
  joiningDate?: string; // Requirement 30
  status: 'Active' | 'On Leave' | 'Inactive'; // Requirement 30
  emergencyContact?: string; // Requirement 30
  experienceYears?: number;
  avatarUrl?: string;
}

// Requirement 32: Service Center fields
export interface ServiceCenter {
  id: string;
  name: string;
  contactPerson: string;
  address: string;
  city?: string;
  phone: string;
  email: string;
  servicesOffered: string[]; // Requirement 32
  specialties?: string[];
  rating: number; // 1-5 stars
  notes?: string;
  isAuthorized?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Individual Vehicle Owner' | 'Business Owner' | 'Fleet Manager' | 'Transport Company';
  fleetSizeBracket: '1' | '2–5' | '6–20' | '21–50' | '50+';
  currency: string;
  distanceUnit: 'km' | 'miles';
  organizationName?: string;
  phone?: string;
  avatarUrl?: string;
  isOnboarded: boolean;
}

// Requirement 21 & 40: Notification Preferences & Types
export type NotificationType = 
  | 'Service due' 
  | 'Service overdue' 
  | 'Insurance expiry' 
  | 'PUC expiry' 
  | 'Repair completed' 
  | 'Repair delayed' 
  | 'New expense' 
  | 'Driver license expiry' 
  | 'Document expiry'
  | 'service_due' 
  | 'service_overdue' 
  | 'insurance_expiry' 
  | 'puc_expiry' 
  | 'repair_completed' 
  | 'repair_delayed' 
  | 'new_expense' 
  | 'driver_license_expiry' 
  | 'document_expiry';

export interface NotificationPreferences {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  emailAddress: string;
  browserPushNotifications: boolean;
  pushPermission: 'default' | 'granted' | 'denied';
  notify30DaysBefore: boolean;
  notify15DaysBefore: boolean;
  notify7DaysBefore: boolean;
  notify1DayBefore: boolean;
  notifyOnExpiry: boolean;
  criticalAlertsImmediate: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  notificationType?: NotificationType;
  category?: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkTo?: {
    tab: string;
    vehicleId?: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'service' | 'repair' | 'expense' | 'vehicle' | 'document' | 'reminder';
  title: string;
  description: string;
  vehicleReg: string;
  vehicleName: string;
  timestamp: string;
  cost?: number;
  status?: string;
}

export type ActivityCategory = "all" | "service" | "repair" | "expense" | "vehicle" | "document";

export interface FleetBenchmarkKPIs {
  averageDowntimeDays: number;
  preventativeRatio: number;
  averageFleetAge: number;
  costPerOperatingDay: number;
}

export interface MaintenanceRuleTemplate {
  name: string;
  defaultIntervalMonths: number;
  defaultIntervalKm: number;
  category: MaintenanceCategory;
}
