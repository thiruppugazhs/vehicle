export function calculateFuelEfficiency(distanceKm: number, liters: number): number {
  if (liters <= 0) return 0;
  return Number((distanceKm / liters).toFixed(2));
}

export function computeCostPerKm(totalCost: number, totalKm: number): number {
  if (totalKm <= 0) return 0;
  return Number((totalCost / totalKm).toFixed(2));
}
