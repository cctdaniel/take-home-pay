// ==========================================================================
// UK CALCULATOR TEST SUITE
// Validates calculations against official HMRC expectations
//
// Official Sources:
// - HMRC Tax Calculator: https://www.gov.uk/estimate-income-tax
// - Income Tax rates: https://www.gov.uk/income-tax-rates
// - NI rates: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// ==========================================================================

import { UKCalculator } from "./calculator";
import type { UKCalculatorInputs, UKBreakdown, UKTaxBreakdown } from "../types";

interface TestCase {
  name: string;
  inputs: UKCalculatorInputs;
  expected: {
    incomeTax: number;        // Approximate expected income tax
    ni: number;               // Approximate expected National Insurance
    totalTax: number;         // incomeTax + ni
    personalAllowance: number; // Expected personal allowance
    tolerance: number;        // Acceptable difference in pounds
  };
}

const testCases: TestCase[] = [
  // ==========================================================================
  // LOW INCOME (Below Personal Allowance)
  // Expected: No income tax, minimal or no NI
  // ==========================================================================
  {
    name: "Low income: £10,000 (below Personal Allowance)",
    inputs: {
      country: "UK",
      grossSalary: 10000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      incomeTax: 0,
      ni: 0,
      totalTax: 0,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // BASIC RATE TAXPAYER
  // Expected: 20% on income above Personal Allowance
  // ==========================================================================
  {
    name: "Basic rate: £25,000",
    inputs: {
      country: "UK",
      grossSalary: 25000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Taxable: 25000 - 12570 = 12430
      // Income Tax: 12430 * 0.20 = 2486
      incomeTax: 2486,
      // NI: (25000 - 12570) * 0.08 = 994.40
      ni: 994.40,
      totalTax: 3480.40,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  {
    name: "Basic rate: £35,000",
    inputs: {
      country: "UK",
      grossSalary: 35000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Taxable: 35000 - 12570 = 22430
      // Income Tax: 22430 * 0.20 = 4486
      incomeTax: 4486,
      // NI: (35000 - 12570) * 0.08 = 1794.40
      ni: 1794.40,
      totalTax: 6280.40,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // HIGHER RATE THRESHOLD (£50,270)
  // At this exact threshold, taxpayer starts paying higher rate (40%)
  // ==========================================================================
  {
    name: "At higher rate threshold: £50,270",
    inputs: {
      country: "UK",
      grossSalary: 50270,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Taxable: 50270 - 12570 = 37700
      // All at basic rate: 37700 * 0.20 = 7540
      incomeTax: 7540,
      // NI: (50270 - 12570) * 0.08 = 3016
      ni: 3016,
      totalTax: 10556,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // HIGHER RATE TAXPAYER
  // Expected: 20% on first £37,700 of taxable, 40% on rest
  // ==========================================================================
  {
    name: "Higher rate: £60,000",
    inputs: {
      country: "UK",
      grossSalary: 60000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Taxable: 60000 - 12570 = 47430
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate: (47430 - 37700) * 0.40 = 3892
      // Total income tax: 7540 + 3892 = 11432
      incomeTax: 11432,
      // NI: 
      // - Main: (50270 - 12570) * 0.08 = 3016
      // - Additional: (60000 - 50270) * 0.02 = 194.60
      // - Total: 3016 + 194.60 = 3210.60
      ni: 3210.60,
      totalTax: 14642.60,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // PERSONAL ALLOWANCE TAPER (£100,000+)
  // Expected: Personal allowance reduces by £1 for every £2 above £100,000
  // ==========================================================================
  {
    name: "Personal Allowance taper: £100,000 (no reduction yet)",
    inputs: {
      country: "UK",
      grossSalary: 100000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Personal Allowance: 12570 (at exact threshold, no reduction)
      // Taxable: 100000 - 12570 = 87430
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate: (87430 - 37700) * 0.40 = 19892
      incomeTax: 27432,
      // NI: 
      // - Main: (50270 - 12570) * 0.08 = 3016
      // - Additional: (100000 - 50270) * 0.02 = 994.60
      ni: 4010.60,
      totalTax: 31442.60,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  {
    name: "Personal Allowance taper: £110,000 (reduced PA)",
    inputs: {
      country: "UK",
      grossSalary: 110000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Income above 100000: 10000
      // PA reduction: 10000 / 2 = 5000
      // New PA: 12570 - 5000 = 7570
      // Taxable: 110000 - 7570 = 102430
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate: (102430 - 37700) * 0.40 = 25892
      incomeTax: 33432,
      ni: 5010.60, // Same NI calc pattern
      totalTax: 38442.60,
      personalAllowance: 7570,
      tolerance: 1,
    },
  },
  
  {
    name: "No Personal Allowance: £125,140 (zero PA)",
    inputs: {
      country: "UK",
      grossSalary: 125140,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Income above 100000: 25140
      // PA reduction: 25140 / 2 = 12570 (full allowance)
      // New PA: 0
      // Taxable: 125140 - 0 = 125140
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate: (125140 - 37700) * 0.40 = 34976
      incomeTax: 42516,
      ni: 6514.20,
      totalTax: 49030.20,
      personalAllowance: 0,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // ADDITIONAL RATE TAXPAYER (£125,140+)
  // Expected: 45% on income above £125,140
  // ==========================================================================
  {
    name: "Additional rate: £150,000",
    inputs: {
      country: "UK",
      grossSalary: 150000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // No PA
      // Taxable: 150000
      // Basic rate: 37700 * 0.20 = 7540
      // Higher rate: (125140 - 37700) * 0.40 = 34976
      // Additional rate: (150000 - 125140) * 0.45 = 11187
      incomeTax: 53703,
      ni: 8514.60,
      totalTax: 62217.60,
      personalAllowance: 0,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // SCOTLAND (Different tax bands)
  // ==========================================================================
  {
    name: "Scotland basic rate: £25,000",
    inputs: {
      country: "UK",
      grossSalary: 25000,
      payFrequency: "annual",
      residencyType: "resident",
      region: "scotland",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // Taxable: 25000 - 12570 = 12430
      // Scottish rates:
      // - Starter (19%): 2827 * 0.19 = 537.13
      // - Basic (20%): (12430 - 2827) = 9603 * 0.20 = 1920.60
      // Total: 537.13 + 1920.60 = 2457.73
      incomeTax: 2457.73,
      // NI is same as rest of UK
      ni: 994.40,
      totalTax: 3452.13,
      personalAllowance: 12570,
      tolerance: 1,
    },
  },
  
  // ==========================================================================
  // NON-RESIDENT
  // Expected: No Personal Allowance, taxed from first pound
  // ==========================================================================
  {
    name: "Non-resident: £35,000",
    inputs: {
      country: "UK",
      grossSalary: 35000,
      payFrequency: "annual",
      residencyType: "non_resident",
      region: "rest_of_uk",
      contributions: { pensionContribution: 0 },
    },
    expected: {
      // No PA, all income taxable
      // Taxable: 35000
      // Basic rate: 35000 * 0.20 = 7000
      incomeTax: 7000,
      // NI is same calculation
      ni: 1794.40,
      totalTax: 8794.40,
      personalAllowance: 0,
      tolerance: 1,
    },
  },
];

function runTests() {
  console.log("UK Tax Calculator Test Suite");
  console.log("============================\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const result = UKCalculator.calculate(testCase.inputs);
      const breakdown = result.breakdown as UKBreakdown;
      const taxes = result.taxes as UKTaxBreakdown;
      
      // Check personal allowance
      const paDiff = Math.abs(breakdown.personalAllowance - testCase.expected.personalAllowance);
      
      // Check income tax
      const incomeTaxDiff = Math.abs(taxes.incomeTax - testCase.expected.incomeTax);
      
      // Check NI
      const niDiff = Math.abs(taxes.nationalInsurance - testCase.expected.ni);
      
      // Check total tax
      const totalTaxDiff = Math.abs(result.totalTax - testCase.expected.totalTax);
      
      const allWithinTolerance = 
        paDiff <= testCase.expected.tolerance &&
        incomeTaxDiff <= testCase.expected.tolerance &&
        niDiff <= testCase.expected.tolerance &&
        totalTaxDiff <= testCase.expected.tolerance;
      
      if (allWithinTolerance) {
        console.log(`✅ PASS: ${testCase.name}`);
        console.log(`   Gross: £${result.grossSalary.toLocaleString()}`);
        console.log(`   PA: £${breakdown.personalAllowance.toLocaleString()} (expected: £${testCase.expected.personalAllowance.toLocaleString()})`);
        console.log(`   Income Tax: £${taxes.incomeTax.toFixed(2)} (expected: £${testCase.expected.incomeTax.toFixed(2)})`);
        console.log(`   NI: £${taxes.nationalInsurance.toFixed(2)} (expected: £${testCase.expected.ni.toFixed(2)})`);
        console.log(`   Total Tax: £${result.totalTax.toFixed(2)} (expected: £${testCase.expected.totalTax.toFixed(2)})`);
        console.log(`   Net: £${result.netSalary.toFixed(2)}`);
        console.log();
        passed++;
      } else {
        console.log(`❌ FAIL: ${testCase.name}`);
        console.log(`   Personal Allowance: ${breakdown.personalAllowance} (expected: ${testCase.expected.personalAllowance}, diff: ${paDiff})`);
        console.log(`   Income Tax: ${taxes.incomeTax.toFixed(2)} (expected: ${testCase.expected.incomeTax.toFixed(2)}, diff: ${incomeTaxDiff.toFixed(2)})`);
        console.log(`   NI: ${taxes.nationalInsurance.toFixed(2)} (expected: ${testCase.expected.ni.toFixed(2)}, diff: ${niDiff.toFixed(2)})`);
        console.log(`   Total Tax: ${result.totalTax.toFixed(2)} (expected: ${testCase.expected.totalTax.toFixed(2)}, diff: ${totalTaxDiff.toFixed(2)})`);
        console.log();
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${testCase.name}`);
      console.log(`   ${error instanceof Error ? error.message : String(error)}`);
      console.log();
      failed++;
    }
  }
  
  console.log("============================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

export { runTests, testCases };
