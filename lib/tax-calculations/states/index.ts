import type { StateCalculator } from "../types";
import { californiaCalculator } from "./california";
import { newYorkCalculator } from "./new-york";
import { newJerseyCalculator } from "./new-jersey";
import { georgiaCalculator } from "./georgia";
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
} from "./flat-tax";
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
} from "./no-tax";

// State registry for all supported states
const stateCalculators: Record<string, StateCalculator> = {
  // States with progressive income tax
  CA: californiaCalculator,
  NY: newYorkCalculator,
  NJ: newJerseyCalculator,
  GA: georgiaCalculator,

  // States with flat income tax
  MA: massachusettsCalculator,
  IL: illinoisCalculator,
  PA: pennsylvaniaCalculator,
  CO: coloradoCalculator,
  NC: northCarolinaCalculator,
  MI: michiganCalculator,
  IN: indianaCalculator,
  UT: utahCalculator,
  AZ: arizonaCalculator,

  // States with no income tax
  TX: texasCalculator,
  WA: washingtonCalculator,
  FL: floridaCalculator,
  NV: nevadaCalculator,
  WY: wyomingCalculator,
  AK: alaskaCalculator,
  SD: southDakotaCalculator,
  TN: tennesseeCalculator,
  NH: newHampshireCalculator,
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
    { code: "GA", name: "Georgia", taxType: "flat", notes: "5.49%" },
    { code: "IL", name: "Illinois", taxType: "flat", notes: "4.95%" },
    { code: "IN", name: "Indiana", taxType: "flat", notes: "3.15%" },
    { code: "MA", name: "Massachusetts", taxType: "flat", notes: "5%" },
    { code: "MI", name: "Michigan", taxType: "flat", notes: "4.25%" },
    { code: "NC", name: "North Carolina", taxType: "flat", notes: "5.25%" },
    { code: "PA", name: "Pennsylvania", taxType: "flat", notes: "3.07%" },
    { code: "UT", name: "Utah", taxType: "flat", notes: "4.85%" },

    // Progressive tax states (alphabetical)
    { code: "CA", name: "California", taxType: "progressive", notes: "1-13.3%" },
    { code: "NJ", name: "New Jersey", taxType: "progressive", notes: "1.4-10.75%" },
    { code: "NY", name: "New York", taxType: "progressive", notes: "4-10.9%" },
  ];
}

// Get states sorted by name for dropdown
export function getStateOptions(): { code: string; name: string }[] {
  return getSupportedStates()
    .map(s => ({ code: s.code, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export { californiaCalculator } from "./california";
export { newYorkCalculator } from "./new-york";
export { newJerseyCalculator } from "./new-jersey";
export { georgiaCalculator } from "./georgia";
