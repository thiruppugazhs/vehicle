import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/fleet_provider.dart';
import '../../theme/app_theme.dart';
import 'add_expense_screen.dart';

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fleet = Provider.of<FleetProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Fleet Expenses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.primaryAmberDark),
            tooltip: 'Add Expense',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddExpenseScreen())),
          ),
        ],
      ),
      body: fleet.expenses.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.receipt_long_outlined, size: 48, color: AppTheme.textMuted),
                  const SizedBox(height: 12),
                  const Text('No Expenses Logged', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddExpenseScreen())),
                    child: const Text('Record First Expense'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: fleet.expenses.length,
              itemBuilder: (context, idx) {
                final e = fleet.expenses[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primaryAmber.withOpacity(0.12),
                      child: const Icon(Icons.receipt, color: AppTheme.primaryAmberDark, size: 20),
                    ),
                    title: Text(e.category, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('${e.date} • ${e.vendor}\n${e.notes ?? ""}'),
                    trailing: Text('₹${e.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                );
              },
            ),
    );
  }
}
