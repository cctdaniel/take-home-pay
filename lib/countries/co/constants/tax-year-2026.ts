import type { StandardCountryTaxConfig } from "../../shared/standard-country";

export const CO_TAX_YEAR = 2026;

export const CO_UVT = 52374;
export const CO_SMLMV = 1750905;
export const CO_SOCIAL_SECURITY_CAP = CO_SMLMV * 25 * 12;
export const CO_SOLIDARITY_THRESHOLD = CO_SMLMV * 4 * 12;
export const CO_EMPLOYMENT_EXEMPTION_CAP = CO_UVT * 790;
export const CO_GENERAL_DEDUCTION_CAP = CO_UVT * 1340;
export const CO_VOLUNTARY_PENSION_CAP = CO_UVT * 3800;
export const CO_GENERAL_DEDUCTION_RATE = 0.4;
export const CO_EMPLOYMENT_EXEMPTION_RATE = 0.25;
export const CO_VOLUNTARY_PENSION_RATE = 0.3;
export const CO_PREPAID_HEALTH_LIMIT = CO_UVT * 16 * 12;
export const CO_MORTGAGE_INTEREST_LIMIT = CO_UVT * 1200;
export const CO_ARTICLE_387_DEPENDENT_LIMIT = CO_UVT * 32 * 12;
export const CO_ARTICLE_336_DEPENDENT_DEDUCTION = CO_UVT * 72;
export const CO_ARTICLE_336_DEPENDENT_MAX = 4;
export const CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT = CO_UVT * 240;

export const CO_SOURCE_URLS = [
  "https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0238_2025.htm",
  "https://www.presidencia.gov.co/prensa/Paginas/Dian-definio-el-Calendario-Tributario-para-el-ano-2026-251226.aspx",
  "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?910=&i=6533",
  "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=227330",
  "https://www.suin-juriscol.gov.co/viewDocument.asp?id=30056106",
] as const;

function uvt(amount: number): number {
  return amount * CO_UVT;
}

function calculateSolidarityRate(grossSalary: number): number {
  const monthlyBase = Math.min(grossSalary / 12, CO_SMLMV * 25);

  if (monthlyBase < CO_SMLMV * 4) {
    return 0;
  }

  if (monthlyBase < CO_SMLMV * 16) {
    return 0.01;
  }

  if (monthlyBase < CO_SMLMV * 17) {
    return 0.012;
  }

  if (monthlyBase < CO_SMLMV * 18) {
    return 0.014;
  }

  if (monthlyBase < CO_SMLMV * 19) {
    return 0.016;
  }

  if (monthlyBase < CO_SMLMV * 20) {
    return 0.018;
  }

  return 0.02;
}

function calculateMandatorySocialContributions(grossSalary: number): number {
  const cappedBase = Math.min(grossSalary, CO_SOCIAL_SECURITY_CAP);
  return cappedBase * (0.08 + calculateSolidarityRate(grossSalary));
}

function calculateEmploymentExemption(grossSalary: number): number {
  const incomeAfterSocial = Math.max(
    0,
    grossSalary - calculateMandatorySocialContributions(grossSalary),
  );

  return Math.min(incomeAfterSocial * 0.25, CO_EMPLOYMENT_EXEMPTION_CAP);
}

function calculateVoluntaryPensionLimit(grossSalary: number): number {
  const incomeAfterSocial = Math.max(
    0,
    grossSalary - calculateMandatorySocialContributions(grossSalary),
  );
  const generalDeductionLimit = Math.min(
    incomeAfterSocial * 0.4,
    CO_GENERAL_DEDUCTION_CAP,
  );
  const remainingGeneralLimit = Math.max(
    0,
    generalDeductionLimit - calculateEmploymentExemption(grossSalary),
  );
  const individualPensionLimit = Math.min(
    grossSalary * 0.3,
    CO_VOLUNTARY_PENSION_CAP,
  );

  return Math.min(remainingGeneralLimit, individualPensionLimit);
}

export const CO_TAX_CONFIG = {
  code: "CO",
  currency: "COP",
  taxYear: CO_TAX_YEAR,
  defaultSalary: 180000000,
  incomeTaxName: "Individual income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "25% exempt employment income",
      rate: 0.25,
      cap: CO_EMPLOYMENT_EXEMPTION_CAP,
      base: "grossMinusPreTaxMandatoryContributions",
    },
  ],
  taxCredits: [],
  brackets: [
    { min: 0, max: uvt(1090), rate: 0 },
    { min: uvt(1090), max: uvt(1700), rate: 0.19 },
    { min: uvt(1700), max: uvt(4100), rate: 0.28 },
    { min: uvt(4100), max: uvt(8670), rate: 0.33 },
    { min: uvt(8670), max: uvt(18970), rate: 0.35 },
    { min: uvt(18970), max: uvt(31000), rate: 0.37 },
    { min: uvt(31000), max: Infinity, rate: 0.39 },
  ],
  socialContributions: [
    {
      name: "Employee pension contribution",
      rate: 0.04,
      cap: CO_SOCIAL_SECURITY_CAP,
      preTax: true,
    },
    {
      name: "Employee health contribution",
      rate: 0.04,
      cap: CO_SOCIAL_SECURITY_CAP,
      preTax: true,
    },
    {
      name: "Pension solidarity fund",
      rate: 0.01,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SOLIDARITY_THRESHOLD,
      preTax: true,
    },
    {
      name: "Additional solidarity pension contribution",
      rate: 0.002,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SMLMV * 16 * 12,
      preTax: true,
    },
    {
      name: "Second additional solidarity pension contribution",
      rate: 0.002,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SMLMV * 17 * 12,
      preTax: true,
    },
    {
      name: "Third additional solidarity pension contribution",
      rate: 0.002,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SMLMV * 18 * 12,
      preTax: true,
    },
    {
      name: "Fourth additional solidarity pension contribution",
      rate: 0.002,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SMLMV * 19 * 12,
      preTax: true,
    },
    {
      name: "Fifth additional solidarity pension contribution",
      rate: 0.002,
      cap: CO_SOCIAL_SECURITY_CAP,
      threshold: CO_SMLMV * 20 * 12,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary pension or AFC savings",
      calculateLimit: ({ grossSalary }) =>
        calculateVoluntaryPensionLimit(grossSalary),
      description:
        "Voluntary pension/AFC savings, limited by the 30% individual cap and the remaining 40%/1,340 UVT cédula general cap after the 25% employment exemption.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Colombian resident employment income uses the 2026 UVT value of COP 52,374 and the Article 241 resident tax scale.",
    "Employee pension, health, and pension solidarity contributions are capped at 25 monthly minimum salaries using the 2026 SMLMV.",
    "The 25% exempt employment income, Article 387 dependent deduction, prepaid health, mortgage interest, and voluntary pension/AFC benefits are modeled within the 40% / 1,340 UVT cédula general cap.",
    "The Article 336 extra dependent deduction and the 1% electronic-invoice deduction are modeled separately from the 40% / 1,340 UVT cap.",
  ],
  modeledExclusions: [
    "Payroll withholding procedure selection, non-labour cédula income, foreign tax credits, deduction carry-forward effects, and alternative minimum-tax edge cases are not modeled.",
  ],
  sourceUrls: [...CO_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"CO">;
