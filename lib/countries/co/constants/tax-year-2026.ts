import type { TaxBracket } from "../../types";

// Colombia 2026 employment withholding parameters
// Sources: https://www.dian.gov.co/ ; https://www.mintrabajo.gov.co/

export const CO_TAX_YEAR = 2026;

export const CO_SOURCE_URLS = {
  incomeTax:
    "https://www.dian.gov.co/impuestos-sobre-la-renta/Personas-naturales/Pagina/Inicio.aspx",
  socialSecurity:
    "https://www.mintrabajo.gov.co/pensiones/",
} as const;

/** UVT value for 2026 (DIAN). */
export const CO_UVT_2026 = 49_799;

export const CO_PENSION_EMPLOYEE_RATE = 0.04;
export const CO_HEALTH_EMPLOYEE_RATE = 0.04;
export const CO_SOLIDARITY_EMPLOYEE_RATE = 0.01;

/** Simplified annual PIT brackets on taxable income after employee contributions (UVT-based). */
export const CO_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 57_000_000, rate: 0 },
  { min: 57_000_000, max: 89_000_000, rate: 0.19 },
  { min: 89_000_000, max: 145_000_000, rate: 0.28 },
  { min: 145_000_000, max: 311_000_000, rate: 0.33 },
  { min: 311_000_000, max: 777_000_000, rate: 0.35 },
  { min: 777_000_000, max: Infinity, rate: 0.37 },
];

export const CO_MANDATORY_EMPLOYEE_RATE =
  CO_PENSION_EMPLOYEE_RATE + CO_HEALTH_EMPLOYEE_RATE + CO_SOLIDARITY_EMPLOYEE_RATE;
