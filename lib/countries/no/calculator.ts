import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { NO_CONFIG } from "./config";
import { NO_IPS_DEDUCTION_LIMIT, NO_TAX_CONFIG } from "./constants/tax-year-2026";
import type { NOBreakdown, NOCalculatorInputs, NOTaxBreakdown } from "./types";

export function calculateNO(inputs: NOCalculatorInputs): CalculationResult {
  const ipsContribution = Math.min(
    Math.max(0, inputs.contributions.ipsContribution),
    NO_IPS_DEDUCTION_LIMIT,
    inputs.grossSalary,
  );
  const computation = calculateNordicTax(inputs.grossSalary, {
    ...NO_TAX_CONFIG,
    standardDeduction: NO_TAX_CONFIG.standardDeduction + ipsContribution,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(
    inputs.grossSalary - computation.totalTax - ipsContribution,
  );

  const taxes: NOTaxBreakdown = {
    type: "NO",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: NOBreakdown = {
    type: "NO",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: NO_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: NO_TAX_CONFIG.employeeSocialRate,
  const bracketTax = calculateProgressiveTax(grossSalary, NO_TAX_CONFIG.brackets);
  const ordinaryIncomeTax = NO_TAX_CONFIG.flatTaxRate
  const incomeTaxBeforeCredits = ordinaryIncomeTax + bracketTax.tax;
    bracketTaxes: bracketTax.details,
    sourceUrls: NO_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      ipsContribution,
      ipsDeductionApplied: ipsContribution,
      ipsDeductionLimit: NO_IPS_DEDUCTION_LIMIT,
    },
  };

  return {
    country: "NO",
    currency: "NOK",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax + ipsContribution,
    netSalary,
    effectiveTaxRate: inputs.grossSalary > 0 ? computation.totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const NOCalculator: CountryCalculator = {
  countryCode: "NO",
  config: NO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NO") {
      throw new Error("NOCalculator can only calculate NO inputs");
    }

    return calculateNO(inputs as NOCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      ipsContribution: {
        limit: NO_IPS_DEDUCTION_LIMIT,
        name: "IPS pension savings",
        description: "Individual pension savings (IPS) deduction limit",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): NOCalculatorInputs {
    return {
      country: "NO",
      grossSalary: 700_000,
      payFrequency: "monthly",
      contributions: {
        ipsContribution: 0,
      },
    };
  },
};
