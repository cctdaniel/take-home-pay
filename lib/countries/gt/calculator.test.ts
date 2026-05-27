import { describe, expect, it } from "vitest";
import { GTCalculator } from "./calculator";
import type { GTBreakdown, GTCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<GTCalculatorInputs> = {},
): GTCalculatorInputs {
  return {
    country: "GT",
    grossSalary,
    payFrequency: "annual",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
      ...overrides.contributions,
    },
  };
}

function calculateGT(input: GTCalculatorInputs) {
  return GTCalculator.calculate(input);
}

describe("Guatemala calculator", () => {
  it("applies the SAT employment ISR scale after personal deduction and IGSS", () => {
    const result = calculateGT(inputs(480_000));

    expect(result.taxes.socialContributions).toBe(23_184);
    expect(result.taxableIncome).toBe(408_816);
    expect(result.taxes.incomeTax).toBe(22_617.12);
    expect(result.totalTax).toBe(45_801.12);
    expect(result.netSalary).toBe(434_198.88);
  });

  it("applies the VAT planilla as a direct non-refundable ISR credit", () => {
    const result = calculateGT(
      inputs(480_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 12_000,
          charitableDonations: 0,
          insurancePremiums: 0,
        },
      }),
    );
    const credit = (result.breakdown as GTBreakdown).taxCredits.find(
      (taxCredit) => taxCredit.name === "VAT invoice credit",
    );

    expect(
      GTCalculator.getContributionLimits(inputs(480_000)).qualifyingExpenses
        ?.limit,
    ).toBe(12_000);
    expect(credit?.amount).toBe(12_000);
    expect(result.taxes.incomeTax).toBe(10_617.12);
    expect(result.totalTax).toBe(33_801.12);
    expect(result.netSalary).toBe(446_198.88);
  });

  it("caps verified donations at five percent of gross income", () => {
    const result = calculateGT(
      inputs(480_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: 30_000,
          insurancePremiums: 0,
        },
      }),
    );
    const donation = (result.breakdown as GTBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "charitableDonations",
    );

    expect(
      GTCalculator.getContributionLimits(inputs(480_000)).charitableDonations
        ?.limit,
    ).toBe(24_000);
    expect(donation?.amount).toBe(24_000);
    expect(result.taxableIncome).toBe(384_816);
    expect(result.taxes.incomeTax).toBe(20_937.12);
    expect(result.totalTax).toBe(44_121.12);
    expect(result.netSalary).toBe(435_878.88);
  });

  it("deducts death-risk life insurance premiums for salaried workers", () => {
    const result = calculateGT(
      inputs(480_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: 0,
          insurancePremiums: 100_000,
        },
      }),
    );
    const premium = (result.breakdown as GTBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "insurancePremiums",
    );

    expect(premium?.amount).toBe(100_000);
    expect(result.taxableIncome).toBe(308_816);
    expect(result.taxes.incomeTax).toBe(15_617.12);
    expect(result.totalTax).toBe(38_801.12);
    expect(result.netSalary).toBe(441_198.88);
  });

  it("prevents the VAT credit from making ISR negative", () => {
    const result = calculateGT(
      inputs(70_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 12_000,
          charitableDonations: 0,
          insurancePremiums: 0,
        },
      }),
    );

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(3_381);
    expect(result.netSalary).toBe(66_619);
  });
});
