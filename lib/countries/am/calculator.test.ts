import { describe, expect, it } from "vitest";
import { AMCalculator } from "./calculator";
import type { AMBreakdown, AMCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<AMCalculatorInputs> = {},
): AMCalculatorInputs {
  return {
    country: "AM",
    grossSalary,
    payFrequency: "annual",
    pensionParticipation: "funded_pension",
    healthInsuranceStatus: "applies",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof AMCalculator.calculate>, key: string) {
  return (result.breakdown as AMBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("Armenia calculator", () => {
  it("applies flat salary tax, funded pension formula, health insurance, and stamp duty", () => {
    const result = AMCalculator.calculate(inputs(12_000_000));

    expect(result.taxableIncome).toBe(12_000_000);
    expect(result.taxes.incomeTax).toBe(2_400_000);
    expect(result.taxes.socialContributions).toBe(1_041_600);
    expect(result.totalTax).toBe(3_441_600);
    expect(result.netSalary).toBe(8_558_400);
  });

  it("removes pension and health charges when the employee is not covered", () => {
    const result = AMCalculator.calculate(
      inputs(12_000_000, {
        pensionParticipation: "not_participating",
        healthInsuranceStatus: "not_applicable",
      }),
    );

    expect(result.taxes.incomeTax).toBe(2_400_000);
    expect(result.taxes.socialContributions).toBe(12_000);
    expect(result.totalTax).toBe(2_412_000);
    expect(result.netSalary).toBe(9_588_000);
  });

  it("stacks mortgage, tuition, healthcare, and education refunds against income tax only", () => {
    const result = AMCalculator.calculate(
      inputs(12_000_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          housingExpenses: 500_000,
          tertiaryEducationExpenses: 500_000,
          medicalExpenses: 100_000,
          educationExpenses: 100_000,
        },
      }),
    );

    expect(contributionAmount(result, "housingExpenses")).toBe(500_000);
    expect(contributionAmount(result, "tertiaryEducationExpenses")).toBe(500_000);
    expect(contributionAmount(result, "medicalExpenses")).toBe(50_000);
    expect(contributionAmount(result, "educationExpenses")).toBe(50_000);
    expect(result.taxes.incomeTax).toBe(1_300_000);
    expect(result.totalTax).toBe(2_341_600);
    expect(result.netSalary).toBe(9_658_400);
  });

  it("does not refund more income tax than the salary tax charged", () => {
    const result = AMCalculator.calculate(
      inputs(12_000_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          housingExpenses: 7_000_000,
          tertiaryEducationExpenses: 2_000_000,
          medicalExpenses: 100_000,
          educationExpenses: 100_000,
        },
      }),
    );

    expect(contributionAmount(result, "housingExpenses")).toBe(2_400_000);
    expect(contributionAmount(result, "tertiaryEducationExpenses")).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(1_041_600);
    expect(result.netSalary).toBe(10_958_400);
  });
});
