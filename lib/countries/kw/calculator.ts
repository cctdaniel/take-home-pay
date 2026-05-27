import { createStandardCountryCalculator } from "../shared/standard-country";
import type { StandardCountryBreakdown } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { KW_CONFIG } from "./config";
import {
  getKuwaitPifssSalaryBasesMonthly,
  KW_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { KWBreakdown, KWCalculatorInputs } from "./types";

const baseKWCalculator = createStandardCountryCalculator(
  KW_CONFIG,
  KW_TAX_CONFIG,
);

function getKWDefaultInputs(): KWCalculatorInputs {
  return {
    ...baseKWCalculator.getDefaultInputs(),
    workerType: "expatriate",
    sector: "government",
    pifssInsurableSalaryMonthly: 0,
    pifssBasicSalaryMonthly: 0,
    pifssSupplementarySalaryMonthly: 0,
    includeFinancialRemuneration: false,
  } as KWCalculatorInputs;
}

function normalizeKWInputs(inputs: CalculatorInputs): KWCalculatorInputs {
  const defaultInputs = getKWDefaultInputs();
  const partialInputs = inputs as Partial<KWCalculatorInputs>;

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "KW",
    workerType: partialInputs.workerType ?? "expatriate",
    sector: partialInputs.sector === "privateOil" ? "privateOil" : "government",
    pifssInsurableSalaryMonthly: Math.max(
      0,
      partialInputs.pifssInsurableSalaryMonthly ?? 0,
    ),
    pifssBasicSalaryMonthly: Math.max(
      0,
      partialInputs.pifssBasicSalaryMonthly ?? 0,
    ),
    pifssSupplementarySalaryMonthly: Math.max(
      0,
      partialInputs.pifssSupplementarySalaryMonthly ?? 0,
    ),
    includeFinancialRemuneration:
      partialInputs.includeFinancialRemuneration ?? false,
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
    },
  };
}

export const KWCalculator: CountryCalculator = {
  ...baseKWCalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeKWInputs(inputs);
    const result = baseKWCalculator.calculate(normalizedInputs);
    const pifssSalaryBases = getKuwaitPifssSalaryBasesMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"KW">),
      workerType: normalizedInputs.workerType,
      sector: normalizedInputs.sector,
      pifssInsurableSalaryMonthly: pifssSalaryBases.total,
      pifssInsurableSalaryAnnual: pifssSalaryBases.total * 12,
      pifssBasicSalaryMonthly: pifssSalaryBases.basic,
      pifssSupplementarySalaryMonthly: pifssSalaryBases.supplementary,
      pifssPensionIncreaseSalaryMonthly: pifssSalaryBases.pensionIncrease,
      includeFinancialRemuneration:
        normalizedInputs.includeFinancialRemuneration,
    } satisfies KWBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getKWDefaultInputs() as CalculatorInputs;
  },
};
