import type { CountryConfig } from "../types";

export const BB_CONFIG = {
  code: "BB",
  name: "Barbados",
  region: "Caribbean",
  currency: {
    code: "BBD",
    symbol: "Bds$",
    name: "Barbadian Dollar",
    locale: "en-BB",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
