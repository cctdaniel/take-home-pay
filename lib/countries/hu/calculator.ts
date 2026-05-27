import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { HU_CONFIG } from "./config";
import { HU_INCOME_TAX_RATE, HU_TOTAL_EMPLOYEE_RATE } from "./constants/tax-year-2026";
import type { HUBreakdown, HUCalculatorInputs, HUTaxBreakdown } from "./types";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateHU(inputs: HUCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const socialEmployee = r(grossSalary * HU_TOTAL_EMPLOYEE_RATE);
  // Hungary taxes gross income (not after social contributions)
  const taxableIncome = grossSalary;
  const incomeTax = r(taxableIncome * HU_INCOME_TAX_RATE);

  const taxes: HUTaxBreakdown = { type: "HU", totalIncomeTax: incomeTax, incomeTax, socialContributionEmployee: socialEmployee };
  const totalTax = incomeTax + socialEmployee;
  const periodsPerYear = g(payFrequency);

  const breakdown: HUBreakdown = {
    type: "HU", grossIncome: grossSalary, taxableIncome, incomeTaxRate: HU_INCOME_TAX_RATE, incomeTax,
    socialContributions: { employee: socialEmployee, employeeRate: HU_TOTAL_EMPLOYEE_RATE },
    assumptions: [
      "Flat 15% personal income tax on gross salary.",
      `Total employee social contribution: ${(HU_TOTAL_EMPLOYEE_RATE * 100).toFixed(1)}% (pension 10% + health 7% + unemployment 1.5%).`,
    ],
    sourceUrls: ["https://nav.gov.hu"],
  };

  return {
    country: "HU", currency: "HUF", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const HUCalculator: CountryCalculator = {
  countryCode: "HU", config: HU_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "HU") throw new Error("HUCalculator can only calculate HU inputs");
    return calculateHU(inputs as HUCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): HUCalculatorInputs {
    return { country: "HU", grossSalary: 6_000_000, payFrequency: "monthly", contributions: {} };
  },
};
