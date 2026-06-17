import type { TaxBracket } from "../../types";

// Panama salary tax parameters — 2026
// Sources: https://www.dgi.gob.pa/ | https://www.css.gob.pa/

export const PA_TAX_YEAR = 2026;

export const PA_SOURCE_URLS = {
  incomeTax: "https://www.dgi.gob.pa/",
  socialSecurity: "https://www.css.gob.pa/",
} as const;

/** CSS employee social security (Law 462, 2025). */
export const PA_CSS_EMPLOYEE_RATE = 0.0975;

/** Educational insurance employee share. */
export const PA_EDUCATION_EMPLOYEE_RATE = 0.0125;

/** Annual PIT brackets on taxable income (territorial — foreign-sourced salary often exempt). */
export const PA_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 11_000, rate: 0 },
  { min: 11_000, max: 50_000, rate: 0.15 },
  { min: 50_000, max: Infinity, rate: 0.25 },
];
