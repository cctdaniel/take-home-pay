export const IT_TAX_YEAR = 2026;

export const IT_SOURCE_URLS = {
  source1:
    "https://taxsummaries.pwc.com/italy/individual/taxes-on-personal-income",
  source2:
    "https://www.agenziaentrate.gov.it/portale/web/english/nse/individuals/taxation-and-taxpayer-compliance",
  familyCredits:
    "https://def.giustiziatributaria.gov.it/DocTribFrontend/getAttoNormativoDetail.do?ACTION=getArticolo&articolo=Articolo+12&codiceOrdinamento=0000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&id=%7B31D694E8-4398-4030-873B-FEAF5A6647F9%7D",
  employmentCredit:
    "https://def.giustiziatributaria.gov.it/DocTribFrontend/getAttoNormativoDetail.do?ACTION=getArticolo&articolo=Articolo+13&codiceOrdinamento=0000000000000130000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&id=%7B31D694E8-4398-4030-873B-FEAF5A6647F9%7D",
  supplementaryPension:
    "https://infoprecompilata.agenziaentrate.gov.it/portale/documents/10180/208302/730_2024_istruzioni.pdf",
  impatriateRegime:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2023-12-27;209~art5=",
  employmentIncomeArticle51:
    "https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Alegge%3A1986%3B917~art51=",
  fringeBenefits:
    "https://aci.gov.it/servizio/fringe-benefit/fringe-benefit-riferimenti-normativi/",
} as const;

export const IT_LOCAL_ADD_ON_RATE_LIMITS_2026 = {
  defaultRate: 0.02,
  minRate: 0,
  maxRate: 0.05,
} as const;

export const IT_FAMILY_CREDIT_LIMITS_2026 = {
  spouseLowIncomeLimit: 15_000,
  spouseMiddleIncomeLimit: 40_000,
  spousePhaseoutLimit: 80_000,
  spouseLowBaseCredit: 800,
  spouseLowReduction: 110,
  spouseMiddleCredit: 690,
  childCredit: 950,
  childIncomeLimit: 95_000,
  childAdditionalLimitPerChildAfterFirst: 15_000,
  ascendantCredit: 750,
  ascendantIncomeLimit: 80_000,
  dependentIncomeLimit: 2_840.51,
  childUnder25IncomeLimit: 4_000,
  spouseSupplements: [
    { minExclusive: 29_000, maxInclusive: 29_200, amount: 10 },
    { minExclusive: 29_200, maxInclusive: 34_700, amount: 20 },
    { minExclusive: 34_700, maxInclusive: 35_000, amount: 30 },
    { minExclusive: 35_000, maxInclusive: 35_100, amount: 20 },
    { minExclusive: 35_100, maxInclusive: 35_200, amount: 10 },
  ],
} as const;

export const IT_IMPATRIATE_REGIME_2026 = {
  eligibleIncomeCap: 600_000,
  standardTaxableShare: 0.5,
  minorChildTaxableShare: 0.4,
} as const;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function truncateRatio(value: number): number {
  return Math.trunc(value * 10_000) / 10_000;
}

function clampCount(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), max);
}

export function calculateItalyDependentSpouseCredit(
  incomeForCredits: number,
): number {
  const income = Math.max(0, incomeForCredits);
  const limits = IT_FAMILY_CREDIT_LIMITS_2026;

  if (income <= 0 || income > limits.spousePhaseoutLimit) {
    return 0;
  }

  if (income <= limits.spouseLowIncomeLimit) {
    const ratio = truncateRatio(income / limits.spouseLowIncomeLimit);
    if (ratio === 0) return 0;
    if (ratio === 1) return limits.spouseMiddleCredit;
    return roundCurrency(
      limits.spouseLowBaseCredit - limits.spouseLowReduction * ratio,
    );
  }

  if (income <= limits.spouseMiddleIncomeLimit) {
    const supplement =
      limits.spouseSupplements.find(
        (band) =>
          income > band.minExclusive && income <= band.maxInclusive,
      )?.amount ?? 0;
    return limits.spouseMiddleCredit + supplement;
  }

  const ratio = truncateRatio(
    (limits.spousePhaseoutLimit - income) /
      (limits.spousePhaseoutLimit - limits.spouseMiddleIncomeLimit),
  );
  return ratio > 0
    ? roundCurrency(limits.spouseMiddleCredit * ratio)
    : 0;
}

export function calculateItalyEligibleChildCredit(
  incomeForCredits: number,
  eligibleChildren: number,
  creditShare: number,
): number {
  const income = Math.max(0, incomeForCredits);
  const children = clampCount(eligibleChildren, 20);
  if (children <= 0 || creditShare <= 0) return 0;

  const limits = IT_FAMILY_CREDIT_LIMITS_2026;
  const incomeLimit =
    limits.childIncomeLimit +
    Math.max(0, children - 1) * limits.childAdditionalLimitPerChildAfterFirst;
  const ratio = truncateRatio((incomeLimit - income) / incomeLimit);

  if (ratio <= 0 || ratio >= 1) {
    return 0;
  }

  return roundCurrency(
    limits.childCredit * children * ratio * Math.min(creditShare, 1),
  );
}

export function calculateItalyAscendantCredit(
  incomeForCredits: number,
  cohabitingAscendants: number,
  creditSharePercent: number,
): number {
  const income = Math.max(0, incomeForCredits);
  const ascendants = clampCount(cohabitingAscendants, 20);
  const share = Math.min(Math.max(creditSharePercent, 0), 100) / 100;
  if (ascendants <= 0 || share <= 0) return 0;

  const limits = IT_FAMILY_CREDIT_LIMITS_2026;
  const ratio = truncateRatio(
    (limits.ascendantIncomeLimit - income) / limits.ascendantIncomeLimit,
  );

  if (ratio <= 0 || ratio >= 1) {
    return 0;
  }

  return roundCurrency(limits.ascendantCredit * ascendants * ratio * share);
}

export const IT_TAX_CONFIG = {
  code: "IT",
  currency: "EUR",
  taxYear: IT_TAX_YEAR,
  defaultSalary: 42000,
  standardDeduction: 0,
  employeeSocialRate: 0.0919,
  employeeSocialName: "Employee INPS social security (approx.)",
  deductEmployeeSocialBeforeIncomeTax: true,
  pensionDeductionLimit: 5_164.57,
  additionalFlatIncomeTaxName: "Regional/municipal add-ons",
  additionalFlatIncomeTaxRate: IT_LOCAL_ADD_ON_RATE_LIMITS_2026.defaultRate,
  localAddOnRateLimits: IT_LOCAL_ADD_ON_RATE_LIMITS_2026,
  taxCredit: (_grossSalary: number, taxableIncome: number) =>
    taxableIncome <= 15_000
      ? 1_955
      : taxableIncome <= 28_000
        ? Math.max(0, 1_910 + 1_190 * ((28_000 - taxableIncome) / 13_000))
        : taxableIncome <= 50_000
          ? Math.max(0, 1_910 * ((50_000 - taxableIncome) / 22_000))
          : 0,
  brackets: [
    { min: 0, max: 28_000, rate: 0.23 },
    { min: 28_000, max: 50_000, rate: 0.35 },
    { min: 50_000, max: Infinity, rate: 0.43 },
  ],
  assumptions: [
    "Models an ordinary full-year resident employee under the national IRPEF brackets.",
    "Employee INPS contributions reduce both taxable income and take-home pay in this model.",
    "Optional supplementary pension contributions are modeled as deductible from taxable income up to the modeled annual limit and as cash deductions from take-home pay.",
    "Taxable fringe benefit values can be entered after Article 51 exemptions and valuation rules; they increase the IRPEF and employee INPS bases but are not treated as cash salary.",
    "The post-2024 impatriate-worker regime is modeled when selected, with the 50% taxable-income share or 40% taxable-income share for the modeled minor-child case on eligible employment income up to the statutory cap.",
    "Article 12 family credits are modeled for a dependent spouse, eligible children age 21-29 or disabled age 30+, and cohabiting ascendants, using annual full-year assumptions.",
    "Regional and municipal addizionale are modeled through the user-entered local add-on rate, defaulting to the average proxy shown on the page.",
    "Bonus/exoneration programs, severance pay, fringe benefit valuation and exemption worksheets, older transitional impatriate regimes, treaty positions, and employer-only costs require taxpayer-specific payroll, benefit, or legal facts before they can be modeled accurately.",
  ],
  sourceUrls: Object.values(IT_SOURCE_URLS),
};
