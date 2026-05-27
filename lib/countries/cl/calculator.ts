import {
  calculateStandardCountry,
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
  type StandardCountryTaxConfig,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { CL_CONFIG } from "./config";
import {
  CL_APV_REGIME_A_BONUS_CAP,
  CL_APV_REGIME_A_BONUS_RATE,
  CL_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { CLBreakdown, CLCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  CL_CONFIG,
  CL_TAX_CONFIG,
);

function getCLDefaultInputs(): CLCalculatorInputs {
  return {
    country: "CL",
    grossSalary: CL_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    contractType: "indefinite",
    apvTaxRegime: "regimeB",
    contributions: {
      retirementContribution: 0,
      medicalExpenses: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeCLInputs(inputs: CalculatorInputs): CLCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"CL"> &
    Partial<CLCalculatorInputs>;
  const defaultInputs = getCLDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "CL",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    contractType: standardInputs.contractType ?? "indefinite",
    apvTaxRegime: standardInputs.apvTaxRegime ?? "regimeB",
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
      medicalExpenses: Math.min(
        Math.max(0, standardInputs.contributions?.medicalExpenses ?? 0),
        standardInputs.grossSalary,
      ),
    },
  };
}

function buildCLTaxConfig(
  inputs: CLCalculatorInputs,
): StandardCountryTaxConfig<"CL"> {
  return {
    ...CL_TAX_CONFIG,
    voluntaryContributions: (CL_TAX_CONFIG.voluntaryContributions ?? []).map(
      (contribution) =>
        contribution.key === "retirementContribution" &&
        inputs.apvTaxRegime === "regimeA"
          ? {
              ...contribution,
              name: "APV retirement savings (regime A)",
              description:
                "APV regime A does not reduce current taxable income; it is modeled as a take-home cash deduction with a separate 15% fiscal bonus shown in results.",
              taxTreatment: "none" as const,
            }
          : contribution.key === "retirementContribution"
            ? {
                ...contribution,
                name: "APV retirement savings (regime B)",
                description:
                  "APV regime B reduces current taxable income up to the annual 600 UF cap shown in the SII 2026 income-tax guide.",
                taxTreatment: "deduction" as const,
              }
            : contribution,
    ),
  };
}

function withCLApvRegimeResult(
  result: CalculationResult,
  inputs: CLCalculatorInputs,
): CalculationResult {
  if (result.breakdown.type !== "CL") {
    return result;
  }

  const apvContribution =
    result.breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    )?.amount ?? 0;
  const apvFiscalBonus =
    inputs.apvTaxRegime === "regimeA"
      ? Math.min(
          apvContribution * CL_APV_REGIME_A_BONUS_RATE,
          CL_APV_REGIME_A_BONUS_CAP,
        )
      : 0;
  const breakdown: CLBreakdown = {
    ...result.breakdown,
    apvTaxRegime: inputs.apvTaxRegime,
    apvContribution,
    apvFiscalBonus,
    apvFiscalBonusCap: CL_APV_REGIME_A_BONUS_CAP,
  };

  return {
    ...result,
    breakdown,
  };
}

export const CLCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "CL") {
      throw new Error("CLCalculator can only calculate Chile inputs");
    }

    const normalizedInputs = normalizeCLInputs(inputs);
    const result = calculateStandardCountry(
      normalizedInputs,
      buildCLTaxConfig(normalizedInputs),
    );

    return withCLApvRegimeResult(result, normalizedInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizeCLInputs({
      ...getCLDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);

    return createStandardCountryCalculator(
      CL_CONFIG,
      buildCLTaxConfig(normalizedInputs),
    ).getContributionLimits({
      ...normalizedInputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): CLCalculatorInputs {
    return getCLDefaultInputs();
  },
};
