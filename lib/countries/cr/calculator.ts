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
import { CR_CONFIG } from "./config";
import { CR_AGUINALDO_MONTHS, CR_TAX_CONFIG } from "./constants/tax-year-2026";
import type { CRBreakdown, CRCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  CR_CONFIG,
  CR_TAX_CONFIG,
);

function getCRDefaultInputs(): CRCalculatorInputs {
  return {
    country: "CR",
    grossSalary: CR_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    hasEligibleSpouse: false,
    numberOfChildren: 0,
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeCRInputs(inputs: CalculatorInputs): CRCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"CR"> &
    Partial<CRCalculatorInputs>;
  const defaultInputs = getCRDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "CR",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    hasEligibleSpouse: standardInputs.hasEligibleSpouse ?? false,
    numberOfChildren: Math.min(
      Math.max(0, standardInputs.numberOfChildren ?? 0),
      10,
    ),
    aguinaldoMode: standardInputs.aguinaldoMode ?? defaultInputs.aguinaldoMode,
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

function buildCRAguinaldoContext(inputs: CRCalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);

  if (inputs.aguinaldoMode === "includedInGross") {
    const monthlyRegularSalary =
      enteredGrossSalary / (12 + CR_AGUINALDO_MONTHS);
    const regularTaxableSalary = monthlyRegularSalary * 12;
    const aguinaldo = monthlyRegularSalary * CR_AGUINALDO_MONTHS;

    return {
      enteredGrossSalary,
      regularTaxableSalary: roundCurrency(regularTaxableSalary),
      aguinaldo: roundCurrency(aguinaldo),
      totalCashGross: roundCurrency(enteredGrossSalary),
    };
  }

  const regularTaxableSalary = enteredGrossSalary;
  const aguinaldo =
    inputs.aguinaldoMode === "additionalToGross"
      ? (regularTaxableSalary / 12) * CR_AGUINALDO_MONTHS
      : 0;

  return {
    enteredGrossSalary,
    regularTaxableSalary: roundCurrency(regularTaxableSalary),
    aguinaldo: roundCurrency(aguinaldo),
    totalCashGross: roundCurrency(regularTaxableSalary + aguinaldo),
  };
}

function withCRGrossAndBreakdown(
  result: CalculationResult,
  inputs: CRCalculatorInputs,
  aguinaldoContext: ReturnType<typeof buildCRAguinaldoContext>,
): CalculationResult {
  if (result.breakdown.type !== "CR") {
    return result;
  }

  const totalCashGross = aguinaldoContext.totalCashGross;
  const netSalary = roundCurrency(result.netSalary + aguinaldoContext.aguinaldo);
  const totalTax = roundCurrency(result.totalTax);
  const totalDeductions = roundCurrency(result.totalDeductions);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const breakdown: CRBreakdown = {
    ...result.breakdown,
    grossIncome: totalCashGross,
    aguinaldoMode: inputs.aguinaldoMode,
    enteredGrossSalary: aguinaldoContext.enteredGrossSalary,
    regularTaxableSalary: aguinaldoContext.regularTaxableSalary,
    aguinaldo: aguinaldoContext.aguinaldo,
    totalCashGross,
  };

  return {
    ...result,
    grossSalary: totalCashGross,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: totalCashGross > 0 ? totalTax / totalCashGross : 0,
    perPeriod: {
      gross: totalCashGross / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const CRCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "CR") {
      throw new Error("CRCalculator can only calculate Costa Rica inputs");
    }

    const normalizedInputs = normalizeCRInputs(inputs);
    const aguinaldoContext = buildCRAguinaldoContext(normalizedInputs);
    const calculationInputs: CRCalculatorInputs = {
      ...normalizedInputs,
      grossSalary: aguinaldoContext.regularTaxableSalary,
    };
    const result = calculateStandardCountry(calculationInputs, CR_TAX_CONFIG);

    return withCRGrossAndBreakdown(result, normalizedInputs, aguinaldoContext);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizeCRInputs({
      ...getCRDefaultInputs(),
      ...inputs,
      country: "CR",
    } as CalculatorInputs);
    const aguinaldoContext = buildCRAguinaldoContext(normalizedInputs);

    return baseCalculator.getContributionLimits({
      ...normalizedInputs,
      grossSalary: aguinaldoContext.regularTaxableSalary,
    } as CalculatorInputs);
  },

  getDefaultInputs(): CRCalculatorInputs {
    return getCRDefaultInputs();
  },
};
