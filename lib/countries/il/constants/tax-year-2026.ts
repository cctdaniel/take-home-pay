import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { ILCalculatorInputs } from "../types";

export const IL_TAX_YEAR = 2026;

export const IL_CREDIT_POINT_MONTHLY_VALUE = 242;
export const IL_CREDIT_POINT_VALUE = IL_CREDIT_POINT_MONTHLY_VALUE * 12;
export const IL_RESIDENT_CREDIT_POINTS = 2.25;
export const IL_NII_REDUCED_MONTHLY_LIMIT = 7703;
export const IL_NII_MONTHLY_CEILING = 51910;
export const IL_PENSION_CREDIT_CONTRIBUTION_CAP = 8148;
export const IL_EMPLOYEE_PENSION_RATE = 0.06;
export const IL_STUDY_FUND_MONTHLY_SALARY_CAP = 15712;
export const IL_STUDY_FUND_EMPLOYEE_RATE = 0.025;
export const IL_STUDY_FUND_EMPLOYER_RATE = 0.075;
export const IL_SECTION_46_DONATION_MINIMUM = 207;
export const IL_SECTION_46_DONATION_CREDIT_RATE = 0.35;
export const IL_SECTION_46_DONATION_LIMIT_RATE = 0.3;
export const IL_SECTION_46_DONATION_ABSOLUTE_LIMIT = 9000000;

export const IL_SOURCE_URLS = [
  "https://www.gov.il/BlobFolder/reports/press-income-tax-brackets/he/SalaryDataDetails_tax_bracket_2026.pdf",
  "https://www.gov.il/BlobFolder/generalpage/employment_guides/en/employment_en.pdf",
  "https://www.gov.il/en/service/confirmation-of-donations",
  "https://www.gov.il/en/service/report-public-institution-receipt-donation",
  "https://www.btl.gov.il/Laws1/00_0103_000000.pdf",
  "https://www.btl.gov.il/ENGLISH%20HOMEPAGE/INSURANCE/RATESANDAMOUNT/Pages/forSalaried.aspx",
  "https://www.kolzchut.org.il/he/%D7%96%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%D7%91%D7%92%D7%99%D7%9F_%D7%94%D7%A4%D7%A8%D7%A9%D7%95%D7%AA_%D7%9C%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99",
  "https://taxsummaries.pwc.com/israel/individual/other-tax-credits-and-incentives",
] as const;

function asILInputs(inputs?: unknown): Partial<ILCalculatorInputs> {
  return (inputs ?? {}) as Partial<ILCalculatorInputs>;
}

function getAdditionalCreditPoints(inputs?: unknown): number {
  return Math.min(Math.max(0, asILInputs(inputs).additionalCreditPoints ?? 0), 20);
}

function calculateStudyFundEmployeeLimit({
  grossSalary,
}: {
  grossSalary: number;
}) {
  return (
    Math.min(grossSalary, IL_STUDY_FUND_MONTHLY_SALARY_CAP * 12) *
    IL_STUDY_FUND_EMPLOYEE_RATE
  );
}

function calculateSection46DonationLimit({ grossSalary }: { grossSalary: number }) {
  return Math.min(
    Math.max(0, grossSalary) * IL_SECTION_46_DONATION_LIMIT_RATE,
    IL_SECTION_46_DONATION_ABSOLUTE_LIMIT,
  );
}

export const IL_TAX_CONFIG = {
  code: "IL",
  currency: "ILS",
  taxYear: IL_TAX_YEAR,
  defaultSalary: 360000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [
    {
      name: "Resident credit points",
      amount: IL_CREDIT_POINT_VALUE * IL_RESIDENT_CREDIT_POINTS,
    },
    {
      name: "Additional credit points",
      calculate: ({ inputs }) =>
        getAdditionalCreditPoints(inputs) * IL_CREDIT_POINT_VALUE,
    },
    {
      name: "Employee pension contribution credit",
      calculate: ({ mandatoryContributions }) => {
        const pensionContribution =
          mandatoryContributions.find(
            (contribution) =>
              contribution.name === "Employee pension contribution",
          )?.amount ?? 0;

        return Math.min(pensionContribution, IL_PENSION_CREDIT_CONTRIBUTION_CAP) * 0.35;
      },
    },
    {
      name: "Section 46 donation credit",
      calculate: ({ inputs, taxableIncome }) => {
        const donation = Math.min(
          Math.max(0, inputs.contributions.charitableDonations ?? 0),
          calculateSection46DonationLimit({ grossSalary: taxableIncome }),
        );

        if (donation <= IL_SECTION_46_DONATION_MINIMUM) {
          return 0;
        }

        return donation * IL_SECTION_46_DONATION_CREDIT_RATE;
      },
    },
  ],
  brackets: [
    { min: 0, max: 7010 * 12, rate: 0.1 },
    { min: 7010 * 12, max: 10060 * 12, rate: 0.14 },
    { min: 10060 * 12, max: 19000 * 12, rate: 0.2 },
    { min: 19000 * 12, max: 25100 * 12, rate: 0.31 },
    { min: 25100 * 12, max: 46690 * 12, rate: 0.35 },
    { min: 46690 * 12, max: 60130 * 12, rate: 0.47 },
    { min: 60130 * 12, max: Infinity, rate: 0.5 },
  ],
  socialContributions: [
    {
      name: "National Insurance and health contributions",
      cap: IL_NII_MONTHLY_CEILING * 12,
      brackets: [
        {
          min: 0,
          max: IL_NII_REDUCED_MONTHLY_LIMIT * 12,
          rate: 0.0427,
        },
        {
          min: IL_NII_REDUCED_MONTHLY_LIMIT * 12,
          max: Infinity,
          rate: 0.1217,
        },
      ],
      preTax: false,
    },
    {
      name: "Employee pension contribution",
      rate: IL_EMPLOYEE_PENSION_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "Study fund employee contribution",
      calculateLimit: calculateStudyFundEmployeeLimit,
      description:
        "Keren Hishtalmut employee contribution modeled at up to 2.5% of salary, capped at the 2026 monthly qualifying salary ceiling. Employer matching is shown in the result but is not current take-home cash.",
      taxTreatment: "none",
    },
    {
      key: "charitableDonations",
      name: "Section 46 approved donations",
      calculateLimit: calculateSection46DonationLimit,
      description:
        "Donations to public institutions approved under Section 46. Modeled as a 35% non-refundable tax credit when annual donations exceed ILS 207, capped at 30% of taxable income or ILS 9,000,000.",
      taxTreatment: "none",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Israel resident employment income is modeled with 2026 monthly income-tax brackets annualized over 12 equal salary months.",
    "The model applies the basic 2.25 resident credit points for a single resident taxpayer, plus any additional credit points entered.",
    "National Insurance and health insurance use the 2026 salaried-worker reduced/full employee rates and annualized monthly ceiling.",
    "Employee pension is modeled as a 6% cash contribution with the 35% pension contribution tax credit capped at the published 2026 eligible contribution amount.",
    "Study fund employee contributions are modeled as an optional after-tax cash contribution up to 2.5% of the qualifying salary ceiling, with employer matching shown separately as account value.",
    "Section 46 approved donations are modeled as a non-refundable 35% tax credit when annual donations exceed ILS 207, capped at 30% of taxable income or ILS 9,000,000.",
  ],
  modeledExclusions: [
    "Severance, employer pension contributions, study-fund withdrawal taxation and vesting rules, Section 46 institution/document reporting checks, and irregular bonus payroll rules are excluded. Use the additional credit-points input for women, children, new immigrants/returning residents, disability, discharged soldiers, or other credit-point eligibility.",
  ],
  sourceUrls: [...IL_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"IL">;
