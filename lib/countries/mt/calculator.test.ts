import { describe, expect, it } from "vitest";
import { MTCalculator } from "./calculator";
import { MALTA_SOURCE_URLS } from "./constants/tax-brackets-2026";
import type { MTBreakdown, MTCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<MTCalculatorInputs> = {},
): MTCalculatorInputs {
  return {
    country: "MT",
    grossSalary,
    payFrequency: "annual",
    taxScenario: "ordinary_employment",
    residencyType: "resident",
    taxStatus: "single",
    sscBirthCohort: "born_1962_or_later",
    lowIncomeSscOption: "standard",
    contributions: {
      personalRetirementScheme: 0,
      voluntaryOccupationalPension: 0,
    },
    taxReliefs: {
      schoolLevel: "none",
      schoolFees: 0,
      childcareFees: 0,
      sportsFees: 0,
      culturalFees: 0,
    },
    ...overrides,
    contributions: {
      personalRetirementScheme: 0,
      voluntaryOccupationalPension: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      schoolLevel: "none",
      schoolFees: 0,
      childcareFees: 0,
      sportsFees: 0,
      culturalFees: 0,
      ...overrides.taxReliefs,
    },
  };
}

describe("Malta calculator", () => {
  it("calculates ordinary resident employment tax and Class 1 SSC for 2026", () => {
    const result = MTCalculator.calculate(inputs(30_000));
    const breakdown = result.breakdown as MTBreakdown;

    expect(result.taxableIncome).toBe(30_000);
    expect(result.taxes.incomeTax).toBe(4_100);
    expect(result.taxes.socialSecurity).toBe(2_908.36);
    expect(result.totalTax).toBe(7_008.36);
    expect(result.netSalary).toBe(22_991.64);
    expect(breakdown.taxScheduleName).toBe("Single rates");
    expect(breakdown.socialSecurity).toEqual(
      expect.objectContaining({
        category: "D",
        employeeWeekly: 55.93,
        employeeAnnual: 2_908.36,
      }),
    );
    expect(MALTA_SOURCE_URLS).toEqual(
      expect.arrayContaining([
        "https://mtca.gov.mt/docs/default-source/documents/2026-tax-rates.pdf?sfvrsn=37563fb2_4",
        "https://socialsecurity.gov.mt/en/information-and-applications-for-benefits-and-services/social-security-contributions/social-security-contributions-class-1-2026/",
      ]),
    );
  });

  it("caps resident pension credits and school, childcare, sports, and cultural deductions", () => {
    const result = MTCalculator.calculate(
      inputs(50_000, {
        taxStatus: "parent_two_or_more_children",
        contributions: {
          personalRetirementScheme: 999_999,
          voluntaryOccupationalPension: 999_999,
        },
        taxReliefs: {
          schoolLevel: "secondary",
          schoolFees: 999_999,
          childcareFees: 999_999,
          sportsFees: 999_999,
          culturalFees: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as MTBreakdown;
    const limits = MTCalculator.getContributionLimits(
      inputs(50_000, { taxReliefs: { schoolLevel: "secondary" } }),
    );

    expect(limits.personalRetirementScheme?.limit).toBe(3_000);
    expect(limits.voluntaryOccupationalPension?.limit).toBe(3_000);
    expect(limits.schoolFees?.limit).toBe(2_600);
    expect(limits.childcareFees?.limit).toBe(2_000);
    expect(breakdown.incomeDeductions).toEqual(
      expect.objectContaining({
        schoolFees: 2_600,
        childcareFees: 2_000,
        sportsFees: 300,
        culturalFees: 300,
        total: 5_200,
      }),
    );
    expect(breakdown.taxCredits).toEqual(
      expect.objectContaining({
        personalRetirementScheme: 750,
        voluntaryOccupationalPension: 750,
        total: 1_500,
        finalIncomeTax: 4_375,
      }),
    );
    expect(result.taxableIncome).toBe(44_800);
    expect(result.totalDeductions).toBe(13_283.36);
    expect(result.netSalary).toBe(36_716.64);
  });

  it("models nomad and highly skilled regimes without ordinary reliefs", () => {
    const nomad = MTCalculator.calculate(
      inputs(80_000, {
        taxScenario: "nomad_10_percent",
        contributions: {
          personalRetirementScheme: 999_999,
          voluntaryOccupationalPension: 999_999,
        },
      }),
    );
    const hsi = MTCalculator.calculate(
      inputs(100_000, {
        taxScenario: "highly_skilled_15_percent",
        contributions: {
          personalRetirementScheme: 999_999,
          voluntaryOccupationalPension: 999_999,
        },
      }),
    );
    const nomadBreakdown = nomad.breakdown as MTBreakdown;
    const hsiBreakdown = hsi.breakdown as MTBreakdown;

    expect(nomad.taxes.incomeTax).toBe(8_000);
    expect(nomad.taxes.socialSecurity).toBe(0);
    expect(nomad.netSalary).toBe(72_000);
    expect(nomadBreakdown.nomadResidencePermit).toEqual(
      expect.objectContaining({ applies: true, taxRate: 0.1 }),
    );
    expect(nomadBreakdown.voluntaryContributions.total).toBe(0);
    expect(hsi.taxes.incomeTax).toBe(15_000);
    expect(hsi.taxes.socialSecurity).toBe(2_908.36);
    expect(hsi.netSalary).toBe(82_091.64);
    expect(hsiBreakdown.highlySkilledIndividuals).toEqual(
      expect.objectContaining({
        applies: true,
        eligible: true,
        taxRate: 0.15,
        flatRateIncome: 100_000,
        noReliefsOrCredits: true,
      }),
    );
  });
});
