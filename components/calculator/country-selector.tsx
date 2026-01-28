"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { CountryCode } from "@/lib/countries/types";
import { getSupportedCountries } from "@/lib/countries/registry";

interface CountrySelectorProps {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
}

const countries = getSupportedCountries();

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select
        id="country"
        value={value}
        onChange={(e) => onChange(e.target.value as CountryCode)}
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
