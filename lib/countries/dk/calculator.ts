import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { DK_CONFIG } from "./config";
import {
  DK_AM_BIDRAG_RATE_2026,
  DK_AVERAGE_MUNICIPAL_TAX_RATE_2026,
  DK_BOTTOM_TAX_RATE_2026,
  DK_COMMUTING_DEDUCTION_2026,
  DK_EMPLOYMENT_ALLOWANCE_2026,
  DK_EXTRA_PENSION_DEDUCTION_2026,
  DK_HOUSEHOLD_SERVICES_LIMIT_2026,
  DK_JOB_ALLOWANCE_2026,
  DK_MIDDLE_TAX_RATE_2026,
  DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026,
  DK_OTHER_WORK_EXPENSE_THRESHOLD_2026,
  DK_PERSONAL_ALLOWANCE_2026,
  DK_RATE_PENSION_DEDUCTION_LIMIT_2026,
  DK_RESEARCHER_SCHEME_AM_RATE,
  DK_RESEARCHER_SCHEME_TAX_RATE,
  DK_SENIOR_EMPLOYMENT_ALLOWANCE_2026,
  DK_SINGLE_PARENT_EMPLOYMENT_ALLOWANCE_2026,
  DK_TAX_CONFIG,
  DK_TOP_TAX_RATE_2026,
  DK_TOP_TAX_THRESHOLD_AFTER_AM_2026,
  DK_TOP_TOP_TAX_RATE_2026,
  DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026,
  DK_TRADE_UNION_FEE_LIMIT_2026,
} from "./constants/tax-year-2026";
import type {
  DKBreakdown,
  DKCalculatorInputs,
  DKContributionInputs,
  DKTaxBreakdown,
} from "./types";

function clampAmount(value: number | undefined, max = Infinity): number {
  return Math.min(Math.max(0, value ?? 0), max);
}

function calculateCommutingDeduction(roundTripKm: number, workdays: number): number {
  const dailyKm = Math.max(0, roundTripKm);
  const days = Math.max(0, Math.round(workdays));
  const firstBandKm = Math.max(
    0,
    Math.min(
      dailyKm,
      DK_COMMUTING_DEDUCTION_2026.firstBandMaxRoundTripKm,
    ) - DK_COMMUTING_DEDUCTION_2026.freeRoundTripKm,
  );
  const excessKm = Math.max(
    0,
    dailyKm - DK_COMMUTING_DEDUCTION_2026.firstBandMaxRoundTripKm,
  );

  return roundCurrency(
    days *
      (firstBandKm * DK_COMMUTING_DEDUCTION_2026.firstBandRatePerKm +
        excessKm * DK_COMMUTING_DEDUCTION_2026.excessBandRatePerKm),
  );
}

function calculateDKOrdinaryTax(inputs: DKCalculatorInputs) {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxableGrossIncome = roundCurrency(
    grossSalary + taxableBenefitsInKind,
  );
  const contributions: Partial<DKContributionInputs> = inputs.contributions ?? {};
  const privateRatePension = clampAmount(
    contributions.privateRatePension,
    DK_RATE_PENSION_DEDUCTION_LIMIT_2026,
  );
  const tradeUnionFees = clampAmount(
    contributions.tradeUnionFees,
    DK_TRADE_UNION_FEE_LIMIT_2026,
  );
  const unemploymentInsuranceFees = clampAmount(
    contributions.unemploymentInsuranceFees,
  );
  const householdServices = clampAmount(
    contributions.householdServices,
    DK_HOUSEHOLD_SERVICES_LIMIT_2026,
  );
  const otherWorkExpenses = clampAmount(contributions.otherWorkExpenses);
  const otherWorkExpensesDeduction = roundCurrency(
    Math.max(0, otherWorkExpenses - DK_OTHER_WORK_EXPENSE_THRESHOLD_2026),
  );
  const commutingDeduction = calculateCommutingDeduction(
    inputs.roundTripCommutingKm,
    inputs.commutingWorkdays,
  );

  const employeeSocialContribution = roundCurrency(
    taxableGrossIncome * DK_AM_BIDRAG_RATE_2026,
  );
  const personalIncomeAfterAM = Math.max(
    0,
    taxableGrossIncome - employeeSocialContribution - privateRatePension,
  );
  const employmentAllowance = roundCurrency(
    Math.min(
      personalIncomeAfterAM * DK_EMPLOYMENT_ALLOWANCE_2026.rate,
      DK_EMPLOYMENT_ALLOWANCE_2026.max,
    ),
  );
  const jobAllowance = roundCurrency(
    Math.min(
      Math.max(0, personalIncomeAfterAM - DK_JOB_ALLOWANCE_2026.threshold) *
        DK_JOB_ALLOWANCE_2026.rate,
      DK_JOB_ALLOWANCE_2026.max,
    ),
  );
  const singleParentEmploymentAllowance = inputs.singleParentAllowanceEligible
    ? roundCurrency(
        Math.min(
          personalIncomeAfterAM * DK_SINGLE_PARENT_EMPLOYMENT_ALLOWANCE_2026.rate,
          DK_SINGLE_PARENT_EMPLOYMENT_ALLOWANCE_2026.max,
        ),
      )
    : 0;
  const seniorEmploymentAllowance =
    inputs.statePensionProximity === "one_or_two_years"
      ? roundCurrency(
          Math.min(
            personalIncomeAfterAM * DK_SENIOR_EMPLOYMENT_ALLOWANCE_2026.rate,
            DK_SENIOR_EMPLOYMENT_ALLOWANCE_2026.max,
          ),
        )
      : 0;
  const pensionExtraRate =
    inputs.statePensionProximity === "more_than_15_years"
      ? DK_EXTRA_PENSION_DEDUCTION_2026.moreThan15YearsRate
      : DK_EXTRA_PENSION_DEDUCTION_2026.within15YearsRate;
  const extraPensionDeduction = roundCurrency(
    Math.min(privateRatePension, DK_EXTRA_PENSION_DEDUCTION_2026.basisCap) *
      pensionExtraRate,
  );

  const lineDeductions = roundCurrency(
    employmentAllowance +
      jobAllowance +
      singleParentEmploymentAllowance +
      seniorEmploymentAllowance +
      extraPensionDeduction +
      tradeUnionFees +
      unemploymentInsuranceFees +
      commutingDeduction +
      householdServices +
      otherWorkExpensesDeduction,
  );
  const municipalTaxableIncome = Math.max(
    0,
    personalIncomeAfterAM - DK_PERSONAL_ALLOWANCE_2026 - lineDeductions,
  );
  const bottomTaxBase = Math.max(
    0,
    personalIncomeAfterAM - DK_PERSONAL_ALLOWANCE_2026,
  );
  const municipalTax = roundCurrency(
    municipalTaxableIncome * DK_AVERAGE_MUNICIPAL_TAX_RATE_2026,
  );
  const bottomTax = roundCurrency(bottomTaxBase * DK_BOTTOM_TAX_RATE_2026);
  const middleTax = roundCurrency(
    Math.max(0, personalIncomeAfterAM - DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026) *
      DK_MIDDLE_TAX_RATE_2026,
  );
  const topTax = roundCurrency(
    Math.max(0, personalIncomeAfterAM - DK_TOP_TAX_THRESHOLD_AFTER_AM_2026) *
      DK_TOP_TAX_RATE_2026,
  );
  const topTopTax = roundCurrency(
    Math.max(0, personalIncomeAfterAM - DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026) *
      DK_TOP_TOP_TAX_RATE_2026,
  );
  const incomeTax = roundCurrency(
    municipalTax + bottomTax + middleTax + topTax + topTopTax,
  );
  const totalTax = roundCurrency(incomeTax + employeeSocialContribution);

  return {
    grossSalary,
    taxableBenefitsInKind,
    taxableGrossIncome,
    privateRatePension,
    tradeUnionFees,
    unemploymentInsuranceFees,
    householdServices,
    otherWorkExpensesDeduction,
    commutingDeduction,
    employeeSocialContribution,
    personalIncomeAfterAM,
    employmentAllowance,
    jobAllowance,
    singleParentEmploymentAllowance,
    seniorEmploymentAllowance,
    extraPensionDeduction,
    municipalTaxableIncome,
    bottomTax,
    middleTax,
    topTax,
    topTopTax,
    municipalTax,
    incomeTax,
    totalTax,
  };
}

export function calculateDK(inputs: DKCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxableGrossIncome = roundCurrency(
    grossSalary + taxableBenefitsInKind,
  );
  const taxRegime = inputs.taxRegime ?? "ordinary";
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  if (taxRegime === "researcherScheme") {
    const employeeSocialContribution = roundCurrency(
      taxableGrossIncome * DK_RESEARCHER_SCHEME_AM_RATE,
    );
    const totalTax = roundCurrency(
      taxableGrossIncome * DK_RESEARCHER_SCHEME_TAX_RATE,
    );
    const incomeTax = roundCurrency(totalTax - employeeSocialContribution);
    const netSalary = roundCurrency(grossSalary - totalTax);

    const taxes: DKTaxBreakdown = {
      type: "DK",
      totalIncomeTax: incomeTax,
      incomeTax,
      employeeSocialContribution,
    };

    const breakdown: DKBreakdown = {
      type: "DK",
      grossIncome: grossSalary,
      taxableBenefitsInKind,
      taxableGrossIncome,
      taxableIncome: taxableGrossIncome,
      bracketTaxes: [],
      employeeSocialContribution: {
        name: DK_TAX_CONFIG.employeeSocialName,
        amount: employeeSocialContribution,
        rate: DK_RESEARCHER_SCHEME_AM_RATE,
      },
      taxRegime,
      specialRegime: {
        name: "Researcher / highly paid employee scheme",
        rate: DK_RESEARCHER_SCHEME_TAX_RATE,
        incomeTax,
        employeeSocialContribution,
      },
      personalAllowance: 0,
      automaticAllowances: {
        employmentAllowance: 0,
        jobAllowance: 0,
        singleParentEmploymentAllowance: 0,
        seniorEmploymentAllowance: 0,
      },
      voluntaryDeductions: {
        privateRatePension: 0,
        extraPensionDeduction: 0,
        tradeUnionFees: 0,
        unemploymentInsuranceFees: 0,
        commutingDeduction: 0,
        householdServices: 0,
        otherWorkExpensesDeduction: 0,
      },
      pensionProximity: inputs.statePensionProximity,
      singleParentAllowanceEligible: false,
      roundTripCommutingKm: 0,
      commutingWorkdays: 0,
      assumptions: DK_TAX_CONFIG.assumptions,
      sourceUrls: DK_TAX_CONFIG.sourceUrls,
    };

    return {
      country: "DK",
      currency: "DKK",
      grossSalary,
      taxableIncome: taxableGrossIncome,
      taxes,
      totalTax,
      totalDeductions: totalTax,
      netSalary,
      effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
      perPeriod: {
        gross: grossSalary / periodsPerYear,
        net: netSalary / periodsPerYear,
        frequency: inputs.payFrequency,
      },
      breakdown,
    };
  }

  const computation = calculateDKOrdinaryTax(inputs);
  const netSalary = roundCurrency(
    grossSalary - computation.totalTax - computation.privateRatePension,
  );

  const taxes: DKTaxBreakdown = {
    type: "DK",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: DKBreakdown = {
    type: "DK",
    grossIncome: grossSalary,
    taxableBenefitsInKind: computation.taxableBenefitsInKind,
    taxableGrossIncome: computation.taxableGrossIncome,
    taxableIncome: computation.municipalTaxableIncome,
    bracketTaxes: [
      {
        min: 0,
        max: DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026,
        rate: DK_BOTTOM_TAX_RATE_2026,
        tax: computation.bottomTax,
      },
      {
        min: DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026,
        max: DK_TOP_TAX_THRESHOLD_AFTER_AM_2026,
        rate: DK_MIDDLE_TAX_RATE_2026,
        tax: computation.middleTax,
      },
      {
        min: DK_TOP_TAX_THRESHOLD_AFTER_AM_2026,
        max: DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026,
        rate: DK_TOP_TAX_RATE_2026,
        tax: computation.topTax,
      },
      {
        min: DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026,
        max: Infinity,
        rate: DK_TOP_TOP_TAX_RATE_2026,
        tax: computation.topTopTax,
      },
    ],
    employeeSocialContribution: {
      name: DK_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: DK_AM_BIDRAG_RATE_2026,
    },
    taxRegime,
    personalAllowance: DK_PERSONAL_ALLOWANCE_2026,
    automaticAllowances: {
      employmentAllowance: computation.employmentAllowance,
      jobAllowance: computation.jobAllowance,
      singleParentEmploymentAllowance:
        computation.singleParentEmploymentAllowance,
      seniorEmploymentAllowance: computation.seniorEmploymentAllowance,
    },
    voluntaryDeductions: {
      privateRatePension: computation.privateRatePension,
      extraPensionDeduction: computation.extraPensionDeduction,
      tradeUnionFees: computation.tradeUnionFees,
      unemploymentInsuranceFees: computation.unemploymentInsuranceFees,
      commutingDeduction: computation.commutingDeduction,
      householdServices: computation.householdServices,
      otherWorkExpensesDeduction: computation.otherWorkExpensesDeduction,
    },
    stateTaxes: {
      bottomTax: computation.bottomTax,
      middleTax: computation.middleTax,
      topTax: computation.topTax,
      topTopTax: computation.topTopTax,
      municipalTax: computation.municipalTax,
    },
    pensionProximity: inputs.statePensionProximity,
    singleParentAllowanceEligible: inputs.singleParentAllowanceEligible,
    roundTripCommutingKm: Math.max(0, inputs.roundTripCommutingKm),
    commutingWorkdays: Math.max(0, Math.round(inputs.commutingWorkdays)),
    assumptions: DK_TAX_CONFIG.assumptions,
    sourceUrls: DK_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "DK",
    currency: "DKK",
    grossSalary,
    taxableIncome: computation.municipalTaxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: roundCurrency(
      computation.totalTax + computation.privateRatePension,
    ),
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? computation.totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const DKCalculator: CountryCalculator = {
  countryCode: "DK",
  config: DK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DK") {
      throw new Error("DKCalculator can only calculate DK inputs");
    }

    return calculateDK(inputs as DKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      privateRatePension: {
        limit: DK_RATE_PENSION_DEDUCTION_LIMIT_2026,
        name: "Rate pension / terminating annuity",
        description:
          "2026 combined deductible cap for rate pension and terminating annuity contributions.",
        preTax: true,
      },
      tradeUnionFees: {
        limit: DK_TRADE_UNION_FEE_LIMIT_2026,
        name: "Trade union fees",
        description: "2026 annual cap for Danish trade union fee deduction.",
        preTax: true,
      },
      householdServices: {
        limit: DK_HOUSEHOLD_SERVICES_LIMIT_2026,
        name: "Household services",
        description:
          "2026 per-person cap for eligible household service labour costs.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): DKCalculatorInputs {
    return {
      country: "DK",
      grossSalary: 600_000,
      payFrequency: "monthly",
      taxableBenefitsInKind: 0,
      taxRegime: "ordinary",
      statePensionProximity: "more_than_15_years",
      singleParentAllowanceEligible: false,
      roundTripCommutingKm: 0,
      commutingWorkdays: 216,
      contributions: {
        privateRatePension: 0,
        tradeUnionFees: 0,
        unemploymentInsuranceFees: 0,
        householdServices: 0,
        otherWorkExpenses: 0,
      },
    };
  },
};
