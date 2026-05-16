import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  PHBreakdown,
  PHCalculatorInputs,
  PHTaxBreakdown,
  RegionInfo,
} from "../types";
import { PH_CONFIG } from "./config";
import {
  calculatePHProgressiveTax,
  PH_PAGIBIG_2026,
  PH_PHILHEALTH_2026,
  PH_SSS_2026,
} from "./constants/tax-parameters-2026";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateSSS(monthlySalary: number) {
  const msc = Math.max(
    PH_SSS_2026.minMsc,
    Math.min(monthlySalary, PH_SSS_2026.maxMsc)
  );
  const monthly = roundCurrency(msc * PH_SSS_2026.employeeRate);

  return {
    rate: PH_SSS_2026.employeeRate,
    employee: monthly * 12,
    msc,
    minMsc: PH_SSS_2026.minMsc,
    maxMsc: PH_SSS_2026.maxMsc,
  };
}

function calculatePhilHealth(monthlySalary: number) {
  const monthlyBase = Math.max(
    PH_PHILHEALTH_2026.monthlyFloor,
    Math.min(monthlySalary, PH_PHILHEALTH_2026.monthlyCeiling)
  );
  // PhilHealth premium is shared equally - employee pays 2.5%
  const monthly = roundCurrency(monthlyBase * PH_PHILHEALTH_2026.employeeRate);

  return {
    rate: PH_PHILHEALTH_2026.employeeRate,
    employee: monthly * 12,
    monthlyBase,
    floor: PH_PHILHEALTH_2026.monthlyFloor,
    ceiling: PH_PHILHEALTH_2026.monthlyCeiling,
  };
}

function calculatePagIbig(monthlySalary: number) {
  const mfs = Math.min(monthlySalary, PH_PAGIBIG_2026.mfsCeiling);
  const monthly = roundCurrency(mfs * PH_PAGIBIG_2026.employeeRate);

  return {
    rate: PH_PAGIBIG_2026.employeeRate,
    employee: monthly * 12,
    mfs,
    ceiling: PH_PAGIBIG_2026.mfsCeiling,
  };
}

export function calculatePH(inputs: PHCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const monthlySalary = grossSalary / 12;

  const sss = calculateSSS(monthlySalary);
  const philHealth = calculatePhilHealth(monthlySalary);
  const pagIbig = calculatePagIbig(monthlySalary);

  const totalMandatoryContributions =
    sss.employee + philHealth.employee + pagIbig.employee;

  // Taxable income = gross salary - mandatory contributions
  const taxableIncome = Math.max(
    0,
    grossSalary - totalMandatoryContributions
  );

  const taxResult = calculatePHProgressiveTax(taxableIncome);

  const taxes: PHTaxBreakdown = {
    totalIncomeTax: taxResult.totalTax + totalMandatoryContributions,
    incomeTax: taxResult.totalTax,
    sssEmployee: sss.employee,
    philHealthEmployee: philHealth.employee,
    pagIbigEmployee: pagIbig.employee,
  };

  const totalTax =
    taxResult.totalTax +
    sss.employee +
    philHealth.employee +
    pagIbig.employee;
  const netSalary = grossSalary - totalTax;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: PHBreakdown = {
    type: "PH",
    grossIncome: grossSalary,
    taxableIncome,
    sss,
    philHealth,
    pagIbig,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "PH",
    currency: "PHP",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const PHCalculator: CountryCalculator = {
  countryCode: "PH",
  config: PH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PH") {
      throw new Error("PHCalculator can only calculate PH inputs");
    }
    return calculatePH(inputs as PHCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): PHCalculatorInputs {
    return {
      country: "PH",
      grossSalary: 600_000,
      payFrequency: "monthly",
    };
  },
};
