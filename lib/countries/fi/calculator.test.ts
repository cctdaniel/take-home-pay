import { describe, expect, it } from "vitest";
import { FICalculator } from "./calculator";
import type { FIBreakdown, FICalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<FICalculatorInputs> = {},
): FICalculatorInputs {
  return {
    country: "FI",
    grossSalary,
    payFrequency: "annual",
    taxRegime: "ordinary",
    age: 30,
    taxableFringeBenefits: 0,
    contributions: {
      commutingExpenses: 0,
      unemploymentFundFees: 0,
      otherIncomeProductionExpenses: 0,
      householdWorkExpenses: 0,
      voluntaryPensionInsurance: 0,
    },
    ...overrides,
    contributions: {
      commutingExpenses: 0,
      unemploymentFundFees: 0,
      otherIncomeProductionExpenses: 0,
      householdWorkExpenses: 0,
      voluntaryPensionInsurance: 0,
      ...overrides.contributions,
    },
  };
}

describe("Finland calculator", () => {
  it("calculates ordinary 2026 resident wage tax with Vero employee social contribution rates", () => {
    const result = FICalculator.calculate(inputs(60_000));
    const breakdown = result.breakdown as FIBreakdown;

    expect(result.taxableIncome).toBe(55_885);
    expect(result.taxes.incomeTax).toBe(13_143.81);
    expect(result.taxes.employeeSocialContribution).toBe(6_102);
    expect(result.totalTax).toBe(19_245.81);
    expect(result.netSalary).toBe(40_754.19);
    expect(breakdown.employeeSocialContribution).toEqual(
      expect.objectContaining({
        pensionContribution: 4_380,
        pensionRate: 0.073,
        unemploymentContribution: 534,
        unemploymentRate: 0.0089,
        healthCareContribution: 660,
        healthCareRate: 0.011,
        dailyAllowanceContribution: 528,
        dailyAllowanceRate: 0.0088,
      }),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/tax_card/tax-rate-and-income-ceiling/tax-bases/",
        "https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/being-an-employer/social-insurance-contributions/",
      ]),
    );
  });

  it("caps ordinary commuting, household-work, and voluntary pension inputs while taxing fringe benefits", () => {
    const result = FICalculator.calculate(
      inputs(90_000, {
        age: 55,
        taxableFringeBenefits: 10_000,
        contributions: {
          commutingExpenses: 999_999,
          unemploymentFundFees: 600,
          otherIncomeProductionExpenses: 2_000,
          householdWorkExpenses: 999_999,
          voluntaryPensionInsurance: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as FIBreakdown;
    const limits = FICalculator.getContributionLimits();

    expect(limits.commutingExpenses?.limit).toBe(7_900);
    expect(limits.householdWorkExpenses?.limit).toBe(5_000);
    expect(limits.voluntaryPensionInsurance?.limit).toBe(5_000);
    expect(breakdown.taxableEmploymentIncome).toBe(100_000);
    expect(breakdown.voluntaryDeductions).toEqual(
      expect.objectContaining({
        commutingExpenses: 7_900,
        commutingDeduction: 7_000,
        unemploymentFundFees: 600,
        otherIncomeProductionExpenses: 2_000,
        otherIncomeProductionDeduction: 2_000,
        householdWorkExpenses: 5_000,
        householdExpenseCredit: 1_600,
        voluntaryPensionInsurance: 5_000,
        voluntaryPensionCredit: 1_500,
      }),
    );
    expect(result.taxableIncome).toBe(86_285);
    expect(result.totalTax).toBe(32_841.97);
    expect(result.totalDeductions).toBe(37_841.97);
    expect(result.netSalary).toBe(52_158.03);
  });

  it("models the 2026 foreign key employee tax at source without health-care or daily-allowance withholding", () => {
    const result = FICalculator.calculate(
      inputs(90_000, {
        taxRegime: "keyEmployee",
        age: 55,
        taxableFringeBenefits: 10_000,
        contributions: {
          commutingExpenses: 999_999,
          unemploymentFundFees: 600,
          otherIncomeProductionExpenses: 2_000,
          householdWorkExpenses: 999_999,
          voluntaryPensionInsurance: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as FIBreakdown;

    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(25_000);
    expect(result.taxes.employeeSocialContribution).toBe(8_190);
    expect(result.totalDeductions).toBe(33_190);
    expect(result.netSalary).toBe(56_810);
    expect(breakdown.employeeSocialContribution).toEqual(
      expect.objectContaining({
        pensionContribution: 7_300,
        unemploymentContribution: 890,
        healthCareContribution: 0,
        healthCareRate: 0,
        dailyAllowanceContribution: 0,
        dailyAllowanceRate: 0,
      }),
    );
    expect(breakdown.specialRegime).toEqual(
      expect.objectContaining({
        name: "Foreign key employee tax at source",
        rate: 0.25,
        incomeTax: 25_000,
      }),
    );
    expect(breakdown.voluntaryDeductions).toEqual(
      expect.objectContaining({
        commutingDeduction: 0,
        unemploymentFundFees: 0,
        otherIncomeProductionDeduction: 0,
        householdExpenseCredit: 0,
        voluntaryPensionInsurance: 0,
      }),
    );
    expect(breakdown.sourceUrls).toContain(
      "https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/arriving_in_finland/work_in_finland/specific-instructions-for-different-occupations/key_employees_from_other_countrie/",
    );
  });
});
