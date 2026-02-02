// ============================================================================
// SWITZERLAND-SPECIFIC TYPES
// ============================================================================

import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
} from "../types";
import type { CHFilingStatus } from "./constants/tax-brackets-2026";

// ============================================================================
// CONTRIBUTION INPUTS
// ============================================================================

export interface CHContributionInputs {
  pillar3aContribution: number; // Pillar 3a contribution (tax deductible)
  includeBVG: boolean; // Whether to include occupational pension
}

// ============================================================================
// CALCULATOR INPUTS
// ============================================================================

export interface CHCalculatorInputs extends BaseCalculatorInputs {
  country: "CH";
  filingStatus: CHFilingStatus;
  canton: string; // Canton code (e.g., "ZH", "ZG", "GE")
  age: number; // For BVG contribution rates
  numberOfChildren: number; // For child allowances
  contributions: CHContributionInputs;
  includeHealthInsurance: boolean; // Include health insurance cost (informational)
}

// ============================================================================
// TAX BREAKDOWN
// ============================================================================

export interface CHTaxBreakdown extends BaseTaxBreakdown {
  federalIncomeTax: number;
  cantonalIncomeTax: number;
  municipalIncomeTax: number;
  ahvIvEo: number; // Old age, disability, loss of earnings
  alv: number; // Unemployment insurance
  bvg: number; // Occupational pension
  healthInsurance: number; // Health insurance cost (informational)
}

// ============================================================================
// DETAILED BREAKDOWN
// ============================================================================

export interface CHBreakdown {
  type: "CH";
  
  // Filing info
  filingStatus: CHFilingStatus;
  canton: string;
  cantonName: string;
  
  // Taxable income
  federalTaxableIncome: number;
  
  // Tax breakdown
  federalTax: number;
  cantonalTax: number;
  municipalTax: number;
  totalCantonalTax: number;
  cantonalMultiplier: number;
  
  // Social security details
  socialSecurity: {
    ahvIvEo: number;
    ahvIvEoRate: number;
    alv: number;
    alvRate: number;
    alvCap: number;
    bvg: number;
    bvgRate: number;
    coordinatedSalary: number;
    totalSocialSecurity: number;
  };
  
  // Deductions
  deductions: {
    professionalExpenses: number;
    insurancePremiums: number;
    pillar3a: number;
    totalDeductions: number;
  };
  
  // Health insurance (informational)
  healthInsurance: {
    annualCost: number;
    monthlyCost: number;
    isIncluded: boolean;
  };
  
  // Pillar 3a
  pillar3a: {
    contribution: number;
    maxContribution: number;
  };
  
  // Tax credits/allowances
  childAllowances: number;
  numberOfChildren: number;
  
  // Effective rates
  effectiveTaxRate: number;
  effectiveSocialSecurityRate: number;
  totalDeductionRate: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isCHInputs(
  inputs: BaseCalculatorInputs
): inputs is CHCalculatorInputs {
  return inputs.country === "CH";
}

export function isCHTaxBreakdown(taxes: BaseTaxBreakdown): taxes is CHTaxBreakdown {
  return "federalIncomeTax" in taxes && "cantonalIncomeTax" in taxes;
}

export function isCHBreakdown(
  breakdown: { type: string }
): breakdown is CHBreakdown {
  return breakdown.type === "CH";
}
