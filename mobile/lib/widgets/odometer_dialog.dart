import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class OdometerDialog extends StatefulWidget {
  final VehicleModel vehicle;
  final Function(int newOdo, String notes) onConfirm;

  const OdometerDialog({
    super.key,
    required this.vehicle,
    required this.onConfirm,
  });

  @override
  State<OdometerDialog> createState() => _OdometerDialogState();
}

class _OdometerDialogState extends State<OdometerDialog> {
  late TextEditingController _odoController;
  final TextEditingController _notesController = TextEditingController();
  bool _isAuthorizedOverride = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _odoController = TextEditingController(text: '${widget.vehicle.currentOdometer + 150}');
  }

  @override
  Widget build(BuildContext context) {
    final currentOdo = widget.vehicle.currentOdometer;

    return AlertDialog(
      backgroundColor: AppTheme.cardWhite,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Update Odometer',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          Text(
            '${widget.vehicle.name} (${widget.vehicle.registrationNumber})',
            style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.backgroundLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderSlate),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Current Reading:', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  Text(
                    '$currentOdo km',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _odoController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'New Odometer (km)',
                suffixText: 'km',
                errorText: _error,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes / Reason',
                hintText: 'e.g. End of daily shift run',
              ),
            ),
            const SizedBox(height: 12),
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _isAuthorizedOverride,
              onChanged: (val) => setState(() => _isAuthorizedOverride = val ?? false),
              title: const Text(
                'Authorize Correction / Cluster Swap',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
        ),
        ElevatedButton(
          onPressed: () {
            final val = int.tryParse(_odoController.text);
            if (val == null || val < 0) {
              setState(() => _error = 'Please enter a valid mileage');
              return;
            }
            if (val < currentOdo && !_isAuthorizedOverride) {
              setState(() => _error = 'Mileage cannot decrease without authorization');
              return;
            }
            widget.onConfirm(val, _notesController.text);
            Navigator.pop(context);
          },
          child: const Text('Save Mileage'),
        ),
      ],
    );
  }
}
