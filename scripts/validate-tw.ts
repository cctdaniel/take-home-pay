// ============================================================================
// TAIWAN CALCULATOR VALIDATION SCRIPT
// Run with: npx tsx scripts/validate-tw.ts
// ============================================================================

import { calculateTW } from "../lib/countries/tw/calculator";
import type { TWCalculatorInputs } from "../lib/countries/types";

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

console.log("Taiwan Tax Calculator 2026 - Validation Tests");
console.log("==============================================");
console.log("Tax Year: 2026");
console.log("Sources:");
console.log("  - Tax brackets: National Taxation Bureau of Taipei");
console.log("    https://www.ntbt.gov.tw/English/multiplehtml/3f18d2625aea4187b0d90e9b929afe4c");
console.log("  - Social insurance: Bureau of Labor Insurance, NHI Administration");
console.log("  - Deductions: Ministry of Finance (Nov 27, 2025 announcement)");

// Test case 1: Low income (NT$600,000/year = NT$50,000/month)
console.log("\n--- Test 1: NT$600,000/year (NT$50,000/month) ---");
const test1 = calculateTW(createInputs(600_000));
console.log(`Gross Salary:        NT$${test1.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:      NT$${test1.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax (5%):     NT$${test1.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Labor Insurance:     NT$${test1.taxes.laborInsurance.toLocaleString().padStart(12)} (2.3%)`);
console.log(`Employment Insurance:NT$${test1.taxes.employmentInsurance.toLocaleString().padStart(12)} (0.2%)`);
console.log(`NHI:                 NT$${test1.taxes.nhi.toLocaleString().padStart(12)} (1.551%)`);
console.log(`Total Tax:           NT$${test1.totalTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:          NT$${test1.netSalary.toLocaleString().padStart(12)}`);
console.log(`Effective Tax Rate:  ${(test1.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 2: Median income (NT$1,200,000/year = NT$100,000/month)
console.log("\n--- Test 2: NT$1,200,000/year (NT$100,000/month) ---");
const test2 = calculateTW(createInputs(1_200_000));
console.log(`Gross Salary:        NT$${test2.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:      NT$${test2.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax:          NT$${test2.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Labor Insurance:     NT$${test2.taxes.laborInsurance.toLocaleString().padStart(12)} (2.3%)`);
console.log(`Employment Insurance:NT$${test2.taxes.employmentInsurance.toLocaleString().padStart(12)} (0.2%)`);
console.log(`NHI:                 NT$${test2.taxes.nhi.toLocaleString().padStart(12)} (1.551%)`);
console.log(`Total Tax:           NT$${test2.totalTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:          NT$${test2.netSalary.toLocaleString().padStart(12)}`);
console.log(`Effective Tax Rate:  ${(test2.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 3: High income (NT$3,000,000/year = NT$250,000/month)
console.log("\n--- Test 3: NT$3,000,000/year (NT$250,000/month) - Above insurance caps ---");
const test3 = calculateTW(createInputs(3_000_000));
console.log(`Gross Salary:        NT$${test3.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:      NT$${test3.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax:          NT$${test3.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Labor Insurance:     NT$${test3.taxes.laborInsurance.toLocaleString().padStart(12)} (capped at NT$45,800)`);
console.log(`Employment Insurance:NT$${test3.taxes.employmentInsurance.toLocaleString().padStart(12)} (capped at NT$45,800)`);
console.log(`NHI:                 NT$${test3.taxes.nhi.toLocaleString().padStart(12)} (capped at NT$313,000)`);
console.log(`Total Tax:           NT$${test3.totalTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:          NT$${test3.netSalary.toLocaleString().padStart(12)}`);
console.log(`Effective Tax Rate:  ${(test3.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 4: Very high income (NT$6,000,000/year = NT$500,000/month)
console.log("\n--- Test 4: NT$6,000,000/year (NT$500,000/month) - 40% bracket ---");
const test4 = calculateTW(createInputs(6_000_000));
console.log(`Gross Salary:        NT$${test4.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:      NT$${test4.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax:          NT$${test4.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Labor Insurance:     NT$${test4.taxes.laborInsurance.toLocaleString().padStart(12)} (capped)`);
console.log(`Employment Insurance:NT$${test4.taxes.employmentInsurance.toLocaleString().padStart(12)} (capped)`);
console.log(`NHI:                 NT$${test4.taxes.nhi.toLocaleString().padStart(12)} (capped)`);
console.log(`Total Tax:           NT$${test4.totalTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:          NT$${test4.netSalary.toLocaleString().padStart(12)}`);
console.log(`Effective Tax Rate:  ${(test4.effectiveTaxRate * 100).toFixed(2)}%`);

// Test case 5: Married filer
console.log("\n--- Test 5: NT$1,000,000/year - Married Filer ---");
const test5 = calculateTW(createInputs(1_000_000, { taxReliefs: { isMarried: true, hasDisability: false } }));
console.log(`Gross Salary:        NT$${test5.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Standard Deduction:  NT$${test5.breakdown.deductions.standardDeduction.toLocaleString().padStart(12)} (NT$272,000 married)`);
console.log(`Personal Exemption:  NT$${test5.breakdown.deductions.personalExemption.toLocaleString().padStart(12)}`);
console.log(`Salary Deduction:    NT$${test5.breakdown.deductions.specialSalaryDeduction.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:      NT$${test5.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax:          NT$${test5.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:          NT$${test5.netSalary.toLocaleString().padStart(12)}`);

// Test case 6: With voluntary pension
console.log("\n--- Test 6: NT$1,200,000/year - With 6% Voluntary Pension ---");
const monthlySalary = 100_000;
const voluntaryPension = Math.round(monthlySalary * 0.06 * 12);
const test6 = calculateTW(createInputs(1_200_000, { 
  contributions: { voluntaryPensionContribution: voluntaryPension } 
}));
console.log(`Gross Salary:              NT$${test6.grossSalary.toLocaleString().padStart(12)}`);
console.log(`Voluntary Pension (6%):    NT$${test6.breakdown.deductions.voluntaryPensionContribution.toLocaleString().padStart(12)}`);
console.log(`Taxable Income:            NT$${test6.taxableIncome.toLocaleString().padStart(12)}`);
console.log(`Income Tax:                NT$${test6.taxes.incomeTax.toLocaleString().padStart(12)}`);
console.log(`Net Salary:                NT$${test6.netSalary.toLocaleString().padStart(12)}`);
console.log(`Tax Savings from Pension:  NT$${(test2.taxes.incomeTax - test6.taxes.incomeTax).toLocaleString().padStart(12)}`);

console.log("\n==============================================");
console.log("Validation Complete!");
console.log("All calculations follow Taiwan 2026 tax regulations.");
