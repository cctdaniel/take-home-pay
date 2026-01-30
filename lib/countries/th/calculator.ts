// ============================================================================
// THAILAND CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
  THCalculatorInputs,
  THTaxBreakdown,
  THBreakdown,
  RegionInfo,
  ContributionLimits,
  PayFrequency,
} from "../types";
import { TH_CONFIG } from "./config";
import { calculateTHIncomeTax, calculateSocialSecurityContribution, TH_TAX_ALLOWANCES, TH_TAX_BRACKETS } from "./constants/tax-brackets-2026";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

// ============================================================================
// THAILAND CALCULATOR
// ============================================================================
export function calculateTH(inputs: THCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, contributions, taxReliefs } = inputs;

  // Calculate income tax with allowances
  const taxResult = calculateTHIncomeTax(grossSalary, residencyType, taxReliefs);

  // Calculate Social Security contribution
  const socialSecurityContribution = taxReliefs?.hasSocialSecurity
    ? calculateSocialSecurityContribution(grossSalary)
    : 0;

  // Build tax breakdown
  const taxes: THTaxBreakdown = {
    totalIncomeTax: taxResult.incomeTax,
    incomeTax: taxResult.incomeTax,
    socialSecurity: socialSecurityContribution,
  };

  // Total deductions (tax + SS + voluntary contributions)
  const voluntaryContributions = 
    (contributions?.providentFundContribution ?? 0) +
    (contributions?.rmfContribution ?? 0) +
    (contributions?.ssfContribution ?? 0) +
    (contributions?.esgContribution ?? 0) +
    (contributions?.nationalSavingsFundContribution ?? 0);

  const totalTax = taxes.incomeTax + taxes.socialSecurity;
  const totalDeductions = totalTax + voluntaryContributions;

  // Net salary after all deductions
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (income tax + Social Security - mandatory contributions)
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: THBreakdown = {
    type: "TH",
    assessableIncome: taxResult.assessableIncome,
    standardDeduction: taxResult.standardDeduction,
    netIncome: taxResult.netIncome,
    totalAllowances: taxResult.totalAllowances,
    taxableIncome: taxResult.taxableIncome,
    isResident: residencyType === "resident",
    // Allowances breakdown
    allowances: taxResult.allowances,
    // Voluntary contributions
    voluntaryContributions: {
      providentFund: contributions?.providentFundContribution ?? 0,
      rmf: contributions?.rmfContribution ?? 0,
      ssf: contributions?.ssfContribution ?? 0,
      esg: contributions?.esgContribution ?? 0,
      nationalSavingsFund: contributions?.nationalSavingsFundContribution ?? 0,
      total: voluntaryContributions,
    },
    // Social Security details
    socialSecurity: {
      employeeContribution: socialSecurityContribution,
      employerContribution: socialSecurityContribution, // Employer matches employee contribution
      rate: 0.05,
      cap: 750, // Monthly cap
      annualCap: 9000,
    },
    // Tax brackets applied
    bracketTaxes: (() => {
      const brackets = [];
      
      for (const bracket of TH_TAX_BRACKETS) {
        if (taxResult.taxableIncome <= bracket.min) continue;
        
        const taxableInBracket = Math.min(
          Math.max(0, taxResult.taxableIncome - bracket.min),
          bracket.max - bracket.min
        );
        
        if (taxableInBracket > 0) {
          brackets.push({
            min: bracket.min,
            max: bracket.max,
            rate: bracket.rate,
            tax: Math.round(taxableInBracket * bracket.rate),
          });
        }
      }
      return brackets;
    })(),
  };

  return {
    country: "TH",
    currency: "THB",
    grossSalary,
    taxableIncome: taxResult.taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
export const THCalculator: CountryCalculator = {
  countryCode: "TH",
  config: TH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "TH") {
      throw new Error("THCalculator can only calculate TH inputs");
    }
    return calculateTH(inputs as THCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    // Thailand has no regional tax subdivisions
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const thInputs = inputs as Partial<THCalculatorInputs>;
    const annualIncome = thInputs?.grossSalary ?? 600000; // Default 500k THB

    return {
      providentFundContribution: {
        limit: Math.min(
          annualIncome * TH_TAX_ALLOWANCES.providentFundRate,
          TH_TAX_ALLOWANCES.providentFundMax
        ),
        name: "Provident Fund Contribution",
        description: "Employee contribution to Provident Fund (tax deductible)",
        preTax: true,
      },
      rmfContribution: {
        limit: Math.min(annualIncome * TH_TAX_ALLOWANCES.rmfRate, TH_TAX_ALLOWANCES.rmfMax),
        name: "Retirement Mutual Fund (RMF)",
        description: "Investment in RMF (tax deductible, held 5+ years)",
        preTax: true,
      },
      ssfContribution: {
        limit: Math.min(annualIncome * TH_TAX_ALLOWANCES.ssfRate, TH_TAX_ALLOWANCES.ssfMax),
        name: "Super Savings Fund (SSF)",
        description: "Investment in SSF (tax deductible, held 10+ years)",
        preTax: true,
      },
      esgContribution: {
        limit: Math.min(annualIncome * TH_TAX_ALLOWANCES.esgRate, TH_TAX_ALLOWANCES.esgMaxSpecial),
        name: "Thai ESG Fund",
        description: "Investment in Thai ESG Fund (tax deductible, held 5+ years during 2024-2026)",
        preTax: true,
      },
      nationalSavingsFundContribution: {
        limit: TH_TAX_ALLOWANCES.nationalSavingsFundMax,
        name: "National Savings Fund",
        description: "Contribution to National Savings Fund (tax deductible)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): THCalculatorInputs {
    return {
      country: "TH",
      grossSalary: 600000, // THB 600,000 (~$17,000) - typical middle income
      payFrequency: "monthly",
      residencyType: "resident",
      contributions: {
        providentFundContribution: 0,
        rmfContribution: 0,
        ssfContribution: 0,
        esgContribution: 0,
        nationalSavingsFundContribution: 0,
      },
      taxReliefs: {
        hasSpouse: false,
        spouseHasNoIncome: false,
        numberOfChildren: 0,
        numberOfChildrenBornAfter2018: 0,
        numberOfParents: 0,
        numberOfDisabledDependents: 0,
        lifeInsurancePremium: 0,
        lifeInsuranceSpousePremium: 0,
        healthInsurancePremium: 0,
        healthInsuranceParentsPremium: 0,
        hasSocialSecurity: true,
        providentFundContribution: 0,
        rmfContribution: 0,
        ssfContribution: 0,
        esgContribution: 0,
        mortgageInterest: 0,
        donations: 0,
        politicalDonation: 0,
        isElderlyOrDisabled: false,
        nationalSavingsFundContribution: 0,
      },
    };
  },
};
