import { describe, expect, it } from "vitest";
import { SGCalculator } from "./calculator";
import type { SGBreakdown, SGCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<SGCalculatorInputs> = {},
): SGCalculatorInputs {
  return {
    country: "SG",
    grossSalary,
    payFrequency: "annual",
    residencyType: "citizen_pr",
    taxResidency: "resident",
    age: 30,
    contributions: {
      voluntaryCpfTopUp: 0,
      srsContribution: 0,
    },
    taxReliefs: {
      hasSpouseRelief: false,
      hasDisabledSpouseRelief: false,
      numberOfChildren: 0,
      numberOfDisabledChildren: 0,
      isWorkingMother: false,
      wmcrPre2024Children: 0,
      wmcrPost2024FirstChild: false,
      wmcrPost2024SecondChild: false,
      wmcrPost2024ThirdAndLaterChildren: 0,
      parentRelief: "none",
      parentReliefForDisability: false,
      numberOfParents: 0,
      grandparentCaregiverRelief: false,
      numberOfDisabledSiblings: 0,
      lifeInsurancePremiums: 0,
      lifeInsuranceCapitalSum: 0,
      approvedDonations: 0,
      parenthoodTaxRebate: 0,
      nsmanSelfRelief: "none",
      hasNsmanWifeRelief: false,
      numberOfNsmanParentReliefs: 0,
      courseFees: 0,
    },
    ...overrides,
    contributions: {
      voluntaryCpfTopUp: 0,
      srsContribution: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      hasSpouseRelief: false,
      hasDisabledSpouseRelief: false,
      numberOfChildren: 0,
      numberOfDisabledChildren: 0,
      isWorkingMother: false,
      wmcrPre2024Children: 0,
      wmcrPost2024FirstChild: false,
      wmcrPost2024SecondChild: false,
      wmcrPost2024ThirdAndLaterChildren: 0,
      parentRelief: "none",
      parentReliefForDisability: false,
      numberOfParents: 0,
      grandparentCaregiverRelief: false,
      numberOfDisabledSiblings: 0,
      lifeInsurancePremiums: 0,
      lifeInsuranceCapitalSum: 0,
      approvedDonations: 0,
      parenthoodTaxRebate: 0,
      nsmanSelfRelief: "none",
      hasNsmanWifeRelief: false,
      numberOfNsmanParentReliefs: 0,
      courseFees: 0,
      ...overrides.taxReliefs,
    },
  };
}

describe("Singapore calculator", () => {
  it("calculates resident CPF, CPF relief, earned-income relief, and progressive resident tax", () => {
    const result = SGCalculator.calculate(inputs(60_000));
    const breakdown = result.breakdown as SGBreakdown;

    expect(result.taxes.cpfEmployee).toBe(12_000);
    expect(result.taxes.cpfEmployer).toBe(10_200);
    expect(breakdown.taxReliefs.earnedIncomeRelief).toBe(1_000);
    expect(breakdown.taxReliefs.cpfRelief).toBe(12_000);
    expect(result.taxableIncome).toBe(47_000);
    expect(result.taxes.incomeTax).toBe(1_040);
    expect(result.totalTax).toBe(13_040);
    expect(result.netSalary).toBe(46_960);
  });

  it("caps voluntary CPF top-up and SRS reliefs and deducts both cash contributions", () => {
    const limits = SGCalculator.getContributionLimits(inputs(60_000));
    const result = SGCalculator.calculate(
      inputs(60_000, {
        contributions: {
          voluntaryCpfTopUp: 10_000,
          srsContribution: 20_000,
        },
      }),
    );
    const breakdown = result.breakdown as SGBreakdown;

    expect(limits.voluntaryCpfTopUp?.limit).toBe(8_000);
    expect(limits.srsContribution?.limit).toBe(15_300);
    expect(breakdown.taxReliefs.voluntaryCpfTopUpRelief).toBe(8_000);
    expect(breakdown.taxReliefs.srsRelief).toBe(15_300);
    expect(result.taxableIncome).toBe(23_700);
    expect(result.taxes.incomeTax).toBe(74);
    expect(result.totalDeductions).toBe(35_374);
    expect(result.netSalary).toBe(24_626);
  });

  it("uses resident reliefs for tax-resident foreigners but no CPF", () => {
    const result = SGCalculator.calculate(
      inputs(100_000, {
        residencyType: "foreigner",
        taxResidency: "resident",
      }),
    );

    expect(result.taxes.cpfEmployee).toBe(0);
    expect(result.taxableIncome).toBe(99_000);
    expect(result.taxes.incomeTax).toBe(5_535);
    expect(result.netSalary).toBe(94_465);
  });

  it("uses the higher non-resident employment tax without resident personal reliefs", () => {
    const result = SGCalculator.calculate(
      inputs(100_000, {
        residencyType: "foreigner",
        taxResidency: "non_resident",
      }),
    );

    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(15_000);
    expect(result.totalTax).toBe(15_000);
    expect(result.netSalary).toBe(85_000);
  });

  it("applies the personal-relief cap, donation cap, and Parenthood Tax Rebate", () => {
    const result = SGCalculator.calculate(
      inputs(200_000, {
        contributions: {
          voluntaryCpfTopUp: 8_000,
          srsContribution: 15_300,
        },
        taxReliefs: {
          hasSpouseRelief: true,
          hasDisabledSpouseRelief: true,
          numberOfChildren: 3,
          numberOfDisabledChildren: 1,
          isWorkingMother: true,
          wmcrPre2024Children: 3,
          parentRelief: "staying",
          parentReliefForDisability: true,
          numberOfParents: 2,
          grandparentCaregiverRelief: true,
          numberOfDisabledSiblings: 2,
          lifeInsurancePremiums: 10_000,
          lifeInsuranceCapitalSum: 100_000,
          approvedDonations: 50_000,
          parenthoodTaxRebate: 50_000,
          nsmanSelfRelief: "key_or_command",
          hasNsmanWifeRelief: true,
          numberOfNsmanParentReliefs: 2,
        },
      }),
    );
    const breakdown = result.breakdown as SGBreakdown;

    expect(breakdown.taxReliefs.reliefCapReduction).toBe(159_750);
    expect(breakdown.taxReliefs.cappedPersonalReliefs).toBe(80_000);
    expect(breakdown.taxReliefs.donationDeduction).toBe(80_000);
    expect(result.taxableIncome).toBe(40_000);
    expect(breakdown.taxRebates.parenthoodTaxRebate).toBe(550);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalDeductions).toBe(42_500);
    expect(result.netSalary).toBe(157_500);
  });
});
