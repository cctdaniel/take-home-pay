import type { TaxBracket } from "../../types";

export type ARGananciasSemester = "h1" | "h2";

export interface ArGananciasDeductions {
  nonImponible: number;
  /** Art. 30 inc. c) apartado 1 — empleados en relación de dependencia. */
  specialDeduction: number;
  spouseDeduction: number;
  childDeduction: number;
}

export interface ArArt94Slice {
  threshold: number;
  base: number;
  rate: number;
}

export interface ArGananciasSemesterParams {
  semester: ARGananciasSemester;
  /** False when AFIP has not published jul–dic tables for the calendar year. */
  available: boolean;
  deductions: ArGananciasDeductions;
  art94Slices: readonly ArArt94Slice[];
  periodLabel: string;
  sourceUrls: readonly string[];
  /** Shown in UI when `available` is false. */
  unavailableNote?: string;
}

const H1_2026_DEDUCTIONS: ArGananciasDeductions = {
  nonImponible: 5_151_802.5,
  specialDeduction: 18_031_308.76,
  spouseDeduction: 4_851_964.66,
  childDeduction: 2_446_863.48,
};

const H1_2026_ART94: readonly ArArt94Slice[] = [
  { threshold: 0, base: 0, rate: 0.05 },
  { threshold: 2_000_030.09, base: 100_001.5, rate: 0.09 },
  { threshold: 4_000_060.17, base: 280_004.21, rate: 0.12 },
  { threshold: 6_000_090.26, base: 520_007.82, rate: 0.15 },
  { threshold: 9_000_135.4, base: 970_014.59, rate: 0.19 },
  { threshold: 18_000_270.8, base: 2_680_040.32, rate: 0.23 },
  { threshold: 27_000_406.2, base: 4_750_071.46, rate: 0.27 },
  { threshold: 40_500_609.3, base: 8_395_126.3, rate: 0.31 },
  { threshold: 60_750_913.96, base: 14_672_720.74, rate: 0.35 },
];

const H1_2026_SOURCES = [
  "https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf",
  "https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf",
] as const;

const EMPTY_DEDUCTIONS: ArGananciasDeductions = {
  nonImponible: 0,
  specialDeduction: 0,
  spouseDeduction: 0,
  childDeduction: 0,
};

/** Enero–junio 2026 — AFIP RG 4003 (published). */
export const AR_GANANCIAS_H1_2026: ArGananciasSemesterParams = {
  semester: "h1",
  available: true,
  deductions: H1_2026_DEDUCTIONS,
  art94Slices: H1_2026_ART94,
  periodLabel:
    "Enero–junio 2026 per AFIP RG 4003 (deducciones Art. 30 y escala Art. 94).",
  sourceUrls: H1_2026_SOURCES,
};

/**
 * Julio–diciembre 2026 — placeholder until AFIP publishes semester tables.
 * Checked May 2026: jul–dic 2026 PDFs return 404 on afip.gob.ar.
 */
export const AR_GANANCIAS_H2_2026: ArGananciasSemesterParams = {
  semester: "h2",
  available: false,
  deductions: EMPTY_DEDUCTIONS,
  art94Slices: [],
  periodLabel: "Julio–diciembre 2026 (AFIP tables not yet published)",
  sourceUrls: H1_2026_SOURCES,
  unavailableNote:
    "AFIP has not published julio–diciembre 2026 deduction and Art. 94 tables yet. Use enero–junio 2026 until ARCA releases the second-semester PDFs.",
};

export const AR_GANANCIAS_SEMESTERS: Record<
  ARGananciasSemester,
  ArGananciasSemesterParams
> = {
  h1: AR_GANANCIAS_H1_2026,
  h2: AR_GANANCIAS_H2_2026,
};

export function getArGananciasParams(
  semester: ARGananciasSemester,
): ArGananciasSemesterParams {
  return AR_GANANCIAS_SEMESTERS[semester];
}

/** Calendar default: H2 from July when published; otherwise H1. */
export function getDefaultArGananciasSemester(
  now: Date = new Date(),
): ARGananciasSemester {
  const month = now.getMonth() + 1;
  if (month >= 7 && AR_GANANCIAS_H2_2026.available) {
    return "h2";
  }
  return "h1";
}

/** Use requested semester when available; fall back to H1 for unpublished H2. */
export function resolveArGananciasSemester(
  requested?: ARGananciasSemester,
  now: Date = new Date(),
): ARGananciasSemester {
  const semester = requested ?? getDefaultArGananciasSemester(now);
  if (!getArGananciasParams(semester).available) {
    return "h1";
  }
  return semester;
}

export function calculateArGananciasTax(
  gananciaNetaImponible: number,
  art94Slices: readonly ArArt94Slice[] = H1_2026_ART94,
) {
  const income = Math.max(0, gananciaNetaImponible);
  if (art94Slices.length === 0) {
    return { totalTax: 0, bracketTaxes: [] };
  }
  let applicable = art94Slices[0];
  for (const slice of art94Slices) {
    if (income >= slice.threshold) {
      applicable = slice;
    }
  }
  const totalTax =
    Math.round(
      (applicable.base + (income - applicable.threshold) * applicable.rate) * 100,
    ) / 100;

  const bracketTaxes = art94Slices.map((slice, index) => {
    const upper = art94Slices[index + 1]?.threshold ?? Infinity;
    const taxableAmount = Math.max(0, Math.min(income, upper) - slice.threshold);
    return {
      min: slice.threshold,
      max: upper,
      rate: slice.rate,
      tax: Math.round(taxableAmount * slice.rate * 100) / 100,
    };
  });

  return { totalTax, bracketTaxes };
}

export function calculateArFamilyDeductions(
  input: { hasSpouse: boolean; children: number },
  deductions: ArGananciasDeductions = H1_2026_DEDUCTIONS,
): number {
  const spouse = input.hasSpouse ? deductions.spouseDeduction : 0;
  const children = Math.max(0, input.children) * deductions.childDeduction;
  return spouse + children;
}

export function art94SlicesToBrackets(
  art94Slices: readonly ArArt94Slice[],
): TaxBracket[] {
  return art94Slices.map((slice, index) => ({
    min: slice.threshold,
    max: art94Slices[index + 1]?.threshold ?? Infinity,
    rate: slice.rate,
  }));
}

/** Voluntary retirement (aportes voluntarios) — additional ganancias deduction up to 12% of gross. */
export const AR_VOLUNTARY_RETIREMENT_MAX_RATE = 0.12;

export const AR_SOCIAL_2026 = {
  jubilacionRate: 0.11,
  obraSocialRate: 0.03,
  pamiRate: 0.03,
} as const;
