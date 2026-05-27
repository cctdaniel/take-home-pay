import { describe, expect, it } from "vitest";
import { HKCalculator } from "./calculator";
import type { HKBreakdown, HKCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<HKCalculatorInputs> = {},
): HKCalculatorInputs {
  return {
    country: "HK",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    contributions: {
      taxDeductibleVoluntaryContributions: 0,
    },
    taxReliefs: {
      hasMarriedAllowance: false,
      hasSingleParentAllowance: false,
      numberOfChildren: 0,
      numberOfNewbornChildren: 0,
      numberOfDependentParents: 0,
      numberOfDependentParentsLivingWith: 0,
      numberOfDependentParentsAged55To59: 0,
      numberOfDependentParentsAged55To59LivingWith: 0,
      numberOfDependentSiblings: 0,
      hasDisabilityAllowance: false,
      numberOfDisabledDependents: 0,
      vhisInsuredPersons: 0,
      vhisPremiums: 0,
      selfEducationExpenses: 0,
      hasHomeLoanInterestAdditionalCeiling: false,
      homeLoanInterest: 0,
      hasDomesticRentAdditionalCeiling: false,
      domesticRent: 0,
      housingBenefitType: "none",
      housingRentPaid: 0,
      customHousingRentalValue: 0,
      charitableDonations: 0,
      elderlyResidentialCareExpenses: 0,
      assistedReproductiveServicesExpenses: 0,
    },
    ...overrides,
    contributions: {
      taxDeductibleVoluntaryContributions: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      hasMarriedAllowance: false,
      hasSingleParentAllowance: false,
      numberOfChildren: 0,
      numberOfNewbornChildren: 0,
      numberOfDependentParents: 0,
      numberOfDependentParentsLivingWith: 0,
      numberOfDependentParentsAged55To59: 0,
      numberOfDependentParentsAged55To59LivingWith: 0,
      numberOfDependentSiblings: 0,
      hasDisabilityAllowance: false,
      numberOfDisabledDependents: 0,
      vhisInsuredPersons: 0,
      vhisPremiums: 0,
      selfEducationExpenses: 0,
      hasHomeLoanInterestAdditionalCeiling: false,
      homeLoanInterest: 0,
      hasDomesticRentAdditionalCeiling: false,
      domesticRent: 0,
      housingBenefitType: "none",
      housingRentPaid: 0,
      customHousingRentalValue: 0,
      charitableDonations: 0,
      elderlyResidentialCareExpenses: 0,
      assistedReproductiveServicesExpenses: 0,
      ...overrides.taxReliefs,
    },
  };
}

describe("Hong Kong calculator", () => {
  it("calculates mandatory MPF, resident basic allowance, lower-of-progressive-or-standard tax, and one-off reduction", () => {
    const result = HKCalculator.calculate(inputs(420_000));
    const breakdown = result.breakdown as HKBreakdown;

    expect(breakdown.mpf.employeeContribution).toBe(18_000);
    expect(breakdown.netIncome).toBe(402_000);
    expect(breakdown.allowances.totalAllowances).toBe(132_000);
    expect(result.taxableIncome).toBe(270_000);
    expect(breakdown.taxComparison.progressiveTax).toBe(27_900);
    expect(breakdown.taxComparison.standardTax).toBe(60_300);
    expect(result.taxes.incomeTax).toBe(24_900);
    expect(result.totalTax).toBe(42_900);
    expect(result.netSalary).toBe(377_100);
  });

  it("caps MPF TVC and QDAP deductions at the combined annual maximum", () => {
    const limits = HKCalculator.getContributionLimits(inputs(420_000));
    const result = HKCalculator.calculate(
      inputs(420_000, {
        contributions: {
          taxDeductibleVoluntaryContributions: 80_000,
        },
      }),
    );
    const breakdown = result.breakdown as HKBreakdown;

    expect(limits.taxDeductibleVoluntaryContributions?.limit).toBe(60_000);
    expect(breakdown.deductions.voluntaryMpfAnnuity).toBe(60_000);
    expect(result.taxableIncome).toBe(210_000);
    expect(result.taxes.incomeTax).toBe(14_700);
    expect(result.totalDeductions).toBe(92_700);
    expect(result.netSalary).toBe(327_300);
  });

  it("removes resident allowances for non-resident salary calculations", () => {
    const result = HKCalculator.calculate(
      inputs(420_000, { residencyType: "non_resident" }),
    );
    const breakdown = result.breakdown as HKBreakdown;

    expect(breakdown.allowances.totalAllowances).toBe(0);
    expect(result.taxableIncome).toBe(402_000);
    expect(result.taxes.incomeTax).toBe(47_340);
    expect(result.totalTax).toBe(65_340);
    expect(result.netSalary).toBe(354_660);
  });

  it("caps resident deductions and dependent allowances before comparing tax methods", () => {
    const result = HKCalculator.calculate(
      inputs(1_200_000, {
        taxReliefs: {
          hasMarriedAllowance: true,
          numberOfChildren: 2,
          numberOfNewbornChildren: 1,
          numberOfDependentParents: 2,
          numberOfDependentParentsLivingWith: 1,
          numberOfDependentParentsAged55To59: 1,
          numberOfDependentParentsAged55To59LivingWith: 1,
          numberOfDependentSiblings: 1,
          hasDisabilityAllowance: true,
          numberOfDisabledDependents: 1,
          vhisInsuredPersons: 2,
          vhisPremiums: 20_000,
          selfEducationExpenses: 120_000,
          hasHomeLoanInterestAdditionalCeiling: true,
          homeLoanInterest: 130_000,
          hasDomesticRentAdditionalCeiling: true,
          domesticRent: 130_000,
          housingBenefitType: "residential",
          charitableDonations: 500_000,
          elderlyResidentialCareExpenses: 150_000,
          assistedReproductiveServicesExpenses: 200_000,
        },
      }),
    );
    const breakdown = result.breakdown as HKBreakdown;

    expect(breakdown.housingRentalValue).toBe(120_000);
    expect(breakdown.deductions.vhisPremiums).toBe(16_000);
    expect(breakdown.deductions.selfEducation).toBe(100_000);
    expect(breakdown.deductions.homeLoanInterest).toBe(120_000);
    expect(breakdown.deductions.domesticRent).toBe(120_000);
    expect(breakdown.deductions.charitableDonations).toBeCloseTo(261_100, 5);
    expect(breakdown.allowances.totalAllowances).toBe(1_041_500);
    expect(result.taxableIncome).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(18_000);
    expect(result.netSalary).toBe(1_182_000);
  });
});
