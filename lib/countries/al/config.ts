import type { CountryConfig } from "../types";

export const AL_CONFIG = {
  code: "AL",
  name: "Albania",
  region: "Europe",
  currency: {
    code: "ALL",
    symbol: "ALL",
    name: "Albanian Lek",
    locale: "sq-AL",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
