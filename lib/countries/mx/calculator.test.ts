import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
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
      assert.equal(result.breakdown.type, "MX");
      if (result.breakdown.type === "MX") {
        assert.equal(result.breakdown.state, state);
        assert.ok(result.breakdown.stateName.length > 0);
      }
    }
  });

  it("models employee IMSS branches instead of a flat placeholder rate", () => {
    const result = calculateMX(createInputs());
    assert.equal(result.breakdown.type, "MX");
    if (result.breakdown.type === "MX") {
      assert.ok(result.breakdown.imss.excessOverThreeUma > 0);
      assert.ok(result.breakdown.imss.pensionerMedical > 0);
      assert.ok(result.breakdown.imss.disabilityLife > 0);
      const taxes = result.taxes as MXTaxBreakdown;
      assert.equal(taxes.type, "MX");
      assert.equal(taxes.socialSecurity, result.breakdown.imss.total);
    }
  });
});
