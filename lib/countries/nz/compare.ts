import {
  type CountryComparison,
  type CountryComparisonAdapterContext,
} from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { NZCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as NZCalculatorInputs;
  const isTaxResident = inputs.assumptions.isResident;
  const claimsIndependentEarnerTaxCredit =
    isTaxResident && inputs.numberOfChildren === 0;
  const nzInputs: NZCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType: isTaxResident ? "tax_resident" : "non_resident",
    claimsIndependentEarnerTaxCredit,
    contributions: {
      kiwiSaverRate: isMaxRetirement ? "rate_10" : "none",
      payrollGivingDonations: 0,
    },
  };
  const result = calculateNetSalary(nzInputs);
  const retirementApplied =
    nzInputs.contributions.kiwiSaverRate !== "none" &&
    result.breakdown.type === "NZ" &&
    result.breakdown.kiwiSaver.employeeContribution > 0;
  const assumptions = buildAssumptionsSummary(
    country,
    inputs,
    retirementApplied,
  );

  assumptions.push(isTaxResident ? "NZ tax resident" : "Non-resident");
  assumptions.push("No student loan");

  if (claimsIndependentEarnerTaxCredit) {
    assumptions.push("IETC if eligible");
  }

  if (isMaxRetirement) {
    assumptions.push("KiwiSaver 10% (not pre-tax)");
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
