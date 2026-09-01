import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Dispatches native FCM Push Notifications to devices registered under a user or organization.
 * Requirement 7, 8, 9, 10: Native push notifications for Android, iOS, and Web.
 */
async function sendPushNotification(
  userIds: string[],
  orgId: string,
  payload: PushPayload
): Promise<number> {
  let tokensQuery = db.collection('device_tokens').where('organizationId', '==', orgId);
  if (userIds.length > 0) {
    tokensQuery = db.collection('device_tokens').where('userId', 'in', userIds.slice(0, 10));
  }

  const snapshot = await tokensQuery.get();
  if (snapshot.empty) {
    console.log(`No active device tokens found for org: ${orgId}`);
    return 0;
  }

  const tokens: string[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.fcmToken && data.active !== false) {
      tokens.push(data.fcmToken);
    }
  });

  if (tokens.length === 0) return 0;

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: payload.data || {},
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'fleet_alerts',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      }
    }
  };

  const response = await messaging.sendEachForMulticast(message);
  console.log(`Successfully delivered ${response.successCount} of ${tokens.length} push notifications.`);
  return response.successCount;
}

// -----------------------------------------------------------------------------
// 1. SCHEDULED CRON: Service Reminders Check (Requirement 6, 9, 50, 72)
// -----------------------------------------------------------------------------
export const checkServiceRemindersScheduled = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('UTC')
  .onRun(async () => {
    const now = new Date();

    const schedulesSnap = await db.collection('maintenance_schedules').get();
    for (const doc of schedulesSnap.docs) {
      const schedule = doc.data();
      const dueDate = new Date(schedule.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      // Trigger alerts at 30, 15, 7, 1 day, or overdue
      if (diffDays <= 7) {
        const vehicleSnap = await db.collection('vehicles').doc(schedule.vehicleId).get();
        const vehicle = vehicleSnap.data();
        const vehicleReg = vehicle ? vehicle.registrationNumber : 'Vehicle';

        const title = diffDays < 0 ? 'Service Overdue!' : 'Upcoming Service Reminder';
        const body = diffDays < 0
          ? `Maintenance for ${vehicleReg} is overdue by ${Math.abs(diffDays)} days.`
          : `Your vehicle ${vehicleReg} is due for ${schedule.name} in ${diffDays} days.`;

        // Store notification document
        await db.collection('notifications').add({
          title,
          message: body,
          type: diffDays < 0 ? 'urgent' : 'warning',
          notificationType: diffDays < 0 ? 'service_overdue' : 'service_due',
          organizationId: schedule.organizationId,
          vehicleId: schedule.vehicleId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
          linkTo: {
            screen: 'maintenance',
            vehicleId: schedule.vehicleId
          }
        });

        // Dispatch FCM Push Notification (Requirement 9 & 10)
        await sendPushNotification([], schedule.organizationId, {
          title,
          body,
          data: {
            screen: 'maintenance',
            vehicleId: schedule.vehicleId
          }
        });
      }
    }
  });

// -----------------------------------------------------------------------------
// 2. SCHEDULED CRON: Document Expiry Check (Requirement 66)
// -----------------------------------------------------------------------------
export const checkDocumentExpiryScheduled = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('UTC')
  .onRun(async () => {
    const now = new Date();
    const docsSnap = await db.collection('vehicle_documents').get();

    for (const doc of docsSnap.docs) {
      const docData = doc.data();
      const expiry = new Date(docData.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 30 || diffDays === 15 || diffDays === 7 || diffDays <= 0) {
        const title = diffDays <= 0 ? 'Document Expired' : `Document Expiring in ${diffDays} Days`;
        const body = `${docData.documentType} (${docData.documentNumber}) requires compliance renewal.`;

        await db.collection('notifications').add({
          title,
          message: body,
          type: diffDays <= 0 ? 'urgent' : 'warning',
          notificationType: 'document_expiry',
          organizationId: docData.organizationId,
          vehicleId: docData.vehicleId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
          linkTo: {
            screen: 'documents',
            vehicleId: docData.vehicleId
          }
        });

        await sendPushNotification([], docData.organizationId, {
          title,
          body,
          data: {
            screen: 'documents',
            vehicleId: docData.vehicleId
          }
        });
      }
    }
  });

// -----------------------------------------------------------------------------
// 3. FIRESTORE TRIGGER: Repair Created (Requirement 22, 51, 65)
// -----------------------------------------------------------------------------
export const onRepairCreated = functions.firestore
  .document('repair_tickets/{ticketId}')
  .onCreate(async (snap, context) => {
    const repair = snap.data();

    // Mark vehicle as 'Under Repair'
    if (repair.vehicleId) {
      await db.collection('vehicles').doc(repair.vehicleId).update({
        status: 'Under Repair',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Log Activity
    await db.collection('activity_logs').add({
      organizationId: repair.organizationId,
      type: 'repair',
      title: `Issue Reported: ${repair.issueTitle}`,
      description: `Severity: ${repair.severity}. Vehicle status updated to Under Repair.`,
      vehicleId: repair.vehicleId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send FCM Notification
    await sendPushNotification([], repair.organizationId, {
      title: 'New Vehicle Issue Reported',
      body: `Issue: "${repair.issueTitle}" reported with ${repair.severity} severity.`,
      data: {
        screen: 'repairs',
        repairId: context.params.ticketId,
        vehicleId: repair.vehicleId
      }
    });
  });

// -----------------------------------------------------------------------------
// 4. FIRESTORE TRIGGER: Repair Completed (Requirement 22, 51, 65)
// -----------------------------------------------------------------------------
export const onRepairCompleted = functions.firestore
  .document('repair_tickets/{ticketId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'Completed' && after.status === 'Completed') {
      const vehicleId = after.vehicleId;

      // 1. Reset vehicle status to 'Active'
      if (vehicleId) {
        await db.collection('vehicles').doc(vehicleId).update({
          status: 'Active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // 2. Compute Downtime Hours
      const start = new Date(after.startDate || after.reportedDate).getTime();
      const end = new Date(after.actualCompletion || new Date().toISOString()).getTime();
      const downtimeHours = Math.max(1, Math.round((end - start) / (1000 * 3600)));

      // 3. Record in downtime_records
      await db.collection('downtime_records').add({
        organizationId: after.organizationId,
        vehicleId: after.vehicleId,
        repairId: context.params.ticketId,
        downtimeHours,
        startDate: after.startDate || after.reportedDate,
        endDate: after.actualCompletion || new Date().toISOString(),
        cost: after.actualCost || after.estimatedCost || 0
      });

      // 4. Record Expense automatically
      if (after.actualCost && after.actualCost > 0) {
        await db.collection('expenses').add({
          organizationId: after.organizationId,
          vehicleId: after.vehicleId,
          category: 'Repair',
          amount: after.actualCost,
          date: new Date().toISOString().slice(0, 10),
          vendor: after.serviceCenterName || 'Workshop',
          notes: `Completed repair: ${after.issueTitle}`
        });
      }

      // 5. Send completion push notification
      await sendPushNotification([], after.organizationId, {
        title: 'Repair Completed',
        body: `Repair ticket "${after.issueTitle}" completed. Vehicle returned to Active service.`,
        data: {
          screen: 'repairs',
          repairId: context.params.ticketId,
          vehicleId: after.vehicleId
        }
      });
    }
  });

// -----------------------------------------------------------------------------
// 5. CALLABLE API: Register & Deactivate Device Tokens (Requirement 8)
// -----------------------------------------------------------------------------
export const registerDeviceToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to register device tokens.');
  }

  const { fcmToken, platform, deviceId, organizationId } = data;
  if (!fcmToken || !platform) {
    throw new functions.https.HttpsError('invalid-argument', 'fcmToken and platform are required.');
  }

  const docId = `${context.auth.uid}_${deviceId || platform}`;
  await db.collection('device_tokens').doc(docId).set({
    userId: context.auth.uid,
    organizationId: organizationId || 'org_01',
    deviceId: deviceId || 'unknown',
    platform, // 'android' | 'ios' | 'web'
    fcmToken,
    active: true,
    lastActive: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true, tokenId: docId };
});

export const unregisterDeviceToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) return { success: false };
  const { deviceId, platform } = data;
  const docId = `${context.auth.uid}_${deviceId || platform}`;
  await db.collection('device_tokens').doc(docId).update({
    active: false,
    deactivatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true };
});
