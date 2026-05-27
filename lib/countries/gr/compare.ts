import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE } from "./constants/tax-brackets-2026";
import type { GRCalculatorInputs } from "./types";
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
  const defaultInputs = getDefaultInputs(country) as GRCalculatorInputs;
            const occupationalPensionContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? grossLocal * GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE
                : 0;
            const grInputs: GRCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              taxRegime: "ordinary",
              taxableBenefitsInKind: 0,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              age: inputs.assumptions.age,
              numberOfDependents: inputs.numberOfChildren,
              contributions: {
                occupationalPensionContribution,
              },
            };
            const result = calculateNetSalary(grInputs);
            const retirementApplied = occupationalPensionContribution > 0;
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
                `Age ${inputs.assumptions.age}`,
                "Article 5C new-tax-resident relief is left off in compare; use the Greece page when eligible",
                "No taxable benefits in kind entered in compare",
              ),
              calculation: result,
  };
};