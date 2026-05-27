import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { DKCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as DKCalculatorInputs;
  const limits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
  });
  const privateRatePension = isMaxRetirement
    ? Math.min(limits.privateRatePension.limit, grossLocal)
    : 0;
  const calculatorInputs: DKCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableBenefitsInKind: 0,
    taxRegime: "ordinary",
    singleParentAllowanceEligible:
      inputs.maritalStatus === "single" && inputs.numberOfChildren > 0,
    roundTripCommutingKm: 0,
    commutingWorkdays: defaultInputs.commutingWorkdays,
    contributions: {
      ...defaultInputs.contributions,
      privateRatePension,
      tradeUnionFees: 0,
      unemploymentInsuranceFees: 0,
      householdServices: 0,
      otherWorkExpenses: 0,
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
      ...buildAssumptionsSummary(country, inputs, privateRatePension > 0),
      "Denmark comparison uses ordinary resident employee rules, average municipal tax, no church tax, automatic employment/job allowances, and no commuting or household-service spending.",
      privateRatePension > 0
        ? "Max modeled Danish rate pension / terminating annuity deduction applied"
        : "No Danish rate pension contribution",
      calculatorInputs.singleParentAllowanceEligible
        ? "Single-parent employment allowance included from compare family status"
        : "No single-parent employment allowance",
      "No taxable personnel benefits in kind entered in compare",
      "The researcher/highly paid employee scheme is available on the country page but is not assumed in compare results.",
    ],
    calculation: result,
  };
};
