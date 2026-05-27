import { createStandardCountryCalculator } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { AM_CONFIG } from "./config";
import { AM_TAX_CONFIG } from "./constants/tax-year-2026";
import type { AMCalculatorInputs } from "./types";

const baseAMCalculator = createStandardCountryCalculator(
  AM_CONFIG,
  AM_TAX_CONFIG,
);

function getAMDefaultInputs(): AMCalculatorInputs {
  return {
    ...baseAMCalculator.getDefaultInputs(),
    pensionParticipation: "funded_pension",
    healthInsuranceStatus: "applies",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
    },
  } as AMCalculatorInputs;
}

export const AMCalculator: CountryCalculator = {
  ...baseAMCalculator,

  calculate(inputs: CalculatorInputs) {
    const amInputs = inputs as Partial<AMCalculatorInputs>;
    const defaultInputs = getAMDefaultInputs();

    return baseAMCalculator.calculate({
      ...inputs,
      pensionParticipation:
        amInputs.pensionParticipation ?? "funded_pension",
      healthInsuranceStatus: amInputs.healthInsuranceStatus ?? "applies",
      contributions: {
        ...defaultInputs.contributions,
        ...amInputs.contributions,
      },
    } as CalculatorInputs);
  },

  getDefaultInputs() {
    return getAMDefaultInputs();
  },
};
