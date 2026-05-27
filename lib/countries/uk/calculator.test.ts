import { describe, expect, it } from "vitest";
import { UKCalculator } from "./calculator";
import type { UKBreakdown, UKCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<UKCalculatorInputs> = {},
): UKCalculatorInputs {
  return {
    country: "UK",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    region: "rest_of_uk",
    taxableBenefitsInKind: 0,
    studentLoanPlan: "none",
    hasPostgraduateLoan: false,
    marriageAllowance: "none",
    contributions: {
      pensionContribution: 0,
    },
    ...overrides,
    contributions: {
      pensionContribution: 0,
      ...overrides.contributions,
    },
  };
}

describe("United Kingdom calculator", () => {
  it("calculates 2026/27 rest-of-UK income tax and employee National Insurance", () => {
    const result = UKCalculator.calculate(inputs(35_000));
    const breakdown = result.breakdown as UKBreakdown;

    expect(result.taxableIncome).toBe(22_430);
    expect(result.taxes.incomeTax).toBe(4_486);
    expect(result.taxes.nationalInsurance).toBe(1_794.4);
    expect(result.totalTax).toBe(6_280.4);
    expect(result.netSalary).toBe(28_719.6);
    expect(breakdown.personalAllowance).toBe(12_570);
    expect(breakdown.nationalInsurance.mainContribution).toBe(1_794.4);
  });

  it("applies Scottish bands, taxable BIK, student loans, and relief-at-source pension cost", () => {
    const result = UKCalculator.calculate(
      inputs(80_000, {
        region: "scotland",
        taxableBenefitsInKind: 5_000,
        studentLoanPlan: "plan2",
        hasPostgraduateLoan: true,
        contributions: {
          pensionContribution: 10_000,
        },
      }),
    );
    const breakdown = result.breakdown as UKBreakdown;

    expect(result.taxableIncome).toBe(72_430);
    expect(result.taxes.incomeTax).toBe(23_982.05);
    expect(result.taxes.nationalInsurance).toBe(3_610.6);
    expect(result.taxes.studentLoanRepayment).toBe(4_555.35);
    expect(result.taxes.postgraduateLoanRepayment).toBe(3_540);
    expect(breakdown.pensionContribution).toBe(10_000);
    expect(breakdown.pensionTaxRelief).toBe(4_000);
    expect(breakdown.pensionNetCost).toBe(6_000);
    expect(result.netSalary).toBe(38_312);
  });

  it("caps gross pension contributions to the annual allowance", () => {
    const limits = UKCalculator.getContributionLimits();
    const result = UKCalculator.calculate(
      inputs(120_000, {
        marriageAllowance: "receiving",
        contributions: {
          pensionContribution: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as UKBreakdown;

    expect(limits.pensionContribution?.limit).toBe(60_000);
    expect(breakdown.pensionContribution).toBe(60_000);
    expect(breakdown.pensionTaxRelief).toBe(24_000);
    expect(breakdown.pensionNetCost).toBe(36_000);
    expect(breakdown.personalAllowance).toBe(2_570);
    expect(result.netSalary).toBeCloseTo(40_157.4, 5);
  });

  it("applies Marriage Allowance only when the recipient remains basic-rate eligible", () => {
    const result = UKCalculator.calculate(
      inputs(30_000, {
        marriageAllowance: "receiving",
      }),
    );
    const breakdown = result.breakdown as UKBreakdown;

    expect(breakdown.marriageAllowanceEligible).toBe(true);
    expect(breakdown.marriageAllowanceTaxReduction).toBe(252);
    expect(result.taxes.incomeTax).toBe(3_234);
    expect(result.netSalary).toBe(25_371.6);
  });
});
