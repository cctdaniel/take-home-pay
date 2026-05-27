// ============================================================================
// GREECE EMPLOYMENT INCOME TAX AND SOCIAL INSURANCE (2026)
// ============================================================================
//
// Official tax source:
// Greek Ministry of Economy and Finance, Income Taxation tax guide:
// https://minfin.gov.gr/en/tax-policy/tax-guide/income-taxation/
// AADE / IAPR guide to tax incentives for new tax residents, Article 5C:
// https://www.aade.gr/sites/default/files/2025-11/forologika_kinitra_ENG.pdf
//
// Social insurance sources:
// Ministry of Labour insurance-contribution guide (all types of remuneration):
// https://ypergasias.gov.gr/en/social-security/insured-persons/insurance-contributions/
// e-EFKA Circular 38/2024 rates effective 1/1/2025:
// https://www.efka.gov.gr/sites/default/files/2024-12/%CE%95%CE%93%CE%9A.%2038_2024_%CE%9C%CE%95%CE%99%CE%A9%CE%A3%CE%97%20%CE%91%CE%A3%CE%A6.%20%CE%95%CE%99%CE%A3%CE%A6%CE%9F%CE%A1%CE%A9%CE%9D%20%CE%99%CE%94%CE%99%CE%A9%CE%A4.%20%CE%94%CE%99%CE%9A%CE%91%CE%99%CE%9F%CE%A5%202025%20%28971%CE%A546%CE%9C%CE%91%CE%A0%CE%A3-348%29.pdf
// OECD Taxing Wages 2026, Greece country note rate split:
// https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/greece_027f4efa.html
// PwC Greece summary for 2026 EFKA monthly ceiling:
// https://taxsummaries.pwc.com/greece/corporate/other-taxes
// KPMG/Mercer summaries of Law 5078/2023 occupational pension contribution cap:
// https://kpmg.com/xx/en/our-insights/gms-flash-alert/flash-alert-2024-042.html
// https://www.mercer.com/en-us/insights/law-and-policy/occupational-pension-plans-in-greece/
//
// Assumptions:
// - Models dependent employment income for ordinary white-collar employees.
// - Employee social insurance is deductible for income tax purposes.
// - 2025 e-EFKA salaried employee rates are used with the 2026 insurable
//   earnings ceiling because no later general salaried rate table was found.
// - The annual social insurance ceiling assumes the standard private-sector
//   14-payment salary schedule, including Christmas, Easter, and holiday
//   allowances.
// - Taxable benefits in kind can be entered as an annual payroll value after
//   exemptions/valuation rules. They increase employment-income and e-EFKA
//   remuneration bases but are not treated as cash salary.
// - Article 5C new-tax-resident relief is modeled as a selectable regime for
//   Greek-source employment income: 50% of eligible taxable employment income
//   is exempt from income tax for up to seven tax years. e-EFKA is still
//   calculated on full insured salary.
// - Special regimes for heavy/unhealthy work, lawyers/engineers, doctors,
//   pensioners who work, benefits-in-kind valuation worksheets, foreign
//   pension Article 5B, high-net-worth Article 5A, and separate solidarity
//   items are outside this salary calculator.
// ============================================================================

import type { TaxBracket } from "../../types";

export const GREECE_SOURCE_URLS = [
  "https://minfin.gov.gr/en/tax-policy/tax-guide/income-taxation/",
  "https://www.aade.gr/sites/default/files/2025-11/forologika_kinitra_ENG.pdf",
  "https://ypergasias.gov.gr/en/social-security/insured-persons/insurance-contributions/",
  "https://www.efka.gov.gr/sites/default/files/2024-12/%CE%95%CE%93%CE%9A.%2038_2024_%CE%9C%CE%95%CE%99%CE%A9%CE%A3%CE%97%20%CE%91%CE%A3%CE%A6.%20%CE%95%CE%99%CE%A3%CE%A6%CE%9F%CE%A1%CE%A9%CE%9D%20%CE%99%CE%94%CE%99%CE%A9%CE%A4.%20%CE%94%CE%99%CE%9A%CE%91%CE%99%CE%9F%CE%A5%202025%20%28971%CE%A546%CE%9C%CE%91%CE%A0%CE%A3-348%29.pdf",
  "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/greece_027f4efa.html",
] as const;

const GREECE_EMPLOYMENT_BANDS_2026 = [
  { min: 0, max: 10_000 },
  { min: 10_000, max: 20_000 },
  { min: 20_000, max: 30_000 },
  { min: 30_000, max: 40_000 },
  { min: 40_000, max: 60_000 },
  { min: 60_000, max: Infinity },
] as const;

export const GREECE_SOCIAL_INSURANCE_2026 = {
  employeeRate: 0.1337,
  employerRate: 0.2179,
  monthlyCeiling: 7_761.94,
  salaryInstallments: 14,
  annualCeiling: 7_761.94 * 14,
  mainPension: {
    employeeRate: 0.0667,
    employerRate: 0.1333,
  },
  supplementaryPension: {
    employeeRate: 0.03,
    employerRate: 0.03,
  },
  healthcare: {
    employeeRate: 0.0205,
    employerRate: 0.0405,
  },
  otherFunds: {
    employeeRate: 0.0165,
    employerRate: 0.0141,
  },
};

export const GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE = 0.2;

export const GREECE_ARTICLE_5C_NEW_RESIDENT_REGIME_2026 = {
  exemptionRate: 0.5,
  maxYears: 7,
};

function normalizeDependents(numberOfDependents: number): number {
  if (!Number.isFinite(numberOfDependents)) {
    return 0;
  }

  return Math.max(0, Math.floor(numberOfDependents));
}

function getBaseRatesForDependents(numberOfDependents: number): number[] {
  const dependents = normalizeDependents(numberOfDependents);

  if (dependents === 0) {
    return [0.09, 0.20, 0.26, 0.34, 0.39, 0.44];
  }

  if (dependents === 1) {
    return [0.09, 0.18, 0.24, 0.34, 0.39, 0.44];
  }

  if (dependents === 2) {
    return [0.09, 0.16, 0.22, 0.34, 0.39, 0.44];
  }

  if (dependents === 3) {
    return [0.09, 0.09, 0.20, 0.34, 0.39, 0.44];
  }

  return [
    0,
    0,
    Math.max(0, 0.18 - (dependents - 4) * 0.02),
    0.34,
    0.39,
    0.44,
  ];
}

/**
 * Return Greece's 2026 employment/pension tax scale after child and youth
 * adjustments. Age-based relief is applied only by callers that pass an
 * eligible resident taxpayer's actual age.
 */
export function getGreekEmploymentTaxBrackets2026(
  numberOfDependents: number,
  age: number,
): TaxBracket[] {
  const rates = getBaseRatesForDependents(numberOfDependents);

  if (age <= 25) {
    rates[0] = 0;
    rates[1] = 0;
  } else if (age <= 30 && rates[1] > 0) {
    rates[1] = Math.min(rates[1], 0.09);
  }

  return GREECE_EMPLOYMENT_BANDS_2026.map((band, index) => ({
    ...band,
    rate: rates[index],
  }));
}

export function getGreekEmploymentTaxReductionBase(
  numberOfDependents: number,
): number {
  const dependents = normalizeDependents(numberOfDependents);

  if (dependents === 0) return 777;
  if (dependents === 1) return 900;
  if (dependents === 2) return 1_120;
  if (dependents === 3) return 1_340;
  if (dependents === 4) return 1_580;

  return 1_780 + (dependents - 5) * 220;
}

export function calculateGreekEmploymentTaxReduction(
  taxableIncome: number,
  numberOfDependents: number,
  grossIncomeTax: number,
): {
  baseReduction: number;
  taper: number;
  availableReduction: number;
  appliedReduction: number;
} {
  const baseReduction = getGreekEmploymentTaxReductionBase(numberOfDependents);
  const taper =
    taxableIncome > 12_000 ? ((taxableIncome - 12_000) / 1_000) * 20 : 0;
  const availableReduction = Math.max(0, baseReduction - taper);
  const appliedReduction = Math.min(grossIncomeTax, availableReduction);

  return {
    baseReduction,
    taper,
    availableReduction,
    appliedReduction,
  };
}

export function calculateGreekProgressiveIncomeTax(
  income: number,
  brackets: TaxBracket[],
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const bracketTaxes = brackets
    .map((bracket) => {
      const taxableAmount = Math.max(
        0,
        Math.min(income, bracket.max) - bracket.min,
      );
      return {
        ...bracket,
        tax: taxableAmount * bracket.rate,
      };
    })
    .filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

export function calculateGreekSocialInsurance(grossIncome: number): {
  employeeTotal: number;
  employerTotal: number;
  insurableIncome: number;
  salaryInstallments: number;
  mainPensionEmployee: number;
  supplementaryPensionEmployee: number;
  healthcareEmployee: number;
  otherFundsEmployee: number;
} {
  const insurableIncome = Math.min(
    Math.max(0, grossIncome),
    GREECE_SOCIAL_INSURANCE_2026.annualCeiling,
  );

  const mainPensionEmployee =
    insurableIncome * GREECE_SOCIAL_INSURANCE_2026.mainPension.employeeRate;
  const supplementaryPensionEmployee =
    insurableIncome *
    GREECE_SOCIAL_INSURANCE_2026.supplementaryPension.employeeRate;
  const healthcareEmployee =
    insurableIncome * GREECE_SOCIAL_INSURANCE_2026.healthcare.employeeRate;
  const otherFundsEmployee =
    insurableIncome * GREECE_SOCIAL_INSURANCE_2026.otherFunds.employeeRate;

  const employeeTotal =
    mainPensionEmployee +
    supplementaryPensionEmployee +
    healthcareEmployee +
    otherFundsEmployee;
  const employerTotal =
    insurableIncome * GREECE_SOCIAL_INSURANCE_2026.employerRate;

  return {
    employeeTotal,
    employerTotal,
    insurableIncome,
    salaryInstallments: GREECE_SOCIAL_INSURANCE_2026.salaryInstallments,
    mainPensionEmployee,
    supplementaryPensionEmployee,
    healthcareEmployee,
    otherFundsEmployee,
  };
}
