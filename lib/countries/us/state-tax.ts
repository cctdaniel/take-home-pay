// ============================================================================
// US STATE TAX CALCULATIONS
// ============================================================================

import type { TaxBracket, USFilingStatus, RegionInfo } from "../types";
import * as brackets from "./constants/state-tax-brackets";
import { CALIFORNIA_TAX_BRACKETS, CA_STANDARD_DEDUCTIONS } from "./constants/tax-brackets-2026";

// ============================================================================
// STATE CALCULATOR INTERFACE
// ============================================================================
export interface StateCalculator {
  calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => number;
  calculateSDI: (grossIncome: number) => number;
  getStateName: () => string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function calculateProgressiveTax(income: number, taxBrackets: TaxBracket[]): number {
  let tax = 0;

  for (const bracket of taxBrackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
}

interface StateConfig {
  name: string;
  brackets: Record<USFilingStatus, TaxBracket[]>;
  deductions?: Record<USFilingStatus, number>;
  exemptions?: Record<USFilingStatus, number>;
  sdiRate?: number;
  sdiWageBase?: number | null;
}

function createProgressiveCalculator(config: StateConfig): StateCalculator {
  return {
    calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
      const stateBrackets = config.brackets[filingStatus];
      return calculateProgressiveTax(taxableIncome, stateBrackets);
    },
    calculateSDI: (grossIncome: number) => {
      if (!config.sdiRate) return 0;
      const base = config.sdiWageBase;
      const taxableWages = base !== null && base !== undefined ? Math.min(grossIncome, base) : grossIncome;
      return taxableWages * config.sdiRate;
    },
    getStateName: () => config.name,
  };
}

function createFlatTaxCalculator(stateCode: string, name: string): StateCalculator {
  const rate = brackets.FLAT_TAX_RATES[stateCode];
  const deductions = brackets.FLAT_TAX_STATE_DEDUCTIONS[stateCode];

  if (rate === undefined) {
    throw new Error(`Unknown flat tax state: ${stateCode}`);
  }

  return {
    calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
      const deduction = deductions?.[filingStatus] ?? 0;
      const adjustedIncome = Math.max(0, taxableIncome - deduction);
      return adjustedIncome * rate;
    },
    calculateSDI: () => 0,
    getStateName: () => name,
  };
}

function createNoTaxCalculator(name: string): StateCalculator {
  return {
    calculateStateTax: () => 0,
    calculateSDI: () => 0,
    getStateName: () => name,
  };
}

// ============================================================================
// STATE CALCULATORS
// ============================================================================

// Progressive tax states
const alabamaCalculator = createProgressiveCalculator({
  name: "Alabama",
  brackets: brackets.ALABAMA_TAX_BRACKETS,
  deductions: brackets.AL_STANDARD_DEDUCTIONS,
});

const arkansasCalculator = createProgressiveCalculator({
  name: "Arkansas",
  brackets: brackets.ARKANSAS_TAX_BRACKETS,
  deductions: brackets.AR_STANDARD_DEDUCTIONS,
});

const californiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
    const stateBrackets = CALIFORNIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, stateBrackets);
  },
  calculateSDI: (grossIncome: number) => grossIncome * 0.012,
  getStateName: () => "California",
};

const connecticutCalculator = createProgressiveCalculator({
  name: "Connecticut",
  brackets: brackets.CONNECTICUT_TAX_BRACKETS,
  exemptions: brackets.CT_PERSONAL_EXEMPTIONS,
});

const delawareCalculator = createProgressiveCalculator({
  name: "Delaware",
  brackets: brackets.DELAWARE_TAX_BRACKETS,
  deductions: brackets.DE_STANDARD_DEDUCTIONS,
});

const dcCalculator = createProgressiveCalculator({
  name: "District of Columbia",
  brackets: brackets.DC_TAX_BRACKETS,
  deductions: brackets.DC_STANDARD_DEDUCTIONS,
});

const georgiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
    const stateBrackets = brackets.GEORGIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, stateBrackets);
  },
  calculateSDI: () => 0,
  getStateName: () => "Georgia",
};

const hawaiiCalculator = createProgressiveCalculator({
  name: "Hawaii",
  brackets: brackets.HAWAII_TAX_BRACKETS,
  deductions: brackets.HI_STANDARD_DEDUCTIONS,
  sdiRate: 0.005,
  sdiWageBase: 65600,
});

const iowaCalculator = createProgressiveCalculator({
  name: "Iowa",
  brackets: brackets.IOWA_TAX_BRACKETS,
  deductions: brackets.IA_STANDARD_DEDUCTIONS,
});

const kansasCalculator = createProgressiveCalculator({
  name: "Kansas",
  brackets: brackets.KANSAS_TAX_BRACKETS,
  deductions: brackets.KS_STANDARD_DEDUCTIONS,
});

const louisianaCalculator = createProgressiveCalculator({
  name: "Louisiana",
  brackets: brackets.LOUISIANA_TAX_BRACKETS,
  exemptions: brackets.LA_PERSONAL_EXEMPTIONS,
});

const maineCalculator = createProgressiveCalculator({
  name: "Maine",
  brackets: brackets.MAINE_TAX_BRACKETS,
  deductions: brackets.ME_STANDARD_DEDUCTIONS,
});

const marylandCalculator = createProgressiveCalculator({
  name: "Maryland",
  brackets: brackets.MARYLAND_TAX_BRACKETS,
  deductions: brackets.MD_STANDARD_DEDUCTIONS,
});

const minnesotaCalculator = createProgressiveCalculator({
  name: "Minnesota",
  brackets: brackets.MINNESOTA_TAX_BRACKETS,
  deductions: brackets.MN_STANDARD_DEDUCTIONS,
});

const missouriCalculator = createProgressiveCalculator({
  name: "Missouri",
  brackets: brackets.MISSOURI_TAX_BRACKETS,
  deductions: brackets.MO_STANDARD_DEDUCTIONS,
});

const montanaCalculator = createProgressiveCalculator({
  name: "Montana",
  brackets: brackets.MONTANA_TAX_BRACKETS,
  deductions: brackets.MT_STANDARD_DEDUCTIONS,
});

const nebraskaCalculator = createProgressiveCalculator({
  name: "Nebraska",
  brackets: brackets.NEBRASKA_TAX_BRACKETS,
  deductions: brackets.NE_STANDARD_DEDUCTIONS,
});

const newJerseyCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
    const stateBrackets = brackets.NEW_JERSEY_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, stateBrackets);
  },
  calculateSDI: (grossIncome: number) => {
    const wageBase = 165800;
    const rate = 0.006;
    return Math.min(grossIncome, wageBase) * rate;
  },
  getStateName: () => "New Jersey",
};

const newMexicoCalculator = createProgressiveCalculator({
  name: "New Mexico",
  brackets: brackets.NEW_MEXICO_TAX_BRACKETS,
  deductions: brackets.NM_STANDARD_DEDUCTIONS,
});

const newYorkCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: USFilingStatus) => {
    const stateBrackets = brackets.NEW_YORK_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, stateBrackets);
  },
  calculateSDI: (grossIncome: number) => {
    const sdi = Math.min(grossIncome * brackets.NY_ADDITIONAL_TAXES.sdiRate, brackets.NY_ADDITIONAL_TAXES.sdiMaxAnnual);
    const pflTaxableWages = Math.min(grossIncome, brackets.NY_ADDITIONAL_TAXES.pflWageBase);
    const pfl = pflTaxableWages * brackets.NY_ADDITIONAL_TAXES.pflRate;
    return sdi + pfl;
  },
  getStateName: () => "New York",
};

const ohioCalculator = createProgressiveCalculator({
  name: "Ohio",
  brackets: brackets.OHIO_TAX_BRACKETS,
  exemptions: brackets.OH_PERSONAL_EXEMPTIONS,
});

const oklahomaCalculator = createProgressiveCalculator({
  name: "Oklahoma",
  brackets: brackets.OKLAHOMA_TAX_BRACKETS,
  deductions: brackets.OK_STANDARD_DEDUCTIONS,
});

const oregonCalculator = createProgressiveCalculator({
  name: "Oregon",
  brackets: brackets.OREGON_TAX_BRACKETS,
  deductions: brackets.OR_STANDARD_DEDUCTIONS,
});

const rhodeIslandCalculator = createProgressiveCalculator({
  name: "Rhode Island",
  brackets: brackets.RHODE_ISLAND_TAX_BRACKETS,
  deductions: brackets.RI_STANDARD_DEDUCTIONS,
  sdiRate: 0.012,
  sdiWageBase: 89400,
});

const vermontCalculator = createProgressiveCalculator({
  name: "Vermont",
  brackets: brackets.VERMONT_TAX_BRACKETS,
  deductions: brackets.VT_STANDARD_DEDUCTIONS,
});

const virginiaCalculator = createProgressiveCalculator({
  name: "Virginia",
  brackets: brackets.VIRGINIA_TAX_BRACKETS,
  deductions: brackets.VA_STANDARD_DEDUCTIONS,
});

const westVirginiaCalculator = createProgressiveCalculator({
  name: "West Virginia",
  brackets: brackets.WEST_VIRGINIA_TAX_BRACKETS,
  exemptions: brackets.WV_PERSONAL_EXEMPTIONS,
});

const wisconsinCalculator = createProgressiveCalculator({
  name: "Wisconsin",
  brackets: brackets.WISCONSIN_TAX_BRACKETS,
  deductions: brackets.WI_STANDARD_DEDUCTIONS,
});

// Flat tax states
const massachusettsCalculator = createFlatTaxCalculator("MA", "Massachusetts");
const illinoisCalculator = createFlatTaxCalculator("IL", "Illinois");
const pennsylvaniaCalculator = createFlatTaxCalculator("PA", "Pennsylvania");
const coloradoCalculator = createFlatTaxCalculator("CO", "Colorado");
const northCarolinaCalculator = createFlatTaxCalculator("NC", "North Carolina");
const michiganCalculator = createFlatTaxCalculator("MI", "Michigan");
const indianaCalculator = createFlatTaxCalculator("IN", "Indiana");
const utahCalculator = createFlatTaxCalculator("UT", "Utah");
const arizonaCalculator = createFlatTaxCalculator("AZ", "Arizona");
const idahoCalculator = createFlatTaxCalculator("ID", "Idaho");
const kentuckyCalculator = createFlatTaxCalculator("KY", "Kentucky");
const mississippiCalculator = createFlatTaxCalculator("MS", "Mississippi");
const northDakotaCalculator = createFlatTaxCalculator("ND", "North Dakota");
const southCarolinaCalculator = createFlatTaxCalculator("SC", "South Carolina");

// No income tax states
const texasCalculator = createNoTaxCalculator("Texas");
const washingtonCalculator = createNoTaxCalculator("Washington");
const floridaCalculator = createNoTaxCalculator("Florida");
const nevadaCalculator = createNoTaxCalculator("Nevada");
const wyomingCalculator = createNoTaxCalculator("Wyoming");
const alaskaCalculator = createNoTaxCalculator("Alaska");
const southDakotaCalculator = createNoTaxCalculator("South Dakota");
const tennesseeCalculator = createNoTaxCalculator("Tennessee");
const newHampshireCalculator = createNoTaxCalculator("New Hampshire");

// ============================================================================
// STATE REGISTRY
// ============================================================================
const stateCalculators: Record<string, StateCalculator> = {
  // Progressive tax states
  AL: alabamaCalculator,
  AR: arkansasCalculator,
  CA: californiaCalculator,
  CT: connecticutCalculator,
  DE: delawareCalculator,
  DC: dcCalculator,
  GA: georgiaCalculator,
  HI: hawaiiCalculator,
  IA: iowaCalculator,
  KS: kansasCalculator,
  LA: louisianaCalculator,
  ME: maineCalculator,
  MD: marylandCalculator,
  MN: minnesotaCalculator,
  MO: missouriCalculator,
  MT: montanaCalculator,
  NE: nebraskaCalculator,
  NJ: newJerseyCalculator,
  NM: newMexicoCalculator,
  NY: newYorkCalculator,
  OH: ohioCalculator,
  OK: oklahomaCalculator,
  OR: oregonCalculator,
  RI: rhodeIslandCalculator,
  VT: vermontCalculator,
  VA: virginiaCalculator,
  WV: westVirginiaCalculator,
  WI: wisconsinCalculator,

  // Flat tax states
  AZ: arizonaCalculator,
  CO: coloradoCalculator,
  ID: idahoCalculator,
  IL: illinoisCalculator,
  IN: indianaCalculator,
  KY: kentuckyCalculator,
  MA: massachusettsCalculator,
  MI: michiganCalculator,
  MS: mississippiCalculator,
  NC: northCarolinaCalculator,
  ND: northDakotaCalculator,
  PA: pennsylvaniaCalculator,
  SC: southCarolinaCalculator,
  UT: utahCalculator,

  // No income tax states
  AK: alaskaCalculator,
  FL: floridaCalculator,
  NV: nevadaCalculator,
  NH: newHampshireCalculator,
  SD: southDakotaCalculator,
  TN: tennesseeCalculator,
  TX: texasCalculator,
  WA: washingtonCalculator,
  WY: wyomingCalculator,
};

// ============================================================================
// EXPORTS
// ============================================================================
const noIncomeTaxStates = ["TX", "WA", "FL", "NV", "WY", "AK", "SD", "TN", "NH"];

export function getStateCalculator(stateCode: string): StateCalculator | null {
  return stateCalculators[stateCode] || null;
}

export function hasNoIncomeTax(stateCode: string): boolean {
  return noIncomeTaxStates.includes(stateCode);
}

export function getSupportedStates(): RegionInfo[] {
  return [
    // No income tax states (alphabetical)
    { code: "AK", name: "Alaska", taxType: "none" },
    { code: "FL", name: "Florida", taxType: "none" },
    { code: "NV", name: "Nevada", taxType: "none" },
    { code: "NH", name: "New Hampshire", taxType: "none", notes: "No wage tax" },
    { code: "SD", name: "South Dakota", taxType: "none" },
    { code: "TN", name: "Tennessee", taxType: "none" },
    { code: "TX", name: "Texas", taxType: "none" },
    { code: "WA", name: "Washington", taxType: "none" },
    { code: "WY", name: "Wyoming", taxType: "none" },

    // Flat tax states (alphabetical)
    { code: "AZ", name: "Arizona", taxType: "flat", notes: "2.5%" },
    { code: "CO", name: "Colorado", taxType: "flat", notes: "4.4%" },
    { code: "GA", name: "Georgia", taxType: "flat", notes: "5.39%" },
    { code: "ID", name: "Idaho", taxType: "flat", notes: "5.8%" },
    { code: "IL", name: "Illinois", taxType: "flat", notes: "4.95%" },
    { code: "IN", name: "Indiana", taxType: "flat", notes: "3.05%" },
    { code: "KY", name: "Kentucky", taxType: "flat", notes: "4%" },
    { code: "MA", name: "Massachusetts", taxType: "flat", notes: "5%" },
    { code: "MI", name: "Michigan", taxType: "flat", notes: "4.25%" },
    { code: "MS", name: "Mississippi", taxType: "flat", notes: "5%" },
    { code: "NC", name: "North Carolina", taxType: "flat", notes: "5.25%" },
    { code: "ND", name: "North Dakota", taxType: "flat", notes: "1.95%" },
    { code: "PA", name: "Pennsylvania", taxType: "flat", notes: "3.07%" },
    { code: "SC", name: "South Carolina", taxType: "flat", notes: "6.4%" },
    { code: "UT", name: "Utah", taxType: "flat", notes: "4.85%" },

    // Progressive tax states (alphabetical)
    { code: "AL", name: "Alabama", taxType: "progressive", notes: "2-5%" },
    { code: "AR", name: "Arkansas", taxType: "progressive", notes: "2-3.9%" },
    { code: "CA", name: "California", taxType: "progressive", notes: "1-13.3%" },
    { code: "CT", name: "Connecticut", taxType: "progressive", notes: "3-6.99%" },
    { code: "DC", name: "District of Columbia", taxType: "progressive", notes: "4-10.75%" },
    { code: "DE", name: "Delaware", taxType: "progressive", notes: "2.2-6.6%" },
    { code: "HI", name: "Hawaii", taxType: "progressive", notes: "1.4-11%" },
    { code: "IA", name: "Iowa", taxType: "progressive", notes: "4.4-5.7%" },
    { code: "KS", name: "Kansas", taxType: "progressive", notes: "3.1-5.7%" },
    { code: "LA", name: "Louisiana", taxType: "progressive", notes: "1.85-4.25%" },
    { code: "ME", name: "Maine", taxType: "progressive", notes: "5.8-7.15%" },
    { code: "MD", name: "Maryland", taxType: "progressive", notes: "2-5.75%" },
    { code: "MN", name: "Minnesota", taxType: "progressive", notes: "5.35-9.85%" },
    { code: "MO", name: "Missouri", taxType: "progressive", notes: "2-4.8%" },
    { code: "MT", name: "Montana", taxType: "progressive", notes: "4.7-5.9%" },
    { code: "NE", name: "Nebraska", taxType: "progressive", notes: "2.46-5.84%" },
    { code: "NJ", name: "New Jersey", taxType: "progressive", notes: "1.4-10.75%" },
    { code: "NM", name: "New Mexico", taxType: "progressive", notes: "1.7-5.9%" },
    { code: "NY", name: "New York", taxType: "progressive", notes: "4-10.9%" },
    { code: "OH", name: "Ohio", taxType: "progressive", notes: "0-3.5%" },
    { code: "OK", name: "Oklahoma", taxType: "progressive", notes: "0.25-4.75%" },
    { code: "OR", name: "Oregon", taxType: "progressive", notes: "4.75-9.9%" },
    { code: "RI", name: "Rhode Island", taxType: "progressive", notes: "3.75-5.99%" },
    { code: "VT", name: "Vermont", taxType: "progressive", notes: "3.35-8.75%" },
    { code: "VA", name: "Virginia", taxType: "progressive", notes: "2-5.75%" },
    { code: "WV", name: "West Virginia", taxType: "progressive", notes: "2.36-5.12%" },
    { code: "WI", name: "Wisconsin", taxType: "progressive", notes: "3.5-7.65%" },
  ];
}

export function getStateOptions(): { code: string; name: string }[] {
  return getSupportedStates()
    .map(s => ({ code: s.code, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Re-export California brackets for backwards compatibility
export { CALIFORNIA_TAX_BRACKETS, CA_STANDARD_DEDUCTIONS };
