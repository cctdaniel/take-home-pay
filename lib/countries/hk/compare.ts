import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { HK_DEDUCTIONS_2026 } from "./constants/tax-brackets-2026";
import type { HKCalculatorInputs } from "../types";
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
  const defaultInputs = getDefaultInputs(country) as HKCalculatorInputs;
          const voluntaryMpf =
            isMaxRetirement && inputs.assumptions.isResident
              ? Math.min(HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax, grossLocal)
              : 0;
          const hkInputs: HKCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? "resident"
              : "non_resident",
            contributions: {
              ...defaultInputs.contributions,
              taxDeductibleVoluntaryContributions: voluntaryMpf,
            },
            taxReliefs: {
              ...defaultInputs.taxReliefs,
              hasMarriedAllowance: inputs.maritalStatus === "married",
              hasSingleParentAllowance:
                inputs.maritalStatus === "single" && inputs.numberOfChildren > 0,
              numberOfChildren: inputs.numberOfChildren,
              numberOfNewbornChildren: 0,
              numberOfDependentParents: 0,
              numberOfDependentParentsLivingWith: 0,
              numberOfDependentParentsAged55To59: 0,
              numberOfDependentParentsAged55To59LivingWith: 0,
              numberOfDependentSiblings: 0,
              hasDisabilityAllowance: false,
              numberOfDisabledDependents: 0,
              vhisInsuredPersons: 0,
              vhisPremiums: 0,
              selfEducationExpenses: 0,
              hasHomeLoanInterestAdditionalCeiling: false,
              homeLoanInterest: 0,
              hasDomesticRentAdditionalCeiling: false,
              domesticRent: 0,
              charitableDonations: 0,
              elderlyResidentialCareExpenses: 0,
              assistedReproductiveServicesExpenses: 0,
            },
          };
          const result = calculateNetSalary(hkInputs);
          const retirementApplied = voluntaryMpf > 0;
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
            assumptions: [
              ...buildAssumptionsSummary(country, inputs, retirementApplied),
              inputs.assumptions.isResident ? "Resident" : "Non-resident",
              ...(inputs.maritalStatus === "single" && inputs.numberOfChildren > 0
                ? ["Single parent"]
                : []),
              "Hong Kong compare applies resident family allowances from the questionnaire where available; VHIS, assisted reproductive services, rent, home loan interest, elderly care, donations, and other itemized deductions are left at zero.",
            ],
            calculation: result,
  };
};