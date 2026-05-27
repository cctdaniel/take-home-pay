import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { CH_CONFIG } from "./config";
import { CH_PILLAR_3A_MAX_2026, CH_SOCIAL_SECURITY_2026, CH_TOTAL_EMPLOYEE_SOCIAL_RATE, calculateCHFederalTax } from "./constants/tax-year-2026";
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
  // Pillar 3a voluntary deduction (deductible from taxable income)
  const pillar3a = clampAmount(inputs.contributions.pillar3a, CH_PILLAR_3A_MAX_2026);
  // Federal tax on taxable income (after social deductions and pillar 3a)
  const taxableIncome = Math.max(0, grossSalary - socialEmployee - pillar3a);
  const federalTax = r(calculateCHFederalTax(taxableIncome));
  const incomeTax = federalTax;

  const taxes: CHTaxBreakdown = { type: "CH", totalIncomeTax: incomeTax, incomeTax, socialSecurityEmployee: socialEmployee };
  const totalTax = incomeTax + socialEmployee;
  const totalDeductions = totalTax + pillar3a;
  const periodsPerYear = g(payFrequency);

  const breakdown: CHBreakdown = {
    type: "CH", grossIncome: grossSalary, taxableIncome,
    pillar3aDeduction: pillar3a,
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
      `Pillar 3a: up to CHF ${CH_PILLAR_3A_MAX_2026.toLocaleString()}/year deductible from taxable income.`,
      "Pension fund (BVG) contributions not modeled.",
      "Married rate and child deductions not modeled.",
    ],
    sourceUrls: ["https://www.estv.admin.ch"],
  };

  return {
    country: "CH", currency: "CHF", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions, netSalary: grossSalary - totalDeductions,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalDeductions) / periodsPerYear, frequency: payFrequency },
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
  getContributionLimits(): ContributionLimits {
    return {
      pillar3a: {
        limit: CH_PILLAR_3A_MAX_2026,
        name: "Pillar 3a",
        description: `Voluntary restricted pension savings. Contributions up to CHF ${CH_PILLAR_3A_MAX_2026.toLocaleString()}/year are deductible from taxable income. Only available to employed persons with a pension fund.`,
        preTax: true,
      },
    };
  },
  getDefaultInputs(): CHCalculatorInputs {
    return { country: "CH", grossSalary: 90_000, payFrequency: "monthly", contributions: { pillar3a: 0 } };
  },
};
