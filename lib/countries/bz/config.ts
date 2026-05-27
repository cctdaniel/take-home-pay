import type { CountryConfig } from "../types";

export const BZ_CONFIG = {
  code: "BZ",
  name: "Belize",
  region: "Latin America",
  currency: {
    code: "BZD",
    symbol: "BZ$",
    name: "Belize Dollar",
    locale: "en-BZ",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
