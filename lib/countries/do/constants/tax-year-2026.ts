import type { TaxBracket } from "../../types";

// Dominican Republic salary tax parameters — 2026
// Sources: https://www.dgii.gov.do/ | https://tss.gob.do/assets/reso01-2025.pdf

export const DO_TAX_YEAR = 2026;

export const DO_SOURCE_URLS = {
  incomeTax: "https://www.dgii.gov.do/",
  socialSecurity: "https://tss.gob.do/",
  socialSecurityLaw:
    "https://dgii.gov.do/legislacion/leyesTributarias/Documents/Leyes%20de%20Instituciones%20y%20Fondos%20de%20Terceros/87-01.pdf",
  contributionCaps: "https://tss.gob.do/assets/reso01-2025.pdf",
} as const;

/** AFP employee rate (Seguro de Vejez, Discapacidad y Sobrevivencia). */
export const DO_AFP_EMPLOYEE_RATE = 0.0287;

/** SFS employee rate (Seguro Familiar de Salud). */
export const DO_SFS_EMPLOYEE_RATE = 0.0304;

/** Combined TSS employee rate (AFP + SFS) when no ceiling applies. */
export const DO_TSS_EMPLOYEE_RATE = DO_AFP_EMPLOYEE_RATE + DO_SFS_EMPLOYEE_RATE;

/** Monthly AFP contribution ceiling — 20× national minimum wage (DOP, TSS Res. 01-2025). */
export const DO_AFP_MONTHLY_CAP = 464_460;

/** Monthly SFS contribution ceiling — 10× national minimum wage (DOP, TSS Res. 01-2025). */
export const DO_SFS_MONTHLY_CAP = 232_230;

/** Annual exempt amount for ISR on salary (DOP). */
export const DO_ISR_EXEMPT_2026 = 416_220;

/** Progressive ISR brackets on annual salary after TSS (DOP). */
export const DO_ISR_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: DO_ISR_EXEMPT_2026, rate: 0 },
  { min: DO_ISR_EXEMPT_2026, max: 624_329, rate: 0.15 },
  { min: 624_329, max: 867_123, rate: 0.2 },
  { min: 867_123, max: Infinity, rate: 0.25 },
];
