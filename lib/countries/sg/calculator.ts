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
import { calculateAnnualCPF, CPF_VOLUNTARY_TOPUP_LIMIT, getSRSLimit, getCPFRates, CPF_MONTHLY_CEILING } from "./constants/cpf-rates-2026";
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

function getSGContributionLimits(inputs?: Partial<SGCalculatorInputs>) {
  const residencyType = inputs?.residencyType ?? "citizen_pr";
  const taxResidency = inputs?.taxResidency ?? "resident";
  const isTaxResident = taxResidency === "resident";

  return {
    voluntaryCpfTopUp:
      isTaxResident && residencyType === "citizen_pr"
        ? CPF_VOLUNTARY_TOPUP_LIMIT
        : 0,
    srsContribution: isTaxResident ? getSRSLimit(residencyType) : 0,
  };
}

// ============================================================================
// SINGAPORE CALCULATOR
// ============================================================================
export function calculateSG(inputs: SGCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    taxResidency,
    age,
    contributions,
    taxReliefs,
  } = inputs;
  const contributionLimits = getSGContributionLimits(inputs);
  const voluntaryCpfTopUp = Math.min(
    Math.max(0, contributions.voluntaryCpfTopUp),
    contributionLimits.voluntaryCpfTopUp,
  );
  const srsContribution = Math.min(
    Math.max(0, contributions.srsContribution),
    contributionLimits.srsContribution,
  );

  // Calculate CPF contributions
  const cpfResult = calculateAnnualCPF(grossSalary, age, residencyType);

  // Calculate income tax (with additional reliefs if provided)
  const taxResult = calculateSGIncomeTax(
    grossSalary,
    cpfResult.employeeContribution,
    srsContribution,
    voluntaryCpfTopUp,
    age,
    residencyType,
    taxResidency,
    taxReliefs
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
  const voluntaryContributions = voluntaryCpfTopUp + srsContribution;

  // Total deductions from gross
  const totalDeductions = totalTax + voluntaryContributions;

  // Net salary after all deductions
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (income tax + CPF - mandatory contributions)
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Get CPF rate info for display
  const cpfRates = getCPFRates(age, residencyType);
  const monthlySalary = grossSalary / 12;
  const cpfContributableWage = Math.min(monthlySalary, CPF_MONTHLY_CEILING) * 12;

  const breakdown: SGBreakdown = {
    type: "SG",
    cpfOrdinaryAccount: cpfResult.ordinaryAccount,
    cpfSpecialAccount: cpfResult.specialAccount,
    cpfMediSaveAccount: cpfResult.medisaveAccount,
    cpfEmployeeTotal: cpfResult.employeeContribution,
    cpfEmployerTotal: cpfResult.employerContribution,
    voluntaryContributions,
    // CPF rate details
    cpfEmployeeRate: cpfRates.employee,
    cpfMonthlyCeiling: CPF_MONTHLY_CEILING,
    cpfContributableWage,
    // Tax reliefs
    taxReliefs: {
      earnedIncomeRelief: taxResult.reliefs.earnedIncomeRelief,
      cpfRelief: taxResult.reliefs.cpfRelief,
      srsRelief: taxResult.reliefs.srsRelief,
      voluntaryCpfTopUpRelief: taxResult.reliefs.voluntaryCpfTopUpRelief,
      // Additional reliefs
      spouseRelief: taxResult.reliefs.spouseRelief,
      disabledSpouseRelief: taxResult.reliefs.disabledSpouseRelief,
      childRelief: taxResult.reliefs.childRelief,
      disabledChildRelief: taxResult.reliefs.disabledChildRelief,
      workingMotherRelief: taxResult.reliefs.workingMotherRelief,
      parentRelief: taxResult.reliefs.parentRelief,
      grandparentCaregiverRelief:
        taxResult.reliefs.grandparentCaregiverRelief,
      disabledSiblingRelief: taxResult.reliefs.disabledSiblingRelief,
      lifeInsuranceRelief: taxResult.reliefs.lifeInsuranceRelief,
      nsmanRelief: taxResult.reliefs.nsmanRelief,
      reliefCapReduction: taxResult.reliefs.reliefCapReduction,
      cappedPersonalReliefs: taxResult.reliefs.cappedPersonalReliefs,
      donationDeduction: taxResult.reliefs.donationDeduction,
      courseFeesRelief: taxResult.reliefs.courseFeesRelief,
      totalReliefs: taxResult.reliefs.totalReliefs,
    },
    taxRebates: taxResult.rebates,
    chargeableIncome: taxResult.chargeableIncome,
    grossTaxBeforeReliefs: taxResult.grossTaxBeforeReliefs,
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
    const limits = getSGContributionLimits(inputs as Partial<SGCalculatorInputs>);

    return {
      voluntaryCpfTopUp: {
        limit: limits.voluntaryCpfTopUp,
        name: "Voluntary CPF Top-up",
        description:
          limits.voluntaryCpfTopUp > 0
            ? "Tax relief up to S$8,000 for voluntary CPF contributions"
            : "CPF top-up relief is modeled for Singapore tax-resident citizens and PRs",
        preTax: true,
      },
      srsContribution: {
        limit: limits.srsContribution,
        name: "SRS Contribution",
        description:
          limits.srsContribution > 0
            ? "Supplementary Retirement Scheme - fully tax deductible"
            : "SRS relief is not available in the non-resident employment model",
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
      taxResidency: "resident",
      age: 30,
      contributions: {
        voluntaryCpfTopUp: 0,
        srsContribution: 0,
      },
      taxReliefs: {
        hasSpouseRelief: false,
        hasDisabledSpouseRelief: false,
        numberOfChildren: 0,
        numberOfDisabledChildren: 0,
        isWorkingMother: false,
        wmcrPre2024Children: 0,
        wmcrPost2024FirstChild: false,
        wmcrPost2024SecondChild: false,
        wmcrPost2024ThirdAndLaterChildren: 0,
        parentRelief: "none",
        parentReliefForDisability: false,
        numberOfParents: 0,
        grandparentCaregiverRelief: false,
        numberOfDisabledSiblings: 0,
        lifeInsurancePremiums: 0,
        lifeInsuranceCapitalSum: 0,
        approvedDonations: 0,
        parenthoodTaxRebate: 0,
        nsmanSelfRelief: "none",
        hasNsmanWifeRelief: false,
        numberOfNsmanParentReliefs: 0,
        courseFees: 0,
      },
    };
  },
};
