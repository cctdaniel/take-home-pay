import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  INBreakdown,
  INCalculatorInputs,
  INTaxBreakdown,
  RegionInfo,
} from "../types";
import { IN_CONFIG } from "./config";
import {
  calculateINProgressiveTax,
  calculateINRebate,
  calculateINSurcharge,
  IN_CESS_RATE,
  IN_EPF_2026,
  IN_STANDARD_DEDUCTION_NEW_REGIME,
  IN_NPS_80CCD1B_ANNUAL_CAP_2026,
  IN_STANDARD_DEDUCTION_OLD_REGIME,
} from "./constants/tax-parameters-2026";
import { getPeriodsPerYear } from "../calculator-utils";
import { clampAmount } from "@/lib/utils";

function roundCurrency(value: number): number {
  return Math.round(value);
}

function calculateEPF(grossSalary: number, isApplicable: boolean) {
  if (!isApplicable) {
    return {
      rate: 0,
      employee: 0,
      ceiling: IN_EPF_2026.monthlyWageCeiling,
      monthlyBase: 0,
    };
  }

  const monthlySalary = grossSalary / 12;
  const monthlyBase = Math.min(monthlySalary, IN_EPF_2026.monthlyWageCeiling);
  const employee = roundCurrency(monthlyBase * IN_EPF_2026.employeeRate * 12);

  return {
    rate: IN_EPF_2026.employeeRate,
    employee,
    ceiling: IN_EPF_2026.monthlyWageCeiling,
    monthlyBase,
  };
}

export function calculateIN(inputs: INCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, regime, isEpfApplicable } = inputs;

  const standardDeduction =
    regime === "new"
      ? IN_STANDARD_DEDUCTION_NEW_REGIME
      : IN_STANDARD_DEDUCTION_OLD_REGIME;

  const epf = calculateEPF(grossSalary, isEpfApplicable);
  const nps80ccd1b =
    regime === "old"
      ? clampAmount(inputs.contributions?.nps80ccd1b, IN_NPS_80CCD1B_ANNUAL_CAP_2026)
      : 0;

  // Taxable income = gross - standard deduction
  // Note: EPF contribution is deducted from salary but does not reduce taxable income under new regime
  const taxableIncomeBase = Math.max(0, grossSalary - standardDeduction - nps80ccd1b);
  const taxableIncome = Math.round(taxableIncomeBase);

  const taxResult = calculateINProgressiveTax(taxableIncome, regime);
  const grossTax = taxResult.totalTax;

  // 87A rebate
  const rebate = calculateINRebate(taxableIncome, grossTax, regime);
  const taxAfterRebate = Math.max(0, grossTax - rebate);

  // Surcharge
  const surcharge = calculateINSurcharge(taxableIncome, taxAfterRebate);

  // Cess (4% on tax + surcharge)
  const cess = Math.round((taxAfterRebate + surcharge) * IN_CESS_RATE);

  const totalIncomeTax = taxAfterRebate + surcharge + cess;

  const taxes: INTaxBreakdown = {
    type: "IN",
    totalIncomeTax,
    incomeTax: taxAfterRebate,
    surcharge,
    cess,
    epfEmployee: epf.employee,
  };

  const totalTax = totalIncomeTax + epf.employee;
  const netSalary = grossSalary - totalTax - nps80ccd1b;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: INBreakdown = {
    type: "IN",
    grossIncome: grossSalary,
    regime,
    standardDeduction,
    taxableIncome,
    grossTax,
    rebateUnder87A: rebate,
    surcharge,
    cess,
    epf,
    bracketTaxes: taxResult.bracketTaxes,
    voluntaryContributions: {
      nps80ccd1b,
      nps80ccd1bLimit: IN_NPS_80CCD1B_ANNUAL_CAP_2026,
      total: nps80ccd1b,
    },
  };

  return {
    country: "IN",
    currency: "INR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax + nps80ccd1b,
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

export const INCalculator: CountryCalculator = {
  countryCode: "IN",
  config: IN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IN") {
      throw new Error("INCalculator can only calculate IN inputs");
    }
    return calculateIN(inputs as INCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const regime = inputs && "regime" in inputs ? inputs.regime : "new";
    if (regime !== "old") {
      return {};
    }
    return {
      nps80ccd1b: {
        limit: IN_NPS_80CCD1B_ANNUAL_CAP_2026,
        name: "NPS Tier I (80CCD(1B))",
        description: "Additional NPS deduction — old tax regime only",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): INCalculatorInputs {
    return {
      country: "IN",
      grossSalary: 1_500_000,
      payFrequency: "monthly",
      regime: "new",
      isEpfApplicable: true,
      contributions: { nps80ccd1b: 0 },
    };
  },
};
