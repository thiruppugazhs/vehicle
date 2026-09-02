import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineQueue, processOfflineQueue, OfflineAction } from '../../utils/offlineQueue';
import { useFleet } from '../../context/FleetContext';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const { logOdometer, addRepairTicket, showToast } = useFleet();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        try {
          const result = await processOfflineQueue({
            handleOdometer: async (p) => {
              logOdometer(p.vehicleId, p.newOdometer, p.notes);
            },
            handleIssue: async (p) => {
              addRepairTicket({
                vehicleId: p.vehicleId,
                issueTitle: p.issueTitle,
                issueCategory: p.issueCategory,
                description: p.description,
                severity: p.severity,
                status: 'Reported',
                reportedDate: p.reportedDate,
                reportedBy: 'Offline Driver',
                estimatedCost: p.estimatedCost,
                photos: p.photoUrl ? [p.photoUrl] : []
              });
            }
          });

          if (result.processedCount > 0) {
            setSyncSuccess(true);
            showToast(`Synced ${result.processedCount} offline update(s) to Supabase.`);
            setTimeout(() => setSyncSuccess(false), 4000);
          }
        } catch (e) {
          console.error('Offline sync error:', e);
        } finally {
          setIsSyncing(false);
          setPendingCount(getOfflineQueue().length);
        }
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setPendingCount(getOfflineQueue().length);
    };

    const handleQueueChange = (e: any) => {
      const q: OfflineAction[] = e.detail || getOfflineQueue();
      setPendingCount(q.length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('fleetpulse:offline-queue-changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('fleetpulse:offline-queue-changed', handleQueueChange);
    };
  }, [logOdometer, addRepairTicket, showToast]);

  if (!isOffline && !syncSuccess && pendingCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full transition-all duration-300">
      {isOffline ? (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              You&apos;re offline. Some information may be outdated. Changes will sync when connection is restored.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-800 text-amber-100 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-2">
              {pendingCount} queued
            </span>
          )}
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Synchronizing queued changes with Supabase...</span>
        </div>
      ) : syncSuccess ? (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>All offline actions successfully synchronized!</span>
        </div>
      ) : null}
    </div>
  );
};
