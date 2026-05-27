"use client";

import { PTTaxOptions } from "@/components/calculator/pt-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { PTCalculator } from "@/lib/countries/pt";
import type { PTCalculatorInputs } from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function PTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<PTCalculatorInputs>(country);
  const contributionLimits = PTCalculator.getContributionLimits(inputs);
  const pprLimit = contributionLimits.ppr?.limit ?? 0;
  const pprTaxCredit = pprLimit * 0.2;
  const isResident = inputs.residencyType !== "non_resident";

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <PTTaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({
              ...current,
              residencyType,
              irsJovemYear:
                residencyType === "resident" ? current.irsJovemYear : "none",
              contributions:
                residencyType === "non_resident"
                  ? { ...current.contributions, pprContribution: 0 }
                  : current.contributions,
            }))
          }
          filingStatus={inputs.filingStatus}
          onFilingStatusChange={(filingStatus) =>
            setInputs((current) => ({ ...current, filingStatus }))
          }
          numberOfDependents={inputs.numberOfDependents}
          onNumberOfDependentsChange={(numberOfDependents) =>
            setInputs((current) => ({ ...current, numberOfDependents }))
          }
          age={inputs.age}
          onAgeChange={(age) =>
            setInputs((current) => ({
              ...current,
              age,
              contributions: {
                ...current.contributions,
                pprContribution: clampAmount(
                  current.contributions.pprContribution,
                  PTCalculator.getContributionLimits({ age }).ppr?.limit ??
                    pprLimit,
                ),
              },
            }))
          }
          irsJovemYear={inputs.irsJovemYear ?? "none"}
          onIrsJovemYearChange={(irsJovemYear) =>
            setInputs((current) => ({ ...current, irsJovemYear }))
          }
        />
      }
      contributions={
        isResident ? (
          <div className="space-y-6">
            <ContributionSlider
              label="PPR Contribution (Retirement Savings Plan)"
              description={`20% tax credit on contributions; age-based limit EUR ${pprLimit.toLocaleString()} for a maximum EUR ${pprTaxCredit.toLocaleString()} credit.`}
              value={Math.min(inputs.contributions.pprContribution, pprLimit)}
              onChange={(pprContribution) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    pprContribution: clampAmount(pprContribution, pprLimit),
                  },
                }))
              }
              max={pprLimit}
              currency={currency}
            />
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              PPR contributions are modeled as employee cash savings that
              generate a resident IRS credit. The age-based contribution cap is
              separate from mandatory Social Security, which is calculated
              automatically.
            </p>
          </div>
        ) : undefined
      }
      contributionsTitle="Portugal PPR Retirement Credit"
      contributionsDescription="Resident PPR retirement savings eligible for the IRS tax credit"
      contributionsEmptyState="PPR tax credits are modeled for Portuguese tax residents and NHR 2.0 residents only; non-resident salary uses the flat employment rate with no PPR credit input and would require separate resident eligibility facts."
      seoInfo={<PTTaxInfo />}
      infoCard={
        <InfoPanel title="Portugal Payroll Scope">
          <p>
            This models Portugal employment income with resident progressive
            IRS, non-resident flat tax, or selected NHR 2.0 treatment, plus
            employee Social Security where applicable.
          </p>
          <p className="mt-2">
            Filing status, dependents, IRS Jovem, age-based PPR credits,
            solidarity surcharge, and NHR 2.0 comparison are modeled. Expense
            deductions, local withholding timing, and non-salary income need
            separate taxpayer facts.
          </p>
        </InfoPanel>
      }
    />
  );
}

function PTTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Portugal</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">IRS (Income Tax)</strong> –
          Progressive rates from 12.5% to 48% (9 brackets for residents)
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – 11%
          employee contribution (Segurança Social)
        </li>
        <li>
          <strong className="text-zinc-300">Specific Deduction</strong> – Minimum
          €4,104 or actual SS contributions (whichever is higher)
        </li>
        <li>
          <strong className="text-zinc-300">IRS Jovem</strong> – Youth
          employment-income exemption for eligible ordinary residents, modeled
          up to 10 years and capped annually
        </li>
        <li>
          <strong className="text-zinc-300">Solidarity Surcharge</strong> –
          Additional 2.5% (€80k-€250k) and 5% (above €250k)
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Flat 25%
          rate on Portuguese-source income
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        IRS Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>€0 – €7,703: 13%</li>
        <li>€7,703 – €11,623: 16.5%</li>
        <li>€11,623 – €16,472: 22%</li>
        <li>€16,472 – €21,321: 25%</li>
        <li>€21,321 – €27,146: 32%</li>
        <li>€27,146 – €39,791: 35.5%</li>
        <li>€39,791 – €43,081: 43.5%</li>
        <li>€43,081 – €58,528: 45%</li>
        <li>€58,528+: 48%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Solidarity Surcharge (Adicional de Solidariedade)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Income €80,000 – €250,000: 2.5%</li>
        <li>Income above €250,000: 5%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        NHR 2.0 (Non-Habitual Resident) Regime
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        The NHR 2.0 tax regime, introduced in 2024, offers significant tax benefits 
        for new residents who have not been tax residents in Portugal for the previous 5 years.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">20% Flat Tax Rate</strong> –
          On Portuguese-source employment and self-employment income (vs progressive rates up to 48%)
        </li>
        <li>
          <strong className="text-zinc-300">Duration</strong> –
          10 consecutive years from the year of registration
        </li>
        <li>
          <strong className="text-zinc-300">Exemptions</strong> –
          Exempt from solidarity surcharge on high incomes
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> –
          Still applies at 11% (mandatory contributions)
        </li>
        <li>
          <strong className="text-zinc-300">Eligibility</strong> –
          Must not have been a Portuguese tax resident in the 5 years prior to application
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Benefits & Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">PPR (Retirement Savings Plan)</strong> –
          20% tax credit on contributions. Limits: €2,000 (under 35), €1,750 (35-50), €1,500 (over 50)
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Deductions</strong> –
          €600 per dependent deducted from tax assessed
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employer Contributions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employers contribute an additional 23.75% for Social Security.
        This is not deducted from your salary but is shown for reference.
      </p>
    </div>
  );
}

function PTTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Portugal Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <PTTaxInfoContent />
      </div>
    </section>
  );
}
