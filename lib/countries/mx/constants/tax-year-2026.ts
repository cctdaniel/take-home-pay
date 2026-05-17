import type { TaxBracket } from "../../types";

export const MEXICO_TAX_YEAR = 2026;

export interface MexicoIsrBracket extends TaxBracket {
  fixedFee: number;
}

// 2026 annual ISR tariff for resident salary income.
export const MEXICO_ISR_BRACKETS_2026: MexicoIsrBracket[] = [
  { min: 0, max: 9_363.07, fixedFee: 0, rate: 0.0192 },
  { min: 9_363.07, max: 79_456.11, fixedFee: 179.78, rate: 0.064 },
  { min: 79_456.11, max: 139_615.36, fixedFee: 4_665.73, rate: 0.1088 },
  { min: 139_615.36, max: 162_286.70, fixedFee: 11_211.08, rate: 0.16 },
  { min: 162_286.70, max: 194_070.91, fixedFee: 14_838.49, rate: 0.1792 },
  { min: 194_070.91, max: 391_997.87, fixedFee: 20_534.22, rate: 0.2136 },
  { min: 391_997.87, max: 617_853.46, fixedFee: 62_807.76, rate: 0.2352 },
  { min: 617_853.46, max: 1_179_328.56, fixedFee: 115_927.39, rate: 0.30 },
  { min: 1_179_328.56, max: 1_572_438.08, fixedFee: 284_369.92, rate: 0.32 },
  { min: 1_572_438.08, max: 4_717_314.24, fixedFee: 410_165.09, rate: 0.34 },
  { min: 4_717_314.24, max: Infinity, fixedFee: 1_479_422.98, rate: 0.35 },
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
  modeledAnnualCap: 206_367,
};

export const MEXICO_PERSONAL_DEDUCTIONS_2026 = {
  generalDeductionRateLimit: 0.15,
  modeledGeneralDeductionCap: 206_367,
  educationDeductionCap: 24_500,
};

export const MEXICO_IMSS_2026 = {
  dailyUma: 113.14,
  capDailySbcMultiplierOfUma: 25,
  excessOverThreeUmaRate: 0.004,
  pensionerMedicalRate: 0.00375,
  sicknessMaternityCashRate: 0.0025,
  disabilityLifeRate: 0.00625,
  oldAgeRetirementRate: 0.01125,
};

export const MEXICO_SOURCE_URLS = [
  "https://portalsat.com.mx/tablas-isr-2026/",
  "https://idconline.mx/fiscal-contable/2025/12/30/tablas-y-tarifas-isr-2026-nueva-actualizacion",
  "https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf",
  "https://idconline.mx/seguridad-social/2025/01/13/factores-para-cuotas-y-aportaciones-2025",
];
