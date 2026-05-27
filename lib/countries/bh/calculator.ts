import { createStandardCountryCalculator } from "../shared/standard-country";
import type { StandardCountryBreakdown } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { BH_CONFIG } from "./config";
import {
  getBahrainSioWageComponentsMonthly,
  BH_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { BHBreakdown, BHCalculatorInputs } from "./types";

const baseBHCalculator = createStandardCountryCalculator(
  BH_CONFIG,
  BH_TAX_CONFIG,
);

function getBHDefaultInputs(): BHCalculatorInputs {
  return {
    ...baseBHCalculator.getDefaultInputs(),
    workerType: "expatriate",
    sioBasicWageMonthly: 0,
    sioRecurringAllowancesMonthly: 0,
    sioContributoryWageMonthly: 0,
  } as BHCalculatorInputs;
}

function normalizeBHInputs(inputs: CalculatorInputs): BHCalculatorInputs {
  const defaultInputs = getBHDefaultInputs();
  const partialInputs = inputs as Partial<BHCalculatorInputs>;

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "BH",
    workerType: partialInputs.workerType ?? "expatriate",
    sioBasicWageMonthly: Math.max(
      0,
      partialInputs.sioBasicWageMonthly ?? 0,
    ),
    sioRecurringAllowancesMonthly: Math.max(
      0,
      partialInputs.sioRecurringAllowancesMonthly ?? 0,
    ),
    sioContributoryWageMonthly: Math.max(
      0,
      partialInputs.sioContributoryWageMonthly ?? 0,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
    },
  };
}

export const BHCalculator: CountryCalculator = {
  ...baseBHCalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeBHInputs(inputs);
    const result = baseBHCalculator.calculate(normalizedInputs);
    const sioWageComponents = getBahrainSioWageComponentsMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"BH">),
      workerType: normalizedInputs.workerType,
      sioBasicWageMonthly: sioWageComponents.sioBasicWageMonthly,
      sioRecurringAllowancesMonthly:
        sioWageComponents.sioRecurringAllowancesMonthly,
      sioSelectedWageMonthly: sioWageComponents.sioSelectedWageMonthly,
      sioContributoryWageMonthly:
        sioWageComponents.sioContributoryWageMonthly,
      sioContributoryWageAnnual:
        sioWageComponents.sioContributoryWageMonthly * 12,
    } satisfies BHBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getBHDefaultInputs() as CalculatorInputs;
  },
};
