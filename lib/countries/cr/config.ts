import type { CountryConfig } from "../types";

export const CR_CONFIG = {
  code: "CR",
  name: "Costa Rica",
  region: "Latin America",
  currency: {
    code: "CRC",
    symbol: "CRC",
    name: "Costa Rican Colon",
    locale: "es-CR",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
