import { describe, expect, it } from "vitest";
import { calculateAT } from "./calculator";
import { AT_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ATCalculatorInputs } from "./types";

function inputs(grossSalary: number): ATCalculatorInputs {
  return {
    country: "AT",
    grossSalary,
    payFrequency: "monthly",
    contributions: {},
  };
}

describe("Austria calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateAT(inputs(AT_TAX_CONFIG.defaultSalary));

    expect(result.country).toBe("AT");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("AT");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateAT(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
