import type { CountryConfig } from "../types";

export const CL_CONFIG = {
  code: "CL",
  name: "Chile",
  region: "Latin America",
  currency: {
    code: "CLP",
    symbol: "CLP",
    name: "Chilean Peso",
    locale: "es-CL",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
