import type { CountryConfig } from "../types";

export const BR_CONFIG = {
  code: "BR",
  name: "Brazil",
  region: "Latin America",
  currency: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    locale: "pt-BR",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
