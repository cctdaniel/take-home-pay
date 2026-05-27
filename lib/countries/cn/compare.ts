import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { CNCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as CNCalculatorInputs;
  const inputs: CNCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableInKindBenefits: 0,
    yearEndBonus: 0,
    yearEndBonusTaxTreatment: "separate",
    deductionMode: "specialAdditionalDeductions",
    specialDeductions: {
      ...defaultInputs.specialDeductions,
      numberOfChildren: 0,
      numberOfChildrenUnder3: 0,
      numberOfElderlyCare: 0,
      isOnlyChild: false,
      housingRentCity: "none",
      housingLoanInterest: false,
      continuingEducation: false,
      professionalQualificationEducation: false,
      majorIllnessMedicalExpenses: 0,
    },
    foreignAllowanceExemptions: {
      housingMealsLaundryRelocation: 0,
      businessTravelAllowance: 0,
      homeLeaveTravel: 0,
      languageTraining: 0,
      childrenEducation: 0,
    },
    contributions: {
      enterpriseAnnuityContribution: 0,
      individualPensionContribution: 0,
      taxPreferredHealthInsurance: 0,
      charitableDonations: 0,
    },
  };
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const enterpriseAnnuityLimit =
    contributionLimits.enterpriseAnnuityContribution?.limit ?? 0;
  const individualPensionLimit =
    contributionLimits.individualPensionContribution?.limit ?? 0;

  if (isMaxRetirement) {
    inputs.contributions.enterpriseAnnuityContribution = Math.min(
      enterpriseAnnuityLimit,
      grossLocal
    );
    inputs.contributions.individualPensionContribution = Math.min(
      individualPensionLimit,
      Math.max(0, grossLocal - inputs.contributions.enterpriseAnnuityContribution)
    );
  }

  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "Standard deduction of 60,000 CNY/year applied",
    "Social insurance at national guidance rates (pension 8%, medical 2%, unemployment 0.5%)",
    "Housing fund at 12% on contribution base",
    "No child, elderly-care, housing, education, major-illness, commercial health-insurance, or charity deductions assumed in compare",
    "No taxable in-kind/economic benefits entered in compare",
    "Foreign allowance exemptions are not entered in compare because eligibility and documented reimbursed amounts are package-specific",
    "Annual one-time bonus left at 0 in compare because it depends on employer bonus policy; country page supports separate or combined bonus taxation",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "Max-retirement scenario applies modeled enterprise/occupational annuity and individual pension deduction caps"
    );
  } else {
    assumptions.push(
      "No optional enterprise/occupational annuity or individual pension contribution entered in compare"
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
