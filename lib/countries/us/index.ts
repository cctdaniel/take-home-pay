// ============================================================================
// US COUNTRY MODULE - MAIN EXPORT
// ============================================================================

export { USCalculator, calculateUS } from "./calculator";
export { US_CONFIG, US_CURRENCY } from "./config";

// Federal tax exports
export { calculateFederalIncomeTax, getFederalTaxableIncome, getStandardDeduction } from "./federal-tax";

// Payroll tax exports
export { calculatePayrollTaxes, calculateSocialSecurity, calculateMedicare, calculateAdditionalMedicare, PAYROLL_TAX_INFO } from "./payroll-tax";

// State tax exports
export { getStateCalculator, hasNoIncomeTax, getSupportedStates, getStateOptions, type StateCalculator } from "./state-tax";

// Constants exports
export { FEDERAL_TAX_BRACKETS, STANDARD_DEDUCTIONS, CALIFORNIA_TAX_BRACKETS, CA_STANDARD_DEDUCTIONS } from "./constants/tax-brackets-2026";
export { CONTRIBUTION_LIMITS, CONTRIBUTION_LIMITS_2025, getHSALimit, getUSContributionLimits, type HSACoverageType } from "./constants/contribution-limits";
