import { describe, expect, it } from "vitest";
import {
  EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS,
} from "./constants/tax-year-2026";
import { ECCalculator } from "./calculator";
import type { ECBreakdown, ECCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ECCalculatorInputs> = {},
): ECCalculatorInputs {
  return {
    country: "EC",
    grossSalary,
    payFrequency: "annual",
    familyDependents: 0,
    hasDisabilityOrCatastrophicIllness: false,
    incomeExemptionType: "none",
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

function calculateEC(input: ECCalculatorInputs) {
  return ECCalculator.calculate(input);
}

describe("Ecuador calculator", () => {
  it("applies the SRI 2026 fixed-base table after IESS", () => {
    const result = calculateEC(inputs(60_000));
    const breakdown = result.breakdown as ECBreakdown;

    expect(result.taxes.socialContributions).toBe(5_670);
    expect(result.taxableIncome).toBe(54_330);
    expect(result.taxes.incomeTax).toBe(6_903.75);
    expect(result.totalTax).toBe(12_573.75);
    expect(result.netSalary).toBe(47_426.25);
    expect(breakdown.personalExpenseBasketCount).toBe(7);
  });

  it("applies the no-dependent personal-expense rebate as a non-refundable credit", () => {
    const noDependentLimit = 5_752.6;
    const result = calculateEC(
      inputs(60_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: noDependentLimit,
        },
      }),
    );
    const credit = (result.breakdown as ECBreakdown).taxCredits.find(
      (taxCredit) => taxCredit.name === "Qualifying personal expenses credit",
    );

    expect(
      ECCalculator.getContributionLimits(inputs(60_000)).qualifyingExpenses
        ?.limit,
    ).toBe(noDependentLimit);
    expect(credit?.amount).toBe(1_035.47);
    expect(result.taxes.incomeTax).toBe(5_868.28);
    expect(result.totalTax).toBe(11_538.28);
    expect(result.netSalary).toBe(48_461.72);
  });

  it("applies the older-adult taxable-base exemption", () => {
    const result = calculateEC(
      inputs(60_000, { incomeExemptionType: "olderAdult" }),
    );
    const breakdown = result.breakdown as ECBreakdown;

    expect(breakdown.personalAllowance).toBe(12_208);
    expect(breakdown.incomeExemptionName).toBe("Older adult income exemption");
    expect(result.taxableIncome).toBe(42_122);
    expect(result.taxes.incomeTax).toBe(4_075.2);
    expect(result.totalTax).toBe(9_745.2);
    expect(result.netSalary).toBe(50_254.8);
  });

  it("uses the SRI disability/catastrophic 100-basket expense cap and floors income tax at zero", () => {
    const result = calculateEC(
      inputs(60_000, {
        hasDisabilityOrCatastrophicIllness: true,
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 200_000,
        },
      }),
    );
    const breakdown = result.breakdown as ECBreakdown;
    const personalExpenses = breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === "qualifyingExpenses",
    );
    const credit = breakdown.taxCredits.find(
      (taxCredit) => taxCredit.name === "Qualifying personal expenses credit",
    );

    expect(breakdown.personalExpenseBasketCount).toBe(
      EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS,
    );
    expect(personalExpenses?.limit).toBe(82_180);
    expect(personalExpenses?.amount).toBe(82_180);
    expect(credit?.amount).toBe(14_792.4);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(5_670);
    expect(result.netSalary).toBe(54_330);
  });

  it("clamps registered family dependents to the five-dependent basket cap", () => {
    const result = calculateEC(inputs(60_000, { familyDependents: 9 }));

    expect((result.breakdown as ECBreakdown).personalExpenseBasketCount).toBe(
      20,
    );
    expect(
      ECCalculator.getContributionLimits(
        inputs(60_000, { familyDependents: 9 }),
      ).qualifyingExpenses?.limit,
    ).toBe(16_436);
  });
});
