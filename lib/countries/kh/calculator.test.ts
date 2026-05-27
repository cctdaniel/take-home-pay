import { describe, expect, it } from "vitest";
import { KHCalculator } from "./calculator";
import {
  getCambodiaNssfHealthCareBaseMonthly,
  getCambodiaNssfPensionBaseMonthly,
} from "./constants/tax-year-2026";
import type { KHBreakdown, KHCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<KHCalculatorInputs> = {},
): KHCalculatorInputs {
  return {
    country: "KH",
    grossSalary,
    payFrequency: "annual",
    taxResidency: "resident",
    hasDependentSpouse: false,
    dependentChildren: 0,
    taxableFringeBenefits: 0,
    nssfMonthlyWage: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

function calculateKH(input: KHCalculatorInputs) {
  return KHCalculator.calculate(input);
}

describe("Cambodia calculator", () => {
  it("calculates resident tax-on-salary and employee NSSF at the default salary", () => {
    const result = calculateKH(inputs(120_000_000));
    const breakdown = result.breakdown as KHBreakdown;

    expect(result.taxes.incomeTax).toBe(10_800_000);
    expect(result.taxes.socialContributions).toBe(475_200);
    expect(result.totalTax).toBe(11_275_200);
    expect(result.netSalary).toBe(108_724_800);
    expect(result.taxableIncome).toBe(120_000_000);
    expect(breakdown.nssfHealthCareBaseMonthly).toBe(1_200_000);
    expect(breakdown.nssfPensionBaseMonthly).toBe(1_200_000);
  });

  it("applies resident spouse and child allowances before the progressive salary tax", () => {
    const result = calculateKH(
      inputs(120_000_000, {
        hasDependentSpouse: true,
        dependentChildren: 2,
      }),
    );

    expect(result.taxableIncome).toBe(114_600_000);
    expect(result.taxes.incomeTax).toBe(9_990_000);
    expect(result.taxes.socialContributions).toBe(475_200);
    expect(result.netSalary).toBe(109_534_800);
  });

  it("uses the non-resident flat salary tax and removes family allowances", () => {
    const result = calculateKH(
      inputs(120_000_000, {
        taxResidency: "nonResident",
        hasDependentSpouse: true,
        dependentChildren: 4,
      }),
    );

    expect(result.taxableIncome).toBe(120_000_000);
    expect(result.taxes.incomeTax).toBe(24_000_000);
    expect(result.taxes.socialContributions).toBe(475_200);
    expect(result.netSalary).toBe(95_524_800);
  });

  it("taxes fringe benefits separately without adding them to cash gross salary", () => {
    const result = calculateKH(
      inputs(120_000_000, {
        taxableFringeBenefits: 12_000_000,
      }),
    );
    const breakdown = result.breakdown as KHBreakdown;

    expect(result.grossSalary).toBe(120_000_000);
    expect(result.taxableIncome).toBe(132_000_000);
    expect(result.taxes.fringeBenefitTax).toBe(2_400_000);
    expect(result.taxes.incomeTax).toBe(13_200_000);
    expect(result.totalTax).toBe(13_675_200);
    expect(result.netSalary).toBe(106_324_800);
    expect(breakdown.taxableFringeBenefits).toBe(12_000_000);
  });

  it("uses selected NSSF wage bands for health care and pension bases", () => {
    const result = calculateKH(
      inputs(120_000_000, {
        nssfMonthlyWage: 500_000,
      }),
    );
    const breakdown = result.breakdown as KHBreakdown;

    expect(breakdown.nssfMonthlyWage).toBe(500_000);
    expect(breakdown.nssfHealthCareBaseMonthly).toBe(475_000);
    expect(breakdown.nssfPensionBaseMonthly).toBe(500_000);
    expect(result.taxes.socialContributions).toBe(194_100);
    expect(result.netSalary).toBe(109_005_900);
  });

  it("keeps NSSF base helper floors aligned with modeled floors", () => {
    const lowWageInputs = inputs(12_000_000, { nssfMonthlyWage: 100_000 });

    expect(
      getCambodiaNssfHealthCareBaseMonthly({
        grossSalary: lowWageInputs.grossSalary,
        inputs: lowWageInputs,
      }),
    ).toBe(200_000);
    expect(
      getCambodiaNssfPensionBaseMonthly({
        grossSalary: lowWageInputs.grossSalary,
        inputs: lowWageInputs,
      }),
    ).toBe(400_000);
  });
});
