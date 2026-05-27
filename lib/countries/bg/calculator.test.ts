import { describe, expect, it } from "vitest";
import { BGCalculator } from "./calculator";
import type { BGBreakdown, BGCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BGCalculatorInputs> = {},
): BGCalculatorInputs {
  return {
    country: "BG",
    grossSalary,
    payFrequency: "annual",
    numberOfChildren: 0,
    numberOfDisabledChildren: 0,
    hasReducedWorkingCapacity: false,
    donationReliefCategory: "general_5",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("Bulgaria calculator", () => {
  it("calculates euro-denominated 2026 flat PIT with the employee social-insurance ceiling", () => {
    const result = BGCalculator.calculate(inputs(36_000));
    const breakdown = result.breakdown as BGBreakdown;

    expect(result.currency).toBe("EUR");
    expect(result.taxableIncome).toBe(32_110.73);
    expect(result.taxes.incomeTax).toBe(3_211.07);
    expect(result.taxes.socialContributions).toBe(3_889.27);
    expect(result.netSalary).toBe(28_899.66);
    expect(breakdown.mandatoryContributions).toEqual([
      expect.objectContaining({
        name: "Employee social and health insurance",
        amount: 3_889.27,
        rate: 0.1378,
        cap: 28_224,
        preTax: true,
      }),
    ]);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://economy-finance.ec.europa.eu/euro/eu-countries-and-euro/bulgaria-and-euro_en",
        "https://nra.bg/wps/portal/nra/taxes/godishen-danak-varhu-dohdite/danachni-oblekcheniya",
      ]),
    );
  });

  it("applies child, disability, voluntary insurance, and selected donation-category relief caps", () => {
    const reliefInputs = inputs(36_000, {
      numberOfChildren: 3,
      numberOfDisabledChildren: 2,
      hasReducedWorkingCapacity: true,
      donationReliefCategory: "medical_50",
      contributions: {
        retirementContribution: 999_999,
        insurancePremiums: 999_999,
        charitableDonations: 999_999,
      },
    });
    const result = BGCalculator.calculate(reliefInputs);
    const breakdown = result.breakdown as BGBreakdown;
    const limits = BGCalculator.getContributionLimits(reliefInputs);

    expect(limits.retirementContribution?.limit).toBe(3_211.07);
    expect(limits.insurancePremiums?.limit).toBe(3_211.07);
    expect(limits.charitableDonations?.limit).toBe(16_055.37);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Child and disabled-child tax relief",
          amount: 21_474.26,
        }),
        expect.objectContaining({
          name: "50%+ reduced working capacity relief",
          amount: 4_049.43,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 3_211.07,
          limit: 3_211.07,
        }),
        expect.objectContaining({
          key: "insurancePremiums",
          amount: 3_211.07,
          limit: 3_211.07,
        }),
        expect.objectContaining({
          key: "charitableDonations",
          amount: 16_055.37,
          limit: 16_055.37,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(26_366.78);
    expect(result.netSalary).toBe(9_633.22);
  });
});
