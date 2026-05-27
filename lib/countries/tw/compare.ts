import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { TWCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as TWCalculatorInputs;
            const taxResidency = inputs.assumptions.isResident
              ? "resident"
              : "non_resident";
            const voluntaryPension = isMaxRetirement
              && taxResidency === "resident"
              ? Math.min((grossLocal / 12) * 0.06, 150_000 * 0.06) * 12
              : 0;
            const twInputs: TWCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              taxResidency,
              contributions: {
                voluntaryPensionContribution: voluntaryPension,
              },
              taxReliefs: {
                ...defaultInputs.taxReliefs,
                isMarried: inputs.maritalStatus === "married",
                numberOfDependents: inputs.numberOfChildren,
                hasDisability: false,
                disabledPersons: 0,
                isGoldCardHolder: false,
              },
            };
            const result = calculateNetSalary(twInputs);
            const retirementApplied = voluntaryPension > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
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
              assumptions,
              calculation: result,
  };
};