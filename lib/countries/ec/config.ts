import type { CountryConfig } from "../types";

export const EC_CONFIG = {
  code: "EC",
  name: "Ecuador",
  region: "Latin America",
  currency: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "es-EC",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
