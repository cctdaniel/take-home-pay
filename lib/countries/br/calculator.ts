import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { BR_CONFIG } from "./config";
import {
  BR_DEPENDENT_DEDUCTION_MONTHLY,
  BR_INSS_MONTHLY_CEILING,
  BR_PRIVATE_PENSION_DEDUCTION_RATE,
  BR_SOURCE_URLS,
  calculateBrazilInssMonthly,
  calculateBrazilIrpfMonthly,
} from "./constants/tax-year-2026";
import type { BRBreakdown, BRCalculatorInputs, BRTaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function getPrivatePensionLimit(grossIncome: number): number {
  return Math.max(0, grossIncome) * BR_PRIVATE_PENSION_DEDUCTION_RATE;
}

export function calculateBR(inputs: BRCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const dependents = Math.max(0, Math.floor(inputs.numberOfDependents));
  const privatePensionLimit = getPrivatePensionLimit(grossIncome);
  const privatePension = clampAmount(
    inputs.contributions?.privatePension,
    privatePensionLimit,
  );
  const privatePensionMonthly = privatePension / 12;
  const monthlyGross = grossIncome / 12;
  const inssMonthly = calculateBrazilInssMonthly(monthlyGross);
  const inssAnnual = roundCurrency(inssMonthly * 12);
  const dependentDeductionMonthly =
    dependents * BR_DEPENDENT_DEDUCTION_MONTHLY;
  const monthlyTaxable = Math.max(
    0,
    monthlyGross -
      inssMonthly -
      dependentDeductionMonthly -
      privatePensionMonthly,
  );
  const irpfMonthly = calculateBrazilIrpfMonthly(monthlyTaxable);
  const incomeTax = roundCurrency(irpfMonthly * 12);
  const dependentDeductionAnnual = roundCurrency(
    dependentDeductionMonthly * 12,
  );
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - inssAnnual - dependentDeductionAnnual),
  );

  const taxes: BRTaxBreakdown = {
    type: "BR",
    totalIncomeTax: incomeTax,
    incomeTax,
    inssEmployee: inssAnnual,
  };
  const totalTax = incomeTax + inssAnnual;
  const totalDeductions = totalTax + privatePension;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BRBreakdown = {
    type: "BR",
    grossIncome,
    numberOfDependents: dependents,
    dependentDeductionAnnual,
    inss: {
      monthly: inssMonthly,
      annual: inssAnnual,
      monthlyCeiling: BR_INSS_MONTHLY_CEILING,
    },
    irpf: {
      monthlyTaxable,
      monthlyTax: irpfMonthly,
      annual: incomeTax,
    },
    taxableIncome,
    voluntaryContributions: {
      privatePension,
      privatePensionLimit,
      total: privatePension,
    },
    assumptions: [
      "IRPF uses the 2025 monthly progressive table applied to monthly taxable salary.",
      "INSS employee contributions use 2025 progressive bands with a monthly ceiling.",
      "Dependent deductions use R$189.59/month per dependent.",
      "Private pension (PGBL/VGBL) deductible up to 12% of gross annual income.",
    ],
    sourceUrls: Object.values(BR_SOURCE_URLS),
  };

  return {
    country: "BR",
    currency: "BRL",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const BRCalculator: CountryCalculator = {
  countryCode: "BR",
  config: BR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BR") {
      throw new Error("BRCalculator can only calculate BR inputs");
    }
    return calculateBR(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: BRCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 120_000;
    return {
      privatePension: {
        limit: getPrivatePensionLimit(gross),
        name: "Private pension (PGBL/VGBL)",
        description: "Deductible previdência privada up to 12% of gross income",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): BRCalculatorInputs {
    return {
      country: "BR",
      grossSalary: 120_000,
      payFrequency: "monthly",
      numberOfDependents: 0,
      contributions: {
        privatePension: 0,
      },
    };
  },
};
