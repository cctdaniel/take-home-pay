import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { BZCalculatorInputs, BZSocialSecurityStatus } from "./types";

function getSocialSecurityStatus(age: number): BZSocialSecurityStatus {
  return age >= 65 ? "age65Plus" : "standard";
}

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as BZCalculatorInputs;
  const socialSecurityStatus = getSocialSecurityStatus(
    inputs.assumptions.age,
  );
  const calculatorInputs: BZCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    socialSecurityStatus,
    ssbWeeklyInsurableEarnings: 0,
    educationReliefChildren: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      qualifyingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);

  return {
    country,
    name: config.name,
    currency,
    rate,
    grossLocal,
    netLocal: result.netSalary,
    netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0,
    deltaPercent: 0,
    assumptions: [
      ...buildAssumptionsSummary(country, inputs, false),
      "Belize compare uses employee income tax with the BTS personal relief amendments and SSB employee contribution schedule.",
      socialSecurityStatus === "age65Plus"
        ? "Age 65+ mapped to no employee SSB deduction."
        : inputs.assumptions.age >= 60
          ? "Age 60-64 kept as standard SSB coverage because compare does not ask whether the worker receives a Social Security retirement benefit."
          : "Standard SSB employee deduction",
      "Charitable and education relief are left at zero in compare because the questionnaire does not collect BZD donation amounts or eligible Belize education-relief children.",
      isMaxRetirement
        ? "Max-retirement mode does not add a Belize amount because SSB voluntary contributions apply outside ordinary insurable employment."
        : "No Belize retirement top-up is applied in compare.",
    ],
    calculation: result,
  };
};
