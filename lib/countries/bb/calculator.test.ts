import { describe, expect, it } from "vitest";
import { BBCalculator } from "./calculator";
import type { BBBreakdown, BBCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BBCalculatorInputs> = {},
): BBCalculatorInputs {
  return {
    country: "BB",
    grossSalary,
    payFrequency: "annual",
    residencyStatus: "resident",
    ageAllowanceStatus: "standard",
    hasEligibleSpouse: false,
    charityType: "registeredNonExempt",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Barbados calculator", () => {
  it("calculates 2026 resident PIT, NIS ceiling, and resilience fund contribution", () => {
    const result = BBCalculator.calculate(inputs(90_000));
    const breakdown = result.breakdown as BBBreakdown;

    expect(breakdown.personalAllowance).toBe(25_000);
    expect(result.taxableIncome).toBe(57_924.8);
    expect(result.taxes.incomeTax).toBe(7_929.32);
    expect(result.taxes.socialContributions).toBe(7_300.2);
    expect(result.totalTax).toBe(15_229.52);
    expect(result.netSalary).toBe(74_770.48);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "National Insurance employee contribution",
          amount: 7_075.2,
          cap: 64_320,
          preTax: true,
        }),
        expect.objectContaining({
          name: "Resilience and Regeneration Fund contribution",
          amount: 225,
          rate: 0.0025,
        }),
      ]),
    );
    expect(breakdown.sourceUrls.some((url) => url.includes("bra.gov.bb"))).toBe(
      true,
    );
    expect(breakdown.sourceUrls.some((url) => url.includes("nis.gov.bb"))).toBe(
      true,
    );
  });

  it("uses the compensatory income credit to offset low resident income tax", () => {
    const result = BBCalculator.calculate(inputs(40_000));
    const breakdown = result.breakdown as BBBreakdown;

    expect(result.taxableIncome).toBe(10_600);
    expect(breakdown.bracketTaxes).toEqual([
      expect.objectContaining({ rate: 0.115, tax: 1_219 }),
    ]);
    expect(breakdown.taxCredits).toEqual([
      { name: "Compensatory income credit", amount: 1_219 },
    ]);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(4_500);
    expect(result.netSalary).toBe(35_500);
  });

  it("caps resident pensioner deductions and removes them for non-residents", () => {
    const pensionerInputs = inputs(90_000, {
      ageAllowanceStatus: "pensioner60Plus",
      hasEligibleSpouse: true,
      charityType: "exemptCharity",
      contributions: {
        medicalExpenses: 99_999,
        qualifyingExpenses: 99_999,
        charitableDonations: 999_999,
        housingExpenses: 99_999,
      },
    });
    const pensionerResult = BBCalculator.calculate(pensionerInputs);
    const pensionerBreakdown = pensionerResult.breakdown as BBBreakdown;
    const pensionerLimits = BBCalculator.getContributionLimits(pensionerInputs);
    const nonResidentResult = BBCalculator.calculate(
      inputs(90_000, {
        residencyStatus: "nonResident",
        hasEligibleSpouse: true,
        contributions: {
          medicalExpenses: 99_999,
          qualifyingExpenses: 99_999,
          charitableDonations: 999_999,
          housingExpenses: 99_999,
        },
      }),
    );
    const nonResidentBreakdown = nonResidentResult.breakdown as BBBreakdown;

    expect(pensionerLimits.medicalExpenses?.limit).toBe(750);
    expect(pensionerLimits.qualifyingExpenses?.limit).toBe(240);
    expect(pensionerLimits.charitableDonations?.limit).toBe(90_000);
    expect(pensionerLimits.housingExpenses?.limit).toBe(10_000);
    expect(pensionerBreakdown.personalAllowance).toBe(40_000);
    expect(pensionerBreakdown.deductions).toEqual([
      { name: "Spouse allowance", amount: 3_000 },
    ]);
    expect(pensionerBreakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "medicalExpenses",
          amount: 750,
          limit: 750,
        }),
        expect.objectContaining({
          key: "qualifyingExpenses",
          amount: 240,
          limit: 240,
        }),
        expect.objectContaining({
          key: "charitableDonations",
          amount: 90_000,
          limit: 90_000,
        }),
        expect.objectContaining({
          key: "housingExpenses",
          amount: 10_000,
          limit: 10_000,
        }),
      ]),
    );
    expect(pensionerResult.taxableIncome).toBe(0);
    expect(pensionerResult.netSalary).toBe(82_699.8);

    expect(nonResidentBreakdown.personalAllowance).toBe(0);
    expect(nonResidentBreakdown.voluntaryContributions.every((row) => row.limit === 0)).toBe(
      true,
    );
    expect(nonResidentResult.taxableIncome).toBe(82_924.8);
    expect(nonResidentResult.taxes.incomeTax).toBe(14_804.32);
  });
});
