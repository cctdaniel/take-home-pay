import { describe, expect, it } from "vitest";
import { calculateIE } from "./calculator";
import { IE_TAX_CONFIG } from "./constants/tax-year-2026";
import type { IECalculatorInputs } from "./types";

function inputs(grossSalary: number): IECalculatorInputs {
  return {
    country: "IE",
    grossSalary,
    payFrequency: "monthly",
    contributions: {},
  };
}

describe("Ireland calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateIE(inputs(IE_TAX_CONFIG.defaultSalary));

    expect(result.country).toBe("IE");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("IE");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateIE(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
