import { describe, expect, it } from "vitest";
import { calculateFR } from "./calculator";
import {
  FR_IMPATRIATE_REGIME_2026,
  FR_TAX_CONFIG,
} from "./constants/tax-year-2026";
import {
  isFRBreakdown,
  isFRTaxBreakdown,
  type FRBreakdown,
  type FRCalculatorInputs,
  type FRTaxBreakdown,
} from "./types";
import type { CalculationResult } from "../types";

type FRCalculationResult = CalculationResult & {
  taxes: FRTaxBreakdown;
  breakdown: FRBreakdown;
};

function inputs(grossSalary: number): FRCalculatorInputs {
  return {
    country: "FR",
    grossSalary,
    payFrequency: "monthly",
    householdStatus: "single",
    numberOfChildren: 0,
    taxHouseholdParts: 1,
    professionalExpenseMethod: "standard_10_percent",
    impatriateRegime: "none",
    impatriatePremiumAmount: 0,
    frenchReferenceSalary: 0,
    contributions: {
      retirementSavings: 0,
      actualProfessionalExpenses: 0,
      charitableDonations: 0,
    },
  };
}

function calculateFRTyped(input: FRCalculatorInputs): FRCalculationResult {
  const result = calculateFR(input);
  if (!isFRTaxBreakdown(result.taxes) || !isFRBreakdown(result.breakdown)) {
    throw new Error("Expected France calculation result");
  }
  return result as FRCalculationResult;
}

describe("France calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateFRTyped(inputs(FR_TAX_CONFIG.defaultSalary));

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
    const base = calculateFRTyped(inputs(60_000));
    const withRetirement = calculateFRTyped({
      ...inputs(60_000),
      contributions: {
        ...inputs(60_000).contributions,
        retirementSavings: 5_000,
      },
    });

    expect(withRetirement.breakdown.retirementSavingsDeduction).toBe(5_000);
    expect(withRetirement.taxableIncome).toBe(base.taxableIncome - 5_000);
    expect(withRetirement.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withRetirement.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("uses selected family quotient parts for income tax", () => {
    const single = calculateFRTyped(inputs(80_000));
    const married = calculateFRTyped({
      ...inputs(80_000),
      householdStatus: "married_pacs",
      taxHouseholdParts: 2,
    });

    expect(married.breakdown.taxHouseholdParts).toBe(2);
    expect(married.taxes.incomeTax).toBeLessThan(single.taxes.incomeTax);
  });

  it("caps the family quotient benefit for high-income families", () => {
    const withChildren = calculateFRTyped({
      ...inputs(220_000),
      householdStatus: "married_pacs",
      numberOfChildren: 3,
      taxHouseholdParts: 4,
    });

    expect(withChildren.breakdown.familyQuotientCapApplied).toBe(true);
    expect(withChildren.breakdown.familyQuotientCap).toBe(7_228);
  });

  it("uses the official 2025-income 10% deduction ceiling for 2026 tax", () => {
    const result = calculateFRTyped(inputs(200_000));
    expect(result.breakdown.standardDeduction).toBe(14_555);
  });

  it("applies the forfaitary impatriate premium exemption with reference salary floor", () => {
    const base = calculateFRTyped(inputs(120_000));
    const withImpatriate = calculateFRTyped({
      ...inputs(120_000),
      impatriateRegime: "forfait30",
      frenchReferenceSalary: 90_000,
    });

    expect(withImpatriate.breakdown.impatriateForfaitPremium).toBe(
      120_000 * FR_IMPATRIATE_REGIME_2026.forfaitPremiumRate,
    );
    expect(withImpatriate.breakdown.impatriateSalaryExemption).toBe(30_000);
    expect(withImpatriate.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withImpatriate.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateFRTyped(inputs(0));

    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
