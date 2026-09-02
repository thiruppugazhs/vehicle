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

  Future<void> signInWithGoogle() async {
    try {
      if (client != null) {
        await client!.auth.signInWithOAuth(OAuthProvider.google);
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Google Sign-In: $e');
    }
  }

  Future<void> sendEmailOtp(String email) async {
    try {
      if (client != null) {
        await client!.auth.signInWithOtp(email: email);
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Email OTP send: $e');
    }
  }

  Future<AuthResponse?> verifyEmailOtp(String email, String token) async {
    try {
      if (client != null) {
        return await client!.auth.verifyOTP(
          email: email,
          token: token,
          type: OtpType.email,
        );
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Email OTP verify: $e');
    }
    return null;
  }

  Future<void> sendPhoneOtp(String phone) async {
    try {
      if (client != null) {
        await client!.auth.signInWithOtp(phone: phone);
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Phone OTP send: $e');
    }
  }

  Future<AuthResponse?> verifyPhoneOtp(String phone, String token) async {
    try {
      if (client != null) {
        return await client!.auth.verifyOTP(
          phone: phone,
          token: token,
          type: OtpType.sms,
        );
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Phone OTP verify: $e');
    }
    return null;
  }

  Future<void> changePassword(String newPassword) async {
    try {
      if (client != null) {
        await client!.auth.updateUser(UserAttributes(password: newPassword));
      }
    } catch (e) {
      if (kDebugMode) print('[Supabase Mobile] Password update: $e');
    }
  }

  // In-memory cache starting fresh with zero mock data
  final List<VehicleModel> _inMemoryVehicles = [];

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
