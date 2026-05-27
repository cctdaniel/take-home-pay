import { describe, expect, it } from "vitest";
import { JPCalculator } from "./calculator";
import type { JPBreakdown, JPCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<JPCalculatorInputs> = {},
): JPCalculatorInputs {
  return {
    country: "JP",
    grossSalary,
    payFrequency: "annual",
    spouseDeductionType: "none",
    numberOfOrdinaryDependents: 0,
    numberOfSpecifiedDependents: 0,
    numberOfElderlyDependents: 0,
    numberOfCohabitingElderlyParents: 0,
    hasIncomeAdjustmentDeduction: false,
    idecoCategory: "employee_no_corporate_pension",
    donationType: "none",
    contributions: {
      idecoContribution: 0,
      lifeInsurancePremiums: 0,
      careMedicalInsurancePremiums: 0,
      privatePensionInsurancePremiums: 0,
      earthquakeInsurancePremiums: 0,
      medicalExpenses: 0,
      medicalExpenseReimbursements: 0,
      qualifiedDonations: 0,
    },
    ...overrides,
    contributions: {
      idecoContribution: 0,
      lifeInsurancePremiums: 0,
      careMedicalInsurancePremiums: 0,
      privatePensionInsurancePremiums: 0,
      earthquakeInsurancePremiums: 0,
      medicalExpenses: 0,
      medicalExpenseReimbursements: 0,
      qualifiedDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("Japan calculator", () => {
  it("calculates employment-income deduction, social insurance, national tax, reconstruction surtax, and resident tax", () => {
    const result = JPCalculator.calculate(inputs(6_000_000));
    const breakdown = result.breakdown as JPBreakdown;

    expect(breakdown.employmentIncomeDeduction).toBe(1_640_000);
    expect(breakdown.employmentIncome).toBe(4_360_000);
    expect(breakdown.basicDeduction).toBe(680_000);
    expect(breakdown.socialInsuranceDeduction).toBe(885_000);
    expect(result.taxableIncome).toBe(2_795_000);
    expect(result.taxes.incomeTax).toBe(182_000);
    expect(result.taxes.reconstructionSurtax).toBe(3_822);
    expect(result.taxes.residentTax).toBe(309_500);
    expect(result.taxes.pensionInsurance).toBe(549_000);
    expect(result.taxes.healthInsurance).toBe(300_000);
    expect(result.taxes.employmentInsurance).toBe(36_000);
    expect(result.totalTax).toBe(1_380_322);
    expect(result.netSalary).toBe(4_619_678);
  });

  it("caps iDeCo, insurance, earthquake, medical, and furusato deductions inside calculator logic", () => {
    const result = JPCalculator.calculate(
      inputs(9_000_000, {
        spouseDeductionType: "ordinary",
        numberOfOrdinaryDependents: 1,
        numberOfSpecifiedDependents: 1,
        hasIncomeAdjustmentDeduction: true,
        idecoCategory: "employee_with_corporate_pension",
        donationType: "furusato",
        contributions: {
          idecoContribution: 999_999,
          lifeInsurancePremiums: 999_999,
          careMedicalInsurancePremiums: 999_999,
          privatePensionInsurancePremiums: 999_999,
          earthquakeInsurancePremiums: 999_999,
          medicalExpenses: 500_000,
          medicalExpenseReimbursements: 100_000,
          qualifiedDonations: 9_999_999,
        },
      }),
    );
    const breakdown = result.breakdown as JPBreakdown;

    expect(breakdown.incomeAdjustmentDeduction).toBe(50_000);
    expect(breakdown.spouseDeduction).toBe(380_000);
    expect(breakdown.dependentDeduction).toBe(1_010_000);
    expect(breakdown.idecoDeduction).toBe(240_000);
    expect(breakdown.lifeInsurancePremiumDeduction).toBe(120_000);
    expect(breakdown.residentTaxLifeInsurancePremiumDeduction).toBe(70_000);
    expect(breakdown.earthquakeInsuranceDeduction).toBe(50_000);
    expect(breakdown.medicalExpenseNetAmount).toBe(400_000);
    expect(breakdown.medicalExpenseDeduction).toBe(300_000);
    expect(breakdown.qualifiedDonationAmount).toBe(2_800_000);
    expect(breakdown.qualifiedDonationDeduction).toBe(2_798_000);
    expect(breakdown.furusatoResidentBasicCredit).toBe(279_800);
    expect(breakdown.furusatoResidentSpecialCredit).toBe(72_140);
    expect(result.taxableIncome).toBe(304_000);
    expect(result.totalDeductions).toBe(4_286_979);
    expect(result.netSalary).toBe(4_713_021);
  });

  it("exposes modeled contribution limits for the shared slider controls", () => {
    const noCorporatePensionLimits = JPCalculator.getContributionLimits(
      inputs(6_000_000),
    );
    const corporatePensionLimits = JPCalculator.getContributionLimits(
      inputs(6_000_000, {
        idecoCategory: "employee_with_corporate_pension",
        donationType: "specified",
      }),
    );

    expect(noCorporatePensionLimits.idecoContribution?.limit).toBe(276_000);
    expect(corporatePensionLimits.idecoContribution?.limit).toBe(240_000);
    expect(corporatePensionLimits.lifeInsurancePremiums?.limit).toBe(80_000);
    expect(corporatePensionLimits.careMedicalInsurancePremiums?.limit).toBe(80_000);
    expect(corporatePensionLimits.privatePensionInsurancePremiums?.limit).toBe(80_000);
    expect(corporatePensionLimits.earthquakeInsurancePremiums?.limit).toBe(50_000);
    expect(corporatePensionLimits.qualifiedDonations?.limit).toBe(1_744_000);
  });
});
