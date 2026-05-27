"use client";

import { ESTaxOptions } from "@/components/calculator/es-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { ESCalculator } from "@/lib/countries/es";
import type { ESCalculatorInputs } from "@/lib/countries/es";
import { clampAmount } from "@/lib/utils";

function getPensionLimit(inputs: ESCalculatorInputs) {
  return ESCalculator.getContributionLimits(inputs).pensionContribution?.limit ?? 0;
}

export default function ESCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ESCalculatorInputs>(country);
  const pensionLimit = getPensionLimit(inputs);

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimit = getPensionLimit(nextInputs);

      return {
        ...nextInputs,
        contributions: {
          pensionContribution: clampAmount(
            current.contributions.pensionContribution,
            nextLimit,
          ),
        },
      };
    });
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <ESTaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => {
              const nextInputs = {
                ...current,
                residencyType,
                taxRegime:
                  residencyType === "resident" ? current.taxRegime : "ordinary",
              };
              const nextLimit = getPensionLimit(nextInputs);

              return {
                ...nextInputs,
                contributions: {
                  pensionContribution: clampAmount(
                    current.contributions.pensionContribution,
                    nextLimit,
                  ),
                },
              };
            })
          }
          taxRegime={inputs.taxRegime ?? "ordinary"}
          onTaxRegimeChange={(taxRegime) =>
            setInputs((current) => {
              const nextInputs = {
                ...current,
                taxRegime:
                  current.residencyType === "resident" ? taxRegime : "ordinary",
              };
              const nextLimit = getPensionLimit(nextInputs);

              return {
                ...nextInputs,
                contributions: {
                  pensionContribution:
                    nextInputs.taxRegime === "beckhamLaw"
                      ? 0
                      : clampAmount(
                          current.contributions.pensionContribution,
                          nextLimit,
                        ),
                },
              };
            })
          }
          region={inputs.region}
          onRegionChange={(region) =>
            setInputs((current) => ({ ...current, region }))
          }
          filingStatus={inputs.filingStatus}
          onFilingStatusChange={(filingStatus) =>
            setInputs((current) => ({ ...current, filingStatus }))
          }
          age={inputs.age}
          onAgeChange={(age) => setInputs((current) => ({ ...current, age }))}
          numberOfChildren={inputs.numberOfChildren}
          onNumberOfChildrenChange={(numberOfChildren) =>
            setInputs((current) => ({
              ...current,
              numberOfChildren,
              numberOfChildrenUnderThree: Math.min(
                current.numberOfChildrenUnderThree,
                numberOfChildren,
              ),
            }))
          }
          numberOfChildrenUnderThree={inputs.numberOfChildrenUnderThree}
          onNumberOfChildrenUnderThreeChange={(numberOfChildrenUnderThree) =>
            setInputs((current) => ({
              ...current,
              numberOfChildrenUnderThree: Math.min(
                numberOfChildrenUnderThree,
                current.numberOfChildren,
              ),
            }))
          }
          employmentContractType={inputs.employmentContractType}
          onEmploymentContractTypeChange={(employmentContractType) =>
            setInputs((current) => {
              const nextInputs = { ...current, employmentContractType };
              const nextLimit = getPensionLimit(nextInputs);

              return {
                ...nextInputs,
                contributions: {
                  pensionContribution: clampAmount(
                    current.contributions.pensionContribution,
                    nextLimit,
                  ),
                },
              };
            })
          }
        />
      }
      contributions={
        pensionLimit > 0 ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Pension Plan Contribution"
              description="Resident pension and social-welfare contributions reduce the general taxable base, capped at EUR 1,500 and 30% of net work income."
              value={Math.min(
                inputs.contributions.pensionContribution,
                pensionLimit,
              )}
              onChange={(pensionContribution) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    pensionContribution: clampAmount(
                      pensionContribution,
                      pensionLimit,
                    ),
                  },
                }))
              }
              max={pensionLimit}
              currency={currency}
            />
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              This models the basic individual reduction. Employer-plan
              additional limits are not shown because they depend on employer
              contributions and plan-specific conditions.
            </p>
          </div>
        ) : undefined
      }
      contributionsTitle="Spain Pension Plan Reduction"
      contributionsDescription="Ordinary-resident pension and social-welfare contribution reduction"
      contributionsEmptyState="Pension contribution reductions are modeled for ordinary Spanish tax residents only; non-resident and Article 93 / Beckham-law salary regimes use flat employment tax without ordinary IRPF reductions and require separate ordinary-resident facts."
      seoInfo={<ESTaxInfo />}
      infoCard={
        <InfoPanel title="Spain Payroll Scope">
          <p>
            This models ordinary Spanish employment salary with IRPF state and
            autonomous-community scales for residents, IRNR flat salary rates
            for non-residents, employee Social Security, family minimums, and
            the selected individual pension contribution. The Article 93 /
            Beckham-law option applies the special flat salary rates when
            selected.
          </p>
          <p className="mt-2">
            Regional deductions, Basque/Navarre foral regimes, itemized
            deductions, and employer-plan pension limits require extra facts and
            are not folded into the salary estimate.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ESTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Spain</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">IRPF Income Tax</strong> – State
          scale plus autonomous community scale for Spanish tax residents
        </li>
        <li>
          <strong className="text-zinc-300">Regional Support</strong> – General
          estimate plus Madrid, Catalonia, Andalusia, and Valencian Community
        </li>
        <li>
          <strong className="text-zinc-300">Personal &amp; Family Minimums</strong> –
          Tax relief for taxpayer age and qualifying descendants
        </li>
        <li>
          <strong className="text-zinc-300">Employment Expense Deduction</strong> –
          EUR 2,000 general work expense deduction for residents
        </li>
        <li>
          <strong className="text-zinc-300">Pension Contributions</strong> –
          Basic resident pension/social welfare reduction capped at EUR 1,500
          and 30% of net work income
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – Employee
          common contingencies, unemployment, professional training, and MEI
          contributions, capped by the 2026 monthly base
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Simplified
          IRNR flat rates: 19% for EU/EEA/Liechtenstein residents and 24% for
          other non-residents
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        State IRPF Scale Used
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>EUR 0 – EUR 12,450: 9.5%</li>
        <li>EUR 12,450 – EUR 20,200: 12%</li>
        <li>EUR 20,200 – EUR 35,200: 15%</li>
        <li>EUR 35,200 – EUR 60,000: 18.5%</li>
        <li>EUR 60,000 – EUR 300,000: 22.5%</li>
        <li>EUR 300,000+: 24.5%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employee Social Security 2026
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Common contingencies: 4.70%</li>
        <li>Unemployment: 1.55% permanent contracts, 1.60% fixed-term contracts</li>
        <li>Professional training: 0.10%</li>
        <li>MEI: 0.15%</li>
        <li>Monthly contribution base capped at EUR 5,101.20</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Important Assumptions
      </h4>
      <p className="text-zinc-400 text-sm">
        IRPF uses the latest AEAT Renta 2025 state and autonomous community
        scales currently published, while payroll contributions use 2026 BOE and
        Seguridad Social rates. Regional deductions, itemized personal
        deductions, and the Basque/Navarre foral systems need dedicated
        eligibility and region inputs before they can be shown. The Article 93 /
        Beckham-law salary regime is exposed above as a separate flat-rate
        option.
      </p>
    </div>
  );
}

function ESTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Spain Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ESTaxInfoContent />
      </div>
    </section>
  );
}
