import { describe, expect, it } from "vitest";
import { ILCalculator } from "./calculator";
import {
  IL_SECTION_46_DONATION_CREDIT_RATE,
  IL_SECTION_46_DONATION_MINIMUM,
} from "./constants/tax-year-2026";
import type { ILBreakdown, ILCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ILCalculatorInputs> = {},
): ILCalculatorInputs {
  const defaults = ILCalculator.getDefaultInputs() as ILCalculatorInputs;

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

function creditAmount(breakdown: ILBreakdown, name: string) {
  return (
    breakdown.taxCredits.find((credit) => credit.name === name)?.amount ?? 0
  );
}

describe("Israel calculator", () => {
  it("exposes study fund and Section 46 donation limits", () => {
    const limits = ILCalculator.getContributionLimits(inputs(360_000));

    expect(limits.qualifyingExpenses?.name).toBe(
      "Study fund employee contribution",
    );
    expect(limits.qualifyingExpenses?.limit).toBe(4_713.6);
    expect(limits.charitableDonations?.name).toBe(
      "Section 46 approved donations",
    );
    expect(limits.charitableDonations?.limit).toBe(108_000);
  });

  it("applies the Section 46 minimum, cap, and non-refundable credit", () => {
    const base = ILCalculator.calculate(inputs(360_000));
    const belowMinimum = ILCalculator.calculate(
      inputs(360_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: IL_SECTION_46_DONATION_MINIMUM,
        },
      }),
    );
    const withDonation = ILCalculator.calculate(
      inputs(360_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: 10_000,
        },
      }),
    );
    const breakdown = withDonation.breakdown as ILBreakdown;

    expect(belowMinimum.taxes.incomeTax).toBe(base.taxes.incomeTax);
    expect(withDonation.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(creditAmount(breakdown, "Section 46 donation credit")).toBe(
      10_000 * IL_SECTION_46_DONATION_CREDIT_RATE,
    );
    expect(withDonation.netSalary).toBe(base.netSalary + 3_500);
  });
});
