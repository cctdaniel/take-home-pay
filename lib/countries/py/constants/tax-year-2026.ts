import type { TaxBracket } from "../../types";

// Paraguay salary tax parameters — 2026
// Sources: https://www.mtess.gov.py/ | https://www.set.gov.py/

export const PY_TAX_YEAR = 2026;

export const PY_SOURCE_URLS = {
  socialSecurity: "https://www.mtess.gov.py/",
  incomeTax: "https://www.set.gov.py/",
} as const;

/** IPS employee social security rate on gross salary. */
export const PY_IPS_EMPLOYEE_RATE = 0.09;

/** Minimum annual gross before IRP applies (PYG, Ley 6380/19). */
export const PY_IRP_MINIMUM_GROSS = 80_000_000;

/** IRP progressive bands on net income (renta neta) once gross exceeds the threshold (PYG). */
export const PY_IRP_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 50_000_000, rate: 0.08 },
  { min: 50_000_000, max: 150_000_000, rate: 0.09 },
  { min: 150_000_000, max: Infinity, rate: 0.1 },
];
