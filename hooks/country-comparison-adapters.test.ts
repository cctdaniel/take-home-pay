import { describe, expect, it } from "vitest";
import { COUNTRY_COMPARISON_ADAPTERS } from "./country-comparison-adapters.generated";
import type {
  ComparisonInputs,
  CountryComparisonAdapterContext,
} from "./use-country-comparison";
import {
  getCountryConfig,
  getDefaultInputs,
  SUPPORTED_COUNTRIES,
} from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";

const maxRetirementExplanationPattern =
  /Retirement: max|max-retirement|No extra .*retirement|does not add .*retirement|does not auto-fill .*retirement|not add .*retirement|no .*retirement amount|retirement .*not .*deduction|pension .*not .*deduction|voluntary .*not .*deduction|left at zero/i;

function buildInputs(country: CountryCode): ComparisonInputs {
  const defaultInputs = getDefaultInputs(country);

  return {
    baseSalary: defaultInputs.grossSalary,
    baseCurrency: getCountryConfig(country).currency.code,
    maritalStatus: "married",
    numberOfChildren: 2,
    baselineCountry: "US",
    assumptions: {
      isResident: true,
      spouseHasNoIncome: true,
      eligibleNl30Ruling: false,
      eligiblePtNhr2: false,
      usState: "CA",
      age: 35,
      hasYoungChildren: true,
      hasChildUnder3: true,
      hasPrivateHealthInsurance: true,
      retirementContributions: "max",
    },
  };
}

function buildAssumptionsSummary(
  _country: CountryCode,
  inputs: ComparisonInputs,
  retirementApplied: boolean,
): string[] {
  const summary = [
    inputs.maritalStatus === "married" ? "Married" : "Single",
  ];

  if (inputs.numberOfChildren > 0) {
    summary.push(
      `${inputs.numberOfChildren} kid${
        inputs.numberOfChildren > 1 ? "s" : ""
      }`,
    );
  }

  if (retirementApplied) {
    summary.push("Retirement: max");
  }

  return summary;
}

function buildContext(
  country: CountryCode,
  isMaxRetirement: boolean,
): CountryComparisonAdapterContext {
  const config = getCountryConfig(country);
  const currency = config.currency.code;
  const inputs = buildInputs(country);

  return {
    country,
    config,
    currency,
    rate: 1,
    grossLocal: getDefaultInputs(country).grossSalary,
    payFrequency: "monthly",
    inputs,
    isMaxRetirement,
    buildAssumptionsSummary,
  };
}

describe("country comparison adapters", () => {
  it("has a compare adapter for every supported country", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      expect(
        COUNTRY_COMPARISON_ADAPTERS[country],
        `${country} compare adapter`,
      ).toBeTypeOf("function");
    }
  });

  it("makes max-retirement behavior explicit for every supported country", () => {
    const missingExplanations: string[] = [];

    for (const country of SUPPORTED_COUNTRIES) {
      const adapter = COUNTRY_COMPARISON_ADAPTERS[country];

      expect(adapter, `${country} compare adapter`).toBeTypeOf("function");

      const result = adapter?.(buildContext(country, true));

      expect(result, `${country} max-retirement compare result`).not.toBeNull();
      const assumptions = result?.assumptions.join(" ") ?? "";

      if (!maxRetirementExplanationPattern.test(assumptions)) {
        missingExplanations.push(`${country}: ${assumptions}`);
      }
    }

    expect(
      missingExplanations,
      "countries should either apply max retirement or explain why they do not",
    ).toEqual([]);
  });
});
