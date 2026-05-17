import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { MX_CONFIG } from "./config";
import {
  MEXICO_IMSS_2026,
  MEXICO_ISR_BRACKETS_2026,
  MEXICO_SOURCE_URLS,
  MEXICO_STATES,
  MEXICO_VOLUNTARY_RETIREMENT_2026,
} from "./constants/tax-year-2026";
import type { MXBreakdown, MXCalculatorInputs, MXTaxBreakdown } from "./types";
import type { MexicoStateCode } from "./constants/tax-year-2026";

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

function getState(state: MexicoStateCode) {
  return MEXICO_STATES.find((candidate) => candidate.code === state) ?? MEXICO_STATES[6];
}

function calculateImss(grossSalary: number) {
  const annualContributionDays = 365;
  const dailySbc = grossSalary / annualContributionDays;
  const cappedDailySbc = Math.min(
    dailySbc,
    MEXICO_IMSS_2026.dailyUma * MEXICO_IMSS_2026.capDailySbcMultiplierOfUma,
  );
  const base = cappedDailySbc * annualContributionDays;
  const excessBase = Math.max(0, cappedDailySbc - 3 * MEXICO_IMSS_2026.dailyUma) * annualContributionDays;
  const excessOverThreeUma = roundCurrency(excessBase * MEXICO_IMSS_2026.excessOverThreeUmaRate);
  const pensionerMedical = roundCurrency(base * MEXICO_IMSS_2026.pensionerMedicalRate);
  const sicknessMaternityCash = roundCurrency(base * MEXICO_IMSS_2026.sicknessMaternityCashRate);
  const disabilityLife = roundCurrency(base * MEXICO_IMSS_2026.disabilityLifeRate);
  const oldAgeRetirement = roundCurrency(base * MEXICO_IMSS_2026.oldAgeRetirementRate);
  const total = roundCurrency(
    excessOverThreeUma +
      pensionerMedical +
      sicknessMaternityCash +
      disabilityLife +
      oldAgeRetirement,
  );

  return {
    dailySbc: roundCurrency(dailySbc),
    cappedDailySbc: roundCurrency(cappedDailySbc),
    annualContributionDays,
    excessOverThreeUma,
    pensionerMedical,
    sicknessMaternityCash,
    disabilityLife,
    oldAgeRetirement,
    total,
  };
}

export function calculateMX(inputs: MXCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const state = getState(inputs.state ?? "CMX");
  const voluntaryRetirementContributionLimit = Math.min(
    grossSalary * MEXICO_VOLUNTARY_RETIREMENT_2026.deductionRateLimit,
    MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
  );
  const voluntaryRetirementContribution = Math.min(
    Math.max(0, inputs.contributions?.voluntaryRetirementContribution ?? 0),
    voluntaryRetirementContributionLimit,
  );
  const taxableIncome = Math.max(0, grossSalary - voluntaryRetirementContribution);
  const bracket =
    MEXICO_ISR_BRACKETS_2026.find(
      (candidate) => taxableIncome > candidate.min && taxableIncome <= candidate.max,
    ) ?? MEXICO_ISR_BRACKETS_2026[0];
  const marginalTax = roundCurrency((taxableIncome - bracket.min) * bracket.rate);
  const incomeTax = roundCurrency(bracket.fixedFee + marginalTax);
  const imss = calculateImss(grossSalary);
  const socialSecurity = imss.total;

  const taxes: MXTaxBreakdown = {
    type: "MX",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const voluntaryContributions = voluntaryRetirementContribution;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: MXBreakdown = {
    type: "MX",
    grossIncome: grossSalary,
    taxableIncome,
    state: state.code,
    stateName: state.name,
    isrBracket: bracket,
    fixedFee: bracket.fixedFee,
    marginalTax,
    imss,
    voluntaryContributions: {
      voluntaryRetirementContribution,
      voluntaryRetirementContributionLimit,
      total: voluntaryContributions,
    },
    assumptions: [
      "Uses the 2026 annual ISR tariff for resident salary income.",
      "Employee IMSS is modeled with national employee-side branches and a daily SBC capped at 25x UMA; gross pay is used as the SBC proxy.",
      "Mexican state payroll taxes (ISN) are generally employer-side taxes, so state selection is informational and does not reduce employee take-home pay.",
      "Models voluntary retirement savings as a personal deduction capped at 10% of income and a modeled annual cap; plan-specific rules are not modeled.",
      "Does not yet model employment subsidy, exempt income, aguinaldo treatment, INFONAVIT loan repayments, or employer-only payroll costs.",
    ],
    sourceUrls: MEXICO_SOURCE_URLS,
  };

  return {
    country: "MX",
    currency: "MXN",
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

export const MXCalculator: CountryCalculator = {
  countryCode: "MX",
  config: MX_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MX") {
      throw new Error("MXCalculator can only calculate MX inputs");
    }
    return calculateMX(inputs as MXCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return MEXICO_STATES.map((state) => ({
      code: state.code,
      name: state.name,
      taxType: "none",
      notes: "State payroll taxes are employer-side; modeled employee take-home uses federal ISR and national IMSS.",
    }));
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryRetirementContribution: {
        limit: MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
        name: "Voluntary retirement savings",
        description: "Modeled Mexico personal retirement deduction",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): MXCalculatorInputs {
    return {
      country: "MX",
      grossSalary: 600_000,
      payFrequency: "monthly",
      state: "CMX",
      contributions: {
        voluntaryRetirementContribution: 0,
      },
    };
  },
};
