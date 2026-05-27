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
import { PY_CONFIG } from "./config";
import {
  PY_AGUINALDO_MONTHS,
  PY_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { PYBreakdown, PYCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  PY_CONFIG,
  PY_TAX_CONFIG,
);

function getPYDefaultInputs(): PYCalculatorInputs {
  return {
    country: "PY",
    grossSalary: PY_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    ipsCovered: true,
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizePYInputs(inputs: CalculatorInputs): PYCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"PY"> &
    Partial<PYCalculatorInputs>;
  const defaultInputs = getPYDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "PY",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    ipsCovered: standardInputs.ipsCovered ?? true,
    aguinaldoMode: standardInputs.aguinaldoMode ?? "includedInGross",
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

function buildPYAguinaldoContext(inputs: PYCalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);

  if (inputs.aguinaldoMode === "includedInGross") {
    const ordinaryMonthlySalary =
      enteredGrossSalary / (12 + PY_AGUINALDO_MONTHS);
    const ordinarySalary = ordinaryMonthlySalary * 12;
    const aguinaldo = ordinaryMonthlySalary * PY_AGUINALDO_MONTHS;

    return {
      enteredGrossSalary,
      ordinarySalary: roundCurrency(ordinarySalary),
      aguinaldo: roundCurrency(aguinaldo),
      totalGrossSalary: roundCurrency(enteredGrossSalary),
    };
  }

  const ordinarySalary = enteredGrossSalary;
  const aguinaldo =
    inputs.aguinaldoMode === "additionalToGross"
      ? (ordinarySalary / 12) * PY_AGUINALDO_MONTHS
      : 0;

  return {
    enteredGrossSalary,
    ordinarySalary: roundCurrency(ordinarySalary),
    aguinaldo: roundCurrency(aguinaldo),
    totalGrossSalary: roundCurrency(ordinarySalary + aguinaldo),
  };
}

function withPYAguinaldoResult(
  result: CalculationResult,
  inputs: PYCalculatorInputs,
  aguinaldoContext: ReturnType<typeof buildPYAguinaldoContext>,
): CalculationResult {
  if (
    result.breakdown.type !== "PY" ||
    !("incomeTax" in result.taxes) ||
    !("socialContributions" in result.taxes)
  ) {
    return result;
  }

  const grossSalary = aguinaldoContext.totalGrossSalary;
  const netSalary = roundCurrency(result.netSalary + aguinaldoContext.aguinaldo);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const breakdown: PYBreakdown = {
    ...result.breakdown,
    grossIncome: grossSalary,
    aguinaldoMode: inputs.aguinaldoMode,
    enteredGrossSalary: aguinaldoContext.enteredGrossSalary,
    ordinarySalary: aguinaldoContext.ordinarySalary,
    aguinaldo: aguinaldoContext.aguinaldo,
    taxableAndIpsSalaryBase: aguinaldoContext.ordinarySalary,
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

export const PYCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "PY") {
      throw new Error("PYCalculator can only calculate Paraguay inputs");
    }

    const normalizedInputs = normalizePYInputs(inputs);
    const aguinaldoContext = buildPYAguinaldoContext(normalizedInputs);
    const result = calculateStandardCountry(
      {
        ...normalizedInputs,
        grossSalary: aguinaldoContext.ordinarySalary,
      } as StandardCountryCalculatorInputs<"PY">,
      PY_TAX_CONFIG,
    );

    return withPYAguinaldoResult(result, normalizedInputs, aguinaldoContext);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizePYInputs({
      ...getPYDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
    const aguinaldoContext = buildPYAguinaldoContext(normalizedInputs);

    return baseCalculator.getContributionLimits({
      ...normalizedInputs,
      grossSalary: aguinaldoContext.ordinarySalary,
    } as CalculatorInputs);
  },

  getDefaultInputs(): PYCalculatorInputs {
    return getPYDefaultInputs();
  },
};
