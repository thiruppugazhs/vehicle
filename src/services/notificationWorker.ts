import { Vehicle, ServiceSchedule, VehicleDocument, Driver, RepairTicket, NotificationItem } from '../types';
import { getDaysDifference } from '../utils/formatters';

export interface NotificationScanResult {
  newNotifications: NotificationItem[];
  scannedAt: string;
  summary: {
    servicesChecked: number;
    documentsChecked: number;
    licensesChecked: number;
    repairsChecked: number;
    alertsGenerated: number;
  };
}

/**
 * Background notification scan engine (Requirement 66 & 72)
 * Evaluates service schedules, mileage thresholds, document expirations (30, 15, 7, 0 days),
 * driver licenses, and overdue repair deadlines.
 */
export function runAutomatedNotificationScan(
  vehicles: Vehicle[],
  schedules: ServiceSchedule[],
  documents: VehicleDocument[],
  drivers: Driver[],
  repairs: RepairTicket[],
  existingNotifications: NotificationItem[]
): NotificationScanResult {
  const newNotifications: NotificationItem[] = [];
  const existingTitles = new Set(existingNotifications.map(n => `${n.title}_${n.message}`));

  const nowStr = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Service Schedules & Mileage Check
  schedules.forEach(sch => {
    const veh = vehicles.find(v => v.id === sch.vehicleId);
    if (!veh) return;

    // Check calendar due date
    if (sch.nextDueDate) {
      const daysLeft = getDaysDifference(sch.nextDueDate);
      if (daysLeft < 0) {
        const title = 'Service Overdue';
        const message = `Scheduled ${sch.name} for vehicle ${veh.registrationNumber} is overdue by ${Math.abs(daysLeft)} days.`;
        if (!existingTitles.has(`${title}_${message}`)) {
          newNotifications.push({
            id: `notif_auto_due_${sch.id}_${today}`,
            title,
            message,
            type: 'urgent',
            notificationType: 'service_overdue',
            timestamp: 'Just now',
            isRead: false,
            linkTo: { tab: 'maintenance', vehicleId: veh.id }
          });
        }
      } else if (daysLeft <= 7) {
        const title = 'Upcoming Service';
        const message = `Your vehicle ${veh.registrationNumber} is due for ${sch.name} in ${daysLeft === 0 ? 'today' : `${daysLeft} days`}.`;
        if (!existingTitles.has(`${title}_${message}`)) {
          newNotifications.push({
            id: `notif_auto_due_${sch.id}_${today}`,
            title,
            message,
            type: 'warning',
            notificationType: 'service_due',
            timestamp: 'Just now',
            isRead: false,
            linkTo: { tab: 'maintenance', vehicleId: veh.id }
          });
        }
      }
    }

    // Check mileage threshold
    if (sch.nextDueOdometer && veh.currentOdometer >= sch.nextDueOdometer) {
      const title = 'Mileage Threshold Exceeded';
      const message = `${veh.registrationNumber} reached ${veh.currentOdometer.toLocaleString()} km, exceeding schedule threshold for ${sch.name}.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_auto_mil_${sch.id}_${today}`,
          title,
          message,
          type: 'urgent',
          notificationType: 'service_overdue',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'maintenance', vehicleId: veh.id }
        });
      }
    }
  });

  // 2. Document Expiry Checks: 30-day, 15-day, 7-day, and Expired (Requirement 66)
  documents.forEach(doc => {
    const veh = vehicles.find(v => v.id === doc.vehicleId);
    if (!veh) return;

    const daysLeft = getDaysDifference(doc.expiryDate);

    if (daysLeft <= 0) {
      const title = 'Document Expired';
      const message = `${doc.documentType} (${doc.documentNumber}) for ${veh.registrationNumber} has EXPIRED. Immediate renewal required.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_doc_exp_${doc.id}_${today}`,
          title,
          message,
          type: 'urgent',
          notificationType: 'document_expiry',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'documents', vehicleId: veh.id }
        });
      }
    } else if (daysLeft <= 7) {
      const title = 'Document Expiring in 7 Days';
      const message = `${doc.documentType} for ${veh.registrationNumber} expires in ${daysLeft} days (${doc.expiryDate}).`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_doc_7d_${doc.id}_${today}`,
          title,
          message,
          type: 'urgent',
          notificationType: 'document_expiry',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'documents', vehicleId: veh.id }
        });
      }
    } else if (daysLeft <= 15) {
      const title = 'Document Expiring in 15 Days';
      const message = `${doc.documentType} for ${veh.registrationNumber} expires in ${daysLeft} days. Initiate compliance renewal.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_doc_15d_${doc.id}_${today}`,
          title,
          message,
          type: 'warning',
          notificationType: 'document_expiry',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'documents', vehicleId: veh.id }
        });
      }
    } else if (daysLeft <= 30) {
      const title = 'Document Expiring in 30 Days';
      const message = `${doc.documentType} for ${veh.registrationNumber} expires in ${daysLeft} days.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_doc_30d_${doc.id}_${today}`,
          title,
          message,
          type: 'info',
          notificationType: 'document_expiry',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'documents', vehicleId: veh.id }
        });
      }
    }
  });

  // 3. Driver License Expiry Checks
  drivers.forEach(drv => {
    if (!drv.licenseExpiry) return;
    const daysLeft = getDaysDifference(drv.licenseExpiry);

    if (daysLeft <= 0) {
      const title = 'Driver License Expired';
      const message = `Commercial transport license for ${drv.name} has expired on ${drv.licenseExpiry}. Driver cannot be dispatched.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_drv_exp_${drv.id}_${today}`,
          title,
          message,
          type: 'urgent',
          notificationType: 'service_overdue',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'drivers' }
        });
      }
    } else if (daysLeft <= 30) {
      const title = 'Driver License Expiry Soon';
      const message = `Driver license for ${drv.name} expires in ${daysLeft} days.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_drv_soon_${drv.id}_${today}`,
          title,
          message,
          type: 'warning',
          notificationType: 'service_due',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'drivers' }
        });
      }
    }
  });

  // 4. Repair Deadlines Checks
  repairs.forEach(rep => {
    if (rep.status === 'Completed' || rep.status === 'Closed') return;
    if (!rep.expectedCompletion) return;

    const daysLeft = getDaysDifference(rep.expectedCompletion);
    if (daysLeft < 0) {
      const veh = vehicles.find(v => v.id === rep.vehicleId);
      const title = 'Repair Target Date Overdue';
      const message = `Repair ticket ${rep.id} (${rep.issueTitle}) for ${veh?.registrationNumber || 'vehicle'} passed expected completion date by ${Math.abs(daysLeft)} days.`;
      if (!existingTitles.has(`${title}_${message}`)) {
        newNotifications.push({
          id: `notif_rep_overdue_${rep.id}_${today}`,
          title,
          message,
          type: 'urgent',
          notificationType: 'repair_completed',
          timestamp: 'Just now',
          isRead: false,
          linkTo: { tab: 'repairs', vehicleId: rep.vehicleId }
        });
      }
    }
  });

  return {
    newNotifications,
    scannedAt: nowStr,
    summary: {
      servicesChecked: schedules.length,
      documentsChecked: documents.length,
      licensesChecked: drivers.length,
      repairsChecked: repairs.length,
      alertsGenerated: newNotifications.length
    }
  };
}
