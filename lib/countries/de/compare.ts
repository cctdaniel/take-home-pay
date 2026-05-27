import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { DECalculator } from ".";
import type { DECalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as DECalculatorInputs;
            const deLimits = DECalculator.getContributionLimits({
              country: "DE",
              grossSalary: grossLocal,
              isMarried: inputs.maritalStatus === "married",
            } as Partial<DECalculatorInputs>);
            const maxBav = Math.min(
              deLimits.occupationalPension?.limit ?? 0,
              grossLocal
            );
            const maxRiester = Math.min(
              deLimits.riesterContribution?.limit ?? 0,
              grossLocal
            );
            const maxRuerup = Math.min(
              deLimits.ruerupContribution?.limit ?? 0,
              grossLocal
            );
            const deInputs: DECalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              state: "BE", // Default to Berlin for comparison (9% church tax rate)
              isMarried: inputs.maritalStatus === "married",
              isChurchMember: false, // Default: not a church member
              isChildless: inputs.numberOfChildren === 0,
              contributions: {
                ...defaultInputs.contributions,
                occupationalPension: isMaxRetirement ? maxBav : 0,
                riesterContribution: isMaxRetirement ? maxRiester : 0,
                ruerupContribution: isMaxRetirement ? maxRuerup : 0,
              },
            };
            const result = calculateNetSalary(deInputs);
            const deVoluntaryTotal =
              result.breakdown.type === "DE" &&
              "voluntaryContributions" in result.breakdown
                ? result.breakdown.voluntaryContributions.total
                : 0;
            const retirementApplied = deVoluntaryTotal > 0;
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
                inputs.maritalStatus === "married"
                  ? "Married (joint threshold)"
                  : "Single",
                ...(inputs.numberOfChildren > 0
                  ? [
                      `${inputs.numberOfChildren} child${
                        inputs.numberOfChildren > 1 ? "ren" : ""
                      } (no childless surcharge)`,
                    ]
                  : []),
                retirementApplied
                  ? "bAV, Riester, and Ruerup contributions capped to remaining payroll cash salary"
                  : "No modeled German pension contribution",
              ),
              calculation: result,
  };
};