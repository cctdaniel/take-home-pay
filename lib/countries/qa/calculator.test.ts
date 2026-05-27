import { describe, expect, it } from "vitest";
import { QACalculator } from "./calculator";
import type { QABreakdown, QACalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<Omit<QACalculatorInputs, "contributions">> & {
    contributions?: Partial<QACalculatorInputs["contributions"]>;
  } = {},
): QACalculatorInputs {
  return {
    country: "QA",
    grossSalary,
    payFrequency: "annual",
    employeeType: "expatriate",
    contributionSalaryCapTreatment: "standardCap",
    grsiaBasicSalaryMonthly: 0,
    grsiaSocialAllowanceMonthly: 0,
    grsiaHousingAllowanceMonthly: 0,
    grsiaContributionSalaryMonthly: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function calculateQA(input: QACalculatorInputs) {
  return QACalculator.calculate(input);
}

describe("Qatar calculator", () => {
  it("models expatriate employment salary with no Qatar income tax or employee social insurance", () => {
    const result = calculateQA(inputs(360_000));
    const breakdown = result.breakdown as QABreakdown;

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(360_000);
    expect(breakdown.grsiaContributionSalaryMonthly).toBe(0);
  });

  it("deducts 7% employee social insurance for pension-covered workers using explicit GRSIA components", () => {
    const result = calculateQA(
      inputs(360_000, {
        employeeType: "qatariPensionCovered",
        grsiaBasicSalaryMonthly: 30_000,
      }),
    );
    const breakdown = result.breakdown as QABreakdown;

    expect(breakdown.grsiaSelectedSalaryMonthly).toBe(30_000);
    expect(breakdown.grsiaContributionSalaryMonthly).toBe(30_000);
    expect(result.taxes.socialContributions).toBe(25_200);
    expect(result.netSalary).toBe(334_800);
  });

  it("caps housing allowance at QAR 6,000 and standard total contribution salary at QAR 100,000 per month", () => {
    const result = calculateQA(
      inputs(1_800_000, {
        employeeType: "qatariPensionCovered",
        grsiaBasicSalaryMonthly: 80_000,
        grsiaSocialAllowanceMonthly: 20_000,
        grsiaHousingAllowanceMonthly: 10_000,
      }),
    );
    const breakdown = result.breakdown as QABreakdown;

    expect(breakdown.grsiaBasicSalaryMonthly).toBe(80_000);
    expect(breakdown.grsiaSocialAllowanceMonthly).toBe(20_000);
    expect(breakdown.grsiaHousingAllowanceMonthly).toBe(6_000);
    expect(breakdown.grsiaSelectedSalaryMonthly).toBe(106_000);
    expect(breakdown.grsiaMonthlySalaryCap).toBe(100_000);
    expect(breakdown.grsiaMonthlyCapApplied).toBe(true);
    expect(breakdown.grsiaContributionSalaryMonthly).toBe(100_000);
    expect(breakdown.grsiaContributionSalaryAnnual).toBe(1_200_000);
    expect(result.taxes.socialContributions).toBe(84_000);
    expect(result.netSalary).toBe(1_716_000);
  });

  it("allows grandfathered insured salary above the standard cap when selected", () => {
    const result = calculateQA(
      inputs(1_800_000, {
        employeeType: "qatariPensionCovered",
        contributionSalaryCapTreatment: "grandfathered",
        grsiaBasicSalaryMonthly: 120_000,
        grsiaSocialAllowanceMonthly: 20_000,
        grsiaHousingAllowanceMonthly: 7_000,
      }),
    );
    const breakdown = result.breakdown as QABreakdown;

    expect(breakdown.grsiaHousingAllowanceMonthly).toBe(6_000);
    expect(breakdown.grsiaSelectedSalaryMonthly).toBe(146_000);
    expect(breakdown.grsiaMonthlySalaryCap).toBe(150_000);
    expect(breakdown.grsiaMonthlyCapApplied).toBe(false);
    expect(result.taxes.socialContributions).toBe(122_640);
    expect(result.netSalary).toBe(1_677_360);
  });

  it("ignores GRSIA component inputs for expatriate employees", () => {
    const result = calculateQA(
      inputs(1_800_000, {
        grsiaBasicSalaryMonthly: 80_000,
        grsiaSocialAllowanceMonthly: 20_000,
        grsiaHousingAllowanceMonthly: 6_000,
      }),
    );
    const breakdown = result.breakdown as QABreakdown;

    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(1_800_000);
    expect(breakdown.grsiaSelectedSalaryMonthly).toBe(0);
    expect(breakdown.grsiaContributionSalaryMonthly).toBe(0);
  });

  it("keeps legacy monthly contribution salary input compatible and applies the new total cap", () => {
    const result = calculateQA(
      inputs(1_800_000, {
        employeeType: "qatariPensionCovered",
        grsiaContributionSalaryMonthly: 120_000,
      }),
    );
    const breakdown = result.breakdown as QABreakdown;

    expect(breakdown.grsiaBasicSalaryMonthly).toBe(120_000);
    expect(breakdown.grsiaSelectedSalaryMonthly).toBe(120_000);
    expect(breakdown.grsiaContributionSalaryMonthly).toBe(100_000);
    expect(result.taxes.socialContributions).toBe(84_000);
  });
});
