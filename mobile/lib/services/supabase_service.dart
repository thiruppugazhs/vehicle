import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import 'offline_cache_service.dart';

class SupabaseService {
  static const String supabaseUrl = 'https://fyyobzkkkmyswfafyupo.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_oLpH7SkGzKqgXPL493rRcA_SyP0KNtX';

  final OfflineCacheService _cacheService = OfflineCacheService();

  static Future<void> initialize() async {
    try {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
      if (kDebugMode) {
        print('[SupabaseService] Initialized with $supabaseUrl');
      }
    } catch (e) {
      if (kDebugMode) {
        print('[SupabaseService] Offline or fallback mode active: $e');
      }
    }
  }

  SupabaseClient? get client {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  // Initial demo vehicles cache for seamless offline and online experience
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

  Future<List<VehicleModel>> fetchVehicles(String orgId) async {
    try {
      if (client != null) {
        final response = await client!
            .from('vehicles')
            .select()
            .eq('organization_id', orgId);
        if (response.isNotEmpty) {
          final fetched = response
              .map((item) => VehicleModel.fromJson(item, item['id'].toString()))
              .toList();
          await _cacheService.cacheVehicles(fetched);
          return fetched;
        }
      }
      await _cacheService.cacheVehicles(_inMemoryVehicles);
      return List.from(_inMemoryVehicles);
    } catch (_) {
      final cached = await _cacheService.getCachedVehicles();
      return cached.isNotEmpty ? cached : List.from(_inMemoryVehicles);
    }
  }

  Future<VehicleModel> addVehicle(VehicleModel vehicle) async {
    try {
      if (client != null) {
        await client!.from('vehicles').insert({
          'registration_number': vehicle.registrationNumber,
          'make': vehicle.manufacturer,
          'model': vehicle.model,
          'type': vehicle.type,
          'fuel_type': vehicle.fuelType,
          'transmission': vehicle.transmission,
          'current_odometer': vehicle.currentOdometer,
          'year': vehicle.year,
          'status': vehicle.status,
          'organization_id': vehicle.organizationId,
        });
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase] addVehicle error: $e');
    }
    _inMemoryVehicles.insert(0, vehicle);
    await _cacheService.cacheVehicles(_inMemoryVehicles);
    return vehicle;
  }

  Future<bool> updateOdometer(String vehicleId, int newOdo, String reason) async {
    try {
      if (client != null) {
        await client!
            .from('vehicles')
            .update({'current_odometer': newOdo})
            .eq('id', vehicleId);
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase] updateOdometer error: $e');
    }
    final idx = _inMemoryVehicles.indexWhere((v) => v.id == vehicleId);
    if (idx != -1) {
      _inMemoryVehicles[idx] = _inMemoryVehicles[idx].copyWith(currentOdometer: newOdo);
      await _cacheService.cacheVehicles(_inMemoryVehicles);
      return true;
    }
    return true;
  }
}
