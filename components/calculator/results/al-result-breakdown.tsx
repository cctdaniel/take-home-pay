import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function ALResultBreakdown(props: CountryResultBreakdownProps) {
  return (
    <LocalizedCountryResultBreakdown
      {...props}
      expectedCountry="AL"
      countryName="Albania"
      taxableNonCashBenefitsLabel="Taxable benefits in kind"
      taxableGrossIncomeLabel="Albania employment tax and contribution base"
      taxableIncomeLabel="Taxable annual employment base"
      reliefSectionTitle="Albania Allowances and DIVA Deductions"
      taxSectionTitle="Albania Income Tax and Employee Contributions"
      assumptionsTitle="Albania Salary Assumptions"
      exclusionsTitle="Albania Separate Non-Salary Facts"
    />
  );
}
