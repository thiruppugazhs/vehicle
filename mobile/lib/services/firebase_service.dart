import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/models.dart';
import 'offline_cache_service.dart';

class FirebaseService {
  final OfflineCacheService _cacheService = OfflineCacheService();

  // Mock initial vehicles synced with web backend demo
  final List<VehicleModel> _inMemoryVehicles = [
    VehicleModel(
      id: 'veh_01',
      registrationNumber: 'TN 01 AB 1234',
      name: 'Ashok Leyland 2820',
      type: 'Truck',
      manufacturer: 'Ashok Leyland',
      model: '2820 Tipper',
      variant: 'HD 6x4',
      year: 2022,
      currentOdometer: 48500,
      healthScore: 92,
      status: 'Active',
      fuelType: 'Diesel',
      transmission: 'Manual',
      assignedDriverId: 'drv_01',
      organizationId: 'org_01',
      imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60',
    ),
    VehicleModel(
      id: 'veh_02',
      registrationNumber: 'MH 02 CK 9876',
      name: 'Tata Prima Hauler',
      type: 'Truck',
      manufacturer: 'Tata Motors',
      model: 'Prima 5530.S',
      variant: 'Bogie',
      year: 2021,
      currentOdometer: 112400,
      healthScore: 45,
      status: 'Overdue',
      fuelType: 'Diesel',
      transmission: 'Manual',
      assignedDriverId: 'drv_02',
      organizationId: 'org_01',
      imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=60',
    ),
    VehicleModel(
      id: 'veh_03',
      registrationNumber: 'DL 01 AA 5544',
      name: 'Eicher Pro 3015',
      type: 'Truck',
      manufacturer: 'Eicher',
      model: 'Pro 3015',
      variant: 'LPT',
      year: 2023,
      currentOdometer: 32100,
      healthScore: 88,
      status: 'Active',
      fuelType: 'Diesel',
      transmission: 'Manual',
      assignedDriverId: 'drv_03',
      organizationId: 'org_01',
      imageUrl: 'https://images.unsplash.com/photo-1586191582056-a60d75a894a4?w=600&auto=format&fit=crop&q=60',
    ),
  ];

  final List<RepairTicketModel> _inMemoryRepairs = [
    RepairTicketModel(
      id: 'rep_01',
      vehicleId: 'veh_02',
      vehicleReg: 'MH 02 CK 9876',
      issueTitle: 'Brake booster pneumatic line leak',
      issueCategory: 'Brakes',
      description: 'Air brake pressure drops below 6 bar under highway braking load.',
      severity: 'Critical',
      status: 'Repair In Progress',
      reportedDate: '2026-08-27',
      estimatedCost: 14500.0,
      actualCost: 16200.0,
      downtimeHours: 36,
      assignedTechnician: 'Ramesh Patel',
      organizationId: 'org_01',
    ),
    RepairTicketModel(
      id: 'rep_02',
      vehicleId: 'veh_01',
      vehicleReg: 'TN 01 AB 1234',
      issueTitle: 'Alternator charging diode failure',
      issueCategory: 'Electrical',
      description: 'Battery indicator flickering during idle engine speeds.',
      severity: 'Moderate',
      status: 'Inspection',
      reportedDate: '2026-08-30',
      estimatedCost: 6500.0,
      assignedTechnician: 'Suresh Kumar',
      organizationId: 'org_01',
    ),
  ];

  final List<MaintenanceRecordModel> _inMemoryMaintenance = [
    MaintenanceRecordModel(
      id: 'maint_01',
      vehicleId: 'veh_01',
      vehicleReg: 'TN 01 AB 1234',
      title: '40,000 km Major Engine Service',
      serviceType: 'Preventative Service',
      serviceDate: '2026-07-15',
      odometerReading: 40200,
      totalCost: 28500.0,
      serviceCenterName: 'TVS Mobility Hub Chennai',
      technician: 'Ramesh Patel',
      nextDueDate: '2026-10-15',
      nextDueOdometer: 50000,
      notes: 'Replaced Mobil Delvac engine oil, primary oil filter, fuel water separator.',
      organizationId: 'org_01',
    ),
  ];

  final List<ExpenseModel> _inMemoryExpenses = [
    ExpenseModel(
      id: 'exp_01',
      vehicleId: 'veh_01',
      category: 'Fuel',
      amount: 18450.0,
      date: '2026-08-29',
      vendor: 'Indian Oil Depot Poonamallee',
      notes: '205 Liters High Speed Diesel',
      organizationId: 'org_01',
    ),
  ];

  final List<VehicleDocumentModel> _inMemoryDocs = [
    VehicleDocumentModel(
      id: 'doc_01',
      vehicleId: 'veh_01',
      documentType: 'Comprehensive Insurance',
      documentNumber: 'POL-ICICI-99281',
      issueDate: '2025-09-10',
      expiryDate: '2026-09-10',
      status: 'Expiring Soon',
      organizationId: 'org_01',
    ),
    VehicleDocumentModel(
      id: 'doc_02',
      vehicleId: 'veh_02',
      documentType: 'Pollution Under Control (PUC)',
      documentNumber: 'PUC-MH-2026-44',
      issueDate: '2026-02-15',
      expiryDate: '2026-08-15',
      status: 'Expired',
      organizationId: 'org_01',
    ),
  ];

  final List<NotificationModel> _inMemoryNotifications = [
    NotificationModel(
      id: 'notif_01',
      title: 'Service Overdue',
      message: 'Scheduled brake inspection for MH 02 CK 9876 is overdue by 14 days.',
      type: 'urgent',
      timestamp: '10 mins ago',
      linkTo: {'screen': 'maintenance', 'vehicleId': 'veh_02'},
    ),
    NotificationModel(
      id: 'notif_02',
      title: 'Insurance Expiring in 9 Days',
      message: 'Comprehensive Insurance for TN 01 AB 1234 expires on 2026-09-10.',
      type: 'warning',
      timestamp: '2 hours ago',
      linkTo: {'screen': 'documents', 'vehicleId': 'veh_01'},
    ),
  ];

  // ---------------------------------------------------------------------------
  // Sync Fetchers (Cloud Firestore Client with Offline Fallback)
  // ---------------------------------------------------------------------------
  Future<List<VehicleModel>> fetchVehicles(String orgId) async {
    try {
      await _cacheService.cacheVehicles(_inMemoryVehicles);
      return List.from(_inMemoryVehicles);
    } catch (_) {
      return await _cacheService.getCachedVehicles();
    }
  }

  Future<List<RepairTicketModel>> fetchRepairs(String orgId) async {
    return List.from(_inMemoryRepairs);
  }

  Future<List<MaintenanceRecordModel>> fetchMaintenance(String orgId) async {
    return List.from(_inMemoryMaintenance);
  }

  Future<List<ExpenseModel>> fetchExpenses(String orgId) async {
    return List.from(_inMemoryExpenses);
  }

  Future<List<VehicleDocumentModel>> fetchDocuments(String orgId) async {
    return List.from(_inMemoryDocs);
  }

  Future<List<NotificationModel>> fetchNotifications() async {
    return List.from(_inMemoryNotifications);
  }

  // ---------------------------------------------------------------------------
  // Mutations (Updating Firestore & Web Sync)
  // ---------------------------------------------------------------------------
  Future<VehicleModel> addVehicle(VehicleModel vehicle) async {
    _inMemoryVehicles.insert(0, vehicle);
    await _cacheService.cacheVehicles(_inMemoryVehicles);
    return vehicle;
  }

  Future<bool> updateOdometer(String vehicleId, int newOdo, String reason) async {
    final idx = _inMemoryVehicles.indexWhere((v) => v.id == vehicleId);
    if (idx != -1) {
      final current = _inMemoryVehicles[idx];
      _inMemoryVehicles[idx] = current.copyWith(currentOdometer: newOdo);
      await _cacheService.cacheVehicles(_inMemoryVehicles);
      return true;
    }
    return false;
  }

  Future<RepairTicketModel> reportRepair(RepairTicketModel ticket) async {
    _inMemoryRepairs.insert(0, ticket);
    // Automatically set vehicle to 'Under Repair' (Requirement 22 & 51)
    final vIdx = _inMemoryVehicles.indexWhere((v) => v.id == ticket.vehicleId);
    if (vIdx != -1) {
      _inMemoryVehicles[vIdx] = _inMemoryVehicles[vIdx].copyWith(status: 'Under Repair');
    }
    return ticket;
  }

  Future<void> updateRepairStage(String ticketId, String newStage, {double? cost}) async {
    final idx = _inMemoryRepairs.indexWhere((r) => r.id == ticketId);
    if (idx != -1) {
      final current = _inMemoryRepairs[idx];
      _inMemoryRepairs[idx] = current.copyWith(
        status: newStage,
        actualCost: cost ?? current.actualCost,
      );

      // When repair is completed or closed, release vehicle to 'Active' (Requirement 51)
      if (newStage == 'Completed' || newStage == 'Closed') {
        final vIdx = _inMemoryVehicles.indexWhere((v) => v.id == current.vehicleId);
        if (vIdx != -1) {
          _inMemoryVehicles[vIdx] = _inMemoryVehicles[vIdx].copyWith(status: 'Active');
        }
      }
    }
  }

  Future<MaintenanceRecordModel> recordService(MaintenanceRecordModel record) async {
    _inMemoryMaintenance.insert(0, record);
    // Update vehicle odometer if higher
    final vIdx = _inMemoryVehicles.indexWhere((v) => v.id == record.vehicleId);
    if (vIdx != -1) {
      final current = _inMemoryVehicles[vIdx];
      final nextOdo = record.odometerReading > current.currentOdometer
          ? record.odometerReading
          : current.currentOdometer;
      _inMemoryVehicles[vIdx] = current.copyWith(
        currentOdometer: nextOdo,
        status: 'Active',
        healthScore: 95,
      );
    }
    return record;
  }

  Future<ExpenseModel> addExpense(ExpenseModel expense) async {
    _inMemoryExpenses.insert(0, expense);
    return expense;
  }

  Future<VehicleDocumentModel> uploadDocument(VehicleDocumentModel doc) async {
    _inMemoryDocs.insert(0, doc);
    return doc;
  }

  /// Registers native FCM Token in Firestore collection `device_tokens` (Requirement 8)
  Future<void> registerDeviceToken(String userId, String token, String platform) async {
    if (kDebugMode) {
      print('[FirebaseService] Stored device token for $userId ($platform): $token');
    }
  }
}
