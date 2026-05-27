import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { KR_TAX_CREDITS } from "./constants/tax-brackets-2026";
import type { KRCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as KRCalculatorInputs;
            const krInputs: KRCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              taxReliefs: {
                ...defaultInputs.taxReliefs,
                foreignWorkerFlatTax: false,
                numberOfDependents:
                  inputs.maritalStatus === "married" &&
                  inputs.assumptions.spouseHasNoIncome
                    ? 1
                    : 0,
                numberOfChildrenUnder20: inputs.numberOfChildren,
                numberOfChildrenUnder7: 0,
                personalPensionContribution: isMaxRetirement
                  ? Math.min(
                      KR_TAX_CREDITS.pensionCredit.maxContribution,
                      grossLocal,
                    )
                  : 0,
                annualRentPaid: 0,
              },
            };
            const result = calculateNetSalary(krInputs);
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              isMaxRetirement,
            );
            assumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
            assumptions.push("Foreign-worker flat tax: not elected");
  
            if (isMaxRetirement) {
              assumptions.push(
                "Max retirement applies South Korea pension savings/IRP tax-credit contribution up to the modeled KRW 9,000,000 cap",
              );
            }
  
            assumptions.push(
              "No Korea insurance, medical, education, donation, or rent credits are entered in compare; the South Korea page can model those year-end settlement inputs.",
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