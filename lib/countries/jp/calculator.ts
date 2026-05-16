import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  JPBreakdown,
  JPCalculatorInputs,
  JPTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { JP_CONFIG } from "./config";
import {
  calculateJPEmploymentIncomeDeduction,
  calculateJPProgressiveTax,
  JP_BASIC_DEDUCTION,
  JP_RECONSTRUCTION_SURTAX_RATE,
  JP_RESIDENT_TAX_PER_CAPITA,
  JP_RESIDENT_TAX_RATE,
  JP_SOCIAL_INSURANCE_2026,
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
  return Math.round(value);
}

function calculateJPSocialInsurance(monthlySalary: number) {
  const si = JP_SOCIAL_INSURANCE_2026;
  const pensionBase = Math.max(
    si.pension.minMonthlyBase,
    Math.min(monthlySalary, si.pension.monthlyCeiling)
  );
  const healthBase = Math.min(monthlySalary, si.health.monthlyCeiling);

  const monthlyPension = roundCurrency(pensionBase * si.pension.employeeRate);
  const monthlyHealth = roundCurrency(healthBase * si.health.employeeRate);
  const monthlyEmployment = roundCurrency(
    monthlySalary * si.employment.employeeRate
  );

  return {
    pension: {
      rate: si.pension.employeeRate,
      employee: monthlyPension * 12,
      monthlyCeiling: si.pension.monthlyCeiling,
    },
    health: {
      rate: si.health.employeeRate,
      employee: monthlyHealth * 12,
      monthlyCeiling: si.health.monthlyCeiling,
    },
    employment: {
      rate: si.employment.employeeRate,
      employee: monthlyEmployment * 12,
    },
    total: (monthlyPension + monthlyHealth + monthlyEmployment) * 12,
  };
}

export function calculateJP(inputs: JPCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;
  const monthlySalary = grossSalary / 12;

  const employmentDeduction =
    calculateJPEmploymentIncomeDeduction(grossSalary);
  const socialInsurance = calculateJPSocialInsurance(monthlySalary);

  // Taxable income for national tax: gross - employment deduction - social insurance - basic deduction
  const taxableIncome = Math.max(
    0,
    Math.round(
      grossSalary -
        employmentDeduction -
        socialInsurance.total -
        JP_BASIC_DEDUCTION
    )
  );

  const taxResult = calculateJPProgressiveTax(taxableIncome);
  const reconstructionSurtax = Math.round(
    taxResult.totalTax * JP_RECONSTRUCTION_SURTAX_RATE
  );

  // Resident tax calculation: 10% of previous year's income (approximated using same taxable base)
  // Resident tax base = taxable income + basic deduction (since it's based on income after employment deduction - social insurance)
  const residentTaxBase = Math.max(0, taxableIncome);
  const residentTax = Math.max(
    0,
    Math.round(residentTaxBase * JP_RESIDENT_TAX_RATE) + JP_RESIDENT_TAX_PER_CAPITA
  );

  const taxes: JPTaxBreakdown = {
    totalIncomeTax:
      taxResult.totalTax + reconstructionSurtax + residentTax,
    incomeTax: taxResult.totalTax,
    reconstructionSurtax,
    residentTax,
    pensionInsurance: socialInsurance.pension.employee,
    healthInsurance: socialInsurance.health.employee,
    employmentInsurance: socialInsurance.employment.employee,
  };

  const totalTax =
    taxes.incomeTax +
    taxes.reconstructionSurtax +
    taxes.residentTax +
    taxes.pensionInsurance +
    taxes.healthInsurance +
    taxes.employmentInsurance;
  const netSalary = grossSalary - totalTax;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: JPBreakdown = {
    type: "JP",
    grossIncome: grossSalary,
    employmentIncomeDeduction: employmentDeduction,
    basicDeduction: JP_BASIC_DEDUCTION,
    socialInsuranceDeduction: socialInsurance.total,
    taxableIncome,
    nationalIncomeTax: taxResult.totalTax,
    reconstructionSurtax,
    residentTax,
    socialInsurance,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "JP",
    currency: "JPY",
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

export const JPCalculator: CountryCalculator = {
  countryCode: "JP",
  config: JP_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "JP") {
      throw new Error("JPCalculator can only calculate JP inputs");
    }
    return calculateJP(inputs as JPCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): JPCalculatorInputs {
    return {
      country: "JP",
      grossSalary: 6_000_000,
      payFrequency: "monthly",
    };
  },
};
