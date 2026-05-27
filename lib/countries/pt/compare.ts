import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { PTCalculatorInputs } from "../types";

function getPprMaxContribution(age: number): number {
  if (age < 35) return 2000;
  if (age <= 50) return 1750;
  return 1500;
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
  const defaultInputs = getDefaultInputs(country) as PTCalculatorInputs;
            const pprContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? Math.min(
                    getPprMaxContribution(inputs.assumptions.age),
                    grossLocal
                  )
                : 0;
            const ptInputs: PTCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? inputs.assumptions.eligiblePtNhr2
                  ? "nhr_2"
                  : "resident"
                : "non_resident",
              filingStatus:
                inputs.maritalStatus === "married" ? "married_jointly" : "single",
              numberOfDependents: inputs.numberOfChildren,
              age: inputs.assumptions.age,
              irsJovemYear: "none",
              contributions: {
                ...defaultInputs.contributions,
                pprContribution,
              },
            };
            const result = calculateNetSalary(ptInputs);
            const retirementApplied = pprContribution > 0;
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
              assumptions: buildAssumptionsSummary(
                country,
                inputs,
                retirementApplied
              ).concat(
                inputs.assumptions.isResident ? "Resident" : "Non-resident",
                inputs.assumptions.eligiblePtNhr2 ? "NHR 2.0" : "Standard regime",
                `Age ${inputs.assumptions.age}`,
                "IRS Jovem is left off in compare; use the Portugal page when eligible"
              ),
              calculation: result,
  };
};