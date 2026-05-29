// ============================================================================
// SPAIN CALCULATOR IMPLEMENTATION
// ============================================================================
//
// Models salary income for an employee under Spain's general payroll regime:
// - IRPF resident income tax using the AEAT state scale plus selected autonomous
//   community scale.
// - Employee Social Security contributions using 2026 published rates and base cap.
// - IRNR flat tax for non-residents, without personal/family minimums.
//
// Regional scope: this calculator includes a default autonomous scale plus four
// high-usage regions (Madrid, Catalonia, Andalusia, Valencian Community). It does
// not model Basque/Navarre foral regimes or regional deductions/credits.
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
  TaxBracket,
} from "../types";
import { ES_CONFIG } from "./config";
import {
  SPAIN_IRNR_RATES_2026,
  SPAIN_JOINT_TAXATION_REDUCTIONS_2025,
  SPAIN_PENSION_CONTRIBUTION_REDUCTION_2025,
  SPAIN_PERSONAL_FAMILY_MINIMUMS_2025,
  SPAIN_REGIONS,
  SPAIN_SOCIAL_SECURITY_2026,
  SPAIN_STATE_IRPF_BRACKETS_2025,
  SPAIN_WORK_EXPENSE_DEDUCTION_2025,
  calculateSpanishProgressiveTax,
  getSpainRegionScale,
} from "./constants/tax-brackets-2026";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import type {
  ESBreakdown,
  ESCalculatorInputs,
  ESEmploymentContractType,
  ESFilingStatus,
  ESResidencyType,
  ESTaxBreakdown,
} from "./types";

function calculateTaxpayerMinimum(age: number): number {
  const minimums = SPAIN_PERSONAL_FAMILY_MINIMUMS_2025;
  let minimum = minimums.taxpayer;

  if (age > 65) {
    minimum += minimums.ageOver65Increase;
  }

  if (age > 75) {
    minimum += minimums.ageOver75Increase;
  }

  return minimum;
}

function calculateDescendantMinimum(
  numberOfChildren: number,
  numberOfChildrenUnderThree: number,
): number {
  const minimums = SPAIN_PERSONAL_FAMILY_MINIMUMS_2025;
  const children = Math.max(0, Math.floor(numberOfChildren));
  const childrenUnderThree = Math.min(
    Math.max(0, Math.floor(numberOfChildrenUnderThree)),
    children,
  );

  let minimum = 0;

  for (let index = 0; index < children; index += 1) {
    minimum +=
      minimums.descendants[index] ?? minimums.fourthAndLaterDescendant;
  }

  return minimum + childrenUnderThree * minimums.descendantUnderThreeIncrease;
}

function getJointTaxationReduction(
  filingStatus: ESFilingStatus,
  numberOfChildren: number,
): number {
  if (filingStatus === "married_jointly") {
    return SPAIN_JOINT_TAXATION_REDUCTIONS_2025.marriedJointly;
  }

  if (filingStatus === "single_parent" && numberOfChildren > 0) {
    return SPAIN_JOINT_TAXATION_REDUCTIONS_2025.singleParent;
  }

  return 0;
}

function calculateSocialSecurity(
  grossSalary: number,
  employmentContractType: ESEmploymentContractType,
) {
  const monthlySalary = grossSalary / 12;
  const monthlyBase =
    grossSalary > 0
      ? Math.min(
          Math.max(monthlySalary, SPAIN_SOCIAL_SECURITY_2026.monthlyBaseMin),
          SPAIN_SOCIAL_SECURITY_2026.monthlyBaseMax,
        )
      : 0;
  const annualBase = monthlyBase * 12;
  const unemploymentEmployeeRate =
    employmentContractType === "fixed_term"
      ? SPAIN_SOCIAL_SECURITY_2026.unemploymentFixedTermEmployeeRate
      : SPAIN_SOCIAL_SECURITY_2026.unemploymentPermanentEmployeeRate;
  const unemploymentEmployerRate =
    employmentContractType === "fixed_term"
      ? SPAIN_SOCIAL_SECURITY_2026.unemploymentFixedTermEmployerRate
      : SPAIN_SOCIAL_SECURITY_2026.unemploymentPermanentEmployerRate;

  const commonContingencies =
    annualBase * SPAIN_SOCIAL_SECURITY_2026.commonContingenciesEmployeeRate;
  const unemployment = annualBase * unemploymentEmployeeRate;
  const training = annualBase * SPAIN_SOCIAL_SECURITY_2026.trainingEmployeeRate;
  const mei = annualBase * SPAIN_SOCIAL_SECURITY_2026.meiEmployeeRate;
  const solidarityBrackets =
    SPAIN_SOCIAL_SECURITY_2026.solidarityContributionBrackets.map(
      (bracket) => {
        const monthlyExcess = Math.max(
          0,
          Math.min(monthlySalary, bracket.maxMonthly) - bracket.minMonthly,
        );

        return {
          ...bracket,
          employee: roundCurrency(monthlyExcess * bracket.employeeRate * 12),
          employer: roundCurrency(monthlyExcess * bracket.employerRate * 12),
        };
      },
    );
  const solidarity = solidarityBrackets.reduce(
    (sum, bracket) => sum + bracket.employee,
    0,
  );
  const solidarityEmployer = solidarityBrackets.reduce(
    (sum, bracket) => sum + bracket.employer,
    0,
  );
  const total = commonContingencies + unemployment + training + mei + solidarity;

  const employer =
    annualBase *
      (SPAIN_SOCIAL_SECURITY_2026.commonContingenciesEmployerRate +
        unemploymentEmployerRate +
        SPAIN_SOCIAL_SECURITY_2026.trainingEmployerRate +
        SPAIN_SOCIAL_SECURITY_2026.fogasaEmployerRate +
        SPAIN_SOCIAL_SECURITY_2026.meiEmployerRate) +
    solidarityEmployer;

  return {
    monthlyBase,
    annualBase,
    commonContingencies: roundCurrency(commonContingencies),
    unemployment: roundCurrency(unemployment),
    training: roundCurrency(training),
    mei: roundCurrency(mei),
    solidarity: roundCurrency(solidarity),
    solidarityEmployer: roundCurrency(solidarityEmployer),
    solidarityBrackets,
    total: roundCurrency(total),
    employer: roundCurrency(employer),
    unemploymentEmployeeRate,
  };
}

function calculateResidentIncomeTax({
  taxableIncome,
  personalFamilyMinimum,
  regionalBrackets,
}: {
  taxableIncome: number;
  personalFamilyMinimum: number;
  regionalBrackets: TaxBracket[];
}) {
  const stateGrossTax = calculateSpanishProgressiveTax(
    taxableIncome,
    SPAIN_STATE_IRPF_BRACKETS_2025,
  );
  const regionalGrossTax = calculateSpanishProgressiveTax(
    taxableIncome,
    regionalBrackets,
  );
  const minimumSubjectToTax = Math.min(taxableIncome, personalFamilyMinimum);
  const stateMinimumTax = calculateSpanishProgressiveTax(
    minimumSubjectToTax,
    SPAIN_STATE_IRPF_BRACKETS_2025,
  );
  const regionalMinimumTax = calculateSpanishProgressiveTax(
    minimumSubjectToTax,
    regionalBrackets,
  );

  const stateIncomeTax = Math.max(
    0,
    stateGrossTax.totalTax - stateMinimumTax.totalTax,
  );
  const regionalIncomeTax = Math.max(
    0,
    regionalGrossTax.totalTax - regionalMinimumTax.totalTax,
  );

  return {
    stateIncomeTax: roundCurrency(stateIncomeTax),
    regionalIncomeTax: roundCurrency(regionalIncomeTax),
    incomeTax: roundCurrency(stateIncomeTax + regionalIncomeTax),
    stateGrossTax: roundCurrency(stateGrossTax.totalTax),
    regionalGrossTax: roundCurrency(regionalGrossTax.totalTax),
    stateMinimumCredit: roundCurrency(stateMinimumTax.totalTax),
    regionalMinimumCredit: roundCurrency(regionalMinimumTax.totalTax),
    stateBracketTaxes: stateGrossTax.bracketTaxes,
    regionalBracketTaxes: regionalGrossTax.bracketTaxes,
  };
}

function getNonResidentRate(residencyType: ESResidencyType): number {
  return residencyType === "non_resident_eu_eea"
    ? SPAIN_IRNR_RATES_2026.euEea
    : SPAIN_IRNR_RATES_2026.other;
}

function calculatePensionContributionLimit({
  grossSalary,
  socialSecurityTotal,
  workExpenseDeduction,
  isResident,
}: {
  grossSalary: number;
  socialSecurityTotal: number;
  workExpenseDeduction: number;
  isResident: boolean;
}): number {
  if (!isResident) {
    return 0;
  }

  const pensionReductionBase = Math.max(
    0,
    grossSalary - socialSecurityTotal - workExpenseDeduction,
  );

  return Math.min(
    SPAIN_PENSION_CONTRIBUTION_REDUCTION_2025.individualLimit,
    pensionReductionBase *
      SPAIN_PENSION_CONTRIBUTION_REDUCTION_2025.netIncomeLimitRate,
  );
}

export function calculateES(inputs: ESCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    region,
    filingStatus,
    age,
    numberOfChildren,
    numberOfChildrenUnderThree,
    employmentContractType,
    contributions,
  } = inputs;

  const isResident = residencyType === "resident";
  const regionScale = getSpainRegionScale(region);
  const socialSecurity = calculateSocialSecurity(
    grossSalary,
    employmentContractType,
  );
  const taxpayerMinimum = calculateTaxpayerMinimum(age);
  const descendantMinimum = calculateDescendantMinimum(
    numberOfChildren,
    numberOfChildrenUnderThree,
  );
  const personalFamilyMinimum = taxpayerMinimum + descendantMinimum;
  const jointTaxationReduction = getJointTaxationReduction(
    filingStatus,
    numberOfChildren,
  );
  const workExpenseDeduction = isResident
    ? Math.min(
        SPAIN_WORK_EXPENSE_DEDUCTION_2025,
        Math.max(0, grossSalary - socialSecurity.total),
      )
    : 0;
  const pensionContributionLimit = calculatePensionContributionLimit({
    grossSalary,
    socialSecurityTotal: socialSecurity.total,
    workExpenseDeduction,
    isResident,
  });
  const pensionContribution = isResident
    ? Math.min(
        Math.max(0, contributions.pensionContribution || 0),
        pensionContributionLimit,
      )
    : 0;
  const taxableIncome = isResident
    ? Math.max(
        0,
        grossSalary -
          socialSecurity.total -
          workExpenseDeduction -
          pensionContribution -
          jointTaxationReduction,
      )
    : grossSalary;

  const residentTax = isResident
    ? calculateResidentIncomeTax({
        taxableIncome,
        personalFamilyMinimum,
        regionalBrackets: regionScale.brackets,
      })
    : null;
  const nonResidentRate = isResident ? undefined : getNonResidentRate(residencyType);
  const incomeTax = residentTax
    ? residentTax.incomeTax
    : roundCurrency(grossSalary * (nonResidentRate ?? 0));
  const stateIncomeTax = residentTax?.stateIncomeTax ?? incomeTax;
  const regionalIncomeTax = residentTax?.regionalIncomeTax ?? 0;
  const totalTax = incomeTax + socialSecurity.total;
  const totalDeductions = totalTax + pensionContribution;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const taxes: ESTaxBreakdown = {
    type: "ES",
    totalIncomeTax: incomeTax,
    incomeTax,
    stateIncomeTax,
    regionalIncomeTax,
    socialSecurity: socialSecurity.total,
  };

  const breakdown: ESBreakdown = {
    type: "ES",
    grossIncome: grossSalary,
    residencyType,
    isResident,
    region,
    regionName: regionScale.name,
    filingStatus,
    age,
    numberOfChildren,
    numberOfChildrenUnderThree,
    employmentContractType,
    taxableIncome,
    workExpenseDeduction,
    jointTaxationReduction,
    voluntaryContributions: {
      pensionContribution,
      pensionContributionLimit,
      total: pensionContribution,
    },
    taxpayerMinimum,
    descendantMinimum,
    personalFamilyMinimum,
    minimumTaxCredit:
      (residentTax?.stateMinimumCredit ?? 0) +
      (residentTax?.regionalMinimumCredit ?? 0),
    incomeTax,
    stateIncomeTax,
    regionalIncomeTax,
    nonResidentRate,
    stateGrossTax: residentTax?.stateGrossTax ?? 0,
    regionalGrossTax: residentTax?.regionalGrossTax ?? 0,
    stateMinimumCredit: residentTax?.stateMinimumCredit ?? 0,
    regionalMinimumCredit: residentTax?.regionalMinimumCredit ?? 0,
    stateBracketTaxes: residentTax?.stateBracketTaxes ?? [],
    regionalBracketTaxes: residentTax?.regionalBracketTaxes ?? [],
    socialSecurity: {
      monthlyBase: socialSecurity.monthlyBase,
      annualBase: socialSecurity.annualBase,
      commonContingencies: socialSecurity.commonContingencies,
      unemployment: socialSecurity.unemployment,
      training: socialSecurity.training,
      mei: socialSecurity.mei,
      solidarity: socialSecurity.solidarity,
      solidarityEmployer: socialSecurity.solidarityEmployer,
      solidarityBrackets: socialSecurity.solidarityBrackets,
      total: socialSecurity.total,
      employer: socialSecurity.employer,
      commonContingenciesRate:
        SPAIN_SOCIAL_SECURITY_2026.commonContingenciesEmployeeRate,
      unemploymentRate: socialSecurity.unemploymentEmployeeRate,
      trainingRate: SPAIN_SOCIAL_SECURITY_2026.trainingEmployeeRate,
      meiRate: SPAIN_SOCIAL_SECURITY_2026.meiEmployeeRate,
      monthlyBaseMax: SPAIN_SOCIAL_SECURITY_2026.monthlyBaseMax,
      monthlyBaseMin: SPAIN_SOCIAL_SECURITY_2026.monthlyBaseMin,
    },
    assumptions: {
      irpfRateYear: 2025,
      socialSecurityYear: 2026,
      includesRegionalDeductions: false,
      includesForalRegimes: false,
    },
  };

  return {
    country: "ES",
    currency: "EUR",
    grossSalary,
    taxableIncome,
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

export const ESCalculator: CountryCalculator = {
  countryCode: "ES",
  config: ES_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "ES") {
      throw new Error("ESCalculator can only calculate ES inputs");
    }
    return calculateES(inputs as ESCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return SPAIN_REGIONS.map((region) => ({
      code: region.code,
      name: region.name,
      taxType: "progressive",
      notes: region.notes,
    }));
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const esInputs = inputs as Partial<ESCalculatorInputs> | undefined;
    const grossSalary = Math.max(0, esInputs?.grossSalary ?? 36_000);
    const residencyType = esInputs?.residencyType ?? "resident";
    const employmentContractType =
      esInputs?.employmentContractType ?? "permanent";
    const socialSecurity = calculateSocialSecurity(
      grossSalary,
      employmentContractType,
    );
    const workExpenseDeduction =
      residencyType === "resident"
        ? Math.min(
            SPAIN_WORK_EXPENSE_DEDUCTION_2025,
            Math.max(0, grossSalary - socialSecurity.total),
          )
        : 0;
    const limit = calculatePensionContributionLimit({
      grossSalary,
      socialSecurityTotal: socialSecurity.total,
      workExpenseDeduction,
      isResident: residencyType === "resident",
    });

    return {
      pensionContribution: {
        limit,
        name: "Pension Plan Contribution",
        description:
          "Resident pension/social welfare contribution reduction, capped at EUR 1,500 and 30% of net work income.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ESCalculatorInputs {
    return {
      country: "ES",
      grossSalary: 36_000,
      payFrequency: "monthly",
      residencyType: "resident",
      region: "general",
      filingStatus: "individual",
      age: 30,
      numberOfChildren: 0,
      numberOfChildrenUnderThree: 0,
      employmentContractType: "permanent",
      contributions: {
        pensionContribution: 0,
      },
    };
  },
};
