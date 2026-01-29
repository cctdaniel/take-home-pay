// ============================================================================
// COMMON TYPES FOR MULTI-COUNTRY SUPPORT
// This file contains shared types and interfaces used across all countries
// ============================================================================

export type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

// ============================================================================
// CURRENCY TYPES
// ============================================================================
export type CurrencyCode = "USD" | "SGD" | "KRW" | "EUR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

// ============================================================================
// COUNTRY TYPES
// ============================================================================
export type CountryCode = "US" | "SG" | "KR" | "NL";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: CurrencyConfig;
  taxYear: number;
  lastUpdated: string;
  defaultRegion?: string;
  supportsFilingStatus: boolean;
  supportsRegions: boolean; // US has states, SG doesn't
}

// ============================================================================
// TAX BRACKET TYPES
// ============================================================================
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// ============================================================================
// FILING STATUS - US Specific but exported for compatibility
// ============================================================================
export type USFilingStatus =
  | "single"
  | "married_jointly"
  | "married_separately"
  | "head_of_household";

// ============================================================================
// RESIDENCY TYPES - Singapore specific
// ============================================================================
export type SGResidencyType = "citizen_pr" | "foreigner";

// ============================================================================
// RESIDENCY TYPES - South Korea specific
// ============================================================================
export type KRResidencyType = "resident" | "non_resident";

// ============================================================================
// CONTRIBUTION TYPES
// ============================================================================
// US-specific contributions
export interface USContributionInputs {
  traditional401k: number;
  rothIRA: number;
  hsa: number;
  hsaCoverageType: "self" | "family";
}

// Singapore-specific contributions (CPF is mandatory, not voluntary)
export interface SGContributionInputs {
  voluntaryCpfTopUp: number; // Voluntary top-up to CPF
  srsContribution: number; // Supplementary Retirement Scheme
}

// South Korea-specific contributions (social insurance is mandatory)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KRContributionInputs {
  // All social insurance contributions are mandatory and calculated automatically
  // This interface is kept for consistency but currently has no optional contributions
}

// Netherlands-specific contributions (none modeled yet)
export type NLContributionInputs = Record<never, never>;

// South Korea additional tax reliefs/deductions (인적공제 및 세액공제)
export interface KRTaxReliefInputs {
  // ============================================================================
  // DEPENDENT DEDUCTIONS (인적공제) - Income deductions
  // ============================================================================
  numberOfDependents: number; // Spouse, parents, siblings - ₩1,500,000 each
  numberOfChildrenUnder20: number; // Children under 20 - ₩1,500,000 each, also used for child tax credit
  numberOfChildrenUnder7: number; // Additional ₩1,000,000 per child under 7

  // ============================================================================
  // VOLUNTARY PENSION (연금저축/IRP) - Tax credit
  // ============================================================================
  personalPensionContribution: number; // Up to ₩9,000,000/year - 13.2% or 16.5% credit

  // ============================================================================
  // OTHER TAX CREDITS (세액공제)
  // ============================================================================
  insurancePremiums: number; // 12% credit, capped at ₩1,000,000
  medicalExpenses: number; // 15% credit on amount exceeding 3% of income
  educationExpenses: number; // 15% credit
  donations: number; // 15% credit (up to ₩10M), 30% above

  // ============================================================================
  // HOUSING (주거 관련)
  // ============================================================================
  monthlyRent: number; // 15-17% credit for renters (income threshold applies)
  isHomeowner: boolean; // If true, not eligible for rent credit

  // ============================================================================
  // NON-TAXABLE INCOME (비과세)
  // ============================================================================
  hasMealAllowance: boolean; // ₩200,000/month not taxed
  hasChildcareAllowance: boolean; // ₩100,000/month not taxed
}

// Singapore additional tax reliefs
export type SGParentReliefType = "none" | "not_staying" | "staying";

export interface SGTaxReliefInputs {
  hasSpouseRelief: boolean; // S$2,000 if spouse income < $4,000
  numberOfChildren: number; // S$4,000 per qualifying child
  isWorkingMother: boolean; // Working Mother's Child Relief (WMCR)
  parentRelief: SGParentReliefType; // S$5,500 (not staying) or S$9,000 (staying)
  numberOfParents: number; // 1 or 2 parents
  courseFees: number; // Up to S$5,500
}

// Union type for all contribution inputs
export type ContributionInputs =
  | USContributionInputs
  | SGContributionInputs
  | KRContributionInputs
  | NLContributionInputs;

// ============================================================================
// CALCULATOR INPUT TYPES
// ============================================================================
export interface BaseCalculatorInputs {
  grossSalary: number;
  payFrequency: PayFrequency;
  country: CountryCode;
}

export interface USCalculatorInputs extends BaseCalculatorInputs {
  country: "US";
  state: string;
  filingStatus: USFilingStatus;
  contributions: USContributionInputs;
}

export interface SGCalculatorInputs extends BaseCalculatorInputs {
  country: "SG";
  residencyType: SGResidencyType;
  age: number; // CPF rates depend on age
  contributions: SGContributionInputs;
  taxReliefs: SGTaxReliefInputs;
}

export interface KRCalculatorInputs extends BaseCalculatorInputs {
  country: "KR";
  residencyType: KRResidencyType;
  contributions: KRContributionInputs;
  taxReliefs: KRTaxReliefInputs;
}

export interface NLCalculatorInputs extends BaseCalculatorInputs {
  country: "NL";
  hasThirtyPercentRuling: boolean;
  hasYoungChildren: boolean; // For IACK (children under 12)
}

export type CalculatorInputs =
  | USCalculatorInputs
  | SGCalculatorInputs
  | KRCalculatorInputs
  | NLCalculatorInputs;

// ============================================================================
// TAX BREAKDOWN TYPES
// ============================================================================
export interface BaseTaxBreakdown {
  // Common across all countries
  totalIncomeTax: number;
}

export interface USTaxBreakdown extends BaseTaxBreakdown {
  federalIncomeTax: number;
  stateIncomeTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  stateDisabilityInsurance: number;
}

export interface SGTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number;
  cpfEmployee: number; // Employee's mandatory CPF contribution
  cpfEmployer: number; // Employer's CPF contribution (informational)
}

export interface KRTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // National income tax
  localIncomeTax: number; // Local income tax (10% of national)
  nationalPension: number; // Employee's share
  nationalHealthInsurance: number; // Employee's share
  longTermCareInsurance: number; // Employee's share
  employmentInsurance: number; // Employee's share
}

export interface NLTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // Pure income tax (payroll tax)
  socialSecurityTax: number; // Volksverzekeringen (AOW, Anw, Wlz)
}

export type TaxBreakdown =
  | USTaxBreakdown
  | SGTaxBreakdown
  | KRTaxBreakdown
  | NLTaxBreakdown;

// ============================================================================
// CALCULATION RESULT TYPES
// ============================================================================
export interface CalculationResult {
  country: CountryCode;
  currency: CurrencyCode;
  grossSalary: number;
  taxableIncome: number;
  taxes: TaxBreakdown;
  totalTax: number;
  totalDeductions: number; // Taxes + contributions
  netSalary: number;
  effectiveTaxRate: number;
  perPeriod: {
    gross: number;
    net: number;
    frequency: PayFrequency;
  };
  // Country-specific breakdown
  breakdown: CountrySpecificBreakdown;
}

// ============================================================================
// COUNTRY-SPECIFIC BREAKDOWN
// ============================================================================
export interface USBreakdown {
  type: "US";
  taxableIncomeForFederal: number;
  taxableIncomeForState: number;
  stateName: string;
  contributions: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };
}

export interface SGBreakdown {
  type: "SG";
  cpfOrdinaryAccount: number;
  cpfSpecialAccount: number;
  cpfMediSaveAccount: number;
  cpfEmployeeTotal: number;
  cpfEmployerTotal: number;
  voluntaryContributions: number;
  // CPF rate details for clarity
  cpfEmployeeRate: number; // Actual CPF rate (e.g., 0.20 for 20%)
  cpfMonthlyCeiling: number; // Monthly wage ceiling (e.g., 8000)
  cpfContributableWage: number; // Wage subject to CPF (capped at ceiling)
  // Tax reliefs breakdown
  taxReliefs: {
    earnedIncomeRelief: number;
    cpfRelief: number;
    srsRelief: number;
    voluntaryCpfTopUpRelief: number;
    // Additional reliefs
    spouseRelief: number;
    childRelief: number;
    workingMotherRelief: number;
    parentRelief: number;
    courseFeesRelief: number;
    totalReliefs: number;
  };
  chargeableIncome: number; // Income after reliefs
  grossTaxBeforeReliefs: number; // Tax on gross income (for comparison with IRAS table)
}

export interface KRBreakdown {
  type: "KR";
  // Taxable income after deductions
  taxableIncome: number;
  // Non-taxable income
  nonTaxableIncome: {
    mealAllowance: number;
    childcareAllowance: number;
    total: number;
  };
  // Social insurance details
  socialInsurance: {
    nationalPension: number;
    nationalPensionRate: number;
    nationalPensionCeiling: number;
    healthInsurance: number;
    healthInsuranceRate: number;
    longTermCare: number;
    longTermCareRate: number;
    employmentInsurance: number;
    employmentInsuranceRate: number;
    totalSocialInsurance: number;
  };
  // Income deductions (소득공제) - reduces taxable income
  incomeDeductions: {
    // Employment income deduction (근로소득공제)
    employmentIncomeDeduction: number;
    // Personal deductions (인적공제)
    basicDeduction: number;
    dependentDeduction: number;
    childDeduction: number;
    childUnder7Deduction: number;
    // Social insurance is also deductible
    socialInsuranceDeduction: number;
    totalDeductions: number;
  };
  // Tax credits (세액공제) - reduces tax directly
  taxCredits: {
    // Automatic credits
    wageEarnerCredit: number;
    standardCredit: number;
    // Family credits
    childTaxCredit: number;
    // Voluntary credits
    pensionCredit: number;
    insuranceCredit: number;
    medicalCredit: number;
    educationCredit: number;
    donationCredit: number;
    rentCredit: number;
    totalCredits: number;
  };
  // Tax details
  taxDetails: {
    grossIncomeTax: number; // Before tax credits
    finalIncomeTax: number;
    localIncomeTax: number;
    totalIncomeTax: number;
  };
}

export interface NLBreakdown {
  type: "NL";
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  // Social security breakdown (volksverzekeringen)
  socialSecurity: {
    aow: number; // General Old Age Pensions Act (17.90%)
    anw: number; // National Survivor Benefits Act (0.10%)
    wlz: number; // Long-term Care Act (9.65%)
    total: number; // Total social security
    ceiling: number; // Income cap for social security
    taxableForSocialSecurity: number; // Income subject to social security (capped)
  };
  // Income tax breakdown (pure income tax portion)
  incomeTaxBreakdown: {
    bracket1Tax: number; // 8.10% of income up to €38,883
    bracket2Tax: number; // 37.56% of income €38,883 to €78,426
    bracket3Tax: number; // 49.50% of income above €78,426
    total: number; // Total income tax before credits
  };
  taxCredits: {
    generalTaxCredit: number;
    laborTaxCredit: number;
    iackCredit: number; // Income-related combination credit (children under 12)
    totalCredits: number;
  };
  taxBeforeCredits: number; // Combined tax before credits
  taxableIncome: number;
  thirtyPercentRulingApplied: boolean;
  taxExemptAllowance: number;
}

export type CountrySpecificBreakdown =
  | USBreakdown
  | SGBreakdown
  | KRBreakdown
  | NLBreakdown;

// ============================================================================
// COUNTRY CALCULATOR INTERFACE
// Each country must implement this interface
// ============================================================================
export interface CountryCalculator {
  countryCode: CountryCode;
  config: CountryConfig;

  // Calculate net salary given inputs
  calculate(inputs: CalculatorInputs): CalculationResult;

  // Get available regions (states for US, empty for SG)
  getRegions(): RegionInfo[];

  // Get contribution limits
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits;

  // Get default inputs for this country
  getDefaultInputs(): CalculatorInputs;
}

// ============================================================================
// REGION INFO (for states/provinces/etc)
// ============================================================================
export interface RegionInfo {
  code: string;
  name: string;
  taxType?: "progressive" | "flat" | "none";
  notes?: string;
}

// ============================================================================
// CONTRIBUTION LIMITS
// ============================================================================
export interface ContributionLimits {
  [key: string]: {
    limit: number;
    name: string;
    description: string;
    preTax: boolean;
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================
export function isUSInputs(
  inputs: CalculatorInputs,
): inputs is USCalculatorInputs {
  return inputs.country === "US";
}

export function isSGInputs(
  inputs: CalculatorInputs,
): inputs is SGCalculatorInputs {
  return inputs.country === "SG";
}

export function isNLInputs(
  inputs: CalculatorInputs,
): inputs is NLCalculatorInputs {
  return inputs.country === "NL";
}

export function isUSTaxBreakdown(taxes: TaxBreakdown): taxes is USTaxBreakdown {
  return "federalIncomeTax" in taxes;
}

export function isSGTaxBreakdown(taxes: TaxBreakdown): taxes is SGTaxBreakdown {
  return "cpfEmployee" in taxes;
}

export function isNLTaxBreakdown(taxes: TaxBreakdown): taxes is NLTaxBreakdown {
  return (
    "incomeTax" in taxes &&
    !("cpfEmployee" in taxes) &&
    !("federalIncomeTax" in taxes)
  );
}

export function isUSBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is USBreakdown {
  return breakdown.type === "US";
}

export function isSGBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SGBreakdown {
  return breakdown.type === "SG";
}

export function isKRInputs(
  inputs: CalculatorInputs,
): inputs is KRCalculatorInputs {
  return inputs.country === "KR";
}

export function isKRTaxBreakdown(taxes: TaxBreakdown): taxes is KRTaxBreakdown {
  return "localIncomeTax" in taxes && "nationalPension" in taxes;
}

export function isKRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KRBreakdown {
  return breakdown.type === "KR";
}

export function isNLBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is NLBreakdown {
  return breakdown.type === "NL";
}
