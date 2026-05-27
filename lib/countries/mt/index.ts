export { MTCalculator, calculateMT } from "./calculator";
export { MT_CONFIG, MT_CURRENCY } from "./config";
export type {
  MTBreakdown,
  MTCalculatorInputs,
  MTContributionInputs,
  MTLowIncomeSscOption,
  MTResidencyType,
  MTSSCBirthCohort,
  MTSchoolFeeLevel,
  MTTaxBreakdown,
  MTTaxReliefInputs,
  MTTaxScenario,
  MTTaxStatus,
} from "./types";
export {
  MALTA_CLASS_1_SSC_2026,
  MALTA_EMPLOYMENT_INCOME_DEDUCTION_2026,
  MALTA_NOMAD_RESIDENCE_PERMIT_2026,
  MALTA_NON_RESIDENT_TAX_SCHEDULE_2026,
  MALTA_QUALIFYING_FEE_DEDUCTIONS_2026,
  MALTA_RESIDENT_TAX_SCHEDULES_2026,
  MALTA_RETIREMENT_TAX_CREDITS_2026,
  MALTA_TAX_STATUS_NAMES,
  calculateMaltaClass1Ssc,
  calculateMaltaEmploymentIncomeDeduction,
  calculateMaltaIncomeTax,
  calculateMaltaRetirementTaxCredit,
  getMaltaSchoolFeeLimit,
  getMaltaTaxSchedule,
} from "./constants/tax-brackets-2026";
