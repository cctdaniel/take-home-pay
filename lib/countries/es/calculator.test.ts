import { describe, expect, it } from "vitest";
import { ESCalculator } from "./calculator";
import type { ESBreakdown, ESCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ESCalculatorInputs> = {},
): ESCalculatorInputs {
  return {
    country: "ES",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    taxRegime: "ordinary",
    region: "general",
    filingStatus: "individual",
    age: 30,
    numberOfChildren: 0,
    numberOfChildrenUnderThree: 0,
    employmentContractType: "permanent",
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

describe("Spain calculator", () => {
  it("calculates resident IRPF after employee Social Security and work expense deduction", () => {
    const result = ESCalculator.calculate(inputs(36_000));
    const breakdown = result.breakdown as ESBreakdown;

    expect(result.taxableIncome).toBe(31_660);
    expect(result.taxes.incomeTax).toBe(6_609);
    expect(result.taxes.stateIncomeTax).toBe(3_304.5);
    expect(result.taxes.regionalIncomeTax).toBe(3_304.5);
    expect(result.taxes.socialSecurity).toBe(2_340);
    expect(breakdown.workExpenseDeduction).toBe(2_000);
    expect(breakdown.personalFamilyMinimum).toBe(5_550);
    expect(result.netSalary).toBe(27_051);
  });

  it("caps the individual pension reduction and applies Madrid family minimums", () => {
    const limits = ESCalculator.getContributionLimits(inputs(50_000));
    const result = ESCalculator.calculate(
      inputs(50_000, {
        region: "madrid",
        filingStatus: "single_parent",
        age: 67,
        numberOfChildren: 2,
        numberOfChildrenUnderThree: 1,
        employmentContractType: "fixed_term",
        contributions: {
          pensionContribution: 5_000,
        },
      }),
    );
    const breakdown = result.breakdown as ESBreakdown;

    expect(limits.pensionContribution?.limit).toBe(1_500);
    expect(breakdown.voluntaryContributions.pensionContribution).toBe(1_500);
    expect(breakdown.jointTaxationReduction).toBe(2_150);
    expect(breakdown.taxpayerMinimum).toBe(6_700);
    expect(breakdown.descendantMinimum).toBe(7_900);
    expect(result.taxableIncome).toBe(41_075);
    expect(result.taxes.incomeTax).toBe(7_565.05);
    expect(result.taxes.socialSecurity).toBe(3_275);
    expect(result.netSalary).toBe(37_659.95);
  });

  it("uses Article 93 flat rates and disables ordinary resident reductions", () => {
    const result = ESCalculator.calculate(
      inputs(700_000, {
        taxRegime: "beckhamLaw",
        numberOfChildren: 3,
        numberOfChildrenUnderThree: 1,
        contributions: {
          pensionContribution: 100_000,
        },
      }),
    );
    const breakdown = result.breakdown as ESBreakdown;

    expect(breakdown.isBeckhamLaw).toBe(true);
    expect(breakdown.workExpenseDeduction).toBe(0);
    expect(breakdown.voluntaryContributions.pensionContribution).toBe(0);
    expect(result.taxableIncome).toBe(700_000);
    expect(result.taxes.incomeTax).toBe(191_000);
    expect(result.taxes.socialSecurity).toBe(5_501.62);
    expect(result.netSalary).toBe(503_498.38);
  });
});
