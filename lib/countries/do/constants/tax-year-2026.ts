import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { DOCalculatorInputs } from "../types";

export const DO_TAX_YEAR = 2026;

export const DO_2026_MINIMUM_WAGE_FOR_SDSS_CAPS = 23223;
export const DO_AFP_EMPLOYEE_RATE = 0.0287;
export const DO_SFS_EMPLOYEE_RATE = 0.0304;
export const DO_AFP_SALARY_CAP_MULTIPLIER = 20;
export const DO_SFS_SALARY_CAP_MULTIPLIER = 10;
export const DO_AFP_MONTHLY_SALARY_CAP =
  DO_2026_MINIMUM_WAGE_FOR_SDSS_CAPS * DO_AFP_SALARY_CAP_MULTIPLIER;
export const DO_SFS_MONTHLY_SALARY_CAP =
  DO_2026_MINIMUM_WAGE_FOR_SDSS_CAPS * DO_SFS_SALARY_CAP_MULTIPLIER;
export const DO_AFP_ANNUAL_SALARY_CAP = DO_AFP_MONTHLY_SALARY_CAP * 12;
export const DO_SFS_ANNUAL_SALARY_CAP = DO_SFS_MONTHLY_SALARY_CAP * 12;
export const DO_EDUCATION_EXPENSE_LIMIT = 104055;
export const DO_EDUCATION_EXPENSE_RATE_LIMIT = 0.1;
export const DO_CHRISTMAS_SALARY_MONTHS = 1;

export const DO_SOURCE_URLS = [
  "https://ayuda.dgii.gov.do/conversations/impuesto-sobre-la-renta-isr/ca687-cul-es-la-escala-salarial-correspondiente-al-ao-2026-del-impuesto-sobre-la-renta-isr/696a664277932619036537b8",
  "https://tss.gob.do/tss-informa-nuevos-topes-de-cotizacion-del-regimen-contributivo-del-sdss/",
  "https://dgii.gov.do/contribuyentesRegistrados/personaFisica/gastosEducativos/Paginas/default.aspx",
  "https://ayuda.dgii.gov.do/conversations/gastos-educativos/ca2558-cul-es-el-lmite-de-gastos-educativos-que-puedo-deducirme/5f3c176f8cd858ce879dac49",
  "https://dgii.gov.do/legislacion/editorialJuridico/Paginas/salario-navidad-y-exencion-fiscal.aspx",
  "https://www.tss.gob.do/assets/ley87-01.pdf",
  "https://dgii.gov.do/publicacionesOficiales/bibliotecaVirtual/contribuyentes/retencionesRetribucionesComplementarias/Documents/2-Guia-11-Retenciones%20del%20Impuesto%20Sobre%20la%20Renta.pdf",
  "https://dgii.gov.do/publicacionesOficiales/bibliotecaVirtual/contribuyentes/retencionesRetribucionesComplementarias/Documents/3-IR-17.pdf",
  "https://taxsummaries.pwc.com/dominican-republic/individual/taxes-on-personal-income",
] as const;

function asDOInputs(inputs?: unknown): Partial<DOCalculatorInputs> {
  return (inputs ?? {}) as Partial<DOCalculatorInputs>;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getDominicanSdssSalaryMonthly({
  cashSalary,
  inputs,
}: {
  cashSalary: number;
  inputs?: unknown;
}): number {
  const doInputs = asDOInputs(inputs);

  if (doInputs.sdssCovered === false || cashSalary <= 0) {
    return 0;
  }

  const monthlyCashSalary = Math.max(0, cashSalary / 12);
  const enteredMonthlySalary = Math.max(0, doInputs.sdssSalaryMonthly ?? 0);

  return Math.min(
    enteredMonthlySalary > 0 ? enteredMonthlySalary : monthlyCashSalary,
    monthlyCashSalary,
  );
}

function calculateSddsEmployeeContributions({
  cashSalary,
  inputs,
}: {
  cashSalary: number;
  inputs?: unknown;
}) {
  const sdssSalaryMonthly = getDominicanSdssSalaryMonthly({
    cashSalary,
    inputs,
  });
  const afpSalary = Math.min(sdssSalaryMonthly, DO_AFP_MONTHLY_SALARY_CAP) * 12;
  const sfsSalary = Math.min(sdssSalaryMonthly, DO_SFS_MONTHLY_SALARY_CAP) * 12;

  return afpSalary * DO_AFP_EMPLOYEE_RATE + sfsSalary * DO_SFS_EMPLOYEE_RATE;
}

export function getDominicanEducationExpenseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const doInputs = asDOInputs(inputs);
  const cashSalary = Math.max(0, doInputs.grossSalary ?? grossSalary);

  return roundCurrency(
    Math.min(
      Math.max(
        0,
        grossSalary -
          calculateSddsEmployeeContributions({
            cashSalary,
            inputs,
          }),
      ) * DO_EDUCATION_EXPENSE_RATE_LIMIT,
      DO_EDUCATION_EXPENSE_LIMIT,
    ),
  );
}

export const DO_TAX_CONFIG = {
  code: "DO",
  currency: "DOP",
  taxYear: DO_TAX_YEAR,
  defaultSalary: 1800000,
  incomeTaxName: "ISR income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 416220, rate: 0 },
    { min: 416220, max: 624329, rate: 0.15, rateBase: 416220 },
    {
      min: 624329,
      max: 867123,
      rate: 0.2,
      baseTax: 31216,
      rateBase: 624329,
    },
    {
      min: 867123,
      max: Infinity,
      rate: 0.25,
      baseTax: 79776,
      rateBase: 867123,
    },
  ],
  resolveSocialContributions: ({ inputs }) =>
    asDOInputs(inputs).sdssCovered === false
      ? []
      : [
          {
            name: "AFP pension contribution",
            rate: DO_AFP_EMPLOYEE_RATE,
            cap: DO_AFP_ANNUAL_SALARY_CAP,
            calculateAmount: ({ inputs: contributionInputs }) => {
              const doInputs = contributionInputs as DOCalculatorInputs;
              const sdssSalaryMonthly = getDominicanSdssSalaryMonthly({
                cashSalary: doInputs.grossSalary,
                inputs: contributionInputs,
              });

              return (
                Math.min(sdssSalaryMonthly, DO_AFP_MONTHLY_SALARY_CAP) *
                12 *
                DO_AFP_EMPLOYEE_RATE
              );
            },
            preTax: true,
          },
          {
            name: "SFS health contribution",
            rate: DO_SFS_EMPLOYEE_RATE,
            cap: DO_SFS_ANNUAL_SALARY_CAP,
            calculateAmount: ({ inputs: contributionInputs }) => {
              const doInputs = contributionInputs as DOCalculatorInputs;
              const sdssSalaryMonthly = getDominicanSdssSalaryMonthly({
                cashSalary: doInputs.grossSalary,
                inputs: contributionInputs,
              });

              return (
                Math.min(sdssSalaryMonthly, DO_SFS_MONTHLY_SALARY_CAP) *
                12 *
                DO_SFS_EMPLOYEE_RATE
              );
            },
            preTax: true,
          },
        ],
  voluntaryContributions: [
    {
      key: "educationExpenses",
      name: "Law 179-09 education expenses",
      calculateLimit: getDominicanEducationExpenseLimit,
      description:
        "DGII education-expense deduction for salaried taxpayers, capped at 10% of modeled taxable income and RD$104,055 for 2026.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Dominican Republic ISR uses the DGII 2026 annual salary scale, including the fixed tax amounts in the upper bands.",
    "Employee AFP and SFS contributions are modeled separately with the February 2026 TSS contributable salary caps based on the RD$23,223 reference minimum wage; the page lets you select SDSS coverage and the actual monthly SDSS salary when it differs from ordinary cash salary.",
    "Legal Christmas salary is modeled as one-twelfth of ordinary salary, exempt from ISR and outside the SDSS contribution base in this employee salary model.",
    "Law 179-09 education expenses are modeled as an annual-return deduction for salaried taxpayers, capped at the DGII 2026 RD$104,055 limit.",
    "Non-cash fringe benefits are not employee-taxable by default because DGII treats them as employer-reported complementary compensation; enable the employee-taxable option only for the official tax-exempt-employer case where the benefit becomes part of employee salary.",
  ],
  modeledExclusions: [
    "Employer-only labor risk insurance costs, employer complementary-compensation tax, monthly withholding timing, education receipt validation, discretionary Christmas payments above the statutory one-twelfth amount, and non-salary income are excluded.",
  ],
  sourceUrls: [...DO_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"DO">;
