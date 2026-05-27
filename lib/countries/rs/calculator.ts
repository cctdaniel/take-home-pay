import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  CountrySpecificBreakdown,
  RegionInfo,
} from "../types";
import { RS_CONFIG } from "./config";
import {
  calculateSerbiaAnnualPersonalIncomeTaxDetails,
  RS_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { RSBreakdown, RSCalculatorInputs, RSTaxBreakdown } from "./types";

const baseCalculator = createStandardCountryCalculator(
  RS_CONFIG,
  RS_TAX_CONFIG,
);

function normalizeRSInputs(inputs: CalculatorInputs): RSCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"RS"> &
    Partial<RSCalculatorInputs>;

  return {
    ...standardInputs,
    country: "RS",
    grossSalary: standardInputs.grossSalary,
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableFringeBenefits ??
        standardInputs.taxableNonCashBenefits ??
        0,
    ),
    taxableFringeBenefits: Math.max(
      0,
      standardInputs.taxableFringeBenefits ??
        standardInputs.taxableNonCashBenefits ??
        0,
    ),
    payFrequency: standardInputs.payFrequency,
    includeAnnualPersonalIncomeTax:
      standardInputs.includeAnnualPersonalIncomeTax ?? true,
    newlySettledRelief: standardInputs.newlySettledRelief ?? "none",
    age: Math.min(Math.max(Math.round(standardInputs.age ?? 35), 18), 100),
    numberOfDependents: Math.min(
      Math.max(Math.floor(standardInputs.numberOfDependents ?? 0), 0),
      10,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: Math.max(
        0,
        standardInputs.contributions?.qualifyingExpenses ?? 0,
      ),
    },
  };
}

function getRSDefaultInputs(): RSCalculatorInputs {
  return {
    country: "RS",
    grossSalary: RS_TAX_CONFIG.defaultSalary,
    taxableNonCashBenefits: 0,
    taxableFringeBenefits: 0,
    payFrequency: "monthly",
    includeAnnualPersonalIncomeTax: true,
    newlySettledRelief: "none",
    age: 35,
    numberOfDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

export const RSCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "RS") {
      throw new Error("RSCalculator can only calculate Serbia inputs");
    }

    const normalizedInputs = normalizeRSInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const baseBreakdown = result.breakdown as RSBreakdown;
    const baseTaxes = result.taxes as RSTaxBreakdown;
    const payrollContributions = baseBreakdown.mandatoryContributions.filter(
      (contribution) =>
        contribution.name !== "Supplementary annual PIT after selected AIF credit",
    );
    const employeeContributions = payrollContributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0,
    );
    const annualPitDetails = calculateSerbiaAnnualPersonalIncomeTaxDetails({
      grossSalary:
        baseBreakdown.taxableGrossIncome ?? normalizedInputs.grossSalary,
      salaryTax: baseTaxes.incomeTax,
      employeeContributions,
      inputs: normalizedInputs,
    });
    const breakdown: RSBreakdown = {
      ...baseBreakdown,
      annualPitDetails,
      annualPitInputs: {
        includeAnnualPersonalIncomeTax:
          normalizedInputs.includeAnnualPersonalIncomeTax,
        age: normalizedInputs.age,
        numberOfDependents: normalizedInputs.numberOfDependents,
        alternativeInvestmentFundInvestment:
          normalizedInputs.contributions.qualifyingExpenses,
      },
      newlySettledReliefInput: normalizedInputs.newlySettledRelief,
    };

    return {
      ...result,
      breakdown: breakdown as CountrySpecificBreakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getRSDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeRSInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<RSCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): RSCalculatorInputs {
    return getRSDefaultInputs();
  },
};
