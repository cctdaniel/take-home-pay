import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { IL_CONFIG } from "./config";
import {
  IL_STUDY_FUND_EMPLOYEE_RATE,
  IL_STUDY_FUND_EMPLOYER_RATE,
  IL_STUDY_FUND_MONTHLY_SALARY_CAP,
  IL_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { ILBreakdown, ILCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  IL_CONFIG,
  IL_TAX_CONFIG,
);

function getILDefaultInputs(): ILCalculatorInputs {
  return {
    country: "IL",
    grossSalary: IL_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    additionalCreditPoints: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
    },
  };
}

function normalizeILInputs(inputs: CalculatorInputs): ILCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"IL"> &
    Partial<ILCalculatorInputs>;
  const defaultInputs = getILDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "IL",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    additionalCreditPoints: Math.min(
      Math.max(0, standardInputs.additionalCreditPoints ?? 0),
      20,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildILStudyFundResult(
  result: CalculationResult,
): CalculationResult {
  if (result.breakdown.type !== "IL") {
    return result;
  }

  const studyFundEmployeeContribution =
    result.breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === "qualifyingExpenses",
    )?.amount ?? 0;
  const studyFundSalaryBase =
    IL_STUDY_FUND_EMPLOYEE_RATE > 0
      ? Math.min(
          studyFundEmployeeContribution / IL_STUDY_FUND_EMPLOYEE_RATE,
          IL_STUDY_FUND_MONTHLY_SALARY_CAP * 12,
        )
      : 0;
  const studyFundEmployerContribution = roundCurrency(
    Math.min(
      studyFundSalaryBase * IL_STUDY_FUND_EMPLOYER_RATE,
      studyFundEmployeeContribution *
        (IL_STUDY_FUND_EMPLOYER_RATE / IL_STUDY_FUND_EMPLOYEE_RATE),
    ),
  );
  const breakdown: ILBreakdown = {
    ...result.breakdown,
    studyFundEmployeeContribution,
    studyFundEmployerContribution,
    studyFundSalaryBase: roundCurrency(studyFundSalaryBase),
  };

  return {
    ...result,
    breakdown,
  };
}

export const ILCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "IL") {
      throw new Error("ILCalculator can only calculate Israel inputs");
    }

    return buildILStudyFundResult(
      baseCalculator.calculate(normalizeILInputs(inputs)),
    );
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getILDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): ILCalculatorInputs {
    return getILDefaultInputs();
  },
};
