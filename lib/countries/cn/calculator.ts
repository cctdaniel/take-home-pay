import type {
  CalculationResult,
  CalculatorInputs,
  CNBreakdown,
  CNCalculatorInputs,
  CNTaxBreakdown,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { CN_CONFIG } from "./config";
import {
  calculateCNProgressiveTax,
  calculateCNSeparateYearEndBonusTax,
  CN_CHARITABLE_DONATION_DEDUCTION_RATE_LIMIT,
  CN_ENTERPRISE_ANNUITY_DEDUCTION_RATE,
  CN_HOUSING_FUND_2026,
  CN_INDIVIDUAL_PENSION_DEDUCTION_ANNUAL_CAP,
  CN_MAJOR_ILLNESS_MEDICAL_ANNUAL_CAP,
  CN_MAJOR_ILLNESS_MEDICAL_THRESHOLD,
  CN_SOCIAL_INSURANCE_2026,
  CN_SPECIAL_DEDUCTIONS_2026,
  CN_STANDARD_DEDUCTION,
  CN_TAX_PREFERRED_HEALTH_INSURANCE_ANNUAL_CAP,
} from "./constants/tax-parameters-2026";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampCurrency(value: number, max = Number.POSITIVE_INFINITY): number {
  return roundCurrency(Math.min(Math.max(0, value || 0), max));
}

function getModeledContributionBase(inputs?: Partial<CNCalculatorInputs>): number {
  if ((inputs?.grossSalary ?? 0) <= 0) {
    return 0;
  }

  const monthlyBase = Math.max(0, inputs?.socialInsuranceBase ?? 20_000);
  return Math.min(monthlyBase, CN_SOCIAL_INSURANCE_2026.pension.monthlyCeiling);
}

function getEnterpriseAnnuityLimit(inputs?: Partial<CNCalculatorInputs>): number {
  return roundCurrency(
    getModeledContributionBase(inputs) *
      12 *
      CN_ENTERPRISE_ANNUITY_DEDUCTION_RATE
  );
}

function getCNDefaultInputs(): CNCalculatorInputs {
  return {
    country: "CN",
    grossSalary: 240_000,
    payFrequency: "monthly",
    socialInsuranceBase: 20_000,
    housingFundRate: 0.12,
    taxableInKindBenefits: 0,
    yearEndBonus: 0,
    yearEndBonusTaxTreatment: "separate",
    deductionMode: "specialAdditionalDeductions",
    specialDeductions: {
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
}

function getZeroCNSpecialDeductions() {
  return {
    children: 0,
    childrenUnder3: 0,
    elderlyCare: 0,
    housingRent: 0,
    housingLoanInterest: 0,
    continuingEducation: 0,
    professionalQualificationEducation: 0,
    majorIllnessMedical: 0,
    total: 0,
  };
}

function calculateCNSocialInsurance(monthlyBase: number) {
  const si = CN_SOCIAL_INSURANCE_2026;
  const cappedBase = Math.min(monthlyBase, si.pension.monthlyCeiling);

  const pension = roundCurrency(cappedBase * si.pension.employeeRate);
  const medical = roundCurrency(cappedBase * si.medical.employeeRate);
  const unemployment = roundCurrency(cappedBase * si.unemployment.employeeRate);

  return {
    pension: {
      rate: si.pension.employeeRate,
      employee: pension * 12,
      ceiling: si.pension.monthlyCeiling,
    },
    medical: {
      rate: si.medical.employeeRate,
      employee: medical * 12,
      ceiling: si.medical.monthlyCeiling,
    },
    unemployment: {
      rate: si.unemployment.employeeRate,
      employee: unemployment * 12,
      ceiling: si.unemployment.monthlyCeiling,
    },
    total: (pension + medical + unemployment) * 12,
  };
}

function calculateHousingFund(monthlyBase: number, rate: number) {
  const clampedRate = Math.max(
    CN_HOUSING_FUND_2026.minRate,
    Math.min(CN_HOUSING_FUND_2026.maxRate, rate)
  );
  const cappedBase = Math.min(
    monthlyBase,
    CN_SOCIAL_INSURANCE_2026.pension.monthlyCeiling
  );
  const monthly = roundCurrency(cappedBase * clampedRate);

  return {
    rate: clampedRate,
    employee: monthly * 12,
    base: cappedBase,
  };
}

function calculateCNSpecialDeductions(inputs: CNCalculatorInputs) {
  const sd = inputs.specialDeductions;
  const rates = CN_SPECIAL_DEDUCTIONS_2026;

  const childrenMonthly =
    (sd.numberOfChildren || 0) * rates.childEducation +
    (sd.numberOfChildrenUnder3 || 0) * rates.childUnder3;

  const hasElderlyCare = (sd.numberOfElderlyCare || 0) > 0;
  const elderlyCareMonthly = hasElderlyCare
    ? sd.isOnlyChild
      ? rates.elderlyCareOnlyChild
      : rates.elderlyCareShared
    : 0;

  let housingRentMonthly = 0;
  if (!sd.housingLoanInterest) {
    switch (sd.housingRentCity) {
      case "tier1":
        housingRentMonthly = rates.housingRentTier1;
        break;
      case "tier2":
        housingRentMonthly = rates.housingRentTier2;
        break;
      case "tier3":
        housingRentMonthly = rates.housingRentTier3;
        break;
      default:
        housingRentMonthly = 0;
    }
  }

  const housingLoanInterestMonthly = sd.housingLoanInterest
    ? rates.housingLoanInterest
    : 0;
  const continuingEducationMonthly = sd.continuingEducation
    ? rates.continuingEducation
    : 0;
  const professionalQualificationEducation = sd.professionalQualificationEducation
    ? rates.professionalQualificationEducation
    : 0;
  const majorIllnessMedical = Math.min(
    Math.max(
      0,
      (sd.majorIllnessMedicalExpenses || 0) -
        CN_MAJOR_ILLNESS_MEDICAL_THRESHOLD
    ),
    CN_MAJOR_ILLNESS_MEDICAL_ANNUAL_CAP
  );

  const totalMonthly =
    childrenMonthly +
    elderlyCareMonthly +
    housingRentMonthly +
    housingLoanInterestMonthly +
    continuingEducationMonthly;
  const totalAnnual =
    totalMonthly * 12 +
    professionalQualificationEducation +
    majorIllnessMedical;

  return {
    children: childrenMonthly * 12,
    childrenUnder3: (sd.numberOfChildrenUnder3 || 0) * rates.childUnder3 * 12,
    elderlyCare: elderlyCareMonthly * 12,
    housingRent: housingRentMonthly * 12,
    housingLoanInterest: housingLoanInterestMonthly * 12,
    continuingEducation: continuingEducationMonthly * 12,
    professionalQualificationEducation,
    majorIllnessMedical,
    total: totalAnnual,
  };
}

function calculateCNForeignAllowanceExemptions(inputs: CNCalculatorInputs) {
  const allowances = inputs.foreignAllowanceExemptions;
  const housingMealsLaundryRelocation = clampCurrency(
    allowances?.housingMealsLaundryRelocation ?? 0
  );
  const businessTravelAllowance = clampCurrency(
    allowances?.businessTravelAllowance ?? 0
  );
  const homeLeaveTravel = clampCurrency(allowances?.homeLeaveTravel ?? 0);
  const languageTraining = clampCurrency(allowances?.languageTraining ?? 0);
  const childrenEducation = clampCurrency(allowances?.childrenEducation ?? 0);

  return {
    housingMealsLaundryRelocation,
    businessTravelAllowance,
    homeLeaveTravel,
    languageTraining,
    childrenEducation,
    total: roundCurrency(
      housingMealsLaundryRelocation +
        businessTravelAllowance +
        homeLeaveTravel +
        languageTraining +
        childrenEducation
    ),
  };
}

function calculateCNVoluntaryDeductions(
  inputs: CNCalculatorInputs,
  preDonationTaxableIncome: number
) {
  const enterpriseAnnuityContribution = clampCurrency(
    inputs.contributions?.enterpriseAnnuityContribution ?? 0,
    getEnterpriseAnnuityLimit(inputs)
  );
  const individualPensionContribution = clampCurrency(
    inputs.contributions?.individualPensionContribution ?? 0,
    CN_INDIVIDUAL_PENSION_DEDUCTION_ANNUAL_CAP
  );
  const taxPreferredHealthInsurance = clampCurrency(
    inputs.contributions?.taxPreferredHealthInsurance ?? 0,
    CN_TAX_PREFERRED_HEALTH_INSURANCE_ANNUAL_CAP
  );

  const taxableBeforeCharity = Math.max(
    0,
    preDonationTaxableIncome -
      enterpriseAnnuityContribution -
      individualPensionContribution -
      taxPreferredHealthInsurance
  );
  const charitableDonationLimit = roundCurrency(
    taxableBeforeCharity * CN_CHARITABLE_DONATION_DEDUCTION_RATE_LIMIT
  );
  const charitableDonations = clampCurrency(
    inputs.contributions?.charitableDonations ?? 0,
    charitableDonationLimit
  );

  return {
    enterpriseAnnuityContribution,
    individualPensionContribution,
    taxPreferredHealthInsurance,
    charitableDonations,
    total: roundCurrency(
      enterpriseAnnuityContribution +
        individualPensionContribution +
        taxPreferredHealthInsurance +
        charitableDonations
    ),
  };
}

export function calculateCN(inputs: CNCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    socialInsuranceBase,
    housingFundRate,
    yearEndBonus,
    yearEndBonusTaxTreatment,
  } = inputs;

  const monthlySocialBase =
    grossSalary > 0 ? Math.max(0, socialInsuranceBase) : 0;
  const socialInsurance = calculateCNSocialInsurance(monthlySocialBase);
  const housingFund = calculateHousingFund(monthlySocialBase, housingFundRate);
  const deductionMode =
    inputs.deductionMode ?? "specialAdditionalDeductions";
  const isForeignAllowanceMode =
    deductionMode === "foreignAllowanceExemption";
  const specialDeductions = isForeignAllowanceMode
    ? getZeroCNSpecialDeductions()
    : calculateCNSpecialDeductions(inputs);
  const foreignAllowanceExemptions = isForeignAllowanceMode
    ? calculateCNForeignAllowanceExemptions(inputs)
    : {
        ...calculateCNForeignAllowanceExemptions(getCNDefaultInputs()),
      };
  const taxableInKindBenefits = clampCurrency(
    inputs.taxableInKindBenefits ?? 0
  );
  const annualBonus = Math.max(0, yearEndBonus ?? 0);
  const bonusTaxTreatment = yearEndBonusTaxTreatment ?? "separate";
  const isSeparateBonusTax =
    annualBonus > 0 && bonusTaxTreatment === "separate";
  const ordinaryTaxableGross = grossSalary + taxableInKindBenefits;
  const ordinaryTaxableGrossAfterForeignExemptions = Math.max(
    0,
    ordinaryTaxableGross - foreignAllowanceExemptions.total
  );
  const combinedTaxableGross =
    ordinaryTaxableGrossAfterForeignExemptions +
    (isSeparateBonusTax ? 0 : annualBonus);

  const fixedTaxDeductions =
    CN_STANDARD_DEDUCTION +
    specialDeductions.total +
    socialInsurance.total +
    housingFund.employee;
  const preDonationTaxableIncome = Math.max(
    0,
    combinedTaxableGross - fixedTaxDeductions
  );
  const voluntaryDeductions = calculateCNVoluntaryDeductions(
    inputs,
    preDonationTaxableIncome
  );
  const totalTaxDeductions = fixedTaxDeductions + voluntaryDeductions.total;

  const comprehensiveTaxableIncome = Math.max(
    0,
    combinedTaxableGross - totalTaxDeductions
  );
  const taxResult = calculateCNProgressiveTax(comprehensiveTaxableIncome);
  const yearEndBonusTaxResult = isSeparateBonusTax
    ? calculateCNSeparateYearEndBonusTax(annualBonus)
    : {
        totalTax: 0,
        taxableIncome: 0,
        rate: 0,
        quickDeduction: 0,
      };
  const incomeTax = roundCurrency(
    taxResult.totalTax + yearEndBonusTaxResult.totalTax
  );

  const taxes: CNTaxBreakdown = {
    type: "CN",
    totalIncomeTax: incomeTax,
    incomeTax,
    yearEndBonusTax: yearEndBonusTaxResult.totalTax,
    pensionInsurance: socialInsurance.pension.employee,
    medicalInsurance: socialInsurance.medical.employee,
    unemploymentInsurance: socialInsurance.unemployment.employee,
    housingFund: housingFund.employee,
  };

  const totalTax =
    taxes.incomeTax +
    taxes.pensionInsurance +
    taxes.medicalInsurance +
    taxes.unemploymentInsurance +
    taxes.housingFund;
  const totalDeductionsAll = totalTax + voluntaryDeductions.total;
  const totalGrossSalary = grossSalary + annualBonus;
  const taxableGrossIncome =
    totalGrossSalary + taxableInKindBenefits;
  const netSalary = totalGrossSalary - totalDeductionsAll;
  const effectiveTaxRate =
    totalGrossSalary > 0 ? totalTax / totalGrossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: CNBreakdown = {
    type: "CN",
    grossIncome: totalGrossSalary,
    taxableGrossIncome,
    taxableIncome:
      comprehensiveTaxableIncome + yearEndBonusTaxResult.taxableIncome,
    ordinarySalary: grossSalary,
    taxableInKindBenefits,
    yearEndBonus: annualBonus,
    yearEndBonusTaxTreatment: bonusTaxTreatment,
    yearEndBonusTaxableIncome: yearEndBonusTaxResult.taxableIncome,
    yearEndBonusRate: yearEndBonusTaxResult.rate,
    yearEndBonusQuickDeduction: yearEndBonusTaxResult.quickDeduction,
    deductionMode,
    standardDeduction: CN_STANDARD_DEDUCTION,
    specialDeductions,
    foreignAllowanceExemptions,
    voluntaryDeductions,
    socialInsurance,
    housingFund,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "CN",
    currency: "CNY",
    grossSalary: totalGrossSalary,
    taxableIncome: breakdown.taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalDeductionsAll,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: totalGrossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const CNCalculator: CountryCalculator = {
  countryCode: "CN",
  config: CN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CN") {
      throw new Error("CNCalculator can only calculate CN inputs");
    }
    return calculateCN(inputs as CNCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const cnInputs = inputs as Partial<CNCalculatorInputs> | undefined;
    const defaultInputs = getCNDefaultInputs();
    const normalizedInputs: CNCalculatorInputs = {
      ...defaultInputs,
      ...cnInputs,
      country: "CN",
      specialDeductions: {
        ...defaultInputs.specialDeductions,
        ...cnInputs?.specialDeductions,
      },
      foreignAllowanceExemptions: {
        ...defaultInputs.foreignAllowanceExemptions,
        ...cnInputs?.foreignAllowanceExemptions,
      },
      contributions: {
        ...defaultInputs.contributions,
        ...cnInputs?.contributions,
      },
    };
    const annualBonus = Math.max(0, normalizedInputs.yearEndBonus ?? 0);
    const deductionMode =
      normalizedInputs.deductionMode ?? "specialAdditionalDeductions";
    const isForeignAllowanceMode =
      deductionMode === "foreignAllowanceExemption";
    const taxableInKindBenefits = clampCurrency(
      normalizedInputs.taxableInKindBenefits ?? 0
    );
    const foreignAllowanceExemptions = isForeignAllowanceMode
      ? calculateCNForeignAllowanceExemptions(normalizedInputs)
      : calculateCNForeignAllowanceExemptions(defaultInputs);
    const ordinaryTaxableGrossAfterForeignExemptions = Math.max(
      0,
      normalizedInputs.grossSalary +
        taxableInKindBenefits -
        foreignAllowanceExemptions.total
    );
    const combinedTaxableGross =
      ordinaryTaxableGrossAfterForeignExemptions +
      (normalizedInputs.yearEndBonusTaxTreatment === "combined"
        ? annualBonus
        : 0);
    const socialInsurance = calculateCNSocialInsurance(
      Math.max(0, normalizedInputs.socialInsuranceBase)
    );
    const housingFund = calculateHousingFund(
      Math.max(0, normalizedInputs.socialInsuranceBase),
      normalizedInputs.housingFundRate
    );
    const specialDeductions = isForeignAllowanceMode
      ? getZeroCNSpecialDeductions()
      : calculateCNSpecialDeductions(normalizedInputs);
    const enterpriseAnnuityLimit = getEnterpriseAnnuityLimit(cnInputs);
    const preDonationTaxableIncome = Math.max(
      0,
      combinedTaxableGross -
        CN_STANDARD_DEDUCTION -
        specialDeductions.total -
        socialInsurance.total -
        housingFund.employee
    );
    const nonCharityVoluntaryDeductions =
      clampCurrency(
        normalizedInputs.contributions.enterpriseAnnuityContribution,
        enterpriseAnnuityLimit
      ) +
      clampCurrency(
        normalizedInputs.contributions.individualPensionContribution,
        CN_INDIVIDUAL_PENSION_DEDUCTION_ANNUAL_CAP
      ) +
      clampCurrency(
        normalizedInputs.contributions.taxPreferredHealthInsurance,
        CN_TAX_PREFERRED_HEALTH_INSURANCE_ANNUAL_CAP
      );
    const charityLimit = roundCurrency(
      Math.max(0, preDonationTaxableIncome - nonCharityVoluntaryDeductions) *
        CN_CHARITABLE_DONATION_DEDUCTION_RATE_LIMIT
    );

    return {
      enterpriseAnnuityContribution: {
        limit: enterpriseAnnuityLimit,
        name: "Enterprise / Occupational Annuity",
        description:
          "Employee enterprise or occupational annuity contribution, modeled up to 4% of the entered contribution wage base.",
        preTax: true,
      },
      individualPensionContribution: {
        limit: CN_INDIVIDUAL_PENSION_DEDUCTION_ANNUAL_CAP,
        name: "Individual Pension",
        description:
          "Personal pension account contribution deductible up to 12,000 CNY/year.",
        preTax: true,
      },
      taxPreferredHealthInsurance: {
        limit: CN_TAX_PREFERRED_HEALTH_INSURANCE_ANNUAL_CAP,
        name: "Tax-Preferred Health Insurance",
        description:
          "Qualified commercial health insurance deductible up to 2,400 CNY/year.",
        preTax: true,
      },
      charitableDonations: {
        limit: charityLimit,
        name: "Approved Charity Donations",
        description:
          "Approved public-welfare donations modeled up to 30% of annual comprehensive taxable income before this donation.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CNCalculatorInputs {
    return getCNDefaultInputs();
  },
};
