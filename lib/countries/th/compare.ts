import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { TH_TAX_ALLOWANCES } from "./constants/tax-brackets-2026";
import type { THCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as THCalculatorInputs;
            const providentFundContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? Math.min(
                    grossLocal * TH_TAX_ALLOWANCES.providentFundRate,
                    TH_TAX_ALLOWANCES.providentFundMax
                  )
                : 0;
            const thInputs: THCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              contributions: {
                ...defaultInputs.contributions,
                providentFundContribution,
                rmfContribution: 0,
                ssfContribution: 0,
                esgContribution: 0,
                nationalSavingsFundContribution: 0,
              },
              taxReliefs: {
                ...defaultInputs.taxReliefs,
                hasSpouse: inputs.maritalStatus === "married",
                spouseHasNoIncome: inputs.assumptions.spouseHasNoIncome,
                numberOfChildren: inputs.numberOfChildren,
                numberOfChildrenBornAfter2018: 0,
                numberOfParents: 0,
                numberOfDisabledDependents: 0,
                isElderlyOrDisabled: false,
                lifeInsurancePremium: 0,
                lifeInsuranceSpousePremium: 0,
                healthInsurancePremium: 0,
                healthInsuranceParentsPremium: 0,
                hasSocialSecurity: true,
                providentFundContribution,
                rmfContribution: 0,
                ssfContribution: 0,
                esgContribution: 0,
                nationalSavingsFundContribution: 0,
                mortgageInterest: 0,
                donations: 0,
                politicalDonation: 0,
              },
            };
            const result = calculateNetSalary(thInputs);
            const retirementApplied = providentFundContribution > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(
              inputs.assumptions.isResident
                ? "Resident salary/remittance scope"
                : "Non-resident Thai-source salary scope",
            );
            if (
              inputs.maritalStatus === "married" &&
              inputs.assumptions.spouseHasNoIncome
            ) {
              assumptions.push("Spouse no income");
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
