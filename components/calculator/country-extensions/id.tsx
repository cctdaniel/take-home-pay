"use client";

import { IDContributionOptions } from "@/components/calculator/id-contribution-options";
import { IDTaxOptions } from "@/components/calculator/id-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { IDCalculator } from "@/lib/countries/id";
import type {
  IDCalculatorInputs,
  IDTaxReliefInputs,
} from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";

export default function IDCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<IDCalculatorInputs>(country);
  const limits = IDCalculator.getContributionLimits(inputs);
  const modeledVoluntaryCashLimit = limits.dplkContribution?.limit ?? 0;
  const dplkContributionLimit = modeledVoluntaryCashLimit;
  const appliedDplkContribution = Math.min(
    inputs.contributions.dplkContribution,
    dplkContributionLimit,
  );
  const zakatContributionLimit = Math.max(
    0,
    modeledVoluntaryCashLimit - appliedDplkContribution,
  );

  const setTaxReliefs = (taxReliefs: IDTaxReliefInputs) => {
    setInputs((current) => ({ ...current, taxReliefs }));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <IDTaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          maritalStatus={inputs.taxReliefs.maritalStatus}
          onMaritalStatusChange={(maritalStatus) =>
            setTaxReliefs({
              ...inputs.taxReliefs,
              maritalStatus,
              spouseIncomeCombined:
                maritalStatus === "married" &&
                inputs.taxReliefs.spouseIncomeCombined,
            })
          }
          numberOfDependents={inputs.taxReliefs.numberOfDependents}
          onNumberOfDependentsChange={(numberOfDependents) =>
            setTaxReliefs({
              ...inputs.taxReliefs,
              numberOfDependents,
            })
          }
          spouseIncomeCombined={inputs.taxReliefs.spouseIncomeCombined}
          onSpouseIncomeCombinedChange={(spouseIncomeCombined) =>
            setTaxReliefs({
              ...inputs.taxReliefs,
              spouseIncomeCombined,
            })
          }
        />
      }
      contributions={
        <IDContributionOptions
          dplkContribution={Math.min(
            inputs.contributions.dplkContribution,
            dplkContributionLimit,
          )}
          onDplkContributionChange={(dplkContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                dplkContribution: clampAmount(
                  dplkContribution,
                  dplkContributionLimit,
                ),
              },
            }))
          }
          dplkContributionLimit={dplkContributionLimit}
          zakatContribution={Math.min(
            inputs.contributions.zakatContribution,
            zakatContributionLimit,
          )}
          onZakatContributionChange={(zakatContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                zakatContribution: clampAmount(
                  zakatContribution,
                  zakatContributionLimit,
                ),
              },
            }))
          }
          zakatContributionLimit={zakatContributionLimit}
        />
      }
      contributionsTitle="Indonesia DPLK and Zakat Deductions"
      contributionsDescription="Resident DPLK pension savings and approved zakat deductions; BPJS is automatic"
      seoInfo={<IDTaxInfo />}
      infoCard={
        <InfoPanel title="Indonesia Payroll Scope">
          <p>
            This models resident employment salary for annual PPh 21 using PTKP
            family status, the job-expense deduction, employee BPJS Kesehatan,
            JHT, and JP deductions, plus selected DPLK and approved zakat
            amounts.
          </p>
          <p className="mt-2">
            DPLK and zakat are modeled as employee cash outflows that also
            reduce taxable income. Final employer TER withholding timing,
            annual filing reconciliation, THR/bonus timing, non-salary income,
            and employer BPJS shares are outside this salary take-home view.
          </p>
        </InfoPanel>
      }
    />
  );
}

function IDTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Indonesia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">PPh 21 (Income Tax)</strong> –
          Progressive rates from 5% to 35% (5 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Job Expense Deduction</strong> –
          5% of gross income, capped at Rp6,000,000/year
        </li>
        <li>
          <strong className="text-zinc-300">PTKP (Non-Taxable Income)</strong> –
          Rp54,000,000 for individual, plus Rp4,500,000 if married, plus Rp4,500,000 per dependent (max 3)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS Kesehatan</strong> – 1% employee
          contribution (capped at Rp12,000,000/month wage base)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS JHT (Old Age)</strong> – 2%
          employee contribution (no cap)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS JP (Pension)</strong> – 1%
          employee contribution (capped at Rp11,086,300/month wage base from March 2026)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        PPh 21 Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Rp0 – Rp60,000,000: 5%</li>
        <li>Rp60,000,001 – Rp250,000,000: 15%</li>
        <li>Rp250,000,001 – Rp500,000,000: 25%</li>
        <li>Rp500,000,001 – Rp5,000,000,000: 30%</li>
        <li>Rp5,000,000,001+: 35%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        PTKP (Penghasilan Tidak Kena Pajak) Allowances
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Individual taxpayer: Rp54,000,000</li>
        <li>Married taxpayer: Additional Rp4,500,000</li>
        <li>Dependents: Rp4,500,000 each (maximum 3)</li>
        <li>Spouse with combined income: Additional Rp54,000,000</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        BPJS Contributions (Employee Share)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Health Insurance (Kesehatan): 1% (capped at Rp120,000/month)</li>
        <li>Old Age Security (JHT): 2% (no cap)</li>
        <li>Pension (JP): 1% (capped at Rp110,863/month from March 2026)</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        Employers contribute additional amounts: 4% for health, 3.7% for JHT, and 2% for JP.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Voluntary Tax-Deductible Contributions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">DPLK (Pension Fund)</strong> – 
          Voluntary contributions to Dana Pensiun Lembaga Keuangan are modeled
          as tax-deductible employee cash outflows with no general annual
          statutory cap modeled
        </li>
        <li>
          <strong className="text-zinc-300">Zakat</strong> – 
          Zakat paid through the employer to BAZNAS or authorized institutions
          reduces taxable income and cash take-home when entered, with no
          general annual statutory cap modeled
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Calculation Method
      </h4>
      <p className="text-zinc-400 text-sm">
        Indonesia uses a gross-to-net calculation method: Gross Income → Job Expense Deduction →
        BPJS pension deductions and selected DPLK/zakat deductions = Net Income.
        Net Income → PTKP = Taxable Income (rounded down to nearest Rp1,000).
        Taxable Income is then subject to progressive PPh 21 rates. DPLK and
        zakat entries also reduce cash take-home in this salary model.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax rates based on Undang-Undang Nomor 7 Tahun 2021 (HPP Law) and PMK 168/2023.
        BPJS rates based on BPJS Ketenagakerjaan and BPJS Kesehatan regulations effective 2026.
      </p>
    </div>
  );
}

function IDTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Indonesia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <IDTaxInfoContent />
      </div>
    </section>
  );
}
