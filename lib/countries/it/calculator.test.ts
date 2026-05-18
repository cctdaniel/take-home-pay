import { describe, expect, it } from "vitest";
import { calculateIT } from "./calculator";
import { IT_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ITCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  pensionContribution = 0,
): ITCalculatorInputs {
  return {
    country: "IT",
    grossSalary,
    payFrequency: "monthly",
    contributions: { pensionContribution },
  };
}

describe("Italy calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateIT(inputs(IT_TAX_CONFIG.defaultSalary));
    expect(result.country).toBe("IT");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("IT");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("deducts supplementary pension contributions from taxable income", () => {
    const base = calculateIT(inputs(42_000));
    const withPension = calculateIT(inputs(42_000, 5_000));
    expect(withPension.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withPension.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withPension.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateIT(inputs(0));
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
