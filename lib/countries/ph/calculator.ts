import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
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
  PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026,
  PH_PERA_MAX_TAX_CREDIT_2026,
  PH_PERA_TAX_CREDIT_RATE,
} from "./constants/tax-parameters-2026";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { clampAmount } from "@/lib/utils";

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

  const peraContribution = clampAmount(
    inputs.contributions?.peraContribution,
    PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026,
  );
  const peraTaxCredit = Math.min(
    peraContribution * PH_PERA_TAX_CREDIT_RATE,
    PH_PERA_MAX_TAX_CREDIT_2026,
  );

  const taxResult = calculatePHProgressiveTax(taxableIncome);
  const incomeTaxAfterPera = Math.max(0, taxResult.totalTax - peraTaxCredit);

  const taxes: PHTaxBreakdown = {
    type: "PH",
    totalIncomeTax: taxResult.totalTax + totalMandatoryContributions,
    incomeTax: incomeTaxAfterPera,
    sssEmployee: sss.employee,
    philHealthEmployee: philHealth.employee,
    pagIbigEmployee: pagIbig.employee,
  };

  const totalTax =
    incomeTaxAfterPera +
    sss.employee +
    philHealth.employee +
    pagIbig.employee;
  const netSalary = grossSalary - totalTax - peraContribution;
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
    voluntaryContributions: {
      peraContribution,
      peraTaxCredit,
      total: peraContribution,
    },
  };

  return {
    country: "PH",
    currency: "PHP",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax + peraContribution,
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
    return {
      peraContribution: {
        limit: PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026,
        name: "PERA contribution",
        description: "5% income tax credit on contributions (max PHP 10,000 credit)",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): PHCalculatorInputs {
    return {
      country: "PH",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: { peraContribution: 0 },
    };
  },
};
