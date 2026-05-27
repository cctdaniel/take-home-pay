import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { CRCalculatorInputs } from "../types";

export const CR_TAX_YEAR = 2026;
export const CR_SPOUSE_TAX_CREDIT_ANNUAL = 31080;
export const CR_CHILD_TAX_CREDIT_ANNUAL = 20520;
export const CR_CCSS_EMPLOYEE_RATE = 0.1083;
export const CR_VOLUNTARY_PENSION_LIMIT_RATE = 0.1;
export const CR_AGUINALDO_MONTHS = 1;

export const CR_SOURCE_URLS = [
  "https://www.hacienda.go.cr/docs/TramosRenta2026.pdf",
  "https://aissfa.ccss.sa.cr/arc/pensiones/normativas/Reglamento_del_Seguro_de_Invalidez_Vejez_y_Muerte_de_la_Caja_Costarricense_de_Seguro_Social.pdf",
  "https://www.mtss.go.cr/tramites-servicios/calculadoras.html",
  "https://www.mtss.go.cr/elministerio/estructura/direccion-asuntos-juridicos/pronunciamientos/daj-ae-019-12%20Lizzy%20Valverde-Aguinaldo%20a%20tractos%20x%20adelantado.pdf",
  "https://www.bdo.cr/en-gb/insights/2025/costa-rica-adjustment-to-ccss-employer-employee-contributions-effective-january-2026",
  "https://popularpensiones.fi.cr/productos/regimen-voluntario-de-pensiones-complementarias/",
] as const;

function asCRInputs(inputs?: unknown): Partial<CRCalculatorInputs> {
  return (inputs ?? {}) as Partial<CRCalculatorInputs>;
}

export const CR_TAX_CONFIG = {
  code: "CR",
  currency: "CRC",
  taxYear: CR_TAX_YEAR,
  defaultSalary: 30000000,
  incomeTaxName: "Employment income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [
    {
      name: "Spouse tax credit",
      calculate: ({ inputs }) =>
        asCRInputs(inputs).hasEligibleSpouse
          ? CR_SPOUSE_TAX_CREDIT_ANNUAL
          : 0,
    },
    {
      name: "Child tax credit",
      calculate: ({ inputs }) =>
        Math.max(0, asCRInputs(inputs).numberOfChildren ?? 0) *
        CR_CHILD_TAX_CREDIT_ANNUAL,
    },
  ],
  brackets: [
    { min: 0, max: 918000 * 12, rate: 0 },
    { min: 918000 * 12, max: 1347000 * 12, rate: 0.1 },
    { min: 1347000 * 12, max: 2364000 * 12, rate: 0.15 },
    { min: 2364000 * 12, max: 4727000 * 12, rate: 0.2 },
    { min: 4727000 * 12, max: Infinity, rate: 0.25 },
  ],
  socialContributions: [
    {
      name: "CCSS employee contribution",
      rate: CR_CCSS_EMPLOYEE_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary complementary pension",
      calculateLimit: ({ grossSalary }) =>
        grossSalary * CR_VOLUNTARY_PENSION_LIMIT_RATE,
      description:
        "Costa Rican voluntary complementary pension contribution, modeled up to 10% of gross salary for income-tax and social-charge relief.",
      taxTreatment: "deduction",
      reducesMandatoryContributionBase: true,
    },
  ],
  assumptions: [
    "Costa Rica salary tax bands use the 2026 Ministry of Finance monthly gross-salary thresholds annualized to 12 months.",
    "CCSS employee contribution is modeled at the 2026 salaried-employee rate of 10.83% of the contribution base.",
    "Aguinaldo is modeled as the legal one-twelfth Christmas bonus when selected; the legal amount is excluded from CCSS and salary income tax.",
    "Voluntary complementary pension contributions reduce both the modeled salary tax base and CCSS contribution base up to 10% of gross salary.",
    "Spouse and child family credits use the 2026 annualized Ministry of Finance credit amounts.",
  ],
  modeledExclusions: [
    "Exact CCSS component splits, aguinaldo amounts above the legal one-twelfth amount, pension-plan-specific constraints, employer association savings, and non-salary income are excluded unless entered in regular annual gross salary.",
  ],
  sourceUrls: [...CR_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"CR">;
