import { describe, expect, it } from "vitest";
import { DOCalculator } from "./calculator";
import {
  DO_AFP_MONTHLY_SALARY_CAP,
  DO_AFP_EMPLOYEE_RATE,
  DO_EDUCATION_EXPENSE_LIMIT,
  DO_SFS_MONTHLY_SALARY_CAP,
  DO_SFS_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { DOBreakdown, DOCalculatorInputs } from "./types";

function inputs(overrides: Partial<DOCalculatorInputs> = {}): DOCalculatorInputs {
  const defaults = DOCalculator.getDefaultInputs() as DOCalculatorInputs;

  return {
    ...defaults,
    grossSalary: 1_200_000,
    payFrequency: "annual",
    christmasSalaryMode: "none",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

describe("Dominican Republic calculator", () => {
  it("uses the selected monthly SDSS salary for AFP and SFS employee deductions", () => {
    const result = DOCalculator.calculate(
      inputs({
        sdssSalaryMonthly: 50_000,
      }),
    );
    const breakdown = result.breakdown as DOBreakdown;

    expect(breakdown.sdssCovered).toBe(true);
    expect(breakdown.sdssSalaryMonthly).toBe(50_000);
    expect(breakdown.sdssSalaryAnnual).toBe(600_000);
    expect(result.taxes.socialContributions).toBe(35_460);
  });

  it("supports confirmed no-SDSS payroll coverage", () => {
    const result = DOCalculator.calculate(
      inputs({
        sdssCovered: false,
        sdssSalaryMonthly: 50_000,
      }),
    );
    const breakdown = result.breakdown as DOBreakdown;

    expect(breakdown.sdssCovered).toBe(false);
    expect(breakdown.sdssSalaryMonthly).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
  });

  it("applies the separate 2026 TSS AFP and SFS monthly contribution caps", () => {
    const result = DOCalculator.calculate(
      inputs({
        grossSalary: 12_000_000,
        sdssSalaryMonthly: 1_000_000,
      }),
    );
    const expectedSocialContributions =
      Math.round(DO_AFP_MONTHLY_SALARY_CAP * 12 * DO_AFP_EMPLOYEE_RATE * 100) /
        100 +
      Math.round(DO_SFS_MONTHLY_SALARY_CAP * 12 * DO_SFS_EMPLOYEE_RATE * 100) /
        100;

    expect((result.breakdown as DOBreakdown).sdssSalaryMonthly).toBe(1_000_000);
    expect(result.taxes.socialContributions).toBe(expectedSocialContributions);
  });

  it("taxes fringe benefits to the employee only when that official case is selected", () => {
    const base = DOCalculator.calculate(
      inputs({
        taxableNonCashBenefits: 120_000,
        fringeBenefitsTaxedToEmployee: false,
      }),
    );
    const taxedToEmployee = DOCalculator.calculate(
      inputs({
        taxableNonCashBenefits: 120_000,
        fringeBenefitsTaxedToEmployee: true,
      }),
    );
    const taxedBreakdown = taxedToEmployee.breakdown as DOBreakdown;

    expect((base.breakdown as DOBreakdown).taxableNonCashBenefits).toBe(0);
    expect(taxedToEmployee.grossSalary).toBe(1_200_000);
    expect(taxedBreakdown.taxableNonCashBenefits).toBe(120_000);
    expect(taxedBreakdown.taxableGrossIncome).toBe(1_320_000);
    expect(taxedToEmployee.taxes.incomeTax).toBeGreaterThan(
      base.taxes.incomeTax,
    );
    expect(taxedToEmployee.netSalary).toBeLessThan(base.netSalary);
  });

  it("caps Law 179-09 education expenses against taxable salary after selected SDSS deductions", () => {
    const lowSalaryLimits = DOCalculator.getContributionLimits(
      inputs({
        grossSalary: 600_000,
        sdssSalaryMonthly: 20_000,
      }),
    );
    const highSalaryLimits = DOCalculator.getContributionLimits(
      inputs({
        grossSalary: 1_800_000,
      }),
    );

    expect(lowSalaryLimits.educationExpenses?.limit).toBe(58_581.6);
    expect(highSalaryLimits.educationExpenses?.limit).toBe(
      DO_EDUCATION_EXPENSE_LIMIT,
    );
  });

  it("keeps legal Christmas salary outside the ISR and SDSS salary base", () => {
    const result = DOCalculator.calculate(
      inputs({
        grossSalary: 1_300_000,
        christmasSalaryMode: "includedInGross",
      }),
    );
    const breakdown = result.breakdown as DOBreakdown;

    expect(breakdown.ordinarySalary).toBe(1_200_000);
    expect(breakdown.christmasSalary).toBe(100_000);
    expect(breakdown.isrAndSddsSalaryBase).toBe(1_200_000);
    expect(result.grossSalary).toBe(1_300_000);
  });
});
