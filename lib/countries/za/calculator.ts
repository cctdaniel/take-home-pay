import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { ZA_CONFIG } from "./config";
import { ZA_TAX_REBATES_2026, ZA_UIF_2026, calculateZAProgressiveTax } from "./constants/tax-year-2026";
import type { ZABreakdown, ZACalculatorInputs, ZATaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

function g(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateZA(inputs: ZACalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, age } = inputs;
  const uifSalary = clampAmount(grossSalary, ZA_UIF_2026.maxAnnualEarnings);
  const uifEmployee = r(uifSalary * ZA_UIF_2026.employeeRate);
  const taxableIncome = grossSalary;
  const { totalTax: grossTax, bracketTaxes } = calculateZAProgressiveTax(taxableIncome);
  // Tax rebates
  let rebate = ZA_TAX_REBATES_2026.primary;
  if (age >= ZA_TAX_REBATES_2026.tertiaryAgeThreshold) {
    rebate += ZA_TAX_REBATES_2026.tertiary;
  }
  if (age >= ZA_TAX_REBATES_2026.secondaryAgeThreshold) {
    rebate += ZA_TAX_REBATES_2026.secondary;
  }
  const incomeTax = r(Math.max(0, grossTax - rebate));

  const taxes: ZATaxBreakdown = { type: "ZA", totalIncomeTax: incomeTax, incomeTax, uifEmployee };
  const totalTax = incomeTax + uifEmployee;
  const periodsPerYear = g(payFrequency);

  const breakdown: ZABreakdown = {
    type: "ZA", grossIncome: grossSalary, taxableIncome, taxRebate: rebate,
    bracketTaxes: bracketTaxes.map(b => ({ ...b, tax: r(b.tax) })),
    incomeTax,
    uif: { employee: uifEmployee, employeeRate: ZA_UIF_2026.employeeRate, maxAnnualEarnings: ZA_UIF_2026.maxAnnualEarnings },
    assumptions: [
      "Progressive tax brackets from 18% to 45%.",
      `Primary tax rebate: R${ZA_TAX_REBATES_2026.primary.toLocaleString()}${age >= 65 ? ", secondary rebate applied" : ""}${age >= 75 ? ", tertiary rebate applied" : ""}.`,
      `UIF 1% on earnings up to R${ZA_UIF_2026.maxAnnualEarnings.toLocaleString()}/year.`,
    ],
    sourceUrls: ["https://www.sars.gov.za"],
  };

  return {
    country: "ZA", currency: "ZAR", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const ZACalculator: CountryCalculator = {
  countryCode: "ZA", config: ZA_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "ZA") throw new Error("ZACalculator can only calculate ZA inputs");
    return calculateZA(inputs as ZACalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): ZACalculatorInputs {
    return { country: "ZA", grossSalary: 360_000, payFrequency: "monthly", age: 35, contributions: {} };
  },
};
