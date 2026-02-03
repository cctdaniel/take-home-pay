// ============================================================================
// COUNTRY REGISTRY
// Central registry for all country calculators
// ============================================================================

import { AUCalculator } from "./au";
import { DECalculator } from "./de";
import { HKCalculator } from "./hk";
import { IDCalculator } from "./id";
import { KRCalculator } from "./kr";
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

// ============================================================================
// COUNTRY CALCULATORS REGISTRY
// ============================================================================
const countryCalculators: Record<CountryCode, CountryCalculator> = {
  US: USCalculator,
  SG: SGCalculator,
  KR: KRCalculator,
  NL: NLCalculator,
  AU: AUCalculator,
  PT: PTCalculator,
  TH: THCalculator,
  HK: HKCalculator,
  ID: IDCalculator,
  TW: TWCalculator,
  UK: UKCalculator,
  DE: DECalculator,
};

// ============================================================================
// SUPPORTED COUNTRIES
// ============================================================================
// US first, then alphabetical by country name: Australia, Hong Kong, Netherlands, Portugal, Singapore, South Korea, Taiwan, Thailand
export const SUPPORTED_COUNTRIES: CountryCode[] = ["US", "AU", "HK", "ID", "NL", "PT", "SG", "KR", "TW", "TH"];
// US first, then alphabetical by country name: Australia, Germany, Hong Kong, Indonesia, Netherlands, Portugal, Singapore, South Korea, Thailand, UK
export const SUPPORTED_COUNTRIES: CountryCode[] = ["US", "AU", "DE", "HK", "ID", "NL", "PT", "SG", "KR", "TH", "UK"];

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  US: USCalculator.config,
  SG: SGCalculator.config,
  KR: KRCalculator.config,
  NL: NLCalculator.config,
  AU: AUCalculator.config,
  PT: PTCalculator.config,
  TH: THCalculator.config,
  HK: HKCalculator.config,
  ID: IDCalculator.config,
  TW: TWCalculator.config,
  UK: UKCalculator.config,
  DE: DECalculator.config,
};

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
  return SUPPORTED_COUNTRIES.map((code) => ({
    code,
    name: COUNTRY_CONFIGS[code].name,
  }));
}
