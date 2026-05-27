import type { CountryConfig } from "../types";

export const PA_CONFIG = {
  code: "PA",
  name: "Panama",
  region: "Latin America",
  currency: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "es-PA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
