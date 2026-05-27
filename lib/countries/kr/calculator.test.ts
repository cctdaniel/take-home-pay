import { describe, expect, it } from "vitest";
import { KRCalculator } from "./calculator";
import type { KRBreakdown, KRCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<KRCalculatorInputs> = {},
): KRCalculatorInputs {
  return {
    country: "KR",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    contributions: {},
    taxReliefs: {
      foreignWorkerFlatTax: false,
      numberOfDependents: 0,
      numberOfChildrenUnder20: 0,
      numberOfChildrenUnder7: 0,
      personalPensionContribution: 0,
      insurancePremiums: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      donations: 0,
      monthlyRent: 0,
      annualRentPaid: 0,
      isHomeowner: false,
      hasMealAllowance: false,
      hasChildcareAllowance: false,
    },
    ...overrides,
    contributions: {},
    taxReliefs: {
      foreignWorkerFlatTax: false,
      numberOfDependents: 0,
      numberOfChildrenUnder20: 0,
      numberOfChildrenUnder7: 0,
      personalPensionContribution: 0,
      insurancePremiums: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      donations: 0,
      monthlyRent: 0,
      annualRentPaid: 0,
      isHomeowner: false,
      hasMealAllowance: false,
      hasChildcareAllowance: false,
      ...overrides.taxReliefs,
    },
  };
}

describe("South Korea calculator", () => {
  it("calculates employment income deduction, social insurance, tax credits, and local income tax", () => {
    const result = KRCalculator.calculate(inputs(50_000_000));
    const breakdown = result.breakdown as KRBreakdown;

    expect(breakdown.socialInsurance.nationalPension).toBe(2_375_004);
    expect(breakdown.socialInsurance.healthInsurance).toBe(1_797_504);
    expect(breakdown.socialInsurance.longTermCare).toBe(236_196);
    expect(breakdown.socialInsurance.employmentInsurance).toBe(450_000);
    expect(breakdown.incomeDeductions.employmentIncomeDeduction).toBe(12_250_000);
    expect(result.taxableIncome).toBe(31_391_296);
    expect(breakdown.taxDetails.grossIncomeTax).toBe(3_448_694);
    expect(breakdown.taxCredits.wageEarnerCredit).toBe(740_000);
    expect(result.taxes.incomeTax).toBe(2_578_694);
    expect(result.taxes.localIncomeTax).toBe(257_869);
    expect(result.totalTax).toBe(7_695_267);
    expect(result.netSalary).toBe(42_304_733);
  });

  it("models non-taxable allowances and resident year-end credits including pension, rent, medical, education, donation, and child credits", () => {
    const result = KRCalculator.calculate(
      inputs(80_000_000, {
        taxReliefs: {
          hasMealAllowance: true,
          hasChildcareAllowance: true,
          numberOfDependents: 2,
          numberOfChildrenUnder20: 2,
          numberOfChildrenUnder7: 1,
          personalPensionContribution: 10_000_000,
          insurancePremiums: 2_000_000,
          medicalExpenses: 5_000_000,
          educationExpenses: 4_000_000,
          donations: 12_000_000,
          annualRentPaid: 12_000_000,
          isHomeowner: false,
        },
      }),
    );
    const breakdown = result.breakdown as KRBreakdown;

    expect(breakdown.nonTaxableIncome.total).toBe(3_600_000);
    expect(result.taxableIncome).toBe(46_725_192);
    expect(breakdown.taxCredits.pensionCredit).toBe(1_188_000);
    expect(breakdown.taxCredits.insuranceCredit).toBe(120_000);
    expect(breakdown.taxCredits.medicalCredit).toBe(390_000);
    expect(breakdown.taxCredits.educationCredit).toBe(600_000);
    expect(breakdown.taxCredits.donationCredit).toBe(2_100_000);
    expect(breakdown.taxCredits.rentCredit).toBe(1_500_000);
    expect(breakdown.voluntaryContributions.personalPensionContribution).toBe(9_000_000);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(7_604_808);
    expect(result.totalDeductions).toBe(16_604_808);
    expect(result.netSalary).toBe(63_395_192);
  });

  it("applies the foreign-worker flat tax election with local income tax add-on", () => {
    const result = KRCalculator.calculate(
      inputs(100_000_000, {
        taxReliefs: {
          foreignWorkerFlatTax: true,
          personalPensionContribution: 9_000_000,
        },
      }),
    );
    const breakdown = result.breakdown as KRBreakdown;

    expect(result.taxableIncome).toBe(100_000_000);
    expect(breakdown.taxDetails.foreignWorkerFlatTaxApplied).toBe(true);
    expect(result.taxes.incomeTax).toBe(19_000_000);
    expect(result.taxes.localIncomeTax).toBe(1_900_000);
    expect(breakdown.voluntaryContributions.personalPensionContribution).toBe(0);
    expect(result.totalTax).toBe(29_498_276);
    expect(result.netSalary).toBe(70_501_724);
  });
});
