import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  LKCalculatorInputs,
  LKTerminalBenefitTreatment,
} from "../types";

export const LK_TAX_YEAR = 2026;
export const LK_PERSONAL_RELIEF = 1800000;
export const LK_EPF_EMPLOYEE_RATE = 0.08;
export const LK_EPF_EMPLOYER_RATE = 0.12;
export const LK_ETF_EMPLOYER_RATE = 0.03;
export const LK_SOLAR_PANEL_RELIEF_LIMIT = 600000;
export const LK_APPROVED_CHARITY_DONATION_LIMIT = 75000;
export const LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_THRESHOLD = 5000000;
export const LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_RATE = 0.12;
export const LK_TABLE_03_OTHER_TERMINAL_BENEFIT_RATE = 0.36;

export const LK_SOURCE_URLS = [
  "https://www.ird.gov.lk/en/publications/SitePages/tax_chart_2526.aspx?menuid=1401",
  "https://www.ird.gov.lk/en/type%20of%20taxes/sitepages/income%20tax.aspx?menuid=1201",
  "https://www.ird.gov.lk/en/publications/sitepages/apit_tax_tables.aspx?menuid=1503",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%201/02.%20APIT_2526_Table_01_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%202/03.%20APIT_2526_Table_02_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%203/04.%20APIT_2526_Table_03_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%204/05.%20APIT_2526_Table_04_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%207/08.%20APIT_2526_Table_07_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%208/09.%20APIT_2526_Table_08_Text.pdf",
  "https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Non%20Cash%20Benefits/SEC_2022_E_05%28Rev%29.pdf",
  "https://www.ird.gov.lk/ta/Downloads/IT_SET_Doc/SET_25_26_Detail_Guide_E.pdf",
  "https://labourdept.gov.lk/epf-division-new/",
  "https://epf.lk/?page_id=811",
  "https://etfb.lk/about-etf-board/",
] as const;

const LK_STANDARD_BRACKETS = [
  { min: 0, max: 1000000, rate: 0.06 },
  { min: 1000000, max: 1500000, rate: 0.18 },
  { min: 1500000, max: 2000000, rate: 0.24 },
  { min: 2000000, max: 2500000, rate: 0.3 },
  { min: 2500000, max: Infinity, rate: 0.36 },
] as const;

const LK_FOREIGN_EMPLOYER_BRACKETS = [
  { min: 0, max: LK_PERSONAL_RELIEF, rate: 0 },
  { min: LK_PERSONAL_RELIEF, max: 2800000, rate: 0.06 },
  { min: 2800000, max: Infinity, rate: 0.15 },
] as const;

function asLKInputs(inputs?: unknown): Partial<LKCalculatorInputs> {
  return (inputs ?? {}) as Partial<LKCalculatorInputs>;
}

function isResidentReliefEligible(inputs?: unknown): boolean {
  const employmentType = asLKInputs(inputs).employmentType;
  return (
    employmentType !== "nonResidentNonCitizen" &&
    employmentType !== "secondary"
  );
}

function getModeledPersonalRelief(inputs?: unknown): number {
  const employmentType = asLKInputs(inputs).employmentType ?? "primary";

  if (employmentType === "primary") {
    return LK_PERSONAL_RELIEF;
  }

  return 0;
}

export function calculateLKSecondaryEmploymentRate({
  primaryMonthlyRemuneration,
  secondaryAnnualRemuneration,
}: {
  primaryMonthlyRemuneration: number;
  secondaryAnnualRemuneration: number;
}) {
  const primaryMonthly = Math.max(0, primaryMonthlyRemuneration);
  const secondaryMonthly = Math.max(0, secondaryAnnualRemuneration) / 12;
  const aggregateMonthly = primaryMonthly + secondaryMonthly;

  if (aggregateMonthly <= 150000) {
    return 0;
  }

  if (aggregateMonthly <= 233333) {
    return 0.06;
  }

  if (primaryMonthly <= 150000) {
    return 0.06;
  }

  if (primaryMonthly <= 233333) {
    return 0.18;
  }

  if (primaryMonthly <= 275000) {
    return 0.24;
  }

  if (primaryMonthly <= 316666) {
    return 0.3;
  }

  return 0.36;
}

export function calculateLKTerminalBenefitsTax({
  taxableTerminalBenefits,
  treatment,
  taxableEmploymentIncomeToDate,
}: {
  taxableTerminalBenefits: number;
  treatment: LKTerminalBenefitTreatment;
  taxableEmploymentIncomeToDate: number;
}) {
  const amount = Math.max(0, taxableTerminalBenefits);

  if (amount <= 0) {
    return 0;
  }

  if (treatment === "approvedOrEtf") {
    return (
      Math.max(
        0,
        amount - LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_THRESHOLD,
      ) * LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_RATE
    );
  }

  return taxableEmploymentIncomeToDate + amount <= LK_PERSONAL_RELIEF
    ? 0
    : amount * LK_TABLE_03_OTHER_TERMINAL_BENEFIT_RATE;
}

function getAnnualReturnReliefBase(grossSalary: number, inputs?: unknown) {
  const lkInputs = asLKInputs(inputs);
  const solarRelief = isResidentReliefEligible(inputs)
    ? Math.min(
        Math.max(0, lkInputs.contributions?.housingExpenses ?? 0),
        LK_SOLAR_PANEL_RELIEF_LIMIT,
      )
    : 0;

  return Math.max(0, grossSalary - getModeledPersonalRelief(inputs) - solarRelief);
}

function calculateApprovedCharityDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  if (!isResidentReliefEligible(inputs)) {
    return 0;
  }

  return Math.min(
    LK_APPROVED_CHARITY_DONATION_LIMIT,
    getAnnualReturnReliefBase(grossSalary, inputs) / 3,
  );
}

function calculateGovernmentDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  if (!isResidentReliefEligible(inputs)) {
    return 0;
  }

  const lkInputs = asLKInputs(inputs);
  const approvedCharityDonation = Math.min(
    Math.max(0, lkInputs.contributions?.charitableDonations ?? 0),
    calculateApprovedCharityDonationLimit({ grossSalary, inputs }),
  );

  return Math.max(
    0,
    getAnnualReturnReliefBase(grossSalary, inputs) - approvedCharityDonation,
  );
}

export const LK_TAX_CONFIG = {
  code: "LK",
  currency: "LKR",
  taxYear: LK_TAX_YEAR,
  defaultSalary: 12000000,
  incomeTaxName: "APIT / personal income tax",
  personalAllowance: LK_PERSONAL_RELIEF,
  resolvePersonalAllowance: ({ inputs }) =>
    getModeledPersonalRelief(inputs),
  deductions: [],
  taxCredits: [],
  brackets: [...LK_STANDARD_BRACKETS],
  resolveBrackets: ({ inputs }) =>
    asLKInputs(inputs).employmentType === "secondary"
      ? [
          {
            min: 0,
            max: Infinity,
            rate: calculateLKSecondaryEmploymentRate({
              primaryMonthlyRemuneration:
                asLKInputs(inputs).primaryMonthlyRemuneration ?? 0,
              secondaryAnnualRemuneration: inputs.grossSalary,
            }),
          },
        ]
      : asLKInputs(inputs).employmentType === "foreignEmployer"
        ? [...LK_FOREIGN_EMPLOYER_BRACKETS]
        : [...LK_STANDARD_BRACKETS],
  resolveSocialContributions: ({ grossSalary, inputs }) =>
    asLKInputs(inputs).epfCovered === false
      ? []
      : [
          {
            name: "Employee Provident Fund contribution",
            rate: LK_EPF_EMPLOYEE_RATE,
            calculateAmount: () =>
              Math.max(
                0,
                asLKInputs(inputs).epfContributionBase ??
                  grossSalary - (asLKInputs(inputs).taxableNonCashBenefits ?? 0),
              ) * LK_EPF_EMPLOYEE_RATE,
            preTax: false,
          },
        ],
  voluntaryContributions: [
    {
      key: "housingExpenses",
      name: "Solar panel relief",
      calculateLimit: ({ inputs }) =>
        isResidentReliefEligible(inputs) ? LK_SOLAR_PANEL_RELIEF_LIMIT : 0,
      description:
        "Resident solar-panel relief for panels fixed on your premises and connected to the national grid, capped at LKR 600,000 per year.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Approved charity donations",
      calculateLimit: calculateApprovedCharityDonationLimit,
      description:
        "Approved charitable-institution donations, capped for individuals at the lower of one-third of taxable income or LKR 75,000.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Government or specified institution donations",
      calculateLimit: calculateGovernmentDonationLimit,
      description:
        "Qualifying payments such as donations to the Government, Consolidated Fund, President's Fund, or other specified institutions, capped here to the remaining modeled taxable salary base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Sri Lanka employment income is modeled for the 2025/2026 year of assessment using IRD APIT Tables 01, 04, and 08 where selected.",
    "Resident primary employment uses the IRD personal relief of LKR 1,800,000, then the 6%, 18%, 24%, 30%, and 36% progressive bands.",
    "Resident secondary employment uses IRD Table 07, with the secondary APIT rate selected from the entered primary monthly remuneration and this job's monthly remuneration.",
    "Foreign-employer remote employment uses IRD Table 08 when the employer is outside Sri Lanka, services are used outside Sri Lanka, and foreign-currency pay is remitted through a bank to Sri Lanka; freelancers and independent service providers are not covered by this salary table.",
    "Non-resident non-citizen employment uses IRD Table 04 without the resident personal relief.",
    "The Sri Lanka employee-facing salary controls exposed here are the verified IRD APIT employment table, EPF coverage, Table 02 lump-sum cash payments, taxable non-cash benefits, Table 03 terminal-benefit treatment, solar relief, approved charity donations, and Government or specified-institution qualifying payments.",
    "Employee EPF is modeled as an optional coverage switch at the statutory 8% employee payroll deduction on regular cash remuneration and does not reduce the APIT taxable base.",
    "Employer EPF at 12% and ETF at 3% are shown as employer-cost context when EPF/ETF coverage is selected; they do not reduce employee take-home pay.",
    "Annual bonus, leave encashment, medical reimbursement, salary arrears, and employee-share amounts entered as lump-sum payments are included in cash take-home and APIT taxable employment income using the annual cumulative liability approach from IRD Table 02.",
    "Taxable in-kind or non-cash employment benefits are added to APIT taxable employment income but not to cash take-home; use the IRD non-cash-benefit valuation circular before entering this amount.",
    "Taxable once-and-for-all terminal benefits entered separately use IRD APIT Table 03. Approved scheme / ETF-style payments retain 12% only on the amount above LKR 5,000,000; other or unapproved payments retain 36% unless total taxable remuneration including the payment is within the LKR 1,800,000 relief threshold.",
    "Do not enter terminal-benefit amounts that IRD treats as exempt, such as approved or regulated provident-fund payments, Sri Lankan Government pension or retiring benefits, or qualifying injury/death compensation.",
    "Solar-panel relief and qualifying-payment donations are modeled as annual-return tax deductions only; they do not reduce the cash salary paid by the employer.",
  ],
  modeledExclusions: [
    "APIT month-by-month withholding timing and tax-on-tax gross-up mechanics are not modeled; this calculator shows the annual tax and annual take-home impact.",
    "IRD clearance or direction adjustments after Table 03 retention are not modeled; use the terminal-benefit treatment selector for the initial APIT deduction category.",
    "Rent relief is not shown because the IRD relief is for rental income from investment assets, and this page models employment salary rather than rental income.",
    "Business income and independent-service-provider withholding are separate income categories; double-tax-agreement claims require residency, source-country withholding, and certificate facts rather than an employee salary slider.",
    "A voluntary retirement amount is not exposed because the official EPF and IRD guidance reviewed does not provide a general employee salary deduction for ordinary payroll top-ups.",
  ],
  sourceUrls: [...LK_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"LK">;
