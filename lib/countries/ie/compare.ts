import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { IECalculatorInputs, IETaxStatus } from "./types";

function getIETaxStatus(maritalStatus: "single" | "married"): IETaxStatus {
  return maritalStatus === "married" ? "married_one_income" : "single";
}

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as IECalculatorInputs;
  const taxStatus = getIETaxStatus(inputs.maritalStatus);
  const calculatorInputs: IECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    age: 35,
    taxStatus,
    retirementScheme:
      inputs.assumptions.retirementContributions === "max"
        ? "private_pension"
        : "none",
    hasSinglePersonChildCarerCredit:
      inputs.maritalStatus === "single" && inputs.numberOfChildren > 0,
    hasHomeCarerTaxCredit:
      inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome,
    homeCarerIncome: inputs.assumptions.spouseHasNoIncome ? 0 : 11_100,
    numberOfDependentRelatives: 0,
    hasReducedUSC: false,
    sarpRegime: "none",
    taxableBenefitsInKind: 0,
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .pensionContribution.limit;
  const retirementApplied =
    inputs.assumptions.retirementContributions === "max";
  calculatorInputs.contributions = {
    pensionContribution: retirementApplied ? pensionLimit : 0,
    qualifyingRentPaid: 0,
    healthExpenses: 0,
    flatRateExpenses: 0,
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
      ...buildAssumptionsSummary(country, inputs, retirementApplied),
      taxStatus === "married_one_income"
        ? "Married/civil partners, one income band"
        : "Single PAYE band",
      retirementApplied
        ? "Max age-35 Irish pension contribution"
        : "No modeled pension contribution",
      "No taxable benefit-in-kind value entered in compare",
      inputs.numberOfChildren > 0 && inputs.maritalStatus === "single"
        ? "Single Person Child Carer Credit modeled"
        : "No child-carer credit modeled",
      "No rent, health expense, flat-rate expense, MyFutureFund, or SARP claim in compare",
    ],
    calculation: result,
  };
};
