import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { BR_CONFIG } from "./config";
import { BR_INSS_2026, BR_SIMPLIFIED_DEDUCTION_LIMIT, BR_SIMPLIFIED_DEDUCTION_RATE, calculateBRINSS, calculateBRProgressiveTax } from "./constants/tax-year-2026";
import type { BRBreakdown, BRCalculatorInputs, BRTaxBreakdown } from "./types";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateBR(inputs: BRCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const monthlySalary = grossSalary / 12;
  // INSS calculated progressively per month
  const monthlyINSS = calculateBRINSS(monthlySalary);
  const annualINSS = r(monthlyINSS * 12);
  // Simplified deduction
  const simplifiedDeduction = Math.min(grossSalary * BR_SIMPLIFIED_DEDUCTION_RATE, BR_SIMPLIFIED_DEDUCTION_LIMIT);
  const taxableIncome = Math.max(0, grossSalary - Math.max(annualINSS, simplifiedDeduction));
  const { totalTax: grossTax, bracketTaxes } = calculateBRProgressiveTax(taxableIncome);
  const incomeTax = r(Math.max(0, grossTax));

  const taxes: BRTaxBreakdown = { type: "BR", totalIncomeTax: incomeTax, incomeTax, inssEmployee: annualINSS };
  const totalTax = incomeTax + annualINSS;
  const periodsPerYear = g(payFrequency);

  const breakdown: BRBreakdown = {
    type: "BR", grossIncome: grossSalary, taxableIncome, deductions: simplifiedDeduction,
    bracketTaxes: bracketTaxes.map(b => ({ ...b, tax: r(b.tax) })),
    incomeTax,
    inss: {
      employee: annualINSS,
      employeeRate: monthlySalary > 0 ? monthlyINSS / monthlySalary : 0,
      maxMonthlyBase: BR_INSS_2026.maxMonthlyBase,
    },
    assumptions: [
      "Progressive income tax: 0% up to R$27,110, 7.5%/15%/22.5%/27.5% for higher brackets.",
      "Simplified deduction: 20% of gross income (max R$16,754.34).",
      "INSS calculated progressively: 7.5%/9%/12%/14% up to R$8,157.41/month.",
    ],
    sourceUrls: ["https://www.gov.br/receitafederal"],
  };

  // Need to import BR_INSS_2026 for the maxMonthlyBase reference
  return {
    country: "BR", currency: "BRL", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const BRCalculator: CountryCalculator = {
  countryCode: "BR", config: BR_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BR") throw new Error("BRCalculator can only calculate BR inputs");
    return calculateBR(inputs as BRCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): BRCalculatorInputs {
    return { country: "BR", grossSalary: 60_000, payFrequency: "monthly", contributions: {} };
  },
};
