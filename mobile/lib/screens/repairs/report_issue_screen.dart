import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedVehicleId;
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _odoController = TextEditingController();
  String _category = 'Brakes';
  String _severity = 'Critical';

  @override
  void initState() {
    super.initState();
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    if (fleet.vehicles.isNotEmpty) {
      _selectedVehicleId = fleet.vehicles.first.id;
      _odoController.text = '${fleet.vehicles.first.currentOdometer}';
    }
  }

  void _submitIssue() {
    if (!_formKey.currentState!.validate() || _selectedVehicleId == null) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    final vehicle = fleet.vehicles.firstWhere((v) => v.id == _selectedVehicleId);

    final ticket = RepairTicketModel(
      id: 'rep_${DateTime.now().millisecondsSinceEpoch}',
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      issueTitle: _titleController.text.trim(),
      issueCategory: _category,
      description: _descController.text.trim(),
      severity: _severity,
      status: 'Reported',
      reportedDate: DateTime.now().toIso8601String().substring(0, 10),
      estimatedCost: _severity == 'Critical' ? 12000.0 : 4500.0,
      organizationId: auth.organizationId,
    );

    fleet.reportIssue(ticket);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Repair ticket created. ${vehicle.registrationNumber} is now Under Repair.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Report Vehicle Problem'),
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
                        onChanged: (val) {
                          setState(() {
                            _selectedVehicleId = val;
                            if (val != null) {
                              final v = fleet.vehicles.firstWhere((item) => item.id == val);
                              _odoController.text = '${v.currentOdometer}';
                            }
                          });
                        },
                        validator: (val) => val == null ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          labelText: 'Issue Summary / Problem Title',
                          hintText: 'e.g. Unusual grinding noise on front brake',
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _category,
                        decoration: const InputDecoration(labelText: 'Issue Category'),
                        items: ['Brakes', 'Engine', 'Transmission', 'Electrical', 'Tires', 'Suspension', 'HVAC', 'Body']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) => setState(() => _category = v!),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _severity,
                        decoration: const InputDecoration(labelText: 'Severity Level'),
                        items: ['Minor', 'Moderate', 'Major', 'Critical']
                            .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                            .toList(),
                        onChanged: (v) => setState(() => _severity = v!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _odoController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Odometer at breakdown', suffixText: 'km'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _descController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          labelText: 'Detailed Symptoms & Driver Observations',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Camera opened to take repair photos.')),
                  );
                },
                icon: const Icon(Icons.camera_alt, color: AppTheme.criticalRed),
                label: const Text('Capture Problem Photos (Multiple Allowed)'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.borderSlate),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitIssue,
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.criticalRed),
                child: const Text('Submit Repair Ticket'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
