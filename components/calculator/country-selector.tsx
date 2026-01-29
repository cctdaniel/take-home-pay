"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getSupportedCountries } from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";
import { useRouter } from "next/navigation";

interface CountrySelectorProps {
  value: CountryCode;
}

const countries = getSupportedCountries();

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
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
