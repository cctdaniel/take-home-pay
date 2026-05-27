import { describe, expect, it } from "vitest";
import { BACalculator } from "./calculator";
import type { BABreakdown, BACalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BACalculatorInputs> = {},
): BACalculatorInputs {
  return {
    country: "BA",
    grossSalary,
    payFrequency: "annual",
    entity: "fbih",
    hasDependentSpouse: false,
    dependentChildren: 0,
    dependentParents: 0,
    otherDependents: 0,
    bdDisabilityPercent: 0,
    bdPermanentDisability: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      mortgageInterest: 0,
      lifeInsurancePremium: 0,
      educationExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      mortgageInterest: 0,
      lifeInsurancePremium: 0,
      educationExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Bosnia and Herzegovina calculator", () => {
  it("calculates Federation PIT with spouse, child, parent, mortgage, and life-insurance deductions", () => {
    const result = BACalculator.calculate(
      inputs(60_000, {
        hasDependentSpouse: true,
        dependentChildren: 3,
        dependentParents: 1,
        contributions: {
          mortgageInterest: 1_000,
          lifeInsurancePremium: 500,
        },
      }),
    );
    const breakdown = result.breakdown as BABreakdown;

    expect(breakdown.personalAllowance).toBe(12_600);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Mortgage interest", amount: 1_000 }),
        expect.objectContaining({
          name: "Life insurance premium",
          amount: 500,
        }),
        expect.objectContaining({
          name: "Children education costs",
          amount: 0,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(27_300);
    expect(result.taxes.incomeTax).toBe(2_730);
    expect(result.taxes.socialContributions).toBe(18_600);
    expect(result.netSalary).toBe(38_670);
    expect(breakdown.sourceUrls.some((url) => url.includes("pufbih.ba"))).toBe(
      true,
    );
  });

  it("uses Republika Srpska 8% PIT and caps RS voluntary deductions", () => {
    const result = BACalculator.calculate(
      inputs(60_000, {
        entity: "rs",
        otherDependents: 2,
        contributions: {
          retirementContribution: 9_999,
          qualifyingExpenses: 9_999,
          mortgageInterest: 1_000,
          lifeInsurancePremium: 500,
          educationExpenses: 500,
        },
      }),
    );
    const breakdown = result.breakdown as BABreakdown;
    const limits = BACalculator.getContributionLimits(
      inputs(60_000, { entity: "rs" }),
    );

    expect(limits.retirementContribution?.limit).toBe(1_200);
    expect(limits.qualifyingExpenses?.limit).toBe(1_200);
    expect(breakdown.personalAllowance).toBe(7_800);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Mortgage interest", amount: 1_000 }),
        expect.objectContaining({
          name: "Life insurance premium",
          amount: 0,
        }),
        expect.objectContaining({
          name: "Children education costs",
          amount: 0,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 1_200,
          limit: 1_200,
        }),
        expect.objectContaining({
          key: "qualifyingExpenses",
          amount: 1_200,
          limit: 1_200,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(48_800);
    expect(result.taxes.incomeTax).toBe(3_904);
    expect(result.totalDeductions).toBe(24_904);
    expect(result.netSalary).toBe(35_096);
  });

  it("uses Brcko District disability and dependent allowances plus Brcko life-insurance cap", () => {
    const result = BACalculator.calculate(
      inputs(60_000, {
        entity: "bd",
        otherDependents: 2,
        bdDisabilityPercent: 55,
        bdPermanentDisability: true,
        contributions: {
          qualifyingExpenses: 9_999,
          mortgageInterest: 1_000,
          educationExpenses: 500,
        },
      }),
    );
    const breakdown = result.breakdown as BABreakdown;
    const limits = BACalculator.getContributionLimits(
      inputs(60_000, { entity: "bd" }),
    );

    expect(limits.retirementContribution?.limit).toBe(0);
    expect(limits.qualifyingExpenses?.limit).toBe(1_800);
    expect(breakdown.personalAllowance).toBe(16_200);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Children education costs",
          amount: 500,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "qualifyingExpenses",
          amount: 1_800,
          limit: 1_800,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(21_900);
    expect(result.taxes.incomeTax).toBe(2_190);
    expect(result.netSalary).toBe(37_410);
    expect(breakdown.sourceUrls.some((url) => url.includes("skupstinabd.ba"))).toBe(
      true,
    );
  });
});
