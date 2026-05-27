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
    claimsKiwiSaverGovernmentContribution: isTaxResident,
    contributions: {
      kiwiSaverRate: isMaxRetirement ? "rate_10" : "none",
      payrollGivingDonations: 0,
    },
  };
  const result = calculateNetSalary(nzInputs);
  const retirementApplied = isMaxRetirement;
  const assumptions = buildAssumptionsSummary(country, inputs, retirementApplied);

  assumptions.push(isTaxResident ? "NZ tax resident" : "Non-resident");
  assumptions.push("No student loan");

  if (claimsIndependentEarnerTaxCredit) {
    assumptions.push("IETC if eligible");
  }

  if (retirementApplied) {
    assumptions.push("KiwiSaver employee 10% post-tax payroll deduction");
    if (isTaxResident) {
      assumptions.push("KiwiSaver government contribution shown outside take-home");
    }
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
