import { describe, expect, it } from "vitest";
import { PLCalculator } from "./calculator";
import {
  calculatePLPITOIncomeBase,
  PL_DONATION_DEDUCTION_LIMIT_RATE,
  PL_IKZE_LIMIT,
  PL_INTERNET_RELIEF_LIMIT,
  PL_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { PLBreakdown, PLCalculatorInputs } from "./types";

type PLOverrides = Omit<Partial<PLCalculatorInputs>, "contributions"> & {
  contributions?: Partial<PLCalculatorInputs["contributions"]>;
};

function inputs(overrides: PLOverrides = {}): PLCalculatorInputs {
  return {
    country: "PL",
    grossSalary: PL_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfChildren: 0,
    ppkRate: "0",
    pitZeroRelief: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(breakdown: PLBreakdown, key: string): number {
  return (
    breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === key,
    )?.amount ?? 0
  );
}

describe("Poland calculator", () => {
  it("exposes IKZE, PIT/O donation, and internet relief limits", () => {
    const grossSalary = PL_TAX_CONFIG.defaultSalary;
    const incomeBase = calculatePLPITOIncomeBase(grossSalary, inputs());
    const limits = PLCalculator.getContributionLimits(inputs({ grossSalary }));

    expect(limits.retirementContribution?.limit).toBe(PL_IKZE_LIMIT);
    expect(limits.charitableDonations?.limit).toBeCloseTo(
      incomeBase * PL_DONATION_DEDUCTION_LIMIT_RATE,
      2,
    );
    expect(limits.qualifyingExpenses?.limit).toBe(PL_INTERNET_RELIEF_LIMIT);
  });

  it("caps PIT/O donations and internet relief as annual-return deductions", () => {
    const grossSalary = PL_TAX_CONFIG.defaultSalary;
    const incomeBase = calculatePLPITOIncomeBase(grossSalary, inputs());
    const donationLimit = incomeBase * PL_DONATION_DEDUCTION_LIMIT_RATE;
    const base = PLCalculator.calculate(inputs({ grossSalary }));
    const withReliefs = PLCalculator.calculate(
      inputs({
        grossSalary,
        contributions: {
          retirementContribution: 20_000,
          charitableDonations: 20_000,
          qualifyingExpenses: 1_000,
        },
      }),
    );
    const breakdown = withReliefs.breakdown as PLBreakdown;

    expect(contributionAmount(breakdown, "retirementContribution")).toBe(
      PL_IKZE_LIMIT,
    );
    expect(contributionAmount(breakdown, "charitableDonations")).toBeCloseTo(
      donationLimit,
      2,
    );
    expect(contributionAmount(breakdown, "qualifyingExpenses")).toBe(
      PL_INTERNET_RELIEF_LIMIT,
    );
    expect(withReliefs.taxableIncome).toBeCloseTo(
      base.taxableIncome -
        PL_IKZE_LIMIT -
        donationLimit -
        PL_INTERNET_RELIEF_LIMIT,
      2,
    );
    expect(withReliefs.totalTax).toBeLessThan(base.totalTax);
    expect(withReliefs.totalDeductions).toBeCloseTo(
      withReliefs.totalTax + PL_IKZE_LIMIT,
      2,
    );
  });

  it("reduces the donation limit when PIT-0 relief removes salary income", () => {
    const grossSalary = 80_000;
    const limits = PLCalculator.getContributionLimits(
      inputs({
        grossSalary,
        pitZeroRelief: "youth_under_26",
      }),
    );

    expect(limits.charitableDonations?.limit).toBe(0);
  });
});
