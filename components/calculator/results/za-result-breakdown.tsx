import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function ZAResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="ZA"
      countryName="South Africa"
      taxableNonCashBenefitsLabel="Taxable Fringe Benefits"
      taxableGrossIncomeLabel="PAYE / UIF Remuneration Base"
      taxSectionTitle="South Africa PAYE And UIF"
    />
  );
}
