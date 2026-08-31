import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Wrench, CheckCheck, Trash2 } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useFleet();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications & System Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time alerts for overdue maintenance, impending expirations, and repairs.</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No system notifications currently queued.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.linkTo) setActiveTab(n.linkTo.tab, n.linkTo.vehicleId);
              }}
              className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3.5 ${
                !n.isRead ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'urgent' ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : n.type === 'warning' ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm ${!n.isRead ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-xs text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
