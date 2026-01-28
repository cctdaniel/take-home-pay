// ============================================================================
// 2026 FEDERAL TAX BRACKETS
// Re-exports from the new countries/us module for backwards compatibility
// ============================================================================

// Re-export types
export type { USFilingStatus as FilingStatus, TaxBracket } from "../countries/types";

// Re-export constants from the new US module
export {
  FEDERAL_TAX_BRACKETS,
  STANDARD_DEDUCTIONS,
  CALIFORNIA_TAX_BRACKETS,
  CA_STANDARD_DEDUCTIONS,
} from "../countries/us/constants/tax-brackets-2026";
