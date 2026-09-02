import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../expenses/expenses_screen.dart';
import '../documents/documents_screen.dart';
import '../notifications/notifications_screen.dart';
import '../auth/login_screen.dart';

class MoreMenuScreen extends StatelessWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Fleet Command & Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.primaryAmber,
                    child: Text(
                      auth.userName.isNotEmpty ? auth.userName.substring(0, 1) : 'U',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(auth.userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(auth.userEmail, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Operational Modules', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMuted)),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                _buildMenuItem(
                  icon: Icons.receipt_long,
                  title: 'Expenses & Financials',
                  subtitle: 'Fuel logs, toll records, vendor costs',
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ExpensesScreen())),
                ),
                const Divider(height: 1),
                _buildMenuItem(
                  icon: Icons.description,
                  title: 'Compliance Documents',
                  subtitle: 'RC, Insurance, PUC, Fitness certificates',
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DocumentsScreen())),
                ),
                const Divider(height: 1),
                _buildMenuItem(
                  icon: Icons.notifications,
                  title: 'Notification Center',
                  subtitle: 'Push alerts and schedule reminders',
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Switch Operational Role (Demo)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMuted)),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: ['Fleet Manager', 'Owner', 'Driver', 'Technician'].map((role) {
                return RadioListTile<String>(
                  title: Text(role, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  value: role,
                  groupValue: auth.userRole,
                  activeColor: AppTheme.primaryAmber,
                  onChanged: (val) {
                    if (val != null) auth.switchRole(val);
                  },
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.criticalRed,
              side: const BorderSide(color: AppTheme.borderSlate),
            ),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out of Mobile App'),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: AppTheme.backgroundLight,
        child: Icon(icon, color: AppTheme.primaryAmberDark, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
      trailing: const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMuted),
      onTap: onTap,
    );
  }
}
