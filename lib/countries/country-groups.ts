import type { CountryCode, CountryRegion } from "./types";

export interface GroupedCountryOption {
  code: CountryCode;
  name: string;
  region: CountryRegion;
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
];

export function groupCountriesByRegion(
  countries: GroupedCountryOption[],
): CountryGroup[] {
  const grouped = new Map<CountryRegion, GroupedCountryOption[]>();

  for (const country of countries) {
    const regionCountries = grouped.get(country.region) ?? [];
    regionCountries.push(country);
    grouped.set(country.region, regionCountries);
  }

  return COUNTRY_REGION_ORDER.map((region) => ({
    region,
    countries: [...(grouped.get(region) ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })).filter((group) => group.countries.length > 0);
}
