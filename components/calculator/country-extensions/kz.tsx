"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { KZ_SOURCE_URLS } from "@/lib/countries/kz/constants/tax-year-2026";
import type { KZCalculatorInputs } from "@/lib/countries/kz/types";

export default function KZCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<KZCalculatorInputs>(country);

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
          <PayFrequencyField
            id="kz-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Kazakhstan mandatory OPC and OMIC are calculated automatically and reduce your IIT base. Employee-controlled voluntary pension or savings top-ups that reduce payroll IIT are not modeled here."
          mandatoryLabel="OPC 10%, OMIC 2% (capped), standard 360 MCI deduction, and progressive IIT."
          sourceUrl={KZ_SOURCE_URLS.governmentPortal}
          sourceLabel="Government of Kazakhstan"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your income above"
      infoCard={
        <InfoPanel title="Modeled scope">
          Resident employment salary with standard deduction, OPC, OMIC, and
          progressive IIT at 10% / 15%.
        </InfoPanel>
      }
      seoInfo={<KazakhstanTaxInfo />}
    />
  );
}

function KazakhstanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="mb-2 mt-6 text-lg font-medium text-zinc-300">
          Kazakhstan
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">OPC</strong> – 10% employee
            pension on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">OMIC</strong> – 2% employee health
            on gross, capped at 20× minimum wage per month.
          </li>
          <li>
            <strong className="text-zinc-300">IIT</strong> – 10% on taxable
            income up to 8,500 MCI; 15% on the excess after standard deduction
            and social deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
