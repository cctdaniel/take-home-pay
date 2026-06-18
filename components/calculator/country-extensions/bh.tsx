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
import {
  BH_NATIONALITY_OPTIONS,
  BH_SOURCE_URLS,
} from "@/lib/countries/bh/constants/tax-year-2026";
import type { BHCalculatorInputs, BHNationalityType } from "@/lib/countries/bh/types";

export default function BHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BHCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      hideDefaultSeoTaxInfo
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField
            id="bh-nationality"
            label="Nationality / social insurance"
            value={inputs.nationality}
            onChange={(nationality: BHNationalityType) =>
              setInputs((current) => ({ ...current, nationality }))
            }
            options={[...BH_NATIONALITY_OPTIONS]}
            description="Bahraini nationals: 8% SIO on capped base. Expatriates: 1% unemployment."
          />
          <PayFrequencyField
            id="bh-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="No personal income tax on salary. Bahraini nationals pay 8% SIO; expatriates pay 1% unemployment on gross capped at BHD 4,000/month."
          sourceUrl={BH_SOURCE_URLS.socialInsurance}
          sourceLabel="Social Insurance Organization (SIO)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your nationality above"
      infoCard={
        <InfoPanel title="Modeled scope">
          No personal income tax on employment salary. Popular Gulf base for
          remote workers — foreign income sourcing rules are not modeled here.
        </InfoPanel>
      }
      seoInfo={<BahrainTaxInfo />}
    />
  );
}

function BahrainTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Bahrain</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 0% on
            employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">SIO (Bahraini nationals)</strong> –
            8% employee social insurance on gross capped at BHD 4,000/month.
          </li>
          <li>
            <strong className="text-zinc-300">Unemployment (expatriates)</strong> –
            1% on the same capped base.
          </li>
        </ul>
      </div>
    </section>
  );
}
