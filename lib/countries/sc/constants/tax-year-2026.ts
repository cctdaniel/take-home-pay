import type {
  StandardCountryTaxBracket,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { SCCalculatorInputs, SCEmployeeTaxTable } from "../types";

export const SC_TAX_YEAR = 2026;

export const SC_SOURCE_URLS = [
  "https://src.gov.sc/income-and-non-monetary-benefits-tax/",
  "https://src.gov.sc/tax-calculator/",
  "https://pensionfund.sc/contributions/mandatory-contribution/",
  "https://pensionfund.sc/contributions/voluntary-contribution/",
] as const;

const SC_MONTHS_PER_YEAR = 12;
const SC_CITIZEN_TAX_FREE_MONTHLY = 8555.5;
const SC_SECOND_BAND_MONTHLY = 10000;
const SC_TOP_BAND_MONTHLY = 83333;
export const SC_NON_MONETARY_BENEFITS_TAX_RATE = 0.15;
export const SC_SPECIFIC_PROJECT_TAX_RATE = 0.03;
export const SC_STEVEDORE_TAX_RATE = 0.1;
export const SC_MANDATORY_PENSION_EMPLOYEE_RATE = 0.05;
export const SC_VOLUNTARY_SPF_CONTRIBUTION_NAME = "SPF voluntary contribution";
export const SC_VOLUNTARY_SPF_CONTRIBUTION_DESCRIPTION =
  "Optional Seychelles Pension Fund voluntary saving made through workplace salary deduction. It reduces cash take-home pay but is not modeled as income-tax relief.";

function annualize(monthlyAmount: number): number {
  return monthlyAmount * SC_MONTHS_PER_YEAR;
}

export const SC_CITIZEN_BRACKETS: StandardCountryTaxBracket[] = [
  { min: 0, max: annualize(SC_CITIZEN_TAX_FREE_MONTHLY), rate: 0 },
  {
    min: annualize(SC_CITIZEN_TAX_FREE_MONTHLY),
    max: annualize(SC_SECOND_BAND_MONTHLY),
    rate: 0.15,
  },
  {
    min: annualize(SC_SECOND_BAND_MONTHLY),
    max: annualize(SC_TOP_BAND_MONTHLY),
    rate: 0.2,
  },
  { min: annualize(SC_TOP_BAND_MONTHLY), max: Infinity, rate: 0.3 },
];

export const SC_NON_CITIZEN_BRACKETS: StandardCountryTaxBracket[] = [
  { min: 0, max: annualize(SC_SECOND_BAND_MONTHLY), rate: 0.15 },
  {
    min: annualize(SC_SECOND_BAND_MONTHLY),
    max: annualize(SC_TOP_BAND_MONTHLY),
    rate: 0.2,
  },
  { min: annualize(SC_TOP_BAND_MONTHLY), max: Infinity, rate: 0.3 },
];

export const SC_SPECIFIC_PROJECT_BRACKETS: StandardCountryTaxBracket[] = [
  { min: 0, max: Infinity, rate: SC_SPECIFIC_PROJECT_TAX_RATE },
];

export const SC_STEVEDORE_BRACKETS: StandardCountryTaxBracket[] = [
  { min: 0, max: Infinity, rate: SC_STEVEDORE_TAX_RATE },
];

function getEmployeeTaxTable(inputs: unknown): SCEmployeeTaxTable {
  const scInputs = inputs as Partial<SCCalculatorInputs>;
  const table = scInputs.employeeTaxTable ?? scInputs.citizenship;

  switch (table) {
    case "citizen":
    case "specific_project":
    case "stevedore":
      return table;
    default:
      return "non_citizen";
  }
}

export const SC_TAX_CONFIG = {
  code: "SC",
  currency: "SCR",
  taxYear: SC_TAX_YEAR,
  defaultSalary: 900000,
  incomeTaxName: "Income and non-monetary benefits tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: SC_NON_CITIZEN_BRACKETS,
  resolveBrackets: ({ inputs }) => {
    switch (getEmployeeTaxTable(inputs)) {
      case "citizen":
        return SC_CITIZEN_BRACKETS;
      case "specific_project":
        return SC_SPECIFIC_PROJECT_BRACKETS;
      case "stevedore":
        return SC_STEVEDORE_BRACKETS;
      default:
        return SC_NON_CITIZEN_BRACKETS;
    }
  },
  socialContributions: [
    {
      name: "Seychelles Pension Fund employee contribution",
      rate: SC_MANDATORY_PENSION_EMPLOYEE_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [],
  assumptions: [
    "Seychelles SRC monthly employment income tax bands are annualized for a full-year employee.",
    "The non-citizen employee tax table is the default because this calculator is relocation-oriented; citizens can switch to the citizen table.",
    "Specific-project employment income is modeled at the SRC 3% rate and stevedore dock-work income is modeled at the SRC 10% flat rate when those tables are selected.",
    "The Seychelles Pension Fund employee mandatory contribution is modeled at 5% of gross salary.",
    "SPF voluntary contributions are modeled as optional retirement cash deductions when entered; the reviewed SRC/SPF guidance does not make them an employee income-tax relief.",
    "Non-monetary benefits can be entered separately; the 15% SRC non-monetary benefits tax is shown as an employer-only estimate and is not deducted from employee take-home pay.",
  ],
  modeledExclusions: [
    "Exempt emolument conditions, non-monetary benefit valuation exceptions, and employer pension contributions are excluded.",
    "SPF voluntary contributions are capped in this salary model to remaining after-tax cash pay; additional non-payroll SPF deposits are separate retirement-saving transactions.",
  ],
  sourceUrls: [...SC_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"SC">;
