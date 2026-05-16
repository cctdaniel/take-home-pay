"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getSupportedCountries } from "@/lib/countries/registry";
import {
  groupCountriesByRegion,
  type CountryGroup,
} from "@/lib/countries/country-groups";
import type { CountryCode } from "@/lib/countries/types";
import { useRouter } from "next/navigation";

interface CountrySelectorProps {
  value: CountryCode;
}

const countryGroups = groupCountriesByRegion(getSupportedCountries());

function renderCountryGroup(group: CountryGroup) {
  return (
    <optgroup key={group.region} label={group.region}>
      {group.countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </optgroup>
  );
}

/**
 * Country selector that navigates to the selected country's page.
 * Uses router.push to change routes instead of client-side state.
 */
export function CountrySelector({ value }: CountrySelectorProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select
        id="country"
        value={value}
        onChange={(e) => router.push(`/${e.target.value.toLowerCase()}`)}
      >
        {countryGroups.map(renderCountryGroup)}
      </Select>
    </div>
  );
}
