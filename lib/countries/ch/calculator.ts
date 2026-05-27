import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { CH_CONFIG } from "./config";
import { CH_SOCIAL_SECURITY_2026, CH_TOTAL_EMPLOYEE_SOCIAL_RATE, calculateCHFederalTax } from "./constants/tax-year-2026";
import type { CHBreakdown, CHCalculatorInputs, CHTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateCH(inputs: CHCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  // AHV/IV/EO on full salary, ALV capped
  const ahvIvEo = r(grossSalary * CH_SOCIAL_SECURITY_2026.ahvIvEoRate);
  const alvSalary = clampAmount(grossSalary, CH_SOCIAL_SECURITY_2026.alvMaxAnnualSalary);
  const alv = r(alvSalary * CH_SOCIAL_SECURITY_2026.alvRate);
  const socialEmployee = r(ahvIvEo + alv);
  // Federal tax on taxable income (after social deductions)
  const taxableIncome = Math.max(0, grossSalary - socialEmployee);
  const federalTax = r(calculateCHFederalTax(taxableIncome));
  const incomeTax = federalTax; // Only federal, cantonal not modeled

  const taxes: CHTaxBreakdown = { type: "CH", totalIncomeTax: incomeTax, incomeTax, socialSecurityEmployee: socialEmployee };
  const totalTax = incomeTax + socialEmployee;
  const periodsPerYear = g(payFrequency);

  const breakdown: CHBreakdown = {
    type: "CH", grossIncome: grossSalary, taxableIncome,
    federalTax,
    socialSecurity: {
      employee: socialEmployee,
      employeeRate: CH_TOTAL_EMPLOYEE_SOCIAL_RATE,
      ahvIvEo,
      alv,
    },
    assumptions: [
      "Federal direct tax (DBG) only. Cantonal/communal tax not modeled (varies significantly by canton).",
      `AHV/IV/EO: 5.3% on full salary. ALV: 1.1% on salary up to CHF ${CH_SOCIAL_SECURITY_2026.alvMaxAnnualSalary.toLocaleString()}/year.`,
      "Pension fund (BVG) contributions not modeled.",
      "Married rate, child deductions, and pillar 3a contributions not modeled.",
    ],
    sourceUrls: ["https://www.estv.admin.ch"],
  };

  return {
    country: "CH", currency: "CHF", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const CHCalculator: CountryCalculator = {
  countryCode: "CH", config: CH_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CH") throw new Error("CHCalculator can only calculate CH inputs");
    return calculateCH(inputs as CHCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): CHCalculatorInputs {
    return { country: "CH", grossSalary: 90_000, payFrequency: "monthly", contributions: {} };
  },
};
