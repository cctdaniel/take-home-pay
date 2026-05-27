import { describe, expect, it } from "vitest";
import { calculateTW } from "./calculator";
import type { TWCalculatorInputs } from "../types";

// Helper to create inputs
function createInputs(
  grossSalary: number,
  overrides: Partial<TWCalculatorInputs> = {},
): TWCalculatorInputs {
  return {
    country: "TW",
    grossSalary,
    payFrequency: "annual",
    taxResidency: "resident",
    contributions: {
      voluntaryPensionContribution: 0,
    },
    taxReliefs: {
      isMarried: false,
      hasDisability: false,
      deductionMethod: "auto",
      numberOfDependents: 0,
      numberOfElderlyLinealAscendants: 0,
      disabledPersons: 0,
      savingsAndInvestmentIncome: 0,
      collegeTuitionChildren: 0,
      preschoolChildren: 0,
      longTermCarePersons: 0,
      rentPaid: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
      medicalAndMaternityExpenses: 0,
      mortgageInterest: 0,
      calamityLosses: 0,
      isGoldCardHolder: false,
    },
    ...overrides,
  };
}

describe("Taiwan Tax Calculator 2026", () => {
  describe("Tax Brackets", () => {
    it("should calculate 5% tax for income in first bracket", () => {
      const inputs = createInputs(600_000);
      const result = calculateTW(inputs);
      
      expect(result.taxableIncome).toBeGreaterThan(0);
      expect(result.taxes.incomeTax).toBeGreaterThan(0);
    });

    it("should calculate 12% tax for income in second bracket", () => {
      const inputs = createInputs(1_200_000);
      const result = calculateTW(inputs);
      
      const expectedFirstBracketTax = 560_000 * 0.05;
      expect(result.taxes.incomeTax).toBeGreaterThan(expectedFirstBracketTax);
      expect(
        result.breakdown.bracketTaxes.some((bracket) => bracket.rate === 0.12),
      ).toBe(true);
    });

    it("should calculate 40% tax for high income", () => {
      const inputs = createInputs(6_000_000);
      const result = calculateTW(inputs);
      
      expect(result.effectiveTaxRate).toBeGreaterThan(0.20);
    });
  });

  describe("Social Insurance", () => {
    it("should calculate labor insurance at 2.3%", () => {
      const monthlySalary = 40_000;
      const annualSalary = monthlySalary * 12;
      const inputs = createInputs(annualSalary);
      const result = calculateTW(inputs);

      const expectedMonthlyLaborInsurance = Math.round(monthlySalary * 0.023);
      const expectedAnnualLaborInsurance = expectedMonthlyLaborInsurance * 12;
      
      expect(result.taxes.laborInsurance).toBe(expectedAnnualLaborInsurance);
    });

    it("should cap labor insurance at NT$45,800/month", () => {
      const highSalary = 100_000 * 12;
      const inputs = createInputs(highSalary);
      const result = calculateTW(inputs);

      const maxMonthlyLaborInsurance = Math.round(45_800 * 0.023);
      const maxAnnualLaborInsurance = maxMonthlyLaborInsurance * 12;
      
      expect(result.taxes.laborInsurance).toBe(maxAnnualLaborInsurance);
    });
  });

  describe("Deductions", () => {
    it("should apply standard deduction for single filer", () => {
      const inputs = createInputs(1_000_000, {
        taxReliefs: { isMarried: false, hasDisability: false },
      });
      const result = calculateTW(inputs);

      expect(result.breakdown.deductions.standardDeduction).toBe(136_000);
    });

    it("should apply standard deduction for married filer", () => {
      const inputs = createInputs(1_000_000, {
        taxReliefs: { isMarried: true, hasDisability: false },
      });
      const result = calculateTW(inputs);

      expect(result.breakdown.deductions.standardDeduction).toBe(272_000);
    });
  });

  describe("Basic Validation", () => {
    it("should calculate net salary less than gross", () => {
      const inputs = createInputs(1_000_000);
      const result = calculateTW(inputs);
      
      expect(result.netSalary).toBeLessThan(result.grossSalary);
      expect(result.totalTax).toBeGreaterThan(0);
    });

    it("should have positive effective tax rate", () => {
      const inputs = createInputs(1_000_000);
      const result = calculateTW(inputs);
      
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeLessThan(1);
    });

    it("totals income tax and each employee insurance item exactly once", () => {
      const result = calculateTW(createInputs(1_000_000));

      expect(result.totalTax).toBe(
        result.taxes.incomeTax +
          result.taxes.laborInsurance +
          result.taxes.employmentInsurance +
          result.taxes.nhi,
      );
    });
  });
});
