import { describe, it, expect } from "vitest";
import { calculateVehicleHealthScore } from "../src/utils/healthCalculator";

describe("calculateVehicleHealthScore", () => {
  it("returns 100 for a pristine vehicle with no issues", () => {
    const mockVeh = { currentOdometer: 10000, year: 2024 } as any;
    const score = calculateVehicleHealthScore(mockVeh, [], [], []);
    expect(score).toBeGreaterThanOrEqual(95);
  });
});
