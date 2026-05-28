import type { CountryConfig, CurrencyConfig } from "../types";

export const BR_CURRENCY: CurrencyConfig = {
  code: "BRL",
  symbol: "R$",
  name: "Brazilian Real",
  locale: "pt-BR",
};

export const BR_CONFIG: CountryConfig = {
  code: "BR",
  name: "Brazil",
  region: "South America",
  currency: BR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
