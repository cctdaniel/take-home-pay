import { describe, expect, it } from "vitest";
import { THCalculator } from "./calculator";
import type { THBreakdown, THCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<THCalculatorInputs> = {},
): THCalculatorInputs {
  return {
    country: "TH",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    contributions: {
      providentFundContribution: 0,
      rmfContribution: 0,
      ssfContribution: 0,
      esgContribution: 0,
      nationalSavingsFundContribution: 0,
    },
    taxReliefs: {
      hasSpouse: false,
      spouseHasNoIncome: false,
      numberOfChildren: 0,
      numberOfChildrenBornAfter2018: 0,
      numberOfParents: 0,
      numberOfDisabledDependents: 0,
      lifeInsurancePremium: 0,
      lifeInsuranceSpousePremium: 0,
      healthInsurancePremium: 0,
      healthInsuranceParentsPremium: 0,
      hasSocialSecurity: true,
      providentFundContribution: 0,
      rmfContribution: 0,
      ssfContribution: 0,
      esgContribution: 0,
      mortgageInterest: 0,
      donations: 0,
      politicalDonation: 0,
      isElderlyOrDisabled: false,
      nationalSavingsFundContribution: 0,
    },
    ...overrides,
    contributions: {
      providentFundContribution: 0,
      rmfContribution: 0,
      ssfContribution: 0,
      esgContribution: 0,
      nationalSavingsFundContribution: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      hasSpouse: false,
      spouseHasNoIncome: false,
      numberOfChildren: 0,
      numberOfChildrenBornAfter2018: 0,
      numberOfParents: 0,
      numberOfDisabledDependents: 0,
      lifeInsurancePremium: 0,
      lifeInsuranceSpousePremium: 0,
      healthInsurancePremium: 0,
      healthInsuranceParentsPremium: 0,
      hasSocialSecurity: true,
      providentFundContribution: 0,
      rmfContribution: 0,
      ssfContribution: 0,
      esgContribution: 0,
      mortgageInterest: 0,
      donations: 0,
      politicalDonation: 0,
      isElderlyOrDisabled: false,
      nationalSavingsFundContribution: 0,
      ...overrides.taxReliefs,
    },
  };
}

describe("Thailand calculator", () => {
  it("applies the employment deduction, personal allowance, social security, and progressive PIT", () => {
    const result = THCalculator.calculate(inputs(600_000));
    const breakdown = result.breakdown as THBreakdown;

    expect(breakdown.standardDeduction).toBe(100_000);
    expect(breakdown.totalAllowances).toBe(69_000);
    expect(result.taxableIncome).toBe(431_000);
    expect(result.taxes.incomeTax).toBe(20_600);
    expect(result.taxes.socialSecurity).toBe(9_000);
    expect(result.totalTax).toBe(29_600);
    expect(result.netSalary).toBe(570_400);
  });

  it("models family allowances, insurance caps, mortgage interest, donations, and elderly relief", () => {
    const result = THCalculator.calculate(
      inputs(1_200_000, {
        taxReliefs: {
          hasSpouse: true,
          spouseHasNoIncome: true,
          numberOfChildren: 2,
          numberOfChildrenBornAfter2018: 1,
          numberOfParents: 2,
          numberOfDisabledDependents: 1,
          lifeInsurancePremium: 120_000,
          healthInsurancePremium: 25_000,
          healthInsuranceParentsPremium: 15_000,
          mortgageInterest: 150_000,
          donations: 200_000,
          politicalDonation: 20_000,
          isElderlyOrDisabled: true,
        },
      }),
    );
    const allowances = (result.breakdown as THBreakdown).allowances;

    expect(allowances.lifeInsurance).toBe(71_429);
    expect(allowances.healthInsurance).toBe(28_571);
    expect(allowances.donations).toBe(110_000);
    expect(allowances.politicalDonation).toBe(10_000);
    expect((result.breakdown as THBreakdown).totalAllowances).toBe(849_000);
    expect(result.taxableIncome).toBe(251_000);
    expect(result.taxes.incomeTax).toBe(5_050);
    expect(result.totalTax).toBe(14_050);
    expect(result.netSalary).toBe(1_185_950);
  });

  it("uses individual retirement fund caps plus the shared PVD/RMF/SSF deduction cap", () => {
    const limits = THCalculator.getContributionLimits(inputs(2_000_000));
    const result = THCalculator.calculate(
      inputs(2_000_000, {
        contributions: {
          providentFundContribution: 300_000,
          rmfContribution: 500_000,
          ssfContribution: 200_000,
          esgContribution: 300_000,
          nationalSavingsFundContribution: 30_000,
        },
        taxReliefs: {
          providentFundContribution: 300_000,
          rmfContribution: 500_000,
          ssfContribution: 200_000,
          esgContribution: 300_000,
          nationalSavingsFundContribution: 30_000,
        },
      }),
    );
    const breakdown = result.breakdown as THBreakdown;

    expect(limits.providentFundContribution?.limit).toBe(300_000);
    expect(limits.rmfContribution?.limit).toBe(500_000);
    expect(limits.ssfContribution?.limit).toBe(200_000);
    expect(limits.esgContribution?.limit).toBe(300_000);
    expect(limits.nationalSavingsFundContribution?.limit).toBe(30_000);
    expect(breakdown.allowances.providentFund).toBe(150_000);
    expect(breakdown.allowances.rmf).toBe(250_000);
    expect(breakdown.allowances.ssf).toBe(100_000);
    expect(breakdown.allowances.esg).toBe(300_000);
    expect(breakdown.allowances.nationalSavingsFund).toBe(30_000);
    expect(result.taxableIncome).toBe(1_001_000);
    expect(result.taxes.incomeTax).toBe(115_250);
    expect(result.totalDeductions).toBe(1_454_250);
    expect(result.netSalary).toBe(545_750);
  });
});
