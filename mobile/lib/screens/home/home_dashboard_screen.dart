import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/odometer_dialog.dart';
import '../vehicles/vehicle_details_screen.dart';
import '../vehicles/add_edit_vehicle_screen.dart';
import '../repairs/report_issue_screen.dart';
import '../maintenance/record_service_screen.dart';
import '../expenses/add_expense_screen.dart';
import '../documents/documents_screen.dart';

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              auth.organizationName,
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, fontWeight: FontWeight.normal),
            ),
            Text(
              'Fleet Command',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primaryAmber.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.3)),
            ),
            child: Text(
              auth.userRole,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryAmberDark,
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppTheme.primaryAmber,
        onRefresh: () => fleet.loadFleetData(auth.organizationId),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Offline Banner (Requirement 30 & 73)
              if (fleet.isOffline)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.amber.shade300),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.wifi_off, color: Colors.amber, size: 20),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          "You're offline. Changes will sync when you're back online.",
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber),
                        ),
                      ),
                    ],
                  ),
                ),

              // 6 Quick Actions Horizontal Carousel (Requirement 15, 57, 78)
              const Text(
                'Quick Actions',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildQuickButton(
                      context,
                      icon: Icons.directions_car,
                      label: 'Add Vehicle',
                      color: Colors.blue,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditVehicleScreen())),
                    ),
                    _buildQuickButton(
                      context,
                      icon: Icons.build,
                      label: 'Record Service',
                      color: AppTheme.primaryAmber,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecordServiceScreen())),
                    ),
                    _buildQuickButton(
                      context,
                      icon: Icons.warning_rounded,
                      label: 'Report Issue',
                      color: AppTheme.criticalRed,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportIssueScreen())),
                    ),
                    _buildQuickButton(
                      context,
                      icon: Icons.receipt_long,
                      label: 'Add Expense',
                      color: AppTheme.successGreen,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddExpenseScreen())),
                    ),
                    _buildQuickButton(
                      context,
                      icon: Icons.speed,
                      label: 'Update Odometer',
                      color: Colors.purple,
                      onTap: () {
                        if (fleet.vehicles.isNotEmpty) {
                          showDialog(
                            context: context,
                            builder: (_) => OdometerDialog(
                              vehicle: fleet.vehicles.first,
                              onConfirm: (val, notes) => fleet.updateOdometer(fleet.vehicles.first.id, val, notes),
                            ),
                          );
                        }
                      },
                    ),
                    _buildQuickButton(
                      context,
                      icon: Icons.description,
                      label: 'Upload Doc',
                      color: Colors.indigo,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DocumentsScreen())),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // KPI Status Grid
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      'Total Fleet',
                      '${fleet.totalVehicles} Assets',
                      Icons.directions_car,
                      Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      'Fleet Health',
                      '${fleet.averageHealthScore}/100',
                      Icons.favorite,
                      fleet.averageHealthScore >= 80 ? AppTheme.successGreen : AppTheme.criticalRed,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      'Due / Overdue',
                      '${fleet.overdueServices + fleet.dueServices} Scheduled',
                      Icons.alarm,
                      AppTheme.warningAmber,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      'Under Repair',
                      '${fleet.underRepair} in Shop',
                      Icons.handyman,
                      AppTheme.criticalRed,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Overdue Alert Banner if any
              if (fleet.overdueServices > 0)
                Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.criticalRed.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.criticalRed.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppTheme.criticalRed,
                        radius: 18,
                        child: Icon(Icons.priority_high, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Urgent Service Overdue',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.criticalRed),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Tata Prima (MH 02 CK 9876) brake line check overdue by 14 days.',
                              style: TextStyle(fontSize: 11, color: AppTheme.textDark),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              // Active Vehicles Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Active Vehicles',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  Text(
                    'Real-time Sync',
                    style: TextStyle(fontSize: 11, color: AppTheme.primaryAmberDark, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: fleet.vehicles.length,
                itemBuilder: (context, index) {
                  final v = fleet.vehicles[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        radius: 24,
                        backgroundColor: AppTheme.primaryAmber.withOpacity(0.12),
                        child: Text(
                          v.registrationNumber.substring(0, 2),
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark),
                        ),
                      ),
                      title: Text(
                        v.name,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      subtitle: Text(
                        '${v.registrationNumber} • ${v.currentOdometer.toLocaleString()} km',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: v.status == 'Active'
                                  ? AppTheme.successGreen.withOpacity(0.12)
                                  : AppTheme.criticalRed.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              v.status,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: v.status == 'Active' ? AppTheme.successGreen : AppTheme.criticalRed,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Health: ${v.healthScore}%',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => VehicleDetailsScreen(vehicle: v)),
                        );
                      },
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 86,
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: AppTheme.cardWhite,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSlate),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: color.withOpacity(0.12),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
        ],
      ),
    );
  }
}

extension IntFormatter on int {
  String toLocaleString() {
    return toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},');
  }
}
