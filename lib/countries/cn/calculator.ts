import type {
  CalculationResult,
  CalculatorInputs,
  CNBreakdown,
  CNCalculatorInputs,
  CNTaxBreakdown,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { CN_CONFIG } from "./config";
import {
  calculateCNProgressiveTax,
  CN_HOUSING_FUND_2026,
  CN_SOCIAL_INSURANCE_2026,
  CN_SPECIAL_DEDUCTIONS_2026,
  CN_PRIVATE_PENSION_ANNUAL_CAP_2026,
  CN_STANDARD_DEDUCTION,
} from "./constants/tax-parameters-2026";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function calculateCNSocialInsurance(monthlyBase: number) {
  const si = CN_SOCIAL_INSURANCE_2026;
  const cappedBase = Math.min(monthlyBase, si.pension.monthlyCeiling);

  const pension = roundCurrency(cappedBase * si.pension.employeeRate);
  const medical = roundCurrency(cappedBase * si.medical.employeeRate);
  const unemployment = roundCurrency(cappedBase * si.unemployment.employeeRate);

  return {
    pension: {
      rate: si.pension.employeeRate,
      employee: pension * 12,
      ceiling: si.pension.monthlyCeiling,
    },
    medical: {
      rate: si.medical.employeeRate,
      employee: medical * 12,
      ceiling: si.medical.monthlyCeiling,
    },
    unemployment: {
      rate: si.unemployment.employeeRate,
      employee: unemployment * 12,
      ceiling: si.unemployment.monthlyCeiling,
    },
    total: (pension + medical + unemployment) * 12,
  };
}

function calculateHousingFund(monthlyBase: number, rate: number) {
  const clampedRate = Math.max(
    CN_HOUSING_FUND_2026.minRate,
    Math.min(CN_HOUSING_FUND_2026.maxRate, rate)
  );
  const cappedBase = Math.min(
    monthlyBase,
    CN_SOCIAL_INSURANCE_2026.pension.monthlyCeiling
  );
  const monthly = roundCurrency(cappedBase * clampedRate);

  return {
    rate: clampedRate,
    employee: monthly * 12,
    base: cappedBase,
  };
}

function calculateCNSpecialDeductions(inputs: CNCalculatorInputs) {
  const sd = inputs.specialDeductions;
  const rates = CN_SPECIAL_DEDUCTIONS_2026;

  const childrenMonthly =
    (sd.numberOfChildren || 0) * rates.childEducation +
    (sd.numberOfChildrenUnder3 || 0) * rates.childUnder3;

  const elderlyCareMonthly = sd.isOnlyChild
    ? (sd.numberOfElderlyCare || 0) * rates.elderlyCareOnlyChild
    : (sd.numberOfElderlyCare || 0) * rates.elderlyCareShared;

  let housingRentMonthly = 0;
  if (!sd.housingLoanInterest) {
    switch (sd.housingRentCity) {
      case "tier1":
        housingRentMonthly = rates.housingRentTier1;
        break;
      case "tier2":
        housingRentMonthly = rates.housingRentTier2;
        break;
      case "tier3":
        housingRentMonthly = rates.housingRentTier3;
        break;
      default:
        housingRentMonthly = 0;
    }
  }

  const housingLoanInterestMonthly = sd.housingLoanInterest
    ? rates.housingLoanInterest
    : 0;
  const continuingEducationMonthly = sd.continuingEducation
    ? rates.continuingEducation
    : 0;

  const totalMonthly =
    childrenMonthly +
    elderlyCareMonthly +
    housingRentMonthly +
    housingLoanInterestMonthly +
    continuingEducationMonthly;
  const totalAnnual = totalMonthly * 12;

  return {
    children: childrenMonthly * 12,
    childrenUnder3: (sd.numberOfChildrenUnder3 || 0) * rates.childUnder3 * 12,
    elderlyCare: elderlyCareMonthly * 12,
    housingRent: housingRentMonthly * 12,
    housingLoanInterest: housingLoanInterestMonthly * 12,
    continuingEducation: continuingEducationMonthly * 12,
    total: totalAnnual,
  };
}

export function calculateCN(inputs: CNCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, socialInsuranceBase, housingFundRate } =
    inputs;

  const monthlySocialBase = Math.max(0, socialInsuranceBase);
  const socialInsurance = calculateCNSocialInsurance(monthlySocialBase);
  const housingFund = calculateHousingFund(monthlySocialBase, housingFundRate);
  const specialDeductions = calculateCNSpecialDeductions(inputs);
  const privatePensionAccount = clampAmount(
    inputs.contributions?.privatePensionAccount,
    CN_PRIVATE_PENSION_ANNUAL_CAP_2026,
  );

  const totalDeductions =
    CN_STANDARD_DEDUCTION +
    specialDeductions.total +
    socialInsurance.total +
    housingFund.employee +
    privatePensionAccount;

  const taxableIncome = Math.max(0, grossSalary - totalDeductions);
  const taxResult = calculateCNProgressiveTax(taxableIncome);

  const taxes: CNTaxBreakdown = {
    type: "CN",
    totalIncomeTax: taxResult.totalTax,
    incomeTax: taxResult.totalTax,
    pensionInsurance: socialInsurance.pension.employee,
    medicalInsurance: socialInsurance.medical.employee,
    unemploymentInsurance: socialInsurance.unemployment.employee,
    housingFund: housingFund.employee,
  };

  const totalTax =
    taxes.incomeTax +
    taxes.pensionInsurance +
    taxes.medicalInsurance +
    taxes.unemploymentInsurance +
    taxes.housingFund;
  const totalDeductionsAll = totalTax;
  const netSalary = grossSalary - totalDeductionsAll - privatePensionAccount;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: CNBreakdown = {
    type: "CN",
    grossIncome: grossSalary,
    taxableIncome,
    standardDeduction: CN_STANDARD_DEDUCTION,
    specialDeductions,
    socialInsurance,
    housingFund,
    bracketTaxes: taxResult.bracketTaxes,
    voluntaryContributions: {
      privatePensionAccount,
      privatePensionLimit: CN_PRIVATE_PENSION_ANNUAL_CAP_2026,
      total: privatePensionAccount,
    },
  };

  return {
    country: "CN",
    currency: "CNY",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalDeductionsAll + privatePensionAccount,
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

export const CNCalculator: CountryCalculator = {
  countryCode: "CN",
  config: CN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CN") {
      throw new Error("CNCalculator can only calculate CN inputs");
    }
    return calculateCN(inputs as CNCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      privatePensionAccount: {
        limit: CN_PRIVATE_PENSION_ANNUAL_CAP_2026,
        name: "Personal pension account (个人养老金)",
        description: "Annual deduction cap for eligible personal pension contributions",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CNCalculatorInputs {
    return {
      country: "CN",
      grossSalary: 240_000,
      payFrequency: "monthly",
      socialInsuranceBase: 20_000,
      housingFundRate: 0.12,
      contributions: { privatePensionAccount: 0 },
      specialDeductions: {
        numberOfChildren: 0,
        numberOfChildrenUnder3: 0,
        numberOfElderlyCare: 0,
        isOnlyChild: false,
        housingRentCity: "none",
        housingLoanInterest: false,
        continuingEducation: false,
      },
    };
  },
};
