import type { CountryCode } from "@/lib/countries/types";
import type { ReactNode } from "react";
import { GRResultBreakdown } from "./gr-result-breakdown";
import { MYResultBreakdown } from "./my-result-breakdown";
import type { CountryResultBreakdownProps } from "./types";

type CountryResultBreakdownComponent = (
  props: CountryResultBreakdownProps,
) => ReactNode;

const COUNTRY_RESULT_BREAKDOWNS: Partial<
  Record<CountryCode, CountryResultBreakdownComponent>
> = {
  GR: GRResultBreakdown,
  MY: MYResultBreakdown,
};

export function CountryResultBreakdown(props: CountryResultBreakdownProps) {
  const Component = COUNTRY_RESULT_BREAKDOWNS[props.result.country];

  if (!Component) {
    return null;
  }

  return <>{Component(props)}</>;
}
