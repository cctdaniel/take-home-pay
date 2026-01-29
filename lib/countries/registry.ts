// ============================================================================
// COUNTRY REGISTRY
// Central registry for all country calculators
// ============================================================================

import type {
  CountryCode,
  CountryConfig,
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
} from "./types";
import { USCalculator } from "./us";
import { SGCalculator } from "./sg";
import { KRCalculator } from "./kr";
import { NLCalculator } from "./nl";

// ============================================================================
// COUNTRY CALCULATORS REGISTRY
// ============================================================================
const countryCalculators: Record<CountryCode, CountryCalculator> = {
  US: USCalculator,
  SG: SGCalculator,
  KR: KRCalculator,
  NL: NLCalculator,
};

// ============================================================================
// SUPPORTED COUNTRIES
// ============================================================================
export const SUPPORTED_COUNTRIES: CountryCode[] = ["US", "SG", "KR", "NL"];

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  US: USCalculator.config,
  SG: SGCalculator.config,
  KR: KRCalculator.config,
  NL: NLCalculator.config,
};

// ============================================================================
// REGISTRY FUNCTIONS
// ============================================================================

/**
 * Get a country calculator by country code
 */
export function getCountryCalculator(countryCode: CountryCode): CountryCalculator {
  const calculator = countryCalculators[countryCode];
  if (!calculator) {
    throw new Error(`Unsupported country: ${countryCode}`);
  }
  return calculator;
}

/**
 * Calculate net salary for any supported country
 */
export function calculateNetSalary(inputs: CalculatorInputs): CalculationResult {
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
export function isCountrySupported(countryCode: string): countryCode is CountryCode {
  return SUPPORTED_COUNTRIES.includes(countryCode as CountryCode);
}

/**
 * Get list of all supported countries with their names
 */
export function getSupportedCountries(): { code: CountryCode; name: string }[] {
  return SUPPORTED_COUNTRIES.map(code => ({
    code,
    name: COUNTRY_CONFIGS[code].name,
  }));
}
