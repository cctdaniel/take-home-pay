import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { BG_CONFIG } from "./config";
import { BG_INCOME_TAX_RATE, BG_SOCIAL_SECURITY_2026, BG_TOTAL_EMPLOYEE_RATE, BG_TOTAL_EMPLOYER_RATE } from "./constants/tax-year-2026";
import type { BGBreakdown, BGCalculatorInputs, BGTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

function getPeriodsPerYear(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}

function roundCurrency(v: number): number { return Math.round(v * 100) / 100; }

export function calculateBG(inputs: BGCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const maxAnnualBase = BG_SOCIAL_SECURITY_2026.maxMonthlyBase * 12;
  const ssSalary = clampAmount(grossSalary, maxAnnualBase);
  const socialEmployee = roundCurrency(ssSalary * BG_TOTAL_EMPLOYEE_RATE);
  const socialEmployer = roundCurrency(ssSalary * BG_TOTAL_EMPLOYER_RATE);
  // Bulgaria allows deduction of mandatory social contributions before income tax
  const taxableIncome = Math.max(0, grossSalary - socialEmployee);
  const incomeTax = roundCurrency(taxableIncome * BG_INCOME_TAX_RATE);

  const taxes: BGTaxBreakdown = { type: "BG", totalIncomeTax: incomeTax, incomeTax, socialSecurityEmployee: socialEmployee };
  const totalTax = incomeTax + socialEmployee;
  const netSalary = grossSalary - totalTax;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: BGBreakdown = {
    type: "BG", grossIncome: grossSalary, taxableIncome, incomeTaxRate: BG_INCOME_TAX_RATE, incomeTax,
    socialSecurity: {
      employee: socialEmployee, employeeRate: BG_TOTAL_EMPLOYEE_RATE,
      employer: socialEmployer, employerRate: BG_TOTAL_EMPLOYER_RATE,
      maxMonthlyBase: BG_SOCIAL_SECURITY_2026.maxMonthlyBase, maxAnnualBase,
    },
    assumptions: [
      "Flat 10% personal income tax on taxable income after mandatory social contributions.",
      `Employee social security total rate: ${(BG_TOTAL_EMPLOYEE_RATE * 100).toFixed(1)}% on salary up to BGN ${BG_SOCIAL_SECURITY_2026.maxMonthlyBase.toLocaleString()}/month.`,
      "Employer contributions shown for reference, not deducted from take-home pay.",
    ],
    sourceUrls: ["https://nra.bg", "https://nssi.bg"],
  };

  return {
    country: "BG", currency: "BGN", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: netSalary / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const BGCalculator: CountryCalculator = {
  countryCode: "BG", config: BG_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BG") throw new Error("BGCalculator can only calculate BG inputs");
    return calculateBG(inputs as BGCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): BGCalculatorInputs {
    return { country: "BG", grossSalary: 36_000, payFrequency: "monthly", contributions: {} };
  },
};
