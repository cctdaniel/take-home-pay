import type { TaxBracket } from "../../types";

export const MEXICO_TAX_YEAR = 2026;

export interface MexicoIsrBracket extends TaxBracket {
  fixedFee: number;
}

// 2026 annualized ISR tariff for resident salary income, derived from the
// official SAT/DOF monthly Article 96 payroll table in Anexo 8.
export const MEXICO_ISR_BRACKETS_2026: MexicoIsrBracket[] = [
  { min: 0, max: 10_135.08, fixedFee: 0, rate: 0.0192 },
  { min: 10_135.08, max: 86_022.12, fixedFee: 194.64, rate: 0.064 },
  { min: 86_022.12, max: 151_176.24, fixedFee: 5_051.4, rate: 0.1088 },
  { min: 151_176.24, max: 175_735.68, fixedFee: 12_140.16, rate: 0.16 },
  { min: 175_735.68, max: 210_403.68, fixedFee: 16_069.68, rate: 0.1792 },
  { min: 210_403.68, max: 424_353.96, fixedFee: 22_282.08, rate: 0.2136 },
  { min: 424_353.96, max: 668_840.16, fixedFee: 67_981.92, rate: 0.2352 },
  { min: 668_840.16, max: 1_276_926, fixedFee: 125_485.08, rate: 0.30 },
  { min: 1_276_926, max: 1_702_567.92, fixedFee: 307_910.76, rate: 0.32 },
  { min: 1_702_567.92, max: 5_107_703.88, fixedFee: 444_116.28, rate: 0.34 },
  { min: 5_107_703.88, max: Infinity, fixedFee: 1_601_862.48, rate: 0.35 },
];

export const MEXICO_STATES = [
  { code: "AGU", name: "Aguascalientes" },
  { code: "BCN", name: "Baja California" },
  { code: "BCS", name: "Baja California Sur" },
  { code: "CAM", name: "Campeche" },
  { code: "CHP", name: "Chiapas" },
  { code: "CHH", name: "Chihuahua" },
  { code: "CMX", name: "Ciudad de México" },
  { code: "COA", name: "Coahuila" },
  { code: "COL", name: "Colima" },
  { code: "DUR", name: "Durango" },
  { code: "GUA", name: "Guanajuato" },
  { code: "GRO", name: "Guerrero" },
  { code: "HID", name: "Hidalgo" },
  { code: "JAL", name: "Jalisco" },
  { code: "MEX", name: "Estado de México" },
  { code: "MIC", name: "Michoacán" },
  { code: "MOR", name: "Morelos" },
  { code: "NAY", name: "Nayarit" },
  { code: "NLE", name: "Nuevo León" },
  { code: "OAX", name: "Oaxaca" },
  { code: "PUE", name: "Puebla" },
  { code: "QUE", name: "Querétaro" },
  { code: "ROO", name: "Quintana Roo" },
  { code: "SLP", name: "San Luis Potosí" },
  { code: "SIN", name: "Sinaloa" },
  { code: "SON", name: "Sonora" },
  { code: "TAB", name: "Tabasco" },
  { code: "TAM", name: "Tamaulipas" },
  { code: "TLA", name: "Tlaxcala" },
  { code: "VER", name: "Veracruz" },
  { code: "YUC", name: "Yucatán" },
  { code: "ZAC", name: "Zacatecas" },
] as const;

export type MexicoStateCode = (typeof MEXICO_STATES)[number]["code"];

export const MEXICO_VOLUNTARY_RETIREMENT_2026 = {
  deductionRateLimit: 0.10,
  modeledAnnualCap: 213_973.2,
};

export const MEXICO_PERSONAL_DEDUCTIONS_2026 = {
  generalDeductionRateLimit: 0.15,
  modeledGeneralDeductionCap: 213_973.2,
  educationDeductionCap: 24_500,
};

export const MEXICO_UMA_2026 = {
  daily: 117.31,
  monthly: 3_566.22,
  annual: 42_794.64,
};

export const MEXICO_SALARY_EXEMPTIONS_2026 = {
  statutoryAguinaldoDays: 15,
  aguinaldoExemptUmaDays: 30,
  vacationPremiumExemptUmaDays: 15,
  ptuExemptUmaDays: 15,
};

export const MEXICO_EMPLOYMENT_SUBSIDY_2026 = {
  monthlyIncomeThreshold: 11_492.66,
  monthlyUmaRate: 0.1502,
};

export const MEXICO_IMSS_2026 = {
  dailyUma: MEXICO_UMA_2026.daily,
  capDailySbcMultiplierOfUma: 25,
  excessOverThreeUmaRate: 0.004,
  pensionerMedicalRate: 0.00375,
  sicknessMaternityCashRate: 0.0025,
  disabilityLifeRate: 0.00625,
  oldAgeRetirementRate: 0.01125,
};

export const MEXICO_SOURCE_URLS = [
  "https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rmf/anexos/Anexo-8-RMF-2026_DOF-28122025.pdf",
  "https://www.sat.gob.mx/cs/Satellite?blobcol=urldata&blobkey=id&blobtable=MungoBlobs&blobwhere=1461176519730&ssbinary=true",
  "https://www.sat.gob.mx/consultas/97722/comprobante-de-nomina",
  "https://www.gob.mx/profedet/articulos/consulta-aqui-las-preguntas-frecuentes-sobre-el-aguinaldo",
  "https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/uma/uma2026.pdf",
  "https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf",
  "https://idconline.mx/seguridad-social/2025/01/13/factores-para-cuotas-y-aportaciones-2025",
];
