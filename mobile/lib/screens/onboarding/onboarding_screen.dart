import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import '../main_nav_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 0;
  String _selectedRole = 'Fleet Manager';
  final _orgNameController = TextEditingController(text: 'ABC Transport Pvt Ltd');
  bool _enableNotifications = true;

  final List<Map<String, dynamic>> _roles = [
    {'role': 'Vehicle Owner', 'desc': 'Individual or small fleet asset owner with full financial control', 'icon': Icons.person},
    {'role': 'Fleet Manager', 'desc': 'Commercial operations, driver dispatch & maintenance tracking', 'icon': Icons.admin_panel_settings},
    {'role': 'Driver', 'desc': 'Log vehicle mileage, shift inspections & report highway issues', 'icon': Icons.drive_eta},
    {'role': 'Technician', 'desc': 'Workshop repair orders, labor milestones & parts invoices', 'icon': Icons.build},
  ];

  void _finishOnboarding() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    await auth.completeOnboarding(
      role: _selectedRole,
      orgName: _orgNameController.text.trim().isEmpty ? 'My Fleet Garage' : _orgNameController.text.trim(),
      enableNotifications: _enableNotifications,
    );

    await fleet.loadFleetData(auth.organizationId);

    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const MainNavScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Mobile Setup Wizard'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 2) {
              setState(() => _currentStep += 1);
            } else {
              _finishOnboarding();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            }
          },
          controlsBuilder: (context, details) {
            return Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: details.onStepContinue,
                      child: Text(_currentStep == 2 ? 'Complete Setup & Launch' : 'Continue'),
                    ),
                  ),
                  if (_currentStep > 0) ...[
                    const SizedBox(width: 12),
                    TextButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back', style: TextStyle(color: AppTheme.textMuted)),
                    ),
                  ],
                ],
              ),
            );
          },
          steps: [
            Step(
              title: const Text('Select Operational Role', style: TextStyle(fontWeight: FontWeight.bold)),
              isActive: _currentStep >= 0,
              content: Column(
                children: _roles.map((r) {
                  final isSelected = _selectedRole == r['role'];
                  return Card(
                    color: isSelected ? AppTheme.primaryAmber.withOpacity(0.08) : AppTheme.cardWhite,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: BorderSide(
                        color: isSelected ? AppTheme.primaryAmber : AppTheme.borderSlate,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected ? AppTheme.primaryAmber : AppTheme.backgroundLight,
                        child: Icon(r['icon'] as IconData, color: isSelected ? Colors.white : AppTheme.textDark, size: 20),
                      ),
                      title: Text(r['role'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text(r['desc'], style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      onTap: () => setState(() => _selectedRole = r['role']),
                    ),
                  );
                }).toList(),
              ),
            ),
            Step(
              title: const Text('Workspace / Organization', style: TextStyle(fontWeight: FontWeight.bold)),
              isActive: _currentStep >= 1,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'All vehicles, drivers, and service records will be isolated under your organization workspace.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _orgNameController,
                    decoration: const InputDecoration(
                      labelText: 'Corporate Organization Name',
                      hintText: 'e.g. Southern Express Logistics',
                      prefixIcon: Icon(Icons.business, color: AppTheme.textMuted, size: 20),
                    ),
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Enable FCM Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
              isActive: _currentStep >= 2,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Receive native Android & iOS push alerts for service due dates, document expiries, and repair updates.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Enable Push Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: const Text('Native permission dialog will appear', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    value: _enableNotifications,
                    activeColor: AppTheme.primaryAmber,
                    onChanged: (val) => setState(() => _enableNotifications = val),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
