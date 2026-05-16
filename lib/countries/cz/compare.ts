import type {
  CountryComparison,
  CountryComparisonAdapter,
} from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { CZECH_TAX_PARAMETERS_2026 } from "./constants/tax-parameters-2026";
import type { CZCalculatorInputs } from "./types";

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
}): CountryComparison | null => {
  const defaultInputs = getDefaultInputs(country) as CZCalculatorInputs;
  const isResident = inputs.assumptions.isResident;
  const retirementSavingsContribution =
    isMaxRetirement && isResident
      ? Math.min(
          CZECH_TAX_PARAMETERS_2026.deductions.retirementProductsLimit,
          grossLocal,
        )
      : 0;
  const czInputs: CZCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType: isResident ? "resident" : "non_resident",
    contributions: {
      retirementSavingsContribution,
      charitableDonations: 0,
    },
    taxReliefs: {
      numberOfChildren: isResident ? inputs.numberOfChildren : 0,
      hasSpouseCredit: false,
    },
  };
  const result = calculateNetSalary(czInputs);
  const retirementApplied = retirementSavingsContribution > 0;
  const assumptions = buildAssumptionsSummary(
    country,
    inputs,
    retirementApplied,
  );

  assumptions.push(isResident ? "Czech tax resident" : "Non-resident");

  if (isResident && inputs.numberOfChildren > 0) {
    assumptions.push("CZ child tax credit");
  }

  if (
    isResident &&
    inputs.maritalStatus === "married" &&
    inputs.assumptions.spouseHasNoIncome
  ) {
    assumptions.push("Spouse credit excluded");
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
