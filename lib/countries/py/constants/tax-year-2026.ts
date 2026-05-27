import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { PYCalculatorInputs } from "../types";

export const PY_TAX_YEAR = 2026;

export const PY_IRP_GROSS_INCOME_THRESHOLD = 80000000;
export const PY_IPS_EMPLOYEE_RATE = 0.09;
export const PY_AGUINALDO_MONTHS = 1;

export const PY_SOURCE_URLS = [
  "https://www.dnit.gov.py/web/portal-institucional/irp",
  "https://www.dnit.gov.py/web/portal-institucional/w/el-irp-se-debe-liquidar-en-marzo",
  "https://www.dnit.gov.py/web/portal-institucional/w/irp-gastos-deducibles",
  "https://www.dnit.gov.py/web/portal-institucional/w/irp-documentacion-para-deduccion-de-gastos",
  "https://www.dnit.gov.py/en/web/portal-institucional/preguntas-frecuentes",
  "https://www.dnit.gov.py/documents/20123/233435/IRP%2BCartilla%2Bal%2B30.07.24.pdf/4d86e05b-f11f-1d82-82a1-7646ac962cfa?t=1722351619203.pdf",
  "https://www.dnit.gov.py/documents/47797/47809/Instructivo%2Bdel%2BFormulario%2BN%C2%B0%2B515%2B-%2BIRP%2BRentas%2BProv.%2Bde%2BServicios%2BPersonales%2B-%2BVersi%C3%B3n%2B1.pdf/65ca3664-e43a-099c-692f-d19f87494e5c?t=1680634973558",
  "https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=59",
  "https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=69",
  "https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income",
] as const;

const PY_IRP_BRACKETS = [
  { min: 0, max: 50000000, rate: 0.08 },
  { min: 50000000, max: 150000000, rate: 0.09 },
  { min: 150000000, max: Infinity, rate: 0.1 },
];

function asPYInputs(inputs?: unknown): Partial<PYCalculatorInputs> {
  return (inputs ?? {}) as Partial<PYCalculatorInputs>;
}

function isIpsCovered(inputs?: unknown): boolean {
  return asPYInputs(inputs).ipsCovered !== false;
}

function calculateIpsContribution(grossSalary: number, inputs?: unknown) {
  return isIpsCovered(inputs) ? grossSalary * PY_IPS_EMPLOYEE_RATE : 0;
}

function calculateDeductibleExpenseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  if (grossSalary <= PY_IRP_GROSS_INCOME_THRESHOLD) {
    return 0;
  }

  return Math.max(0, grossSalary - calculateIpsContribution(grossSalary, inputs));
}

export const PY_TAX_CONFIG = {
  code: "PY",
  currency: "PYG",
  taxYear: PY_TAX_YEAR,
  defaultSalary: 240000000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: PY_IRP_BRACKETS,
  resolveBrackets: ({ grossSalary }) =>
    grossSalary > PY_IRP_GROSS_INCOME_THRESHOLD
      ? PY_IRP_BRACKETS
      : [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) =>
    isIpsCovered(inputs)
      ? [
          {
            name: "IPS employee contribution",
            rate: PY_IPS_EMPLOYEE_RATE,
            preTax: true,
          },
        ]
      : [],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "Documented deductible personal and family expenses",
      calculateLimit: calculateDeductibleExpenseLimit,
      description:
        "IRP-RSP documented personal and family expenses supported by valid vouchers, capped here at modeled income after IPS.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Paraguay IRP for personal services is modeled only when annual gross personal-service income exceeds PYG 80,000,000.",
    "The DNIT IRP scale is applied to modeled net income after the IPS employee contribution: 8% up to PYG 50 million, 9% on the next PYG 100 million, and 10% above PYG 150 million.",
    "IPS is modeled as the 9% employee contribution for ordinary private-sector employment when coverage is selected.",
    "Legal aguinaldo is modeled as one-twelfth of ordinary salary, excluded from IRP taxable income and IPS contributions.",
    "Documented deductible personal and family expenses are modeled as annual IRP deductions for valid DNIT-supported expenses such as maintenance, education, health, housing, clothing, mobility, and recreation.",
  ],
  modeledExclusions: [
    "VAT credit/debit mechanics, invoice validation details, discretionary bonus amounts beyond the statutory aguinaldo, self-employed/professional regimes, private social-security plans for independent providers, and special public-sector pension funds are not modeled.",
    "No voluntary retirement top-up is shown for ordinary salaried employees because the modeled employee pension/social-security item is the statutory IPS payroll contribution.",
  ],
  sourceUrls: [...PY_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"PY">;
