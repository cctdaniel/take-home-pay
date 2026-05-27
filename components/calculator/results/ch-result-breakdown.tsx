import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function CHResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="CH"
      countryName="Switzerland"
      taxSectionTitle="Swiss Federal, Cantonal, Municipal And Payroll Deductions"
    />
  );
}
