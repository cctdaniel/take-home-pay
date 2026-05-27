import { describe, expect, it } from "vitest";
import { KECalculator } from "./calculator";
import type { KEBreakdown, KECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<KECalculatorInputs> = {},
): KECalculatorInputs {
  return {
    country: "KE",
    grossSalary,
    payFrequency: "annual",
    hasDisabilityExemptionCertificate: false,
    taxableNonCashBenefits: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof KECalculator.calculate>, key: string) {
  return (result.breakdown as KEBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("Kenya calculator", () => {
  it("calculates PAYE after NSSF, SHIF, Affordable Housing Levy, and personal relief", () => {
    const result = KECalculator.calculate(inputs(6_000_000));
    const breakdown = result.breakdown as KEBreakdown;

    expect(breakdown.mandatoryContributions[0].amount).toBe(77_760);
    expect(breakdown.mandatoryContributions[1].amount).toBe(165_000);
    expect(breakdown.mandatoryContributions[2].amount).toBe(90_000);
    expect(result.taxableIncome).toBe(5_667_240);
    expect(result.taxes.incomeTax).toBe(1_608_772);
    expect(result.taxes.socialContributions).toBe(332_760);
    expect(result.totalTax).toBe(1_941_532);
    expect(result.netSalary).toBe(4_058_468);
  });

  it("caps pension, post-retirement medical, mortgage interest, and insurance relief", () => {
    const limits = KECalculator.getContributionLimits(inputs(6_000_000));
    const result = KECalculator.calculate(
      inputs(6_000_000, {
        contributions: {
          retirementContribution: 500_000,
          medicalExpenses: 300_000,
          housingExpenses: 500_000,
          qualifyingExpenses: 500_000,
        },
      }),
    );

    expect(limits.retirementContribution?.limit).toBe(282_240);
    expect(contributionAmount(result, "retirementContribution")).toBe(282_240);
    expect(contributionAmount(result, "medicalExpenses")).toBe(180_000);
    expect(contributionAmount(result, "housingExpenses")).toBe(360_000);
    expect(contributionAmount(result, "qualifyingExpenses")).toBe(400_000);
    expect(result.taxableIncome).toBe(4_845_000);
    expect(result.taxes.incomeTax).toBe(1_302_100);
    expect(result.totalDeductions).toBe(2_097_100);
    expect(result.netSalary).toBe(3_902_900);
  });

  it("applies the PWD exemption to cash salary and taxable non-cash benefits", () => {
    const result = KECalculator.calculate(
      inputs(2_000_000, {
        hasDisabilityExemptionCertificate: true,
        taxableNonCashBenefits: 100_000,
      }),
    );
    const breakdown = result.breakdown as KEBreakdown;

    expect(breakdown.deductions[0].amount).toBe(1_800_000);
    expect(result.taxableIncome).toBe(137_240);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.nonCashBenefitTaxEffect).toBe(0);
    expect(result.totalTax).toBe(162_760);
    expect(result.netSalary).toBe(1_837_240);
  });
});
