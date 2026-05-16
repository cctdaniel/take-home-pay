// ============================================================================
// COUNTRY REGISTRY
// Central registry for all country calculators
// ============================================================================

import { AUCalculator } from "./au";
import { DECalculator } from "./de";
import { HKCalculator } from "./hk";
import { IDCalculator } from "./id";
import { KRCalculator } from "./kr";
import { MYCalculator } from "./my";
import { NLCalculator } from "./nl";
import { PTCalculator } from "./pt";
import { SGCalculator } from "./sg";
import { THCalculator } from "./th";
import { TWCalculator } from "./tw";
import { UKCalculator } from "./uk";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  CountryCode,
  CountryConfig,
} from "./types";
import { USCalculator } from "./us";

interface CountryRegistryEntry {
  code: CountryCode;
  calculator: CountryCalculator;
}

// COUNTRY CALCULATORS REGISTRY
// ============================================================================
const COUNTRY_REGISTRY: CountryRegistryEntry[] = [
  { code: "US", calculator: USCalculator },
  { code: "AU", calculator: AUCalculator },
  { code: "DE", calculator: DECalculator },
  { code: "HK", calculator: HKCalculator },
  { code: "ID", calculator: IDCalculator },
  { code: "MY", calculator: MYCalculator },
  { code: "NL", calculator: NLCalculator },
  { code: "PT", calculator: PTCalculator },
  { code: "SG", calculator: SGCalculator },
  { code: "KR", calculator: KRCalculator },
  { code: "TW", calculator: TWCalculator },
  { code: "TH", calculator: THCalculator },
  { code: "UK", calculator: UKCalculator },
];

const countryCalculators: Record<CountryCode, CountryCalculator> =
  Object.fromEntries(
    COUNTRY_REGISTRY.map(({ code, calculator }) => [code, calculator]),
  ) as Record<CountryCode, CountryCalculator>;

// ============================================================================
// SUPPORTED COUNTRIES
// ============================================================================
export const SUPPORTED_COUNTRIES: CountryCode[] = COUNTRY_REGISTRY.map(
  ({ code }) => code,
);

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> =
  Object.fromEntries(
    COUNTRY_REGISTRY.map(({ code, calculator }) => [code, calculator.config]),
  ) as Record<CountryCode, CountryConfig>;

// ============================================================================
// REGISTRY FUNCTIONS
// ============================================================================

/**
 * Get a country calculator by country code
 */
export function getCountryCalculator(
  countryCode: CountryCode,
): CountryCalculator {
  const calculator = countryCalculators[countryCode];
  if (!calculator) {
    throw new Error(`Unsupported country: ${countryCode}`);
  }
  return calculator;
}

/**
 * Calculate net salary for any supported country
 */
export function calculateNetSalary(
  inputs: CalculatorInputs,
): CalculationResult {
  const calculator = getCountryCalculator(inputs.country);
  return calculator.calculate(inputs);
}

/**
 * Get default inputs for a country
 */
export function getDefaultInputs(countryCode: CountryCode): CalculatorInputs {
  const calculator = getCountryCalculator(countryCode);
  return calculator.getDefaultInputs();
}

/**
 * Get country configuration
 */
export function getCountryConfig(countryCode: CountryCode): CountryConfig {
  return COUNTRY_CONFIGS[countryCode];
}

/**
 * Check if a country is supported
 */
export function isCountrySupported(
  countryCode: string,
): countryCode is CountryCode {
  return SUPPORTED_COUNTRIES.includes(countryCode as CountryCode);
}

/**
 * Get list of all supported countries with their names
 */
export function getSupportedCountries(): { code: CountryCode; name: string }[] {
  return COUNTRY_REGISTRY.map(({ code, calculator }) => ({
    code,
    name: calculator.config.name,
  }));
}
