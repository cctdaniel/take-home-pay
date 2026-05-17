import { describe, expect, it } from "vitest";
import { calculateFR } from "./calculator";
import { FR_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FRCalculatorInputs } from "./types";

function inputs(grossSalary: number): FRCalculatorInputs {
  return {
    country: "FR",
    grossSalary,
    payFrequency: "monthly",
    contributions: {},
  };
}

describe("France calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateFR(inputs(FR_TAX_CONFIG.defaultSalary));

    expect(result.country).toBe("FR");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("FR");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateFR(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
