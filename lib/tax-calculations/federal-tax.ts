// ============================================================================
// FEDERAL TAX MODULE
// Re-exports from the new countries/us module for backwards compatibility
// ============================================================================

export {
  calculateFederalIncomeTax,
  getFederalTaxableIncome,
  getStandardDeduction,
} from "../countries/us/federal-tax";
