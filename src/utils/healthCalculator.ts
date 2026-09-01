import { Vehicle, RepairTicket, SmartReminder, VehicleDocument } from '../types';

export type HealthTier = 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';

export interface HealthEvaluation {
  score: number;
  grade: HealthTier;
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
  const vehicleRepairs = repairs.filter(r => r.vehicleId === vehicle.id && r.status !== 'Completed' && r.status !== 'Closed');
  for (const rep of vehicleRepairs) {
    if (rep.severity === 'Critical') {
      score -= 30;
      penalties.push(`Active critical repair issue: "${rep.issueTitle}" (-30)`);
    } else if (rep.severity === 'Major') {
      score -= 18;
      penalties.push(`Active major severity issue: "${rep.issueTitle}" (-18)`);
    } else if (rep.severity === 'Moderate') {
      score -= 10;
      penalties.push(`Pending moderate repair: "${rep.issueTitle}" (-10)`);
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

  // Requirement 71: Exact 4 tiers: 90-100 Excellent, 70-89 Good, 50-69 Needs Attention, Below 50 Critical
  let grade: HealthTier = 'Excellent';
  let summary = 'Vehicle is in prime mechanical and compliance condition.';

  if (finalScore < 50) {
    grade = 'Critical';
    summary = 'Vehicle requires immediate operational shutdown or urgent maintenance.';
  } else if (finalScore < 70) {
    grade = 'Needs Attention';
    summary = 'Scheduled services or unresolved moderate issues require timely attention.';
  } else if (finalScore < 90) {
    grade = 'Good';
    summary = 'Vehicle is operating reliably with minor routine service approaching.';
  }

  return {
    score: finalScore,
    grade,
    summary,
    penalties
  };
};

export const calculateVehicleHealthScore = (
  vehicle: Vehicle,
  repairs: RepairTicket[] = [],
  reminders: SmartReminder[] = [],
  documents: VehicleDocument[] = []
): number => {
  return computeVehicleHealthScore(vehicle, repairs, reminders, documents).score;
};
