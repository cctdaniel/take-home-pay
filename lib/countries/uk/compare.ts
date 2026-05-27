import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getCountryCalculator, getDefaultInputs } from "@/lib/countries/registry";
import type { UKCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as UKCalculatorInputs;
            const ukLimits = getCountryCalculator(country).getContributionLimits({
              ...defaultInputs,
              grossSalary: grossLocal,
            });
            const pensionContribution = isMaxRetirement
              ? Math.min(
                  ukLimits.pensionContribution?.limit ?? 0,
                  grossLocal,
                )
              : 0;
            const ukInputs: UKCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              region: "rest_of_uk",
              taxableBenefitsInKind: 0,
              studentLoanPlan: "none",
              hasPostgraduateLoan: false,
              marriageAllowance:
                inputs.assumptions.isResident &&
                inputs.maritalStatus === "married" &&
                inputs.assumptions.spouseHasNoIncome
                  ? "receiving"
                  : "none",
              contributions: {
                pensionContribution,
              },
            };
            const result = calculateNetSalary(ukInputs);
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              pensionContribution > 0,
            );
            assumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
            assumptions.push("No student or postgraduate loan in compare");
            assumptions.push("No taxable benefits in kind entered in compare");
            if (ukInputs.marriageAllowance === "receiving") {
              assumptions.push("Marriage Allowance received from no-income spouse");
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
              assumptions,
              calculation: result,
  };
};