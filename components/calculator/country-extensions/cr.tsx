"use client";

import {
  BooleanSelectField,
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
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import {
  CR_CHILD_TAX_CREDIT_MONTHLY_2026,
  CR_MAX_DEPENDENT_CHILDREN,
  CR_SOURCE_URLS,
  CR_SPOUSE_TAX_CREDIT_MONTHLY_2026,
} from "@/lib/countries/cr/constants/tax-year-2026";
import type { CRCalculatorInputs } from "@/lib/countries/cr/types";
import { clampCount } from "@/lib/utils";

export default function CRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<CRCalculatorInputs>(country);

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
          <CountStepperField
            spanColumns={2}
            id="cr-dependent-children"
            label="Dependent children"
            description={`₡${CR_CHILD_TAX_CREDIT_MONTHLY_2026.toLocaleString("es-CR")} monthly tax credit each`}
            value={inputs.dependentChildren}
            onChange={(dependentChildren) =>
              setInputs((current) => ({
                ...current,
                dependentChildren: clampCount(
                  dependentChildren,
                  CR_MAX_DEPENDENT_CHILDREN,
                ),
              }))
            }
            min={0}
            max={CR_MAX_DEPENDENT_CHILDREN}
          />
          <BooleanSelectField
            id="cr-spouse-credit"
            label="Spouse tax credit"
            value={inputs.spouseCredit === 1}
            onChange={(hasSpouseCredit) =>
              setInputs((current) => ({
                ...current,
                spouseCredit: hasSpouseCredit ? 1 : 0,
              }))
            }
            trueLabel="Eligible spouse"
            falseLabel="No spouse credit"
            description={`₡${CR_SPOUSE_TAX_CREDIT_MONTHLY_2026.toLocaleString("es-CR")} monthly credit when eligible`}
          />
          <PayFrequencyField
            id="cr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Costa Rica employee CCSS is mandatory and calculated automatically. Voluntary pension or savings contributions that reduce payroll income tax are not modeled in this calculator."
          mandatoryLabel="CCSS 10.83% employee and progressive monthly salary tax with optional family credits."
          sourceUrl={CR_SOURCE_URLS.hacienda}
          sourceLabel="Ministerio de Hacienda"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your income above"
      infoCard={
        <InfoPanel title="Modeled scope">
          Salaried employee with CCSS withholding and Decree 45333-H monthly
          salary tax tariff. Child and spouse credits reduce monthly tax when
          eligible.
        </InfoPanel>
      }
      seoInfo={<CostaRicaTaxInfo />}
    />
  );
}

function CostaRicaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="mb-2 mt-6 text-lg font-medium text-zinc-300">
          Costa Rica
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">CCSS</strong> – 10.83% employee
            (SEM 5.50%, IVM 4.33%, Banco Popular 1.00%) on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Salary tax</strong> – progressive
            monthly tariff from ₡0 to 25% on monthly gross, annualized after
            credits.
          </li>
          <li>
            <strong className="text-zinc-300">Credits</strong> – ₡1,710 per
            child and ₡2,590 for eligible spouse each month.
          </li>
        </ul>
      </div>
    </section>
  );
}
