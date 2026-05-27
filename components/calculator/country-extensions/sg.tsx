"use client";

import { SGAdditionalReliefs } from "@/components/calculator/sg-additional-reliefs";
import { SGContributionOptions } from "@/components/calculator/sg-contribution-options";
import { SGTaxOptions } from "@/components/calculator/sg-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { Separator } from "@/components/ui/separator";
import { SGCalculator } from "@/lib/countries/sg";
import type { SGCalculatorInputs } from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function SGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SGCalculatorInputs>(country);
  const contributionLimits = SGCalculator.getContributionLimits(inputs);
  const voluntaryCpfTopUpLimit =
    contributionLimits.voluntaryCpfTopUp?.limit ?? 0;
  const srsContributionLimit = contributionLimits.srsContribution?.limit ?? 0;
  const isTaxResident = inputs.taxResidency === "resident";

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <SGTaxOptions
          taxResidency={inputs.taxResidency}
          onTaxResidencyChange={(taxResidency) =>
            setInputs((current) => {
              const nextLimits = SGCalculator.getContributionLimits({
                ...current,
                taxResidency,
              });

              return {
                ...current,
                taxResidency,
                contributions: {
                  voluntaryCpfTopUp: clampAmount(
                    current.contributions.voluntaryCpfTopUp,
                    nextLimits.voluntaryCpfTopUp?.limit ?? 0,
                  ),
                  srsContribution: clampAmount(
                    current.contributions.srsContribution,
                    nextLimits.srsContribution?.limit ?? 0,
                  ),
                },
              };
            })
          }
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => {
              const nextLimits = SGCalculator.getContributionLimits({
                ...current,
                residencyType,
              });

              return {
                ...current,
                residencyType,
                contributions: {
                  voluntaryCpfTopUp: clampAmount(
                    current.contributions.voluntaryCpfTopUp,
                    nextLimits.voluntaryCpfTopUp?.limit ?? 0,
                  ),
                  srsContribution: clampAmount(
                    current.contributions.srsContribution,
                    nextLimits.srsContribution?.limit ?? 0,
                  ),
                },
              };
            })
          }
          age={inputs.age}
          onAgeChange={(age) =>
            setInputs((current) => ({ ...current, age }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        <div className="space-y-6">
          {isTaxResident ? (
            <>
              <SGContributionOptions
                voluntaryCpfTopUp={Math.min(
                  inputs.contributions.voluntaryCpfTopUp,
                  voluntaryCpfTopUpLimit,
                )}
                onVoluntaryCpfTopUpChange={(voluntaryCpfTopUp) =>
                  setInputs((current) => ({
                    ...current,
                    contributions: {
                      ...current.contributions,
                      voluntaryCpfTopUp: clampAmount(
                        voluntaryCpfTopUp,
                        voluntaryCpfTopUpLimit,
                      ),
                    },
                  }))
                }
                voluntaryCpfTopUpLimit={voluntaryCpfTopUpLimit}
                srsContribution={Math.min(
                  inputs.contributions.srsContribution,
                  srsContributionLimit,
                )}
                onSrsContributionChange={(srsContribution) =>
                  setInputs((current) => ({
                    ...current,
                    contributions: {
                      ...current.contributions,
                      srsContribution: clampAmount(
                        srsContribution,
                        srsContributionLimit,
                      ),
                    },
                  }))
                }
                srsContributionLimit={srsContributionLimit}
              />

              <Separator />
            </>
          ) : (
            <InfoPanel title="Resident-only contribution reliefs" tone="neutral">
              CPF top-up and SRS reliefs are personal reliefs, so they are not
              applied in the non-resident employment tax model.
            </InfoPanel>
          )}

          <SGAdditionalReliefs
            reliefs={inputs.taxReliefs}
            grossSalary={inputs.grossSalary}
            taxResidency={inputs.taxResidency}
            onChange={(taxReliefs) =>
              setInputs((current) => ({ ...current, taxReliefs }))
            }
          />
        </div>
      }
      contributionsTitle="Singapore CPF, SRS, and Relief Inputs"
      contributionsDescription="CPF top-up, SRS, family, caregiver, donation, NSman, and rebate inputs"
      seoInfo={<SGTaxInfo />}
      infoCard={
        <InfoPanel title="Singapore Payroll Scope">
          <p>
            This models Singapore employment salary with separate tax residency
            and CPF/SRS status, age-based CPF for citizens and PRs, SRS,
            voluntary CPF top-ups, the S$80,000 personal relief cap, and common
            IRAS individual reliefs and rebates.
          </p>
          <p className="mt-2">
            Additional relief eligibility depends on IRAS qualifying conditions.
            Employer CPF is shown in the result breakdown where applicable but
            is not deducted from employee take-home pay.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SGTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Singapore</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Progressive
          rates from 0% to 24%
        </li>
        <li>
          <strong className="text-zinc-300">
            CPF (Central Provident Fund)
          </strong>{" "}
          – Mandatory contributions for Citizens/PRs
        </li>
        <li>
          <strong className="text-zinc-300">CPF Rates by Age</strong> –
          Employee: 20% (under 55) to 5% (above 70)
        </li>
        <li>
          <strong className="text-zinc-300">Monthly Salary Ceiling</strong> –
          CPF contributions capped at S$8,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Foreigners</strong> – No CPF
          contributions; tax-resident foreigners can use the resident relief
          model, while non-resident employment income uses 15% flat tax or
          resident progressive rates, whichever is higher
        </li>
        <li>
          <strong className="text-zinc-300">Tax Reliefs</strong> – Earned
          income, CPF, SRS, spouse, child, parent/grandparent, caregiver,
          disability, life insurance, donation, NSman, and Parenthood Tax Rebate
          inputs are modeled with the S$80,000 personal relief cap
        </li>
      </ul>
    </div>
  );
}

function SGTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Singapore Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <SGTaxInfoContent />
      </div>
    </section>
  );
}
