import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { PL_IKZE_LIMIT } from "./constants/tax-year-2026";
import type { PLCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as PLCalculatorInputs;
  const numberOfChildren = Math.min(inputs.numberOfChildren, 10);
  const retirementContribution = isMaxRetirement
    ? Math.min(PL_IKZE_LIMIT, grossLocal)
    : 0;
  const calculatorInputs: PLCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren,
    ppkRate: "0",
    pitZeroRelief: "none",
	    contributions: {
	      ...defaultInputs.contributions,
	      retirementContribution,
	      charitableDonations: 0,
	      qualifyingExpenses: 0,
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
      "Ordinary employment model for Poland",
      numberOfChildren > 0
        ? "Child tax relief mapped from compare profile"
        : "No child tax relief",
	      "PPK employee contribution left at 0% in compare",
	      "PIT-0 relief left off; use the Poland page for under-26, return, family 4+, or working-senior eligibility",
	      "PIT/O donation and internet relief deductions are left at zero in compare because the questionnaire does not collect Polish annual-return receipt amounts.",
	    ],
    calculation: result,
  };
};
