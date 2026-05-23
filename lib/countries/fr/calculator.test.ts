import { describe, expect, it } from "vitest";
import { calculateFR } from "./calculator";
import { FR_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FRCalculatorInputs } from "./types";

function inputs(grossSalary: number): FRCalculatorInputs {
  return {
    country: "FR",
    grossSalary,
    payFrequency: "monthly",
    taxHouseholdParts: 1,
    contributions: {
      retirementSavings: 0,
    },
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

  it("reduces taxable income with PER retirement savings and subtracts the cash contribution", () => {
    const base = calculateFR(inputs(60_000));
    const withRetirement = calculateFR({
      ...inputs(60_000),
      contributions: { retirementSavings: 5_000 },
    });

    expect(withRetirement.breakdown.retirementSavingsDeduction).toBe(5_000);
    expect(withRetirement.taxableIncome).toBe(base.taxableIncome - 5_000);
    expect(withRetirement.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withRetirement.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("uses selected family quotient parts for income tax", () => {
    const single = calculateFR(inputs(80_000));
    const married = calculateFR({ ...inputs(80_000), taxHouseholdParts: 2 });

    expect(married.breakdown.taxHouseholdParts).toBe(2);
    expect(married.taxes.incomeTax).toBeLessThan(single.taxes.incomeTax);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateFR(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
