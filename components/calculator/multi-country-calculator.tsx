"use client";

import type { CountryCode } from "@/lib/countries/types";
import { COUNTRY_CALCULATOR_EXTENSIONS } from "./country-extensions.generated";

interface MultiCountryCalculatorProps {
  country: CountryCode;
}

export function MultiCountryCalculator({
  country,
}: MultiCountryCalculatorProps) {
  const Extension = COUNTRY_CALCULATOR_EXTENSIONS[country];

  if (!Extension) {
    throw new Error(`Missing calculator extension for ${country}`);
  }

  return <Extension country={country} />;
}
