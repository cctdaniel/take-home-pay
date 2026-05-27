import { describe, expect, it } from "vitest";
import { ALCalculator } from "./calculator";
import type { ALBreakdown, ALCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<Omit<ALCalculatorInputs, "contributions">> & {
    contributions?: Partial<ALCalculatorInputs["contributions"]>;
  } = {},
): ALCalculatorInputs {
  return {
    country: "AL",
    grossSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "annual",
    appliesEmploymentAllowance: true,
    claimsFamilyDivaDeductions: true,
    numberOfDependentChildren: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function calculateAL(input: ALCalculatorInputs) {
  return ALCalculator.calculate(input);
}

describe("Albania calculator", () => {
  it("calculates resident employment tax, social insurance, and health insurance", () => {
    const result = calculateAL(inputs(1_800_000));
    const breakdown = result.breakdown as ALBreakdown;

    expect(result.taxes.incomeTax).toBe(160_992);
    expect(result.taxes.socialContributions).toBe(201_600);
    expect(result.totalTax).toBe(362_592);
    expect(result.netSalary).toBe(1_437_408);
    expect(result.taxableIncome).toBe(1_238_400);
    expect(breakdown.personalAllowance).toBe(360_000);
    expect(breakdown.monthlySocialInsuranceBase).toBe(150_000);
  });

  it("allows the employment allowance to be switched off for no-allowance payroll scenarios", () => {
    const result = calculateAL(
      inputs(1_800_000, { appliesEmploymentAllowance: false }),
    );
    const breakdown = result.breakdown as ALBreakdown;

    expect(breakdown.personalAllowance).toBe(0);
    expect(result.taxableIncome).toBe(1_598_400);
    expect(result.taxes.incomeTax).toBe(207_792);
    expect(result.netSalary).toBe(1_390_608);
  });

  it("includes taxable benefits in kind in the tax and contribution base, not cash gross", () => {
    const result = calculateAL(
      inputs(1_800_000, { taxableNonCashBenefits: 120_000 }),
    );
    const breakdown = result.breakdown as ALBreakdown;

    expect(result.grossSalary).toBe(1_800_000);
    expect(breakdown.taxableGrossIncome).toBe(1_920_000);
    expect(breakdown.taxableNonCashBenefits).toBe(120_000);
    expect(breakdown.monthlySocialInsuranceBase).toBe(160_000);
    expect(result.taxes.socialContributions).toBe(215_040);
    expect(result.taxes.incomeTax).toBe(174_844.8);
    expect(result.netSalary).toBe(1_410_115.2);
  });

  it("applies DIVA child and education deductions only when this taxpayer claims them", () => {
    const claimed = calculateAL(
      inputs(1_000_000, {
        numberOfDependentChildren: 2,
        contributions: { educationExpenses: 100_000 },
      }),
    );
    const notClaimed = calculateAL(
      inputs(1_000_000, {
        claimsFamilyDivaDeductions: false,
        numberOfDependentChildren: 2,
        contributions: { educationExpenses: 100_000 },
      }),
    );

    expect(claimed.taxableIncome).toBe(332_000);
    expect(claimed.taxes.incomeTax).toBe(43_160);
    expect(claimed.netSalary).toBe(844_840);
    expect((claimed.breakdown as ALBreakdown).dependentChildDeduction).toBe(
      96_000,
    );
    expect((claimed.breakdown as ALBreakdown).educationExpenseLimit).toBe(
      100_000,
    );

    expect(notClaimed.taxableIncome).toBe(528_000);
    expect(notClaimed.taxes.incomeTax).toBe(68_640);
    expect(notClaimed.netSalary).toBe(819_360);
    expect(
      (notClaimed.breakdown as ALBreakdown).dependentChildDeduction,
    ).toBe(0);
    expect((notClaimed.breakdown as ALBreakdown).educationExpenseLimit).toBe(
      0,
    );
  });

  it("disables children's education expense relief without children or above the income threshold", () => {
    expect(
      ALCalculator.getContributionLimits(inputs(1_000_000)).educationExpenses
        ?.limit,
    ).toBe(0);
    expect(
      ALCalculator.getContributionLimits(
        inputs(1_300_000, { numberOfDependentChildren: 1 }),
      ).educationExpenses?.limit,
    ).toBe(0);
    expect(
      ALCalculator.getContributionLimits(
        inputs(1_000_000, { numberOfDependentChildren: 1 }),
      ).educationExpenses?.limit,
    ).toBe(100_000);
  });

  it("caps deductible voluntary pension contributions at the annualized 2026 minimum wage", () => {
    const result = calculateAL(
      inputs(1_800_000, {
        contributions: { retirementContribution: 900_000 },
      }),
    );
    const pension = (result.breakdown as ALBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    );

    expect(pension?.amount).toBe(600_000);
    expect(result.taxableIncome).toBe(638_400);
    expect(result.taxes.incomeTax).toBe(82_992);
    expect(result.netSalary).toBe(915_408);
  });
});
