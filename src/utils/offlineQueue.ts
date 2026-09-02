export interface QueuedOdometerAction {
  id: string;
  type: 'ODOMETER';
  timestamp: string;
  payload: {
    vehicleId: string;
    newOdometer: number;
    notes?: string;
  };
}

export interface QueuedIssueAction {
  id: string;
  type: 'REPORT_ISSUE';
  timestamp: string;
  payload: {
    vehicleId: string;
    issueTitle: string;
    issueCategory: string;
    description: string;
    severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
    reportedDate: string;
    estimatedCost?: number;
    photoUrl?: string;
  };
}

export type OfflineAction = QueuedOdometerAction | QueuedIssueAction;

const QUEUE_KEY = 'fleetpulse_offline_queue_v1';

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('fleetpulse:offline-queue-changed', { detail: queue }));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
}

export function enqueueOfflineAction(action: Omit<QueuedOdometerAction, 'id' | 'timestamp'> | Omit<QueuedIssueAction, 'id' | 'timestamp'>): OfflineAction {
  const fullAction: OfflineAction = {
    ...action,
    id: 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString()
  } as OfflineAction;

  const current = getOfflineQueue();
  current.push(fullAction);
  saveOfflineQueue(current);
  return fullAction;
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('fleetpulse:offline-queue-changed', { detail: [] }));
  } catch (e) {
    console.error('Failed to clear offline queue:', e);
  }
}

export async function processOfflineQueue(handlers: {
  handleOdometer: (payload: QueuedOdometerAction['payload']) => Promise<void>;
  handleIssue: (payload: QueuedIssueAction['payload']) => Promise<void>;
}): Promise<{ processedCount: number; errorsCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { processedCount: 0, errorsCount: 0 };

  const remaining: OfflineAction[] = [];
  let processed = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      if (item.type === 'ODOMETER') {
        await handlers.handleOdometer(item.payload);
        processed++;
      } else if (item.type === 'REPORT_ISSUE') {
        await handlers.handleIssue(item.payload);
        processed++;
      }
    } catch (err) {
      console.error('Error syncing queued item:', item, err);
      errors++;
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  return { processedCount: processed, errorsCount: errors };
}
