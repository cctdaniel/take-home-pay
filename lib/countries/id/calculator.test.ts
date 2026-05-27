import { describe, expect, it } from "vitest";
import { IDCalculator } from "./calculator";
import type { IDBreakdown, IDCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<IDCalculatorInputs> = {},
): IDCalculatorInputs {
  return {
    country: "ID",
    grossSalary,
    payFrequency: "annual",
    contributions: {
      dplkContribution: 0,
      zakatContribution: 0,
    },
    taxReliefs: {
      maritalStatus: "single",
      numberOfDependents: 0,
      spouseIncomeCombined: false,
    },
    ...overrides,
    contributions: {
      dplkContribution: 0,
      zakatContribution: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      maritalStatus: "single",
      numberOfDependents: 0,
      spouseIncomeCombined: false,
      ...overrides.taxReliefs,
    },
  };
}

describe("Indonesia calculator", () => {
  it("applies job expense, PTKP, BPJS employee deductions, and resident PPh 21 brackets", () => {
    const result = IDCalculator.calculate(inputs(120_000_000));
    const breakdown = result.breakdown as IDBreakdown;

    expect(breakdown.jobExpense).toBe(6_000_000);
    expect(breakdown.pensionDeduction).toBe(3_600_000);
    expect(breakdown.ptkp).toBe(54_000_000);
    expect(result.taxableIncome).toBe(56_400_000);
    expect(result.taxes.incomeTax).toBe(2_820_000);
    expect(result.taxes.bpjsHealth).toBe(1_200_000);
    expect(result.taxes.bpjsJht).toBe(2_400_000);
    expect(result.taxes.bpjsJp).toBe(1_200_000);
    expect(result.totalTax).toBe(7_620_000);
    expect(result.netSalary).toBe(112_380_000);
  });

  it("adds married, dependant, and combined-spouse-income PTKP allowances", () => {
    const result = IDCalculator.calculate(
      inputs(120_000_000, {
        taxReliefs: {
          maritalStatus: "married",
          numberOfDependents: 3,
          spouseIncomeCombined: true,
        },
      }),
    );
    const breakdown = result.breakdown as IDBreakdown;

    expect(breakdown.ptkp).toBe(126_000_000);
    expect(result.taxableIncome).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(4_800_000);
    expect(result.netSalary).toBe(115_200_000);
  });

  it("deducts modeled DPLK and approved zakat from taxable income and cash take-home", () => {
    const limits = IDCalculator.getContributionLimits(inputs(120_000_000));
    const result = IDCalculator.calculate(
      inputs(120_000_000, {
        contributions: {
          dplkContribution: 10_000_000,
          zakatContribution: 5_000_000,
        },
      }),
    );
    const breakdown = result.breakdown as IDBreakdown;

    expect(limits.dplkContribution?.limit).toBe(112_380_000);
    expect(breakdown.voluntaryDeductions.dplk).toBe(10_000_000);
    expect(breakdown.voluntaryDeductions.zakat).toBe(5_000_000);
    expect(result.taxableIncome).toBe(41_400_000);
    expect(result.taxes.incomeTax).toBe(2_070_000);
    expect(result.totalTax).toBe(6_870_000);
    expect(result.totalDeductions).toBe(21_870_000);
    expect(result.netSalary).toBe(98_130_000);
  });
});
