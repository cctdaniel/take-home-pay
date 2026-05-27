"use client";

import { KRAdditionalReliefs } from "@/components/calculator/kr-additional-reliefs";
import { KRTaxOptions } from "@/components/calculator/kr-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { KRCalculatorInputs, KRTaxReliefInputs } from "@/lib/countries/types";

function clampReliefs(reliefs: KRTaxReliefInputs): KRTaxReliefInputs {
  return {
    ...reliefs,
    numberOfDependents: Math.max(0, Math.floor(reliefs.numberOfDependents)),
    numberOfChildrenUnder20: Math.max(
      0,
      Math.floor(reliefs.numberOfChildrenUnder20),
    ),
    numberOfChildrenUnder7: Math.min(
      Math.max(0, Math.floor(reliefs.numberOfChildrenUnder7)),
      Math.max(0, Math.floor(reliefs.numberOfChildrenUnder20)),
    ),
  };
}

export default function KRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<KRCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <KRTaxOptions
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({ ...current, residencyType }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        <KRAdditionalReliefs
          reliefs={inputs.taxReliefs}
          onChange={(taxReliefs) =>
            setInputs((current) => ({
              ...current,
              taxReliefs: clampReliefs(taxReliefs),
            }))
          }
        />
      }
      contributionsTitle="Deductions, Credits, and Allowances"
      contributionsDescription="Dependents, children, non-taxable allowances, pension, insurance, medical, education, donation, and rent credits"
      seoInfo={<KRTaxInfo />}
      infoCard={
        <InfoPanel title="South Korea Payroll Scope">
          <p>
            This models Korean employment salary with resident or non-resident
            treatment, national and local income tax, four major employee social
            insurance contributions, non-taxable meal and childcare allowances,
            dependent deductions, common year-end tax credits, and the
            foreign-employee flat-tax election.
          </p>
          <p className="mt-2">
            National Pension, Health Insurance, Long-term Care, and Employment
            Insurance are automatic salary deductions. Employer-only costs,
            exact year-end settlement paperwork, special foreign engineer
            engineer reductions, related-party eligibility tests, and
            non-employment income require separate facts.
          </p>
        </InfoPanel>
      }
    />
  );
}

function KRTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        South Korea
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Progressive
          rates from 6% to 45% (8 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Local Income Tax</strong> – 10% of
          national income tax
        </li>
        <li>
          <strong className="text-zinc-300">Foreign Employee Flat Tax</strong> –
          eligible foreign employees can elect 19% national tax on gross
          employment income, plus the 10% local tax add-on, instead of ordinary
          deductions and credits
        </li>
        <li>
          <strong className="text-zinc-300">National Pension</strong> – 4.75%
          employee share (capped at ₩6.37M monthly income)
        </li>
        <li>
          <strong className="text-zinc-300">Health Insurance</strong> – 3.595%
          of income
        </li>
        <li>
          <strong className="text-zinc-300">Long-term Care</strong> – 13.14% of
          health insurance premium
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> – 0.9%
          of income
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Ordinary Settlement Deductions &amp; Credits
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Employment Income Deduction</strong>{" "}
          – Tiered deduction up to 70% for lower incomes
        </li>
        <li>
          <strong className="text-zinc-300">Basic Deduction</strong> –
          ₩1,500,000 per taxpayer
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Deduction</strong> –
          ₩1,500,000 per dependent (spouse, parents)
        </li>
        <li>
          <strong className="text-zinc-300">Child Deduction</strong> –
          ₩1,500,000 per child under 20, +₩1,000,000 if under 7
        </li>
        <li>
          <strong className="text-zinc-300">Wage Earner Tax Credit</strong> – Up
          to 55% of tax for lower earners
        </li>
        <li>
          <strong className="text-zinc-300">Standard Tax Credit</strong> –
          ₩130,000 for simplified filers
        </li>
        <li>
          <strong className="text-zinc-300">Child Tax Credit</strong> – ₩150,000
          per child (₩300,000 for 3rd+)
        </li>
        <li>
          <strong className="text-zinc-300">Personal Pension Credit</strong> –
          13.2-16.5% on contributions up to ₩9,000,000
        </li>
        <li>
          <strong className="text-zinc-300">Non-Taxable Allowances</strong> –
          Meal (₩200,000/mo), Childcare (₩100,000/mo)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Additional Tax Credits Available
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Insurance Premium Credit</strong> –
          12% of premiums, capped at ₩1,000,000 (life, casualty insurance)
        </li>
        <li>
          <strong className="text-zinc-300">Medical Expense Credit</strong> –
          15% of expenses exceeding 3% of gross income
        </li>
        <li>
          <strong className="text-zinc-300">Education Expense Credit</strong> –
          15% of education costs (per-person caps apply)
        </li>
        <li>
          <strong className="text-zinc-300">Donation Credit</strong> – 15% for
          first ₩10M, 30% above
        </li>
        <li>
          <strong className="text-zinc-300">Rent Credit (월세)</strong> – 15%
          for total salary up to ₩80M, or 17% for total salary up to ₩55M,
          capped at ₩10M of annual rent
        </li>
      </ul>
    </div>
  );
}

function KRTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How South Korea Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <KRTaxInfoContent />
      </div>
    </section>
  );
}
