"use client";

import { getCountryConfig, SUPPORTED_COUNTRIES } from "@/lib/countries/registry";
import type {
  CalculationResult,
  CountryCode,
  CountryConfig,
  CurrencyCode,
  PayFrequency,
} from "@/lib/countries/types";
import { useMemo } from "react";
import { COUNTRY_COMPARISON_ADAPTERS } from "./country-comparison-adapters.generated";
import type { FxRatesResponse } from "./use-fx-rates";

export type MaritalStatus = "single" | "married";

export interface ComparisonAssumptions {
  isResident: boolean;
  spouseHasNoIncome: boolean;
  eligibleNl30Ruling: boolean;
  eligiblePtNhr2: boolean;
  usState: string;
  age: number;
  hasYoungChildren: boolean;
  hasChildUnder3: boolean;
  hasPrivateHealthInsurance: boolean;
  retirementContributions: "none" | "max";
}

export interface ComparisonInputs {
  baseSalary: number;
  baseCurrency: CurrencyCode;
  maritalStatus: MaritalStatus;
  numberOfChildren: number;
  baselineCountry: CountryCode;
  assumptions: ComparisonAssumptions;
}

export interface CountryComparison {
  country: CountryCode;
  name: string;
  currency: CurrencyCode;
  rate: number;
  grossLocal: number;
  netLocal: number;
  netBase: number;
  takeHomeRate: number;
  effectiveTaxRate: number;
  deltaBase: number;
  deltaPercent: number;
  assumptions: string[];
  calculation: CalculationResult;
  usState?: string;
  usContributions?: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
    healthFsa?: number;
    dependentCareFsa?: number;
  };
}

export interface ComparisonOutput {
  isReady: boolean;
  results: CountryComparison[];
  baseline?: CountryComparison;
  fxUpdatedAt?: string;
}

export interface CountryComparisonAdapterContext {
  country: CountryCode;
  config: CountryConfig;
  currency: CurrencyCode;
  rate: number;
  grossLocal: number;
  payFrequency: PayFrequency;
  inputs: ComparisonInputs;
  isMaxRetirement: boolean;
  buildAssumptionsSummary: (
    country: CountryCode,
    inputs: ComparisonInputs,
    retirementApplied: boolean,
  ) => string[];
}

export type CountryComparisonAdapter = (
  context: CountryComparisonAdapterContext,
) => CountryComparison | null;

function buildAssumptionsSummary(
  _country: CountryCode,
  inputs: ComparisonInputs,
  retirementApplied: boolean,
): string[] {
  const summary: string[] = [];
  const { maritalStatus, numberOfChildren } = inputs;

  summary.push(maritalStatus === "married" ? "Married" : "Single");

  if (numberOfChildren > 0) {
    summary.push(`${numberOfChildren} kid${numberOfChildren > 1 ? "s" : ""}`);
  }

  if (retirementApplied) {
    summary.push("Retirement: max");
  }

  return summary;
}

export function useCountryComparison(
  inputs: ComparisonInputs,
  fxRates: FxRatesResponse | null,
): ComparisonOutput {
  return useMemo(() => {
    if (!fxRates) {
      return {
        isReady: false,
        results: [],
      };
    }

    const payFrequency: PayFrequency = "monthly";
    const isMaxRetirement =
      inputs.assumptions.retirementContributions === "max";
    const results = SUPPORTED_COUNTRIES.reduce<CountryComparison[]>(
      (acc, country) => {
        const config = getCountryConfig(country);
        const currency = config.currency.code;
        const rate = fxRates.rates[currency];

        if (!rate || rate <= 0) {
          return acc;
        }

        const adapter = COUNTRY_COMPARISON_ADAPTERS[country];

        if (!adapter) {
          return acc;
        }

        const grossLocal = inputs.baseSalary * rate;
        const adaptedResult = adapter({
          country,
          config,
          currency,
          rate,
          grossLocal,
          payFrequency,
          inputs,
          isMaxRetirement,
          buildAssumptionsSummary,
        });

        if (adaptedResult) {
          acc.push(adaptedResult);
        }

        return acc;
      },
      [],
    ).sort((a, b) => b.netBase - a.netBase);

    const baseline = results.find(
      (result) => result.country === inputs.baselineCountry,
    );

    const baselineNetBase = baseline?.netBase ?? 0;

    const adjustedResults = results.map((result) => {
      const deltaBase = baselineNetBase ? result.netBase - baselineNetBase : 0;
      const deltaPercent = baselineNetBase ? deltaBase / baselineNetBase : 0;
      return {
        ...result,
        deltaBase,
        deltaPercent,
      };
    });

    return {
      isReady: true,
      results: adjustedResults,
      baseline,
      fxUpdatedAt: fxRates.updatedAt,
    };
  }, [fxRates, inputs]);
}
