import { describe, expect, it } from "vitest";
import { calculateBE } from "./calculator";
import { BE_TAX_CONFIG } from "./constants/tax-year-2026";
import type { BECalculatorInputs } from "./types";

function inputs(grossSalary: number): BECalculatorInputs {
  return {
    country: "BE",
    grossSalary,
    payFrequency: "monthly",
    contributions: {},
  };
}

describe("Belgium calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateBE(inputs(BE_TAX_CONFIG.defaultSalary));

    expect(result.country).toBe("BE");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("BE");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateBE(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
