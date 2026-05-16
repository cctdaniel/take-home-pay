import type { CountryCode } from "./types";

export type CountryRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Middle East"
  | "Other";

export interface GroupedCountryOption {
  code: CountryCode;
  name: string;
}

export interface CountryGroup {
  region: CountryRegion;
  countries: GroupedCountryOption[];
}

export const COUNTRY_REGION_ORDER: CountryRegion[] = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Middle East",
  "Other",
];

export const COUNTRY_REGION_BY_CODE: Record<string, CountryRegion> = {
  AE: "Middle East",
  AU: "Asia-Pacific",
  CN: "Asia-Pacific",
  CY: "Europe",
  CZ: "Europe",
  DE: "Europe",
  DK: "Europe",
  ES: "Europe",
  FI: "Europe",
  GE: "Europe",
  GR: "Europe",
  HK: "Asia-Pacific",
  HR: "Europe",
  ID: "Asia-Pacific",
  IN: "Asia-Pacific",
  IS: "Europe",
  JP: "Asia-Pacific",
  KR: "Asia-Pacific",
  MT: "Europe",
  MY: "Asia-Pacific",
  NL: "Europe",
  NO: "Europe",
  PH: "Asia-Pacific",
  PT: "Europe",
  SE: "Europe",
  SG: "Asia-Pacific",
  TH: "Asia-Pacific",
  TW: "Asia-Pacific",
  UK: "Europe",
  US: "North America",
  VN: "Asia-Pacific",
};

export function groupCountriesByRegion(
  countries: GroupedCountryOption[],
): CountryGroup[] {
  const grouped = new Map<CountryRegion, GroupedCountryOption[]>();

  for (const country of countries) {
    const region = COUNTRY_REGION_BY_CODE[country.code] ?? "Other";
    const regionCountries = grouped.get(region) ?? [];
    regionCountries.push(country);
    grouped.set(region, regionCountries);
  }

  return COUNTRY_REGION_ORDER.map((region) => ({
    region,
    countries: [...(grouped.get(region) ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })).filter((group) => group.countries.length > 0);
}
