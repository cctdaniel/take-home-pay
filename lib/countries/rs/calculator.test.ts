import { describe, expect, it } from "vitest";
import { RSCalculator } from "./calculator";
import type { RSBreakdown, RSCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<RSCalculatorInputs> = {},
): RSCalculatorInputs {
  return {
    country: "RS",
    grossSalary,
    taxableNonCashBenefits: 0,
    taxableFringeBenefits: 0,
    payFrequency: "annual",
    includeAnnualPersonalIncomeTax: true,
    newlySettledRelief: "none",
    age: 35,
    numberOfDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function calculateRS(input: RSCalculatorInputs) {
  return RSCalculator.calculate(input);
}

describe("Serbia calculator", () => {
  it("applies salary tax and employee social contributions to ordinary payroll", () => {
    const result = calculateRS(inputs(3_600_000));
    const breakdown = result.breakdown as RSBreakdown;

    expect(result.taxableIncome).toBe(3_189_348);
    expect(result.taxes.incomeTax).toBe(318_934.8);
    expect(result.taxes.socialContributions).toBe(716_400);
    expect(result.totalTax).toBe(1_035_334.8);
    expect(result.netSalary).toBe(2_564_665.2);
    expect(breakdown.annualPitDetails.annualTax).toBe(0);
    expect(breakdown.annualPitDetails.under40Reduction).toBe(2_564_665.2);
  });

  it("calculates supplementary annual PIT with dependent deductions and AIF credit", () => {
    const result = calculateRS(
      inputs(15_000_000, {
        age: 45,
        numberOfDependents: 2,
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 500_000,
        },
      }),
    );
    const annualPit = (result.breakdown as RSBreakdown).annualPitDetails;

    expect(result.taxes.incomeTax).toBe(1_458_934.8);
    expect(result.taxes.socialContributions).toBe(2_008_261.36);
    expect(annualPit.netAnnualEmploymentIncome).toBe(11_791_091.04);
    expect(annualPit.incomeForAnnualTax).toBe(6_351_995.04);
    expect(annualPit.taxpayerDeduction).toBe(725_213);
    expect(annualPit.dependentDeduction).toBe(543_910);
    expect(annualPit.annualTaxBase).toBe(5_082_872.04);
    expect(annualPit.annualTaxBeforeCredit).toBe(508_287.2);
    expect(annualPit.alternativeInvestmentFundCredit).toBe(250_000);
    expect(annualPit.annualTax).toBe(258_287.2);
    expect(result.totalTax).toBe(3_467_196.16);
    expect(result.netSalary).toBe(11_532_803.84);
  });

  it("removes the supplementary annual PIT when the annual estimate is disabled", () => {
    const result = calculateRS(
      inputs(15_000_000, {
        age: 45,
        includeAnnualPersonalIncomeTax: false,
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 500_000,
        },
      }),
    );
    const annualPit = (result.breakdown as RSBreakdown).annualPitDetails;

    expect(annualPit.annualTax).toBe(0);
    expect(annualPit.alternativeInvestmentFundInvestment).toBe(0);
    expect(result.totalTax).toBe(3_208_908.96);
    expect(result.netSalary).toBe(11_791_091.04);
  });

  it("applies the newly settled taxpayer base reduction only above the selected salary threshold", () => {
    const result = calculateRS(
      inputs(6_000_000, {
        newlySettledRelief: "prior_nonresident",
      }),
    );
    const breakdown = result.breakdown as RSBreakdown;

    expect(result.taxableIncome).toBe(1_676_804.4);
    expect(result.taxes.incomeTax).toBe(167_680.44);
    expect(result.taxes.socialContributions).toBe(358_200);
    expect(result.totalTax).toBe(525_880.44);
    expect(result.netSalary).toBe(5_474_119.56);
    expect(breakdown.newlySettledReliefInput).toBe("prior_nonresident");
  });
});
