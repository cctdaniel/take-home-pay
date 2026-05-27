import { describe, expect, it } from "vitest";
import { SVCalculator } from "./calculator";
import type { SVBreakdown, SVCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<SVCalculatorInputs> = {},
): SVCalculatorInputs {
  return {
    country: "SV",
    grossSalary,
    payFrequency: "annual",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof SVCalculator.calculate>, key: string) {
  return (result.breakdown as SVBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("El Salvador calculator", () => {
  it("annualizes the official wage withholding table after ISSS and AFP payroll deductions", () => {
    const result = SVCalculator.calculate(inputs(48_000));
    const breakdown = result.breakdown as SVBreakdown;

    expect(breakdown.mandatoryContributions[0].amount).toBe(360);
    expect(breakdown.mandatoryContributions[1].amount).toBe(3_480);
    expect(result.taxableIncome).toBe(44_160);
    expect(result.taxes.incomeTax).toBe(9_373.68);
    expect(result.taxes.socialContributions).toBe(3_840);
    expect(result.totalTax).toBe(13_213.68);
    expect(result.netSalary).toBe(34_786.32);
  });

  it("caps voluntary AFP contributions at ten percent of salary and deducts the cash contribution from net pay", () => {
    const limits = SVCalculator.getContributionLimits(inputs(48_000));
    const result = SVCalculator.calculate(
      inputs(48_000, {
        contributions: {
          retirementContribution: 8_000,
          qualifyingExpenses: 0,
          medicalExpenses: 0,
          educationExpenses: 0,
          charitableDonations: 0,
        },
      }),
    );

    expect(limits.retirementContribution?.limit).toBe(4_800);
    expect(contributionAmount(result, "retirementContribution")).toBe(4_800);
    expect(result.taxableIncome).toBe(39_360);
    expect(result.taxes.incomeTax).toBe(7_933.68);
    expect(result.totalTax).toBe(11_773.68);
    expect(result.totalDeductions).toBe(16_573.68);
    expect(result.netSalary).toBe(31_426.32);
  });

  it("applies medical and education annual-return caps as tax-only deductions", () => {
    const result = SVCalculator.calculate(
      inputs(48_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          medicalExpenses: 1_000,
          educationExpenses: 1_000,
          charitableDonations: 0,
        },
      }),
    );

    expect(contributionAmount(result, "medicalExpenses")).toBe(800);
    expect(contributionAmount(result, "educationExpenses")).toBe(800);
    expect(result.taxableIncome).toBe(42_560);
    expect(result.taxes.incomeTax).toBe(8_893.68);
    expect(result.totalTax).toBe(12_733.68);
    expect(result.netSalary).toBe(35_266.32);
  });

  it("models documented dues and the donation cap from remaining net income", () => {
    const result = SVCalculator.calculate(
      inputs(48_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 5_000,
          medicalExpenses: 0,
          educationExpenses: 0,
          charitableDonations: 5_000,
        },
      }),
    );

    expect(contributionAmount(result, "qualifyingExpenses")).toBe(5_000);
    expect(contributionAmount(result, "charitableDonations")).toBe(5_000);
    expect(result.taxableIncome).toBe(34_160);
    expect(result.taxes.incomeTax).toBe(6_373.68);
    expect(result.totalTax).toBe(10_213.68);
    expect(result.netSalary).toBe(37_786.32);
  });
});
