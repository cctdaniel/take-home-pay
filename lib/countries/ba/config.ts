import type { CountryConfig } from "../types";

export const BA_CONFIG = {
  code: "BA",
  name: "Bosnia and Herzegovina",
  region: "Europe",
  currency: {
    code: "BAM",
    symbol: "KM",
    name: "Bosnia-Herzegovina Convertible Mark",
    locale: "bs-BA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
