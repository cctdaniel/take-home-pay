import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { INCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as INCalculatorInputs;
  const inputs: INCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    regime: isMaxRetirement ? "old" : "new",
    isEpfApplicable: true,
    professionalTaxPaid: 0,
    hasSeniorCitizenSelfOrFamilyFor80D: false,
    hasSeniorCitizenParentsFor80D: false,
    hra: {
      annualHraReceived: 0,
      annualRentPaid: 0,
      annualBasicSalaryForHra: 0,
      isMetroCity: false,
    },
    contributions: {
      section80CInvestments: isMaxRetirement ? 150_000 : 0,
      npsEmployeeContribution: isMaxRetirement ? 50_000 : 0,
      section80DHealthInsuranceSelfFamily: 0,
      section80DHealthInsuranceParents: 0,
    },
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    isMaxRetirement
      ? "Old tax regime with max modeled Section 80C and NPS 80CCD(1B) deductions"
      : "New tax regime (default) with standard deduction of 75,000 INR",
    "4% health & education cess applied",
    "EPF employee contribution modeled at the statutory wage ceiling when applicable",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "Section 80C modeled at INR 150,000 and NPS 80CCD(1B) at INR 50,000",
    );
  }
  assumptions.push(
    "HRA, professional tax, and Section 80D medical insurance inputs are available on the India page but left at zero in compare because they depend on Form 16, rent, city, state, and family age facts",
  );

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
