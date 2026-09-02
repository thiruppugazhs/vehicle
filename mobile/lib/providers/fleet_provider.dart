import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/supabase_service.dart';

class FleetProvider extends ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();

  bool _isLoading = false;
  bool _isOffline = false;

  List<VehicleModel> _vehicles = [];
  List<RepairTicketModel> _repairs = [];
  List<MaintenanceRecordModel> _maintenance = [];
  List<ExpenseModel> _expenses = [];
  List<VehicleDocumentModel> _documents = [];
  List<NotificationModel> _notifications = [];

  bool get isLoading => _isLoading;
  bool get isOffline => _isOffline;

  List<VehicleModel> get vehicles => _vehicles;
  List<RepairTicketModel> get repairs => _repairs;
  List<MaintenanceRecordModel> get maintenance => _maintenance;
  List<ExpenseModel> get expenses => _expenses;
  List<VehicleDocumentModel> get documents => _documents;
  List<NotificationModel> get notifications => _notifications;

  // Computed KPIs
  int get totalVehicles => _vehicles.length;
  int get dueServices => _vehicles.where((v) => v.status == 'Due for Service').length;
  int get overdueServices => _vehicles.where((v) => v.status == 'Overdue').length;
  int get underRepair => _vehicles.where((v) => v.status == 'Under Repair').length;
  int get activeVehicles => _vehicles.where((v) => v.status == 'Active').length;

  int get averageHealthScore {
    if (_vehicles.isEmpty) return 100;
    final total = _vehicles.fold<int>(0, (sum, v) => sum + v.healthScore);
    return (total / _vehicles.length).round();
  }

  Future<void> loadFleetData(String orgId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _vehicles = await _supabaseService.fetchVehicles(orgId);
      _repairs = await _supabaseService.fetchRepairs(orgId);
      _maintenance = await _supabaseService.fetchMaintenance(orgId);
      _expenses = await _supabaseService.fetchExpenses(orgId);
      _documents = await _supabaseService.fetchDocuments(orgId);
      _notifications = await _supabaseService.fetchNotifications();
      _isOffline = false;
    } catch (_) {
      _isOffline = true;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ---------------------------------------------------------------------------
  // Quick Actions (Requirement 57, 78)
  // ---------------------------------------------------------------------------
  Future<void> addVehicle(VehicleModel vehicle) async {
    final newV = await _supabaseService.addVehicle(vehicle);
    _vehicles.insert(0, newV);
    notifyListeners();
  }

  Future<bool> updateOdometer(String vehicleId, int newOdo, String reason) async {
    final success = await _supabaseService.updateOdometer(vehicleId, newOdo, reason);
    if (success) {
      final idx = _vehicles.indexWhere((v) => v.id == vehicleId);
      if (idx != -1) {
        _vehicles[idx] = _vehicles[idx].copyWith(currentOdometer: newOdo);
        notifyListeners();
      }
    }
    return success;
  }

  Future<void> reportIssue(RepairTicketModel ticket) async {
    final created = await _supabaseService.reportRepair(ticket);
    _repairs.insert(0, created);
    // Vehicle status changes to Under Repair
    final idx = _vehicles.indexWhere((v) => v.id == ticket.vehicleId);
    if (idx != -1) {
      _vehicles[idx] = _vehicles[idx].copyWith(status: 'Under Repair');
    }
    notifyListeners();
  }

  Future<void> advanceRepairStage(String ticketId, String nextStage, {double? cost}) async {
    await _supabaseService.updateRepairStage(ticketId, nextStage, cost: cost);
    final idx = _repairs.indexWhere((r) => r.id == ticketId);
    if (idx != -1) {
      _repairs[idx] = _repairs[idx].copyWith(
        status: nextStage,
        actualCost: cost ?? _repairs[idx].actualCost,
      );
      if (nextStage == 'Completed' || nextStage == 'Closed') {
        final vIdx = _vehicles.indexWhere((v) => v.id == _repairs[idx].vehicleId);
        if (vIdx != -1) {
          _vehicles[vIdx] = _vehicles[vIdx].copyWith(status: 'Active');
        }
      }
      notifyListeners();
    }
  }

  Future<void> recordService(MaintenanceRecordModel record) async {
    final saved = await _supabaseService.recordService(record);
    _maintenance.insert(0, saved);
    final vIdx = _vehicles.indexWhere((v) => v.id == record.vehicleId);
    if (vIdx != -1) {
      _vehicles[vIdx] = _vehicles[vIdx].copyWith(
        status: 'Active',
        healthScore: 95,
      );
    }
    notifyListeners();
  }

  Future<void> addExpense(ExpenseModel expense) async {
    final saved = await _supabaseService.addExpense(expense);
    _expenses.insert(0, saved);
    notifyListeners();
  }

  Future<void> uploadDocument(VehicleDocumentModel doc) async {
    final saved = await _supabaseService.uploadDocument(doc);
    _documents.insert(0, saved);
    notifyListeners();
  }
}
