// ============================================================================
// SINGAPORE COUNTRY MODULE - MAIN EXPORT
// ============================================================================

export { SGCalculator, calculateSG } from "./calculator";
export { SG_CONFIG, SG_CURRENCY } from "./config";

// CPF exports
export {
  getCPFRates,
  calculateMonthlyCPF,
  calculateAnnualCPF,
  CPF_MONTHLY_CEILING,
  CPF_ANNUAL_ORDINARY_WAGE_CEILING,
  CPF_RATES_CITIZEN_PR,
  CPF_RATES_FOREIGNER,
  CPF_VOLUNTARY_TOPUP_LIMIT,
  SRS_ANNUAL_LIMIT_CITIZEN_PR,
  SRS_ANNUAL_LIMIT_FOREIGNER,
  getSRSLimit,
  type CPFRates,
} from "./constants/cpf-rates-2026";

// Tax exports
export {
  SG_TAX_BRACKETS,
  SG_NON_RESIDENT_FLAT_RATE,
  SG_TAX_RELIEFS,
  calculateProgressiveTax,
  calculateSGIncomeTax,
  getEarnedIncomeRelief,
} from "./constants/tax-brackets-2026";
