import type { CountryConfig } from "../types";

export const BE_CONFIG: CountryConfig = {
  code: "BE",
  name: "Belgium",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "en-IE",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-17",
  supportsFilingStatus: false,
  supportsRegions: false,
};
