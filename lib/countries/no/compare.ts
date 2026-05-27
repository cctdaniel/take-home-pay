import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { NO_IPS_DEDUCTION_LIMIT } from "./constants/tax-year-2026";
import type { NOCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as NOCalculatorInputs;
  const ipsContribution = isMaxRetirement
    ? Math.min(NO_IPS_DEDUCTION_LIMIT, grossLocal)
    : 0;
  const calculatorInputs: NOCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
	    taxScheme: "ordinary",
	    payeNationalInsurance: "included",
	    childcareDeductionMode: "ordinary",
	    childcareChildren: 0,
	    roundTripCommutingKm: 0,
	    commutingWorkdays: 0,
	    contributions: {
	      ipsContribution,
	      tradeUnionFees: 0,
	      childcareExpenses: 0,
	      debtInterestPaid: 0,
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
      ...buildAssumptionsSummary(country, inputs, ipsContribution > 0),
      "Resident employee, general taxation rules",
	      "PAYE for eligible foreign workers is selectable on the Norway page but not assumed in compare",
	      "Union dues, childcare, commuting, and debt-interest deductions are left at zero in compare because the questionnaire does not collect those Norway-specific amounts.",
	      ipsContribution > 0
	        ? "IPS: max modeled deduction"
        : "IPS not applied",
    ],
    calculation: result,
  };
};
