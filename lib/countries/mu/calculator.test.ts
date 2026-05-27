import { describe, expect, it } from "vitest";
import { MUCalculator } from "./calculator";
import type { MUBreakdown, MUCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<MUCalculatorInputs> = {},
): MUCalculatorInputs {
  return {
    country: "MU",
    grossSalary,
    payFrequency: "annual",
    numberOfDependents: 0,
    numberOfPrivateSchoolDependents: 0,
    numberOfTertiaryEducationDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      carerWages: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      carerWages: 0,
      ...overrides.contributions,
    },
  };
}

describe("Mauritius calculator", () => {
  it("calculates MRA 2025/26 PAYE bands and CSG for salary", () => {
    const result = MUCalculator.calculate(inputs(1_200_000));
    const breakdown = result.breakdown as MUBreakdown;

    expect(result.taxableIncome).toBe(1_200_000);
    expect(result.taxes.incomeTax).toBe(90_000);
    expect(result.taxes.socialContributions).toBe(36_000);
    expect(result.totalTax).toBe(126_000);
    expect(result.netSalary).toBe(1_074_000);
    expect(breakdown.bracketTaxes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ min: 500_000, max: 1_000_000, rate: 0.1 }),
        expect.objectContaining({ min: 1_000_000, rate: 0.2 }),
      ]),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.mra.mu/download/PayrollTaxes.pdf",
        "https://mra.mu/index.php/individuals/reliefs-deductions-allowances",
      ]),
    );
  });

  it("caps dependent, pension, insurance, charity, education, carer, housing, and green reliefs", () => {
    const result = MUCalculator.calculate(
      inputs(2_000_000, {
        numberOfDependents: 4,
        numberOfPrivateSchoolDependents: 2,
        numberOfTertiaryEducationDependents: 1,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 999_999,
          insurancePremiums: 999_999,
          charitableDonations: 999_999,
          educationExpenses: 999_999,
          housingExpenses: 999_999,
          tertiaryEducationExpenses: 999_999,
          carerWages: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as MUBreakdown;
    const limits = MUCalculator.getContributionLimits(
      inputs(2_000_000, {
        numberOfDependents: 4,
        numberOfPrivateSchoolDependents: 2,
        numberOfTertiaryEducationDependents: 1,
      }),
    );

    expect(limits.insurancePremiums?.limit).toBe(110_000);
    expect(limits.educationExpenses?.limit).toBe(120_000);
    expect(limits.tertiaryEducationExpenses?.limit).toBe(500_000);
    expect(breakdown.deductions).toEqual([
      expect.objectContaining({
        name: "Deduction for dependents",
        amount: 355_000,
      }),
    ]);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "retirementContribution", amount: 50_000 }),
        expect.objectContaining({ key: "insurancePremiums", amount: 110_000 }),
        expect.objectContaining({ key: "charitableDonations", amount: 100_000 }),
        expect.objectContaining({ key: "educationExpenses", amount: 120_000 }),
        expect.objectContaining({
          key: "tertiaryEducationExpenses",
          amount: 500_000,
        }),
        expect.objectContaining({ key: "carerWages", amount: 30_000 }),
      ]),
    );
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(110_000);
    expect(result.netSalary).toBe(1_890_000);
  });
});
