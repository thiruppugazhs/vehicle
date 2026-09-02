import React, { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  Wrench,
  AlertTriangle,
  MoreHorizontal,
  Receipt,
  FileText,
  Users,
  Bell,
  Settings,
  Shield,
  X,
  Gauge
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

interface MobileBottomNavProps {
  onOpenReportIssue?: () => void;
  onOpenUpdateOdometer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenReportIssue,
  onOpenUpdateOdometer
}) => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    repairs,
    vehicles,
    smartReminders,
    documents
  } = useFleet();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pendingRepairsCount = repairs.filter(r => r.status !== 'Completed' && r.status !== 'Closed').length;
  const criticalRemindersCount = smartReminders.filter(r => r.priority === 'Critical' && r.status === 'Pending').length;

  const mainTabs = [
    {
      id: 'dashboard',
      label: activeRole === 'Driver' ? 'Driver Home' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: vehicles.length > 0 ? vehicles.length : undefined
    },
    {
      id: 'maintenance',
      label: 'Service',
      icon: Wrench
    },
    {
      id: 'repairs',
      label: 'Repairs',
      icon: AlertTriangle,
      badge: pendingRepairsCount > 0 ? pendingRepairsCount : undefined
    }
  ];

  const secondaryTabs = [
    { id: 'expenses', label: 'Expenses & Fuel', icon: Receipt },
    { id: 'documents', label: 'Document Vault', icon: FileText, badge: documents.length },
    { id: 'reminders', label: 'Smart Reminders', icon: Bell, badge: criticalRemindersCount > 0 ? criticalRemindersCount : undefined },
    { id: 'drivers', label: 'Drivers & Fleet', icon: Users },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
    ...(activeRole === 'Owner' || activeRole === 'Fleet Manager'
      ? [{ id: 'admin', label: 'Admin Management', icon: Shield }]
      : [])
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[calc(env(safe-area-inset-bottom,0px)+0.375rem)]">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsMoreOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More Sheet Trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
              isMoreOpen || !mainTabs.some(t => t.id === activeTab)
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet Modal */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 z-10 max-h-[85vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-in slide-in-from-bottom duration-300 text-left">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Fleet Operations</h3>
                <p className="text-xs text-slate-500">Access secondary fleet modules and tools</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in More Sheet */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  if (onOpenReportIssue) onOpenReportIssue();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs hover:bg-amber-100 transition-colors text-left cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block">Report Issue</span>
                  <span className="text-[10px] font-normal text-amber-800">File breakdown</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  if (onOpenUpdateOdometer) onOpenUpdateOdometer();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-slate-800 text-white shrink-0">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <span className="block">Log Odometer</span>
                  <span className="text-[10px] font-normal text-slate-500">Record reading</span>
                </div>
              </button>
            </div>

            {/* Module Items */}
            <div className="space-y-1">
              {secondaryTabs.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
