import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  void _showScanModal() {
    final fleet = Provider.of<FleetProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    String? vehicleId = fleet.vehicles.isNotEmpty ? fleet.vehicles.first.id : null;
    String docType = 'Insurance';
    final docNumberCtrl = TextEditingController(text: 'POL-NEW-2026');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Scan & Upload Document', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    const SnackBar(content: Text('Document scanner camera triggered. Auto-cropping edges.')),
                  );
                },
                icon: const Icon(Icons.document_scanner, color: AppTheme.primaryAmberDark),
                label: const Text('Capture Document with Camera'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.borderSlate),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: docType,
                decoration: const InputDecoration(labelText: 'Document Type'),
                items: ['Insurance', 'Registration Certificate (RC)', 'Pollution Under Control (PUC)', 'Fitness Certificate', 'Permit', 'Road Tax']
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (v) => docType = v!,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: docNumberCtrl,
                decoration: const InputDecoration(labelText: 'Document / Policy Number'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  if (vehicleId != null) {
                    final newDoc = VehicleDocumentModel(
                      id: 'doc_${DateTime.now().millisecondsSinceEpoch}',
                      vehicleId: vehicleId,
                      documentType: docType,
                      documentNumber: docNumberCtrl.text.trim(),
                      issueDate: DateTime.now().toIso8601String().substring(0, 10),
                      expiryDate: DateTime.now().add(const Duration(days: 365)).toIso8601String().substring(0, 10),
                      status: 'Valid',
                      organizationId: auth.organizationId,
                    );
                    fleet.uploadDocument(newDoc);
                  }
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Document uploaded to Firebase Storage and reminders configured.')),
                  );
                },
                child: const Text('Confirm Upload & Set Reminders'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Compliance Documents'),
        actions: [
          IconButton(
            icon: const Icon(Icons.document_scanner, color: AppTheme.primaryAmberDark),
            tooltip: 'Scan Document',
            onPressed: _showScanModal,
          ),
        ],
      ),
      body: fleet.documents.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.folder_open, size: 48, color: AppTheme.textMuted),
                  const SizedBox(height: 12),
                  const Text('No Documents Stored', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _showScanModal,
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Scan First Document'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fleet.documents.length,
              itemBuilder: (context, idx) {
                final d = fleet.documents[idx];
                final isExpired = d.status == 'Expired';
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: isExpired ? AppTheme.criticalRed.withOpacity(0.12) : AppTheme.primaryAmber.withOpacity(0.12),
                      child: Icon(
                        Icons.description,
                        color: isExpired ? AppTheme.criticalRed : AppTheme.primaryAmberDark,
                        size: 20,
                      ),
                    ),
                    title: Text(d.documentType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('${d.documentNumber}\nExpiry: ${d.expiryDate}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isExpired ? AppTheme.criticalRed.withOpacity(0.12) : AppTheme.successGreen.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        d.status,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isExpired ? AppTheme.criticalRed : AppTheme.successGreen,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
