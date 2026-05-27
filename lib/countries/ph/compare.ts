import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { PHCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as PHCalculatorInputs;
  const inputs: PHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxpayerType: "residentOrNraEtb",
    sssCovered: true,
    philHealthCovered: true,
    pagIbigCovered: true,
    contributions: {
      thirteenthMonthAndOtherBenefits: 0,
      deMinimisMedicalCashAllowance: 0,
      deMinimisRiceSubsidy: 0,
      deMinimisUniformClothing: 0,
      deMinimisActualMedicalAssistance: 0,
      deMinimisLaundryAllowance: 0,
      deMinimisAchievementAwards: 0,
      deMinimisChristmasGifts: 0,
      deMinimisCbaProductivityIncentives: 0,
    },
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "Post-TRAIN compensation income tax brackets (0–35%)",
    "SSS, PhilHealth, and Pag-IBIG employee contributions included by default",
    "13th month, other benefits, and de minimis benefit exclusions are left at zero in compare because gross salary may or may not include those payroll items",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "Max-retirement mode does not add MP2 or extra Pag-IBIG because those are voluntary savings rather than compensation-income deductions in this model.",
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
