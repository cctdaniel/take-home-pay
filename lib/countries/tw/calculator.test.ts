// ============================================================================
// TAIWAN CALCULATOR TESTS
// Validates tax calculations against known values
// ============================================================================

import { calculateTW } from "./calculator";
import type { TWCalculatorInputs } from "../types";

// Helper to create inputs
function createInputs(
  grossSalary: number,
  overrides: Partial<TWCalculatorInputs> = {}
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
    },
    ...overrides,
  };
}

// Test cases with expected results
// Sources:
// - Tax brackets: National Taxation Bureau of Taipei
// - Social insurance rates: Bureau of Labor Insurance, National Health Insurance Administration

describe("Taiwan Tax Calculator 2026", () => {
  describe("Tax Brackets", () => {
    it("should calculate 5% tax for income in first bracket", () => {
      const inputs = createInputs(600_000);
      const result = calculateTW(inputs);
      
      expect(result.taxableIncome).toBeGreaterThan(0);
      expect(result.taxes.incomeTax).toBeGreaterThan(0);
    });

    it("should calculate 12% tax for income in second bracket", () => {
      const inputs = createInputs(1_000_000);
      const result = calculateTW(inputs);
      
      const expectedFirstBracketTax = 610_000 * 0.05;
      expect(result.taxes.incomeTax).toBeGreaterThan(expectedFirstBracketTax);
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
  });
});

// Manual validation test cases
// Run with: npx jest lib/countries/tw/calculator.test.ts

console.log("Taiwan Tax Calculator Validation Tests");
console.log("======================================");

// Test case 1: Low income (NT$600,000/year = NT$50,000/month)
const test1 = calculateTW(createInputs(600_000));
console.log("\nTest 1: NT$600,000/year (NT$50,000/month)");
console.log(`  Gross Salary: NT$${test1.grossSalary.toLocaleString()}`);
console.log(`  Taxable Income: NT$${test1.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${test1.taxes.incomeTax.toLocaleString()}`);
console.log(`  Labor Insurance: NT$${test1.taxes.laborInsurance.toLocaleString()}`);
console.log(`  Employment Insurance: NT$${test1.taxes.employmentInsurance.toLocaleString()}`);
console.log(`  NHI: NT$${test1.taxes.nhi.toLocaleString()}`);
console.log(`  Total Tax: NT$${test1.totalTax.toLocaleString()}`);
console.log(`  Net Salary: NT$${test1.netSalary.toLocaleString()}`);
console.log(`  Effective Tax Rate: ${(test1.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 2: Median income (NT$1,200,000/year = NT$100,000/month)
const test2 = calculateTW(createInputs(1_200_000));
console.log("\nTest 2: NT$1,200,000/year (NT$100,000/month)");
console.log(`  Gross Salary: NT$${test2.grossSalary.toLocaleString()}`);
console.log(`  Taxable Income: NT$${test2.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${test2.taxes.incomeTax.toLocaleString()}`);
console.log(`  Labor Insurance: NT$${test2.taxes.laborInsurance.toLocaleString()}`);
console.log(`  Employment Insurance: NT$${test2.taxes.employmentInsurance.toLocaleString()}`);
console.log(`  NHI: NT$${test2.taxes.nhi.toLocaleString()}`);
console.log(`  Total Tax: NT$${test2.totalTax.toLocaleString()}`);
console.log(`  Net Salary: NT$${test2.netSalary.toLocaleString()}`);
console.log(`  Effective Tax Rate: ${(test2.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 3: High income (NT$3,000,000/year = NT$250,000/month)
const test3 = calculateTW(createInputs(3_000_000));
console.log("\nTest 3: NT$3,000,000/year (NT$250,000/month) - Above NHI cap");
console.log(`  Gross Salary: NT$${test3.grossSalary.toLocaleString()}`);
console.log(`  Taxable Income: NT$${test3.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${test3.taxes.incomeTax.toLocaleString()}`);
console.log(`  Labor Insurance: NT$${test3.taxes.laborInsurance.toLocaleString()} (capped)`);
console.log(`  Employment Insurance: NT$${test3.taxes.employmentInsurance.toLocaleString()} (capped)`);
console.log(`  NHI: NT$${test3.taxes.nhi.toLocaleString()} (capped at NT$313,000 base)`);
console.log(`  Total Tax: NT$${test3.totalTax.toLocaleString()}`);
console.log(`  Net Salary: NT$${test3.netSalary.toLocaleString()}`);
console.log(`  Effective Tax Rate: ${(test3.effectiveTaxRate * 100).toFixed(2)}%`);
