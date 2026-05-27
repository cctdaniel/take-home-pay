import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BRCalculatorInputs } from "../types";

export const BR_TAX_YEAR = 2026;

export const BR_INSS_MONTHLY_CAP = 8475.55;
export const BR_INSS_ANNUAL_CAP = BR_INSS_MONTHLY_CAP * 12;
export const BR_SIMPLIFIED_ANNUAL_DEDUCTION = 17640;
export const BR_DEPENDENT_MONTHLY_DEDUCTION = 189.59;
export const BR_DEPENDENT_ANNUAL_DEDUCTION =
  BR_DEPENDENT_MONTHLY_DEDUCTION * 12;
export const BR_EDUCATION_ANNUAL_LIMIT_PER_PERSON = 3561.5;
export const BR_THIRTEENTH_SALARY_MONTHS = 1;

export const BR_SOURCE_URLS = [
  "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026",
  "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/manual-mir/pagamentos-ou-doacoes/despesas-dedutiveis",
  "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/malha-fiscal/antecipacao/despesas-medicas",
  "https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal",
  "https://www.gov.br/esocial/pt-br/empregador-domestico/perguntas-frequentes",
  "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/manual-mir/rendimentos/rendimentos-do-trabalho",
  "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/imposto-de-renda/dirpf/deducoes/despesa-de-previdencia-privada",
] as const;

function calculateIrpfReduction(
  grossSalary: number,
  grossIncomeTax: number,
): number {
  if (grossSalary <= 60000) {
    return Math.min(grossIncomeTax, 2694.15);
  }

  if (grossSalary <= 88200) {
    return Math.min(
      grossIncomeTax,
      Math.max(0, 8429.73 - 0.095575 * grossSalary),
    );
  }

  return 0;
}

function getNumberOfDependents(inputs?: unknown): number {
  return Math.max(
    0,
    Math.floor((inputs as Partial<BRCalculatorInputs> | undefined)?.numberOfDependents ?? 0),
  );
}

function calculateEducationLimit(inputs?: unknown): number {
  return (
    (1 + getNumberOfDependents(inputs)) * BR_EDUCATION_ANNUAL_LIMIT_PER_PERSON
  );
}

export const BR_TAX_CONFIG = {
  code: "BR",
  currency: "BRL",
  taxYear: BR_TAX_YEAR,
  defaultSalary: 180000,
  incomeTaxName: "IRPF income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Dependent deduction",
      calculateAmount: ({ inputs }) =>
        getNumberOfDependents(inputs) * BR_DEPENDENT_ANNUAL_DEDUCTION,
    },
  ],
  minimumTaxableDeduction: {
    name: "Simplified annual deduction top-up",
    amount: BR_SIMPLIFIED_ANNUAL_DEDUCTION,
  },
  taxCredits: [
    {
      name: "IRPF low-income reduction",
      calculate: ({ grossSalary, grossIncomeTax }) =>
        calculateIrpfReduction(grossSalary, grossIncomeTax),
    },
  ],
  brackets: [
    { min: 0, max: 29145.6, rate: 0 },
    { min: 29145.6, max: 33919.8, rate: 0.075 },
    { min: 33919.8, max: 45012.6, rate: 0.15 },
    { min: 45012.6, max: 55976.16, rate: 0.225 },
    { min: 55976.16, max: Infinity, rate: 0.275 },
  ],
  socialContributions: [
    {
      name: "INSS employee contribution",
      cap: BR_INSS_ANNUAL_CAP,
      brackets: [
        { min: 0, max: 1621 * 12, rate: 0.075 },
        { min: 1621 * 12, max: 2902.84 * 12, rate: 0.09 },
        { min: 2902.84 * 12, max: 4354.27 * 12, rate: 0.12 },
        { min: 4354.27 * 12, max: Infinity, rate: 0.14 },
      ],
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "PGBL private pension",
      calculateLimit: ({ grossSalary }) => grossSalary * 0.12,
      description:
        "PGBL/FAPI-style private pension deduction, modeled at 12% of annual taxable earnings when the complete return is better than the simplified deduction.",
      taxTreatment: "deduction",
    },
    {
      key: "educationExpenses",
      name: "Education expenses",
      calculateLimit: ({ inputs }) => calculateEducationLimit(inputs),
      description:
        "Deductible education expenses for the taxpayer and dependents, capped at BRL 3,561.50 per person for 2026.",
      taxTreatment: "deduction",
    },
    {
      key: "medicalExpenses",
      name: "Medical expenses",
      description:
        "Deductible unreimbursed medical expenses. Receita Federal does not set an annual cap, but expenses must be supportable.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Brazil is modeled with the 2026 annual IRPF table for resident employment income.",
    "INSS uses the 2026 monthly progressive employee table annualized over 12 equal salary months.",
    "13th salary is modeled separately with employee INSS and exclusive-source IRRF using the 2026 monthly IRPF table.",
    "Dependents, education expenses, unreimbursed medical expenses, INSS, and PGBL deductions are compared against the simplified annual deduction so the modeled taxable base uses the better deduction method.",
    "The 2026 IRPF reduction is based on annual gross taxable earnings, matching Receita Federal guidance.",
  ],
  modeledExclusions: [
    "Alimony, incentivized donations, employer-only FGTS, dependent income inclusion, self-employed carnê-leão rules, and high-income minimum-tax rules are not modeled.",
  ],
  sourceUrls: [...BR_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BR">;
