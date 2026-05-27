import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { ESCalculator } from ".";
import type { ESCalculatorInputs } from "./types";
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
  const defaultInputs = getDefaultInputs(country) as ESCalculatorInputs;
            const residencyType = inputs.assumptions.isResident
              ? "resident"
              : "non_resident_other";
            const pensionContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? (ESCalculator.getContributionLimits({
                    country: "ES",
                    grossSalary: grossLocal,
                    residencyType,
                    taxRegime: "ordinary",
                    employmentContractType: "permanent",
                  } as Partial<ESCalculatorInputs>).pensionContribution?.limit ??
                  0)
                : 0;
            const esInputs: ESCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType,
              taxRegime: "ordinary",
              region: "general",
              filingStatus:
                inputs.maritalStatus === "married"
                  ? "married_jointly"
                  : inputs.numberOfChildren > 0
                    ? "single_parent"
                    : "individual",
              age: inputs.assumptions.age,
              numberOfChildren: inputs.numberOfChildren,
              numberOfChildrenUnderThree: 0,
              employmentContractType: "permanent",
              contributions: {
                pensionContribution,
              },
            };
            const result = calculateNetSalary(esInputs);
            const retirementApplied = pensionContribution > 0;
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
                ...buildAssumptionsSummary(country, inputs, retirementApplied),
                inputs.assumptions.isResident ? "Resident" : "Non-resident",
                "General autonomous scale",
                `Age ${inputs.assumptions.age}`,
                "Spain Article 93 / Beckham-law regime left off in compare; use the Spain page when eligible",
              ],
              calculation: result,
  };
};