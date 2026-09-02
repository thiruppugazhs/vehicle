import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../services/supabase_service.dart';
import '../../theme/app_theme.dart';
import '../main_nav_screen.dart';
import '../onboarding/onboarding_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();

  int _selectedChannelIndex = 0; // 0 = Email, 1 = Phone SMS
  bool _isOtpSent = false;
  bool _isLoading = false;
  String? _statusMessage;

  final SupabaseService _supabaseService = SupabaseService();

  Future<void> _handlePasswordLogin() async {
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    await auth.login(_emailController.text, _passwordController.text);
    await fleet.loadFleetData(auth.organizationId);

    if (!mounted) return;
    setState(() => _isLoading = false);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainNavScreen()),
    );
  }

  Future<void> _handleSendPhoneOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      setState(() => _statusMessage = 'Please enter a valid phone number');
      return;
    }
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    await _supabaseService.sendPhoneOtp(phone);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _isOtpSent = true;
      _statusMessage = 'SMS OTP sent to $phone. Please enter the 6-digit verification code.';
    });
  }

  Future<void> _handleVerifyPhoneOtp() async {
    final code = _otpController.text.trim();
    if (code.length < 6) {
      setState(() => _statusMessage = 'Please enter the 6-digit OTP code');
      return;
    }
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    await _supabaseService.verifyPhoneOtp(_phoneController.text.trim(), code);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    await auth.login(_phoneController.text.trim(), 'otp-verified');
    await fleet.loadFleetData(auth.organizationId);

    if (!mounted) return;
    setState(() => _isLoading = false);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainNavScreen()),
    );
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    await _supabaseService.signInWithGoogle();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    await auth.loginWithGoogle();
    await fleet.loadFleetData(auth.organizationId);

    if (!mounted) return;
    setState(() => _isLoading = false);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainNavScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryAmber,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.directions_bus_filled, color: Colors.white, size: 36),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Welcome to FleetPulse',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sign in with Email, Mobile Phone OTP, or Google',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
                const SizedBox(height: 24),

                // Channel Tabs
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.borderSlate),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _selectedChannelIndex = 0;
                            _isOtpSent = false;
                            _statusMessage = null;
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _selectedChannelIndex == 0 ? AppTheme.primaryAmber : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'Email Address',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _selectedChannelIndex == 0 ? Colors.white : AppTheme.textDark,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _selectedChannelIndex = 1;
                            _isOtpSent = false;
                            _statusMessage = null;
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _selectedChannelIndex == 1 ? AppTheme.primaryAmber : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'Mobile Phone (SMS)',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _selectedChannelIndex == 1 ? Colors.white : AppTheme.textDark,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (_statusMessage != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryAmber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.primaryAmber),
                    ),
                    child: Text(
                      _statusMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark),
                    ),
                  ),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        if (_selectedChannelIndex == 0) ...[
                          // Email Flow
                          TextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Work Email Address',
                              prefixIcon: Icon(Icons.email_outlined, color: AppTheme.textMuted, size: 20),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _passwordController,
                            obscureText: true,
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              prefixIcon: Icon(Icons.lock_outline, color: AppTheme.textMuted, size: 20),
                            ),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handlePasswordLogin,
                              child: _isLoading
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Text('Sign In to Fleet Command'),
                            ),
                          ),
                        ] else ...[
                          // Mobile Phone Flow
                          TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            enabled: !_isOtpSent,
                            decoration: const InputDecoration(
                              labelText: 'Mobile Phone Number',
                              prefixIcon: Icon(Icons.phone_android, color: AppTheme.textMuted, size: 20),
                            ),
                          ),
                          if (_isOtpSent) ...[
                            const SizedBox(height: 16),
                            TextField(
                              controller: _otpController,
                              keyboardType: TextInputType.number,
                              maxLength: 6,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 8),
                              decoration: const InputDecoration(
                                labelText: 'Enter 6-Digit OTP',
                                counterText: '',
                                prefixIcon: Icon(Icons.pin, color: AppTheme.textMuted, size: 20),
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isLoading
                                  ? null
                                  : (_isOtpSent ? _handleVerifyPhoneOtp : _handleSendPhoneOtp),
                              child: _isLoading
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : Text(_isOtpSent ? 'Verify OTP & Enter' : 'Send SMS Verification Code'),
                            ),
                          ),
                          if (_isOtpSent) ...[
                            const SizedBox(height: 10),
                            TextButton(
                              onPressed: () => setState(() => _isOtpSent = false),
                              child: const Text('Change Phone Number', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            ),
                          ],
                        ],
                        const SizedBox(height: 14),
                        OutlinedButton.icon(
                          onPressed: _isLoading ? null : _handleGoogleSignIn,
                          icon: const Icon(Icons.g_mobiledata, size: 28),
                          label: const Text('Continue with Google Workspace'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.textDark,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            side: const BorderSide(color: AppTheme.borderSlate),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const OnboardingScreen()));
                  },
                  child: const Text(
                    'First time? Run Mobile Onboarding Setup',
                    style: TextStyle(color: AppTheme.primaryAmberDark, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
