import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { ATCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ATCalculatorInputs;
  const calculatorInputs: ATCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    familyBonusChildren: Math.min(inputs.numberOfChildren, 10),
    familyBonusChildrenUnder18: inputs.assumptions.hasYoungChildren
      ? Math.min(inputs.numberOfChildren, 10)
      : 0,
    familyBonusChildrenOver18: inputs.assumptions.hasYoungChildren
      ? 0
      : Math.min(inputs.numberOfChildren, 10),
    familyBonusShare:
      inputs.maritalStatus === "married" && !inputs.assumptions.spouseHasNoIncome
        ? "half"
        : "full",
    familyCreditStatus:
      inputs.numberOfChildren > 0 && inputs.maritalStatus === "married" &&
      inputs.assumptions.spouseHasNoIncome
        ? "singleEarner"
      : inputs.numberOfChildren > 0 && inputs.maritalStatus === "single"
        ? "singleParent"
        : "none",
    specialPaymentMode: "includedInGross",
    customSpecialPayments: 0,
    taxableInKindBenefits: 0,
  };
  const result = calculateNetSalary(calculatorInputs);
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
      ...buildAssumptionsSummary(country, inputs, false),
      "Ordinary resident employee model for Austria",
      inputs.numberOfChildren > 0
        ? inputs.assumptions.hasYoungChildren
          ? "Family Bonus Plus mapped as under-18 children"
          : "Family Bonus Plus mapped as children 18+ with continuing family allowance"
        : "No modeled Family Bonus Plus children",
      calculatorInputs.familyCreditStatus === "singleEarner"
        ? "Single-earner credit included"
        : calculatorInputs.familyCreditStatus === "singleParent"
          ? "Single-parent credit included"
          : "No single-earner or single-parent credit assumed",
      "Annual gross is treated as a standard Austrian 14-payment package with 13th/14th salary included",
      "No taxable in-kind benefits are entered in compare results",
      "No commuter allowance, Pendlereuro, church contributions, donations, or voluntary pension insurance assumed in compare",
      ...(isMaxRetirement
        ? [
            "Max-retirement mode does not add an Austria retirement amount because voluntary pension insurance is not a modeled compare assumption.",
          ]
        : []),
    ],
    calculation: result,
  };
};
