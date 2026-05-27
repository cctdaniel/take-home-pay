import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { MT_CONFIG } from "./config";
import {
  MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026,
  MALTA_NOMAD_RESIDENCE_PERMIT_2026,
  MALTA_QUALIFYING_FEE_DEDUCTIONS_2026,
  MALTA_RETIREMENT_TAX_CREDITS_2026,
  calculateMaltaClass1Ssc,
  calculateMaltaEmploymentIncomeDeduction,
  calculateMaltaIncomeTax,
  calculateMaltaRetirementTaxCredit,
  getMaltaSchoolFeeLimit,
  getMaltaTaxSchedule,
} from "./constants/tax-brackets-2026";
import type {
  MTBreakdown,
  MTCalculatorInputs,
  MTTaxBreakdown,
  MTTaxScenario,
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

  return Math.min(max, Math.max(min, value));
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeTaxScenario(
  taxScenario: MTTaxScenario | undefined,
): MTTaxScenario {
  if (
    taxScenario === "highly_skilled_15_percent" ||
    taxScenario === "nomad_first_12_months" ||
    taxScenario === "nomad_10_percent"
  ) {
    return taxScenario;
  }

  return "ordinary_employment";
}

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

  const taxScenario = normalizeTaxScenario(inputs.taxScenario);
  const isNomadScenario =
    taxScenario === "nomad_first_12_months" ||
    taxScenario === "nomad_10_percent";
  const isHighlySkilledScenario = taxScenario === "highly_skilled_15_percent";
  const allowOrdinaryReliefs = !isNomadScenario && !isHighlySkilledScenario;
  const isResident = residencyType === "resident";
  const grossIncome = Math.max(0, grossSalary);
  const hsiEligible =
    isHighlySkilledScenario &&
    grossIncome >= MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.minimumIncome;
  const contributionInputs = contributions ?? {
    personalRetirementScheme: 0,
    voluntaryOccupationalPension: 0,
  };
  const taxReliefInputs = taxReliefs ?? {
    schoolLevel: "none" as const,
    schoolFees: 0,
    childcareFees: 0,
    sportsFees: 0,
    culturalFees: 0,
  };
  const taxSchedule = getMaltaTaxSchedule(isResident, taxStatus);

  const personalRetirementCredit = isResident && allowOrdinaryReliefs
    ? calculateMaltaRetirementTaxCredit(
        contributionInputs.personalRetirementScheme,
        "personalRetirementScheme",
      )
    : calculateMaltaRetirementTaxCredit(0, "personalRetirementScheme");
  const occupationalPensionCredit = isResident && allowOrdinaryReliefs
    ? calculateMaltaRetirementTaxCredit(
        contributionInputs.voluntaryOccupationalPension,
        "voluntaryOccupationalPension",
      )
    : calculateMaltaRetirementTaxCredit(0, "voluntaryOccupationalPension");

  const schoolFeeLimit = getMaltaSchoolFeeLimit(taxReliefInputs.schoolLevel);
  const employmentIncomeDeduction = allowOrdinaryReliefs
    ? calculateMaltaEmploymentIncomeDeduction(grossIncome, taxStatus, isResident)
    : 0;
  const schoolFees = isResident && allowOrdinaryReliefs
    ? clamp(taxReliefInputs.schoolFees, 0, schoolFeeLimit)
    : 0;
  const childcareFees = isResident && allowOrdinaryReliefs
    ? clamp(
        taxReliefInputs.childcareFees,
        0,
        MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.childcareFees,
      )
    : 0;
  const sportsFees = isResident && allowOrdinaryReliefs
    ? clamp(
        taxReliefInputs.sportsFees,
        0,
        MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.sportsFees,
      )
    : 0;
  const culturalFees = isResident && allowOrdinaryReliefs
    ? clamp(
        taxReliefInputs.culturalFees,
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
  const chargeableIncome = isNomadScenario || isHighlySkilledScenario
    ? grossIncome
    : Math.max(0, grossIncome - totalIncomeDeductions);

  const nomadTaxRate =
    taxScenario === "nomad_10_percent"
      ? MALTA_NOMAD_RESIDENCE_PERMIT_2026.authorisedWorkTaxRate
      : MALTA_NOMAD_RESIDENCE_PERMIT_2026.taxExemptFirstTwelveMonthsRate;
  const hsiFlatRateIncome =
    hsiEligible
      ? Math.min(
          chargeableIncome,
          MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.maximumFlatRateIncome,
        )
      : 0;
  const hsiExcessIncome =
    hsiEligible
      ? Math.max(
          0,
          chargeableIncome -
            MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.maximumFlatRateIncome,
        )
      : 0;
  const hsiExcessTaxResult =
    hsiEligible && hsiExcessIncome > 0
      ? calculateMaltaIncomeTax(hsiExcessIncome, taxSchedule)
      : { totalTax: 0, bracketTaxes: [] };
  const incomeTaxResult = isNomadScenario
    ? {
        totalTax: roundCurrency(chargeableIncome * nomadTaxRate),
        bracketTaxes:
          chargeableIncome > 0
            ? [
                {
                  min: 0,
                  max: Infinity,
                  rate: nomadTaxRate,
                  tax: roundCurrency(chargeableIncome * nomadTaxRate),
                },
              ]
            : [],
      }
    : hsiEligible
      ? {
          totalTax: roundCurrency(
            hsiFlatRateIncome *
              MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.taxRate +
              hsiExcessTaxResult.totalTax,
          ),
          bracketTaxes: [
            ...(hsiFlatRateIncome > 0
              ? [
                  {
                    min: 0,
                    max:
                      MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026
                        .maximumFlatRateIncome,
                    rate: MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.taxRate,
                    tax: roundCurrency(
                      hsiFlatRateIncome *
                        MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.taxRate,
                    ),
                  },
                ]
              : []),
            ...hsiExcessTaxResult.bracketTaxes.map((band) => ({
              ...band,
              min:
                band.min +
                MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.maximumFlatRateIncome,
              max: Number.isFinite(band.max)
                ? band.max +
                  MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.maximumFlatRateIncome
                : Infinity,
            })),
          ],
        }
    : calculateMaltaIncomeTax(chargeableIncome, taxSchedule);
  const totalTaxCredits =
    personalRetirementCredit.taxCredit + occupationalPensionCredit.taxCredit;
  const incomeTax = Math.max(0, incomeTaxResult.totalTax - totalTaxCredits);

  const socialSecurity = isNomadScenario || grossIncome <= 0
    ? {
        category: "B" as const,
        basicWeeklyWage: 0,
        employeeWeekly: 0,
        employerWeekly: 0,
        maternityLeaveFundWeekly: 0,
        employeeAnnual: 0,
        employerAnnual: 0,
        maternityLeaveFundAnnual: 0,
        employeeRate: 0,
        employerRate: 0,
        annualContributionWage: 0,
      }
    : calculateMaltaClass1Ssc(
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
  const totalTax = roundCurrency(incomeTax + socialSecurity.employeeAnnual);
  const totalDeductions = roundCurrency(
    totalTax + voluntaryContributionsTotal,
  );
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: MTBreakdown = {
    type: "MT",
    grossIncome,
    taxableIncome: chargeableIncome,
    chargeableIncome,
    isResident,
    taxScenario,
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
    nomadResidencePermit: {
      applies: isNomadScenario,
      taxRate: nomadTaxRate,
      authorisedWorkIncome: isNomadScenario ? grossIncome : 0,
      firstTwelveMonthsExemption: taxScenario === "nomad_first_12_months",
    },
    highlySkilledIndividuals: {
      applies: isHighlySkilledScenario,
      eligible: hsiEligible,
      taxRate: MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.taxRate,
      minimumIncome: MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.minimumIncome,
      maximumFlatRateIncome:
        MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.maximumFlatRateIncome,
      flatRateIncome: hsiFlatRateIncome,
      excessIncome: hsiExcessIncome,
      noReliefsOrCredits: isHighlySkilledScenario,
    },
    voluntaryContributions: {
      personalRetirementScheme: personalRetirementCredit.eligibleContribution,
      voluntaryOccupationalPension:
        occupationalPensionCredit.eligibleContribution,
      total: voluntaryContributionsTotal,
    },
    assumptions: {
      ordinaryEmploymentOnly: !isNomadScenario && !isHighlySkilledScenario,
      excludesNomadResidencePermit: false,
      excludesSpecialTaxStatuses: false,
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
    const isNomadScenario =
      normalizeTaxScenario(mtInputs?.taxScenario) !== "ordinary_employment";
    const isResident = (mtInputs?.residencyType ?? "resident") === "resident";
    const schoolLevel = mtInputs?.taxReliefs?.schoolLevel ?? "secondary";
    const allowResidentReliefs = isResident && !isNomadScenario;

    return {
      personalRetirementScheme: {
        limit: allowResidentReliefs
          ? MALTA_RETIREMENT_TAX_CREDITS_2026.personalRetirementScheme
              .maxCreditableContribution
          : 0,
        name: "Personal Retirement Scheme",
        description:
          "25% tax credit on qualifying PRS contributions, capped at EUR 750.",
        preTax: false,
      },
      voluntaryOccupationalPension: {
        limit: allowResidentReliefs
          ? MALTA_RETIREMENT_TAX_CREDITS_2026.voluntaryOccupationalPension
              .maxCreditableContribution
          : 0,
        name: "Voluntary Occupational Pension",
        description:
          "25% tax credit on qualifying employee contributions, capped at EUR 750.",
        preTax: false,
      },
      schoolFees: {
        limit: allowResidentReliefs ? getMaltaSchoolFeeLimit(schoolLevel) : 0,
        name: "Private School Fees",
        description:
          "Deduction for qualifying private school fees, with the official cap based on school level.",
        preTax: true,
      },
      childcareFees: {
        limit: allowResidentReliefs
          ? MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.childcareFees
          : 0,
        name: "Childcare Fees",
        description: "Deduction for qualifying private childcare services.",
        preTax: true,
      },
      sportsFees: {
        limit: allowResidentReliefs
          ? MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.sportsFees
          : 0,
        name: "Sports Fees",
        description: "Deduction for approved sports activities.",
        preTax: true,
      },
      culturalFees: {
        limit: allowResidentReliefs
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
      taxScenario: "ordinary_employment",
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
