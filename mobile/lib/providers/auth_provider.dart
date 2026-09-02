import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../services/notification_service.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  final NotificationService _notificationService = NotificationService();

  bool _isAuthenticated = true;
  bool _isOnboarded = true;
  String _userId = '';
  String _userName = 'Fleet Operator';
  String _userEmail = '';
  String _userRole = 'Fleet Manager';
  String _organizationId = '';
  String _organizationName = '';

  bool get isAuthenticated => _isAuthenticated;
  bool get isOnboarded => _isOnboarded;
  String get userId => _userId;
  String get userName => _userName;
  String get userEmail => _userEmail;
  String get userRole => _userRole;
  String get organizationId => _organizationId;
  String get organizationName => _organizationName;

  Future<void> login(String email, String password) async {
    _isAuthenticated = true;
    _userEmail = email;
    _userName = email.split('@')[0].toUpperCase();
    notifyListeners();
  }

  Future<void> loginWithGoogle() async {
    _isAuthenticated = true;
    _userName = 'Google User';
    _userEmail = 'user@gmail.com';
    notifyListeners();
  }

  Future<void> completeOnboarding({
    required String role,
    required String orgName,
    required bool enableNotifications,
  }) async {
    _userRole = role;
    _organizationName = orgName;
    _isOnboarded = true;

    if (enableNotifications) {
      await _notificationService.requestPermission();
      final token = _notificationService.fcmToken;
      if (token != null) {
        await _firebaseService.registerDeviceToken(_userId, token, 'android');
      }
    }
    notifyListeners();
  }

  void switchRole(String role) {
    _userRole = role;
    notifyListeners();
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    notifyListeners();
  }
}
