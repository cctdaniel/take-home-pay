import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { MU_CONFIG } from "./config";
import {
  MU_CSG_MONTHLY_THRESHOLD,
  MU_CSG_RATE_HIGH,
  MU_CSG_RATE_LOW,
  MU_FAIR_SHARE_MONTHLY_THRESHOLD,
  MU_FAIR_SHARE_RATE,
  MU_PAYE_BRACKETS_2026,
  MU_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { MUBreakdown, MUCalculatorInputs, MUTaxBreakdown } from "./types";

export function calculateMU(inputs: MUCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const monthlyGross = grossIncome / 12;
  const csgRate =
    monthlyGross <= MU_CSG_MONTHLY_THRESHOLD ? MU_CSG_RATE_LOW : MU_CSG_RATE_HIGH;
  const csgEmployee = roundCurrency(grossIncome * csgRate);
  const taxableIncome = Math.max(0, grossIncome - csgEmployee);
  const progressive = calculateProgressiveTax(taxableIncome, MU_PAYE_BRACKETS_2026);
  const payeTax = progressive.tax;
  const fairShareContribution =
    monthlyGross > MU_FAIR_SHARE_MONTHLY_THRESHOLD
      ? roundCurrency(
          MU_FAIR_SHARE_RATE *
            (monthlyGross - MU_FAIR_SHARE_MONTHLY_THRESHOLD) *
            12,
        )
      : 0;
  const incomeTax = roundCurrency(payeTax + fairShareContribution);

  const taxes: MUTaxBreakdown = {
    type: "MU",
    totalIncomeTax: incomeTax,
    incomeTax,
    payeTax,
    fairShareContribution,
    csgEmployee,
  };
  const totalTax = roundCurrency(incomeTax + csgEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: MUBreakdown = {
    type: "MU",
    grossIncome,
    csgEmployee,
    csgRate,
    taxableIncome,
    payeTax,
    fairShareContribution,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "CSG 1.5% when monthly gross is MUR 50,000 or below, otherwise 3%.",
      "PAYE on income after CSG: 0% first MUR 500,000, 10% next MUR 500,000, 20% above.",
      "Fair Share Contribution 15% on monthly emoluments above MUR 923,077 (MUR 12M/year).",
      "Solidarity Levy excluded; excludes employer NPF/NPS and expatriate-specific regimes.",
    ],
    sourceUrls: Object.values(MU_SOURCE_URLS),
  };

  return {
    country: "MU",
    currency: "MUR",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
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

export const MUCalculator: CountryCalculator = {
  countryCode: "MU",
  config: MU_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MU") {
      throw new Error("MUCalculator can only calculate MU inputs");
    }
    return calculateMU(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): MUCalculatorInputs {
    return {
      country: "MU",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
