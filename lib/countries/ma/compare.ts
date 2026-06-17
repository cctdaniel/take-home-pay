import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateMaProfessionalExpenseDeduction,
  calculateMaSocialContributions,
  MA_DEPENDENT_CREDIT_2026,
  MA_SUPPLEMENTARY_PENSION_MAX_NET_SALARY_RATE,
} from "./constants/tax-year-2026";
import type { MACalculatorInputs } from "./types";
import { roundCurrency } from "../calculator-utils";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const {
    country,
    config,
    currency,
    rate,
    grossLocal,
    payFrequency,
    inputs,
    isMaxRetirement,
    buildAssumptionsSummary,
  } = ctx;
  const dependents = Math.min(inputs.numberOfChildren, MA_DEPENDENT_CREDIT_2026.maxDependents);
  const socialInsurance = calculateMaSocialContributions(grossLocal);
  const professionalExpenseDeduction = calculateMaProfessionalExpenseDeduction(
    grossLocal,
    socialInsurance.total,
  );
  const supplementaryPension = isMaxRetirement
    ? roundCurrency(
        Math.max(0, grossLocal - socialInsurance.total - professionalExpenseDeduction) *
          MA_SUPPLEMENTARY_PENSION_MAX_NET_SALARY_RATE,
      )
    : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as MACalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    dependents,
    contributions: { supplementaryPension },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push("CNSS + AMO, 20% professional expenses, IR brackets");
  if (dependents > 0) {
    assumptions.push(`${dependents} dependent(s) for MAD 600/year credit each`);
  }
  if (supplementaryPension > 0) {
    assumptions.push("Supplementary retirement (CIMR) at 50% of net taxable salary cap");
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
