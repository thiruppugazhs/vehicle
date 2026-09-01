import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class QuickActionSheet extends StatelessWidget {
  final VoidCallback onAddVehicle;
  final VoidCallback onRecordService;
  final VoidCallback onReportIssue;
  final VoidCallback onAddExpense;
  final VoidCallback onUpdateOdometer;
  final VoidCallback onUploadDocument;

  const QuickActionSheet({
    super.key,
    required this.onAddVehicle,
    required this.onRecordService,
    required this.onReportIssue,
    required this.onAddExpense,
    required this.onUpdateOdometer,
    required this.onUploadDocument,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Fleet Quick Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppTheme.textMuted),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _buildActionTile(
                icon: Icons.directions_car,
                label: 'Add Vehicle',
                color: Colors.blue,
                onTap: () {
                  Navigator.pop(context);
                  onAddVehicle();
                },
              ),
              _buildActionTile(
                icon: Icons.build,
                label: 'Record Service',
                color: AppTheme.primaryAmber,
                onTap: () {
                  Navigator.pop(context);
                  onRecordService();
                },
              ),
              _buildActionTile(
                icon: Icons.warning_rounded,
                label: 'Report Issue',
                color: AppTheme.criticalRed,
                onTap: () {
                  Navigator.pop(context);
                  onReportIssue();
                },
              ),
              _buildActionTile(
                icon: Icons.receipt_long,
                label: 'Add Expense',
                color: AppTheme.successGreen,
                onTap: () {
                  Navigator.pop(context);
                  onAddExpense();
                },
              ),
              _buildActionTile(
                icon: Icons.speed,
                label: 'Odometer',
                color: Colors.purple,
                onTap: () {
                  Navigator.pop(context);
                  onUpdateOdometer();
                },
              ),
              _buildActionTile(
                icon: Icons.description,
                label: 'Upload Doc',
                color: Colors.indigo,
                onTap: () {
                  Navigator.pop(context);
                  onUploadDocument();
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.backgroundLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderSlate),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: color.withOpacity(0.12),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
