import React from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  ShieldCheck,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Modal } from '../common/Modal';

export const NotificationPreferencesModal: React.FC = () => {
  const {
    isNotificationPreferencesOpen,
    setIsNotificationPreferencesOpen,
    notificationPreferences,
    updateNotificationPreferences
  } = useFleet();

  const handleToggle = (key: keyof typeof notificationPreferences) => {
    updateNotificationPreferences({ [key]: !notificationPreferences[key] });
  };

  const handleRequestPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        updateNotificationPreferences({
          browserPushNotifications: permission === 'granted',
          pushPermission: permission as any
        });
      });
    } else {
      alert('Browser Push Notifications are simulated and active in FleetPulse.');
      updateNotificationPreferences({
        browserPushNotifications: true,
        pushPermission: 'granted'
      });
    }
  };

  return (
    <Modal
      isOpen={isNotificationPreferencesOpen}
      onClose={() => setIsNotificationPreferencesOpen(false)}
      title="Notification Preferences & Alert Channels"
      subtitle="Configure delivery channels and expiration alert warning schedules."
      maxWidth="md"
    >
      <div className="space-y-5 text-left text-xs">
        {/* Delivery Channels (Requirement 21) */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-600" />
            Alert Delivery Channels
          </h4>
          <div className="space-y-2.5">
            {/* In-app */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">In-App Notifications</p>
                  <p className="text-[11px] text-slate-500">Live badge counters and activity feed</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences.inAppNotifications}
                onChange={() => handleToggle('inAppNotifications')}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Email notifications */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-[11px] text-slate-500">Dispatch summaries and expiry notices</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Browser push notifications */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Browser Push Notifications</p>
                  <p className="text-[11px] text-slate-500">Desktop & mobile web browser push banners</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notificationPreferences.browserPushNotifications}
                  onChange={handleRequestPush}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Reminders Schedule (Requirement 29) */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Automated Document & Service Due Alert Tiers
          </h4>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Select automated intervals for insurance, PUC, fitness, and service schedule reminders:
          </p>
          <div className="space-y-2">
            {[
              { key: 'notify30DaysBefore', label: '30 Days Before Expiry' },
              { key: 'notify15DaysBefore', label: '15 Days Before Expiry' },
              { key: 'notify7DaysBefore', label: '7 Days Before Expiry' },
              { key: 'notify1DayBefore', label: '1 Day Before Expiry' },
              { key: 'notifyOnExpiry', label: 'On Expiry Date' }
            ].map(tier => (
              <label
                key={tier.key}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70"
              >
                <span className="font-semibold text-slate-800">{tier.label}</span>
                <input
                  type="checkbox"
                  checked={(notificationPreferences as any)[tier.key]}
                  onChange={() => handleToggle(tier.key as any)}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Critical Breakdown & Overdue Alerts</p>
              <p className="text-[10px] text-rose-700">Immediate delivery bypassing batch digestion</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationPreferences.criticalAlertsImmediate}
            onChange={() => handleToggle('criticalAlertsImmediate')}
            className="w-4 h-4 accent-rose-600"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsNotificationPreferencesOpen(false)}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
};
