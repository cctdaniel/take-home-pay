import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { IL_CONFIG } from "./config";
import {
  calculateIlCreditPoints,
  calculateIlProgressiveTax,
  IL_CREDITS_2026,
  IL_SOCIAL_2026,
  IL_SOURCE_URLS,
  IL_STUDY_FUND_MAX_RATE,
  IL_SUPPLEMENTAL_PENSION_MAX_RATE,
} from "./constants/tax-year-2026";
import type { ILBreakdown, ILCalculatorInputs, ILTaxBreakdown } from "./types";

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

function getStudyFundLimit(grossIncome: number): number {
  return Math.max(0, grossIncome) * IL_STUDY_FUND_MAX_RATE;
}

function getSupplementalPensionLimit(grossIncome: number): number {
  return Math.max(0, grossIncome) * IL_SUPPLEMENTAL_PENSION_MAX_RATE;
}

export function calculateIL(inputs: ILCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const studyFundLimit = getStudyFundLimit(grossSalary);
  const supplementalPensionLimit = getSupplementalPensionLimit(grossSalary);
  const studyFund = clampAmount(
    inputs.contributions?.studyFund,
    studyFundLimit,
  );
  const supplementalPension = clampAmount(
    inputs.contributions?.supplementalPension,
    supplementalPensionLimit,
  );
  const taxableIncome = Math.max(0, grossSalary - supplementalPension);
  const { totalTax: grossIncomeTax, bracketTaxes } =
    calculateIlProgressiveTax(taxableIncome);
  const creditPoints = calculateIlCreditPoints({
    isMarried: inputs.isMarried,
    childrenUnder6: inputs.childrenUnder6,
    children6To17: inputs.children6To17,
  });
  const taxCredit = roundCurrency(
    creditPoints * IL_CREDITS_2026.annualValuePerPoint,
  );
  const incomeTax = roundCurrency(Math.max(0, grossIncomeTax - taxCredit));

  const bituachBase = Math.min(grossSalary, IL_SOCIAL_2026.bituachLeumiAnnualCap);
  const bituachLeumi = roundCurrency(bituachBase * IL_SOCIAL_2026.bituachLeumiRate);
  const healthInsurance = roundCurrency(
    grossSalary * IL_SOCIAL_2026.healthInsuranceRate,
  );
  const pensionBase = Math.min(grossSalary, IL_SOCIAL_2026.pensionAnnualCap);
  const pension = roundCurrency(pensionBase * IL_SOCIAL_2026.mandatoryPensionRate);

  const taxes: ILTaxBreakdown = {
    type: "IL",
    totalIncomeTax: incomeTax,
    incomeTax,
    bituachLeumi,
    healthInsurance,
    pension,
  };

  const statutoryPayroll = bituachLeumi + healthInsurance + pension;
  const totalTax = incomeTax + statutoryPayroll;
  const voluntaryTotal = studyFund + supplementalPension;
  const totalDeductions = totalTax + voluntaryTotal;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: ILBreakdown = {
    type: "IL",
    grossIncome: grossSalary,
    taxableIncome,
    isMarried: inputs.isMarried,
    childrenUnder6: inputs.childrenUnder6,
    children6To17: inputs.children6To17,
    creditPoints,
    creditPointValue: IL_CREDITS_2026.annualValuePerPoint,
    taxCredit,
    grossIncomeTax,
    bracketTaxes,
    social: {
      bituachLeumi,
      healthInsurance,
      pension,
      bituachLeumiBase: bituachBase,
      pensionBase,
    },
    voluntaryContributions: {
      studyFund,
      studyFundLimit,
      supplementalPension,
      supplementalPensionLimit,
      total: voluntaryTotal,
    },
    assumptions: [
      "Progressive income tax 10–50% with credit points per Israel Tax Authority tables.",
      "Bituach Leumi 3.5% on gross up to modeled cap; health 3.1%; mandatory pension 6% capped.",
      "Supplemental pension up to 5% of gross reduces Mas Hachnasa taxable income.",
      "Study fund up to 7.5% of gross modeled as net salary deduction.",
    ],
    sourceUrls: IL_SOURCE_URLS,
  };

  return {
    country: "IL",
    currency: "ILS",
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

export const ILCalculator: CountryCalculator = {
  countryCode: "IL",
  config: IL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IL") {
      throw new Error("ILCalculator can only calculate IL inputs");
    }
    return calculateIL(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: ILCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 240_000;
    return {
      studyFund: {
        limit: getStudyFundLimit(gross),
        name: "Study fund (Keren Hishtalmut)",
        description: "Employee study fund contribution up to 7.5% of gross",
        preTax: false,
      },
      supplementalPension: {
        limit: getSupplementalPensionLimit(gross),
        name: "Supplemental pension",
        description:
          "Additional employee pension up to 5% of gross; reduces Mas Hachnasa",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ILCalculatorInputs {
    return {
      country: "IL",
      grossSalary: 240_000,
      payFrequency: "monthly",
      isMarried: false,
      childrenUnder6: 0,
      children6To17: 0,
      contributions: {
        studyFund: 0,
        supplementalPension: 0,
      },
    };
  },
};
