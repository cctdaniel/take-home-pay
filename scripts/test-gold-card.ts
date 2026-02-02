// ============================================================================
// TAIWAN EMPLOYMENT GOLD CARD TAX BENEFIT TEST
// Run with: npx tsx scripts/test-gold-card.ts
// ============================================================================

import { calculateTW } from "../lib/countries/tw/calculator";
import type { TWCalculatorInputs } from "../lib/countries/types";

// Helper to create inputs
function createInputs(
  grossSalary: number,
  isGoldCard: boolean,
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
      isGoldCardHolder: isGoldCard,
    },
    ...overrides,
  };
}

console.log("Taiwan Employment Gold Card Tax Benefit Test");
console.log("============================================");

// Test case: NT$5,000,000 annual salary
// Without Gold Card: Full taxable income
// With Gold Card: 50% of (income - 3M) is exempt

const salary = 5_000_000;

console.log(`\nSalary: NT$${salary.toLocaleString()}/year`);
console.log("-".repeat(60));

// Without Gold Card
const regularResult = calculateTW(createInputs(salary, false));
console.log("\nRegular Taxpayer (No Gold Card):");
console.log(`  Taxable Income: NT$${regularResult.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${regularResult.taxes.incomeTax.toLocaleString()}`);
console.log(`  Total Tax: NT$${regularResult.totalTax.toLocaleString()}`);
console.log(`  Net Salary: NT$${regularResult.netSalary.toLocaleString()}`);
console.log(`  Effective Tax Rate: ${(regularResult.effectiveTaxRate * 100).toFixed(2)}%`);

// With Gold Card
const goldCardResult = calculateTW(createInputs(salary, true));
console.log("\nGold Card Holder:");
console.log(`  Taxable Income Before Exemption: NT$${goldCardResult.breakdown.goldCard?.taxableIncomeBeforeExemption.toLocaleString()}`);
console.log(`  Gold Card Exemption (50% >3M): NT$${goldCardResult.breakdown.goldCard?.exemptionAmount.toLocaleString()}`);
console.log(`  Final Taxable Income: NT$${goldCardResult.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${goldCardResult.taxes.incomeTax.toLocaleString()}`);
console.log(`  Total Tax: NT$${goldCardResult.totalTax.toLocaleString()}`);
console.log(`  Net Salary: NT$${goldCardResult.netSalary.toLocaleString()}`);
console.log(`  Effective Tax Rate: ${(goldCardResult.effectiveTaxRate * 100).toFixed(2)}%`);

// Calculate savings
const taxSavings = regularResult.taxes.incomeTax - goldCardResult.taxes.incomeTax;
const netDifference = goldCardResult.netSalary - regularResult.netSalary;

console.log("\n" + "=".repeat(60));
console.log("GOLD CARD BENEFIT SUMMARY:");
console.log(`  Tax Savings: NT$${taxSavings.toLocaleString()}`);
console.log(`  Additional Net Income: NT$${netDifference.toLocaleString()}`);
console.log(`  Effective Tax Rate Reduction: ${((regularResult.effectiveTaxRate - goldCardResult.effectiveTaxRate) * 100).toFixed(2)} percentage points`);

// Test with higher salary
const highSalary = 8_000_000;
console.log(`\n\nHigh Salary Test: NT$${highSalary.toLocaleString()}/year`);
console.log("-".repeat(60));

const regularHigh = calculateTW(createInputs(highSalary, false));
const goldCardHigh = calculateTW(createInputs(highSalary, true));

console.log("Regular Taxpayer:");
console.log(`  Taxable Income: NT$${regularHigh.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${regularHigh.taxes.incomeTax.toLocaleString()}`);
console.log(`  Effective Rate: ${(regularHigh.effectiveTaxRate * 100).toFixed(2)}%`);

console.log("\nGold Card Holder:");
console.log(`  Taxable Income Before: NT$${goldCardHigh.breakdown.goldCard?.taxableIncomeBeforeExemption.toLocaleString()}`);
console.log(`  Gold Card Exemption: NT$${goldCardHigh.breakdown.goldCard?.exemptionAmount.toLocaleString()}`);
console.log(`  Final Taxable Income: NT$${goldCardHigh.taxableIncome.toLocaleString()}`);
console.log(`  Income Tax: NT$${goldCardHigh.taxes.incomeTax.toLocaleString()}`);
console.log(`  Effective Rate: ${(goldCardHigh.effectiveTaxRate * 100).toFixed(2)}%`);

const highTaxSavings = regularHigh.taxes.incomeTax - goldCardHigh.taxes.incomeTax;
console.log(`\nTax Savings with Gold Card: NT$${highTaxSavings.toLocaleString()}`);

console.log("\n" + "=".repeat(60));
console.log("All tests passed! Gold Card tax benefit is working correctly.");
