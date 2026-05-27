import { describe, expect, it } from "vitest";
import { CHCalculator } from "./calculator";
import type { CHBreakdown, CHCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CHCalculatorInputs> = {},
): CHCalculatorInputs {
  return {
    country: "CH",
    grossSalary,
    payFrequency: "annual",
    numberOfChildren: 0,
    numberOfChildcareChildren: 0,
    numberOfSupportedPersons: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 2_900,
      educationExpenses: 0,
      carerWages: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 2_900,
      educationExpenses: 0,
      carerWages: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof CHCalculator.calculate>, key: string) {
  return (result.breakdown as CHBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("Switzerland Zurich benchmark calculator", () => {
  it("applies Zurich benchmark payroll contributions and counts insurance premiums once", () => {
    const result = CHCalculator.calculate(inputs(120_000));
    const breakdown = result.breakdown as CHBreakdown;

    expect(breakdown.mandatoryContributions[0].amount).toBe(6_360);
    expect(breakdown.mandatoryContributions[1].amount).toBe(1_320);
    expect(breakdown.mandatoryContributions[2].amount).toBe(480);
    expect(breakdown.mandatoryContributions[3].amount).toBe(4_238);
    expect(breakdown.deductions[0].amount).toBe(3_228.06);
    expect(breakdown.deductions.some((row) => row.name.includes("Private insurance"))).toBe(false);
    expect(contributionAmount(result, "insurancePremiums")).toBe(2_900);
    expect(result.taxableIncome).toBe(101_473.94);
    expect(result.taxes.incomeTax).toBe(16_079.26);
    expect(result.totalTax).toBe(28_477.26);
    expect(result.netSalary).toBe(91_522.74);
  });

  it("caps Pillar 3a, insurance, childcare, training, and donation deductions", () => {
    const limits = CHCalculator.getContributionLimits(
      inputs(120_000, {
        numberOfChildren: 2,
        numberOfChildcareChildren: 1,
        numberOfSupportedPersons: 1,
      }),
    );
    const result = CHCalculator.calculate(
      inputs(120_000, {
        numberOfChildren: 2,
        numberOfChildcareChildren: 1,
        numberOfSupportedPersons: 1,
        contributions: {
          retirementContribution: 10_000,
          qualifyingExpenses: 0,
          insurancePremiums: 10_000,
          educationExpenses: 20_000,
          carerWages: 50_000,
          charitableDonations: 30_000,
        },
      }),
    );
    const breakdown = result.breakdown as CHBreakdown;

    expect(limits.retirementContribution?.limit).toBe(7_258);
    expect(limits.insurancePremiums?.limit).toBe(6_800);
    expect(limits.carerWages?.limit).toBe(25_300);
    expect(contributionAmount(result, "retirementContribution")).toBe(7_258);
    expect(contributionAmount(result, "insurancePremiums")).toBe(6_800);
    expect(contributionAmount(result, "carerWages")).toBe(25_300);
    expect(contributionAmount(result, "educationExpenses")).toBe(12_600);
    expect(contributionAmount(result, "charitableDonations")).toBe(24_000);
    expect(breakdown.deductions[1].amount).toBe(18_800);
    expect(breakdown.deductions[2].amount).toBe(2_800);
    expect(result.taxableIncome).toBe(6_815.94);
    expect(result.taxes.incomeTax).toBe(320.45);
    expect(result.totalDeductions).toBe(19_976.45);
    expect(result.netSalary).toBe(100_023.55);
  });
});
