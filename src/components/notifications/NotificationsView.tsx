import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  CheckCheck,
  Trash2,
  Settings2,
  Clock,
  FileText,
  CreditCard,
  User,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { NotificationType } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setIsNotificationPreferencesOpen,
    setActiveTab
  } = useFleet();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filterType === 'ALL' || n.category === filterType || n.type === filterType;
    const matchesUnread = !unreadOnly || !n.isRead;
    return matchesFilter && matchesUnread;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryIcon = (category?: NotificationType, type?: string) => {
    switch (category) {
      case 'Service due':
      case 'Service overdue':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'Insurance expiry':
      case 'PUC expiry':
      case 'Document expiry':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'Repair completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Repair delayed':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'New expense':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'Driver license expiry':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return type === 'urgent' ? (
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        ) : (
          <Bell className="w-4 h-4 text-amber-600" />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Top Header (Requirement 40) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized alerts for preventative services, insurance & statutory expirations, breakdown milestones, and fleet spend.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All as Read
            </button>
          )}

          <button
            onClick={() => setIsNotificationPreferencesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-600" />
            Preferences
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5">
          {['ALL', 'Service due', 'Service overdue', 'Insurance expiry', 'Repair completed', 'New expense'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
                filterType === cat ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 shrink-0 pl-2 border-l border-slate-200">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={e => setUnreadOnly(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold">No notifications match your current filter.</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3.5 ${
                !n.isRead ? 'bg-amber-50/20' : ''
              }`}
            >
              <div
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.linkTo) setActiveTab(n.linkTo.tab, n.linkTo.vehicleId);
                }}
                className="flex items-start gap-3.5 flex-1 cursor-pointer min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(n.category, n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs sm:text-sm ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title}
                      </h4>
                      {n.category && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md hidden sm:inline-block">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>

              {/* Actions (Requirement 40) */}
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Mark as Read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
