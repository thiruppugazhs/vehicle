// Vehicle & Fleet Maintenance Management Platform Types

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
  assignedDriverId?: string;
  
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
  title: string;
  serviceDate: string;
  odometer: number;
  serviceCenterId?: string;
  serviceCenterName: string;
  technicianName?: string;
  partsReplaced: string[];
  labourCost: number;
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

export type RepairStatus = 'Reported' | 'Diagnosing' | 'In Repair' | 'Quality Check' | 'Resolved';

export interface RepairTicket {
  id: string;
  vehicleId: string;
  issueTitle: string;
  description: string;
  severity: PriorityLevel;
  status: RepairStatus;
  reportedDate: string;
  reportedBy: string;
  assignedServiceCenter?: string;
  estimatedCompletionDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  partsUsed?: string[];
  downtimeDays?: number;
  resolutionNotes?: string;
}

export type ExpenseCategory = 
  | 'Fuel' 
  | 'Maintenance' 
  | 'Repair' 
  | 'Insurance' 
  | 'PUC / Inspection' 
  | 'Toll & Taxes' 
  | 'Permit' 
  | 'Cleaning / Detailing' 
  | 'Other';

export interface ExpenseRecord {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  odometer?: number;
  litersFuel?: number; // for fuel logs
  fuelRatePerLiter?: number;
  vendor?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export type DocumentType = 
  | 'Registration Certificate (RC)' 
  | 'Insurance Policy' 
  | 'PUC / Emission Certificate' 
  | 'Fitness Certificate' 
  | 'Commercial Permit' 
  | 'Road Tax Receipt' 
  | 'Other';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileUrl?: string;
  fileName?: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  assignedVehicleId?: string;
  experienceYears: number;
  avatarUrl?: string;
  emergencyContact?: string;
}

export interface ServiceCenter {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  rating: number;
  specialties: string[];
  isAuthorized: boolean;
  notes?: string;
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

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
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
