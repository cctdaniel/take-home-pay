import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { CNCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as CNCalculatorInputs;
  const inputs: CNCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "Standard deduction of 60,000 CNY/year applied",
    "Social insurance at national guidance rates (pension 8%, medical 2%, unemployment 0.5%)",
    "Housing fund at 12% on contribution base",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "Private pension account (个人养老金) tax relief is outside monthly payroll withholding in this calculator",
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
};
