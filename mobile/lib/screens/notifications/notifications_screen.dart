import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import '../maintenance/maintenance_screen.dart';
import '../repairs/repairs_screen.dart';
import '../documents/documents_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Notification Center'),
      ),
      body: fleet.notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.notifications_none, size: 48, color: AppTheme.textMuted),
                  SizedBox(height: 12),
                  Text('All caught up!', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('No pending fleet alerts', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fleet.notifications.length,
              itemBuilder: (context, idx) {
                final n = fleet.notifications[idx];
                final isUrgent = n.type == 'urgent';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: isUrgent ? AppTheme.criticalRed.withOpacity(0.12) : AppTheme.primaryAmber.withOpacity(0.12),
                      child: Icon(
                        isUrgent ? Icons.error_outline : Icons.notifications_active,
                        color: isUrgent ? AppTheme.criticalRed : AppTheme.primaryAmberDark,
                        size: 20,
                      ),
                    ),
                    title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(n.message, style: const TextStyle(fontSize: 12)),
                        const SizedBox(height: 6),
                        Text(n.timestamp, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                    onTap: () {
                      // Deep Link Navigation (Requirement 10)
                      if (n.linkTo != null) {
                        final screen = n.linkTo!['screen'];
                        if (screen == 'maintenance') {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const MaintenanceScreen()));
                        } else if (screen == 'repairs') {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const RepairsScreen()));
                        } else if (screen == 'documents') {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const DocumentsScreen()));
                        }
                      }
                    },
                  ),
                );
              },
            ),
    );
  }
}
