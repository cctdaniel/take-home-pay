import type { TaxBracket } from "../../types";

// Ecuador salary tax parameters — 2026
// Sources: https://www.sri.gob.ec/ | https://www.iess.gob.ec/

export const EC_TAX_YEAR = 2026;

export const EC_SOURCE_URLS = {
  incomeTax:
    "https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar?id=bb7aac3c-251d-4243-9477-10a3ba8e7355&nombre=NAC-DGERCGC25-00000043.pdf",
  socialSecurity: "https://www.iess.gob.ec/",
} as const;

/** IESS employee contribution rate on insurable salary. */
export const EC_IESS_EMPLOYEE_RATE = 0.0945;

/** Maximum annual IESS contribution base (USD). */
export const EC_IESS_ANNUAL_CAP = 45_000;

/** Basic exempt fraction on income after IESS (USD, SRI 2026 table). */
export const EC_PIT_BASIC_EXEMPT_2026 = 12_208;

/** Progressive PIT on annual income after IESS (SRI Res. NAC-DGERCGC25-00000043). */
export const EC_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: EC_PIT_BASIC_EXEMPT_2026, rate: 0 },
  { min: EC_PIT_BASIC_EXEMPT_2026, max: 15_549, rate: 0.05 },
  { min: 15_549, max: 20_188, rate: 0.1 },
  { min: 20_188, max: 26_700, rate: 0.12 },
  { min: 26_700, max: 35_136, rate: 0.15 },
  { min: 35_136, max: 46_575, rate: 0.2 },
  { min: 46_575, max: 62_005, rate: 0.25 },
  { min: 62_005, max: 82_679, rate: 0.3 },
  { min: 82_679, max: 109_956, rate: 0.35 },
  { min: 109_956, max: Infinity, rate: 0.37 },
];
