// ============================================================================
// CYPRUS CALCULATOR IMPLEMENTATION
// Tax Year: 2026
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { CY_CONFIG } from "./config";
import {
  CYPRUS_FIRST_EMPLOYMENT_EXEMPTIONS_2026,
  CYPRUS_GHS_2026,
  CYPRUS_SOCIAL_INSURANCE_2026,
  CYPRUS_TD59_DEDUCTIONS_2026,
  calculateCyprusDependentChildDeduction,
  calculateCyprusProgressiveTax,
} from "./constants/tax-brackets-2026";
import type {
  CYBreakdown,
  CYCalculatorInputs,
  CYContributionInputs,
  CYEmploymentExemption,
  CYTaxBreakdown,
} from "./types";

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

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPensionProvidentModeledLimit(grossSalary: number): number {
  return Math.max(
    0,
    grossSalary *
      CYPRUS_TD59_DEDUCTIONS_2026.modeledApprovedPensionProvidentRate,
  );
}

function getMedicalFundModeledLimit(grossSalary: number): number {
  return Math.max(
    0,
    grossSalary * CYPRUS_TD59_DEDUCTIONS_2026.medicalFundContributionRate,
  );
}

function normalizeEmploymentExemption(
  value?: CYEmploymentExemption,
): CYEmploymentExemption {
  switch (value) {
    case "article_8_21a_20":
    case "article_8_23a_50":
      return value;
    default:
      return "none";
  }
}

function calculateFirstEmploymentExemption(
  grossSalary: number,
  employmentExemption?: CYEmploymentExemption,
) {
  const selected = normalizeEmploymentExemption(employmentExemption);
  const normalizedGross = Math.max(0, grossSalary);

  if (selected === "article_8_21a_20") {
    const exemption =
      CYPRUS_FIRST_EMPLOYMENT_EXEMPTIONS_2026.article8_21a_20;
    const exemptIncome = roundCurrency(
      Math.min(normalizedGross * exemption.exemptionRate, exemption.annualMax),
    );

    return {
      selected,
      applies: exemptIncome > 0,
      exemptionRate: exemption.exemptionRate,
      exemptIncome,
      threshold: null,
      annualMax: exemption.annualMax,
      maxYears: exemption.maxYears,
      thresholdMet: true,
    };
  }

  if (selected === "article_8_23a_50") {
    const exemption =
      CYPRUS_FIRST_EMPLOYMENT_EXEMPTIONS_2026.article8_23a_50;
    const thresholdMet = normalizedGross > exemption.remunerationThreshold;
    const exemptIncome = thresholdMet
      ? roundCurrency(normalizedGross * exemption.exemptionRate)
      : 0;

    return {
      selected,
      applies: exemptIncome > 0,
      exemptionRate: exemption.exemptionRate,
      exemptIncome,
      threshold: exemption.remunerationThreshold,
      annualMax: null,
      maxYears: exemption.maxYears,
      thresholdMet,
    };
  }

  return {
    selected,
    applies: false,
    exemptionRate: 0,
    exemptIncome: 0,
    threshold: null,
    annualMax: null,
    maxYears: 0,
    thresholdMet: true,
  };
}

function isResidentReliefEligible(inputs: CYCalculatorInputs): boolean {
  return inputs.residencyType === "resident" &&
    inputs.taxReliefs.meetsFamilyIncomeCriteria;
}

function normalizeContributions(
  inputs: CYCalculatorInputs,
): CYContributionInputs {
  const hasResidentRelief = isResidentReliefEligible(inputs);
  const pensionProvidentLimit = getPensionProvidentModeledLimit(
    inputs.grossSalary,
  );
  const residentReliefLimit = (baseLimit: number) =>
    hasResidentRelief ? baseLimit : 0;
  const residentOnlyLimit = (baseLimit: number) =>
    inputs.residencyType === "resident" ? baseLimit : 0;

  return {
    approvedPensionProvidentFund: clamp(
      inputs.contributions.approvedPensionProvidentFund,
      0,
      pensionProvidentLimit,
    ),
    medicalFundContribution: clamp(
      inputs.contributions.medicalFundContribution,
      0,
      getMedicalFundModeledLimit(inputs.grossSalary),
    ),
    homeInsurancePremium: clamp(
      inputs.contributions.homeInsurancePremium,
      0,
      residentOnlyLimit(
        CYPRUS_TD59_DEDUCTIONS_2026.homeInsuranceNaturalDisastersMax,
      ),
    ),
    primaryResidenceDeduction: clamp(
      inputs.contributions.primaryResidenceDeduction,
      0,
      residentReliefLimit(
        CYPRUS_TD59_DEDUCTIONS_2026.primaryResidenceRentOrInterestMax,
      ),
    ),
    greenTransitionExpense: clamp(
      inputs.contributions.greenTransitionExpense,
      0,
      residentReliefLimit(CYPRUS_TD59_DEDUCTIONS_2026.greenTransitionMax),
    ),
  };
}

function calculateSocialInsurance(grossSalary: number) {
  const insurableIncome = Math.min(
    Math.max(0, grossSalary),
    CYPRUS_SOCIAL_INSURANCE_2026.annualCeiling,
  );

  return {
    insurableIncome,
    employee: roundCurrency(
      insurableIncome * CYPRUS_SOCIAL_INSURANCE_2026.employeeRate,
    ),
    employer: roundCurrency(
      insurableIncome * CYPRUS_SOCIAL_INSURANCE_2026.employerRate,
    ),
    state: roundCurrency(
      insurableIncome * CYPRUS_SOCIAL_INSURANCE_2026.stateRate,
    ),
  };
}

function calculateGesy(grossSalary: number) {
  const insurableIncome = Math.min(
    Math.max(0, grossSalary),
    CYPRUS_GHS_2026.annualIncomeCeiling,
  );

  return {
    insurableIncome,
    employee: roundCurrency(insurableIncome * CYPRUS_GHS_2026.employeeRate),
    employer: roundCurrency(insurableIncome * CYPRUS_GHS_2026.employerRate),
  };
}

export function calculateCY(inputs: CYCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    taxReliefs,
    employmentExemption,
  } = inputs;
  const isResident = residencyType === "resident";
  const firstEmploymentExemption = calculateFirstEmploymentExemption(
    grossSalary,
    employmentExemption,
  );
  const normalizedChildren = Math.max(
    0,
    Math.floor(taxReliefs.numberOfDependentChildren),
  );
  const normalizedContributions = normalizeContributions({
    ...inputs,
    taxReliefs: {
      ...taxReliefs,
      numberOfDependentChildren: normalizedChildren,
    },
  });

  const socialInsurance = calculateSocialInsurance(grossSalary);
  const gesy = calculateGesy(grossSalary);
  const mandatoryContributionTotal = socialInsurance.employee + gesy.employee;
  const intermediaryCalculation = Math.max(
    0,
    grossSalary -
      firstEmploymentExemption.exemptIncome -
      normalizedContributions.homeInsurancePremium,
  );
  const contributionGroupCap =
    intermediaryCalculation *
    CYPRUS_TD59_DEDUCTIONS_2026.aggregateContributionDeductionRate;
  const contributionGroupActual =
    mandatoryContributionTotal +
    normalizedContributions.approvedPensionProvidentFund +
    normalizedContributions.medicalFundContribution;
  const contributionGroupDeduction = Math.min(
    contributionGroupActual,
    contributionGroupCap,
  );
  const mandatoryContributionDeduction = Math.min(
    mandatoryContributionTotal,
    contributionGroupDeduction,
  );
  const approvedPensionProvidentFundDeduction = Math.max(
    0,
    Math.min(
      normalizedContributions.approvedPensionProvidentFund,
      contributionGroupDeduction - mandatoryContributionDeduction,
    ),
  );
  const medicalFundContributionDeduction = Math.max(
    0,
    contributionGroupDeduction -
      mandatoryContributionDeduction -
      approvedPensionProvidentFundDeduction,
  );
  const disallowedContributionDeduction = Math.max(
    0,
    contributionGroupActual - contributionGroupDeduction,
  );
  const childDeduction =
    isResident && taxReliefs.meetsFamilyIncomeCriteria
      ? calculateCyprusDependentChildDeduction(
          normalizedChildren,
          taxReliefs.familyStatus,
        )
      : 0;
  const primaryResidenceDeduction =
    isResident && taxReliefs.meetsFamilyIncomeCriteria
      ? normalizedContributions.primaryResidenceDeduction
      : 0;
  const greenTransitionDeduction =
    isResident && taxReliefs.meetsFamilyIncomeCriteria
      ? normalizedContributions.greenTransitionExpense
      : 0;
  const totalTaxDeductions =
    firstEmploymentExemption.exemptIncome +
    normalizedContributions.homeInsurancePremium +
    contributionGroupDeduction +
    childDeduction +
    primaryResidenceDeduction +
    greenTransitionDeduction;
  const chargeableIncome = Math.max(0, grossSalary - totalTaxDeductions);
  const { totalTax: incomeTax, bracketTaxes } = calculateCyprusProgressiveTax(
    chargeableIncome,
  );

  const taxes: CYTaxBreakdown = {
    type: "CY",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity: socialInsurance.employee + gesy.employee,
    socialInsurance: socialInsurance.employee,
    gesy: gesy.employee,
  };

  const totalTax = incomeTax + taxes.socialSecurity;
  const voluntaryContributions =
    normalizedContributions.approvedPensionProvidentFund +
    normalizedContributions.medicalFundContribution;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: CYBreakdown = {
    type: "CY",
    grossIncome: grossSalary,
    residencyType,
    isResident,
    employmentExemption: firstEmploymentExemption.selected,
    firstEmploymentExemption,
    taxableIncome: chargeableIncome,
    chargeableIncome,
    familyStatus: taxReliefs.familyStatus,
    numberOfDependentChildren: normalizedChildren,
    meetsFamilyIncomeCriteria: taxReliefs.meetsFamilyIncomeCriteria,
    bracketTaxes,
    incomeTax,
    socialInsurance: {
      employee: socialInsurance.employee,
      employer: socialInsurance.employer,
      state: socialInsurance.state,
      employeeRate: CYPRUS_SOCIAL_INSURANCE_2026.employeeRate,
      employerRate: CYPRUS_SOCIAL_INSURANCE_2026.employerRate,
      stateRate: CYPRUS_SOCIAL_INSURANCE_2026.stateRate,
      insurableIncome: socialInsurance.insurableIncome,
      monthlyCeiling: CYPRUS_SOCIAL_INSURANCE_2026.monthlyCeiling,
      weeklyCeiling: CYPRUS_SOCIAL_INSURANCE_2026.weeklyCeiling,
      annualCeiling: CYPRUS_SOCIAL_INSURANCE_2026.annualCeiling,
    },
    gesy: {
      employee: gesy.employee,
      employer: gesy.employer,
      employeeRate: CYPRUS_GHS_2026.employeeRate,
      employerRate: CYPRUS_GHS_2026.employerRate,
      insurableIncome: gesy.insurableIncome,
      annualIncomeCeiling: CYPRUS_GHS_2026.annualIncomeCeiling,
    },
    deductions: {
      homeInsurance: normalizedContributions.homeInsurancePremium,
      contributionGroupCap,
      mandatoryContributionDeduction,
      approvedPensionProvidentFundDeduction,
      medicalFundContributionDeduction,
      contributionGroupDeduction,
      disallowedContributionDeduction,
      childDeduction,
      primaryResidence: primaryResidenceDeduction,
      greenTransition: greenTransitionDeduction,
      totalTaxDeductions,
    },
    voluntaryContributions: {
      approvedPensionProvidentFund:
        normalizedContributions.approvedPensionProvidentFund,
      medicalFundContribution: normalizedContributions.medicalFundContribution,
      pensionProvidentModeledLimit: getPensionProvidentModeledLimit(
        grossSalary,
      ),
      medicalFundModeledLimit: getMedicalFundModeledLimit(grossSalary),
      total: voluntaryContributions,
    },
    assumptions: {
      appliesFirstEmploymentExemption: firstEmploymentExemption.applies,
      includesLifeInsurancePremiums: false,
      includesMedicalFundContributions: true,
      includesSpecialDefenceContribution: false,
    },
  };

  return {
    country: "CY",
    currency: "EUR",
    grossSalary,
    taxableIncome: chargeableIncome,
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

export const CYCalculator: CountryCalculator = {
  countryCode: "CY",
  config: CY_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CY") {
      throw new Error("CYCalculator can only calculate CY inputs");
    }

    return calculateCY(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const cyInputs = inputs as Partial<CYCalculatorInputs> | undefined;
    const grossSalary = Math.max(0, cyInputs?.grossSalary ?? 36_000);
    const residencyType = cyInputs?.residencyType ?? "resident";
    const taxReliefs = cyInputs?.taxReliefs ?? {
      familyStatus: "single",
      numberOfDependentChildren: 0,
      meetsFamilyIncomeCriteria: true,
    };
    const hasResidentRelief =
      residencyType === "resident" && taxReliefs.meetsFamilyIncomeCriteria;
    const residentOnlyLimit = (baseLimit: number) =>
      residencyType === "resident" ? baseLimit : 0;
    const residentReliefLimit = (baseLimit: number) =>
      hasResidentRelief ? baseLimit : 0;

    return {
      approvedPensionProvidentFund: {
        limit: getPensionProvidentModeledLimit(grossSalary),
        name: "Approved Pension/Provident Fund",
        description:
          "Modeled approved pension or provident fund contribution, capped at 10% of gross remuneration and subject to the TD59A 20% aggregate deduction cap.",
        preTax: true,
      },
      medicalFundContribution: {
        limit: getMedicalFundModeledLimit(grossSalary),
        name: "Approved Medical Fund Contribution",
        description:
          "Modeled approved medical-fund contribution, capped at 2% of gross salary and subject to the TD59A 20% aggregate deduction cap.",
        preTax: true,
      },
      homeInsurancePremium: {
        limit: residentOnlyLimit(
          CYPRUS_TD59_DEDUCTIONS_2026.homeInsuranceNaturalDisastersMax,
        ),
        name: "Home Insurance for Natural Disasters",
        description:
          "Resident TD59A deduction for qualifying home insurance covering natural disasters, capped at EUR 500.",
        preTax: true,
      },
      primaryResidenceDeduction: {
        limit: residentReliefLimit(
          CYPRUS_TD59_DEDUCTIONS_2026.primaryResidenceRentOrInterestMax,
        ),
        name: "Primary Residence Rent or Loan Interest",
        description:
          "Resident TD59A deduction for qualifying primary-residence rent or serviced housing loan interest, subject to income criteria.",
        preTax: true,
      },
      greenTransitionExpense: {
        limit: residentReliefLimit(CYPRUS_TD59_DEDUCTIONS_2026.greenTransitionMax),
        name: "Green Residence or Electric Vehicle Expense",
        description:
          "Resident TD59A deduction for qualifying energy upgrades, renewable systems, storage batteries, or electric vehicles, subject to income criteria.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CYCalculatorInputs {
    return {
      country: "CY",
      grossSalary: 36_000,
      payFrequency: "monthly",
      residencyType: "resident",
      employmentExemption: "none",
      contributions: {
        approvedPensionProvidentFund: 0,
        medicalFundContribution: 0,
        homeInsurancePremium: 0,
        primaryResidenceDeduction: 0,
        greenTransitionExpense: 0,
      },
      taxReliefs: {
        familyStatus: "single",
        numberOfDependentChildren: 0,
        meetsFamilyIncomeCriteria: true,
      },
    };
  },
};
