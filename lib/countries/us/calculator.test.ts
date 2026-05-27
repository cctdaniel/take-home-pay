import { describe, expect, it } from "vitest";
import { USCalculator } from "./calculator";
import type { USBreakdown, USCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<USCalculatorInputs> = {},
): USCalculatorInputs {
  return {
    country: "US",
    grossSalary,
    state: "CA",
    filingStatus: "single",
    numberOfQualifyingChildren: 0,
    numberOfOtherDependents: 0,
    payFrequency: "annual",
    contributions: {
      traditional401k: 0,
      rothIRA: 0,
      hsa: 0,
      healthFsa: 0,
      dependentCareFsa: 0,
      hsaCoverageType: "self",
    },
    ...overrides,
    contributions: {
      traditional401k: 0,
      rothIRA: 0,
      hsa: 0,
      healthFsa: 0,
      dependentCareFsa: 0,
      hsaCoverageType: "self",
      ...overrides.contributions,
    },
  };
}

describe("United States calculator", () => {
  it("calculates 2026 federal, California, FICA, and SDI deductions", () => {
    const result = USCalculator.calculate(inputs(100_000));
    const breakdown = result.breakdown as USBreakdown;

    expect(result.taxableIncome).toBe(83_900);
    expect(result.taxes.federalIncomeTaxBeforeCredits).toBe(13_170);
    expect(result.taxes.federalIncomeTax).toBe(13_170);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(5_216.075, 5);
    expect(result.taxes.socialSecurity).toBe(6_200);
    expect(result.taxes.medicare).toBe(1_450);
    expect(result.taxes.stateDisabilityInsurance).toBe(1_200);
    expect(result.totalTax).toBeCloseTo(27_236.075, 5);
    expect(result.netSalary).toBeCloseTo(72_763.925, 5);
    expect(breakdown.payrollTaxableWages.socialSecurity).toBe(100_000);
  });

  it("caps contribution inputs inside calculator logic", () => {
    const limits = USCalculator.getContributionLimits(
      inputs(100_000, {
        filingStatus: "single",
        contributions: { hsaCoverageType: "self" },
      }),
    );
    const result = USCalculator.calculate(
      inputs(100_000, {
        contributions: {
          traditional401k: 999_999,
          rothIRA: 999_999,
          hsa: 999_999,
          healthFsa: 999_999,
          dependentCareFsa: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as USBreakdown;

    expect(limits.traditional401k?.limit).toBe(24_500);
    expect(limits.rothIRA?.limit).toBe(7_500);
    expect(limits.hsa?.limit).toBe(4_400);
    expect(limits.healthFsa?.limit).toBe(3_400);
    expect(limits.dependentCareFsa?.limit).toBe(7_500);
    expect(breakdown.contributions).toMatchObject({
      traditional401k: 24_500,
      rothIRA: 7_500,
      hsa: 4_400,
      healthFsa: 3_400,
      dependentCareFsa: 7_500,
      total: 47_300,
    });
    expect(result.taxableIncome).toBe(44_100);
    expect(breakdown.taxableIncomeForState).toBe(60_200);
    expect(breakdown.payrollTaxableWages.socialSecurity).toBe(84_700);
    expect(result.netSalary).toBeCloseTo(38_168.3, 5);
  });

  it("applies dependent credits, OASDI wage base, and additional Medicare for MFJ", () => {
    const result = USCalculator.calculate(
      inputs(260_000, {
        filingStatus: "married_jointly",
        numberOfQualifyingChildren: 2,
        numberOfOtherDependents: 1,
        contributions: { hsaCoverageType: "family" },
      }),
    );
    const breakdown = result.breakdown as USBreakdown;

    expect(result.taxableIncome).toBe(227_800);
    expect(result.taxes.federalIncomeTaxBeforeCredits).toBe(39_868);
    expect(result.taxes.federalTaxCredits).toBe(4_900);
    expect(result.taxes.federalIncomeTax).toBe(34_968);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(16_012.15, 5);
    expect(result.taxes.socialSecurity).toBe(11_439);
    expect(result.taxes.additionalMedicare).toBe(90);
    expect(breakdown.payrollTaxableWages.socialSecurity).toBe(184_500);
    expect(breakdown.taxCredits.childTaxCredit).toBe(4_400);
    expect(breakdown.taxCredits.otherDependentCredit).toBe(500);
    expect(result.netSalary).toBeCloseTo(190_600.85, 5);
  });
});
