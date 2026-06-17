import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampCount } from "@/lib/utils";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { CR_CONFIG } from "./config";
import {
  CR_CCSS_EMPLOYEE_RATE,
  CR_CHILD_TAX_CREDIT_MONTHLY_2026,
  CR_MAX_DEPENDENT_CHILDREN,
  CR_MONTHLY_PIT_BRACKETS_2026,
  CR_SOURCE_URLS,
  CR_SPOUSE_TAX_CREDIT_MONTHLY_2026,
} from "./constants/tax-year-2026";
import type { CRBreakdown, CRCalculatorInputs, CRTaxBreakdown } from "./types";

export function calculateCR(inputs: CRCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const dependentChildren = clampCount(
    inputs.dependentChildren,
    CR_MAX_DEPENDENT_CHILDREN,
  );
  const spouseCredit = clampCount(inputs.spouseCredit, 1);
  const monthlyGross = grossIncome / 12;
  const ccssEmployee = roundCurrency(grossIncome * CR_CCSS_EMPLOYEE_RATE);
  const progressive = calculateProgressiveTax(
    monthlyGross,
    CR_MONTHLY_PIT_BRACKETS_2026,
  );
  const monthlyTaxBeforeCredits = progressive.tax;
  const monthlyTaxCredits = roundCurrency(
    dependentChildren * CR_CHILD_TAX_CREDIT_MONTHLY_2026 +
      spouseCredit * CR_SPOUSE_TAX_CREDIT_MONTHLY_2026,
  );
  const monthlyIncomeTax = Math.max(0, monthlyTaxBeforeCredits - monthlyTaxCredits);
  const incomeTax = roundCurrency(monthlyIncomeTax * 12);
  const annualTaxCredits = roundCurrency(monthlyTaxCredits * 12);

  const taxes: CRTaxBreakdown = {
    type: "CR",
    totalIncomeTax: incomeTax,
    incomeTax,
    ccssEmployee,
  };
  const totalTax = incomeTax + ccssEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CRBreakdown = {
    type: "CR",
    grossIncome,
    monthlyGross,
    ccssEmployee,
    ccssRate: CR_CCSS_EMPLOYEE_RATE,
    monthlyTaxBeforeCredits,
    monthlyTaxCredits,
    annualTaxCredits,
    dependentChildren,
    spouseCredit,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee CCSS 10.83% (SEM 5.50%, IVM 4.33%, Banco Popular 1.00%) on gross.",
      "Monthly salary tax tariff applied to monthly gross, annualized after credits.",
      "Child and spouse monthly credits reduce withholding tax when eligible.",
      "Excludes other deductions, employer contributions, and special regimes.",
    ],
    sourceUrls: Object.values(CR_SOURCE_URLS),
  };

  return {
    country: "CR",
    currency: "CRC",
    grossSalary: grossIncome,
    taxableIncome: grossIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: grossIncome > 0 ? totalTax / grossIncome : 0,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const CRCalculator: CountryCalculator = {
  countryCode: "CR",
  config: CR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CR") {
      throw new Error("CRCalculator can only calculate CR inputs");
    }
    return calculateCR(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): CRCalculatorInputs {
    return {
      country: "CR",
      grossSalary: 8_244_000,
      payFrequency: "monthly",
      dependentChildren: 0,
      spouseCredit: 0,
      contributions: {},
    };
  },
};
