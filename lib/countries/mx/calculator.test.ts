import { describe, expect, it } from "vitest";
import { calculateMX } from "./calculator";
import type { MXCalculatorInputs, MXTaxBreakdown } from "./types";

function createInputs(overrides: Partial<MXCalculatorInputs> = {}): MXCalculatorInputs {
  return {
    country: "MX",
    grossSalary: 600_000,
    payFrequency: "annual",
    state: "CMX",
    contributions: {
      voluntaryRetirementContribution: 0,
      medicalDentalExpenses: 0,
      funeralExpenses: 0,
      mortgageInterest: 0,
      educationExpenses: 0,
    },
    ...overrides,
  };
}

describe("Mexico calculator", () => {
  it("supports all states as informational regions", () => {
    const expected: MXCalculatorInputs["state"][] = [
      "AGU", "BCN", "BCS", "CAM", "CHP", "CHH", "CMX", "COA",
      "COL", "DUR", "GUA", "GRO", "HID", "JAL", "MEX", "MIC",
      "MOR", "NAY", "NLE", "OAX", "PUE", "QUE", "ROO", "SLP",
      "SIN", "SON", "TAB", "TAM", "TLA", "VER", "YUC", "ZAC",
    ];
    for (const state of expected) {
      const result = calculateMX(createInputs({ state }));
      expect(result.breakdown.type).toBe("MX");
      if (result.breakdown.type === "MX") {
        expect(result.breakdown.state).toBe(state);
        expect(result.breakdown.stateName.length).toBeGreaterThan(0);
      }
    }
  });

  it("models employee IMSS branches instead of a flat placeholder rate", () => {
    const result = calculateMX(createInputs());
    expect(result.breakdown.type).toBe("MX");
    if (result.breakdown.type === "MX") {
      expect(result.breakdown.imss.excessOverThreeUma).toBeGreaterThan(0);
      expect(result.breakdown.imss.pensionerMedical).toBeGreaterThan(0);
      expect(result.breakdown.imss.disabilityLife).toBeGreaterThan(0);
      const taxes = result.taxes as MXTaxBreakdown;
      expect(taxes.type).toBe("MX");
      expect(taxes.socialSecurity).toBe(result.breakdown.imss.total);
    }
  });
});
