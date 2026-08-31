import { Vehicle, RepairTicket, SmartReminder, VehicleDocument } from '../types';

export interface HealthEvaluation {
  score: number;
  grade: 'Good' | 'Attention Needed' | 'Critical';
  summary: string;
  penalties: string[];
}

export const computeVehicleHealthScore = (
  vehicle: Vehicle,
  repairs: RepairTicket[] = [],
  reminders: SmartReminder[] = [],
  documents: VehicleDocument[] = []
): HealthEvaluation => {
  let score = 100;
  const penalties: string[] = [];

  // 1. Check vehicle status
  if (vehicle.status === 'Overdue') {
    score -= 28;
    penalties.push('Scheduled maintenance is overdue (-28)');
  } else if (vehicle.status === 'Due for Service') {
    score -= 12;
    penalties.push('Routine service is due (-12)');
  } else if (vehicle.status === 'Under Maintenance') {
    score -= 10;
    penalties.push('Currently undergoing routine maintenance (-10)');
  }

  // 2. Active unresolved repair tickets for this vehicle
  const vehicleRepairs = repairs.filter(r => r.vehicleId === vehicle.id && r.status !== 'Resolved');
  for (const rep of vehicleRepairs) {
    if (rep.severity === 'Critical') {
      score -= 30;
      penalties.push(`Active critical repair issue: "${rep.issueTitle}" (-30)`);
    } else if (rep.severity === 'High') {
      score -= 18;
      penalties.push(`Active high severity issue: "${rep.issueTitle}" (-18)`);
    } else if (rep.severity === 'Medium') {
      score -= 10;
      penalties.push(`Pending medium repair: "${rep.issueTitle}" (-10)`);
    } else {
      score -= 5;
    }
  }

  // 3. Check for overdue/critical reminders
  const criticalReminders = reminders.filter(
    rem => rem.vehicleId === vehicle.id && rem.status === 'Pending' && rem.priority === 'Critical'
  );
  if (criticalReminders.length > 0) {
    score -= 15;
    penalties.push('Has critical pending reminders (-15)');
  }

  // 4. Check expired compliance documents
  const expiredDocs = documents.filter(
    d => d.vehicleId === vehicle.id && d.status === 'Expired'
  );
  if (expiredDocs.length > 0) {
    score -= 15;
    penalties.push(`Expired compliance documents: ${expiredDocs.map(d => d.documentType).join(', ')} (-15)`);
  }

  // 5. Age & high mileage wear factor
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - vehicle.year);
  if (age >= 7) {
    score -= 5;
    penalties.push(`Vehicle age exceeds 7 years (-5)`);
  }
  if (vehicle.currentOdometer > 150000) {
    score -= 5;
    penalties.push(`High odometer wear (>150,000 km) (-5)`);
  }

  // Clamp score
  const finalScore = Math.max(15, Math.min(100, Math.round(score)));

  let grade: 'Good' | 'Attention Needed' | 'Critical' = 'Good';
  let summary = 'Vehicle is in good condition.';

  if (finalScore < 60) {
    grade = 'Critical';
    summary = 'Vehicle requires immediate operational attention and repairs.';
  } else if (finalScore < 80) {
    grade = 'Attention Needed';
    summary = 'Vehicle maintenance or inspection required soon.';
  }

  return {
    score: finalScore,
    grade,
    summary,
    penalties
  };
};
