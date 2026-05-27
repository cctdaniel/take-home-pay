import { describe, expect, it } from "vitest";
import { CNCalculator } from "./calculator";
import type { CNBreakdown, CNCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<CNCalculatorInputs> = {},
): CNCalculatorInputs {
  return {
    country: "CN",
    grossSalary,
    payFrequency: "annual",
    socialInsuranceBase: 20_000,
    housingFundRate: 0.12,
    taxableInKindBenefits: 0,
    yearEndBonus: 0,
    yearEndBonusTaxTreatment: "separate",
    deductionMode: "specialAdditionalDeductions",
    specialDeductions: {
      numberOfChildren: 0,
      numberOfChildrenUnder3: 0,
      numberOfElderlyCare: 0,
      isOnlyChild: false,
      housingRentCity: "none",
      housingLoanInterest: false,
      continuingEducation: false,
      professionalQualificationEducation: false,
      majorIllnessMedicalExpenses: 0,
    },
    foreignAllowanceExemptions: {
      housingMealsLaundryRelocation: 0,
      businessTravelAllowance: 0,
      homeLeaveTravel: 0,
      languageTraining: 0,
      childrenEducation: 0,
    },
    contributions: {
      enterpriseAnnuityContribution: 0,
      individualPensionContribution: 0,
      taxPreferredHealthInsurance: 0,
      charitableDonations: 0,
    },
    ...overrides,
    specialDeductions: {
      numberOfChildren: 0,
      numberOfChildrenUnder3: 0,
      numberOfElderlyCare: 0,
      isOnlyChild: false,
      housingRentCity: "none",
      housingLoanInterest: false,
      continuingEducation: false,
      professionalQualificationEducation: false,
      majorIllnessMedicalExpenses: 0,
      ...overrides.specialDeductions,
    },
    foreignAllowanceExemptions: {
      housingMealsLaundryRelocation: 0,
      businessTravelAllowance: 0,
      homeLeaveTravel: 0,
      languageTraining: 0,
      childrenEducation: 0,
      ...overrides.foreignAllowanceExemptions,
    },
    contributions: {
      enterpriseAnnuityContribution: 0,
      individualPensionContribution: 0,
      taxPreferredHealthInsurance: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("China calculator", () => {
  it("calculates standard deduction, employee social insurance, housing fund, and resident IIT brackets", () => {
    const result = CNCalculator.calculate(inputs(240_000));
    const breakdown = result.breakdown as CNBreakdown;

    expect(breakdown.standardDeduction).toBe(60_000);
    expect(breakdown.socialInsurance.total).toBe(25_200);
    expect(breakdown.housingFund.employee).toBe(28_800);
    expect(result.taxableIncome).toBe(126_000);
    expect(result.taxes.incomeTax).toBe(10_080);
    expect(result.taxes.pensionInsurance).toBe(19_200);
    expect(result.taxes.medicalInsurance).toBe(4_800);
    expect(result.taxes.unemploymentInsurance).toBe(1_200);
    expect(result.taxes.housingFund).toBe(28_800);
    expect(result.totalTax).toBe(64_080);
    expect(result.netSalary).toBe(175_920);
  });

  it("caps special additional deductions, voluntary deductions, and separate annual bonus tax", () => {
    const result = CNCalculator.calculate(
      inputs(500_000, {
        socialInsuranceBase: 50_000,
        housingFundRate: 0.5,
        taxableInKindBenefits: 50_000,
        yearEndBonus: 120_000,
        yearEndBonusTaxTreatment: "separate",
        specialDeductions: {
          numberOfChildren: 2,
          numberOfChildrenUnder3: 1,
          numberOfElderlyCare: 1,
          isOnlyChild: false,
          housingRentCity: "tier1",
          housingLoanInterest: true,
          continuingEducation: true,
          professionalQualificationEducation: true,
          majorIllnessMedicalExpenses: 200_000,
        },
        contributions: {
          enterpriseAnnuityContribution: 999_999,
          individualPensionContribution: 999_999,
          taxPreferredHealthInsurance: 999_999,
          charitableDonations: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as CNBreakdown;

    expect(breakdown.grossIncome).toBe(620_000);
    expect(breakdown.taxableGrossIncome).toBe(670_000);
    expect(breakdown.specialDeductions).toMatchObject({
      children: 72_000,
      childrenUnder3: 24_000,
      elderlyCare: 18_000,
      housingRent: 0,
      housingLoanInterest: 12_000,
      continuingEducation: 4_800,
      professionalQualificationEducation: 3_600,
      majorIllnessMedical: 80_000,
      total: 190_400,
    });
    expect(breakdown.voluntaryDeductions).toMatchObject({
      enterpriseAnnuityContribution: 17_280,
      individualPensionContribution: 12_000,
      taxPreferredHealthInsurance: 2_400,
      charitableDonations: 51_216,
      total: 82_896,
    });
    expect(breakdown.socialInsurance.total).toBe(45_360);
    expect(breakdown.housingFund.rate).toBe(0.12);
    expect(breakdown.housingFund.employee).toBe(51_840);
    expect(breakdown.yearEndBonusTaxableIncome).toBe(120_000);
    expect(breakdown.yearEndBonusRate).toBe(0.1);
    expect(breakdown.yearEndBonusQuickDeduction).toBe(210);
    expect(result.taxableIncome).toBe(239_504);
    expect(result.taxes.yearEndBonusTax).toBe(11_790);
    expect(result.totalTax).toBeCloseTo(118_420.4, 5);
    expect(result.totalDeductions).toBeCloseTo(201_316.4, 5);
    expect(result.netSalary).toBeCloseTo(418_683.6, 5);
  });

  it("uses foreign allowance exemption mode instead of special additional deductions", () => {
    const result = CNCalculator.calculate(
      inputs(500_000, {
        taxableInKindBenefits: 50_000,
        deductionMode: "foreignAllowanceExemption",
        foreignAllowanceExemptions: {
          housingMealsLaundryRelocation: 100_000,
          businessTravelAllowance: 20_000,
          homeLeaveTravel: 10_000,
          languageTraining: 30_000,
          childrenEducation: 50_000,
        },
      }),
    );
    const breakdown = result.breakdown as CNBreakdown;

    expect(breakdown.specialDeductions.total).toBe(0);
    expect(breakdown.foreignAllowanceExemptions.total).toBe(210_000);
    expect(result.taxableIncome).toBe(226_000);
    expect(result.taxes.incomeTax).toBe(28_280);
    expect(result.netSalary).toBe(417_720);
  });

  it("exposes modeled contribution limits for enterprise annuity, individual pension, health insurance, and charity", () => {
    const limits = CNCalculator.getContributionLimits(inputs(240_000));

    expect(limits.enterpriseAnnuityContribution?.limit).toBe(9_600);
    expect(limits.individualPensionContribution?.limit).toBe(12_000);
    expect(limits.taxPreferredHealthInsurance?.limit).toBe(2_400);
    expect(limits.charitableDonations?.limit).toBe(37_800);
  });
});
