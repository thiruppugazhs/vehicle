import React from 'react';
import {
  LayoutDashboard,
  Car,
  Wrench,
  AlertTriangle,
  Receipt,
  Bell,
  FileText,
  Users,
  Building2,
  BarChart3,
  FileCheck,
  Settings,
  Shield,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    vehicles,
    smartReminders,
    repairs,
    documents,
    userProfile
  } = useFleet();

  // Dynamic badges for urgent attention
  const overdueCount = vehicles.filter(v => v.status === 'Overdue').length;
  const pendingRepairsCount = repairs.filter(r => r.status !== 'Resolved').length;
  const criticalRemindersCount = smartReminders.filter(r => r.priority === 'Critical' && r.status === 'Pending').length;
  const expiringDocsCount = documents.filter(d => d.status === 'Expiring Soon' || d.status === 'Expired').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: vehicles.length
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: overdueCount > 0 ? `${overdueCount} overdue` : undefined,
      badgeType: overdueCount > 0 ? 'critical' : 'neutral'
    },
    {
      id: 'repairs',
      label: 'Repairs & Issues',
      icon: AlertTriangle,
      badge: pendingRepairsCount > 0 ? pendingRepairsCount : undefined,
      badgeType: 'warning'
    },
    {
      id: 'expenses',
      label: 'Expenses & Fuel',
      icon: Receipt
    },
    {
      id: 'reminders',
      label: 'Smart Reminders',
      icon: Bell,
      badge: criticalRemindersCount > 0 ? criticalRemindersCount : undefined,
      badgeType: criticalRemindersCount > 0 ? 'critical' : 'neutral'
    },
    {
      id: 'documents',
      label: 'Document Vault',
      icon: FileText,
      badge: expiringDocsCount > 0 ? expiringDocsCount : undefined,
      badgeType: 'warning'
    },
    {
      id: 'drivers',
      label: 'Drivers',
      icon: Users
    },
    {
      id: 'service-centers',
      label: 'Service Centers',
      icon: Building2
    },
    {
      id: 'fleet-management',
      label: 'Fleet Analytics',
      icon: BarChart3
    },
    {
      id: 'reports',
      label: 'Reports & Logs',
      icon: FileCheck
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs group-hover:bg-amber-600 transition-colors">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                FleetPulse
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                  PRO
                </span>
              </span>
              <span className="block text-[11px] font-medium text-slate-400 -mt-0.5">
                Command Center
              </span>
            </div>
          </button>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Organization / Scope Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              {userProfile.fleetSizeBracket} Units
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
            {userProfile.organizationName || 'Personal Garage'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'vehicles' && activeTab === 'vehicle-details');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 font-semibold shadow-xs border border-amber-200/70'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-600 stroke-[2.2]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeType === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Promotion / Switch to Landing */}
        <div className="p-3 border-t border-slate-100 mt-auto">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Smart Maintenance AI
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Automatic predictive intervals for engine oil, brakes & tyre rotations active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
