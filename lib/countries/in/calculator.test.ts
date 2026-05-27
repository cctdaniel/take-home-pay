import { describe, expect, it } from "vitest";
import { INCalculator } from "./calculator";
import type { INBreakdown, INCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<INCalculatorInputs> = {},
): INCalculatorInputs {
  return {
    country: "IN",
    grossSalary,
    payFrequency: "annual",
    regime: "new",
    isEpfApplicable: true,
    professionalTaxPaid: 0,
    hasSeniorCitizenSelfOrFamilyFor80D: false,
    hasSeniorCitizenParentsFor80D: false,
    hra: {
      annualHraReceived: 0,
      annualRentPaid: 0,
      annualBasicSalaryForHra: 0,
      isMetroCity: false,
    },
    contributions: {
      section80CInvestments: 0,
      npsEmployeeContribution: 0,
      section80DHealthInsuranceSelfFamily: 0,
      section80DHealthInsuranceParents: 0,
    },
    ...overrides,
    hra: {
      annualHraReceived: 0,
      annualRentPaid: 0,
      annualBasicSalaryForHra: 0,
      isMetroCity: false,
      ...overrides.hra,
    },
    contributions: {
      section80CInvestments: 0,
      npsEmployeeContribution: 0,
      section80DHealthInsuranceSelfFamily: 0,
      section80DHealthInsuranceParents: 0,
      ...overrides.contributions,
    },
  };
}

describe("India calculator", () => {
  it("calculates the AY 2026-27 new-regime salary tax, cess, and capped EPF", () => {
    const result = INCalculator.calculate(inputs(1_500_000));
    const breakdown = result.breakdown as INBreakdown;

    expect(result.taxableIncome).toBe(1_425_000);
    expect(breakdown.standardDeduction).toBe(75_000);
    expect(breakdown.epf.employee).toBe(21_600);
    expect(breakdown.grossTax).toBe(93_750);
    expect(result.taxes.incomeTax).toBe(93_750);
    expect(result.taxes.cess).toBe(3_750);
    expect(result.totalTax).toBe(119_100);
    expect(result.netSalary).toBe(1_380_900);
  });

  it("applies old-regime HRA and clamps tax-saving cash inputs before net-pay subtraction", () => {
    const result = INCalculator.calculate(
      inputs(2_000_000, {
        regime: "old",
        professionalTaxPaid: 9_999,
        hasSeniorCitizenSelfOrFamilyFor80D: true,
        hasSeniorCitizenParentsFor80D: true,
        hra: {
          annualHraReceived: 600_000,
          annualRentPaid: 720_000,
          annualBasicSalaryForHra: 1_000_000,
          isMetroCity: true,
        },
        contributions: {
          section80CInvestments: 999_999,
          npsEmployeeContribution: 999_999,
          section80DHealthInsuranceSelfFamily: 999_999,
          section80DHealthInsuranceParents: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as INBreakdown;

    expect(breakdown.hraExemption).toBe(500_000);
    expect(breakdown.professionalTaxPaid).toBe(2_500);
    expect(breakdown.section80CDeduction).toBe(150_000);
    expect(breakdown.nps80CCD1BDeduction).toBe(50_000);
    expect(breakdown.section80DDeduction).toMatchObject({
      selfFamily: 50_000,
      parents: 50_000,
      total: 100_000,
    });
    expect(breakdown.voluntaryContributions).toMatchObject({
      section80CInvestments: 150_000,
      npsEmployeeContribution: 50_000,
      section80DHealthInsuranceSelfFamily: 50_000,
      section80DHealthInsuranceParents: 50_000,
    });
    expect(result.taxableIncome).toBe(1_147_500);
    expect(result.totalTax).toBe(187_120);
    expect(result.totalDeductions).toBe(487_120);
    expect(result.netSalary).toBe(1_512_880);
  });

  it("exposes official modeled caps for India slider controls", () => {
    const limits = INCalculator.getContributionLimits(
      inputs(2_000_000, {
        hasSeniorCitizenSelfOrFamilyFor80D: true,
        hasSeniorCitizenParentsFor80D: true,
      }),
    );

    expect(limits.section80CInvestments?.limit).toBe(150_000);
    expect(limits.npsEmployeeContribution?.limit).toBe(50_000);
    expect(limits.section80DHealthInsuranceSelfFamily?.limit).toBe(50_000);
    expect(limits.section80DHealthInsuranceParents?.limit).toBe(50_000);
    expect(limits.professionalTaxPaid?.limit).toBe(2_500);
  });
});
