"use client";

import { ContributionOptions } from "@/components/calculator/contribution-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { USTaxOptions } from "@/components/calculator/us-tax-options";
import { USCalculator } from "@/lib/countries/us";
import type { USCalculatorInputs } from "@/lib/countries/types";
import type { HSACoverageType } from "@/lib/countries/us";
import { clampAmount } from "@/lib/utils";

export default function USCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<USCalculatorInputs>(country);
  const contributionLimits = USCalculator.getContributionLimits(inputs);
  const traditional401kLimit = contributionLimits.traditional401k?.limit ?? 0;
  const rothIRALimit = contributionLimits.rothIRA?.limit ?? 0;
  const hsaLimit = contributionLimits.hsa?.limit ?? 0;
  const healthFsaLimit = contributionLimits.healthFsa?.limit ?? 0;
  const dependentCareFsaLimit =
    contributionLimits.dependentCareFsa?.limit ?? 0;

  const updateContribution = (
    key: keyof Pick<
      USCalculatorInputs["contributions"],
      | "traditional401k"
      | "rothIRA"
      | "hsa"
      | "healthFsa"
      | "dependentCareFsa"
    >,
    value: number,
    limit: number,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(value, limit),
      },
    }));
  };

  const setHsaCoverageType = (hsaCoverageType: HSACoverageType) => {
    setInputs((current) => {
      const nextLimits = USCalculator.getContributionLimits({
        ...current,
        contributions: {
          ...current.contributions,
          hsaCoverageType,
        },
      });

      return {
        ...current,
        contributions: {
          ...current.contributions,
          hsaCoverageType,
          hsa: clampAmount(
            current.contributions.hsa,
            nextLimits.hsa?.limit ?? 0,
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
      usState={inputs.state}
      usContributions={{
        traditional401k: Math.min(
          inputs.contributions.traditional401k,
          traditional401kLimit,
        ),
        rothIRA: Math.min(inputs.contributions.rothIRA, rothIRALimit),
        hsa: Math.min(inputs.contributions.hsa, hsaLimit),
        healthFsa: Math.min(inputs.contributions.healthFsa, healthFsaLimit),
        dependentCareFsa: Math.min(
          inputs.contributions.dependentCareFsa,
          dependentCareFsaLimit,
        ),
      }}
      taxOptions={
        <USTaxOptions
          state={inputs.state}
          onStateChange={(state) =>
            setInputs((current) => ({ ...current, state }))
          }
          filingStatus={inputs.filingStatus}
          onFilingStatusChange={(filingStatus) =>
            setInputs((current) => {
              const nextLimits = USCalculator.getContributionLimits({
                ...current,
                filingStatus,
              });

              return {
                ...current,
                filingStatus,
                contributions: {
                  ...current.contributions,
                  dependentCareFsa: clampAmount(
                    current.contributions.dependentCareFsa,
                    nextLimits.dependentCareFsa?.limit ?? 0,
                  ),
                },
              };
            })
          }
          numberOfQualifyingChildren={inputs.numberOfQualifyingChildren}
          onNumberOfQualifyingChildrenChange={(numberOfQualifyingChildren) =>
            setInputs((current) => ({
              ...current,
              numberOfQualifyingChildren,
            }))
          }
          numberOfOtherDependents={inputs.numberOfOtherDependents}
          onNumberOfOtherDependentsChange={(numberOfOtherDependents) =>
            setInputs((current) => ({
              ...current,
              numberOfOtherDependents,
            }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        <ContributionOptions
          traditional401k={Math.min(
            inputs.contributions.traditional401k,
            traditional401kLimit,
          )}
          onTraditional401kChange={(traditional401k) =>
            updateContribution(
              "traditional401k",
              traditional401k,
              traditional401kLimit,
            )
          }
          traditional401kLimit={traditional401kLimit}
          rothIRA={Math.min(inputs.contributions.rothIRA, rothIRALimit)}
          onRothIRAChange={(rothIRA) =>
            updateContribution("rothIRA", rothIRA, rothIRALimit)
          }
          rothIRALimit={rothIRALimit}
          hsa={Math.min(inputs.contributions.hsa, hsaLimit)}
          onHsaChange={(hsa) => updateContribution("hsa", hsa, hsaLimit)}
          hsaLimit={hsaLimit}
          healthFsa={Math.min(
            inputs.contributions.healthFsa,
            healthFsaLimit,
          )}
          onHealthFsaChange={(healthFsa) =>
            updateContribution("healthFsa", healthFsa, healthFsaLimit)
          }
          healthFsaLimit={healthFsaLimit}
          dependentCareFsa={Math.min(
            inputs.contributions.dependentCareFsa,
            dependentCareFsaLimit,
          )}
          onDependentCareFsaChange={(dependentCareFsa) =>
            updateContribution(
              "dependentCareFsa",
              dependentCareFsa,
              dependentCareFsaLimit,
            )
          }
          dependentCareFsaLimit={dependentCareFsaLimit}
          hsaCoverageType={inputs.contributions.hsaCoverageType}
          onHsaCoverageTypeChange={setHsaCoverageType}
        />
      }
      contributionsTitle="Contributions"
      contributionsDescription="401(k), Roth IRA, HSA, health FSA, and dependent care FSA inputs"
      seoInfo={<USTaxInfo />}
      infoCard={
        <InfoPanel title="United States Payroll Scope">
          <p>
            This models federal income tax, FICA payroll taxes, selected state
            income taxes, SDI where supported by the state module, and the
            selected 401(k), Roth IRA, HSA, health FSA, dependent care FSA,
            child tax credit, and other dependent credit inputs.
          </p>
          <p className="mt-2">
            The calculator applies dependent credits as nonrefundable federal
            credits that can reduce federal income tax to zero but not below
            zero. Itemized deductions, refundable ACTC/EITC refunds, employer
            benefits, local city taxes, and catch-up contributions need
            additional taxpayer facts and are not guessed here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function USTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        United States
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Federal Income Tax</strong> –
          Progressive tax brackets from 10% to 37%
        </li>
        <li>
          <strong className="text-zinc-300">State Income Tax</strong> – Varies
          by state (0% to 13.3%)
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – 6.2% up
          to ${new Intl.NumberFormat().format(184500)} wage base
        </li>
        <li>
          <strong className="text-zinc-300">Medicare</strong> – 1.45% (plus 0.9%
          above $200k)
        </li>
        <li>
          <strong className="text-zinc-300">State Disability Insurance</strong>{" "}
          – Required in CA, HI, NJ, NY, and RI
        </li>
        <li>
          <strong className="text-zinc-300">Pre-tax Deductions</strong> – 401(k)
          and HSA contributions reduce taxable income
        </li>
      </ul>
    </div>
  );
}

function USTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How United States Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <USTaxInfoContent />
      </div>
    </section>
  );
}
