import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function LVResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="LV"
      countryName="Latvia"
    />
  );
}
