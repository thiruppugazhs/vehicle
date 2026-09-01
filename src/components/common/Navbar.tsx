import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Car,
  Wrench,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { formatDate } from '../../utils/formatters';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isNotificationPreferencesOpen,
    setIsNotificationPreferencesOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    setIsAddVehicleOpen,
    setIsAddServiceOpen,
    setIsReportIssueOpen,
    setIsAddExpenseOpen,
    userProfile,
    updateUserProfile,
    resetToDemoData
  } = useFleet();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns on outside click and handle Ctrl+K shortcut
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsGlobalSearchOpen]);

  const handleSwitchPersona = () => {
    if (userProfile.role === 'Fleet Manager') {
      updateUserProfile({
        name: 'Rahul Sharma',
        role: 'Individual Vehicle Owner',
        organizationName: 'Personal Garage',
        fleetSizeBracket: '1'
      });
    } else {
      updateUserProfile({
        name: 'Vikram Malhotra',
        role: 'Fleet Manager',
        organizationName: 'Apex Fleet & Logistics Solutions',
        fleetSizeBracket: '6–20'
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          className="relative w-full max-w-md cursor-pointer"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            readOnly
            value={globalSearchQuery}
            placeholder="Global search (Vehicles, Repairs, Expenses...)"
            className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 cursor-pointer placeholder:text-slate-400 font-medium"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Help & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Dropdown */}
        <div className="relative" ref={actionRef}>
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline">Quick Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Create New Entry
              </div>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsAddVehicleOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-colors"
              >
                <Car className="w-4 h-4 text-amber-600" />
                <span>Add New Vehicle</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsAddServiceOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-colors"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Log Service Record</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsReportIssueOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Report Breakdown / Issue</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsAddExpenseOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-colors"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Log Fuel / Expense</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-amber-600 hover:text-amber-800 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTo) {
                          setActiveTab(n.linkTo.tab, n.linkTo.vehicleId);
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !n.isRead ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'urgent' ? (
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : n.type === 'warning' ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <Wrench className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs px-3">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    setIsNotificationPreferencesOpen(true);
                  }}
                  className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Preferences
                </button>
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    setActiveTab('notifications');
                  }}
                  className="font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Modal Trigger */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="hidden sm:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors"
          title="Command Center Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
            />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{userProfile.name}</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{userProfile.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{userProfile.name}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {userProfile.role}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('settings');
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700"
                >
                  Account & Fleet Settings
                </button>
                <button
                  onClick={handleSwitchPersona}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-700"
                >
                  <span>Switch Role Persona</span>
                  <span className="text-[11px] text-slate-400">Toggle Mode</span>
                </button>
                <button
                  onClick={() => {
                    resetToDemoData();
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Demo Data
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('landing');
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Landing Page
                  </span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('landing');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">FleetPulse Digital Command Center</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              FleetPulse provides a unified digital command center for individual owners, small businesses, and commercial fleet operators to reduce vehicle downtime and track service schedules.
            </p>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">Smart Service Reminders</p>
                <p className="mt-0.5">Calculates service due thresholds based on both calendar interval and odometer projections.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">0–100 Vehicle Health Score</p>
                <p className="mt-0.5">Evaluates overdue services, open repairs, document expirations, and age wear factors in real time.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">Compliance & Expiry Vault</p>
                <p className="mt-0.5">Never miss Insurance, PUC, Fitness, or Permit renewal deadlines with automated advance countdowns.</p>
              </div>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
