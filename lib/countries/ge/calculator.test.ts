import { describe, expect, it } from "vitest";
import { GECalculator } from "./calculator";
import {
  calculateGeorgiaSmallBusinessTax,
  calculateGeorgiaStatePensionContribution,
} from "./constants/tax-brackets-2026";
import type { GEBreakdown, GECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<GECalculatorInputs> = {},
): GECalculatorInputs {
  return {
    country: "GE",
    grossSalary,
    payFrequency: "annual",
    incomeRegime: "employment",
    residencyType: "resident",
    pensionParticipation: "mandatory_or_enrolled",
    smallBusinessThresholdTreatment: "even_monthly",
    contributions: {},
    ...overrides,
  };
}

function calculateGE(input: GECalculatorInputs) {
  return GECalculator.calculate(input);
}

describe("Georgia calculator", () => {
  it("calculates resident employment salary with banded funded pension state contribution", () => {
    const result = calculateGE(inputs(36_000));
    const breakdown = result.breakdown as GEBreakdown;

    expect(result.taxes.incomeTax).toBe(7_200);
    expect(result.taxes.pensionEmployee).toBe(720);
    expect(result.totalTax).toBe(7_920);
    expect(result.netSalary).toBe(28_080);
    expect(breakdown.pension.employee).toBe(720);
    expect(breakdown.pension.employer).toBe(720);
    expect(breakdown.pension.stateFirstBandContributionSalary).toBe(24_000);
    expect(breakdown.pension.stateSecondBandContributionSalary).toBe(12_000);
    expect(breakdown.pension.state).toBe(600);
    expect(breakdown.pension.totalAccountContribution).toBe(2_040);
  });

  it("caps the state funded pension contribution above GEL 60,000 without reducing employee take-home", () => {
    const result = calculateGE(inputs(70_000));
    const breakdown = result.breakdown as GEBreakdown;

    expect(result.taxes.incomeTax).toBe(14_000);
    expect(result.taxes.pensionEmployee).toBe(1_400);
    expect(result.netSalary).toBe(54_600);
    expect(breakdown.pension.stateContributionSalary).toBe(60_000);
    expect(breakdown.pension.stateFirstBandContributionSalary).toBe(24_000);
    expect(breakdown.pension.stateSecondBandContributionSalary).toBe(36_000);
    expect(breakdown.pension.state).toBe(840);
    expect(breakdown.pension.totalAccountContribution).toBe(3_640);
  });

  it("does not apply funded pension participation to non-resident salary", () => {
    const result = calculateGE(
      inputs(36_000, {
        residencyType: "non_resident",
        pensionParticipation: "mandatory_or_enrolled",
      }),
    );
    const breakdown = result.breakdown as GEBreakdown;

    expect(result.taxes.incomeTax).toBe(7_200);
    expect(result.taxes.pensionEmployee).toBe(0);
    expect(result.netSalary).toBe(28_800);
    expect(breakdown.isPensionParticipant).toBe(false);
    expect(breakdown.pension.totalAccountContribution).toBe(0);
  });

  it("models small business status using threshold-month and full-year 3% options", () => {
    const evenMonthly = calculateGE(
      inputs(600_000, {
        incomeRegime: "small_business",
        pensionParticipation: "not_participating",
        smallBusinessThresholdTreatment: "even_monthly",
      }),
    );
    const fullYear = calculateGE(
      inputs(600_000, {
        incomeRegime: "small_business",
        pensionParticipation: "not_participating",
        smallBusinessThresholdTreatment: "three_percent_full_year",
      }),
    );

    expect(evenMonthly.taxes.incomeTax).toBe(8_000);
    expect((evenMonthly.breakdown as GEBreakdown).businessRegime.standardRateIncome).toBe(
      500_000,
    );
    expect((evenMonthly.breakdown as GEBreakdown).businessRegime.overLimitRateIncome).toBe(
      100_000,
    );
    expect(evenMonthly.netSalary).toBe(592_000);

    expect(fullYear.taxes.incomeTax).toBe(18_000);
    expect(fullYear.netSalary).toBe(582_000);
  });

  it("models micro business status at 0% up to the limit and ordinary 20% when exceeded", () => {
    const withinLimit = calculateGE(
      inputs(20_000, {
        incomeRegime: "micro_business",
        pensionParticipation: "not_participating",
      }),
    );
    const overLimit = calculateGE(
      inputs(40_000, {
        incomeRegime: "micro_business",
        pensionParticipation: "not_participating",
      }),
    );

    expect(withinLimit.taxes.incomeTax).toBe(0);
    expect(withinLimit.netSalary).toBe(20_000);
    expect((withinLimit.breakdown as GEBreakdown).businessRegime.microBusinessLimitExceeded).toBe(
      false,
    );

    expect(overLimit.taxes.incomeTax).toBe(8_000);
    expect(overLimit.netSalary).toBe(32_000);
    expect((overLimit.breakdown as GEBreakdown).businessRegime.microBusinessLimitExceeded).toBe(
      true,
    );
  });

  it("keeps standalone Georgia helper math aligned with official pension and small-business bands", () => {
    expect(calculateGeorgiaStatePensionContribution(12_000)).toMatchObject({
      firstBandContributionSalary: 12_000,
      secondBandContributionSalary: 0,
      total: 240,
    });
    expect(calculateGeorgiaStatePensionContribution(36_000)).toMatchObject({
      firstBandContributionSalary: 24_000,
      secondBandContributionSalary: 12_000,
      total: 600,
    });
    expect(calculateGeorgiaStatePensionContribution(70_000)).toMatchObject({
      firstBandContributionSalary: 24_000,
      secondBandContributionSalary: 36_000,
      total: 840,
    });
    expect(
      calculateGeorgiaSmallBusinessTax(600_000, "even_monthly").tax,
    ).toBe(8_000);
    expect(
      calculateGeorgiaSmallBusinessTax(600_000, "three_percent_full_year").tax,
    ).toBe(18_000);
  });
});
