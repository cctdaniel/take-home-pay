import type { CountryConfig } from "../types";

export const DO_CONFIG = {
  code: "DO",
  name: "Dominican Republic",
  region: "Caribbean",
  currency: {
    code: "DOP",
    symbol: "RD$",
    name: "Dominican Peso",
    locale: "es-DO",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
