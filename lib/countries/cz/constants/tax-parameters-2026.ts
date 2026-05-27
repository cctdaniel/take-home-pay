// ============================================================================
// CZECHIA EMPLOYMENT INCOME TAX AND STATUTORY PAYROLL CONTRIBUTIONS (2026)
// ============================================================================
//
// Official tax sources:
// Financial Administration, employees/employers general information:
// https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace
// Financial Administration, Czech tax system overview:
// https://financnisprava.gov.cz/cs/dane/danovy-system-cr/popis-systemu
// Financial Administration, 2025/2026 individual income tax Q&A:
// https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/dotazy-a-odpovedi/dan-z-prijmu-fyzickych-osob/aktualne-k-dani-z-prijmu-fyzickych-osob-2025
// Financial Administration, 2026 employee tax-credit overview:
// https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace
// Financial Administration, 2026 employee taxable benefits and car benefit rules:
// https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace
// Financial Administration, 2026 employee benefit Q&A:
// https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/dotazy-a-odpovedi/2026/aktualni-dotazy-a-odpovedi-k-dani-z
// Financial Administration, gifts deduction extended through 2026:
// https://financnisprava.gov.cz/cs/financni-sprava/novinky/novinky-2025/dary-a-dane-zvyseny-odpocet-prodlouzen
//
// Social security sources:
// Czech Social Security Administration, 2026 key social security figures:
// https://www.cssz.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026
// Czech Social Security Administration, premium rates:
// https://www.cssz.cz/vyse-a-sazba
// Czech Social Security Administration, maximum assessment base:
// https://www.cssz.cz/maximalni-vymerovaci-zaklad
// Czech Social Security Administration, assessed income includes taxable
// cash, non-cash, and benefit-form remuneration:
// https://www.cssz.cz/vypocet-pojistneho
//
// Health insurance source:
// VZP CR, employer payment rules for public health insurance:
// https://www.vzp.cz/platci/informace/zamestnavatel/splatnost-a-dalsi-zasady-pro-platbu-pojistneho/jakym-zpusobem-se-plati-pojistne-na-zdravotni-pojisteni
//
// Assumptions:
// - Models ordinary employment salary under Czech payroll withholding and annual
//   settlement concepts.
// - Employment income tax base is gross employment income less modeled
//   non-taxable parts, rounded down to whole hundreds before tax.
// - Taxable non-cash benefits entered in the calculator are treated as
//   employment income and as payroll assessment-base income, but they do not
//   increase cash take-home pay.
// - The basic taxpayer credit is available to residents and non-residents.
// - Child, spouse, disability, and ZTP/P credits, retirement-product
//   deductions, and gift deductions are modeled for Czech tax residents only.
//   EU/EEA non-resident 90% tests and partial-year credit month counting are
//   excluded.
// - Trade-license/self-employment, lump-sum expenses, paušální daň, agreements
//   below participation thresholds, minimum health-insurance top-ups, working
//   pensioner social-insurance discounts, risky-profession employer regimes,
//   and employer benefit exemptions are excluded.
// ============================================================================

import type { TaxBracket } from "../../types";

export const CZECH_SOURCE_URLS = [
  "https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace",
  "https://financnisprava.gov.cz/cs/dane/danovy-system-cr/popis-systemu",
  "https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/dotazy-a-odpovedi/dan-z-prijmu-fyzickych-osob/aktualne-k-dani-z-prijmu-fyzickych-osob-2025",
  "https://www.cssz.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026",
  "https://www.cssz.cz/vyse-a-sazba",
  "https://www.cssz.cz/maximalni-vymerovaci-zaklad",
  "https://www.vzp.cz/platci/informace/zamestnavatel/splatnost-a-dalsi-zasady-pro-platbu-pojistneho/jakym-zpusobem-se-plati-pojistne-na-zdravotni-pojisteni",
] as const;

export const CZECH_TAX_PARAMETERS_2026 = {
  averageWage: 48_967,
  annualTaxBandThreshold: 1_762_812,
  monthlyTaxBandThreshold: 146_901,
  minimumAnnualIncomeForChildBonus: 134_400,
  minimumAnnualChildBonus: 100,
  taxRates: {
    basic: 0.15,
    higher: 0.23,
  },
  credits: {
    basicTaxpayer: 30_840,
    spouse: 24_840,
    spouseZtpP: 49_680,
    disabilityBasic: 2_520,
    disabilityExtended: 5_040,
    ztpPCard: 16_140,
    childFirst: 15_204,
    childSecond: 22_320,
    childThirdAndEachAdditional: 27_840,
  },
  deductions: {
    retirementProductsLimit: 48_000,
    charitableDonationMaxRate: 0.3,
    charitableDonationMinRate: 0.02,
    charitableDonationMinAmount: 1_000,
  },
  benefits: {
    healthBenefitExemptionLimit: 48_967,
    leisureCultureSportRecreationExemptionLimit: 24_483.5,
    employerRetirementProductExemptionLimit: 50_000,
    mealContributionExemptionPerShift: 129.5,
    companyCarMinimumMonthlyBenefit: 1_000,
    companyCarRates: {
      standard: 0.01,
      lowEmission: 0.005,
      zeroEmission: 0.0025,
    },
  },
  socialSecurity: {
    employeeRate: 0.071,
    employerRate: 0.248,
    pensionEmployeeRate: 0.065,
    sicknessEmployeeRate: 0.006,
    annualCeiling: 2_350_416,
  },
  healthInsurance: {
    employeeRate: 0.045,
    employerRate: 0.09,
    totalRate: 0.135,
  },
} as const;

export const CZECH_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: CZECH_TAX_PARAMETERS_2026.annualTaxBandThreshold,
    rate: CZECH_TAX_PARAMETERS_2026.taxRates.basic,
  },
  {
    min: CZECH_TAX_PARAMETERS_2026.annualTaxBandThreshold,
    max: Infinity,
    rate: CZECH_TAX_PARAMETERS_2026.taxRates.higher,
  },
];

function roundKoruna(value: number): number {
  return Math.round(value);
}

function roundTaxBase(value: number): number {
  return Math.floor(Math.max(0, value) / 100) * 100;
}

export function clampCzechAmount(value: number, limit: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), Math.max(0, limit));
}

export function calculateCzechChildCredit(numberOfChildren: number): number {
  const children = Math.max(0, Math.floor(numberOfChildren));
  let credit = 0;

  for (let child = 1; child <= children; child += 1) {
    if (child === 1) {
      credit += CZECH_TAX_PARAMETERS_2026.credits.childFirst;
    } else if (child === 2) {
      credit += CZECH_TAX_PARAMETERS_2026.credits.childSecond;
    } else {
      credit += CZECH_TAX_PARAMETERS_2026.credits.childThirdAndEachAdditional;
    }
  }

  return credit;
}

export function calculateCzechDeductibleCharitableDonations(
  grossIncome: number,
  requestedDonations: number,
): number {
  const donations = Math.max(0, requestedDonations || 0);
  const donationThreshold =
    grossIncome * CZECH_TAX_PARAMETERS_2026.deductions.charitableDonationMinRate;
  const meetsMinimum =
    donations >= CZECH_TAX_PARAMETERS_2026.deductions.charitableDonationMinAmount ||
    donations > donationThreshold;

  if (!meetsMinimum) {
    return 0;
  }

  return clampCzechAmount(
    donations,
    grossIncome *
      CZECH_TAX_PARAMETERS_2026.deductions.charitableDonationMaxRate,
  );
}

export function calculateCzechCompanyCarBenefit({
  entryPrice,
  emissionType,
  months,
}: {
  entryPrice: number;
  emissionType: keyof typeof CZECH_TAX_PARAMETERS_2026.benefits.companyCarRates;
  months: number;
}): number {
  const normalizedEntryPrice = Math.max(0, entryPrice || 0);
  const normalizedMonths = Math.min(Math.max(0, Math.floor(months || 0)), 12);

  if (normalizedEntryPrice <= 0 || normalizedMonths <= 0) {
    return 0;
  }

  const rate =
    CZECH_TAX_PARAMETERS_2026.benefits.companyCarRates[emissionType] ??
    CZECH_TAX_PARAMETERS_2026.benefits.companyCarRates.standard;
  const monthlyBenefit = Math.max(
    CZECH_TAX_PARAMETERS_2026.benefits.companyCarMinimumMonthlyBenefit,
    normalizedEntryPrice * rate,
  );

  return roundKoruna(monthlyBenefit * normalizedMonths);
}

export function calculateCzechTaxableIncome(
  grossIncome: number,
  retirementSavingsContribution: number,
  charitableDonations: number,
): {
  taxableIncomeBeforeRounding: number;
  taxableIncome: number;
} {
  const taxableIncomeBeforeRounding = Math.max(
    0,
    grossIncome - retirementSavingsContribution - charitableDonations,
  );

  return {
    taxableIncomeBeforeRounding,
    taxableIncome: roundTaxBase(taxableIncomeBeforeRounding),
  };
}

export function calculateCzechProgressiveIncomeTax(income: number): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const bracketTaxes = CZECH_INCOME_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );

    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0);

  return {
    totalTax: Math.ceil(
      bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0),
    ),
    bracketTaxes,
  };
}

export function calculateCzechSocialSecurity(grossIncome: number): {
  employee: number;
  employer: number;
  pensionEmployee: number;
  sicknessEmployee: number;
  assessmentBase: number;
} {
  const assessmentBase = Math.min(
    Math.max(0, grossIncome),
    CZECH_TAX_PARAMETERS_2026.socialSecurity.annualCeiling,
  );

  const pensionEmployee = roundKoruna(
    assessmentBase *
      CZECH_TAX_PARAMETERS_2026.socialSecurity.pensionEmployeeRate,
  );
  const sicknessEmployee = roundKoruna(
    assessmentBase *
      CZECH_TAX_PARAMETERS_2026.socialSecurity.sicknessEmployeeRate,
  );

  return {
    employee: pensionEmployee + sicknessEmployee,
    employer: roundKoruna(
      assessmentBase * CZECH_TAX_PARAMETERS_2026.socialSecurity.employerRate,
    ),
    pensionEmployee,
    sicknessEmployee,
    assessmentBase,
  };
}

export function calculateCzechHealthInsurance(grossIncome: number): {
  employee: number;
  employer: number;
  assessmentBase: number;
} {
  const assessmentBase = Math.max(0, grossIncome);

  return {
    employee: roundKoruna(
      assessmentBase * CZECH_TAX_PARAMETERS_2026.healthInsurance.employeeRate,
    ),
    employer: roundKoruna(
      assessmentBase * CZECH_TAX_PARAMETERS_2026.healthInsurance.employerRate,
    ),
    assessmentBase,
  };
}
