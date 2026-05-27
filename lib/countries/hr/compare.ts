import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type {
  CountryComparison,
  CountryComparisonAdapterContext,
} from "@/hooks/use-country-comparison";
import type { HRCalculatorInputs } from "./types";

export function buildCountryComparison({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as HRCalculatorInputs;
  const hrInputs: HRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    workScenario: "croatian_payroll",
    residencyType: inputs.assumptions.isResident
      ? "resident"
      : "non_resident",
    locality: "zagreb",
    age: inputs.assumptions.age,
    croatianReturneeRelief: false,
    hasDependentSpouse:
      inputs.maritalStatus === "married" &&
      inputs.assumptions.spouseHasNoIncome,
    numberOfOtherDependents: 0,
    numberOfChildren: inputs.numberOfChildren,
    numberOfDisabilityAllowances: 0,
    numberOfSevereDisabilityAllowances: 0,
    taxableBenefitsInKind: 0,
    contributions: {},
  };
  const result = calculateNetSalary(hrInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);

  assumptions.push(
    inputs.assumptions.isResident ? "Resident" : "Non-resident",
  );
  assumptions.push("Zagreb rates");
  assumptions.push(
    inputs.assumptions.age <= 30
      ? `Croatia youth employment income-tax relief mapped from compare age ${inputs.assumptions.age}`
      : "No Croatia youth income-tax relief",
  );
  assumptions.push(
    "Croatian returnee relief is not assumed in compare because it requires returnee/citizenship and five-year eligibility facts.",
  );
  assumptions.push(
    inputs.numberOfChildren > 0
      ? `${inputs.numberOfChildren} dependent child allowance${
          inputs.numberOfChildren > 1 ? "s" : ""
        } mapped from compare children`
      : "No dependent child allowance",
  );
  assumptions.push(
    hrInputs.hasDependentSpouse
      ? "Dependent spouse allowance applied"
      : "No dependent spouse allowance",
  );
  assumptions.push(
    "Other dependent and disability allowance counts are set to zero in compare because the compare questionnaire does not collect those Croatia-specific certificate facts.",
  );
  assumptions.push("No taxable benefits in kind are entered in compare results.");
  assumptions.push(
    "Croatian payroll scenario; digital-nomad foreign-employer exemption is selectable on the Croatia page",
  );

  // Croatian payroll has mandatory pension contributions; employer-paid
  // voluntary pension premiums require employer-plan facts.
  if (isMaxRetirement) {
    assumptions.push(
      "Max-retirement mode does not add a Croatia amount because the modeled payroll pension is mandatory and employer-plan voluntary premiums need separate facts.",
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
}
