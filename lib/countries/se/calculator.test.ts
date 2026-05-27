import { describe, expect, it } from "vitest";
import { SECalculator } from "./calculator";
import type { SEBreakdown, SECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<SECalculatorInputs> = {},
): SECalculatorInputs {
  return {
    country: "SE",
    grossSalary,
    payFrequency: "annual",
    taxRegime: "ordinary",
    municipalTaxRate: 0.3241,
    noOccupationalPension: false,
    contributions: {
      privatePensionSavings: 0,
      commutingExpenses: 0,
      otherWorkExpenses: 0,
      rotRutTaxReduction: 0,
      greenTechnologyTaxReduction: 0,
    },
    ...overrides,
    contributions: {
      privatePensionSavings: 0,
      commutingExpenses: 0,
      otherWorkExpenses: 0,
      rotRutTaxReduction: 0,
      greenTechnologyTaxReduction: 0,
      ...overrides.contributions,
    },
  };
}

describe("Sweden calculator", () => {
  it("calculates ordinary salary with municipal tax, pension contribution, and matching credit", () => {
    const result = SECalculator.calculate(inputs(600_000));
    const breakdown = result.breakdown as SEBreakdown;

    expect(result.taxableIncome).toBe(582_600);
    expect(result.taxes.employeeSocialContribution).toBe(42_000);
    expect(result.taxes.employeeSocialTaxCredit).toBe(42_000);
    expect(result.taxes.incomeTax).toBe(146_820.66);
    expect(result.totalTax).toBe(188_820.66);
    expect(result.netSalary).toBe(411_179.34);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.skatteverket.se/privat/skatter/beloppochprocent/2026/beloppochprocent2026kortversion.4.1522bf3f19aea8075ba89.html",
        "https://www.skatteverket.se/privat/skatter/arbeteochinkomst/avdragforprivatpersoner/np.4.5fc8c94513259a4ba1d800042822.html",
      ]),
    );
  });

  it("caps ordinary private pension, ROT/RUT, and green-tech reductions while applying expense thresholds", () => {
    const result = SECalculator.calculate(
      inputs(1_200_000, {
        municipalTaxRate: 0.35,
        noOccupationalPension: true,
        contributions: {
          privatePensionSavings: 999_999,
          commutingExpenses: 50_000,
          otherWorkExpenses: 20_000,
          rotRutTaxReduction: 999_999,
          greenTechnologyTaxReduction: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as SEBreakdown;
    const limits = SECalculator.getContributionLimits(inputs(1_200_000));

    expect(limits.privatePensionSavings?.limit).toBe(420_000);
    expect(limits.rotRutTaxReduction?.limit).toBe(75_000);
    expect(limits.greenTechnologyTaxReduction?.limit).toBe(50_000);
    expect(breakdown.voluntaryDeductions).toEqual(
      expect.objectContaining({
        privatePensionSavings: 420_000,
        commutingExpenses: 50_000,
        commutingDeduction: 35_000,
        otherWorkExpenses: 20_000,
        otherWorkExpenseDeduction: 15_000,
        rotRutTaxReduction: 75_000,
        greenTechnologyTaxReduction: 50_000,
        appliedTaxReductions: 125_000,
      }),
    );
    expect(result.taxableIncome).toBe(712_600);
    expect(result.totalDeductions).toBe(558_330);
    expect(result.netSalary).toBe(641_670);
  });

  it("models expert tax relief by exempting 25% and disabling ordinary deductions", () => {
    const result = SECalculator.calculate(
      inputs(1_200_000, {
        taxRegime: "expertRelief",
        municipalTaxRate: 0.35,
        noOccupationalPension: true,
        contributions: {
          privatePensionSavings: 999_999,
          commutingExpenses: 50_000,
          otherWorkExpenses: 20_000,
          rotRutTaxReduction: 999_999,
          greenTechnologyTaxReduction: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as SEBreakdown;

    expect(breakdown.expertRelief).toEqual(
      expect.objectContaining({
        exemptIncome: 300_000,
        taxableSalaryBase: 900_000,
        exemptRate: 0.25,
      }),
    );
    expect(Object.values(breakdown.voluntaryDeductions).every((amount) => amount === 0)).toBe(
      true,
    );
    expect(result.taxableIncome).toBe(882_600);
    expect(result.totalTax).toBe(356_830);
    expect(result.netSalary).toBe(843_170);
  });
});
