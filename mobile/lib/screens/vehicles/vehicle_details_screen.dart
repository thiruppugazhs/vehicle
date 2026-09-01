import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/odometer_dialog.dart';

class VehicleDetailsScreen extends StatelessWidget {
  final VehicleModel vehicle;

  const VehicleDetailsScreen({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);
    final currentV = fleet.vehicles.firstWhere((v) => v.id == vehicle.id, orElse: () => vehicle);
    final vehicleMaintenance = fleet.maintenance.where((m) => m.vehicleId == currentV.id).toList();
    final vehicleRepairs = fleet.repairs.where((r) => r.vehicleId == currentV.id).toList();
    final vehicleExpenses = fleet.expenses.where((e) => e.vehicleId == currentV.id).toList();
    final vehicleDocs = fleet.documents.where((d) => d.vehicleId == currentV.id).toList();

    return DefaultTabController(
      length: 5,
      child: Scaffold(
        backgroundColor: AppTheme.backgroundLight,
        appBar: AppBar(
          title: Text(currentV.registrationNumber),
          bottom: const TabBar(
            isScrollable: true,
            indicatorColor: AppTheme.primaryAmber,
            labelColor: AppTheme.primaryAmberDark,
            unselectedLabelColor: AppTheme.textMuted,
            tabs: [
              Tab(text: 'Overview'),
              Tab(text: 'Maintenance'),
              Tab(text: 'Repairs'),
              Tab(text: 'Expenses'),
              Tab(text: 'Documents'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.speed, color: AppTheme.primaryAmberDark),
              tooltip: 'Update Odometer',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => OdometerDialog(
                    vehicle: currentV,
                    onConfirm: (newOdo, notes) => fleet.updateOdometer(currentV.id, newOdo, notes),
                  ),
                );
              },
            ),
          ],
        ),
        body: TabBarView(
          children: [
            // 1. Overview
            SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(currentV.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('${currentV.manufacturer} • ${currentV.model} (${currentV.year})', style: const TextStyle(color: AppTheme.textMuted)),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildInfoCol('Mileage', '${currentV.currentOdometer} km'),
                              _buildInfoCol('Health', '${currentV.healthScore}/100'),
                              _buildInfoCol('Status', currentV.status),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Technical Specs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 12),
                          _buildSpecRow('Fuel Type', currentV.fuelType),
                          _buildSpecRow('Transmission', currentV.transmission),
                          _buildSpecRow('Variant', currentV.variant.isEmpty ? 'Standard' : currentV.variant),
                          _buildSpecRow('Organization', currentV.organizationId),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Maintenance
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: vehicleMaintenance.length,
              itemBuilder: (context, idx) {
                final m = vehicleMaintenance[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(m.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${m.serviceDate} • ₹${m.totalCost.toStringAsFixed(0)} • ${m.serviceCenterName}'),
                    trailing: Text('${m.odometerReading} km', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  ),
                );
              },
            ),

            // 3. Repairs
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: vehicleRepairs.length,
              itemBuilder: (context, idx) {
                final r = vehicleRepairs[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(r.issueTitle, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${r.status} • Severity: ${r.severity}\nReported: ${r.reportedDate}'),
                    trailing: Text('₹${r.actualCost.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                );
              },
            ),

            // 4. Expenses
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: vehicleExpenses.length,
              itemBuilder: (context, idx) {
                final e = vehicleExpenses[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(e.category, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${e.date} • ${e.vendor}'),
                    trailing: Text('₹${e.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                );
              },
            ),

            // 5. Documents
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: vehicleDocs.length,
              itemBuilder: (context, idx) {
                final d = vehicleDocs[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.description, color: AppTheme.primaryAmber),
                    title: Text(d.documentType, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Expires: ${d.expiryDate} • Status: ${d.status}'),
                    trailing: const Icon(Icons.download, size: 20, color: AppTheme.textMuted),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCol(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }
}
