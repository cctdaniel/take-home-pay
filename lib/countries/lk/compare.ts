import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { LKCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as LKCalculatorInputs;
  const calculatorInputs: LKCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employmentType: "primary",
    epfCovered: true,
    annualLumpSumPayments: 0,
    taxableNonCashBenefits: 0,
    taxableTerminalBenefits: 0,
    terminalBenefitTreatment: "approvedOrEtf",
    primaryMonthlyRemuneration: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      housingExpenses: 0,
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
      "Sri Lanka comparison uses resident primary employment with EPF coverage and APIT Table 01.",
      "Employer EPF/ETF is available in the detailed calculator as employer-cost context but is not counted against take-home pay.",
      "No annual lump-sum payments, taxable in-kind/non-cash benefits, or terminal benefits are included in compare results.",
      isMaxRetirement
        ? "Max-retirement mode does not add a Sri Lanka retirement amount because the reviewed IRD/EPF guidance does not provide a general employee salary deduction for voluntary top-ups."
        : "Annual-return solar and donation deductions are left at zero in compare results because they depend on taxpayer-specific spending rather than payroll retirement saving.",
    ],
    calculation: result,
  };
};
