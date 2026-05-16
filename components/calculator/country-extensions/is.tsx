"use client";

import type { CountryCalculatorExtensionProps } from "@/components/calculator/country-extension";
import { NordicSimpleExtension } from "@/components/calculator/nordic-simple-extension";

export default function ISCountryExtension({ country }: CountryCalculatorExtensionProps) {
  return (
    <NordicSimpleExtension
      country={country}
      description="This models ordinary Iceland employment salary for a full tax year using the calculator's current national assumptions."
      exclusions="Municipality-specific refinements, special expatriate regimes, non-salary income, capital income, employer-only costs, and family benefit programs are outside this first-pass salary model."
    />
  );
}
