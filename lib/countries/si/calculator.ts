import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { SI_CONFIG } from "./config";
import {
  SI_MEAL_REIMBURSEMENT_DAILY_JAN_JUN_2026,
  SI_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { SIBreakdown, SICalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  SI_CONFIG,
  SI_TAX_CONFIG,
);

function clampCount(value: number | undefined, max = 10): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(value ?? 0)), max);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

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

function normalizeSIInputs(inputs: CalculatorInputs): SICalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"SI"> &
    Partial<SICalculatorInputs>;
  const age = Math.min(Math.max(18, Math.floor(standardInputs.age ?? 30)), 100);

  return {
    ...standardInputs,
    country: "SI",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    age,
    isResidentYoungWorker:
      age < 29 && Boolean(standardInputs.isResidentYoungWorker),
    isFullyDisabled: Boolean(standardInputs.isFullyDisabled),
    numberOfDependentChildren: clampCount(
      standardInputs.numberOfDependentChildren,
    ),
    numberOfSpecialCareChildren: clampCount(
      standardInputs.numberOfSpecialCareChildren,
    ),
    numberOfOtherDependents: clampCount(standardInputs.numberOfOtherDependents),
    mealReimbursementWorkdays: Math.min(
      Math.max(0, Math.floor(standardInputs.mealReimbursementWorkdays ?? 0)),
      366,
    ),
    transportReimbursementAnnual: Math.max(
      0,
      standardInputs.transportReimbursementAnnual ?? 0,
    ),
    holidayAllowance: Math.max(0, standardInputs.holidayAllowance ?? 0),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getSIDefaultInputs(): SICalculatorInputs {
  return {
    country: "SI",
    grossSalary: SI_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    age: 30,
    isResidentYoungWorker: false,
    isFullyDisabled: false,
    numberOfDependentChildren: 0,
    numberOfSpecialCareChildren: 0,
    numberOfOtherDependents: 0,
    mealReimbursementWorkdays: 220,
    transportReimbursementAnnual: 0,
    holidayAllowance: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function calculateTaxExemptReimbursements(inputs: SICalculatorInputs) {
  const meal = roundCurrency(
    inputs.mealReimbursementWorkdays *
      SI_MEAL_REIMBURSEMENT_DAILY_JAN_JUN_2026,
  );
  const transport = roundCurrency(
    Math.max(0, inputs.transportReimbursementAnnual),
  );
  const holidayAllowance = roundCurrency(Math.max(0, inputs.holidayAllowance));

  return {
    meal,
    transport,
    holidayAllowance,
    total: roundCurrency(meal + transport + holidayAllowance),
  };
}

function calculateSIResult(inputs: SICalculatorInputs): CalculationResult {
  const taxableSalary = Math.max(0, inputs.grossSalary);
  const baseResult = baseCalculator.calculate({
    ...inputs,
    grossSalary: taxableSalary,
  });
  const taxExemptReimbursements = calculateTaxExemptReimbursements(inputs);
  const grossSalary = roundCurrency(
    taxableSalary + taxExemptReimbursements.total,
  );
  const netSalary = roundCurrency(
    baseResult.netSalary + taxExemptReimbursements.total,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const breakdown = {
    ...(baseResult.breakdown as SIBreakdown),
    grossIncome: grossSalary,
    taxableSalary,
    taxExemptReimbursements,
  } satisfies SIBreakdown;

  return {
    ...baseResult,
    grossSalary,
    totalDeductions: roundCurrency(grossSalary - netSalary),
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? baseResult.totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const SICalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "SI") {
      throw new Error("SICalculator can only calculate Slovenia inputs");
    }

    return calculateSIResult(normalizeSIInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getSIDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeSIInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<SICalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): SICalculatorInputs {
    return getSIDefaultInputs();
  },
};
