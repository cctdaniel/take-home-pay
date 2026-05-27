import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  LTCalculatorInputs,
  LTDisabilityNpdType,
  LTSecondPillarRate,
} from "../types";

export const LT_TAX_YEAR = 2026;
export const LT_NPD_ANNUAL_AMOUNT = 8964;
export const LT_NPD_PHASEOUT_START = 13836;
export const LT_NPD_PHASEOUT_RATE = 0.49;
export const LT_DISABILITY_NPD_MONTHLY_0_25 = 1127;
export const LT_DISABILITY_NPD_MONTHLY_30_55 = 1057;
export const LT_PIT_FIRST_THRESHOLD = 83237.4;
export const LT_PIT_SECOND_THRESHOLD = 138729;
export const LT_STATE_SOCIAL_INSURANCE_RATE = 0.1252;
export const LT_COMPULSORY_HEALTH_INSURANCE_RATE = 0.0698;
export const LT_ARTICLE_21_PENSION_LIFE_ABSOLUTE_CAP = 1500;
export const LT_ARTICLE_21_TOTAL_EXPENSE_CAP_RATE = 0.25;
export const LT_PERSONAL_INCOME_TAX_LAW_2026_SOURCE_URL =
  "https://www.vmi.lt/evmi/documents/20142/390999/GPM%C4%AE%2Bangl%C5%B3%2Bkalba%2B2026-01-01-2026-12-31.pdf/648a3aaa-6e7f-27d8-7aec-73f091a2a12f?t=1770030676856";

export const LT_SOURCE_URLS = [
  LT_PERSONAL_INCOME_TAX_LAW_2026_SOURCE_URL,
  "https://www.vmi.lt/evmi/5725",
  "https://www.vmi.lt/evmi/npd-pnpd-taikymas-20-str.-1",
  "https://www.vmi.lt/evmi/pajam%C5%B3-deklaravimas1",
  "https://sodra.lt/nuo-2026-m-sausio-1-d-taikomi-sodros-imoku-tarifai-turintiems-samdomu-darbuotoju?lang=uk",
  "https://sodra.lt/pranesimas-del-pensiju-kaupimo-imoku-mokejimo-atnaujinimo-anglu-kalba",
  "https://taxsummaries.pwc.com/lithuania/individual/deductions",
] as const;

export function getLTSecondPillarRateValue(rate: LTSecondPillarRate): number {
  return Number(rate) / 100;
}

function asLTInputs(inputs?: unknown): Partial<LTCalculatorInputs> {
  return (inputs ?? {}) as Partial<LTCalculatorInputs>;
}

function clampAmount(value: number, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), Math.max(0, max));
}

function getLTDisabilityNpdAnnualAmount(type?: LTDisabilityNpdType): number {
  switch (type) {
    case "participation_0_25":
      return LT_DISABILITY_NPD_MONTHLY_0_25 * 12;
    case "participation_30_55":
      return LT_DISABILITY_NPD_MONTHLY_30_55 * 12;
    default:
      return 0;
  }
}

function calculateLTNpd({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const disabilityNpd = getLTDisabilityNpdAnnualAmount(
    asLTInputs(inputs).disabilityNpdType,
  );

  if (disabilityNpd > 0) {
    return disabilityNpd;
  }

  return Math.max(
    0,
    LT_NPD_ANNUAL_AMOUNT -
      Math.max(0, grossSalary - LT_NPD_PHASEOUT_START) *
        LT_NPD_PHASEOUT_RATE,
  );
}

function getLTArticle21Base({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return Math.max(0, grossSalary - calculateLTNpd({ grossSalary, inputs }));
}

function getLTArticle21TotalLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return getLTArticle21Base({ grossSalary, inputs }) *
    LT_ARTICLE_21_TOTAL_EXPENSE_CAP_RATE;
}

function getLTPensionLifeBaseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return Math.min(
    LT_ARTICLE_21_PENSION_LIFE_ABSOLUTE_CAP,
    getLTArticle21TotalLimit({ grossSalary, inputs }),
  );
}

function getLTRetirementDeductionAmount({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return clampAmount(
    asLTInputs(inputs).contributions?.retirementContribution ?? 0,
    getLTPensionLifeBaseLimit({ grossSalary, inputs }),
  );
}

function getLTInsuranceLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const retirementDeduction = getLTRetirementDeductionAmount({
    grossSalary,
    inputs,
  });

  return Math.min(
    LT_ARTICLE_21_PENSION_LIFE_ABSOLUTE_CAP - retirementDeduction,
    getLTArticle21TotalLimit({ grossSalary, inputs }) - retirementDeduction,
  );
}

function getLTInsuranceDeductionAmount({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return clampAmount(
    asLTInputs(inputs).contributions?.insurancePremiums ?? 0,
    getLTInsuranceLimit({ grossSalary, inputs }),
  );
}

function getLTEducationExpenseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const retirementDeduction = getLTRetirementDeductionAmount({
    grossSalary,
    inputs,
  });
  const insuranceDeduction = getLTInsuranceDeductionAmount({
    grossSalary,
    inputs,
  });

  return (
    getLTArticle21TotalLimit({ grossSalary, inputs }) -
    retirementDeduction -
    insuranceDeduction
  );
}

export const LT_TAX_CONFIG = {
  code: "LT",
  currency: "EUR",
  taxYear: LT_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Annual non-taxable income amount (NPD)",
      calculateAmount: calculateLTNpd,
    },
  ],
  taxCredits: [],
  brackets: [{ min: 0, max: LT_PIT_FIRST_THRESHOLD, rate: 0.2 }, { min: LT_PIT_FIRST_THRESHOLD, max: LT_PIT_SECOND_THRESHOLD, rate: 0.25 }, { min: LT_PIT_SECOND_THRESHOLD, max: Infinity, rate: 0.32 }],
  resolveSocialContributions: ({ inputs }) => [
    {
      name: "Employee state social insurance",
      rate: LT_STATE_SOCIAL_INSURANCE_RATE,
      cap: LT_PIT_SECOND_THRESHOLD,
      preTax: false,
    },
    {
      name: "Compulsory health insurance",
      rate: LT_COMPULSORY_HEALTH_INSURANCE_RATE,
      preTax: false,
    },
    {
      name: "Second pillar pension accumulation",
      rate: getLTSecondPillarRateValue(asLTInputs(inputs).secondPillarRate ?? "0"),
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Additional pension contribution above 3%",
      calculateLimit: getLTPensionLifeBaseLimit,
      description:
        "Article 21 deduction for additional accumulative pension contributions above the 3% second-pillar rate. Pension and life/III-pillar deductions share a EUR 1,500 annual cap and the 25% taxable-income cap.",
      taxTreatment: "deduction",
    },
    {
      key: "insurancePremiums",
      name: "Grandfathered life / III-pillar premiums",
      calculateLimit: getLTInsuranceLimit,
      description:
        "Life insurance and ordinary pension-fund contributions are modeled only for contracts concluded by 31 December 2024, sharing the EUR 1,500 pension/life cap after additional pension contributions.",
      taxTreatment: "deduction",
    },
    {
      key: "educationExpenses",
      name: "Vocational, higher-education, or study-loan payments",
      calculateLimit: getLTEducationExpenseLimit,
      description:
        "Article 21 education and formal vocational-training expenses are deductible on the annual return within the remaining 25% taxable-income cap.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: ["Lithuania is modeled with the 2026 VMI employment PIT brackets: 20% up to 36 VDU (EUR 83,237.40), 25% from 36 to 60 VDU, and 32% above 60 VDU (EUR 138,729).", "The ordinary annual NPD is modeled at EUR 8,964, phased out at 49% of income above EUR 13,836.", "When selected, the disability or participation-level NPD replaces the ordinary formula with a fixed annualized amount: EUR 13,524 for 0-25% participation or severe disability, or EUR 12,684 for 30-55% participation or mild/moderate disability.", "Employee social insurance is split into capped state social insurance, uncapped compulsory health insurance, and optional selected second-pillar pension accumulation.", "Article 21 annual-return deductions are modeled for additional pension contributions, grandfathered life/III-pillar premiums, and qualifying vocational or higher-education payments.", "The Article 21 25% cap is applied to modeled employment taxable income after NPD in this salary-only calculator; pension/life items are additionally capped at EUR 1,500 combined."],
  modeledExclusions: ["Family-member transfers of unused study relief, employer-paid benefit exemption tests, non-salary income aggregation, treaty positions, and non-resident annual-return adjustments are not modeled."],
  sourceUrls: [...LT_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"LT">;
