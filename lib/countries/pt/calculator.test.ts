import { describe, expect, it } from "vitest";
import { PTCalculator } from "./calculator";
import type { PTBreakdown, PTCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<PTCalculatorInputs> = {},
): PTCalculatorInputs {
  return {
    country: "PT",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    filingStatus: "single",
    numberOfDependents: 0,
    age: 30,
    irsJovemYear: "none",
    contributions: {
      pprContribution: 0,
    },
    ...overrides,
    contributions: {
      pprContribution: 0,
      ...overrides.contributions,
    },
  };
}

describe("Portugal calculator", () => {
  it("applies social security, the employment specific deduction, and progressive IRS", () => {
    const result = PTCalculator.calculate(inputs(35_000));
    const breakdown = result.breakdown as PTBreakdown;

    expect(breakdown.socialSecurity).toBe(3_850);
    expect(breakdown.specificDeduction).toBe(4_104);
    expect(result.taxableIncome).toBe(30_896);
    expect(result.taxes.incomeTax).toBeCloseTo(6_572.857, 5);
    expect(result.totalTax).toBeCloseTo(10_422.857, 5);
    expect(result.netSalary).toBeCloseTo(24_577.143, 5);
  });

  it("caps resident PPR contributions by age and applies dependent deductions as tax credits", () => {
    const limits = PTCalculator.getContributionLimits(inputs(35_000, { age: 30 }));
    const result = PTCalculator.calculate(
      inputs(35_000, {
        age: 30,
        numberOfDependents: 2,
        contributions: {
          pprContribution: 5_000,
        },
      }),
    );
    const breakdown = result.breakdown as PTBreakdown;

    expect(limits.ppr?.limit).toBe(2_000);
    expect(breakdown.pprContribution).toBe(2_000);
    expect(breakdown.pprTaxCredit).toBe(400);
    expect(breakdown.dependentDeduction).toBe(1_200);
    expect(result.taxes.incomeTax).toBeCloseTo(6_572.857, 5);
    expect(result.taxes.totalIncomeTax).toBeCloseTo(4_972.857, 5);
    expect(result.totalDeductions).toBeCloseTo(10_822.857, 5);
    expect(result.netSalary).toBeCloseTo(24_177.143, 5);
  });

  it("applies IRS Jovem only to resident employment income", () => {
    const result = PTCalculator.calculate(
      inputs(35_000, { irsJovemYear: "year_1" }),
    );
    const breakdown = result.breakdown as PTBreakdown;

    expect(breakdown.irsJovem.applies).toBe(true);
    expect(breakdown.irsJovem.exemptIncome).toBeCloseTo(29_542.15, 5);
    expect(result.taxableIncome).toBeCloseTo(1_353.85, 5);
    expect(result.taxes.incomeTax).toBeCloseTo(169.23125, 5);
    expect(result.totalTax).toBeCloseTo(4_019.23125, 5);
    expect(result.netSalary).toBeCloseTo(30_980.76875, 5);
  });

  it("models NHR 2.0 flat tax with resident social security and resident PPR/dependent credits", () => {
    const result = PTCalculator.calculate(
      inputs(100_000, {
        residencyType: "nhr_2",
        numberOfDependents: 1,
        contributions: {
          pprContribution: 2_000,
        },
      }),
    );
    const breakdown = result.breakdown as PTBreakdown;

    expect(breakdown.isNhr2).toBe(true);
    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(20_000);
    expect(result.taxes.totalIncomeTax).toBe(19_000);
    expect(result.taxes.socialSecurity).toBe(11_000);
    expect(result.totalDeductions).toBe(32_000);
    expect(result.netSalary).toBe(68_000);
  });

  it("uses the non-resident flat rate without social security or resident credits", () => {
    const result = PTCalculator.calculate(
      inputs(100_000, { residencyType: "non_resident" }),
    );

    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(25_000);
    expect(result.taxes.socialSecurity).toBe(0);
    expect(result.totalTax).toBe(25_000);
    expect(result.netSalary).toBe(75_000);
  });
});
