import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function LTResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="LT"
      countryName="Lithuania"
    />
  );
}
