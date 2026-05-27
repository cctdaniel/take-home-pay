import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function BMResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="BM"
      countryName="Bermuda"
      taxableNonCashBenefitsLabel="Taxable Cash or In-Kind Benefits"
      taxableGrossIncomeLabel="Payroll-Tax Remuneration Base"
      taxSectionTitle="Bermuda Payroll Tax And Social Insurance"
    />
  );
}
