import { describe, expect, it } from "vitest";
import { ISCalculator } from "./calculator";
import {
  IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
  IS_PUBLIC_BENEFIT_DONATION_MINIMUM,
} from "./constants/tax-year-2026";
import type { ISBreakdown, ISCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ISCalculatorInputs> = {},
): ISCalculatorInputs {
  const defaults = ISCalculator.getDefaultInputs() as ISCalculatorInputs;

  return {
    ...defaults,
    grossSalary,
    payFrequency: "annual",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(breakdown: ISBreakdown, key: string) {
  return (
    breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === key,
    )?.amount ?? 0
  );
}

describe("Iceland calculator", () => {
  it("exposes pension and registered public-benefit donation limits", () => {
    const limits = ISCalculator.getContributionLimits(inputs(9_600_000));

    expect(limits.privatePensionContribution?.name).toBe(
      "Private supplementary pension contribution",
    );
    expect(limits.privatePensionContribution?.limit).toBe(384_000);
    expect(limits.charitableDonations?.name).toBe(
      "Registered public-benefit donations",
    );
    expect(limits.charitableDonations?.limit).toBe(
      IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
    );
  });

  it("applies the registered donation minimum and cap as a tax-base deduction", () => {
    const base = ISCalculator.calculate(inputs(9_600_000));
    const belowMinimum = ISCalculator.calculate(
      inputs(9_600_000, {
        contributions: {
          privatePensionContribution: 0,
          charitableDonations: IS_PUBLIC_BENEFIT_DONATION_MINIMUM - 1,
        },
      }),
    );
    const capped = ISCalculator.calculate(
      inputs(9_600_000, {
        contributions: {
          privatePensionContribution: 0,
          charitableDonations:
            IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT + 100_000,
        },
      }),
    );
    const cappedBreakdown = capped.breakdown as ISBreakdown;

    expect(belowMinimum.taxableIncome).toBe(base.taxableIncome);
    expect(belowMinimum.taxes.incomeTax).toBe(base.taxes.incomeTax);
    expect(capped.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(capped.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(
      contributionAmount(cappedBreakdown, "charitableDonations"),
    ).toBe(IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT);
    expect(capped.netSalary).toBe(
      9_600_000 - capped.totalTax - contributionAmount(cappedBreakdown, "privatePensionContribution"),
    );
  });
});
