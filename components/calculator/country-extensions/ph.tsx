"use client";

import { PayFrequencyField } from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { PHCalculatorInputs } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function PHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PHCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <div className="space-y-4">
          <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />

          <InfoPanel title="Philippines assumptions" tone="neutral">
            Modeled with 2026 TRAIN law income tax brackets (0–35%). SSS
            contributions use the 2026 schedule with MSC from 4,000 PHP to
            32,500 PHP. PhilHealth at 2.5% (employee share) on monthly salary
            (floor 10,000 PHP, ceiling 100,000 PHP). Pag-IBIG at 2% (employee
            share) on monthly salary up to 5,000 PHP ceiling. 13th month pay,
            de minimis benefits, employer contributions, and self-employment
            are excluded.
          </InfoPanel>
        </div>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="PERA retirement contributions receive tax credits on the annual income tax return; they are not deducted from employer monthly payroll withholding in this calculator."
          mandatoryLabel="SSS, PhilHealth, Pag-IBIG, and withholding tax on compensation."
          sourceUrl="https://www.bir.gov.ph/"
          sourceLabel="Bureau of Internal Revenue"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="PERA tax benefits are outside monthly payroll withholding"
    />
  );
}
