// ============================================================================
// CROATIA EMPLOYMENT INCOME TAX AND CONTRIBUTIONS (2026)
// ============================================================================
//
// Official sources:
// - Croatian Tax Administration 2026 local income-tax rates:
//   https://porezna-uprava.gov.hr/hr/porezne-stope-godisnjeg-poreza-na-dohodak/4764
// - Income Tax Act amendments, NN 152/2024: personal allowance, EUR 60,000
//   threshold, and local-rate bands:
//   https://narodne-novine.nn.hr/clanci/sluzbeni/2024_12_152_2505.html
// - 2026 contribution bases, NN 150/2025:
//   https://narodne-novine.nn.hr/clanci/sluzbeni/full/2025_12_150_2237.html
// - Contributions Act:
//   https://narodne-novine.nn.hr/clanci/sluzbeni/full/2008_07_84_2716.html
// - HZMO pension guide:
//   https://www.mirovinsko.hr/UserDocsImages/listalice/mirovine/2025/Mirovinski-vodic-za-gradjane/files/assets/common/downloads/publication.pdf
// - HZZO compulsory health insurance:
//   https://hzzo.hr/poslovni-subjekti/obvezno-zdravstveno-osiguranje
//
// Assumptions:
// - Models ordinary Croatian employment salary ("bruto 1") for a full tax year.
// - Employee pension contributions are deducted from gross salary before income
//   tax. Employer health insurance is informational and not deducted from
//   take-home pay.
// - Digital-nomad temporary stay is excluded. The MUP definition applies to
//   work for a foreign employer/company not registered in Croatia, which is not
//   ordinary Croatian payroll:
//   https://mup.gov.hr/aliens-281621/stay--work/temporary-stay-of-digital-nomads/286833
// - Employee-paid third-pillar savings are not modeled as a payroll income-tax
//   deduction. Employer-paid voluntary pension premiums and other benefits in
//   kind are outside the employee salary inputs used here.
// ============================================================================

import type { TaxBracket } from "../../types";

export const CROATIA_TAX_YEAR = 2026;

export const CROATIA_PERSONAL_ALLOWANCE_2026 = {
  monthlyBasic: 600,
  annualBasic: 7_200,
  dependentSpouseFactor: 0.7,
  childFactors: [0.5, 0.7, 1.0, 1.4, 1.9, 2.5, 3.2, 4.0, 4.9],
};

export const CROATIA_INCOME_TAX_2026 = {
  higherRateThreshold: 60_000,
  fallbackLowerRate: 0.2,
  fallbackHigherRate: 0.3,
};

export const CROATIA_CONTRIBUTIONS_2026 = {
  averageMonthlyGrossWage: 1_993,
  monthlyPensionBaseCeiling: 11_958,
  annualPensionBaseCeiling: 143_496,
  pensionFirstPillarRate: 0.15,
  pensionSecondPillarRate: 0.05,
  pensionFirstPillarOnlyRate: 0.2,
  employerHealthInsuranceRate: 0.165,
};

export const CROATIA_LOCAL_TAX_RATES_2026 = [
  {
    code: "zagreb",
    name: "Zagreb",
    lowerRate: 0.23,
    higherRate: 0.33,
    nnReference: "28/25",
  },
  {
    code: "split",
    name: "Split",
    lowerRate: 0.215,
    higherRate: 0.32,
    nnReference: "150/23, 35/25",
  },
  {
    code: "rijeka",
    name: "Rijeka",
    lowerRate: 0.2,
    higherRate: 0.25,
    nnReference: "149/25",
  },
  {
    code: "osijek",
    name: "Osijek",
    lowerRate: 0.2,
    higherRate: 0.3,
    nnReference: "114/23",
  },
  {
    code: "zadar",
    name: "Zadar",
    lowerRate: 0.2,
    higherRate: 0.3,
    nnReference: "114/23",
  },
  {
    code: "dubrovnik",
    name: "Dubrovnik",
    lowerRate: 0.2,
    higherRate: 0.3,
    nnReference: "114/23",
  },
  {
    code: "pula",
    name: "Pula - Pola",
    lowerRate: 0.22,
    higherRate: 0.32,
    nnReference: "154/23, 148/25",
  },
  {
    code: "default",
    name: "Default statutory fallback",
    lowerRate: CROATIA_INCOME_TAX_2026.fallbackLowerRate,
    higherRate: CROATIA_INCOME_TAX_2026.fallbackHigherRate,
    nnReference: "Income Tax Act fallback",
  },
] as const;

export type HRLocalityCode =
  (typeof CROATIA_LOCAL_TAX_RATES_2026)[number]["code"];

export function getCroatiaLocalTaxRate(locality: HRLocalityCode) {
  return (
    CROATIA_LOCAL_TAX_RATES_2026.find((region) => region.code === locality) ??
    CROATIA_LOCAL_TAX_RATES_2026[0]
  );
}

export function getCroatiaTaxBrackets2026(
  locality: HRLocalityCode,
): TaxBracket[] {
  const rates = getCroatiaLocalTaxRate(locality);

  return [
    {
      min: 0,
      max: CROATIA_INCOME_TAX_2026.higherRateThreshold,
      rate: rates.lowerRate,
    },
    {
      min: CROATIA_INCOME_TAX_2026.higherRateThreshold,
      max: Infinity,
      rate: rates.higherRate,
    },
  ];
}

export function calculateCroatiaDependentChildAllowance(
  numberOfChildren: number,
): number {
  const children = Math.max(0, Math.floor(numberOfChildren));
  const { monthlyBasic, childFactors } = CROATIA_PERSONAL_ALLOWANCE_2026;

  let total = 0;
  for (let index = 0; index < children; index += 1) {
    const factor =
      childFactors[index] ??
      childFactors[childFactors.length - 1] + (index - childFactors.length + 1);
    total += factor * monthlyBasic * 12;
  }

  return total;
}

export function calculateCroatiaIncomeTax(
  taxableIncome: number,
  locality: HRLocalityCode,
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const brackets = getCroatiaTaxBrackets2026(locality);
  const bracketTaxes = brackets
    .map((bracket) => {
      const taxableAmount = Math.max(
        0,
        Math.min(taxableIncome, bracket.max) - bracket.min,
      );

      return {
        ...bracket,
        tax: taxableAmount * bracket.rate,
      };
    })
    .filter((bracket) => bracket.tax > 0);
  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return {
    totalTax,
    bracketTaxes,
  };
}
