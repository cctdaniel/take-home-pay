// Uruguay 2026 salary tax parameters
// Source: https://www.bps.gub.uy/

import type { TaxBracket } from "../../types";

export const UY_TAX_YEAR = 2026;

export const UY_SOURCE_URLS = {
  bps: "https://www.bps.gub.uy/",
  dgi: "https://www.gub.uy/ministerio-economia-finanzas/politicas-tributarias",
} as const;

/** Base de Prestaciones y Contribuciones (BPC) 2026. */
export const UY_BPC_2026 = 6_864;

/** Employee social contributions on gross: BPS 15% + FRL 0.1% + FONASA 3%. */
export const UY_BPS_EMPLOYEE_RATE = 0.15;
export const UY_FRL_EMPLOYEE_RATE = 0.001;
export const UY_FONASA_EMPLOYEE_RATE = 0.03;
export const UY_SOCIAL_EMPLOYEE_RATE =
  UY_BPS_EMPLOYEE_RATE + UY_FRL_EMPLOYEE_RATE + UY_FONASA_EMPLOYEE_RATE;

/** Monthly MNIG — 7 BPC exempt band annualized. */
export const UY_MNIG_MONTHLY_BPC = 7;
export const UY_MNIG_ANNUAL = UY_MNIG_MONTHLY_BPC * UY_BPC_2026 * 12;

function annualBpcThreshold(monthlyBpc: number): number {
  return monthlyBpc * UY_BPC_2026 * 12;
}

/** IRPF progressive annual brackets (monthly BPC bands × 12). */
export const UY_IRPF_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: annualBpcThreshold(7), rate: 0 },
  { min: annualBpcThreshold(7), max: annualBpcThreshold(10), rate: 0.1 },
  { min: annualBpcThreshold(10), max: annualBpcThreshold(15), rate: 0.15 },
  { min: annualBpcThreshold(15), max: annualBpcThreshold(30), rate: 0.24 },
  { min: annualBpcThreshold(30), max: annualBpcThreshold(50), rate: 0.25 },
  { min: annualBpcThreshold(50), max: annualBpcThreshold(75), rate: 0.27 },
  { min: annualBpcThreshold(75), max: annualBpcThreshold(115), rate: 0.31 },
  { min: annualBpcThreshold(115), max: Infinity, rate: 0.36 },
];
