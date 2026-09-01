import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import '../main_nav_screen.dart';
import '../onboarding/onboarding_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'rajesh@abctransport.in');
  final _passwordController = TextEditingController(text: 'password123');
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
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
                  'Sign in to manage fleet assets, schedules & work orders',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
                const SizedBox(height: 32),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
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
                            onPressed: _isLoading ? null : _handleLogin,
                            child: _isLoading
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Sign In to Fleet Command'),
                          ),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: () {
                            Provider.of<AuthProvider>(context, listen: false).loginWithGoogle();
                            Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainNavScreen()));
                          },
                          icon: const Icon(Icons.g_mobiledata, size: 24),
                          label: const Text('Continue with Google Workspace'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.textDark,
                            padding: const EdgeInsets.symmetric(vertical: 14),
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
