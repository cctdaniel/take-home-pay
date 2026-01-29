import {
  ALABAMA_TAX_BRACKETS,
  AL_STANDARD_DEDUCTIONS,
  ARKANSAS_TAX_BRACKETS,
  AR_STANDARD_DEDUCTIONS,
  CONNECTICUT_TAX_BRACKETS,
  CT_PERSONAL_EXEMPTIONS,
  DELAWARE_TAX_BRACKETS,
  DE_STANDARD_DEDUCTIONS,
  DC_TAX_BRACKETS,
  DC_STANDARD_DEDUCTIONS,
  GEORGIA_TAX_BRACKETS,
  HAWAII_TAX_BRACKETS,
  HI_STANDARD_DEDUCTIONS,
  IOWA_TAX_BRACKETS,
  IA_STANDARD_DEDUCTIONS,
  KANSAS_TAX_BRACKETS,
  KS_STANDARD_DEDUCTIONS,
  LOUISIANA_TAX_BRACKETS,
  LA_PERSONAL_EXEMPTIONS,
  MAINE_TAX_BRACKETS,
  ME_STANDARD_DEDUCTIONS,
  MARYLAND_TAX_BRACKETS,
  MD_STANDARD_DEDUCTIONS,
  MINNESOTA_TAX_BRACKETS,
  MN_STANDARD_DEDUCTIONS,
  MISSOURI_TAX_BRACKETS,
  MO_STANDARD_DEDUCTIONS,
  MONTANA_TAX_BRACKETS,
  MT_STANDARD_DEDUCTIONS,
  NEBRASKA_TAX_BRACKETS,
  NE_STANDARD_DEDUCTIONS,
  NEW_JERSEY_TAX_BRACKETS,
  NEW_MEXICO_TAX_BRACKETS,
  NM_STANDARD_DEDUCTIONS,
  NEW_YORK_TAX_BRACKETS,
  NY_ADDITIONAL_TAXES,
  OHIO_TAX_BRACKETS,
  OH_PERSONAL_EXEMPTIONS,
  OKLAHOMA_TAX_BRACKETS,
  OK_STANDARD_DEDUCTIONS,
  OREGON_TAX_BRACKETS,
  OR_STANDARD_DEDUCTIONS,
  RHODE_ISLAND_TAX_BRACKETS,
  RI_STANDARD_DEDUCTIONS,
  VERMONT_TAX_BRACKETS,
  VT_STANDARD_DEDUCTIONS,
  VIRGINIA_TAX_BRACKETS,
  VA_STANDARD_DEDUCTIONS,
  WEST_VIRGINIA_TAX_BRACKETS,
  WV_PERSONAL_EXEMPTIONS,
  WISCONSIN_TAX_BRACKETS,
  WI_STANDARD_DEDUCTIONS,
} from "../constants/state-tax-brackets-2025";
import {
  CALIFORNIA_TAX_BRACKETS,
} from "../constants/tax-brackets-2026";
import type { FilingStatus, TaxBracket } from "../constants/tax-brackets-2025";
import type { StateCalculator } from "./types";

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
}

interface StateConfig {
  name: string;
  brackets: Record<FilingStatus, TaxBracket[]>;
  deductions?: Record<FilingStatus, number>;
  exemptions?: Record<FilingStatus, number>;
  sdiRate?: number;
  sdiWageBase?: number | null;
}

function createProgressiveCalculator(config: StateConfig): StateCalculator {
  return {
    calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
      const brackets = config.brackets[filingStatus];
      return calculateProgressiveTax(taxableIncome, brackets);
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

// Alabama
export const alabamaCalculator = createProgressiveCalculator({
  name: "Alabama",
  brackets: ALABAMA_TAX_BRACKETS,
  deductions: AL_STANDARD_DEDUCTIONS,
});

// Arkansas
export const arkansasCalculator = createProgressiveCalculator({
  name: "Arkansas",
  brackets: ARKANSAS_TAX_BRACKETS,
  deductions: AR_STANDARD_DEDUCTIONS,
});

// Connecticut
export const connecticutCalculator = createProgressiveCalculator({
  name: "Connecticut",
  brackets: CONNECTICUT_TAX_BRACKETS,
  exemptions: CT_PERSONAL_EXEMPTIONS,
});

// Delaware
export const delawareCalculator = createProgressiveCalculator({
  name: "Delaware",
  brackets: DELAWARE_TAX_BRACKETS,
  deductions: DE_STANDARD_DEDUCTIONS,
});

// District of Columbia
export const dcCalculator = createProgressiveCalculator({
  name: "District of Columbia",
  brackets: DC_TAX_BRACKETS,
  deductions: DC_STANDARD_DEDUCTIONS,
});

// Hawaii
export const hawaiiCalculator = createProgressiveCalculator({
  name: "Hawaii",
  brackets: HAWAII_TAX_BRACKETS,
  deductions: HI_STANDARD_DEDUCTIONS,
  sdiRate: 0.005,
  sdiWageBase: 65600,
});

// Iowa
export const iowaCalculator = createProgressiveCalculator({
  name: "Iowa",
  brackets: IOWA_TAX_BRACKETS,
  deductions: IA_STANDARD_DEDUCTIONS,
});

// Kansas
export const kansasCalculator = createProgressiveCalculator({
  name: "Kansas",
  brackets: KANSAS_TAX_BRACKETS,
  deductions: KS_STANDARD_DEDUCTIONS,
});

// Louisiana
export const louisianaCalculator = createProgressiveCalculator({
  name: "Louisiana",
  brackets: LOUISIANA_TAX_BRACKETS,
  exemptions: LA_PERSONAL_EXEMPTIONS,
});

// Maine
export const maineCalculator = createProgressiveCalculator({
  name: "Maine",
  brackets: MAINE_TAX_BRACKETS,
  deductions: ME_STANDARD_DEDUCTIONS,
});

// Maryland
export const marylandCalculator = createProgressiveCalculator({
  name: "Maryland",
  brackets: MARYLAND_TAX_BRACKETS,
  deductions: MD_STANDARD_DEDUCTIONS,
});

// Minnesota
export const minnesotaCalculator = createProgressiveCalculator({
  name: "Minnesota",
  brackets: MINNESOTA_TAX_BRACKETS,
  deductions: MN_STANDARD_DEDUCTIONS,
});

// Missouri
export const missouriCalculator = createProgressiveCalculator({
  name: "Missouri",
  brackets: MISSOURI_TAX_BRACKETS,
  deductions: MO_STANDARD_DEDUCTIONS,
});

// Montana
export const montanaCalculator = createProgressiveCalculator({
  name: "Montana",
  brackets: MONTANA_TAX_BRACKETS,
  deductions: MT_STANDARD_DEDUCTIONS,
});

// Nebraska
export const nebraskaCalculator = createProgressiveCalculator({
  name: "Nebraska",
  brackets: NEBRASKA_TAX_BRACKETS,
  deductions: NE_STANDARD_DEDUCTIONS,
});

// New Mexico
export const newMexicoCalculator = createProgressiveCalculator({
  name: "New Mexico",
  brackets: NEW_MEXICO_TAX_BRACKETS,
  deductions: NM_STANDARD_DEDUCTIONS,
});

// Ohio
export const ohioCalculator = createProgressiveCalculator({
  name: "Ohio",
  brackets: OHIO_TAX_BRACKETS,
  exemptions: OH_PERSONAL_EXEMPTIONS,
});

// Oklahoma
export const oklahomaCalculator = createProgressiveCalculator({
  name: "Oklahoma",
  brackets: OKLAHOMA_TAX_BRACKETS,
  deductions: OK_STANDARD_DEDUCTIONS,
});

// Oregon
export const oregonCalculator = createProgressiveCalculator({
  name: "Oregon",
  brackets: OREGON_TAX_BRACKETS,
  deductions: OR_STANDARD_DEDUCTIONS,
});

// Rhode Island
export const rhodeIslandCalculator = createProgressiveCalculator({
  name: "Rhode Island",
  brackets: RHODE_ISLAND_TAX_BRACKETS,
  deductions: RI_STANDARD_DEDUCTIONS,
  sdiRate: 0.012,
  sdiWageBase: 89400,
});

// Vermont
export const vermontCalculator = createProgressiveCalculator({
  name: "Vermont",
  brackets: VERMONT_TAX_BRACKETS,
  deductions: VT_STANDARD_DEDUCTIONS,
});

// Virginia
export const virginiaCalculator = createProgressiveCalculator({
  name: "Virginia",
  brackets: VIRGINIA_TAX_BRACKETS,
  deductions: VA_STANDARD_DEDUCTIONS,
});

// West Virginia
export const westVirginiaCalculator = createProgressiveCalculator({
  name: "West Virginia",
  brackets: WEST_VIRGINIA_TAX_BRACKETS,
  exemptions: WV_PERSONAL_EXEMPTIONS,
});

// Wisconsin
export const wisconsinCalculator = createProgressiveCalculator({
  name: "Wisconsin",
  brackets: WISCONSIN_TAX_BRACKETS,
  deductions: WI_STANDARD_DEDUCTIONS,
});

// ============================================================================
// MAJOR STATES WITH CUSTOM SDI LOGIC
// ============================================================================

// California - has SDI with no wage cap
export const californiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = CALIFORNIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: (grossIncome: number) => grossIncome * 0.012, // 1.2% with no cap
  getStateName: () => "California",
};

// Georgia - flat tax (technically progressive with single bracket)
export const georgiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = GEORGIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: () => 0,
  getStateName: () => "Georgia",
};

// New Jersey - has SDI with wage base
export const newJerseyCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = NEW_JERSEY_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: (grossIncome: number) => {
    const wageBase = 165800;
    const rate = 0.006;
    return Math.min(grossIncome, wageBase) * rate;
  },
  getStateName: () => "New Jersey",
};

// New York - has SDI + PFL
export const newYorkCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = NEW_YORK_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: (grossIncome: number) => {
    // SDI: minimal - max ~$31.20/year
    const sdi = Math.min(grossIncome * NY_ADDITIONAL_TAXES.sdiRate, NY_ADDITIONAL_TAXES.sdiMaxAnnual);
    // PFL: Paid Family Leave
    const pflTaxableWages = Math.min(grossIncome, NY_ADDITIONAL_TAXES.pflWageBase);
    const pfl = pflTaxableWages * NY_ADDITIONAL_TAXES.pflRate;
    return sdi + pfl;
  },
  getStateName: () => "New York",
};
