"use client";

import {
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import type { BRCalculatorInputs } from "@/lib/countries/br/types";
import { clampAmount } from "@/lib/utils";

export default function BRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<BRCalculatorInputs>(country);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);
  const privatePensionLimit = limits.privatePension?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <CountStepperField
            spanColumns={2}
            id="br-dependents"
            label="Dependents (IRPF)"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({ ...current, numberOfDependents }))
            }
            min={0}
            max={10}
            description="R$189.59/month deduction per dependent."
          />
          <PayFrequencyField
            id="br-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Private pension (PGBL/VGBL)"
          description="Previdência privada deductible from IRPF base up to 12% of gross annual income."
          value={inputs.contributions.privatePension}
          onChange={(privatePension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                privatePension: clampAmount(privatePension, privatePensionLimit),
              },
            }))
          }
          max={privatePensionLimit}
          step={500}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your IRPF tax base"
      seoInfo={<BrazilTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Employment salary with INSS progressive bands, IRPF 2025 monthly table,
          dependent deductions, and optional PGBL/VGBL. FGTS employer deposit
          excluded from employee take-home.
        </InfoPanel>
      }
    />
  );
}

function BrazilTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Brazil</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">INSS</strong> – progressive
            employee bands up to 14% with monthly ceiling R$8,157.41.
          </li>
          <li>
            <strong className="text-zinc-300">IRPF</strong> – 2025 monthly
            progressive table on taxable salary after INSS, dependents, and
            private pension.
          </li>
          <li>
            <strong className="text-zinc-300">Private pension</strong> – PGBL/VGBL
            up to 12% of gross reduces the IRPF base.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net equals gross
            minus INSS, IRPF, and voluntary pension contributions.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.gov.br/receitafederal/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Receita Federal
          </a>
        </p>
      </div>
    </section>
  );
}
