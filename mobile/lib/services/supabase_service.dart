import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/models.dart';
import 'offline_cache_service.dart';

class SupabaseService {
  static const String supabaseUrl = 'https://epnkoxnepauxkluqewib.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbmtveG5lcGF1eGtsdXFld2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczOTU2NTEsImV4cCI6MjEwMjk3MTY1MX0.bnYLqzTFPrtoQjJjq4tRh2-ETfPymWJR32JBWNJVtnE';

  final OfflineCacheService _cacheService = OfflineCacheService();

  Map<String, String> get _headers => {
        'apikey': anonKey,
        'Authorization': 'Bearer $anonKey',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

  // ---------------------------------------------------------------------------
  // Vehicles
  // ---------------------------------------------------------------------------
  Future<List<VehicleModel>> fetchVehicles(String orgId) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/vehicles?select=*&order=created_at.desc');
      final res = await http.get(url, headers: _headers).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        final vehicles = list.map((item) {
          return VehicleModel(
            id: item['id'] ?? '',
            registrationNumber: item['registration_number'] ?? '',
            name: item['name'] ?? '',
            type: item['type'] ?? 'Truck',
            manufacturer: item['manufacturer'] ?? '',
            model: item['model'] ?? '',
            variant: item['variant'] ?? '',
            year: item['year'] is int ? item['year'] : int.tryParse('${item['year']}') ?? 2023,
            currentOdometer: item['current_odometer'] is int
                ? item['current_odometer']
                : int.tryParse('${item['current_odometer']}') ?? 0,
            healthScore: item['health_score'] is int
                ? item['health_score']
                : int.tryParse('${item['health_score']}') ?? 100,
            status: item['status'] ?? 'Active',
            fuelType: item['fuel_type'] ?? 'Diesel',
            transmission: item['transmission'] ?? 'Manual',
            organizationId: item['organization_id'] ?? 'a0000000-0000-0000-0000-000000000001',
            imageUrl: item['image_url'],
          );
        }).toList();

        await _cacheService.cacheVehicles(vehicles);
        return vehicles;
      }
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] Fallback to cache: $e');
    }
    return await _cacheService.getCachedVehicles();
  }

  Future<VehicleModel> addVehicle(VehicleModel vehicle) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/vehicles');
      final body = jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'registration_number': vehicle.registrationNumber,
        'name': vehicle.name,
        'type': vehicle.type,
        'manufacturer': vehicle.manufacturer,
        'model': vehicle.model,
        'variant': vehicle.variant,
        'year': vehicle.year,
        'current_odometer': vehicle.currentOdometer,
        'status': vehicle.status,
        'fuel_type': vehicle.fuelType,
        'transmission': vehicle.transmission,
        'health_score': vehicle.healthScore,
      });

      final res = await http.post(url, headers: _headers, body: body);
      if (res.statusCode == 201 || res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        if (list.isNotEmpty) {
          final item = list.first;
          return vehicle.copyWith(id: item['id'] ?? vehicle.id);
        }
      }
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] addVehicle error: $e');
    }
    return vehicle;
  }

  Future<bool> updateOdometer(String vehicleId, int newOdo, String reason) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/vehicles?id=eq.$vehicleId');
      final body = jsonEncode({'current_odometer': newOdo});
      final res = await http.patch(url, headers: _headers, body: body);

      // Log into odometer audit table
      final logUrl = Uri.parse('$supabaseUrl/rest/v1/vehicle_odometer_logs');
      await http.post(
        logUrl,
        headers: _headers,
        body: jsonEncode({
          'organization_id': 'a0000000-0000-0000-0000-000000000001',
          'vehicle_id': vehicleId,
          'odometer_value': newOdo,
          'notes': reason.isNotEmpty ? reason : 'Routine reading update',
        }),
      );

      return res.statusCode == 200 || res.statusCode == 204;
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] updateOdometer error: $e');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Repairs
  // ---------------------------------------------------------------------------
  Future<List<RepairTicketModel>> fetchRepairs(String orgId) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/repair_tickets?select=*&order=reported_date.desc');
      final res = await http.get(url, headers: _headers).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) {
          return RepairTicketModel(
            id: item['id'] ?? '',
            vehicleId: item['vehicle_id'] ?? '',
            vehicleReg: item['vehicle_reg'] ?? '',
            issueTitle: item['issue_title'] ?? '',
            issueCategory: item['issue_category'] ?? 'General',
            description: item['description'] ?? '',
            severity: item['severity'] ?? 'Moderate',
            status: item['status'] ?? 'Reported',
            reportedDate: item['reported_date'] ?? '',
            estimatedCost: double.tryParse('${item['estimated_cost']}') ?? 0.0,
            actualCost: double.tryParse('${item['actual_cost']}') ?? 0.0,
            downtimeHours: int.tryParse('${item['downtime_hours']}') ?? 0,
            assignedTechnician: item['assigned_technician'],
            organizationId: item['organization_id'] ?? 'a0000000-0000-0000-0000-000000000001',
          );
        }).toList();
      }
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] fetchRepairs error: $e');
    }
    return [];
  }

  Future<RepairTicketModel> reportRepair(RepairTicketModel ticket) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/repair_tickets');
      final body = jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'vehicle_id': ticket.vehicleId,
        'vehicle_reg': ticket.vehicleReg,
        'issue_title': ticket.issueTitle,
        'issue_category': ticket.issueCategory,
        'description': ticket.description,
        'severity': ticket.severity,
        'status': 'Reported',
        'estimated_cost': ticket.estimatedCost,
      });
      await http.post(url, headers: _headers, body: body);

      // Set vehicle status to 'Under Repair' in Supabase
      final vUrl = Uri.parse('$supabaseUrl/rest/v1/vehicles?id=eq.${ticket.vehicleId}');
      await http.patch(vUrl, headers: _headers, body: jsonEncode({'status': 'Under Repair'}));
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] reportRepair error: $e');
    }
    return ticket;
  }

  Future<void> updateRepairStage(String ticketId, String newStage, {double? cost}) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/repair_tickets?id=eq.$ticketId');
      final updateData = <String, dynamic>{'status': newStage};
      if (cost != null) updateData['actual_cost'] = cost;
      await http.patch(url, headers: _headers, body: jsonEncode(updateData));
    } catch (e) {
      if (kDebugMode) print('[SupabaseService] updateRepairStage error: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // Maintenance, Expenses & Documents
  // ---------------------------------------------------------------------------
  Future<List<MaintenanceRecordModel>> fetchMaintenance(String orgId) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/maintenance_records?select=*&order=service_date.desc');
      final res = await http.get(url, headers: _headers);
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) => MaintenanceRecordModel.fromJson(item, item['id'] ?? '')).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<MaintenanceRecordModel> recordService(MaintenanceRecordModel record) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/maintenance_records');
      await http.post(url, headers: _headers, body: jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'vehicle_id': record.vehicleId,
        'vehicle_reg': record.vehicleReg,
        'title': record.title,
        'service_type': record.serviceType,
        'service_date': record.serviceDate,
        'odometer_reading': record.odometerReading,
        'total_cost': record.totalCost,
        'service_center_name': record.serviceCenterName,
        'technician': record.technician,
        'next_due_date': record.nextDueDate,
        'next_due_odometer': record.nextDueOdometer,
      }));
    } catch (_) {}
    return record;
  }

  Future<List<ExpenseModel>> fetchExpenses(String orgId) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/expenses?select=*&order=date.desc');
      final res = await http.get(url, headers: _headers);
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) => ExpenseModel.fromJson(item, item['id'] ?? '')).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<ExpenseModel> addExpense(ExpenseModel expense) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/expenses');
      await http.post(url, headers: _headers, body: jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'vehicle_id': expense.vehicleId,
        'category': expense.category,
        'amount': expense.amount,
        'date': expense.date,
        'vendor': expense.vendor,
        'notes': expense.notes,
      }));
    } catch (_) {}
    return expense;
  }

  Future<List<VehicleDocumentModel>> fetchDocuments(String orgId) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/vehicle_documents?select=*&order=expiry_date.asc');
      final res = await http.get(url, headers: _headers);
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) => VehicleDocumentModel.fromJson(item, item['id'] ?? '')).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<VehicleDocumentModel> uploadDocument(VehicleDocumentModel doc) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/vehicle_documents');
      await http.post(url, headers: _headers, body: jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'vehicle_id': doc.vehicleId,
        'document_type': doc.documentType,
        'document_number': doc.documentNumber,
        'issue_date': doc.issueDate,
        'expiry_date': doc.expiryDate,
        'status': doc.status,
      }));
    } catch (_) {}
    return doc;
  }

  Future<void> registerDeviceToken(String userId, String token, String platform) async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/fleet_device_tokens');
      await http.post(url, headers: _headers, body: jsonEncode({
        'organization_id': 'a0000000-0000-0000-0000-000000000001',
        'user_id': userId,
        'platform': platform,
        'fcm_token': token,
        'active': true,
      }));
    } catch (_) {}
  }

  Future<List<NotificationModel>> fetchNotifications() async {
    try {
      final url = Uri.parse('$supabaseUrl/rest/v1/fleet_notifications?select=*&order=created_at.desc');
      final res = await http.get(url, headers: _headers);
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        if (list.isNotEmpty) {
          return list.map((item) => NotificationModel.fromJson(item, item['id'] ?? '')).toList();
        }
      }
    } catch (_) {}

    return [
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
        title: 'Document Expiring',
        message: 'Pollution certificate for TN 01 AB 1234 expires in 5 days.',
        type: 'warning',
        timestamp: '1 hour ago',
        linkTo: {'screen': 'documents', 'vehicleId': 'veh_01'},
      ),
    ];
  }
}
