import { describe, expect, it } from "vitest";
import { RWCalculator } from "./calculator";
import type { RWBreakdown, RWCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<RWCalculatorInputs> = {},
): RWCalculatorInputs {
  return {
    country: "RW",
    grossSalary,
    payFrequency: "annual",
    pensionCoverage: "employee",
    rssbMedicalSchemeCovered: false,
    rssbContributionSalaryMonthly: 0,
    rssbMedicalBasicSalaryMonthly: 0,
    hasHousingBenefit: false,
    hasMotorVehicleBenefit: false,
    otherTaxableBenefitsInKind: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

function calculateRW(input: RWCalculatorInputs) {
  return RWCalculator.calculate(input);
}

describe("Rwanda calculator", () => {
  it("calculates PAYE, RSSB pension, maternity, and CBHI for an ordinary employee", () => {
    const result = calculateRW(inputs(36_000_000));
    const breakdown = result.breakdown as RWBreakdown;

    expect(result.taxes.incomeTax).toBe(10_368_000);
    expect(result.taxes.socialContributions).toBe(2_384_820);
    expect(result.totalTax).toBe(12_752_820);
    expect(result.netSalary).toBe(23_247_180);
    expect(breakdown.rssbContributionSalaryMonthly).toBe(3_000_000);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "RSSB pension employee contribution",
          amount: 2_160_000,
        }),
        expect.objectContaining({
          name: "RSSB maternity leave contribution",
          amount: 108_000,
        }),
        expect.objectContaining({
          name: "CBHI health contribution",
          amount: 116_820,
        }),
      ]),
    );
  });

  it("adds housing benefits in kind to the PAYE base without increasing RSSB contribution salary", () => {
    const result = calculateRW(
      inputs(36_000_000, {
        hasHousingBenefit: true,
      }),
    );
    const breakdown = result.breakdown as RWBreakdown;

    expect(breakdown.taxableBenefitsInKind.housing).toBe(7_200_000);
    expect(breakdown.taxableBenefitsInKind.total).toBe(7_200_000);
    expect(result.taxableIncome).toBe(43_200_000);
    expect(result.taxes.cashIncomeTax).toBe(10_368_000);
    expect(result.taxes.benefitsInKindTaxEffect).toBe(2_160_000);
    expect(result.taxes.incomeTax).toBe(12_528_000);
    expect(breakdown.rssbContributionSalaryMonthly).toBe(3_000_000);
    expect(result.taxes.socialContributions).toBe(2_374_020);
    expect(result.netSalary).toBe(21_097_980);
  });

  it("supports voluntary pension member and RSSB medical-scheme contribution bases", () => {
    const result = calculateRW(
      inputs(36_000_000, {
        pensionCoverage: "voluntaryMember",
        rssbContributionSalaryMonthly: 2_000_000,
        rssbMedicalSchemeCovered: true,
        rssbMedicalBasicSalaryMonthly: 2_000_000,
      }),
    );
    const breakdown = result.breakdown as RWBreakdown;

    expect(breakdown.rssbContributionSalaryMonthly).toBe(2_000_000);
    expect(breakdown.rssbMedicalBasicSalaryMonthly).toBe(2_000_000);
    expect(result.taxes.incomeTax).toBe(10_368_000);
    expect(result.taxes.socialContributions).toBe(4_856_400);
    expect(result.totalTax).toBe(15_224_400);
    expect(result.netSalary).toBe(20_775_600);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "RSSB voluntary pension member contribution",
          amount: 2_880_000,
        }),
        expect.objectContaining({
          name: "RSSB maternity leave contribution",
          amount: 72_000,
        }),
        expect.objectContaining({
          name: "RSSB medical scheme employee contribution",
          amount: 1_800_000,
        }),
        expect.objectContaining({
          name: "CBHI health contribution",
          amount: 104_400,
        }),
      ]),
    );
  });

  it("adds motor vehicle and other taxable benefits to PAYE taxable income", () => {
    const result = calculateRW(
      inputs(12_000_000, {
        hasMotorVehicleBenefit: true,
        otherTaxableBenefitsInKind: 600_000,
      }),
    );
    const breakdown = result.breakdown as RWBreakdown;

    expect(breakdown.taxableBenefitsInKind.motorVehicle).toBe(1_200_000);
    expect(breakdown.taxableBenefitsInKind.other).toBe(600_000);
    expect(breakdown.taxableBenefitsInKind.total).toBe(1_800_000);
    expect(result.taxableIncome).toBe(13_800_000);
    expect(result.taxes.benefitsInKindTaxEffect).toBe(540_000);
  });
});
