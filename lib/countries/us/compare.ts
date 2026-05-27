import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { CONTRIBUTION_LIMITS } from "./constants/contribution-limits";
import type { USCalculatorInputs, USFilingStatus } from "../types";

function getUSFilingStatus(
  maritalStatus: "single" | "married",
  numberOfChildren: number,
): USFilingStatus {
  if (maritalStatus === "married") {
    return "married_jointly";
  }

  if (numberOfChildren > 0) {
    return "head_of_household";
  }

  return "single";
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
  const defaultInputs = getDefaultInputs(country) as USCalculatorInputs;
            const filingStatus = getUSFilingStatus(
              inputs.maritalStatus,
              inputs.numberOfChildren
            );
            const retirement401k = isMaxRetirement
              ? Math.min(CONTRIBUTION_LIMITS.traditional401k, grossLocal)
              : 0;
            const usInputs: USCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              state: inputs.assumptions.usState,
              filingStatus,
              numberOfQualifyingChildren: inputs.numberOfChildren,
              numberOfOtherDependents: 0,
              contributions: {
                ...defaultInputs.contributions,
                traditional401k: retirement401k,
                rothIRA: 0,
                hsa: 0,
                healthFsa: 0,
                dependentCareFsa: 0,
              },
            };
            const result = calculateNetSalary(usInputs);
            const retirementApplied = retirement401k > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(`State ${inputs.assumptions.usState}`);
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
              usState: usInputs.state,
              usContributions: {
                traditional401k: usInputs.contributions.traditional401k,
                rothIRA: usInputs.contributions.rothIRA,
                hsa: usInputs.contributions.hsa,
                healthFsa: usInputs.contributions.healthFsa,
                dependentCareFsa: usInputs.contributions.dependentCareFsa,
              },
  };
};