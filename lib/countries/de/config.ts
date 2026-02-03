// ============================================================================
// GERMANY COUNTRY CONFIGURATION
// Tax Year: 2026
// ============================================================================
//
// Official Sources:
// - Federal Ministry of Finance: https://www.bundesfinanzministerium.de/
// - Federal Central Tax Office (BZSt): https://www.bzst.de/
// - German Income Tax Law (EStG): https://www.buzer.de/estg.htm
//
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const DE_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "de-DE",
};

export const DE_CONFIG: CountryConfig = {
  code: "DE",
  name: "Germany",
  currency: DE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-02-02",
  defaultRegion: undefined,
  supportsFilingStatus: false, // Germany uses tax class system (Lohnsteuerklasse), not filing status
  supportsRegions: true, // States affect church tax rate (8% vs 9%)
};

// ============================================================================
// GERMAN FEDERAL STATES (Bundesländer)
// Affects church tax rate (8% in BY/BW, 9% elsewhere)
// ============================================================================
export const DE_FEDERAL_STATES = [
  { code: "BW", name: "Baden-Württemberg", churchTaxRate: 0.08 },
  { code: "BY", name: "Bavaria (Bayern)", churchTaxRate: 0.08 },
  { code: "BE", name: "Berlin", churchTaxRate: 0.09 },
  { code: "BB", name: "Brandenburg", churchTaxRate: 0.09 },
  { code: "HB", name: "Bremen", churchTaxRate: 0.09 },
  { code: "HH", name: "Hamburg", churchTaxRate: 0.09 },
  { code: "HE", name: "Hesse (Hessen)", churchTaxRate: 0.09 },
  { code: "MV", name: "Mecklenburg-Vorpommern", churchTaxRate: 0.09 },
  { code: "NI", name: "Lower Saxony (Niedersachsen)", churchTaxRate: 0.09 },
  { code: "NW", name: "North Rhine-Westphalia (Nordrhein-Westfalen)", churchTaxRate: 0.09 },
  { code: "RP", name: "Rhineland-Palatinate (Rheinland-Pfalz)", churchTaxRate: 0.09 },
  { code: "SL", name: "Saarland", churchTaxRate: 0.09 },
  { code: "SN", name: "Saxony (Sachsen)", churchTaxRate: 0.09 },
  { code: "ST", name: "Saxony-Anhalt (Sachsen-Anhalt)", churchTaxRate: 0.09 },
  { code: "SH", name: "Schleswig-Holstein", churchTaxRate: 0.09 },
  { code: "TH", name: "Thuringia (Thüringen)", churchTaxRate: 0.09 },
];
