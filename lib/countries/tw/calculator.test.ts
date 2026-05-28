// Taiwan calculator tests — sources: National Taxation Bureau, BLI, NHI
import { describe, expect, it } from "vitest";
import { calculateTW } from "./calculator";
import type { TWCalculatorInputs } from "../types";

function createInputs(
  grossSalary: number,
  overrides: Partial<TWCalculatorInputs> = {},
): TWCalculatorInputs {
  return {
    country: "TW",
    grossSalary,
    payFrequency: "annual",
    contributions: {
      voluntaryPensionContribution: 0,
    },
    taxReliefs: {
      isMarried: false,
      hasDisability: false,
      isGoldCardHolder: false,
    },
    ...overrides,
  };
}

describe("Taiwan Tax Calculator 2026", () => {
  describe("Tax Brackets", () => {
    it("calculates positive tax for income in first bracket", () => {
      const result = calculateTW(createInputs(600_000));
      expect(result.taxableIncome).toBeGreaterThan(0);
      expect(result.taxes.incomeTax).toBeGreaterThan(0);
    });

    it("applies higher marginal rates for mid-bracket income after deductions", () => {
      const low = calculateTW(createInputs(600_000));
      const mid = calculateTW(createInputs(1_000_000));
      expect(mid.taxes.incomeTax).toBeGreaterThan(low.taxes.incomeTax);
      expect(mid.effectiveTaxRate).toBeGreaterThan(low.effectiveTaxRate);
    });

    it("has meaningful effective rate for high income", () => {
      const result = calculateTW(createInputs(6_000_000));
      expect(result.effectiveTaxRate).toBeGreaterThan(0.2);
    });
  });

  describe("Social Insurance", () => {
    it("calculates labor insurance at 2.3%", () => {
      const monthlySalary = 40_000;
      const annualSalary = monthlySalary * 12;
      const result = calculateTW(createInputs(annualSalary));
      const expectedMonthlyLaborInsurance = Math.round(monthlySalary * 0.023);
      const expectedAnnualLaborInsurance = expectedMonthlyLaborInsurance * 12;
      expect(result.taxes.laborInsurance).toBe(expectedAnnualLaborInsurance);
    });

    it("caps labor insurance at NT$45,800/month", () => {
      const highSalary = 100_000 * 12;
      const result = calculateTW(createInputs(highSalary));
      const maxMonthlyLaborInsurance = Math.round(45_800 * 0.023);
      const maxAnnualLaborInsurance = maxMonthlyLaborInsurance * 12;
      expect(result.taxes.laborInsurance).toBe(maxAnnualLaborInsurance);
    });
  });

  describe("Deductions", () => {
    it("applies standard deduction for single filer", () => {
      const result = calculateTW(
        createInputs(1_000_000, {
          taxReliefs: { isMarried: false, hasDisability: false, isGoldCardHolder: false },
        }),
      );
      expect(result.breakdown.deductions.standardDeduction).toBe(136_000);
    });

    it("applies standard deduction for married filer", () => {
      const result = calculateTW(
        createInputs(1_000_000, {
          taxReliefs: { isMarried: true, hasDisability: false, isGoldCardHolder: false },
        }),
      );
      expect(result.breakdown.deductions.standardDeduction).toBe(272_000);
    });
  });

  describe("Basic Validation", () => {
    it("calculates net salary less than gross", () => {
      const result = calculateTW(createInputs(1_000_000));
      expect(result.netSalary).toBeLessThan(result.grossSalary);
      expect(result.totalTax).toBeGreaterThan(0);
    });

    it("has positive effective tax rate below 100%", () => {
      const result = calculateTW(createInputs(1_000_000));
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeLessThan(1);
    });
  });
});
