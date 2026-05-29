import type { TaxBracket } from "../../types";

// Chile 2026 employment tax parameters
// Sources: https://www.sii.cl/ ; https://www.spensiones.cl/

export const CL_TAX_YEAR = 2026;

export const CL_SOURCE_URLS = {
  incomeTax: "https://www.sii.cl/impuestos/impuestos_renta/impuesto_renta_trabajadores.html",
  utm: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
  afp: "https://www.spensiones.cl/",
} as const;

/** Monthly UTM value for 2026 (SII published schedule). */
export const CL_UTM_MONTHLY_2026 = 68_923;

export const CL_AFP_EMPLOYEE_RATE = 0.1;
export const CL_HEALTH_EMPLOYEE_RATE = 0.07;
export const CL_UNEMPLOYMENT_EMPLOYEE_RATE = 0.006;

/** Monthly taxable bracket upper bounds in UTM units (SII simplified table). */
const CL_MONTHLY_BRACKET_UTM_LIMITS = [13.5, 30, 50, 70, 90, 120, 310] as const;
const CL_BRACKET_RATES = [0, 0.04, 0.08, 0.135, 0.23, 0.3, 0.35, 0.4] as const;

function utmToAnnualThreshold(utmUnits: number): number {
  return Math.round(utmUnits * CL_UTM_MONTHLY_2026 * 12);
}

export function buildChilePitBrackets2026(): TaxBracket[] {
  const brackets: TaxBracket[] = [];
  let previousAnnualMax = 0;

  for (let index = 0; index < CL_BRACKET_RATES.length; index += 1) {
    const rate = CL_BRACKET_RATES[index];
    const monthlyUtmLimit = CL_MONTHLY_BRACKET_UTM_LIMITS[index];
    const max =
      monthlyUtmLimit === undefined
        ? Infinity
        : utmToAnnualThreshold(monthlyUtmLimit);

    brackets.push({
      min: previousAnnualMax,
      max,
      rate,
    });
    previousAnnualMax = max;
  }

  return brackets;
}

export const CL_PIT_BRACKETS_2026 = buildChilePitBrackets2026();

export const CL_MANDATORY_EMPLOYEE_RATE =
  CL_AFP_EMPLOYEE_RATE + CL_HEALTH_EMPLOYEE_RATE + CL_UNEMPLOYMENT_EMPLOYEE_RATE;
