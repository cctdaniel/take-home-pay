import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { TR_CONFIG } from "./config";
import { TR_SOCIAL_SECURITY_2026, calculateTRProgressiveTax } from "./constants/tax-year-2026";
import type { TRBreakdown, TRCalculatorInputs, TRTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateTR(inputs: TRCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const maxAnnualBase = TR_SOCIAL_SECURITY_2026.maxMonthlyBase * 12;
  const ssSalary = clampAmount(grossSalary, maxAnnualBase);
  const socialEmployee = r(ssSalary * TR_SOCIAL_SECURITY_2026.employeeSSIRate);
  const unemploymentEmployee = r(ssSalary * TR_SOCIAL_SECURITY_2026.employeeUnemploymentRate);
  const taxableIncome = Math.max(0, grossSalary - socialEmployee - unemploymentEmployee);
  const { totalTax: grossTax, bracketTaxes } = calculateTRProgressiveTax(taxableIncome);
  const incomeTax = r(grossTax);

  const taxes: TRTaxBreakdown = {
    type: "TR", totalIncomeTax: incomeTax, incomeTax,
    socialSecurityEmployee: socialEmployee,
    unemploymentInsuranceEmployee: unemploymentEmployee,
  };
  const totalTax = incomeTax + socialEmployee + unemploymentEmployee;
  const periodsPerYear = g(payFrequency);

  const breakdown: TRBreakdown = {
    type: "TR", grossIncome: grossSalary, taxableIncome,
    bracketTaxes: bracketTaxes.map(b => ({ ...b, tax: r(b.tax) })),
    incomeTax,
    socialSecurity: { employee: socialEmployee, employeeRate: TR_SOCIAL_SECURITY_2026.employeeSSIRate },
    unemploymentInsurance: { employee: unemploymentEmployee, employeeRate: TR_SOCIAL_SECURITY_2026.employeeUnemploymentRate },
    assumptions: [
      "Progressive tax rates: 15% up to TRY 158K, 20% up to 330K, 27% up to 1.2M, 35% up to 4.3M, 40% above.",
      `SSI (SGK) 14% employee + 1% unemployment on salary up to TRY ${TR_SOCIAL_SECURITY_2026.maxMonthlyBase.toLocaleString()}/month.`,
    ],
    sourceUrls: ["https://www.gib.gov.tr", "https://www.sgk.gov.tr"],
  };

  return {
    country: "TR", currency: "TRY", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const TRCalculator: CountryCalculator = {
  countryCode: "TR", config: TR_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "TR") throw new Error("TRCalculator can only calculate TR inputs");
    return calculateTR(inputs as TRCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): TRCalculatorInputs {
    return { country: "TR", grossSalary: 420_000, payFrequency: "monthly", contributions: {} };
  },
};
