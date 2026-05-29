import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { MT_CONFIG } from "./config";
import {
  MALTA_QUALIFYING_FEE_DEDUCTIONS_2026,
  MALTA_RETIREMENT_TAX_CREDITS_2026,
  calculateMaltaClass1Ssc,
  calculateMaltaEmploymentIncomeDeduction,
  calculateMaltaIncomeTax,
  calculateMaltaRetirementTaxCredit,
  getMaltaSchoolFeeLimit,
  getMaltaTaxSchedule,
} from "./constants/tax-brackets-2026";
import type { MTBreakdown, MTCalculatorInputs, MTTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear } from "../calculator-utils";


export function calculateMT(inputs: MTCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    taxStatus,
    sscBirthCohort,
    lowIncomeSscOption,
    contributions,
    taxReliefs,
  } = inputs;

  const isResident = residencyType === "resident";
  const grossIncome = Math.max(0, grossSalary);
  const taxSchedule = getMaltaTaxSchedule(isResident, taxStatus);

  const personalRetirementCredit = isResident
    ? calculateMaltaRetirementTaxCredit(
        contributions.personalRetirementScheme,
        "personalRetirementScheme",
      )
    : calculateMaltaRetirementTaxCredit(0, "personalRetirementScheme");
  const occupationalPensionCredit = isResident
    ? calculateMaltaRetirementTaxCredit(
        contributions.voluntaryOccupationalPension,
        "voluntaryOccupationalPension",
      )
    : calculateMaltaRetirementTaxCredit(0, "voluntaryOccupationalPension");

  const schoolFeeLimit = getMaltaSchoolFeeLimit(taxReliefs.schoolLevel);
  const employmentIncomeDeduction = calculateMaltaEmploymentIncomeDeduction(
    grossIncome,
    taxStatus,
    isResident,
  );
  const schoolFees = isResident
    ? clampAmount(taxReliefs.schoolFees, 0, schoolFeeLimit)
    : 0;
  const childcareFees = isResident
    ? clampAmount(
        taxReliefs.childcareFees,
        0,
        MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.childcareFees,
      )
    : 0;
  const sportsFees = isResident
    ? clampAmount(
        taxReliefs.sportsFees,
        0,
        MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.sportsFees,
      )
    : 0;
  const culturalFees = isResident
    ? clampAmount(
        taxReliefs.culturalFees,
        0,
        MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.culturalFees,
      )
    : 0;
  const totalIncomeDeductions =
    employmentIncomeDeduction +
    schoolFees +
    childcareFees +
    sportsFees +
    culturalFees;
  const chargeableIncome = Math.max(0, grossIncome - totalIncomeDeductions);

  const incomeTaxResult = calculateMaltaIncomeTax(
    chargeableIncome,
    taxSchedule,
  );
  const totalTaxCredits =
    personalRetirementCredit.taxCredit + occupationalPensionCredit.taxCredit;
  const incomeTax = Math.max(0, incomeTaxResult.totalTax - totalTaxCredits);

  const socialSecurity = calculateMaltaClass1Ssc(
    grossIncome,
    sscBirthCohort,
    lowIncomeSscOption,
  );

  const taxes: MTTaxBreakdown = {
    type: "MT",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity: socialSecurity.employeeAnnual,
  };

  const voluntaryContributionsTotal =
    personalRetirementCredit.eligibleContribution +
    occupationalPensionCredit.eligibleContribution;
  const totalTax = incomeTax + socialSecurity.employeeAnnual;
  const totalDeductions = totalTax + voluntaryContributionsTotal;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: MTBreakdown = {
    type: "MT",
    grossIncome,
    taxableIncome: chargeableIncome,
    chargeableIncome,
    isResident,
    residencyType,
    taxStatus,
    taxScheduleName: taxSchedule.name,
    bracketTaxes: incomeTaxResult.bracketTaxes,
    incomeDeductions: {
      employmentIncomeDeduction,
      schoolFees,
      childcareFees,
      sportsFees,
      culturalFees,
      total: totalIncomeDeductions,
    },
    taxCredits: {
      personalRetirementScheme: personalRetirementCredit.taxCredit,
      voluntaryOccupationalPension: occupationalPensionCredit.taxCredit,
      total: totalTaxCredits,
      grossIncomeTax: incomeTaxResult.totalTax,
      finalIncomeTax: incomeTax,
    },
    socialSecurity: {
      category: socialSecurity.category,
      birthCohort: sscBirthCohort,
      lowIncomeOption: lowIncomeSscOption,
      basicWeeklyWage: socialSecurity.basicWeeklyWage,
      employeeWeekly: socialSecurity.employeeWeekly,
      employerWeekly: socialSecurity.employerWeekly,
      maternityLeaveFundWeekly: socialSecurity.maternityLeaveFundWeekly,
      employeeAnnual: socialSecurity.employeeAnnual,
      employerAnnual: socialSecurity.employerAnnual,
      maternityLeaveFundAnnual: socialSecurity.maternityLeaveFundAnnual,
      employeeRate: socialSecurity.employeeRate,
      employerRate: socialSecurity.employerRate,
      annualContributionWage: socialSecurity.annualContributionWage,
    },
    voluntaryContributions: {
      personalRetirementScheme: personalRetirementCredit.eligibleContribution,
      voluntaryOccupationalPension:
        occupationalPensionCredit.eligibleContribution,
      total: voluntaryContributionsTotal,
    },
    assumptions: {
      ordinaryEmploymentOnly: true,
      excludesNomadResidencePermit: true,
      excludesSpecialTaxStatuses: true,
      excludesUnder18AndApprenticeSsc: true,
    },
  };

  return {
    country: "MT",
    currency: "EUR",
    grossSalary: grossIncome,
    taxableIncome: chargeableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const MTCalculator: CountryCalculator = {
  countryCode: "MT",
  config: MT_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MT") {
      throw new Error("MTCalculator can only calculate MT inputs");
    }

    return calculateMT(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const mtInputs = inputs as Partial<MTCalculatorInputs> | undefined;
    const isResident = (mtInputs?.residencyType ?? "resident") === "resident";
    const schoolLevel = mtInputs?.taxReliefs?.schoolLevel ?? "secondary";

    return {
      personalRetirementScheme: {
        limit: isResident
          ? MALTA_RETIREMENT_TAX_CREDITS_2026.personalRetirementScheme
              .maxCreditableContribution
          : 0,
        name: "Personal Retirement Scheme",
        description:
          "25% tax credit on qualifying PRS contributions, capped at EUR 750.",
        preTax: false,
      },
      voluntaryOccupationalPension: {
        limit: isResident
          ? MALTA_RETIREMENT_TAX_CREDITS_2026.voluntaryOccupationalPension
              .maxCreditableContribution
          : 0,
        name: "Voluntary Occupational Pension",
        description:
          "25% tax credit on qualifying employee contributions, capped at EUR 750.",
        preTax: false,
      },
      schoolFees: {
        limit: isResident ? getMaltaSchoolFeeLimit(schoolLevel) : 0,
        name: "Private School Fees",
        description:
          "Deduction for qualifying private school fees, with the official cap based on school level.",
        preTax: true,
      },
      childcareFees: {
        limit: isResident
          ? MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.childcareFees
          : 0,
        name: "Childcare Fees",
        description: "Deduction for qualifying private childcare services.",
        preTax: true,
      },
      sportsFees: {
        limit: isResident
          ? MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.sportsFees
          : 0,
        name: "Sports Fees",
        description: "Deduction for approved sports activities.",
        preTax: true,
      },
      culturalFees: {
        limit: isResident
          ? MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.culturalFees
          : 0,
        name: "Creative or Cultural Course Fees",
        description: "Deduction for approved creative or cultural courses.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): MTCalculatorInputs {
    return {
      country: "MT",
      grossSalary: 30_000,
      payFrequency: "monthly",
      residencyType: "resident",
      taxStatus: "single",
      sscBirthCohort: "born_1962_or_later",
      lowIncomeSscOption: "standard",
      contributions: {
        personalRetirementScheme: 0,
        voluntaryOccupationalPension: 0,
      },
      taxReliefs: {
        schoolLevel: "none",
        schoolFees: 0,
        childcareFees: 0,
        sportsFees: 0,
        culturalFees: 0,
      },
    };
  },
};
