import { COUNTRY_RESULT_BREAKDOWNS } from "./country-result-breakdowns.generated";
import type { CountryResultBreakdownProps } from "./types";

export function CountryResultBreakdown(props: CountryResultBreakdownProps) {
  const Component = COUNTRY_RESULT_BREAKDOWNS[props.result.country];

  if (!Component) {
    return null;
  }

  return <>{Component(props)}</>;
}
