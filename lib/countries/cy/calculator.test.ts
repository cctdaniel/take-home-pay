import { describe, expect, it } from "vitest";
import { CYCalculator } from "./calculator";
import { CY_SOURCE_URLS } from "./constants/tax-brackets-2026";
import type { CYBreakdown, CYCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CYCalculatorInputs> = {},
): CYCalculatorInputs {
  return {
    country: "CY",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    employmentExemption: "none",
    contributions: {
      approvedPensionProvidentFund: 0,
      medicalFundContribution: 0,
      homeInsurancePremium: 0,
      primaryResidenceDeduction: 0,
      greenTransitionExpense: 0,
    },
    taxReliefs: {
      familyStatus: "single",
      numberOfDependentChildren: 0,
      meetsFamilyIncomeCriteria: true,
    },
    ...overrides,
    contributions: {
      approvedPensionProvidentFund: 0,
      medicalFundContribution: 0,
      homeInsurancePremium: 0,
      primaryResidenceDeduction: 0,
      greenTransitionExpense: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      familyStatus: "single",
      numberOfDependentChildren: 0,
      meetsFamilyIncomeCriteria: true,
      ...overrides.taxReliefs,
    },
  };
}

describe("Cyprus calculator", () => {
  it("calculates 2026 resident PAYE with SI/GHS deductions and progressive bands", () => {
    const result = CYCalculator.calculate(inputs(36_000));
    const breakdown = result.breakdown as CYBreakdown;

    expect(CY_SOURCE_URLS).toEqual(
      expect.arrayContaining([
        "https://taxtools.mof.gov.cy/",
        "https://sisweb.mlsi.gov.cy/anotato2025/",
        "https://www.gesy.org.cy/sites/Sites?d=Desktop&locale=en_US&lookuphost=%2Fen-us%2F&lookuppage=hiofinancing",
      ]),
    );
    expect(result.taxableIncome).toBe(31_878);
    expect(result.taxes.incomeTax).toBeCloseTo(1_975.6, 5);
    expect(result.taxes.socialInsurance).toBe(3_168);
    expect(result.taxes.gesy).toBe(954);
    expect(result.totalTax).toBeCloseTo(6_097.6, 5);
    expect(result.netSalary).toBeCloseTo(29_902.4, 5);
    expect(breakdown.socialInsurance.annualCeiling).toBe(68_904);
    expect(breakdown.gesy.annualIncomeCeiling).toBe(180_000);
    expect(breakdown.deductions.contributionGroupDeduction).toBe(4_122);
  });

  it("caps TD59 resident deductions and Article 8 50% first-employment exemption", () => {
    const result = CYCalculator.calculate(
      inputs(90_000, {
        employmentExemption: "article_8_23a_50",
        taxReliefs: {
          familyStatus: "single_parent",
          numberOfDependentChildren: 3,
          meetsFamilyIncomeCriteria: true,
        },
        contributions: {
          approvedPensionProvidentFund: 999_999,
          medicalFundContribution: 999_999,
          homeInsurancePremium: 999_999,
          primaryResidenceDeduction: 999_999,
          greenTransitionExpense: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as CYBreakdown;
    const limits = CYCalculator.getContributionLimits(
      inputs(90_000, {
        taxReliefs: {
          familyStatus: "single_parent",
          numberOfDependentChildren: 3,
          meetsFamilyIncomeCriteria: true,
        },
      }),
    );

    expect(limits.approvedPensionProvidentFund?.limit).toBe(9_000);
    expect(limits.medicalFundContribution?.limit).toBe(1_800);
    expect(limits.homeInsurancePremium?.limit).toBe(500);
    expect(limits.primaryResidenceDeduction?.limit).toBe(2_000);
    expect(limits.greenTransitionExpense?.limit).toBe(1_000);
    expect(breakdown.firstEmploymentExemption).toEqual(
      expect.objectContaining({
        selected: "article_8_23a_50",
        exemptIncome: 45_000,
        threshold: 55_000,
        thresholdMet: true,
      }),
    );
    expect(breakdown.deductions).toEqual(
      expect.objectContaining({
        homeInsurance: 500,
        contributionGroupCap: 8_900,
        mandatoryContributionDeduction: 8_448.55,
        approvedPensionProvidentFundDeduction: 451.4500000000007,
        childDeduction: 7_500,
        primaryResidence: 2_000,
        greenTransition: 1_000,
        totalTaxDeductions: 64_900,
      }),
    );
    expect(result.taxableIncome).toBe(25_100);
    expect(result.taxes.incomeTax).toBe(620);
    expect(result.totalDeductions).toBe(19_868.55);
    expect(result.netSalary).toBe(70_131.45);
  });
});
