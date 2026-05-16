import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { GECalculatorInputs } from "./types";

// Georgia has a mandatory/enrolled funded pension employee contribution, but
// no separate voluntary salary tax-reducing retirement contribution is modeled.
// Sources: Pension Agency Note 3(a)(ii) and Funded Pension Law Article 3.
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
  const defaultInputs = getDefaultInputs(country) as GECalculatorInputs;
  const isResident = inputs.assumptions.isResident;
  const pensionParticipation = isResident
    ? "mandatory_or_enrolled"
    : "not_participating";

  const geInputs: GECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType: isResident ? "resident" : "non_resident",
    pensionParticipation,
    contributions: {},
  };

  const result = calculateNetSalary(geInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push(isResident ? "Resident" : "Non-resident");
  assumptions.push(
    pensionParticipation === "mandatory_or_enrolled"
      ? "Funded pension enrolled"
      : "No funded pension",
  );

  if (isMaxRetirement) {
    assumptions.push("Retirement: mandatory pension only");
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
