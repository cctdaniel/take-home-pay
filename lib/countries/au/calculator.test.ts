import { describe, expect, it } from "vitest";
import { AUCalculator } from "./calculator";
import type { AUBreakdown, AUCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<AUCalculatorInputs> = {},
): AUCalculatorInputs {
  return {
    country: "AU",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    medicareFamilyStatus: "single",
    medicareSpouseIncome: 0,
    numberOfDependentChildren: 0,
    hasPrivateHealthInsurance: true,
    contributions: {
      salarySacrificeSuper: 0,
      workRelatedExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      salarySacrificeSuper: 0,
      workRelatedExpenses: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("Australia calculator", () => {
  it("calculates 2025-26 resident tax, Medicare levy, LITO, and employer super context", () => {
    const result = AUCalculator.calculate(inputs(100_000));
    const breakdown = result.breakdown as AUBreakdown;

    expect(result.taxableIncome).toBe(100_000);
    expect(breakdown.grossIncomeTax).toBe(20_788);
    expect(breakdown.lito).toBe(0);
    expect(result.taxes.incomeTax).toBe(20_788);
    expect(result.taxes.medicareLevy).toBe(2_000);
    expect(result.taxes.medicareLevySurcharge).toBe(0);
    expect(result.totalTax).toBe(22_788);
    expect(result.netSalary).toBe(77_212);
    expect(breakdown.superannuation.employerContribution).toBe(12_000);
    expect(breakdown.superannuation.remainingConcessionalCap).toBe(18_000);
  });

  it("caps concessional super, work deductions, and DGR gifts consistently", () => {
    const limits = AUCalculator.getContributionLimits(
      inputs(100_000, {
        contributions: {
          salarySacrificeSuper: 999_999,
          workRelatedExpenses: 50_000,
        },
      }),
    );
    const result = AUCalculator.calculate(
      inputs(100_000, {
        hasPrivateHealthInsurance: false,
        contributions: {
          salarySacrificeSuper: 999_999,
          workRelatedExpenses: 999_999,
          charitableDonations: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as AUBreakdown;

    expect(limits.salarySacrificeSuper?.limit).toBe(18_000);
    expect(limits.workRelatedExpenses?.limit).toBe(82_000);
    expect(limits.charitableDonations?.limit).toBe(32_000);
    expect(breakdown.superannuation.salarySacrificeContribution).toBe(18_000);
    expect(breakdown.taxBaseBeforeAnnualDeductions).toBe(82_000);
    expect(breakdown.workRelatedExpenses).toBe(82_000);
    expect(breakdown.charitableDonations).toBe(0);
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(18_000);
    expect(result.netSalary).toBe(82_000);
  });

  it("applies family Medicare levy thresholds and dependent-child surcharge increments", () => {
    const result = AUCalculator.calculate(
      inputs(60_000, {
        medicareFamilyStatus: "family",
        medicareSpouseIncome: 0,
        numberOfDependentChildren: 2,
        hasPrivateHealthInsurance: false,
      }),
    );
    const breakdown = result.breakdown as AUBreakdown;

    expect(result.taxes.incomeTax).toBe(8_688);
    expect(result.taxes.medicareLevy).toBeCloseTo(566.1, 5);
    expect(result.taxes.medicareLevySurcharge).toBe(0);
    expect(breakdown.medicareLevyReductionApplied).toBe(true);
    expect(breakdown.medicareLevyThresholds.lowerThreshold).toBe(54_339);
    expect(breakdown.medicareLevyThresholds.upperThreshold).toBe(67_923.75);
    expect(breakdown.medicareSurchargeThresholds.base).toBe(203_500);
    expect(result.netSalary).toBeCloseTo(50_745.9, 5);
  });

  it("uses foreign-resident brackets without Medicare or resident offsets", () => {
    const result = AUCalculator.calculate(
      inputs(100_000, { residencyType: "non_resident" }),
    );
    const breakdown = result.breakdown as AUBreakdown;

    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(32_500);
    expect(result.taxes.medicareLevy).toBe(0);
    expect(result.taxes.medicareLevySurcharge).toBe(0);
    expect(breakdown.lito).toBe(0);
    expect(breakdown.isResident).toBe(false);
    expect(result.netSalary).toBe(67_500);
  });
});
