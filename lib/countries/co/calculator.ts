import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { CO_CONFIG } from "./config";
import {
  CO_HEALTH_EMPLOYEE_RATE,
  CO_PENSION_EMPLOYEE_RATE,
  CO_PIT_BRACKETS_2026,
  CO_SOLIDARITY_EMPLOYEE_RATE,
  CO_SOURCE_URLS,
  CO_UVT_2026,
  CO_VOLUNTARY_COMBINED_UVT_CAP,
  CO_VOLUNTARY_INCOME_RATE_CAP,
} from "./constants/tax-year-2026";
import type { COBreakdown, COCalculatorInputs, COTaxBreakdown } from "./types";

export function getColombiaVoluntaryCombinedLimit(grossIncome: number): number {
  return Math.min(
    grossIncome * CO_VOLUNTARY_INCOME_RATE_CAP,
    CO_VOLUNTARY_COMBINED_UVT_CAP * CO_UVT_2026,
  );
}

export function normalizeColombiaVoluntaryContributions(
  grossIncome: number,
  contributions: COCalculatorInputs["contributions"],
) {
  const combinedLimit = getColombiaVoluntaryCombinedLimit(grossIncome);
  const afcSavings = clampAmount(contributions?.afcSavings, combinedLimit);
  const voluntaryPension = clampAmount(
    contributions?.voluntaryPension,
    Math.max(0, combinedLimit - afcSavings),
  );
  return { afcSavings, voluntaryPension, combinedLimit, total: afcSavings + voluntaryPension };
}

export function calculateCO(inputs: COCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const voluntary = normalizeColombiaVoluntaryContributions(grossIncome, inputs.contributions);
  const pension = roundCurrency(grossIncome * CO_PENSION_EMPLOYEE_RATE);
  const health = roundCurrency(grossIncome * CO_HEALTH_EMPLOYEE_RATE);
  const solidarity = roundCurrency(grossIncome * CO_SOLIDARITY_EMPLOYEE_RATE);
  const mandatoryTotal = pension + health + solidarity;
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - mandatoryTotal - voluntary.total),
  );
  const progressive = calculateProgressiveTax(taxableIncome, CO_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: COTaxBreakdown = {
    type: "CO",
    totalIncomeTax: incomeTax,
    incomeTax,
    pension,
    health,
    solidarity,
  };
  const totalTax = incomeTax + mandatoryTotal;
  const totalDeductions = totalTax + voluntary.total;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: COBreakdown = {
    type: "CO",
    grossIncome,
    mandatoryContributions: {
      pensionRate: CO_PENSION_EMPLOYEE_RATE,
      healthRate: CO_HEALTH_EMPLOYEE_RATE,
      solidarityRate: CO_SOLIDARITY_EMPLOYEE_RATE,
      total: mandatoryTotal,
    },
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      afcSavings: voluntary.afcSavings,
      voluntaryPension: voluntary.voluntaryPension,
      combinedLimit: voluntary.combinedLimit,
      total: voluntary.total,
    },
    assumptions: [
      "Employee pension 4%, health 4%, solidarity 1% on gross.",
      "AFC and voluntary pension exempt up to 30% of labor income and 3,800 UVT combined.",
      "Simplified UVT progressive withholding; excludes 25% renta exenta and 40% global cap detail.",
    ],
    sourceUrls: Object.values(CO_SOURCE_URLS),
  };

  return {
    country: "CO",
    currency: "COP",
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

export const COCalculator: CountryCalculator = {
  countryCode: "CO",
  config: CO_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CO") throw new Error("COCalculator can only calculate CO inputs");
    return calculateCO(inputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = Math.max(0, (inputs as COCalculatorInputs | undefined)?.grossSalary ?? 120_000_000);
    const limit = getColombiaVoluntaryCombinedLimit(gross);
    return {
      afcSavings: {
        limit,
        name: "AFC savings",
        description: "Exempt AFC deposits sharing a combined cap with voluntary pension.",
        preTax: true,
      },
      voluntaryPension: {
        limit,
        name: "Voluntary pension",
        description: "Private pension contributions sharing AFC combined cap (30% income, 3,800 UVT).",
        preTax: true,
      },
    };
  },
  getDefaultInputs(): COCalculatorInputs {
    return {
      country: "CO",
      grossSalary: 120_000_000,
      payFrequency: "monthly",
      contributions: { afcSavings: 0, voluntaryPension: 0 },
    };
  },
};
