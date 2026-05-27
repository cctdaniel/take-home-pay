import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  JPBreakdown,
  JPCalculatorInputs,
  JPIdecoCategory,
  JPTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { JP_CONFIG } from "./config";
import {
  calculateJPBasicDeduction,
  calculateJPDependentDeduction,
  calculateJPEarthquakeInsuranceDeduction,
  calculateJPEmploymentIncomeDeduction,
  calculateJPIncomeAdjustmentDeduction,
  calculateJPLifeInsurancePremiumDeduction,
  calculateJPMedicalExpenseDeduction,
  calculateJPProgressiveTax,
  calculateJPQualifiedDonationDeduction,
  calculateJPResidentTaxBasicDeduction,
  calculateJPSpouseDeduction,
  getJPMarginalIncomeTaxRate,
  getJPIdecoAnnualLimit,
  JP_DONATION_DEDUCTION_LIMITS,
  JP_EARTHQUAKE_INSURANCE_LIMITS,
  JP_LIFE_INSURANCE_PREMIUM_LIMITS,
  JP_RECONSTRUCTION_SURTAX_RATE,
  JP_RESIDENT_TAX_PER_CAPITA,
  JP_RESIDENT_TAX_RATE,
  JP_SOCIAL_INSURANCE_2026,
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
  return Math.round(value);
}

function floorTaxableIncome(value: number): number {
  return Math.floor(Math.max(0, value) / 1000) * 1000;
}

function clampAmount(value: number | undefined, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value ?? 0), max);
}

function clampCount(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(value ?? 0)), 10);
}

function normalizeJPInputs(inputs: JPCalculatorInputs): JPCalculatorInputs {
  const idecoCategory =
    inputs.idecoCategory ?? "employee_no_corporate_pension";
  const idecoLimit = getJPIdecoAnnualLimit(idecoCategory);
  const grossSalary = Math.max(0, inputs.grossSalary);
  const donationIncome = Math.max(
    0,
    Math.round(
      grossSalary -
        calculateJPEmploymentIncomeDeduction(grossSalary) -
        calculateJPIncomeAdjustmentDeduction(
          grossSalary,
          Boolean(inputs.hasIncomeAdjustmentDeduction),
        ),
    ),
  );
  const donationLimit = Math.round(
    donationIncome *
      JP_DONATION_DEDUCTION_LIMITS.incomeTaxTotalIncomeLimitRate,
  );

  return {
    ...inputs,
    country: "JP",
    grossSalary,
    spouseDeductionType: inputs.spouseDeductionType ?? "none",
    numberOfOrdinaryDependents: clampCount(inputs.numberOfOrdinaryDependents),
    numberOfSpecifiedDependents: clampCount(inputs.numberOfSpecifiedDependents),
    numberOfElderlyDependents: clampCount(inputs.numberOfElderlyDependents),
    numberOfCohabitingElderlyParents: clampCount(
      inputs.numberOfCohabitingElderlyParents,
    ),
    hasIncomeAdjustmentDeduction: Boolean(inputs.hasIncomeAdjustmentDeduction),
    idecoCategory,
    donationType: inputs.donationType ?? "none",
    contributions: {
      idecoContribution: clampAmount(
        inputs.contributions?.idecoContribution,
        idecoLimit,
      ),
      lifeInsurancePremiums: clampAmount(
        inputs.contributions?.lifeInsurancePremiums,
        JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
      ),
      careMedicalInsurancePremiums: clampAmount(
        inputs.contributions?.careMedicalInsurancePremiums,
        JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
      ),
      privatePensionInsurancePremiums: clampAmount(
        inputs.contributions?.privatePensionInsurancePremiums,
        JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
      ),
      earthquakeInsurancePremiums: clampAmount(
        inputs.contributions?.earthquakeInsurancePremiums,
        JP_EARTHQUAKE_INSURANCE_LIMITS.premiumToMaxIncomeTaxDeduction,
      ),
      medicalExpenses: clampAmount(inputs.contributions?.medicalExpenses),
      medicalExpenseReimbursements: clampAmount(
        inputs.contributions?.medicalExpenseReimbursements,
      ),
      qualifiedDonations:
        (inputs.donationType ?? "none") === "none"
          ? 0
          : clampAmount(inputs.contributions?.qualifiedDonations, donationLimit),
    },
  };
}

function calculateJPSocialInsurance(monthlySalary: number) {
  const si = JP_SOCIAL_INSURANCE_2026;
  if (monthlySalary <= 0) {
    return {
      pension: {
        rate: si.pension.employeeRate,
        employee: 0,
        monthlyCeiling: si.pension.monthlyCeiling,
      },
      health: {
        rate: si.health.employeeRate,
        employee: 0,
        monthlyCeiling: si.health.monthlyCeiling,
      },
      employment: {
        rate: si.employment.employeeRate,
        employee: 0,
      },
      total: 0,
    };
  }

  const pensionBase = Math.max(
    si.pension.minMonthlyBase,
    Math.min(monthlySalary, si.pension.monthlyCeiling)
  );
  const healthBase = Math.min(monthlySalary, si.health.monthlyCeiling);

  const monthlyPension = roundCurrency(pensionBase * si.pension.employeeRate);
  const monthlyHealth = roundCurrency(healthBase * si.health.employeeRate);
  const monthlyEmployment = roundCurrency(
    monthlySalary * si.employment.employeeRate
  );

  return {
    pension: {
      rate: si.pension.employeeRate,
      employee: monthlyPension * 12,
      monthlyCeiling: si.pension.monthlyCeiling,
    },
    health: {
      rate: si.health.employeeRate,
      employee: monthlyHealth * 12,
      monthlyCeiling: si.health.monthlyCeiling,
    },
    employment: {
      rate: si.employment.employeeRate,
      employee: monthlyEmployment * 12,
    },
    total: (monthlyPension + monthlyHealth + monthlyEmployment) * 12,
  };
}

export function calculateJP(inputs: JPCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeJPInputs(inputs);
  const { grossSalary, payFrequency } = normalizedInputs;
  const monthlySalary = grossSalary / 12;

  const employmentDeduction =
    calculateJPEmploymentIncomeDeduction(grossSalary);
  const incomeAdjustmentDeduction = calculateJPIncomeAdjustmentDeduction(
    grossSalary,
    normalizedInputs.hasIncomeAdjustmentDeduction,
  );
  const employmentIncome = Math.max(
    0,
    Math.round(grossSalary - employmentDeduction - incomeAdjustmentDeduction),
  );
  const socialInsurance = calculateJPSocialInsurance(monthlySalary);
  const idecoDeduction = normalizedInputs.contributions.idecoContribution;
  const lifeInsurancePremiumDeduction =
    calculateJPLifeInsurancePremiumDeduction(
      {
        life: normalizedInputs.contributions.lifeInsurancePremiums,
        careMedical: normalizedInputs.contributions.careMedicalInsurancePremiums,
        privatePension:
          normalizedInputs.contributions.privatePensionInsurancePremiums,
      },
      "income",
    );
  const residentTaxLifeInsurancePremiumDeduction =
    calculateJPLifeInsurancePremiumDeduction(
      {
        life: normalizedInputs.contributions.lifeInsurancePremiums,
        careMedical: normalizedInputs.contributions.careMedicalInsurancePremiums,
        privatePension:
          normalizedInputs.contributions.privatePensionInsurancePremiums,
      },
      "resident",
    );
  const earthquakeInsuranceDeduction = calculateJPEarthquakeInsuranceDeduction(
    normalizedInputs.contributions.earthquakeInsurancePremiums,
    "income",
  );
  const residentTaxEarthquakeInsuranceDeduction =
    calculateJPEarthquakeInsuranceDeduction(
      normalizedInputs.contributions.earthquakeInsurancePremiums,
      "resident",
    );
  const basicDeduction = calculateJPBasicDeduction(employmentIncome);
  const spouseDeduction = calculateJPSpouseDeduction(
    normalizedInputs.spouseDeductionType,
    employmentIncome,
    "income",
  );
  const dependentDeduction = calculateJPDependentDeduction(
    {
      ordinary: normalizedInputs.numberOfOrdinaryDependents,
      specified: normalizedInputs.numberOfSpecifiedDependents,
      elderly: normalizedInputs.numberOfElderlyDependents,
      cohabitingElderlyParent:
        normalizedInputs.numberOfCohabitingElderlyParents,
    },
    "income",
  );
  const medicalExpense = calculateJPMedicalExpenseDeduction({
    medicalExpenses: normalizedInputs.contributions.medicalExpenses,
    reimbursements: normalizedInputs.contributions.medicalExpenseReimbursements,
    totalIncome: employmentIncome,
  });
  const donationDeduction = calculateJPQualifiedDonationDeduction({
    donationType: normalizedInputs.donationType,
    donationAmount: normalizedInputs.contributions.qualifiedDonations,
    totalIncome: employmentIncome,
  });
  const taxableIncome = floorTaxableIncome(
    employmentIncome -
      socialInsurance.total -
      idecoDeduction -
      lifeInsurancePremiumDeduction -
      earthquakeInsuranceDeduction -
      medicalExpense.deduction -
      donationDeduction.deduction -
      basicDeduction -
      spouseDeduction -
      dependentDeduction,
  );

  const taxResult = calculateJPProgressiveTax(taxableIncome);
  const reconstructionSurtax = Math.round(
    taxResult.totalTax * JP_RECONSTRUCTION_SURTAX_RATE
  );

  const residentTaxBasicDeduction =
    calculateJPResidentTaxBasicDeduction(employmentIncome);
  const residentTaxSpouseDeduction = calculateJPSpouseDeduction(
    normalizedInputs.spouseDeductionType,
    employmentIncome,
    "resident",
  );
  const residentTaxDependentDeduction = calculateJPDependentDeduction(
    {
      ordinary: normalizedInputs.numberOfOrdinaryDependents,
      specified: normalizedInputs.numberOfSpecifiedDependents,
      elderly: normalizedInputs.numberOfElderlyDependents,
      cohabitingElderlyParent:
        normalizedInputs.numberOfCohabitingElderlyParents,
    },
    "resident",
  );
  const residentTaxableIncome = floorTaxableIncome(
    employmentIncome -
      socialInsurance.total -
      idecoDeduction -
      residentTaxLifeInsurancePremiumDeduction -
      residentTaxEarthquakeInsuranceDeduction -
      medicalExpense.deduction -
      residentTaxBasicDeduction -
      residentTaxSpouseDeduction -
      residentTaxDependentDeduction,
  );
  const residentTaxIncomeLevy = Math.max(
    0,
    Math.round(residentTaxableIncome * JP_RESIDENT_TAX_RATE),
  );
  const residentTaxPerCapita =
    residentTaxableIncome > 0 ? JP_RESIDENT_TAX_PER_CAPITA : 0;
  const residentTaxBeforeDonationCredits =
    residentTaxIncomeLevy + residentTaxPerCapita;
  const furusatoResidentCreditLimit = Math.round(
    residentTaxIncomeLevy *
      JP_DONATION_DEDUCTION_LIMITS.furusatoSpecialCreditResidentTaxLimitRate,
  );
  const furusatoResidentBasicCredit =
    normalizedInputs.donationType === "furusato"
      ? Math.round(
          donationDeduction.deduction *
            JP_DONATION_DEDUCTION_LIMITS.residentTaxBasicCreditRate,
        )
      : 0;
  const furusatoSpecialCreditRate =
    1 -
    JP_DONATION_DEDUCTION_LIMITS.residentTaxBasicCreditRate -
    getJPMarginalIncomeTaxRate(taxableIncome) *
      (1 + JP_RECONSTRUCTION_SURTAX_RATE);
  const furusatoResidentSpecialCredit =
    normalizedInputs.donationType === "furusato"
      ? Math.min(
          Math.round(
            donationDeduction.deduction *
              Math.max(0, furusatoSpecialCreditRate),
          ),
          furusatoResidentCreditLimit,
        )
      : 0;
  const appliedFurusatoBasicCredit = Math.min(
    furusatoResidentBasicCredit,
    residentTaxIncomeLevy,
  );
  const appliedFurusatoSpecialCredit = Math.min(
    furusatoResidentSpecialCredit,
    Math.max(0, residentTaxIncomeLevy - appliedFurusatoBasicCredit),
  );
  const residentTax =
    Math.max(
      0,
      residentTaxIncomeLevy -
        appliedFurusatoBasicCredit -
        appliedFurusatoSpecialCredit,
    ) + residentTaxPerCapita;

  const taxes: JPTaxBreakdown = {
    type: "JP",
    totalIncomeTax:
      taxResult.totalTax + reconstructionSurtax + residentTax,
    incomeTax: taxResult.totalTax,
    reconstructionSurtax,
    residentTax,
    pensionInsurance: socialInsurance.pension.employee,
    healthInsurance: socialInsurance.health.employee,
    employmentInsurance: socialInsurance.employment.employee,
  };

  const totalTax =
    taxes.incomeTax +
    taxes.reconstructionSurtax +
    taxes.residentTax +
    taxes.pensionInsurance +
    taxes.healthInsurance +
    taxes.employmentInsurance;
  const totalDeductions =
    totalTax + idecoDeduction + donationDeduction.qualifiedDonationAmount;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: JPBreakdown = {
    type: "JP",
    grossIncome: grossSalary,
    employmentIncomeDeduction: employmentDeduction,
    incomeAdjustmentDeduction,
    employmentIncome,
    basicDeduction,
    socialInsuranceDeduction: socialInsurance.total,
    spouseDeduction,
    dependentDeduction,
    idecoDeduction,
    lifeInsurancePremiumDeduction,
    residentTaxLifeInsurancePremiumDeduction,
    earthquakeInsuranceDeduction,
    residentTaxEarthquakeInsuranceDeduction,
    medicalExpenseDeduction: medicalExpense.deduction,
    medicalExpenseNetAmount: medicalExpense.netMedicalExpenses,
    medicalExpenseThreshold: medicalExpense.threshold,
    qualifiedDonationDeduction: donationDeduction.deduction,
    qualifiedDonationAmount: donationDeduction.qualifiedDonationAmount,
    furusatoResidentBasicCredit: appliedFurusatoBasicCredit,
    furusatoResidentSpecialCredit: appliedFurusatoSpecialCredit,
    furusatoResidentCreditLimit,
    taxableIncome,
    residentTaxableIncome,
    nationalIncomeTax: taxResult.totalTax,
    nationalIncomeTaxBeforeCredits: taxResult.totalTax,
    reconstructionSurtax,
    residentTax,
    residentTaxBeforeDonationCredits,
    socialInsurance,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "JP",
    currency: "JPY",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const JPCalculator: CountryCalculator = {
  countryCode: "JP",
  config: JP_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "JP") {
      throw new Error("JPCalculator can only calculate JP inputs");
    }
    return calculateJP(inputs as JPCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const jpInputs = inputs as Partial<JPCalculatorInputs> | undefined;
    const category =
      jpInputs?.idecoCategory ?? "employee_no_corporate_pension";
    const limit = getJPIdecoAnnualLimit(category as JPIdecoCategory);
    const grossSalary = Math.max(0, jpInputs?.grossSalary ?? 0);
    const donationIncome = Math.max(
      0,
      Math.round(
        grossSalary -
          calculateJPEmploymentIncomeDeduction(grossSalary) -
          calculateJPIncomeAdjustmentDeduction(
            grossSalary,
            Boolean(jpInputs?.hasIncomeAdjustmentDeduction),
          ),
      ),
    );
    const donationLimit = Math.round(
      donationIncome *
        JP_DONATION_DEDUCTION_LIMITS.incomeTaxTotalIncomeLimitRate,
    );

    return {
      idecoContribution: {
        limit,
        name: "iDeCo individual DC pension contribution",
        description:
          category === "employee_with_corporate_pension"
            ? "Modeled employee iDeCo cap of JPY 20,000 per month for employees with corporate pension coverage."
            : "Modeled employee iDeCo cap of JPY 23,000 per month where no corporate pension applies.",
        preTax: true,
      },
      lifeInsurancePremiums: {
        limit: JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
        name: "Life insurance premiums",
        description:
          "New-system life insurance premiums. Income-tax deduction reaches the category maximum at JPY 80,000 paid.",
        preTax: true,
      },
      careMedicalInsurancePremiums: {
        limit: JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
        name: "Care / medical insurance premiums",
        description:
          "New-system care/medical insurance premiums. Income-tax deduction reaches the category maximum at JPY 80,000 paid.",
        preTax: true,
      },
      privatePensionInsurancePremiums: {
        limit: JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxPremiumToMaxDeduction,
        name: "Private pension insurance premiums",
        description:
          "New-system individual pension insurance premiums. Income-tax deduction reaches the category maximum at JPY 80,000 paid.",
        preTax: true,
      },
      earthquakeInsurancePremiums: {
        limit: JP_EARTHQUAKE_INSURANCE_LIMITS.premiumToMaxIncomeTaxDeduction,
        name: "Earthquake insurance premiums",
        description:
          "NTA earthquake insurance deduction reaches the income-tax maximum at JPY 50,000 paid.",
        preTax: true,
      },
      qualifiedDonations: {
        limit: donationLimit,
        name:
          jpInputs?.donationType === "furusato"
            ? "Furusato nozei donations"
            : "Qualified specified donations",
        description:
          jpInputs?.donationType === "furusato"
            ? "Municipal furusato nozei donations modeled with the JPY 2,000 floor, income-tax deduction, 10% resident-tax basic credit, and special resident-tax credit capped at 20% of the resident-tax income levy."
            : "NTA specified donations modeled as an income-tax deduction: lower of the annual donation or 40% of total income, minus JPY 2,000.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): JPCalculatorInputs {
    return {
      country: "JP",
      grossSalary: 6_000_000,
      payFrequency: "monthly",
      spouseDeductionType: "none",
      numberOfOrdinaryDependents: 0,
      numberOfSpecifiedDependents: 0,
      numberOfElderlyDependents: 0,
      numberOfCohabitingElderlyParents: 0,
      hasIncomeAdjustmentDeduction: false,
      idecoCategory: "employee_no_corporate_pension",
      donationType: "none",
      contributions: {
        idecoContribution: 0,
        lifeInsurancePremiums: 0,
        careMedicalInsurancePremiums: 0,
        privatePensionInsurancePremiums: 0,
        earthquakeInsurancePremiums: 0,
        medicalExpenses: 0,
        medicalExpenseReimbursements: 0,
        qualifiedDonations: 0,
      },
    };
  },
};
