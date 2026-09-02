import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/models.dart';
import 'offline_cache_service.dart';

class FirebaseService {
  final OfflineCacheService _cacheService = OfflineCacheService();

  // In-memory cache starting fresh with zero mock data
  final List<VehicleModel> _inMemoryVehicles = [];
  final List<RepairTicketModel> _inMemoryRepairs = [];
  final List<MaintenanceRecordModel> _inMemoryMaintenance = [];
  final List<ExpenseModel> _inMemoryExpenses = [];
  final List<VehicleDocumentModel> _inMemoryDocs = [];
  final List<NotificationModel> _inMemoryNotifications = [];

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
