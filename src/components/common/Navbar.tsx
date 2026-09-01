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
  ExternalLink,
  Building,
  Shield,
  User,
  Layers,
  History,
  FileText,
  Gauge
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { HelpGuideModal } from './HelpGuideModal';
import { OperationalRole } from '../../types';

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
    activeTab,
    setActiveTab,
    setIsAddVehicleOpen,
    setIsAddServiceOpen,
    setIsReportIssueOpen,
    setIsAddExpenseOpen,
    setIsUpdateOdometerOpen,
    userProfile,
    updateUserProfile,
    resetToDemoData,
    organization,
    organizations,
    switchOrganization,
    activeRole,
    switchRole,
    toastMessage
  } = useFleet();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

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
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgMenuOpen(false);
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

  const rolesList: OperationalRole[] = ['Owner', 'Fleet Manager', 'Driver', 'Technician'];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
        {/* Left: Mobile Menu Toggle & Search Bar & Workspace Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Input */}
          <div
            onClick={() => setIsGlobalSearchOpen(true)}
            className="relative w-full max-w-xs sm:max-w-sm cursor-pointer"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              readOnly
              value={globalSearchQuery}
              placeholder="Global search (Ctrl+K)..."
              className="w-full pl-10 pr-14 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 cursor-pointer placeholder:text-slate-400 font-medium"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </span>
          </div>

          {/* Workspace Switcher (Requirement 42) */}
          <div className="relative hidden xl:block" ref={orgRef}>
            <button
              onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Switch Workspace Organization"
            >
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate max-w-[120px]">{organization.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isOrgMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-left">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Organization Workspace
                </div>
                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsOrgMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                      org.id === organization.id
                        ? 'bg-amber-50 font-bold text-amber-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{org.name}</span>
                    {org.id === organization.id && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-extrabold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Operational Role Switcher (Requirement 41) */}
          <div className="relative hidden lg:block" ref={roleRef}>
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-extrabold text-amber-900 transition-colors cursor-pointer"
              title="Switch Operational Role Persona"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Role: {activeRole}</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute left-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-left">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Operational Role
                </div>
                {rolesList.map(roleItem => (
                  <button
                    key={roleItem}
                    onClick={() => {
                      switchRole(roleItem);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                      roleItem === activeRole
                        ? 'bg-amber-50 font-bold text-amber-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{roleItem}</span>
                    {roleItem === activeRole && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications, Help & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Dropdown */}
          <div className="relative" ref={actionRef}>
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden md:inline">Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-left">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Create New Entry
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setIsAddVehicleOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Add New Vehicle</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setIsAddServiceOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Log Service Record</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setIsReportIssueOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Report Breakdown / Issue</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setIsAddExpenseOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Log Fuel / Expense</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setActiveTab('documents');
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Upload Document</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setIsUpdateOdometerOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Gauge className="w-4 h-4 text-purple-600" />
                  <span>Update Odometer</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 text-left">
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
                      className="text-xs text-amber-600 hover:text-amber-800 font-semibold cursor-pointer"
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
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 h-fit">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsNotificationPreferencesOpen(true);
                    }}
                    className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    Alert Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setActiveTab('reminders');
                    }}
                    className="text-amber-600 hover:text-amber-800 font-bold cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Modal Trigger (Requirement 53) */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
            title="Help Guide & Shortcuts"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
              />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{userProfile.name}</p>
                <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{activeRole}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 text-left">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{userProfile.name}</p>
                  <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Role: {activeRole}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('settings');
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Account & Fleet Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('audit');
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <History className="w-4 h-4 text-slate-500 mr-2" />
                    Audit Logs & Activity
                  </button>
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 cursor-pointer"
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
                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
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
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Toast Notification (Requirement 54) */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
