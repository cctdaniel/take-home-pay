// ============================================================================
// CROATIA CALCULATOR IMPLEMENTATION
// Tax Year: 2026
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { HR_CONFIG } from "./config";
import {
  CROATIA_CONTRIBUTIONS_2026,
  CROATIA_LOCAL_TAX_RATES_2026,
  CROATIA_PERSONAL_ALLOWANCE_2026,
  calculateCroatiaDependentChildAllowance,
  calculateCroatiaIncomeTax,
  getCroatiaLocalTaxRate,
} from "./constants/tax-brackets-2026";
import type {
  HRBreakdown,
  HRCalculatorInputs,
  HRPensionScheme,
  HRTaxBreakdown,
} from "./types";

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

function calculatePensionContributions(
  grossSalary: number,
  pensionScheme: HRPensionScheme,
) {
  const contributionBase = Math.min(
    Math.max(0, grossSalary),
    CROATIA_CONTRIBUTIONS_2026.annualPensionBaseCeiling,
  );

  if (pensionScheme === "pillar_1_only") {
    const firstPillar =
      contributionBase *
      CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarOnlyRate;

    return {
      contributionBase,
      monthlyBase: contributionBase / 12,
      firstPillar,
      secondPillar: 0,
      total: firstPillar,
      firstPillarRate:
        CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarOnlyRate,
      secondPillarRate: 0,
      totalRate: CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarOnlyRate,
    };
  }

  const firstPillar =
    contributionBase * CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarRate;
  const secondPillar =
    contributionBase * CROATIA_CONTRIBUTIONS_2026.pensionSecondPillarRate;

  return {
    contributionBase,
    monthlyBase: contributionBase / 12,
    firstPillar,
    secondPillar,
    total: firstPillar + secondPillar,
    firstPillarRate: CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarRate,
    secondPillarRate: CROATIA_CONTRIBUTIONS_2026.pensionSecondPillarRate,
    totalRate:
      CROATIA_CONTRIBUTIONS_2026.pensionFirstPillarRate +
      CROATIA_CONTRIBUTIONS_2026.pensionSecondPillarRate,
  };
}

function calculatePersonalAllowance(inputs: HRCalculatorInputs) {
  const isResident = inputs.residencyType === "resident";
  const numberOfChildren = Math.max(0, Math.floor(inputs.numberOfChildren));
  const basic = CROATIA_PERSONAL_ALLOWANCE_2026.annualBasic;
  const dependentSpouse =
    isResident && inputs.hasDependentSpouse
      ? CROATIA_PERSONAL_ALLOWANCE_2026.dependentSpouseFactor *
        CROATIA_PERSONAL_ALLOWANCE_2026.monthlyBasic *
        12
      : 0;
  const children = isResident
    ? calculateCroatiaDependentChildAllowance(numberOfChildren)
    : 0;

  return {
    basic,
    dependentSpouse,
    children,
    total: basic + dependentSpouse + children,
    numberOfChildren,
    hasDependentSpouse: isResident && inputs.hasDependentSpouse,
  };
}

export function calculateHR(inputs: HRCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, locality, pensionScheme } =
    inputs;
  const isResident = residencyType === "resident";
  const localTax = getCroatiaLocalTaxRate(locality);
  const pension = calculatePensionContributions(grossSalary, pensionScheme);
  const personalAllowance = calculatePersonalAllowance(inputs);
  const taxableIncomeBeforeAllowance = Math.max(0, grossSalary - pension.total);
  const taxableIncome = Math.max(
    0,
    taxableIncomeBeforeAllowance - personalAllowance.total,
  );
  const incomeTaxResult = calculateCroatiaIncomeTax(taxableIncome, locality);
  const incomeTax = roundCurrency(incomeTaxResult.totalTax);

  const taxes: HRTaxBreakdown = {
    type: "HR",
    totalIncomeTax: incomeTax,
    incomeTax,
    employeePensionFirstPillar: roundCurrency(pension.firstPillar),
    employeePensionSecondPillar: roundCurrency(pension.secondPillar),
  };

  const totalTax =
    taxes.incomeTax +
    taxes.employeePensionFirstPillar +
    taxes.employeePensionSecondPillar;
  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: HRBreakdown = {
    type: "HR",
    grossIncome: grossSalary,
    residencyType,
    isResident,
    locality: localTax,
    pensionScheme,
    pension: {
      ...pension,
      monthlyBaseCeiling: CROATIA_CONTRIBUTIONS_2026.monthlyPensionBaseCeiling,
      annualBaseCeiling: CROATIA_CONTRIBUTIONS_2026.annualPensionBaseCeiling,
      firstPillar: taxes.employeePensionFirstPillar,
      secondPillar: taxes.employeePensionSecondPillar,
      total:
        taxes.employeePensionFirstPillar + taxes.employeePensionSecondPillar,
    },
    employerContributions: {
      healthInsurance: roundCurrency(
        Math.max(0, grossSalary) *
          CROATIA_CONTRIBUTIONS_2026.employerHealthInsuranceRate,
      ),
      healthInsuranceRate:
        CROATIA_CONTRIBUTIONS_2026.employerHealthInsuranceRate,
    },
    personalAllowance,
    taxableIncomeBeforeAllowance,
    taxableIncome,
    bracketTaxes: incomeTaxResult.bracketTaxes.map((bracket) => ({
      ...bracket,
      tax: roundCurrency(bracket.tax),
    })),
    modeledExclusions: [
      "Digital-nomad temporary stay and foreign-employer income",
      "Employer-paid voluntary pension premiums and benefits in kind",
      "Special contribution exemptions for first-time hires, young workers, and returning Croatian citizens",
    ],
  };

  return {
    country: "HR",
    currency: "EUR",
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
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const HRCalculator: CountryCalculator = {
  countryCode: "HR",
  config: HR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "HR") {
      throw new Error("HRCalculator can only calculate HR inputs");
    }

    return calculateHR(inputs);
  },

  getRegions(): RegionInfo[] {
    return CROATIA_LOCAL_TAX_RATES_2026.map((region) => ({
      code: region.code,
      name: region.name,
      taxType: "progressive",
      notes: `${(region.lowerRate * 100).toFixed(1)}% / ${(
        region.higherRate * 100
      ).toFixed(1)}%, NN ${region.nnReference}`,
    }));
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): HRCalculatorInputs {
    return {
      country: "HR",
      grossSalary: 30_000,
      payFrequency: "monthly",
      residencyType: "resident",
      locality: "zagreb",
      pensionScheme: "pillar_1_and_2",
      hasDependentSpouse: false,
      numberOfChildren: 0,
      contributions: {},
    };
  },
};
