import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { PL_CONFIG } from "./config";
import { PL_HEALTH_INSURANCE_RATE, PL_SOCIAL_SECURITY_2026, PL_TAX_FREE_AMOUNT, PL_TOTAL_SOCIAL_RATE, calculatePLProgressiveTax } from "./constants/tax-year-2026";
import type { PLBreakdown, PLCalculatorInputs, PLTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculatePL(inputs: PLCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const ssSalary = clampAmount(grossSalary, PL_SOCIAL_SECURITY_2026.maxAnnualBase);
  const socialEmployee = r(ssSalary * PL_TOTAL_SOCIAL_RATE);
  // Health insurance base is gross minus social contributions
  const healthBase = Math.max(0, grossSalary - socialEmployee);
  const healthEmployee = r(healthBase * PL_HEALTH_INSURANCE_RATE);
  // Tax base: gross - social contributions
  const income = Math.max(0, grossSalary - socialEmployee);
  // Tax-reducing amount (kwota zmniejszająca podatek): PLN 3,600 for income ≤ 120K,
  // phased out linearly to 0 at income = 240K
  const taxReducingAmount = Math.max(0, 3_600 - Math.max(0, income - 120_000) * 0.03);
  const { totalTax: grossTax, bracketTaxes } = calculatePLProgressiveTax(income);
  const incomeTax = r(Math.max(0, grossTax - taxReducingAmount));
  const taxableIncome = income;

  const taxes: PLTaxBreakdown = {
    type: "PL", totalIncomeTax: incomeTax, incomeTax,
    socialSecurityEmployee: socialEmployee,
    healthInsuranceEmployee: healthEmployee,
  };
  const totalTax = incomeTax + socialEmployee + healthEmployee;
  const periodsPerYear = g(payFrequency);

  const breakdown: PLBreakdown = {
    type: "PL", grossIncome: grossSalary, taxableIncome,
    taxFreeAmount: PL_TAX_FREE_AMOUNT,
    taxReducingAmount,
    bracketTaxes: bracketTaxes.map(b => ({ ...b, tax: r(b.tax) })),
    incomeTax,
    socialSecurity: { employee: socialEmployee, employeeRate: PL_TOTAL_SOCIAL_RATE },
    healthInsurance: { employee: healthEmployee, employeeRate: PL_HEALTH_INSURANCE_RATE },
    totalEmployeeContributions: socialEmployee + healthEmployee,
    assumptions: [
      "Progressive tax scale: 12% up to PLN 120,000, 32% above.",
      `Social security (ZUS): ${(PL_TOTAL_SOCIAL_RATE * 100).toFixed(1)}% on salary up to PLN ${PL_SOCIAL_SECURITY_2026.maxAnnualBase.toLocaleString()}/year.`,
      `Health insurance (NFZ): 9% on gross minus social contributions.`,
      `Tax-free amount: PLN ${PL_TAX_FREE_AMOUNT.toLocaleString()} (phased out above PLN 120,000).`,
    ],
    sourceUrls: ["https://www.podatki.gov.pl", "https://www.zus.pl"],
  };

  return {
    country: "PL", currency: "PLN", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const PLCalculator: CountryCalculator = {
  countryCode: "PL", config: PL_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PL") throw new Error("PLCalculator can only calculate PL inputs");
    return calculatePL(inputs as PLCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): PLCalculatorInputs {
    return { country: "PL", grossSalary: 84_000, payFrequency: "monthly", contributions: {} };
  },
};
