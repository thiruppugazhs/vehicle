import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/quick_action_sheet.dart';
import 'home/home_dashboard_screen.dart';
import 'vehicles/vehicle_list_screen.dart';
import 'maintenance/maintenance_screen.dart';
import 'repairs/repairs_screen.dart';
import 'more/more_menu_screen.dart';
import 'vehicles/add_edit_vehicle_screen.dart';
import 'maintenance/record_service_screen.dart';
import 'repairs/report_issue_screen.dart';
import 'expenses/add_expense_screen.dart';
import 'documents/documents_screen.dart';
import '../../widgets/odometer_dialog.dart';
import 'package:provider/provider.dart';
import '../providers/fleet_provider.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeDashboardScreen(),
    VehicleListScreen(),
    MaintenanceScreen(),
    RepairsScreen(),
    MoreMenuScreen(),
  ];

  void _openQuickActionSheet() {
    final fleet = Provider.of<FleetProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => QuickActionSheet(
        onAddVehicle: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditVehicleScreen())),
        onRecordService: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecordServiceScreen())),
        onReportIssue: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportIssueScreen())),
        onAddExpense: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddExpenseScreen())),
        onUploadDocument: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DocumentsScreen())),
        onUpdateOdometer: () {
          if (fleet.vehicles.isNotEmpty) {
            showDialog(
              context: context,
              builder: (_) => OdometerDialog(
                vehicle: fleet.vehicles.first,
                onConfirm: (val, notes) => fleet.updateOdometer(fleet.vehicles.first.id, val, notes),
              ),
            );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openQuickActionSheet,
        backgroundColor: AppTheme.primaryAmber,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: const Icon(Icons.flash_on, color: Colors.white, size: 26),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.directions_car_outlined),
            activeIcon: Icon(Icons.directions_car),
            label: 'Vehicles',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build_outlined),
            activeIcon: Icon(Icons.build),
            label: 'Maintenance',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.handyman_outlined),
            activeIcon: Icon(Icons.handyman),
            label: 'Repairs',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view),
            label: 'More',
          ),
        ],
      ),
    );
  }
}
