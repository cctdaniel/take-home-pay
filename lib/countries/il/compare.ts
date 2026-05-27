import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { ILCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ILCalculatorInputs;
  const calculatorInputs: ILCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    additionalCreditPoints: 0,
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
      "Ordinary resident employee model for Israel",
      "Basic 2.25 resident credit points only",
      inputs.numberOfChildren > 0
        ? "Additional child credit points need child age and parent eligibility, so compare leaves them at zero"
        : "No additional credit points",
      "No optional study fund employee contribution in compare because it depends on employer benefit eligibility; country page supports capped Keren Hishtalmut input",
      "No Section 46 donation credit is added in compare because approved-recipient donation amounts and reporting facts are not collected.",
      "No extra Israel retirement amount is added in compare beyond mandatory pension because voluntary pension terms are employer-plan specific.",
    ],
    calculation: result,
  };
};
