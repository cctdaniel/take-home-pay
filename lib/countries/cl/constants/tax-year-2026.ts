import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { CLCalculatorInputs } from "../types";

export const CL_TAX_YEAR = 2026;

export const CL_PENSION_HEALTH_CAP = 3612015 * 12;
export const CL_UNEMPLOYMENT_CAP = (3612015 / 90) * 135.2 * 12;
export const CL_APV_ANNUAL_CAP = 23836776;
export const CL_APV_REGIME_A_BONUS_RATE = 0.15;
export const CL_APV_REGIME_A_BONUS_CAP = 417252;
export const CL_AFP_PENSION_RATE = 0.1;
export const CL_HEALTH_RATE = 0.07;
export const CL_UNEMPLOYMENT_INDEFINITE_EMPLOYEE_RATE = 0.006;

export const CL_SOURCE_URLS = [
  "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
  "https://www.dt.gob.cl/portal/1628/w3-article-118076.html",
  "https://www.dt.gob.cl/portal/1628/w3-article-95306.html",
  "https://www.superdesalud.gob.cl/orientacion-en-salud/fonasa-o-isapre/",
  "https://www.spensiones.cl/portal/institucional/594/w3-article-12683.html",
  "https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf",
] as const;

function asCLInputs(inputs?: unknown): Partial<CLCalculatorInputs> {
  return (inputs ?? {}) as Partial<CLCalculatorInputs>;
}

export const CL_TAX_CONFIG = {
  code: "CL",
  currency: "CLP",
  taxYear: CL_TAX_YEAR,
  defaultSalary: 48000000,
  incomeTaxName: "Second category income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [
    { min: 0, max: 965331 * 12, rate: 0 },
    { min: 965331 * 12, max: 2145180 * 12, rate: 0.04 },
    { min: 2145180 * 12, max: 3575300 * 12, rate: 0.08 },
    { min: 3575300 * 12, max: 5005420 * 12, rate: 0.135 },
    { min: 5005420 * 12, max: 6435540 * 12, rate: 0.23 },
    { min: 6435540 * 12, max: 8580720 * 12, rate: 0.304 },
    { min: 8580720 * 12, max: 22166860 * 12, rate: 0.35 },
    { min: 22166860 * 12, max: Infinity, rate: 0.4 },
  ],
  resolveSocialContributions: ({ inputs }) => {
    const baseContributions = [
      {
        name: "AFP pension contribution",
        rate: CL_AFP_PENSION_RATE,
        cap: CL_PENSION_HEALTH_CAP,
        preTax: true,
      },
      {
        name: "Health contribution",
        rate: CL_HEALTH_RATE,
        cap: CL_PENSION_HEALTH_CAP,
        preTax: true,
      },
    ];

    return asCLInputs(inputs).contractType === "fixedTermOrWork"
      ? baseContributions
      : [
          ...baseContributions,
          {
            name: "Unemployment insurance contribution",
            rate: CL_UNEMPLOYMENT_INDEFINITE_EMPLOYEE_RATE,
            cap: CL_UNEMPLOYMENT_CAP,
            preTax: true,
          },
        ];
  },
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "APV retirement savings",
      limit: CL_APV_ANNUAL_CAP,
      description:
        "APV savings modeled at the annual 600 UF cap shown in the SII 2026 income-tax guide. Choose regime B for an immediate taxable-income deduction or regime A for the fiscal bonus.",
      taxTreatment: "deduction",
    },
    {
      key: "medicalExpenses",
      name: "Additional Isapre health-plan premium",
      description:
        "Employee-paid annual Isapre plan cost above the mandatory 7% health contribution. This reduces take-home pay but is not modeled as an income-tax deduction.",
      taxTreatment: "none",
    },
  ],
  assumptions: [
    "Chile uses the June 2026 SII monthly second-category employment table annualized over 12 equal pay periods.",
    "AFP pension, 7% health, and unemployment insurance contributions are modeled separately with 2026 taxable caps.",
    "Unemployment insurance uses the employee 0.6% rate only when the indefinite-contract option is selected; fixed-term or work/service contracts are modeled with no employee unemployment contribution.",
    "APV can be modeled under regime B as an immediate taxable-income deduction, or under regime A as a no-deduction contribution with a 15% fiscal bonus capped at CLP 417,252.",
    "Additional Isapre health-plan premiums above the mandatory 7% health contribution can be entered as post-tax payroll cash deductions.",
  ],
  modeledExclusions: [
    "Monthly UTM changes across the year, AFP administrator commission differences, dependents, APV withdrawal taxes, and non-salary income are not modeled.",
  ],
  sourceUrls: [...CL_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"CL">;
