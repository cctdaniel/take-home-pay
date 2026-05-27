import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { MYCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as MYCalculatorInputs;
            const estimatedEpfEmployee =
              inputs.assumptions.isResident && inputs.assumptions.age < 60
                ? Math.ceil((grossLocal / 12) * 0.11) * 12
                : 0;
            const voluntaryEpfContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? Math.min(
                    grossLocal,
                    Math.max(0, 4000 - estimatedEpfEmployee) + 3000,
                  )
                : 0;
            const prsContribution =
              isMaxRetirement && inputs.assumptions.isResident
                ? Math.min(3000, grossLocal)
                : 0;
            const myInputs: MYCalculatorInputs = {
              ...defaultInputs,
              grossSalary: grossLocal,
              payFrequency,
              residencyType: inputs.assumptions.isResident
                ? "resident"
                : "non_resident",
              age: inputs.assumptions.age,
              epfCategory: inputs.assumptions.isResident
                ? "citizen"
                : "foreigner_post_1998",
              contributions: {
                ...defaultInputs.contributions,
                voluntaryEpfContribution,
                prsContribution,
              },
              taxReliefs: {
                ...defaultInputs.taxReliefs,
                hasSpouseRelief:
                  inputs.maritalStatus === "married" &&
                  inputs.assumptions.spouseHasNoIncome,
                hasDisabledSpouseRelief: false,
                numberOfChildrenUnder18: inputs.numberOfChildren,
                numberOfChildren18PlusEducation: 0,
                numberOfChildrenTertiary: 0,
                numberOfDisabledChildren: 0,
                numberOfDisabledChildrenTertiary: 0,
                isDisabled: false,
                parentMedicalRelief: 0,
                supportingEquipmentRelief: 0,
                selfEducationFees: 0,
                lifestyleRelief: 0,
                sportsLifestyleRelief: 0,
                medicalRelief: 0,
                breastfeedingEquipmentRelief: 0,
                childcareFees: 0,
                sspnNetSavings: 0,
                educationMedicalInsurance: 0,
                lifeInsuranceRelief: 0,
                evChargingRelief: 0,
                firstHomeLoanInterest: 0,
                firstHomePriceBand: "none",
                approvedDonations: 0,
                zakatFitrah: 0,
                departureLevyRebate: 0,
              },
            };
            const result = calculateNetSalary(myInputs);
            const retirementApplied =
              prsContribution > 0 || voluntaryEpfContribution > 0;
            const assumptions = buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied,
            );
            assumptions.push(inputs.assumptions.isResident ? "Resident" : "Non-resident");
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