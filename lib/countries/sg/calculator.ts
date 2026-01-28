// ============================================================================
// SINGAPORE CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
  SGCalculatorInputs,
  SGTaxBreakdown,
  SGBreakdown,
  RegionInfo,
  ContributionLimits,
  PayFrequency,
} from "../types";
import { SG_CONFIG } from "./config";
import { calculateAnnualCPF, CPF_VOLUNTARY_TOPUP_LIMIT, getSRSLimit } from "./constants/cpf-rates-2026";
import { calculateSGIncomeTax } from "./constants/tax-brackets-2026";

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
// SINGAPORE CALCULATOR
// ============================================================================
export function calculateSG(inputs: SGCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, age, contributions } = inputs;

  // Calculate CPF contributions
  const cpfResult = calculateAnnualCPF(grossSalary, age, residencyType);

  // Calculate income tax
  const taxResult = calculateSGIncomeTax(
    grossSalary,
    cpfResult.employeeContribution,
    contributions.srsContribution,
    contributions.voluntaryCpfTopUp,
    age,
    residencyType
  );

  // Build tax breakdown
  const taxes: SGTaxBreakdown = {
    totalIncomeTax: taxResult.incomeTax,
    incomeTax: taxResult.incomeTax,
    cpfEmployee: cpfResult.employeeContribution,
    cpfEmployer: cpfResult.employerContribution, // For informational purposes
  };

  // Total tax is income tax + CPF employee contribution
  // (CPF is mandatory and deducted from salary)
  const totalTax = taxes.incomeTax + taxes.cpfEmployee;

  // Voluntary contributions
  const voluntaryContributions = contributions.voluntaryCpfTopUp + contributions.srsContribution;

  // Total deductions from gross
  const totalDeductions = totalTax + voluntaryContributions;

  // Net salary after all deductions
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (income tax only, not CPF)
  const effectiveTaxRate = grossSalary > 0 ? taxes.incomeTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: SGBreakdown = {
    type: "SG",
    cpfOrdinaryAccount: cpfResult.ordinaryAccount,
    cpfSpecialAccount: cpfResult.specialAccount,
    cpfMediSaveAccount: cpfResult.medisaveAccount,
    cpfEmployeeTotal: cpfResult.employeeContribution,
    cpfEmployerTotal: cpfResult.employerContribution,
    voluntaryContributions,
  };

  return {
    country: "SG",
    currency: "SGD",
    grossSalary,
    taxableIncome: taxResult.chargeableIncome,
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
export const SGCalculator: CountryCalculator = {
  countryCode: "SG",
  config: SG_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SG") {
      throw new Error("SGCalculator can only calculate SG inputs");
    }
    return calculateSG(inputs as SGCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    // Singapore has no regional tax subdivisions
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const sgInputs = inputs as Partial<SGCalculatorInputs>;
    const residencyType = sgInputs?.residencyType ?? "citizen_pr";

    return {
      voluntaryCpfTopUp: {
        limit: CPF_VOLUNTARY_TOPUP_LIMIT,
        name: "Voluntary CPF Top-up",
        description: "Tax relief up to S$8,000 for voluntary CPF contributions",
        preTax: true,
      },
      srsContribution: {
        limit: getSRSLimit(residencyType),
        name: "SRS Contribution",
        description: "Supplementary Retirement Scheme - fully tax deductible",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): SGCalculatorInputs {
    return {
      country: "SG",
      grossSalary: 60000, // SGD - typical salary
      payFrequency: "monthly",
      residencyType: "citizen_pr",
      age: 30,
      contributions: {
        voluntaryCpfTopUp: 0,
        srsContribution: 0,
      },
    };
  },
};
