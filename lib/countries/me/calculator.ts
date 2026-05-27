import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { ME_CONFIG } from "./config";
import {
  ME_MUNICIPAL_SURTAX_RATES,
  ME_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  MEBreakdown,
  MECalculatorInputs,
  MEIncomeScenario,
  MEMunicipalSurtaxRate,
  METaxBreakdown,
} from "./types";

const baseCalculator = createStandardCountryCalculator(
  ME_CONFIG,
  ME_TAX_CONFIG,
);

function normalizeIncomeScenario(value: unknown): MEIncomeScenario {
  return value === "digitalNomadForeignSource"
    ? "digitalNomadForeignSource"
    : "montenegroPayroll";
}

function normalizeMunicipalSurtaxRate(value: unknown): MEMunicipalSurtaxRate {
  if (value === "podgoricaCetinje15" || value === "budva10") {
    return value;
  }

  return "standard13";
}

function normalizeMEInputs(inputs: CalculatorInputs): MECalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"ME"> &
    Partial<MECalculatorInputs>;
  const incomeScenario = normalizeIncomeScenario(standardInputs.incomeScenario);

  return {
    ...standardInputs,
    country: "ME",
    grossSalary: standardInputs.grossSalary,
    taxableNonCashBenefits:
      incomeScenario === "digitalNomadForeignSource"
        ? 0
        : Math.max(0, standardInputs.taxableNonCashBenefits ?? 0),
    payFrequency: standardInputs.payFrequency,
    incomeScenario,
    municipalSurtaxRate: normalizeMunicipalSurtaxRate(
      standardInputs.municipalSurtaxRate,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getMEDefaultInputs(): MECalculatorInputs {
  return {
    country: "ME",
    grossSalary: ME_TAX_CONFIG.defaultSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "monthly",
    incomeScenario: "montenegroPayroll",
    municipalSurtaxRate: "standard13",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export const MECalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "ME") {
      throw new Error("MECalculator can only calculate Montenegro inputs");
    }

    const normalizedInputs = normalizeMEInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const taxes = result.taxes as METaxBreakdown;
    const municipalSurtax =
      ME_MUNICIPAL_SURTAX_RATES[normalizedInputs.municipalSurtaxRate];
    const breakdown = {
      ...(result.breakdown as MEBreakdown),
      incomeScenario: normalizedInputs.incomeScenario,
      municipalSurtaxRate: normalizedInputs.municipalSurtaxRate,
      municipalSurtaxName: municipalSurtax.name,
      municipalSurtaxRateValue: municipalSurtax.rate,
      municipalSurtaxEmployerCostEstimate: roundCurrency(
        taxes.incomeTax * municipalSurtax.rate,
      ),
    } satisfies MEBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getMEDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeMEInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<MECalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): MECalculatorInputs {
    return getMEDefaultInputs();
  },
};
