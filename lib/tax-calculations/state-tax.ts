import type { StateCalculator } from "./types";
import {
  massachusettsCalculator,
  illinoisCalculator,
  pennsylvaniaCalculator,
  coloradoCalculator,
  northCarolinaCalculator,
  michiganCalculator,
  indianaCalculator,
  utahCalculator,
  arizonaCalculator,
  idahoCalculator,
  kentuckyCalculator,
  mississippiCalculator,
  northDakotaCalculator,
  southCarolinaCalculator,
} from "./state-tax-flat";
import {
  texasCalculator,
  washingtonCalculator,
  floridaCalculator,
  nevadaCalculator,
  wyomingCalculator,
  alaskaCalculator,
  southDakotaCalculator,
  tennesseeCalculator,
  newHampshireCalculator,
} from "./state-tax-none";
import {
  alabamaCalculator,
  arkansasCalculator,
  californiaCalculator,
  connecticutCalculator,
  delawareCalculator,
  dcCalculator,
  georgiaCalculator,
  hawaiiCalculator,
  iowaCalculator,
  kansasCalculator,
  louisianaCalculator,
  maineCalculator,
  marylandCalculator,
  minnesotaCalculator,
  missouriCalculator,
  montanaCalculator,
  nebraskaCalculator,
  newJerseyCalculator,
  newMexicoCalculator,
  newYorkCalculator,
  ohioCalculator,
  oklahomaCalculator,
  oregonCalculator,
  rhodeIslandCalculator,
  vermontCalculator,
  virginiaCalculator,
  westVirginiaCalculator,
  wisconsinCalculator,
} from "./state-tax-progressive";

// State registry for all supported states
const stateCalculators: Record<string, StateCalculator> = {
  // States with progressive income tax
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

  // States with flat income tax
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

  // States with no income tax
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

// States with no income tax
const noIncomeTaxStates = ["TX", "WA", "FL", "NV", "WY", "AK", "SD", "TN", "NH"];

export function getStateCalculator(stateCode: string): StateCalculator | null {
  return stateCalculators[stateCode] || null;
}

export function hasNoIncomeTax(stateCode: string): boolean {
  return noIncomeTaxStates.includes(stateCode);
}

export interface StateInfo {
  code: string;
  name: string;
  taxType: "progressive" | "flat" | "none";
  notes?: string;
}

export function getSupportedStates(): StateInfo[] {
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

// Get states sorted by name for dropdown
export function getStateOptions(): { code: string; name: string }[] {
  return getSupportedStates()
    .map(s => ({ code: s.code, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
