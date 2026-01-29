// ============================================================================
// COMMON TYPES FOR MULTI-COUNTRY SUPPORT
// This file contains shared types and interfaces used across all countries
// ============================================================================

export type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

// ============================================================================
// CURRENCY TYPES
// ============================================================================
export type CurrencyCode = "USD" | "SGD" | "EUR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

// ============================================================================
// COUNTRY TYPES
// ============================================================================
export type CountryCode = "US" | "SG" | "NL";

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
export type USFilingStatus = "single" | "married_jointly" | "married_separately" | "head_of_household";

// ============================================================================
// RESIDENCY TYPES - Singapore specific
// ============================================================================
export type SGResidencyType = "citizen_pr" | "foreigner";

// ============================================================================
// CONTRIBUTION TYPES - Country agnostic base
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseContributionInputs {
  // Each country will extend this with their specific contribution types
}

// US-specific contributions
export interface USContributionInputs extends BaseContributionInputs {
  traditional401k: number;
  rothIRA: number;
  hsa: number;
  hsaCoverageType: "self" | "family";
}

// Singapore-specific contributions (CPF is mandatory, not voluntary)
export interface SGContributionInputs extends BaseContributionInputs {
  voluntaryCpfTopUp: number; // Voluntary top-up to CPF
  srsContribution: number; // Supplementary Retirement Scheme
}

// Netherlands-specific contributions (none modeled yet)
export interface NLContributionInputs extends BaseContributionInputs {}

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
export type ContributionInputs = USContributionInputs | SGContributionInputs | NLContributionInputs;

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

export interface NLCalculatorInputs extends BaseCalculatorInputs {
  country: "NL";
}

export type CalculatorInputs = USCalculatorInputs | SGCalculatorInputs | NLCalculatorInputs;

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

export interface NLTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number;
}

export type TaxBreakdown = USTaxBreakdown | SGTaxBreakdown | NLTaxBreakdown;

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

export interface NLBreakdown {
  type: "NL";
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  taxCredits: {
    generalTaxCredit: number;
    laborTaxCredit: number;
    totalCredits: number;
  };
  taxBeforeCredits: number;
}

export type CountrySpecificBreakdown = USBreakdown | SGBreakdown | NLBreakdown;

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
export function isUSInputs(inputs: CalculatorInputs): inputs is USCalculatorInputs {
  return inputs.country === "US";
}

export function isSGInputs(inputs: CalculatorInputs): inputs is SGCalculatorInputs {
  return inputs.country === "SG";
}

export function isNLInputs(inputs: CalculatorInputs): inputs is NLCalculatorInputs {
  return inputs.country === "NL";
}

export function isUSTaxBreakdown(taxes: TaxBreakdown): taxes is USTaxBreakdown {
  return "federalIncomeTax" in taxes;
}

export function isSGTaxBreakdown(taxes: TaxBreakdown): taxes is SGTaxBreakdown {
  return "cpfEmployee" in taxes;
}

export function isNLTaxBreakdown(taxes: TaxBreakdown): taxes is NLTaxBreakdown {
  return "incomeTax" in taxes && !("cpfEmployee" in taxes) && !("federalIncomeTax" in taxes);
}

export function isUSBreakdown(breakdown: CountrySpecificBreakdown): breakdown is USBreakdown {
  return breakdown.type === "US";
}

export function isSGBreakdown(breakdown: CountrySpecificBreakdown): breakdown is SGBreakdown {
  return breakdown.type === "SG";
}

export function isNLBreakdown(breakdown: CountrySpecificBreakdown): breakdown is NLBreakdown {
  return breakdown.type === "NL";
}
