import { describe, it, expect } from "vitest";
import { calculateVehicleHealthScore } from "../src/utils/healthCalculator";

describe("calculateVehicleHealthScore", () => {
  it("returns 100 for a pristine vehicle with no issues", () => {
    const mockVeh = { currentOdometer: 10000, year: 2024 } as any;
    const score = calculateVehicleHealthScore(mockVeh, [], [], []);
    expect(score).toBeGreaterThanOrEqual(95);
  });
});

it("penalizes score heavily when maintenance is overdue", () => {
  const mockVeh = { currentOdometer: 50000, year: 2023 } as any;
  const overdueReminders = [{ id: "1", remainingDays: -10, priority: "Critical", status: "Pending" }] as any;
  const score = calculateVehicleHealthScore(mockVeh, [], overdueReminders, []);
  expect(score).toBeLessThan(75);
});

it("penalizes score when critical repairs are unresolved", () => {
  const mockVeh = { currentOdometer: 30000, year: 2023 } as any;
  const criticalRepairs = [{ id: "r1", severity: "Critical", status: "Reported" }] as any;
  const score = calculateVehicleHealthScore(mockVeh, criticalRepairs, [], []);
  expect(score).toBeLessThan(70);
});
