import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  PEGratificationHealthCoverage,
  PEPensionSystem,
} from "../types";

export const PE_TAX_YEAR = 2026;

export const PE_UIT = 5500;
export const PE_SEVEN_UIT_DEDUCTION = PE_UIT * 7;
export const PE_ADDITIONAL_DEDUCTION_LIMIT = PE_UIT * 3;
export const PE_ONP_CONTRIBUTION_RATE = 0.13;
export const PE_AFP_MANDATORY_FUND_RATE = 0.1;
export const PE_AFP_INSURANCE_RATE = 0.0137;
export const PE_AFP_MONTHLY_INSURANCE_CAP = 12598.91;
export const PE_AFP_ANNUAL_INSURANCE_CAP = PE_AFP_MONTHLY_INSURANCE_CAP * 12;

export const PE_GRATIFICATION_BONUS_RATES = {
  essalud: 0.09,
  eps: 0.0675,
} satisfies Record<PEGratificationHealthCoverage, number>;

export const PE_AFP_PENSION_SYSTEMS = {
  afpHabitat: {
    name: "AFP Habitat",
    flowCommissionRate: 0.0147,
    annualBalanceCommissionRate: 0.0125,
  },
  afpIntegra: {
    name: "AFP Integra",
    flowCommissionRate: 0.0155,
    annualBalanceCommissionRate: 0.0078,
  },
  afpPrima: {
    name: "AFP Prima",
    flowCommissionRate: 0.016,
    annualBalanceCommissionRate: 0.0125,
  },
  afpProfuturo: {
    name: "AFP Profuturo",
    flowCommissionRate: 0.0169,
    annualBalanceCommissionRate: 0.0068,
  },
} satisfies Record<
  Exclude<PEPensionSystem, "onp">,
  {
    name: string;
    flowCommissionRate: number;
    annualBalanceCommissionRate: number;
  }
>;

export const PE_SOURCE_URLS = [
  "https://www.gob.pe/institucion/mef/normas-legales/7540449-301-2025-ef",
  "https://personas.sunat.gob.pe/trabajador-dependiente/rentas-quinta-categoria",
  "https://personas.sunat.gob.pe/trabajador-dependiente/declaracion-pago-0",
  "https://personas.sunat.gob.pe/devoluciones/gastos-deducibles-para-ano-2026",
  "https://www.gob.pe/7949-gastos-deducibles-de-hasta-3-uit",
  "https://www.gob.pe/que/8246-aportes-a-la-onp-recaudados-por-sunat-conceptos-afectos-a-la-onp",
  "https://www.sbs.gob.pe/usuarios/aprende-con-la-sbs/aportes",
  "https://www.sbs.gob.pe/app/spp/empleadores/comisiones_spp/paginas/comision_prima.aspx",
  "https://cdn.www.gob.pe/uploads/document/file/3321103/guia_gratificaciones.pdf",
] as const;

export const PE_TAX_CONFIG = {
  code: "PE",
  currency: "PEN",
  taxYear: PE_TAX_YEAR,
  defaultSalary: 180000,
  incomeTaxName: "Fifth category income tax",
  personalAllowance: PE_SEVEN_UIT_DEDUCTION,
  deductions: [],
  taxCredits: [],
  brackets: [
    { min: 0, max: PE_UIT * 5, rate: 0.08 },
    { min: PE_UIT * 5, max: PE_UIT * 20, rate: 0.14 },
    { min: PE_UIT * 20, max: PE_UIT * 35, rate: 0.17 },
    { min: PE_UIT * 35, max: PE_UIT * 45, rate: 0.2 },
    { min: PE_UIT * 45, max: Infinity, rate: 0.3 },
  ],
  socialContributions: [],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "Additional 3 UIT deductible expenses",
      limit: PE_ADDITIONAL_DEDUCTION_LIMIT,
      description:
        "SUNAT additional deduction for eligible rent, restaurants/hotels, professional services, EsSalud household-worker payments, and related deductible expenses, capped at 3 UIT for 2026.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Peru employment income is modeled with the 2026 UIT value of PEN 5,500, the fixed 7 UIT deduction, and the progressive resident work-income scale.",
    "Pension is modeled from the selected ONP or AFP system and does not reduce fifth-category taxable income.",
    "Private-sector statutory July and December gratifications can be included in gross, added on top of annual base pay, or excluded; when modeled, the extraordinary EsSalud/EPS bonus is added and the gratifications are excluded from pension withholding.",
    "The additional deduction is modeled as the SUNAT 2026 3 UIT cap for qualifying expenses claimed through the annual return; it does not reduce monthly payroll cash salary.",
  ],
  modeledExclusions: [
    "Category-specific receipt validation, foreign-source income, fourth-category income combinations, CTS deposits, profit-sharing distributions, and monthly withholding projection timing are excluded unless entered in annual gross cash salary.",
  ],
  sourceUrls: [...PE_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"PE">;

export function getPEGratificationBonusRate(
  coverage: PEGratificationHealthCoverage,
) {
  return PE_GRATIFICATION_BONUS_RATES[coverage];
}

export function getPEPensionSystem(system: PEPensionSystem) {
  return system === "onp" ? null : PE_AFP_PENSION_SYSTEMS[system];
}
