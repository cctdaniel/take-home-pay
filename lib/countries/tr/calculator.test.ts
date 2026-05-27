import { describe, expect, it } from "vitest";
import { TRCalculator } from "./calculator";
import {
  calculateTRAnnualReturnIncomeBase,
  TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE,
  TR_GENERAL_DONATION_LIMIT_RATE,
  TR_INSURANCE_PREMIUM_RATE_LIMIT,
  TR_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { TRBreakdown, TRCalculatorInputs } from "./types";

type TROverrides = Omit<Partial<TRCalculatorInputs>, "contributions"> & {
  contributions?: Partial<TRCalculatorInputs["contributions"]>;
};

function inputs(overrides: TROverrides = {}): TRCalculatorInputs {
  return {
    country: "TR",
    grossSalary: 1_800_000,
    payFrequency: "monthly",
    disabilityDegree: "none",
    donationReliefCategory: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
      ...overrides.contributions,
    },
  };
}

function trBreakdown(input: TRCalculatorInputs): TRBreakdown {
  const result = TRCalculator.calculate(input);
  expect(result.breakdown.type).toBe("TR");
  return result.breakdown as TRBreakdown;
}

function contributionAmount(breakdown: TRBreakdown, key: string): number {
  return (
    breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === key,
    )?.amount ?? 0
  );
}

describe("Turkey calculator", () => {
  it("exposes GIB salary and annual-return deduction limits", () => {
    const grossSalary = 1_800_000;
    const returnIncomeBase = calculateTRAnnualReturnIncomeBase(grossSalary);

    const noDonationLimits = TRCalculator.getContributionLimits(
      inputs({ grossSalary }),
    );
    expect(noDonationLimits.insurancePremiums?.limit).toBe(
      grossSalary * TR_INSURANCE_PREMIUM_RATE_LIMIT,
    );
    expect(noDonationLimits.qualifyingExpenses?.name).toBe("Trade union dues");
    expect(noDonationLimits.qualifyingExpenses?.limit).toBe(grossSalary);
    expect(noDonationLimits.educationExpenses?.limit).toBe(
      returnIncomeBase * TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE,
    );
    expect(noDonationLimits.charitableDonations?.limit).toBe(0);

    const generalDonationLimits = TRCalculator.getContributionLimits(
      inputs({ grossSalary, donationReliefCategory: "generalPublicBenefit" }),
    );
    expect(generalDonationLimits.charitableDonations?.limit).toBe(
      returnIncomeBase * TR_GENERAL_DONATION_LIMIT_RATE,
    );

    const fullDonationLimits = TRCalculator.getContributionLimits(
      inputs({ grossSalary, donationReliefCategory: "fullEducationHealth" }),
    );
    expect(fullDonationLimits.charitableDonations?.limit).toBe(returnIncomeBase);
  });

  it("caps insurance, education/health, and donation deductions in taxable income", () => {
    const grossSalary = 1_800_000;
    const returnIncomeBase = calculateTRAnnualReturnIncomeBase(grossSalary);
    const base = TRCalculator.calculate(inputs({ grossSalary }));
    const result = TRCalculator.calculate(
      inputs({
        grossSalary,
        donationReliefCategory: "generalPublicBenefit",
        contributions: {
          insurancePremiums: 500_000,
          qualifyingExpenses: 10_000,
          educationExpenses: 500_000,
          charitableDonations: 500_000,
        },
      }),
    );
    const breakdown = result.breakdown as TRBreakdown;

    expect(contributionAmount(breakdown, "insurancePremiums")).toBe(270_000);
    expect(contributionAmount(breakdown, "qualifyingExpenses")).toBe(10_000);
    expect(contributionAmount(breakdown, "educationExpenses")).toBe(
      returnIncomeBase * TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE,
    );
    expect(contributionAmount(breakdown, "charitableDonations")).toBe(
      returnIncomeBase * TR_GENERAL_DONATION_LIMIT_RATE,
    );
    expect(result.taxableIncome).toBe(1_020_500);
    expect(result.totalTax).toBeLessThan(base.totalTax);
  });

  it("keeps the 2026 disability allowance as a selectable wage deduction", () => {
    const base = trBreakdown(inputs({ grossSalary: TR_TAX_CONFIG.defaultSalary }));
    const withDisability = trBreakdown(
      inputs({
        grossSalary: TR_TAX_CONFIG.defaultSalary,
        disabilityDegree: "first",
      }),
    );

    expect(
      withDisability.deductions.find(
        (deduction) => deduction.name === "Disability allowance",
      )?.amount,
    ).toBe(144_000);
    expect(withDisability.taxableIncome).toBeLessThan(base.taxableIncome);
  });
});
