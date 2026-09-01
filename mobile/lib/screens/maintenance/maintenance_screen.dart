import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import 'record_service_screen.dart';

class MaintenanceScreen extends StatelessWidget {
  const MaintenanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Maintenance Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.primaryAmberDark),
            tooltip: 'Record Service',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecordServiceScreen())),
          ),
        ],
      ),
      body: fleet.maintenance.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.build_circle_outlined, size: 48, color: AppTheme.textMuted),
                  const SizedBox(height: 12),
                  const Text('No Maintenance Records Yet', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecordServiceScreen())),
                    child: const Text('Record First Service'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fleet.maintenance.length,
              itemBuilder: (context, idx) {
                final m = fleet.maintenance[idx];
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
                            Text(m.vehicleReg, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark)),
                            Text('₹${m.totalCost.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(m.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text('${m.serviceType} • ${m.serviceCenterName}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Date: ${m.serviceDate}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            Text('Odometer: ${m.odometerReading} km', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          ],
                        ),
                        if (m.nextDueDate != null) ...[
                          const SizedBox(height: 6),
                          Text('Next Service: ${m.nextDueDate}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark)),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
