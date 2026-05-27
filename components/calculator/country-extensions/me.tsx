"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ME_MUNICIPAL_SURTAX_RATES } from "@/lib/countries/me/constants/tax-year-2026";
import type {
  MECalculatorInputs,
  MEIncomeScenario,
  MEMunicipalSurtaxRate,
} from "@/lib/countries/me/types";

export default function MontenegroCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<MECalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="me-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="me-income-scenario"
            label="Income Scenario"
            value={inputs.incomeScenario}
            onChange={(incomeScenario) =>
              setInputs((current) => ({
                ...current,
                incomeScenario: incomeScenario as MEIncomeScenario,
                taxableNonCashBenefits:
                  incomeScenario === "digitalNomadForeignSource"
                    ? 0
                    : current.taxableNonCashBenefits,
              }))
            }
            options={[
              {
                value: "montenegroPayroll",
                label: "Montenegro payroll salary",
              },
              {
                value: "digitalNomadForeignSource",
                label: "Digital nomad foreign-source",
              },
            ]}
            description="Use the digital-nomad scenario only for qualifying foreign-source income from an employer or own company not registered in Montenegro."
          />
          {inputs.incomeScenario === "montenegroPayroll" ? (
            <CurrencyAmountField
              id="me-taxable-benefits-in-kind"
              label="Taxable Benefits in Kind"
              value={inputs.taxableNonCashBenefits ?? 0}
              onChange={(taxableNonCashBenefits) =>
                setInputs((current) => ({
                  ...current,
                  taxableNonCashBenefits: Math.max(
                    0,
                    taxableNonCashBenefits,
                  ),
                }))
              }
              currency={currency}
              min={0}
              step={100}
              description="Annual taxable value of non-cash or in-kind employee benefits. It increases PIT and employee contribution bases but is not cash salary."
            />
          ) : null}
          <SelectField
            id="me-municipal-surtax-rate"
            label="Municipal Surtax Context"
            value={inputs.municipalSurtaxRate}
            onChange={(municipalSurtaxRate) =>
              setInputs((current) => ({
                ...current,
                municipalSurtaxRate:
                  municipalSurtaxRate as MEMunicipalSurtaxRate,
              }))
            }
            options={[
              {
                value: "standard13",
                label: `${ME_MUNICIPAL_SURTAX_RATES.standard13.name} 13%`,
              },
              {
                value: "podgoricaCetinje15",
                label: `${ME_MUNICIPAL_SURTAX_RATES.podgoricaCetinje15.name} 15%`,
              },
              {
                value: "budva10",
                label: `${ME_MUNICIPAL_SURTAX_RATES.budva10.name} 10%`,
              },
            ]}
            description="Shown for employer-cost context; municipal surtax is not deducted from employee net pay."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Montenegro Payroll Scenario Notes"
      contributionsDescription="Payroll, digital-nomad foreign-source treatment, taxable benefits, and municipal context are selected above"
      contributionsEmptyState="The page exposes the payroll versus qualifying digital-nomad foreign-source scenario, taxable in-kind benefits, and municipal surtax context above. The reviewed Montenegro salary rules tax gross personal earnings, so voluntary pension, donation, family, medical, and education amounts are not shown as ordinary employee salary deductions."
      infoCard={
        <InfoPanel title="Montenegro Payroll Scope">
          <p>
            Net salary deducts employee pension and disability insurance at 10%,
            employee unemployment insurance at 0.5%, and progressive salary
            income tax for Montenegro payroll salary. Qualifying digital-nomad
            foreign-source income is modeled with no Montenegro PIT or employee
            social contribution deduction.
          </p>
          <p className="mt-2">
            Taxable benefits in kind are shown as a separate annual value for
            ordinary Montenegro payroll salary, because they increase the tax
            and contribution base without increasing cash paid to the employee.
          </p>
          <p className="mt-2">
            Municipal surtax is shown as employer-cost context because it is not
            deducted from employee take-home pay in the gross-to-net salary
            model.
          </p>
          <p className="mt-2">
            No voluntary pension, donation, family, medical, or education
            deduction slider is shown for ordinary salary because the reviewed
            Montenegro salary rules tax gross personal earnings and do not
            provide a general employee salary deduction for those amounts.
          </p>
        </InfoPanel>
      }
      seoInfo={<MontenegroTaxInfo />}
    />
  );
}

function MontenegroTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Montenegro Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - salary is
            taxed at 0% up to EUR 700 per month, 9% from EUR 700.01 to EUR
            1,000, and 15% above EUR 1,000.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong> -
            take-home pay deducts 10% pension and disability insurance plus
            0.5% unemployment insurance from gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Benefits in Kind</strong> -
            entered taxable non-cash benefits are added to the PIT and employee
            contribution bases, but not to cash salary.
          </li>
          <li>
            <strong className="text-zinc-300">Municipal Surtax</strong> - local
            surtax is calculated on personal income tax, but the selected
            municipality rate is modeled as employer-cost context rather than an
            employee net-pay deduction.
          </li>
          <li>
            <strong className="text-zinc-300">Digital Nomad Scenario</strong> -
            qualifying foreign-source income from a foreign employer or own
            company not registered in Montenegro is modeled with no Montenegro
            salary PIT or employee social insurance deduction.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus employee contributions and personal income
            tax.
          </li>
        </ul>
      </div>
    </section>
  );
}
