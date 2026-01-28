// ============================================================================
// PAYROLL TAX MODULE
// Re-exports from the new countries/us module for backwards compatibility
// ============================================================================

export {
  calculateSocialSecurity,
  calculateMedicare,
  calculateAdditionalMedicare,
  calculatePayrollTaxes,
  PAYROLL_TAX_INFO,
} from "../countries/us/payroll-tax";
