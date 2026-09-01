import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:vehicle_mobile/providers/auth_provider.dart';
import 'package:vehicle_mobile/providers/fleet_provider.dart';
import 'package:vehicle_mobile/screens/main_nav_screen.dart';
import 'package:vehicle_mobile/theme/app_theme.dart';

void main() {
  testWidgets('MainNavScreen renders correctly with light theme', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => FleetProvider()),
        ],
        child: MaterialApp(
          theme: AppTheme.lightTheme,
          home: const MainNavScreen(),
        ),
      ),
    );

    await tester.pump();

    expect(find.text('Fleet Command'), findsOneWidget);
    expect(find.text('Quick Actions'), findsOneWidget);
    expect(find.byType(BottomNavigationBar), findsOneWidget);
  });
}
