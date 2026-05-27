import {
  calculateStandardCountry,
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { DO_CONFIG } from "./config";
import {
  DO_CHRISTMAS_SALARY_MONTHS,
  DO_TAX_CONFIG,
  getDominicanEducationExpenseLimit,
  getDominicanSdssSalaryMonthly,
} from "./constants/tax-year-2026";
import type { DOBreakdown, DOCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  DO_CONFIG,
  DO_TAX_CONFIG,
);

function getDODefaultInputs(): DOCalculatorInputs {
  return {
    country: "DO",
    grossSalary: DO_TAX_CONFIG.defaultSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "monthly",
    christmasSalaryMode: "includedInGross",
    sdssCovered: true,
    sdssSalaryMonthly: 0,
    fringeBenefitsTaxedToEmployee: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
    },
  };
}

function normalizeDOInputs(inputs: CalculatorInputs): DOCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"DO"> &
    Partial<DOCalculatorInputs>;
  const defaultInputs = getDODefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "DO",
    grossSalary: standardInputs.grossSalary,
    taxableNonCashBenefits: standardInputs.fringeBenefitsTaxedToEmployee
      ? Math.max(0, standardInputs.taxableNonCashBenefits ?? 0)
      : 0,
    payFrequency: standardInputs.payFrequency,
    christmasSalaryMode:
      standardInputs.christmasSalaryMode ?? defaultInputs.christmasSalaryMode,
    sdssCovered: standardInputs.sdssCovered ?? true,
    sdssSalaryMonthly: Math.max(0, standardInputs.sdssSalaryMonthly ?? 0),
    fringeBenefitsTaxedToEmployee:
      standardInputs.fringeBenefitsTaxedToEmployee ?? false,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
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

function buildDOChristmasSalaryContext(inputs: DOCalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);

  if (inputs.christmasSalaryMode === "includedInGross") {
    const ordinaryMonthlySalary =
      enteredGrossSalary / (12 + DO_CHRISTMAS_SALARY_MONTHS);
    const ordinarySalary = ordinaryMonthlySalary * 12;
    const christmasSalary =
      ordinaryMonthlySalary * DO_CHRISTMAS_SALARY_MONTHS;

    return {
      enteredGrossSalary,
      ordinarySalary: roundCurrency(ordinarySalary),
      christmasSalary: roundCurrency(christmasSalary),
      totalGrossSalary: roundCurrency(enteredGrossSalary),
    };
  }

  const ordinarySalary = enteredGrossSalary;
  const christmasSalary =
    inputs.christmasSalaryMode === "additionalToGross"
      ? (ordinarySalary / 12) * DO_CHRISTMAS_SALARY_MONTHS
      : 0;

  return {
    enteredGrossSalary,
    ordinarySalary: roundCurrency(ordinarySalary),
    christmasSalary: roundCurrency(christmasSalary),
    totalGrossSalary: roundCurrency(ordinarySalary + christmasSalary),
  };
}

function withDOChristmasSalaryResult(
  result: CalculationResult,
  inputs: DOCalculatorInputs,
  christmasContext: ReturnType<typeof buildDOChristmasSalaryContext>,
): CalculationResult {
  if (
    result.breakdown.type !== "DO" ||
    !("incomeTax" in result.taxes) ||
    !("socialContributions" in result.taxes)
  ) {
    return result;
  }

  const grossSalary = christmasContext.totalGrossSalary;
  const netSalary = roundCurrency(
    result.netSalary + christmasContext.christmasSalary,
  );
  const sdssSalaryMonthly = getDominicanSdssSalaryMonthly({
    cashSalary: christmasContext.ordinarySalary,
    inputs: {
      ...inputs,
      grossSalary: christmasContext.ordinarySalary,
    },
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const breakdown: DOBreakdown = {
    ...result.breakdown,
    grossIncome: grossSalary,
    christmasSalaryMode: inputs.christmasSalaryMode,
    enteredGrossSalary: christmasContext.enteredGrossSalary,
    ordinarySalary: christmasContext.ordinarySalary,
    christmasSalary: christmasContext.christmasSalary,
    isrAndSddsSalaryBase: christmasContext.ordinarySalary,
    sdssCovered: inputs.sdssCovered,
    sdssSalaryMonthly,
    sdssSalaryAnnual: sdssSalaryMonthly * 12,
    fringeBenefitsTaxedToEmployee: inputs.fringeBenefitsTaxedToEmployee,
  };

  return {
    ...result,
    grossSalary,
    totalDeductions: result.totalDeductions,
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? result.totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const DOCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "DO") {
      throw new Error("DOCalculator can only calculate Dominican Republic inputs");
    }

    const normalizedInputs = normalizeDOInputs(inputs);
    const christmasContext = buildDOChristmasSalaryContext(normalizedInputs);
    const calculationInputs: DOCalculatorInputs = {
      ...normalizedInputs,
      grossSalary: christmasContext.ordinarySalary,
    };
    const result = calculateStandardCountry(calculationInputs, DO_TAX_CONFIG);

    return withDOChristmasSalaryResult(
      result,
      normalizedInputs,
      christmasContext,
    );
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizeDOInputs({
      ...getDODefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
    const christmasContext = buildDOChristmasSalaryContext(normalizedInputs);
    const educationRule = DO_TAX_CONFIG.voluntaryContributions.find(
      (contribution) => contribution.key === "educationExpenses",
    );

    const calculationInputs = {
      ...normalizedInputs,
      grossSalary: christmasContext.ordinarySalary,
    } as CalculatorInputs;
    const baseLimits = baseCalculator.getContributionLimits(calculationInputs);

    if (!educationRule) {
      return baseLimits;
    }

    return {
      ...baseLimits,
      educationExpenses: {
        limit: getDominicanEducationExpenseLimit({
          grossSalary:
            christmasContext.ordinarySalary +
            (normalizedInputs.taxableNonCashBenefits ?? 0),
          inputs: calculationInputs,
        }),
        name: educationRule.name,
        description: educationRule.description,
        preTax: educationRule.taxTreatment === "deduction",
      },
    };
  },

  getDefaultInputs(): DOCalculatorInputs {
    return getDODefaultInputs();
  },
};
