import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { IDCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as IDCalculatorInputs;
            const idInputs: IDCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              contributions: {
                dplkContribution: 0,
                zakatContribution: 0,
              },
              taxReliefs: {
                maritalStatus: inputs.maritalStatus,
                numberOfDependents: Math.min(inputs.numberOfChildren, 3),
                spouseIncomeCombined:
                  inputs.maritalStatus === "married" &&
                  inputs.assumptions.spouseHasNoIncome,
              },
            };
            const result = calculateNetSalary(idInputs);
            const idAssumptions = buildAssumptionsSummary(country, inputs, false);
            idAssumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
            idAssumptions.push(
              "DPLK and zakat are available on the Indonesia page; compare leaves them at 0 because no general annual statutory contribution cap is modeled.",
            );
            if (isMaxRetirement) {
              idAssumptions.push(
                "Max-retirement mode does not auto-fill Indonesia DPLK because the calculator only caps it to payroll cash flow, not a source-backed legal annual maximum.",
              );
            }
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
              assumptions: idAssumptions,
              calculation: result,
  };
};