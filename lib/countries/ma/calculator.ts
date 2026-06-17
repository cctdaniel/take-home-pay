import { clampAmount, clampCount } from "@/lib/utils";
import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { MA_CONFIG } from "./config";
import {
  calculateMaDependentCredit,
  calculateMaProfessionalExpenseDeduction,
  calculateMaSocialContributions,
  MA_DEPENDENT_CREDIT_2026,
  MA_IR_BRACKETS_2026,
  MA_SOURCE_URLS,
  MA_SUPPLEMENTARY_PENSION_MAX_NET_SALARY_RATE,
} from "./constants/tax-year-2026";
import type { MABreakdown, MACalculatorInputs, MATaxBreakdown } from "./types";
import { roundCurrency } from "../calculator-utils";

function getSupplementaryPensionLimit(
  grossIncome: number,
  socialTotal: number,
  professionalExpenseDeduction: number,
): number {
  const netTaxableBeforePension = Math.max(
    0,
    grossIncome - socialTotal - professionalExpenseDeduction,
  );
  return roundCurrency(
    netTaxableBeforePension * MA_SUPPLEMENTARY_PENSION_MAX_NET_SALARY_RATE,
  );
}

export function calculateMA(inputs: MACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const dependents = clampCount(inputs.dependents, MA_DEPENDENT_CREDIT_2026.maxDependents);
  const socialInsurance = calculateMaSocialContributions(grossIncome);
  const professionalExpenseDeduction = calculateMaProfessionalExpenseDeduction(
    grossIncome,
    socialInsurance.total,
  );
  const supplementaryPensionLimit = getSupplementaryPensionLimit(
    grossIncome,
    socialInsurance.total,
    professionalExpenseDeduction,
  );
  const supplementaryPension = clampAmount(
    inputs.contributions?.supplementaryPension,
    supplementaryPensionLimit,
  );
  const taxableIncome = Math.max(
    0,
    grossIncome -
      socialInsurance.total -
      professionalExpenseDeduction -
      supplementaryPension,
  );
  const progressive = calculateProgressiveTax(taxableIncome, MA_IR_BRACKETS_2026);
  const grossIncomeTax = progressive.tax;
  const dependentCredit = calculateMaDependentCredit(dependents);
  const incomeTax = roundCurrency(Math.max(0, grossIncomeTax - dependentCredit));

  const taxes: MATaxBreakdown = {
    type: "MA",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance: socialInsurance.total,
  };
  const totalTax = roundCurrency(incomeTax + socialInsurance.total);
  const totalDeductions = roundCurrency(totalTax + supplementaryPension);
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: MABreakdown = {
    type: "MA",
    grossIncome,
    socialInsurance,
    professionalExpenseDeduction,
    dependents,
    dependentCredit,
    taxableIncome,
    grossIncomeTax,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      supplementaryPension,
      supplementaryPensionLimit,
      total: supplementaryPension,
    },
    assumptions: [
      "CNSS employee 4.48% capped at MAD 6,000/month plus AMO 2.26% uncapped.",
      "Professional expense deduction 20% of (gross − social), capped MAD 30,000/year.",
      "Supplementary retirement (e.g. CIMR) deductible up to 50% of net taxable salary.",
      "Dependent credit MAD 360/month per dependent (max 6).",
    ],
    sourceUrls: Object.values(MA_SOURCE_URLS),
  };

  return {
    country: "MA",
    currency: "MAD",
    grossSalary: grossIncome,
    taxableIncome,
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

export const MACalculator: CountryCalculator = {
  countryCode: "MA",
  config: MA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MA") {
      throw new Error("MACalculator can only calculate MA inputs");
    }
    return calculateMA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: MACalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 144_000;
    const socialInsurance = calculateMaSocialContributions(gross);
    const professionalExpenseDeduction = calculateMaProfessionalExpenseDeduction(
      gross,
      socialInsurance.total,
    );
    const limit = getSupplementaryPensionLimit(
      gross,
      socialInsurance.total,
      professionalExpenseDeduction,
    );
    return {
      supplementaryPension: {
        limit,
        name: "Supplementary retirement (CIMR)",
        description:
          "Employee supplementary pension contributions deductible up to 50% of net taxable salary.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): MACalculatorInputs {
    return {
      country: "MA",
      grossSalary: 144_000,
      payFrequency: "monthly",
      dependents: 0,
      contributions: { supplementaryPension: 0 },
    };
  },
};
