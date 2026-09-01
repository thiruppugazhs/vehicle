import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';

class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedVehicleId;
  String _category = 'Fuel';
  final _amountController = TextEditingController();
  final _vendorController = TextEditingController(text: 'Indian Oil Depot');
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    if (fleet.vehicles.isNotEmpty) {
      _selectedVehicleId = fleet.vehicles.first.id;
    }
  }

  void _submitExpense() {
    if (!_formKey.currentState!.validate() || _selectedVehicleId == null) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    final expense = ExpenseModel(
      id: 'exp_${DateTime.now().millisecondsSinceEpoch}',
      vehicleId: _selectedVehicleId!,
      category: _category,
      amount: double.tryParse(_amountController.text) ?? 0.0,
      date: DateTime.now().toIso8601String().substring(0, 10),
      vendor: _vendorController.text.trim(),
      notes: _notesController.text.trim(),
      organizationId: auth.organizationId,
    );

    fleet.addExpense(expense);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Expense logged successfully.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Add Fleet Expense'),
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
                        validator: (v) => v == null ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _category,
                        decoration: const InputDecoration(labelText: 'Expense Category'),
                        items: ['Fuel', 'Toll', 'Maintenance', 'Insurance', 'Tax', 'Repair', 'Driver Allowance', 'Other']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (val) => setState(() => _category = val!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _amountController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Amount (₹)', prefixText: '₹'),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Amount is required' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _vendorController,
                        decoration: const InputDecoration(labelText: 'Vendor / Fuel Station'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _notesController,
                        decoration: const InputDecoration(labelText: 'Notes / Fuel Liters / Remarks'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Camera opened to capture bill receipt.')),
                  );
                },
                icon: const Icon(Icons.receipt, color: AppTheme.primaryAmberDark),
                label: const Text('Capture Receipt Photo'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textDark,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.borderSlate),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitExpense,
                child: const Text('Save Expense Record'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
