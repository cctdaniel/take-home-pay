import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { KECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as KECalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const retirementLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: KECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    hasDisabilityExemptionCertificate: false,
    taxableNonCashBenefits: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = retirementContribution > 0;

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
      "Kenya compare uses ordinary PAYE with personal relief, NSSF, SHIF, and the Affordable Housing Levy.",
      retirementApplied
        ? "Additional registered pension or retirement fund contribution is modeled up to the KRA annual pension deduction limit after NSSF."
        : "Additional registered pension or retirement fund contribution is set to zero in compare results.",
      "Post-retirement medical fund, owner-occupied mortgage interest, insurance premium relief, PWD exemption, and taxable non-cash benefits are set to zero in compare because the compare questionnaire does not collect those Kenya-specific amounts or certificates.",
      inputs.assumptions.hasPrivateHealthInsurance
        ? "Private-health coverage is not converted into a Kenya insurance-premium relief amount; use the Kenya page when the annual premium is known."
        : "No Kenya insurance premium amount is entered in compare results.",
    ],
    calculation: result,
  };
};
