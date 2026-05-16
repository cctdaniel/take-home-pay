// ============================================================================
// SPAIN IRPF AND SOCIAL SECURITY CONSTANTS
// Tax model year: 2026 payroll contributions, latest official AEAT IRPF
// income-tax scales published for Renta 2025.
// ============================================================================
//
// Official sources:
// - AEAT IRPF 2025 state scale:
//   https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html
// - AEAT IRPF 2025 autonomous scales:
//   https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico.html
// - AEAT personal and family minimums:
//   https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c14-adecuacion-impuesto-circunstancias-personales/cuadro-resumen-minimo-personal-familiar.html
// - BOE 2026 Social Security contribution order:
//   https://www.boe.es/buscar/doc.php?id=BOE-A-2026-7296
// - Seguridad Social 2026 employee/employer rates:
//   https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537
// - AEAT IRNR general non-resident rates:
//   https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/tipos-gravamen-irnr-sin-establecimiento-permanente.html
// - AEAT pension and social welfare contribution reduction limits:
//   https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2025/8-cumplimentacion-irpf/8_2-base-liquidable-general-base-ahorro/8_2_2-reducciones-aportaciones-prevision-social/8_2_2_6-aportaciones-anuales-maximas-limite-reduccion.html
// ============================================================================

import type { TaxBracket } from "../../types";

export type ESRegionCode =
  | "general"
  | "andalucia"
  | "madrid"
  | "cataluna"
  | "valenciana";

export interface ESRegionTaxScale {
  code: ESRegionCode;
  name: string;
  shortName: string;
  brackets: TaxBracket[];
  notes: string;
}

// AEAT state scale for the general taxable base.
export const SPAIN_STATE_IRPF_BRACKETS_2025: TaxBracket[] = [
  { min: 0, max: 12_450, rate: 0.095 },
  { min: 12_450, max: 20_200, rate: 0.12 },
  { min: 20_200, max: 35_200, rate: 0.15 },
  { min: 35_200, max: 60_000, rate: 0.185 },
  { min: 60_000, max: 300_000, rate: 0.225 },
  { min: 300_000, max: Infinity, rate: 0.245 },
];

const GENERAL_AUTONOMOUS_SCALE: TaxBracket[] = [
  { min: 0, max: 12_450, rate: 0.095 },
  { min: 12_450, max: 20_200, rate: 0.12 },
  { min: 20_200, max: 35_200, rate: 0.15 },
  { min: 35_200, max: 60_000, rate: 0.185 },
  { min: 60_000, max: Infinity, rate: 0.225 },
];

export const SPAIN_REGIONAL_IRPF_SCALES_2025: Record<
  ESRegionCode,
  ESRegionTaxScale
> = {
  general: {
    code: "general",
    name: "General autonomous scale",
    shortName: "General",
    brackets: GENERAL_AUTONOMOUS_SCALE,
    notes:
      "Default estimate using a common autonomous scale when a specific region is not selected.",
  },
  andalucia: {
    code: "andalucia",
    name: "Andalusia",
    shortName: "Andalusia",
    brackets: [
      { min: 0, max: 13_000, rate: 0.095 },
      { min: 13_000, max: 21_100, rate: 0.12 },
      { min: 21_100, max: 35_200, rate: 0.15 },
      { min: 35_200, max: 60_000, rate: 0.185 },
      { min: 60_000, max: Infinity, rate: 0.225 },
    ],
    notes: "AEAT Renta 2025 autonomous scale for Andalusia.",
  },
  madrid: {
    code: "madrid",
    name: "Community of Madrid",
    shortName: "Madrid",
    brackets: [
      { min: 0, max: 13_362.22, rate: 0.085 },
      { min: 13_362.22, max: 19_004.63, rate: 0.107 },
      { min: 19_004.63, max: 35_425.68, rate: 0.128 },
      { min: 35_425.68, max: 57_320.4, rate: 0.174 },
      { min: 57_320.4, max: Infinity, rate: 0.205 },
    ],
    notes: "AEAT Renta 2025 autonomous scale for the Community of Madrid.",
  },
  cataluna: {
    code: "cataluna",
    name: "Catalonia",
    shortName: "Catalonia",
    brackets: [
      { min: 0, max: 12_500, rate: 0.095 },
      { min: 12_500, max: 22_000, rate: 0.125 },
      { min: 22_000, max: 33_000, rate: 0.16 },
      { min: 33_000, max: 53_000, rate: 0.19 },
      { min: 53_000, max: 90_000, rate: 0.215 },
      { min: 90_000, max: 120_000, rate: 0.235 },
      { min: 120_000, max: 175_000, rate: 0.245 },
      { min: 175_000, max: Infinity, rate: 0.255 },
    ],
    notes: "AEAT Renta 2025 autonomous scale for Catalonia.",
  },
  valenciana: {
    code: "valenciana",
    name: "Valencian Community",
    shortName: "Valencian Community",
    brackets: [
      { min: 0, max: 12_000, rate: 0.09 },
      { min: 12_000, max: 22_000, rate: 0.12 },
      { min: 22_000, max: 32_000, rate: 0.15 },
      { min: 32_000, max: 42_000, rate: 0.175 },
      { min: 42_000, max: 52_000, rate: 0.2 },
      { min: 52_000, max: 62_000, rate: 0.225 },
      { min: 62_000, max: 72_000, rate: 0.25 },
      { min: 72_000, max: 100_000, rate: 0.265 },
      { min: 100_000, max: 150_000, rate: 0.275 },
      { min: 150_000, max: 200_000, rate: 0.285 },
      { min: 200_000, max: Infinity, rate: 0.295 },
    ],
    notes: "AEAT Renta 2025 autonomous scale for the Valencian Community.",
  },
};

export const SPAIN_REGIONS = Object.values(SPAIN_REGIONAL_IRPF_SCALES_2025);

export const SPAIN_WORK_EXPENSE_DEDUCTION_2025 = 2_000;

export const SPAIN_JOINT_TAXATION_REDUCTIONS_2025 = {
  marriedJointly: 3_400,
  singleParent: 2_150,
};

export const SPAIN_PERSONAL_FAMILY_MINIMUMS_2025 = {
  taxpayer: 5_550,
  ageOver65Increase: 1_150,
  ageOver75Increase: 1_400,
  descendants: [2_400, 2_700, 4_000],
  fourthAndLaterDescendant: 4_500,
  descendantUnderThreeIncrease: 2_800,
};

export const SPAIN_PENSION_CONTRIBUTION_REDUCTION_2025 = {
  individualLimit: 1_500,
  netIncomeLimitRate: 0.3,
  employmentPlanAdditionalLimit: 8_500,
};

export const SPAIN_IRNR_RATES_2026 = {
  euEea: 0.19,
  other: 0.24,
};

export const SPAIN_SOCIAL_SECURITY_2026 = {
  monthlyBaseMax: 5_101.2,
  monthlyBaseMin: 1_424.4,
  commonContingenciesEmployeeRate: 0.047,
  unemploymentPermanentEmployeeRate: 0.0155,
  unemploymentFixedTermEmployeeRate: 0.016,
  trainingEmployeeRate: 0.001,
  meiEmployeeRate: 0.0015,
  commonContingenciesEmployerRate: 0.236,
  unemploymentPermanentEmployerRate: 0.055,
  unemploymentFixedTermEmployerRate: 0.067,
  trainingEmployerRate: 0.006,
  fogasaEmployerRate: 0.002,
  meiEmployerRate: 0.0075,
  solidarityContributionBrackets: [
    {
      minMonthly: 5_101.2,
      maxMonthly: 5_611.32,
      employeeRate: 0.0019,
      employerRate: 0.0096,
    },
    {
      minMonthly: 5_611.32,
      maxMonthly: 7_651.8,
      employeeRate: 0.0021,
      employerRate: 0.0104,
    },
    {
      minMonthly: 7_651.8,
      maxMonthly: Infinity,
      employeeRate: 0.0024,
      employerRate: 0.0122,
    },
  ],
};

export function getSpainRegionScale(regionCode: string): ESRegionTaxScale {
  return (
    SPAIN_REGIONAL_IRPF_SCALES_2025[regionCode as ESRegionCode] ??
    SPAIN_REGIONAL_IRPF_SCALES_2025.general
  );
}

export function calculateSpanishProgressiveTax(
  income: number,
  brackets: TaxBracket[],
): {
  totalTax: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
} {
  const bracketTaxes = brackets
    .map((bracket) => {
      const taxableAmount = Math.max(
        0,
        Math.min(income, bracket.max) - bracket.min,
      );
      return {
        ...bracket,
        tax: taxableAmount * bracket.rate,
      };
    })
    .filter((bracket) => bracket.tax > 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}
