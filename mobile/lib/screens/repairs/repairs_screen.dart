import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import 'report_issue_screen.dart';

class RepairsScreen extends StatelessWidget {
  const RepairsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Repairs & Work Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_alert, color: AppTheme.criticalRed),
            tooltip: 'Report Issue',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportIssueScreen())),
          ),
        ],
      ),
      body: fleet.repairs.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.handyman_outlined, size: 48, color: AppTheme.textMuted),
                  const SizedBox(height: 12),
                  const Text('No Active Repairs', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportIssueScreen())),
                    child: const Text('Report New Issue'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fleet.repairs.length,
              itemBuilder: (context, idx) {
                final r = fleet.repairs[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(r.vehicleReg, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: r.severity == 'Critical'
                                    ? AppTheme.criticalRed.withOpacity(0.12)
                                    : AppTheme.warningAmber.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                r.severity,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: r.severity == 'Critical' ? AppTheme.criticalRed : AppTheme.warningAmber,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(r.issueTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(r.description, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        const SizedBox(height: 12),
                        // 7-stage Lifecycle pill
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.backgroundLight,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.borderSlate),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Stage: ${r.status}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                              if (r.status != 'Completed' && r.status != 'Closed')
                                InkWell(
                                  onTap: () {
                                    final next = r.status == 'Reported'
                                        ? 'Inspection'
                                        : r.status == 'Inspection'
                                            ? 'Estimate'
                                            : r.status == 'Estimate'
                                                ? 'Approval'
                                                : r.status == 'Approval'
                                                    ? 'Repair In Progress'
                                                    : 'Completed';
                                    fleet.advanceRepairStage(r.id, next, cost: r.estimatedCost);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Moved ${r.vehicleReg} ticket to $next.')),
                                    );
                                  },
                                  child: const Text('Advance Stage >', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark)),
                                )
                              else
                                const Text('Closed', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
