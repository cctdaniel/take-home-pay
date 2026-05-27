import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { RSCalculatorInputs, RSNewlySettledRelief } from "../types";

export const RS_TAX_YEAR = 2026;

export const RS_SOURCE_URLS = [
  "https://www.purs.gov.rs/en.html",
  "https://purs.gov.rs/upload/media/2026/4/17/760713/Your_tax_official_-_Annual_personal_income_tax_april_26.pdf",
  "https://purs.gov.rs/upload/media/2025/11/24/760462/Law_on_personal_income_tax.pdf",
  "https://www.purs.gov.rs/lat/o-nama/pregled-propisa/zakoni/9461/zakon-o-doprinosima-za-obavezno-socijalno-osiguranje.html",
  "https://www.croso.gov.rs/lat/Statistika/Stope_doprinosa/",
  "https://purs.gov.rs/upload/media/2026/4/15/760703/Tax_bulletins_for_natural_persons_who_are_self_-_employed_-april_2026.pdf",
  "https://welcometoserbia.gov.rs/income-taxes",
  "https://taxsummaries.pwc.com/serbia/individual/other-taxes",
  "https://taxsummaries.pwc.com/serbia/individual/taxes-on-personal-income",
] as const;

const RS_MONTHS_PER_YEAR = 12;
const RS_NON_TAXABLE_SALARY_MONTHLY = 34221;
const RS_MINIMUM_CONTRIBUTION_BASE_MONTHLY = 51297;
const RS_MAXIMUM_CONTRIBUTION_BASE_MONTHLY = 732820;
export const RS_ANNUAL_PIT_RETURN_YEAR = 2025;
export const RS_AVERAGE_ANNUAL_SALARY_2025 = 1813032;
export const RS_ANNUAL_PIT_NON_TAXABLE_AMOUNT = 5439096;
export const RS_ANNUAL_PIT_HIGHER_RATE_THRESHOLD = 10878192;
export const RS_ANNUAL_PIT_TAXPAYER_DEDUCTION = 725213;
export const RS_ANNUAL_PIT_DEPENDENT_DEDUCTION = 271955;
export const RS_ANNUAL_PIT_PERSONAL_DEDUCTION_CAP_RATE = 0.5;
export const RS_ANNUAL_PIT_LOW_RATE = 0.1;
export const RS_ANNUAL_PIT_HIGH_RATE = 0.15;
export const RS_ANNUAL_PIT_AIF_CREDIT_RATE = 0.5;
export const RS_ANNUAL_PIT_AIF_CREDIT_TAX_CAP_RATE = 0.5;
export const RS_NEWLY_SETTLED_BASE_REDUCTION_RATE = 0.7;
export const RS_NEWLY_SETTLED_TAXABLE_BASE_RATE =
  1 - RS_NEWLY_SETTLED_BASE_REDUCTION_RATE;
export const RS_NEWLY_SETTLED_PRIOR_NONRESIDENT_MONTHLY_THRESHOLD_2026 =
  439692;
export const RS_NEWLY_SETTLED_UNDER40_EDUCATION_MONTHLY_THRESHOLD_2026 =
  293128;

function asRSInputs(inputs?: unknown): Partial<RSCalculatorInputs> {
  return (inputs ?? {}) as Partial<RSCalculatorInputs>;
}

function getNewlySettledReliefThreshold(
  relief: RSNewlySettledRelief | undefined,
): number | null {
  switch (relief) {
    case "prior_nonresident":
      return RS_NEWLY_SETTLED_PRIOR_NONRESIDENT_MONTHLY_THRESHOLD_2026;
    case "under40_education":
      return RS_NEWLY_SETTLED_UNDER40_EDUCATION_MONTHLY_THRESHOLD_2026;
    default:
      return null;
  }
}

export function getSerbiaNewlySettledReliefThreshold(
  inputs?: Partial<RSCalculatorInputs>,
): number | null {
  return getNewlySettledReliefThreshold(inputs?.newlySettledRelief);
}

export function isSerbiaNewlySettledReliefApplicable(
  inputs?: unknown,
): boolean {
  const rsInputs = asRSInputs(inputs);
  const threshold = getSerbiaNewlySettledReliefThreshold(rsInputs);

  if (threshold === null) {
    return false;
  }

  const monthlyCashSalary = Math.max(0, rsInputs.grossSalary ?? 0) / 12;

  return monthlyCashSalary > threshold;
}

function calculateSerbiaNewlySettledTaxBaseReduction(
  grossSalary: number,
  inputs?: unknown,
): number {
  if (!isSerbiaNewlySettledReliefApplicable(inputs)) {
    return 0;
  }

  return (
    Math.max(
      0,
      grossSalary - RS_NON_TAXABLE_SALARY_MONTHLY * RS_MONTHS_PER_YEAR,
    ) * RS_NEWLY_SETTLED_BASE_REDUCTION_RATE
  );
}

function calculateSerbiaContribution(
  grossSalary: number,
  rate: number,
  inputs?: unknown,
): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const ordinaryContributionBase = Math.min(
    Math.max(
      grossSalary,
      RS_MINIMUM_CONTRIBUTION_BASE_MONTHLY * RS_MONTHS_PER_YEAR,
    ),
    RS_MAXIMUM_CONTRIBUTION_BASE_MONTHLY * RS_MONTHS_PER_YEAR,
  );
  const reducedContributionBase = isSerbiaNewlySettledReliefApplicable(inputs)
    ? ordinaryContributionBase * RS_NEWLY_SETTLED_TAXABLE_BASE_RATE
    : ordinaryContributionBase;

  return reducedContributionBase * rate;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateProgressiveAnnualPersonalIncomeTax(taxBase: number): number {
  const lowBandTax =
    Math.min(taxBase, RS_ANNUAL_PIT_HIGHER_RATE_THRESHOLD) *
    RS_ANNUAL_PIT_LOW_RATE;
  const highBandTax =
    Math.max(0, taxBase - RS_ANNUAL_PIT_HIGHER_RATE_THRESHOLD) *
    RS_ANNUAL_PIT_HIGH_RATE;

  return lowBandTax + highBandTax;
}

export function calculateSerbiaAnnualPersonalIncomeTaxDetails({
  grossSalary,
  salaryTax,
  employeeContributions,
  inputs,
}: {
  grossSalary: number;
  salaryTax: number;
  employeeContributions: number;
  inputs?: unknown;
}) {
  const rsInputs = asRSInputs(inputs);

  if (rsInputs.includeAnnualPersonalIncomeTax !== true) {
    return {
      netAnnualEmploymentIncome: 0,
      under40Reduction: 0,
      annualPitThreshold: RS_ANNUAL_PIT_NON_TAXABLE_AMOUNT,
      incomeForAnnualTax: 0,
      taxpayerDeduction: 0,
      dependentDeduction: 0,
      personalDeductions: 0,
      annualTaxBase: 0,
      annualTaxBeforeCredit: 0,
      alternativeInvestmentFundInvestment: 0,
      alternativeInvestmentFundCredit: 0,
      annualTax: 0,
    };
  }

  const netAnnualEmploymentIncome = roundCurrency(Math.max(
    0,
    grossSalary - salaryTax - employeeContributions,
  ));
  const under40Reduction =
    (rsInputs.age ?? 40) < 40
      ? roundCurrency(
          Math.min(netAnnualEmploymentIncome, RS_ANNUAL_PIT_NON_TAXABLE_AMOUNT),
        )
      : 0;
  const incomeForAnnualTax = roundCurrency(Math.max(
    0,
    netAnnualEmploymentIncome -
      under40Reduction -
      RS_ANNUAL_PIT_NON_TAXABLE_AMOUNT,
  ));
  const dependentDeduction = roundCurrency(
    Math.max(0, Math.floor(rsInputs.numberOfDependents ?? 0)) *
      RS_ANNUAL_PIT_DEPENDENT_DEDUCTION,
  );
  const taxpayerDeduction =
    incomeForAnnualTax > 0 ? RS_ANNUAL_PIT_TAXPAYER_DEDUCTION : 0;
  const personalDeductions = roundCurrency(Math.min(
    incomeForAnnualTax * RS_ANNUAL_PIT_PERSONAL_DEDUCTION_CAP_RATE,
    taxpayerDeduction + dependentDeduction,
  ));
  const annualTaxBase = roundCurrency(
    Math.max(0, incomeForAnnualTax - personalDeductions),
  );
  const annualTaxBeforeCredit = roundCurrency(
    calculateProgressiveAnnualPersonalIncomeTax(annualTaxBase),
  );
  const alternativeInvestmentFundInvestment = roundCurrency(Math.max(
    0,
    rsInputs.contributions?.qualifyingExpenses ?? 0,
  ));
  const alternativeInvestmentFundCredit = roundCurrency(Math.min(
    annualTaxBeforeCredit * RS_ANNUAL_PIT_AIF_CREDIT_TAX_CAP_RATE,
    alternativeInvestmentFundInvestment * RS_ANNUAL_PIT_AIF_CREDIT_RATE,
  ));

  return {
    netAnnualEmploymentIncome,
    under40Reduction,
    annualPitThreshold: RS_ANNUAL_PIT_NON_TAXABLE_AMOUNT,
    incomeForAnnualTax,
    taxpayerDeduction,
    dependentDeduction,
    personalDeductions,
    annualTaxBase,
    annualTaxBeforeCredit,
    alternativeInvestmentFundInvestment,
    alternativeInvestmentFundCredit,
    annualTax: roundCurrency(
      Math.max(0, annualTaxBeforeCredit - alternativeInvestmentFundCredit),
    ),
  };
}

export function calculateSerbiaAnnualPersonalIncomeTax({
  grossSalary,
  salaryTax,
  employeeContributions,
  inputs,
}: {
  grossSalary: number;
  salaryTax: number;
  employeeContributions: number;
  inputs?: unknown;
}): number {
  return calculateSerbiaAnnualPersonalIncomeTaxDetails({
    grossSalary,
    salaryTax,
    employeeContributions,
    inputs,
  }).annualTax;
}

export const RS_TAX_CONFIG = {
  code: "RS",
  currency: "RSD",
  taxYear: RS_TAX_YEAR,
  defaultSalary: 3600000,
  incomeTaxName: "Salary tax",
  personalAllowance: RS_NON_TAXABLE_SALARY_MONTHLY * RS_MONTHS_PER_YEAR,
  deductions: [
    {
      name: "Newly settled taxpayer 70% salary-tax base reduction",
      calculateAmount: ({ grossSalary, inputs }) =>
        calculateSerbiaNewlySettledTaxBaseReduction(grossSalary, inputs),
    },
  ],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0.1 }],
  socialContributions: [
    {
      name: "Pension and disability insurance employee contribution",
      rate: 0.14,
      calculateAmount: ({ grossSalary, inputs }) =>
        calculateSerbiaContribution(grossSalary, 0.14, inputs),
      preTax: false,
    },
    {
      name: "Health insurance employee contribution",
      rate: 0.0515,
      calculateAmount: ({ grossSalary, inputs }) =>
        calculateSerbiaContribution(grossSalary, 0.0515, inputs),
      preTax: false,
    },
    {
      name: "Unemployment insurance employee contribution",
      rate: 0.0075,
      calculateAmount: ({ grossSalary, inputs }) =>
        calculateSerbiaContribution(grossSalary, 0.0075, inputs),
      preTax: false,
    },
  ],
  postTaxSocialContributions: [
    {
      name: "Supplementary annual PIT after selected AIF credit",
      calculateAmount: ({
        grossSalary,
        incomeTax,
        priorContributions,
        inputs,
      }) =>
        calculateSerbiaAnnualPersonalIncomeTax({
          grossSalary,
          salaryTax: incomeTax,
          employeeContributions: priorContributions.reduce(
            (sum, contribution) => sum + contribution.amount,
            0,
          ),
          inputs,
        }),
    },
  ],
  voluntaryContributions: [],
  assumptions: [
    "Serbia salary tax is modeled at the flat 10% rate after the 2026 non-taxable salary amount of RSD 34,221 per month.",
    "Employee social contributions are modeled at 14% pension/disability, 5.15% health, and 0.75% unemployment.",
    "Social contributions use the 2026 contribution base limits: RSD 51,297 minimum and RSD 732,820 maximum per month.",
    "Employee social contributions are treated as payroll cash deductions and do not reduce the salary-tax base.",
    "Taxable fringe benefits and salary-like benefits can be entered as annual non-cash values; they increase the salary-tax, employee social-contribution, and salary-only annual PIT bases but are not treated as cash salary.",
    "The newly settled taxpayer option applies Serbia's 70% salary-tax and compulsory-social-security base reduction only when the selected category's 2026 monthly cash salary threshold is exceeded.",
    "When enabled, the supplementary annual personal income tax estimate uses the official 2025 annual-return parameters published for the 2026 filing season and applies them to salary income only.",
    "The annual tax estimate models the under-40 reduction, taxpayer and dependent personal deductions, and the alternative-investment-fund tax credit.",
  ],
  modeledExclusions: [
    "Employer-side social contributions, other annual personal income categories, foreign tax credits, contribution-refund adjustments, founder/startup and other employer-side hiring incentives, taxable fringe-benefit valuation worksheets, and self-employment/freelance regimes are excluded.",
    "Employer-paid voluntary health insurance and voluntary pension fund reliefs are not modeled as employee-controlled salary inputs because the available sources describe them as employer payroll benefits rather than a general employee salary tax deduction.",
  ],
  sourceUrls: [...RS_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"RS">;
