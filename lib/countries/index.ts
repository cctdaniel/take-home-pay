// ============================================================================
// COUNTRIES MODULE - MAIN EXPORT
// This is the main entry point for multi-country support
// ============================================================================

// Types
export * from "./types";

// Currency utilities
export * from "./currency";

// Country registry
export {
  getCountryCalculator,
  calculateNetSalary,
  getDefaultInputs,
  getCountryConfig,
  isCountrySupported,
  getSupportedCountries,
  SUPPORTED_COUNTRIES,
  COUNTRY_CONFIGS,
} from "./registry";

// US Calculator
export { USCalculator, calculateUS, US_CONFIG, US_CURRENCY } from "./us";

// Singapore Calculator
export { SGCalculator, calculateSG, SG_CONFIG, SG_CURRENCY } from "./sg";

// South Korea Calculator
export { KRCalculator, calculateKR, KR_CONFIG, KR_CURRENCY } from "./kr";

// Re-export US constants for backwards compatibility
export {
  FEDERAL_TAX_BRACKETS,
  STANDARD_DEDUCTIONS,
  CALIFORNIA_TAX_BRACKETS,
  CA_STANDARD_DEDUCTIONS,
} from "./us";

export {
  CONTRIBUTION_LIMITS,
  CONTRIBUTION_LIMITS_2025,
  getHSALimit,
  type HSACoverageType,
} from "./us";

export {
  getStateCalculator,
  hasNoIncomeTax,
  getSupportedStates,
  getStateOptions,
} from "./us";
