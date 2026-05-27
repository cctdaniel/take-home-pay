import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { IL_CONFIG } from "./config";
import { calculateILBituachLeumi, calculateILProgressiveTax } from "./constants/tax-year-2026";
import type { ILBreakdown, ILCalculatorInputs, ILTaxBreakdown } from "./types";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateIL(inputs: ILCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const monthlySalary = grossSalary / 12;
  const { nationalInsurance, healthInsurance } = calculateILBituachLeumi(monthlySalary);
  const annualNI = r(nationalInsurance * 12);
  const annualHI = r(healthInsurance * 12);
  const taxableIncome = grossSalary;
  const { totalTax: grossTax, bracketTaxes } = calculateILProgressiveTax(taxableIncome);
  const incomeTax = r(grossTax);

  const taxes: ILTaxBreakdown = {
    type: "IL", totalIncomeTax: incomeTax, incomeTax,
    socialSecurityEmployee: annualNI,
    healthInsuranceEmployee: annualHI,
  };
  const totalTax = incomeTax + annualNI + annualHI;
  const periodsPerYear = g(payFrequency);

  const breakdown: ILBreakdown = {
    type: "IL", grossIncome: grossSalary, taxableIncome,
    bracketTaxes: bracketTaxes.map(b => ({ ...b, tax: r(b.tax) })),
    incomeTax,
    bituachLeumi: { employee: annualNI, employeeRate: monthlySalary > 0 ? nationalInsurance / monthlySalary : 0, maxMonthlyBase: 49_030 },
    healthInsurance: { employee: annualHI, employeeRate: monthlySalary > 0 ? healthInsurance / monthlySalary : 0, maxMonthlyBase: 49_030 },
    assumptions: [
      "Progressive tax: 10% up to ₪84,120, 14%/20%/31%/35%/47%/50% for higher brackets.",
      "Bituach Leumi: 0.4% up to ₪7,122/month, 7% above (max base ₪49,030).",
      "Health insurance: 3.1% up to ₪7,122/month, 5% above.",
    ],
    sourceUrls: ["https://www.gov.il/en/departments/topics/income-tax"],
  };

  return {
    country: "IL", currency: "ILS", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const ILCalculator: CountryCalculator = {
  countryCode: "IL", config: IL_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IL") throw new Error("ILCalculator can only calculate IL inputs");
    return calculateIL(inputs as ILCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): ILCalculatorInputs {
    return { country: "IL", grossSalary: 180_000, payFrequency: "monthly", contributions: {} };
  },
};
