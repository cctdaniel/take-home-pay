import { describe, expect, it } from "vitest";
import { PHCalculator } from "./calculator";
import type { PHBreakdown, PHCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<PHCalculatorInputs> = {},
): PHCalculatorInputs {
  return {
    country: "PH",
    grossSalary,
    payFrequency: "annual",
    taxpayerType: "residentOrNraEtb",
    sssCovered: true,
    philHealthCovered: true,
    pagIbigCovered: true,
    contributions: {
      thirteenthMonthAndOtherBenefits: 0,
      deMinimisMedicalCashAllowance: 0,
      deMinimisRiceSubsidy: 0,
      deMinimisUniformClothing: 0,
      deMinimisActualMedicalAssistance: 0,
      deMinimisLaundryAllowance: 0,
      deMinimisAchievementAwards: 0,
      deMinimisChristmasGifts: 0,
      deMinimisCbaProductivityIncentives: 0,
    },
    ...overrides,
    contributions: {
      thirteenthMonthAndOtherBenefits: 0,
      deMinimisMedicalCashAllowance: 0,
      deMinimisRiceSubsidy: 0,
      deMinimisUniformClothing: 0,
      deMinimisActualMedicalAssistance: 0,
      deMinimisLaundryAllowance: 0,
      deMinimisAchievementAwards: 0,
      deMinimisChristmasGifts: 0,
      deMinimisCbaProductivityIncentives: 0,
      ...overrides.contributions,
    },
  };
}

describe("Philippines calculator", () => {
  it("calculates ordinary compensation tax with SSS, PhilHealth, and Pag-IBIG deductions", () => {
    const result = PHCalculator.calculate(inputs(600_000));
    const breakdown = result.breakdown as PHBreakdown;

    expect(result.taxableIncome).toBe(561_600);
    expect(result.taxes.incomeTax).toBe(54_820);
    expect(result.taxes.sssEmployee).toBe(21_000);
    expect(result.taxes.philHealthEmployee).toBe(15_000);
    expect(result.taxes.pagIbigEmployee).toBe(2_400);
    expect(result.totalTax).toBe(93_220);
    expect(result.netSalary).toBe(506_780);
    expect(breakdown.sss.msc).toBe(35_000);
    expect(breakdown.philHealth.monthlyBase).toBe(50_000);
    expect(breakdown.pagIbig.mfs).toBe(10_000);
  });

  it("caps 13th month and BIR de minimis benefits before reducing taxable compensation", () => {
    const result = PHCalculator.calculate(
      inputs(1_200_000, {
        contributions: {
          thirteenthMonthAndOtherBenefits: 999_999,
          deMinimisMedicalCashAllowance: 999_999,
          deMinimisRiceSubsidy: 999_999,
          deMinimisUniformClothing: 999_999,
          deMinimisActualMedicalAssistance: 999_999,
          deMinimisLaundryAllowance: 999_999,
          deMinimisAchievementAwards: 999_999,
          deMinimisChristmasGifts: 999_999,
          deMinimisCbaProductivityIncentives: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as PHBreakdown;

    expect(breakdown.thirteenthMonthAndOtherBenefitsExempt).toBe(90_000);
    expect(breakdown.deMinimisBenefitsExempt).toMatchObject({
      medicalCashAllowance: 4_000,
      riceSubsidy: 30_000,
      uniformClothing: 8_000,
      actualMedicalAssistance: 12_000,
      laundryAllowance: 4_800,
      achievementAwards: 12_000,
      christmasGifts: 6_000,
      cbaProductivityIncentives: 12_000,
      total: 88_800,
    });
    expect(result.taxableIncome).toBe(967_800);
    expect(result.taxes.incomeTax).toBe(144_450);
    expect(result.totalTax).toBe(197_850);
    expect(result.netSalary).toBe(1_002_150);
  });

  it("uses 25% gross tax and no benefit exclusions for NRA not engaged in trade", () => {
    const result = PHCalculator.calculate(
      inputs(600_000, {
        taxpayerType: "nraNotEngaged",
        contributions: {
          thirteenthMonthAndOtherBenefits: 90_000,
          deMinimisRiceSubsidy: 30_000,
        },
      }),
    );
    const breakdown = result.breakdown as PHBreakdown;
    const limits = PHCalculator.getContributionLimits(
      inputs(600_000, { taxpayerType: "nraNotEngaged" }),
    );

    expect(limits).toEqual({});
    expect(breakdown.mandatoryContributionsTaxDeductible).toBe(false);
    expect(breakdown.thirteenthMonthAndOtherBenefitsExempt).toBe(0);
    expect(breakdown.deMinimisBenefitsExempt.total).toBe(0);
    expect(result.taxableIncome).toBe(600_000);
    expect(result.taxes.incomeTax).toBe(150_000);
    expect(result.totalTax).toBe(188_400);
    expect(result.netSalary).toBe(411_600);
  });
});
