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
import { QA_NATIONALITY_OPTIONS, QA_SOURCE_URLS } from "@/lib/countries/qa/constants/tax-year-2026";
import type { QACalculatorInputs, QANationalityType } from "@/lib/countries/qa/types";

export default function QACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<QACalculatorInputs>(country);

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
            id="qa-nationality"
            label="Nationality / social insurance"
            value={inputs.nationality}
            onChange={(nationality: QANationalityType) =>
              setInputs((current) => ({ ...current, nationality }))
            }
            options={[...QA_NATIONALITY_OPTIONS]}
            description="Qatari nationals: 5% GRSIA employee on 70% gross proxy."
          />
          <PayFrequencyField
            id="qa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="GRSIA employee 5% for Qatari nationals on 70% of gross; expatriates have no employee social insurance in this model."
          sourceUrl={QA_SOURCE_URLS.socialInsurance}
          sourceLabel="General Tax Authority (GTA)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your nationality above"
      seoInfo={<QatarTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          No personal income tax on wages. GRSIA employee social insurance for
          Qatari nationals only.
        </InfoPanel>
      }
    />
  );
}

function QatarTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Qatar</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 0% on salary
            for all categories in this model.
          </li>
          <li>
            <strong className="text-zinc-300">GRSIA (Qatari nationals)</strong> –
            5% employee social insurance on 70% of gross as basic-plus-housing
            proxy.
          </li>
        </ul>
      </div>
    </section>
  );
}
