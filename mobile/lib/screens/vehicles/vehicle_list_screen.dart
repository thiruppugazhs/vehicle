import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import 'vehicle_details_screen.dart';
import 'add_edit_vehicle_screen.dart';

class VehicleListScreen extends StatefulWidget {
  const VehicleListScreen({super.key});

  @override
  State<VehicleListScreen> createState() => _VehicleListScreenState();
}

class _VehicleListScreenState extends State<VehicleListScreen> {
  String _searchQuery = '';
  String _statusFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    final filtered = fleet.vehicles.where((v) {
      final matchesSearch = v.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          v.registrationNumber.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesStatus = _statusFilter == 'All' || v.status == _statusFilter;
      return matchesSearch && matchesStatus;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Fleet Vehicles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.primaryAmberDark),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditVehicleScreen())),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search by registration or name...',
                prefixIcon: Icon(Icons.search, color: AppTheme.textMuted, size: 20),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: ['All', 'Active', 'Due for Service', 'Overdue', 'Under Repair'].map((status) {
                final isSelected = _statusFilter == status;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(status, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : AppTheme.textDark)),
                    selected: isSelected,
                    selectedColor: AppTheme.primaryAmber,
                    backgroundColor: AppTheme.cardWhite,
                    checkmarkColor: Colors.white,
                    side: const BorderSide(color: AppTheme.borderSlate),
                    onSelected: (_) => setState(() => _statusFilter = status),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.directions_car_outlined, size: 48, color: AppTheme.textMuted),
                        SizedBox(height: 12),
                        Text('No vehicles found', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Try adjusting your filters', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final v = filtered[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => VehicleDetailsScreen(vehicle: v)),
                          ),
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      v.name,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    ),
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
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  v.registrationNumber,
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryAmberDark, fontSize: 13),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${v.currentOdometer} km', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                                    Text('Health: ${v.healthScore}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: v.healthScore >= 80 ? AppTheme.successGreen : AppTheme.criticalRed)),
                                    Text('${v.fuelType} • ${v.transmission}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
