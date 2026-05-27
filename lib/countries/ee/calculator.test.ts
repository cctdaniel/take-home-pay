import { describe, expect, it } from "vitest";
import { EECalculator } from "./calculator";
import type { EEBreakdown, EECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<EECalculatorInputs> = {},
): EECalculatorInputs {
  return {
    country: "EE",
    grossSalary,
    payFrequency: "annual",
    secondPillarRate: "2",
    isPensionableAge: false,
    pensionBasicExemptionUsedElsewhere: 0,
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

describe("Estonia calculator", () => {
  it("calculates 2026 income tax with basic exemption, unemployment insurance, and default second pillar", () => {
    const result = EECalculator.calculate(inputs(60_000));
    const breakdown = result.breakdown as EEBreakdown;

    expect(breakdown.personalAllowance).toBe(8_400);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Unemployment insurance employee contribution",
          amount: 960,
          rate: 0.016,
          preTax: true,
        }),
        expect.objectContaining({
          name: "Funded pension employee contribution",
          amount: 1_200,
          rate: 0.02,
          preTax: true,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(49_440);
    expect(result.taxes.incomeTax).toBe(10_876.8);
    expect(result.totalTax).toBe(13_036.8);
    expect(result.netSalary).toBe(46_963.2);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/tax-rates",
        "https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/contributions-supplementary-funded-pension",
      ]),
    );
  });

  it("uses pensionable-age exemption, stops employee unemployment insurance, and caps third-pillar savings", () => {
    const result = EECalculator.calculate(
      inputs(80_000, {
        secondPillarRate: "6",
        isPensionableAge: true,
        pensionBasicExemptionUsedElsewhere: 4_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as EEBreakdown;
    const limits = EECalculator.getContributionLimits(inputs(30_000));

    expect(limits.retirementContribution?.limit).toBe(4_500);
    expect(breakdown.personalAllowance).toBe(5_312);
    expect(breakdown.mandatoryContributions).toEqual([
      expect.objectContaining({
        name: "Funded pension employee contribution",
        amount: 4_800,
        rate: 0.06,
        preTax: true,
      }),
    ]);
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "retirementContribution",
        amount: 6_000,
        limit: 6_000,
      }),
    ]);
    expect(result.taxableIncome).toBe(63_888);
    expect(result.taxes.socialContributions).toBe(4_800);
    expect(result.totalDeductions).toBe(24_855.36);
    expect(result.netSalary).toBe(55_144.64);
  });
});
