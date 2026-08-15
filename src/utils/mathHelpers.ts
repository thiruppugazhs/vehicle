export function calculateFuelEfficiency(distanceKm: number, liters: number): number {
  if (liters <= 0) return 0;
  return Number((distanceKm / liters).toFixed(2));
}
