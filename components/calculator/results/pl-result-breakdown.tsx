import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function PLResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="PL"
      countryName="Poland"
    />
  );
}
