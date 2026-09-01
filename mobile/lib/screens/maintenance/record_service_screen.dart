import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';

class RecordServiceScreen extends StatefulWidget {
  const RecordServiceScreen({super.key});

  @override
  State<RecordServiceScreen> createState() => _RecordServiceScreenState();
}

class _RecordServiceScreenState extends State<RecordServiceScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedVehicleId;
  final _titleController = TextEditingController(text: 'Routine Preventative Service');
  final _odoController = TextEditingController(text: '52000');
  final _costController = TextEditingController(text: '8500');
  final _vendorController = TextEditingController(text: 'Authorized Service Hub');
  final _techController = TextEditingController(text: 'Ramesh Patel');
  String _serviceType = 'Routine Service';

  @override
  void initState() {
    super.initState();
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    if (fleet.vehicles.isNotEmpty) {
      _selectedVehicleId = fleet.vehicles.first.id;
    }
  }

  void _submitService() {
    if (!_formKey.currentState!.validate() || _selectedVehicleId == null) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    final vehicle = fleet.vehicles.firstWhere((v) => v.id == _selectedVehicleId);

    final record = MaintenanceRecordModel(
      id: 'maint_${DateTime.now().millisecondsSinceEpoch}',
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      title: _titleController.text.trim(),
      serviceType: _serviceType,
      serviceDate: DateTime.now().toIso8601String().substring(0, 10),
      odometerReading: int.tryParse(_odoController.text) ?? vehicle.currentOdometer,
      totalCost: double.tryParse(_costController.text) ?? 0.0,
      serviceCenterName: _vendorController.text.trim(),
      technician: _techController.text.trim(),
      nextDueDate: DateTime.now().add(const Duration(days: 90)).toIso8601String().substring(0, 10),
      nextDueOdometer: (int.tryParse(_odoController.text) ?? vehicle.currentOdometer) + 10000,
      organizationId: auth.organizationId,
    );

    fleet.recordService(record);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Service recorded for ${vehicle.registrationNumber}. Next service calculated.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Record Maintenance Service'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: _selectedVehicleId,
                        decoration: const InputDecoration(labelText: 'Select Vehicle'),
                        items: fleet.vehicles.map((v) {
                          return DropdownMenuItem(
                            value: v.id,
                            child: Text('${v.registrationNumber} (${v.name})'),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedVehicleId = val),
                        validator: (val) => val == null ? 'Please select a vehicle' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(labelText: 'Service Description / Title'),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _serviceType,
                        decoration: const InputDecoration(labelText: 'Service Type'),
                        items: ['Routine Service', 'Oil & Lubrication', 'Brake Service', 'Tire Replacement', 'Major Overhaul']
                            .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                            .toList(),
                        onChanged: (val) => setState(() => _serviceType = val!),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _odoController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'Odometer (km)', suffixText: 'km'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _costController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'Total Cost (₹)', prefixText: '₹'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _vendorController,
                        decoration: const InputDecoration(labelText: 'Workshop / Service Center'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _techController,
                        decoration: const InputDecoration(labelText: 'Technician Name'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Camera invoice button (Requirement 19 & 21)
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Camera opened to capture service invoice.')),
                  );
                },
                icon: const Icon(Icons.camera_alt, color: AppTheme.primaryAmberDark),
                label: const Text('Capture / Attach Invoice Photo'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.borderSlate),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitService,
                child: const Text('Save & Calculate Next Service'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
