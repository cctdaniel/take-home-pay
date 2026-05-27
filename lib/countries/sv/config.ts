import type { CountryConfig } from "../types";

export const SV_CONFIG = {
  code: "SV",
  name: "El Salvador",
  region: "Latin America",
  currency: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "es-SV",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
