import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { clampAmount } from "@/lib/utils";
import { CL_CONFIG } from "./config";
import {
  CL_APV_REGIME_B_ANNUAL_CAP_2026,
  CL_AFP_EMPLOYEE_RATE,
  CL_HEALTH_EMPLOYEE_RATE,
  CL_PIT_BRACKETS_2026,
  CL_SOURCE_URLS,
  CL_UNEMPLOYMENT_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { CLBreakdown, CLCalculatorInputs, CLTaxBreakdown } from "./types";

export function calculateCL(inputs: CLCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const apvRegimeB = clampAmount(
    inputs.contributions?.apvRegimeB,
    CL_APV_REGIME_B_ANNUAL_CAP_2026,
  );
  const afp = roundCurrency(grossIncome * CL_AFP_EMPLOYEE_RATE);
  const health = roundCurrency(grossIncome * CL_HEALTH_EMPLOYEE_RATE);
  const unemployment = roundCurrency(grossIncome * CL_UNEMPLOYMENT_EMPLOYEE_RATE);
  const mandatoryTotal = afp + health + unemployment;
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - mandatoryTotal - apvRegimeB),
  );
  const progressive = calculateProgressiveTax(taxableIncome, CL_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: CLTaxBreakdown = {
    type: "CL",
    totalIncomeTax: incomeTax,
    incomeTax,
    afp,
    health,
    unemployment,
  };
  const totalTax = incomeTax + mandatoryTotal;
  const totalDeductions = totalTax + apvRegimeB;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CLBreakdown = {
    type: "CL",
    grossIncome,
    mandatoryContributions: {
      afpRate: CL_AFP_EMPLOYEE_RATE,
      healthRate: CL_HEALTH_EMPLOYEE_RATE,
      unemploymentRate: CL_UNEMPLOYMENT_EMPLOYEE_RATE,
      total: mandatoryTotal,
    },
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      apvRegimeB,
      apvRegimeBLimit: CL_APV_REGIME_B_ANNUAL_CAP_2026,
      total: apvRegimeB,
    },
    assumptions: [
      "AFP pension 10%, health 7%, unemployment 0.6% employee on gross salary.",
      "Simplified monthly SII table converted to annual progressive brackets on taxable income after mandatory deductions.",
      "Excludes APV voluntary pension, employer contributions, and regional credits.",
    ],
    sourceUrls: Object.values(CL_SOURCE_URLS),
  };

  return {
    country: "CL",
    currency: "CLP",
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

export const CLCalculator: CountryCalculator = {
  countryCode: "CL",
  config: CL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CL") {
      throw new Error("CLCalculator can only calculate CL inputs");
    }
    return calculateCL(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      apvRegimeB: {
        limit: CL_APV_REGIME_B_ANNUAL_CAP_2026,
        name: "APV Régimen B",
        description:
          "Voluntary pension savings deductible from income tax base up to 600 UF per year.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CLCalculatorInputs {
    return {
      country: "CL",
      grossSalary: 12_000_000,
      payFrequency: "monthly",
      contributions: { apvRegimeB: 0 },
    };
  },
};
