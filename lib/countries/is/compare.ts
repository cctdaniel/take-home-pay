import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { ISCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ISCalculatorInputs;
  const calculatorInputs: ISCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    foreignExpertRelief: false,
  };
  const privatePensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .privatePensionContribution?.limit ?? 0;

  if (isMaxRetirement) {
    calculatorInputs.contributions = {
      ...calculatorInputs.contributions,
      privatePensionContribution: privatePensionLimit,
    };
  }

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
      "Iceland comparison uses resident employee withholding brackets, the personal tax credit, and the mandatory 4% employee pension contribution.",
      "Foreign expert relief is off in compare because approval and first-three-year eligibility are person- and employer-specific; it is selectable on the Iceland page.",
      isMaxRetirement
        ? "Retirement: max - private supplementary pension savings are maximized at 4% of salary."
        : "Private supplementary pension savings are left at zero unless max-retirement mode is enabled.",
    ],
    calculation: result,
  };
};
