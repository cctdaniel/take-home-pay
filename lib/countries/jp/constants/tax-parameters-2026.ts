import type { TaxBracket } from "../../types";
import type {
  JPDonationType,
  JPIdecoCategory,
  JPSpouseDeductionType,
} from "../../types";

export const JP_TAX_YEAR = 2026;

export const JP_SOURCE_URLS = [
  "https://www.nta.go.jp/english/taxes/individual/12012.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2672.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1135.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1140.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1145.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1150.htm",
  "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1155.htm",
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/nenkin/kyoshutsu/ideco.html",
] as const;

// Social insurance rates (2026)
export const JP_SOCIAL_INSURANCE_2026 = {
  pension: {
    employeeRate: 0.0915, // 9.15%
    employerRate: 0.0915,
    monthlyCeiling: 650_000, // Standard monthly remuneration ceiling
    minMonthlyBase: 88_000, // Minimum monthly remuneration
  },
  health: {
    // Varies by prefecture/association - using national average
    employeeRate: 0.05, // ~5% (varies 4.5%-5.5%)
    employerRate: 0.05,
    monthlyCeiling: 1_390_000, // Health insurance ceiling (higher than pension)
  },
  employment: {
    employeeRate: 0.006, // 0.6% (general industry)
    employerRate: 0.006,
  },
} as const;

// National income tax brackets (7 brackets) with deductions
// From: https://www.nta.go.jp/english/taxes/individual/
export const JP_TAX_BRACKETS_2026: Array<
  TaxBracket & { deduction: number }
> = [
  { min: 0, max: 1_950_000, rate: 0.05, deduction: 0 },
  { min: 1_950_000, max: 3_300_000, rate: 0.10, deduction: 97_500 },
  { min: 3_300_000, max: 6_950_000, rate: 0.20, deduction: 427_500 },
  { min: 6_950_000, max: 9_000_000, rate: 0.23, deduction: 636_000 },
  { min: 9_000_000, max: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { min: 18_000_000, max: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { min: 40_000_000, max: Infinity, rate: 0.45, deduction: 4_796_000 },
];

export const JP_RESIDENT_TAX_BASIC_DEDUCTION = 430_000;

// Reconstruction surtax rate: 2.1% of national income tax
export const JP_RECONSTRUCTION_SURTAX_RATE = 0.021;

// Resident tax (住民税): 10% flat (4% prefectural + 6% municipal)
export const JP_RESIDENT_TAX_RATE = 0.10;
// Per-capita resident tax (flat amount)
export const JP_RESIDENT_TAX_PER_CAPITA = 5_000;

export const JP_IDECO_ANNUAL_LIMITS: Record<JPIdecoCategory, number> = {
  employee_no_corporate_pension: 23_000 * 12,
  employee_with_corporate_pension: 20_000 * 12,
};

export const JP_LIFE_INSURANCE_PREMIUM_LIMITS = {
  incomeTaxPremiumToMaxDeduction: 80_000,
  incomeTaxCategoryMax: 40_000,
  incomeTaxTotalMax: 120_000,
  residentTaxPremiumToMaxDeduction: 56_000,
  residentTaxCategoryMax: 28_000,
  residentTaxTotalMax: 70_000,
} as const;

export const JP_EARTHQUAKE_INSURANCE_LIMITS = {
  premiumToMaxIncomeTaxDeduction: 50_000,
  incomeTaxMax: 50_000,
  residentTaxMax: 25_000,
} as const;

export const JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS = {
  ordinaryDeductionMax: 2_000_000,
  thresholdFixedAmount: 100_000,
  thresholdIncomeRate: 0.05,
} as const;

export const JP_DONATION_DEDUCTION_LIMITS = {
  incomeTaxTotalIncomeLimitRate: 0.4,
  donationFloor: 2_000,
  residentTaxBasicCreditRate: 0.1,
  furusatoSpecialCreditResidentTaxLimitRate: 0.2,
} as const;

export const JP_INCOME_TAX_SPOUSE_DEDUCTION: Record<
  JPSpouseDeductionType,
  [number, number, number]
> = {
  none: [0, 0, 0],
  ordinary: [380_000, 260_000, 130_000],
  elderly: [480_000, 320_000, 160_000],
};

export const JP_RESIDENT_TAX_SPOUSE_DEDUCTION: Record<
  JPSpouseDeductionType,
  [number, number, number]
> = {
  none: [0, 0, 0],
  ordinary: [330_000, 220_000, 110_000],
  elderly: [380_000, 260_000, 130_000],
};

export const JP_INCOME_TAX_DEPENDENT_DEDUCTIONS = {
  ordinary: 380_000,
  specified: 630_000,
  elderly: 480_000,
  cohabitingElderlyParent: 580_000,
} as const;

export const JP_RESIDENT_TAX_DEPENDENT_DEDUCTIONS = {
  ordinary: 330_000,
  specified: 450_000,
  elderly: 380_000,
  cohabitingElderlyParent: 450_000,
} as const;

function clampCount(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(value ?? 0)), 10);
}

export function getJPIdecoAnnualLimit(
  category: JPIdecoCategory | undefined,
): number {
  return JP_IDECO_ANNUAL_LIMITS[
    category ?? "employee_no_corporate_pension"
  ];
}

export function calculateJPBasicDeduction(totalIncome: number): number {
  if (totalIncome <= 1_320_000) return 950_000;
  if (totalIncome <= 3_360_000) return 880_000;
  if (totalIncome <= 4_890_000) return 680_000;
  if (totalIncome <= 6_550_000) return 630_000;
  if (totalIncome <= 23_500_000) return 580_000;
  if (totalIncome <= 24_000_000) return 480_000;
  if (totalIncome <= 24_500_000) return 320_000;
  if (totalIncome <= 25_000_000) return 160_000;
  return 0;
}

export function calculateJPResidentTaxBasicDeduction(
  totalIncome: number,
): number {
  if (totalIncome <= 24_000_000) return JP_RESIDENT_TAX_BASIC_DEDUCTION;
  if (totalIncome <= 24_500_000) return 290_000;
  if (totalIncome <= 25_000_000) return 150_000;
  return 0;
}

function getSpouseDeductionTier(totalIncome: number): 0 | 1 | 2 | null {
  if (totalIncome <= 9_000_000) return 0;
  if (totalIncome <= 9_500_000) return 1;
  if (totalIncome <= 10_000_000) return 2;
  return null;
}

export function calculateJPSpouseDeduction(
  spouseDeductionType: JPSpouseDeductionType | undefined,
  totalIncome: number,
  taxType: "income" | "resident",
): number {
  const tier = getSpouseDeductionTier(totalIncome);
  if (tier === null) {
    return 0;
  }

  const table =
    taxType === "income"
      ? JP_INCOME_TAX_SPOUSE_DEDUCTION
      : JP_RESIDENT_TAX_SPOUSE_DEDUCTION;

  return table[spouseDeductionType ?? "none"][tier] ?? 0;
}

export function calculateJPDependentDeduction(
  counts: {
    ordinary?: number;
    specified?: number;
    elderly?: number;
    cohabitingElderlyParent?: number;
  },
  taxType: "income" | "resident",
): number {
  const deductions =
    taxType === "income"
      ? JP_INCOME_TAX_DEPENDENT_DEDUCTIONS
      : JP_RESIDENT_TAX_DEPENDENT_DEDUCTIONS;

  return (
    clampCount(counts.ordinary) * deductions.ordinary +
    clampCount(counts.specified) * deductions.specified +
    clampCount(counts.elderly) * deductions.elderly +
    clampCount(counts.cohabitingElderlyParent) *
      deductions.cohabitingElderlyParent
  );
}

function calculateJPLifeInsuranceCategoryDeduction(
  annualPremium: number,
  taxType: "income" | "resident",
): number {
  const premium = Math.max(0, annualPremium);

  if (taxType === "resident") {
    if (premium <= 12_000) return Math.round(premium);
    if (premium <= 32_000) return Math.round(premium * 0.5 + 6_000);
    if (premium <= 56_000) return Math.round(premium * 0.25 + 14_000);
    return JP_LIFE_INSURANCE_PREMIUM_LIMITS.residentTaxCategoryMax;
  }

  if (premium <= 20_000) return Math.round(premium);
  if (premium <= 40_000) return Math.round(premium * 0.5 + 10_000);
  if (premium <= 80_000) return Math.round(premium * 0.25 + 20_000);
  return JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxCategoryMax;
}

export function calculateJPLifeInsurancePremiumDeduction(
  premiums: {
    life?: number;
    careMedical?: number;
    privatePension?: number;
  },
  taxType: "income" | "resident",
): number {
  const categoryTotal =
    calculateJPLifeInsuranceCategoryDeduction(premiums.life ?? 0, taxType) +
    calculateJPLifeInsuranceCategoryDeduction(
      premiums.careMedical ?? 0,
      taxType,
    ) +
    calculateJPLifeInsuranceCategoryDeduction(
      premiums.privatePension ?? 0,
      taxType,
    );

  return Math.min(
    categoryTotal,
    taxType === "resident"
      ? JP_LIFE_INSURANCE_PREMIUM_LIMITS.residentTaxTotalMax
      : JP_LIFE_INSURANCE_PREMIUM_LIMITS.incomeTaxTotalMax,
  );
}

export function calculateJPEarthquakeInsuranceDeduction(
  annualPremium: number,
  taxType: "income" | "resident",
): number {
  const premium = Math.max(0, annualPremium);

  return taxType === "resident"
    ? Math.min(
        Math.round(premium * 0.5),
        JP_EARTHQUAKE_INSURANCE_LIMITS.residentTaxMax,
      )
    : Math.min(
        Math.round(premium),
        JP_EARTHQUAKE_INSURANCE_LIMITS.incomeTaxMax,
      );
}

export function calculateJPMedicalExpenseDeduction({
  medicalExpenses,
  reimbursements,
  totalIncome,
}: {
  medicalExpenses: number;
  reimbursements: number;
  totalIncome: number;
}): { deduction: number; netMedicalExpenses: number; threshold: number } {
  const netMedicalExpenses = Math.max(
    0,
    Math.max(0, medicalExpenses) - Math.max(0, reimbursements),
  );
  const threshold = Math.min(
    JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.thresholdFixedAmount,
    Math.max(0, totalIncome) *
      JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.thresholdIncomeRate,
  );
  const deduction = Math.min(
    Math.max(0, netMedicalExpenses - threshold),
    JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.ordinaryDeductionMax,
  );

  return {
    deduction: Math.round(deduction),
    netMedicalExpenses: Math.round(netMedicalExpenses),
    threshold: Math.round(threshold),
  };
}

export function calculateJPQualifiedDonationDeduction({
  donationType,
  donationAmount,
  totalIncome,
}: {
  donationType: JPDonationType | undefined;
  donationAmount: number;
  totalIncome: number;
}): {
  qualifiedDonationAmount: number;
  deduction: number;
  deductionLimit: number;
} {
  const deductionLimit = Math.round(
    Math.max(0, totalIncome) *
      JP_DONATION_DEDUCTION_LIMITS.incomeTaxTotalIncomeLimitRate,
  );
  const qualifiedDonationAmount =
    donationType && donationType !== "none"
      ? Math.min(Math.max(0, donationAmount), deductionLimit)
      : 0;
  const deduction = Math.max(
    0,
    qualifiedDonationAmount - JP_DONATION_DEDUCTION_LIMITS.donationFloor,
  );

  return {
    qualifiedDonationAmount: Math.round(qualifiedDonationAmount),
    deduction: Math.round(deduction),
    deductionLimit,
  };
}

export function calculateJPIncomeAdjustmentDeduction(
  grossSalary: number,
  isEligible: boolean,
): number {
  if (!isEligible || grossSalary <= 8_500_000) {
    return 0;
  }

  return Math.round((Math.min(grossSalary, 10_000_000) - 8_500_000) * 0.1);
}

// Employment income deduction (給与所得控除) - progressive
export function calculateJPEmploymentIncomeDeduction(
  grossSalary: number
): number {
  if (grossSalary <= 1_900_000) {
    return Math.min(grossSalary, 650_000);
  }
  if (grossSalary <= 3_600_000) {
    return grossSalary * 0.3 + 80_000;
  }
  if (grossSalary <= 6_600_000) {
    return grossSalary * 0.2 + 440_000;
  }
  if (grossSalary <= 8_500_000) {
    return grossSalary * 0.1 + 1_100_000;
  }
  return 1_950_000;
}

export function calculateJPProgressiveTax(
  taxableIncome: number
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    deduction: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    deduction: number;
  }> = [];

  for (const bracket of JP_TAX_BRACKETS_2026) {
    if (taxableIncome <= 0) break;

    const amountInBracket =
      Math.min(taxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;

    const tax = amountInBracket * bracket.rate;
    totalTax += tax;

    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
      deduction: bracket.deduction,
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

export function getJPMarginalIncomeTaxRate(taxableIncome: number): number {
  const taxable = Math.max(0, taxableIncome);
  const bracket =
    JP_TAX_BRACKETS_2026.find(
      (item) => taxable > item.min && taxable <= item.max,
    ) ?? JP_TAX_BRACKETS_2026[0];

  return bracket.rate;
}
