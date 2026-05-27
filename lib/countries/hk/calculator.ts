// ============================================================================
// HONG KONG CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  ContributionLimits,
  HKBreakdown,
  HKCalculatorInputs,
  HKTaxBreakdown,
  HKTaxReliefInputs,
  PayFrequency,
  RegionInfo,
} from "../types";
import { HK_CONFIG } from "./config";
import {
  HK_ALLOWANCES_2026,
  HK_DEDUCTIONS_2026,
  HK_HOUSING_BENEFIT_RATES,
  HK_MPF_2026,
  HK_STANDARD_RATE_2026,
  HK_TAX_BRACKETS_2026,
  HK_TAX_REDUCTION_2026,
} from "./constants/tax-brackets-2026";

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

function calculateProgressiveTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of HK_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) continue;
    const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableAtBracket * bracket.rate;
  }
  return tax;
}

function calculateMandatoryMpf(grossSalary: number) {
  const monthlyIncome = grossSalary / 12;
  const monthlyRelevantIncome =
    monthlyIncome >= HK_MPF_2026.minRelevantIncomeMonthly
      ? Math.min(monthlyIncome, HK_MPF_2026.maxRelevantIncomeMonthly)
      : 0;
  const mandatoryMpf =
    monthlyRelevantIncome > 0 ? monthlyRelevantIncome * HK_MPF_2026.rate * 12 : 0;

  return { mandatoryMpf, monthlyRelevantIncome };
}

function calculateHousingRentalValue(inputs: HKCalculatorInputs): number {
  const housingType = inputs.taxReliefs.housingBenefitType ?? "none";

  if (housingType === "none") {
    return 0;
  }

  if (housingType === "customRentalValue") {
    return Math.max(0, inputs.taxReliefs.customHousingRentalValue ?? 0);
  }

  const rate = HK_HOUSING_BENEFIT_RATES[housingType] ?? 0;
  const grossEmploymentIncome = Math.max(0, inputs.grossSalary);
  const rentPaid = Math.max(0, inputs.taxReliefs.housingRentPaid ?? 0);

  return Math.max(0, grossEmploymentIncome * rate - rentPaid);
}

function calculateVhisLimit(inputs: Partial<HKCalculatorInputs>): number {
  const insuredPersons = Math.min(
    Math.max(0, Math.floor(inputs.taxReliefs?.vhisInsuredPersons ?? 0)),
    20,
  );
  return insuredPersons * HK_DEDUCTIONS_2026.vhisPerInsuredPersonMax;
}

function calculateDeductionsBeforeDonations(inputs: HKCalculatorInputs) {
  const { grossSalary, contributions, taxReliefs } = inputs;
  const { mandatoryMpf, monthlyRelevantIncome } = calculateMandatoryMpf(grossSalary);

  const voluntaryMpfAnnuity = Math.min(
    Math.max(contributions.taxDeductibleVoluntaryContributions ?? 0, 0),
    HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax,
  );
  const vhisPremiums = Math.min(
    Math.max(taxReliefs.vhisPremiums ?? 0, 0),
    calculateVhisLimit(inputs),
  );
  const selfEducation = Math.min(
    Math.max(taxReliefs.selfEducationExpenses ?? 0, 0),
    HK_DEDUCTIONS_2026.selfEducationMax,
  );
  const homeLoanInterest = Math.min(
    Math.max(taxReliefs.homeLoanInterest ?? 0, 0),
    HK_DEDUCTIONS_2026.homeLoanInterestMax +
      (taxReliefs.hasHomeLoanInterestAdditionalCeiling
        ? HK_DEDUCTIONS_2026.homeLoanInterestAdditionalMax
        : 0),
  );
  const domesticRent = Math.min(
    Math.max(taxReliefs.domesticRent ?? 0, 0),
    HK_DEDUCTIONS_2026.domesticRentMax +
      (taxReliefs.hasDomesticRentAdditionalCeiling
        ? HK_DEDUCTIONS_2026.domesticRentAdditionalMax
        : 0),
  );
  const elderlyResidentialCare = Math.min(
    Math.max(taxReliefs.elderlyResidentialCareExpenses ?? 0, 0),
    HK_DEDUCTIONS_2026.elderlyResidentialCareMax,
  );
  const assistedReproductiveServices = Math.min(
    Math.max(taxReliefs.assistedReproductiveServicesExpenses ?? 0, 0),
    HK_DEDUCTIONS_2026.assistedReproductiveServicesMax,
  );

  return {
    mandatoryMpf,
    monthlyRelevantIncome,
    voluntaryMpfAnnuity,
    vhisPremiums,
    selfEducation,
    homeLoanInterest,
    domesticRent,
    elderlyResidentialCare,
    assistedReproductiveServices,
    total:
      mandatoryMpf +
      voluntaryMpfAnnuity +
      vhisPremiums +
      selfEducation +
      homeLoanInterest +
      domesticRent +
      elderlyResidentialCare +
      assistedReproductiveServices,
  };
}

function calculateCharitableDonationLimit(
  inputs: Partial<HKCalculatorInputs>,
): number {
  const grossSalary = inputs.grossSalary ?? 0;
  const contributions = inputs.contributions ?? {
    taxDeductibleVoluntaryContributions: 0,
  };
  const taxReliefs: HKTaxReliefInputs = {
    hasMarriedAllowance: false,
    hasSingleParentAllowance: false,
    numberOfChildren: 0,
    numberOfNewbornChildren: 0,
    numberOfDependentParents: 0,
    numberOfDependentParentsLivingWith: 0,
    numberOfDependentParentsAged55To59: 0,
    numberOfDependentParentsAged55To59LivingWith: 0,
    numberOfDependentSiblings: 0,
    hasDisabilityAllowance: false,
    numberOfDisabledDependents: 0,
    vhisInsuredPersons: 0,
    vhisPremiums: 0,
    selfEducationExpenses: 0,
    hasHomeLoanInterestAdditionalCeiling: false,
    homeLoanInterest: 0,
    hasDomesticRentAdditionalCeiling: false,
    domesticRent: 0,
    housingBenefitType: "none",
    housingRentPaid: 0,
    customHousingRentalValue: 0,
    charitableDonations: 0,
    elderlyResidentialCareExpenses: 0,
    assistedReproductiveServicesExpenses: 0,
    ...inputs.taxReliefs,
  };
  const deductionInputs: HKCalculatorInputs = {
    country: "HK",
    grossSalary,
    payFrequency: inputs.payFrequency ?? "monthly",
    residencyType: inputs.residencyType ?? "resident",
    contributions,
    taxReliefs,
  };
  const deductionsBeforeDonations =
    calculateDeductionsBeforeDonations(deductionInputs).total;

  const assessableIncome =
    grossSalary + calculateHousingRentalValue(deductionInputs);

  return Math.max(assessableIncome - deductionsBeforeDonations, 0) *
    HK_DEDUCTIONS_2026.donationsMaxRate;
}

// ============================================================================
// HONG KONG TAX CALCULATION
// ============================================================================
function calculateHKIncomeTax(inputs: HKCalculatorInputs) {
  const { grossSalary, residencyType, taxReliefs } = inputs;

  const deductionsBeforeDonationDetails = calculateDeductionsBeforeDonations(inputs);

  const deductionsBeforeDonations =
    deductionsBeforeDonationDetails.total;

  const donationCap = calculateCharitableDonationLimit(inputs);
  const charitableDonations = Math.min(
    Math.max(taxReliefs.charitableDonations ?? 0, 0),
    donationCap,
  );

  const housingRentalValue = calculateHousingRentalValue(inputs);
  const assessableIncome = grossSalary + housingRentalValue;
  const totalDeductions = deductionsBeforeDonations + charitableDonations;
  const netIncome = Math.max(0, assessableIncome - totalDeductions);

  const basicAllowance = taxReliefs.hasMarriedAllowance
    ? 0
    : HK_ALLOWANCES_2026.basic;
  const marriedAllowance = taxReliefs.hasMarriedAllowance
    ? HK_ALLOWANCES_2026.married
    : 0;
  const singleParentAllowance = taxReliefs.hasSingleParentAllowance
    ? HK_ALLOWANCES_2026.singleParent
    : 0;
  const childCount = Math.max(taxReliefs.numberOfChildren, 0);
  const newbornCount = Math.min(
    Math.max(taxReliefs.numberOfNewbornChildren, 0),
    childCount,
  );
  const dependentParents = Math.max(taxReliefs.numberOfDependentParents, 0);
  const dependentParentsLivingWith = Math.min(
    Math.max(taxReliefs.numberOfDependentParentsLivingWith, 0),
    dependentParents,
  );
  const dependentParentsAged55To59 = Math.max(
    taxReliefs.numberOfDependentParentsAged55To59 ?? 0,
    0,
  );
  const dependentParentsAged55To59LivingWith = Math.min(
    Math.max(taxReliefs.numberOfDependentParentsAged55To59LivingWith ?? 0, 0),
    dependentParentsAged55To59,
  );
  const dependentSiblings = Math.max(taxReliefs.numberOfDependentSiblings, 0);
  const disabledDependents = Math.max(taxReliefs.numberOfDisabledDependents, 0);

  const allowances = residencyType === "resident"
    ? {
        basic: basicAllowance,
        married: marriedAllowance,
        singleParent: singleParentAllowance,
        child: childCount * HK_ALLOWANCES_2026.child,
        newbornChild: newbornCount * HK_ALLOWANCES_2026.newbornChild,
        dependentParent: dependentParents * HK_ALLOWANCES_2026.dependentParent,
        dependentParentLivingWith:
          dependentParentsLivingWith * HK_ALLOWANCES_2026.dependentParentLivingWith,
        dependentParentAged55To59:
          dependentParentsAged55To59 *
          HK_ALLOWANCES_2026.dependentParentAged55To59,
        dependentParentAged55To59LivingWith:
          dependentParentsAged55To59LivingWith *
          HK_ALLOWANCES_2026.dependentParentAged55To59LivingWith,
        dependentSibling:
          dependentSiblings * HK_ALLOWANCES_2026.dependentSibling,
        disability: taxReliefs.hasDisabilityAllowance
          ? HK_ALLOWANCES_2026.disability
          : 0,
        disabledDependent:
          disabledDependents * HK_ALLOWANCES_2026.disabledDependent,
      }
    : {
        basic: 0,
        married: 0,
        singleParent: 0,
        child: 0,
        newbornChild: 0,
        dependentParent: 0,
        dependentParentLivingWith: 0,
        dependentParentAged55To59: 0,
        dependentParentAged55To59LivingWith: 0,
        dependentSibling: 0,
        disability: 0,
        disabledDependent: 0,
      };

  const totalAllowances = Object.values(allowances).reduce(
    (sum, value) => sum + value,
    0,
  );
  const netChargeableIncome = Math.max(0, netIncome - totalAllowances);

  const progressiveTax = calculateProgressiveTax(netChargeableIncome);
  const standardTax =
    netIncome <= HK_STANDARD_RATE_2026.threshold
      ? netIncome * HK_STANDARD_RATE_2026.standardRate
      : HK_STANDARD_RATE_2026.threshold * HK_STANDARD_RATE_2026.standardRate +
        (netIncome - HK_STANDARD_RATE_2026.threshold) *
          HK_STANDARD_RATE_2026.higherRate;

  const taxBeforeReduction = Math.min(progressiveTax, standardTax);
  const taxReduction = Math.min(
    taxBeforeReduction * HK_TAX_REDUCTION_2026.rate,
    HK_TAX_REDUCTION_2026.cap,
  );
  const incomeTax = Math.max(0, taxBeforeReduction - taxReduction);

  return {
    assessableIncome,
    housingRentalValue,
    netIncome,
    netChargeableIncome,
    incomeTax,
    taxBeforeReduction,
    taxReduction,
    progressiveTax,
    standardTax,
    mandatoryMpf: deductionsBeforeDonationDetails.mandatoryMpf,
    monthlyRelevantIncome: deductionsBeforeDonationDetails.monthlyRelevantIncome,
    deductions: {
      mandatoryMpf: deductionsBeforeDonationDetails.mandatoryMpf,
      voluntaryMpfAnnuity: deductionsBeforeDonationDetails.voluntaryMpfAnnuity,
      vhisPremiums: deductionsBeforeDonationDetails.vhisPremiums,
      selfEducation: deductionsBeforeDonationDetails.selfEducation,
      homeLoanInterest: deductionsBeforeDonationDetails.homeLoanInterest,
      domesticRent: deductionsBeforeDonationDetails.domesticRent,
      elderlyResidentialCare:
        deductionsBeforeDonationDetails.elderlyResidentialCare,
      assistedReproductiveServices:
        deductionsBeforeDonationDetails.assistedReproductiveServices,
      charitableDonations,
      totalDeductions,
    },
    allowances: {
      ...allowances,
      totalAllowances,
    },
  };
}

// ============================================================================
// HONG KONG CALCULATOR
// ============================================================================
export function calculateHK(inputs: HKCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType } = inputs;

  const taxResult = calculateHKIncomeTax(inputs);

  const taxes: HKTaxBreakdown = {
    totalIncomeTax: taxResult.incomeTax,
    incomeTax: taxResult.incomeTax,
    mpfEmployee: taxResult.mandatoryMpf,
  };

  const totalTax = taxes.incomeTax + taxes.mpfEmployee;
  const voluntaryContributions =
    taxResult.deductions.voluntaryMpfAnnuity;
  const totalDeductions = totalTax + voluntaryContributions;

  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: HKBreakdown = {
    type: "HK",
    assessableIncome: taxResult.assessableIncome,
    housingRentalValue: taxResult.housingRentalValue,
    netIncome: taxResult.netIncome,
    netChargeableIncome: taxResult.netChargeableIncome,
    isResident: residencyType === "resident",
    mpf: {
      employeeContribution: taxResult.mandatoryMpf,
      rate: HK_MPF_2026.rate,
      minRelevantIncomeMonthly: HK_MPF_2026.minRelevantIncomeMonthly,
      maxRelevantIncomeMonthly: HK_MPF_2026.maxRelevantIncomeMonthly,
      monthlyRelevantIncome: taxResult.monthlyRelevantIncome,
      monthlyCap: HK_MPF_2026.employeeMonthlyCap,
    },
    deductions: taxResult.deductions,
    allowances: taxResult.allowances,
    taxComparison: {
      progressiveTax: taxResult.progressiveTax,
      standardTax: taxResult.standardTax,
      standardRateThreshold: HK_STANDARD_RATE_2026.threshold,
      standardRate: HK_STANDARD_RATE_2026.standardRate,
      higherStandardRate: HK_STANDARD_RATE_2026.higherRate,
      taxBeforeReduction: taxResult.taxBeforeReduction,
      taxReduction: taxResult.taxReduction,
      taxReductionCap: HK_TAX_REDUCTION_2026.cap,
    },
    voluntaryContributions: {
      taxDeductibleVoluntaryContributions: voluntaryContributions,
    },
  };

  return {
    country: "HK",
    currency: "HKD",
    grossSalary,
    taxableIncome: taxResult.netChargeableIncome,
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
export const HKCalculator: CountryCalculator = {
  countryCode: "HK",
  config: HK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "HK") {
      throw new Error("HKCalculator can only calculate HK inputs");
    }
    return calculateHK(inputs as HKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const hkInputs =
      inputs && inputs.country === "HK"
        ? (inputs as Partial<HKCalculatorInputs>)
        : {};
    const vhisLimit = calculateVhisLimit(hkInputs);
    const charitableDonationLimit = calculateCharitableDonationLimit(hkInputs);

    return {
      taxDeductibleVoluntaryContributions: {
        limit: HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax,
        name: "MPF TVC + QDAP",
        description: "Tax-deductible voluntary MPF/annuity contributions",
        preTax: true,
      },
      vhisPremiums: {
        limit: vhisLimit,
        name: "VHIS premiums",
        description: "VHIS qualifying premiums capped per insured person",
        preTax: true,
      },
      assistedReproductiveServicesExpenses: {
        limit: HK_DEDUCTIONS_2026.assistedReproductiveServicesMax,
        name: "Assisted reproductive services",
        description:
          "Qualifying assisted reproductive service expenses deduction",
        preTax: true,
      },
      charitableDonations: {
        limit: charitableDonationLimit,
        name: "Approved charitable donations",
        description: "Approved donations capped at 35% of net income",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): HKCalculatorInputs {
    return {
      country: "HK",
      grossSalary: 420000, // HK$35k monthly
      payFrequency: "monthly",
      residencyType: "resident",
      contributions: {
        taxDeductibleVoluntaryContributions: 0,
      },
      taxReliefs: {
        hasMarriedAllowance: false,
        hasSingleParentAllowance: false,
        numberOfChildren: 0,
        numberOfNewbornChildren: 0,
        numberOfDependentParents: 0,
        numberOfDependentParentsLivingWith: 0,
        numberOfDependentParentsAged55To59: 0,
        numberOfDependentParentsAged55To59LivingWith: 0,
        numberOfDependentSiblings: 0,
        hasDisabilityAllowance: false,
        numberOfDisabledDependents: 0,
        vhisInsuredPersons: 0,
        vhisPremiums: 0,
        selfEducationExpenses: 0,
        hasHomeLoanInterestAdditionalCeiling: false,
        homeLoanInterest: 0,
        hasDomesticRentAdditionalCeiling: false,
        domesticRent: 0,
        housingBenefitType: "none",
        housingRentPaid: 0,
        customHousingRentalValue: 0,
        charitableDonations: 0,
        elderlyResidentialCareExpenses: 0,
        assistedReproductiveServicesExpenses: 0,
      },
    };
  },
};
