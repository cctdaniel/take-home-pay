"use client";

import { DEContributionOptions } from "@/components/calculator/de-contribution-options";
import { DETaxOptions } from "@/components/calculator/de-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { DECalculator } from "@/lib/countries/de";
import type { DECalculatorInputs } from "@/lib/countries/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function getGermanLimits(inputs: DECalculatorInputs) {
  const limits = DECalculator.getContributionLimits(inputs);

  return {
    bav: Math.min(limits.occupationalPension?.limit ?? 0, inputs.grossSalary),
    riester: Math.min(
      limits.riesterContribution?.limit ?? 0,
      inputs.grossSalary,
    ),
    ruerup: Math.min(
      limits.ruerupContribution?.limit ?? 0,
      inputs.grossSalary,
    ),
  };
}

export default function DECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<DECalculatorInputs>(country);
  const limits = getGermanLimits(inputs);

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimits = getGermanLimits(nextInputs);

      return {
        ...nextInputs,
        contributions: {
          occupationalPension: clampAmount(
            current.contributions.occupationalPension,
            nextLimits.bav,
          ),
          riesterContribution: clampAmount(
            current.contributions.riesterContribution,
            nextLimits.riester,
          ),
          ruerupContribution: clampAmount(
            current.contributions.ruerupContribution,
            nextLimits.ruerup,
          ),
        },
      };
    });
  };

  const updateContribution = (
    key: keyof DECalculatorInputs["contributions"],
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

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <DETaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          state={inputs.state ?? "BE"}
          onStateChange={(state) =>
            setInputs((current) => ({ ...current, state }))
          }
          isMarried={inputs.isMarried ?? false}
          onMarriedChange={(isMarried) =>
            setInputs((current) => {
              const nextInputs = { ...current, isMarried };
              const nextLimits = getGermanLimits(nextInputs);

              return {
                ...nextInputs,
                contributions: {
                  ...current.contributions,
                  ruerupContribution: clampAmount(
                    current.contributions.ruerupContribution,
                    nextLimits.ruerup,
                  ),
                },
              };
            })
          }
          isChurchMember={inputs.isChurchMember ?? false}
          onChurchMemberChange={(isChurchMember) =>
            setInputs((current) => ({ ...current, isChurchMember }))
          }
          isChildless={inputs.isChildless ?? false}
          onChildlessChange={(isChildless) =>
            setInputs((current) => ({ ...current, isChildless }))
          }
        />
      }
      contributions={
        <DEContributionOptions
          occupationalPension={Math.min(
            inputs.contributions.occupationalPension,
            limits.bav,
          )}
          onOccupationalPensionChange={(occupationalPension) =>
            updateContribution(
              "occupationalPension",
              occupationalPension,
              limits.bav,
            )
          }
          riesterContribution={Math.min(
            inputs.contributions.riesterContribution,
            limits.riester,
          )}
          onRiesterContributionChange={(riesterContribution) =>
            updateContribution(
              "riesterContribution",
              riesterContribution,
              limits.riester,
            )
          }
          ruerupContribution={Math.min(
            inputs.contributions.ruerupContribution,
            limits.ruerup,
          )}
          onRuerupContributionChange={(ruerupContribution) =>
            updateContribution(
              "ruerupContribution",
              ruerupContribution,
              limits.ruerup,
            )
          }
          limits={limits}
          isMarried={inputs.isMarried ?? false}
        />
      }
      contributionsTitle="Germany Pension Contribution Inputs"
      contributionsDescription="bAV salary conversion, Riester, and Ruerup pension contributions"
      seoInfo={<DETaxInfo />}
      infoCard={
        <InfoPanel title="Germany Payroll Scope">
          <p>
            This models German employment salary with federal income tax,
            solidarity surcharge, church tax where selected, employee social
            insurance, childless long-term care treatment, and selected
            employee-controlled pension contributions.
          </p>
          <p className="mt-2">
            The bAV, Riester, and Ruerup inputs are capped to modeled legal
            limits and payroll affordability. Employer subsidies, exact plan
            design, private insurance status, and non-salary income are outside
            this salary page.
          </p>
        </InfoPanel>
      }
    />
  );
}

function DETaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Germany</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax (Einkommensteuer)</strong>{" "}
          – Formula-based progressive rates around 14% to 45% with a €12,348
          basic allowance
        </li>
        <li>
          <strong className="text-zinc-300">Solidarity Surcharge</strong> – 5.5%
          of income tax; exempt below €20,350 (single) / €40,700 (married)
        </li>
        <li>
          <strong className="text-zinc-300">Church Tax (Kirchensteuer)</strong>{" "}
          – Optional 8% (BY/BW) or 9% of income tax for members
        </li>
        <li>
          <strong className="text-zinc-300">
            Social Security (Employee Share)
          </strong>{" "}
          – Pension 9.3%, unemployment 1.3%, health 7.3% + ~1.45% additional,
          long-term care 1.8% (2.4% if childless 23+)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Pension Contribution Reliefs
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Occupational Pension (bAV)</strong>{" "}
          – Salary conversion tax-free up to 8% of the BBG (EUR 8,112 in 2026)
        </li>
        <li>
          <strong className="text-zinc-300">Riester Pension</strong> – Eligible
          contributions up to EUR 2,100 per year (incl. allowances)
        </li>
        <li>
          <strong className="text-zinc-300">Ruerup (Basisrente)</strong> – Max
          deductible contributions EUR 30,826 (single) / EUR 61,652 (married)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Standard Deductions Applied
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Employee lump-sum (Arbeitnehmer-Pauschbetrag): €1,230</li>
        <li>
          Special expenses lump-sum (Sonderausgaben-Pauschbetrag): €36 single /
          €72 married
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Contribution Ceilings 2026
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Pension &amp; unemployment capped at €101,400/year</li>
        <li>Health &amp; long-term care capped at €69,750/year</li>
      </ul>

      <p className="text-zinc-400 text-sm mt-3">
        Taxable income is estimated as gross salary minus standard deductions.
        Income tax is calculated per Section 32a formula, then solidarity surcharge
        and optional church tax are added. Social security is deducted
        separately.
      </p>
    </div>
  );
}

function DETaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Germany Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <DETaxInfoContent />
      </div>
    </section>
  );
}
