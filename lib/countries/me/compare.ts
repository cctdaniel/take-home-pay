import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { MECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as MECalculatorInputs;
  const calculatorInputs: MECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    taxableNonCashBenefits: 0,
    payFrequency,
    incomeScenario: "montenegroPayroll",
    municipalSurtaxRate: "standard13",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
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
      "Montenegro compare uses the ordinary Montenegro payroll scenario with employee pension and unemployment contributions.",
      "The digital-nomad foreign-source exemption is selectable on the Montenegro page but is not assumed in compare because the compare questionnaire does not verify digital-nomad status or foreign-source employer/company facts.",
      "No taxable benefits in kind are entered in compare; the Montenegro page can model them separately from cash salary.",
      "Municipal surtax is treated as an employer payroll cost and does not reduce employee take-home pay.",
      "No extra retirement amount is added because the modeled Montenegro payroll rules do not provide a general employee salary deduction for voluntary retirement top-ups.",
    ],
    calculation: result,
  };
};
