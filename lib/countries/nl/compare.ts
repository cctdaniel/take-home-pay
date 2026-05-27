import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getCountryCalculator, getDefaultInputs } from "@/lib/countries/registry";
import type { NLCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as NLCalculatorInputs;
            const nlInputs: NLCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              hasThirtyPercentRuling: inputs.assumptions.eligibleNl30Ruling,
              thirtyPercentRulingType: inputs.assumptions.eligibleNl30Ruling
                ? "standard"
                : "none",
              hasYoungChildren: inputs.assumptions.hasYoungChildren,
              iackEligibility: inputs.assumptions.hasYoungChildren
                ? "noFiscalPartner"
                : "none",
              employeePensionPremiumAnnual: 0,
              pensionAccrualFactorA: 0,
              unusedAnnuityReserveMargin: 0,
              contributions: {
                ...defaultInputs.contributions,
                lijfrenteContribution: 0,
              },
            };
            const lijfrenteLimit =
              getCountryCalculator(country).getContributionLimits(nlInputs)
                .lijfrenteContribution?.limit ?? 0;
  
            if (isMaxRetirement) {
              nlInputs.contributions = {
                ...nlInputs.contributions,
                lijfrenteContribution: lijfrenteLimit,
              };
            }
  
            const result = calculateNetSalary(nlInputs);
            const retirementApplied = isMaxRetirement && lijfrenteLimit > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(
              inputs.assumptions.eligibleNl30Ruling ? "30% ruling" : "No ruling",
            );
            assumptions.push(
              inputs.assumptions.hasYoungChildren
                ? "Youngest under 12"
                : "No young children",
            );
            assumptions.push("No plan-specific employee pension premium entered");
            assumptions.push(
              retirementApplied
                ? "Max retirement applies the modeled Dutch lijfrente annual-margin deduction with Factor A and reserve margin set to zero"
                : "No self-paid lijfrente contribution selected",
            );
            if (
              result.breakdown.type === "NL" &&
              result.breakdown.thirtyPercentRulingApplied
            ) {
              assumptions.push(
                result.breakdown.taxExemptAllowance > 0
                  ? "30% ruling capped by 2026 salary norm and annual maximum"
                  : "30% ruling selected but salary is below the 2026 expertise norm",
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
              assumptions,
              calculation: result,
  };
};