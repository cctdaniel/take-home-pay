import {
  calculateStandardCountry,
  createStandardCountryCalculator,
  type StandardCountryContributionRule,
  type StandardCountryCalculatorInputs,
  type StandardCountryTaxConfig,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { UY_CONFIG } from "./config";
import {
  UY_AGUINALDO_MONTHS,
  UY_BPC,
  UY_FONASA_RATE,
  UY_LABOR_RECONVERSION_RATE,
  UY_MORTGAGE_DEDUCTION_LIMIT_BPC,
  UY_PENSION_RATE,
  UY_TAX_CONFIG,
  UY_VOLUNTARY_AFAP_LIMIT_RATE,
} from "./constants/tax-year-2026";
import type { UYBreakdown, UYCalculatorInputs, UYTaxBreakdown } from "./types";

const baseCalculator = createStandardCountryCalculator(
  UY_CONFIG,
  UY_TAX_CONFIG,
);

function getUYDefaultInputs(): UYCalculatorInputs {
  return {
    country: "UY",
    grossSalary: UY_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfChildren: 0,
    numberOfDisabledChildren: 0,
    housingCreditType: "none",
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
    },
  };
}

function normalizeUYInputs(inputs: CalculatorInputs): UYCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"UY"> &
    Partial<UYCalculatorInputs>;
  const defaultInputs = getUYDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "UY",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfChildren: Math.min(
      Math.max(0, standardInputs.numberOfChildren ?? 0),
      10,
    ),
    numberOfDisabledChildren: Math.min(
      Math.max(0, standardInputs.numberOfDisabledChildren ?? 0),
      10,
    ),
    housingCreditType: standardInputs.housingCreditType ?? "none",
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

function buildUYAguinaldoContext(inputs: UYCalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);

  if (inputs.aguinaldoMode === "includedInGross") {
    const monthlyRegularSalary =
      enteredGrossSalary / (12 + UY_AGUINALDO_MONTHS);
    const regularIrpfIncome = monthlyRegularSalary * 12;
    const aguinaldo = monthlyRegularSalary * UY_AGUINALDO_MONTHS;

    return {
      enteredGrossSalary,
      regularIrpfIncome: roundCurrency(regularIrpfIncome),
      aguinaldo: roundCurrency(aguinaldo),
      socialContributionBase: roundCurrency(enteredGrossSalary),
    };
  }

  const regularIrpfIncome = enteredGrossSalary;
  const aguinaldo =
    inputs.aguinaldoMode === "additionalToGross"
      ? (regularIrpfIncome / 12) * UY_AGUINALDO_MONTHS
      : 0;

  return {
    enteredGrossSalary,
    regularIrpfIncome: roundCurrency(regularIrpfIncome),
    aguinaldo: roundCurrency(aguinaldo),
    socialContributionBase: roundCurrency(regularIrpfIncome + aguinaldo),
  };
}

function buildUYSocialContributionRules(
  context: ReturnType<typeof buildUYAguinaldoContext>,
): StandardCountryContributionRule[] {
  return [
    {
      name: "Employee pension contribution",
      rate: UY_PENSION_RATE,
      calculateAmount: () => context.socialContributionBase * UY_PENSION_RATE,
      preTax: false,
    },
    {
      name: "FONASA health contribution",
      rate: UY_FONASA_RATE,
      calculateAmount: () => context.socialContributionBase * UY_FONASA_RATE,
      preTax: false,
    },
    {
      name: "Labor reconversion fund",
      rate: UY_LABOR_RECONVERSION_RATE,
      calculateAmount: () =>
        context.socialContributionBase * UY_LABOR_RECONVERSION_RATE,
      preTax: false,
    },
  ];
}

function getTopMarginalRate(result: CalculationResult) {
  if (result.breakdown.type !== "UY") {
    return 0;
  }

  return (
    result.breakdown.bracketTaxes[result.breakdown.bracketTaxes.length - 1]
      ?.rate ?? 0
  );
}

function withUYAguinaldoResult(
  result: CalculationResult,
  inputs: UYCalculatorInputs,
  aguinaldoContext: ReturnType<typeof buildUYAguinaldoContext>,
): CalculationResult {
  if (
    result.breakdown.type !== "UY" ||
    !("incomeTax" in result.taxes) ||
    !("socialContributions" in result.taxes)
  ) {
    return result;
  }

  const topMarginalRate = getTopMarginalRate(result);
  const standardTaxes = result.taxes as UYTaxBreakdown;
  const regularIncomeTax = standardTaxes.incomeTax;
  const aguinaldoIncomeTax =
    regularIncomeTax > 0
      ? roundCurrency(aguinaldoContext.aguinaldo * topMarginalRate)
      : 0;
  const incomeTax = roundCurrency(regularIncomeTax + aguinaldoIncomeTax);
  const totalTax = roundCurrency(result.totalTax + aguinaldoIncomeTax);
  const totalDeductions = roundCurrency(
    result.totalDeductions + aguinaldoIncomeTax,
  );
  const grossSalary = aguinaldoContext.socialContributionBase;
  const netSalary = roundCurrency(
    result.netSalary +
      aguinaldoContext.aguinaldo -
      aguinaldoIncomeTax,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const taxes: UYTaxBreakdown = {
    ...standardTaxes,
    incomeTax,
    totalIncomeTax: incomeTax,
    aguinaldoIncomeTax,
  };
  const breakdown: UYBreakdown = {
    ...result.breakdown,
    grossIncome: grossSalary,
    aguinaldoMode: inputs.aguinaldoMode,
    enteredGrossSalary: aguinaldoContext.enteredGrossSalary,
    regularIrpfIncome: aguinaldoContext.regularIrpfIncome,
    aguinaldo: aguinaldoContext.aguinaldo,
    socialContributionBase: aguinaldoContext.socialContributionBase,
    aguinaldoMarginalRate: topMarginalRate,
  };

  return {
    ...result,
    grossSalary,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const UYCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "UY") {
      throw new Error("UYCalculator can only calculate Uruguay inputs");
    }

    const normalizedInputs = normalizeUYInputs(inputs);
    const aguinaldoContext = buildUYAguinaldoContext(normalizedInputs);
    const calculationInputs: UYCalculatorInputs = {
      ...normalizedInputs,
      grossSalary: aguinaldoContext.regularIrpfIncome,
    };
    const calculationConfig: StandardCountryTaxConfig<"UY"> = {
      ...UY_TAX_CONFIG,
      resolveSocialContributions: () =>
        buildUYSocialContributionRules(aguinaldoContext),
      voluntaryContributions: UY_TAX_CONFIG.voluntaryContributions?.map(
        (contribution) => {
          if (contribution.key === "retirementContribution") {
            return {
              ...contribution,
              calculateLimit: () =>
                aguinaldoContext.socialContributionBase *
                UY_VOLUNTARY_AFAP_LIMIT_RATE,
            };
          }

          if (contribution.key === "housingExpenses") {
            return {
              ...contribution,
              calculateLimit: ({ inputs }) =>
                (inputs as UYCalculatorInputs).housingCreditType === "mortgage"
                  ? UY_BPC * UY_MORTGAGE_DEDUCTION_LIMIT_BPC
                  : aguinaldoContext.socialContributionBase,
            };
          }

          return contribution;
        },
      ),
    };
    const result = calculateStandardCountry(calculationInputs, calculationConfig);

    return withUYAguinaldoResult(
      result,
      normalizedInputs,
      aguinaldoContext,
    );
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizeUYInputs({
      ...getUYDefaultInputs(),
      ...inputs,
      country: "UY",
    } as CalculatorInputs);
    const aguinaldoContext = buildUYAguinaldoContext(normalizedInputs);

    return baseCalculator.getContributionLimits({
      ...normalizedInputs,
      grossSalary: aguinaldoContext.socialContributionBase,
    } as CalculatorInputs);
  },

  getDefaultInputs(): UYCalculatorInputs {
    return getUYDefaultInputs();
  },
};
