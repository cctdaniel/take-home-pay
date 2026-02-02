// ============================================================================
// COMMON TYPES FOR MULTI-COUNTRY SUPPORT
// This file contains shared types and interfaces used across all countries
// ============================================================================

export type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

// ============================================================================
// CURRENCY TYPES
// ============================================================================
export type CurrencyCode = "USD" | "SGD" | "KRW" | "EUR" | "AUD" | "THB" | "HKD" | "IDR" | "TWD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

// ============================================================================
// COUNTRY TYPES
// ============================================================================
export type CountryCode = "US" | "SG" | "KR" | "NL" | "AU" | "PT" | "TH" | "HK" | "ID" | "TW";

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
// RESIDENCY TYPES - Australia specific
// ============================================================================
export type AUResidencyType = "resident" | "non_resident";

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

// Australia-specific contributions (superannuation is employer-paid, not deducted)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AUContributionInputs {
  // Superannuation is mandatory and paid by employer on top of salary
  // This interface is kept for consistency
}

// Portugal-specific contributions (Social Security is mandatory)
export interface PTContributionInputs {
  // Social Security contributions are mandatory and calculated automatically
  pprContribution: number; // Retirement Savings Plan contribution (20% tax credit)
}

// ============================================================================
// RESIDENCY TYPES - Thailand specific
// ============================================================================
export type THResidencyType = "resident" | "non_resident";

// ============================================================================
// RESIDENCY TYPES - Hong Kong specific
// ============================================================================
export type HKResidencyType = "resident" | "non_resident";

// Thailand-specific contributions (voluntary retirement savings)
export interface THContributionInputs {
  providentFundContribution: number; // Provident Fund (tax deductible, max 15% of income or 500,000 THB)
  rmfContribution: number; // Retirement Mutual Fund (tax deductible, max 30% of income or 500,000 THB)
  ssfContribution: number; // Super Savings Fund (tax deductible, max 30% of income or 200,000 THB)
  esgContribution: number; // Thai ESG Fund (tax deductible, max 30% of income or 300,000 THB in 2024-2026)
  nationalSavingsFundContribution: number; // National Savings Fund (tax deductible, max 30,000 THB)
}

// Hong Kong-specific contributions (voluntary MPF/annuity)
export interface HKContributionInputs {
  taxDeductibleVoluntaryContributions: number; // MPF TVC + QDAP (combined cap)
}

// Indonesia-specific contributions (mandatory BPJS + voluntary DPLP pension and zakat)
export interface IDContributionInputs {
  dplkContribution: number; // Dana Pensiun Lembaga Keuangan (voluntary pension fund)
  zakatContribution: number; // Zakat to BAZNAS or authorized amil zakat institutions
}

// Taiwan-specific contributions (voluntary labor pension)
export interface TWContributionInputs {
  voluntaryPensionContribution: number; // Employee voluntary contribution to labor pension (0-6% of salary, max NT$150,000)
}

// Thailand additional tax reliefs/allowances
export interface THTaxReliefInputs {
  // Personal allowances
  hasSpouse: boolean; // Has spouse (for spousal allowance)
  spouseHasNoIncome: boolean; // Spouse has no income (required for spousal allowance)
  numberOfChildren: number; // Child allowance: 30,000 THB per child
  numberOfChildrenBornAfter2018: number; // Additional 30,000 THB per child born >= 2018 (60,000 total)
  numberOfParents: number; // Parent allowance: 30,000 THB per parent (age >= 60, income <= 30,000)
  numberOfDisabledDependents: number; // Disabled person allowance: 60,000 THB per person
  isElderlyOrDisabled: boolean; // Taxpayer is elderly (>=65) or disabled: 190,000 THB exemption

  // Insurance deductions
  lifeInsurancePremium: number; // Up to 100,000 THB (10+ year policy)
  lifeInsuranceSpousePremium: number; // Up to 10,000 THB for spouse with no income
  healthInsurancePremium: number; // Up to 25,000 THB for self
  healthInsuranceParentsPremium: number; // Up to 15,000 THB for parents

  // Social Security (mandatory for most employees)
  hasSocialSecurity: boolean; // Deduct actual SS contributions (5% capped at 750 THB/month)

  // Retirement savings (shared 500,000 THB cap)
  providentFundContribution: number; // Up to 15% of income, max 500,000 THB
  rmfContribution: number; // Up to 30% of income, max 500,000 THB
  ssfContribution: number; // Up to 30% of income, max 200,000 THB
  esgContribution: number; // Up to 30% of income, max 300,000 THB (special period 2024-2026)
  nationalSavingsFundContribution: number; // Up to 30,000 THB

  // Other deductions
  mortgageInterest: number; // Home mortgage interest, up to 100,000 THB
  donations: number; // Charitable donations, up to 10% of net income
  politicalDonation: number; // Political party donations, up to 10,000 THB
}

// Hong Kong tax reliefs/allowances/deductions
export interface HKTaxReliefInputs {
  hasMarriedAllowance: boolean;
  hasSingleParentAllowance: boolean;
  numberOfChildren: number;
  numberOfNewbornChildren: number; // Additional allowance in year of birth
  numberOfDependentParents: number;
  numberOfDependentParentsLivingWith: number;
  numberOfDependentSiblings: number;
  hasDisabilityAllowance: boolean;
  numberOfDisabledDependents: number;
  selfEducationExpenses: number;
  homeLoanInterest: number;
  domesticRent: number;
  charitableDonations: number;
  elderlyResidentialCareExpenses: number;
}

// Indonesia tax relief inputs (PTKP)
export interface IDTaxReliefInputs {
  maritalStatus: "single" | "married";
  numberOfDependents: number; // 0-3 dependents
  spouseIncomeCombined: boolean; // Additional PTKP if spouse income is combined
}

// Taiwan tax relief inputs
export interface TWTaxReliefInputs {
  isMarried: boolean; // Affects standard deduction amount
  hasDisability: boolean; // Special deduction for disabled individuals
}

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
  | NLContributionInputs
  | AUContributionInputs
  | PTContributionInputs
  | HKContributionInputs
  | IDContributionInputs
  | TWContributionInputs;

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

export interface AUCalculatorInputs extends BaseCalculatorInputs {
  country: "AU";
  residencyType: AUResidencyType;
  hasPrivateHealthInsurance: boolean; // Affects Medicare Levy Surcharge
}

export type PTFilingStatus = "single" | "married_jointly" | "married_separately";

export type PTResidencyType = "resident" | "non_resident" | "nhr_2";

export interface PTCalculatorInputs extends BaseCalculatorInputs {
  country: "PT";
  residencyType: PTResidencyType;
  filingStatus: PTFilingStatus;
  numberOfDependents: number; // For tax benefits
  age: number; // For PPR contribution limits
  contributions: PTContributionInputs;
}

export interface THCalculatorInputs extends BaseCalculatorInputs {
  country: "TH";
  residencyType: THResidencyType;
  contributions: THContributionInputs;
  taxReliefs: THTaxReliefInputs;
}

export interface HKCalculatorInputs extends BaseCalculatorInputs {
  country: "HK";
  residencyType: HKResidencyType;
  contributions: HKContributionInputs;
  taxReliefs: HKTaxReliefInputs;
}

export interface IDCalculatorInputs extends BaseCalculatorInputs {
  country: "ID";
  contributions: IDContributionInputs;
  taxReliefs: IDTaxReliefInputs;
}

export interface TWCalculatorInputs extends BaseCalculatorInputs {
  country: "TW";
  contributions: TWContributionInputs;
  taxReliefs: TWTaxReliefInputs;
}

export type CalculatorInputs =
  | USCalculatorInputs
  | SGCalculatorInputs
  | KRCalculatorInputs
  | NLCalculatorInputs
  | AUCalculatorInputs
  | PTCalculatorInputs
  | THCalculatorInputs
  | HKCalculatorInputs
  | IDCalculatorInputs
  | TWCalculatorInputs;

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

export interface AUTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // Income tax after LITO
  medicareLevy: number; // 2% Medicare levy
  medicareLevySurcharge: number; // Additional surcharge if no PHI
  division293Tax: number; // Additional tax on super for high income earners
}

export interface PTTaxBreakdown extends BaseTaxBreakdown {
  type: "PT"; // Discriminant for type-safe narrowing
  incomeTax: number; // IRS - Imposto sobre o Rendimento
  solidaritySurcharge: number; // Adicional de Solidariedade for high incomes
  socialSecurity: number; // Segurança Social - 11%
}

export interface THTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // Personal Income Tax
  socialSecurity: number; // Social Security Fund contribution
}

export interface HKTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // Salaries Tax
  mpfEmployee: number; // MPF mandatory contribution (employee)
}

export interface IDTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // PPh 21 (resident)
  bpjsHealth: number; // BPJS Kesehatan employee contribution
  bpjsJht: number; // BPJS JHT employee contribution
  bpjsJp: number; // BPJS JP employee contribution
}

export interface TWTaxBreakdown extends BaseTaxBreakdown {
  incomeTax: number; // Comprehensive Income Tax
  laborInsurance: number; // Labor Insurance (employee portion)
  employmentInsurance: number; // Employment Insurance (employee portion)
  nhi: number; // National Health Insurance (employee portion)
}

export type TaxBreakdown =
  | USTaxBreakdown
  | SGTaxBreakdown
  | KRTaxBreakdown
  | NLTaxBreakdown
  | AUTaxBreakdown
  | PTTaxBreakdown
  | THTaxBreakdown
  | HKTaxBreakdown
  | IDTaxBreakdown
  | TWTaxBreakdown;

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

export interface AUBreakdown {
  type: "AU";
  taxableIncome: number;
  // Tax bracket breakdown
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  // Income tax details
  grossIncomeTax: number; // Before LITO
  lito: number; // Low Income Tax Offset
  incomeTax: number; // After LITO
  // Medicare
  medicareLevy: number;
  medicareLevySurcharge: number;
  hasPrivateHealthInsurance: boolean;
  // Division 293 tax (high income earners)
  division293Tax: number;
  division293Income: number; // Income + super for Division 293 purposes
  division293Threshold: number; // $250,000 threshold
  // Superannuation (informational - paid by employer)
  superannuation: {
    employerContribution: number;
    rate: number; // 12% for 2025-26
    concessionalContributions: number; // Used for Division 293 calc
  };
  isResident: boolean;
}

export interface PTBreakdown {
  type: "PT";
  taxableIncome: number; // Income after specific deductions
  // IRS bracket breakdown
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  // Tax components
  incomeTax: number; // IRS calculated from brackets (before credits)
  solidaritySurcharge: number; // Adicional de Solidariedade
  socialSecurity: number; // Segurança Social contribution
  // Deductions applied
  specificDeduction: number; // Dedução específica mínima (or SS contribution)
  // Taxpayer info
  isResident: boolean;
  isNhr2: boolean; // NHR 2.0 regime
  filingStatus: PTFilingStatus;
  numberOfDependents: number;
  // Employer SS contribution (informational)
  employerSocialSecurity: number;
  // Effective rates
  effectiveIRSRate: number;
  effectiveSocialSecurityRate: number;
  // Tax reliefs and credits
  pprContribution: number; // PPR contribution amount
  pprTaxCredit: number; // 20% tax credit on PPR
  pprMaxContribution: number; // Age-based limit
  dependentDeduction: number; // €600 per dependent
  totalTaxCredits: number; // Total credits and deductions
  grossTaxBeforeCredits: number; // Tax before credits applied
  // Joint filing info (for comparison)
  incomeTaxBeforeJointFiling?: number; // Tax if filed separately (for comparison)
  jointFilingSavings?: number; // Savings from joint filing
  // NHR 2.0 info
  nhr2FlatRate?: number; // 20% flat rate for NHR 2.0
  nhr2TaxSavings?: number; // Tax savings vs standard regime
}

export interface THBreakdown {
  type: "TH";
  assessableIncome: number; // Gross income
  standardDeduction: number; // 50% capped at 100,000 THB
  netIncome: number; // Income after standard deduction
  totalAllowances: number; // Total personal allowances
  taxableIncome: number; // Income subject to tax
  isResident: boolean;
  // Allowances breakdown
  allowances: {
    personalAllowance: number;
    spouseAllowance: number;
    childAllowance: number;
    parentAllowance: number;
    disabledPersonAllowance: number;
    lifeInsurance: number;
    healthInsurance: number;
    socialSecurity: number;
    providentFund: number;
    rmf: number;
    ssf: number;
    esg: number;
    mortgageInterest: number;
    donations: number;
    politicalDonation: number;
    elderlyDisabledAllowance: number;
  };
  // Voluntary contributions
  voluntaryContributions: {
    providentFund: number;
    rmf: number;
    ssf: number;
    esg: number;
    nationalSavingsFund: number;
    total: number;
  };
  // Social Security details
  socialSecurity: {
    employeeContribution: number;
    employerContribution: number;
    rate: number;
    cap: number; // Monthly cap
    annualCap: number;
  };
  // Tax bracket breakdown
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
}

export interface HKBreakdown {
  type: "HK";
  assessableIncome: number;
  netIncome: number;
  netChargeableIncome: number;
  isResident: boolean;
  mpf: {
    employeeContribution: number;
    rate: number;
    minRelevantIncomeMonthly: number;
    maxRelevantIncomeMonthly: number;
    monthlyRelevantIncome: number;
    monthlyCap: number;
  };
  deductions: {
    mandatoryMpf: number;
    voluntaryMpfAnnuity: number;
    selfEducation: number;
    homeLoanInterest: number;
    domesticRent: number;
    elderlyResidentialCare: number;
    charitableDonations: number;
    totalDeductions: number;
  };
  allowances: {
    basic: number;
    married: number;
    singleParent: number;
    child: number;
    newbornChild: number;
    dependentParent: number;
    dependentParentLivingWith: number;
    dependentSibling: number;
    disability: number;
    disabledDependent: number;
    totalAllowances: number;
  };
  taxComparison: {
    progressiveTax: number;
    standardTax: number;
    standardRateThreshold: number;
    standardRate: number;
    higherStandardRate: number;
  };
  voluntaryContributions: {
    taxDeductibleVoluntaryContributions: number;
  };
}

export interface IDBreakdown {
  type: "ID";
  grossIncome: number;
  jobExpense: number;
  jobExpenseCap: number;
  pensionDeduction: number;
  voluntaryDeductions: {
    dplk: number;
    zakat: number;
    total: number;
  };
  netIncome: number;
  ptkp: number;
  taxableIncomeBeforeRounding: number;
  taxableIncome: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  bpjs: {
    healthEmployee: number;
    healthEmployer: number;
    healthMonthlyCap: number;
    jhtEmployee: number;
    jhtEmployer: number;
    jpEmployee: number;
    jpEmployer: number;
    jpMonthlyCap: number;
  };
  taxReliefs: IDTaxReliefInputs;
}

export interface TWBreakdown {
  type: "TW";
  grossIncome: number;
  taxableIncome: number;

  // Social insurance breakdown (annual amounts)
  socialInsurance: {
    laborInsurance: number;
    employmentInsurance: number;
    nhi: number;
    total: number;
    // Monthly values
    monthlyLaborInsurance: number;
    monthlyEmploymentInsurance: number;
    monthlyNhi: number;
    monthlyTotal: number;
    // Caps
    laborInsuranceCap: number;
    employmentInsuranceCap: number;
    nhiCap: number;
    // Rates
    laborInsuranceRate: number;
    employmentInsuranceRate: number;
    nhiRate: number;
  };

  // Deductions breakdown
  deductions: {
    standardDeduction: number;
    personalExemption: number;
    specialSalaryDeduction: number;
    disabilityDeduction: number;
    voluntaryPensionContribution: number;
    totalDeductionsAndExemptions: number;
  };

  // Tax bracket breakdown
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;

  // Voluntary contributions
  voluntaryContributions: {
    voluntaryPensionContribution: number;
    pensionMaxRate: number;
    pensionMonthlyCap: number;
  };
}

export type CountrySpecificBreakdown =
  | USBreakdown
  | SGBreakdown
  | KRBreakdown
  | NLBreakdown
  | AUBreakdown
  | PTBreakdown
  | THBreakdown
  | HKBreakdown
  | IDBreakdown
  | TWBreakdown;

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
    !("federalIncomeTax" in taxes) &&
    !("mpfEmployee" in taxes) &&
    !("bpjsHealth" in taxes)
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

export function isAUInputs(
  inputs: CalculatorInputs,
): inputs is AUCalculatorInputs {
  return inputs.country === "AU";
}

export function isAUTaxBreakdown(taxes: TaxBreakdown): taxes is AUTaxBreakdown {
  return "medicareLevy" in taxes && "medicareLevySurcharge" in taxes;
}

export function isAUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is AUBreakdown {
  return breakdown.type === "AU";
}

export function isPTInputs(
  inputs: CalculatorInputs,
): inputs is PTCalculatorInputs {
  return inputs.country === "PT";
}

export function isPTTaxBreakdown(taxes: TaxBreakdown): taxes is PTTaxBreakdown {
  return "type" in taxes && (taxes as PTTaxBreakdown).type === "PT";
}

export function isPTBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PTBreakdown {
  return breakdown.type === "PT";
}

export function isTHInputs(
  inputs: CalculatorInputs,
): inputs is THCalculatorInputs {
  return inputs.country === "TH";
}

export function isTHTaxBreakdown(taxes: TaxBreakdown): taxes is THTaxBreakdown {
  return "incomeTax" in taxes && "socialSecurity" in taxes && !("cpfEmployee" in taxes) && !("federalIncomeTax" in taxes);
}

export function isTHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is THBreakdown {
  return breakdown.type === "TH";
}

export function isHKInputs(
  inputs: CalculatorInputs,
): inputs is HKCalculatorInputs {
  return inputs.country === "HK";
}

export function isHKTaxBreakdown(taxes: TaxBreakdown): taxes is HKTaxBreakdown {
  return (
    "mpfEmployee" in taxes &&
    "incomeTax" in taxes &&
    !("socialSecurity" in taxes)
  );
}

export function isIDTaxBreakdown(taxes: TaxBreakdown): taxes is IDTaxBreakdown {
  return "bpjsHealth" in taxes && "bpjsJht" in taxes && "bpjsJp" in taxes;
}

export function isHKBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is HKBreakdown {
  return breakdown.type === "HK";
}

export function isIDBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is IDBreakdown {
  return breakdown.type === "ID";
}

export function isTWInputs(
  inputs: CalculatorInputs,
): inputs is TWCalculatorInputs {
  return inputs.country === "TW";
}

export function isTWTaxBreakdown(taxes: TaxBreakdown): taxes is TWTaxBreakdown {
  return "laborInsurance" in taxes && "employmentInsurance" in taxes && "nhi" in taxes;
}

export function isTWBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is TWBreakdown {
  return breakdown.type === "TW";
}
