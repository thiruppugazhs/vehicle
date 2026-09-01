import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';

class AddEditVehicleScreen extends StatefulWidget {
  const AddEditVehicleScreen({super.key});

  @override
  State<AddEditVehicleScreen> createState() => _AddEditVehicleScreenState();
}

class _AddEditVehicleScreenState extends State<AddEditVehicleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _regController = TextEditingController();
  final _nameController = TextEditingController();
  final _makeController = TextEditingController(text: 'Tata Motors');
  final _modelController = TextEditingController(text: 'Signa 4825.TK');
  final _odoController = TextEditingController(text: '12000');
  String _type = 'Truck';
  String _fuelType = 'Diesel';
  String _transmission = 'Manual';

  void _saveVehicle() {
    if (!_formKey.currentState!.validate()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    final newVehicle = VehicleModel(
      id: 'veh_${DateTime.now().millisecondsSinceEpoch}',
      registrationNumber: _regController.text.trim().toUpperCase(),
      name: _nameController.text.trim().isEmpty ? _modelController.text.trim() : _nameController.text.trim(),
      type: _type,
      manufacturer: _makeController.text.trim(),
      model: _modelController.text.trim(),
      year: 2024,
      currentOdometer: int.tryParse(_odoController.text) ?? 0,
      healthScore: 100,
      status: 'Active',
      fuelType: _fuelType,
      transmission: _transmission,
      organizationId: auth.organizationId,
    );

    fleet.addVehicle(newVehicle);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Vehicle ${newVehicle.registrationNumber} added to fleet.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Add Vehicle to Fleet'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Photo capture placeholder
              Center(
                child: InkWell(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Camera opened for vehicle image.')),
                    );
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: AppTheme.cardWhite,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.borderSlate),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.camera_alt_outlined, color: AppTheme.primaryAmberDark, size: 36),
                        SizedBox(height: 6),
                        Text('Take Photo', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _regController,
                        textCapitalization: TextCapitalization.characters,
                        decoration: const InputDecoration(
                          labelText: 'Registration Plate Number',
                          hintText: 'e.g. TN 09 AB 1234',
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Registration number is required' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Vehicle Nickname / Asset Tag',
                          hintText: 'e.g. Chennai Tipper 04',
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _makeController,
                              decoration: const InputDecoration(labelText: 'Manufacturer'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _modelController,
                              decoration: const InputDecoration(labelText: 'Model'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _odoController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Current Odometer (km)',
                          suffixText: 'km',
                        ),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _type,
                        decoration: const InputDecoration(labelText: 'Vehicle Type'),
                        items: ['Truck', 'Van', 'Bus', 'Car', 'Trailer']
                            .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                            .toList(),
                        onChanged: (v) => setState(() => _type = v!),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _fuelType,
                              decoration: const InputDecoration(labelText: 'Fuel Type'),
                              items: ['Diesel', 'Petrol', 'CNG', 'Electric']
                                  .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                                  .toList(),
                              onChanged: (v) => setState(() => _fuelType = v!),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _transmission,
                              decoration: const InputDecoration(labelText: 'Transmission'),
                              items: ['Manual', 'Automatic']
                                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                  .toList(),
                              onChanged: (v) => setState(() => _transmission = v!),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _saveVehicle,
                child: const Text('Save Vehicle to Firestore'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
