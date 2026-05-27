import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getCountryCalculator, getDefaultInputs } from "@/lib/countries/registry";
import type { AUCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as AUCalculatorInputs;
            const contributionLimits = getCountryCalculator(
              country,
            ).getContributionLimits({
              ...defaultInputs,
              grossSalary: grossLocal,
            });
            const salarySacrificeSuper =
              isMaxRetirement
                ? Math.min(
                    contributionLimits.salarySacrificeSuper?.limit ?? 0,
                    grossLocal,
                  )
                : 0;
            const auInputs: AUCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              medicareFamilyStatus:
                inputs.assumptions.isResident &&
                (inputs.numberOfChildren > 0 ||
                  (inputs.maritalStatus === "married" &&
                    inputs.assumptions.spouseHasNoIncome))
                  ? "family"
                  : "single",
              medicareSpouseIncome: 0,
              numberOfDependentChildren: inputs.numberOfChildren,
              hasPrivateHealthInsurance:
                inputs.assumptions.hasPrivateHealthInsurance,
              contributions: {
                ...defaultInputs.contributions,
                salarySacrificeSuper,
                workRelatedExpenses: 0,
                charitableDonations: 0,
              },
            };
            const result = calculateNetSalary(auInputs);
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              salarySacrificeSuper > 0,
            );
            assumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
            assumptions.push(
              inputs.assumptions.hasPrivateHealthInsurance
                ? "Private health"
                : "No private health",
            );
            if (auInputs.medicareFamilyStatus === "family") {
              assumptions.push(
                "Australian Medicare family threshold applied with spouse income set to zero"
              );
            }
            if (
              inputs.maritalStatus === "married" &&
              !inputs.assumptions.spouseHasNoIncome
            ) {
              assumptions.push(
                "Spouse income is not entered in compare, so Australian Medicare thresholds use the single setting"
              );
            }
            if (salarySacrificeSuper > 0) {
              assumptions.push("Salary-sacrifice super set to remaining concessional cap");
            }
            assumptions.push(
              "No Australian work-related expense or DGR donation deductions entered in compare",
            );
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
