import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class OfflineCacheService {
  static const String _vehiclesKey = 'cached_vehicles';
  static const String _offlineQueueKey = 'offline_write_queue';

  Future<void> cacheVehicles(List<VehicleModel> vehicles) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = vehicles.map((v) => {'id': v.id, ...v.toJson()}).toList();
    await prefs.setString(_vehiclesKey, jsonEncode(jsonList));
  }

  Future<List<VehicleModel>> getCachedVehicles() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_vehiclesKey);
    if (str == null) return [];
    try {
      final List decoded = jsonDecode(str);
      return decoded.map((item) => VehicleModel.fromJson(item, item['id'] ?? '')).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> queueOfflineWrite(String action, Map<String, dynamic> payload) async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_offlineQueueKey);
    List queue = str != null ? jsonDecode(str) : [];
    queue.add({
      'action': action,
      'payload': payload,
      'queuedAt': DateTime.now().toIso8601String(),
    });
    await prefs.setString(_offlineQueueKey, jsonEncode(queue));
  }

  Future<List<Map<String, dynamic>>> getOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_offlineQueueKey);
    if (str == null) return [];
    try {
      return List<Map<String, dynamic>>.from(jsonDecode(str));
    } catch (_) {
      return [];
    }
  }

  Future<void> clearOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_offlineQueueKey);
  }
}
