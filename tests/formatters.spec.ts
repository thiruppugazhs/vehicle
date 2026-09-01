import { describe, it, expect } from "vitest";
import { formatCurrency, formatDistance } from "../src/utils/formatters";

describe("Formatters", () => {
  it("formats Indian Rupee currency correctly", () => {
    expect(formatCurrency(50000, "₹")).toContain("50,000");
  });
  it("formats distance with km metric", () => {
    expect(formatDistance(25000, "km")).toContain("25,000 km");
  });
});
