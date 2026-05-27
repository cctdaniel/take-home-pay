import { createStandardCountryCalculator } from "../shared/standard-country";
import { SV_CONFIG } from "./config";
import { SV_TAX_CONFIG } from "./constants/tax-year-2026";

export const SVCalculator = createStandardCountryCalculator(
  SV_CONFIG,
  SV_TAX_CONFIG,
);
