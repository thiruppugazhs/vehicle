import React, { useState } from 'react';
import { useFleet, FleetProvider } from './context/FleetContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardView } from './components/dashboard/DashboardView';
import { VehiclesView } from './components/vehicles/VehiclesView';
import { VehicleDetailsView } from './components/vehicle-details/VehicleDetailsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { RepairsView } from './components/repairs/RepairsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { RemindersView } from './components/reminders/RemindersView';
import { DocumentsView } from './components/documents/DocumentsView';
import { DriversView } from './components/drivers/DriversView';
import { ServiceCentersView } from './components/service-centers/ServiceCentersView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddEditVehicleModal } from './components/vehicles/AddEditVehicleModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isOnboardingActive,
    isAddVehicleOpen,
    setIsAddVehicleOpen
  } = useFleet();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If in onboarding wizard flow
  if (isOnboardingActive) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <OnboardingWizard />
        <AuthModal />
      </div>
    );
  }

  // If viewing SaaS Landing Page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <LandingPage />
        <AuthModal />
      </div>
    );
  }

  // Primary Application Workspace with light theme
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'vehicles' && <VehiclesView />}
          {activeTab === 'vehicle-details' && <VehicleDetailsView />}
          {activeTab === 'maintenance' && <MaintenanceView />}
          {activeTab === 'repairs' && <RepairsView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'drivers' && <DriversView />}
          {activeTab === 'service-centers' && <ServiceCentersView />}
          {(activeTab === 'fleet-management' || activeTab === 'reports') && <AnalyticsView />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <AddEditVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <AppContent />
    </FleetProvider>
  );
}
