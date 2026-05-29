"use client";

import { PayFrequencyField } from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import { InfoPanel } from "@/components/calculator/info-panel";
import { PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026 } from "@/lib/countries/ph/constants/tax-parameters-2026";
import type { PHCalculatorInputs } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function PHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
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
        <ContributionSlider
          label="PERA contribution"
          description="5% income tax credit on contributions (max PHP 10,000 credit per year)."
          value={inputs.contributions.peraContribution}
          onChange={(peraContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                peraContribution: clampAmount(peraContribution, PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026),
              },
            }))
          }
          max={PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026}
          step={5000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
    />
  );
}
