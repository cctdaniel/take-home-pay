import { describe, expect, it } from "vitest";
import { MACalculator } from "./calculator";
import type { MABreakdown, MACalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<MACalculatorInputs> = {},
): MACalculatorInputs {
  return {
    country: "MA",
    grossSalary,
    payFrequency: "annual",
    numberOfDependents: 0,
    firstEmploymentExemption: false,
    cnssAmoMonthlyWage: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("Morocco calculator", () => {
  it("calculates resident salary tax with CNSS, AMO, and the professional expense deduction", () => {
    const result = MACalculator.calculate(inputs(360_000));
    const breakdown = result.breakdown as MABreakdown;

    expect(breakdown.deductions).toEqual([
      expect.objectContaining({
        name: "Professional expense deduction",
        amount: 35_000,
      }),
    ]);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "CNSS employee contribution",
          amount: 3_225.6,
          rate: 0.0448,
          cap: 72_000,
        }),
        expect.objectContaining({
          name: "AMO health employee contribution",
          amount: 8_136,
          rate: 0.0226,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(313_638.4);
    expect(result.taxes.incomeTax).toBe(88_646.21);
    expect(result.totalTax).toBe(100_007.81);
    expect(result.netSalary).toBe(259_992.19);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.tax.gov.ma/wps/portal/DGI/Vos-impots-procedures/Impots-sur-le-revenu",
        "https://www.tgr.gov.ma/wps/wcm/connect/9856b6bb-dee8-4578-bfe8-ef1521dcc80f/CGI%2B2026%2BFR.pdf?MOD=AJPERES",
      ]),
    );
  });

  it("caps dependents, pension insurance, mortgage interest, and recognized charitable deductions", () => {
    const result = MACalculator.calculate(
      inputs(600_000, {
        numberOfDependents: 10,
        cnssAmoMonthlyWage: 3_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          housingExpenses: 999_999,
          charitableDonations: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as MABreakdown;
    const limits = MACalculator.getContributionLimits(
      inputs(600_000, {
        cnssAmoMonthlyWage: 3_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          housingExpenses: 999_999,
          charitableDonations: 999_999,
        },
      }),
    );

    expect(breakdown.numberOfDependents).toBe(6);
    expect(breakdown.cnssSocialAnnualBase).toBe(36_000);
    expect(breakdown.amoAnnualBase).toBe(36_000);
    expect(limits.retirementContribution?.limit).toBe(281_286.8);
    expect(limits.housingExpenses?.limit).toBe(28_128.68);
    expect(limits.charitableDonations?.limit).toBe(253_158.12);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "retirementContribution", amount: 281_286.8 }),
        expect.objectContaining({
          key: "housingExpenses",
          amount: 28_128.68,
          cashFlowTreatment: "taxOnly",
        }),
        expect.objectContaining({
          key: "charitableDonations",
          amount: 253_158.12,
          cashFlowTreatment: "taxOnly",
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(283_713.2);
    expect(result.netSalary).toBe(316_286.8);
  });

  it("models the first-employment IR exemption as an income-tax credit", () => {
    const result = MACalculator.calculate(
      inputs(300_000, {
        numberOfDependents: 2,
        firstEmploymentExemption: true,
      }),
    );
    const breakdown = result.breakdown as MABreakdown;

    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "First-employment IR exemption",
          amount: 66_947.93,
        }),
      ]),
    );
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(10_005.6);
    expect(result.netSalary).toBe(289_994.4);
  });
});
