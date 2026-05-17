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
  CANADA_RRSP_2026,
  CANADA_SOURCE_URLS,
  ONTARIO_TAX_BRACKETS_2026,
} from "./constants/tax-year-2026";
import type { CABreakdown, CACalculatorInputs, CATaxBreakdown } from "./types";

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

export function calculateCA(inputs: CACalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
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
  const provincial = calculateProgressiveTax(taxableIncome, ONTARIO_TAX_BRACKETS_2026);

  const pensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, CANADA_CPP_2026.maximumPensionableEarnings) - CANADA_CPP_2026.basicExemption,
  );
  const cpp = Math.min(
    CANADA_CPP_2026.maximumEmployeeContribution,
    roundCurrency(pensionableEarnings * CANADA_CPP_2026.employeeRate),
  );
  const additionalPensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, CANADA_CPP_2026.maximumAdditionalPensionableEarnings) -
      CANADA_CPP_2026.maximumPensionableEarnings,
  );
  const cpp2 = Math.min(
    CANADA_CPP_2026.maximumSecondAdditionalEmployeeContribution,
    roundCurrency(additionalPensionableEarnings * CANADA_CPP_2026.secondAdditionalEmployeeRate),
  );
  const insurableEarnings = Math.min(grossSalary, CANADA_EI_2026.maximumInsurableEarnings);
  const ei = Math.min(
    CANADA_EI_2026.maximumEmployeePremium,
    roundCurrency(insurableEarnings * CANADA_EI_2026.employeeRate),
  );

  const taxes: CATaxBreakdown = {
    type: "CA",
    totalIncomeTax: federal.totalTax + provincial.totalTax,
    incomeTax: federal.totalTax,
    provincialIncomeTax: provincial.totalTax,
    cpp,
    cpp2,
    ei,
  };
  const totalTax = taxes.totalIncomeTax + cpp + cpp2 + ei;
  const voluntaryContributions = rrspContribution;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CABreakdown = {
    type: "CA",
    grossIncome: grossSalary,
    taxableIncome,
    province: "ON",
    provinceName: "Ontario",
    federalBracketTaxes: federal.bracketTaxes,
    provincialBracketTaxes: provincial.bracketTaxes,
    cpp: {
      pensionableEarnings,
      employeeRate: CANADA_CPP_2026.employeeRate,
      maximumEmployeeContribution: CANADA_CPP_2026.maximumEmployeeContribution,
      additionalPensionableEarnings,
      secondAdditionalEmployeeRate: CANADA_CPP_2026.secondAdditionalEmployeeRate,
      maximumSecondAdditionalEmployeeContribution:
        CANADA_CPP_2026.maximumSecondAdditionalEmployeeContribution,
    },
    ei: {
      insurableEarnings,
      employeeRate: CANADA_EI_2026.employeeRate,
      maximumEmployeePremium: CANADA_EI_2026.maximumEmployeePremium,
    },
    voluntaryContributions: {
      rrspContribution,
      rrspContributionLimit,
      total: voluntaryContributions,
    },
    assumptions: [
      "Uses 2026 federal and Ontario provincial tax brackets.",
      "Models base CPP, second additional CPP, and federal EI employee contributions; Quebec-specific QPP/QPIP is not included.",
      "Models RRSP contributions as taxable-income deductions; unused room and employer pension adjustments are not modeled.",
      "Does not yet model non-refundable tax credits, surtaxes, provincial health premiums, or deductions beyond statutory payroll contributions and RRSP.",
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
    return [{ code: "ON", name: "Ontario" }];
  },

  getContributionLimits(): ContributionLimits {
    return {};
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
