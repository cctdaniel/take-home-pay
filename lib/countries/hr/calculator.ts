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
  CROATIA_INCOME_TAX_2026,
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
  HRWorkScenario,
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

function clampWholeNumber(value: number | undefined, max: number): number {
  return Math.trunc(Math.min(Math.max(value ?? 0, 0), max));
}

function normalizeWorkScenario(
  workScenario: HRWorkScenario | undefined,
): HRWorkScenario {
  return workScenario === "digital_nomad_foreign_employer"
    ? workScenario
    : "croatian_payroll";
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

function getCroatiaYouthReliefRate(age: number): number {
  const normalizedAge = Math.trunc(Math.min(Math.max(age, 0), 120));

  if (normalizedAge <= CROATIA_INCOME_TAX_2026.youthFullReliefMaxAge) {
    return CROATIA_INCOME_TAX_2026.youthFullReliefRate;
  }

  if (
    normalizedAge >= CROATIA_INCOME_TAX_2026.youthHalfReliefMinAge &&
    normalizedAge <= CROATIA_INCOME_TAX_2026.youthHalfReliefMaxAge
  ) {
    return CROATIA_INCOME_TAX_2026.youthHalfReliefRate;
  }

  return 0;
}

function calculatePersonalAllowance(inputs: HRCalculatorInputs) {
  const isResident = inputs.residencyType === "resident";
  const numberOfChildren = clampWholeNumber(inputs.numberOfChildren, 12);
  const numberOfOtherDependents = clampWholeNumber(
    inputs.numberOfOtherDependents,
    12,
  );
  const numberOfDisabilityAllowances = clampWholeNumber(
    inputs.numberOfDisabilityAllowances,
    20,
  );
  const numberOfSevereDisabilityAllowances = clampWholeNumber(
    inputs.numberOfSevereDisabilityAllowances,
    20,
  );
  const basic = CROATIA_PERSONAL_ALLOWANCE_2026.annualBasic;
  const dependentSpouse =
    isResident && inputs.hasDependentSpouse
      ? CROATIA_PERSONAL_ALLOWANCE_2026.dependentSpouseFactor *
        CROATIA_PERSONAL_ALLOWANCE_2026.monthlyBasic *
        12
      : 0;
  const otherDependents = isResident
    ? numberOfOtherDependents *
      CROATIA_PERSONAL_ALLOWANCE_2026.dependentFamilyMemberFactor *
      CROATIA_PERSONAL_ALLOWANCE_2026.monthlyBasic *
      12
    : 0;
  const children = isResident
    ? calculateCroatiaDependentChildAllowance(numberOfChildren)
    : 0;
  const disability = isResident
    ? numberOfDisabilityAllowances *
      CROATIA_PERSONAL_ALLOWANCE_2026.disabilityFactor *
      CROATIA_PERSONAL_ALLOWANCE_2026.monthlyBasic *
      12
    : 0;
  const severeDisability = isResident
    ? numberOfSevereDisabilityAllowances *
      CROATIA_PERSONAL_ALLOWANCE_2026.severeDisabilityFactor *
      CROATIA_PERSONAL_ALLOWANCE_2026.monthlyBasic *
      12
    : 0;

  return {
    basic,
    dependentSpouse,
    otherDependents,
    children,
    disability,
    severeDisability,
    total:
      basic +
      dependentSpouse +
      otherDependents +
      children +
      disability +
      severeDisability,
    numberOfChildren,
    hasDependentSpouse: isResident && inputs.hasDependentSpouse,
    numberOfOtherDependents: isResident ? numberOfOtherDependents : 0,
    numberOfDisabilityAllowances: isResident
      ? numberOfDisabilityAllowances
      : 0,
    numberOfSevereDisabilityAllowances: isResident
      ? numberOfSevereDisabilityAllowances
      : 0,
  };
}

export function calculateHR(inputs: HRCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, locality, pensionScheme } =
    inputs;
  const workScenario = normalizeWorkScenario(inputs.workScenario);
  const isDigitalNomadForeignEmployer =
    workScenario === "digital_nomad_foreign_employer";
  const taxableBenefitsInKind = isDigitalNomadForeignEmployer
    ? 0
    : roundCurrency(Math.max(0, inputs.taxableBenefitsInKind ?? 0));
  const taxableGrossIncome = isDigitalNomadForeignEmployer
    ? 0
    : roundCurrency(Math.max(0, grossSalary) + taxableBenefitsInKind);
  const isResident = residencyType === "resident";
  const localTax = getCroatiaLocalTaxRate(locality);
  const pension = isDigitalNomadForeignEmployer
    ? {
        contributionBase: 0,
        monthlyBase: 0,
        firstPillar: 0,
        secondPillar: 0,
        total: 0,
        firstPillarRate: 0,
        secondPillarRate: 0,
        totalRate: 0,
      }
    : calculatePensionContributions(taxableGrossIncome, pensionScheme);
  const personalAllowance = isDigitalNomadForeignEmployer
    ? {
        basic: 0,
        dependentSpouse: 0,
        otherDependents: 0,
        children: 0,
        disability: 0,
        severeDisability: 0,
        total: 0,
        numberOfChildren: 0,
        hasDependentSpouse: false,
        numberOfOtherDependents: 0,
        numberOfDisabilityAllowances: 0,
        numberOfSevereDisabilityAllowances: 0,
      }
    : calculatePersonalAllowance(inputs);
  const taxableIncomeBeforeAllowance = isDigitalNomadForeignEmployer
    ? 0
    : Math.max(0, taxableGrossIncome - pension.total);
  const taxableIncome = isDigitalNomadForeignEmployer
    ? 0
    : Math.max(
        0,
        taxableIncomeBeforeAllowance - personalAllowance.total,
      );
  const incomeTaxResult = isDigitalNomadForeignEmployer
    ? { totalTax: 0, bracketTaxes: [] }
    : calculateCroatiaIncomeTax(taxableIncome, locality);
  const incomeTaxBeforeReliefs = roundCurrency(incomeTaxResult.totalTax);
  const croatianReturneeReliefApplied =
    !isDigitalNomadForeignEmployer &&
    isResident &&
    inputs.croatianReturneeRelief === true;
  const youthReliefRate = croatianReturneeReliefApplied
    ? 0
    : getCroatiaYouthReliefRate(inputs.age ?? 35);
  const lowerBracketTax =
    incomeTaxResult.bracketTaxes.find(
      (bracket) =>
        bracket.min === 0 &&
        bracket.max === CROATIA_INCOME_TAX_2026.higherRateThreshold,
    )?.tax ?? 0;
  const youthRelief = roundCurrency(lowerBracketTax * youthReliefRate);
  const returneeRelief = croatianReturneeReliefApplied
    ? incomeTaxBeforeReliefs
    : 0;
  const incomeTax = roundCurrency(
    Math.max(0, incomeTaxBeforeReliefs - youthRelief - returneeRelief),
  );

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
    taxableBenefitsInKind,
    taxableGrossIncome,
    workScenario,
    residencyType,
    isResident,
    isDigitalNomadForeignEmployer,
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
    taxReliefs: {
      incomeTaxBeforeReliefs,
      youthRelief,
      youthReliefRate,
      returneeRelief,
      croatianReturneeReliefApplied,
    },
    employerContributions: {
      healthInsurance: roundCurrency(
        isDigitalNomadForeignEmployer
          ? 0
          : taxableGrossIncome *
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
      "Employer-paid voluntary pension premiums and official benefit-in-kind valuation worksheets",
      "Employer-side contribution exemptions for first-time hires and other special hiring categories",
      ...(isDigitalNomadForeignEmployer
        ? [
            "Croatian-client work, Croatian employer payroll, and self-employment registrations outside the digital-nomad foreign-employer scenario",
          ]
        : [
            "Foreign-employer digital-nomad work is available as a separate scenario",
          ]),
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
      workScenario: "croatian_payroll",
      residencyType: "resident",
      locality: "zagreb",
      pensionScheme: "pillar_1_and_2",
      age: 35,
      croatianReturneeRelief: false,
      hasDependentSpouse: false,
      numberOfOtherDependents: 0,
      numberOfChildren: 0,
      numberOfDisabilityAllowances: 0,
      numberOfSevereDisabilityAllowances: 0,
      taxableBenefitsInKind: 0,
      contributions: {},
    };
  },
};
