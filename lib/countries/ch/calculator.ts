import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { CH_CONFIG } from "./config";
import {
  calculateChProgressiveTax,
  calculateChSocialContributions,
  CH_CANTONS,
  CH_FEDERAL_TAX_BRACKETS_SINGLE_2025,
  CH_PILLAR_3A_LIMIT_2026,
  CH_SOCIAL_2026,
  CH_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type {
  CHBreakdown,
  CHCalculatorInputs,
  CHTaxBreakdown,
} from "./types";
import type { SwitzerlandCantonCode } from "./constants/tax-year-2026";

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

function getCanton(code: SwitzerlandCantonCode) {
  return CH_CANTONS.find((canton) => canton.code === code) ?? CH_CANTONS[0];
}

export function calculateCH(inputs: CHCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const pillar3a = clampAmount(
    inputs.contributions?.pillar3a,
    CH_PILLAR_3A_LIMIT_2026,
  );
  const canton = getCanton(inputs.canton ?? "ZH");
  const taxableIncome = Math.max(0, grossSalary - pillar3a);
  const incomeSplittingApplied = inputs.filingStatus === "married";
  const splitIncome = incomeSplittingApplied ? taxableIncome / 2 : taxableIncome;
  const { bracketTaxes, totalTax: federalIncomeTax } = calculateChProgressiveTax(
    splitIncome,
    CH_FEDERAL_TAX_BRACKETS_SINGLE_2025,
  );
  const federalTax = incomeSplittingApplied
    ? Math.round(federalIncomeTax * 2 * 100) / 100
    : federalIncomeTax;
  const totalIncomeTax = Math.round(federalTax * canton.totalTaxMultiplier * 100) / 100;
  const cantonIncomeTax = Math.round((totalIncomeTax - federalTax) * 100) / 100;
  const social = calculateChSocialContributions(grossSalary);

  const taxes: CHTaxBreakdown = {
    type: "CH",
    totalIncomeTax: totalIncomeTax,
    incomeTax: totalIncomeTax,
    federalIncomeTax: federalTax,
    cantonIncomeTax,
    ahvIvEo: social.ahvIvEo,
    alv: social.alv,
  };

  const totalTax = totalIncomeTax + social.total;
  const totalDeductions = totalTax + pillar3a;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CHBreakdown = {
    type: "CH",
    grossIncome: grossSalary,
    taxableIncome,
    canton: canton.code,
    cantonName: canton.name,
    filingStatus: inputs.filingStatus,
    incomeSplittingApplied,
    federalBracketTaxes: bracketTaxes,
    federalIncomeTax: federalTax,
    cantonTaxMultiplier: canton.totalTaxMultiplier,
    cantonIncomeTax,
    social: {
      ahvIvEo: social.ahvIvEo,
      alv: social.alv,
      cappedSalary: social.cappedSalary,
      aboveCeilingSalary: social.aboveCeiling,
      ahvIvEoRate: CH_SOCIAL_2026.ahvIvEoEmployeeRate,
      alvRateBelowCeiling: CH_SOCIAL_2026.alvEmployeeRateBelowCeiling,
      alvRateAboveCeiling: CH_SOCIAL_2026.alvEmployeeRateAboveCeiling,
      annualSalaryCeiling: CH_SOCIAL_2026.annualSalaryCeiling,
    },
    voluntaryContributions: {
      pillar3a,
      pillar3aLimit: CH_PILLAR_3A_LIMIT_2026,
      total: pillar3a,
    },
    assumptions: [
      "Federal DBG 2025 tariff with canton multipliers on federal tax (ZH, GE, ZG, VD, BS).",
      "Married filing uses income splitting on federal brackets before canton multiplier.",
      "AHV/IV/EO 5.3% and ALV 1.1% / 0.5% employee rates with CHF 148,200 ceiling.",
      "Pillar 3a modeled as deductible from federal/canton taxable income (2026 max CHF 7,056).",
      "Excludes withholding at source quirks, church tax, accident insurance, and pillar 2 buy-ins.",
    ],
    sourceUrls: CH_SOURCE_URLS,
  };

  return {
    country: "CH",
    currency: "CHF",
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

export const CHCalculator: CountryCalculator = {
  countryCode: "CH",
  config: CH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CH") {
      throw new Error("CHCalculator can only calculate CH inputs");
    }
    return calculateCH(inputs);
  },

  getRegions(): RegionInfo[] {
    return CH_CANTONS.map((canton) => ({
      code: canton.code,
      name: canton.name,
      taxType: "progressive",
      notes: `Canton total tax multiplier ×${canton.totalTaxMultiplier.toFixed(2)} on federal tax.`,
    }));
  },

  getContributionLimits(): ContributionLimits {
    return {
      pillar3a: {
        limit: CH_PILLAR_3A_LIMIT_2026,
        name: "Pillar 3a",
        description: "Deductible third-pillar pension contribution",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CHCalculatorInputs {
    return {
      country: "CH",
      grossSalary: 120_000,
      payFrequency: "monthly",
      canton: "ZH",
      filingStatus: "single",
      contributions: { pillar3a: 0 },
    };
  },
};
