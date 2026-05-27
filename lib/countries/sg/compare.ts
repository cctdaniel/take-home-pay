import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { CPF_VOLUNTARY_TOPUP_LIMIT, getSRSLimit } from "./constants/cpf-rates-2026";
import type { SGCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as SGCalculatorInputs;
            const residencyType = inputs.assumptions.isResident
              ? "citizen_pr"
              : "foreigner";
            const taxResidency = inputs.assumptions.isResident
              ? "resident"
              : "non_resident";
            const srsContribution = isMaxRetirement && taxResidency === "resident"
              ? Math.min(getSRSLimit(residencyType), grossLocal)
              : 0;
            const voluntaryCpfTopUp =
              isMaxRetirement &&
              taxResidency === "resident" &&
              residencyType === "citizen_pr"
                ? Math.min(
                    CPF_VOLUNTARY_TOPUP_LIMIT,
                    Math.max(0, grossLocal - srsContribution),
                  )
                : 0;
            const sgInputs: SGCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType,
              taxResidency,
              age: inputs.assumptions.age,
              contributions: {
                ...defaultInputs.contributions,
                srsContribution,
                voluntaryCpfTopUp,
              },
              taxReliefs: {
                ...defaultInputs.taxReliefs,
                hasSpouseRelief:
                  inputs.maritalStatus === "married" &&
                  inputs.assumptions.spouseHasNoIncome,
                hasDisabledSpouseRelief: false,
                numberOfChildren: inputs.numberOfChildren,
                numberOfDisabledChildren: 0,
                isWorkingMother: false,
                wmcrPre2024Children: 0,
                wmcrPost2024FirstChild: false,
                wmcrPost2024SecondChild: false,
                wmcrPost2024ThirdAndLaterChildren: 0,
                parentRelief: "none",
                parentReliefForDisability: false,
                numberOfParents: 0,
                grandparentCaregiverRelief: false,
                numberOfDisabledSiblings: 0,
                lifeInsurancePremiums: 0,
                lifeInsuranceCapitalSum: 0,
                approvedDonations: 0,
                parenthoodTaxRebate: 0,
                nsmanSelfRelief: "none",
                hasNsmanWifeRelief: false,
                numberOfNsmanParentReliefs: 0,
                courseFees: 0,
              },
            };
            const result = calculateNetSalary(sgInputs);
            const retirementApplied = srsContribution > 0 || voluntaryCpfTopUp > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(inputs.assumptions.isResident ? "Citizen/PR" : "Foreigner");
            assumptions.push(`Age ${inputs.assumptions.age}`);
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