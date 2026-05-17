import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { CA_CONFIG } from "./config";
import {
  CANADA_CPP_2026,
  CANADA_EI_2026,
  CANADA_FEDERAL_TAX_BRACKETS_2026,
  CANADA_PROVINCES,
  CANADA_PROVINCIAL_TAX_BRACKETS_2026,
  CANADA_QPP_2026,
  CANADA_RRSP_2026,
  CANADA_SOURCE_URLS,
  QUEBEC_EI_2026,
  QUEBEC_QPIP_2026,
} from "./constants/tax-year-2026";
import type {
  CABreakdown,
  CACalculatorInputs,
  CATaxBreakdown,
} from "./types";
import type { CanadaProvinceCode } from "./constants/tax-year-2026";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual": return 1;
    case "monthly": return 12;
    case "biweekly": return 26;
    case "weekly": return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  let totalTax = 0;
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAtBracket = Math.max(0, Math.min(income, bracket.max) - bracket.min);
    const tax = roundCurrency(taxableAtBracket * bracket.rate);
    totalTax += tax;
    return { ...bracket, tax };
  });
  return { totalTax: roundCurrency(totalTax), bracketTaxes };
}

function getProvince(province: CanadaProvinceCode) {
  return CANADA_PROVINCES.find((candidate) => candidate.code === province) ?? CANADA_PROVINCES[8];
}

function calculatePension(grossSalary: number, province: CanadaProvinceCode) {
  const isQuebec = province === "QC";
  const plan = isQuebec ? CANADA_QPP_2026 : CANADA_CPP_2026;
  const pensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, plan.maximumPensionableEarnings) - plan.basicExemption,
  );
  const base = Math.min(
    plan.maximumEmployeeContribution,
    roundCurrency(pensionableEarnings * plan.employeeRate),
  );
  const additionalPensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, plan.maximumAdditionalPensionableEarnings) -
      plan.maximumPensionableEarnings,
  );
  const secondAdditional = Math.min(
    plan.maximumSecondAdditionalEmployeeContribution,
    roundCurrency(additionalPensionableEarnings * plan.secondAdditionalEmployeeRate),
  );

  return {
    planName: isQuebec ? "QPP" as const : "CPP" as const,
    base,
    secondAdditional,
    pensionableEarnings,
    additionalPensionableEarnings,
    employeeRate: plan.employeeRate,
    maximumEmployeeContribution: plan.maximumEmployeeContribution,
    secondAdditionalEmployeeRate: plan.secondAdditionalEmployeeRate,
    maximumSecondAdditionalEmployeeContribution: plan.maximumSecondAdditionalEmployeeContribution,
  };
}

export function calculateCA(inputs: CACalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const province = getProvince(inputs.province ?? "ON");
  const rrspContributionLimit = Math.min(
    grossSalary * CANADA_RRSP_2026.contributionRateLimit,
    CANADA_RRSP_2026.annualDollarLimit,
  );
  const rrspContribution = Math.min(
    Math.max(0, inputs.contributions?.rrspContribution ?? 0),
    rrspContributionLimit,
  );
  const taxableIncome = Math.max(0, grossSalary - rrspContribution);
  const federal = calculateProgressiveTax(taxableIncome, CANADA_FEDERAL_TAX_BRACKETS_2026);
  const provincial = calculateProgressiveTax(
    taxableIncome,
    CANADA_PROVINCIAL_TAX_BRACKETS_2026[province.code],
  );

  const pension = calculatePension(grossSalary, province.code);
  const eiConfig = province.code === "QC" ? QUEBEC_EI_2026 : CANADA_EI_2026;
  const insurableEarnings = Math.min(grossSalary, eiConfig.maximumInsurableEarnings);
  const ei = Math.min(
    eiConfig.maximumEmployeePremium,
    roundCurrency(insurableEarnings * eiConfig.employeeRate),
  );
  const qpipInsurableEarnings = Math.min(grossSalary, QUEBEC_QPIP_2026.maximumInsurableEarnings);
  const qpip = province.code === "QC"
    ? Math.min(
        QUEBEC_QPIP_2026.maximumEmployeePremium,
        roundCurrency(qpipInsurableEarnings * QUEBEC_QPIP_2026.employeeRate),
      )
    : 0;

  const taxes: CATaxBreakdown = {
    type: "CA",
    totalIncomeTax: federal.totalTax + provincial.totalTax,
    incomeTax: federal.totalTax,
    provincialIncomeTax: provincial.totalTax,
    cpp: province.code === "QC" ? 0 : pension.base,
    cpp2: province.code === "QC" ? 0 : pension.secondAdditional,
    qpp: province.code === "QC" ? pension.base : 0,
    qpp2: province.code === "QC" ? pension.secondAdditional : 0,
    qpip,
    ei,
  };
  const statutoryPayroll = pension.base + pension.secondAdditional + ei + qpip;
  const totalTax = taxes.totalIncomeTax + statutoryPayroll;
  const voluntaryContributions = rrspContribution;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CABreakdown = {
    type: "CA",
    grossIncome: grossSalary,
    taxableIncome,
    province: province.code,
    provinceName: province.name,
    federalBracketTaxes: federal.bracketTaxes,
    provincialBracketTaxes: provincial.bracketTaxes,
    pension: {
      plan: pension.planName,
      pensionableEarnings: pension.pensionableEarnings,
      employeeRate: pension.employeeRate,
      maximumEmployeeContribution: pension.maximumEmployeeContribution,
      additionalPensionableEarnings: pension.additionalPensionableEarnings,
      secondAdditionalEmployeeRate: pension.secondAdditionalEmployeeRate,
      maximumSecondAdditionalEmployeeContribution:
        pension.maximumSecondAdditionalEmployeeContribution,
    },
    ei: {
      insurableEarnings,
      employeeRate: eiConfig.employeeRate,
      maximumEmployeePremium: eiConfig.maximumEmployeePremium,
    },
    qpip: province.code === "QC" ? {
      insurableEarnings: qpipInsurableEarnings,
      employeeRate: QUEBEC_QPIP_2026.employeeRate,
      maximumEmployeePremium: QUEBEC_QPIP_2026.maximumEmployeePremium,
    } : undefined,
    voluntaryContributions: {
      rrspContribution,
      rrspContributionLimit,
      total: voluntaryContributions,
    },
    assumptions: [
      `Uses 2026 federal and ${province.name} provincial/territorial tax brackets.`,
      province.code === "QC"
        ? "Quebec uses QPP/QPP2, QPIP, and the reduced Quebec EI employee rate."
        : "Models base CPP, second additional CPP, and federal EI employee contributions.",
      "Models RRSP contributions as taxable-income deductions; unused room and employer pension adjustments are not modeled.",
      "Province-specific credits, surtaxes, health premiums, and detailed payroll formulas are not yet modeled beyond listed brackets and statutory payroll contributions.",
    ],
    sourceUrls: CANADA_SOURCE_URLS,
  };

  return {
    country: "CA",
    currency: "CAD",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const CACalculator: CountryCalculator = {
  countryCode: "CA",
  config: CA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CA") {
      throw new Error("CACalculator can only calculate CA inputs");
    }
    return calculateCA(inputs as CACalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return CANADA_PROVINCES.map((province) => ({
      code: province.code,
      name: province.name,
      taxType: "progressive",
      notes: province.code === "QC"
        ? "Uses Quebec provincial brackets with QPP/QPP2, QPIP, and reduced EI."
        : "Uses provincial/territorial brackets with CPP/CPP2 and EI.",
    }));
  },

  getContributionLimits(): ContributionLimits {
    return {
      rrspContribution: {
        limit: CANADA_RRSP_2026.annualDollarLimit,
        name: "RRSP contribution",
        description: "Modeled RRSP taxable-income deduction",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CACalculatorInputs {
    return {
      country: "CA",
      grossSalary: 90_000,
      payFrequency: "monthly",
      province: "ON",
      contributions: {
        rrspContribution: 0,
      },
    };
  },
};
