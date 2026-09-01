import { describe, it, expect } from "vitest";
import { isValidRegPlate, isValidVIN } from "../src/utils/validationHelpers";

describe("ValidationHelpers", () => {
  it("validates standard registration plate", () => {
    expect(isValidRegPlate("TN 01 AB 1234")).toBe(true);
  });
  it("validates standard 17-character VIN", () => {
    expect(isValidVIN("MA1TC2MJ8M6E99100")).toBe(true);
  });
});
