"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { NoPitContributionsNote } from "@/components/calculator/no-pit-contributions-note";
import { SA_NATIONALITY_OPTIONS, SA_SOURCE_URLS } from "@/lib/countries/sa/constants/tax-year-2026";
import type { SACalculatorInputs, SANationalityType } from "@/lib/countries/sa/types";

export default function SACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<SACalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField
            id="sa-nationality"
            label="Nationality / GOSI status"
            value={inputs.nationality}
            onChange={(nationality: SANationalityType) =>
              setInputs((current) => ({ ...current, nationality }))
            }
            options={[...SA_NATIONALITY_OPTIONS]}
            description="Saudi nationals: 10% GOSI on 70% gross proxy, capped at SAR 45,000/month."
          />
          <PayFrequencyField
            id="sa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="GOSI employee 10% for Saudi nationals on 70% of gross (capped); expatriates have no employee GOSI in this model."
          sourceUrl={SA_SOURCE_URLS.gosi}
          sourceLabel="GOSI"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your nationality above"
      seoInfo={<SaudiTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          No personal income tax on wages. GOSI employee contribution for Saudi
          nationals only.
        </InfoPanel>
      }
    />
  );
}

function SaudiTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Saudi Arabia
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 0% on salary
            income for all categories in this model.
          </li>
          <li>
            <strong className="text-zinc-300">GOSI (Saudi nationals)</strong> –
            10% employee contribution on a basic-plus-housing proxy of 70% of
            gross monthly salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
