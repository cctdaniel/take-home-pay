import type { CalculationResult, CalculatorInputs, ContributionLimits, CountryCalculator, PayFrequency, RegionInfo } from "../types";
import { RO_CONFIG } from "./config";
import { RO_INCOME_TAX_RATE, RO_SOCIAL_SECURITY_2026 } from "./constants/tax-year-2026";
import type { ROBreakdown, ROCalculatorInputs, ROTaxBreakdown } from "./types";

function getPeriodsPerYear(freq: PayFrequency): number {
  switch (freq) { case "annual": return 1; case "monthly": return 12; case "biweekly": return 26; case "weekly": return 52; }
}
function r(v: number): number { return Math.round(v * 100) / 100; }

export function calculateRO(inputs: ROCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, hasHigherEducation } = inputs;
  // Pension can be waived for employees with higher education in certain conditions
  const pensionRate = hasHigherEducation ? 0 : RO_SOCIAL_SECURITY_2026.employeePensionRate;
  const healthRate = RO_SOCIAL_SECURITY_2026.employeeHealthRate;
  const socialEmployee = r(grossSalary * (pensionRate + healthRate));
  const taxableIncome = Math.max(0, grossSalary - socialEmployee);
  const incomeTax = r(taxableIncome * RO_INCOME_TAX_RATE);

  const taxes: ROTaxBreakdown = {
    type: "RO", totalIncomeTax: incomeTax, incomeTax,
    socialSecurityEmployee: r(grossSalary * pensionRate),
    healthInsuranceEmployee: r(grossSalary * healthRate),
  };
  const totalTax = incomeTax + socialEmployee;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: ROBreakdown = {
    type: "RO", grossIncome: grossSalary, taxableIncome, incomeTaxRate: RO_INCOME_TAX_RATE, incomeTax,
    socialSecurity: {
      employee: r(grossSalary * pensionRate),
      employeeRate: pensionRate,
      employerRate: RO_SOCIAL_SECURITY_2026.employerPensionRate,
    },
    healthInsurance: {
      employee: r(grossSalary * healthRate),
      employeeRate: healthRate,
    },
    workInsurance: {
      employeeRate: RO_SOCIAL_SECURITY_2026.employeeWorkInsuranceRate,
      employee: r(grossSalary * RO_SOCIAL_SECURITY_2026.employeeWorkInsuranceRate),
    },
    totalEmployeeContributions: socialEmployee,
    assumptions: [
      "Flat 10% income tax on taxable income (gross minus social contributions).",
      `CAS pension 25% employee${hasHigherEducation ? " (waived for higher education)" : ""}, CASS health 10% employee.`,
      "CAM work insurance 2.25% is employer-only.",
      "Employer contributions shown for reference only.",
    ],
    sourceUrls: ["https://www.anaf.ro", "https://www.cnpp.ro"],
  };

  return {
    country: "RO", currency: "RON", grossSalary, taxableIncome, taxes, totalTax,
    totalDeductions: totalTax, netSalary: grossSalary - totalTax,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: { gross: grossSalary / periodsPerYear, net: (grossSalary - totalTax) / periodsPerYear, frequency: payFrequency },
    breakdown,
  };
}

export const ROCalculator: CountryCalculator = {
  countryCode: "RO", config: RO_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "RO") throw new Error("ROCalculator can only calculate RO inputs");
    return calculateRO(inputs as ROCalculatorInputs);
  },
  getRegions(): RegionInfo[] { return []; },
  getContributionLimits(): ContributionLimits { return {}; },
  getDefaultInputs(): ROCalculatorInputs {
    return { country: "RO", grossSalary: 72_000, payFrequency: "monthly", hasHigherEducation: false, contributions: {} };
  },
};
